/**
 * Handle events from a central location
 * and provide a dedicated SVG element to attach to
 */

var Util = require('./util');

var EventCloak = Class.extend({
  defaults: {
    animate: false,
    clock: null,
    width: null,
    height: null,
    cx: null,
    cy: null,
    angular: true,
    offset: 90,
    resetPoint: 0,
    cloakOffset: 0
  },
  init: function(options) {
    this.channelId = _.uniqueId('_channel');
    this.config = _.extend({ }, this.defaults, options);
    this.$el = this.config.$el;
    this.clock = this.config.clock;
    this.tweenComplete = false;
    this.isMouseOver = false;
    this.mouseX = null;
    this.mouseY = null;
    this.attach();
  },
  attach: function() {
    var _this = this;
    _.bindAll(this, 'onMouseOver', 'onMouseOut', 'onMouseMove');
    this.$el.on('mouseover', this.onMouseOver);
    this.$el.on('mouseout', this.onMouseOut);
    this.$el.on('mousemove', this.onMouseMove);
  },

  onMouseOver: function(ev) {
    ev.stopPropagation();
    var _this = this;
    this.isMouseOver = true;
    var _currentAngle = this.config.angular ? Util.normalizeAngle(this.clock.currentAngle) : this.clock.currentAngle;
    this.__createTween(this.config.resetPoint, _currentAngle);
  },
  onMouseOut: function(ev) {
    var _this = this;
    ev.stopPropagation();
    this.isMouseOver = false;
    var _currentAngle = this.config.angular ? Util.normalizeAngle(this.clock.currentAngle) : this.clock.currentAngle;
    this.__createTween(_currentAngle, this.config.resetPoint);
  },
  onMouseMove: function(e) {
    e.stopPropagation();
    if(e.originalEvent) {
      var hasOffset = e.originalEvent.hasOwnProperty('offsetX');
      this.mouseX = hasOffset ? e.originalEvent.offsetX : e.originalEvent.layerX;
      this.mouseY =  hasOffset ? e.originalEvent.offsetY : e.originalEvent.layerY;
    }
  },
  /**
   * Track any movement on the donut, by converting the x/y co-ordinates to an angle.
   */
  trackMovement: function(angle) {
    var mouseAngle;
    if(this.config.angular) {
      mouseAngle = Util.getAngleFromOrigin([this.mouseX, this.mouseY], [this.config.cx, this.config.cy]) + this.config.offset;
      mouseAngle = Util.normalizeAngle(mouseAngle);
    }

    else {
      mouseAngle = this.mouseX + this.config.offset;
    }

    if(this.config.cloakOffset) {
      mouseAngle -= this.config.cloakOffset;
      mouseAngle = _.max([mouseAngle, 0]);
    }

    var _this = this;
    angle = typeof angle !== 'undefined' ? angle : mouseAngle;
    this.clock.setCurrentTimeFromAngle(angle);
    if(this.tween && !this.tweenComplete) {
      var _currentAngle = this.config.angular ? Util.normalizeAngle(this.clock.currentAngle) : this.clock.currentAngle;
      this.tween.to({angle: _currentAngle});
    }
    $.publish(this.channelId + '.movementTracked');
  },
  /**
   * Instantiate the tween (one is created for every mouse over/out)
   */
  __createTween: function(fromAngle, toAngle, barrier) {
    var _this = this;
    if(this.tween) {
      tween.stop();
    }
    TWEEN.removeAll();
    this.tween = tween = new TWEEN.Tween({ angle: fromAngle });
    this.tweenComplete = false;
    tween.to({ angle: toAngle })
    .easing(TWEEN.Easing.Quartic.Out)
    .onUpdate(function() {
      _this.clock.setCurrentTimeFromAngle(this.angle);
    }).onComplete(function() {
      _this.tweenComplete = true;
    }).start();
  }

});

module.exports = EventCloak;
