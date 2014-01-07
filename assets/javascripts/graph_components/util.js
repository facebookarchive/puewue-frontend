var Util = {
	// This function return an array of the different absolute paths received as a string, converted to absolute points.
    // http://webmaestro.fr/convert-svg-relative-path-data-to-absolute-polyline-points-with-javascript/
	pathToPoints: function(path) {
      var paths = path.split( /z|Z/ ), points = [ ];
      for ( var i = 0; i < paths.length; i++ ) {
        path = paths[i].split( /l|L/ );
        path[0] = path[0].replace( /m|M/, '' );
        for ( var j in path ) {
          path[j] = path[j].split( ',' );
          for ( var k in path[j] ) {
            path[j][k] = parseFloat( path[j][k]);
            // if ( j != 0 ) {
              // path[j][k] += path[j-1][k];
            // }
          }
        }
      }
      return path;
    },
    // Convert radians to degrees
    toDegrees: function(rad) {
      return rad * 180 / Math.PI;
    },
    // Convert degrees to radians
    toRadians: function(deg) {
      return deg * Math.PI / 180;
    },
    // Convert degrees farenheit to celsius
    toCelsius: function(f) {
      return (f-32) * 5 / 9;
    },
    // Get the angle from a specified origin, using x/y co-ordinates
    // coords[0] = x, coords[1] = y
    getAngleFromOrigin: function(coords, origin) {
      var rads = Math.atan2(coords[1] - origin[1], coords[0] - origin[0]);
      return Util.toDegrees(rads);
    },
    normalizeAngle: function(angle, normaliseTo) {
      normaliseTo = normaliseTo || 360;
      angle = angle % normaliseTo;
      if(angle <= 0) {
        angle += normaliseTo;
      }
      return angle;
    }
};
