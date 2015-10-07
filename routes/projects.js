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
	var db = req.db;
	var finish = 1;
	var pages = parseInt(config.max_projects_owned/50);
	pages = (pages == 0)? 1 : pages;
	for(var i =1; i <= pages; i++){
		options.path = url+'/owned?page='+i+'&per_page=50&private_token='+config.git_private_key
		
		http.get(options, function(rr) {
			 var body = '';

		    rr.on('data', function(chunk){
		    	body += chunk;
		    	
		    });

		    rr.on('end', function(){
		    	if(body.length >0){   		
			    	
			        var jsonBody = JSON.parse(body);
			        var jsonInsert = [];
			        
			        for(var key in jsonBody){
			        	var jsonObject = new Object();
			        	jsonObject.project_id = jsonBody[key].id;
			        	jsonObject.name = jsonBody[key].name;
			        	jsonObject.server = "";
			        	jsonObject.command = "";
			        	jsonInsert.push(jsonObject); 
			        }
			        db.collection('maps').insert(jsonInsert, {}, function(e, results){
					    if (e) return next(e)	
					    finish++;	
					    if(finish == pages){
					    	res.status(200).send("All owned projects are mapped");
					    }
					    
					});	 
				}      
		    });
		}).on('error', function(e){
			res.status(500).send("Got an error: ", e)
		});
	}
});

/* GET Projects All listing. */
router.get('/map/all', function(req, res, next) {
	var db = req.db;
	var finish = 1;
	var pages = parseInt(config.max_projects_all/50);
	pages =(pages == 0)? 1 : pages;
	for(var i =1; i <= pages; i++){
		options.path = url+'/all?page='+i+'&per_page=50&private_token='+config.git_private_key
		
		http.get(options, function(rr) {
			 var body = '';

		    rr.on('data', function(chunk){
		    	body += chunk;
		    	
		    });

		    rr.on('end', function(){
		    	if(body.length >0){   		
			    	
			        var jsonBody = JSON.parse(body);
			        var jsonInsert = [];
			        
			        for(var key in jsonBody){
			        	var jsonObject = new Object();
			        	jsonObject.project_id = jsonBody[key].id;
			        	jsonObject.name = jsonBody[key].name;
			        	jsonObject.server = "";
			        	jsonObject.command = "";
			        	jsonInsert.push(jsonObject); 
			        }
			        db.collection('maps').insert(jsonInsert, {}, function(e, results){
					    if (e) return next(e)	
					    finish++;	
					    if(finish == pages){
					    	res.status(200).send("All projects are mapped");
					    }
					    
					});	 
				}      
		    });
		}).on('error', function(e){
			res.status(500).send("Got an error: ", e)
		});
	}
  
  
});


router.get('/map/list', function(req,res,next){
	var db = req.db;
	db.collection('maps').find({},{sort:{'name':1}}).toArray(function(e,result){
		  		res.json(result); 	  		
	});
});

router.get('/edit/:id', function(req,res,next){
   var db = req.db; 
   var project_id = parseInt(req.params.id);

   db.collection('maps').find({"project_id":project_id}).toArray(function(e,result){
   		if(e) return next(e);
        var project = result;
        if(result.length > 0 ){          
          res.render('edit', { title: "Editing project: "+project[0].name, project:project[0]});
        }else{
          var err = new Error('Not Found');
          err.status = 404;
          next(err);
        }
    });
	//res.render('edit', { title: 'Editing Project' })
});

router.post('/edit', function(req,res,next){
	var db = req.db;		
	  db.collection('maps').update({"project_id" :parseInt(req.body.id)},{$set:{"name":req.body.name,"server":req.body.server,
	  	"command":req.body.command}}, function(e,result){
	  		if (e) return next(e)
	  		res.redirect('/'); 
	  });
	
})

module.exports = router;
