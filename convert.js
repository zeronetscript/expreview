"use strict"
var fs = require("fs")
var jsonfile = require("jsonfile")
var FeedParser = require('feedparser');
var request = require('request')

var feedparser = new FeedParser();




var old_data = jsonfile.readFileSync("data.json");


function alreadyHave(title){

  for (var i in old_data.post){
    if(old_data.post[i].title==title){
      return true;
    }
  }

  return false;

}

function toUTC(date_object){

  return date_object.getTime()/1000 + 8*60*60;
}


var req = request("http://www.expreview.com/rss.php");


var changed = false;

feedparser.on('readable',function(){

  var stream = this;
  var article;

  while(article=stream.read()){
    if(alreadyHave(article.title)){
      console.log("skip "+article.title);
      continue;
    }

    changed = true;
    var post = {
      'post_id': old_data.next_post_id,
      'title':article.title,
      'date_published': toUTC(new Date(article.pubdate)),
      'body':"---\n"+article.description
    };

    console.log("add:"+article.title);

    old_data.post.unshift(post);

    if (!old_data.tag) {
      old_data.tag=[]
    }

    var categories=article.categories;
    for(var i in categories){
      old_data.tag.push({value:categories[i],post_id:post.post_id});
    }

    old_data.next_post_id = old_data.next_post_id+1;

  }




});

feedparser.on('end',function(){

  if (!changed) {
    console.log("unchanged");
    return;
  }

  for (var i in old_data.post){
    if (old_data.post[i].post_id==183) {
      old_data.post[i].date_published = new Date().getTime()/1000;
    }
  }

  old_data.modified = (new Date).getTime()/1000;
  jsonfile.writeFileSync('new_data.json',old_data,{spaces:2});
  console.log("write new file to new_data.json");
});


req.on('response',function(res){
	    if (res.statusCode!=200) {
		    console.log(thisOne.name+" error done");
		    return;
	    }

	    res.pipe(feedparser);
    });
