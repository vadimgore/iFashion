// load the node libraries

var http = require('http'); 
var mongoose  = require('mongoose'); 
var express   = require('express');

// define variables to represent our express application and our database

var app    = express(); 
var db;

// define the configuration of the EC2 instance hosting mongodb
var config = {      
    "USER"    : "",                  
    "PASS"    : "",       
    "HOST"    : "ec2-54-149-36-88.us-west-2.compute.amazonaws.com",         
    "PORT"    : "27017",        
    "DATABASE" : "iFashionDB"     
};

var dbPath = "mongodb://"+config.HOST+":"+config.PORT+"/"+config.DATABASE;

// connect to mongodb instance
console.log("Connecting to " + dbPath);
mongoose.connect(dbPath);
db=mongoose.connection;

// create schema for purchased item
var itemSchema = mongoose.Schema({
    item: String,
    type: String,
    brand: String,
    price: String,
    date: String
});

// create schema for User Fashion Profile
var iFashionProfileSchema = mongoose.Schema({
  user: {
    id: String,
    name: String,
    profile: String,
  },
  style: String,
  purchases: [itemSchema]
});

// create database model for fashion profile
var iFashionProfile = mongoose.model('FashionProfile', iFashionProfileSchema);

// create schema for Fashion Concierges
var iFashionConciergeSchema = mongoose.Schema({
  uuid: String,
  name: String,
  phone: String
});
 
// create database model for fashion concierge
var iFashionConcierge = mongoose.model('FashionConcierge', iFashionConciergeSchema);

// db error handler
db.on('error', console.error.bind(console, 'Connection failed'));

// db successful connection handler
db.once('open', function(callback) { 
    console.log("Connected to iFashion database....");

    // create default fashion profile
    var Leo = new iFashionProfile({
        user: {
   		id: '1234',
   		name: 'Leo',
   		profile: 'Urban achiever'
	},
   	style: 'Classic with a bit of trendy accent',
   	purchases: [
      	{
		item: 'Del Rey Chronograph Leather Watch - Tan',
		type: 'Watch',
		brand: 'Fossil',
		price: '175',
		date: 'December 27, 2014'
      	},
      	{
        	item: 'Fuel Cell',
		type: 'Lifestyle Sunglasses',
		brand: 'Oakley',
        	price: '160',
        	date: 'January 10, 2015'
      	}
   	]
    });

    var Jane = new iFashionConcierge({
  	uuid:'39ed3f82-ab30-11e4-89d3-123b93f75cba',
  	name:'Jane',
  	phone:'+15033171751'
    });

   // check if Leo and Jane's profiles exist in the database
   iFashionProfile.find({ 'user.name':'Leo' }, function(err, profile){
   	if (err) return console.error(err);
   	if (profile=="") {
		// insert Leo's profile
		console.log("Inserting Leo's profile to FashionProfile DB");
		Leo.save(function (err, Leo) { 
			if (err) return console.error(err);
		});
    	}
   });

   iFashionConcierge.find({ name:'Jane' }, function(err, profile){
   	if (err) return console.error(err);
   	if (profile=="") {
        	// insert Jane's profile
        	console.log("Inserting Jane's profile to FashionConsierge DB");
        	Jane.save(function (err, Jane) {
        		if (err) return console.error(err);
        	});
   	}
   });
});

// set up the Express routes to handle incoming requests. 

// first, respond to requests to our domain by extracting user profileg from the Db and sending it as the response
app.get('/', function(req, res){ 
    console.log("Received new request: " + req);
    // TO DO: extract user id and concierge id from the request's body
    var user_id = '1234';
    var concierge_id = '39ed3f82-ab30-11e4-89d3-123b93f75cba';    
    var response;

    // Fetch user profile 
    iFashionProfile.findOne({'user.id':user_id}, function (err, profile) { 
	if (err)  {
	  res.send(err);
	  return console.error(err);
	}
	if (!profile){
	  res.send("User profile not found");
	  return console.log("User profile not found!");;
	} 
	
	console.log("User profile found! " + profile);
	response = "Sharing " + profile.user.name + " fashion profile"; 

	// Fetch concierge profile
    	iFashionConcierge.findOne({'uuid':concierge_id}, function (err, profile) {
          if (err)  {
            res.send(err);
            return console.error(err);
          }
          if (!profile){
            res.send("Concierge profile not found");
            return console.log("Concierge profile not found!");;
          }

          console.log("Concierge profile found! " + profile);
          response += " with fashion concierge " + profile.name;
	  res.send(response);
        });
    
    }); 
});

// set up an Express route to handle any errors
app.use(function(err, req, res, next){ 
    console.log("error occured");
    if (req.xhr) { 
        res.send(500, 'Something went wrong!'); } 
    else { 
        next(err); 
    } 
});

// starting express web server
console.log('starting Express (NodeJS) Web server'); 
app.listen(8080); 
console.log('Webserverlistening on port 8080');

