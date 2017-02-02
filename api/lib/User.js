var Log = require('../lib/Log');
var Weixin = require('../lib/Weixin');
var Config = require('../lib/Config');

function User (){

}

module.exports = User;

var adString = ["adMood", "adUEFA", "adDPower", "adBlueMan"];

User.sharedToUsers_c = function (userContext, ad, cb){ //找出user 分享過的follower

  //console.log("26");
  share_c.findOne({sharedBy: userContext.openId, advertisement_c: ad}).exec(function(err, shareOne){
    //console.log("28");
    if(err){
      cb(err);
      return;
    }
    //console.log("33");
    if(!shareOne){
      //console.log("35");
      cb(null, []);
      //console.log("[]");
      return;
    }else{
      user.find({ where: {openId: {$in: shareOne.sharedTo}, ad: ad}, select:['openId']}).exec(function (err, sharedTo) {
        if(err){
          cb(err);
          return;
        }
        cb(null, sharedTo);
        //console.log("sharedTo[]");
        return;
      });
      
    }
  })
}

User.userExists = function (userOpenId, ad, cb){ //check user 是否存在DB
  user.findOne({openId: userOpenId, ad: ad}).exec(function(err, userOne){
    if(err){
      cb(err);
      return;
    }
    if(!userOne){
      cb(null, false);
      return;
    }else {
      cb(null, true);
      return;
    }
  });
}

User.shareAd_c = function (sharedBy, sharedTo, ad, cb){ //按制share點擊獲得積分的function
  Config.findOne(ad, function (err, configOne) {
    if (err) {
      return cb(err);
    }
    if(!configOne){
      console.log("no configOne");
      cb(null);
      return;
    }
    if(sharedBy==sharedTo||sharedBy=="wecast"){ //如果係公众號進入或進入自己分享的post，就不用加分
      // console.log("share: "+sharedBy);
      cb(null);
      return;
    }
    user.findOne({openId: sharedBy, ad: ad}).exec(function(err, userOne){
      if(err){
        cb(err);
        return;
      }
      if(!userOne){
        console.log(sharedBy + ad);
        cb({code: 400, msg: "User not found"});
        return;
      }else {
        share_c.findOne({sharedBy: sharedBy, advertisement_c: ad}).exec(function(err, shareOne){ //找尋是否原先已經加過分的function
          if(err){
            cb(err);
            return;
          }
          if(!shareOne){ //如果沒有分享過的記錄
            var sharedToArr = [];
            sharedToArr.push(sharedTo)
            share_c.create({sharedBy: sharedBy, sharedTo: sharedToArr, advertisement_c: ad}).exec(function(err){
              if(err){
                cb(err);
                return;
              }
              User.incrementCredit(sharedBy, 1, ad, cb);
              Log.create({action: "total_share_friends", openId: sharedBy, ad: ad}, function(err, results){
                
              });
              return;
            });
          }else{ 
            if(-1==shareOne.sharedTo.indexOf(sharedTo)){ //如果有記錄，找尋有沒有對應的follower
              console.log("sharedTo not found");
              var sharedToArr = shareOne.sharedTo;
              sharedToArr.push(sharedTo);
              shareOne.sharedTo = sharedToArr;
              shareOne.save(function(err){
                if(err){
                  console.log("err");
                  cb(err);
                  return;
                }
                User.incrementCredit(sharedBy, 1, ad, cb);
                Log.create({action: "total_share_friends", openId: sharedBy, ad: ad}, function(err, results){
                  //res.json(results);

                });
                return;
              })
            }
            cb(null);
          }


        });
      }
    });

  })
  

}

User.incrementCredit = function(userOpenId, increment, ad, cb){ //User增加credit時調用
  user.findOne({openId: userOpenId, ad: ad}).exec(function(err, userOne){
    if(err){
      cb(err);
      return;
    }
    if(!userOne){
      cb({code: 400, errMsg: "User not found"})
      return;
    }
    increment = parseFloat(increment);
    if(isNaN(increment)){
      cb({code: 400, errMsg: "Increment must be number"});
      return;
    }
    userOne.credit = userOne.credit + increment;
    userOne.save(function(err, savedUser){
      if(err){
        cb(err);
        return;
      }
      if (savedUser.parent) {
        User.incrementCredit(savedUser.parent, increment*0, ad, cb);
      } else {
        cb(null);
      }
  		

    })
  });
}
User.create = function(userInfo, cb){ //Create User, 如果原有就return現有資料
  user.findOne({openId: userInfo.openId, ad: userInfo.ad}).exec(function(err, userOne){
    if(err){
      cb(err);
      return;
    }
    if(!userOne){
      Config.adInfo(userInfo.ad, function(err, configOne) {
        if(err){
          cb(err);
          return;
        }
        if (configOne.levelsInfo) {
          var validate = new Date();
          validate = new Date(validate.getTime() + (configOne.levelsInfo.levelExp || 0) * 30 * 86400000); 
          userInfo.validate = validate;
        }
        user.create(userInfo).exec(function(err, userCreated){
          if(err){
            cb(err);
            return;
          }
          Log.create({action: "regist", openId: userCreated.openId, ad: userCreated.ad}, function(err, results){
              
          });
          cb(null, userCreated);
        });
      });

    }else{
        if (userInfo.accessToken) {
          userOne.accessToken = userInfo.accessToken;
        }
        if (userInfo.refreshToken) {
          userOne.refreshToken = userInfo.refreshToken;
        }
        if (userInfo.nickname) {
          userOne.nickname = userInfo.nickname;
        }
        if (userInfo.sex) {
          userOne.sex = userInfo.sex;
        }
        if (userInfo.province) {
          userOne.province = userInfo.province;
        }
        if (userInfo.city) {
          userOne.city = userInfo.city;
        }
        if (userInfo.country) {
          userOne.country = userInfo.country;
        }
        if (userInfo.headimgurl) {
          userOne.headimgurl = userInfo.headimgurl;
        }
        if (userInfo.language) {
          userOne.language = userInfo.language;
        }
        if (userInfo.unionId) {
          userOne.unionId = userInfo.unionId;
        }
        userOne.save(function (err, savedUser) {
          if(err){
            cb(err);
            return;
          }

          cb(null, savedUser);
        });
        
    }
    //console.log("229");
  });
}

User.auth = function (openId, ad, cb) {
  user.findOne({openId: openId, ad: ad}).exec(function(err, userOne){
    if(err){
      return cb(err);
    }
    if(!userOne){
      return cb(null, null);
    }
    return cb(null, userOne);
  });
};

User.find = function (options, cb) {
  user.find(options).exec(function (err, users) {
    if (err) {
      return cb(err);
    }
    return cb(null, users);
  });
}

User.count = function (options, cb) {
  user.count(options).exec(function (err, count) {
    if (err) {
      return cb(err)
    } else {
      return cb(null, count);
    }
  });
};

User.save = function (userOne, cb) {
  userOne.save(function (err, saved) {
    if (err) {
      return cb(err);
    }
    if (!saved) {
      return cb({errMsg: 'save error'});
    } else {
      return cb(null, saved)
    }
  });
}

User.todayLogin = function (userOne, cb) {
  var startOfDay = new Date();
  startOfDay.setHours(0,0,0,0);
  Log.find({action: 'login', openId: userOne.openId, date: {$gte: startOfDay}, ad: userOne.ad}, function (err, logs) {
    if (err) {
      return cb(err);
    }
    if (logs.length < 1) {
      return cb(null, false);
    } else {
      return cb(null, true);
    }
  });
};

User.yesterdayLogin = function (userOne, cb) {
  var startOfDay = new Date();
  startOfDay.setHours(0,0,0,0);
  var yesterday = new Date(startOfDay.getTime() - 86400 * 1000);
  Log.findOne({action: 'login', openId: userOne.openId, date: {$gte: yesterday, $lt: startOfDay}, ad: userOne.ad}, function (err, logOne) {
    if (err) {
      return cb(err);
    }
    if (logOne) {
      return cb(null, true);
    }
    return cb(null, false);
  });
}

User.destroy = function (ad, cb) {
  user.destroy({ad: ad}).exec(function(){
    return cb(true);
  });
}

User.initTestCredit = function (ad, secret, cb) {
  if (secret == 'kitkit!@#$') {
    user.update({ad: ad}, {credit: 100}).exec(function(err){
      return cb(true);
    });
  } else {
      return cb(null);
  }
};

User.levelUpCredit = function (userOne, cb) {
  Config.adInfo(userOne.ad, function (err, configOne) {
    if (err) {
      return cb(err);
    }
    var levelsInfo = configOne.levelsInfo;
    if (levelsInfo == undefined) {
      return cb({errMsg: 'no level found'})
    }
    var levelInfo = levelsInfo[userOne.level+1];
    if (levelInfo == undefined) {
      return cb({errMsg: 'no level up found'})
    }
    var options = {};
    if (levelInfo.upRequire == 'credit') {
      options.action = 'gainCredit';
    } else if (levelInfo.upRequire == 'redeemCredit') {
      options.action = 'redeemCredit';
    }
    if (levelInfo.upRange == 'year') {
      var startOfDay = new Date();
      startOfDay.setHours(0,0,0,0);
      startOfDay.setMonth(0);
      startOfDay.setDate(1);
      options.date = {$gte: startOfDay, $lt: new Date()}
    }
    options.ad = userOne.ad;
    options.openId = userOne.openId;
    
    Log.find(options, function (err, logs) {
      if (err) {
        return cb(err);
      }
      var temp = 0;
      logs.forEach(function (item, index, array) {
        temp += +item.detail;
      });

      return cb(null, temp);
    });
  });
};


