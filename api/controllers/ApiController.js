/**
 * ApiController
 *
 * @description :: Server-side logic for managing apis
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var requestSync = require('sync-request');
var request = require('request');
var eventEmitter = require('events').EventEmitter;
var config = require('../../config/event-config');
var sha1 = require('sha1');
var User = require('../lib/User');
var Config = require('../lib/Config');
var Weixin = require('../lib/Weixin');
var crypto = require('crypto');
// Weixin Setting
var appid = 'wxbb0b299e260ac47f';
var secret = 'e253fefab4788f5cdcbc14df76cbf9ca';
//
var randomString = function(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

var getVoteResult = function (ad, cb) {
    Config.adInfo(ad, function (err, configOne) {
      var voteInfo = configOne.votesInfo || {};
      var votes = voteInfo.votes || [];
      var resultVotes = votes.map(function (vote) {
        return 'gameResult_'+vote;
      });
      log.findOne({action: {$in: resultVotes}, ad: ad}).exec(function (err, logOne) {
        if (err) {
          return cb(null);
        }
        if (!logOne) {
          return cb(null);
        }
        var temp = logOne.action.split('_');
        if (temp.length != 2) { return cb(null);}
        return cb(votesInfo.voteResult || temp[temp.length-1]);
        
      });
    });
    
};

var getVoteRecord = function (ad, cb) {
  Config.adInfo(ad, function (err, configOne) {
    var voteInfo = configOne.votesInfo || {};
    var votes = voteInfo.votes || [];
    var resultVotes = {};
    user.find({where: {ad:ad, vote: {$in: votes}}, select:['vote']}).exec(function (err, users) {
      var groupBy = {};
      users.forEach(function (item, index, array) {
        if (groupBy[item.vote] == undefined) {
          groupBy[item.vote] = [item];
        } else {
          groupBy[item.vote].push(item);
        }
      });

      votes.forEach(function (item, index, array) {
        if (groupBy[item] != undefined) {
          resultVotes[item] = groupBy[item].length;
        } else {
          resultVotes[item] = 0;
        }
      });
      return cb(resultVotes);
    });
  });
  
};

module.exports = {
	init_c: function(req, res){ //首次進入會跑的流程
    var code = req.param("code");
    var sharedBy = req.param("sharedBy");
    var ad = req.param("ad");
    var url = req.param("url");
    var retResult = {};
    var resp;
    var result;
    console.log(typeof code);
    if (code == 'undefined' || sharedBy == 'undefined') {
      return res.status(400).json({errMsg: "miss param"});
    }
    var emitter = new eventEmitter();
    // step 1
    request.get('https://api.weixin.qq.com/sns/oauth2/access_token?appid='+appid+'&secret='+secret+'&code='+code+'&grant_type=authorization_code', function (err, res, result) {
      result = JSON.parse(result);
      // console.log(result);
      if (result.errcode >= 40000 && result.errcode < 60000) {
        console.log('step1-A');
        emitter.emit('error', {errMsg: JSON.stringify(result)});
      } else {
        console.log('step1-B');
        var accessToken = result.access_token;
        var userInfo = {};
        var openId = result.openid;
        userInfo.openId = openId;
        if (result.unionid) {
          userInfo.unionId = result.unionid;
        }
        userInfo.ad = ad;
        if (sharedBy != "wecast") {
          userInfo.parent = sharedBy;
        }
        // Get UserInfo
        if (result.scope == 'snsapi_userinfo') {

          request.get('https://api.weixin.qq.com/sns/userinfo?access_token='+accessToken+'&openid='+openId+'&lang=en', function (err, res, result) {
            result = JSON.parse(result);
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
          // console.log(sharedBy+openId+ad);
            User.shareAd_c(sharedBy, userOne.openId, ad, function(err){
              if(err) {
                console.log({shareAd_c_errMsg: err});
              }
            });
            emitter.emit('done', 'userInfo', userOne);
          }
        });

    });

    var now = new Date();
    wxToken.findOne({expireAt: {'>': now}}).sort({ createdAt: 'desc' }).exec(function (err, wxTokenOne) {
      if (!wxTokenOne) {
          //console.log('-----no token-----');
          request.get('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+appid+'&secret='+secret, function (err, res, token) {
            token = JSON.parse(token);
            request.get('https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token='+token.access_token+'&type=jsapi', function (err, res, ticket) {
              ticket = JSON.parse(ticket);
              if (ticket.errmsg == 'ok') {
                var expireAt = new Date();
                expireAt = new Date(expireAt.getTime() + (ticket.expires_in - 60 * 60) * 1000);
                wxToken.create({access_token: token.access_token, expires_in: ticket.expires_in, jsapi_ticket: ticket.ticket, expireAt: expireAt}).exec(function (err, createdToken) {
                  // body...
                  console.log('------new token----: ');
                  console.log(createdToken);
                  emitter.emit('done', 'ticket', createdToken);
                });
              } else {
                emitter.emit('error', {errMsg: 'get ticket fail'});
              }
            });
          });
      } else {
        // appAccessToken = wxTokenOne.access_token;
        // jsapiTicket = wxTokenOne.jsapi_ticket;
        emitter.emit('done', 'ticket', wxTokenOne);
        //console.log('------old token----');
        //console.log(wxTokenOne);
        
      }
    });

    // step 2
    var events = {'userInfo': true, 'ticket': true};
    var eventResult = {};
    emitter.on('done', function (event, result) {
      eventResult[event] = result;
      delete events[event];
      if (Object.keys(events) == 0) {
        emitter.emit('final', 'userInfo', eventResult.userInfo);
        emitter.emit('final', 'ticket', eventResult.ticket);
        // 1st
        User.sharedToUsers_c(eventResult.userInfo, ad, function(err, sharedToUsers){
            emitter.emit('final', 'sharedToUsers', sharedToUsers);
        });
        
        Config.adInfo(ad, function (err, configOne) {
          // 2nd
          if (!eventResult.userInfo.subscribe) {
            request.get('https://api.weixin.qq.com/cgi-bin/user/info?access_token='+eventResult.ticket.access_token+'&openid='+eventResult.userInfo.openId, function (err, res, info) {
              info = JSON.parse(info);
              if (info.subscribe == 1) {
                eventResult.userInfo.subscribe = true;
                eventResult.userInfo.save(function (err, savedUser) {
                  emitter.emit('final', 'subscribe', true);
                });
              } else {
                emitter.emit('final', 'subscribe', false);
              }
            });
            
          } else {
            emitter.emit('final', 'subscribe', true);
          }
          // 3rd
          var userPrize = {};
          var prizeInfo = configOne.prizesInfo || {};
          var prizeList = Object.keys(prizeInfo);
          var redeemPrizeList = prizeList.map(function (item) {
             return 'redeem_'+item;
          });
          var pickPrizeList = prizeList.map(function (item) {
             return 'pick_'+item;
          });
          log.find({openId:eventResult.userInfo.openId, ad: ad, action: {$in:redeemPrizeList.concat(pickPrizeList)}}).exec(function (err, logs) {
            var groupPrizes = {};
            logs.forEach(function (item, index, array) {
              if (groupPrizes[item.action] == undefined) {
                groupPrizes[item.action] = [item];
              } else { 
                groupPrizes[item.action].push(item);
              }
            });

            prizeList.forEach(function (item, index, array) {
              if (groupPrizes['redeem_'+item] != undefined) {
                userPrize[item] = groupPrizes['redeem_'+item].length;
                if (groupPrizes['pick_'+item] != undefined) {
                  userPrize[item] -= groupPrizes['pick_'+item].length;
                }
              } else {
                userPrize[item] = 0;
              }
            });

            emitter.emit('final', 'userPrize', userPrize);

          });
          
        });
      }
    });

    // step3
    var finalEvents = {'userInfo': true, 'ticket': true, 'sharedToUsers': true, 'subscribe': true, 'userPrize': true};
    var finalResult = {};
    emitter.on('final', function (event, result) {
      finalResult[event] = result;
      delete finalEvents[event];
      console.log(finalEvents);
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
        retResult.userVote = finalResult.userInfo.vote;
        retResult.isRedeemVote = finalResult.userInfo.isRedeemVote;
        retResult.sharedToUsers = finalResult.sharedToUsers;
        retResult.subscribe = finalResult.subscribe;
        retResult.userPrize = finalResult.userPrize;
        console.log(retResult);
        return res.json(retResult);
      }
    });

    emitter.once('error', function (err) {
      console.log('error: ' + JSON.stringify(err));
      return res.status(400).json(err);
    });
    // resp = requestSync('GET','https://api.weixin.qq.com/sns/oauth2/access_token?appid='+appid+'&secret='+secret+'&code='+code+'&grant_type=authorization_code');
    //     result = JSON.parse(resp.getBody());  //得到USER的AccessToken from weixin
    //     console.log(result);
    //     var accessToken = result.access_token;
    //     var userInfo = {};
    //     var openId = result.openid;
    //     // if (result.errcode == 40029) {
    //     //   openId = 'ocLOPwlFiCCTPeSXLYTg7ZLLLAww';
    //     // }
    //     // Get UserInfo
    //     if (result.scope == 'snsapi_userinfo') {

    //       var userInfoResp = requestSync('GET','https://api.weixin.qq.com/sns/userinfo?access_token='+accessToken+'&openid='+openId+'&lang=en');
    //       var userInfoResult = JSON.parse(userInfoResp.getBody());
    //       if (userInfoResult.nickname) {
    //         userInfo.nickname = userInfoResult.nickname;
    //       }
    //       if (userInfoResult.sex) {
    //         userInfo.sex = userInfoResult.sex;
    //       }
    //       if (userInfoResult.province) {
    //         userInfo.province = userInfoResult.province;
    //       }
    //       if (userInfoResult.city) {
    //         userInfo.city = userInfoResult.city;
    //       }
    //       if (userInfoResult.country) {
    //         userInfo.country = userInfoResult.country;
    //       }
    //       if (userInfoResult.headimgurl) {
    //         userInfo.headimgurl = userInfoResult.headimgurl;
    //       }
    //       if (userInfoResult.language) {
    //         userInfo.language = userInfoResult.language;
    //       }
    //       if (userInfoResult.unionid) {
    //         userInfo.unionId = userInfoResult.unionid;
    //       }
    //     }
    //     // Get UserInfo
    //     userInfo.openId = openId;
    //     if (result.unionid) {
    //       userInfo.unionId = result.unionid;
    //     }
    //     userInfo.ad = ad;
    //     if (sharedBy != "wecast") {
    //       userInfo.parent = sharedBy;
    //     }
    //     User.create(userInfo, function(err, userOne){
    //       if(err){
    //         res.status(500).json({errMsg: 'User create fail'});
    //         return;
    //       }
    //       credit = userOne.credit;
    //       if(!credit){
    //         credit = 0;
    //       }
    //       // console.log(sharedBy+openId+ad);
    //       User.shareAd_c(sharedBy, openId, ad, function(err){
    //         if(err) {
    //           console.log({shareAd_c_errMsg: err});
    //         }
    //       });
          // User.sharedToUsers_c(userOne, ad, function(err, sharedToUsers){
          //   var shareCount = sharedToUsers.length;
          //   var appAccessToken;
          //   var jsapiTicket;
          //   var wait = true;
          //   var now = new Date();
          //   var ONE_HOUR = 60 * 60 * 1000;
          //   var oneHourAgo = new Date(now.getTime() - ONE_HOUR);
          //   //console.log(oneHourAgo);
          //   wxToken.findOne({expireAt: {'>': now}}).sort({ createdAt: 'desc' }).exec(function (err, wxTokenOne) {
          //     if (!wxTokenOne) {
          //         //console.log('-----no token-----');
          //         var resp = requestSync('GET', 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+appid+'&secret='+secret);
          //         result = JSON.parse(resp.getBody());
          //         //console.log(result);
          //         appAccessToken = result.access_token;

          //         req.session.appAccessToken = appAccessToken;
          //         resp = requestSync('GET', 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token='+appAccessToken+'&type=jsapi');
          //           result = JSON.parse(resp.getBody());
          //           if (result.errmsg == 'ok') {
          //             var expireAt = new Date();
          //             expireAt = new Date(expireAt.getTime() + (result.expires_in - 60 * 60) * 1000);
          //             wxToken.create({access_token: appAccessToken, expires_in: result.expires_in, jsapi_ticket: result.ticket, expireAt: expireAt}).exec(function (err, createdToken) {
          //               // body...
          //               console.log('------new token----: '+oneHourAgo);
          //               console.log(createdToken);
                        
          //             });
          //           }
          //           jsapiTicket = result.ticket;
          //     } else {
          //       appAccessToken = wxTokenOne.access_token;
          //       jsapiTicket = wxTokenOne.jsapi_ticket;
          //       //console.log('------old token----');
          //       //console.log(wxTokenOne);
                
          //     }
              
              // if (!userOne.subscribe) {
              //   var subscribeResp = requestSync('GET', 'https://api.weixin.qq.com/cgi-bin/user/info?access_token='+appAccessToken+'&openid='+userOne.openId);
              //   var subscribeResult = JSON.parse(subscribeResp.getBody());
              //   if (subscribeResult.subscribe == 1) {
              //     var bonus = config.adInfo(ad).subscribeBonus || 0;
              //     if (bonus > 0) {
              //       userOne.credit += bonus;
              //       userOne.subscribe = true;
              //       retResult.subscribeBonus = bonus;
              //       userOne.save(function (err, savedUser) {
              //         // body...
              //         console.log("subscribe bounce");
              //       });
              //     }
              //   }
              // }


              // appAccessToken = result.access_token;
              // req.session.appAccessToken = appAccessToken;
              
              // var timestamp = Math.floor(Date.now() / 1000);
              // var noncestr = randomString(16);
              // var string1 = "jsapi_ticket="+jsapiTicket+"&noncestr="+noncestr+"&timestamp="+timestamp+"&url="+url;
              // var signature = sha1(string1);
              // retResult.accessToken = accessToken;
              // retResult.openId = openId;
              // retResult.shareCount = shareCount;
              // retResult.drawChance = userOne.drawChance;
              // retResult.signature = signature;
              // retResult.timestamp = timestamp;
              // retResult.noncestr = noncestr;
              // retResult.ticket = jsapiTicket;
              // retResult.credit = userOne.credit;
              // retResult.userVote = userOne.vote;
              // retResult.isRedeemVote = userOne.isRedeemVote;
              // retResult.sharedToUsers = sharedToUsers;
              // retResult.subscribe = userOne.subscribe;
              // var userPrize = {};
              // var prizeInfo = config.adInfo(ad).prizesInfo || {};
              // var prizeList = Object.keys(prizeInfo);
              // var redeemPrizeList = prizeList.map(function (item) {
              //    return 'redeem_'+item;
              // })
              // var pickPrizeList = prizeList.map(function (item) {
              //    return 'pick_'+item;
              // })
              // log.find({openId:openId, ad: ad, action: {$in:redeemPrizeList.concat(pickPrizeList)}}).exec(function (err, logs) {
              //   var groupPrizes = {};
              //   logs.forEach(function (item, index, array) {
              //     if (groupPrizes[item.action] == undefined) {
              //       groupPrizes[item.action] = [item];
              //     } else { 
              //       groupPrizes[item.action].push(item);
              //     }
              //   });

              //   prizeList.forEach(function (item, index, array) {
              //     if (groupPrizes['redeem_'+item] != undefined) {
              //       userPrize[item] = groupPrizes['redeem_'+item].length;
              //       if (groupPrizes['pick_'+item] != undefined) {
              //         userPrize[item] -= groupPrizes['pick_'+item].length;
              //       }
              //     } else {
              //       userPrize[item] = 0;
              //     }
              //   });

              //   retResult.userPrize = userPrize;
              //   console.log(retResult);
              //   res.json(retResult);
              //   return;
              // });
              
        //     });
            
              
              
        //   });
        

        // });

	},
  probability : function(req, res) {
    var openId = req.param("openId");
    var ad = req.param("ad");
    Config.adInfo(ad, function (err, configOne) {
      var prizeInfo = configOne.prizesInfo;
      if (prizeInfo == null) {
        return res.status(400).json({errCode: 0, "errMsg" : "沒有此活動。"});
      }
      user.findOne({openId: openId, ad: ad}).exec(function (err, userOne) {
          if (!userOne) {
              return res.status(401).end();
          }
          if (userOne.credit < 1) {
            return res.status(400).json({errCode: 0, "errMsg" : "抽奬機會已用完。"});
          }

          var prizeList = Object.keys(prizeInfo);
          if (prizeList.length == 0) {
              res.status(400);
              return res.json();
          }
          var probability = prizeList.map(function (prize) {
            return prizeInfo[prize].probability || 0;
          });
          var total = 0;
          for (var i = probability.length - 1; i >= 0; i--) {
            total += probability[i];
          }

          var prize = 'none';
          var rand = Math.floor((Math.random() * total));
          // console.log(rand);
          for (var i = 0; i <= probability.length - 1; i++) {
            if (rand < probability[i]) {
                prize = prizeList[i];
                break;
            } else {
                rand -= probability[i];
            }
          }
          console.log(prize);
          var prizeAmount = prizeInfo[prize].amount || 100000;
          log.count({action:'redeem_'+prize, ad: ad}).exec(function (err, redeems) {
            if (redeems >= prizeAmount) {
              prize = 'none';
              console.log("month");
            }
            var startOfWeek = new Date();
            startOfWeek.setHours(0,0,0,0);
            startOfWeek = new Date(startOfWeek.getTime()- 86400*1000*startOfWeek.getDay());
            var prizeWeekAmount = prizeInfo[prize].weekAmount || prizeInfo[prize].amount || 100000;
            log.count({action:'redeem_'+prize, ad: ad, date: {'>=' : startOfWeek}}).exec(function (err, weekRedeems) {
              if (weekRedeems >= prizeWeekAmount) {
                prize = 'none';
                console.log("week");
              }
              userOne.credit -= 1;
              userOne.save(function (err) {
                log.create({action: 'redeem_'+prize, openId: userOne.openId, date: new Date(), ad: ad}).exec(function(err, results){

                });
                
                return res.json({credit: userOne.credit, prize: prize});
              });
            });
          });
                
      });
    })
    
  },
  redeem_c: function(req, res){
    var verificationCode = req.param('verificationCode');
    var openId = req.param("user") || req.param("openId");
    var prize = req.param("prize");
    var ad = req.param("ad");
    Config.adInfo(ad, function (err, configOne) {
      if (configOne.prizesInfo==null || configOne.prizesInfo[prize] == null) {
        res.status(400);
        res.json({errCode: 0, errMsg: '沒有此奬品。'});
        return;
      }
      var prizeInfo = configOne.prizesInfo[prize];
      user.findOne({openId: openId, ad: ad}).exec(function(err, userOne){
        if(!userOne) return res.status(401).end();
        
          var credit = userOne.credit;
          prizeCode = prizeInfo.code || "";
          if(verificationCode==prizeCode){
            
              var prizeCredit = prizeInfo.credit || 1;
              var prizeAmount = prizeInfo.amount || 100000;
              log.find({action:'redeem_'+prize, ad: ad}).exec(function (err, logs) {
                 if (logs.length < prizeAmount) {
                    if(credit<prizeCredit){
                      return res.status(400).json({errCode: 1, errMsg: '暫時無法兌換，請集齊'+prizeCredit+'個印花'});
                      
                    } else{
                      userOne.credit = userOne.credit - prizeCredit;
                      userOne.save(function(err, savedUser){
                        log.create({action: 'redeem_'+prize, openId: userOne.openId, date: new Date(), ad: ad}).exec(function(err, results){
                          log.create({action: 'pick_'+prize, openId: userOne.openId, date: new Date(), ad: ad}).exec(function(err, results){
                            res.json({credit: savedUser.credit, prize: prize});
                            return;
                          });
                        });
                        
                      });
                    }
                 } else {
                    //console.log('Out of amount');
                    return res.status(400).json({errCode: 0, errMsg: '奬品已全部換領完畢。'});
                    
                 }
              });
            
          } else {
            return res.status(400).json({errCode: 0, errMsg: 'SORRY  領獎碼有誤'});
            
          }

      });
    });
    

  },
  updateCredit: function(req, res){
    var ad = req.param('ad');
    var secret = req.param('secret');
    if (secret == 'kitkit!@#$') {
      user.update({ad: ad}, {credit: 100}).exec(function(err){
        return res.end();
      });
    } else {
        return res.status(400).end();
    }
  },
  clickCount: function(req, res){
		var name = req.param('clickCountName');
		ClickCount.findOne({name: name}).exec(function(err, clickCountOne){
			if(!clickCountOne){
				ClickCount.create({name: name, clickCount: 1}).exec(function(){
					res.end();
					return;
				});

			}else{
				clickCountOne.clickCount = clickCountOne.clickCount + 1;
				clickCountOne.save(function(){
					res.end();
					return;
				})
			}

		});
	},
  getCredit: function (req, res) {
    var openId = req.param('openId');
    var ad = req.param('ad');
    user.findOne({openId: openId, ad: ad}).exec(function (err, userOne) {
        if (!userOne) {
            return res.status(401).end();
        }
        return res.json({credit: userOne.credit});
    });
  },
  getPrizeRemain: function (req, res) {
      var openId = req.param('openId');
      var ad = req.param('ad');
      user.findOne({openId: openId, ad: ad}).exec(function (err, userOne) {
        if (!userOne) {
            return res.status(401).end();
        }
        Config.adInfo(ad, function (err, configOne) {
          var prizeInfo = configOne.prizesInfo;
          var prizeList = Object.keys(prizeInfo);
          if (prizeList.length == 0) {
              return res.json({prizeRemain: {}});
          }
          var redeemPrizeList = prizeList.map(function (item) {
              return 'redeem_'+item;
          });
          // var prizeAmount = prizeAmountAll[ad];
          var prizeRemain = {};
          log.find({action: {$in: redeemPrizeList}, ad:ad}).exec(function (err, logs) {
              var groupLogs = {};
              logs.forEach(function (item, index, array) {
                if (groupLogs[item.action] == undefined) {
                  groupLogs[item.action] = [item];
                } else {
                  groupLogs[item.action].push(item);
                }
              });

              prizeList.forEach(function (item, index, array) {
                if (groupLogs['redeem_'+item] != undefined) {
                  prizeRemain[item] = prizeInfo[item].amount - groupLogs['redeem_'+item].length;
                } else {
                  prizeRemain[item] = prizeInfo[item].amount;
                }
                
              });

              return res.json({prizeRemain: prizeRemain});
          });
        });
        
      });
      

  },

  luckyDraw: function (req, res) {
    var openId = req.param('openId');
    var ad = req.param('ad');
    user.findOne({openId: openId, ad: ad}).exec(function (err, userOne) {
        if (!userOne) {
            return res.status(401).end();
        }
        var startOfDay = new Date();
        startOfDay.setHours(0,0,0,0);
        log.find({action: 'luckyDraw', openId: userOne.openId, date: {$gte: startOfDay}, ad: ad}).exec(function (err, logs) {
          
           if (logs.length < 1) {
              log.create({action: 'luckyDraw', openId: userOne.openId, date: new Date(), ad: ad}).exec(function(err){

                  var prizeArray = [0, 1, 2, 5];
                  var probability = [10, 50, 30, 10];
                  var total = 0;
                  for (var i = probability.length - 1; i >= 0; i--) {
                    total += probability[i];
                  }

                  var prize = 0;
                  var rand = Math.floor((Math.random() * total));
                  for (var i = 0; i <= probability.length - 1; i++) {
                    if (rand < probability[i]) {
                        prize = i;
                        userOne.credit += prizeArray[prize];
                        userOne.save(function (err) {
                          
                        });
                        break;
                    } else {
                        rand -= probability[i];
                    }
                  }
                  
                  return res.json({prize: prizeArray[prize], currentCredit:userOne.credit});
              });  
           } else {
              return res.status(400).end();
           }
        });
        
    });
    
  },
  vote: function (req, res) {
    var openId = req.param('openId');
    var ad = req.param('ad');
    var userVote = req.param('userVote');
    Config.adInfo(ad, function (err, configOne) {
      var voteInfo = configOne.votesInfo;
      if (voteInfo == undefined) {
        return res.status(400).json({errCode: 0, errMsg:'沒有投票活動。'});
      }
      var votes = voteInfo.votes || [];
      if (votes.indexOf(userVote) == -1){
        return res.status(400).end();
      }
      var now = new Date();
      var exp = voteInfo.voteExp || now;
      //console.log(exp);
      if (now.getTime() > exp.getTime()) {
        return res.status(400).json({errCode: 0, errMsg:'投票時限已過了。'});
      }
      user.findOne({openId: openId, ad: ad}).exec(function (err, userOne) {
          if (!userOne) {
              return res.status(401).end();
          }
          if (userVote) {
            userOne.vote = userVote;
            userOne.save(function (err, savedUser) {
              log.create({action: 'vote', openId: savedUser.openId, date: new Date(), ad: ad}).exec(function(err, results){

              });

              getVoteRecord(ad, function (result) {
                return res.json({userVote: savedUser.vote, votes: result});
              });
              
            });
          } else {
             return res.status(400).end();
          }
      });
    })
    
  },
  redeemVote: function (req, res) {
    var openId = req.param('openId');
    var ad = req.param('ad');
    Config.adInfo(ad, function (err, configOne) {
      var voteInfo = configOne.votesInfo;
      if (voteInfo == undefined) {
        return res.status(400).json({errCode: 0, errMsg:'沒有投票活動。'});
      }
      var now = new Date();
      var exp = voteInfo.redeemExp || now;
      if (now.getTime() > exp.getTime()) {
        return res.status(400).json({errCode:0, errMsg: '領奬時限已過'});
      }
      user.findOne({openId: openId, ad: ad}).exec(function (err, userOne) {
          if (!userOne) {
              return res.status(401).end();
          }
          if (userOne.isRedeemVote) { 
            return res.status(400).json({errCode:0, errMsg: '您已經成功領奬。'});
          }
          getVoteResult(ad, function (result) {
            if (!result) {
              return res.status(400).json({errCode:0, errMsg: '比賽結果還沒出來。'});
            } else {
              if (result == userOne.vote) {
                userOne.credit = userOne.credit + voteInfo.bonus;
                userOne.isRedeemVote = true;
                userOne.save(function (err, savedUser) {
                  log.create({action: 'redeem_vote', openId: savedUser.openId, date: new Date(), ad: ad}).exec(function(err, results){
                    return res.json({credit: savedUser.credit, isRedeemVote: userOne.isRedeemVote});
                  });
                  
                });
              } else {
                return res.status(400).json({errCode:0, errMsg: '抱歉，您猜不中呢。'});
              }
            }
          });
          
      });
    })
    
  },
  redeemVoteAll: function (req, res) {
    var openId = req.param('openId');
    var ad = req.param('ad');
    var secret = req.param('secret');
    Config.adInfo(ad, function (err, configOne) {
      var voteInfo = configOne.votesInfo;
      if (voteInfo == undefined) {
        return res.status(400).json({errCode: 0, errMsg:'沒有投票活動。'});
      }
      if (secret == 'kitkit!@#$') {
        user.findOne({openId: openId, ad: ad}).exec(function (err, userOne) {
          if (!userOne) {
              return res.status(401).end();
          }
          getVoteResult(ad, function (result) {
            if (!result) {
              return res.status(400).end();
            } else {
              user.find({ad:ad, vote: result, isRedeemVote: false}).exec(function (err, users) {
              if (users.length > 0) {
                var count = users.length;
                users.forEach(function (item, index) {
                  if (item.isRedeemVote == false) {
                    item.credit = item.credit + voteInfo.bonus;
                    item.isRedeemVote = true;
                    item.save(function (err, savedUser) {
                      count = count - 1;
                      if (count == 0) {
                        return res.status(200).end();
                      }
                    });
                  }
                  
                });
              } else {
                return res.status(204).end();
              }
              
            });
            }
          });

        });
      } else {
        return res.status(400).end();
      }
    })
    
  },
  getGameResult: function (req, res) {
    var openId = req.param('openId');
    var ad = req.param('ad');
    user.findOne({openId: openId, ad: ad}).exec(function (err, userOne) {
        if (!userOne) {
            return res.status(401).end();
        }
        getVoteResult(ad, function (result) {
          if (!result) {
            return res.status(400).end();
          } else {
            return res.json({gameResult: result});
          }
        });
        
    });
  },  
  getVotes: function (req, res) {
    var openId = req.param('openId');
    var ad = req.param('ad');

    user.findOne({openId: openId, ad: ad}).exec(function (err, userOne) {
        if (!userOne) {
            return res.status(401).end();
        }
        getVoteRecord(ad, function (result) {
          return res.json(result);
        });
    });
  },
  getMainUpdate: function (req, res) {
    var openId = req.param('openId');
    var ad = req.param('ad');
    //getVotes
    user.findOne({openId: openId, ad: ad}).exec(function (err, userOne) {
        if (!userOne) {
            return res.status(401).end();
        }
        var emitter = new eventEmitter();
        var events = {'votes': true, 'gameResult': true};
        var results = {};
        results.credit = userOne.credit;
        getVoteRecord(ad, function (record) {
            emitter.emit('done', 'votes', record);
        });
        getVoteResult(ad, function (result) {
            emitter.emit('done', 'gameResult', result);  
        });
        emitter.on('done', function (event, result) {
          results[event] = result;
          delete events[event];
          if (Object.keys(events).length == 0) {
            return res.json(results);
          }
        });
    });
  },
  redeemSubscribe: function (req, res) {
    var openId = req.param('openId');
    var ad = req.param('ad');
    user.findOne({openId: openId, ad: ad}).exec(function (err, userOne) {
      if (!userOne) {
          return res.status(401).end();
      }
      if (userOne.subscribe && !userOne.isRedeemSubscribe) {
        Config.adInfo(ad, function (err, configOne) {
          var bonus = configOne.subscribeBonus || 0
          if (bonus > 0) {
            userOne.credit += bonus;
            userOne.isRedeemSubscribe = true;
            userOne.save(function (err, savedUser) {
              return res.json({subscribeBonus: bonus});
            });
          } else {
            return res.status(400).end();
          }
        });
      } else {
        return res.status(400).end();
      }
    });
  },
  redeemLogin: function (req, res) {
    var openId = req.param('openId');
    var ad = req.param('ad');
    user.findOne({openId: openId, ad: ad}).exec(function (err, userOne) {
      if (!userOne) {
          return res.status(401).end();
      }
      var startOfDay = new Date();
      startOfDay.setHours(0,0,0,0);
      log.find({action: 'login', openId: openId, date: {$gte: startOfDay}, ad: ad}).exec(function (err, logs) {
          Config.adInfo(ad, function (err, configOne) {
            var bonus = configOne.loginBonus || [];
            if (logs.length < 1 && bonus.length > 0) {
              var yesterday = new Date(startOfDay.getTime() - 86400 * 1000);
              log.findOne({action: 'login', openId: openId, date: {$gte: yesterday, $lt: startOfDay}, ad: ad}).exec(function (err, logOne) {
                var finalBonus;
                if (!logOne && configOne.loginBonusContinuity) {
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
                  userOne.loginDays = (userOne.loginDays || 0) + 1;
                }
                userOne.save(function (err) {
                  log.create({action: 'login', openId: openId, date: new Date(), ad: ad}).exec(function(err){
                    return res.json({'loginBonus': bonus, loginDays: userOne.loginDays, finalBonus: finalBonus});
                  });
                        
                }); 
              }); 
            } else {
              return res.status(400).end();
            }
          });
      });
    });
  },
  questionnaire: function (req, res) {
    var openId = req.param('openId');
    var ad = req.param('ad');
    var username = req.param('username');
    var phone = req.param('phone');
    var email = req.param('email');
    var age = req.param('age');
    Config.adInfo(ad, function (err, configOne) {
      user.findOne({openId: openId, ad: ad}).exec(function (err, userOne) {
        if (!userOne) {
            return res.status(401).end();
        }
        userOne.username = username;
        userOne.phone = phone;
        userOne.email = email;
        userOne.age = age;
        if (!userOne.isQuestionnaire) {
          userOne.credit = userOne.credit + configOne.questionnaireBonus || 0;
        }
        userOne.isQuestionnaire = true;
        userOne.save(function (err, savedUser) {
          return res.json({credit: savedUser.credit});
        });
      });
    });
    
  },
  initialization: function(req, res){
    var ad = req.param('ad');
    var secret = req.param('secret');
    if (secret == 'kitkit!@#$') {
      log.destroy({ad: ad}).exec(function(){});
      share_c.destroy({advertisement_c: ad}).exec(function(){});
      ClickCount.destroy().exec(function () {});
      wxToken.destroy().exec(function () {});
      user.destroy({ad: ad}).exec(function(){
        
        return res.end();
      });
    } else {
        return res.status(400).end();
    }

  },
  checkAlive: function (req, res) {
     return res.json({errMsg: "ok"});
  },
  wxPush: function (req, res) {
    console.log(req.query);
    console.log(req.body);
    var signature = req.param('signature');
    var timestamp = req.param('timestamp');
    var nonce = req.param('nonce');
    var echostr = req.param('echostr');

    var token = 'goodinteract2016';
    var tmpArr = [token, timestamp, nonce].sort();
    var tmpStr = tmpArr.join("");
    var tmpSHA1 = crypto.createHash('sha1').update(tmpStr).digest('hex');
    console.log(signature+':'+tmpSHA1);
    if (tmpSHA1 == signature) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      return res.end(echostr);
    } else {
      return res.status(400).end();
    }

  }

};
