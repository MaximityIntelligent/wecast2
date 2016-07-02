/**
 * LogController
 *
 * @description :: Server-side logic for managing logs
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */


module.exports = {
	log: function(req, res){
		var action = req.param('action');
		var openId = req.param('openId');
		var ad = req.param('ad');
		var date = new Date();
		log.create({action: action, openId: openId, date: new Date(), ad: ad}).exec(function(err, results){
			//res.json(results);
			res.end();
			return;
		});
	}
};
