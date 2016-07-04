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
 var VERIFICATION_CODE="uefa001";
 var adString = "adUEFA";
var appid = 'wx5b57ddac4e2e1e88';
var secret = 'e73e71f132807e7827849ca0ebf739e6';
module.exports = {
	init_c: function(req, res){ //首次進入會跑的流程
    var code = req.param("code");
    var sharedBy = req.param("sharedBy");
    var adId = req.param("ad");
    var url = req.param("url");
    var retResult = {};
    var resp;
    var result;
    resp = request('GET','https://api.weixin.qq.com/sns/oauth2/access_token?appid='+appid+'&secret='+secret+'&code='+code+'&grant_type=authorization_code');
        result = JSON.parse(resp.getBody());  //得到USER的AccessToken from weixin
        console.log(result);
        var accessToken = result.access_token;
        var userInfo = {};
        var openId = result.openid;
        // Get UserInfo
        // var userInfoResp = request('GET','https://api.weixin.qq.com/sns/userinfo?access_token='+accessToken+'&openid='+openId+'&lang=en');
        // var userInfoResult = JSON.parse(userInfoResp.getBody());
        // if (userInfoResult.nickname) {
        //   userInfo.nickname = userInfoResult.nickname;
        // }
        // if (userInfoResult.sex) {
        //   userInfo.sex = userInfoResult.sex;
        // }
        // if (userInfoResult.province) {
        //   userInfo.province = userInfoResult.province;
        // }
        // if (userInfoResult.city) {
        //   userInfo.city = userInfoResult.city;
        // }
        // if (userInfoResult.country) {
        //   userInfo.country = userInfoResult.country;
        // }
        // if (userInfoResult.headimgurl) {
        //   userInfo.headimgurl = userInfoResult.headimgurl;
        // }
        // if (userInfoResult.language) {
        //   userInfo.language = userInfoResult.language;
        // }
        // Get UserInfo
        userInfo.openId = openId;
        userInfo.ad = adId;
        User.create(userInfo, function(err, userOne){
          if(err){
            res.status(500);
            res.end();
            return;
          }
          credit = userOne.credit;
          if(!credit){
            credit = 0;
          }

          User.shareAd_c(sharedBy, openId, adId, function(err){
            if(err){
              res.status(500);
              res.end();
              return;
            }
          })
          User.sharedToUsers_c(userOne, adId, function(err, sharedToUsers){
            var shareCount = sharedToUsers.length;
            var appAccessToken;
            var wait = true;
            if(true){
              var resp = request('GET', 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+appid+'&secret='+secret);
              result = JSON.parse(resp.getBody());
              appAccessToken = result.access_token;
            }else{
              appAccessToken = req.session.appAccessToken;
            }

            req.session.appAccessToken = appAccessToken;
            resp = request('GET', 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token='+appAccessToken+'&type=jsapi');
              result = JSON.parse(resp.getBody());
              appAccessToken = result.access_token;
              req.session.appAccessToken = appAccessToken;
              var jsapiTicket = result.ticket;
              var timestamp = Math.floor(Date.now() / 1000);
              var noncestr = "Wm3WZYTPz0wzccnW";
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
              var userPrize = {};
              var prizeList = ['redeem_prize1', 'redeem_prize2'];
              var pickPrizeList = prizeList.map(function (item) {
                 return 'pick_'+item;
              })
              log.find({openId:openId, action: {$in:prizeList.concat(pickPrizeList)}}).exec(function (err, prizes) {
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
                res.json(retResult);
                return;
              });
              
          });


        });

	},
  redeem_c: function(req, res){
    var verificationCode = req.param('verificationCode');
    var userOpenId = req.param("user");
    var prize = req.param("prize");
    var ad = req.param("ad");
    var prizeCreditAll = {
      'adUEFA' : {
        prize1: 15,
        prize2: 30
      }
    };
    var prizeAmountAll = {
      'adUEFA' : {
        prize1: 1000000,
        prize2: 1000000
      }
    };
    
    redeem_c.findOne({user: userOpenId, advertisement: ad}).exec(function(err, redeemOne){
      user.findOne({openId: userOpenId, ad: ad}).exec(function(err, userOne){
        if(!userOne){
          res.status(500);
          res.end();
          return;
        }
        User.sharedToUsers_c(userOne, ad, function(err, sharedToUsers){
          var credit = userOne.credit;
          if(verificationCode==VERIFICATION_CODE){
            
              var prizeCredit = prizeCreditAll[ad][prize];
              var prizeAmount = prizeAmountAll[ad][prize];
              log.find({action:'redeem_'+prize, ad: ad}).exec(function (err, logs) {
                 if (logs.length < prizeAmount) {
                    if(credit<prizeCredit){
                      res.status(500);
                      res.json({errCode: 1, errMsg: '暫時無法兌換，請集齊'+prizeCredit+'個印花'});
                      return;
                    } else{
                      userOne.credit = userOne.credit - prizeCredit;
                      userOne.save(function(){
                        res.json({credit: userOne.credit, prize: prize});
                        return;
                      });
                    }
                 } else {
                    console.log('Out of amount');
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
  // updateCredit: function(req, res){
  //   user.update({}, {credit: 100}).exec(function(err){
  //     res.end();
  //   });
  // },
  uefaMain: function(req, res){
    res.view('easywash');
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
      var prizeListAll = {
        'adUEFA': ['redeem_prize1', 'redeem_prize2']
      };
      var prizeAmountAll = {
        'adUEFA' : {
          'redeem_prize1':30, 
          'redeem_prize2':10
        }
      };
      var prizeList = prizeListAll[ad];
      var prizeAmount = prizeAmountAll[ad];
      var prizeRemain = {};
      log.find({action: {$in: prizeList}, ad:ad}).exec(function (err, logs) {
          var groupLogs = {};
          logs.forEach(function (item, index, array) {
            if (groupLogs[item.action] == undefined) {
              groupLogs[item.action] = [item];
            } else {
              groupLogs[item.action].push(item);
            }
          });

          prizeList.forEach(function (item, index, array) {
            if (groupLogs[item] != undefined) {
              prizeRemain[item] = prizeAmount[item] - groupLogs[item].length;
            } else {
              prizeRemain[item] = prizeAmount[item];
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
    var exp = new Date('2016-07-11T03:00:00+08');
    console.log(exp);
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
    user.findOne({openId: openId, ad: ad}).exec(function (err, userOne) {
        if (!userOne) {
            return res.status(401).end();
        }
        if (userOne.isRedeemVote) { return res.status(400).end();}
        log.findOne({action: {$in:['gameResult_vote1', 'gameResult_vote2']}, ad: ad}).exec(function (err, logOne) {
          if (!logOne) {
            return res.status(400).end();
          }
          if (logOne.action == 'gameResult_'+userOne.vote) {
              userOne.credit = userOne.credit * 2;
              userOne.isRedeemVote = true;
              userOne.save(function (err, savedUser) {
                return res.json({credit: savedUser.credit, isRedeemVote: userOne.isRedeemVote});
              });

          } else {
             return res.status(400).end();
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
    user.destroy().exec(function(){
      res.end();
      return;
    });

  },
  checkAlive: function (req, res) {
     return res.json({errMsg: "ok"});
  }

};
