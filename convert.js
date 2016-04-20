"use strict"
var feed = require("feed-read");
var fs = require("fs")
var jsonfile = require("jsonfile")





var old_data = jsonfile.readFileSync("data.json");

var next_post_id = old_data.next_post_id;

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


feed("http://www.expreview.com/rss.php", function(err, articles) {

    if (err) throw err;
    // Each article has the following properties:
    // 
    //   * "title"     - The article title (String).
    //   * "author"    - The author's name (String).
    //   * "link"      - The original article link (String).
    //   * "content"   - The HTML content of the article (String).
    //   * "published" - The date that the article was published (Date).
    //   * "feed"      - {name, source, link}
    // 
    //

    var old_first = articles.reverse();

    var changed = false;


    //temp remove first one 
    var siteNotice = old_data.post[0];
    old_data.post.splice(0,1);
    old_data.next_post_id --;

    for(var i in old_first){
        var article = articles[i];

        if(alreadyHave(article.title)){
            continue;
        }

        var changed = true;

        var post = {
            'post_id': old_data.next_post_id,
            'title':article.title,
            'date_published': toUTC(new Date(article.published)),
            'body':article.content
        };

        console.log("add:"+article.title);

        old_data.post.unshift(post);

        old_data.next_post_id = old_data.next_post_id+1;
    }

    siteNotice.post_id=old_data.next_post_id;
    siteNotice.date_published=(new Date).getTime()/1000;
    old_data.post.unshift(siteNotice);
    old_data.next_post_id++;

    if (changed) {
        old_data.modified = (new Date).getTime()/1000;
        jsonfile.writeFileSync('new_data.json',old_data,{spaces:2});
        console.log("write new file to new_data.json");
    }else{
        console.log("unchanged");
    }

});
