
const Rx = require('rx');

// Filter stream messages by regexp
module.exports = stream => 
	target => Rx.Observable.fromEventPattern(
		cb => stream.on('data', tweet => {
				if(tweet && tweet.text && new RegExp("\\b" + target + "\\b", 'gi').test(tweet.text))
					cb(tweet);
			}).on('error', error => {
				throw error;
			})
	);