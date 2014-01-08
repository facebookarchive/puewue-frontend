// var Backbone = require('../../bower_components/backbone/backbone');

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

module.exports = HistogramMetricDisplay;