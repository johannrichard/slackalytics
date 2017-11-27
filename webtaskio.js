// Slack will send a request for each message sent on any or a specific channel.
// In order for the webtask (http://webtask.io) to run properly, you have to define 
// two variables in your webtask.io:

// SLACK_TOKEN (As a key:value pair "Secrets", take this from your Slack integration)
// GOOGLE_ANALYTICS_UAID (As a key:value pair in "Meta", take this from your Google Analytics account)

var request = require('request');
var qs = require('querystring');

module.exports = function (req, done) {
  if(req.secrets.SLACK_TOKEN != req.body.token) {
    done('Invalid Token', null);
  }
	var channel = {
		id: 	req.body.channel_id,
		name: 	req.body.channel_name
	};
	var user = {
		id: 	req.body.user_id
	};
	var msgText = req.body.text;
	var teamDomain = req.body.team_domain;


	function searchM(regex){
		var searchStr = msgText.match(regex);
		if(searchStr !== null){
			return searchStr.length;
		}
		return 0;
	}

	function searchS(regex){
		var searchStr = msgText.split(regex);
		if(searchStr !== undefined){
			return searchStr.length;
		}
		return 0;
	}


	var wordCount = searchS(/\s+\b/);
	var emojiCount = searchM(/:[a-z_0-9]*:/g);
	var exclaCount = searchM(/!/g);
	var questionMark = searchM(/\?/g);
	var elipseCount = searchM(/\.\.\./g);


	//Structure Data
	var data = {
		v: 		1,
		tid: 	req.meta.GOOGLE_ANALYTICS_UAID,
		cid: 	user.id,
		ds:  	"slack", //data source
		cs: 	"slack", // campaign source
		cd1: 	user.id,
		cd2: 	channel.name,
		cd3: 	msgText,
		cm1: 	wordCount,
		cm2: 	emojiCount,
		cm3: 	exclaCount,
	//	cm4: 	letterCount,
		cm5: 	elipseCount, 
		cm6: 	questionMark, //need to set up in GA
		dh:		teamDomain+".slack.com",
		dp:		"/"+channel.name,
		dt:		"Slack Channel: "+channel.name,
		t: 		"event",
		ec: 	"slack: "+ channel.name + "|" + channel.id,
		ea: 	"post by " + user.id,
		el: 	msgText,
		ev: 	1 
	};
	console.log(JSON.stringify(data));
	console.log(req.body);
	//Make Post Request	
	request.post("https://www.google-analytics.com/collect?" + qs.stringify(data), 
		function(error, resp, body){
		console.log(error);
	})
	
	// Return nothing, otherwise the Webhook might be auto-triggered again
	done(null, null);
};
