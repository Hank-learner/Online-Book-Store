require('dotenv').config({ path: './env/.env' });

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const pino = require('pino');

const login = require('./routers/login');

global.logger = pino({
	level: process.env.LOG_LEVEL || 'info',
	prettyPrint: process.env.ENV === 'DEV',
});

const app = express();

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));

app.use(
	require('express-session')({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
	})
);
app.use(morgan('dev'));
app.use(cors());

app.use('/login', login);

app.get('/', (req, res) => {
	res.redirect('/login');
	// res.send('Hello World!');
});

app.listen(process.env.SERVER_PORT, () => {
	logger.info(`Listening on port ${process.env.SERVER_PORT}`);
	logger.info(`Go to http://localhost:${process.env.SERVER_PORT}`);
});
