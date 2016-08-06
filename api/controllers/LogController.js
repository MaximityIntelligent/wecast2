/**
 * LogController
 *
 * @description :: Server-side logic for managing logs
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var moment = require('moment');
module.exports = {
	log: function(req, res){
		var action = req.param('action');
		var openId = req.param('openId');
		var ad = req.param('ad');
		var detail = req.param('detail');
		var date = new Date();
		log.create({action: action, openId: openId, date: new Date(), ad: ad, detail: detail}).exec(function(err, results){
			//res.json(results);
			res.end();
			return;
		});
	},
	access: function (req, res) {
		var buttonAction = req.param('buttonAction');
		var ad = req.param('ad');
		var action = req.param('action');
		var accumulated = req.param('accumulated');

		var action2 = [];
		Object.keys(action).forEach(function (element, index, array) {
			if (action[element] == true) {
				action2.push(element);
			}
		});
		var userOption = {};
		if (ad) {
			userOption.ad = ad;
		}
		user.count(userOption).exec(function(err, users){
			if (err) {
				console.log(err);
			}
			if(buttonAction=="accessMonth"){
				var year = req.param("year");
				var month = req.param("month");
				var startOfMonthStr = month+"/"+"01"+"/"+year;
				var startOfMonthDate = moment(startOfMonthStr, "MM/DD/YYYY").startOf('day').toDate();
				var endOfMonthDate = moment(startOfMonthStr, "MM/DD/YYYY").endOf('month').toDate();
				var option = {};
				if(startOfMonthDate&&endOfMonthDate)
						option.date = {">=": startOfMonthDate, "<=": endOfMonthDate};
				if (ad)
					option.ad = ad;
				if (action2) {
					option.action = action2;
				}
				console.log(option);
				var daysAccess = {};
				log.find({ where: option, select:['action', 'date']}).exec(function(err, accessArr){
					
					var actionAccess = _.groupBy(accessArr, function(access){
						return access.action;
					});
					Object.keys(actionAccess).forEach(function (element, index, array) {
						var temp = _.groupBy(actionAccess[element], function(access){
							return access.date.getDate();
						});
						var tempAction = {};
						Object.keys(temp).forEach(function (element, index, array) {
							tempAction[element] = temp[element].length;
						});
						daysAccess[element] = tempAction;
						

					});

					var offsetOption = {};
					if(startOfMonthDate)
						offsetOption.date = {"<": startOfMonthDate};
					if (ad)
						offsetOption.ad = ad;
					if (action2) {
						offsetOption.action = action2;
					}
					var offsetAccess = {};
					log.find({ where: offsetOption, select:['action', 'date']}).exec(function(err, accessArr){
						var actionAccess = _.groupBy(accessArr, function(access){
							return access.action;
						});
						Object.keys(actionAccess).forEach(function (element, index, array) {
							offsetAccess[element] = actionAccess[element].length;
						});
						console.log(offsetAccess);
						return res.json({access: daysAccess, offsetAccess:offsetAccess, totalUser: users, action: action2});
					});

					

				});
			} else if (buttonAction == 'accessDate') {
				var dateStr = req.param('date');
				console.log(dateStr);
				var accessDateFrom = moment(dateStr).startOf('day').toDate();
				var accessDateTo = moment(dateStr).endOf('day').toDate();
				var option = {};
				option.date = {">=": accessDateFrom, "<=": accessDateTo};
				if (ad)
					option.ad = ad;
				if (action2) {
					option.action = action2;
				}
				// console.log(option);
				var hoursAccess = {};
				log.find({ where: option, select:['action', 'date']}).exec(function(err, accessArr){
					var actionAccess = _.groupBy(accessArr, function(access){
						return access.action;
					});
					Object.keys(actionAccess).forEach(function (element, index, array) {
						var temp = _.groupBy(actionAccess[element], function(access){
							return moment(access.date).hour();
						});
						var tempAction = {};
						Object.keys(temp).forEach(function (element, index, array) {
							tempAction[element] = temp[element].length;
						});
						hoursAccess[element] = tempAction;
						

					});
					var offsetOption = {};
					if(accessDateFrom)
						offsetOption.date = {"<": accessDateFrom};
					if (ad)
						offsetOption.ad = ad;
					if (action2) {
						offsetOption.action = action2;
					}
					var offsetAccess = {};
					log.find({ where: offsetOption, select:['action', 'date']}).exec(function(err, accessArr){
						var actionAccess = _.groupBy(accessArr, function(access){
							return access.action;
						});
						Object.keys(actionAccess).forEach(function (element, index, array) {
							offsetAccess[element] = actionAccess[element].length;
						});
						console.log(offsetAccess);
						return res.json({access: hoursAccess, offsetAccess:offsetAccess, totalUser: users, action: action2});
					});
					
				});
			}
		});

	}
};
