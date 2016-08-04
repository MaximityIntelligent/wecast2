/**
 * ApiController
 *
 * @description :: Server-side logic for managing apis
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var request = require('sync-request');
var weixin = require('../../config/weixin');
var sha1 = require('sha1');
var User = require('../lib/User');

var prizesInfo = {
  'adUEFA' : {
    'prize1' : {
        'credit' : 15,
        'amount' : 300,
        'code' : "cheers001"
    },
    'prize2' : {
        'credit' : 30,
        'amount' : 100,
        'code' : "cheers001"
    }
  }, 
  'adDPower' : {
    'none' : {
        'probability' : 100
    },
    'prize1' : {
        'credit' : 15,
        'weekAmount' : 3,
        'amount' : 20,
        'code' : "cheers001",
        'probability' : 70
    },
    'prize2' : {
        'credit' : 30,
        'weekAmount' : 6,
        'amount' : 10,
        'code' : "cheers001",
        'probability' : 30
    }
  }
}
// Subscribe Setting
var subscribeBounce = {
      'adUEFA' : 0,
      'adDPower' : 5
    };
// 
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
module.exports = {
	init_c: function(req, res){ //首次進入會跑的流程
    var code = req.param("code");
    var sharedBy = req.param("sharedBy");
    var ad = req.param("ad");
    var url = req.param("url");
    console.log(url);
    var retResult = {};
    var resp;
    var result;
    resp = request('GET','https://api.weixin.qq.com/sns/oauth2/access_token?appid='+appid+'&secret='+secret+'&code='+code+'&grant_type=authorization_code');
        result = JSON.parse(resp.getBody());  //得到USER的AccessToken from weixin
        console.log(result);
        var accessToken = result.access_token;
        var userInfo = {};
        var openId = result.openid;
        // if (result.errcode == 40029) {
        //   openId = 'ocLOPwlFiCCTPeSXLYTg7ZLLLAww';
        // }
        // Get UserInfo
        if (result.scope == 'snsapi_userinfo') {

          var userInfoResp = request('GET','https://api.weixin.qq.com/sns/userinfo?access_token='+accessToken+'&openid='+openId+'&lang=en');
          var userInfoResult = JSON.parse(userInfoResp.getBody());
          if (userInfoResult.nickname) {
            userInfo.nickname = userInfoResult.nickname;
          }
          if (userInfoResult.sex) {
            userInfo.sex = userInfoResult.sex;
          }
          if (userInfoResult.province) {
            userInfo.province = userInfoResult.province;
          }
          if (userInfoResult.city) {
            userInfo.city = userInfoResult.city;
          }
          if (userInfoResult.country) {
            userInfo.country = userInfoResult.country;
          }
          if (userInfoResult.headimgurl) {
            userInfo.headimgurl = userInfoResult.headimgurl;
          }
          if (userInfoResult.language) {
            userInfo.language = userInfoResult.language;
          }
          if (userInfoResult.unionid) {
            userInfo.unionId = userInfoResult.unionid;
          }
        }
        // Get UserInfo
        userInfo.openId = openId;
        if (result.unionid) {
          userInfo.unionId = result.unionid;
        }
        userInfo.ad = ad;
        if (sharedBy != "wechast") {
          userInfo.parent = sharedBy;
        }
        User.create(userInfo, function(err, userOne){
          if(err){
            res.status(500).json({errMsg: 'User create fail'});
            return;
          }
          credit = userOne.credit;
          if(!credit){
            credit = 0;
          }
          // console.log(sharedBy+openId+ad);
          User.shareAd_c(sharedBy, openId, ad, function(err){
            if(err) {
              console.log({shareAd_c_errMsg: err});
            }
          });
          User.sharedToUsers_c(userOne, ad, function(err, sharedToUsers){
            var shareCount = sharedToUsers.length;
            var appAccessToken;
            var jsapiTicket;
            var wait = true;
            var now = new Date();
            var ONE_HOUR = 60 * 60 * 1000;
            var oneHourAgo = new Date(now.getTime() - ONE_HOUR);
            //console.log(oneHourAgo);
            wxToken.findOne({expireAt: {'>': now}}).sort({ createdAt: 'desc' }).exec(function (err, wxTokenOne) {
              if (!wxTokenOne) {
                  //console.log('-----no token-----');
                  var resp = request('GET', 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+appid+'&secret='+secret);
                  result = JSON.parse(resp.getBody());
                  //console.log(result);
                  appAccessToken = result.access_token;

                  req.session.appAccessToken = appAccessToken;
                  resp = request('GET', 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token='+appAccessToken+'&type=jsapi');
                    result = JSON.parse(resp.getBody());
                    if (result.errmsg == 'ok') {
                      var expireAt = new Date();
                      expireAt = new Date(expireAt.getTime() + (result.expires_in - 60 * 60) * 1000);
                      wxToken.create({access_token: appAccessToken, expires_in: result.expires_in, jsapi_ticket: result.ticket, expireAt: expireAt}).exec(function (err, createdToken) {
                        // body...
                        console.log('------new token----: '+oneHourAgo);
                        console.log(createdToken);
                        
                      });
                    }
                    jsapiTicket = result.ticket;
              } else {
                appAccessToken = wxTokenOne.access_token;
                jsapiTicket = wxTokenOne.jsapi_ticket;
                //console.log('------old token----');
                //console.log(wxTokenOne);
                
              }
              
              if (!userOne.subscribe) {
                var subscribeResp = request('GET', 'https://api.weixin.qq.com/cgi-bin/user/info?access_token='+appAccessToken+'&openid='+userOne.openId);
                var subscribeResult = JSON.parse(subscribeResp.getBody());
                if (subscribeResult.subscribe == 1) {
                  userOne.credit += subscribeBounce[ad];
                  userOne.subscribe = true;
                  retResult.subscribeBonus = subscribeBounce[ad];
                  userOne.save(function (err, savedUser) {
                    // body...
                    console.log("subscribe bounce");
                  });
                }
              }


              // appAccessToken = result.access_token;
              // req.session.appAccessToken = appAccessToken;
              
              var timestamp = Math.floor(Date.now() / 1000);
              var noncestr = randomString(16);
              var string1 = "jsapi_ticket="+jsapiTicket+"&noncestr="+noncestr+"&timestamp="+timestamp+"&url="+url;
              var signature = sha1(string1);
              retResult.accessToken = accessToken;
              retResult.openId = openId;
              retResult.shareCount = shareCount;
              retResult.drawChance = userOne.drawChance;
              retResult.signature = signature;
              retResult.timestamp = timestamp;
              retResult.noncestr = noncestr;
              retResult.ticket = jsapiTicket;
              retResult.credit = userOne.credit;
              retResult.userVote = userOne.vote;
              retResult.isRedeemVote = userOne.isRedeemVote;
              retResult.sharedToUsers = sharedToUsers;
              retResult.subscribe = userOne.subscribe;
              var userPrize = {};
              var prizeList = ['redeem_prize1', 'redeem_prize2'];
              var pickPrizeList = prizeList.map(function (item) {
                 return 'pick_'+item;
              })
              log.find({openId:openId, ad: ad, action: {$in:prizeList.concat(pickPrizeList)}}).exec(function (err, prizes) {
                var groupPrizes = {};
                prizes.forEach(function (item, index, array) {
                  if (groupPrizes[item.action] == undefined) {
                    groupPrizes[item.action] = [item];
                  } else { 
                    groupPrizes[item.action].push(item);
                  }
                });

                prizeList.forEach(function (item, index, array) {
                  if (groupPrizes[item] != undefined) {
                    userPrize[item] = groupPrizes[item].length;
                    if (groupPrizes['pick_'+item] != undefined) {
                      userPrize[item] -= groupPrizes['pick_'+item].length;
                    }
                  } else {
                    userPrize[item] = 0;
                  }
                });

                retResult.userPrize = userPrize;
                console.log(retResult);
                res.json(retResult);
                return;
              });
              
            });
            
              
              
          });
        

        });

	},
  probability : function(req, res) {
    var openId = req.param("openId");
    var ad = req.param("ad");
    var prizeInfo = prizesInfo[ad];
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

        var prize = 0;
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
        var prizeAmount = prizeInfo[prize].amount || 1000;
        log.count({action:'redeem_'+prize, ad: ad}).exec(function (err, redeems) {
          if (redeems >= prizeAmount) {
            prize = 'none';
            console.log("month");
          }
          var startOfWeek = new Date();
          startOfWeek.setHours(0,0,0,0);
          startOfWeek = new Date(startOfWeek.getTime()- 86400*1000*startOfWeek.getDay());
          var prizeWeekAmount = prizeInfo[prize].weekAmount || prizeInfo[prize].amount || 1000;
          log.count({action:'redeem_'+prize, ad: ad, createdAt: {'>=' : startOfWeek}}).exec(function (err, weekRedeems) {
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
  },
  redeem_c: function(req, res){
    var verificationCode = req.param('verificationCode');
    var userOpenId = req.param("user");
    var prize = req.param("prize");
    var ad = req.param("ad");
    var prizeInfo = prizesInfo[ad][prize];
    if (prizeInfo==null) {
      res.status(400);
      res.json({errCode: 0, errMsg: '沒有此奬品。'});
      return;
    }
    redeem_c.findOne({user: userOpenId, advertisement: ad}).exec(function(err, redeemOne){
      user.findOne({openId: userOpenId, ad: ad}).exec(function(err, userOne){
        if(!userOne){
          res.status(500);
          res.end();
          return;
        }
        User.sharedToUsers_c(userOne, ad, function(err, sharedToUsers){
          var credit = userOne.credit;
          prizeCode = prizeInfo.code || "";
          if(verificationCode==prizeCode){
            
              var prizeCredit = prizeInfo.credit || 1;
              var prizeAmount = prizeInfo.amount || 1000;
              log.find({action:'redeem_'+prize, ad: ad}).exec(function (err, logs) {
                 if (logs.length < prizeAmount) {
                    if(credit<prizeCredit){
                      res.status(500);
                      res.json({errCode: 1, errMsg: '暫時無法兌換，請集齊'+prizeCredit+'個印花'});
                      return;
                    } else{
                      userOne.credit = userOne.credit - prizeCredit;
                      userOne.save(function(){
                        log.create({action: 'redeem_'+prize, openId: userOne.openId, date: new Date(), ad: ad}).exec(function(err, results){

                        });
                        res.json({credit: userOne.credit, prize: prize});
                        return;
                      });
                    }
                 } else {
                    //console.log('Out of amount');
                    res.status(400);
                    res.json({errCode: 0, errMsg: '奬品已全部換領完畢。'});
                    return;
                 }
              });
            
          }else{
            res.status(500);
            res.json({errCode: 0, errMsg: 'SORRY  領獎碼有誤'});
            return;
          }

        })

    });

  });

  },
  updateCredit: function(req, res){
    user.update({}, {credit: 100}).exec(function(err){
      res.end();
    });
  },
  uefaMain: function(req, res){
    res.view('uefa');
  },
  dpowerMain: function (req, res) {
    res.view('dpower');
  },
  blueManMain: function (req, res) {
    res.view('blue-man');
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
        return res.json(userOne);
    });
  },
  getPrizeRemain: function (req, res) {
      var ad = req.param('ad');
      var prizeInfo = prizesInfo[ad];
      console.log(prizeInfo);
      var prizeList = Object.keys(prizeInfo);
      if (prizeList.length == 0) {
          return res.json({prizeRemain: []});
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
              log.create({action: 'luckyDraw', openId: userOne.openId, date: new Date(), ad: ad}).exec(function(err, results){

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
        })
        
    });
    
  },
  vote: function (req, res) {
    var openId = req.param('openId');
    var ad = req.param('ad');
    var userVote = req.param('userVote');
    var now = new Date();
    var exp = new Date('2016-07-10T19:00:00');
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
            user.count({ad: ad, vote:'vote1'}).exec(function (err, count1) {
              user.count({ad:ad, vote: 'vote2'}).exec(function (err, count2) {
                  log.create({action: 'vote', openId: userOne.openId, date: new Date(), ad: ad}).exec(function(err, results){

                  });
                  return res.json({userVote: savedUser.vote, votes:{vote1:count1, vote2:count2}});
                
              });
            });
            
          });
        } else {
           return res.status(400).end();
        }
    });
  },
  redeemVote: function (req, res) {
    var openId = req.param('openId');
    var ad = req.param('ad');
    var now = new Date();
    var exp = new Date('2016-07-20T16:00:00');
    if (now.getTime() > exp.getTime()) {
      return res.status(400).json({errCode:0, errMsg: '領奬時限已過'});
    }
    user.findOne({openId: openId, ad: ad}).exec(function (err, userOne) {
        if (!userOne) {
            return res.status(401).end();
        }
        if (userOne.isRedeemVote) { return res.status(400).json({errCode:0, errMsg: '您已經成功領奬。'});}
        log.findOne({action: {$in:['gameResult_vote1', 'gameResult_vote2']}, ad: ad}).exec(function (err, logOne) {
          if (!logOne) {
            return res.status(400).json({errCode:0, errMsg: '比賽結果還沒出來。'});
          } else {
            if (logOne.action == 'gameResult_'+userOne.vote) {
              userOne.credit = userOne.credit * 2;
              userOne.isRedeemVote = true;
              userOne.save(function (err, savedUser) {
                log.create({action: 'redeem_vote', openId: userOne.openId, date: new Date(), ad: ad}).exec(function(err, results){

                  });
                return res.json({credit: savedUser.credit, isRedeemVote: userOne.isRedeemVote});
              });

            } else {
               return res.status(400).json({errCode:0, errMsg: '抱歉，您猜不中呢。'});
            }
          }

          
        });
    });
  },
  redeemVoteAll: function (req, res) {
    var openId = req.param('openId');
    var ad = req.param('ad');
    var secret = req.param('secret');
    if (secret == 'kitkit!@#$') {
      user.findOne({openId: openId, ad: ad}).exec(function (err, userOne) {
        if (!userOne) {
            return res.status(401).end();
        }
        log.findOne({action: {$in:['gameResult_vote1', 'gameResult_vote2']}, ad: ad}).exec(function (err, logOne) {
          if (!logOne) {
            return res.status(400).end();
          }

          var gameResult = logOne.action.split("_")[1];

          user.find({ad:ad, vote: gameResult, isRedeemVote: false}).exec(function (err, users) {
            if (users.length > 0) {
              var count = users.length;
              users.forEach(function (item, index) {
                if (item.isRedeemVote == false) {
                  item.credit = item.credit * 2;
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
        });
    });
    } else {
      return res.status(400).end();
    }
  },
  getGameResult: function (req, res) {
    var openId = req.param('openId');
    var ad = req.param('ad');
    user.findOne({openId: openId, ad: ad}).exec(function (err, userOne) {
        if (!userOne) {
            return res.status(401).end();
        }
        log.findOne({action: {$in:['gameResult_vote1', 'gameResult_vote2']}, ad: ad}).exec(function (err, logOne) {
          if (!logOne) {
            return res.status(400).end();
          }
          var temp = logOne.action.split('_');
          if (temp.length != 2) { return res.status(400).end();}
          return res.json({gameResult: temp[temp.length-1]});
          
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
        user.count({ad: ad, vote:'vote1'}).exec(function (err, count1) {
          user.count({ad:ad, vote: 'vote2'}).exec(function (err, count2) {
            return res.json({vote1:count1, vote2:count2});
          });
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
        user.count({ad: ad, vote:'vote1'}).exec(function (err, count1) {
          user.count({ad:ad, vote: 'vote2'}).exec(function (err, count2) {
            //getGameResult
            log.findOne({action: {$in:['gameResult_vote1', 'gameResult_vote2']}, ad: ad}).exec(function (err, logOne) {
              var gameResult;
              if (logOne) {
                var temp = logOne.action.split('_');
                if (temp.length == 2) { gameResult = temp[temp.length-1]}
                
              }
              return res.json({votes:{vote1:count1, vote2:count2}, gameResult: gameResult, credit: userOne.credit});
              
            });
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
    user.findOne({openId: openId, ad: ad}).exec(function (err, userOne) {
        if (!userOne) {
            return res.status(401).end();
        }
        userOne.username = username;
        userOne.phone = phone;
        userOne.email = email;
        userOne.age = age;
        if (!userOne.isQuestionnaire) {
          userOne.credit = userOne.credit + 3;
        }
        userOne.isQuestionnaire = true;
        userOne.save(function (err, savedUser) {
          return res.json({credit: savedUser.credit});
        });
    });
  },
  initialization: function(req, res){
    log.destroy().exec(function(){});
    redeem_c.destroy().exec(function(){});
    share_c.destroy().exec(function(){});
    ClickCount.destroy().exec(function () {});
    wxToken.destroy().exec(function () {});
    user.destroy().exec(function(){
      res.end();
      return;
    });

  },
  checkAlive: function (req, res) {
     return res.json({errMsg: "ok"});
  }

};
