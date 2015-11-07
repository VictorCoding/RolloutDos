// Ionic Starter App

import {onReady} from 'bootstrap';
import {router} from 'router';
import {LocationsCtrl} from 'LocationsCtrl';
import {HomeCtrl} from 'HomeCtrl';
import {RemindMeCtrl} from 'RemindMeCtrl';
import {Scheduler} from 'Scheduler'
import {GeoLocation} from 'GeoLocation'
import {dropOffZones} from 'dropOffZones';

angular.module('starter', ['ionic', 'ionic.service.core',
    'starter.controllers', 'starter.services', 'ngMap', 'pascalprecht.translate'])
    /*
    //need to add 'ionic.service.deploy' back on
    .config(['$ionicAppProvider', function($ionicAppProvider) {
        // Identify app
        $ionicAppProvider.identify({
            // The App ID (from apps.ionic.io) for the server
            app_id: '811ef447',
            // The public API key all services will use for this app
            api_key: 'da2dc0730f64b198e30cc64677fd15bbbea27266d824bf2d'
        });
    }])*/
    .config(router)
    .config(($ionicFilterBarConfigProvider, $translateProvider) => {
      //TODO: figure out how to localize this
        $ionicFilterBarConfigProvider.placeholder('Your Address');
        $translateProvider.useStaticFilesLoader({
          prefix: 'i18n/',
          suffix: '.json'
        });
        //TODO: Needs to be set dynamically
        $translateProvider.preferredLanguage('es_US');
    })
    .run(onReady);

angular.module('starter.controllers', ['LocalStorageModule', 'jett.ionic.filter.bar', 'starter.services'])
    .controller('LocationsCtrl', LocationsCtrl)
    .controller('HomeCtrl', HomeCtrl)
    .controller('RemindMeCtrl', RemindMeCtrl)
    .filter('date', ($translate) => (str) => HomeCtrl.dateFilter($translate, str))
    .filter('dayOfWeek', () => HomeCtrl.dayOfWeek);

angular.module('starter.services', [])
    .service('GeoLocation', GeoLocation)
    .service('SchedulerService', Scheduler.service)
    .service('alert', () => (str)=>navigator.notification && navigator.notification.alert ? navigator.notification.alert(str) : window.alert(str))
    .service("dropOffZones", dropOffZones);
