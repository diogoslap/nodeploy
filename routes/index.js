var express = require('express');
var router = express.Router();
var sshObject = require("simple-ssh");
var config = require('../config');

/* GET home page. */
router.get('/', function(req, res, next) {
   res.render('index', { title: 'Nodeploy .::Continuous deploy::.' });
});

router.post('/', function(req, res, next) {
	var db = req.db;
	var result_test = "";

	db.collection('maps').find({"project_id": req.body.project_id}).toArray(function(e,result){
		if(e) next(e);

		var ssh = new sshObject({
			host: result[0].server,
			user: config.user_ssh,
			pass: config.user_password
		});

		ssh.exec(result[0].command,{
			out: function(stdout){
				console.log(stdout);
			},
			error: function(err){
				console.log(err);
			},
			exit: function(){
				if(result[0].command_test){
					ssh.exec(result[0].command_test,{
						out: function(outStd){
							console.log(outStd)
						},
						err: function(error){
							console.log(error);
						}
					})
				}
			}
		}).start();

		res.send("OK!"); 
	});
 
});
module.exports = router;
