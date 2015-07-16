//////////////////////////////////////////////////////////////
// Consts
//////////////////////////////////////////////////////////////
var dataUrl = 'http://52.11.153.209:8080/stats/clicks'

var loadWaitTime = 60000
var quota = 1

//////////////////////////////////////////////////////////////
// Dependencies
//////////////////////////////////////////////////////////////
var dal = require('./mongodb')
var logger = require('./logger').logger
var async = require('async')
var request = require('request')
var chrono = require('chrono-node')

function parseJSON(object, callback) {
	try {
		callback(null, JSON.parse(object))
	} 
	catch (ex) {
		callback(-1, null)
	}
};

//////////////////////////////////////////////////////////////
// Public Methods
//////////////////////////////////////////////////////////////



function aggregate(gen, callback) {
	logger.debug('Aggregating...')
	dal.aggregate(function(err, aggregated) {
		logger.debug('Inserting...')
		if (aggregated && aggregated.length == 0) {
			callback(callback)
		}
		else {
			dal.insertAggregated(aggregated, function(res) {
				callback(callback)
			})
		}
	}) 
}

function load(callback) {
	logger.debug('Loading...')
	request(dataUrl, function (err, res, body) {
		if (!err && res.statusCode == 200) {
			parseJSON(body, function(err, json) {
				if (!err && json) {
					logger.debug('Parsed')
					async.eachLimit(json['data'], quota, 
			            function(record, next) {
			                record['generated'] = json['generated']
			                var dt = new Date(record['eventTime'])
			                record['eventTime'] = dt
			                dal.insertRaw(record, function() {
								next()
			                })
			            }, function(err) {
			            	setTimeout(function() {
			            		aggregate(json['generated'], function() {
				            		setTimeout(function() {
				            			callback(callback)
				            		}, loadWaitTime)
				            	})
			            	}, 200)
			    	})
				}
			})
		}
	})
}

module.exports = {
	Load: function() {
		load(load)
	}
}