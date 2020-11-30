// function isLoggedIn(req, res, next) {
// 	if (req.isAuthenticated())
// 		return next();
// 	res.redirect('/signin');
// }

// middleware function to check for logged-in users
var sessionChecker = (req, res, next) => {
	if (req.session.user && req.cookies.user_sid) {
		res.redirect('/dashboard');
	} else {
		next();
	}
};

var loggedIn = (req, res, next) => {
	if (!req.session.user || !req.cookies.user_sid) {
		res.redirect('/login');
	} else {
		next();
	}
};

module.exports = { sessionChecker, loggedIn };
