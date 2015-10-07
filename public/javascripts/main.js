var app = angular.module('nodeploy', []);

app.controller('MapController', function($scope,$http) {
    $scope.projects = ""

    var listProjects = function(){
      $http.get("/projects/map/list").success(function(data) {
        $scope.projects = data;
      });
    };

    $scope.mapAllProjects = function(){
      $http.get("/projects/map/all").success(function(data) {
        listProjects();
      });
    };

    $scope.mapOwnedProjects = function(){
      $http.get("/projects/map/owned").success(function(data) {
        console.log(data);
        listProjects();
      });
    };

    $scope.deleteProject = function(id,name){
      var confirmOption = confirm("Are you sure that you want to delete the project "+name+"?");
      if(confirmOption){
        console.log("Deleted!");
        console.log(id);
      } 
    };   

    listProjects(); 
});