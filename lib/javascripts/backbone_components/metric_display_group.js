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