export class LocationsCtrl {
    constructor($scope, dropOffZones, $ionicLoading) {
      this.dropOffZones = dropOffZones;
      this.$ionicLoading = $ionicLoading;
      this.zones = this.dropOffZones.getFacilities();      
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
    }
    
    updateMap(code){
      console.log(this.mapType);
      if(this.mapType.code === 'all') {
        this.zones = this.dropOffZones.getFacilities();         
      } else {
        this.zones = _.filter(this.dropOffZones.getFacilities(), (zone) => {
          return zone.type === this.mapType.name;
        });
      }      
    }
    
    checkDistanceFromZones(pos){                
      this.zones = _.map(this.dropOffZones.getFacilities(), (zone) => {    
        //We get the distance in km, then we turn it into miles.
        //and finally we get two decimal format. e.g. 5.02
        zone['distance'] = Math.floor((this.getDistanceFromLatLonInKm(pos.coords.latitude, pos.coords.longitude, zone.coordinates.latitude, zone.coordinates.longitude) * 0.62137) * 10) / 10;   
        return { 
          distance: zone.distance,
          address: zone.address,
          name: zone.name,
          coordinates: zone.coordinates,
          type: zone.type
        };
      });      
    }
    
    getCurrentCoords(){      
      this.$ionicLoading.show({
          template: 'Updating distance from facilities'
      });      
      navigator.geolocation.getCurrentPosition((pos) => {
        this.$ionicLoading.hide();        
        this.checkDistanceFromZones(pos);
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
}