function Product (){

}

module.exports = Product;

Product.findAll = function (cb) {
	product.find().exec(function (err, products) {
		if (err) {
			return cb(err);
		}
		return cb(null, products);
	});
};

Product.create = function (options, cb) {
	product.create(options).exec(function (err, created) {
		if (err) {
			return cb(err);
		}
		return cb(null, created);
	})
};

Product.edit = function (options, cb) {
	product.update({pid: options.pid}, options).exec(function (err, edited) {
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

Product.remove = function (pid, cb) {
	product.findOne({pid: pid}).exec(function (err, productOne) {
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