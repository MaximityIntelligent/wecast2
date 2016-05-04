/**
* ClickCount.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  identity: 'ClickCount',
  attributes: {
    name: {
      type: 'string',
      unique: true,
      primaryKey: true,
      required: true
    },
    clickCount: {
      type: 'integer',
      required: true
    }
  }
};
