/*
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 *
 */

var Util = require('./util');

var IntervalIcon = Class.extend({
  defaults: {
    $el: null,
    width: 26,
    height: 26,
    inner_radius: 6,
    outer_radius: 13,
    graphData: null,
    cy: null,
    cx: null,
    intervalMs: 60000,
    timerMs: 1000,
    classes: {
      svg: 'interval-icon__svg',
      arc: 'interval-icon__arc'
    }
  },
  init: function(options) {
    var _this = this;
    this.config = _.extend({ }, this.defaults, options);

    _.bindAll(this, 'updateArc');

    if(this.config.cx === null) this.config.cx = this.config.width / 2;
    if(this.config.cy === null) this.config.cy = this.config.height / 2;
    this.$el = this.config.$el;
    this.currentTimer = 0;
    this.graphData = this.config.graphData;

    this.svg = d3.select(this.$el[0]).append("svg:svg");
    this.svg.classed(this.config.classes.svg, true);
    this.svg.attr('width', this.config.width).attr('height', this.config.height);

    this.arc = d3.svg.arc()
      .innerRadius(this.config.inner_radius)
      .outerRadius(this.config.outer_radius)
      .startAngle(0)
      .endAngle(function(d, i) {
        return d.value;
      });

    this.data = (function() {
      var _arr = [ ];
      var _degrees;
      for(var i = 0; i < (_this.config.intervalMs / _this.config.timerMs); i++) {
        _degrees = ((_this.config.timerMs / _this.config.intervalMs) * 360) * i;
        _arr.push({
          value: Util.toRadians(_degrees)
        });
      }
      return _arr;
    })();

    this.svg.append("path")
      .data(this.data)
      .attr("d", this.arc)
      .attr("transform", "translate(" + this.config.cx + "," + this.config.cy + ")")
      .classed(this.config.classes.arc, true);

    this.interval = null;
    this.$timer = $('#countdown-timer');
    this.$standardMsg = $('#standard-msg');
    this.$processingMsg = $('#processing-msg');

  },
  displayError: function() {
    var _this = this;
    this.$processingMsg.show();
    this.$standardMsg.hide();
    this.$timer.html((_this.config.intervalMs / 1000) + ' seconds');
    this.updateArc();
    setTimeout(function() {
      _this.$processingMsg.hide();
      _this.$standardMsg.show();
      _this.setTimer();
    }, 3000);
  },
  updateArc: function() {
    this.svg.selectAll('.' + this.config.classes.arc)
      // .transition().duration(this.config.timerMs)
      .attr('d', this.arc(this.data[this.currentTimer]));
  },
  setTimer: function() {

    (function(_this) {
      if(_this.interval) window.clearInterval(_this.interval);
      _this.interval = setInterval(function() {
        _this.updateArc();
        var ms = _this.config.intervalMs - (_this.currentTimer * _this.config.timerMs);
        _this.$timer.html((ms / 1000) + ' seconds');
        if((_this.currentTimer + 1) === (_this.config.intervalMs / _this.config.timerMs)) {
          _this.currentTimer = 0;
          _this.$timer.html((ms / 1000) + ' seconds');
          $.publish(_this.channelId + '.timerReset');
          clearInterval(_this.interval);
        }
        else {
          _this.currentTimer ++;
        }
      }, _this.config.timerMs);
    })(this);
  }
});

module.exports = IntervalIcon;