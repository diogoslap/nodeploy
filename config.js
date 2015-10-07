var git_host = "yourhost-here";
var git_private_key = "xxxx";
var mongo_database = "databasename";
var mongo_host = "localhost";
var user_ssh = "username";
var user_public_key = "";
var type_connection = "http";
var max_projects_all = "50"; //Max projects is 50
var max_projects_owned = "50"; //Max projects is 50

var logger_type = "tiny"; //dev, common, short, tiny, combined

module.exports.git_host = git_host;
module.exports.git_private_key = git_private_key;
module.exports.mongo_database = mongo_database;
module.exports.mongo_host = mongo_host;
module.exports.user_ssh = user_ssh;
module.exports.user_public_key = user_public_key;
module.exports.type_connection = type_connection;
module.exports.logger_type = logger_type;
module.exports.max_projects_owned = max_projects_owned;
module.exports.max_projects_all = max_projects_all;