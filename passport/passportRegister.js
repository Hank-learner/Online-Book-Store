var bCrypt = require('bcrypt-nodejs');

module.exports = function (passport, seller) {
	var Seller = seller;
	var LocalStrategy = require('passport-local').Strategy;

	passport.use(
		'local-signup',
		new LocalStrategy(
			{
				usernameField: 'username',
				passwordField: 'password',
				passReqToCallback: true, // allows us to pass back the entire request to the callback
			},

			function (req, username, password, done) {
				logger.info('in');
				var generateHash = function (password) {
					return bCrypt.hashSync(
						password,
						bCrypt.genSaltSync(8),
						null
					);
				};

				Seller.findOne({
					where: {
						username: username,
					},
				})
					.then(function (seller) {
						logger.info('in1');
						if (seller) {
							return done(null, false, {
								message: 'That email is already taken',
							});
						} else {
							// var userPassword = generateHash(password);
							var userPassword = password;

							var data = {
								password: userPassword,
								username: req.body.username,
								contact: req.body.contact,
							};
							logger.info('in2');
							Seller.create(data).then(function (
								newUser,
								created
							) {
								if (!newUser) {
									logger.info('created', created);
									return done(null, false);
								}
								if (newUser) {
									logger.info('created', created);
									return done(null, newUser);
								}
							});
						}
					})
					.catch(function (err) {
						console.log('Error:', err);

						return done(null, false, {
							message: 'Something went wrong with your loginin',
						});
					});
			}
		)
	);
};
