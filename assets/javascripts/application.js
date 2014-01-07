var dashboard = new PowerDashboard({
	apiConfig: {
		host: 'http://localhost:3000',
		uriPrefix: 'timeline/example'
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
