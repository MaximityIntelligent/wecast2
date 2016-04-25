(function () {
'use strict';
var app = angular.module('wecast.advertisement_c', ['ngResource']).config([
    '$resourceProvider',
    function($resourceProvider) {
        $resourceProvider.defaults.stripTrailingSlashes = false;
    }
]).controller('AdvertisementCtrl', [
'$scope', '$resource',
function($scope, $resource){
  var Advertisement_c = $resource('/advertisement_c/:adId', {adId:'@id'});
  $scope.options = {url: ""};
  $scope.advertisement = {};
  $scope.showUpdateForm = false;
  $scope.showForm = false;

  $scope.advertisementSchema =
  [
  {
      title: '标题',
      schemaKey: 'title',
      type: 'text',
      inTable: true
  }, {
      title: 'Url',
      schemaKey: 'url',
      type: 'text',
      inTable: true
  }
  ];

  $scope.test = 'Hello world!';
  $scope.init = function()
  {
    Advertisement_c.query({}, function(advertisements) {
      $scope.advertisements = advertisements;
    });
  };
  $scope.update = function(ad){
    ad.$save(function(data, headers){
      alert("更新成功");
      $scope.edit(ad);
    });
  };
  $scope.edit = function(ad){
    $scope.showForm = false;
    var id = ad.id;
    Advertisement_c.get({adId: id}, function(adOne){
      $scope.advertisement = adOne;
      $scope.options.url = "/advertisement/image/" + id;
      $scope.showUpdateForm = true;
      window.location.href= "#";
    })
  };
  $scope.add = function(ad){
    var adPO = new Advertisement_c({
        title: $scope.advertisement.title,
        content: $scope.advertisement.url
    });
    adPO.$save(function(data, headers) {
        $scope.advertisement = data;
        $scope.showUpdateForm = true;
        $scope.showForm = false;
        alert("创建成功");
        $scope.advertisements.push($scope.advertisement);
    }, function(data, headers) {
        $scope.userError = data.data;
    });
  };
}])

}());
