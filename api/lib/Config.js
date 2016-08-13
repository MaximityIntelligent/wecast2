function Config (){

}

module.exports = Config;

Config.create = function (ad, cb) {
	config.findOne({ad: ad}).exec(function (err, configOne) {
		if (err) {
			return cb(err);
		} 
		if (!configOne) {
			config.create({ad: ad}).exec(function (err, configNew) {
				if (err) {
					return cb(err);
				}
				return cb(null, configNew);
			});
		} else {
			return cb(null, null);
		}
	});
};

Config.findAll = function (cb) {
	config.find().exec(function (err, configs) {
		if (err) {
			return cb(err);
		}
		return cb(null, configs);
	});
};

Config.findOne = function (ad, cb) {
	config.findOne({ad: ad}).exec(function (err, configOne) {
		if (err) {
			return cb(err);
		} 
		if (!configOne) {
			return cb(null, null);
		} else {
			return cb(null, configOne);
		}
	});
}

Config.update = function (configOne, cb) {
	config.update({ad: configOne.ad}, configOne).exec(function (err, configUpdated) {
		
		if (err) {
			return cb(err);
		}
		if (configUpdated.length == 0) {
			return cb({errMsg: 'no record'});
		}
		return cb(null, configUpdated.shift());
		
	});
	
};

Config.createPrize = function (ad, prize, cb) {
	config.findOne({ad: ad}).exec(function (err, configOne) {
		if (err) {
			return cb(err);
		}
		if (configOne.prizesInfo[prize]) {
			return cb({errMsg: 'duplicate error'});
		}
		var prizeObj = {
            'credit': 1,
            'name': prize+'_name',
            'amount': 100000
        }
        configOne.prizesInfo[prize] = prizeObj;
        configOne.save(function (err) {
        	if (err) {
				return cb(err);
			}
			return cb(null, prizeObj);
        });
		
		
	});
};

Config.createVote = function (ad, vote, cb) {
	config.findOne({ad: ad}).exec(function (err, configOne) {
		if (err) {
			return cb(err);
		}
		if (configOne.votesInfo.votes.indexOf(vote) != -1) {
			return cb({errMsg: 'duplicate error'});
		}
        configOne.votesInfo.votes.push(vote);
        configOne.save(function (err) {
        	if (err) {
				return cb(err);
			}
			return cb(null, vote);
        });
		
		
	});
}

Config.updateVoteResult = function (ad, vote, cb) {
	config.findOne({ad: ad}).exec(function (err, configOne) {
		if (err) {
			return cb(err);
		}
		if (!vote) {
			configOne.votesInfo.voteResult = undefined;
			configOne.save(function (err) {
	        	if (err) {
					return cb(err);
				}
				return cb(null, undefined);
	        });
		} else {
			if (configOne.votesInfo.votes.indexOf(vote) == -1) {
				return cb({errMsg: 'not found error'});
			}
	        configOne.votesInfo.voteResult = vote;
	        configOne.save(function (err) {
	        	if (err) {
					return cb(err);
				}
				return cb(null, vote);
	        });
		}
		
		
		
	});
};

Config.createOrEditLoginBonus = function (ad, index, loginBonus, cb) {
	config.findOne({ad: ad}).exec(function (err, configOne) {
		if (err) {
			return cb(err);
		}
		if (configOne) {
			if (index) {
				configOne.loginBonus[index] = loginBonus;
			} else {
				configOne.loginBonus.push(loginBonus);
			}
			configOne.save(function (err) {
				if (err) {
					return cb(err);
				}
				return cb(null, index, loginBonus);
			});
			
		}
	});
};

Config.deleteLoginBonus = function (ad, index, cb) {
	config.findOne({ad: ad}).exec(function (err, configOne) {
		if (err) {
			return cb(err);
		}
		if (configOne) {
			if (index >= 0 && index < configOne.loginBonus.length) {
				configOne.loginBonus.splice(index, 1);		
				configOne.save(function (err) {
					if (err) {
						return cb(err);
					}
					return cb(null, index);
				});
			} else {
				return cb(null, null);
			}
			
			
		}
	});
};

Config.adInfo = function (ad, cb) {
	config.findOne({ad: ad}).exec(function (err, configOne) {
		if (err) {
			return cb(err, {});
		}
		if (!configOne) {
			return cb(null, {});
		} else {
			return cb(null, configOne);
		}
	})
};