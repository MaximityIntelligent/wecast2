/**
* Log.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  identity: 'log',
  attributes: {
    openId: {type: 'string'},
    action: {type: 'string'},
    date: {type: 'date'},
    ad: {type: 'string'},
    detail: {type: 'string'}
  }
};
