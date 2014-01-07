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
        throttle: $a.data('throttle'),
        rangeValue: $a.data('range-value')
      });
      _this.splitLabels.draw({
        labels: $a.data('labels'),
        steps: $a.data('steps'),
        suffix: $a.data('suffix')
      });
    });
    if(this.$ancs.filter('.current').length) {
      this.$ancs.filter('.current').click();
    }
  }
});
