require('dotenv').config({ path: './env/.env' });

const pino = require('pino');
const pinologger = pino({
	level: 'info',
	prettyPrint: true,
});

const database = require('./models/models.js');

async function sample() {
	try {
		await database.Seller.create({
			name: 'seller 1',
			contact: '9876543210',
		});
		await database.Customer.create({
			name: 'cus 1',
			address: '12 hnoar stree, anod',
		});
	} catch (error) {
		pinologger.error(error);
	}
}

sample();
