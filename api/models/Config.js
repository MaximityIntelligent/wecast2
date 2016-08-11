module.exports = {
  identity: 'config',
  attributes: {
    ad: {
      type: 'string',
      required: true
    },
    title: {
      type: 'string'
    },
    prizesInfo: {
      type: 'json',
      defaultsTo: {
        'none' : {
            'credit': 0,
            'name': '無奬',
            'amount': 100000
        }
      }
    },
    subscribeBonus: {
      type: 'float',
      defaultsTo: 0
    },
    loginBonus: {
      type: 'float',
      defaultsTo: 0
    },
    questionnaireBonus: {
      type: 'float',
      defaultsTo: 0
    },
    votesInfo: {
      type: 'json',
      defaultsTo: {
        votes: [],
        bonus: 0
      }
    }

  }
};