/*
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 *
 */

var DateFilterNav = Class.extend({
  init: function(options) {
    var _this = this;
    this.config = _.extend({ }, this.defaults, options);
    this.$el = this.config.$el;
    this.graphData = this.config.graphData;
    this.splitLabels = this.config.splitLabels;
    this.$ancs = this.$el.find('a[data-range]');
    this.$ancs.click(function(e) {
      var $a = $(this);
      e.preventDefault();
      _this.$ancs.removeClass('current');
      $a.addClass('current');
      _this.graphData.filterByRange({
        alias: $a.data('range'),
        steps: $a.data('steps'),
        rangeUnit: $a.data('unit'),
        rangeValue: $a.data('range-value')
      });
      _this.splitLabels.draw({
        steps: $a.data('steps'),
        suffix: $a.data('suffix'),
        rangeValue: $a.data('range-value')
      });
    });
    if(this.$ancs.filter('.current').length) {
      this.$ancs.filter('.current').click();
    }
  }
});

module.exports = DateFilterNav;