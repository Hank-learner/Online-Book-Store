var bCrypt = require('bcrypt-nodejs');

module.exports = function (passport, seller) {
	var Seller = seller;
	var LocalStrategy = require('passport-local').Strategy;

	passport.use(
		'local-signin',
		new LocalStrategy(
			{
				usernameField: 'username',
				passwordField: 'password',
				passReqToCallback: true, // allows us to pass back the entire request to the callback
			},

			function (req, username, password, done) {
				logger.info('in');
				var isValidPassword = function (userpass, password) {
					// return bCrypt.compareSync(password, userpass);
					return password == userpass;
				};

				Seller.findOne({
					where: {
						username: username,
					},
				})
					.then(function (seller) {
						logger.info('in1');
						if (!seller) {
							return done(null, false, {
								message: 'Username does not exist',
							});
						}

						if (!isValidPassword(seller.password, password)) {
							return done(null, false, {
								message: 'Incorrect password.',
							});
						}
						logger.info('in2');
						var userinfo = seller.get();
						return done(null, userinfo);
					})
					.catch(function (err) {
						console.log('Error:', err);

						return done(null, false, {
							message: 'Something went wrong with your Signin',
						});
					});
			}
		)
	);
};
