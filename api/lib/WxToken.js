var Weixin = require('../lib/Weixin');

function WxToken (){

}

module.exports = WxToken;

WxToken.validToken = function (cb) {
    wxToken.findOne({expireAt: {'>': new Date()}}).sort({ createdAt: 'desc' }).exec(function (err, wxTokenOne) {
        if (err) {
      		return cb(err);
        }
        if (!wxTokenOne) {
          //console.log('-----no token-----');

            Weixin.ticket(function (err, token, ticket) {
              if (err) {
                return cb(err);
              } else {
                var expireAt = new Date();
                expireAt = new Date(expireAt.getTime() + (ticket.expires_in - 60 * 60) * 1000);
                wxToken.create({access_token: token.access_token, expires_in: ticket.expires_in, jsapi_ticket: ticket.ticket, expireAt: expireAt}).exec(function (err, createdToken) {
                  // body...
                  console.log('------new token----: ');
                  console.log(createdToken);
                  return cb(null, createdToken);
                });
              }
            });
          
        } else {
        	return cb(null, wxTokenOne);
        	//console.log('------old token----');
        	//console.log(wxTokenOne);
        }
    });
};