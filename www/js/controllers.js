/* global angular */

angular.module('app.controllers', [])
  
.controller('chatCtrl', function($scope, auth, chat) {

	initializeScopeBindings();
	
	
	
	
	//////////////////////////////////////////////////
	
	function initializeScopeBindings() {
		$scope.messages = chat.messages;
		$scope.isHumanGuess = chat.isHumanProperty;
	}
})
   
.controller('homeCtrl', function($scope) {
	
})
 