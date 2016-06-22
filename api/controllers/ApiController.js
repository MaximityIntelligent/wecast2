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
 var VERIFICATION_CODE="mood001";
 var adString = "adMood";

module.exports = {
	init_c: function(req, res){ //首次進入會跑的流程
    var code = req.param("code");
    var sharedBy = req.param("sharedBy");
    var adId = req.param("ad");
    var url = req.param("url");
    var retResult = {};
    var resp;
    var result;
    resp = request('GET','https://api.weixin.qq.com/sns/oauth2/access_token?appid=wxab261de543656952&secret=389f230302fe9c047ec56c39889b8843&code='+code+'&grant_type=authorization_code');
        result = JSON.parse(resp.getBody());  //得到USER的AccessToken from weixin
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
              var resp = request('GET', 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wxab261de543656952&secret=389f230302fe9c047ec56c39889b8843');
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
              res.json(retResult);
              return;
          });


        });

	},
  redeem_c: function(req, res){
    var verificationCode = req.param('verificationCode');
    var userOpenId = req.param("user");
    var prize = req.param("prize");
    var prize1Credit = 38;
    var prize1Amount = 1000000;
    redeem_c.findOne({user: userOpenId, advertisement: adString}).exec(function(err, redeemOne){
      user.findOne({openId: userOpenId}).exec(function(err, userOne){
        if(!userOne){
          res.status(500);
          res.end();
          return;
        }
        User.sharedToUsers_c(userOne, adString, function(err, sharedToUsers){
          var credit = userOne.credit;
          if(verificationCode==VERIFICATION_CODE){
            if(prize=="prize1"){
              log.find({action:'redeem_prize1'}).exec(function (err, logs) {
                 if (logs.length < prize1Amount) {
                    if(credit<prize1Credit){
                      res.status(500);
                      res.json({errMsg: '印花不足,暫時無法兌換'});
                      return;
                    } else{
                      userOne.credit = userOne.credit - prize1Credit;
                      userOne.save(function(){
                        res.json({credit: userOne.credit, prize: prize});
                        return;
                      });
                    }
                 } else {
                    console.log('Out of amount');
                    res.status(400);
                    res.json({errMsg: '奬品已全部換領完畢。'});
                    return;
                 }
              });
              
            }else if(prize=="prize2"){
              if(credit<38){
                res.status(500);
                res.end();
                return;
              }else{
                userOne.credit = userOne.credit - 38;
                userOne.save(function(){
                res.json({credit: userOne.credit, prize: prize});
                return;
                });
              }
            }else{
              res.end();
              return;
            }
          }else{
            res.status(500);
            res.json({errMsg: 'SORRY  領獎碼有誤'});
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
  easywash: function(req, res){
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
    user.findOne({openId: req.param('openId')}).exec(function (err, userOne) {
        return res.json(userOne);
    });
  },
  getPrizeRemain: function (req, res) {
      var prizeList = ['redeem_prize1', 'redeem_prize2', 'share_friend'];
      var prizeAmount = {'redeem_prize1':30, 'redeem_prize2':10, 'share_friend':1000};
      var prizeRemain = {};
      log.find({action: {$in: prizeList}}).exec(function (err, logs) {
          var groupLogs = {};
          logs.forEach(function (item, index, array) {
            if (groupLogs[item.action] == undefined) {
              groupLogs[item.action] = [item];
            } else {
              groupLogs[item.action].push(item);
            }
          })

          prizeList.forEach(function (item, index, array) {
            prizeRemain[item] = prizeAmount[item] - groupLogs[item];
          });

          return res.json({logs: groupLogs, prizeRemain: prizeRemain});
      });

  },

  luckyDraw: function (req, res) {
    user.findOne({openId: req.param('openId')}).exec(function (err, userOne) {
        if (!userOne) {
            return res.status(401).end();
        }
        var startOfDay = new Date();
        startOfDay.setHours(0,0,0,0);
        log.find({action: 'luckyDraw', openId: userOne.openId, date: {$gte: startOfDay}}).exec(function (err, logs) {
          
           if (logs.length < 1) {
              log.create({action: 'luckyDraw', openId: userOne.openId, date: new Date()}).exec(function(err, results){

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
