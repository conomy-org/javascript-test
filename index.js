const Twitter = require('twitter');
const RxJS = require('rx');
const _ = require('lodash');
const user = new Twitter({
	consumer_key: '',
	consumer_secret: '',
	access_token_key: '',
	access_token_secret: ''
});

var trumpTweets = user.stream('statuses/filter', {track: 'trump'});
var tweetsFilter = stream => 
	target => RxJS.Observable.fromEventPattern(
		callback => stream.on('data', tweet => {
				var reg = new RegExp("\\b" + target + "\\b", 'gi');
				if(tweet && tweet.text && (tweet.text.search(reg) != -1))
					callback(tweet);
			}).on('error', err => {
				throw err;
			})
	);
	
var filteredTweets = tweetsFilter(trumpTweets);

var putinTweets = filteredTweets('putin'), 
	hillaryTweets = filteredTweets('hillary');

var zippedTweets = RxJS.Observable.zip(putinTweets, hillaryTweets);

zippedTweets.subscribe(tweets => {
	var putinTweetsFiltered = tweets[0];
	var hillartTweetsFiltered = tweets[1];
	console.log('Authors:', putinTweetsFiltered.user.name + ',' , hillartTweetsFiltered.user.name);
	console.log('Messages:');
	console.log('>>>', putinTweetsFiltered.text);
	console.log('<<<', hillartTweetsFiltered.text);
	console.log('\n');
});