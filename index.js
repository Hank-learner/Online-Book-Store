require('dotenv').config({ path: './env/.env' });

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const pino = require('pino');
// var passport = require('passport');
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');

var sessionMiddleware = require('./middlewares/session');
// var exphbs = require('express-handlebars')
// app.set('views', './views')
// app.engine('hbs', exphbs({
// 	extname: '.hbs'
// }));
// app.set('view engine', '.hbs');

global.logger = pino({
	level: process.env.LOG_LEVEL || 'info',
	prettyPrint: process.env.ENV === 'DEV',
});

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(morgan('dev'));
app.use(cors());

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));

var sess = {
	key: 'user_sid',
	secret: 'keyboard cat',
	resave: true,
	saveUninitialized: true,
	cookie: {
		expires: 600000,
	},
};
if (process.env.ENV === 'PROD') {
	app.set('trust proxy', 1); // trust first proxy
	sess.cookie.secure = true; // serve secure cookies
}

app.use(cookieParser());
app.use(session(sess));

// This middleware will check if user's cookie is still saved in browser and user is not set, then automatically log the user out.
// This usually happens when you stop your express server after login, your cookie still remains saved in the browser.
app.use((req, res, next) => {
	if (req.cookies.user_sid && !req.session.user) {
		res.clearCookie('user_sid');
	}
	next();
});

// app.use(passport.initialize());
// app.use(passport.session());

//load passport strategies
// require('./passport/passportRegister.js')(passport, database.Seller);

// Routes
const extraRouter = require('./routers/router');
app.use('/', extraRouter);

app.get('/', (req, res) => {
	return res.redirect('/login');
});

const register = require('./routers/register');
app.use('/register', register);

const login = require('./routers/login');
app.use('/login', login);

app.get('/logout', (req, res) => {
	if (req.session.user && req.cookies.user_sid) {
		res.clearCookie('user_sid');
		return res.redirect('/');
	} else {
		return res.redirect('/login');
	}
	// req.session.destroy(function (err) {
	// 	if (err) {
	// 		logger.err(err);
	// 		return res.redirect('/dashoard');
	// 	} else {
	// 		return res.redirect('/');
	// 	}
	// });
});

// route for handling 404 requests(unavailable routes)
app.use((req, res, next) => {
	return res.status(404).render('error');
});

app.listen(process.env.SERVER_PORT, () => {
	logger.info(`Listening on port ${process.env.SERVER_PORT}`);
	logger.info(`Go to http://localhost:${process.env.SERVER_PORT}`);
});
