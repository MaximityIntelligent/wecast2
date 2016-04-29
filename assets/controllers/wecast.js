
var app = angular.module('easywash', []);

var QueryString = function () {
  // This function is anonymous, is executed immediately and
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
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
var ad = QueryString.ad;
var sharedBy = QueryString.sharedBy;
var pg
alert("code: "+code+" sharedBy: "+sharedBy);
app.controller('IndexCtrl', [
'$scope','$http',
function($scope, $http){
  $scope.test = 'Hello world!';

  $scope.init2 = function()
  {

    var url = window.location.href;
    url = encodeURIComponent(url);
    alert("url:"+url);
    $http.get('/api/init?appid=wxab261de543656952&secret=389f230302fe9c047ec56c39889b8843&code='+code+'&url='+url+'&sharedBy='+sharedBy+'&ad=56f0bf95b955d4f916852073'
      ).
      success(function(data, status, headers, config) {
          $scope.nickname = data.nickname;
          $scope.noncestr = data.noncestr;
          $scope.signature = data.signature;
          $scope.ticket = data.ticket;
          $scope.timestamp = data.timestamp;
          $scope.sharedBy = sharedBy;
          $scope.userId = data.openId;
          $scope.credit = data.credit;
          $scope.ad = ad;
          //alert("signature:"+$scope.signature+" noucestr:"+$scope.noncestr+" timestamp:"+$scope.timestamp+" drawChance: "+$scope.drawChance);
          //alert("user drawChance: "+$scope.drawChance);

          wx.config({
          debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
          appId: 'wxab261de543656952', // 必填，公众号的唯一标识
          timestamp: $scope.timestamp, // 必填，生成签名的时间戳
          nonceStr: $scope.noncestr, // 必填，生成签名的随机串
          signature: $scope.signature,// 必填，签名，见附录1
          jsApiList: ['openLocation','getLocation', 'onMenuShareTimeline'
 ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
          });
          wx.ready(function(){
            /*wx.showMenuItems({
              menuList: ['menuItem:share:timeline'] // 要显示的菜单项，所有menu项见附录3
            });*/
            wx.showOptionMenu();
            wx.onMenuShareTimeline({
                title: 'wecast', // 分享标题
                link: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxab261de543656952&redirect_uri=http%3A%2F%2Fwecast.ibeacon-macau.com%2Findex.html%3FsharedBy%3D'+$scope.userId+'%26ad%3D56f0bf95b955d4f916852073&response_type=code&scope=snsapi_userinfo&state=123',
                imgUrl: '', // 分享图标
                success: function() {
                    // 用户确认分享后执行的回调函数
                    alert('已分享');
                },
                cancel: function() {
                    // 用户取消分享后执行的回调函数
                },
                fail: function(){
                  alert(JSON.stringify(res));
                }
            });
            //alert('71');
            /*
            wx.getLocation({
                type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
                success: function(res) {
                    var latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
                    var longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
                    var speed = res.speed; // 速度，以米/每秒计
                    var accuracy = res.accuracy; // 位置精度
                    alert("latitue:"+latitude);
                }
            });
            */
    // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
          });
          wx.error(function(res){
    // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
            alert('fail');
          });

          //alert("success, nickname: "+data.nickname+" sex: "+data.sex+" ticket: "+data.ticket+" signature: "+data.signature);
      }).
      error(function(data, status, headers, config) {
          alert("error");
      });
      //alert("17");
  }
  $scope.draw = function() {
    $http.get('/api/draw?userid='+$scope.userId+'&ad=56f0bf95b955d4f916852073'
      ).
      success(function(data, status, headers, config) {
          $scope.drawChance = data.drawChance;
          $scope.drawResult = data.drawResult;
          alert("Draw result: "+$scope.drawResult+" Draw chance: "+$scope.drawChance);
      });
  }

}]);
