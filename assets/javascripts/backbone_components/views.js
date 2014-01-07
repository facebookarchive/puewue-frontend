
var DataLineView = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this, 'setMetricValue');
    this.radialLine = this.options.radialLine;
    this.listenTo(this.model, 'change:highlighted', this.toggleVisibility, this);
    this.listenTo(this.model, 'change:selected', this.setCurrent, this);
    $.subscribe(this.radialLine.channelId + '.dataPointFound', this.setMetricValue);
  },
  toggleVisibility: function(e) {
    var selectedModels = this.model.collection.models.filter(function(v) {
      return v.get('highlighted') === true;
    });
    var toggle = (selectedModels.length) ? this.model.get('highlighted') : true;
    this.radialLine.toggle(toggle);
  },
  setMetricValue: function() {
    this.model.setValueAsAverage(this.radialLine.nearestNextPoint.dataValue.value, this.radialLine.nearestPrevPoint.dataValue.value);
  },
  setCurrent: function() {
    this.radialLine.toggleCurrent(this.model.get('selected'));
  }
});

var MetricDisplayGroup = Backbone.View.extend({
  initialize: function() {
    this.listenTo(this.collection, 'change:selected', this.toggleFilterMode, this);
  },
  toggleFilterMode: function(mode) {
    var selectedModels = this.collection.models.filter(function(v) {
      return v.get('selected') === true;
    });
    var $heroFeature = this.$el.closest('.hero-feature');
    $heroFeature.toggleClass('item-selected', !!selectedModels.length);
  }
});

var MetricDisplay = Backbone.View.extend({
  events: {
    'click': 'toggleSelection',
    'mouseover': 'toggleHighlight',
    'mouseout': 'toggleHighlight'
  },
  initialize: function(options) {
    this.$valueContainer = this.$el.find('.value-container');
    this.listenTo(this.model, 'change:selected', this.changeCurrent, this);
    this.listenTo(this.model, 'change:value', this.updateValue, this);
    this.dataLineView = options.dataLineView;
    this.group = this.options.group;
    this.$heroFeature = this.$el.closest('.hero-feature');
  },
  toggleHighlight: function(e) {
    var _noneSelected = this.group.collection.filter(function(v) { return v.get('selected'); }).length === 0;
    if(_noneSelected) {
      this.__toggle('highlighted');
    }

    if(this.dataLineView.radialLine.radiusScale) {
      $.publish('current_radial_line', [this.dataLineView.radialLine]);
    }

    // See if anything is highlighted.
    var highlightedModels = this.model.collection.models.filter(function(v) {
      return v.get('highlighted') === true;
    });
    this.$heroFeature.toggleClass('item-highlighted', !!highlightedModels.length);
  },
  toggleSelection: function(e) {
    this.__toggle('selected');
    if(this.model.get('selected')) {
      this.__toggle('highlighted', true);
    }
  },
  __toggle: function(field, override) {
    var _this = this;
    var _switchTo;
    if(typeof override !== 'undefined') {
      _switchTo = override;
    }
    else {
      _switchTo = !this.model.get(field);
    }
    this.model.set(field, _switchTo);
    if(!this.model.get(field)) {
      this.group.collection.each(function(v) {
        v.set(field, null);
      });
    }
    else {
      var otherModels = this.group.collection.each(function(v) {
        if(v !== _this.model) {
          v.set(field, false);
        }
      });
    }
  },
  changeCurrent: function() {
    this.$el.toggleClass('current', this.model.get('selected'));
  },
  updateValue: function() {
    this.$valueContainer.html(this.model.get('value').toFixed(2));
  }
});

var PercentageMetricDisplay = MetricDisplay.extend({
  initialize: function(options) {
    MetricDisplay.prototype.initialize.apply(this, arguments);
  },
  updateValue: function() {
    this.$valueContainer.html(this.model.get('value').toFixed(0));
  }
});

var TemperatureMetricDisplay = MetricDisplay.extend({
  initialize: function(options) {
    MetricDisplay.prototype.initialize.apply(this, arguments);
    this.$convertedValueContainer = this.$el.find('.converted-value-container');
  },
  updateValue: function() {
    this.$valueContainer.html(this.model.get('value').toFixed(0));
    this.$convertedValueContainer.html(Util.toCelsius(this.model.get('value')).toFixed(1));
  }
});

var ClockDisplay = Backbone.View.extend({
  initialize: function(options) {
    _.bindAll(this, 'updateDisplay');
    this.clock = this.options.clock; // Attach as an object (no model)
    this.$value = this.$el.find('.clock-display__value');
    this.$context = this.$el.find('.clock-display__context');
    this.$day = this.$el.find('.clock-display__day');
    $.subscribe(this.clock.channelId + '.timeChange', this.updateDisplay);
  },
  updateDisplay: function(e, timestamp) {
    var _this = this;
    var time = moment(timestamp);
    this.$value.html(time.format('hh:mm'));
    this.$context.html(time.format('a'));
    this.$day.html('');
    var _cal = time.calendar();
    var _whitelist = ['Yesterday', 'Today'];
    _.each(_whitelist, function(v) {
      if(_cal.substr(0, v.length) === v) {
        _this.$day.html(', ' + v);
      }
    });
  }
});

var HistogramMetricDisplay = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this, 'reposition', 'updateValue');
    this.handle = this.options.handle;
    this.metric = this.options.metric;
    this.$valueContainer = this.$el.find('.value-container');
    this.listenTo(this.model, 'change:value', this.updateValue);
    $.subscribe(this.handle.channelId + '.moved', this.reposition);
    this.$histogram = this.$el.closest('.histogram');
    this.invertPoint = this.$histogram.width() / 2;
  },
  updateValue: function(e) {
    var fixedPoint = 2;
    if(this.metric.alias === 'temperature' || this.metric.alias === 'humidity') {
      fixedPoint = 0;
    }
    this.$valueContainer.html(this.model.get('value').toFixed(fixedPoint));
  },
  reposition: function(e, data) {
    // Update the x/y to match the handle's latest co-ordinates
    var _left = data.x;
    var _top = data.y;
    if(_left > this.invertPoint) {
      this.$el.css('marginLeft', 0 - this.$el.width() - 10).addClass('inverted');
    }
    else {
      this.$el.css('marginLeft', '').removeClass('inverted');
    }
    this.$el.css({
      left: data.x,
      top: data.y
    });
  }
});
