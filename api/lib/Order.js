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

Order.find = function (options, cb) {
	options.where.deleted = false;
	order.find(options).exec(function (err, orders) {
		if (err) {
			return cb(err);
		}
		return cb(null, orders);
	});
};

Order.create = function (options, cb) {
	var today = new Date();
	today.setHours(0, 0, 0, 0);
	var oid = today.getFullYear()*10000 + (today.getMonth()+1)*100 + today.getDate();
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
				options.oid = oid;
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
	order.update({ad: options.ad, oid: options.oid}, options).exec(function (err, edited) {
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

Order.remove = function (options, remark, cb) {
	order.findOne({ad: options.ad, oid: options.oid}).exec(function (err, found) {
		if (err) {
			return cb(err);
		}
		if (!found) {
			return cb({errMsg: 'not found'});
		} else {
			found.deleted = true;
			var record = found.record || [];
			record.push({
				action: 'deleted',
				remark: remark,
				date: new Date()
			});
			found.record = record;
			found.save(function (err, saved) {
				if (err) {
					return cb(err);
				}
				return cb(null);
			});
		}
	});
};

Order.nextStep = function (options, remark, cb) {
	order.findOne({ad: options.ad, oid: options.oid}).exec(function (err, found) {
		if (err) {
			return cb(err);
		}
		if (!found) {
			return cb({errMsg: 'not found'});
		} else {
			
			var flow = ['pending', 'ready', 'shipping', 'arrived'];
			var index = flow.indexOf(found.shipping);
			index = Math.min(flow.length-1, index+1);
			found.shipping = flow[index];
			var record = found.record || [];
			record.push({
				nextStep: true,
				action: found.shipping,
				remark: remark,
				date: new Date()
			});
			found.record = record;
			found.save(function (err, saved) {
				if (err) {
					return cb(err);
				}
				return cb(null, saved);
			});
		}
	})
};

Order.prevStep = function (options, remark, cb) {
	order.findOne({ad: options.ad, oid: options.oid}).exec(function (err, found) {
		if (err) {
			return cb(err);
		}
		if (!found) {
			return cb({errMsg: 'not found'});
		} else {
			var flow = ['pending', 'ready', 'shipping', 'arrived'];
			var index = flow.indexOf(found.shipping);
			index = Math.max(0, index-1);
			found.shipping = flow[index];
			var record = found.record || [];
			record.push({
				nextStep: false,
				action: found.shipping,
				remark: remark,
				date: new Date()
			});
			found.record = record;
			found.save(function (err, saved) {
				if (err) {
					return cb(err);
				}
				return cb(null, saved);
			});
		}
	})
};

Order.done = function (options, cb) {
	order.findOne({ad: options.ad, oid: options.oid}).exec(function (err, found) {
		if (err) {
			return cb(err);
		}
		if (!found) {
			return cb({errMsg: 'not found'});
		} else {
			if (options.shipping == 'arrived') {
				found.done = true;
				found.save(function (err, saved) {
					if (err) {
						return cb(err);
					}
					return cb(null, saved);
				});
			} else {
				return cb({errMsg: 'shipping not arrived'});
			}
		}
	});
}