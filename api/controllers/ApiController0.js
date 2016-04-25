/**
 * ApiController
 *
 * @description :: Server-side logic for managing apis
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
 var request = require('request');
 var weixin = require('../../config/weixin');
 var syncRequest = require('sync-request');
 var sha1 = require('sha1');
module.exports = {
	userInfo: function(req, res){
		var code = req.param("code");
    console.log("code:"+code);
    var retResult = {};
		//https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET
    request("https://api.weixin.qq.com/sns/oauth2/access_token?appid=wxab261de543656952&secret=389f230302fe9c047ec56c39889b8843&code="+code+"&grant_type=authorization_code", function (error, response,     body) {
			//weixin.apiUrl+'/sns/oauth2/access_token?appid=wxab261de543656952&secret=389f230302fe9c047ec56c39889b8843&code='+code+'&grant_type=authorization_code', function (error, response,     body) {
        if (!error) {
            console.log("accesss token body: "+body);
            var result = JSON.parse(body);
            var accessToken = result.access_token;
            var openId = result.openid;
            retResult.accessToken = accessToken;
            retResult.openId = openId;
            console.log("open id: "+openId);
            request('https://api.weixin.qq.com/sns/userinfo?access_token='+accessToken+'&openid='+openId+'&lang=zh_CN', function(error, response, body){
                if(!error){
                    var result = JSON.parse(body);
                    var nickname = result.nickname;
                    var sex = result.sex;
                    retResult.nickname = nickname;
                    retResult.sex = sex;
                    console.log('nickname: '+nickname+'sex: '+sex+'access token: '+ accessToken);
										var appAccessToken;
										if(true){
											var retRes = syncRequest('GET', 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wxab261de543656952&secret=389f230302fe9c047ec56c39889b8843');
											var result;
											result = JSON.parse(retRes.body);
											console.log('access token: '+result);
											appAccessToken = result.access_token;
											req.session.appAccessToken = appAccessToken;
										}else{
											appAccessToken = req.session.appAccessToken;
										}
										console.log('appAccessToken: '+appAccessToken);
										var retRes = syncRequest('GET', 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token='+appAccessToken+'&type=jsapi');
										result = JSON.parse(retRes.body);
										console.log('ticket: '+retRes.body);
										var jsapiTicket = result.ticket;
										var timestamp = Math.floor(Date.now() / 1000);
										var noncestr = "Wm3WZYTPz0wzccnW";
										var url = req.param('url');
                    console.log('url: '+url);
										var string1 = "jsapi_ticket="+jsapiTicket+"&noncestr="+noncestr+"&timestamp="+timestamp+"&url="+url;
                    console.log(string1);
										var signature = sha1(string1);
										console.log("signature: " + signature);
										retResult.signature = signature;
										retResult.timestamp = timestamp;
										retResult.noncestr = noncestr;
										retResult.ticket = jsapiTicket;
										res.json(retResult);
                    return;
                }else{
                    res.status(500);
                    res.end();
                    return;
                }
            });
        }

    });


	}
};
