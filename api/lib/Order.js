function Order (){

}

module.exports = Order;

Order.findAll = function (cb) {
	order.find().exec(function (err, orders) {
		if (err) {
			return cb(err);
		}
		return cb(null, orders);
	});
};

Order.edit = function (options, cb) {
	product.update({ad: options.ad, oid: options.oid}, options).exec(function (err, edited) {
		if (err) {
			return cb(err);
		}
		if (edited.length != 1) {
			return cb({errMsg: 'not found'});
		} else {
			return cb(null, edited[0]);
		}
	})
};

Order.remove = function (ad, oid, cb) {
	product.findOne({ad: ad, oid: oid}).exec(function (err, found) {
		if (err) {
			return cb(err);
		}
		if (!found) {
			return cb({errMsg: 'not found'});
		} else {
			found.deleted = true;
			found.save(function (err, saved) {
				if (err) {
					return cb(err);
				}
				return cb(null);
			})
		}
	});
};