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

var Handle = GraphComponent.extend({
  defaults: {
    cx: null,
    cy: null
  },
  init: function(options) {
    this._super(options);
    this.channelId = _.uniqueId('channel_');
    this.radialLine = this.config.radialLine;
    this.guideline = this.config.guideline;
    this.alias = this.config.alias;
    this.model = this.config.model;

    this.__inheritFromBase(['cx', 'cy']);

    // Now supports lazy attachment, so it doesn't rely on points straight away.
    this.isAttached = false;
    this.attach();

    _.bindAll(this, 'draw');

    $.subscribe(this.radialLine.channelId + '.dataPointFound', this.draw);
  },
  attach: function() {
    if(!this.radialLine.pathPoints) {
      return false;
    }

    this.svg = this.base.svg.append('circle')
      .attr('class', 'wheel-graph__handle')
      .attr('r', 5)
      .attr("transform", "translate(" + this.config.cx + "," + this.config.cy + ")")
      .classed(this.alias, true);

    var lastPoint = this.radialLine.pathPoints[1];
    this.svg.attr('cx', lastPoint[0])
      .attr('cy', lastPoint[1]);

    this.isAttached = true;
  },
  draw: function(e, opts) {

    var _this = this;

    if(!this.isAttached) {
      this.attach();
    }

    // Calculate the handle through an intersection
    var line1 = $L(this.radialLine.v1, this.radialLine.v2);
    var line2 = $L(this.guideline.v1, this.guideline.v2);
    var intersection = line1.intersectionWith(line2);

    this.svg.attr('cx', intersection.elements[0]).attr('cy', intersection.elements[1]);

    if(opts.model) {
      var selectedModels = opts.model.collection.models.filter(function(v) {
        return v.get('selected') === true;
      });

      if(!opts.model.get('selected') && !!selectedModels.length) {
        opts.hide = true;
      }
    }

    this.svg.classed('hidden', opts.hide || false);

    $.publish(this.channelId + '.moved', [{x: intersection.elements[0], y: intersection.elements[1]}]);

  },
  reattach: function() {
    if(this.isAttached) {
      this.isAttached = false;
      this.svg.remove();
      this.attach();
    }
  }
});

module.exports = Handle;