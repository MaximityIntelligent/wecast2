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
		var date = new Date();
		log.create({action: action, openId: openId, date: new Date()}).exec(function(){
			res.end();
			return;
		});
	},
	find: function(req, res){
		//var action = req.param('action');
		var dateTo = req.param('dateTo');
		var dateFrom = req.param('dateFrom');


	}
};
