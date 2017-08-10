var fs = require('fs')
var c2j = require('csv-to-json')
var apiKeys = JSON.parse(fs.readFileSync('apiKeys.json', 'utf8'))
// var rates = JSON.parse(fs.readFileSync('rates.json', 'utf8'))
var lotModule = require('./lotAvailability.js')
var rates = []
initRates('formatted.csv')
lotModule.getCarparkAvail()
lotModule.startLoop()

var TelegramBot = require('node-telegram-bot-api')
var bot = new TelegramBot(apiKeys.telegramKey, { polling: true })
var nNearest = 5
bot.on('message', (msg) => {
  // console.log(msg);
  if (msg.text) {
    if (msg.text.toLowerCase().indexOf('/start') === 0) {
      handleStart(msg)
    }
    if (msg.text.toLowerCase().indexOf('/info') === 0) {
      handleInfo(msg)
    }
    if (msg.text.toLowerCase().indexOf('/test') === 0) {
      handleTest(msg)
    }
    if (msg.text.toLowerCase().indexOf('/help') === 0) {
      handleHelp(msg)
    }
  }
  if (msg.location) {
    // console.log(msg)
    getLocation(msg, nNearest)
  }
})
function getLocation (msg, n) {
  var userLat = msg.location.latitude
  var userLng = msg.location.longitude
  var topn = []
  for (var i = 0; i < rates.length; i++) {
    var rate = rates[i]
    var latDiff = rate.Location_Lat - userLat
    var lngDiff = rate.Location_Lng - userLng
    var eucDist = Math.sqrt((latDiff * latDiff) + (lngDiff * lngDiff))

    topn.push({eucDist: eucDist, rate: rate})
    topn.sort(function (a, b) {
      return parseFloat(a.eucDist) - parseFloat(b.eucDist)
    })
    while (topn.length > n) {
      topn.pop()
    }
  }
  // console.log(topn);
  var toSend = '<b>The '
  toSend += n
  toSend += ' nearest carparks are: </b>\n'
  for (i = 0; i < topn.length; i++) {
    toSend += '<b>'
    toSend += topn[i].rate.CarPark
    toSend += '</b>'
    if (topn[i].rate.Lot_Avail_ID !== '-') {
      toSend += '\n<b>Lots Available: </b>'
      // toSend += topn[i].rate.Lot_Avail_ID;
      // get lots avail here
      // console.log(topn[i])
      var lotAvailStr = lotModule.getLotAvail(topn[i].rate.Lot_Avail_ID)
      toSend += lotAvailStr
    }
    toSend += '\n<code>Weekdays: </code>\n'
    toSend += topn[i].rate.WeekDays_Rate_1
    if (topn[i].rate.WeekDays_Rate_2 !== '-') {
      toSend += '\n'
      toSend += topn[i].rate.WeekDays_Rate_2
    }
    if (topn[i].rate.Saturday_Rate !== '-') {
      toSend += '\n<code>Saturdays: </code>\n'
      toSend += topn[i].rate.Saturday_Rate
    }
    if (topn[i].rate.Sunday_PublicHoliday_Rate !== '-') {
      toSend += '\n<code>Sun and PH: </code>\n'
      toSend += topn[i].rate.Sunday_PublicHoliday_Rate
    }
    toSend += '\n\n'
    // 'WeekDays_Rate_1':'Daily: $1.30 / 30 Mins','WeekDays_Rate_2':'-','Saturday_Rate':'-','Sunday_PublicHoliday_Rate':'-'
  }

  bot.sendMessage(msg.chat.id, toSend, {parse_mode: 'HTML'})
}

function handleStart (msg) {
  var toSend = 'Hello! Send me your location (paperclip logo, bottom right) and I\'ll find the '
  toSend += nNearest
  toSend += 'nearest carparks to you, with their rates! \n \n'
  toSend += 'Developed for public use by *Ten Zhi-Yang* July 2017'
  bot.sendMessage(msg.chat.id, toSend, {parse_mode: 'Markdown'})
}
function handleInfo (msg) {
  var toSend = 'Sg-carparks-bots databanks updated at: \n'
  toSend += '`30 July 2017`. \n \n'
  toSend += 'Data of exactly *'
  toSend += rates.length
  toSend += '* carparks have been collated from mytransport.sg datamall. \n \n'
  toSend += 'Developed for public use by *Ten Zhi-Yang* \n\n'
  toSend += 'any bugs, missing carparks or suggestions? submit an issue or pull request on my [github!](https://github.com/Tzyinc/sg-carpark-bot)'
  bot.sendMessage(msg.chat.id, toSend, {parse_mode: 'Markdown'})
}

function handleTest (msg) {
  lotModule.test()
}

function handleHelp (msg) {
  bot.sendPhoto(msg.chat.id, 'images/helpimage.png')
}

function initRates (filename) {
  var fileObj = {
    filename: filename
  }
  var parseCallback = function (err, json) {
    if (err) {
      console.log(err)
    } else {
      console.log('csv success!')
      // need to remove quotes from results
      json = json.map((each) => {
        var newStr = JSON.stringify(each)
        return JSON.parse(newStr.replaceAll('\\"', ''))
      })
      rates = json
      // console.log(rates[0]);
    }
  }
  c2j.parse(fileObj, parseCallback)
}

String.prototype.replaceAll = function (search, replacement) { // eslint-disable-line
  var target = this
  return target.split(search).join(replacement)
}
