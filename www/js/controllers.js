/* global angular */

angular.module('app.controllers', ['app.services'])
  
.controller('chatCtrl', ['$scope', '$ionicHistory', 'auth', 'chat', 
	function($scope, $ionicHistory, auth, chat) {

		initializeScopeBindings();
		
		
		
		//////////////////////////////////////////////////
		
		function initializeScopeBindings() {
			$scope.messages = chat.messages;
			chat.isHumanProperty.$bindTo($scope, "isHumanProperties");
			
			$scope.newMessageText = '';
			$scope.sendMessage = sendMessage;
			
			$scope.getColor = getClassForMessage;
		}
		
		function sendMessage(messageText) {
			if (messageText) {
				$scope.messages.$add(createNewMessageObject(messageText));
				
				$scope.newMessageText = '';
			}
		}
		
		function createNewMessageObject(messageText) {
			return {
				user: auth.uid,
				text: messageText
			}
		}
		
		function getClassForMessage(message) {
			console.log(message);
			if (message.user === auth.uid) {
				return 'myMessage';
			} else {
				return 'partnerMessage';
			}
		} 
	}
])

.controller('waitingCtrl', ['$scope', '$location', 'FindChat', '$q', '$ionicLoading', '$rootScope',
	function ($scope, $location, FindChat, $q, $ionicLoading, $rootScope) {

		var goingToChat;
		
		$scope.$on('$ionicView.enter', function() {
			goingToChat = false;
			
			FindChat.searchForChat()
				.then(goToChatScreen, console.log.bind(console));
		});
		
		$scope.$on('$ionicView.leave', function () {
			
			if (!goingToChat) {
				console.log('chat cancelled');
				FindChat.cancel();
			}
		});
		
		
		function goToChatScreen(chatId) {
			goingToChat = true;
			console.log(chatId);
			
			redirectToChatPage(chatId);
		}
		
		function redirectToChatPage(chatId) {
			$location.path('chat/' + chatId);
			if (!$rootScope.$$phase) $rootScope.$apply();
		}
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
 