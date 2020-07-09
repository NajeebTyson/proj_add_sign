const Agenda = require('agenda');

const connectionOpts = { db: { address: process.env.MONGODB_URI, collection: 'Jobs' } };

const agenda = new Agenda(connectionOpts);
agenda.start();

module.exports = agenda;
