/**
 * LogController
 *
 * @description :: Server-side logic for managing logs
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var Log = require('../lib/Log');
var moment = require('moment');
var eventEmitter = require('events').EventEmitter;

module.exports = {
	log: function(req, res){
		var action = req.param('action');
		var openId = req.param('openId');
		var ad = req.param('ad');
		var detail = req.param('detail');
		Log.create({action: action, openId: openId, ad: ad, detail: detail}, function(err, results){
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
		var emitter = new eventEmitter();
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

		emitter.once('error', function (err) {
			return res.status(400).json(err);
		});

		var events = {'totalUser': true, 'offsetAccess': true, 'logAccess': true};
	    var eventResult = {};
	    emitter.on('done', function (event, result) {
	      eventResult[event] = result;
	      delete events[event];
	      if (Object.keys(events) == 0) {
	      	return res.json({access: eventResult.logAccess, offsetAccess:eventResult.offsetAccess, totalUser: eventResult.totalUser, action: action2});
	      }
	    });
	    // 1st
		User.count(userOption, function(err, totalUser) {
			if (err) {
				return emitter.emit('error', err);
			}
			return emitter.emit('done', 'totalUser', totalUser);
		});
		// 2nd
		var offsetOption = {};
		if(startOfMonthDate)
			offsetOption.date = {"<": startOfMonthDate};
		if(accessDateFrom)
			offsetOption.date = {"<": accessDateFrom};
		if (ad)
			offsetOption.ad = ad;
		if (action2) {
			offsetOption.action = action2;
		}
		var offsetAccess = {};
		Log.find({ where: offsetOption, select:['action', 'date']}, function(err, accessArr){
			var actionAccess = _.groupBy(accessArr, function(access){
				return access.action;
			});
			Object.keys(actionAccess).forEach(function (element, index, array) {
				offsetAccess[element] = actionAccess[element].length;
			});
			console.log(offsetAccess);
			return emitter.emit('done', 'offsetAccess', offsetAccess);
		});
		// 3rd
		var option = {};
		if(buttonAction=="accessMonth"){
			var year = req.param("year");
			var month = req.param("month");
			var startOfMonthStr = month+"/"+"01"+"/"+year;
			var startOfMonthDate = moment(startOfMonthStr, "MM/DD/YYYY").startOf('day').toDate();
			var endOfMonthDate = moment(startOfMonthStr, "MM/DD/YYYY").endOf('month').toDate();

			if(startOfMonthDate&&endOfMonthDate)
					option.date = {">=": startOfMonthDate, "<=": endOfMonthDate};
			if (ad)
				option.ad = ad;
			if (action2) {
				option.action = action2;
			}
		} else {
			var dateStr = req.param('date');
			var accessDateFrom = moment(dateStr).startOf('day').toDate();
			var accessDateTo = moment(dateStr).endOf('day').toDate();
			var option = {};
			option.date = {">=": accessDateFrom, "<=": accessDateTo};
			if (ad)
				option.ad = ad;
			if (action2) {
				option.action = action2;
			}
		}
		var logAccess = {};
		Log.find({ where: option, select:['action', 'date']}, function(err, accessArr) {
			
			var actionAccess = _.groupBy(accessArr, function(access){
				return access.action;
			});
			Object.keys(actionAccess).forEach(function (element, index, array) {
				var temp = _.groupBy(actionAccess[element], function(access){
					if (buttonAction=="accessMonth") {
						return access.date.getDate();
					} else {
						return moment(access.date).hour();
					}
					
				});
				var tempAction = {};
				Object.keys(temp).forEach(function (element, index, array) {
					tempAction[element] = temp[element].length;
				});
				logAccess[element] = tempAction;
			});
			return emitter.emit('done', 'logAccess', logAccess);
		});
			
		

	}
};
