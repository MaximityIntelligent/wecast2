
var app = angular.module('wx-qrconnect', []).config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.timeout = 5000;
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
var code = QueryString.code;
var tokenId = QueryString.state;
/*
if(typeof QueryString.code == 'undefined'){
  window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid='+appid+'&redirect_uri=http%3A%2F%2Fwecast.ibeacon-macau.com%2Feasywash%3FsharedBy%3Dwecast%26ad%3Deasywash&response_type=code&scope=snsapi_base#wechat_redirect';
  return;
}*/
// var snsapi = 'snsapi_base';
var snsapi = 'snsapi_userinfo';
var host = 'lb.ibeacon-macau.com';
var appid = 'wxbb0b299e260ac47f';

app.controller('IndexCtrl', [
'$scope','$http', '$timeout', '$interval', '$location', '$anchorScroll',
function($scope, $http, $timeout, $interval, $location, $anchorScroll){
 
  $scope.init = function() // 初始化頁面
  {
    
    $http.get('/api/wx_qrconnect?code='+code+'&tokenId='+tokenId)
      .success(function(data, status, headers, config) { 

          $scope.userInfo = data.merchantInfo;
          $scope.token = data.token;
      })
      .error(function(data, status, headers, config) { //如果從外部連結返回時會遇到code error問題，就要重新定向

          $scope.tokenError = true;
          //window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid='+appid+'&redirect_uri=http%3A%2F%2F'+host+'%2F'+'wx_qrconnect'+'&response_type=code&scope='+snsapi+'&state='+tokenId+'#wechat_redirect';

      });


  };

  $scope.login = function () {
    $http.get('/api/wx_login?accessToken='+$scope.userInfo.accessToken+'&openId='+$scope.userInfo.openId+'&tokenId='+$scope.token.id)
      .success(function(data, status, headers, config) { 
          console.log(data);
          $scope.loginSuccess = true;

      })
      .error(function(data, status, headers, config) { //如果從外部連結返回時會遇到code error問題，就要重新定向

          $scope.loginError = true;

      });
  }
  

}]);
