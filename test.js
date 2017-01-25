
const assert = require('assert');
const describe = require('mocha').describe;
const it = require('mocha').it;

const fake_tweets = {
	has_putin:{
		user: {
			name: 'OSASO'
		},
		text: 'Putin trump ololo'
	},
	has_hillary: {
		user: {
			name: 'OBABO'
		},
		text: 'hillary + trump = <3'
	},
	no_one: {
		user: {
			name: 'NNNUUULLLL'
		},
		text: 'No one bitches'
	}
}


describe("Module state", () => {
	describe("package.json", () => {
		it("valid package.json", done => {
			require("./package.json");
			done();
		});
	});

	describe("export", () => {
		it("exporting trump", done => {
			require("./index.js");
			done();
		});
	});
});


describe("Functionality", () => {
	describe('Get filter source', () => {
		it("Returns filter function and binds on data event to stream", done => {
			const get_filter_source = require("./get_filter_source.js");
			var stream = {
				on: ()=>{}
			}
			var filter_source = get_filter_source(stream);
			assert.equal(typeof filter_source, 'function');
			done();
		});
	});

	describe('Setup filter source', () => {
		const get_filter_source = require("./get_filter_source.js");
		const Rx = require('rx');
		var stream = {
			on: ()=>{}
		}
		var filter_source = get_filter_source(stream);
		var source = filter_source('putin');
		
		it("have to return instance of Rx Observable object", done => {
			assert.equal(source instanceof Rx.Observable, true);
			done();
		});
	});


	describe('Filtering tweet message', () => {
		const get_filter_source = require("./get_filter_source.js");
		
		it("subscription have to pass acceptable tweet [putin]", done => {
			var callback = null;
			var stream = {
				on: function(key,cb){
					if(key === 'data')
						callback = cb;
					return this;
				}
			}
			const filter_source = get_filter_source(stream);
			const source = filter_source('putin');

			source.subscribe(tweet => {
				assert.equal(tweet, fake_tweets.has_putin);
				done();
			});

			callback(fake_tweets.has_putin);
		});

		it("subscription have to pass acceptable tweet [hillary]", done => {
			var callback = null;
			var stream = {
				on: function(key,cb){
					if(key === 'data')
						callback = cb;

					return this;
				}
			}
			const filter_source = get_filter_source(stream);
			const source = filter_source('hillary');

			source.subscribe(tweet => {
				assert.equal(tweet, fake_tweets.has_hillary);
				done();
			});

			callback(fake_tweets.has_hillary);
		});


		it("subscription have to skip unacceptable tweets", done => {
			var callback = null;
			var count = 0;
			var stream = {
				on: function(key,cb){
					if(key === 'data')
						callback = cb;

					return this;
				}
			}

			const filter_source = get_filter_source(stream);
			const source = filter_source('putin');

			source.subscribe(tweet => {
				assert.equal(tweet, fake_tweets.has_putin);
				count++;

				if(count == 2)
					done();
			});

			callback(fake_tweets.has_hillary);
			callback(fake_tweets.no_one);
			callback(fake_tweets.has_putin);
			callback(fake_tweets.has_putin);
		});
	});

	describe('Zip filtered tweets', () => {
		const get_filter_source = require("./get_filter_source.js");
		const Rx = require('rx');

		it("zip sources", done => {
			var callback = null;
			var count = 0;
			var stream = {
				on: function(key,cb){
					if(key === 'data')
						callback = cb;
					return this;
				}
			}

			const filter_source = get_filter_source(stream);

			var source = Rx.Observable.zip(
				filter_source('putin'),
				filter_source('hillary')
			);

			source.subscribe(tweets => {
				var tp = tweets[0];
				var th = tweets[1];
				console.log('Authors:', tp.user.name.green + ',' , th.user.name.blue);
				console.log('Messages:');
				console.log('>>>', tp.text.green);
				console.log('<<<', th.text.blue);
				console.log('\n');
			});

			done();
		});

		it("test zipped event streams for acceptable", done => {
			var callbacks = [];
			var count = 0;
			var stream = {
				on: function(key,cb){
					if(key === 'data')
						callbacks.push(cb);
					return this;
				}
			}
			
			const filter_source = get_filter_source(stream);
			
			var source = Rx.Observable.zip(
				filter_source('putin'),
				filter_source('hillary')
			);

			source.subscribe(tweets => {
				var tp = tweets[0];
				var th = tweets[1];
				assert.equal(tp, fake_tweets.has_putin);
				assert.equal(th, fake_tweets.has_hillary);
				count++;
				if(count == 2)
					done();
			});

			callbacks.forEach(fn=>fn(fake_tweets.has_hillary));
			callbacks.forEach(fn=>fn(fake_tweets.no_one));
			callbacks.forEach(fn=>fn(fake_tweets.has_putin));
			callbacks.forEach(fn=>fn(fake_tweets.has_putin));
			callbacks.forEach(fn=>fn(fake_tweets.has_hillary));
		});
	});
});