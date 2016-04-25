(function () {
'use strict';
var app = angular.module('wecast.advertisement', ['blueimp.fileupload', 'ngResource']).config([
    '$httpProvider', 'fileUploadProvider', '$resourceProvider',
    function($httpProvider, fileUploadProvider, $resourceProvider) {
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
        fileUploadProvider.defaults.redirect = window.location.href.replace(
            /\/[^\/]*$/,
            '/cors/result.html?%s'
        );
        angular.extend(fileUploadProvider.defaults, {
            // Enable image resizing, except for Android and Opera,
            // which actually support image resizing, but fail to
            // send Blob objects via XHR requests:
            disableImageResize: /Android(?!.*Chrome)|Opera/
                .test(window.navigator.userAgent),
            maxFileSize: 999000,
            acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i
        });
        $resourceProvider.defaults.stripTrailingSlashes = false;
    }
]).controller('AdvertisementCtrl', [
'$scope', '$resource','$filter', '$window',
function($scope, $resource){
  var Advertisement = $resource('/advertisement/:adId', {adId:'@id'});
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
      title: '内容',
      schemaKey: 'content',
      type: 'text',
      inTable: true
  }, {
      title: '抽奖讯息',
      schemaKey: 'drawInfo',
      type: 'text',
      inTable: true
  }
  ];

  $scope.test = 'Hello world!';
  $scope.init = function()
  {
    Advertisement.query({}, function(advertisements) {
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
    Advertisement.get({adId: id}, function(adOne){
      $scope.advertisement = adOne;
      $scope.options.url = "/advertisement/image/" + id;
      $scope.$on('fileuploadsubmit', function(e, data) {
        data.url = $scope.options.url;
      });
      $scope.$on('fileuploadadd', function(e, data) {
        data.url = $scope.options.url;
      });
      $scope.showUpdateForm = true;
      window.location.href= "#";
    })
  };
  $scope.add = function(ad){
    var adPO = new Advertisement({
        title: $scope.advertisement.title,
        content: $scope.advertisement.content,
        drawInfo: $scope.advertisement.drawInfo,
    });
    adPO.$save(function(data, headers) {
        $scope.advertisement = data;
        $scope.options.url = "/advertisement/image/" + data.id;
        $scope.$on('fileuploadsubmit', function(e, data) {
         data.url = $scope.options.url;
        });
        $scope.showUpdateForm = true;
        $scope.showForm = false;
        alert("创建成功");
        $scope.advertisements.push($scope.advertisement);
    }, function(data, headers) {
        $scope.userError = data.data;
    });
  };



}])
.controller('FileDestroyController', [
            '$scope', '$http',
            function ($scope, $http) {
                var file = $scope.file,
                    state;
                if (file.url) {
                    file.$state = function () {
                        return state;
                    };
                    file.$destroy = function () {
                        state = 'pending';
                        return $http({
                            url: file.deleteUrl,
                            method: file.deleteType
                        }).then(
                            function () {
                                state = 'resolved';
                                $scope.clear(file);
                            },
                            function () {
                                state = 'rejected';
                            }
                        );
                    };
                } else if (!file.$cancel && !file._index) {
                    file.$cancel = function () {
                        $scope.clear(file);
                    };
                }
            }
        ]);;

}());
