/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  identity: 'user',
  attributes: {
    openId: {
          type: 'string',
          required: true,
          primaryKey: true,
          unique: true
    },
    credit: {
      type: 'integer',
      defaultsTo: 0,
      required: true
    },
    nickname: {
          type: 'string'
    },
    sex: {
          type: 'string'
    },
    province: {
          type: 'string'
    },
    city: {
          type: 'string'
    },
    country: {
          type: 'string'
    },
    headimgurl: {
          type: 'string'
    },
    language: {
          type: 'string'
    }

  }
};
