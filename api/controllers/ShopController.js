var request = require('request');
var eventEmitter = require('events').EventEmitter;

var sha1 = require('sha1');
var User = require('../lib/User');
var Config = require('../lib/Config');
var LoginToken = require('../lib/LoginToken');
var Weixin = require('../lib/Weixin');
var WxToken = require('../lib/WxToken');
var Merchant = require('../lib/Merchant');
var Log = require('../lib/Log');
var crypto = require('crypto');
var Order = require('../lib/Order');

var randomString = function(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

module.exports = {
	init: function(req, res) { //首次進入會跑的流程
	    var code = req.param("code");
	    var ad = req.param("ad");
	    var url = req.param("url");
	    var sharedBy = req.param("sharedBy");
	    var retResult = {};
	    // if (code == 'undefined' || ad == 'undefined' || url == 'undefined') {
	    //   return res.status(400).json({errMsg: "miss param"});
	    // }
	    var emitter = new eventEmitter();
	    // step 1
	    Weixin.oauth2(code, function (err, result) {
	      if (err) {
	        //emitter.emit('error', {errMsg: JSON.stringify(err)});
	        var userInfo = {};
	        userInfo.openId = 'o5OVfwJhe_dGCYTtjFgnKgZWR5jc';
	        userInfo.ad = ad;
	        emitter.emit('userInfo', userInfo);
	      } else {
	        var userInfo = {};
	        userInfo.openId = result.openid;
	        userInfo.accessToken = result.access_token;
	        userInfo.refreshToken = result.refresh_token;
	        if (result.unionid) {
	          userInfo.unionId = result.unionid;
	        }
	        userInfo.ad = ad;
	        // Get UserInfo
	        if (result.scope == 'snsapi_userinfo') {
	          Weixin.userinfo(result.access_token, userInfo.openId, function (err, result) {
	            if (err) {
	              emitter.emit('error', {errMsg: JSON.stringify(err)});
	            } else {
	              if (result.nickname) {
	                userInfo.nickname = result.nickname;
	              }
	              if (result.sex) {
	                userInfo.sex = result.sex;
	              }
	              if (result.province) {
	                userInfo.province = result.province;
	              }
	              if (result.city) {
	                userInfo.city = result.city;
	              }
	              if (result.country) {
	                userInfo.country = result.country;
	              }
	              if (result.headimgurl) {
	                userInfo.headimgurl = result.headimgurl;
	              }
	              if (result.language) {
	                userInfo.language = result.language;
	              }
	              if (result.unionid) {
	                userInfo.unionId = result.unionid;
	              }
	              emitter.emit('userInfo', userInfo);
	            }
	          });

	        } else {
	          emitter.emit('userInfo', userInfo);
	        }
	        // Get UserInfo
	        
	      }
	    });

	    emitter.on('userInfo', function (userInfo) {
	        User.create(userInfo, function(err, userOne){
	          if(!userOne){
	            emitter.emit('error', {errMsg: 'User create fail'});
	          } else {
	          	User.shareAd_c(sharedBy, userOne.openId, ad, function(err){
	              if(err) {
	                emitter.emit('error', {errMsg: err});
	              } else {
	                emitter.emit('done', 'userInfo', userOne);
	              }
	            });
	    
	          }
	        });

	    });

	    WxToken.validToken(function (err, wxTokenOne) {
	      if (err) {
	        emitter.emit('error', {errMsg: err});
	      } else {
	        emitter.emit('done', 'ticket', wxTokenOne);
	      }
	    })

	    // step 2
	    var events = {'userInfo': true, 'ticket': true};
	    var eventResult = {};
	    emitter.on('done', function (event, result) {
	      eventResult[event] = result;
	      delete events[event];
	      if (Object.keys(events) == 0) {
	        emitter.emit('final', 'userInfo', eventResult.userInfo);
	        emitter.emit('final', 'ticket', eventResult.ticket);
	      }
	    });

	    // step3
	    var finalEvents = {'userInfo': true, 'ticket': true};
	    var finalResult = {};
	    emitter.on('final', function (event, result) {
	      finalResult[event] = result;
	      delete finalEvents[event];
	      // console.log(finalEvents);
	      if (Object.keys(finalEvents) == 0) {
	        var timestamp = Math.floor(Date.now() / 1000);
	        var noncestr = randomString(16);
	        var string1 = "jsapi_ticket="+finalResult.ticket.jsapi_ticket+"&noncestr="+noncestr+"&timestamp="+timestamp+"&url="+url;
	        var signature = sha1(string1);
	        retResult.openId = finalResult.userInfo.openId;
	        retResult.signature = signature;
	        retResult.timestamp = timestamp;
	        retResult.noncestr = noncestr;
	        retResult.ticket = finalResult.ticket.jsapi_ticket;
	        retResult.nickname = finalResult.userInfo.nickname;
	        retResult.headimgurl = finalResult.userInfo.headimgurl;
	        retResult.phone = finalResult.userInfo.phone;
	        retResult.cart = finalResult.userInfo.cart;
	        retResult.user = finalResult.userInfo;
	        console.log(retResult);
	        return res.json(retResult);
	      }
	    });

	    emitter.once('error', function (err) {
	      console.log('error: ' + JSON.stringify(err));
	      return res.status(400).json(err);
	    });
	},
	updateCart: function (req, res) {
		User.auth(req.body.openId, req.body.ad, function (err, userOne) {
			if (err) {
				return res.status(400).json(err);
			}
			if (!userOne) {
				return res.status(401).end();
			}
			userOne.cart = req.body.cart;
			User.save(userOne, function (err, savedUser) {
				if (err) {
					return res.status(400).json(err);
				}
				return res.json(savedUser.cart);
			})
		});
	},
	createOrder: function (req, res) {
		if (!req.body.openId || !req.body.ad || !req.body.order) {}
		User.auth(req.body.openId, req.body.ad, function (err, userOne) {
			if (err) {
				return res.status(400).json(err);
			}
			if (!userOne) {
				return res.status(401).end();
			}
			Order.create(req.body.order, function (err, created) {
				if (err) {
					return res.status(400).json(err);
				}
				if (userOne.address) {
					if (userOne.address.indexOf(req.body.order.address) == -1) {
						userOne.address.unshift(req.body.order.address);
					}
				} else {
					userOne.address = [req.body.order.address];
				}
				userOne.phone = req.body.order.phone
				userOne.cart = [];
				User.save(userOne, function (err, savedUser) {
					if (err) {
						return res.status(400).json(err);
					}
					return res.json(created);
				})
			})
			
		});
	}
}