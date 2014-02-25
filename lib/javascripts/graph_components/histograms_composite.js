/*
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 *
 */

var GraphData = require('./graph_data');
var Clock = require('./clock');
var SplitLabels = require('./split_labels');
var DateFilterNav = require('./date_filter_nav');
var DateLabel = require('./date_label');
var EventCloak = require('./event_cloak');
var HistogramMetric = require('./histogram_metric');

// Backbone
var MetricGroup = require('../backbone_components/metric_group');

var HistogramsComposite = Class.extend({
  defaults: {
    endpointAlias: null,
    metrics: null,
    apiConfig: null
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

    var $eventCloak = $('<div class="histogram-group__event-cloak" />').prependTo(this.$el);
    $.each(this.metrics, function(k, v) {
      $eventCloak.append('<div class="event-cloak__listing" data-metric="' + v.alias + '"></div>');
    });

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
      $this.data('histogram', $('.histogram[data-metric="' + $this.data('metric') + '"]'));
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

module.exports = HistogramsComposite;
