//////////////////////////////////////////////////////////////
// Consts
//////////////////////////////////////////////////////////////
var connectionString = 'mongodb://localHost:27017/Taboolytics'
var tempCollection = 'rawtemp'
var aggregatedCollection = 'agg1'

//////////////////////////////////////////////////////////////
// Dependencies
//////////////////////////////////////////////////////////////
var logger = require('./logger').logger
var client = require('mongodb').MongoClient
var ObjectID = require('mongodb').ObjectID

//////////////////////////////////////////////////////////////
// Variables
//////////////////////////////////////////////////////////////

var connected = false
var db

//////////////////////////////////////////////////////////////
// Private Methods
//////////////////////////////////////////////////////////////

function collection(collectionName) {
	if (connected) 
		return db.collection(collectionName)
	logger.debug(connected)
	logger.error('Something went wrong...')
};

//////////////////////////////////////////////////////////////
// Public Methods
//////////////////////////////////////////////////////////////

function aggregate(callback) {
	var col = collection(tempCollection)

	var query = [{$match: {'countryName': {$in: ['UNITED STATES', 'UNITED KINGDOM', 'FRANCE', 'CANADA', 'INDIA']}}}, 
	{$project: { hour: { $hour: '$eventTime'}, minute: {$minute: '$eventTime'}, 
		year: {$year: '$eventTime'}, month: {$month: '$eventTime'}, day: {$dayOfMonth: '$eventTime'}, 
		countryName: 1, countryCode: 1}}, 
	{$group: {_id : { hour: '$hour', minute: '$minute', year: '$year', month: '$month', day: '$day', countryName: '$countryName', countryCode: '$countryCode'}, count: {'$sum': 1} }}, 
	{$sort: {count: -1}}]

	col.aggregate(query, function(err, aggregated) {
		callback(err, aggregated)
	});
}

function insertAggregated(data, callback) {
	var col = collection(aggregatedCollection)
	col.insert(data, callback);
}

function firstGenerated(callback) {
	var col = collection(tempCollection)
	var order = {
		generated : 1
	}
	var fields = {
		generated : 1
	}
	var q = { $query: query, $orderby: order }
	col.findOne(q, fields, function(err, one) {
		callback(one)
	})
}

function removeOld(generated, callback) {
	var col = collection(tempCollection)

	var query = {
		generated: generated
	}

	col.remove(query, callback);
}

function insertRaw(data, callback) {
	var col = collection(tempCollection)
	col.insert(data, function(err, res) {
		callback()
	});
}

function connect(callback) {
	logger.debug('Connecting to: ' + connectionString)
	client.connect(connectionString, function(err, _db) {
		if (!err)
			logger.info('Connected to: ' + connectionString)

		db = _db
		connected = true

		callback(err)
	});
};

function getCountByCountry(callback) {
	var col = collection(aggregatedCollection)

	col.find(query, function(err, result) {
		result.toArray(function(err, data) {
			callback(data)
		})
	})
}

module.exports = {
	connect: function(callback) {
		connect(callback)
	},
	insertRaw: function(data, callback) {
		insertRaw(data, callback)
	},
	aggregate: function(callback) {
		aggregate(callback)
	},
	insertAggregated: function(data, callback) {
		insertAggregated(data, callback)
	},
	removeOld: function(generated, callback) {
		removeOld(generated, callback)
	},
	getCountByCountry: function(callback) {
		getCountByCountry(callback)
	}
}