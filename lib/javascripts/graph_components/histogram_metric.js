var Guideline = require('./guideline');
var DataLine = require('./data_line');
var BackgroundAxis = require('./background_axis');
var RangeLine = require('./range_line');
var DelaySegment = require('./delay_segment');
var Handle = require('./handle');

// Backbone
var GroupedMetric = require('../backbone_components/grouped_metric');
var DataLineView = require('../backbone_components/data_line_view');
var HistogramMetricDisplay = require('../backbone_components/histogram_metric_display');

var HistogramMetric = Class.extend({
  defaults: {

  },
  init: function(options) {

    var _this = this;

    this.config = _.extend({ }, this.defaults, options);
    this.metric = this.config.metric;
    this.collection = this.config.collection;
    this.clock = this.config.clock;
    this.graphData = this.config.graphData;
    this.eventCloak = this.config.eventCloak;

    this.$el = $('.histogram__inner[data-metric="' + this.metric.alias + '"]');
    this.$outer = this.$el.closest('.histogram');
    this.data = [ ];
    this.rangeData = [ ];

    this.metricPoints = [ ];

    /**
     * Create a 'fake base'... because we don't need any particular appearance for the histograms
     * ... but we do need to reference the canvas in the same way as WheelGraphBase
     */

    this.svg = d3.select(this.$el[0]).append("svg:svg").attr("width", this.$el.width()).attr("height", this.$el.height());
    // this.svg.attr('transform', 'translate(' + -18 + ',' + 0 + ')');

    var _baseOffset = 16;

    this.base = {
      svg: this.svg.append('svg:g').attr('width', this.$el.width() - _baseOffset).attr('transform', 'translate(' + _baseOffset + ',' + 0 + ')'),
      config: { cx: 0, cy: 0}
    };


    // Create the grouped metric for the histogram
    // this is used to store the values provided by the UI
    // (as opposed to the constant data provided by the feed)
    this.model = new GroupedMetric();
    this.collection.add(this.model);

    /**
     * Create the histogram guideline (a straight line which follows the mouse)
     */

    this.guideline = new Guideline({
      base: this.base,
      height: this.$el.height(),
      clock: this.clock,
      maxPos: this.clock.config.startAngle - 2,
      autoAttach: false,
      classes: {
        line: 'histogram__guideline'
      }
    });

    this.dataLine = new DataLine({
      clock: this.clock,
      max: 0,
      min: this.$el.height(),
      base: this.base,
      alias: this.metric.alias,
      metric: this.metric,
      points: this.metricPoints,
      offset: 0,
      classes: {
        line: 'histogram__data-line',
        group: 'histogram__data-line-group'
      },
      autoAttach: false // Lazy attachment so it can be over the range line
    });



    // Create a background for the Y axis
    this.backgroundAxisY = new BackgroundAxis({
      base: this.base,
      dataLine: this.dataLine,
      clock: this.clock,
      rangeLabels: true,
      max: this.clock.config.startAngle,
      $outer: this.$outer,
      offset: {
        x: 0,
        y: 0
      }
    });

    this.backgroundAxisX = new BackgroundAxis({
      base: this.base,
      dataLine: this.dataLine,
      clock: this.clock,
      $outer: this.$outer,
      horizontal: true,
      steps: 3,
      max: this.$el.height()
    });

    this.rangeLine = new RangeLine({
      dataLine: this.dataLine,
      base: this.base,
      max: 0,
      min: this.$el.height(),
      alias: this.metric.alias,
      autoAttach: true,
      clock: this.clock,
      metric: this.metric
    });

    this.dataLine.attach();

    this.delaySegment = new DelaySegment({
      base: this.base,
      clock: this.clock,
      metric: this.metric,
      metricPoints: this.metricPoints
    });

    this.guideline.attach();

    this.handle = new Handle({
       base: this.base,
       radialLine: this.dataLine,
       alias: this.metric.alias,
       guideline: this.guideline
    });

    this.lineView = new DataLineView({
      radialLine: this.dataLine,
      model: this.model
    });

    // Create a view for the histogram metric
    this.metricDisplay = new HistogramMetricDisplay({
      el: this.$outer.find('.histogram__value-label')[0],
      handle: this.handle,
      model: this.model,
      metric: this.metric
    });

    // Fade out the histogram title if the time is near it
    var $title = this.$outer.find('.histogram__title');
    $.subscribe(this.clock.channelId + '.timeChange', function(e) {
      var _angle = _this.clock.currentAngle;
      var _left = _.max([_angle + 2, 0]);
      var nearTitle = (_this.clock.currentAngle / _this.clock.config.startAngle) < 0.35;
      $title.toggleClass('dim', nearTitle);
    });

    /************************
    ************************* /// COPIED FROM WHEEL_GRAPH_COMPOSITE.JS
    ************************/

    /// Create a quick inverted scale based on the current data line
    var setScales = function() {
      if(!_this.dataLine.radiusScale) {
        return false;
      }
      var domain = _this.dataLine.radiusScale.range();
      var range =  _this.dataLine.radiusScale.domain();
      var scale = d3.scale.linear();
      scale.domain(domain).range(range);
      return scale;
    };

    /*************************************
    *************************************/

    this.mouseLabel = { };
    this.mouseLabel.$cloak = $('.event-cloak__listing[data-metric="' + this.config.metric.alias + '"]');
    this.mouseLabel.maxX = this.mouseLabel.$cloak.width();
    this.mouseLabel.maxY = this.mouseLabel.$cloak.height() - 2;
    this.mouseLabel.minX = this.mouseLabel.$cloak.data('left');
    this.mouseLabel.minY = this.mouseLabel.$cloak.data('top');
    this.mouseLabel.$el = this.$outer.find('.histogram__mouse-label');
    this.mouseLabel.$value = this.mouseLabel.$el.find('.value-container');
    this.mouseLabel.$histogram = $('.histogram__inner[data-metric="' + this.config.metric.alias + '"]').closest('.histogram');

    $.subscribe(this.eventCloak.channelId + '.movementTracked', function() {
      if(!_this.mouseLabel.scale) {
        _this.mouseLabel.scale = setScales();
      }
      // If it's still not found, then return false.
      if(!_this.mouseLabel.scale) {
        return false;
      }
      if(typeof _this.mouseLabel.mouseY !== 'undefined') {
        _this.mouseLabel.$el.css({
          'top': _this.mouseLabel.mouseY || 0,
          'left': _this.mouseLabel.mouseX || 0
        });
        var fixedPoint = 2;
        if(_this.metric.alias === 'temperature' || _this.metric.alias === 'humidity') {
          fixedPoint = 0;
        }
        _this.mouseLabel.$value.html(_this.mouseLabel.scale(_this.mouseLabel.mouseY).toFixed(fixedPoint));
      }
    });

    // Show the mouse labels
    this.eventCloak.$el.mousemove(function(ev) {
      var _mouseX = ev.pageX - $(this).offset().left;
      var _mouseY = ev.pageY - $(this).offset().top;
      if(_this.mouseLabel.$histogram.hasClass('hover')) {
        _this.mouseLabel.mouseX = _mouseX - _this.mouseLabel.minX;
        _this.mouseLabel.mouseY = _mouseY - _this.mouseLabel.minY;
        // Apply boundaries
        _this.mouseLabel.mouseX = _.max([0, _this.mouseLabel.mouseX]);
        _this.mouseLabel.mouseX = _.min([_this.mouseLabel.maxX, _this.mouseLabel.mouseX]);
        _this.mouseLabel.mouseY = _.max([0, _this.mouseLabel.mouseY]);
        _this.mouseLabel.mouseY = _.min([_this.mouseLabel.maxY, _this.mouseLabel.mouseY]);
      }
    });

    $.subscribe(this.dataLine.channelId + '.dataPointFound', function(e, opts) {
      _this.mouseLabel.$el.toggleClass('hidden', opts.hide);
      $(_this.metricDisplay.el).toggleClass('hidden', opts.hide);
    });

  },
  refreshData: function() {
    this.data = this.graphData.formatAsMetric(this.metric.alias);
    var _minData = this.graphData.formatAsMetric(this.metric.alias, 'min_');
    var _maxData = this.graphData.formatAsMetric(this.metric.alias, 'max_');
    this.rangeData = _minData.concat(_maxData);
    // this.metric.data = this.data;
    this.metricPoints = this.data;
    this.delaySegment.metricPoints = this.metricPoints;
    this.dataLine.points = this.metricPoints;
    var _this = this;
    this.dataLine.rangeData = [];
    _.each(this.data, function(v,k) {
      _this.dataLine.rangeData.push({
        min: _minData[k].value,
        max: _maxData[k].value,
        value: v.value
      });
    });
  },
  draw: function() {
    this.refreshData();

    this.dataLine.setPoints(this.data);
    this.rangeLine.setPoints(this.rangeData); // Must be fired after dataLine


    // this.dataLine.radiusScale.domain(this.dataLine.calculateDomain());
    // this.rangeLine.radiusScale.domain(this.dataLine.calculateDomain());
    // this.rangeLine.draw(true);
    // this.dataLine.redraw(true);

    this.backgroundAxisY.setLines({
      scale: this.dataLine.radiusScale
    });

    this.backgroundAxisX.setLines({
      scale: this.clock.timeScale,
      steps: this.graphData.steps
    });

    this.delaySegment.draw();
  }
});

module.exports = HistogramMetric;