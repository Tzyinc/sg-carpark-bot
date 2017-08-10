# sg-carpark-bot
Telegram bot for sg carpark rates and lot availability. This bot will be developed for high user loads in mind, and therefore should avoid persisting user data (for things like user settings) and should as much as possible run as a stand alone, and should not fail if any dependent api (sans telegram) is down.

Lot availability data provided by LTA are around town, harbourfront and jurong area

## Develop locally
clone locally, then run `npm install`

ensure that you have the file `apiKeys.json`. Contents of the file as follows:

```
{
  "gMapsKey" : "<YOUR GOOGLE MAPS KEY HERE>",
  "telegramKey" : "<YOUR TELEGRAM BOT KEY HERE>",
  "datamallKey" : "<YOUR LTA DATAMALL KEY HERE>"
}

```
`gMapsKey` is used in `update-csv.js`

`telegramKey` and `datamallKey` are being used for the bots, in  `index.js` and  `lotAvailability.js` respectively

finally you can run `npm start`


## File structure
The entry point is `index.js`. It is dependent on  `lotAvailability.js`. `index.js` *should* have only the main functionalities of the bot, with its few commands.`lotAvailability.js` will maintain its own list of carparks updated every n minutes, and whenever needed, its data will be used in `index.js`

`CarParkRates.csv` is the file provided by LTA's datamall. To pre-process the data, run `node update-csv.js`. This generates two files, `formatted.csv` and  `rates.json`(deprecated) the contents of these two files are identical, in different formatting.

## Contribute

### Developers
#### Add a carpark that's not currently in the bot
Submit a pull request, add the carpark information in `formatted.csv`

### Non-Developers

#### Suggest a carpark that's not currently in the bot
Submit an issue with the following information:
```
Car Park name: Name must be easily identifiable

Address: Address as specified by google maps, including  postal code

WeekDays Rate: in english, try to follow exact format given

Saturday_Rate:

Sunday or Public Holiday Rate:
```
