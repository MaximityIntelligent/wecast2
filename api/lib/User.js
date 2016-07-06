
function User (){

}

module.exports = User;

var adString = "adUEFA";

User.sharedToUsers_c = function (userContext, adId, cb){ //找出user 分享過的follower

  //console.log("26");
  share_c.findOne({sharedBy: userContext.openId, advertisement_c: adId}).exec(function(err, shareOne){
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
      user.find({ where: {openId: {$in: shareOne.sharedTo}}, select:['openId', 'credit', 'headimgurl']}).exec(function (err, sharedTo) {
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

User.userExists = function (userOpenId, adId, cb){ //check user 是否存在DB
  user.findOne({openId: userOpenId, ad: adId}).exec(function(err, userOne){
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

User.shareAd_c = function (sharedBy, sharedTo, adId, cb){ //按制share點擊獲得積分的function
  var ad_c = [adString];
  if(-1==ad_c.indexOf(adId)){
    //console.log("121");
    cb(null);
    return;
  }
  if(sharedBy==sharedTo||sharedBy=="wecast"){ //如果係公众號進入或進入自己分享的post，就不用加分
    //console.log("127"+sharedBy);
    cb(null);
    return;
  }
  this.userExists(sharedBy, adId, function(err, userExists){
    if(err){
      cb(err);
      return;
    }
    if(!userExists){
      cb({code: 400, msg: "User not found"});
      return;
    }
    share_c.findOne({sharedBy: sharedBy, advertisement_c: adId}).exec(function(err, shareOne){ //找尋是否原先已經加過分的function
      if(err){
        cb(err);
        return;
      }
      if(!shareOne){ //如果沒有分享過的記錄
        var sharedToArr = [];
        sharedToArr.push(sharedTo)
        share_c.create({sharedBy: sharedBy, sharedTo: sharedToArr, advertisement_c: adId}).exec(function(err){
          if(err){
            cb(err);
            return;
          }
          User.incrementCredit(sharedBy, 1, adId, cb);
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
            User.incrementCredit(sharedBy, 1, adId, cb);
            return;
          })
        }
        cb(null);
      }


    });
  })

}

User.incrementCredit = function(userOpenId, increment, adId, cb){ //User增加credit時調用
  user.findOne({openId: userOpenId, ad: adId}).exec(function(err, userOne){
    if(err){
      cb(err);
      return;
    }
    if(!userOne){
      cb({code: 400, errMsg: "User not found"})
      return;
    }
    increment = parseInt(increment);
    if(isNaN(increment)){
      cb({code: 400, errMsg: "Increment must be integer"});
      return;
    }
    userOne.credit = userOne.credit + increment;
    userOne.save(function(err){
      if(err){
        cb(err);
        return;
      }
      var date = new Date();
  		log.create({action: "total_share_friends", openId: userOpenId, date: new Date(), ad: adId}).exec(function(err, results){
  			//res.json(results);
        cb(null);
  		});

    })
  });
}
User.create = function(userInfo, cb){ //Create User, 如果原有就return現有資料
  user.findOne({openId: userInfo.openId}).exec(function(err, userOne){
    if(err){
      cb(err);
      return;
    }
    if(!userOne){
      user.create(userInfo).exec(function(err, userCreated){
        if(err){
          cb(err);
          return;
        }
        cb(null, userCreated);
      });
    }else{
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
User.draw = function(userOpenId, cb){ //未有用到
  user.findOne({openId: userOpenId}).exec(function(err, userOne){
    if(err||!userOne){
      cb(err);
      return;
    }
    if(0>userOne.drawChance){
      cb(err);
      return;
    }
    userOne.drawChance = userOne.drawChance - 1;
    userOne.save(function(err){
      if(err){
        cb(err);
        return;
      }
      cb(null, {drawChance: userOne.drawChance, drawResult: 'Lose'});
    })

  });
}
