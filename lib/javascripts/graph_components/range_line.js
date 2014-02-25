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

var RangeLine = GraphComponent.extend({
  defaults: {
    dataLine: null,
    clock: null,
    min: 0,
    max: 100,
    offset: 0,
    autoAttach: true,
    classes: {
      line: 'histogram__range-line',
      group: 'histogram__range-line-group'
    }
  },
  init: function(options) {
    var _this = this;
    _.bindAll(this, 'draw');
    this._super(options);
    this.dataLine = this.config.dataLine;
    this.clock = this.config.clock;
    this.metric = this.config.metric;
    this.nest = d3.nest()
      .key(function(d) { return d.key; });
    this.stack = d3.layout.stack()
      .offset("zero")
      .values(function(d) { return d.values; })
      .x(function(d) { return d.date; })
      .y(function(d) { return d.value; });
    this.area = d3.svg.area()
      .x(function(d) { return _this.clock.getAngleFromTime(d.date); })
      .y0(function(d) { return _this.radiusScale(d.y0); })
      .y1(function(d) { return _this.radiusScale(d.y); });
    if(this.config.autoAttach) {
      this.attach();
    }
  },
  attach: function() {
    this.group = this.group || this.base.svg.append("svg:g")
      .attr("transform", "translate(" + (this.base.config.cx + this.config.offset) + "," + (this.base.config.cy) + ")")
      .classed(this.config.classes.group, true);
  },
  draw: function() {
    var _this = this;

    if(!this.points) {
      return false;
    }

    this.radiusScale = this.__createRadiusScale();

    this.group.selectAll("." + _this.config.classes.line).remove();

    this.group.selectAll("." + _this.config.classes.line)
      .data(this.points)
    .enter().append("path")
      .attr("d", function(d) { return _this.area(d.values); })
      .attr("class", this.config.classes.line + ' ' + this.config.alias);
  },
  setPoints: function(range) {
    range = range || [ ];
    if(range.length) {
      this.data = range;
      this.points = this.stack(this.nest.entries(this.data));
    }
    this.attach();
    this.draw();
  },
  /**
   * Create a value scale based on DataLine
   */
  __createRadiusScale: function() {

    var scale = d3.scale.linear();

    var _domain = this.dataLine.radiusScale.domain();
    scale.domain(_domain);

    /***********************************************/

    scale.range([this.config.min, this.config.max]);
    return scale;
  }
});

module.exports = RangeLine;
