var express = require('express');
var router = express.Router();
var config = require('../config');
var http = require(config.type_connection);
var url = '/api/v3/projects';

var options = {
   host: config.git_host,
   method: 'GET',
   headers: { 'Content-Type': 'application/json' }
};

/* GET Projects Owned listing. */
router.get('/map/owned', function(req, res, next) {
	options.path = url+'/owned?private_token='+config.git_private_key

	http.get(options, function(rr) {
		 var body = '';

	    rr.on('data', function(chunk){
	        body += chunk;
	    });

	    rr.on('end', function(){
	        var jsonBody = JSON.parse(body);
	        console.log(Object.keys(jsonBody).length)
	        res.send(jsonBody);
	        res.status(200);
	    });
	}).on('error', function(e){
		res.status(500);
        res.send("Got an error: ", e);
	});
  
  
});

module.exports = router;
