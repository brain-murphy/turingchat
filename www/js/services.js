/* global angular, Firebase */

angular.module('app.services', ['firebase'])

.constant('FIREBASE_URL', 'https://turingchat.firebaseio.com/')

// maximum amount of messages that we are allowing the chatters to send before the game ends
.constant('MAX_MESSAGES', 10)

.factory('Auth', ['$firebaseAuth', 'FIREBASE_URL',
	function($firebaseAuth, FIREBASE_URL) {
		var ref = new Firebase(FIREBASE_URL);
		return $firebaseAuth(ref);
	}
])

.factory('AuthManager', ['Auth', function (Auth) {
	function generateRandomEmail() {
		return generateRandomString() + '@fake.turingchat.com';
	}
	
	function generateRandomString() {
		var alphabet = 'abcdefghijklmnopqrstuvwxyz',
			randomString = '';
		for (var i = 0; i < 10; i++) {
			randomString += alphabet[Math.floor(Math.random() * 26)]
		}
		
		return randomString;
	}
	
	function hasLoggedInBefore() {
		return localStorage.email && localStorage.password;
	}
	
	function getEmail() {
		if (!hasLoggedInBefore()) {
			localStorage.email = generateRandomEmail();
		}
		return localStorage.email;
	}
	
	function getPassword() {
		if (!hasLoggedInBefore()) {
			localStorage.password = generateRandomString();
		}
		return localStorage.password;
	}
	
	function getAuthInfo() {
		return {
			email:getEmail(),
			password:getPassword()
		}
	}
	
	function signIn() {
		if (!Auth.$getAuth()) {
			if (!hasLoggedInBefore()) {
				return Auth.$createUser(getAuthInfo());
			} else {
				return Auth.$authWithPassword(getAuthInfo());
			}
		} else {
			return Auth.$getAuth();
		}
	}
	
	return {
		getAuth: Auth.$getAuth,
		signIn: signIn
	}
}])

.factory('Chat', ['$firebaseArray', '$firebaseObject', 'FIREBASE_URL',
	function($firebaseArray, $firebaseObject, FIREBASE_URL) {
		var rootFirebaseRef,
			isHumanFirebaseObject,
			messages;
		
		function initializeChat(chatId) {
			rootFirebaseRef = newFirebaseRefForChat(chatId)
			initializeMessages();
			initializeIsHumanFirebaseRef();
		}
		
		function newFirebaseRefForChat(chatId) {
			return new Firebase(FIREBASE_URL + 'chats/' + chatId);
		}
		
		function initializeMessages() {
			var messagesFirebaseRef = rootFirebaseRef.child('messages');
			messages = $firebaseArray(messagesFirebaseRef);
		}
		
		function initializeIsHumanFirebaseRef() {
			var isHumanFirebaseRef = rootFirebaseRef
				.child('partners')
				.child(getUserUid())
				.child('ai_guess');
				
			isHumanFirebaseObject = $firebaseObject(isHumanFirebaseRef);
		}
		
		function getUserUid() {
			rootFirebaseRef.getAuth().uid;
		}
		
		function addMessage(messageText) {
			messages.$add({
				user: getUserUid(),
				text: messageText
			});
		}
		
		return {
			initialize: initializeChat,
			messages: messages,
			isHumanProperty: isHumanFirebaseObject,
			addMessage: addMessage
		};
	}
]);

