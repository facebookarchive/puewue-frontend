/*
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 *
 */

var GraphComponent = require('./graph_component');

var BackgroundAxis = GraphComponent.extend({
  defaults: {
    steps: 10,
    horizontal: false,
    width: null,
    height: null,
    rangeLabels: false,
    $outer: null,
    scale: null,
    max: 100,
    offset: {
      x: 0,
      y: 0
    },
    classes: {
      group: 'background-axis-group',
      line: 'background-axis-line',
      rangeLabel: 'background-axis-range-label'
    }
  },
  init: function(options) {
    this.config = _.extend({ }, this.defaults, options);
    this.dataLine = this.config.dataLine;
    this.clock = this.config.clock;
    this.scale = this.config.scale;
    this.base = this.config.base;
    this.steps = this.config.steps;
    this.$outer = this.config.$outer;
    this.$topRangeLabel = this.$outer.find('.' + this.config.classes.rangeLabel + '.top');
    this.$bottomRangeLabel = this.$outer.find('.' + this.config.classes.rangeLabel + '.bottom');
    this.axis = this.config.horizontal ? 'x' : 'y';
    this.otherAxis = this.axis == 'x' ? 'y' : 'x';
    this.group = this.base.svg.append('svg:g').classed(this.config.classes.group, true);
    this.group.attr('transform', 'translate(' + this.config.offset.x + ',' + this.config.offset.y + ')');
    this.__inheritFromBase(['width', 'height']);
  },
  setLines: function(opts) {
    var coords = [ ];
    if(opts.scale) this.scale = opts.scale;
    if(opts.steps) this.steps = opts.steps;
    var _difference = Math.abs(this.scale.range()[0] - this.scale.range()[1]);
    var _oneStep = _difference / this.steps;
    var i = 1;
    this.linePoints = [ ];
    for(i = 1; i < this.steps; i++) {
      this.linePoints.push(_.min([this.scale.range()[0], this.scale.range()[1]]) + (_oneStep * i));
    }
    this.draw();
    this.drawRangeLabels();
  },
  draw: function() {
    var _this = this;
    if(this.linePoints) {
      this.group.selectAll("." + this.config.classes.line).remove();
      this.group.selectAll("." + this.config.classes.line)
        .data(this.linePoints)
      .enter().append("svg:line")
        .attr("class", this.config.classes.line)
        .attr((this.otherAxis + '1'), function(d, i) { return 0; })
        .attr((this.axis + '1'), function(d, i) { return d; })
        .attr((this.otherAxis + '2'), function(d, i) { return _this.config.max; })
        .attr((this.axis + '2'), function(d, i) { return d; });
    }
  },
  drawRangeLabels: function() {
    var metric = this.dataLine.metric;
    if(this.linePoints && this.config.rangeLabels) {
      var _mainProp = this.axis == 'y' ? 'top' : 'left';
      var fixedPoint = 2;
      if(metric.alias === 'temperature' || metric.alias === 'humidity') {
        fixedPoint = 0;
      }
      this.$topRangeLabel.css(_mainProp, this.scale.range()[1]).find('.value-container').html(this.scale.domain()[1].toFixed(fixedPoint));
      this.$bottomRangeLabel.css(_mainProp, this.scale.range()[0]).find('.value-container').html(this.scale.domain()[0].toFixed(fixedPoint));
    }
  }
});

module.exports = BackgroundAxis;
