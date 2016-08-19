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
	    if (code == 'undefined' || ad == 'undefined' || url == 'undefined') {
	      return res.status(400).json({errMsg: "miss param"});
	    }
	    var emitter = new eventEmitter();
	    // step 1
	    Weixin.oauth2(code, function (err, result) {
	      if (err) {
	        emitter.emit('error', {errMsg: JSON.stringify(err)});
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
	        // // 1st
	        // User.sharedToUsers_c(eventResult.userInfo, ad, function(err, sharedToUsers){
	        //     emitter.emit('final', 'sharedToUsers', sharedToUsers);
	        // });
	        // 2nd
	        Config.openData(ad, function (err, configOne) {
	          if (err) {
	            emitter.emit('error', {errMsg: err});
	          } else {
	          	emitter.emit('final', 'config', configOne);
	            if (!eventResult.userInfo.subscribe) {
	              Weixin.subscribe(eventResult.ticket.access_token, eventResult.userInfo.openId, function (err, subscribe) {
	                if (subscribe) {
	                  eventResult.userInfo.subscribe = true;
	                  User.save(eventResult.userInfo, function (err, savedUser) {
	                    if (err) {
	                      emitter.emit('error', {errMsg: err});
	                    } else {
	                      emitter.emit('final', 'subscribe', true);
	                    }
	                    
	                  });
	                } else {
	                  emitter.emit('final', 'subscribe', false);
	                }
	              });
	              
	            } else {
	              emitter.emit('final', 'subscribe', true);
	            }
	          }
	          
	        });
	        // 3nd
	        User.todayLogin(eventResult.userInfo, function (err, todayLogin) {
	        	if (err) {
		            emitter.emit('error', {errMsg: err});
		        } else {
		        	emitter.emit('final', 'todayLogin', todayLogin);
	          	}
	        });
	      }
	    });

	    // step3
	    var finalEvents = {'userInfo': true, 'ticket': true, 'config': true, 'subscribe': true, 'todayLogin': true};
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
	        retResult.credit = finalResult.userInfo.credit;
	        retResult.redeemCredit = finalResult.userInfo.redeemCredit;
	        retResult.level = finalResult.userInfo.level;
	        retResult.nickname = finalResult.userInfo.nickname;
	        retResult.headimgurl = finalResult.userInfo.headimgurl;
	        retResult.phone = finalResult.userInfo.phone;
	        retResult.sex = finalResult.userInfo.sex;
	        retResult.validate = finalResult.userInfo.validate;
	        retResult.active = finalResult.userInfo.active;
	        retResult.loginDays = finalResult.userInfo.loginDays;
	        retResult.config = finalResult.config;
	        retResult.subscribe = finalResult.subscribe;
	        retResult.todayLogin = finalResult.todayLogin;
	        console.log(retResult);
	        return res.json(retResult);
	      }
	    });

	    emitter.once('error', function (err) {
	      console.log('error: ' + JSON.stringify(err));
	      return res.status(400).json(err);
	    });
	},
	redeemLogin: function (req, res) {
    var openId = req.param('openId');
    var ad = req.param('ad');
    User.auth(openId, ad, function (err, userOne) {
      if (!userOne) {
          return res.status(401).end();
      }
      
      Config.adInfo(ad, function (err, configOne) {
      	User.todayLogin(userOne, function (err, login) {
          
            var bonus = configOne.loginBonus || [];
            if (bonus.length == 0) {
            	return res.status(400).json({errCode: 0, errMsg: '商戶沒有設置登入奬勵。'});
            }
            if (!login) {
              User.yesterdayLogin(userOne, function (err, login) {

                var finalBonus;
                if (!login && configOne.loginBonusContinuity) {
                  finalBonus = bonus[0];
                  userOne.credit += bonus[0];
                  userOne.loginDays = 1;
                }
                else {
                  if (configOne.loginBonusCycle) {
                    finalBonus = bonus[Math.min(bonus.length - 1, userOne.loginDays)];
                  } else {
                    finalBonus = bonus[userOne.loginDays%bonus.length];
                  }
                  
                  userOne.credit += finalBonus;
                  userOne.gainCredit = (userOne.gainCredit || 0) + finalBonus;
                  userOne.loginDays = (userOne.loginDays || 0) + 1;
                }
                User.save(userOne, function (err, savedUser) {

                  if (err) {
                    return res.status(400).json({errCode: 0, "errMsg" : JSON.stringify(err)});
                  }
                  Log.create({action: 'login', openId: openId, ad: ad}, function(err){
                  	Log.create({action: 'gainCredit', openId: openId, ad: ad, detail: finalBonus}, function(err){
                    	return res.json({'loginBonus': bonus, loginDays: savedUser.loginDays, finalBonus: finalBonus});
                	});
                  });
                        
                }); 
              }); 
            } else {

              return res.status(400).json({errCode: 0, errMsg: '今日的奬勵已領取。'});
            }
          });
      });
    });
  },
  getLevelUpCredit: function (req, res) {
  	var openId = req.param('openId');
    var ad = req.param('ad');
    User.auth(openId, ad, function (err, userOne) {
      if (!userOne) {
          return res.status(401).end();
      }
      User.levelUpCredit(userOne, function (err, result) {
      	if (err) {
      		return res.status(400).json({errCode: 0, "errMsg" : JSON.stringify(err)});
      	}
      	return res.json({result: result});
      });
    });
  }
}