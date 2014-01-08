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