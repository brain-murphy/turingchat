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

.factory('AuthManager', ['Auth', '$q', 'FIREBASE_URL',
function (Auth, $q, FIREBASE_URL) {
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
	
	/*
		returns promise that contains the firebase auth property,
		and evaluates once the user info record has been written to the
		database
	*/
	function createUserAndSignIn() {
		return Auth.$createUser(getAuthInfo())
			.then(function (authData) {
				return Auth.$authWithPassword(getAuthInfo());
			})
			.then(addUserInfoToFirebaseRecord);
	}
	
	function addUserInfoToFirebaseRecord(authData) {
		var usersFirebaseRef = new Firebase(FIREBASE_URL + 'users/' + authData.uid);
		
		return $q(function (resolve, reject) {
			usersFirebaseRef.set(initializeNewUserRecord(), function () {
					resolve(authData);
			});
		});
	}
	
	function initializeNewUserRecord(userUid) {
		return {
				score:0,
				num_correct:0,
				num_incorrect:0
		};
	}
	
	function signIn() {
		console.log('signIn()');
		if (!Auth.$getAuth()) {
			if (!hasLoggedInBefore()) {
				return createUserAndSignIn();
			} else {
				return Auth.$authWithPassword(getAuthInfo());
			}
		} else {
			return Auth.$getAuth();
		}
	}
	
	return {
		getAuth: Auth.$getAuth.bind(Auth),
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
])

.factory('UserStats', ['Auth', 'FIREBASE_URL', '$firebaseObject',
	function (Auth, FIREBASE_URL, $firebaseObject) {
		var userUid,
			userRef,
			userInfoFirebaseObject;
			// numCorrectFirebaseObject,
			// numIncorrectFirebaseObject,
			// scoreFirebaseObject;
		
		function initializeProperties(authData) {
			userUid = authData.uid,
			userRef = new Firebase(FIREBASE_URL + 'users/' + userUid),
			userInfoFirebaseObject = $firebaseObject(userRef);
			// numCorrectFirebaseObject = getFirebaseObjectForChild('num_correct'),
			// numIncorrectFirebaseObject = getFirebaseObjectForChild('num_incorrect'),
			// scoreFirebaseObject = getFirebaseObjectForChild('score');
			
			
			return userInfoFirebaseObject
		}
		
		function getFirebaseObjectForChild(childName) {
			var refToObject = userRef.child(childName);
			
			return $firebaseObject(refToObject);
		}
		return Auth.$waitForAuth()
			.then(initializeProperties)
	}
])

.factory('HighStats', ['FIREBASE_URL', '$firebaseObject',
	function (FIREBASE_URL, $firebaseObject) {
		
		var statsFirebaseRef = new Firebase(FIREBASE_URL + 'high/');
		
		return $firebaseObject(statsFirebaseRef);
	}
]);

