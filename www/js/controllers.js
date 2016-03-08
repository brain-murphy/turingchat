/* global angular */

angular.module('app.controllers', ['app.services'])
  
.controller('chatCtrl', ['$scope', '$ionicHistory', 'auth', 'chat', 'userStats', 'MAX_MESSAGES', '$ionicModal',
	function($scope, $ionicHistory, auth, chat, userStats, MAX_MESSAGES, $ionicModal) {
        var unwatchForOpponentLeaving;

		initializeScopeBindings();
        
		initializeMessageWatcher();
        
        watchForOpponentLeavingChat();
        
        notifyOpponentIfILeaveChat();
        
		//////////////////////////////////////////////////
		
		function initializeScopeBindings() {
			$scope.messages = chat.messages;
			chat.isHumanProperty.$bindTo($scope, "isHumanProperties");
			
			$scope.newMessageText = '';
			$scope.sendMessage = sendMessage;
			
			$scope.getColor = getClassForMessage;
            
            $scope.messagesRemaining = MAX_MESSAGES;
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
			if (message.user === auth.uid) {
				return 'myMessage';
			} else {
				return 'partnerMessage';
			}
		} 
        
        function initializeMessageWatcher() {
            $scope.messages.$watch(countMessages);
        }
        
        function countMessages() {
            if (isGameComplete()) {
                unwatchForOpponentLeaving();
                if (didPlayerWin()) {
                    closeChatWithMessage('You were correct!');
                } else {
                    closeChatWithMessage('You were incorrect!');
                }
            }
            
            $scope.messagesRemaining = MAX_MESSAGES - $scope.messages.length;
        }
        
        function isGameComplete() {
            return $scope.messages.length >= MAX_MESSAGES;
        }
        
        function didPlayerWin() {
            return chat.isOpponentAI == chat.isHumanProperty.ai_guess;
        }
        
        function endChat() {
            applyScoreChanges();
            
            $ionicHistory.goBack(-2); // go back to home screen
        }
        
        function applyScoreChanges() {
            if (didPlayerWin()) {
                userStats.num_correct += 1;
                
                userStats.score += 2;
            } else {
                userStats.num_incorrect += 1;
                
                userStats.score -= 1;
            }
            
            userStats.$save();
        }
        
        function watchForOpponentLeavingChat() {
            unwatchForOpponentLeaving = chat.someoneLeftProperty
                .$watch(function () {
                    if (chat.someoneLeftProperty.$value) {
                        closeChatWithMessage('Your opponent left the chat!');
                    }
                });
        }
        
        function closeChatWithMessage(message) {
            addModalToScope(message)
            .then(setupModalCloseHooks)
            .then(function () {
                $scope.modal.show();
            })
        }
        
        function setupModalCloseHooks() {
            $scope.closeModal = function() {
                $scope.modal.hide();
            };
            
            $scope.$on('modal.hidden', function() {
                endChat();
            });
        }
        
        function addModalToScope(message) {
            var outsideScope = $scope;
            $scope.modalText = message;
           
            return $ionicModal.fromTemplateUrl('textModal.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                outsideScope.modal = modal;
            });
        }
        
        function notifyOpponentIfILeaveChat() {
		    $scope.$on('$ionicView.leave', function () {
                chat.someoneLeftProperty.$value = true;
                chat.someoneLeftProperty.$save();
            });
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
 