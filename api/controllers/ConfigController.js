var Config = require('../lib/Config');
var Weixin = require('../lib/Weixin');
var LoginToken = require('../lib/LoginToken');
var Merchant = require('../lib/Merchant');

module.exports = {
	initLoginToken: function (req, res) {
		LoginToken.create(function (err, token) {
			if (err) {
				return res.status(400).end();
			}
			return res.json({token: token});
		})
			
	},
	checkScan: function (req, res) {
		var tokenId = req.param('tokenId');
		longCheckScan(tokenId, new Date(), function (err, token) {
			if (err) {
				return res.status(400).json(err);
			}
			return res.json({token: token});
		});
	},
	checkLogin: function (req, res) {
		var tokenId = req.param('tokenId');
		longCheckLogin(tokenId, new Date(), function (err, auth) {
			if (err) {
				return res.status(400).json(err);
			}
			return res.json({auth: auth});
		});
	},
	createConfig: function (req, res) {
		var ad = req.param('ad');
		var openId = req.param('openId');
		if (!ad) {
			return res.status(404).end();
		}
		if (ad == '' || ad == 'undefined') {
			return res.status(400).end();
		}
		Config.create(ad, function (err, configOne) {
			if (err) {
				return res.status(400).json(err);
			}
			if (!configOne) {
				return res.status(400).json({errMsg: 'duplicate error'});
			}
			Merchant.findOne(openId, function (err, merchantOne) {
				if (err) {
					return res.status(400).json(err);
				}
				if (!merchantOne) {
					return res.status(400).json(err);
				}
				var temp = merchantOne.ads || [];
				temp.push(ad);
				merchantOne.ads = temp;
				merchantOne.save(function (err, savedMerchant) {
					if (err) {
						return res.status(400).json(err);
					}
					return res.json(configOne);
				});
				
			})
			
		});
	},
	getConfigs: function (req, res) {
		var openId = req.param('openId');
		Merchant.findOne(openId, function (err, merchantOne) {
			if (err) {
				return res.status(400).json(err);
			}
			if (!merchantOne) {
				return res.status(404).end();
			}
			if (merchantOne.role == 'admin') {
				Config.findAll(function (err, configs) {
					if (err) {
						return res.status(400).json(err);
					}
					return res.json(configs);
				});
			} else {
				var options = {
					ad: {$in: merchantOne.ads}
				}
				Config.find(options, function (err, configs) {
					if (err) {
						return res.status(400).json(err);
					}
					return res.json(configs);
				});
			}
		});
		
	},
	getConfig: function (req, res) {
		var ad = req.param('ad');
		if (!ad) {
			return res.status(404).end();
		}
		if (ad == '' || ad == 'undefined') {
			return res.status(400).end();
		}
		Config.findOne(ad, function (err, configOne) {
			if (err) {
				return res.status(400).json(err);
			}
			if (!configOne) {
				return res.status(404).end();
			}
			return res.json(configOne);
		});
	},
	updateConfig: function (req, res) {
		var config = req.body;
		if (!config) {
			return res.status(404).end();
		}
		Config.update(config, function (err, configOne) {
			if (err) {
				return res.status(400).json(err);
			}
			return res.json(configOne);
		});
	},
	createPrize: function (req, res) {
		var ad = req.body.ad;
		var prize = req.body.prize;
		if (!ad || !vote) {
			return res.status(404).end();
		}
		Config.createPrize(ad, prize, function (err, prizeOne) {
			if (err) {
				return res.status(400).json(err);
			}
			return res.json(prizeOne);
		})
	},
	createVote: function (req, res) {
		var ad = req.body.ad;
		var vote = req.body.vote;
		if (!ad || !vote) {
			return res.status(404).end();
		}
		Config.createVote(ad, vote, function (err, voteOne) {
			if (err) {
				return res.status(400).json(err);
			}
			return res.json(voteOne);
		});
	},
	updateVoteResult: function (req, res) {
		var ad = req.body.ad;
		var vote = req.body.vote;
		if (!ad || !vote) {
			return res.status(404).end();
		}
		Config.updateVoteResult(ad, vote, function (err, voteResult) {
			if (err) {
				return res.status(400).json(err);
			}
			return res.json(voteResult);
		});
	},
	createOrEditLoginBonus: function (req, res) {
		var ad = req.body.ad;
		var index = req.body.index;
		var loginBonus = req.body.loginBonus;
		if (!ad || !loginBonus) {
			return res.status(404).end();
		}
		if (index == 'undefined') {
			index = null;
		}
		console.log(index);
		Config.createOrEditLoginBonus(ad, index, loginBonus, function (err, index, loginBonusOne) {
			if (err) {
				return res.status(400).json(err);
			}
			return res.json({index: index, loginBonus: loginBonusOne});
		})
	},
	deleteLoginBonus: function (req, res) {
		var ad = req.body.ad;
		var index = req.body.index;
		if (!ad || !index) {
			return res.status(404).end();
		}
		if (index) {
			Config.deleteLoginBonus(ad, index, function (err, index) {
				if (err) {
					return res.status(400).json(err);
				}
				if (!index) {
					return res.status(400).end();
				}
				return res.json(index);
			});
		}
	}
}

function longCheckScan(tokenId, startTime, cb) {
	var date = new Date();
	if (date-startTime > 60000) {
		console.log('end');
		return cb({errMsg: 'token expire'});
	} 
	LoginToken.checkScan(tokenId, function (err, token) {
		if (err) {
			console.log(err);
			setTimeout(function() { longCheckScan(tokenId, startTime, cb) }, 1000);
			return;
		}
		else if (!token) {
			setTimeout(function() { longCheckScan(tokenId, startTime, cb) }, 1000);
		}
		else {
			cb(null, token);
		}
	});
};

function longCheckLogin(tokenId, startTime, cb) {
	var date = new Date();
	if (date-startTime > 60000) {
		console.log('end');
		return cb({errMsg: 'token expire'});
	} 
	LoginToken.checkLogin(tokenId, function (err, auth) {
		if (err) {
			console.log(err);
			setTimeout(function() { longCheckLogin(tokenId, startTime, cb) }, 1000);
			return;
		}
		else if (auth == false) {
			setTimeout(function() { longCheckLogin(tokenId, startTime, cb) }, 1000);
		}
		else {
			cb(null, auth);
		}
	});
};