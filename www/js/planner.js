/* global $,moment,App,Group,Period */

// UserID
// TODO: Replace with the real deal after login
var userID = "Vla";

var app = new App();

// Load this week
var thisWeek = moment().weekday(1).format('DDMMYYYY');
app.loadPeriod(thisWeek);

// Input some dummy data
app.data[thisWeek].days[moment().weekday(1).format('DDMMYYYY')].available = ["Frits","Joey","John","Klaas"];
app.data[thisWeek].days[moment().weekday(2).format('DDMMYYYY')].available = ["Joey","John","Klaas"];
app.data[thisWeek].days[moment().weekday(3).format('DDMMYYYY')].available = ["Frits","Joey"];
app.data[thisWeek].days[moment().weekday(4).format('DDMMYYYY')].available = ["Frits","Joey","John","Klaas"];
app.data[thisWeek].days[moment().weekday(5).format('DDMMYYYY')].available = ["Frits"];
app.data[thisWeek].days[moment().weekday(6).format('DDMMYYYY')].available = [];
app.data[thisWeek].days[moment().weekday(7).format('DDMMYYYY')].available = ["John","Klaas"];
app.data[thisWeek].updatePicker();

app.init();