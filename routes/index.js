var express = require('express');
var router = express.Router();
var sshObject = require("simple-ssh");
var config = require('../config');
var fs = require('fs');

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
								/*console.log("Executing rollback")
								var command = result[0].command_rollback
								var command_rollback = command.replace("@commit_count",total_commits)
								console.log(command_rollback);
								var dash = "\n========================"+new Date()+"====================\n";
								fs.appendFile('public/logs/'+req.body.project_id+'-rollback.txt',dash, function(err){
									if(err)	console.log(err);
								});		
								ssh.exec(command_rollback,{
									out: function(outStd){
										fs.appendFile('public/logs/'+req.body.project_id+'-rollback.txt',outStd, function(err){
											if(err)	console.log(err);
										});							
									},
									err: function(error){
										fs.appendFile('public/logs/'+req.body.project_id+'-rollback.txt',error, function(err){
											if(err)	console.log(err);											
										});																												
									},
									exit:function(code){
										if(code == 0){
											out = "rollback Ok!"											
										}else if(code ==1){
											out = "Rollback Failed!"
										}else if(code == 128){
											out ="Rollback Fatal Error. Check Logs"
										}
										console.log(out)
										console.log(code);
									}								
								})		*/											
							}else if(code == 0){
								out = "Tests Ok!"
								console.log(out)
							}

							fs.appendFile('public/logs/'+req.body.project_id+'-test.txt',out, function(err){
								if(err)	console.log(err);
							});	
							console.log(code);
							
						}
					})
				}
			}
		}).start();
		res.send("OK!"); 
		
	});
 
});
module.exports = router;
