
var app = angular.module('oneMember', ['chart.js']).config(['$httpProvider', function($httpProvider) {
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

var code = QueryString.code;
var debug = true;
var ad = QueryString.ad;
var snsapi = 'snsapi_userinfo';
var host = 'lb.ibeacon-macau.com';
var appid = 'wxbb0b299e260ac47f';

app.controller('IndexCtrl', [
'$scope','$http', '$timeout', '$interval', '$location', '$anchorScroll',
function($scope, $http, $timeout, $interval, $location, $anchorScroll){

  $scope.selected = 0;

  $scope.init = function () {
    var url = location.href.split('#')[0];
    url = encodeURIComponent(url);
    
    $http.get('/oneMember/init?code='+code+'&url='+url+'&ad='+ad).success(function(data, status, headers, config) {
      console.log(data); 
      $scope.noncestr = data.noncestr;
      $scope.signature = data.signature;
      $scope.ticket = data.ticket;
      $scope.timestamp = data.timestamp;
      $scope.openId = data.openId;
      $scope.credit = data.credit;
      $scope.level = data.level;
      $scope.nickname = data.nickname;
      $scope.config = data.config;
      $scope.phone = data.phone;
      $scope.headimgurl = data.headimgurl;
      $scope.subscribe = data.subscribe;
      
      wx.config({
      debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
      appId: ''+appid+'', // 必填，公众号的唯一标识
      timestamp: data.timestamp, // 必填，生成签名的时间戳
      nonceStr: data.noncestr, // 必填，生成签名的随机串
      signature: data.signature,// 必填，签名，见附录1
      jsApiList: ['onMenuShareTimeline',"onMenuShareAppMessage", 'showMenuItems'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
      });
      wx.ready(function(res){
        wx.showOptionMenu();
        wx.showMenuItems({
          menuList: ['menuItem:share:timeline', 'menuItem:share:appMessage', "menuItem:favorite" ] // 要显示的菜单项，所有menu项见附录3
        });
        wx.onMenuShareTimeline({
            title: '今晚總決賽！投票截止倒計時', // 分享标题
            link: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid='+appid+'&redirect_uri=http%3A%2F%2F'+host+'%2Fone_member%3FsharedBy%3D'+$scope.userId+'%26ad%3D'+ad+'&response_type=code&scope='+snsapi+'&state=123#wechat_redirect',
            imgUrl: 'http://'+host+'/images/blueman/share/wecast-share.png', // 分享图标
            success: function() {
            },
            cancel: function() {
                // 用户取消分享后执行的回调函数
            }
        });
        wx.onMenuShareAppMessage({
          title: '今晚總決賽！投票截止倒計時', // 分享标题
          desc: '估波仔! CheersPub 送你特色 Cocktail x Pizza', // 分享描述
          link: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid='+appid+'&redirect_uri=http%3A%2F%2F'+host+'%2Fone_member%3FsharedBy%3D'+$scope.userId+'%26ad%3D'+ad+'&response_type=code&scope='+snsapi+'&state=123#wechat_redirect',
          imgUrl: 'http://'+host+'/images/blueman/share/wecast-share.png', // 分享图标
          success: function () {
          },
          cancel: function () {
          }
        });
      });
      wx.error(function(res){
        $scope.log('wxError', JSON.stringify(res));
      });
    }).error(function(data, status, headers, config) { //如果從外部連結返回時會遇到code error問題，就要重新定向
        window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid='+appid+'&redirect_uri=http%3A%2F%2F'+host+'%2Fone_member%3FsharedBy%3Dwecast%26ad%3D'+ad+'&response_type=code&scope='+snsapi+'#wechat_redirect';
    });
  
  };

  $scope.isSelected = function (index) {
    return index == $scope.selected;
  }

}]);
