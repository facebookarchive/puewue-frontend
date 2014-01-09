var MetricDisplay = require('./metric_display');
var Util = require('../graph_components/util');

var TemperatureMetricDisplay = MetricDisplay.extend({
  initialize: function(options) {
    MetricDisplay.prototype.initialize.apply(this, arguments);
    this.$convertedValueContainer = this.$el.find('.converted-value-container');
  },
  updateValue: function() {
    this.$valueContainer.html(this.model.get('value').toFixed(0));
    this.$convertedValueContainer.html(Util.toCelsius(this.model.get('value')).toFixed(1));
  }
});

module.exports = TemperatureMetricDisplay;