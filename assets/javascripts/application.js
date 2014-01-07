//= require lodash/dist/lodash
//= require jquery-tiny-pubsub/dist/ba-tiny-pubsub.js
//= require moment/moment
//= require sylvester/sylvester
//= require d3/d3
//= require json2/json2
//= require backbone/backbone
//= require tweenjs/src/Tween
//= require simple-inheritance/Class
//= require_tree ./graph_components
//= require_tree ./backbone_components
//= require_self

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

  var dataCenterId = $('#app').data('center-id');

  // Start the wheel graph
  var wheelGraph = new WheelGraphComposite({
    dataCenterId: dataCenterId,
    endpointAlias: '24-hours',
    metrics: metrics
  });
  window.wheelGraph = wheelGraph;

  // Start the histograms
  var histograms = new HistogramsComposite({
    dataCenterId: dataCenterId,
    metrics: metrics
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

