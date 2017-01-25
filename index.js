
require('colors');
const _ = require('lodash');
const Twitter = require('twitter');
const Rx = require('rx');

const client = new Twitter(require('./config'));
const get_filter_source = require('./get_filter_source');

// Create twitter subscribe stream
var stream = client.stream('statuses/filter', {track: 'trump'});
var filter_source = get_filter_source(stream);

// Zip two event sources
var source = Rx.Observable.zip(
	filter_source('putin'),
	filter_source('hillary')
);

// Print tweets
source.subscribe(tweets => {
	var tp = tweets[0];
	var th = tweets[1];
	console.log('Authors:', tp.user.name.green + ',' , th.user.name.blue);
	console.log('Messages:');
	console.log('>>>', tp.text.green);
	console.log('<<<', th.text.blue);
	console.log('\n');
});