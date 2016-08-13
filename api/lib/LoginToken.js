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
	loginToken.findOne({_id: tokenId}).exec(function (err, found) {
		if (err) {
			return cb(err);
		}
		if (!found) {
			return cb(null, null);
		}
		loginToken.openId = openId;
		loginToken.access_token = accessToken;
		loginToken.isScan = true;
		loginToken.save(function (err, saved) {
			if (err) {
				return cb(err);
			}
			return cb(null, saved);
		})
	})
}