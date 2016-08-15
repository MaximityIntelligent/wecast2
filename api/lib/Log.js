function Log (){

}

module.exports = Log;

Log.find = function (options, cb) {
	log.find(options).exec(function (err, logs) {
		if (err) {
			return cb(err);
		}
		return cb(null, logs);
	});
};

Log.findOne = function (options, cb) {
	log.findOne(options).exec(function (err, found) {
		if (err) {
			return cb(err);
		}
		return cb(null, found);
	});
};

Log.findGroup = function (options, cb) {
	Log.find(options, function (err, logs) {
		if (err) {
			return cb(err);
		}
	    var groupLogs = {};
	    logs.forEach(function (item, index, array) {
		    if (groupLogs[item.action] == undefined) {
		      groupLogs[item.action] = [item];
		    } else {
		      groupLogs[item.action].push(item);
		    }
	    });
	    return cb(null, groupLogs)
	});
};

Log.count = function (options, cb) {
	log.count(options).exec(function (err, count) {
		if (err) {
			return cb(err);
		}
		return cb(null, count);
	});
};

Log.create = function (options, cb) {
	options.date = new Date();
	log.create(options).exec(function (err, created) {
		if (err) {
			return cb(err);
		}
		return cb(null, created);
	});
};

Log.destroy = function (ad, cb) {
	log.destroy({ad: ad}).exec(function (err) {
		return cb(true);
	});
};