function Merchant (){

}

module.exports = Merchant;

Merchant.findOrCreate = function (merchantInfo, cb) {
	merchant.findOne({openId: merchantInfo.openId}).exec(function (err, found) {
		if (err) {
			return cb(err);
		}
		if (!found) {
			merchant.create(merchantInfo).exec(function (err, created) {
				if (err) {
					return cb(err);
				}
				console.log('create merchant');
				return cb(null, created);
			});
		} else {
	        if (merchantInfo.nickname) {
	          found.nickname = merchantInfo.nickname;
	        }
	        if (merchantInfo.sex) {
	          found.sex = merchantInfo.sex;
	        }
	        if (merchantInfo.province) {
	          found.province = merchantInfo.province;
	        }
	        if (merchantInfo.city) {
	          found.city = merchantInfo.city;
	        }
	        if (merchantInfo.country) {
	          found.country = merchantInfo.country;
	        }
	        if (merchantInfo.headimgurl) {
	          found.headimgurl = merchantInfo.headimgurl;
	        }
	        if (merchantInfo.language) {
	          found.language = merchantInfo.language;
	        }
	        if (merchantInfo.unionId) {
	          found.unionId = merchantInfo.unionId;
	        }
	        found.save(function (err, saved) {
	          if(err){
	            return cb(err);
	            
	          }
	          console.log('found merchant');
	          return cb(null, saved);
	        });
        
    	}
		
	});
};

Merchant.findOne = function (openId, cb) {
	merchant.findOne({openId: openId}).exec(function (err, found) {
		if (err) {
			return cb(err);
		}
		if (!found) {
			return cb(null, null);
		} else {
            return cb(null, found);
    	}
		
	});
};