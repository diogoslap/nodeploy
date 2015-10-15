var express = require('express');
var router = express.Router();
var sshObject = require("simple-ssh");
var config = require('../config');
var fs = require('fs');
//var Slack =  require('node-slackr');
var slack = "";
if(config.slack_hook_url && config.slack_channel && config.slack_username){
	/*slack = new Slack(config.slack_hook_url,{
		  channel: config.slack_channel,
		  username: config.slack_username,
		  icon_emoji: ":joy:"
	});*/
	slack = require('slack-notify')(config.slack_hook_url);
	
}

/* GET home page. */
router.get('/', function(req, res, next) {
   res.render('index', { title: 'Nodeploy .::Continuous deploy::.' });
});

router.post('/', function(req, res, next) {
	var db = req.db;
	var result_test = "";
	var total_commits = parseInt(req.body.total_commits_count)
	
	db.collection('maps').find({"project_id": req.body.project_id}).toArray(function(e,result){
		if(e) next(e);

		var ssh = new sshObject({
			host: result[0].server,
			user: config.user_ssh,
			pass: config.user_password
		});
		console.log("Executing commands")
		var dash = "\n========================"+new Date()+"====================\n";
		fs.appendFile('public/logs/'+req.body.project_id+'-log.txt',dash, function(err){
			if(err)	console.log(err);
		});
		ssh.exec(result[0].command,{
			out: function(stdout){				

				fs.appendFile('public/logs/'+req.body.project_id+'-log.txt',stdout, function(err){
						if(err)	console.log(err);
				});				
			},
			error: function(error){
				fs.appendFile('public/logs/'+req.body.project_id+'-error.txt',error, function(err){
						if(err) console.log(err);
				});		
				console.log("Failed command, check log:public/logs/"+req.body.project_id+"-error.txt")
				db.collection('maps').update({"project_id" :parseInt(req.body.project_id)},{$set:{"command_rollback":"Command Failed!"}},
					function(e,result){
						if(e) console.log(e)					 
				});	
				if(slack){
					slackFunction(slack,'Command failed in the Project: '+result[0].name);
				}	
			},
			exit: function(code){
				if(result[0].command_test){
					console.log("Executing tests")
					var dash = "\n========================"+new Date()+"====================\n";
					fs.appendFile('public/logs/'+req.body.project_id+'-test.txt',dash, function(err){
								if(err)	console.log(err);
							});
					ssh.exec(result[0].command_test,{
						out: function(outStd){
							fs.appendFile('public/logs/'+req.body.project_id+'-test.txt',outStd, function(err){
								if(err)	console.log(err);
							});							
						},
						err: function(error){
							fs.appendFile('public/logs/'+req.body.project_id+'-test.txt',error, function(err){
								if(err)	console.log(err);
								
							});																				
						},exit: function(code){
							var out = "";
							if(code == 1){
								out = "Tests failed! check log:public/logs/"+req.body.project_id+"-test.txt";
								console.log(out)
								db.collection('maps').update({"project_id" :parseInt(req.body.project_id)},{$set:{"command_rollback":"Tests Failed!"}},
								  	 function(e,result){
								  		if(e) console.log(e)								  		
								  });

								if(slack){									
									slackFunction(slack,'Tests failed in the Project: '+result[0].name);											 
								}																	
							}else if(code == 0){
								out = "Tests Ok!"
								console.log(out)
							}

							fs.appendFile('public/logs/'+req.body.project_id+'-test.txt',out, function(err){
								if(err)	console.log(err);
							});	
							
						}
					})
				}
			}
		}).start();
		res.send("OK!"); 
		
	});
 
});

slackFunction = function(slack,message){

	slack.send({
		channel: config.slack_channel,
		text: message,									  
		username: config.slack_username,
		icon_emoji:':rage:'
	});		
	slack.onError = function (err) {
		console.log('API error:', err);
	};	
}
module.exports = router;
