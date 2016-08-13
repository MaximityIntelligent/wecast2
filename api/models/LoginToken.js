module.exports = {
  identity: 'loginToken',
  attributes: {
  	openId: {type: 'string'},
    access_token: {type: 'string'},
    expires_in: {type: 'integer'},
    expireAt: {type: 'date'},
    isScan: {
    	type: 'boolean',
    	defaultsTo: false
    },
    isAuth: {
    	type: 'boolean',
    	defaultsTo: false
    }
  }
};