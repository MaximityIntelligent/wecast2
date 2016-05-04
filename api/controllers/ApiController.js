/**
 * ApiController
 *
 * @description :: Server-side logic for managing apis
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
 var request = require('sync-request');
 var weixin = require('../../config/weixin');
 //var reqSync = require('request-sync');
 var sha1 = require('sha1');
 var User = require('../lib/User');
 var VERIFICATION_CODE=123456;
module.exports = {
	init: function(req, res){
		var code = req.param("code");
    var sharedBy = req.param("sharedBy");
    var adId = req.param("ad");
    var url = req.param("url");
    console.log("code:"+code+" sharedBy:"+sharedBy+" ad:"+adId+"\n");
    var retResult = {};
    var resp;
    var result;

    resp = request('GET','https://api.weixin.qq.com/sns/oauth2/access_token?appid=wxab261de543656952&secret=389f230302fe9c047ec56c39889b8843&code='+code+'&grant_type=authorization_code');
        result = JSON.parse(resp.getBody());
        console.log("openId: "+result.openid);
        var accessToken = result.access_token;
        var openId = result.openid;
        User.create(openId, function(err, userOne){
          if(err){
            res.status(500);
            res.end();
            return;
          }
          User.shareAd(sharedBy, openId, adId, function(err){
            if(err){
              res.status(500);
              res.end();
              return;
            }
          })
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
            //console.log('ticket: '+resp.body);
            var jsapiTicket = result.ticket;
            var timestamp = Math.floor(Date.now() / 1000);
            var noncestr = "Wm3WZYTPz0wzccnW";
            //console.log('url: '+url);
            var string1 = "jsapi_ticket="+jsapiTicket+"&noncestr="+noncestr+"&timestamp="+timestamp+"&url="+url;
            var signature = sha1(string1);
            retResult.accessToken = accessToken;
            retResult.openId = openId;
            retResult.drawChance = userOne.drawChance;
            retResult.signature = signature;
            retResult.timestamp = timestamp;
            retResult.noncestr = noncestr;
            retResult.ticket = jsapiTicket;
            retResult.prizeRedeem = "";
            res.json(retResult);
            return;
        });
	},
  init_c: function(req, res){
    console.log("74")
		var code = req.param("code");
    var sharedBy = req.param("sharedBy");
    var adId = req.param("ad");
    var url = req.param("url");
    console.log("code:"+code+" sharedBy:"+sharedBy+" ad:"+adId+"\n");
    var retResult = {};
    var resp;
    var result;
    resp = request('GET','https://api.weixin.qq.com/sns/oauth2/access_token?appid=wxab261de543656952&secret=389f230302fe9c047ec56c39889b8843&code='+code+'&grant_type=authorization_code');
        console.log("85");
        result = JSON.parse(resp.getBody());
        console.log("86")
        //console.log("openId: "+result.openid);
        var accessToken = result.access_token;
        var openId = result.openid;
        console.log(openId);

        User.create(openId, function(err, userOne){
          if(err){
            res.status(500);
            res.end();
            return;
          }
          credit = userOne.credit;
          if(!credit){
            credit = 0;
          }
          redeem_c.findOne({user: openId, advertisement: 'easywash'}).exec(function(err, redeemOne){
            console.log("151");
            console.log("94");
            User.shareAd_c(sharedBy, openId, adId, function(err){
              if(err){
                res.status(500);
                res.end();
                return;
              }
            })
            console.log("102");
            User.sharedToUsers_c(userOne, adId, function(err, sharedToUsers){
              console.log("105");
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
                //console.log('ticket: '+resp.body);
                var jsapiTicket = result.ticket;
                var timestamp = Math.floor(Date.now() / 1000);
                var noncestr = "Wm3WZYTPz0wzccnW";
                //console.log('url: '+url);
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
                console.log("150end");
                return;
            });
          });

        });

	},
  redeem_c: function(req, res){
    var verificationCode = req.param('verificationCode');
    var userOpenId = req.param("user");
    var prize = req.param("prize");
    redeem_c.findOne({user: userOpenId, advertisement: 'easywash'}).exec(function(err, redeemOne){
      console.log("151");
      user.findOne({openId: userOpenId}).exec(function(err, userOne){
        if(!userOne){
          res.status(500);
          res.end();
          return;
        }
        User.sharedToUsers_c(userOne, "easywash", function(err, sharedToUsers){
          var credit = userOne.credit;
          console.log("credit"+credit);

          console.log("174");
          if(verificationCode==VERIFICATION_CODE){

            if(prize=="prize1"){
              credit = 20;
              if(credit<18){
                console.log("179");
                res.status(500);
                res.end();
                return;
              }else{
                console.log("183");
                console.log("172");
                userOne.credit = userOne.credit - 18;
                userOne.save(function(){
                  res.json({credit: userOne.credit});
                  return;
                });
              }


            }else if(prize=="prize2"){
              if(credit<38){
                res.status(500);
                res.end();
                return;
              }else{
                userOne.credit = userOne.credit - 38;
                userOne.save(function(){
                  res.json({credit: userOne.credit});
                  return;
                });
              }


            }else{
              res.end();
              return;
            }
          }else{
            res.status(500);
            res.end();
            return;
          }

        })

    });

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
	}

};
