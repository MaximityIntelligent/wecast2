var Config = require('../lib/Config');

module.exports = {
	createConfig: function (req, res) {
		var ad = req.param('ad');
		if (ad == '' || ad == 'undefined') {
			return res.status(400);
		}
		Config.create(ad, function (err, configOne) {
			if (err) {
				return res.status(400).json(err);
			}
			return res.json(configOne);
		});
	},
	getConfigs: function (req, res) {
		Config.findAll(function (err, configs) {
			if (err) {
				return res.status(400).json(err);
			}
			return res.json(configs);
		});
	},
	updateConfig: function (req, res) {
		var config = req.body;
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
		Config.updateVoteResult(ad, vote, function (err, voteResult) {
			if (err) {
				return res.status(400).json(err);
			}
			return res.json(voteResult);
		});
	}
}