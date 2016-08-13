function LoginToken (){

}

module.exports = LoginToken;

LoginToken.create = function (cb) {
	var expires_in = 120;
	var expireAt = new Date();
	expireAt = new Date(expireAt.getTime() + expires_in * 1000);
	loginToken.create({expires_in: expires_in, expireAt: expireAt}).exec(function (err, created) {
		if (err) {
			return cb(err);
		}
		return cb(null, created);
	});
};

LoginToken.scan = function (tokenId, openId, accessToken, cb) {
	loginToken.findOne({id: tokenId, isScan: false, expireAt: {$gte: new Date()}}).exec(function (err, found) {
		if (err) {
			return cb(err);
		}
		if (!found) {
			return cb(null, null);
		}
		found.openId = openId;
		found.access_token = accessToken;
		found.isScan = true;
		found.save(function (err, saved) {
			if (err) {
				return cb(err);
			}
			return cb(null, saved);
		});
	})
};

LoginToken.login = function (tokenId, cb) {
	loginToken.findOne({id: tokenId, isScan: true}).exec(function (err, found) {
		if (err) {
			return cb(err);
		}
		if (!found) {
			return cb(null, null);
		}
		found.isAuth = true;
		found.save(function (err, saved) {
			if (err) {
				return cb(err);
			}
			return cb(null, saved);
		})
	});
};

LoginToken.checkScan = function (tokenId, cb) {
	loginToken.findOne({id: tokenId, isScan: true}).exec(function (err, found) {
		if (err) {
			return cb(err);
		}
		if (!found) {
			return cb(null, false);
		}
		return cb(null, true);
	})
}

LoginToken.checkLogin = function (tokenId, cb) {
	loginToken.findOne({id: tokenId, isAuth: true}).exec(function (err, found) {
		if (err) {
			return cb(err);
		}
		if (!found) {
			return cb(null, false);
		}
		return cb(null, true);
	})
}