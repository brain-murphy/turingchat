/* global angular */

angular.module('app.routes', ['app.services'])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    
      
        
    .state('chat', {
      url: '/chat/:chatId',
      templateUrl: 'templates/chat.html',
      controller: 'chatCtrl',
	  resolve: { 
		auth: ['AuthManager', 'Auth', function (AuthManager, Auth) {
			console.log('auth');
			return Auth.$requireAuth();
		}],
        chat: ['$stateParams', 'Chat', 'auth', function ($stateParams, Chat, auth) {
			// auth must be run first to ensure that firebase is authed.
			console.log('chat'); 
			return Chat($stateParams.chatId);
        }]
      }
    })
	
	
	
	
	.state('waiting', {
		url:'/waiting',
		templateUrl: 'templates/waiting.html',
		controller: 'waitingCtrl'
	})
        
      
    
      
        
    .state('home', {
      url: '/home',
      templateUrl: 'templates/home.html',
      controller: 'homeCtrl',
	  resolve: {
		  auth: ['AuthManager', 'Auth', function (AuthManager, Auth) {
			  if (!AuthManager.getAuth()) {
				   return AuthManager.signIn();
			  } else {
				  return Auth.$waitForAuth();
			  }
		  }],
		  userStats: ['UserStats', function (UserStats) {
			  return UserStats;
		  }],
		  highStats: ['HighStats', function (HighStats) {
			  return HighStats;
		  }]
	  }
    })
        
      
    ;

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/home');

});