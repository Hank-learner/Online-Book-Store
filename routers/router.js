const express = require('express');
const Router = express.Router();
const { Op } = require('sequelize');

var sessionMiddleware = require('../middlewares/session');
let db = require('../database/models/models');

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
			return res.render('dashboard', {
				isSeller: req.session.isSeller,
				books: books,
				stocks: stocks,
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
			let books = await db.Book.findAll();
			let itemsLength = books.length;
			let stocks = await db.Stock.findAll();
			return res.render('dashboard', {
				isSeller: req.session.isSeller,
				books: books,
				stocks: stocks,
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
	} catch (err) {
		logger.error(err);
		// return res.render('error');
	}
});

Router.post('/addStock', sessionMiddleware.loggedIn, async (req, res) => {
	try {
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
			action: 'addedBook',
		});
	} catch (err) {
		logger.error(err);
		// return res.render('error');
	}
});

// Router.get('/cart', sessionMiddleware.loggedIn, async (req, res) => {
// 	try {
// 		let items = await db.CustomerCart.findAll({
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

// Router.post('/cart', sessionMiddleware.loggedIn, async (req, res) => {
// 	try {
// 		let items = await db.CustomerCart.findAll({
// 			where: { customerID: req.session.Customer.id },
// 		});
// 		var priceToPay = 0;
// 		await items.forEach((item, index) => {
// 			// item.stock = await db.Stock.findOne({ where: { id: item.stockID } });
// 			item.totalPrice = item.quantity * item.stock.price;
// 			priceToPay += item.totalPrice;
// 		});

// 		return res.render('cart', {
// 			items: items,
// 			length: items.length,
// 		});
// 	} catch (error) {
// 		logger.error(error);
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
