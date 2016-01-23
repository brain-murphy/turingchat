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
])

.factory('FindChat', ['AuthManager', 'FIREBASE_URL', '$firebaseArray', '$q',
	function (AuthManager, FIREBASE_URL, $firebaseArray, $q) {
		var deferred;
		
		var NO_PARTNERS_AVAILABLE = 0,
			PARTNER_JOINED_OTHER_CHAT = 1,
			CANCELLED = 2;
		
		var seekingPartnerArray,
		    partnerUid,
		    chatRef,
			chatPartnersRef,
			onPartnerJoinedChat,
			myWaitingListEntry,
			onWaitingListEntryChanged;
		
		function searchForChat() {
			deferred = $q.defer();
			seekingPartnerArray = $firebaseArray(getSeekingPartnerFirebaseRef());
			
			seekingPartnerArray.$loaded()
				.then(checkForAvailablePartner)
				.then(createChat)
				.then(listenForPartnerJoiningChat)
				.then(invitePartnerToChat)
				.then(console.log.bind(console), addSelfToWaitingList); // if no partner, add to waiting list
				
			return deferred.promise;
		}
		
		function checkForAvailablePartner(partnerArray) {
			console.log('checkForAvailablePartner');
			return $q(function (resolve, reject) {
				if (partnerArray.length > 0) {
					partnerUid = partnerArray.$keyAt(0);
					resolve(partnerUid);
				} else {
					return reject(NO_PARTNERS_AVAILABLE);
				}
			});
		}
		
		function invitePartnerToChat(chatRef) {
			console.log('invitePartnerToChat');
			var partnershipRef = getSeekingPartnerFirebaseRef().child(partnerUid);
			
			return $q(function (resolve, reject) {
				partnershipRef.set(chatRef.key(), function (err) {
					if (err) {
						console.log('rejected')
						return reject(PARTNER_JOINED_OTHER_CHAT); // firebase will err if the ref was already written to
					} else {
						console.log('resolved');
						resolve('wrote chatId to partnership record');
					}
				});
			});
		}
		
		function getSeekingPartnerFirebaseRef() {
			return new Firebase(FIREBASE_URL + 'seeking_partner/');
		}
		
		function getChatsFirebaseRef() {
			return new Firebase(FIREBASE_URL + 'chats/');
		}
		
		function addSelfToWaitingList(err) {
			console.log('addSelfToWaitingLisst');
			handleError(err);
			
			myWaitingListEntry = new Firebase(FIREBASE_URL + 'seeking_partner/' + AuthManager.getAuth().uid);
			
			onWaitingListEntryChanged = function (data) {
				var chatId = data.val();
				if (chatId) {
					joinChat(chatId);
					removeWaitListEntry();
				}
			}
			
			myWaitingListEntry.on('value', onWaitingListEntryChanged);
			
			myWaitingListEntry.set(false);
		}
		
		function removeWaitListEntry() {
			if (onWaitingListEntryChanged) {
				myWaitingListEntry.off('value', onWaitingListEntryChanged);
				myWaitingListEntry.set(null);
			}
		}
		
		function handleError(err) {
			if (err === PARTNER_JOINED_OTHER_CHAT) {
				removeChat();
			} else if (err === NO_PARTNERS_AVAILABLE) {
				
			}
		}
		
		function createChat(partnerId) {
			console.log('createChat');
			var chatsFirebaseRef = getChatsFirebaseRef();
			
			chatRef = chatsFirebaseRef.push(initializeNewChat(AuthManager.getAuth().uid));
			return $q.resolve(chatRef);
		}
		
		function removeChat() {
			if (chatPartnersRef) {
				chatPartnersRef.off('child_added', onPartnerJoinedChat);
			}
			
			if (chatRef) {
				chatRef.set(null);
			}
		}
		
		function initializeNewChat(myUid) {
			var newChat = {
				messages:[],
				partners: {}
			}
			
			newChat.partners[myUid] = createNewUserData();
			
			return newChat;
		}
		
		function createNewUserData() {
			return {
				is_ai:false,
				ai_guess:false
			};
		}
		
		function listenForPartnerJoiningChat() {
			console.log('listenForPartnerJoiningChat');
			onPartnerJoinedChat =  function (data) {
				if (data.key() !== AuthManager.getAuth().uid) {
					deferred.resolve(chatRef.key());
				}
			}
			
			chatPartnersRef = chatRef.child('partners');
			
			chatPartnersRef.on('child_added', onPartnerJoinedChat);
			
			return $q.resolve(chatRef);
		}
		
		function cancelChat() {
			removeWaitListEntry();
			
			removeChat();
			
			deferred.reject('cancelled');
		}
		
		function joinChat(chatId) {
			var chatRef = getChatsFirebaseRef().child(chatId);
			
			chatRef.child('partners')
				.update(createUpdateObjectForJoiningChat());
			
			deferred.resolve(chatId);
		}
		
		function createUpdateObjectForJoiningChat() {
			var updateObj = {};
			updateObj[AuthManager.getAuth().uid] = createNewUserData();
			
			return updateObj;
		}
		
		return {
			searchForChat: searchForChat,
			cancel: cancelChat
		}
}])
;

