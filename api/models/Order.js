module.exports = {
  identity: 'order',
  attributes: {
    ad: {
      type: 'string',
      required: true
    },
    oid: {
      type: 'integer',
      required: true
    },
    openId: {
      type: 'string',
      required: true
    },
    done: {
      type: 'boolean',
      defaultsTo: false
    },
    address: {
      type: 'string'
    },
    phone: {
      type: 'string',
      required: true
    },
    list: {
      type: 'array',
      defaultsTo: []
    },
    deleted: {
      type: 'boolean',
      defaultsTo: false
    },
    shipping: {
      type: 'string',
      enum: ['pending', 'ready', 'shipping', 'arrived'],
      defaultsTo: 'pending'
    },
    record: {
      type: 'array',
      defaultsTo: []
    }
  }
};