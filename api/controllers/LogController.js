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
		var dateToStr = req.param('dateTo');
		var dateFromStr = req.param('dateFrom');
		dateFrom = moment(dateFromStr, "MM/DD/YYYY").startOf('day').toDate();
    dateTo = moment(dateToStr, "MM/DD/YYYY").endOf('day').toDate();
		log.findOne({createdAt: {'>=': dateFrom, '<': dateTo}}).exec(function(err, resultSet){
			res.json(resultsSet);
			return;
		});



	}
};
