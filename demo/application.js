$(function() {

	var dashboard = new PowerDashboard({
		apiConfig: {
			host: 'http://localhost:8000',
			uriPrefix: 'demo/api'
		},
		metrics: [
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
		]
	});

});