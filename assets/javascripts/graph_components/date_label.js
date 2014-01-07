var DateLabel = Class.extend({
  defaults: {
    format: 'MMMM Do, YYYY',
    padding: 15,
    border: 2,
    minPos: 0,
    maxPos: null,
    classes: {
      inner: 'histogram-date-label__inner',
      value: 'value-container',
      inverted: 'inverted'
    }
  },
  init: function(options) {
    var _this = this;
    this.config = _.extend({ }, this.defaults, options);
    this.clock = this.config.clock;
    this.$el = this.config.$el;
    this.$inner = this.$el.find('.' + this.config.classes.inner);
    this.$value = this.$el.find('.' + this.config.classes.value);
    this.width = null;

    $.subscribe(this.clock.channelId + '.timeChange', function(e) {
      var _angle = _this.clock.currentAngle;
      _this.invertPoint = _this.$el.width() / 2;

      var _width = _this.$inner.width();

      if(_width !== _this.width || _this.width === null) {
        _this.width = _width;
      }

      if(_angle > _this.invertPoint) {
        _this.$inner.css('marginLeft', 0 - _width + _this.config.border - _this.config.padding).addClass(_this.config.classes.inverted);
      }
      else {
        _this.$inner.css('marginLeft', '').removeClass(_this.config.classes.inverted);
      }

      var _left = _.max([_angle + _this.config.border, _this.config.minPos]);
      if(_this.config.maxPos !== null) _left = _.min([_left, _this.config.maxPos]);
      _this.$inner.css('left', _left);
      _this.$value.html(_this.clock.currentTime.format(_this.config.format));
    });
  }
});
