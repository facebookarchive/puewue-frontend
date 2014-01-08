var GraphComponent = Class.extend({
  defaults: {
    base: null // An instance of a WheelGraphBase object
  },
  init: function(options) {
    this.config = _.extend({ }, this.defaults, options);
    this.base = this.config.base;
    this.svgGroup = null;
    this.svg = null;
  },
  /**
   * Use the value from the base object for the given properties,
   * if it hasn't yet been overriden
   */
  __inheritFromBase: function(props) {
    var _this = this;

    // Handle single properties as single element array
    if(typeof props === 'string') {
      props = [props];
    }

    _.each(props, function(prop) {
      _this.config[prop] = _this.config[prop] === null ? _this.base.config[prop] : _this.config[prop];
    });
  }
});

module.exports = GraphComponent;