/*
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 *
 */

var RadialLine = require('./radial_line');
var DelaySegment = require('./delay_segment');
var LineTrail = require('./line_trail');
var Handle = require('./handle');

// Backbone
var GroupedMetric = require('../backbone_components/grouped_metric');
var DataLineView = require('../backbone_components/data_line_view');
var TemperatureMetricDisplay = require('../backbone_components/temperature_metric_display');
var PercentageMetricDisplay = require('../backbone_components/percentage_metric_display');
var MetricDisplay = require('../backbone_components/metric_display');

var WheelGraphMetric = Class.extend({
  defaults: {
    metric: null,
    base: null,
    clock: null
  },
  init: function(options) {
    this.config = _.extend({ }, this.defaults, options);
    this.metric = this.config.metric;
    this.base = this.config.base;
    this.clock = this.config.clock;
    this.collection = this.config.collection;
    this.displayGroup = this.config.displayGroup;
    this.guideline = this.config.guideline;
    this.donut = this.config.donut;
    this.graphData = this.config.graphData;

    this.metricPoints = this.graphData.formatAsMetric(this.metric.alias);

     this.model = new GroupedMetric({
      metric: this.metric
    });

    this.radialLine = new RadialLine({
      base: this.base,
      min: this.base.config.inner_radius,
      max: this.base.config.outer_radius,
      points: this.metricPoints,
      alias: this.metric.alias,
      clock: this.clock,
      model: this.model,
      metric: this.metric,
      lineDataKey: 1
    });

    this.delaySegment = new DelaySegment({
      base: this.base,
      clock: this.clock,
      donut: this.donut,
      radial: true,
      metric: this.metric,
      metricPoints: this.metricPoints
    });

    this.radialLine.delaySegment = this.delaySegment;

    this.lineTrail = new LineTrail({
      dataLine: this.radialLine,
      classes: {
        line: 'wheel-graph__line-trail'
      }
    });

    window.lineTrails.push(this.lineTrail);

    this.collection.add(this.model);

    this.$metricDisplay = this.displayGroup.$el.find('.metric-display[data-metric="' + this.metric.alias + '"]');

    this.radialLineView = new DataLineView({
      radialLine: this.radialLine,
      model: this.model
    });

    var viewProps = {
      el: this.$metricDisplay[0],
      group: this.displayGroup,
      model: this.model,
      dataLineView: this.radialLineView
    };

    var viewMode = this.$metricDisplay.data('view-mode');
    if(viewMode === 'temperature') {
       this.metricDisplayView = new TemperatureMetricDisplay(viewProps);
    }
    else if(viewMode === 'percentage') {
      this.metricDisplayView = new PercentageMetricDisplay(viewProps);
    }
    else {
      this.metricDisplayView = new MetricDisplay(viewProps);
    }

    this.handle = new Handle({
      base: this.base,
      radialLine: this.radialLine,
      alias: this.metric.alias,
      guideline: this.guideline
    });

  },
  draw: function() {

    var _data = this.graphData.formatAsMetric(this.metric.alias);
    this.metricPoints = _data;
    this.delaySegment.metricPoints = this.metricPoints;
    this.radialLine.setPoints(_data);
    this.delaySegment.draw();

  }
});

module.exports = WheelGraphMetric;
