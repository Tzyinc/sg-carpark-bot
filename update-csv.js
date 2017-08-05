var c2j = require('csv-to-json');
var j2c = require('json-to-csv');
var fs = require("fs");
var apiKeys = JSON.parse(fs.readFileSync('apiKeys.json', 'utf8'));
var gMaps = require('@google/maps').createClient({
  key: apiKeys.gMapsKey,
  Promise: Promise // 'Promise' is the native constructor.
});
var toSleep = 50;
const outputFileName = 'formatted.csv';

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
  for (var i=0; i < carparks.length; i++) {
    if(carparks[i].CarPark != ""){
      var newPromise = gMaps.geocode({address: carparks[i].CarPark, region: 'sg'}).asPromise()
      promises.push(newPromise);
      //console.log("request number ", i, " made");
      sleep(toSleep);
    }
  }

  Promise.all(promises).then(values => {
    for(var i=0; i<values.length; i++){
      var result = values[i];
      for (var j=0; j<carparks.length; j++){
        var carpark = carparks[j]
        if(carpark.CarPark === result.query.address){
          var newJson = getCarparkJson(carpark, result);
          if (!isEmpty(newJson)){
            computedCarparks.push(newJson);
          }
        }
      }
    }
    //console.log(computedCarparks)
    //write json to new file
    writeToFile(computedCarparks);
  }).catch(function(err) {
    console.log(err); // some coding error in handling happened
  });;

}

function writeToFile(carparks){
  //write to JSON file (to be deprecated)
  var writeObj = {
    filename: "rates.json",
    json: arrUnique(carparks)
  };

  var writeCallback = function(err) {
      if(err != 'null'){
        console.log("JSON success!")
      } else {
        console.log(err);
      }
  };
  c2j.writeJsonToFile(writeObj, writeCallback);

  j2c(carparks, outputFileName)
    .then(() => {
      console.log("CSV Success");
    })
    .catch(err => {
      console.log(err);
    });
  //write to CSV
}

function getCarparkJson(carpark, result) {
  if (result.json.results.length>0){
    return {
      CarPark: carpark.CarPark,
      //category causes duplication issues
      //Category: carpark.Category,
      Address: result.json.results[0].formatted_address,
      Location_Lat: result.json.results[0].geometry.location.lat,
      Location_Lng: result.json.results[0].geometry.location.lng,
      WeekDays_Rate_1: carpark.WeekDays_Rate_1,
      WeekDays_Rate_2: carpark.WeekDays_Rate_2,
      Saturday_Rate: carpark.Saturday_Rate,
      Sunday_PublicHoliday_Rate: carpark.Sunday_PublicHoliday_Rate,
      Lot_Avail_ID: "-"
    };
  }else{
    console.log(result);
    return {
    };
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

function isEmpty(obj) {
    return JSON.stringify(obj) === JSON.stringify({});
}

function arrUnique(obj){
    var uniques=[];
    var stringify={};
    for(var i=0;i<obj.length;i++){
       var keys=Object.keys(obj[i]);
       keys.sort(function(a,b) {return a-b});
       var str='';
        for(var j=0;j<keys.length;j++){
           str+= JSON.stringify(keys[j]);
           str+= JSON.stringify(obj[i][keys[j]]);
        }
        if(!stringify.hasOwnProperty(str)){
            uniques.push(obj[i]);
            stringify[str]=true;
        }
    }
    return uniques;
}
