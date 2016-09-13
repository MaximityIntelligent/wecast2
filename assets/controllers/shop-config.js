var app = angular.module('shopconfig', ['ui.bootstrap']).config(['$httpProvider', function($httpProvider) {
    //$httpProvider.defaults.timeout = 130000;
}])
.directive('convertToNumber', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {
      ngModel.$parsers.push(function(val) {
        return parseInt(val, 10);
      });
      ngModel.$formatters.push(function(val) {
        return '' + val;
      });
    }
  };
});;

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

app.factory('orders', ['$http', function ($http) {
  var output = {
    data: []
  };

  output.getAll = function () {
    return $http.get('/shopConfig/getOrders');
  };

  output.getNotDone = function (ad) {
    return $http.post('/shopConfig/getNotDone', {ad: ad});
  }

  output.edit = function (order) {
    return $http.post('/shopConfig/editOrder', order);
  };

  output.remove = function (order, remark) {
    return $http.post('/shopConfig/removeOrder', {order: order, remark: remark});
  };

  output.nextStepOrder = function (order, remark) {
    return $http.post('/shopConfig/nextStepOrder', {order: order, remark: remark});
  };

  output.prevStepOrder = function (order, remark) {
    return $http.post('/shopConfig/prevStepOrder', {order: order, remark: remark});
  };

  output.annualReport = function (year) {
    return $http.post('/shopConfig/annualOrder', {year: year});
  };

  output.monthlyReport = function (year, month) {
    return $http.post('/shopConfig/monthlyOrder', {year: year, month: month});
    
  };

  return output;
}]);

app.factory('products', ['$http', function ($http) {
  var output = {
    data: []
  };

  output.getAll = function () {
    return $http.get('/shopConfig/getProducts');
  };

  output.get = function (pid) {
    return output.data.find(function (p) {
      return p.pid = pid;
    })
  };

  output.create = function (product) {
    return $http.post('/shopConfig/createProduct', product);
  };

  output.remove = function (pid) {
    return $http.post('/shopConfig/removeProduct', {ad: $scope.ad, pid: pid});
  };

  output.edit = function (product) {
    return $http.post('/shopConfig/editProduct', product);
  }

  return output;
}]);

app.controller('IndexCtrl', [
'$scope','$http', '$timeout', '$interval', '$location', '$anchorScroll', 'products', 'orders',
function($scope, $http, $timeout, $interval, $location, $anchorScroll, products, orders){
  $scope.today = new Date();
  $scope.ad = 'adShop';
  $scope.category = ['水喉','電力','鎖具','鋁窗','門','冷氣','油漆','泥水','木器','其他'];

  $scope.orderFields = {
    name: ["狀態", "時間", "客戶", "總價"],
    prop: ["phone"]
  }

  $scope.fields = {
    name: ["產品簡介", "售價"],
    prop: ["pid", "name", "description"]
  };
  
  $scope.data = [];
  $scope.orderData = [];
  $scope.orderLimit = 5;
  $scope.orderCurrent = 0;
  $scope.orderBegin = 0;

  $scope.init = function () {

  };

  $scope.isView = function (view) {
    return view == $scope.view;
  };

  $scope.selectTab = function (index) {
    switch (index) {
      case 0: 
        orders.getNotDone($scope.ad).success(function (data) {
          orders.data = angular.copy(data);
          $scope.orderData = orders.data;
        });
        console.log('order');
        break;
      case 1: 
        products.getAll().success(function (data) {
          products.data = angular.copy(data);
          $scope.data = products.data;
          console.log(data);
          $scope.productCurrent = 1;
          $scope.maxSize = 3;
          $scope.productLimit = 5;
        });
        console.log('product');
        break;
      case 2:
        var today = new Date();
        $scope.year = today.getFullYear();
        orders.annualReport($scope.year).success(function (data) {
          $scope.orderReport = angular.copy(data);
        }).error(function (err) {
          
        });
        console.log('report');
        break;
      default:
        break;
    }
  };

  $scope.orderNextPage = function (filtered) {
    var max = Math.ceil(filtered.length / $scope.orderLimit);
    $scope.orderCurrent = Math.min(max-1, $scope.orderCurrent+1);
    console.log($scope.orderCurrent + " " + $scope.orderLimit);
  };

  $scope.orderPrevPage = function () {
    $scope.orderCurrent = Math.max(0, $scope.orderCurrent-1);
    console.log($scope.orderCurrent);
  };

  $scope.orderPages = function (filtered, orderLimit) {
    var max = Math.ceil(filtered.length / orderLimit);
    var pages = [];
    for (var i = 0; i < max; i++) {
      pages.push(i);
    }
    var start = $scope.orderCurrent - 1;
    start = Math.min(max-3, start);
    // console.log(start+" "+max);
    start = Math.max(0, start);
    // console.log(start);
    var end = Math.min(max, start+3);
    // console.log(start+" "+end);
    return pages.slice(start, end);
  };

  $scope.setCurrent = function (page) {
    $scope.orderCurrent = page;
    // console.log($scope.orderCurrent);
  };

  $scope.isCurrent = function (page) {
    return $scope.orderCurrent == page;
  };

  $scope.changeLimit = function (limit) {
    $scope.orderLimit = limit;
    $scope.orderCurrent = 0;
  };

  $scope.changeProductLimit = function (limit) {
    $scope.productLimit = limit;
    $scope.productCurrent = 0;
  };

  $scope.localTimeString = function (date) {
    var temp = new Date(date);
    return temp.toLocaleString();
  }

  $scope.shippingText = function (shipping) {
    var map = {
      'pending': '待處理',
      'ready': '準備中',
      'shipping': '運送中',
      'arrived': '已到達'
    }
    return map[shipping];
  };

  $scope.nextText = function (shipping) {
    var map = {
      'pending': '接受訂單',
      'ready': '發送貨物',
      'shipping': '交付貨物'
    }
    return map[shipping];
  }
  
  $scope.prevText = function (shipping) {
    var map = {
      
      'ready': '重新待處理',
      'shipping': '重新準備',
      'arrived': '重新運送'
    }
    return map[shipping];
  };

  $scope.recordClass = function (record) {
    if (record.deleted) {
      return 'list-group-item-danger';
    }
    if (record.done) {
      return 'list-group-item-success';
    }
    if (record.nextStep) {
      return 'list-group-item-info';
    } else {
      return 'list-group-item-warning';
    }

  }

  $scope.priceRange = function (product) {
    var priceArr = product.specification.map(function (s) {
      return s.price;
    });
    if (priceArr.length > 1) {
      return Math.min.apply(null, priceArr) + '~' + Math.max.apply(null, priceArr);
    } else {
      return priceArr.pop() || 0;
    }
  };

  $scope.sumOrder = function (order) {
    var totalItem = 0;
    var totalAmount = 0;
    if (!order) {
      return;
    }
    order.list.forEach(function (item, index, array) {
      totalItem += item.value;
      totalAmount += item.item.specification[item.spec].price * item.value;
    });
    return "共"+totalItem+"件，總價：MOP"+totalAmount;
  };

  $scope.sidChange = function (product) {
    product.specification.forEach(function (item, index) {
      product.specification[index].sid = product.pid*100+index+1;
    });
  }

  $scope.showCreateForm = function () {
    $scope.newProduct = {
      ad: $scope.ad,
      category: '其他'
    };
    $scope.newProduct.specification = [
      {sid: 1}
    ];
    $scope.showCreate = true;
    $scope.showEdit = false;
  };

  $scope.hideCreateForm = function () {
    $scope.newProduct = {};
    $scope.showCreate = false;
  };

  $scope.showEditForm = function (product) {
    console.log(product);
    $scope.selectProduct = angular.copy(product);
    console.log($scope.selectProduct);
    $scope.showEdit = true;
    $scope.showCreate = false;
  }

  $scope.hideEditForm = function () {
    $scope.selectProduct = undefined;
    $scope.showEdit = false;
  }

  $scope.showEditOrderForm = function (order) {
    $scope.selectOrder = angular.copy(order);
    $scope.showEditOrder = true;
  }

  $scope.hideEditOrderForm = function () {
    $scope.selectOrder = undefined;
    $scope.showEditOrder = false;
  }

  $scope.addSpecification = function () {
    $scope.newProduct.specification.push({sid: $scope.newProduct.specification.length+1});
    $scope.sidChange($scope.newProduct);
  };

  $scope.removeSpecification = function (index) {
    $scope.newProduct.specification.splice(index, 1);
    $scope.sidChange($scope.newProduct);
  }

  $scope.addSelectSpecification = function () {
    $scope.selectProduct.specification.push({sid: $scope.selectProduct.specification.length+1});
    $scope.sidChange($scope.newProduct);
  };

  $scope.removeSelectSpecification = function (index) {
    $scope.selectProduct.specification.splice(index, 1);
    $scope.sidChange($scope.selectProduct);
  }

  $scope.createProduct = function (product) {
    product.newEditTag = undefined;
    products.create(product).success(function (data) {
      products.data.push(data);
      $scope.data = products.data;
      $scope.newProduct = {};
      $scope.showCreate = false;
      console.log(data);
    }).error(function (err) {
      console.log(err);
    });
    
  };

  $scope.addCreateTag = function (tag) {
    console.log(tag);
    if (tag) {
      if (!$scope.newProduct.tag) {
        $scope.newProduct.tag = [];
      }
      $scope.newProduct.tag.push(tag);
      $scope.newProduct.newEditTag = undefined;
    }
  };

  $scope.removeCreateTag = function (index) {
    $scope.newProduct.tag.splice(index, 1);
  };

  $scope.removeProduct = function(pid) {
    products.remove(pid).success(function (data) {
      var index = products.data.map(function (p) {
        return p.pid;
      }).indexOf(pid);
      products.data.splice(index, 1);
      $scope.data = products.data;
    }).error(function (err) {
      console.log(err);
    });
  };

  $scope.editProduct = function (product) {
    product.newEditTag = undefined;
    products.edit(product).success(function (data) {
      var index = products.data.map(function (p) {
        return p.pid;
      }).indexOf(product.pid);
      products.data[index] = data;
      $scope.data = products.data;
      $scope.selectProduct = undefined;
      $scope.showEdit = false;
    }).error(function (err) {
      console.log(err);
    });

  };

  $scope.addEditTag = function (tag) {
    console.log(tag);
    if (tag) {
      if (!$scope.selectProduct.tag) {
        $scope.selectProduct.tag = [];
      }
      $scope.selectProduct.tag.push(tag);
      $scope.selectProduct.newEditTag = undefined;
    }
  };

  $scope.removeEditTag = function (index) {
    $scope.selectProduct.tag.splice(index, 1);
  };

  $scope.getAllOrder = function () {
    orders.getAll().success(function (data) {
      orders.data = angular.copy(data);
      $scope.orderData = orders.data;
    });
  };

  $scope.nextStepOrder = function (order, remark) {
    orders.nextStepOrder(order, remark).success(function (data) {
      var index = $scope.orderData.map(function (o) {
        return o.oid;
      }).indexOf(order.oid);
      $scope.orderData[index] = data;
      $scope.selectOrder = data;
      remark = undefined;
      $scope.remark = undefined;
      console.log($scope.orderData);
    }).error(function (err) {
      console.log(err);
    });
  };

  $scope.prevStepOrder = function (order, remark) {
    orders.prevStepOrder(order, remark).success(function (data) {
      var index = $scope.orderData.map(function (o) {
        return o.oid;
      }).indexOf(order.oid);
      $scope.orderData[index] = data;
      $scope.selectOrder = data;
      remark = undefined;
      $scope.remark = undefined;
    }).error(function (err) {
      console.log(err);
    });
  };

  $scope.cancelOrder = function (order, remark) {
    orders.remove(order, remark).success(function (data) {
      var index = $scope.orderData.map(function (o) {
        return o.oid;
      }).indexOf(order.oid);
      $scope.orderData.splice(index, 1);
      $scope.hideEditOrderForm();
    }).error(function (err) {
      console.log(err);
    })
  }

  $scope.changeYear = function (year) {
    $scope.month = undefined;
    orders.annualReport(year).success(function (data) {
      $scope.orderReport = angular.copy(data);
    }).error(function (err) {
      console.log(err);
    });
  };

  $scope.changeMonth = function (year, month) {
    if (!month) {
      orders.annualReport(year).success(function (data) {
        $scope.orderReport = angular.copy(data);
      }).error(function (err) {
        console.log(err);
      });
    } else {
      orders.monthlyReport(year, month).success(function (data) {
        $scope.orderReport = angular.copy(data);
      }).error(function (err) {
        console.log(err);
      });
    }
    
  };

}]);
