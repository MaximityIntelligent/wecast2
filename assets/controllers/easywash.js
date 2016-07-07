
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
  window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid='+appid+'&redirect_uri=http%3A%2F%2Fwecast.ibeacon-macau.com%2Feasywash%3FsharedBy%3Dwecast%26ad%3Deasywash&response_type=code&scope=snsapi_base#wechat_redirect';
  return;
}*/
var ad = QueryString.ad;
var sharedBy = QueryString.sharedBy;
var adString = 'adUEFA';
// var snsapi = 'snsapi_base';
var snsapi = 'snsapi_base';
var prizeCredit = {'prize1':15, 'prize2':30};
var host = 'lb.ibeacon-macau.com';
var appid = 'wx5b57ddac4e2e1e88';
var debug = false;

app.controller('IndexCtrl', [
'$scope','$http', '$timeout', '$interval', '$location', '$anchorScroll',
function($scope, $http, $timeout, $interval, $location, $anchorScroll){
  $scope.loading = 0;
  $scope.MAIN = "main";
  $scope.SHARE = "share";
  $scope.EVENT = "event";
  $scope.PRIZE1 = "prize1";
  $scope.PRIZE2 = "prize2";
  $scope.ABOUT_EASYWASH = "about_easywash";
  $scope.THANKYOU = "thankyou";
  $scope.LANDSCAPE = "landscape";
  $scope.QUESTIONNAIRE = 'questionnaire';
  $scope.atPage = (typeof QueryString.pg == 'undefined') ? $scope.MAIN: $scope.THANKYOU;
  $scope.credit = 0;
  $scope.map = false;
  $scope.prizeRedeem = "";
  $scope.normalErrCode = 0;
  $scope.normalErrMsg = "";
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
          if( typeof $scope.landscape != 'undefined' && !debug){
            if(typeof QueryString.pg == 'undefined'){
              window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid='+appid+'&redirect_uri=http%3A%2F%2F'+host+'%2F'+adString+'%3FsharedBy%3Dwecast%26ad%3D'+adString+'&response_type=code&scope='+snsapi+'#wechat_redirect';
            }
            else {
              window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid='+appid+'&redirect_uri=http%3A%2F%2F'+host+'%2F'+adString+'%3FsharedBy%3Dwecast%26ad%3D'+adString+'%26pg%3D1&response_type=code&scope='+snsapi+'#wechat_redirect';
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
      $http.get('/api/getCredit?openId='+$scope.userId+'&ad='+adString).success(function (data) {
        $scope.credit = data.credit;
      });
    }
    
  };

  $scope.updatePrizeRemain = function () {
     $http.get('/api/getPrizeRemain?ad='+adString).success(function (data) {
        $scope.prize1Remain = data.prizeRemain.redeem_prize1;
        console.log($scope.prize1Remain);
     });
  };
  $scope.updateGameResult = function () {
    $http.get('/api/getGameResult?ad='+adString+'&openId='+$scope.userId).success(function (data) {
        $scope.gameResult = data.gameResult;
        console.log($scope.gameResult);
     });
  };
  $scope.updateVotes = function (req, res) {
    $http({
      method:'POST',
      url:'/api/getVotes',
      params:{
        "openId": $scope.userId,
        "ad": adString,
      }
    }).success(function(data) {
      $scope.votes = data;
      $scope.updateVoteChart();
    }).error(function(data) {

    });
  };
  $scope.updateMain = function () {
    if ($scope.userId) {
      $http.get('/api/getMainUpdate?openId='+$scope.userId+'&ad='+adString).success(function (data) {
        $scope.credit = data.credit;
        $scope.gameResult = data.gameResult;
        $scope.votes = data.votes;
        $scope.updateVoteChart();
      });
    }
  }
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
          $scope.userVote = data.userVote;
          $scope.userPrize = data.userPrize;
          $scope.isRedeemVote = data.isRedeemVote;
          $scope.sharedToUsers = data.sharedToUsers;

          $scope.prize1Remain = 30;
          $scope.voteRate1 = 0;
          $scope.voteRate2 = 0;
          $scope.updateMain();
          console.log($scope.userPrize);

          //alert("timestamp: " + $scope.timestamp + "\nnonceStr: " + $scope.noncestr + "\nsignature: " + $scope.signature);
          wx.config({
          debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
          appId: ''+appid+'', // 必填，公众号的唯一标识
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
                title: '2016歐國盃 | Cheers Pub免費送你特色雞尾酒 & Pizza', // 分享标题
                link: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid='+appid+'&redirect_uri=http%3A%2F%2F'+host+'%2F'+adString+'%3FsharedBy%3D'+$scope.userId+'%26ad%3D'+adString+'%26pg%3D1&response_type=code&scope='+snsapi+'&state=123',
                imgUrl: 'http://'+host+'/images/easywash/share/wecast-share.png', // 分享图标
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

              title: '2016歐國盃 | Cheers Pub免費送你特色雞尾酒 & Pizza', // 分享标题

              desc: '估波仔! 三五知己! 玩盡歐國! Beer x Cocktail x Pizza任你揀!!', // 分享描述

              link: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid='+appid+'&redirect_uri=http%3A%2F%2F'+host+'%2F'+adString+'%3FsharedBy%3D'+$scope.userId+'%26ad%3D'+adString+'%26pg%3D1&response_type=code&scope='+snsapi+'&state=123',

              imgUrl: 'http://'+host+'/images/easywash/share/wecast-share.png', // 分享图标

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
            $scope.updateMain();
          }, 10000);
          $('body').addClass('loaded');
          
        });
        wx.error(function(res){
          //alert('fail'+JSON.stringify(res));

        });



      }).
      error(function(data, status, headers, config) { //如果從外部連結返回時會遇到code error問題，就要重新定向
        //alert("error");
        if (!debug) {
          //alert("reload");
          window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid='+appid+'&redirect_uri=http%3A%2F%2F'+host+'%2F'+adString+'%3FsharedBy%3Dwecast%26ad%3D'+adString+'&response_type=code&scope='+snsapi+'#wechat_redirect';
        } else {
          //$('body').addClass('loaded');
          $scope.sharedBy = sharedBy;
          $scope.userId = 'ocLOPwlFiCCTPeSXLYTg7ZLLLAww';
          $scope.shareCount = 0;
          $scope.credit = 16;
          $scope.prize1Remain = 30;
          $scope.userPrize = {};
          $scope.sharedToUsers = [];
          $scope.userVote = 'vote2';
          $scope.updateGameResult();
          $scope.updatePrizeRemain();
          $scope.voteRate1 = 0;
          $scope.voteRate2 = 0;
          $scope.updateVotes();
          $scope.isRedeemVote = false;
        }
        
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
    if ($scope.userPrize['redeem_'+prize] > 1000) {
      $scope.normalErrCode = 0;
      $scope.normalErrMsg = '您已經換過此奬品！';
      $("#normal-errModal").modal('show');
      return;
    }

    $scope.prizeRedeem = prize;
    if($scope.credit<prizeCredit[prize]){
      $scope.normalErrCode = 1;
      $scope.normalErrMsg = "積分不足\n暫時無法兌換";
      $("#normal-errModal").modal('show');
      return;
    }else{
      $("#redeemModal").modal('show');
      return;
    }
    
  }
  $scope.showVote = function (vote) {
    
    var now = new Date();
    var exp = new Date('2016-07-10T19:00:00');
    console.log(now);
    console.log(exp);
    
    if (now.getTime() > exp.getTime()) {
        $scope.normalErrCode = 0;
        $scope.normalErrMsg = '投票時限已過了。';
        $("#normal-errModal").modal('show');
    } else {
      $scope.currentVote = vote;
      $("#voteModal").modal('show');
      
    }
    
  }
  $scope.showQuestionnaire = function () {
    $("#questionnaireModal").modal('show');
  }

  $scope.showPrize1 = function(){
    if($scope.credit>=prizeCredit.prize1){
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
    if($scope.credit>=prizeCredit.prize2){
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
    verificationCode = $("#verification").val();

    $("#verification").val("");
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
      $scope.normalErrCode = data.errCode;
      $scope.normalErrMsg = data.errMsg;
      $("#normal-errModal").modal('show');
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
      url:'log/log?action='+actionName+'&openId='+$scope.userId+'&ad='+adString,
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
    $http.post('/api/luckyDraw', {openId: $scope.userId, ad: adString}).success(function (data) {
        console.log(data);
        $scope.credit = data.currentCredit;
        $scope.luckDrawPrize = data.prize;
        $("#luckyDraw-prizeModal").modal('show');
    }).error(function (err) {
        $scope.normalErrCode = 0;
        $scope.normalErrMsg = '每位用戶每天有一次抽印花機會';
        $("#normal-errModal").modal('show');
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
    } else if (item == 'main') {
      $scope.atPage = $scope.MAIN;
    }
  },
  $scope.vote = function (vote) {
    if ($scope.userVote == 'vote1' || $scope.userVote == 'vote2') {
      $scope.normalErrCode = 0;
      $scope.normalErrMsg = '您已經完成投票了！';
      $("#normal-errModal").modal('show');
      return；
    }
    var temp = $scope.userVote;
    $scope.userVote = vote;
    if (vote=='' || vote==null) {
      return;
    }
    $http({
      method:'POST',
      url:'/api/vote',
      params:{
        'userVote':vote,
        "openId": $scope.userId,
        "ad": adString,
      }
    }).success(function(data) {
      $scope.userVote = data.userVote;
      console.log($scope.userVote);
      $scope.votes = data.votes;
      $scope.updateVoteChart();
    }).error(function(data) {
      $scope.userVote = temp;
      $scope.normalErrCode = 0;
      $scope.normalErrMsg = data.errMsg;
      $("#normal-errModal").modal('show');
    });
  },
  $scope.showRedeemVoteBtn = function () {
    var now = new Date();
    var exp = new Date('2016-07-20T16:00:00');
    return true;
    if ($scope.gameResult != null && $scope.userVote != null && $scope.gameResult == $scope.userVote && $scope.isRedeemVote != true && now.getTime() <= exp.getTime()) {
      return true;
    } else {
      return false;
    }
  },
  $scope.showRedeemVote = function () {
    if ($scope.gameResult == $scope.userVote && $scope.isRedeemVote != true) {
      var now = new Date();
      var exp = new Date('2016-07-20T16:00:00');
      console.log(now);
      console.log(exp);
      
      if (now.getTime() > exp.getTime()) {
        $scope.normalErrCode = 0;
        $scope.normalErrMsg = '領奬時限已過';
        $("#normal-errModal").modal('show');
      } else {
        $("#redeemVoteModal").modal('show');
      }
      
    }
  },

  $scope.redeemVote = function () {
    if ($scope.userVote == $scope.gameResult) {
        $http({
          method:'POST',
          url:'/api/redeemVote',
          params:{
            "openId": $scope.userId,
            "ad": adString,
          }
        }).success(function(data) {
          $scope.credit = data.credit
          $scope.isRedeemVote = data.isRedeemVote;
        }).error(function(data) {
          if (data.errCode == 0) {
            $scope.normalErrCode = data.errCode;
            $scope.normalErrMsg = data.errMsg;
            $("#normal-errModal").modal('show');
          }
        });
        
    }
  },
  
  $scope.updateVoteChart = function () {
    $scope.voteRate1 = Math.floor($scope.votes.vote1/($scope.votes.vote1+$scope.votes.vote2)*100);
    $scope.voteRate2 = Math.floor($scope.votes.vote2/($scope.votes.vote1+$scope.votes.vote2)*100);
    var mainScaleX = 750;
    var containerWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
    if ($scope.votes.vote1 + $scope.votes.vote2 > 0) {
        $scope.voteBar1Style = {'width':containerWidth*($scope.voteRate1/100*350)/mainScaleX};
    } else {
      $scope.voteRate1 = 0;
      $scope.voteRate2 = 0;
    }
  },
  // $scope.gotoShare = function () {
  //   $location.hash('main-1');
  //   $anchorScroll();  
  // },
  $scope.submitQuestionnaire = function () {
    $scope.questionnaireErr = null;
    console.log($scope.questionnaire);
    var questionnaire = $scope.questionnaire;
    if (questionnaire == null || questionnaire.username == null
      || questionnaire.phone == null
      || questionnaire.email == null
      || questionnaire.age == null) {
      $scope.questionnaireErr = '還有空格未填喎';
      return;
    }

    if (questionnaire.username.trim().length < 2) {
      $scope.questionnaireErr = '匿稱太短喇，最少兩個字';
      return;
    }

    if (isNaN(questionnaire.phone.trim()) || questionnaire.phone.trim().length != 8 || questionnaire.phone.trim().charAt(0) != '6') {
      $scope.questionnaireErr = '電話號碼要澳門的';
      return;
    }

    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!questionnaire.email.match(mailformat)) {
      $scope.questionnaireErr = '不是正常的電郵';
      return;
    }
    $http({
      method:'POST',
      url:'/api/questionnaire',
      params:{
        "openId": $scope.userId,
        "ad": adString,
        "username": questionnaire.username,
        "phone": questionnaire.phone,
        "email": questionnaire.email,
        "age": questionnaire.age
      }
    }).success(function(data) {
      $scope.questionnaire = null;
      $scope.credit = data.credit;
      $("#questionnaireModal").modal('toggle');
    }).error(function(data) {

    });
    
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
