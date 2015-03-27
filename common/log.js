/**
 * Created by qianjiahao on 15/3/26.
 */
var log4js = require('log4js');

exports.logger = logger;

exports.use = function(app){
	app.use(log4js.connectLogger(logger,{level:'auto',format:':method :url'}));
}

log4js.configure({
	appenders:[
		{
			type:'console'
		},{
			type:'file',
			filename:'logs/access.log',
			maxLogSize:1024,
			backup:3,
			category:'normal'
		}
	]
});

var logger = log4js.getLogger('normal');

