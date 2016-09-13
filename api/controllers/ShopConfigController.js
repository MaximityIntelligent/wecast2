var request = require('request');
var eventEmitter = require('events').EventEmitter;

var sha1 = require('sha1');
var User = require('../lib/User');
var Product = require('../lib/Product');
var Order = require('../lib/Order');

module.exports = {
	getProducts: function (req, res) {
		Product.findAll(req.body, function (err, products) {
			if (err) {
				return res.status(400).json(err);
			}
			return res.json(products);
		});
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
		Product.remove(req.body.ad, req.body.pid, function (err, removed) {
			if (err) {
				return res.status(400).json(err);
			}
			return res.status(204).end();
		});
	},
	getOrders: function (req, res) {
		Order.findAll(function (err, orders) {
			if (err) {
				return res.status(400).json(err);
			}
			return res.json(orders);
		});
	},
	getNotDone: function (req, res) {
		Order.find({ where: {done: false, ad: req.body.ad}, sort: 'createdAt DESC' },function (err, orders) {
			if (err) {
				return res.status(400).json(err);
			}
			return res.json(orders);
		});
	},
	editOrder: function (req, res) {
		Order.edit(req.body, function (err, edited) {
			if (err) {
				return res.status(400).json(err);
			}
			return res.json(edited);
		});
	},
	removeOrder: function (req, res) {
		Order.remove(req.body.order, req.body.remark, function (err, removed) {
			if (err) {
				return res.status(400).json(err);
			}
			return res.json(removed);
		});
	},
	nextStepOrder: function (req, res) {
		Order.nextStep(req.body.order, req.body.remark, function (err, updated) {
			if (err) {
				return res.status(400).json(err);
			}
			return res.json(updated);
		})
	},
	prevStepOrder: function (req, res) {
		Order.prevStep(req.body.order, req.body.remark, function (err, updated) {
			if (err) {
				return res.status(400).json(err);
			}
			return res.json(updated);
		})
	},
	annualOrder: function (req, res) {
		var start = new Date(req.body.year, 0 , 1);
		var end = new Date(req.body.year, 11 , 31, 23, 59, 59, 999);
		Order.find({where: {createdAt: {$gte: start, $lte:end}}}, function (err, orders) {
			if (err) {
				return res.status(400).json(err);
			}
			var groupBy = _.groupBy(orders, function(order){
				return order.createdAt.getMonth();
			});
			var temp = {};
			Object.keys(groupBy).forEach(function (element, index, array) {
				temp[element] = {};
				temp[element].count = groupBy[element].length;
				temp[element].sum = groupBy[element].reduce(function (previousValue, currentValue, currentIndex, array) {
					var totalAmount = 0;
				    array[currentIndex].list.forEach(function (item, index, array) {
				      totalAmount += item.item.specification[item.spec].price * item.value;
				    });
				    return previousValue + totalAmount;
				}, 0);
			});
			var annual = [];
			for (var i = 0; i < 12; i++) {
				annual[i] = temp[i] || {sum: 0, count:0};
				annual[i].title = i;
			}
			return res.json(annual);
		});
	},
	monthlyOrder: function (req, res) {
		var start = new Date(parseInt(req.body.year), parseInt(req.body.month), 1);
		var end = new Date(parseInt(req.body.year), parseInt(req.body.month)+1, 0, 23, 59, 59, 999);
		console.log(start);
		console.log(end);
		Order.find({where: {createdAt: {$gte: start, $lte:end}}}, function (err, orders) {
			if (err) {
				return res.status(400).json(err);
			}
			var groupBy = _.groupBy(orders, function(order){
				return order.createdAt.getDate();
			});
			var temp = {};
			Object.keys(groupBy).forEach(function (element, index, array) {
				temp[element] = {};
				temp[element].count = groupBy[element].length;
				temp[element].sum = groupBy[element].reduce(function (previousValue, currentValue, currentIndex, array) {
					var totalAmount = 0;
				    array[currentIndex].list.forEach(function (item, index, array) {
				      totalAmount += item.item.specification[item.spec].price * item.value;
				    });
				    return previousValue + totalAmount;
				}, 0);
			});
			var annual = [];
			for (var i = 0; i < 31; i++) {
				annual[i] = temp[i] || {sum: 0, count:0};
				annual[i].title = i;
			}
			return res.json(annual);
		});
	}
}