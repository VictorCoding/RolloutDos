export class LocationsCtrl {
    constructor($scope, dropOffZones, $ionicLoading, GeoLocation) {      
      this.coordinates = GeoLocation.getCoordinates();      
      this.dropOffZones = dropOffZones;
      this.$ionicLoading = $ionicLoading;
      this.zones = this.dropOffZones.getFacilities();      
      this.mapZoom = 10;
      this.mapCenter = [29.754002, -95.373774];
      this.types = [
        {
          code: 'all',
          name: 'All'
        },
        {
          code: 'one',
          name: 'Recycling Facility'
        },
        {
          code: 'two',
          name: 'Environmental Service Center'
        },
        {
          code: 'three',
          name: 'Neighborhood Facility'
        },
        {
          code: 'four',
          name: 'Non City-Owned Facilities'
        }
      ];
      
      this.mapType = this.types[0];
      
      if(this.coordinates !== 'No coordinates')  {
        this.getCurrentCoords(true);  
      } else {
        this.getCurrentCoords(false);
      }
    }                
    
    checkDistanceFromZones(pos){                
      this.zones = _.map(this.dropOffZones.getFacilities(), (zone) => {    
        //We get the distance in km, then we turn it into miles.
        //and finally we get two decimal format. e.g. 5.02
        zone['distance'] = Math.floor((this.getDistanceFromLatLonInKm(pos.latitude, pos.longitude, zone.coordinates.latitude, zone.coordinates.longitude) * 0.62137) * 10) / 10;   
        return { 
          distance: zone.distance,
          address: zone.address,
          name: zone.name,
          coordinates: zone.coordinates,
          type: zone.type
        };
      });      
    }
    
    getCurrentCoords(gotCoordinates){      
      if(gotCoordinates === true) {
        this.checkDistanceFromZones(this.coordinates);
        return;
      }
      this.$ionicLoading.show({
          template: 'Getting distance of facilites'
      });      
      navigator.geolocation.getCurrentPosition((pos) => {
        this.$ionicLoading.hide();      
        this.coordinates = pos.coords;
        console.log('coords from nav', pos.coords);
        this.checkDistanceFromZones(pos.coords);
        return pos;
      }, (err) => {
        console.error(err);
        this.$ionicLoading.hide();          
      });  
    }
    //source: http://stackoverflow.com/questions/27928/how-do-i-calculate-distance-between-two-latitude-longitude-points
    getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
      var deg2rad = (deg) => {
        return deg * (Math.PI/180);
      };
      var R = 6371; // Radius of the earth in km
      var dLat = deg2rad(lat2-lat1);  // deg2rad below
      var dLon = deg2rad(lon2-lon1); 
      var a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      var d = R * c; // Distance in km
      return d;
    }  
    
    launchNavigation(zone){
      launchnavigator.navigate(
            [zone.coordinates.latitude, zone.coordinates.longitude],
            [this.coordinates.latitude, this.coordinates.longitude],
            function(){
                console.log('nav plugin success');
            },
            function(error){
                console.log('nav plugin error: ', error);
          });
    }  
    
    zoomToLocation(coords){      
      this.mapZoom = 12;
      this.mapCenter = [coords.latitude, coords.longitude];
    }
}