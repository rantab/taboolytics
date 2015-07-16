//////////////////////////////////////////////////////////////
// Consts
//////////////////////////////////////////////////////////////

var loggerName='log4js';
var logExtension = '.log'

var fileDateFormat = new Date().toISOString().
	replace(/T/, ' ').
	replace(/\..+/, '').
	replace('-', '').
	replace('-', '').
	replace(' ', '-').
	replace(':', '').
	replace(':', '');

//////////////////////////////////////////////////////////////
// Configurations
//////////////////////////////////////////////////////////////
var logFolder = __dirname + '\\logs'
var logFilePath = logFolder + '\\Taboolog-' + fileDateFormat + logExtension

//////////////////////////////////////////////////////////////
// Dependencies
//////////////////////////////////////////////////////////////
var logger = require(loggerName);
var fs = require('fs');

//////////////////////////////////////////////////////////////
// Initialization
//////////////////////////////////////////////////////////////
fs.exists(logFolder, function(exists) {
    if (!exists) {
        fs.mkdir(logFolder);
    }
});

logger.loadAppender('file');
logger.addAppender(logger.appenders.file(logFilePath));

var log = logger.getLogger();

log.info(loggerName + ': Log file created in ' + logFilePath);

module.exports.logger = log;