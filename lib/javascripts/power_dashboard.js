/*
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 *
 */

var WheelGraphComposite = require('./graph_components/wheel_graph_composite');
var HistogramsComposite = require('./graph_components/histograms_composite');

AnimationFrame.shim();

var PowerDashboard = Class.extend({
	defaults: {
		wheelGraphEndpointAlias: '24-hours',
		wheelGraph: true,
		histograms: true,
		apiConfig: null,
		metrics: null
	},
	init: function(options) {
		var wheelGraph, histograms;

		this.config = _.extend({ }, this.defaults, options);

		if(!Modernizr.svg) {
			return false;
		}

		if(!this.config.apiConfig || !this.config.metrics || !this.config.metrics.length) {
			return false;
		}

		if(this.config.wheelGraph) {
			wheelGraph = new WheelGraphComposite({
				endpointAlias: this.config.wheelGraphEndpointAlias,
				metrics: this.config.metrics,
				apiConfig: this.config.apiConfig
			});
			window.wheelGraph = wheelGraph;
		}

		if(this.config.histograms) {
			histograms = new HistogramsComposite({
				metrics: this.config.metrics,
				apiConfig: this.config.apiConfig
			});
			window.histograms = histograms;
		}

		// Handle all graph animations (minimise animation requests)
		window.requestAnimationFrame(function doRedraw() {
			window.requestAnimationFrame(doRedraw);
			if(wheelGraph && wheelGraph.eventCloak.isMouseOver) wheelGraph.eventCloak.trackMovement.call(wheelGraph.eventCloak);
			if(histograms && histograms.eventCloak.isMouseOver) histograms.eventCloak.trackMovement.call(histograms.eventCloak);
			TWEEN.update();
		});
	}
});

window.PowerDashboard = PowerDashboard;

exports = PowerDashboard;