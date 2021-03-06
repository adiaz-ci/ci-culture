(function () {
  'use strict';

  /**
   * {Factory} cultureSrv
   * @fileOverview Service for culture
   */
  angular
    .module('ci_culture', [
      'ci_brands',
      'ci_utils',
      'ci_translate',
      'ngCookies'
    ])

    .constant('CULTURES', [
      {
        textDirection: 'leftToRight',
        cultureId: 7,
        code: 'de',
        name: 'German',
        customFont: false
      }, {
        textDirection: "leftToRight",
        cultureId: 9,
        code: "en",
        name: "American English",
        customFont: false
      }, {
        textDirection: 'rightToLeft',
        cultureId: 12,
        code: 'he',
        name: 'Hebrew',
        customFont: false
      }, {
        textDirection: 'leftToRight',
        cultureId: 13,
        code: 'hu',
        name: 'Hungarian',
        customFont: false
      }, {
        textDirection: 'leftToRight',
        cultureId: 16,
        code: 'ja',
        name: 'Japanese',
        customFont:'meyro'
      }, {
        textDirection: 'leftToRight',
        cultureId: 23,
        code: 'ru',
        name: 'Russian',
        customFont: false
      }, {
        textDirection: 'leftToRight',
        cultureId: 20,
        code: 'pl',
        name: 'Polish',
        customFont: false
      }, {
        textDirection: 'leftToRight',
        cultureId: 69,
        code: 'en',
        name: 'English',
        customFont: false
      }, {
        textDirection: 'leftToRight',
        cultureId: 85,
        code: 'es',
        name: 'Spanish',
        customFont: false
      }, {
        textDirection: 'leftToRight',
        cultureId: 161,
        code: 'zh',
        name: 'Simplified Chinese',
        customFont: false
      }, {
        textDirection: 'rightToLeft',
        cultureId: 162,
        code: 'ar',
        name: 'Modern Standard Arabic',
        customFont: false
      }
    ])
    .factory('cultureSrv', [
      '$cookies',
      '$rootScope',
      '$timeout',
      'CULTURES',
      'brandSrv', // FIXME implement the real service
      'translateSrv',
      'utilsSrv',

      function ($cookies,
                $rootScope,
                $timeout,
                CULTURES,
                brandSrv,
                translateSrv,
                utilsSrv) {
        var self = {},
          cuidParam = utilsSrv.location().queryString('cuid'),
          currentDir = utilsSrv.location().getCurrentDir(),
          cultures = {},
          currentCulture,
          defaultLang;

        init();

        /**
         * @name init
         * @description Trigger
         */
        function init() {
          // Setting up culture cache
          /* istanbul ignore else */
          if (! cultures.CUID && ! cultures.CU) {
            cultures = {CUID: {}, CU: {}};
            _.each(CULTURES, function (value) {
              cultures.CUID[value.cultureId] = value; // old CUID
              cultures.CU[value.code] = value; // old CU
            });
          }
          // Configure translateSrv
          translateSrv.setConfigCultures(cultures.CU);
          // Lang from ng-translate by browser - missing arg to force a lang
          defaultLang = translateSrv.getCurrentLang({missing: 'en'}).code;

          if (typeof ieLang == 'undefined') {
            var ieLang = cuidParam;
          }

          if (cultures.CU[ieLang]) {
            cuidParam = cultures.CU[ieLang].cultureId;
          }

          currentCulture = (
            cuidParam && cultures.CUID[cuidParam] ?
              cultures.CUID[cuidParam] :
              cultures.CU[defaultLang]
          );

          // Config from brand
          brandSrv.getBrand(currentDir).then(function (brand) {
            /* istanbul ignore else */
            if (brand && ! brand.hideLangDropdown) {
              defaultLang = $cookies.currentCulture ?
                $cookies.currentCulture :
                ($cookies.currentCulture = defaultLang); // --> Assign cookie
            }

            currentCulture = (
              cuidParam && cultures.CUID[cuidParam] ?
                cultures.CUID[cuidParam] :
                cultures.CU[defaultLang]
            );
            // Using $timeout because the directive isn't instantiated yet
            $timeout(function () {
              self.setCulture(currentCulture.code);
            });
          });
        }


        /**
         * @name setCulture
         * @description Set a new custom culture.
         * @param cultureCode {String} Language code
         * @param callback {Function}
         */
        self.setCulture = function (cultureCode) {
          currentCulture = cultures.CU[cultureCode];
          translateSrv.setLanguage(cultureCode).then(function () {
            $cookies.currentCulture = cultureCode;
            $rootScope.$broadcast('cultureSrv::ready', currentCulture);
          });
        };


        /**
         * @name getCultures
         * @description Get all cultures and allows to set a filter.
         * @param filter {Object} Array with items to filter
         * @returns {{list: {Object}, selectedLang: {String}}}
         */
        self.getCultures = function (filter) {
          return _
            .chain(angular.copy(cultures.CUID))
            .omit(filter || [])
            .sortBy('name')
            .map(function (culture) {
                   culture.selected = culture.code === defaultLang;
                   return culture;
                 })
            .value();
        };


        /**
         * @name getCultureCode
         * @description Getter for culture code.
         * @returns {String}
         */
        self.getCultureCode = function () {
          return currentCulture.code;
        };


        /**
         * @name getCustomFont
         * @description Getter for the custom font.
         * @returns {Boolean|String}
         */
        self.getCustomFont = function () {
          return currentCulture.customFont;
        };


        /**
         * @name getCultureId
         * @description Getter for culture id.
         * @returns {String}
         */
        self.getCultureId = function () {
          return (currentCulture ? currentCulture.cultureId : '69');
        };


        /**
         * @name getTextDirection
         * @description Getter for culture text direction.
         * @returns {String}
         */
        self.getTextDirection = function () {
          return currentCulture.textDirection;
        };


        /**
         * @name getShortTextDirection
         * @description Getter for culture text direction's short code.
         * @returns {String}
         */

        self.getShortTextDirection = function () {
          var shortCodes = {
            'rightToLeft': 'rtl',
            'leftToRight': 'ltr'
          };
          return shortCodes[currentCulture.textDirection];
        };

        return self;
      }
    ]);
})();
