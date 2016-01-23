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

.controller('waitingCtrl', ['$scope', 
	function ($scope) {
		console.log('waitingCtrl called');
	}
])
   
.controller('homeCtrl', ['$scope', 'userStats', 'highStats',
	function($scope, userStats, highStats) {
		initializeScopeBindings();
		
		startWatchingForNewHighScore();
		
		/////////////////////////////////////////////
		
		function initializeScopeBindings() {
			$scope.userInfo = userStats;
			$scope.bestStats = highStats;
		}
		
		function startWatchingForNewHighScore() {
			var unwatch = userStats.$watch(updateHighScoreIfNecessary)
			// call unwatch to remove callback if necessary
		}
		
		function updateHighScoreIfNecessary() {
			if (userStats.score > highStats.score) {
				highStats.score = userStats.score;
			}
			
			if (userStats.num_correct > highStats.num_correct) {
				highStats.num_correct = userStats.num_correct;
			}
			
			if (userStats.num_incorrect < highStats.num_incorrect) {
				highStats.num_incorrect = userStats.num_incorrect;
			}
			
			highStats.$save();
		}
	}
]);
 