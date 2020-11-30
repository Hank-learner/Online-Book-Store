require('dotenv').config({ path: '../env/.env' });

var bCrypt = require('bcrypt-nodejs');
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

const User = sequelize.define(
	'users',
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
		password: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		type: {
			type: Sequelize.STRING,
			allowNull: false,
		},
	},
	{
		freezeTableName: true,
		hooks: {
			beforeCreate: (user) => {
				const salt = bCrypt.genSaltSync();
				user.password = bCrypt.hashSync(user.password, salt);
			},
		},
	}
);

User.prototype.validPassword = function (password) {
	return bCrypt.compareSync(password, this.password);
};

const Seller = sequelize.define(
	'sellers',
	{
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
		},
		contact: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		userId: {
			type: DataTypes.INTEGER,
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
		contact: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		userId: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
	},
	{
		freezeTableName: true,
	}
);

const Book = sequelize.define(
	'books',
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
		author: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		category: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		rating: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	},
	{
		freezeTableName: true,
	}
);

const Stock = sequelize.define(
	'stocks',
	{
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
		},
		bookID: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		quantity: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		price: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		sellerID: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
	},
	{
		freezeTableName: true,
	}
);

const Transaction = sequelize.define(
	'transactions',
	{
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
		},
		amount: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		customerID: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		sellerID: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
	},
	{
		freezeTableName: true,
	}
);

const BoughtHistory = sequelize.define(
	'bought_histories',
	{
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
		},
		customerID: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		quantity: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		price: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		sellerID: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		bookID: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		transactionID: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
	},
	{
		freezeTableName: true,
	}
);

const CustomerCart = sequelize.define(
	'shopping_cart',
	{
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
		},
		customerID: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		quantity: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		stockID: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
	},
	{
		freezeTableName: true,
	}
);

// type: {
// 	type: DataTypes.INTEGER,
// 		references: {
// 		model: "certificate_types",
// 			key: "id",
//       },
// },
async function connection() {
	await sequelize.sync({ alter: true });
	pinologger.info('All models were synchronized successfully.');
}

module.exports = {
	User,
	Seller,
	Customer,
	Book,
	Stock,
	Transaction,
	BoughtHistory,
	connection,
	CustomerCart,
};
