var MetricGroup = Backbone.Collection.extend();

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
