/**
* Merchant.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  identity: 'merchant',
  attributes: {
    openId: {
          type: 'string',
          required: true,
          primaryKey: true,
          unique: true
    },
    ads: {
      type: 'array',
      required: true,
      defaultsTo: []
    },
    role: {
      type: 'string',
      defaultsTo: 'normal',
      enum: ['normal', 'admin'];
    },
    username: {
      type: 'string'
    },
    phone: {
      type: 'string'
    },
    email: {
      type: 'string'
    },
    age:{
      type: 'integer'
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
    },
    unionId: {
          type: 'string'
    }

  }
};
