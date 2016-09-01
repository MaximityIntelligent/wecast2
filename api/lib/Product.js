function Product (){

}

module.exports = Product;

Product.findAll = function (options, cb) {
	product.find(options).exec(function (err, products) {
		if (err) {
			return cb(err);
		}
		return cb(null, products);
	});
};

Product.create = function (options, cb) {
	product.findOne({ad: options.ad, pid: options.pid}).exec(function (err, found) {
		if (err) {
			return cb(err);
		}
		if (found) {
			return cb({errMsg: 'dupes error'});
		}
		product.create(options).exec(function (err, created) {
			if (err) {
				return cb(err);
			}
			return cb(null, created);
		});
	});
	
};

Product.edit = function (options, cb) {
	product.update({ad: options.ad, pid: options.pid}, options).exec(function (err, edited) {
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

Product.remove = function (ad, pid, cb) {
	product.findOne({ad: ad, pid: pid}).exec(function (err, productOne) {
		if (err) {
			return cb(err);
		}
		if (!productOne) {
			return cb({errMsg: 'not found'});
		} else {
			productOne.deleted = true;
			productOne.save(function (err, saved) {
				if (err) {
					return cb(err);
				}
				return cb(null);
			})
		}
	});
}