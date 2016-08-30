var app = angular.module('shopconfig', ['ui.bootstrap']).config(['$httpProvider', function($httpProvider) {
    //$httpProvider.defaults.timeout = 130000;
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

app.factory('orders', ['$http', function ($http) {
  var output = {
    data: []
  };

  output.getAll = function () {
    return output.data = [
      {
        oid: 1000001,
        done: false,
        date: '2016-01-01 10:30:00',
        address: '雅廉訪',
        phone: '66778899',
        list: [
          {
            item: {
              pid: 100001,
              name: 'A',
              description: 'aaaaaaaaaaaaa',
              specification: [
                {sid: 1, label: 'A1', price: 10},
                {sid: 2, label: 'A2', price: 20},
                {sid: 3, label: 'A3', price: 30}
              ],
              imgUrl: 'https://community.uservoice.com/wp-content/uploads/iterative-product-development-800x533.jpg'
            },
            spec: 0,
            value: 2
          },
          {
            item: {
              pid: 100002,
              name: 'B',
              description: 'bbbbbbbbb',
              specification: [
                {sid: 1, label: 'B1', price: 10},
                {sid: 2, label: 'B2', price: 20},
                {sid: 3, label: 'B3', price: 30}
              ],
              imgUrl: 'https://community.uservoice.com/wp-content/uploads/iterative-product-development-800x533.jpg'
            },
            spec: 0,
            value: 1
          }
        ]
      }
    ]
      
  };

  output.edit = function (order) {
    var index = output.data.map(function (o) {
      return o.oid;
    }).indexOf(order.oid);
    output.data[index] = order;
  }

  return output;
}]);

app.factory('products', ['$http', function ($http) {
  var output = {
    data: []
  };

  output.getAll = function () {
    // output.data = [
    //   {
    //     pid: 100001,
    //     name: 'A',
    //     description: 'aaaaaaaaaaaaa',
    //     specification: [
    //       {sid: 10000101, label: 'A1', price: 10},
    //       {sid: 10000102, label: 'A2', price: 20},
    //       {sid: 10000103, label: 'A3', price: 30}
    //     ],
    //     imgUrl: 'https://community.uservoice.com/wp-content/uploads/iterative-product-development-800x533.jpg'
    //   },
    //   {
    //     pid: 100002,
    //     name: 'B',
    //     description: 'bbbbbbbbb',
    //     specification: [
    //       {sid: 10000201, label: 'B1', price: 10},
    //       {sid: 10000202, label: 'B2', price: 20},
    //       {sid: 10000203, label: 'B3', price: 30}
    //     ],
    //     imgUrl: 'https://community.uservoice.com/wp-content/uploads/iterative-product-development-800x533.jpg'
    //   },
    //   {
    //     pid: 100003,
    //     name: 'C',
    //     description: 'cccccccc',
    //     specification: [
    //       {sid: 10000301, label: 'C1', price: 10},
    //       {sid: 10000302, label: 'C2', price: 20},
    //       {sid: 10000303, label: 'C3', price: 30}
    //     ],
    //     imgUrl: 'https://community.uservoice.com/wp-content/uploads/iterative-product-development-800x533.jpg'
    //   }
    // ];
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
    return $http.post('/shopConfig/removeProduct', {pid: pid});
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
    prop: ["date", "phone"]
  }

  $scope.fields = {
    name: ["PID", "產品名稱", "產品簡介", "售價"],
    prop: ["pid", "name", "description"]
  }
  
  $scope.data = [];
  $scope.orderData = [];

  $scope.init = function () {
    $scope.view = 'product';
    orders.getAll();
    $scope.orderData = orders.data;
  };

  $scope.isView = function (view) {
    return view == $scope.view;
  };

  $scope.selectTab = function (index) {
    switch (index) {
      case 0: 
        orders.getAll();
        $scope.orderData = orders.data;
        console.log('order');
        break;
      case 1: 
        products.getAll().success(function (data) {
          products.data = angular.copy(data);
          $scope.data = products.data;
          console.log(data);
        });;
        
        console.log('product');
        break;
      default:
        break;
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

  $scope.editOrder = function (order) {
    order.done = true;
    orders.edit(order);
    $scope.hideEditOrderForm();
  };

}]);
