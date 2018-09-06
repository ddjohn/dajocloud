const Events = require('events');
const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');

module.exports = class Cloud {
	constructor(events, port) {
		//console.log('cloud: Cloud(events, cloud)');

		this.events = events;

		const app = express();
		app.use(bodyParser.json());

		app.post('/', (req, res) => {
			this.receive(req, res);
		});

		app.listen(port, () => {
			console.log('cloud: Listening on ' + port);
		});
	}

	receive(req, res) {
		//console.log('cloud: receive');
		this.events.emit('receive', req.body);
		res.send({type:'status', ok:true});
	}

	send(host, port, message) {
		const url = 'http://' + host + ':'  + port + '/';
		//console.log('cloud: url=' + url);

		request.post({url:url, json:true, body:message}, (err, res, body) => {
			if (err) {
				this.events.emit('error', err);
			} else {
				this.events.emit('receive', body);
			}
		});
	}
}

