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


app.controller('IndexCtrl', [
'$scope','$http', '$timeout', '$interval', '$location', '$anchorScroll',
function($scope, $http, $timeout, $interval, $location, $anchorScroll){
  $scope.today = new Date();
  
  $scope.fields = {
    name: ["PID", "Name", "Price", "Inventory"],
    prop: ["pid", "name", "price", "inventory"]
  }
  
  $scope.data = [
    {
      pid: 1001,
      name: 'A',
      price: 10,
      inventory: 100
    },
    {
      pid: 1002,
      name: 'B',
      price: 20,
      inventory: 100
    },
    {
      pid: 1003,
      name: 'A',
      price: 30,
      inventory: 100
    }
  ]

  $scope.init = function () {
    $scope.view = 'product';
  };

  $scope.isView = function (view) {
    return view == $scope.view;
  }

}]);
