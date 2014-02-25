/*
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 *
 */

var MetricDisplay = require('./metric_display');

var PercentageMetricDisplay = MetricDisplay.extend({
  initialize: function(options) {
    MetricDisplay.prototype.initialize.apply(this, arguments);
  },
  updateValue: function() {
    this.$valueContainer.html(this.model.get('value').toFixed(0));
  }
});

module.exports = PercentageMetricDisplay;