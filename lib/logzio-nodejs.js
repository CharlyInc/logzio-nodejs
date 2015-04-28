
var request = require('request');
var stringifySafe = require('json-stringify-safe');

exports.version = require('../package.json').version;

var LogzioLogger = function (options) {
	if (!options || !options.token)
		throw new Error('You are required to supply a token for logging.');

	this.token = options.token;
	this.protocol = options.protocol || 'http';
	this.host = 'listener.logz.io';
	this.port = 5050;
	this.userAgent = 'Logzio-Logger NodeJS';

	// build the url for logging
	this.url = this.protocol + '//' + this.host + ':' + this.port;
};
exports.createLogger = function (options) {
	return new LogzioLogger(options);
};

var jsonToString = exports.jsonToString = function(json) {
	try {
		return JSON.stringify(json);
	}
	catch(ex) {
		return stringifySafe(msg, null, null, function() { });
	}
};

LogzioLogger.prototype.log = function (json, callback) {
	var jsonString = jsonToString(json);
	var options = {
	    uri: this.url,
	    method: 'POST',
	    body: jsonString,
	    headers: {
	      'host': this.host,
	      'accept': '*/*',
	      'user-agent': this.userAgent,
	      'content-type': 'application/json',
	      'content-length': Buffer.byteLength(jsonString)
	    }
  	};

	try {
		request(options, function (err, res, body) {
			if (err) {
				callback(err);
				return;
			}

			var responseCode = res.statusCode.toString();
			if (responseCode !== 200)
				callback(new Error('There was a problem with the request.\nReceived http response code: ' + responseCode));

			callback();
		});
	}
	catch (ex) {
		callback(ex);
	}
};