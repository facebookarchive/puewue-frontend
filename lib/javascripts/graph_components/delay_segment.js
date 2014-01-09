var GraphComponent = require('./graph_component');

var DelaySegment = GraphComponent.extend({
  defaults: {
    cy: null,
    cx: null,
    clock: null,
    base: null,
    metric: null,
    donut: null,
    radial: false,
    classes: {
      group: 'delay-segment',
      arc: 'delay-segment__arc'
    }
  },
  init: function(options) {
    this._super(options);
    this.points = [ ];
    // Instance refs
    this.metric = this.config.metric;
    this.metricPoints = this.config.metricPoints;
    this.clock = this.config.clock;
    this.donut = this.config.donut;
    this.base = this.config.base;
    this.__inheritFromBase(['cx', 'cy']);
    this.group = this.base.svg.append('svg:g')
      .attr('class', this.config.classes.group);
  },
  buildPoints: function() {
    var _points = [ ];
    var _this = this;
    var i = 0;
    if(this.metricPoints) {
      _.each(this.metricPoints, function(v, k) {
        if(v.startDelay === true) {
          _points[i] = {start: v.date};
        }
        else if(v.endDelay === true) {
          _points[i].end = v.date;
          i++; // Move on to the next array element
        }
      });
      this.points = _points;
    }
  },
  draw: function() {

    var _this = this;
    var _shape;

    this.buildPoints();

    if(this.config.radial) {

      _shape = d3.svg.arc()
        .innerRadius(this.donut.config.inner_radius)
        .outerRadius(this.donut.config.outer_radius)
        .startAngle(function(d) {
          return Util.toRadians(_this.clock.timeScale(d.start));
        })
        .endAngle(function(d) {
          return Util.toRadians(_this.clock.timeScale(d.end));
        });

      this.group.selectAll("." + this.config.classes.arc).remove();
      this.group.selectAll("." + this.config.classes.arc)
        .data(this.points).enter()
          .append("path")
          .attr("d", _shape)
          .attr("transform", "translate(" + this.config.cx + "," + this.config.cy + ")")
          .classed(this.config.classes.arc, true);

    }
    else {

      this.group.selectAll("." + this.config.classes.arc).remove();
      this.group.selectAll("." + this.config.classes.arc)
        .data(this.points).enter()
          .append("svg:rect")
          .attr('x', function(d) {
            return _this.clock.timeScale(d.end || _this.clock.timeScale.domain()[1]);
          })
          .attr('y', 0)
          .attr('width', function(d) { return _this.clock.timeScale(d.start || _this.clock.timeScale.domain()[0]) - _this.clock.timeScale(d.end || _this.clock.timeScale.domain()[1]); })
          .attr('height', 120)
          .attr("transform", "translate(" + this.config.cx + "," + this.config.cy + ")")
          .classed(this.config.classes.arc, true);

    }

  }
});

module.exports = DelaySegment;
