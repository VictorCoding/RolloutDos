export class dropOffZones {
  constructor(){
    
  }
  
  getFacilities(){
    var facilities = [
      {
        address: '5900 Westpark, Houston, Tx 77056',
        name: 'Westpark Consumer Recycling Center',
        coordinates: { latitude: 29.724900, longitude: -95.483326 },
        type: 'Recycling Facility'
      },
      {
        address: '9003 North Main, Houston, TX 77022',
        name: 'Reuse Warehouse',
        coordinates: { latitude: 29.830360, longitude: -95.398699 },
        type: 'Recycling Facility'
      },
      {
        address: 'Highway 3 @ Brantly Ave., Houston, TX 77037',
        name: 'Ellington Airport/Clear Lake Recycling Center',
        coordinates: { latitude: 29.593130, longitude: -95.169942 },
        type: 'Recycling Facility'
      },
      {
        address: '3210 West Lake Houston Parkway, Houston, TX 77339',
        name:'Kingwood Recycling Center',
        coordinates: { latitude: 30.056813, longitude: -95.186456 },
        type: 'Recycling Facility'
      },
      {
        address: '11500 S. Post Oak Lane, Houston, TX 77035',
        name: 'Environmental Service Center (ESC) - South',
        coordinates: { latitude: 29.649612, longitude: -95.464310 },
        type: 'Environmental Service Center'
      },
      {
        address: '5614 Neches, Houston, TX 77026',
        name: 'Environmental Service Center (ESC)- North',
        coordinates: { latitude: 29.812230, longitude: -95.336935 },
        type: 'Environmental Service Center'
      },
      {
        address: '9003 North Main, Houston, TX 77022',
        name: 'N. Main Depository/Recycling Center',
        coordinates: { latitude: 29.830360, longitude: -95.398699 },
        type: 'Neighborhood Facility'
      },
      {
        address: '5565 Kirkpatrick Blvd, Houston, TX 77028',
        name: 'Kirkpatrick Neighborhood Depository/Recycling Center',
        coordinates: { latitude: 29.834152, longitude: -95.278893 },
        type: 'Neighborhood Facility'
      },
      {
        address: '5100 Sunbeam St, Houston, TX 77033',
        name: 'Sunbeam Neighborhood Depository/Recycling Center',
        coordinates: { latitude: 29.650636, longitude: -95.348263 },
        type: 'Neighborhood Facility'
      },
      {
        address: '14400 Sommermeyer St, Houston, TX 77040',
        name: 'Sommermeyer Neighborhood Depository/Recycling Center',
        coordinates: { latitude: 29.854576, longitude: -95.538436 },
        type: 'Neighborhood Facility'
      },
      {
        address: '10785 Southwest Freeway, Houston, TX 77074',
        name: 'Southwest Neighborhood Depository/Recycling Center',
        coordinates: { latitude: 29.661215, longitude: -95.553621 },
        type: 'Neighborhood Facility'
      },
      {
        address: '2240 Central St, Houston, TX 77017',
        name: 'Central Neighborhood Depository/Recycling Center',
        coordinates: { latitude: 29.702012, longitude: -95.269101 },
        type: 'Neighborhood Facility'
      },
      {
        address: '7700 Kempwood Drive, Houston, Texas 77055',
        name: 'CompuCycle',
        coordinates: { latitude: 29.817508, longitude: -95.485691 },
        type: 'Non City-Owned Facilities'
      }
    ];
    
    return facilities;
  }
}