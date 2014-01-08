var GraphComponent = require('./graph_component');

var RangeLine = GraphComponent.extend({
  defaults: {
    dataLine: null,
    clock: null,
    min: 0,
    max: 100,
    offset: 0,
    autoAttach: true,
    classes: {
      line: 'histogram__range-line',
      group: 'histogram__range-line-group'
    }
  },
  init: function(options) {
    var _this = this;
    _.bindAll(this, 'draw');
    this._super(options);
    this.dataLine = this.config.dataLine;
    this.clock = this.config.clock;
    this.metric = this.config.metric;
    this.nest = d3.nest()
      .key(function(d) { return d.key; });
    this.stack = d3.layout.stack()
      .offset("zero")
      .values(function(d) { return d.values; })
      .x(function(d) { return d.date; })
      .y(function(d) { return d.value; });
    this.area = d3.svg.area()
      .x(function(d) { return _this.clock.getAngleFromTime(d.date); })
      .y0(function(d) { return _this.radiusScale(d.y0); })
      .y1(function(d) { return _this.radiusScale(d.y); });
    if(this.config.autoAttach) {
      this.attach();
    }
  },
  attach: function() {
    this.group = this.group || this.base.svg.append("svg:g")
      .attr("transform", "translate(" + (this.base.config.cx + this.config.offset) + "," + (this.base.config.cy) + ")")
      .classed(this.config.classes.group, true);
  },
  draw: function() {
    var _this = this;

    if(!this.points) {
      return false;
    }

    this.radiusScale = this.__createRadiusScale();

    this.group.selectAll("." + _this.config.classes.line).remove();

    this.group.selectAll("." + _this.config.classes.line)
      .data(this.points)
    .enter().append("path")
      .attr("d", function(d) { return _this.area(d.values); })
      .attr("class", this.config.classes.line + ' ' + this.config.alias);
  },
  setPoints: function(range) {
    range = range || [ ];
    if(range.length) {
      this.data = range;
      this.points = this.stack(this.nest.entries(this.data));
    }
    this.attach();
    this.draw();
  },
  /**
   * Create a value scale
   * .... similar to data_line.js
   */
  __createRadiusScale: function() {

    /*********** TAKEN FROM data_line.js ***********/

    var scale = d3.scale.linear();


    // var _domain = [ ];

    // .................. Apart from this bit!!
    // _domain = d3.extent(this.data, function(d) { return d.value; });

    // Now make sure there's a big enough difference in the data.
     // Now make sure there's a big enough difference in the data.
    // var _diff = Math.abs(_domain[0] - _domain[1]);

    /*
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
    */

    var _domain = this.dataLine.radiusScale.domain();
    scale.domain(_domain);

    /***********************************************/

    scale.range([this.config.min, this.config.max]);
    return scale;
  }
});

module.exports = RangeLine;
