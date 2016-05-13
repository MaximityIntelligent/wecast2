
var app = angular.module('easywash', []);

var QueryString = function () {
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
/*
if(typeof QueryString.code == 'undefined'){
  window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxab261de543656952&redirect_uri=http%3A%2F%2Fwecast.ibeacon-macau.com%2Feasywash%3FsharedBy%3Dwecast%26ad%3Deasywash&response_type=code&scope=snsapi_base#wechat_redirect';
  return;
}*/
var ad = QueryString.ad;
var sharedBy = QueryString.sharedBy;

app.controller('IndexCtrl', [
'$scope','$http',
function($scope, $http){
  $scope.MAIN = "main";
  $scope.SHARE = "share";
  $scope.EVENT = "event";
  $scope.PRIZE1 = "prize1";
  $scope.PRIZE2 = "prize2";
  $scope.ABOUT_EASYWASH = "about_easywash";
  $scope.THANKYOU = "thankyou";
  $scope.LANDSCAPE = "landscape";
  $scope.atPage = (typeof QueryString.pg == 'undefined') ? $scope.MAIN: $scope.THANKYOU;
  $scope.credit = 0;
  $scope.map = false;
  $scope.prizeRedeem = "";
  $scope.redeemErrMsg = "";
  $scope.prevPage = "";

  $(window).trigger('orientationchange');


  $(window)
  .bind('orientationchange', function(){

    if (window.orientation % 180 == 0){
      $scope.$apply(function(){
          if( typeof $scope.landscape != 'undefined'){

            if(typeof QueryString.pg == 'undefined'){
              window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxab261de543656952&redirect_uri=http%3A%2F%2Fwecast.ibeacon-macau.com%2Feasywash%3FsharedBy%3Dwecast%26ad%3Deasywash&response_type=code&scope=snsapi_base#wechat_redirect';
            }
            else {
              window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxab261de543656952&redirect_uri=http%3A%2F%2Fwecast.ibeacon-macau.com%2Feasywash%3FsharedBy%3Dwecast%26ad%3Deasywash%26pg%3D1&response_type=code&scope=snsapi_base#wechat_redirect';
            }
          }

      });
      $('body').addClass("portrait");
    }
    else {
      //alert('landscape');
      $scope.$apply(function(){
          $scope.landscape = 'landscape-first';
          //$scope.prevPage = $scope.atPage;
          $scope.atPage = $scope.LANDSCAPE;
          $('body').removeClass('portrait');
      });

    }
  }).trigger('orientationchange');


  $scope.init = function()
  {
    //alert("init");
    var url = window.location.href;
    url = encodeURIComponent(url);
    $http.get('/api/init_c?appid=wxab261de543656952&secret=389f230302fe9c047ec56c39889b8843&code='+code+'&url='+url+'&sharedBy='+sharedBy+'&ad=easywash'
      ).
      success(function(data, status, headers, config) {
          //alert("success");
          //$scope.nickname = data.nickname;
          $scope.noncestr = data.noncestr;
          $scope.signature = data.signature;
          $scope.ticket = data.ticket;
          $scope.timestamp = data.timestamp;
          $scope.sharedBy = sharedBy;
          $scope.userId = data.openId;
          $scope.shareCount = data.shareCount;
          $scope.credit = data.credit;

          wx.config({
          debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
          appId: 'wxab261de543656952', // 必填，公众号的唯一标识
          timestamp: $scope.timestamp, // 必填，生成签名的时间戳
          nonceStr: $scope.noncestr, // 必填，生成签名的随机串
          signature: $scope.signature,// 必填，签名，见附录1
          jsApiList: ['onMenuShareTimeline',"onMenuShareAppMessage" ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
          });
          wx.ready(function(res){
            //alert("wx.ready");
            wx.showMenuItems({
              menuList: ['menuItem:share:timeline', 'menuItem:share:appMessage' ] // 要显示的菜单项，所有menu项见附录3
            });
            wx.showOptionMenu();
            wx.onMenuShareTimeline({
                title: 'Easywash送你小米手環及智能洗車', // 分享标题
                link: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxab261de543656952&redirect_uri=http%3A%2F%2Fwecast.ibeacon-macau.com%2Feasywash%3FsharedBy%3D'+$scope.userId+'%26ad%3Deasywash%26pg%3D1&response_type=code&scope=snsapi_base&state=123',
                imgUrl: 'http://wecast.ibeacon-macau.com/images/easywash/wecast-share.jpg', // 分享图标
                success: function() {
                    // 用户确认分享后执行的回调函数
                    //alert('已分享');

                },
                cancel: function() {
                    // 用户取消分享后执行的回调函数
                },
                fail: function(){
                  //alert(JSON.stringify(res));
                }
            });
            wx.onMenuShareAppMessage({

              title: 'Easywash送你小米手環及智能洗車', // 分享标题

              desc: 'Share比朋友幫手儲泡泡, 小米手環, 美光深層去污等你黎帶走!', // 分享描述

              link: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxab261de543656952&redirect_uri=http%3A%2F%2Fwecast.ibeacon-macau.com%2Feasywash%3FsharedBy%3D'+$scope.userId+'%26ad%3Deasywash%26pg%3D1&response_type=code&scope=snsapi_base&state=123',

              imgUrl: 'http://wecast.ibeacon-macau.com/images/easywash/wecast-share.jpg', // 分享图标

              success: function () {

              },

              cancel: function () {

                  // 用户取消分享后执行的回调函数

              }

          });
          $('body').addClass('loaded');

        });
        wx.error(function(res){
          alert('fail'+JSON.stringify(res));

        });



      }).
      error(function(data, status, headers, config) {
        //alert("error");
        window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxab261de543656952&redirect_uri=http%3A%2F%2Fwecast.ibeacon-macau.com%2Feasywash%3FsharedBy%3Dwecast%26ad%3Deasywash&response_type=code&scope=snsapi_base#wechat_redirect';
        $('body').addClass("loaded");
        //$('#loader-wrapper').css("display", "none");
      });

      $(window).trigger('orientationchange');

  }

  $scope.showRedeem = function(prize){
    if(prize=="prize1"){
      $scope.prizeRedeem = "prize1";
      if($scope.credit<18){
        $("#veri-credit-errModal").modal('show');
        return;
      }else{
        $("#redeem1Modal").modal('show');
        return;
      }
    }else if(prize=="prize2"){
      $scope.prizeRedeem = "prize2";
      if($scope.credit<38){
        $("#veri-credit-errModal").modal('show');
        return;
      }else{
        $("#redeem2Modal").modal('show');
        return;
      }
    }
  }

  $scope.showPrize1 = function(){
    if($scope.credit>18){
      return true;
    }else{
      return false;
    }

  }
  $scope.showPrize1Dim = function(){
    if($scope.credit<18){
      return true;
    }else {
      return false;
    }
  }
  $scope.showPrize2 = function(){
    if($scope.credit>38){
      return true;
    }else{
      return false;
    }

  }
  $scope.showPrize2Dim = function(){
    if($scope.credit<38){
      return true;
    }else{
      return false;
    }
  }
  $scope.redeem_c = function(prize){
    if(prize=="prize1"){
      verificationCode = $("#verification1").val();
    }
    else if(prize=="prize2"){
      verificationCode = $("#verification2").val();
    }
    ///alert(verificationCode);

    $http({
      method:'POST',
      url:'/api/redeem_c',
      params:{
        'prize':prize,
        "user": $scope.userId,
        "ad": "easywash",
        "verificationCode": verificationCode
      }
    }).success(function(data) {
      $scope.credit = data.credit;
      $("#prize-redeem").trigger('click');

    }).error(function(data) {
      $scope.redeemErrMsg = "兑换失败";
      $("#errModal").modal('show');
    });
  },
  $scope.continueEntry = function(){
    if($scope.prizeRedeem=="prize1"){
      showRedeem('prize1');
      return;
    }
    else if($scope.prizeRedeem=="prize2"){
      showRedeem('prize2');
      return;
    }

  }
  $scope.clickCount = function(clickCountName){
    $http({
      url:'api/clickCount?clickCountName='+clickCountName,
      method:'GET'
      }).success(function(data,header,config,status){

      }).error(function(data,header,config,status){

      });
  }
  $scope.resetVideo = function(){
    document.getElementById("easywash-video").src = "http://v.qq.com/iframe/player.html?vid=q0194rb14mb&amp;&amp;auto=0";
  }
  $scope.initAboutEasywash = function(){
    document.getElementById("easywash-video").src = "http://v.qq.com/iframe/player.html?vid=q0194rb14mb&amp;&amp;auto=0";
  }

  /*
  $scope.draw = function() {
    $http.get('/api/draw?userid='+$scope.userId+'&ad=56f0bf95b955d4f916852073'
      ).
      success(function(data, status, headers, config) {
          $scope.drawChance = data.drawChance;
          $scope.drawResult = data.drawResult;
          alert("Draw result: "+$scope.drawResult+" Draw chance: "+$scope.drawChance);
      });
  }
  */

}]);
