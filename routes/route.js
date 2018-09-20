var cheerio = require("cheerio");
var request = require("request");
var rp = require('request-promise');
var mongoose = require("mongoose");

var db = require("../models");

mongoose.connect("mongodb://localhost/web-scraper", { useNewUrlParser: true });

module.exports = function (app) {

    app.get("/", function (req, res) {
        db.article.find({}).sort({_id: -1}).then(function (dbResponse) {

            var articlesObject = {};

            articlesObject.articleArray = dbResponse;

            res.render("index", articlesObject);
        })
            .catch(function (err) {
                console.log(err);
            });
    });


    app.get("/scrape", function (req, res) {
        rp("https://www.npr.org/sections/news/", function (error, response, html) {

            var $ = cheerio.load(html);

            console.log("Scrape Starting");
            $(".list-overflow article").each(function (i, element) {
                var result = {};

                result.title = $(this).find(".item-info h2 a").text();
                result.link = $(this).find(".item-info h2 a").attr("href");
                result.summary = $(this).find(".item-info .teaser").text();

                var imageLinkCheck = undefined;
                imageLinkCheck = $(this).find(".item-image .imagewrap a img").attr("src");

                if (imageLinkCheck !== undefined) {
                    result.imageLink = imageLinkCheck;
                };

                if (result.link !== undefined) {
                    db.article.findOne({ link: result.link }).then(function (dbArticle) {
                        if (dbArticle) {
                            console.log('Article already exists in database');
                        } else {
                            db.article.create(result).then(function (newArticle) {
                                console.log('New article added');
                            })
                                .catch(function (err) {
                                    console.log(err)
                                });
                        }
                    });
                }
            });
        })
            .then(function () {
                res.end();
            });
    });


    app.post("/article/:id", function (req, res) {
        console.log(req.params.id);
        db.note.create(req.body)
            .then(function (newNote) {
                return db.article.findOneAndUpdate({ _id: req.params.id }, {$push: { note: newNote._id }}, { new: true });
            }).then(function (dbArticle) {
                res.json(dbArticle);
            })
            .catch(function (err) {
                res.json(err);
            });
    });
    app.get("/article/:id", function(req, res) {
        db.article.findOne({_id: req.params.id})
        .populate("note")
        .then(function(dbArticle) {
            res.json(dbArticle);
        })
        .catch(function(err) {
            res.json(err);
        });
    });
    app.delete("/note/:id", function(req, res) {
        db.note.deleteOne({_id: req.params.id})
        .then(function() {
            res.json('Note removed');
        })
        .catch(function(err) {
            res.json(err);
        });
    });

};