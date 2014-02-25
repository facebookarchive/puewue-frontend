/*
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 *
 */

/*
 * Handle the logic and time scales for a wheel graph
 * based on an array of timestamps
 */

var Util = require('./util');

var Clock = Class.extend({
  defaults: {
    timestamps: [ ],
    startAngle: 360,
    endAngle: 0,
    radial: false,
    range: {
      unit: 'hours',
      value: 24
    }
  },
  init: function(options) {
    this.config = _.extend({ }, this.defaults, options);
    this.disabled = false;
    this.startTime = null; // Moment object
    this.endTime = null; // Moment object
    this.currentTime = null; // Moment object
    this.currentAngle = null; // Cache the current angle whenever the current time is set.
    this.channelId = _.uniqueId('channel_'); // Create a unique reference to reduce pub/sub calls.
    if(this.config.timestamps.length) {
      this.refresh(this.config.timestamps);
    }
  },
  refresh: function(timestamps, startTime, range, unit) {
    this.timestamps = timestamps;
    startTime = startTime || timestamps[0];
    range = range || null;
    unit = unit || null;
    this.setTimeRange(startTime, range, unit);
  },
  /**
   * Create a scale of time
   * from the start time to the end time
   */
  setTimeScale: function() {
    if(!this.startTime || !this.endTime) {
      return false;
    }

    var scale = d3.time.scale();
    scale.domain([this.startTime.valueOf(), this.endTime.valueOf()]);

    if(this.startTime.valueOf() === this.endTime.valueOf()) {
      this.disabled = true;
      return false;
    }
    else {
      this.disabled = false;
    }

    scale.range([this.config.startAngle, this.config.endAngle]);

    this.timeScale = scale;
    this.domain = scale.domain();
    this.range = scale.range();
    this.setReverseScale();
    return this;
  },
  /**
   * Create a reverse scale to convert angles to time
   */
  setReverseScale: function() {
    var scale = d3.scale.linear();
    scale.domain(this.range);
    scale.range(this.domain);
    this.reverseScale = scale;
    return this;
  },
  /**
   * Calculate an angle based on a an arbitary timestamp
   * (via the timeScale)
   */
  getAngleFromTime: function(timestamp, offset) {
    offset = offset || 0;
    var angle = this.timeScale(timestamp);
    return angle + offset;
  },
  /**
   * Set active time range
   */
  setTimeRange: function(startTime, range, unit) {
    range = range || this.config.range.value;
    unit = unit || this.config.range.unit;
    this.startTime = moment(startTime);
    this.endTime = this.startTime.clone().subtract(unit, range);
    this.setTimeScale();
    return this;
  },
  /**
   * Set current time
   */
  setCurrentTime: function(timestamp) {
    this.currentTime = moment(timestamp);
    this.currentAngle = this.getAngleFromTime(timestamp);
    if(this.config.radial) {
      this.currentAngle = Util.normalizeAngle(this.currentAngle);
    }
    $.publish(this.channelId + '.timeChange', [timestamp]);
    return this;
  },
  /**
   * Set current time from angle
   */
  setCurrentTimeFromAngle: function(angle) {
    if(this.disabled) {
      return false;
    }
    if(this.reverseScale) {
      var timestamp = this.reverseScale(angle);
      this.setCurrentTime(parseInt(timestamp, null));
    }
    return this;
  }
});

module.exports = Clock;
