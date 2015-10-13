var express = require('express');
var router = express.Router();
var execSsh = require('ssh-exec');
var config = require('../config');

/* GET home page. */
router.get('/', function(req, res, next) {
   res.render('index', { title: 'Nodeploy .::Continuous deploy::.' });
});

router.post('/', function(req, res, next) {
	var db = req.db;
	db.collection('maps').find({"project_id": req.body.project_id}).toArray(function(e,result){
		if(e) next(e);
		console.log(config.user_ssh+"@"+result[0].server);
		execSsh(result[0].command, config.user_ssh+"@"+result[0].server).pipe(process.stdout);
		res.send("OK!"); 
	});
 
});
module.exports = router;
