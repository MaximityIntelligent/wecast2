
var app = angular.module('data', ['chart.js']).config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.timeout = 5000;
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

var debug = true;

app.controller('IndexCtrl', [
'$scope','$http', '$timeout', '$interval', '$location', '$anchorScroll',
function($scope, $http, $timeout, $interval, $location, $anchorScroll){
  $scope.chartWidth = window.innerWidth*0.9;
  $scope.chartHeight = window.innerHeight*0.5;
  $scope.color = ["#46BFBD", "#FDB45C", "#212121", "#64af9c", "#6b1f3c", "#127690", "#a2798f", "#008b8b", "#99ccff", "#cc99ff", "#9feaae", "#40d65d", "#65ada2", "#5ee4bb", "#9ffff7", "#2412b4", "#34d491", "#da6665", "#f3d681", "#b9b9b9", "#b9b9b9", "#ffae1a", "#2137ff", "#d8941a", "#d8941a", "#ff2a1a", "#e6b3e6", "#e6b3e6", "#a8e4f0", "#6ef79c", "#5cf53d", "#d6d65c", "#adb87a", "#d6995c", "#f76e6e", "#f08a75", "#eb9947", "#ffdd33", "#cccc00", "#99eb47", "#75f075", "#85e0b3", "#33ffdd","#998cd9"];
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
  $scope.actionMap = {};
  $scope.actionMap['regist'] = "註冊" ;
  $scope.actionMap['share_friend'] = "微信朋友分享次數" ;
  $scope.actionMap['share_timeline'] = "微信朋友圈分享次數" ;
  $scope.actionMap['share_button'] = "分享按鈕" ;
  $scope.actionMap['about_easywash'] = "活動詳情" ;
  $scope.actionMap['rules'] = "活動規則" ;
  $scope.actionMap['address'] = "地址MAP";
  $scope.actionMap['google_map'] = "立即前往" ;
  $scope.actionMap['tel'] = "CALL客服";
  $scope.actionMap['prize1_page'] = "獎品1詳情";
  $scope.actionMap['prize2_page'] = "獎品2詳情" ;
  $scope.actionMap['redeem_prize1'] = "獎品1成功領獎";
  $scope.actionMap['redeem_prize2'] = "獎品2成功領獎";
  $scope.actionMap['continue_collect'] = "繼續儲分";
  $scope.actionMap['go_wash'] = '去洗車';
  $scope.actionMap['prize1_return'] = "獎品1返回";
  $scope.actionMap['prize2_return'] = "獎品2返回";
  $scope.actionMap['about_easywash_return'] = "活動詳情返回";
  $scope.actionMap['thankyou_page'] = "Thank You頁面";
  $scope.actionMap['total_share_friends'] = "分享朋友總數";
  $scope.actionMap['redeem_vote'] = "雙倍積分";

  $scope.labels = [];
  $scope.series = [];
  $scope.data = [];
  $scope.onClick = function (points, evt) {
    console.log(points, evt);
  };
  $scope.checkServer = function () {
    $http.get('/api/checkAlive').success(function(data, status, headers, config) {
      if (data.errMsg == "ok") {
        $scope.status = "on";
      } else {
        $scope.status = "off";
      }
      $timeout(function () {
        $scope.checkServer();
      }, 5000);
    }).error(function(data, status, headers, config) {
      $scope.status = "off";
      $timeout(function () {
        $scope.checkServer();
      }, 5000);
    });
  };
  // Simulate async data update 


  $scope.init = function () {
    var now = new Date();
    console.log(now);
    $scope.year = now.getFullYear();
    $scope.month = now.getMonth()+1;
    $scope.date = now;
  };

  $scope.allAction = function () {
    console.log("click all");
    angular.forEach($scope.action, function(value, key) {
      $scope.action[key] = $scope.clickAll;
    });
  };
  $scope.getMonthData = function () {
    $scope.updatePromise = undefined;
    $scope.buttonAction = 'accessMonth';
    $http.post('/log/access', {buttonAction:$scope.buttonAction, ad:$scope.ad, action: $scope.action, accumulated: $scope.accumulated, year:$scope.year, month:$scope.month}
      ).success(function(data, status, headers, config) { 
        console.log(data);
        $scope.accessTotal = {};
        var days = [];
        for (var i=1; i<=31; i++) {
          days.push(""+i);
        }
        $scope.labels = days;
        $scope.series = Object.keys(data.daysAccess);
        var tempDataset = [];
        Object.keys(data.daysAccess).forEach(function(action) {
          var tempTotal = 0;
          if ($scope.accumulated) tempTotal = data.offsetAccess[action] || 0;
          var tempData = [];
          for (var i=1; i<=31; i++) {
            if ($scope.accumulated) {
              tempTotal += data.daysAccess[action][""+i] || 0;
              tempData.push(tempTotal);
            } else {
              tempData.push(data.daysAccess[action][""+i] || 0);
              tempTotal += data.daysAccess[action][""+i] || 0;
            }
            
          }
          tempDataset.push(tempData);
          $scope.accessTotal[action] = tempTotal;
        });
        $scope.access = data.daysAccess;
        $scope.offsetAccess = data.offsetAccess;
        $scope.totalUser = data.totalUser;
        // console.log({data: tempDataset, total: $scope.accessTotal});
        $scope.data = tempDataset;
        if ($scope.auto) {
          $scope.updatePromise = $timeout(function () {
            $scope.getMonthData();
          }, 60000);
        }
      }).error(function(data, status, headers, config) {

      });

  };
  $scope.getDateData = function () {
    $scope.updatePromise = undefined;
    $scope.buttonAction = 'accessDate';
    $http.post('/log/access', {buttonAction:$scope.buttonAction, ad:$scope.ad, action: $scope.action, accumulated: $scope.accumulated, date:$scope.date.toISOString()}
      ).success(function(data, status, headers, config) { 
        console.log(data);
        $scope.accessTotal = {};
        var hours = [];
        for (var i=0; i< 24; i++) {
          hours.push(""+i);
        }
        $scope.labels = hours;
        $scope.series = Object.keys(data.hoursAccess).map(function (key) {
            return $scope.actionMap[key];
        });
        var tempDataset = [];
        Object.keys(data.hoursAccess).forEach(function(action) {
          var tempTotal = 0;
          if ($scope.accumulated) tempTotal = data.offsetAccess[action] || 0;
          var tempData = [];
          for (var i=0; i< 24; i++) {
            if ($scope.accumulated) {
              tempTotal += data.hoursAccess[action][""+i] || 0;
              tempData.push(tempTotal);
            } else {
              tempData.push(data.hoursAccess[action][""+i] || 0);
              tempTotal += data.hoursAccess[action][""+i] || 0;
            }
            
          }
          tempDataset.push(tempData);
          $scope.accessTotal[action] = tempTotal;
        });
        $scope.access = data.hoursAccess;
        $scope.offsetAccess = data.offsetAccess;
        $scope.totalUser = data.totalUser;
        // console.log({data: tempDataset, total: $scope.accessTotal});
        $scope.data = tempDataset;
        if ($scope.auto) {
          $scope.updatePromise = $timeout(function () {
            $scope.getMonthData();
          }, 60000);
        }

      }).error(function(data, status, headers, config) {

      });
    
  };
  $scope.chartColor = function (index) {
    return {'background-color':$scope.color[index]};
  };
  $scope.renderChart = function () {
    
  };
  $scope.changeAccumulated = function () {
    if ($scope.buttonAction == "accessMonth") {
      $scope.series = Object.keys($scope.access).map(function (key) {
            return $scope.actionMap[key];
        });
      console.log($scope.series);
      var tempDataset = [];
      Object.keys($scope.access).forEach(function(action) {
        console.log(action);
        var tempTotal = 0;
        if ($scope.accumulated) tempTotal = $scope.offsetAccess[action] || 0;
        var tempData = [];
        for (var i=1; i<=31; i++) {
          if ($scope.accumulated) {
            tempTotal += $scope.access[action][""+i] || 0;
            tempData.push(tempTotal);
          } else {
            tempData.push($scope.access[action][""+i] || 0);
            tempTotal += $scope.access[action][""+i] || 0;
          }
          
        }
        tempDataset.push(tempData);
      });
      $scope.data = tempDataset;
    } else if ($scope.buttonAction == "accessDate") {
      $scope.series = Object.keys($scope.access).map(function (key) {
            return $scope.actionMap[key];
        });
      console.log($scope.series);
      var tempDataset = [];
      Object.keys($scope.access).forEach(function(action) {
        console.log(action);
        var tempTotal = 0;
        if ($scope.accumulated) tempTotal = $scope.offsetAccess[action] || 0;
        var tempData = [];
        for (var i=0; i< 24; i++) {
          if ($scope.accumulated) {
            tempTotal += $scope.access[action][""+i] || 0;
            tempData.push(tempTotal);
          } else {
            tempData.push($scope.access[action][""+i] || 0);
            tempTotal += $scope.access[action][""+i] || 0;
          }
          
        }
        tempDataset.push(tempData);
      });
      $scope.data = tempDataset;
    }
  };
  
}]);
