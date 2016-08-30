var request = require('request');
var eventEmitter = require('events').EventEmitter;

var sha1 = require('sha1');
var User = require('../lib/User');
var Product = require('../lib/Product');

module.exports = {
	getProducts: function (req, res) {
		Product.findAll(function (err, products) {
			if (err) {
				return res.status(400).json(err);
			}
			return res.json(products);
		})
	},
	createProduct: function (req, res) {
		Product.create(req.body, function (err, created) {
			if (err) {
				return res.status(400).json(err);
			}
			return res.json(created);
		});
	},
	editProduct: function (req, res) {
		Product.edit(req.body, function (err, edited) {
			if (err) {
				return res.status(400).json(err);
			}
			return res.json(edited);
		});
	},
	removeProduct: function (req, res) {
		Product.remove(req.body.pid, function (err, removed) {
			if (err) {
				return res.status(400).json(err);
			}
			return res.status(204).end();
		});
	}
}