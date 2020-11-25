require('dotenv').config({ path: '../env/.env' });

const pino = require('pino');
const pinologger = pino({
	level: process.env.LOG_LEVEL || 'info',
	prettyPrint: process.env.ENV === 'DEV',
});

const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
	process.env.DB_NAME,
	process.env.DB_USER,
	process.env.DB_PASS,
	{
		define: {
			freezeTableName: true,
		},
		host: process.env.DB_HOST,
		dialect:
			'mysql' /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */,
		logging: process.env.ENV === 'DEV' ? console.log : false,
	}
);

const Seller = sequelize.define(
	'sellers',
	{
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		contact: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	},
	{
		freezeTableName: true,
	}
);

const Customer = sequelize.define(
	'customers',
	{
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		address: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	},
	{
		freezeTableName: true,
	}
);

async function connection() {
	await sequelize.sync({ alter: true });
	pinologger.info('All models were synchronized successfully.');
}

module.exports = { Seller, Customer, connection };
