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
			return Auth.$requireAuth();
		}],
        chat: ['$stateParams', 'Chat', 'auth', function ($stateParams, Chat, auth) {
			// auth must be run first to ensure that firebase is authed.
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
		  auth: ['AuthManager', function (AuthManager) {
			  return AuthManager.getAuth();
		  }],
          requireAuth: ['auth', function (auth) {
              /*
                workaround so that resolutions below will wait for the auth
                resolution to finish. Because userStats and highStats declares
                requireAuth as a dependency, they won't begin loading dependencies
                until reqiureAuth is loadable.
                Because requireAuth won't finish loading until auth finishes loading,
                this acts as a workaround to wait for auth.
              */
          }],
		  userStats: ['UserStats', 'requireAuth', function (UserStats, requireAuth) {
			  return UserStats;
		  }],
		  highStats: ['HighStats', 'requireAuth', function (HighStats, requireAuth) {
			  return HighStats;
		  }]
	  }
    })


    ;

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/home');

});
