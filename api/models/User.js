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
          required: true
          //primaryKey: true,
          //unique: true
    },
    credit: {
      type: 'float',
      defaultsTo: 1,
      required: true
    },
    ad: {
      type: 'string',
      required: true
    },
    parent: {
      type: 'string'
    },
    vote: {
      type: 'string'
    },
    isRedeemVote: {
      type: 'boolean',
      defaultsTo: false
    },
    isQuestionnaire: {
      type: 'boolean',
      defaultsTo: false
    },
    subscribe: {
      type: 'boolean',
      defaultsTo: false
    },
    isRedeemSubscribe: {
      type: 'boolean',
      defaultsTo: false
    },
    loginDays: {
      type: 'integer',
      defaultsTo: 0
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
          //primaryKey: true,
          //unique: true
    },
    deleted: {
      type: 'boolean',
      defaultsTo: false
    },
    level: {
      type: 'integer',
      defaultsTo: 0
    },
    validate: {
      type: 'date'
    },
    active: {
      type: 'boolean',
      defaultsTo: false
    },
    gainCredit: {
      type: 'float',
      defaultsTo: 0
    },
    redeemCredit: {
      type: 'float',
      defaultsTo: 0
    }
  }
};
