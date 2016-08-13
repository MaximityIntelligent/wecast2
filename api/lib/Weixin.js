var request = require('request');

function Weixin (){

}

module.exports = Weixin;

Weixin.appid = 'wxbb0b299e260ac47f';
Weixin.secret = 'e253fefab4788f5cdcbc14df76cbf9ca';
Weixin.snsapi = 'snsapi_userinfo';
Weixin.host = 'lb.ibeacon-macau.com'

Weixin.oauth2 = function (code, cb) {
	request.get('https://api.weixin.qq.com/sns/oauth2/access_token?appid='+Weixin.appid+'&secret='+Weixin.secret+'&code='+code+'&grant_type=authorization_code', function (err, res, result) {
      if (err) {
      	return cb(err);
      }
      result = JSON.parse(result);
      console.log(result);
      if (result.errcode) {
        return cb(result);
      } else {
      	return cb(null, result);
      }
    });
}

Weixin.userinfo = function () {
	request.get('https://api.weixin.qq.com/sns/userinfo?access_token='+accessToken+'&openid='+openId+'&lang=en', function (err, responce, result) {
        if (err) {
	      	return cb(err);
	    }    
        result = JSON.parse(result);
        if (result.errcode) {
	        return cb(result);
	    } else {
	      	return cb(null, result);
	    }

    });
}

Weixin.auth = function (accessToken, openId, cb) {
	request.get('https://api.weixin.qq.com/sns/auth?access_token='+accessToken+'&openid='+openId, function (err, responce, result) {
      if (err) {
      	return cb(err);
      }
      result = JSON.parse(result);
      console.log(result);
      if (result.errcode != 0) {
        return cb(result);
      } else {
        return cb(null);
      }
    });
};