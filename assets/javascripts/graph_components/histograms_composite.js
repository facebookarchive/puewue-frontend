var HistogramsComposite = Class.extend({
  defaults: {
    graphData: null,
    endpointAlias: null
  },
  init: function(options) {
    var _this = this;
    this.config = _.extend({ }, this.defaults, options);
    this.metrics = this.config.metrics;
    _.bindAll(this, 'draw');
    this.$el = $('.histogram-group');

    this.graphData = new GraphData({
      endpointAlias: this.config.endpointAlias,
      onReset: this.draw,
      throttle: 10,
      reverseOrder: true,
      apiConfig: this.config.apiConfig
    });

    this.histogramMetrics = [ ];

    this.metricGroup = new MetricGroup();

    /**
     * The histogram clock
     */
    this.clock = new Clock({
      endAngle: 0,
      startAngle: this.$el.width()
    });

    // Split labels
    this.splitLabels = new SplitLabels({
      $el: $('.histogram-split-labels'),
      width: this.clock.config.startAngle
    });

    // Date filters
    var dateFilter = new DateFilterNav({
      $el: $('[data-behavior="filter_data_range"]'),
      graphData: this.graphData,
      splitLabels: this.splitLabels
    });

    // Date label
    this.$dateLabel = new DateLabel({
      clock: this.clock,
      $el: $('.histogram-date-label'),
      maxPos: this.clock.config.startAngle
    });

    var $eventCloak = $('.histogram-group__event-cloak');
    this.eventCloak = new EventCloak({
      animate: true,
      clock: this.clock,
      $el: $eventCloak,
      width: $eventCloak.width(),
      height: $eventCloak.height(),
      cx: 0,
      cy: 0,
      offset: 0,
      angular: false,
      resetPoint: this.clock.config.endAngle,
      cloakOffset: 18
    });

    // Event cloaking for mouse label handling
    var $eventCloakListings = $eventCloak.find('.event-cloak__listing');

    // Cache the co-ordinates
    $eventCloakListings.each(function() {
      var $this = $(this);
      $this.data('top', $this.position().top);
      $this.data('left', $this.position().left);
      $this.data('right', $this.position().left + $this.outerWidth());
      $this.data('bottom', $this.position().top + $this.outerHeight());
      $this.data('histogram', $('.histogram__inner[data-metric="' + $this.data('metric') + '"]').closest('.histogram'));
    });

    // Prevent pointer events completely.
    // (IE bug, so have to hide instead of using CSS)
    $eventCloakListings.hide();

    $eventCloak.mousemove(function(ev) {
      var _mouseX = ev.pageX - $eventCloak.offset().left;
      var _mouseY = ev.pageY - $eventCloak.offset().top;
      $eventCloakListings.each(function() {
        var $this = $(this);
        var isBoundX = _mouseX >= $this.data('left') && _mouseX <= $this.data('right');
        var isBoundY = _mouseY >= $this.data('top') && _mouseY <= $this.data('bottom');
        if(isBoundX && isBoundY) {
          $this.data('histogram').addClass('hover');
        }
        else {
          $this.data('histogram').removeClass('hover');
        }
      });
    });

    $eventCloak.mouseout(function() {
      $eventCloakListings.each(function() {
        $(this).data('histogram').removeClass('hover');
      });
    });

    // Loop through all the available metrics in the graph data
    _.each(this.metrics, function(metric) {
      _this.histogramMetrics.push(new HistogramMetric({
        collection: _this.metricGroup,
        clock: _this.clock,
        metric: metric,
        graphData: _this.graphData,
        eventCloak: _this.eventCloak
      }));
    });

  },
  draw: function() {

    var _timestamps = _.map(this.graphData.data, function(v) { return v.timestamp; });

    this.clock.refresh(_timestamps, null, this.graphData.rangeValue, this.graphData.rangeUnit);
    _.each(this.histogramMetrics, function(v) {
      v.draw();
    });

    this.clock.setCurrentTimeFromAngle(0);
  }
});
