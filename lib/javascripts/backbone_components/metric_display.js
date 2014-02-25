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

var MetricDisplay = Backbone.View.extend({
  events: {
    'click': 'toggleSelection',
    'mouseover': 'toggleHighlight',
    'mouseout': 'toggleHighlight'
  },
  initialize: function(options) {
    this.$valueContainer = this.$el.find('.value-container');
    this.listenTo(this.model, 'change:selected', this.changeCurrent, this);
    this.listenTo(this.model, 'change:value', this.updateValue, this);
    this.dataLineView = options.dataLineView;
    this.group = this.options.group;
    this.$heroFeature = this.$el.closest('.hero-feature');
  },
  toggleHighlight: function(e) {
    var _noneSelected = this.group.collection.filter(function(v) { return v.get('selected'); }).length === 0;
    if(_noneSelected) {
      this.__toggle('highlighted');
    }

    if(this.dataLineView.radialLine.radiusScale) {
      $.publish('current_radial_line', [this.dataLineView.radialLine]);
    }

    // See if anything is highlighted.
    var highlightedModels = this.model.collection.models.filter(function(v) {
      return v.get('highlighted') === true;
    });
    this.$heroFeature.toggleClass('item-highlighted', !!highlightedModels.length);
  },
  toggleSelection: function(e) {
    this.__toggle('selected');
    if(this.model.get('selected')) {
      this.__toggle('highlighted', true);
    }
  },
  __toggle: function(field, override) {
    var _this = this;
    var _switchTo;
    if(typeof override !== 'undefined') {
      _switchTo = override;
    }
    else {
      _switchTo = !this.model.get(field);
    }
    this.model.set(field, _switchTo);
    if(!this.model.get(field)) {
      this.group.collection.each(function(v) {
        v.set(field, null);
      });
    }
    else {
      var otherModels = this.group.collection.each(function(v) {
        if(v !== _this.model) {
          v.set(field, false);
        }
      });
    }
  },
  changeCurrent: function() {
    this.$el.toggleClass('current', this.model.get('selected'));
  },
  updateValue: function() {
    this.$valueContainer.html(this.model.get('value').toFixed(2));
  }
});

module.exports = MetricDisplay;