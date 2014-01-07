/**
 * A place to hold all the wheel graph information for the current setup
 */
var WheelGraphComposite = Class.extend({
  defaults: {
    graphData: null,
    dataCenterId: null,
    endpointAlias: null,
    metrics: null
  },
  init: function(options) {

    var _this = this;

    this.config = _.extend({ }, this.defaults, options);
    this.metrics = this.config.metrics;
    this.wheelGraphMetrics = [ ];
    _.bindAll(this, 'draw');


    this.graphData = new GraphData({
      dataCenterId: this.config.dataCenterId,
      endpointAlias: this.config.endpointAlias,
      onReset: this.draw,
      throttle: 5,
      reverseOrder: true,
      onError: function() {
        _this.intervalIcon.displayError();
      }
    });

    var timestamps = _.map(this.graphData.data, function(v) { return v.timestamp; });

    this.clock = new Clock({
      timestamps: timestamps,
      radial: true
    });

    /**
     * Backbone attachments
     */
    this.metricGroup = new MetricGroup();
    this.metricDisplayGroup = new MetricDisplayGroup({
      el: $('.metric-display-group'),
      collection: this.metricGroup
    });

    /**
     * Reference the existing DOM container for the wheel graph
     */
    this.$wheelGraph = $('.wheel-graph');

    this.wheelGraphBase = new GraphBase({
      width: this.$wheelGraph.width(),
      height: this.$wheelGraph.height(),
      $el: this.$wheelGraph
    });

    this.donut = new Donut({
      base: this.wheelGraphBase
    });

    /**
     * Create the guideline, which follows the mouse
     */
    this.guideline = new RadialGuideline({
      base: this.wheelGraphBase,
      clock: this.clock,
      classes: {
        line: 'wheel-graph__guideline'
      }
    });

    /**
     * A BackboneView for updating the time
     */
    this.clockDisplay = new ClockDisplay({
      el: $('.clock-display')[0],
      clock: this.clock
    });

    // Capture the line trails globally so they can be referenced from RadialLine.
    window.lineTrails = [ ];

    /**
     * Create WheelGraphMetrics for all metrics associated with the graph data
     */
    _.each(this.metrics, function(metric) {
      // metric.points = _this.graphData.formatAsMetric(metric.alias);
      _this.wheelGraphMetrics.push(new WheelGraphMetric({
        metric: metric,
        base: _this.wheelGraphBase,
        clock: _this.clock,
        collection: _this.metricGroup,
        displayGroup: _this.metricDisplayGroup,
        guideline: _this.guideline,
        graphData: _this.graphData,
        donut: _this.donut
      }));
    });

    /**
     * Center handle
     */
    (function attachCenterHandle() {
      var handle = _this.wheelGraphBase.svg.append('circle')
        .attr('class', 'wheel-graph__handle')
        .attr('r', 5);

      $.subscribe(_this.clock.channelId + '.timeChange', function() {
        var _angle = Util.normalizeAngle(_this.clock.currentAngle) - 90;
        var _radius = 69;
        var x = (_radius * Math.cos(Util.toRadians(_angle))) + _this.wheelGraphBase.config.cx;
        var y = (_radius * Math.sin(Util.toRadians(_angle))) + _this.wheelGraphBase.config.cy;
        handle
          .attr('cx', x)
          .attr('cy', y)
          .classed('center-handle', true);
      });

    })();

    // Draw the event cloak last (so it's on top of all the others)
    this.eventCloak = new EventCloak({
      animate: false,
      clock: this.clock,
      $el: $('.wheel-graph-event-cloak'),
      // We don't inherit the width and height because
      // the event cloak doesn't have to be attached to a base element
      width: this.wheelGraphBase.config.width,
      height: this.wheelGraphBase.config.height,
      cx: this.wheelGraphBase.config.cx,
      cy: this.wheelGraphBase.config.cy,
      resetPoint: this.clock.config.startAngle
    });

    // Interval icon (changes the radius of an arc)
    this.intervalIcon = new IntervalIcon({
      $el: $('.interval-icon'),
      graphData: this.graphData
    });

    // Cause the graph data to reset every 60 seconds, too.
    $.subscribe(this.intervalIcon.channelId + '.timerReset', function() {
      _this.graphData.reset();
    });


    this.$innerNote = $('<div />', { 'class': 'wheel-graph__note inner'});
    this.$innerNote.appendTo(this.wheelGraphBase.$el);

    this.$outerNote = $('<div />', { 'class': 'wheel-graph__note outer'});
    this.$outerNote.appendTo(this.wheelGraphBase.$el);

    this.$mouseNote = $('<div />', { 'class': 'wheel-graph__note mouse'});
    this.$mouseNote.appendTo(this.wheelGraphBase.$el);
    this.$mouseNote.html('');

    $.subscribe('current_radial_line', function(e, d) {
      if(d.radiusScale) {
        var fixedPoint = 2;
        var suffix = '';
        if(d.metric.alias === 'temperature' || d.metric.alias === 'humidity') {
          fixedPoint = 0;
        }
        if(d.metric.alias === 'temperature') {
          suffix = '°';
        }
        if(d.metric.alias === 'humidity') {
          suffix = '%';
        }
        _this.$innerNote.html(d.radiusScale.domain()[0].toFixed(fixedPoint) + suffix);
        _this.$outerNote.html(d.radiusScale.domain()[1].toFixed(fixedPoint) + suffix);
      }
    });

  },
  /**
   * Should be called if the associated GraphData changes.
   */
  draw: function() {

    var _this = this;

    // Update the last updated label
    // var $lastUpdatedLabel = $('.interval-icon-label');
    // $lastUpdatedLabel.html(moment(this.graphData.data[0].timestamp).format('hh:mm a'));

    // Refresh the timer.
    this.intervalIcon.setTimer();

    var _timestamps = _.map(this.graphData.data, function(v) { return v.timestamp; });
    this.clock.refresh(_timestamps);

    _.each(this.wheelGraphMetrics, function(v) {
      v.draw();
    });

    _.each(this.wheelGraphMetrics, function(v) {
      v.handle.reattach();
    });

    this.clock.setCurrentTimeFromAngle(360);

  }
});
