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
    "HOST"    : "ec2-54-69-158-93.us-west-2.compute.amazonaws.com",         
    "PORT"    : "27017",        
    "DATABASE" : "iFashionDB"     
};

// define the details for the database we will be connecting to on that instance
/*var dbPath  = "mongodb://"+config.USER + ":"+     
    config.PASS + "@"+     
    config.HOST + ":"+    
    config.PORT + "/"+     
    config.DATABASE; 
*/

var dbPath = "mongodb://"+config.HOST+":"+config.PORT+"/"+config.DATABASE;

// connect to mongodb instance
console.log("Connecting to " + dbPath);
mongoose.connect(dbPath);
db=mongoose.connection;

// create schema for our database
var iFashionSchema = mongoose.Schema({
  user_id: String,
  style: String
});

// create database model
var iFashionProfile = mongoose.model('FashionProfile', iFashionSchema);
 

// db error handler
db.on('error', console.error.bind(console, 'Connection failed'));

// db successful connection handler
db.once('open', function(callback) { 
    console.log("Connected to DB. Lookup profiles...");

    // create default profile
    var defaultProfile = new iFashionProfile({style: 'default style'});

    // show existing profiles
    iFashionProfile.find( function(err, profiles){
	if (err) return console.error(err);
        if (profiles=="") {
	   // insert default profile
           var defaultProfile = new iFashionProfile({user_id: "123", style: 'default style'});
	   defaultProfile.save(function (err, defaultProfile) {
		if (err) return console.error(err);
	   });
	}
    });  
});


// set up the Express routes to handle incoming requests. 

// first, respond to requests to our domain by extracting user profileg from the Db and sending it as the response
app.get('/', function(req, res){ 
    console.log("Received new request. Looking for user profile");  
    iFashionProfile.findOne({'user_id':'123'}, function (err, profile) { 
	if (err) return console.error(err);
	console.log("user profile: " + profile);
	if (profile)
	    res.send(profile.style); 
	else
	    res.send("profile not found");
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
