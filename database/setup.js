require('dotenv').config({ path: './env/.env' });

const pino = require('pino');
const pinologger = pino({
	level: 'info',
	prettyPrint: true,
});

const database = require('./models/models.js');

async function setup() {
	try {
		await database.connection();
	} catch (error) {
		pinologger.error(error);
	}
}

setup();
