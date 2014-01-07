var SplitLabels = GraphComponent.extend({
  defaults: {
    $el: null,
    steps: 7,
    width: null,
    labels: ' ',
    suffix: ' days ago',
    classes: {
      label: 'histogram-split-labels__label'
    }
  },
  init: function(options) {
    this.config = _.extend({ }, this.defaults, options);
    this.steps = this.config.steps;
    this.labels = this.config.labels;
    this.suffix = this.config.suffix;
    this.$el = this.config.$el;
  },
  draw: function(opts) {
    this.$el.empty();
    this.labels = typeof opts.labels !== 'undefined' ? opts.labels.split(',') : [ ];
    this.steps = typeof opts.steps !== 'undefined' ? opts.steps : this.config.steps;
    this.suffix = typeof opts.suffix !== 'undefined' ? opts.suffix : this.config.suffix;
    var i;
    var $el;
    var _oneStep = this.config.width / this.steps;
    for(i = 0; i < this.steps; i++) {
      $el = $('<div />', { 'class': this.config.classes.label });
      $el.css('left', _oneStep * i);
      if(this.labels && this.labels[i]) $el.html(this.labels[i] + this.suffix);
      this.$el.append($el);
    }
  }
});
