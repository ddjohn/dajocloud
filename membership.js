const Events = require('events');

const DEAD = 6;
const DELETE = 30;
const GOSSIP_PERCENTAGE = 5; //PERCENT
const SECONDS = 10; //SECONDS

module.exports = class Membership extends Events {

	constructor(host, port) {
		super();
		//console.log('member: Membership(host, port)');

		this.m_host = host;
		this.m_port = port;

		this.m_heartbeat = 0;
		this.m_timestamp = 1;
		this.m_members = []
		this.m_members.push({
			host: this.m_host,
			port: this.m_port,
			heartbeat: this.m_heartbeat,
			timestamp: this.m_timestamp
		});
	}

	sendJoin(cloud, host, port) {
		//console.log('member: join');
	        cloud.send(host, port, {
			type: 'heartbeat',
			members: this.m_members
		});
		//console.log('member: members=' + JSON.stringify(this.m_members));
	}

	sendHeartbeat(cloud, items) {
		//console.log('member: sendHeartbeat');
//		this.m_timestamp++;
		console.log('member: local timestamp: ' + this.m_timestamp);

		items.forEach( (item) => {
			var found = false;
			this.m_members.forEach( (member) => {

				if(member.host == item.host && member.port == item.port) {
					found = true;
					if(item.heartbeat !== 'dead' && member.heartbeat < item.heartbeat) {
						member.heartbeat = item.heartbeat;
						member.timestamp = this.m_timestamp;
					}
				}
			});
			if(item.heartbeat !== 'dead' && found == false) {
				item.timestamp = this.m_timestamp;
				this.m_members.push(item);
			}
		});

		this.m_members.forEach( (member, index, object) => {
			// Increase MY timestamp
			if(member.host == this.m_host && member.port == this.m_port) {
				member.timestamp = this.m_timestamp;
			}

			// Mark as dead if missing tiestamp
			if(this.m_timestamp - member.timestamp > DEAD) {
				member.heartbeat = 'dead';
			}

			// Remove if ripple effect has run out
			if(member.heartbeat === 'dead' && this.m_timestamp - member.timestamp > DELETE) {
				console.log('Delete member...');
				object.splice(index, 1);
			}
		});

		console.log('member: members=' + this.m_members.length);
		//console.log('member: members=' + JSON.stringify(this.m_members));
	}

	start(cloud) {
		setInterval( () => {
			this.m_members.forEach( (member) => {
				if(member.host == this.m_host && member.port == this.m_port) {
					member.heartbeat = ++this.m_heartbeat;
					member.timestamp = ++this.m_timestamp;
				}
			});

			this.m_members.forEach( (member) => {
				// Gossip
				if(Math.random() * 100 > GOSSIP_PERCENTAGE) {
					cloud.send(member.host, member.port, {
						type: 'heartbeat',
						members: this.m_members
					});
				}
			});
		}, SECONDS*1000);
	}
}
