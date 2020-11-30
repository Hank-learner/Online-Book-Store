const express = require('express');
const loginRouter = express.Router();

// var passport = require('passport');

var session = require('../middlewares/session');
const database = require('../database/models/models.js');
// require('../passport/passportLogin.js')(passport, database.Seller);

loginRouter.get('/', session.sessionChecker, async (req, res) => {
	try {
		return res.render('login', {
			test: 'test',
		});
	} catch (err) {
		logger.error(err);
		return res.render('error');
	}
});

loginRouter.post('/', session.sessionChecker, async (req, res) => {
	database.User.findOne({ where: { name: req.body.username } })
		.then(function (user) {
			if (!user) {
				return res.render('login', {
					state: 'incorrect credentials',
				});
			} else if (!user.validPassword(req.body.password)) {
				return res.render('login', {
					state: 'incorrect credentials',
				});
			} else {
				logger.info(user.dataValues);
				if (user.dataValues.type == 'seller') {
					database.Seller.findOne({
						where: { userId: user.dataValues.id },
					})
						.then(function (seller) {
							req.session.user = user.dataValues;
							req.session.Seller = seller.dataValues;
							req.session.isSeller = 1;
							return res.redirect('/dashboard');
						})
						.catch((error) => {
							logger.error(error);
							return res.render('login', {
								state: 'server error',
							});
						});
				} else if (user.dataValues.type == 'customer') {
					database.Customer.findOne({
						where: { userId: user.dataValues.id },
					})
						.then(function (customer) {
							req.session.user = user.dataValues;
							req.session.Customer = customer.dataValues;
							req.session.isSeller = 0;
							return res.redirect('/dashboard');
						})
						.catch((error) => {
							logger.error(error);
							return res.render('login', {
								state: 'server error',
							});
						});
				} else {
					logger.error('unable to login');
					return res.render('login', {
						state: 'incorrect credentials for user',
					});
				}
			}
		})
		.catch((error) => {
			logger.error(error);
			return res.render('login', {
				state: 'server error',
			});
		});
});
// loginRouter.post(
// 	'/',
// 	() => {
// 		logger.info('in');
// 	},
// 	passport.authenticate('local-signin', {
// 		successRedirect: '/dashboard',
// 		failureRedirect: '/login',
// 	})
// );

module.exports = loginRouter;
