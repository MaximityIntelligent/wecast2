
function User (){

}

module.exports = User;



User.sharedToUsers_c = function (userContext, adId, cb){

  console.log("26");
  share_c.findOne({sharedBy: userContext.openId, advertisement_c: adId}).exec(function(err, shareOne){
    console.log("28");
    if(err){
      cb(err);
      return;
    }
    console.log("33");
    if(!shareOne){
      console.log("35");
      cb(null, []);
      console.log("[]");
      return;
    }else{
      cb(null, shareOne.sharedTo);
      console.log("sharedTo[]");
      return;
    }
  })
}

User.userExists = function (userOpenId, cb){
  user.findOne({openId: userOpenId}).exec(function(err, userOne){
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

User.shareAd_c = function (sharedBy, sharedTo, adId, cb){
  var ad_c = ['easywash'];
  if(-1==ad_c.indexOf(adId)){
    console.log("121");
    cb(null);
    return;
  }
  if(sharedBy==sharedTo||sharedBy=="wecast"){
    console.log("127"+sharedBy);
    cb(null);
    return;
  }
  this.userExists(sharedBy, function(err, userExists){
    if(err){
      cb(err);
      return;
    }
    if(!userExists){
      cb({code: 400, msg: "User not found"});
      return;
    }
    share_c.findOne({sharedBy: sharedBy, advertisement_c: adId}).exec(function(err, shareOne){
      if(err){
        cb(err);
        return;
      }
      if(!shareOne){
        var sharedToArr = [];
        sharedToArr.push(sharedTo)
        share_c.create({sharedBy: sharedBy, sharedTo: sharedToArr, advertisement_c: adId}).exec(function(err){
          if(err){
            cb(err);
            return;
          }
          User.incrementCredit(sharedBy, 1, cb);
          return;
        });
      }else{
        if(-1==shareOne.sharedTo.indexOf(sharedTo)){
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
            User.incrementCredit(sharedBy, 1, cb);
            return;
          })
        }
        cb(null);
      }


    });
  })

}

User.incrementCredit = function(userOpenId, increment, cb){
  user.findOne({openId: userOpenId}).exec(function(err, userOne){
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
      cb(null);
    })
  });
}
User.create = function(userOpenId, cb){
  user.findOne({openId: userOpenId}).exec(function(err, userOne){
    if(err){
      cb(err);
      return;
    }
    if(!userOne){
      user.create({openId: userOpenId, credit: 0}).exec(function(err, userCreated){
        if(err){
          cb(err);
          return;
        }
        cb(null, userCreated);
      });
    }else{
        cb(null, userOne);
    }
    console.log("229");
  });
}
User.draw = function(userOpenId, cb){
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
