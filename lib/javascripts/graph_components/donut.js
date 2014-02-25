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

var Donut = GraphComponent.extend({
  defaults: {
    base: null,
    width: null,
    height: null,
    cx: null,
    cy: null,
    classes: {
      donut: 'wheel-graph__donut',
      hour_strokes_set: 'wheel-graph__hour-stroke-set',
      hour_strokes: 'wheel-graph__hour-stroke'
    },
    inner_radius: null,
    outer_radius: null,
    hours: 24
  },
  init: function(options) {
    this._super(options);
    this.base = this.config.base;
    this.__inheritFromBase(['width', 'height', 'cx', 'cy', 'inner_radius', 'outer_radius']);
    this.draw();
  },
  // Draw a donut shape using a full-degree SVG arc.
  draw: function(c) {
    var arc, donut;
    arc = d3.svg.arc()
      .innerRadius(this.config.inner_radius)
      .outerRadius(this.config.outer_radius)
      .startAngle(0)
      .endAngle(2 * Math.PI);
    donut = this.base.svg.append("svg:g")
      .attr("class", this.config.classes.donut);
    donut.append("path")
      .attr("d", arc)
      .attr("transform", "translate(" + this.config.cx + "," + this.config.cy + ")");
    this.drawStrokes();
    return donut;
  },
  drawStrokes: function() {
    var max = (2 * Math.PI);
    var step = (( 2 * Math.PI) / this.config.hours);
    var group = this.base.svg.append('svg:g')
      .attr('class', this.config.classes.hour_strokes_set);
    // start at angle 0 radians, to a maximum of 2*pi radians, go up in 24 steps
    for (var a = 0; a < max; a += step) {
      group.append("svg:line")
      .attr("x1", this.config.cx + Math.sin(a)*this.config.inner_radius)
      .attr("y1", this.config.cy + Math.cos(a)*this.config.inner_radius)
      .attr("x2", this.config.cx + Math.sin(a)*(this.config.outer_radius))
      .attr("y2", this.config.cy + Math.cos(a)*(this.config.outer_radius))
      .attr('class', this.config.classes.hour_strokes);
    }
  }
});

module.exports = Donut;