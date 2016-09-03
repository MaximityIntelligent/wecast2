
var app = angular.module('shop', ['chart.js']).config(['$httpProvider', function($httpProvider) {
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
var ad = QueryString.ad || 'adShop';
var sharedBy = QueryString.sharedBy;
var snsapi = 'snsapi_userinfo';
var host = 'lb.ibeacon-macau.com';
var appid = 'wxbb0b299e260ac47f';
var apps = 'shop';

app.factory('products', ['$http', function ($http) {
  var output = {
    data: []
  };

  output.getAll = function (category) {
    return $http.post('/shopConfig/getProducts', {category: category});
  };

  output.get = function (pid) {
    return output.data.find(function (p) {
      return p.pid = pid;
    })
  };

  return output;
}]);

app.factory('users', ['$http', function ($http) {
  var output = {
    data: []
  };

  output.updateCart = function (openId, ad, cart) {
    return $http.post('/shop/updateCart', {openId: openId, ad: ad, cart: cart});
  };
  
  return output;
}]);

app.controller('IndexCtrl', [
'$scope','$http', '$timeout', '$interval', '$location', '$anchorScroll', 'products', 'users',
function($scope, $http, $timeout, $interval, $location, $anchorScroll, products, users){
  $scope.selected = 0;
  $scope.views = [
    ['main'],
    ['cart'],
    ['mine']
  ];
  $scope.currentView = 'main';
  $scope.category = ['水喉','電力','鎖具','鋁窗','門','冷氣','油漆','泥水','木器','其他'];
  $scope.tabName = ['商城', '購物車', '我'];

  $scope.cart = [];

  $scope.init = function () {
    var url = location.href.split('#')[0];
    url = encodeURIComponent(url);
    
    $http.get('/shop/init?code='+code+'&url='+url+'&ad='+ad+'&sharedBy='+sharedBy).success(function(data, status, headers, config) {
      console.log(data); 
      $scope.noncestr = data.noncestr;
      $scope.signature = data.signature;
      $scope.ticket = data.ticket;
      $scope.timestamp = data.timestamp;
      $scope.openId = data.openId;
      $scope.cart = data.cart;

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
        // wx.onMenuShareTimeline({
        //     title: '今晚總決賽！投票截止倒計時', // 分享标题
        //     link: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid='+appid+'&redirect_uri=http%3A%2F%2F'+host+'%2F'+apps+'%3FsharedBy%3D'+data.openId+'%26ad%3D'+ad+'&response_type=code&scope='+snsapi+'&state=123#wechat_redirect',
        //     imgUrl: 'http://'+host+'/images/blueman/share/wecast-share.png', // 分享图标
        //     success: function() {
        //     },
        //     cancel: function() {
        //         // 用户取消分享后执行的回调函数
        //     }
        // });
        // wx.onMenuShareAppMessage({
        //   title: '今晚總決賽！投票截止倒計時', // 分享标题
        //   desc: '估波仔! CheersPub 送你特色 Cocktail x Pizza', // 分享描述
        //   link: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid='+appid+'&redirect_uri=http%3A%2F%2F'+host+'%2F'+apps+'%3FsharedBy%3D'+data.openId+'%26ad%3D'+ad+'&response_type=code&scope='+snsapi+'&state=123#wechat_redirect',
        //   imgUrl: 'http://'+host+'/images/blueman/share/wecast-share.png', // 分享图标
        //   success: function () {
        //   },
        //   cancel: function () {
        //   }
        // });
      });
      wx.error(function(res){

      });
    }).error(function(data, status, headers, config) { //如果從外部連結返回時會遇到code error問題，就要重新定向
        //window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid='+appid+'&redirect_uri=http%3A%2F%2F'+host+'%2F'+apps+'%3FsharedBy%3Dwecast%26ad%3D'+ad+'&response_type=code&scope='+snsapi+'#wechat_redirect';
      $scope.openId = 'o5OVfwJhe_dGCYTtjFgnKgZWR5jc';
      $scope.user = {
        address: ['雅廉訪','高士德'],
        orders: []
      }
      $scope.items = [

      ];
      $scope.addItem({
        id: '1234',
        name: '塑膠水喉',
        description: '塑膠水喉，長度有分1尺，3尺，5尺等',
        spec: [
          {id: '12345', label: '1尺', price: 10},
          {id: '12346', label: '3尺', price: 20},
          {id: '12347', label: '5尺', price: 30}
        ]
      });
      $scope.addItem({
        id: '1235',
        name: '銅水喉',
        description: '銅水喉，長度有分1尺，3尺，5尺等',
        spec: [
          {id: '12355', label: '1尺', price: 10},
          {id: '12356', label: '3尺', price: 20},
          {id: '12357', label: '5尺', price: 30}
        ]
      });
      $scope.addItem({
        id: '1236',
        name: '三叉',
        description: '三叉，分小，中，大等',
        spec: [
          {id: '12365', label: '小', price: 10},
          {id: '12366', label: '中', price: 20},
          {id: '12367', label: '大', price: 30}
        ]
      });

      

    });
  
  };

  $scope.titleText = function (view) {
    console.log(view);
    return $scope.viewsTitle[view];
  }

  $scope.isSelected = function (index) {
    return index == $scope.selected;
  }

  $scope.selectTab = function (index) {
    if ($scope.selected != index) {
      $scope.selected = index;
      var len = $scope.views[$scope.selected].length;
      $scope.currentView = $scope.views[$scope.selected][len-1];
    } else {
      $scope.popView();
    }
  }

  $scope.tabLabel = function (index) {
    if (index == $scope.selected && $scope.views[$scope.selected].length > 1) {
      return '返回';
    } else {
      return $scope.tabName[index];
    }
  }

  $scope.isView = function (view) {
    return view == $scope.currentView;
  }

  $scope.pushView = function (view) {
    if ($scope.views[$scope.selected] == undefined) {
      $scope.views[$scope.selected] = [view];
    } else {
      $scope.views[$scope.selected].push(view);
    }
    $scope.currentView = view;
  };

  $scope.popView = function () {
    if ($scope.views[$scope.selected]) {
      if ($scope.views[$scope.selected].length > 1) {
        $scope.views[$scope.selected].pop();
        var len = $scope.views[$scope.selected].length;
        $scope.currentView = $scope.views[$scope.selected][len-1];
      }
    }
  }

  $scope.selectCategory = function (name) {
    $scope.selectedCategory = name;
    products.getAll(name).success(function (data) {
      $scope.items = angular.copy(data);
      $scope.pushView('items');
    })
    
  };

  $scope.selectItem = function (item) {
    $scope.selectedItem = {};
    $scope.selectedItem.item = item;
    $scope.selectedItem.value = 1;
    $scope.selectedItem.spec = 0;

    $scope.selectSpec();
    $scope.pushView('item');
  };

  $scope.selectSpec = function () {
    $scope.imgUrl = $scope.selectedItem.item.specification[$scope.selectedItem.spec].imgUrl;
  };

  $scope.addItem = function (item) {
      // item = item || {
      //   id: '1237',
      //   name: '四叉',
      //   description: '四叉，分小，中，大等',
      //   spec: [
      //     {id: '12375', label: '小', price: 10},
      //     {id: '12376', label: '中', price: 20},
      //     {id: '12377', label: '大', price: 30}
      //   ]
      // };
      // $scope.items.push(item);
  }



  $scope.addCart = function (selectedItem) {
    var tempCart = $scope.cart;
    var temp = {};
    temp.item = selectedItem.item;
    temp.spec = selectedItem.spec;
    temp.value = selectedItem.value;

    if (!$scope.addCartValid()) {
      return;
    }

    var index = $scope.cart.findIndex(function (item) {

      return item.item.pid == selectedItem.item.pid && item.spec == selectedItem.spec;
    });
    if (index == -1) {
      $scope.cart.push(temp);
    } else {
      $scope.cart[index].value += selectedItem.value;
    }

    users.updateCart($scope.openId, ad, $scope.cart).success(function (data) {
      console.log($scope.cart);
      $scope.showToast = true;
      $timeout(function () {
          $scope.showToast = false;
      }, 1000);
      $scope.selectedItem = undefined;
      $scope.popView();
    }).error(function (err) {
      console.log(err);
      $scope.cart = tempCart;
    });
    
  };

  $scope.sumCart = function () {
    var totalItem = 0;
    var totalAmount = 0;
    $scope.cart.forEach(function (item, index, array) {
      totalItem += item.value;
      totalAmount += item.item.specification[item.spec].price * item.value;
    });

    return "共"+totalItem+"件，總價：MOP"+totalAmount;
  }

  $scope.removeCart = function (index) {
    $scope.cart.splice(index, 1);
  };

  $scope.showValueDialog = function (index) {
    $scope.valueDialog = true;
    $scope.selectedCartItem = $scope.cart[index];
  };

  $scope.changeValue = function () {
    if (!$scope.selectedCartItem.value || $scope.selectedCartItem.value < 1 || $scope.selectedCartItem.value > 999) {
      return;
    }
    users.updateCart($scope.openId, ad, $scope.cart).success(function (data) {
      console.log($scope.cart);
      $scope.valueDialog = false;
    }).error(function (err) {
      console.log(err);
      $scope.valueDialog = false;
    });
    
    
  };

  $scope.placeOrder = function (cart) {
    $scope.newOrder = {};
    $scope.newOrder.done = false;
    $scope.newOrder.date = new Date();
    $scope.newOrder.list = [].concat(cart);
    $scope.newOrder.address = $scope.user.address[0];
    $scope.newOrder.phone = $scope.user.phone;
    $scope.pushView('create_order');
  };

  $scope.confirmOrder = function (order) {
    if (!$scope.orderFormValid()) {
      return;
    }
    if (order.newAddress) {
      $scope.user.address.unshift(order.newAddress);
      order.address = order.newAddress;
    }
    $scope.user.phone = order.phone;
    console.log(order);
    $scope.user.orders.unshift(order); 

    $scope.cart = [];
    $scope.popView();
    $scope.selectTab(2);
    $scope.pushView('mine_order');
  }

  $scope.valueValid = function () {
    if (!$scope.selectedItem) {
      return;
    }
    if ($scope.selectedItem.value < 1 || !$scope.selectedItem.value) {
      return false;
    }
    return true;
  }

  $scope.addCartValid = function () {
    return $scope.valueValid();
  }

  $scope.phoneValid = function () {
    if (!$scope.newOrder) {
      return;
    }
    if (!$scope.newOrder.phone) {
      return false;
    }
    return true;
  }

  $scope.addressValid = function () {
    if (!$scope.newOrder) {
      return;
    }
    if (!$scope.newOrder.address && !$scope.newOrder.newAddress) {
      return false;
    }
    return true;
  }

  $scope.orderFormValid = function () {
    return $scope.phoneValid() & $scope.addressValid();
  }
}]);
