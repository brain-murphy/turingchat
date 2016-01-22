/* global angular */

angular.module('app.controllers', ['app.services'])
  
.controller('chatCtrl', function($scope, auth, chat) {

	initializeScopeBindings();
	
	
	
	
	//////////////////////////////////////////////////
	
	function initializeScopeBindings() {
		$scope.messages = chat.messages;
		$scope.isHumanGuess = chat.isHumanProperty;
	}
})
   
.controller('homeCtrl', ['$scope', 'userStats', function($scope, userStats) {
	initializeScopeBindings();
	
	
	/////////////////////////////////////////////
	
	function initializeScopeBindings() {
		$scope.userInfo = userStats.userInfo;
	}
}])
 