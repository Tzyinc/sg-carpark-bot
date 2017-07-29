var c2j = require('csv-to-json');
var fs = require("fs");
var apiKeys = JSON.parse(fs.readFileSync('apiKeys.json', 'utf8'));
var gMaps = require('@google/maps').createClient({
  key: apiKeys.gMapsKey,
  Promise: Promise // 'Promise' is the native constructor.
});
var toSleep = 25;

var fileObj = {
    filename: 'CarParkRates.csv'
};
var parseCallback = function(err, json) {
    //finds coordinates via maps and writes to new file
    findCoordViaMap(json);

};

function findCoordViaMap(carparks){
  var promises = [];
  var computedCarparks = []
  for (var i=0; i < 3 /*carparks.length*/; i++) {
    var newPromise = gMaps.geocode({address: carparks[i].CarPark, region: 'sg'}).asPromise()
    promises.push(newPromise);
    sleep(toSleep);
  }

  Promise.all(promises).then(values => {
    for(var i=0; i<values.length; i++){
      var result = values[i];
      for (var j=0; j<carparks.length; j++){
        var carpark = carparks[j]
        if(carpark.CarPark === result.query.address){
          computedCarparks.push(getCarparkJson(carpark, result));
        }
      }
    }
    //console.log(computedCarparks)
    //write json to new file
    writeToFile(computedCarparks);
  });

}

function writeToFile(carparks){
  var writeObj = {
    filename: "rates.json",
    json: carparks
  };

  var writeCallback = function(err) {
      if(err != 'null'){
        console.log("success!")
      } else {
        console.log(err);
      }
  };
  c2j.writeJsonToFile(writeObj, writeCallback);
}

function getCarparkJson(carpark, result) {
  return {
    CarPark: carpark.CarPark,
    Category: carpark.Category,
    Address: result.json.results[0].formatted_address,
    Location_Lat: result.json.results[0].geometry.location.lat,
    Location_Lng: result.json.results[0].geometry.location.lng,
    WeekDays_Rate_1: carpark.WeekDays_Rate_1,
    WeekDays_Rate_2: carpark.WeekDays_Rate_2,
    Saturday_Rate: carpark.Saturday_Rate,
    Sunday_PublicHoliday_Rate: carpark.Sunday_PublicHoliday_Rate,
  }
}

var carparks = c2j.parse(fileObj, parseCallback)

//funciton to sleep to avoid flooding google maps
function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}
