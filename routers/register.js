const express = require('express');
const registerRouter = express.Router();

// var passport = require('passport');

var session = require('../middlewares/session');
const database = require('../database/models/models.js');
// require('../passport/passportRegister.js')(passport, database.Seller);

registerRouter.get('/', session.sessionChecker, async (req, res) => {
	try {
		return res.render('register', {
			test: 'test',
		});
	} catch (err) {
		logger.error(err);
		return res.render('error');
	}
});

registerRouter.post('/', session.sessionChecker, async (req, res) => {
	database.User.create({
		name: req.body.username,
		password: req.body.password,
		type: req.body.type,
	})
		.then((user) => {
			if (req.body.type == 'seller') {
				database.Seller.create({
					contact: req.body.contact,
					userId: user.dataValues.id,
				})
					.then((seller) => {
						req.session.user = user.dataValues;
						req.session.Seller = seller.dataValues;
						req.session.isSeller = 1;
						return res.redirect('/dashboard');
					})
					.catch((error) => {
						logger.error(error);
						return res.render('register', {
							state: 'server error',
						});
					});
			} else if (req.body.type == 'customer') {
				database.Customer.create({
					contact: req.body.contact,
					userId: user.dataValues.id,
				})
					.then((customer) => {
						req.session.user = user.dataValues;
						req.session.Customer = customer.dataValues;
						req.session.isSeller = 0;
						return res.redirect('/dashboard');
					})
					.catch((error) => {
						logger.error(error);
						return res.render('register', {
							state: 'server error',
						});
					});
			} else {
				logger.error('user not registered');
				return res.render('register', {
					state: 'invalid user creds',
				});
			}
		})
		.catch((error) => {
			logger.error(error);
			return res.render('register', {
				state: 'server error',
			});
		});
});

// registerRouter.post(
// 	'/',
// 	() => {
// 		logger.info('in');
// 	},
// 	passport.authenticate('local-signup', {
// 		successRedirect: '/dashboard',
// 		failureRedirect: '/register',
// 	})
// );

module.exports = registerRouter;

// seller instance

// dataValues: {
// 	"id": 3,
// 		"name": "seller 3",
// 			"contact": "test contact da ambi",
// 				"password": "$2a$10$/aLYRyVYA.CMNfM8qn9ouuBzW5zlrYtV.Sz8S/KZ9PXoIJqV24taG",
// 					"updatedAt": "2020-11-27T18:27:25.825Z",
// 						"createdAt": "2020-11-27T18:27:25.825Z"
// }
// _previousDataValues: {
// 	"name": "seller 3",
// 		"contact": "test contact da ambi",
// 			"password": "$2a$10$/aLYRyVYA.CMNfM8qn9ouuBzW5zlrYtV.Sz8S/KZ9PXoIJqV24taG",
// 				"id": 3,
// 					"createdAt": "2020-11-27T18:27:25.825Z",
// 						"updatedAt": "2020-11-27T18:27:25.825Z"
// }
// _changed: { }
// _options: {
// 	"isNewRecord": true,
// 		"_schema": null,
// 			"_schemaDelimiter": ""
// }
// isNewRecord: false
