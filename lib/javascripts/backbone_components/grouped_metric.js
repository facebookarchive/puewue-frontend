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