module.exports = {
  identity: 'product',
  attributes: {
    pid: {
      type: 'integer',
      required: true,
      unique: true
    },
    name: {
      type: 'string',
      required: true
    },
    description: {
      type: 'string'
    },
    specification: {
      type: 'array',
      defaultsTo: []
    },
    imgUrl: {
      type: 'string'
    }
  }
};