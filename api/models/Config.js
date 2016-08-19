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
    levelsInfo: {
      type: 'array',
      defaultsTo: []
    },
    subscribeBonus: {
      type: 'float',
      defaultsTo: 0
    },
    loginBonus: {
      type: 'array',
      defaultsTo: []
    },
    loginBonusCycle: {
      type: 'boolean',
      defaultsTo: false
    },
    loginBonusContinuity: {
      type: 'boolean',
      defaultsTo: false
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