
var app = angular.module('easywash', []);

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
/*
if(typeof QueryString.code == 'undefined'){
  window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxab261de543656952&redirect_uri=http%3A%2F%2Fwecast.ibeacon-macau.com%2Feasywash%3FsharedBy%3Dwecast%26ad%3Deasywash&response_type=code&scope=snsapi_base#wechat_redirect';
  return;
}*/
var ad = QueryString.ad;
var sharedBy = QueryString.sharedBy;
var adString = 'adMood';
// var snsapi = 'snsapi_base';
var snsapi = 'snsapi_userinfo';
var prize1Credit = 38;

app.controller('IndexCtrl', [
'$scope','$http', '$timeout', '$interval',
function($scope, $http, $timeout, $interval){
  $scope.loading = 0;
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
  $scope.thumbStyle = {
     'width': Math.floor(window.innerWidth*0.145),
     'height': Math.floor(window.innerWidth*0.145)
  };
  console.log(window.innerWidth*0.145);
  $(window).trigger('orientationchange'); //check裝置方向


  $(window)
  .bind('orientationchange', function(){ 

    if (window.orientation % 180 == 0){ //如果是垂直
      $scope.$apply(function(){
          if( typeof $scope.landscape != 'undefined'){
            if(typeof QueryString.pg == 'undefined'){
              window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxab261de543656952&redirect_uri=http%3A%2F%2Fmood.ibeacon-macau.com%2F'+adString+'%3FsharedBy%3Dwecast%26ad%3D'+adString+'&response_type=code&scope='+snsapi+'#wechat_redirect';
            }
            else {
              window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxab261de543656952&redirect_uri=http%3A%2F%2Fmood.ibeacon-macau.com%2F'+adString+'%3FsharedBy%3Dwecast%26ad%3D'+adString+'%26pg%3D1&response_type=code&scope='+snsapi+'#wechat_redirect';
            }
          }

      });
      $('body').addClass("portrait");

    }
    else { //如果是水平
      //alert('landscape');
      $scope.$apply(function(){
          $(".spinner").remove();
          $('body').remove(".spinner");
          $scope.landscape = 'landscape-first';
          $scope.atPage = $scope.LANDSCAPE;
          $('body').removeClass('portrait');
          $(".spinner").remove();
          $('body').remove(".spinner");
      });

    }
  });//.trigger('orientationchange');

  $scope.updateLoading = function (percent) {
    $scope.loadingPlus(percent-$scope.loading); 
  };

  $scope.loadingPlus = function (target) {
      if (target > 0) {
          if ($scope.loading < 99) {
            $scope.loading = parseInt($scope.loading) + 1;
            $timeout(function () {
                $scope.loadingPlus(target-1);
              }, 20);
          }
            
      }
      
  };

  $scope.updateCredit = function () {
    if ($scope.userId) {
      $http.get('/api/getCredit?openId='+$scope.userId).success(function (data) {
        $scope.credit = data.credit;
      });
    }
    
  };

  $scope.updatePrizeRemain = function () {
     $http.get('/api/getPrizeRemain').success(function (data) {
        $scope.prize1Remain = data.prizeRemain.redeem_prize1;
        console.log($scope.prize1Remain);
     });
  };

  $scope.init = function() // 初始化頁面
  {
    //alert("init");
    $scope.updateLoading(99);
    var url = window.location.href;
    url = encodeURIComponent(url);
    $http.get('/api/init_c?code='+code+'&url='+url+'&sharedBy='+sharedBy+'&ad='+adString
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
          $scope.prize1Remain = 30;
          $scope.userPrize = data.userPrize;
          $scope.sharedToUsers = data.sharedToUsers;

          $scope.updatePrizeRemain();
          console.log($scope.userPrize);
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
                title: 'MOOD X MURFY 请你睇MODEL大赛', // 分享标题
                link: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxab261de543656952&redirect_uri=http%3A%2F%2Fmood.ibeacon-macau.com%2F'+adString+'%3FsharedBy%3D'+$scope.userId+'%26ad%3D'+adString+'%26pg%3D1&response_type=code&scope='+snsapi+'&state=123',
                imgUrl: 'http://mood.ibeacon-macau.com/images/easywash/wecast-share.png', // 分享图标
                success: function() {
                    $scope.log('share_timeline');
                    $("#share-success").trigger('click');

                },
                cancel: function() {
                    // 用户取消分享后执行的回调函数
                },
                fail: function(){
                  //alert(JSON.stringify(res));
                }
            });
            wx.onMenuShareAppMessage({

              title: 'MOOD X MURFY 请你睇MODEL大赛', // 分享标题

              desc: 'Share给朋友收集印花,模特大赛入场券及礼服定制优惠等你来带走！', // 分享描述

              link: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxab261de543656952&redirect_uri=http%3A%2F%2Fmood.ibeacon-macau.com%2F'+adString+'%3FsharedBy%3D'+$scope.userId+'%26ad%3D'+adString+'%26pg%3D1&response_type=code&scope='+snsapi+'&state=123',

              imgUrl: 'http://mood.ibeacon-macau.com/images/easywash/wecast-share.png', // 分享图标

              success: function () {
                $scope.log('share_friend');
                $("#share-success").trigger('click');
              },

              cancel: function () {

                  // 用户取消分享后执行的回调函数

              }

            });
          $scope.loading = 100;
          $interval(function () {
            $scope.updateCredit();
            $scope.updatePrizeRemain();
          }, 60000);
          $('body').addClass('loaded');
          
        });
        wx.error(function(res){
          alert('fail'+JSON.stringify(res));

        });



      }).
      error(function(data, status, headers, config) { //如果從外部連結返回時會遇到code error問題，就要重新定向
        //alert("error");
        window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxab261de543656952&redirect_uri=http%3A%2F%2Fmood.ibeacon-macau.com%2F'+adString+'%3FsharedBy%3Dwecast%26ad%3D'+adString+'&response_type=code&scope='+snsapi+'#wechat_redirect';
        //$('body').addClass("loaded");
        //$('#loader-wrapper').css("display", "none");
      });

      // $(window).trigger('orientationchange');

  }
  $scope.shareSuccess = function(){
    $scope.atPage=$scope.MAIN;
    $.fancybox.close();$.fn.fancybox.close();
  }
  $scope.showRedeem = function(prize){

    //$("#redeem2Modal").modal('show');
    ///return;

    if(prize=="prize1"){
      $scope.prizeRedeem = "prize1";
      if($scope.credit<prize1Credit){
        $scope.redeemErrMsg = "印花不足,暂时无法兑换";
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
    if($scope.credit>=prize1Credit){
      return true;
    }else{
      return false;
    }

  }
  $scope.showPrize1Dim = function(){
    if($scope.credit<prize1Credit){
      return true;
    }else {
      return false;
    }
  }
  $scope.showPrize2 = function(){
    if($scope.credit>=38){
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
    $("#verification1").val("");
    $("#verification2").val("");
    ///alert(verificationCode);

    $http({
      method:'POST',
      url:'/api/redeem_c',
      params:{
        'prize':prize,
        "user": $scope.userId,
        "ad": adString,
        "verificationCode": verificationCode
      }
    }).success(function(data) {
      $scope.credit = data.credit;
      var prize = data.prize;
      $("#prize-redeem").trigger('click');
      $scope.log('redeem_'+prize);
      $scope.userPrize['redeem_'+prize] += 1;
    }).error(function(data) {
      //$scope.redeemErrMsg = "兑换失败";
      $scope.redeemErrMsg = data.errMsg;
      $("#veri-code-errModal").modal('show');
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

  },
  $scope.clickCount = function(clickCountName){
    $http({
      url:'api/clickCount?clickCountName='+clickCountName,
      method:'GET'
      }).success(function(data,header,config,status){

      }).error(function(data,header,config,status){

      });
  },
  $scope.log = function(actionName){
    $http({
      url:'log/log?action='+actionName+'&openId='+$scope.userId,
      method:'GET'
      }).success(function(data,header,config,status){

      }).error(function(data,header,config,status){
    });
  },
  $scope.resetVideo = function(){
    document.getElementById("easywash-video").src = "http://v.qq.com/iframe/player.html?vid=q0308w7unq8&amp;&amp;auto=1";
  },
  $scope.initAboutEasywash = function(){
    document.getElementById("easywash-video").src = "http://v.qq.com/iframe/player.html?vid=q0308w7unq8&amp;&amp;auto=0";
  },
  $scope.luckyDraw = function () {
    $http.post('/api/luckyDraw', {openId: $scope.userId}).success(function (data) {
        console.log(data);
        $scope.credit = data.currentCredit;
        $scope.prize = data.prize;
        $("#luckyDraw-prizeModal").modal('show');
    }).error(function (err) {
        $("#luckyDraw-errModal").modal('show');
    });
  },
  $scope.getImgUrl = function (user) {
    if (user.headimgurl) {
      return user.headimgurl;
    } else {
      return 'http://placehold.it/50x50';
    }
  },
  $scope.friendClick = function (item, ev) {
    console.log(item);
    if (item == 'button') {
      $scope.atPage = $scope.SHARE;
    } else if (item == 'main') {
      $scope.atPage = $scope.MAIN;
    }
    ev.stopPropagation();  
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
