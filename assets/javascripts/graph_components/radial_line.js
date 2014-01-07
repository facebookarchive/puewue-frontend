//= require ./data_line

var RadialLine = DataLine.extend({
  init: function(options) {
    this._super(options);
  },
  /**
   * Take the data and output the x/y co-ordinates from true angles.
   */
  drawPath: function(radialData) {
    var radial = d3.svg.line.radial();
    var pathData = radial(radialData);
    return pathData;
  },
  /**
   * Provide radial-specific data
   */
  setData: function() {
    var _this = this;
    return _.map(this.points, function(v, k) {
      var angle = _this.clock.getAngleFromTime(v.date, 0);
      var radius = _this.radiusScale(v.value);
      return [radius, Util.toRadians(angle)];
    });
  },
  /**
   * Radial lines are normalised differently when inherited
   */
  __normalizeAngle: function(angle) {
    return Util.normalizeAngle(angle);
  },
  /**
   * Angles need to be parsed back as degrees
   * because the path sent radians
   */
  parseAngle: function(angle) {
    return Util.toDegrees(angle);
  }
});