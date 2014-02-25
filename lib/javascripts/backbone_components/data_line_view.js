/*
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 *
 */

// var Backbone = require('../../bower_components/backbone/backbone');

var DataLineView = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this, 'setMetricValue');
    this.radialLine = this.options.radialLine;
    this.listenTo(this.model, 'change:highlighted', this.toggleVisibility, this);
    this.listenTo(this.model, 'change:selected', this.setCurrent, this);
    $.subscribe(this.radialLine.channelId + '.dataPointFound', this.setMetricValue);
  },
  toggleVisibility: function(e) {
    var selectedModels = this.model.collection.models.filter(function(v) {
      return v.get('highlighted') === true;
    });
    var toggle = (selectedModels.length) ? this.model.get('highlighted') : true;
    this.radialLine.toggle(toggle);
  },
  setMetricValue: function() {
    this.model.setValueAsAverage(this.radialLine.nearestNextPoint.dataValue.value, this.radialLine.nearestPrevPoint.dataValue.value);
  },
  setCurrent: function() {
    this.radialLine.toggleCurrent(this.model.get('selected'));
  }
});

module.exports = DataLineView;