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

app.factory('products', ['$http', function ($http) {
  var output = {
    data: []
  };

  output.getAll = function () {
    output.data = [
      {
        pid: 100001,
        name: 'A',
        description: 'aaaaaaaaaaaaa',
        specification: [
          {sid: 10000101, label: 'A1', price: 10},
          {sid: 10000102, label: 'A2', price: 20},
          {sid: 10000103, label: 'A3', price: 30}
        ]
      },
      {
        pid: 100002,
        name: 'B',
        description: 'bbbbbbbbb',
        specification: [
          {sid: 10000201, label: 'B1', price: 10},
          {sid: 10000202, label: 'B2', price: 20},
          {sid: 10000203, label: 'B3', price: 30}
        ]
      },
      {
        pid: 100003,
        name: 'C',
        description: 'cccccccc',
        specification: [
          {sid: 10000301, label: 'C1', price: 10},
          {sid: 10000302, label: 'C2', price: 20},
          {sid: 10000303, label: 'C3', price: 30}
        ]
      }
    ];
    return;
  };

  output.get = function (pid) {
    return {
        pid: 100001,
        name: 'A',
        price: 10,
        inventory: 100,
        imgUrl: 'https://community.uservoice.com/wp-content/uploads/iterative-product-development-800x533.jpg'
      };
  };

  output.create = function (product) {
    return output.data.push(product);
  };

  return output;
}]);

app.controller('IndexCtrl', [
'$scope','$http', '$timeout', '$interval', '$location', '$anchorScroll', 'products',
function($scope, $http, $timeout, $interval, $location, $anchorScroll, products){
  $scope.today = new Date();
  
  $scope.fields = {
    name: ["PID", "產品名稱", "產品簡介"],
    prop: ["pid", "name", "description"]
  }
  
  $scope.data = [];

  $scope.init = function () {
    $scope.view = 'product';
    products.getAll();
    $scope.data = products.data;
  };

  $scope.isView = function (view) {
    return view == $scope.view;
  };

  $scope.showCreateForm = function () {
    $scope.newProduct = {};
    $scope.newProduct.specification = [
      {sid: 1}
    ];
    $scope.showCreate = true;
  };

  $scope.hideCreateForm = function () {
    $scope.newProduct = {};
    $scope.showCreate = false;
  };

  $scope.addSpecification = function () {
    $scope.newProduct.specification.push({sid: $scope.newProduct.specification.length+1});
  };

  $scope.removeSpecification = function (index) {
    $scope.newProduct.specification.splice(index, 1);
  }

  $scope.createProduct = function (product) {
    products.create(product);
    $scope.newProduct = {};
    $scope.showCreate = false;
    console.log(product);
  };

}]);
