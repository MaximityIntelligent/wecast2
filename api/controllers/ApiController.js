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
 var VERIFICATION_CODE="ew001";

module.exports = {
	init_c: function(req, res){
    var code = req.param("code");
    var sharedBy = req.param("sharedBy");
    var adId = req.param("ad");
    var url = req.param("url");
    var retResult = {};
    var resp;
    var result;
    resp = request('GET','https://api.weixin.qq.com/sns/oauth2/access_token?appid=wx5b57ddac4e2e1e88&secret=e73e71f132807e7827849ca0ebf739e6&code='+code+'&grant_type=authorization_code');
        result = JSON.parse(resp.getBody());
        var accessToken = result.access_token;
        var openId = result.openid;
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
              var resp = request('GET', 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx5b57ddac4e2e1e88&secret=e73e71f132807e7827849ca0ebf739e6');
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
    redeem_c.findOne({user: userOpenId, advertisement: 'easywash'}).exec(function(err, redeemOne){
      user.findOne({openId: userOpenId}).exec(function(err, userOne){
        if(!userOne){
          res.status(500);
          res.end();
          return;
        }
        User.sharedToUsers_c(userOne, "easywash", function(err, sharedToUsers){
          var credit = userOne.credit;
          if(verificationCode==VERIFICATION_CODE){
            if(prize=="prize1"){
              if(credit<18){
                res.status(500);
                res.end();
                return;
              }else{
                userOne.credit = userOne.credit - 18;
                userOne.save(function(){
                  res.json({credit: userOne.credit, prize: prize});
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
            res.end();
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
  initialization: function(req, res){
    log.destroy().exec(function(){});
    redeem_c.destroy().exec(function(){});
    share_c.destroy().exec(function(){});
    user.destroy().exec(function(){
      res.end();
      return;
    });

  }

};
