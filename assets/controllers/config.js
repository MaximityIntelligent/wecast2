var app = angular.module('config', ['chart.js']).config(['$httpProvider', function($httpProvider) {
    //$httpProvider.defaults.timeout = 130000;
}]).config(['ChartJsProvider', function (ChartJsProvider) {
    // Configure all charts 
    ChartJsProvider.setOptions({
      chartColors: ["#46BFBD", "#FDB45C", "#212121", "#64af9c", "#6b1f3c", "#127690", "#a2798f", "#008b8b", "#99ccff", "#cc99ff", "#9feaae", "#40d65d", "#65ada2", "#5ee4bb", "#9ffff7", "#2412b4", "#34d491", "#da6665", "#f3d681", "#b9b9b9", "#b9b9b9", "#ffae1a", "#2137ff", "#d8941a", "#d8941a", "#ff2a1a", "#e6b3e6", "#e6b3e6", "#a8e4f0", "#6ef79c", "#5cf53d", "#d6d65c", "#adb87a", "#d6995c", "#f76e6e", "#f08a75", "#eb9947", "#ffdd33", "#cccc00", "#99eb47", "#75f075", "#85e0b3", "#33ffdd","#998cd9"],
      responsive: true,
      bezierCurve: true
    });
    // Configure all line charts 
    ChartJsProvider.setOptions('line', {
      showLines: true
    });
  }]);

var QueryString = function () {  //提取由公众號或分享LINK時的CODE參數
  // This function is anonymous, is executed immediately and
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  //alert(window.location.search+" "+query);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
        // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
        // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
      query_string[pair[0]] = arr;
        // If third or later entry with this name
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  }
    return query_string;
}();

var snsapi = 'snsapi_userinfo';
var host = 'lb.ibeacon-macau.com';
var appid = 'wxbb0b299e260ac47f';

app.controller('IndexCtrl', [
'$scope','$http', '$timeout', '$interval', '$location', '$anchorScroll',
function($scope, $http, $timeout, $interval, $location, $anchorScroll){
  $scope.today = new Date();
  $scope.action = {
    regist : false,
    share_friend : false,
    share_timeline : false,
    share_button : false,
    rules : false,
    google_map : false,
    tel : false,
    redeem_prize1 : false,
    redeem_prize2 : false,
    continue_collect : false,
    thankyou_page : false,
    total_share_friends : false,
    redeem_vote : false
  };
  $scope.actionMap = {
    regist: "註冊",
    share_friend: "微信朋友分享次數",
    share_timeline: "微信朋友圈分享次數",
    share_button: "分享按鈕",
    about_easywash: "活動詳情",
    rules: "微信朋友分享次數",
    address: "活動規則",
    google_map: "地址MAP",
    tel: "CALL客服",
    prize1_page: "獎品1詳情",
    prize2_page: "獎品2詳情",
    redeem_prize1: "獎品1成功領獎",
    redeem_prize2: "獎品2成功領獎",
    continue_collect: "繼續儲分",
    go_wash: "去洗車",
    prize1_return: "獎品1返回",
    prize2_return: "獎品2返回",
    about_easywash_return: "活動詳情返回",
    thankyou_page: "Thank You頁面",
    total_share_friends: "分享朋友總數",
    redeem_vote: "Thank 雙倍積分",
    
  };

  $scope.labels = [];
  $scope.series = [];
  $scope.data = [];
  $scope.onClick = function (points, evt) {
    console.log(points, evt);
  };
  // Simulate async data update 
  $scope.init = function () {
    $http.get('/config/getConfigs').success(function(data, status, headers, config) {
      $scope.configs = data;
    }).error(function(data, status, headers, config) {

    });
  };

  $scope.initWXqrCode = function () {
    $scope.tokenError = false;
    $scope.scanSuccess = false;
    $scope.loginSuccess = false;
    $scope.qrImgUrl = "http://placehold.it/250x250";
    $http.get('/config/initLoginToken').success(function(data, status, headers, config) {
      console.log(data);
      $scope.token = data.token;
      var url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid='+appid+'&redirect_uri=http%3A%2F%2F'+host+'%2F'+'wx_qrconnect'+'&response_type=code&scope='+snsapi+'&state='+data.token.id+'#wechat_redirect';
      url = encodeURIComponent(url);
      console.log(url);
      $scope.qrImgUrl = "http://chart.apis.google.com/chart?cht=qr&chl="+url+"&chs=250x250";
      $scope.watchScan();
    }).error(function(data, status, headers, config) {

    });
  };

  $scope.watchScan = function () {
    $http.get('/config/checkScan?tokenId='+$scope.token.id).success(function(data, status, headers, config) {
      if (data.scan == true) {
        $scope.scanSuccess = true;
        $scope.watchLogin();
      } else {
        $scope.tokenError = true;
      }
    }).error(function(data, status, headers, config) {
      $scope.tokenError = true;
    });
  };

  $scope.watchLogin = function () {
    $http.get('/config/checkLogin?tokenId='+$scope.token.id).success(function(data, status, headers, config) {
      if (data.auth == true) {
        $scope.loginSuccess = true;
      } else {
        $scope.tokenError = true;
      }
    }).error(function(data, status, headers, config) {
      $scope.tokenError = true;
    });
  };

  $scope.select = function (ad) {
    if (ad == '') return;
    $http.get('/config/createConfig?ad='+ad).success(function(data, status, headers, config) {
      console.log(data);
      $scope.selectConfig = data;
      if ($scope.selectConfig.votesInfo.voteExp) {
        $scope.selectConfig.votesInfo.voteExp = new Date($scope.selectConfig.votesInfo.voteExp);
      }
      if ($scope.selectConfig.votesInfo.voteStart) {
        $scope.selectConfig.votesInfo.voteStart = new Date($scope.selectConfig.votesInfo.voteStart);
      }
      if ($scope.selectConfig.votesInfo.redeemExp) {
        $scope.selectConfig.votesInfo.redeemExp = new Date($scope.selectConfig.votesInfo.redeemExp);
      }
    }).error(function(data, status, headers, config) {

    });
  };

  $scope.update = function (config) {
    console.log(config);
    $scope.updateOK = false;
    $scope.updateFail = false;
    $http.post('/config/updateConfig', config).success(function(data, status, headers, config) {
      $scope.selectConfig = data;
      if ($scope.selectConfig.votesInfo.voteExp) {
        $scope.selectConfig.votesInfo.voteExp = new Date($scope.selectConfig.votesInfo.voteExp);
      }
      if ($scope.selectConfig.votesInfo.voteStart) {
        $scope.selectConfig.votesInfo.voteStart = new Date($scope.selectConfig.votesInfo.voteStart);
      }
      if ($scope.selectConfig.votesInfo.redeemExp) {
        $scope.selectConfig.votesInfo.redeemExp = new Date($scope.selectConfig.votesInfo.redeemExp);
      }
      $scope.updateOK = true;
    }).error(function(data, status, headers, config) {
      $scope.updateFail = true;
    });
  }
  $scope.create = function (ad) {
    if (ad == '') return;
    $http.get('/config/createConfig?ad='+ad).success(function(data, status, headers, config) {
      $scope.selectConfig = data;
      $scope.configs.push(data);
      $scope.ad = data;
    }).error(function(data, status, headers, config) {
      
    });
  };

  $scope.createPrize = function (prize) {
    $scope.updateOK = false;
    $scope.updateFail = false;
    if (prize == '') {
      return;
    }
    if ($scope.selectConfig.prizesInfo[prize]) {
      return;
    } 
    var temp = $scope.selectConfig.prizesInfo[prize];
    $scope.selectConfig.prizesInfo[prize] = {
                                                'credit': 1,
                                                'name': prize+'_name',
                                                'amount': 100000
                                            };
    $http.post('/config/createPrize', {ad: $scope.selectConfig.ad, prize: prize}).success(function(data, status, headers, config) {
      $scope.selectConfig.prizesInfo[prize] = data;
      $scope.updateOK = true;
    }).error(function(data, status, headers, config) {
      $scope.selectConfig.prizesInfo[prize] = temp;
      $scope.updateFail = true;
    });
    
  }
  $scope.deletePrize = function (prize) {
    console.log(prize);
  };
  $scope.createVote = function (vote) {
    if ($scope.selectConfig.votesInfo.votes.indexOf(vote) != -1) {
      return;
    }
    $scope.updateOK = false;
    $scope.updateFail = false;
    var temp = $scope.selectConfig.votesInfo.votes;
    $scope.selectConfig.votesInfo.votes.push(vote);
    $http.post('/config/createVote', {ad: $scope.selectConfig.ad, vote: vote}).success(function(data, status, headers, config) {
        $scope.selectConfig.votesInfo.votes.push(data);
        $scope.updateOK = true;
      }).error(function(data, status, headers, config) {
        $scope.selectConfig.votesInfo.votes = temp;
        $scope.updateFail = true;
      });
  };
  $scope.updateVoteResult = function (vote) {
    $scope.updateOK = false;
    $scope.updateFail = false;
    if ($scope.selectConfig.votesInfo.voteResult == vote) {
      var temp = $scope.selectConfig.votesInfo.voteResult;
      $scope.selectConfig.votesInfo.voteResult = undefined;
      $http.post('/config/updateVoteResult', {ad: $scope.selectConfig.ad}).success(function(data, status, headers, config) {
        $scope.updateOK = true;
      }).error(function(data, status, headers, config) {
        $scope.selectConfig.votesInfo.voteResult = temp;
        $scope.updateFail = true;
      });
    } else {
      var temp = $scope.selectConfig.votesInfo.voteResult;
      $scope.selectConfig.votesInfo.voteResult = vote;
      $http.post('/config/updateVoteResult', {ad: $scope.selectConfig.ad, vote: vote}).success(function(data, status, headers, config) {
        $scope.selectConfig.votesInfo.voteResult = data;
        $scope.updateOK = true;
      }).error(function(data, status, headers, config) {
        $scope.selectConfig.votesInfo.voteResult = temp;
        $scope.updateFail = true;
      });
    }
  };
  $scope.selectLoginBonus = function (index) {
    console.log(index);
    $scope.newLoginBonus = $scope.selectConfig.loginBonus[index];
  };
  $scope.createOrEditLoginBonus = function (newLoginBonus) {
    $scope.updateOK = false;
    $scope.updateFail = false;
    var temp = $scope.selectConfig.loginBonus;
    if (!$scope.selectBonus) {
      $scope.selectConfig.loginBonus.push(newLoginBonus);
    } else {
      $scope.selectConfig.loginBonus[$scope.selectBonus] = newLoginBonus;
    }
    $http.post('/config/createOrEditLoginBonus', {ad: $scope.selectConfig.ad, index: $scope.selectBonus, loginBonus: newLoginBonus}).success(function(data, status, headers, config) {
      $scope.updateOK = true;
    }).error(function(data, status, headers, config) {
      $scope.selectConfig.loginBonus = temp;
      $scope.updateFail = true;
    });
    $scope.selectBonus = undefined;
  };
  $scope.deleteLoginBonus = function () {
    $scope.updateOK = false;
    $scope.updateFail = false;
    var temp = $scope.selectConfig.loginBonus;
    if ($scope.selectBonus) {
      $scope.selectConfig.loginBonus.splice($scope.selectBonus, 1);
      $http.post('/config/deleteLoginBonus', {ad: $scope.selectConfig.ad, index: $scope.selectBonus}).success(function(data, status, headers, config) {
        $scope.updateOK = true;
      }).error(function(data, status, headers, config) {
        $scope.selectConfig.loginBonus = temp;
        $scope.updateFail = true;
      });
    }

  }
  $scope.voteStyle = function (vote) {
    if ($scope.selectConfig.votesInfo.voteResult == vote) {
      return {'color': 'white' ,'background-color': 'royalblue'};
    }
    return {'color': 'white' ,'background-color': 'silver'};
  }
  $scope.allAction = function () {
    console.log("click all");
    angular.forEach($scope.action, function(value, key) {
      $scope.action[key] = $scope.clickAll;
    });
  };



  

}]);
