var fs = require("fs");
var apiKeys = JSON.parse(fs.readFileSync('apiKeys.json', 'utf8'));
var rates = JSON.parse(fs.readFileSync('rates.json', 'utf8'));
var TelegramBot = require('node-telegram-bot-api'),
  bot = new TelegramBot(apiKeys.telegramKey, { polling: true });
var n_nearest = 5;
bot.on('message', (msg) => {
  //console.log(msg);
  if(msg.text){
    if (msg.text.toLowerCase().indexOf("/start") === 0) {
      handleStart(msg);
    }
    if (msg.text.toLowerCase().indexOf("/info") === 0) {
      handleInfo(msg);
    }
    if (msg.text.toLowerCase().indexOf("/test") === 0) {
      handleTest(msg);
    }
    if (msg.text.toLowerCase().indexOf("/help") === 0) {
      handleHelp(msg);
    }
  }
  if(msg.location){
    getLocation(msg, n_nearest);
  }
});
function getLocation(msg, n){
  var userLat = msg.location.latitude
  var userLng = msg.location.longitude
  var topn = [];
  for (var i=0; i<rates.length; i++){
    rate = rates[i]
    var latDiff = rate.Location_Lat - userLat;
    var lngDiff = rate.Location_Lng -userLng;
    var eucDist = Math.sqrt((latDiff * latDiff) + (lngDiff * lngDiff));
    topn.push({eucDist: eucDist, rate: rate})

    topn.sort(function(a, b) {
        return parseFloat(a.eucDist) - parseFloat(b.eucDist);
    });
    while (topn.length>n){
      topn.pop();
    }
  }
  var toSend = "*The ";
  toSend += n;
  toSend += " nearest carparks are: *\n";
  for(var i=0; i<topn.length; i++) {
    toSend += "*";
    toSend += topn[i].rate.CarPark;
    toSend += "*";
    toSend += "\n`Weekdays: `\n";
    toSend += topn[i].rate.WeekDays_Rate_1;
    if (topn[i].rate.WeekDays_Rate_2 != "-") {
      toSend += "\n"
      toSend += topn[i].rate.WeekDays_Rate_2;
    }
    if (topn[i].rate.Saturday_Rate!= "-") {
      toSend += "\n`Saturdays: `\n";
      toSend += topn[i].rate.Saturday_Rate;
    }
    if (topn[i].rate.Sunday_PublicHoliday_Rate!= "-") {
      toSend += "\n`Sun and PH: `\n";
      toSend += topn[i].rate.Sunday_PublicHoliday_Rate;
    }
    toSend += "\n\n"
    //"WeekDays_Rate_1":"Daily: $1.30 / 30 Mins","WeekDays_Rate_2":"-","Saturday_Rate":"-","Sunday_PublicHoliday_Rate":"-"
  }

  bot.sendMessage(msg.chat.id,toSend,{parse_mode : "Markdown"});
}

function handleStart(msg){
  var toSend = "Hello! Send me your location (paperclip logo, bottom right) and I'll find the "
  toSend += n_nearest
  toSend += "nearest carparks to you, with their rates! \n \n"
  toSend += "Developed for public use by *Ten Zhi-Yang* July 2017"
  bot.sendMessage(msg.chat.id,toSend,{parse_mode : "Markdown"});
}
function handleInfo(msg){
  var toSend = "Sg-carparks-bots databanks updated at: \n";
  toSend += "`30 July 2017`. \n \n";
  toSend += "Data of exactly *";
  toSend += rates.length;
  toSend += "* carparks have been collated from mytransport.sg datamall. \n \n"
  toSend += "Developed for public use by *Ten Zhi-Yang* \n\n"
  toSend += "any bugs, missing carparks or suggestions? submit an issue or pull request on my [github!](https://github.com/Tzyinc/sg-carpark-bot)"
  bot.sendMessage(msg.chat.id,toSend,{parse_mode : "Markdown"});
}

function handleTest(msg){
  var toSend = "";
  for (var i=0; i< rates.length; i++){
    //console.log(i, rates[i].CarPark)
  }
}

function handleHelp(msg){
  bot.sendPhoto(msg.chat.id,"images/helpimage.png" );
}
