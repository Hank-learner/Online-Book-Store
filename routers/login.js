const express = require('express');
const loginRouter = express.Router();

const database = require('../database/models/models.js');

loginRouter.get('/', async (req, res) => {
	try {
		const x = await database.Seller.findAll();
		logger.info(x);
		return res.render('index', {
			test: 'test',
		});
	} catch (err) {
		logger.error(err);
	}
});

module.exports = loginRouter;
