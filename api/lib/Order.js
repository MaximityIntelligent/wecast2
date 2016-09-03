function Order (){

}

module.exports = Order;

Order.findAll = function (cb) {
	order.find({deleted: false}).exec(function (err, orders) {
		if (err) {
			return cb(err);
		}
		return cb(null, orders);
	});
};

Order.create = function (options, cb) {
	var today = new Date();
	today.setHours(0, 0, 0, 0);
	var oid = today.getFullYear()*10000 + today.getMonth()*100 + today.getDate();
	order.count({createdAt: {'>=': today}}).exec(function (err, count) {
		if (err) {
			return cb(err);
		}
		oid = oid * 10000 + count;
		order.findOne({ad: options.ad, oid: oid}).exec(function (err, found) {
			if (err) {
				return cb(err);
			}
			if (found) {
				return cb({errMsg: 'oid error'});
			} else {
				order.create(options).exec(function (err, created) {
					if (err) {
						return cb(err);
					}
					return cb(null, created);
				});
			} 
		});
		
	})
	
}

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