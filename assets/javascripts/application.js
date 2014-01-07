$(function() {

  // Don't execute anything to do with the graphs.
  if(!Modernizr.svg) {
    return false;
  }

  /**
   * Create a collection of metrics, identified by aliases
   * ... this will be used globally thoughout the app (for both graphs and non-graphs)
   */
  var metrics = [
    {
      alias: 'humidity',
      name: 'Humidity',
      minDomainDifference: 0.05
    },
    {
      alias: 'temperature',
      name: 'Temperature',
      minDomainDifference: 0.05
    },
    {
      alias: 'pue',
      name: 'PUE',
      domain: {
        min: 1.0,
        max: 1.2
      }
    },
    {
      alias: 'wue',
      name: 'WUE',
      domain: {
        min: 0,
        max: 1.5
      }
    }
  ];

  var apiConfig = {
    host: 'http://localhost:3000',
    uriPrefix: 'timeline/example'
  };

  // Start the wheel graph
  var wheelGraph = new WheelGraphComposite({
    endpointAlias: '24-hours',
    metrics: metrics,
    apiConfig: apiConfig
  });
  window.wheelGraph = wheelGraph;

  // Start the histograms
  var histograms = new HistogramsComposite({
    metrics: metrics,
    apiConfig: apiConfig
  });
  window.histograms = histograms;

  // Handle all graph animations (minimise animation requests)
  window.requestAnimationFrame(function doRedraw() {
    window.requestAnimationFrame(doRedraw);
    if(wheelGraph.eventCloak.isMouseOver) wheelGraph.eventCloak.trackMovement.call(wheelGraph.eventCloak);
    if(histograms.eventCloak.isMouseOver) histograms.eventCloak.trackMovement.call(histograms.eventCloak);
    TWEEN.update();
  });

});

