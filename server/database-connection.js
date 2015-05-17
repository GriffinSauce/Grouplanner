(function()
{

  if(!global.grouplanner.database)
  {
    var mongo_mongoose = require('mongoose');

    if(global.grouplanner.environment == 'local')
    {
      mongo_mongoose.connect('mongodb://' + global.grouplanner.ipaddress + '/grouplanner');
    } else
    {
      var connectionString = 'mongodb://';
      connectionString += process.env.MONGODB_USER + ':';
      connectionString += process.env.MONGODB_PASS + '@';
      connectionString += process.env.OPENSHIFT_MONGODB_DB_HOST + ':';
      connectionString += process.env.OPENSHIFT_MONGODB_DB_PORT + '/';
      connectionString += process.env.MONGODB_DB;
      mongo_mongoose.connect(connectionString);
    }
    global.grouplanner.mongoose = mongo_mongoose;
    global.grouplanner.database = mongo_mongoose.connection;
    global.grouplanner.database.on('error', console.error.bind(console, 'Database connection error:'));
    global.grouplanner.database.once('open', function callback() { console.log('Connected to the database'); });

  }
})();
