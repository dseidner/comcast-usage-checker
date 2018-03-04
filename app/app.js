'use strict';

// declare the app and DI the right modules
var app = angular.module("app", [
  'ui.bootstrap', // angularjs 1.x variant of bootstrap
  'ngAnimate', // required for above
  'angularMoment', // so we can reformat dates easily
  'datatables', // dynamic angularjs tables
  'datatables.bootstrap', // bootstrap integration with datatables
  'chart.js', // for dynamic chart building
  'ui.router' // so we can have multiple pages and submit URL data to SQL
]);

// controller used on load, we're going to stuff too much in here
// not using services in this yet... TODO
app.controller('comcastUsageCtrl', function ($scope, $http, moment, DTOptionsBuilder) {
  // setup defaults for when the app loads
  $scope.timeParam = 'Month';
  $scope.usage = '';
  // default to descending on first column of datatable
  $scope.options = DTOptionsBuilder.newOptions().withOption('order', [[0, 'desc']]);
  // get the results from php
  $http.get("app/getusage.php")
  .then(function(response) {
    // set usage to the data in the response object
    $scope.usage = response.data;
    // setup empty labels and data for chart
    var labels = [], data = [];
    // loop through the response data to push values into the chart vars
    for (var i = 0; i < response.data.length ; i++){
      // change label values to nice human format
      labels.push(moment.unix(response.data[i].time_key).format("M/DD hA"));
      data.push(response.data[i].gb);
    }
    // reverse the objects to display from oldest to newest
    $scope.labels = labels.reverse();
    $scope.data = data.reverse();
  });
});

app.controller('dayCtrl', function ($scope, $http, moment) {
  $scope.timeParam = 'Day';
  $scope.usage = '';
  $http.get("app/getdayusage.php")
  .then(function(response) {
    $scope.usage = response.data;
    var labels = [], data = [];
    for (var i = 0; i < response.data.length ; i++){
      labels.push(moment.unix(response.data[i].time_key).format("ddd, hA"));
      data.push(response.data[i].gb);
    }
    $scope.labels = labels.reverse();
    $scope.data = data.reverse();
  });
});

app.controller('weekCtrl', function ($scope, $http, moment) {
  $scope.timeParam = 'Week';
  $scope.usage = '';
  $http.get("app/getweekusage.php")
  .then(function(response) {
    $scope.usage = response.data;
    var labels = [], data = [];
    for (var i = 0; i < response.data.length ; i++){
      labels.push(moment.unix(response.data[i].time_key).format("ddd, hA"));
      data.push(response.data[i].gb);
    }
    $scope.labels = labels.reverse();
    $scope.data = data.reverse();
  });
});

app.controller('customCtrl', function ($scope, $http) {
  $scope.timeParam = 'Custom';
  $scope.usage = '';

  $http.get("app/getcustomusage.php")
  .then(function(response) {
      $scope.usage = response.data;
  });
});

app.controller('customMonthCtrl', function ($scope, $http, moment, customMonth, $stateParams) {
  $scope.timeParam = 'Custom Month';
  $scope.customMonth = $stateParams.month;
  $scope.usage = customMonth.data;
  var labels = [], data = [];
  for (var i = 0; i < customMonth.data.length ; i++){
    labels.push(moment.unix(customMonth.data[i].time_key).format("M/DD, hA"));
    data.push(customMonth.data[i].gb);
  }
  $scope.labels = labels.reverse();
  $scope.data = data.reverse();
});

app.config(function($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('/');

  $stateProvider

  .state('home', {
    url: '/',
    templateUrl: 'partials/home.html',
    controller: 'comcastUsageCtrl'
  })
  .state('day', {
    url: '/day',
    templateUrl: 'partials/home.html',
    controller: 'dayCtrl'
  })
  .state('week', {
    url: '/week',
    templateUrl: 'partials/home.html',
    controller: 'weekCtrl'
  })
  .state('custom', {
    url: '/custom',
    templateUrl: 'partials/custom.html',
    controller: 'customCtrl'
  })
  .state('custom-month', {
    url: '/custom-month/{month:any}',
    templateUrl: 'partials/home.html',
    controller: 'customMonthCtrl',
    resolve: {
      customMonth:  function($http, $stateParams){
        // $http returns a promise for the url data
        return $http(
          {method: 'POST',
           url: 'app/getcustommonth.php',
           data: {month: $stateParams.month},
           headers: {'Content-Type': 'application/x-www-form-urlencoded'}
          }
        );
     }
    }
  });

});
