#!/usr/bin/env node

/*
 * Parse arguments
 */
const args = process.argv;
const myhost = args[2];
const myport = args[3];
const joinhost = args[4];
const joinport = args[5];

if(myhost === undefined || myport === undefined) {
	console.log('main: exiting....');
	return 1;
}

const events = new (require('events'))();
const cloud = new (require('./cloud'))(events, myport);
const membership = new (require('./membership'))(myhost, myport);

events.on('receive', (json) => {
	//console.log('main: eventReceive');
	if(json.type === 'heartbeat') {
		membership.sendHeartbeat(cloud, json.members);
	}
	else if(json.type === 'status') {
		if(json.ok !== true) {
			console.log('unknown error');
			return 3;
		}
	}
	else {
		console.log('member: unnown signal....');
	}
});

events.on('error', (json) => {
	console.log('exception: ' + json);
});

if(joinhost !== undefined && joinport !== undefined) {
	membership.sendJoin(cloud, joinhost, joinport);
}
else {
	membership.sendJoin(cloud, myhost, myport);
}

membership.start(cloud);
