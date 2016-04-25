/**
* Image.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  identity: 'image',
  attributes: {
    format: {
      type: 'text',
      required: true
    },
    publicId: {
      type: 'text',
      required: true
    }
  }
};
