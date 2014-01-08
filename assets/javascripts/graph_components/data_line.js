/**
 * Draw a radial graph based on time & arbitary data
 */

var Util = require('./util');

var DataLine = Class.extend({
  defaults: {
    base: null,
    min: 0,
    max: 100,
    offset: 0,
    inner_radius: 0,
    lineDataKey: 0,
    autoAttach: true,
    clock: null, // Instance of 'Clock' object for handling the time scale
    classes: {
      line: 'wheel-graph__line',
      group: 'wheel-graph__line-group'
    }
  },
  init: function(options) {
    this.channelId = _.uniqueId('channel_');
    this.config = _.extend({ }, this.defaults, options);
    _.bindAll(this, 'redraw', 'findClosestPoints');
    this.base = this.config.base;
    this.clock = this.config.clock;

    this.metric = this.config.metric;
    this.model = this.config.model;
    this.delaySegment = this.config.delaySegment;

    this.lineDataKey = this.config.lineDataKey || 0;

    this.rangeData = null;

    $.subscribe(this.clock.channelId + '.timeChange', this.findClosestPoints);

    // Check if points have been provided on instantiation,
    // and draw the line if so.
    if(typeof this.config.points !== 'undefined' && this.config.length) {
      this.setPoints(this.config.points);
    }
  },
  drawPath: function(data) {
    var line = d3.svg.line()
        .x(function(d) { return d[0]; })
        .y(function(d) { return d[1]; });
    var pathData = line(data);
    return pathData;
  },
  /**
   * Don't perform any conversion by default.
   * (Because we're now treating angles as a simple unit)
   */
  parseAngle: function(angle) {
    return angle;
  },
  /**
   * Create a 'path dictionary' to store all relevent path data together
   */
  setPathDict: function() {
    var pathDict = [ ];
    var _this = this;
    var _delaySwitch = false;
    _.each(this.pathPoints, function(v, k) {
      var angle = _this.parseAngle(_this.lineData[k][_this.lineDataKey]);
      // var _startDelay = (_this.points[k]) ? (_this.points[k].startDelay || false) : false;
      // var _endDelay = (_this.points[k]) ? (_this.points[k].endDelay || false) : false;
      if(_this.points[k].startDelay) {
        _delaySwitch = true;
      }
      else if(_this.points[k].endDelay) {
        _delaySwitch = false;
      }
      pathDict.push({
        angle: angle,
        normalisedAngle: _this.__normalizeAngle(angle),
        x: v[0],
        y: v[1],
        dataValue: _this.points[k],
        // startDelay: _startDelay,
        // endDelay: _endDelay,
        delayed: _delaySwitch
      });
    });
    return pathDict;
  },
  setPoints: function(points) {
    this.points = points;
    if(!this.svg && this.config.autoAttach) {
      this.attach();
    }
    this.redraw();
  },
  /**
   * Radial lines are normalised differently when inherited
   */
  __normalizeAngle: function(angle) {
    return angle;
  },
  /**
   * Reset the scales and redraw the line
   */
  redraw: function() {
    var _this = this;

    this.radiusScale = this.__createRadiusScale();

    this.lineData = this.setData();
    var pathData = this.drawPath(this.lineData);

    if(this.svg) this.svg.attr('d', pathData);
    this.pathPoints = Util.pathToPoints(pathData);

    // Capture a path dictionary to contain all useful information at once.
    this.pathDict = this.setPathDict();

    _.each(window.lineTrails, function(v) {
      if(v.dataLine === _this) {
        v.draw();
      }
    });

  },
  /**
   * Attach the SVG elements
   */
  attach: function() {
    this.group = this.group || this.base.svg.append("svg:g")
      .attr("transform", "translate(" + (this.base.config.cx + this.config.offset) + "," + (this.base.config.cy) + ")")
      .classed(this.config.classes.group, true);

    this.svg = this.svg || this.group.append('path')
      .attr("class", this.config.classes.line + ' ' + this.config.alias);

    /** Boundary 1 **/
    this.nextPointSVG = this.nextPointSVG || this.group.append('circle')
      .attr('class', 'handle')
      .attr('r', 3)
      .attr('fill', 'green');

    /** Boundary 2 **/
    this.prevPointSVG = this.prevPointSVG || this.group.append('circle')
      .attr('class', 'handle')
      .attr('r', 3)
      .attr('fill', 'red');

  },
  /**
   * Create a value scale
   */
  __createRadiusScale: function() {
    var scale = d3.scale.linear();

    var _domain = [ ];

    // Check if range data needs to be taken into account.
    if(this.rangeData) {
      _domain = d3.extent(this.rangeData, function(d) { return d.y; });
    }
    else {
      _domain = d3.extent(this.points, function(d) { return d.value; });
    }

    // Now make sure there's a big enough difference in the data.
    var _diff = Math.abs(_domain[0] - _domain[1]);

    if(typeof this.metric.minDomainDifference !== 'undefined' && _diff < this.metric.minDomainDifference) {
      var _midpoint = _domain[0] + (_diff / 2);
      _domain[0] = _midpoint - (this.metric.minDomainDifference / 2);
      _domain[1] = _midpoint + (this.metric.minDomainDifference / 2);
    }

    // Apply any specific minimum boundaries if provided.
    if(typeof this.metric.domain !== 'undefined') {
      _domain[0] = _.min([_domain[0], this.metric.domain.min]);
      _domain[1] = _.max([_domain[1], this.metric.domain.max]);
    }

    scale.domain(_domain);
    scale.range([this.config.min, this.config.max]);
    return scale;
  },
  /**
   * Loop through data and provide a d3
   * compatible array of radius/angle
   */
  setData: function() {
    var _this = this;
    return _.map(this.points, function(v, k) {
      var x = _this.clock.getAngleFromTime(v.date);
      var y = _this.radiusScale(v.value);
      return [x, y];
    });
  },
  /**
   * Toggle the visibility of the entire group
   * (showing/hiding the handle and line itself)
   */
  toggle: function(show) {
    if(this.group) {
      this.group.classed('hidden', !show);
    }
    if(this.delaySegment) {
      this.delaySegment.group.classed('hidden', !show);
    }
  },
  toggleCurrent: function(current) {
    this.current = current ? true : false;
    if(this.current) {
      $.publish('current_radial_line', [this]);
    }
  },
  /**
   * Use the radial line to track the current data point too
   */
  findClosestPoints: function() {
    var _this = this;
    var nearestNextPoint, nearestPrevPoint;

    var currentAngle = this.__normalizeAngle(this.clock.currentAngle);

    if(this.current) {
      $.publish('current_data_line', [this]);
    }

    if(this.pathDict) {

      var isRadial = this.clock.config.radial;

      var last = this.pathDict[this.pathDict.length - 1].normalisedAngle;
      if(last === this.clock.config.startAngle && isRadial) last = this.clock.config.endAngle;
      var nextToLast = this.pathDict[this.pathDict.length - 2].normalisedAngle;
      var isTop = currentAngle === this.clock.config.startAngle || currentAngle === this.clock.config.endAngle;
      var isFirst = currentAngle < this.pathDict[0].normalisedAngle && currentAngle >= this.pathDict[1].normalisedAngle;
      var isLast = currentAngle >= last && currentAngle < nextToLast;

      // See if the current angle has gone outside the bounds of the data points.
      if(isRadial && currentAngle < last) {
        return false;
      }

      if(isRadial && (isTop || isFirst)) {
        nearestNextPoint = this.pathDict[1];
        nearestPrevPoint = this.pathDict[0];
      }
      else if(isRadial && isLast) {
        nearestPrevPoint = this.pathDict[this.pathDict.length - 2];
        nearestNextPoint = this.pathDict[this.pathDict.length - 1];
      }
      else {
        var sortedAngles = _.sortBy(this.pathDict, function(v) {
          return Math.abs(v.normalisedAngle - currentAngle);
        });

        nearestNextPoint = _.find(sortedAngles, function(v) {
          return v.normalisedAngle <= currentAngle;
        });

        nearestPrevPoint = _.find(sortedAngles, function(v) {
          return v.normalisedAngle > currentAngle;
        });

      }

      if(nearestNextPoint && nearestPrevPoint) {

        this.nextPointSVG.attr('cx', nearestNextPoint.x).attr('cy', nearestNextPoint.y);
        this.prevPointSVG.attr('cx', nearestPrevPoint.x).attr('cy', nearestPrevPoint.y);

        // Add the vectors
        this.v1 = $V([nearestNextPoint.x, nearestNextPoint.y, 0]);
        this.v2 = $V([nearestPrevPoint.x - nearestNextPoint.x, nearestPrevPoint.y - nearestNextPoint.y, 0]);

        // Publish new stuff to radial line
        this.nearestPrevPoint = nearestPrevPoint;
        this.nearestNextPoint = nearestNextPoint;

        $.publish(this.channelId + '.dataPointFound', [{
          hide: this.nearestPrevPoint.delayed,
          model: this.model
        }]);
      }

    }

  }
});

module.exports = DataLine;
