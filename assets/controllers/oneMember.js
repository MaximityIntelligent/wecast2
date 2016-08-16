
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
var sharedBy = QueryString.sharedBy;
var snsapi = 'snsapi_userinfo';
var host = 'lb.ibeacon-macau.com';
var appid = 'wxbb0b299e260ac47f';

app.controller('IndexCtrl', [
'$scope','$http', '$timeout', '$interval', '$location', '$anchorScroll',
function($scope, $http, $timeout, $interval, $location, $anchorScroll){

  $scope.selected = 1;
  $scope.page = 11;
  $scope.init = function () {
    var url = location.href.split('#')[0];
    url = encodeURIComponent(url);
    
    $http.get('/oneMember/init?code='+code+'&url='+url+'&ad='+ad+'&sharedBy='+sharedBy).success(function(data, status, headers, config) {
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
      $scope.validate = data.validate;
      $scope.active = data.active;
      $scope.loginDays = data.loginDays;
      $scope.todayLogin = data.todayLogin;

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
            link: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid='+appid+'&redirect_uri=http%3A%2F%2F'+host+'%2Fone_member%3FsharedBy%3D'+data.openId+'%26ad%3D'+ad+'&response_type=code&scope='+snsapi+'&state=123#wechat_redirect',
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
          link: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid='+appid+'&redirect_uri=http%3A%2F%2F'+host+'%2Fone_member%3FsharedBy%3D'+data.openId+'%26ad%3D'+ad+'&response_type=code&scope='+snsapi+'&state=123#wechat_redirect',
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
        //window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid='+appid+'&redirect_uri=http%3A%2F%2F'+host+'%2Fone_member%3FsharedBy%3Dwecast%26ad%3D'+ad+'&response_type=code&scope='+snsapi+'#wechat_redirect';
      $scope.openId = 'o5OVfwJhe_dGCYTtjFgnKgZWR5jc';
      $scope.credit = 21;
      $scope.level = 0;
      $scope.nickname = 'Kit';
      $scope.phone = '+85366387333';
      $scope.headimgurl = 'http://wx.qlogo.cn/mmopen/tK7mvE9icOrv5ES55wqmDA98tPBTldqDRX6LcbPCdsLPYKsvpThMibpTYibLMUiagGeVRVn5Uqjrukyt1hHBmeQEciaUKSPFoGZY4/0';
      $scope.validate = '2017-8-16';
      $scope.active = false;
      $scope.loginDays = 0;
      $scope.todayLogin = true;
      $scope.config = {
        loginBonus: [2, 4, 8],
        loginBonusCycle: false,
        loginBonusContinuity: false,
        condition: "1. 本公司會員卡(下稱「會員卡」)是由XXX有限公司(以下簡稱為「本公司」) 向會籍申請人所發出。\n2. 會員卡、優越分、優越錢及優惠不得轉讓，且只能由銀娛優越會會員（下稱「會員」）使用。除會員卡所屬之會員本人外，由其他人士所積累的優越分一律無效。\n3. 所有積分及優惠不能兌換成現金及不能與其他優惠同時享用。\n4. 享受及使用XXX會會籍、會員卡以及其他相關優惠即表示接受本XXX會會籍的條款及細則。\n5. 本公司對遺失或被竊取之會員卡不負任何責任。本公司保留收取新卡補發費用之權利。\n6. 所有累積之積分將於交易完成後四十八(48)小時內記錄及進入會員之賬戶內。所有已兌換或使用之積分將從會員賬戶內即時自動扣除。如會員對優越分存有任何疑問，會員必須於積分交易日之30日內於銀娛優越會提出覆核，經本公司接受及批核後，本公司將於批核後14天內作出回覆及把正確之積分從新記錄在會員之賬戶內。\n7. 本公司不會為積分之累積、計算或獎賞換領上的任何錯誤負任何責任，不論錯誤源於技術故障、操作員失誤、誤報或其他超出本公司合理控制範圍的原因等。\n8. 對批核任何人士之XXX會會籍申請及制定會員可享的任何獎賞或優惠，或就與XXX會會籍和會員卡相關的任何爭議，本公司擁有作出最終決定的唯一及最終的自由決定權。\n9. 本公司保留隨時取消或更改與享用XXX會會籍、使用會員卡及積分計劃相關的條款及細則的權利， 無須作出事先通知，但會容許會員在合理的期限內兌換任何存有的優惠及積分。 \n10. 本公司有權在不發出事先通知的情況下終止任何會員的XXX會會籍。如果會員違反享受XXX會會籍的相關條款和細則，或者向本公司提供不真實或錯誤的資料或使用不恰當的方法取得獎賞或優惠，或者在本公司或本公司之附屬公司的場所內行為不檢，在這些情況下但不限於這些情況下，本公司將終止相關會員的XXX會會籍。屆時，該會員的所有積分及優惠將作廢。所有與該會員相關的獎賞計劃及優惠將被視為終止及無效。\n11. 如會員連續十二個月於本公司(或本公司的附屬公司)的場所沒有任何活動記錄，其會員卡賬戶內所積累的所有積分將被取消。\n12. 會員參加任何以會員身份參與之活動時，為作身份核對及更新個人資料，本公司有權要求會員出示其有效之港澳身份證或旅遊證件正本，相關活動包括但不限於積分換領及所有推廣活動。\n13. 會員卡為本公司所擁有之財產，故如本公司要求取回，會員必須即時無條件將會員卡歸還。 \n14. 會員參與本公司的任何推廣活動時，須同意遵守由本公司制訂有關的條款及細則並接受本公司對所有有關的事宜及爭議作出的決定為最終及具有約束力的決定。\n15. 本公司將要求會員選擇一個其專屬的私人密碼，密碼格式由本公司指定。會員的私人密碼只供其個人使用。在任何情況下，會員都不應向他人或其他會員透露自己的私人密碼。 辦理私人密碼登記時，會員必須出示有效之港澳身份證或旅遊證件正本。參與本公司的任何推廣活動或積分換領計劃時，本公司可要求會員提供其私人密碼，以便核實身份。出於安全考慮，本公司將不定時要求會員重新設定其私人密碼。\n16. 個人資料收集聲明 \n申請人可能會被要求向本公司提供個人資料（包括申請人的姓名、地址、電子郵件地址、電話號碼、照片以及身份證或旅遊證件）（即申請人的“個人資料”）。申請人可拒絕提供某些個人資料，但這可能會導致本公司無法提供或繼續提供XXX會會籍計劃項下的服務。\na. 個人資料可作以下用途：\ni. 確定XXX會會籍資格；\nii. 日常運營及提供XXX會會籍計劃項下的服務（包括告知各會員並向其提供該計劃項下的折扣、福利、權利、優惠及推廣）；\niii. 設計或營銷或推廣或與娛樂相關的服務或相關產品供會員使用（見下文(b)段中進一步討論）；\niv. 確保持續瞭解客戶的資信情況；\nv. 根據澳門或香港境內外目前及今後的任何法律法規，遵守任何適用於本公司任何成員，或本v公司的任何成員應需遵守，關於披露和使用資料方面的義務、要求或安排；或\n任何與上述任何一段直接有關或相關聯的用途。\nb. 由本公司所持有的與某一申請人有關的個人資料可提供給下列人士，無論其是否在澳門或香港：\ni. 本公司或任何成員有義務或根據上文(a)(v)段中所述需要向其披露的任何人士；\nii. 向本公司提供行政、電信、電腦、付款或其他服務的任何代理人、承包商或第三方服務提供商，而這些服務與本公司在XXX會會籍計劃項下的業務或服務有關；\niii. 任何向本公司承擔保密義務的其他人士（包括本公司集團下已承諾將對該等信息予以保密的成員公司）；\niv 為達致上文(a)(iii)段中所提及的營銷目的，銀河娛樂集團的任何成員或法律所允許的代理人（見下文(c)段）。\nc. 在直接營銷活動中使用個人資料 \n本公司有意將申請人的個人資料用於或轉發有關部門作直接營銷之用，為此本公司要求申請人給予同意（包括指明不反對）。有關這一方面，請注意：\ni. 本公司可將其不時掌握的申請人或會員的姓名、聯繫方式、產品和服務信息、交易慣用模式和行為及其人口統計數據用於直接營銷活動。\nii. 可以對以下類別的服務、產品和內容進行營銷： \n   (1) 本公司相關的服務和產品； \n   (2) 客戶獎賞、會員、優惠或合作品牌計劃及相關服務和產品；和 \n   (3) 本公司的品牌合作夥伴提供的服務和產品（該等品牌合作夥伴的名稱將在相關服務和產品（視具體情況而定）的申請期間提供）。\niii. 上文第(c)(ii)(1)、(2) 和 (3)段所述的服務、產品和內容可由本公司的任何成員或其他第三方提供；\niv. 除了自行營銷上述服務、產品和內容外，本公司亦有意將上文第(b)(i)段所述資料提供給上文第 (b)(iii) 至 (iv) 段所述的所有或任何人士，供其用於營銷所述服務、產品和內容，為此本公司要求申請人給予書面同意（包括指明不反對）；\n如果申請人不希望本公司如上文所述將其資料用於或提供給其他人士用於直接營銷活動，資料當事人可以行使下文所述的資料當事人的拒絕權利。\n\n17. 如果本公司所持有的會員個人資料（包括但不限於身份證或旅行文件上所顯示的資料、電郵或通訊地址和聯繫電話號碼）有變，會員應親自到XXX會的櫃檯通知本公司有關變化。本公司不會就會員因未向本公司更新其個人資料而承受的任何損失承擔責任。\n18. 會員凡於參與商戶以現金或信用卡購買指定產品/服務時，出示會員咭可獲享以積分及/或折扣、優惠、尊享優惠及推廣形式之折扣優惠。會員可享有由本公司及參與商戶不時制訂之優越錢獎賞/換領及/或優惠。"
      }
      $scope.conditions = $scope.config.condition.split('\n');
    });
  
  };

  $scope.isSelected = function (index) {
    return index == $scope.selected;
  }

  $scope.isPage = function (pageId) {
    return pageId == $scope.page;
  }

  $scope.redeemLogin = function () {
    if ($scope.todayLogin == true) return;
    $scope.dialog = {};
    $http.get('/oneMember/redeemLogin?openId='+$scope.openId+'&ad='+ad).success(function(data, status, headers, config) {
      $scope.showDialog = true;
      $scope.dialog.title = '每日連續登入奬勵';
      if ($scope.config.loginBonusCycle) {
        $scope.dialog.body = '恭喜獲得'+data.finalBonus+'積分，明天登陸可獲得'+data.loginBonus[data.loginDays%data.loginBonus.length];
      } else {
        $scope.dialog.body = '恭喜獲得'+data.finalBonus+'積分，明天登陸可獲得'+data.loginBonus[Math.min(data.loginDays, data.loginBonus.length-1)];
      }
      
      $scope.credit += +data.finalBonus;
    }).error(function(data, status, headers, config) {
      console.log(status);
      $scope.showDialog = true;
      $scope.dialog.title = '每日連續登入奬勵';
      $scope.dialog.body = data.errMsg;
    });
  }

  $scope.redeemLoginText = function (todayLogin) {
    if (todayLogin) {
      return '已領取';
    } else {
      return '未領取';
    }
  }


}]);
