var app = angular.module('splayer', []);

app.controller('PlayerCtrl', [
'$scope','$http', '$timeout', '$interval', '$location', '$anchorScroll', 
function($scope, $http, $timeout, $interval, $location, $anchorScroll){

  $scope.recommended = [
    {
      art: 'riversrobots',
      h1: 'Rivers & Robots',
      p: 'Rivers & Robots'
    },
    {
      art: 'dawnandhawkes',
      h1: 'Golden Heart',
      p: 'Dawn And Hawkes'
    },
    {
      art: 'sunshinecollective',
      h1: 'Somthing Good',
      p: 'Sunshine Collective'
    },
    {
      art: 'joeymaloney',
      h1: 'Plant a Story',
      p: 'Joey Maloney'
    },
    {
      art: 'socialclub',
      h1: 'Rejects',
      p: 'Social Club'
    }
  ]

  $scope.selectAlbum = function (album) {
    $scope.selectedAlbum = album;
  }
}]);