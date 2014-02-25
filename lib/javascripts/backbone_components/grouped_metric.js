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

var GroupedMetric = Backbone.Model.extend({
  defaults: {
    selected: null,
    highlighted: null,
    metric: null,
    value: null
  },
  initialize: function() {

  },
  setValueAsAverage: function(prev, next) {
    this.set('value', (prev + next) / 2);
  }
});

module.exports = GroupedMetric;