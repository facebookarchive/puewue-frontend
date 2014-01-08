var GraphComponent = require('./graph_component');

/**
 * Allows a variable stroke width, using the data that we already have available to us.
 */
var LineTrail = GraphComponent.extend({
  defaults: {
    dataLine: null,
    maxStrokeWidth: 2,
    minStrokeWidth: 0.2,
    classes: {
      line: 'line-trail'
    }
  },
  init: function(options) {
    _.bindAll(this, 'draw');
    this._super(options);
    this.dataLine = this.config.dataLine;
  },
  draw: function() {
    var _this = this;
    this.strokeScale = this.__createScale();
    var pointsToLoop = _.clone(this.dataLine.pathDict);
    pointsToLoop.pop();

    var hiddenSwitch = false;

    this.dataLine.group.selectAll("." + this.config.classes.line).remove();
    this.dataLine.group.selectAll("." + this.config.classes.line)
      .data(pointsToLoop)
    .enter().append("svg:line")
      .attr("class", this.config.classes.line + ' ' + this.dataLine.config.alias)
      .attr("stroke-width", function(d) { return _this.strokeScale(d.dataValue.date); })
      .attr('x1', function(d, i) { return d['x']; })
      .attr('y1', function(d, i) { return d['y']; })
      .attr('x2', function(d, i) { return _this.dataLine.pathDict[i+1] ?  _this.dataLine.pathDict[i+1]['x'] : 0; })
      .attr('y2', function(d, i) { return _this.dataLine.pathDict[i+1] ?  _this.dataLine.pathDict[i+1]['y'] : 0; })
      .classed('hidden', function(d, i) {
        // Set the visibility, based on if the data is delayed.
        if(_this.dataLine.pathDict[i].dataValue.startDelay) {
          hiddenSwitch = true;
        }
        else if(_this.dataLine.pathDict[i].dataValue.endDelay) {
          hiddenSwitch = false;
        }
        return hiddenSwitch;
      });
  },
  __createScale: function() {
    var scale = d3.scale.linear();
    scale.domain(this.dataLine.clock.domain);
    scale.range([this.config.maxStrokeWidth, this.config.minStrokeWidth]);
    return scale;
  }
});

module.exports = LineTrail;