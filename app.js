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
    "HOST"    : "ec2-54-68-145-255.us-west-2.compute.amazonaws.com",         
    "PORT"    : "27017",        
    "DATABASE" : "iFashionDB"     
};

// define the details for the database we will be connecting to on that instance
var dbPath  = "mongodb://"+config.USER + ":"+     
    config.PASS + "@"+     
    config.HOST + ":"+    
    config.PORT + "/"+     
    config.DATABASE; 

var defaultProfile = 'Default fashion profile';

// create schema for our database
var iFashionSchema = mongoose.Schema({   
    profile: String 
});

var userProfile = mongoose.model('iFashionSchema');
                                 
// connect to mongodb instance
db = mongoose.connect(dbPath);

// check if DB instance already has user profile and if not create one
mongoose.connection.once('open', function() { 
    var profile; 
    userProfile.find( function(err, profiles){ 
        if( !profiles ){      
            profile = new userProfile({ profile: defaultProfile });  
            profile.save(); 
        }  
    });  
});

// set up the Express routes to handle incoming requests. 

// first, respond to requests to our domain by extracting user profileg from the Db and sending it as the response
app.get('/', function(req, res){   
    userProfile.findOne(function (err, profile) {   
        res.send(profile.profile);   
    }); 
});

// set up an Express route to handle any errors
app.use(function(err, req, res, next){ 
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