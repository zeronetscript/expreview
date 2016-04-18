"use strict"
var feed = require("feed-read");
var fs = require("fs")
var jsonfile = require("jsonfile")





var old_data = jsonfile.readFileSync("old_data.json");

var next_post_id = old_data.next_post_id;

function alreadyHave(title){

    for (var i in old_data.post){
        if(old_data.post[i].title==title){
            return true;
        }
    }

    return false;

}


feed("http://www.expreview.com/rss.php", function(err, articles) {


    var json_obj={
        "title": "ZeroBlog",
        "description": "Demo for decentralized, self publishing blogging platform.",

        "links": "- [Create new blog](?Post:3:How+to+have+a+blog+like+this)\n\n- [How does ZeroNet work?](?Post:34:Slides+about+ZeroNet)\n- Site development tutorial: [Part1](?Post:43:ZeroNet+site+development+tutorial+1), [Part2](?Post:46:ZeroNet+site+development+tutorial+2)\n- [ZeroNet documents](http://zeronet.readthedocs.org/)\n- [Source code](https://github.com/HelloZeroNet)"
    };


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


    for(var i in old_first){
        var artical = articles[i];

        if(alreadyHave(artical.title)){
            continue;
        }

        changed = true;

        post = {
            'post_id': old_data.next_post_id,
            'title':artical.title,
            'date_published': (new Date(artical.pubDate)).getTime(),
            'body':artical.content
        };

        old_data.post.unshift(post);

        old_data.next_post_id = old_data.next_post_id+1;
    }

    if (changed) {
        old_data.modified = (new Date).getTime();
    }

    jsonfile.writeFileSync('new_data.json',old_data,{spaces:2});
});
