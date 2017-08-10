var fs = require('fs')
var rp = require('request-promise-native')
var apiKeys = JSON.parse(fs.readFileSync('apiKeys.json', 'utf8'))
var lotAvailabilityArr = []
var loopTimeMillis = 60 * 1000

function getCarparkAvail () {
  var uriStr = 'http://datamall2.mytransport.sg/ltaodataservice/CarParkAvailability'
  var options = {
    uri: uriStr,
    method: 'GET',
    headers: {
      'AccountKey': apiKeys.datamallKey,
      'accept': 'application/json'
    },
    json: true
  }

  rp(options)
      .then(function (res) {
        /*
        for (var i = 0; i < res.value.length; i++) {
          console.log(res.value[i].Development, res.value[i])
        }
        */
        console.log('Lot Avail updated')
        lotAvailabilityArr = res.value
      })
      .catch(function (err) {
        console.log(err)
        console.log('fail')
      })
}

function startLoop () {
  setInterval(getCarparkAvail, loopTimeMillis)
}

// requires the multiple ids to be split by spaces
function getLotAvail (reqID) {
  // console.log(reqID)
  var reqIDs = reqID.split(' ')
  for (var i = 0; i < reqIDs.length; i++) {
    var carparkID = reqIDs[i]
    for (var j = 0; j < lotAvailabilityArr.length; j++) {
      var lotAvailData = lotAvailabilityArr[j]
      // console.log('checking', lotAvailData.CarParkID, carparkID)
      // one is a string one is an int
      if (lotAvailData.CarParkID == carparkID) { // eslint-disable-line
        // console.log(lotAvailData)
        return lotAvailData.Lots
      }
    }
  }
}

module.exports = {
  carparksArr: lotAvailabilityArr,
  getCarparkAvail: getCarparkAvail,
  startLoop: startLoop,
  getLotAvail: getLotAvail
}
