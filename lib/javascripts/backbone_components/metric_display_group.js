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

var MetricDisplayGroup = Backbone.View.extend({
  initialize: function() {
    this.listenTo(this.collection, 'change:selected', this.toggleFilterMode, this);
  },
  toggleFilterMode: function(mode) {
    var selectedModels = this.collection.models.filter(function(v) {
      return v.get('selected') === true;
    });
    var $heroFeature = this.$el.closest('.hero-feature');
    $heroFeature.toggleClass('item-selected', !!selectedModels.length);
  }
});

module.exports = MetricDisplayGroup;