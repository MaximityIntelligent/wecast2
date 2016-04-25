/**
* Redeem.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  identity: 'redeem_c',
  attributes: {
    user: {model: 'user', required: true},
    prizeRedeem: {
      type: 'array',
      required: true,
      defaultsTo: []
    },
    advertisement: {
      type: 'string',
      required: true
    }

  }
};
