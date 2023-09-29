const { ZBClient } = require('zeebe-node');

const gmailService = require('./gmail.js');
const icsService = require('./ics.js');

const client = new ZBClient();

console.log("GatewayAddress: " + client.gatewayAddress);

client.createWorker({
	taskType: 'sendDienstreiseGenehmigung',
	taskHandler: (job, _, worker) => {
		//todo: parse start and end date and pass it to icsService
		const { mitarbeiterEmail, startDatum, endDatum, postalAddress} = job.variables
		console.log(`Sending email to : ${mitarbeiterEmail}`);

		icsService.createIcs()//
			.then(gmailService.authorize()//
				.then(auth => gmailService.sendCalendar(auth, mitarbeiterEmail, postalAddress)//
					.then(async () => {
						console.log("trying to complete the job");
						job.complete();

					})
					.catch(err => {
						console.log("Ein Fehler ist aufgetreten: " + err);
						job.fail(err.toString(), 0);
					})));

	},
	fetchVariable: ['mitarbeiterEmail', 'startDatum', 'endDatum','postalAddress']
});

