/**
 * ApiController
 *
 * @description :: Server-side logic for managing apis
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var request = require('sync-request');
var config = require('../../config/event-config');
var sha1 = require('sha1');
var User = require('../lib/User');

var prizesInfo = {
  'adUEFA' : {
    'none' : {
        'probability' : 100
    },
    'prize1' : {
        'credit' : 15,
        'amount' : 300,
        'code' : "cheers001"
    },
    'prize2' : {
        'credit' : 30,
        'amount' : 3,
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
  }, 
  'adBlueMan' : {
    'none' : {
        'probability' : 100
    },
    'prize1' : {
        'credit' : 15,
        'weekAmount' : 3,
        'amount' : 20,
        'code' : "good001",
        'probability' : 70
    },
    'prize2' : {
        'credit' : 30,
        'weekAmount' : 6,
        'amount' : 10,
        'code' : "good001",
        'probability' : 30
    }
  }
}
// Subscribe Setting
var subscribeBonus = {
      'adUEFA' : 0,
      'adDPower' : 5,
      'adBlueMan' : 0
    };
// 
// Questionnaire Setting
var questionnaireBonus = {
      'adUEFA' : 5,
      'adDPower' : 5,
      'adBlueMan' : 5
    };
//
// Vote Setting
var votesInfo = {
  'adUEFA' : {
      'votes': ['vote1', 'vote2'],
      'voteExp' : new Date('2017-07-20T16:00:00'),
      'redeemExp' : new Date('2017-07-20T16:00:00'),
      'bonus' : 10
    
  },
  'adBlueMan' : {
      'votes': ['vote1', 'vote2'],
      'voteExp' : new Date('2017-07-20T16:00:00'),
      'redeemExp' : new Date('2017-07-20T16:00:00'),
      'bonus' : 10
    
  }
}

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

var getVoteResult = function (ad, cb) {
    var voteInfo = config[ad].votesInfo || {};
    var votes = voteInfo.votes || [];
    var resultVotes = votes.map(function (vote) {
      return 'gameResult_'+vote;
    });
    log.findOne({action: {$in: resultVotes}, ad: ad}).exec(function (err, logOne) {
      if (!logOne) {
        return cb(null);
      }
      var temp = logOne.action.split('_');
      if (temp.length != 2) { return cb(null);}
      return cb(temp[temp.length-1]);
      
    });
};

var getVoteRecord = function (ad, cb) {
  var voteInfo = config[ad].votesInfo || {};
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
        if (sharedBy != "wecast") {
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
                  var bonus = config[ad].subscribeBonus || 0;
                  if (bonus > 0) {
                    userOne.credit += bonus;
                    userOne.subscribe = true;
                    retResult.subscribeBonus = bonus;
                    userOne.save(function (err, savedUser) {
                      // body...
                      console.log("subscribe bounce");
                    });
                  }
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
              var prizeInfo = config[ad].prizesInfo || {};
              var prizeList = Object.keys(prizeInfo);
              var redeemPrizeList = prizeList.map(function (item) {
                 return 'redeem_'+item;
              })
              var pickPrizeList = prizeList.map(function (item) {
                 return 'pick_'+item;
              })
              log.find({openId:openId, ad: ad, action: {$in:redeemPrizeList.concat(pickPrizeList)}}).exec(function (err, logs) {
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
    var prizeInfo = config[ad].prizesInfo;
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
  },
  redeem_c: function(req, res){
    var verificationCode = req.param('verificationCode');
    var openId = req.param("user") || req.param("openId");
    var prize = req.param("prize");
    var ad = req.param("ad");
    if (config[ad].prizesInfo==null || config[ad].prizesInfo[prize] == null) {
      res.status(400);
      res.json({errCode: 0, errMsg: '沒有此奬品。'});
      return;
    }
    var prizeInfo = config[ad].prizesInfo[prize];
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
                      return res.status(500).json({errCode: 1, errMsg: '暫時無法兌換，請集齊'+prizeCredit+'個印花'});
                      
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
        var prizeInfo = config[ad].prizesInfo;
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
        })
        
    });
    
  },
  vote: function (req, res) {
    var openId = req.param('openId');
    var ad = req.param('ad');
    var userVote = req.param('userVote');
    var voteInfo = config[ad].votesInfo;
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
  },
  redeemVote: function (req, res) {
    var openId = req.param('openId');
    var ad = req.param('ad');
    var voteInfo = config[ad].votesInfo;
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
  },
  redeemVoteAll: function (req, res) {
    var openId = req.param('openId');
    var ad = req.param('ad');
    var secret = req.param('secret');
    var voteInfo = config[ad].votesInfo;
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
        getVoteRecord(ad, function (record) {
            //getGameResult
            getVoteResult(ad, function (result) {
              return res.json({votes:record, gameResult: result, credit: userOne.credit});
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
          userOne.credit = userOne.credit + config[ad].questionnaireBonus || 0;
        }
        userOne.isQuestionnaire = true;
        userOne.save(function (err, savedUser) {
          return res.json({credit: savedUser.credit});
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
  }

};
