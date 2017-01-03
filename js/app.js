var app = angular.module('app', ['ui.bootstrap','ngRoute', 'ngMap']);

app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "templates/landing.html"
    })
    .when("/searchResults", {
        templateUrl : "templates/searchResults.html",
		controller : "SearchController"
    })
    .when("/itemDetails", {
        templateUrl : "templates/itemDetails.html",
		controller : "SearchController"
    })
    .otherwise({
			redirectTo: "/"
    });
});

//Controller for Carousele
app.controller('CarouselCtrl', CarouselCtrl);
function CarouselCtrl($scope){
  $scope.myInterval = 4000;
  $scope.noWrapSlides = false;
  $scope.active = 0;
  $scope.slides = [
    {
      image: 'http://lorempixel.com/400/200/'
    },
    {
      image: 'http://lorempixel.com/400/200/food'
    },
    {
      image: 'http://lorempixel.com/400/200/sports'
    },
    {
      image: 'http://lorempixel.com/400/200/people'
    }
  ];
};

//controller for Searching item
app.controller('SearchController',function($scope,$rootScope,dataFactory){
	
	//Service for connecting JSON
	dataFactory.get('json/products.json').then(function(data){
		$scope.items=data;
	});
	$scope.name="";
	$scope.onItemSelected=function(){
		$rootScope.searchName=$scope.name
	}
	$scope.results = [];
	
	//Function for getting clickable item details
	  $scope.findValue = function(enteredValue) {     
		angular.forEach($scope.items, function(value, key) {
		  if (key === enteredValue) {
			$scope.results.push({id: key, name: value.name, descri: value.descri, rating: value.rating});
		  }
		});
		$rootScope.searchResults=$scope.results;
	  };
});

//Directive for add/remove shortlist
app.directive('toggleClass', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('click', function() {
                element.toggleClass(attrs.toggleClass);
            });
        }
    };
});

//Directive for typeahead
app.directive('typeahead', function($timeout) {
  return {
    restrict: 'AEC',
    scope: {
		items: '=',
		prompt:'@',
		title: '@',
		subtitle:'@',
		model: '=',
		onSelect:'&'
	},
	link:function(scope,elem,attrs){
	   scope.handleSelection=function(selectedItem){
		 scope.model=selectedItem;
		 scope.current=0;
		 scope.selected=true;        
		 $timeout(function(){
			 scope.onSelect();
		  },200);
	  };
	  scope.current=0;
	  scope.selected=true;
	  scope.isCurrent=function(index){
		 return scope.current==index;
	  };
	  scope.setCurrent=function(index){
		 scope.current=index;
	  };
	},
    templateUrl: 'templates/searchTemplate.html'
  }
});

//Controller for Star rating
app.controller('RatingController', RatingController).directive('starRating', starRating);
  function RatingController($scope,$rootScope) {
    this.itemRating = $rootScope.searchResults[0].rating;
    this.isReadonly = true;
  }

//Custom Directive for Star rating
 function starRating() {
    return {
      restrict: 'EA',
      template:
        '<ul class="star-rating" ng-class="{readonly: readonly}">' +
        '  <li ng-repeat="star in stars" class="star" ng-class="{filled: star.filled}" ng-click="toggle($index)">' +
        '    <i class="fa fa-star">&#9733</i>' + // or &#9733
        '  </li>' +
        '</ul>',
      scope: {
        ratingValue: '=ngModel',
        max: '=?', // optional (default is 5)
        onRatingSelect: '&?',
        readonly: '=?'
      },
      link: function(scope, element, attributes) {
        if (scope.max == undefined) {
          scope.max = 5;
        }
        function updateStars() {
          scope.stars = [];
          for (var i = 0; i < scope.max; i++) {
            scope.stars.push({
              filled: i < scope.ratingValue
            });
          }
        };
        scope.toggle = function(index) {
          if (scope.readonly == undefined || scope.readonly === false){
            scope.ratingValue = index + 1;
            scope.onRatingSelect({
              rating: index + 1
            });
          }
        };
        scope.$watch('ratingValue', function(oldValue, newValue) {
          if (newValue) {
            updateStars();
          }
        });
      }
    };
  }
  
// Custom Filter for avoid duplicate item name in typeahead
app.filter('unique', function() {
   return function(collection, keyname) {
      var output = [], 
          keys = [];

      angular.forEach(collection, function(item) {
          var key = item[keyname];
          if(keys.indexOf(key) === -1) {
              keys.push(key);
              output.push(item);
          }
      });
      return output;
   };
});

// Factory for coneecting with database
app.factory('dataFactory', function($http) {
  return {
    get: function(url) {
      return $http.get(url).then(function(resp) {
        return resp.data;
      });
    }
  };
});