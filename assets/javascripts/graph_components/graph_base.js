var GraphBase = Class.extend({
  defaults: {
    inner_radius: 70,
    outer_radius: null
  },
  init: function(options) {
    this.config = _.extend({ }, this.defaults, options);
    this.svg = null;

    // Expose some config vars as properties
    this.$el = this.config.$el;
    this.config.cx = this.config.width / 2;
    this.config.cy = this.config.height / 2;

    if(this.config.outer_radius === null) {
      this.config.outer_radius = this.config.cx;
    }

    this.draw();
  },
  draw: function() {
    this.svg = d3
      .select(this.$el[0])
      .append("svg:svg")
      .attr("width", this.config.width)
      .attr("height", this.config.height);
  }
});

module.exports = GraphBase;