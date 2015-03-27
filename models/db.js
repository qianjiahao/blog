/**
 * Created by qianjiahao on 15/3/22.
 */
var settings = require('../settings'),
	Db = require('mongodb').Db,
	Connection = require('mongodb').Connection,
	Server = require('mongodb').Server;

module.exports = new Db(settings.db, new Server(settings.host,settings.port),{safe:true});