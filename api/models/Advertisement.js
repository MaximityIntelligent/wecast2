/**
* Advertisement.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  identity: 'advertisement',
  attributes: {
    title: {type: 'string', required: true},
    content: {type: 'string', required: true},
    drawInfo: {type: 'string', required: true},
    image: {model: 'image'}
  }
};
