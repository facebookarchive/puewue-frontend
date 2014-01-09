var GraphComponent = require('./graph_component');

var SplitLabels = GraphComponent.extend({
  defaults: {
    $el: null,
    steps: 7,
    width: null,
    suffix: ' days ago',
    classes: {
      label: 'histogram-split-labels__label'
    }
  },
  init: function(options) {
    this.config = _.extend({ }, this.defaults, options);
    this.steps = this.config.steps;
    this.suffix = this.config.suffix;
    this.$el = this.config.$el;
  },
  draw: function(opts) {
    this.$el.empty();
    this.steps = typeof opts.steps !== 'undefined' ? opts.steps : this.config.steps;
    this.suffix = typeof opts.suffix !== 'undefined' ? opts.suffix : this.config.suffix;
    this.rangeValue = typeof opts.rangeValue !== 'undefined' ? opts.rangeValue : null;
    var i;
    var $el;
    var _oneStep = this.config.width / this.steps;
    var label;
    for(i = 0; i < this.steps; i++) {
      $el = $('<div />', { 'class': this.config.classes.label });
      $el.css('left', _oneStep * i);
      if(this.rangeValue) {
        $el.html(this.rangeValue - (this.rangeValue / this.steps * i));
      }
      this.$el.append($el);
    }
  }
});

module.exports = SplitLabels;