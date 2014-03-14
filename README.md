# Power Dashboard

**A client-side boilerplate for displaying near-real-time data from a data center.**

+ Interactive wheel graph and histograms for up to 4 metrics
+ Boilerplate HTML code for displaying these components on a web page
+ Configuration to bridge to a data center's JSON-based API (and not just limited to data centers)

![Screenshot](https://github.com/facebook/puewue-frontend/blob/master/screenshot.png?raw=true)

## Getting Started

1. Install gulp and Bower globally by running `npm install -g gulp && npm install -g bower`
2. Install dependencies by running `npm install && bower install` from your project's root
3. Build the project by running `gulp` (or `gulp --production` for production use) from your project's root (outputs to `./build`, which is referenced in `demo/index.html`)
4. Connect the dashboard to your API, by providing your server and metric settings (see **Configuration**) inside of `demo/application.js`
5. Test your connect with a local HTTP server, e.g. `SimpleHTTPServer`

## Configuration

### PowerDashboard

All exposed configuration is sent when instantiating `PowerDashboard`.

An example of how to instantiate this is available in `demo/application.js`

```javascript
{
	wheelGraphEndpointAlias: '24-hours', // See 'Configuration > API > URL structure' for more details
	wheelGraph: true, // Set to 'false' to disable the wheel graph
	histograms: true, // Set to 'false' to disable the set of histograms
	apiConfig: {
		// This is your host. No trailing slash
		host: 'http://localhost:3000'

		// This is an optional prefix for the URI, with no leading or trailing slash
		// See 'Configuration > API > URL structure' for more details
		uriPrefix: 'my/directory'
	},
	metrics: [
		{
			// This references a key in your API responses (see Configuration > API > Data point structure)
			alias: 'humidity',


			name: 'Humidity',

			// By default, the range of data will use the min and max values from the points provided
			// ... `minDomainDifference` can compliment this by ensuring there's a minimum range
			minDomainDifference: 0.05
		},
		{
			alias: 'pue',
			name: 'PUE',

			// You can also define hard boundaries using `domain`
			domain: {
				min: 1.0,
				max: 1.2
			}
		}
		...
	]
}
```

### Markup configuration

#### Accordion metrics
+ **DOM reference**: `.metric-display`
+ **Description**: This should reference one of your available metrics, as part of the overall group. These will display in an accordion-style UI.
+ **data- attributes**:
	+ **metric="your-metric-alias"**: This should match PowerDashboard configuration
	+ **view-mode="temperature"** or **data-view-mode="percentage"**: if one of your metrics is based around percentage or temperature, you can utilise these view modes to renders the values accordingly.

*4 example histograms are available in the `demo/index.html` boilerplate.*

#### Date range filters
+ **DOM reference**: `.date-range-nav a`
+ **Description**: Its purpose is to pass a specific date range into the histogram and refresh the data, with the following attributes:
+ **data- attributes**:
	+ **range="12-days"**: This is your endpoint alias
	+ **unit="days"**: This is a natural language label, which must be parseable into a date range, e.g. days, months, years
	+ **range-value="12"**: An integer to compliment the data-unit, which is utilised by the graph to accurately render the data points
	+ **steps="4"**: How many dividing lines should be on the histogram's x-axis

*4 example date ranges are available in the `demo/index.html` boilerplate.*

#### Histograms
+ **DOM reference**: '.histogram'
+ **Description**: Displays filtered metric data points on a histogram
+ **data- attributes**:
	+ **metric="your-metric-alias"**: This should match PowerDashboard configuration

*4 example histograms are available in the `demo/index.html` boilerplate.*

### API

Here are some instructions on ensuring your API is compatible with the Power Dashboard:

### URL structure
URLs are concatenated on the client-side, using a combination of server settings, a metric alias, and an endpoint alias.

`[host]/[uriPrefix]/[endpoint alias].json`

+ **host**: see *Configuration > PowerDashboard > apiConfig*
+ **uriPrefix**: see *Configuration > PowerDashboard > apiConfig*
+ *endpoint alias*: If it is the Wheel Graph which is requesting data, this is controlled under *Configuration > PowerDashboard > apiConfig > wheelGraphEndpointAlias*. Otherwise, this comes from the date range filters (see *Markup configuration> Date range filters*)

### Data point structure
As a response from each endpoint (e.g. 1-year.json), Power Dashboard expects an JSON-formatted array of data point objects, ordered oldest-first. Each data point object expects the following data:

```javascript
[
		{
		"timestamp": 1389087180000,
		"my_data_point": 135,
		"my_other_point": 4
	}, {
		"timestamp": 1389087190000,
		"my_data_point": 115,
		"my_other_point": 1
	}
	// ...
]
```

### Average data ranges
Histograms support average ranges, which show a transparent range line behind the average data, to show minimum and maximum values at a given time. To output this in the API, you format each data point object as the following:

```javascript
{
	"timestamp": 1389087180000,
	"my_point": 1.5,
	"min_my_point": 1, // The same alias, but prefixed with min_
	"max_my_point": 2, // This same alias, but prefixed with max_
	"my_other_point": 235
}
```

## Dependencies

Power Dashboard has the following dependencies:

+ jQuery & Underscore — DOM and JS utilities
+ D3 — SVG library, used for the graphs
+ Backbone — interfaces with the graph to display the 'current metrics', and control the Accordion UI.
+ Sylvester — vector calculation for graphs
+ Tween.js — tweening for the graphs, utilising window.requestAnimationFrame
+ Simple Inheritance — inheritance for JS objects, used for the app's components
+ Moment — data/time parsing
+ Normalize.css — a browser reset stylesheet
+ Modernizr — browser feature detection
+ Animation Frame — shim for requestAnimationFrame function
+ jQuery tinypubsub — a global publish/subscribe pattern for some components

## Licensing

The source code is licensed under the BSD-style license found in the
[LICENSE](LICENSE) file in the root directory of this source tree. An
additional grant of patent rights can be found in the [PATENTS](PATENTS) file
in the same directory.
