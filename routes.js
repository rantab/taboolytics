var dal = require('./mongodb')
var logger = require('./logger').logger

module.exports = {
	getCountByCountry: function(callback) {
		dal.getCountByCountry(callback)
	}
}