var request = require('request');

function Weixin (){

}

module.exports = Weixin;

// Weixin.appid = 'wxbb0b299e260ac47f'; //easywash
// Weixin.secret = 'e253fefab4788f5cdcbc14df76cbf9ca';
Weixin.appid = 'wxab261de543656952'; //Maximity
Weixin.secret = '389f230302fe9c047ec56c39889b8843';
Weixin.snsapi = 'snsapi_userinfo';
Weixin.host = 'lb.ibeacon-macau.com'


Weixin.oauth2 = function (code, cb) {
	request.get('https://api.weixin.qq.com/sns/oauth2/access_token?appid='+Weixin.appid+'&secret='+Weixin.secret+'&code='+code+'&grant_type=authorization_code', function (err, res, result) {
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

Weixin.userinfo = function (accessToken, openId, cb) {
	request.get('https://api.weixin.qq.com/sns/userinfo?access_token='+accessToken+'&openid='+openId+'&lang=en', function (err, res, result) {
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
};

Weixin.auth = function (accessToken, openId, cb) {
	request.get('https://api.weixin.qq.com/sns/auth?access_token='+accessToken+'&openid='+openId, function (err, responce, result) {
      if (err) {
      	return cb(err);
      }
      result = JSON.parse(result);
      if (result.errcode != 0) {
        return cb(result);
      } else {
        return cb(null);
      }
    });
};

Weixin.token = function (cb) {
	request.get('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+Weixin.appid+'&secret='+Weixin.secret, function (err, responce, token) {
        token = JSON.parse(token);
        if (token.access_token) {
        	return cb(null, token);
        } else {
        	return cb(err || token);
        }
    });
};

Weixin.ticket = function (cb) {
	request.get('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+Weixin.appid+'&secret='+Weixin.secret, function (err, responce, token) {
        token = JSON.parse(token);
        if (token.access_token) {
        	request.get('https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token='+token.access_token+'&type=jsapi', function (err, responce, ticket) {
		      ticket = JSON.parse(ticket);
		      if (ticket.errmsg == 'ok') {
		      	return cb(null, token, ticket);
		      } else {
		        return cb(err || ticket);
		      }
		    });
        } else {
        	return cb(err || token);
        }
    });	
};

Weixin.subscribe = function (access_token, openId, cb) {
	request.get('https://api.weixin.qq.com/cgi-bin/user/info?access_token='+access_token+'&openid='+openId, function (err, responce, info) {
      if (err) {
      	return cb(err);
      }
      info = JSON.parse(info);
      if (info.subscribe == 1) {
        return cb(null, true);
      } else {
        return cb(null, false);
      }
    });
};