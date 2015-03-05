/**
 * Created by mac on 2/23/15.
 */
var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var async = require('async');

require('./movies');
require('./genres');
var mongoose = require('mongoose');
var Movie = mongoose.model('Movie');
var Genre = mongoose.model('Genre');
var tmdb = require('moviedb')('ac16918a1af4a39ca7b490be17f2ea78');
var mongodb = mongoose.connect('mongodb://localhost/moviedb');
var app = express();

var enableCORS = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', req.headers.origin); // allow anyone for now
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Credentials', '*');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
        res.send(200);
    }
    else {
        next();
    }
};

app.use(enableCORS);


function sleep(time) {
    var stop = new Date().getTime();
    while(new Date().getTime() < stop + time) {
        ;
    }
}

function checkempty(str){
    if(typeof(str) !== "undefined") {
        if (str.length > 0 && str !== null) {
            return true;
        }
    }
    return false;

}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function parseCSV (str) {
    var arr = [];
    var quote = false;
    if(str.length <=0 || typeof(str) === "undefined" || str === null){
        console.log("Null or empty or undefined string");
        //Need to check if the error message needs to be sent to the response or not
        return false;

    }
    for (var row = 0,col = 0,c = 0; c < str.length; c++) {
        var cc = str[c], nc = str[c+1];
        arr[row] = arr[row] || [];
        arr[row][col] = arr[row][col] || '';

        if (cc === '"' && quote && nc === '"') { arr[row][col] += cc; ++c; continue; }
        if (cc === '"') { quote = !quote; continue; }
        if (cc === ',' && !quote) { ++col; continue; }
        if (cc === '\n' && !quote) { ++row; col = 0; continue; }

        arr[row][col] += cc;
    }
    return arr[0];
};

function combineParams(arr){
    var combined = arr.reduce(function(previousValue, currentValue, index, array) {
        return previousValue + currentValue+'|';
    }, "");
    return combined.trimRight();

}

app.get('/getRecommendation', function(req, res){

    async.parallel({
            getGenres: function (callback) {
                if(checkempty(req.query.genres) === true){
                    var csvArr = parseCSV(req.query.genres);
                    //                console.log(csvArr);
                    Genre.find({name: {$in: csvArr } }, function (err, genres) {
                        var genresId = genres.map(function (genre) {
                            return genre.id;
                        });
                        callback(null, genresId.toString());
                    });
                }
                else{
                    callback(null, '');
                }

            },
            getActor: function (outercallback) {
                if(checkempty(req.query.actors) === true) {
                    var actors = parseCSV(req.query.actors);
                    //                console.log(actors);
                    var actorsArr = [];

                    async.each(actors, function (actor, innercallback) {
                        tmdb.searchPerson({query: actor }, function (err, resp) {
                            actorsArr.push(resp.results[0]);
                            innercallback();
                        });

                    }, function (err) {
                        // if any of the file processing produced an error, err would equal that error
                        if (err) {
                            // One of the iterations produced an error.
                            // All processing will now stop.
                            console.log('An actor failed to process:' + err);
                        } else {
                            //                        console.log(JSON.stringify(actorsArr, null, 4));
                            var actorsId = actorsArr.map(function (actor) {
                                return actor.id;
                            });
                            //                                                console.log(actorsId.toString());

                            outercallback(null, actorsId.toString());
                            //                        console.log(JSON.stringify(actorsId));
                        }
                    });
                }
                else{
                    outercallback(null, '');
                }


            },
            getKeywords: function (outercallback) {

                if(checkempty(req.query.actors) === true) {
                    var keywords = parseCSV(req.query.keyword);
                    var keywordsArr = [];

                    async.each(keywords, function (keyword, innercallback) {
                        tmdb.searchKeyword({query: keyword }, function (err, resp) {
                            keywordsArr.push(resp.results[0]);
                            console.log(JSON.stringify(resp, null, 4));

                            innercallback();
                        });

                    }, function (err) {
                        // if any of the file processing produced an error, err would equal that error
                        if (err) {
                            // One of the iterations produced an error.
                            // All processing will now stop.
                            console.log('An actor failed to process:' + err);
                        } else {

                            var keywordsId = keywordsArr.map(function (keyword) {
                                return keyword.id;
                            });
//                            console.log(keywordsId.toString());

                            outercallback(null, keywordsId.toString());
//                        console.log(JSON.stringify(actorsId));
                        }
                    });
                }
                else{
                    outercallback(null, '');
                }

            }


        },
        function(err, results) {
            console.log(results);
                            console.log("release_date.gte:"+ req.query.era_start + " release_date.lte :" +  req.query.era_end+ " with_people:" + results.getActor + " with_genres:" + results.getGenres + "with_keyword:" + results.getKeywords);
                tmdb.discoverMovie({"release_date.gte": req.query.era_start, "release_date.lte": req.query.era_end, "with_people":results.getActor, "with_genres":results.getGenres, "with_keyword":results.getKeywords}, function(err, resp){
//                    tmdb.movieInfo({id: resp.results[0].id}, function(err, movieInfo){
//                        console.log(movieInfo);
//                        movieInfo.poster_path = 'http://image.tmdb.org/t/p/original'+movieInfo.poster_path;
//                        res.json(movieInfo);
//                    });
                    res.json(resp);

                });

            // results is now equals to: {one: 1, two: 2}
    });


//    console.log(parseCSV(req.query.genres));
//    var csvArr = parseCSV(req.query.genres);
//    Genre.find({name:{$in: csvArr } }, function (err, genres) {
//        console.log(genres);
//        var genresId = genres.map(function (genre){
//            return genre.id;
//        });
//        console.log(genresId.toString());
//
//        tmdb.searchPerson({query:req.query.actor},function(err, resp){
//            var actorId = resp.results[0].id;
//            console.log(resp.results[0].id);
//
//            tmdb.searchKeyword({query:req.query.keyword}, function(err, resp){
//                var keywordId = resp.results[0].id;
//                console.log(resp);
//                console.log("release_date.gte:"+ req.query.era_start + " release_date.lte :" +  req.query.era_end+ " with_people:" + actorId+ " with_genres:" + genresId.toString());
//                tmdb.discoverMovie({"release_date.gte": req.query.era_start, "release_date.lte": req.query.era_end, "with_people":actorId, "with_genres":genresId.toString(), "with_keyword":keywordId }, function(err, resp){
////                    console /.log(resp);
//                    tmdb.movieInfo({id: resp.results[0].id}, function(err, movieInfo){
//                        console.log(movieInfo);
//                        movieInfo.poster_path = 'http://image.tmdb.org/t/p/original'+movieInfo.poster_path;
//                        res.json(movieInfo);
//                    });
//
//                });
//            });
//        });
//
//    });
//    res.send(200);

});

app.get('/getGenres', function(req, res){
    tmdb.genreList(function(err, resp){
        resp.genres.forEach(function(genre){
            var genreObj = new Genre();
            genreObj.id = genre.id;
            genreObj.name = genre.name;
            genreObj.save(function(err, newGenre) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Genre saved : "+newGenre.name);
                }
            });
        });

    });
    res.send(200);


});

var server = app.listen(3000, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port)

});



