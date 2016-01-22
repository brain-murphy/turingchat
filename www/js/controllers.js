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
   
.controller('homeCtrl', ['$scope', 'UserStats', function($scope, UserStats) {
	
	initializeScopeBindings();
	
	/////////////////////////////////////////////
	
	function initializeScopeBindings() {
		$scope.score = UserStats.score;
		$scope.numCorrect = UserStats.numCorrect;
		$scope.numIncorrect = UserStats.numIncorrect;
	}
}])
 