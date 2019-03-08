const pgp = require('pg-promise')();
const db = pgp('postgres://db2user:leftovers@db2.cvyqrq8vd48c.us-west-1.rds.amazonaws.com:5432/db2');
const express = require('express')
var session = require('express-session')
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false});
const app = express();
app.set('port', (process.env.PORT || 3000))
app.use(express.static(__dirname + '/public'))
app.use(session({secret:"supersecretstring123",resave:false,saveUninitialized:true}));
var path = require("path");
require("jsdom/lib/old-api").env("", function(err, window) {
    if (err) {
        console.error(err);
        return;
    }
 
    var $ = require("jquery")(window);
});



//USERPOST DATA
app.get('/data/pagePost/:nid', function(request, response) {

	db.any('SELECT * FROM "PAGE_POST" WHERE "User_ID" = '+request.params.nid+' ORDER BY "Post_ID" DESC')
		.then(function(data) {
			console.log(data[0]);
			response.send(data);
		})
		.catch(error => {
			console.log('err');
		});
})
//user comments data 
app.get('/data/userComment/:nid', function(request, response) {
  
  db.any('SELECT * FROM "COMMENT" WHERE "Post_ID" = '+request.params.nid+' ORDER BY "Comment_ID" DESC')
    .then(function(data) {
	//console.log(data[0]);
	response.send(data);
    })
    .catch(error => {
        console.log('err');
    }); 
})


//userpostComment data
app.get('/data/postComment/:nid', function(request, response) {

	db.any('SELECT * FROM "PAGE_POST" WHERE "Post_ID" = '+request.params.nid)
		.then(function(data) {
			response.send(data);
		})
		.catch(error => {
			console.log('err');
		});
})



//AllComicDATA
app.get('/data/comics', function(request, response) {

	db.any('SELECT "Comic_ID", "Image" FROM "COMIC" ORDER BY "Comic_ID" DESC')
		.then(function(data) {
			response.send(data);
		})
		.catch(error => {
			console.log('err');
		});
})





//NEWSFEED DATA
app.get('/data/newsfeed', function(request, response) {
  
  db.any('SELECT * FROM "NEWS_FEED" ORDER BY "Feed_ID" DESC')
    .then(function(data) {
	//console.log(data[0]);
	response.send(data);
    })
    .catch(error => {
        console.log('err');
    }); 
})

//NEWSFEED COMMENTS DATA
app.get('/data/newsfeed/:nid', function(request, response) {
  
  db.any('SELECT * FROM "COMMENT" WHERE "Feed_ID" = '+request.params.nid+' ORDER BY "Comment_ID" DESC')
    .then(function(data) {
	//console.log(data[0]);
	response.send(data);
    })
    .catch(error => {
        console.log('err');
    }); 
})

//RETRIEVE RAW COMIC DATA
var comicData;
app.get('/data/:id', function(request, response) {
  
  db.one('SELECT * FROM "COMIC" WHERE "Comic_ID" = '+request.params.id)
    .then(function(data) {
        console.log(JSON.stringify(data));
	//comicData = JSON.parse(JSON.stringify(data));
	response.send(data);
    })
    .catch(error => {
        console.log('err');
    });
  
})

//AUTHOR DATA
var aid;
var list2= [];
var limit;
app.get('/data/author/:cid', function(req,res){
	db.any('SELECT * FROM "AUTHOR_WORKS" WHERE "Comic_ID" = '+req.params.cid)
		.then(function(data) {
			aid = JSON.parse(JSON.stringify(data));
			limit=aid.length;
			list2=[];
			aid.forEach(function(item, index){
				db.one('SELECT * FROM "AUTHOR" WHERE "Author_ID" = '+item.Author_ID)
					.then(function(dat) {
        					list2.push(dat);
						if(list2.length==limit){
							res.send(JSON.stringify(list2));
						}
   					})
    					.catch(error => {
        					console.log('err');
    					});
			});
   		})
    		.catch(error => {
        		console.log('err');
    		});

});

//ILLUSTRATOR DATA
var iid;
var list3=[];
var limit2;
app.get('/data/illustrator/:cid', function(req,res){
	db.any('SELECT * FROM "ILLUSTRATED_WORKS" WHERE "Comic_ID" = '+req.params.cid)
		.then(function(data) {
			iid = JSON.parse(JSON.stringify(data));
			console.log(iid);
			limit2=iid.length;
			list3=[];
			iid.forEach(function(item, index){
				
				db.one('SELECT * FROM "ILLUSTRATOR" WHERE "Illustrator_ID" = '+item.Illustrator_ID)
					.then(function(dat) {
						list3.push(dat);
						if(list3.length==limit2){
							res.send(JSON.stringify(list3));
						}
   					})
    					.catch(error => {
        					console.log('err');
    					});

			});
   		})
    		.catch(error => {
        		console.log('err');
    		});

});

//COLOURIST DATA
var colid;
var list=[];
var limit3;
app.get('/data/colourist/:cid', function(req,res){
	db.any('SELECT * FROM "COLORIST_WORKS" WHERE "Comic_ID" = '+req.params.cid)
		.then(function(data) {
			colid = JSON.parse(JSON.stringify(data));
			console.log(colid);
			limit3=colid.length;
			list=[];
			colid.forEach(function(item, index){
				
				db.one('SELECT * FROM "COLORIST" WHERE "Colorist_ID" = '+item.Colorist_ID)
					.then(function(dat) {
						list.push(dat);
						if(list.length==limit3){
							res.send(JSON.stringify(list));
						}
   					})
    					.catch(error => {
        					console.log('err');
    					});

			});
   		})
    		.catch(error => {
        		console.log('err');
    		});

});

//USER AUTHENTICATION/LOGIN
app.post('/auth', urlencodedParser, function (req, res){
	console.log(req.body);
	var email="'"+req.body.email+"'";
	var pw=req.body.pass;
	db.one('SELECT * FROM "STANDARD_ACCOUNT" WHERE "Email" = '+email)
		.then(function(userdat){
			console.log(userdat);
			if (userdat.Password==pw){
				req.session.user = userdat
				console.log('success!');
				res.redirect('/users/'+(req.session.user).User_ID);
			} else {
				console.log('bad combo');
				res.send('bad combo');
			}
		})
		.catch(error => {
			console.log('error');
			res.send('bad combo');
		
		});
});

//AM i LOGGED IN? WHO AM i?
app.get('/check', function(req, res){
	if(req.session.user){
		var obj = req.session.user;
		var string = '{"UserName": "';
		string += obj.UserName;
		string += '", "User_ID":';
		string += obj.User_ID;
		string += ', "Rank":"';
		string += obj.Rank+'"}';
		res.send(string);
	} else {
		res.send("no");
	}
});

//LOGOUT
app.get('/logout', function(req, res){
	req.session.user = null;
	res.redirect('/login');
});

//SIGN UP PROCESSING
app.post('/signup', urlencodedParser, function (req, res){
	if(req.body.pass==req.body.cpass){
		var fn="'"+req.body.fname+"'";
		var ln="'"+req.body.lname+"'";
		var email="'"+req.body.email+"'";
		var pass="'"+req.body.pass+"'";
		var un="'"+req.body.username+"'";
		var rank="'User'";
		var query='INSERT INTO "STANDARD_ACCOUNT" ("FirstName", "LastName", "Email", "Password", "UserName", "Rank") VALUES (' + fn + ',' + ln + ',' + email+ ',' + pass + ',' + un + ',' + rank + ')'
		console.log(query);
		db.one(query+'RETURNING *')
			.then(function(data){
				console.log('new user created: '+data.User_ID);
				req.session.user = data;
				res.redirect('/users/'+(req.session.user).User_ID);
				
 			})
		    	.catch(error => {
				console.log('could not insert user');
    			});
	} else {
		res.send('passwords do not match.');
	}
});

//SIGN UP PAGE
app.get('/signup', function(req,res){
	if (!req.session.user){
		res.sendFile(path.join(__dirname+'/signup.html'));
	} else {
		res.send("You are already logged in.");
	}
});

//HOME PAGE/NEWS FEED
app.get('/', function(req,res){
	if (!req.session.user){
		res.sendFile(path.join(__dirname+'/newsFeed.html'));
	} else if((req.session.user).Rank == "Admin"){
		res.sendFile(path.join(__dirname+'/ADMINnewsFeed.html'));
	} else {
		res.sendFile(path.join(__dirname+'/LInewsFeed.html'));
	}
});

//MAKE NEWSFEED POST
app.post('/', urlencodedParser, function(req,res){
	var title="'"+req.body.title+"'";
	var body="'"+req.body.btext+"'";
	var synopsis="'"+req.body.synopsis+"'";
	var image="'"+req.body.image+"'";
	var d = new Date();
	var timeOfPost = "'"+ (d.getUTCMonth()+1) +"/"+ d.getUTCDate() +"/"+ d.getUTCFullYear() +" - "+ addZero(d.getUTCHours()) +":"+ addZero(d.getUTCMinutes()) +"'";
	var query = 'INSERT INTO "NEWS_FEED" ("User_ID", "Title", "DateTime", "Content", "Image", "ThumbsUp", "ThumbsDown", "Comments", "MoreInfo") VALUES (' 
	+ (req.session.user).User_ID + ', ' + title + ', ' + timeOfPost + ', ' + image + ', ' + synopsis + ', 0, 0, 0,' + body +') RETURNING *';
	console.log(query);
	db.one(query)
		.then(function(data){
			console.log('new post created: '+data.Feed_ID);
			res.redirect(req.originalUrl);
				
 		})
		.catch(error => {
			console.log('error creating post');
    		});
});



//MAKE USERPAGE POST
app.post('/users/:uid', urlencodedParser, function(req,res){
	var title="'"+req.body.title+"'";
	var body="'"+req.body.btext+"'";
	var image="'"+req.body.image+"'";
	var d = new Date();
	var timeOfPost = "'"+ (d.getUTCMonth()+1) +"/"+ d.getUTCDate() +"/"+ d.getUTCFullYear() +" - "+ addZero(d.getUTCHours()) +":"+ addZero(d.getUTCMinutes()) +"'";
	var query = 'INSERT INTO "PAGE_POST" ("User_ID", "Title", "DateTime", "Content", "Image", "ThumbsUp", "ThumbsDown", "Comments") VALUES (' 
	+ (req.session.user).User_ID + ', ' + title + ', ' + timeOfPost + ', ' + body + ', ' +image+', 0, 0, 0 ) RETURNING *';
	console.log(query);
	db.one(query)
		.then(function(data){
			console.log('new post created: '+data.Post_ID);
			res.redirect(req.originalUrl);
				
 		})
		.catch(error => {
			console.log('error creating post');
    		});
});








//NEWSFEED UPVOTE
app.post('/upvote/:fid', urlencodedParser, function(req,res){
	var uQuery='UPDATE "NEWS_FEED" SET "ThumbsUp" = "ThumbsUp"+1 WHERE "Feed_ID" = '+req.params.fid;
	var dQuery='UPDATE "NEWS_FEED" SET "ThumbsDown" = "ThumbsDown"+1 WHERE "Feed_ID" = '+req.params.fid;
	if(!req.session.user){
		res.redirect('/login');
		return;
	}else if(req.body.action=="up"){
		console.log("up"+req.params.fid);
		db.none(uQuery)
			.then(function(dat){
					console.log('upvote count incremented');
				})
				.catch(error=> {
					console.log('error incrementing comment count');
			});
	} else if(req.body.action=="down") {
		console.log("down"+req.params.fid);
		db.none(dQuery)
			.then(function(dat){
					console.log('downvote count incremented');
				})
				.catch(error=> {
					console.log('error incrementing comment count');
			});
	} else {
		console.log("failure");
	}
	res.redirect('/');
});

//NEWSFEED COMMENTS PAGE
app.get('/newsComment/:id', function(req,res){
	if(!req.session.user){
		res.sendFile(path.join(__dirname+'/newsComment.html'));
	} else {
		res.sendFile(path.join(__dirname+'/LInewsComment.html'));
	}
});


//userPost comments page
app.get('/userComment/:id', function(req,res){
	if(!req.session.user){
		res.sendFile(path.join(__dirname+'/userComment.html'));
	} else {
		res.sendFile(path.join(__dirname+'/LIuserComment.html'));
	}
})




//for date formatting, 00:00
function addZero(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

//COMMENT ON NEWSFEED POST
app.post('/newsComment/:id/', urlencodedParser, function(req,res){

	var comment = "'"+req.body.Content+"'";
	var d = new Date();
	var timeOfComment = "'"+ (d.getUTCMonth()+1) +"/"+ d.getUTCDate() +"/"+ d.getUTCFullYear() +" - "+ addZero(d.getUTCHours()) +":"+ addZero(d.getUTCMinutes()) +"'";
	var query = 'INSERT INTO "COMMENT" ("User_ID", "Feed_ID", "DateTime", "Content") VALUES (' + (req.session.user).User_ID + ', ' + req.params.id + ', ' + timeOfComment + ', ' + comment + ') RETURNING *'
	console.log(query);
	var updateQuery='UPDATE "NEWS_FEED" SET "Comments" = "Comments"+1 WHERE "Feed_ID" = '+req.params.id;
	console.log(updateQuery);
	db.one(query)
		.then(function(data){
			console.log('new comment created: '+data.User_ID);
			db.none(updateQuery)
				.then(function(dat){
					console.log('comment count incremented');
				})
				.catch(error=> {
					console.log('error incrementing comment count');
			});
			res.redirect(req.originalUrl);
				
 		})
		.catch(error => {
			console.log('error creating comment');
    		});
});


//COMMENT ON Userpage POST
app.post('/userComment/:id', urlencodedParser, function(req,res){

	var comment = "'"+req.body.Content+"'";
	var d = new Date();
	var timeOfComment = "'"+ (d.getUTCMonth()+1) +"/"+ d.getUTCDate() +"/"+ d.getUTCFullYear() +" - "+ addZero(d.getUTCHours()) +":"+ addZero(d.getUTCMinutes()) +"'";
	var query = 'INSERT INTO "COMMENT" ("User_ID", "Post_ID", "DateTime", "Content") VALUES (' + (req.session.user).User_ID + ', ' 
	+ req.params.id + ', ' + timeOfComment + ', ' + comment + ') RETURNING *'
	console.log(query);
	var updateQuery='UPDATE "PAGE_POST" SET "Comments" = "Comments"+1 WHERE "Post_ID" = '+req.params.id;
	console.log(updateQuery);
	db.one(query)
		.then(function(data){
			console.log('new comment created: '+data.User_ID);
			db.none(updateQuery)
				.then(function(dat){
					console.log('comment count incremented');
				})
				.catch(error=> {
					console.log('error incrementing comment count');
			});
			res.redirect(req.originalUrl);
				
 		})
		.catch(error => {
			console.log('error creating comment');
    		});
});



//COMIC PAGE
app.get('/comic/:cid',function(req,res){
	if(!req.session.user){
		res.sendFile(path.join(__dirname+'/comicPage.html'));
	} else {
		res.sendFile(path.join(__dirname+'/LIcomicPage.html'));
	}
});

//ComicResults page
app.get('/comics', function(req,res){
	if (!req.session.user){
		res.sendFile(path.join(__dirname+'/comicResults.html'));
	} else {
		res.sendFile(path.join(__dirname+'/LIcomicResults.html'));
	}
});










//LOGIN PAGE
app.get('/login', function(req,res){
	if (!req.session.user){
		res.sendFile(path.join(__dirname+'/login.html'));
	} else {
		//res.send("You are already logged in as: "+(req.session.user).UserName);
		res.redirect('/users/'+(req.session.user).User_ID);
	}
});

//USER DATA
app.get('/data/users/:uid', function(req,res){
	db.one('SELECT * FROM "STANDARD_ACCOUNT" WHERE "User_ID" = '+req.params.uid)
		.then(function(data) {
        		console.log(JSON.stringify(data));
			res.send(data)
    		})
    		.catch(error => {
        		console.log('err');
    	});
})

//USER PROFILE
app.get('/users/:uid', function(req,res){
	
	if(!req.session.user) {
		res.sendFile(__dirname+'/userProfile.html');
	} else {
		res.sendFile(__dirname+'/LIuserProfile.html');
	}
});


//MY PROFILE
app.get('/me', function(req,res){
	if(!req.session.user){
		res.redirect('/login');
	} else {
		//res.sendFile(__dirname+'/myProfile.html');
		res.redirect('/users/'+(req.session.user).User_ID);
	}
});

//FOLLOW/UNFOLLOW USERS
app.post('/follow/:uid', urlencodedParser, function(req,res){
	if(!req.session.user){
		res.redirect('/login');
	} else {
		var follower = (req.session.user).User_ID;
		if(req.body.action == "follow"){
			var query = 'INSERT INTO "FOLLOWERS_FOLLOWEES" ("Follower_ID", "Followee_ID") VALUES ('+follower+', '+req.params.uid+') RETURNING *';
			db.none(query)
				.then(function(data) {
					res.redirect('/users/'+req.params.uid);
				})
				.catch(error => {
					res.redirect('/users/'+req.params.uid);
				});
		} else if(req.body.action == "unfollow"){
			db.none('DELETE FROM "FOLLOWERS_FOLLOWEES" WHERE "Follower_ID" = '+follower+' AND "Followee_ID" = '+ req.params.uid)
				.then(function(data) {
					res.redirect('/users/'+req.params.uid);
				})
				.catch(error => {
					res.redirect('/users/'+req.params.uid);
				});
		} else {
			res.redirect('/users/'+req.params.uid);
		}
	}
});

//FOLLOWER CHECK
app.get('/data/follow/:fid', function(req,res){
	if(!req.session.user){
		res.redirect('/login');
	} else{
		db.any('SELECT * FROM "FOLLOWERS_FOLLOWEES" WHERE "Follower_ID" = '+(req.session.user).User_ID+' AND "Followee_ID" = '+req.params.fid)
			.then(function(data){
				console.log(data);
				if(data.length==0){
					res.send("false");
				} else {
					res.send("true");
				}
			})
			.catch(error => {
				res.send("false");
			});
	}
});

//SEARCH QUERY RETRIEVAL
app.post('/search' , urlencodedParser, function(req,res){
	console.log(req.body.query);
	req.session.query=req.body.query;
	if(!req.session.user){
		res.sendFile(__dirname+'/searchResult.html');
	} else {
		res.sendFile(__dirname+'/LIsearchResult.html');
	}
});

//SEARCH DATA RETRIEVAL
app.get('/searchdata', function (req, res){
	if(req.session.query){
	var keywords="'%"+req.session.query+"%'";
	console.log(keywords);
	var query ='SELECT "Comic_ID", "Image" FROM "COMIC" WHERE LOWER("Title") LIKE LOWER(' + keywords + ') OR LOWER("ComicName") LIKE LOWER(' + keywords + ')';
	query += ' OR LOWER("PublisherName") LIKE LOWER(' + keywords + ')';
	query += ' OR LOWER("Synopsis") LIKE LOWER(' + keywords + ')';
	query += ' OR LOWER("SpoilerFreeDescription") LIKE LOWER(' + keywords + ')';
	db.task(t => {
		return t.one('SELECT "CHARACTERS"."Character_ID" FROM "CHARACTERS" WHERE LOWER("CharacterName") LIKE LOWER(' + keywords + ')')
			.then(char => {
				return t.multi('SELECT "COMIC"."Comic_ID", "COMIC"."Image" FROM "CHARACTER_SHEET", "COMIC" WHERE "COMIC"."Comic_ID" = "CHARACTER_SHEET"."Comic_ID" AND "CHARACTER_SHEET"."Character_ID" = '+ char.Character_ID, query);
			})
			.catch(error => {
				return t.multi(query);
			});
	})
	.then(data => {
		res.send(JSON.stringify(data[0]));
	})
	.catch(error => {
		console.log("error")
	});
	}
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
