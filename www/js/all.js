define("GeoLocation", ["exports"], function (exports) {
    "use strict";

    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    /**
     * Handles getting location data from street address or coordinates
     **/

    var GeoLocation = exports.GeoLocation = (function () {
        function GeoLocation($http, $q) {
            _classCallCheck(this, GeoLocation);

            this.$http = $http;
            this.$q = $q;
            this.coordinates;
        }

        _createClass(GeoLocation, {
            lookupCoordinates: {
                value: function lookupCoordinates(suggestion) {
                    if (!suggestion) {
                        return this.$q.reject();
                    }
                    return this.$http.get("http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?&Address=" + suggestion.text + "&State=TX&f=json&City=Houston&maxLocations=10&maxResultSize=1&outFields=StreetType&magicKey=" + suggestion.magicKey + "&category=&location=-95.3632700,29.7632800&distance=10000&f=pjson").then(function (r) {
                        console.log(r);return r.data.candidates[0].location;
                    });
                }
            },
            lookupAddress: {
                value: function lookupAddress(address) {
                    //http://mycity.houstontx.gov/ArcGIS10/rest/services/addresslocators/COH_COMPOSITE_LOCATOR_WM/GeocodeServer/findAddressCandidates?&Address=1904%20Oakdale&State=TX&f=json&City=Houston&maxLocations=10&maxResultSize=1&outFields=StreetType
                    //http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?text=oakdale&category=&location=-95.3632700,29.7632800&distance=10000&f=pjson
                    return this.$http.get("http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?text=" + address + "&category=&location=-95.3632700,29.7632800&distance=10000&f=pjson").then(function (r) {
                        return r.data.suggestions;
                    });
                }
            },
            getCoordinates: {
                value: function getCoordinates(coords) {
                    return this.coordinates || "No coordinates";
                }
            },
            setCoordinates: {
                value: function setCoordinates(coords) {
                    this.coordinates = coords;
                }
            }
        });

        return GeoLocation;
    })();
});
define("Scheduler", ["exports"], function (exports) {
    "use strict";

    var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    /**
     *
     * Handles pickup schedules for Houston.
     * TODO: Abstract to more generic schedule based system (cron?) and abstract Houston data to adapter allow easy addition of more regions
     *
     * Example "API" calls for citymap
     trash
     http://mycity.houstontx.gov/ArcGIS10/rest/services/wm/MyCityMapData_wm/MapServer/111/query?geometryType=esriGeometryPoint&f=json&outSR=102100&outFields=DAY%2CQUAD&geometry=%7B%22x%22%3A%2D10617688%2E9548%2C%22y%22%3A3467985%2E443099998%7D&spatialRel=esriSpatialRelIntersects&returnGeometry=false
     heavy/junk
     http://mycity.houstontx.gov/ArcGIS10/rest/services/wm/MyCityMapData_wm/MapServer/112/query?geometryType=esriGeometryPoint&f=json&outSR=102100&outFields=SERVICE%5FDA%2CQUAD&geometry=%7B%22x%22%3A%2D10617688%2E9548%2C%22y%22%3A3467985%2E443099998%7D&spatialRel=esriSpatialRelIntersects&returnGeometry=false
     recycling
     http://mycity.houstontx.gov/ArcGIS10/rest/services/wm/MyCityMapData_wm/MapServer/113/query?geometryType=esriGeometryPoint&f=json&outSR=102100&outFields=SERVICE%5FDAY%2CQUAD&geometry=%7B%22x%22%3A%2D10617688%2E9548%2C%22y%22%3A3467985%2E443099998%7D&spatialRel=esriSpatialRelIntersects&returnGeometry=false
    
     **/

    var Scheduler = exports.Scheduler = (function () {
        function Scheduler($http, $q, pos) {
            var _this = this;

            var numberOfDays = arguments[3] === undefined ? 60 : arguments[3];

            _classCallCheck(this, Scheduler);

            this.numberOfDays = numberOfDays;
            this.pickupDays = {};

            if (pos.coords) {
                this.pos = { y: pos.coords.latitude, x: pos.coords.longitude, spatialReference: { wkid: 4326 } };
            } else if (pos.x && pos.y) {
                this.pos = { x: pos.x, y: pos.y, spatialReference: { wkid: 4326 } };
            }

            var queryParams = {
                params: {
                    geometryType: "esriGeometryPoint",
                    f: "json", outSR: 102100, outFields: encodeURIComponent("DAY,QUAD,SERVICE_DA,SERVICE_DAY"),
                    geometry: JSON.stringify(this.pos),
                    spatialRel: "esriSpatialRelIntersects", returnGeometry: false
                }
            };
            var wastePromise = $http.get("http://crossorigin.me/http://mycity.houstontx.gov/ArcGIS10/rest/services/wm/MyCityMapData_wm/MapServer/111/query", queryParams);
            var junkPromise = $http.get("http://crossorigin.me/http://mycity.houstontx.gov/ArcGIS10/rest/services/wm/MyCityMapData_wm/MapServer/112/query", queryParams);
            var recyclingPromise = $http.get("http://crossorigin.me/http://mycity.houstontx.gov/ArcGIS10/rest/services/wm/MyCityMapData_wm/MapServer/113/query", queryParams);

            this.whenLoaded = $q.all([wastePromise, junkPromise, recyclingPromise]).then(function (allResults) {
                var _allResults$map = allResults.map(function (_) {
                    return _.data;
                });

                var _allResults$map2 = _slicedToArray(_allResults$map, 3);

                var wasteData = _allResults$map2[0];
                var junkData = _allResults$map2[1];
                var recyclingData = _allResults$map2[2];

                _this.configure(wasteData, junkData, recyclingData);
            });
        }

        _createClass(Scheduler, {
            configure: {
                value: function configure(wasteData, junkData, recyclingData) {
                    //waste is one day a week
                    var wasteDay = -1;
                    if (this.isValidData(wasteData)) {
                        wasteDay = Scheduler.getDayIndex(wasteData.features[0].attributes.DAY);
                    }

                    //heavy trash pickup is in the form of #rd WEEKDAY
                    var junkWeekOfMonth = -1;
                    var junkDay = -1;
                    if (this.isValidData(junkData)) {
                        var junkPattern = junkData.features[0].attributes.SERVICE_DA;
                        junkWeekOfMonth = junkPattern.substr(0, 1);
                        junkDay = Scheduler.getDayIndex(junkPattern.substr(junkPattern.indexOf(" ")));
                    }

                    //recycling pickup is alternating weeks
                    var recyclingDay = -1;
                    var recyclingScheduleA = false;
                    if (this.isValidData(recyclingData)) {
                        var recyclingSchedule = recyclingData.features[0].attributes.SERVICE_DAY;
                        recyclingDay = Scheduler.getDayIndex(recyclingSchedule.split("-")[0]);
                        //if true it is the "first week", if false it is the second week
                        recyclingScheduleA = recyclingSchedule.includes("-A");
                    }

                    this.pickupDays = { wasteDay: wasteDay, junkWeekOfMonth: junkWeekOfMonth, junkDay: junkDay, recyclingDay: recyclingDay, recyclingScheduleA: recyclingScheduleA };
                    this.buildEvents(this.numberOfDays);
                    return this.events;
                }
            },
            isValidData: {
                value: function isValidData(data) {
                    return data && data.features && data.features.length && data.features[0].attributes;
                }
            },
            isWasteDay: {
                value: function isWasteDay(day) {
                    return day.day() == this.pickupDays.wasteDay;
                }
            },
            isHeavyDay: {

                //used for both trash/and junk days

                value: function isHeavyDay(day) {
                    var dayInMonth = day.clone().startOf("month");
                    var occurances = 0;
                    while (occurances < this.pickupDays.junkWeekOfMonth) {
                        if (dayInMonth.day() == this.pickupDays.junkDay) {
                            occurances++;
                        }
                        dayInMonth.add(1, "days");
                    }
                    //offset the last day added (ew)
                    dayInMonth.add(-1, "days");
                    return dayInMonth.isSame(day, "day");
                }
            },
            isTreeDay: {
                value: function isTreeDay(day) {
                    return !this.isEvenMonth(day) && this.isHeavyDay(day);
                }
            },
            isJunkDay: {
                value: function isJunkDay(day) {
                    return this.isEvenMonth(day) && this.isHeavyDay(day);
                }
            },
            isEvenMonth: {
                value: function isEvenMonth(day) {
                    return (day.month() + 1) % 2 == 0;
                }
            },
            isRecyclingDay: {
                value: function isRecyclingDay(day) {
                    //recycling schedule A occurs every other week (starting at second week)
                    var isEvenWeek = day.weeks() % 2 == 0;
                    var isThisWeek = this.pickupDays.recyclingScheduleA && isEvenWeek || !this.pickupDays.recyclingScheduleA && !isEvenWeek;
                    return isThisWeek && day.day() == this.pickupDays.recyclingDay;
                }
            },
            getCategoriesForDay: {
                value: function getCategoriesForDay(day) {
                    var eventsForDay = { waste: this.isWasteDay(day), junk: this.isJunkDay(day), tree: this.isTreeDay(day), recycling: this.isRecyclingDay(day) };
                    //group filter out empty days
                    return _.pairs(eventsForDay).filter(function (category) {
                        return category[1];
                    }).map(function (category) {
                        return category[0];
                    });
                }
            },
            buildEvents: {
                value: function buildEvents(numberOfDays) {
                    var _this = this;

                    var day = moment().startOf("day");
                    var groupEvents = function (day) {
                        return {
                            day: day, categories: _this.getCategoriesForDay(day)
                        };
                    };
                    this.events = _.range(0, numberOfDays).map(function (i) {
                        return day.clone().add(i, "days");
                    }).map(groupEvents).filter(function (event) {
                        return event.categories.length;
                    });
                }
            }
        }, {
            getDayIndex: {
                value: function getDayIndex(dayStr) {
                    return moment(dayStr, "dddd").day();
                }
            },
            service: {
                value: function service($http, $q) {
                    return function (pos, numberOfDays) {
                        return new Scheduler($http, $q, pos, numberOfDays);
                    };
                }
            }
        });

        return Scheduler;
    })();
});
define("dropOffZones", ["exports"], function (exports) {
  "use strict";

  var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var dropOffZones = exports.dropOffZones = (function () {
    function dropOffZones() {
      _classCallCheck(this, dropOffZones);
    }

    _createClass(dropOffZones, {
      getFacilities: {
        value: function getFacilities() {
          var facilities = [{
            address: "5900 Westpark, Houston, Tx 77056",
            name: "Westpark Consumer Recycling Center",
            coordinates: { latitude: 29.7249, longitude: -95.483326 },
            type: "Recycling Facility"
          }, {
            address: "9003 North Main, Houston, TX 77022",
            name: "Reuse Warehouse",
            coordinates: { latitude: 29.83036, longitude: -95.398699 },
            type: "Recycling Facility"
          }, {
            address: "Highway 3 @ Brantly Ave., Houston, TX 77037",
            name: "Ellington Airport/Clear Lake Recycling Center",
            coordinates: { latitude: 29.59313, longitude: -95.169942 },
            type: "Recycling Facility"
          }, {
            address: "3210 West Lake Houston Parkway, Houston, TX 77339",
            name: "Kingwood Recycling Center",
            coordinates: { latitude: 30.056813, longitude: -95.186456 },
            type: "Recycling Facility"
          }, {
            address: "11500 S. Post Oak Lane, Houston, TX 77035",
            name: "Environmental Service Center (ESC) - South",
            coordinates: { latitude: 29.649612, longitude: -95.46431 },
            type: "Environmental Service Center"
          }, {
            address: "5614 Neches, Houston, TX 77026",
            name: "Environmental Service Center (ESC)- North",
            coordinates: { latitude: 29.81223, longitude: -95.336935 },
            type: "Environmental Service Center"
          }, {
            address: "9003 North Main, Houston, TX 77022",
            name: "N. Main Depository/Recycling Center",
            coordinates: { latitude: 29.83036, longitude: -95.398699 },
            type: "Neighborhood Facility"
          }, {
            address: "5565 Kirkpatrick Blvd, Houston, TX 77028",
            name: "Kirkpatrick Neighborhood Depository/Recycling Center",
            coordinates: { latitude: 29.834152, longitude: -95.278893 },
            type: "Neighborhood Facility"
          }, {
            address: "5100 Sunbeam St, Houston, TX 77033",
            name: "Sunbeam Neighborhood Depository/Recycling Center",
            coordinates: { latitude: 29.650636, longitude: -95.348263 },
            type: "Neighborhood Facility"
          }, {
            address: "14400 Sommermeyer St, Houston, TX 77040",
            name: "Sommermeyer Neighborhood Depository/Recycling Center",
            coordinates: { latitude: 29.854576, longitude: -95.538436 },
            type: "Neighborhood Facility"
          }, {
            address: "10785 Southwest Freeway, Houston, TX 77074",
            name: "Southwest Neighborhood Depository/Recycling Center",
            coordinates: { latitude: 29.661215, longitude: -95.553621 },
            type: "Neighborhood Facility"
          }, {
            address: "2240 Central St, Houston, TX 77017",
            name: "Central Neighborhood Depository/Recycling Center",
            coordinates: { latitude: 29.702012, longitude: -95.269101 },
            type: "Neighborhood Facility"
          }, {
            address: "7700 Kempwood Drive, Houston, Texas 77055",
            name: "CompuCycle",
            coordinates: { latitude: 29.817508, longitude: -95.485691 },
            type: "Non City-Owned Facilities"
          }];

          return facilities;
        }
      }
    });

    return dropOffZones;
  })();
});
define("DateFilter", ["exports"], function (exports) {
  "use strict";

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var DateFilter = exports.DateFilter = function DateFilter() {
    _classCallCheck(this, DateFilter);
  };
});
define("HomeCtrl", ["exports"], function (exports) {
    "use strict";

    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var HomeCtrl = exports.HomeCtrl = (function () {
        function HomeCtrl($scope, $ionicPlatform, $ionicLoading, alert, $ionicFilterBar, $timeout, GeoLocation, SchedulerService, localStorageService) {
            _classCallCheck(this, HomeCtrl);

            angular.extend(this, {
                $scope: $scope,
                $ionicPlatform: $ionicPlatform,
                $ionicLoading: $ionicLoading,
                SchedulerService: SchedulerService,
                alert: alert,
                $ionicFilterBar: $ionicFilterBar,
                $timeout: $timeout,
                GeoLocation: GeoLocation
            });
            ionic.Platform.ready(this.checkForUpdates.bind(this));
            this.$scope.moment = moment;
            this.$scope.filterItems = function () {
                console.log("heard filter", arguments);
            };
            this.loadEvents();
        }

        _createClass(HomeCtrl, {
            checkForUpdates: {
                value: function checkForUpdates() {}
            },
            showFilterBar: {
                value: function showFilterBar() {
                    var _this = this;

                    this.filterBarInstance = this.$ionicFilterBar.show({
                        placeholder: "Your Address",
                        debounce: true,
                        items: [],
                        cancel: function () {
                            return _this.addresses = null;
                        },
                        filter: function (items, str) {
                            if (str.length <= 3) {
                                _this.addresses = null;
                                return;
                            }
                            _this.GeoLocation.lookupAddress(str).then(function (results) {
                                _this.addresses = results;
                            });
                        }
                    });
                }
            },
            selectAddress: {
                value: function selectAddress(suggestion) {
                    var _this = this;

                    this.addresses = null;
                    this.filterBarInstance();
                    this.$timeout(function () {
                        return _this.GeoLocation.lookupCoordinates(suggestion).then(_this.loadEventsForPosition.bind(_this));
                    });
                }
            },
            loadEventsForPosition: {
                value: function loadEventsForPosition(pos) {
                    var _this = this;

                    var _arguments = arguments;

                    //data format from arcgis is all over the place, need to standardize this to prevent headaches :-/
                    if (pos.x && !pos.coords) {
                        pos.coords = {
                            latitude: pos.y,
                            longitude: pos.x
                        };

                        console.log("fixing coords", pos);
                    }
                    this.coords = pos.coords;
                    this.GeoLocation.setCoordinates(pos.coords);

                    var scheduler = this.SchedulerService(pos, 90);
                    scheduler.whenLoaded.then(function () {
                        _this.events = scheduler.events;
                        _this.pickupDays = scheduler.pickupDays;
                        console.log(_this.events);
                        _this.$ionicLoading.hide();
                    })["catch"](function () {
                        console.error(_arguments);
                        _this.$ionicLoading.hide();
                        _this.alert("Unable to Find Your Schedule. " + "Make Sure You Are Connected to the Internet, and are in Houston");
                    });
                }
            },
            loadEvents: {
                value: function loadEvents() {
                    var _this = this;

                    var _arguments = arguments;

                    this.$ionicLoading.show({
                        template: "Finding Your Location"
                    });

                    ionic.Platform.ready(function () {
                        _this.$ionicLoading.show({
                            template: "Looking Up Your Schedule"
                        });
                        navigator.geolocation.getCurrentPosition(function (pos) {
                            _this.loadEventsForPosition(pos);
                        }, function (err) {
                            console.error(_arguments);
                            _this.$ionicLoading.hide();
                            _this.showFilterBar();
                        });
                    });
                }
            }
        }, {
            dateFilter: {
                value: function dateFilter(day) {
                    if (moment().isSame(day, "day")) {
                        return "Today " + day.format("MMM Do");
                    } else if (moment().add(1, "days").isSame(day, "day")) {
                        return "Tomorrow " + day.format("MMM Do");
                    } else {
                        return day.format("dddd MMM Do");
                    }
                }
            },
            dayOfWeek: {
                value: function dayOfWeek(day) {
                    return moment().day(day).format("dddd");
                }
            }
        });

        return HomeCtrl;
    })();
});

/*
this.$ionicDeploy.check().then((response) => {
        console.log('checking for updates', response);
        // response will be true/false
        if (response) {
            // Download the updates
            this.$ionicDeploy.download().then(() => {
                console.log('downloading updates');
                // Extract the updates
                this.$ionicDeploy.extract().then(() => {
                    // Load the updated version
                    this.$ionicDeploy.load();
                    console.log('loading new version');
                }, (error) => {
                    console.log('error extracting');
                    // Error extracting
                }, ()=> {
                    console.log('extract in progress');
                });
            }, (error) => {
                // Error downloading the updates
                console.log('error downloading', error);
            }, (progress)=> {
                // Do something with the download progress
                console.log('check in progress?');
            });
        }
    },
    (error)=> {
        console.log('error checking for updates', error);
    })*/
define("LocationsCtrl", ["exports"], function (exports) {
  "use strict";

  var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var LocationsCtrl = exports.LocationsCtrl = (function () {
    function LocationsCtrl($scope, dropOffZones, $ionicLoading, GeoLocation) {
      _classCallCheck(this, LocationsCtrl);

      this.coordinates = GeoLocation.getCoordinates();
      this.dropOffZones = dropOffZones;
      this.$ionicLoading = $ionicLoading;
      this.zones = this.dropOffZones.getFacilities();
      this.types = [{
        code: "all",
        name: "All"
      }, {
        code: "one",
        name: "Recycling Facility"
      }, {
        code: "two",
        name: "Environmental Service Center"
      }, {
        code: "three",
        name: "Neighborhood Facility"
      }, {
        code: "four",
        name: "Non City-Owned Facilities"
      }];

      this.mapType = this.types[0];

      if (this.coordinates !== "No coordinates") {
        this.getCurrentCoords(true);
      } else {
        this.getCurrentCoords(false);
      }
    }

    _createClass(LocationsCtrl, {
      checkDistanceFromZones: {
        value: function checkDistanceFromZones(pos) {
          var _this = this;

          this.zones = _.map(this.dropOffZones.getFacilities(), function (zone) {
            //We get the distance in km, then we turn it into miles.
            //and finally we get two decimal format. e.g. 5.02
            zone.distance = Math.floor(_this.getDistanceFromLatLonInKm(pos.latitude, pos.longitude, zone.coordinates.latitude, zone.coordinates.longitude) * 0.62137 * 10) / 10;
            return {
              distance: zone.distance,
              address: zone.address,
              name: zone.name,
              coordinates: zone.coordinates,
              type: zone.type
            };
          });
        }
      },
      getCurrentCoords: {
        value: function getCurrentCoords(gotCoordinates) {
          var _this = this;

          if (gotCoordinates === true) {
            this.checkDistanceFromZones(this.coordinates);
            return;
          }
          this.$ionicLoading.show({
            template: "Getting distance of facilites"
          });
          navigator.geolocation.getCurrentPosition(function (pos) {
            _this.$ionicLoading.hide();
            _this.checkDistanceFromZones(pos.coords);
            return pos;
          }, function (err) {
            console.error(err);
            _this.$ionicLoading.hide();
          });
        }
      },
      getDistanceFromLatLonInKm: {
        //source: http://stackoverflow.com/questions/27928/how-do-i-calculate-distance-between-two-latitude-longitude-points

        value: function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
          var deg2rad = function (deg) {
            return deg * (Math.PI / 180);
          };
          var R = 6371; // Radius of the earth in km
          var dLat = deg2rad(lat2 - lat1); // deg2rad below
          var dLon = deg2rad(lon2 - lon1);
          var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
          var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          var d = R * c; // Distance in km
          return d;
        }
      }
    });

    return LocationsCtrl;
  })();
});
define("RemindMeCtrl", ["exports"], function (exports) {
    "use strict";

    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var RemindMeCtrl = exports.RemindMeCtrl = (function () {
        function RemindMeCtrl($scope, $ionicHistory, $ionicLoading, $ionicPlatform, $ionicPopover, localStorageService, SchedulerService, alert, $stateParams) {
            var _this = this;

            _classCallCheck(this, RemindMeCtrl);

            angular.extend(this, {
                $scope: $scope,
                $ionicHistory: $ionicHistory,
                $ionicLoading: $ionicLoading,
                $ionicPlatform: $ionicPlatform,
                $ionicPopover: $ionicPopover,
                localStorageService: localStorageService,
                SchedulerService: SchedulerService,
                alert: alert,
                $stateParams: $stateParams
            });
            this.notificationsEnabled = localStorageService.get("notificationsEnabled") == "true";
            this.timeOfDay = "morning";
            this.wasteTypes = ["recycling", "waste", "tree", "junk"];
            this.recycling = true;
            this.waste = false;
            this.junk = false;
            this.hour = 6;
            console.log($stateParams, "sp");
            this.pos = { x: $stateParams.longitude, y: $stateParams.latitude };
            this.$inject = ["$scope", "this.$ionicLoading", $ionicPopover];

            $scope.$watchGroup(this.wasteTypes.map(function (i) {
                return "remind." + i;
            }), function () {
                var whats = _this.activeWasteCategories();
                _this.whatDescription = _this.makeDescriptionText(whats);
            });

            var timeOfDayTemplate = "<ion-popover-view ><ul class=\"list\">\n            <li class=\"item\" ng-click=\"remind.setTimeOfDay('morning')\">\n            Morning\n            </li>\n            <li class=\"item\" ng-click=\"remind.setTimeOfDay('night')\">\n            Night\n            </li>\n        </ul></ion-popover-view>";

            var hourTemplate = "<ion-popover-view ><ul class=\"list\">\n            <li class=\"item\" ng-click=\"remind.setHour(5)\">\n            5\n            </li>\n            <li class=\"item\" ng-click=\"remind.setHour(6)\">\n            6\n            </li>\n            <li class=\"item\" ng-click=\"remind.setHour(7)\">\n            7\n            </li>\n            <li class=\"item\" ng-click=\"remind.setHour(8)\">\n            8\n            </li>\n            <li class=\"item\" ng-click=\"remind.setHour(9)\">\n            9\n            </li>\n            <li class=\"item\" ng-click=\"remind.setHour(10)\">\n            10\n            </li>\n        </ul></ion-popover-view>";

            var whatTemplate = "<ion-popover-view>\n           <ion-toggle ng-model=\"remind.recycling\" toggle-class=\"toggle-calm\">Recycling</ion-toggle>\n           <ion-toggle ng-model=\"remind.waste\" toggle-class=\"toggle-calm\">Trash & Yard</ion-toggle>\n           <ion-toggle ng-model=\"remind.junk\" toggle-class=\"toggle-calm\">Junk</ion-toggle>\n           <ion-toggle ng-model=\"remind.tree\" toggle-class=\"toggle-calm\">Tree Trash</ion-toggle>\n        </ion-popover-view>";

            this.timeOfDayPopOver = $ionicPopover.fromTemplate(timeOfDayTemplate, {
                scope: $scope
            });
            this.hourPopOver = $ionicPopover.fromTemplate(hourTemplate, {
                scope: $scope
            });
            this.whatPopOver = $ionicPopover.fromTemplate(whatTemplate, {
                scope: $scope
            });
        }

        _createClass(RemindMeCtrl, {
            setTimeOfDay: {
                value: function setTimeOfDay(time) {
                    this.timeOfDay = time;
                    this.timeOfDayPopOver.hide();
                }
            },
            setHour: {
                value: function setHour(hour) {
                    this.hour = hour;
                    this.hourPopOver.hide();
                }
            },
            safeApply: {
                value: function safeApply(fn) {
                    if (!this.$scope.$$phase) {
                        this.$scope.$apply(fn);
                    } else {
                        fn();
                    }
                }
            },
            setupReminders: {
                value: function setupReminders() {
                    var _this = this;

                    var _arguments = arguments;

                    cordova.plugins.notification.local.clearAll(this.safeApply(function () {
                        //clear all notifications then start again
                        _this.$ionicPlatform.ready(function () {

                            //todo: figure out where we are?
                            var scheduler = _this.SchedulerService(_this.pos, 365);
                            scheduler.whenLoaded.then(function () {
                                _this.localStorageService.set("notificationsEnabled", true);
                                _this.localStorageService.set("notificationsData", {
                                    timeOfDay: _this.timeOfDay,
                                    categories: _this.activeWasteCategories(),
                                    hour: _this.hour
                                });
                                _this.notificationsEnabled = true;
                                var notifications = _(scheduler.events).map(function (event) {
                                    var isNight = _this.timeOfDay == "night";
                                    var date = event.day.clone().add(isNight ? -1 : 0, "day").set("hour", isNight ? _this.hour + 12 : _this.hour).startOf("hour").set("minute", 0).toDate();

                                    var matches = _.intersection(event.categories, _this.activeWasteCategories());

                                    if (matches.length) {
                                        return {
                                            id: date.getTime(),
                                            text: "Don't forget to rollout your " + _this.makeDescriptionText(matches),
                                            at: date.getTime()
                                        };
                                    }
                                }).compact().value();
                                console.log("creating notifications", notifications);
                                cordova.plugins.notification.local.schedule(notifications);

                                _this.pickupDays = scheduler.pickupDays;
                                _this.$ionicLoading.hide();
                                _this.$ionicHistory.goBack();
                            })["catch"](function () {
                                console.log(_arguments);
                                _this.$ionicLoading.hide();
                                _this.alert("Unable to Find Your Schedule. " + "Make Sure You Are Connected to the Internet");
                            });
                        });
                    }), this);
                    this.$ionicLoading.show({
                        template: "Creating Your Reminders"
                    });
                }
            },
            makeDescriptionText: {
                value: function makeDescriptionText(categories) {
                    //FIXME: lazy hack because i want it to say trash instead of waste on the reminder but don't want to rewrite all the reminder code
                    categories = categories.map(function (c) {
                        return c == "waste" ? "trash" : c;
                    });
                    var description = "nothing";
                    if (categories.length == 1) description = categories[0];else if (categories.length == 2) description = categories[0] + " and " + categories[1];else if (categories.length >= 3) description = categories.splice(0, categories.length - 1).join(", ") + " and " + categories[categories.length - 1];
                    return description;
                }
            },
            activeWasteCategories: {
                value: function activeWasteCategories() {
                    var _this = this;

                    return _(this.wasteTypes).map(function (i) {
                        return _this[i] ? i : null;
                    }).compact().value();
                }
            }
        });

        return RemindMeCtrl;
    })();
});
define("bootstrap", ["exports"], function (exports) {
    "use strict";

    exports.onReady = onReady;
    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function onReady($ionicPlatform) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
            if (navigator.splashscreen) {
                navigator.splashscreen.hide();
            }
        });
    }
});
define("router", ["exports"], function (exports) {
    "use strict";

    exports.router = router;
    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function router($stateProvider, $urlRouterProvider) {

        $stateProvider.state("home", {
            url: "/home",
            templateUrl: "templates/home.html",
            controller: "HomeCtrl as home"
        }).state("remindme", {
            url: "/remindme?latitude&longitude",
            controller: "RemindMeCtrl as remind",
            templateUrl: "templates/remindme.html"
        }).state("locations", {
            url: "/locations",
            templateUrl: "templates/locations.html",
            controller: "LocationsCtrl as location"
        });

        $urlRouterProvider.otherwise("/home");
    }
});
define("app", ["exports", "bootstrap", "router", "LocationsCtrl", "HomeCtrl", "RemindMeCtrl", "Scheduler", "GeoLocation", "dropOffZones"], function (exports, _bootstrap, _router, _LocationsCtrl, _HomeCtrl, _RemindMeCtrl, _Scheduler, _GeoLocation, _dropOffZones) {
    // Ionic Starter App

    "use strict";

    var onReady = _bootstrap.onReady;
    var router = _router.router;
    var LocationsCtrl = _LocationsCtrl.LocationsCtrl;
    var HomeCtrl = _HomeCtrl.HomeCtrl;
    var RemindMeCtrl = _RemindMeCtrl.RemindMeCtrl;
    var Scheduler = _Scheduler.Scheduler;
    var GeoLocation = _GeoLocation.GeoLocation;
    var dropOffZones = _dropOffZones.dropOffZones;

    angular.module("starter", ["ionic", "ionic.service.core", "starter.controllers", "starter.services", "ngMap"])
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
    .config(router).config(function ($ionicFilterBarConfigProvider) {
        $ionicFilterBarConfigProvider.placeholder("Your Address");
    }).run(onReady);

    angular.module("starter.controllers", ["LocalStorageModule", "jett.ionic.filter.bar", "starter.services"]).controller("LocationsCtrl", LocationsCtrl).controller("HomeCtrl", HomeCtrl).controller("RemindMeCtrl", RemindMeCtrl).filter("date", function () {
        return HomeCtrl.dateFilter;
    }).filter("dayOfWeek", function () {
        return HomeCtrl.dayOfWeek;
    });

    angular.module("starter.services", []).service("GeoLocation", GeoLocation).service("SchedulerService", Scheduler.service).service("alert", function () {
        return function (str) {
            return navigator.notification && navigator.notification.alert ? navigator.notification.alert(str) : window.alert(str);
        };
    }).service("dropOffZones", dropOffZones);
});
//# sourceMappingURL=all.js.map
