const express = require('express');
const Router = express.Router();
const { Op } = require('sequelize');

var sessionMiddleware = require('../middlewares/session');
let db = require('../database/models/models');

async function get_prod(stocks) {
	var stocksout = [];
	for (let stock of stocks) {
		stock.book = await db.Book.findOne({
			where: { id: stock.bookID },
		});
		stock.seller = await db.Seller.findOne({
			where: { id: stock.sellerID },
		});
		stock.sellerUser = await db.User.findOne({
			where: { id: stock.seller.userId },
		});
		stocksout.push(stock);
	}
	return stocksout;
}

async function get_cart(customerID) {
	var cartsout = [];
	let carts = await db.CustomerCart.findAll({
		where: { customerID: customerID, bought: false },
	});
	var price = 0;
	logger.info('cart leng' + carts.length);
	for (let cart of carts) {
		// logger.info('st id' + cart);
		cart.stock = await db.Stock.findOne({
			where: {
				id: cart.stockID,
				// quantity: { [Op.gt]: 0 },
			},
		});
		cart.stock.book = await db.Book.findOne({
			where: { id: cart.stock.bookID },
		});
		cart.stock.seller = await db.Seller.findOne({
			where: { id: cart.stock.sellerID },
		});
		cart.stock.sellerUser = await db.User.findOne({
			where: { id: cart.stock.seller.userId },
		});
		cart.customer = await db.Customer.findOne({
			where: { id: customerID },
		});
		price += cart.quantity * cart.stock.price;
		cartsout.push(cart);
	}
	logger.info('leght' + cartsout.length);
	return { cartsout: cartsout, price: price };
}

Router.get('/dashboard', sessionMiddleware.loggedIn, async (req, res) => {
	try {
		if (req.session.isSeller) {
			let books = await db.Book.findAll();
			let itemsLength = books.length;
			return res.render('dashboard', {
				isSeller: req.session.isSeller,
				books: books,
				booksLength: itemsLength,
				action: 'display',
			});
		} else {
			let books = await db.Book.findAll();
			let itemsLength = books.length;
			let stocks = await db.Stock.findAll({
				where: { quantity: { [Op.gt]: 0 } },
			});
			var stocksout = await get_prod(stocks);
			// logger.info('stock : ' + stocksout);
			return res.render('dashboard', {
				isSeller: req.session.isSeller,
				books: books,
				stocks: stocksout,
				length: itemsLength,
				action: 'display',
			});
		}
	} catch (err) {
		logger.error(err);
		// return res.render('error');
	}
});

Router.post('/dashboard', sessionMiddleware.loggedIn, async (req, res) => {
	try {
		if (req.session.isSeller) {
			let book = await db.Book.create({
				name: req.body.name,
				author: req.body.author,
				category: req.body.category,
				rating: req.body.rating,
			});
			let books = await db.Book.findAll();
			return res.render('dashboard', {
				isSeller: req.session.isSeller,
				addedbook: book,
				books: books,
				action: 'added book',
			});
		} else {
			await db.CustomerCart.create({
				customerID: req.session.Customer.id,
				quantity: parseInt(req.body.getQuantity),
				stockID: parseInt(req.body.stockID),
				bought: false,
			});
			await db.Stock.update(
				{
					quantity:
						parseInt(req.body.quantity) -
						parseInt(req.body.getQuantity),
				},
				{ where: { id: parseInt(req.body.stockID) } }
			);

			let books = await db.Book.findAll();
			let itemsLength = books.length;
			let stocks = await db.Stock.findAll({
				where: { quantity: { [Op.gt]: 0 } },
			});
			var stocksout = await get_prod(stocks);
			// logger.info('stock : ' + stocksout);
			return res.render('dashboard', {
				isSeller: req.session.isSeller,
				books: books,
				stocks: stocksout,
				length: itemsLength,
				action: 'added to cart',
			});
		}
	} catch (err) {
		logger.error(err);
		// return res.render('error');
	}
});

Router.get('/addStock', sessionMiddleware.loggedIn, async (req, res) => {
	try {
		if (req.session.isSeller) {
			let books = await db.Book.findAll();
			let itemsLength = books.length;
			let stocks = await db.Stock.findAll({
				where: { sellerID: req.session.Seller.id },
			});
			return res.render('addStock', {
				isSeller: req.session.isSeller,
				action: 'renderBooks',
				books: books,
				stocks: stocks,
				length: itemsLength,
			});
		} else {
			var cartsout = await get_cart(req.session.Customer.id);
			return res.render('addStock', {
				isSeller: req.session.isSeller,
				cartPrice: cartsout.price,
				carts: cartsout.cartsout,
				action: 'display',
			});
		}
	} catch (err) {
		logger.error(err);
		// return res.render('error');
	}
});

Router.post('/addStock', sessionMiddleware.loggedIn, async (req, res) => {
	try {
		if (req.session.isSeller) {
			let stock = await db.Stock.create({
				bookID: req.body.bookID,
				quantity: req.body.quantity,
				price: req.body.price,
				sellerID: req.session.Seller.id,
			});
			let books = await db.Book.findAll();
			let itemsLength = books.length;
			let stocks = await db.Stock.findAll({
				where: { sellerID: req.session.Seller.id },
			});
			return res.render('addStock', {
				books: books,
				isSeller: req.session.isSeller,
				stocks: stocks,
				length: itemsLength,
				addedstock: stock,
				action: 'addedStock',
			});
		} else {
			var cartsout = await get_cart(req.session.Customer.id);

			for (let cart of cartsout.cartsout) {
				let tran = await db.Transaction.create({
					sellerID: cart.stock.sellerID,
					amount: cart.quantity * cart.stock.price,
					customerID: req.session.Customer.id,
				});
				await db.BoughtHistory.create({
					customerID: req.session.Customer.id,
					quantity: cart.quantity,
					price: cart.quantity * cart.stock.price,
					sellerID: cart.stock.sellerID,
					bookID: cart.stock.bookID,
					transactionID: tran.dataValues.id,
					delivered: false,
				});
				await db.CustomerCart.update(
					{ bought: true },
					{ where: { id: parseInt(cart.id) } }
				);
			}

			cartsout = await get_cart(req.session.Customer.id);
			return res.render('addStock', {
				isSeller: req.session.isSeller,
				cartPrice: cartsout.price,
				carts: cartsout.cartsout,
				action: 'added price',
			});
		}
	} catch (err) {
		logger.error(err);
		// return res.render('error');
	}
});

// Router.post('/buy', sessionMiddleware.loggedIn, async (req, res) => {
// 	try {

// 	} catch (err) {
// 		logger.error(err);
// 		// return res.render('error');
// 	}
// });

// Router.get('/bought', sessionMiddleware.loggedIn, async (req, res) => {
// 	try {
// 		let items = await db.BoughtHistory.findAll({
// 			where: { customerID: req.session.Customer.id },
// 		});
// 		let itemsLength = items.length;
// 		return res.render('cart', {
// 			items: items,
// 			length: itemsLength,
// 		});
// 	} catch (error) {
// 		logger.error(error);
// 		// return res.render('error');
// 	}
// });

module.exports = Router;
