/**
 * Created by mac on 2/23/15.
 */
var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var Promise = require ('bluebird');


require('./models/movies');
require('./models/genres');
require('./models/keywords');
require('./models/actors');
var mongoose = require('mongoose');
var Genre = Promise.promisifyAll(mongoose.model('Genre'));
var Movie = mongoose.model('Movie');
var Keyword = mongoose.model('Keyword');
var Actor = mongoose.model('Actor');
//var Genre = mongoose.model('Genre');
var tmdb = Promise.promisifyAll(require('moviedb')(['ac16918a1af4a39ca7b490be17f2ea78', '9dae15b604f445963788ff49473649ed']));
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

function getGenresId(genres){
    var genresArr = parseCSV(genres);
    return Genre.findAsync({name: {$in: genresArr } }).then(function (genres){
        var genresId = genres.map(function (genre) {
            return genre.id;
        });
        return genresId.toString();

    });

}

function getActorsId(actors){
    var actorsArr = parseCSV(actors);
//    var actorsArr = [];

   return Promise.map(actorsArr, function(actor) {
        return tmdb.searchPersonAsync({query: actor }).then(function (actorData){
//            console.log(actorData);
            return actorData.results[0];
        });
    }).reduce(function(a, b){
        return a.concat(b.id);
    },[]).then(function(actorsIds){
        return actorsIds.toString();
    });
}

function getKeywordsId(keywords){
    var keywordsArr = parseCSV(keywords);

    return Promise.map(keywordsArr, function(keyword) {
        return tmdb.searchKeywordAsync({query: keyword }).then(function (keywordData){
            return keywordData.results[0];
        });
    }).reduce(function(a, b){
        return a.concat(b.id);
    },[]).then(function(keywordIds){
        return keywordIds.toString();
    });

}

app.get('/autocompleteKeywords', function(req, res){
    var regex ;
    var options;

    if(req.query.regex ===""){
        regex = '';
        options = {};
    }
    else{
        regex = '(\\b'+ req.query.regex + ')\\w*';
        options = {
            skip: 0,
            limit: 10,
            sort: {
                id:1
            }
        };
    }

    var fields ="-_id -__v";
    console.log(regex);
    Keyword.find({name: {$regex : regex, $options: 'ig'} },fields,options, function(err, keywords){
        console.log(keywords);
        if(err){
            res.send(404);
        }
        console.log(keywords.length);
        var response = {};
        response.results = keywords;
        res.json(response);
    });


});

app.get('/autocompleteActors', function(req, res){
//    var regex = req.query.regex;
    var regex = '(\\b'+ req.query.regex + ')\\w*';
    var fields ="-_id -__v";
    console.log(regex);
    Actor.find({name: {$regex : regex, $options: 'ig'} },fields,{
            skip: 0,
            limit: 10,
            sort: {
                popularity:-1,
                id:1
            }
        }, function(err, actors){
//        console.log(actors);
        if(err){
            res.send(404);
        }
        var response = {};
        response.results = actors;
        res.json(response);
    });


});

app.get('/autocompleteGenres', function(req, res){
    var fields ="-_id -__v";
    if(req.query.regex === ""){
        Genre.find({} ,fields, function(err, genres){
            if(err){
                res.send(404);
            }
            var response = {};
            response.results = genres;
            res.json(response);
        });


    }else{
        var regex = '(\\b'+ req.query.regex + ')\\w*';
        Genre.find({name: {$regex : regex, $options: 'ig'} } ,fields,{
            skip: 0,
            limit: 10,
            sort: {
                id:1
            }
        }, function(err, genres){
            if(err){
                res.send(404);
            }
            var response = {};
            response.results = genres;
            res.json(response);
        });

        console.log(regex);
    }



});

app.get('/getMovie', function(req, res){
//        tmdb.movieInfo({id: req.query.id}, function(err, movieInfo){
//        console.log(movieInfo);
////        movieInfo.poster_path = 'http://image.tmdb.org/t/p/original'+movieInfo.poster_path;
//        res.json(movieInfo);
//    });

    request({
        method: 'GET',
        url: 'http://api.themoviedb.org/3/movie/'+req.query.id+'?api_key=ac16918a1af4a39ca7b490be17f2ea78&append_to_response=keywords,reviews,videos,similar',
        headers: {
            'Accept': 'application/json'
        }}, function (error, resp, data) {
//                console.log('Response:', response);
        var movie = JSON.parse(data);
        if (movie.poster_path === null ){
            movie.poster_path = "http://s3.amazonaws.com/hassebj/placeholder.gif";
            movie.backdrop_path = "http://s3.amazonaws.com/hassebj/placeholder.gif";
        }
        var response = {};
        var arr  = [];
        arr.push(movie);
        response.results = arr;
        res.json(response);
//        res.json(movie);


    });


});
app.get('/fetchRecommendation', function(req, res){
    console.log("release_date.gte:"+ req.query.era_start + " release_date.lte :" +  req.query.era_end+ " with_people:" + req.query.actors + " with_genres:" + req.query.genres + "with_keyword:" + req.query.keywords);
    tmdb.discoverMovie({"release_date.gte": req.query.era_start, "release_date.lte": req.query.era_end, "with_people":req.query.actors, "with_genres":req.query.genres, "with_keywords":req.query.keywords}, function(err, resp){
//                    tmdb.movieInfo({id: resp.results[0].id}, function(err, movieInfo){
//                        console.log(movieInfo);
//                        movieInfo.poster_path = 'http://image.tmdb.org/t/p/original'+movieInfo.poster_path;
//                        res.json(movieInfo);
//                    });
    // console.log(resp);
//    resp.results.splice(0,1);
    // console.log("<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>");
    // console.log(resp);
        resp.results.forEach(function(movie){
            if (movie.poster_path === null ){
                movie.poster_path = "http://s3.amazonaws.com/hassebj/placeholder.gif";
                movie.backdrop_path = "http://s3.amazonaws.com/hassebj/placeholder.gif";
            }
        });
        res.json(resp);

    });



});

app.get('/getRecommendation', function(req, res){

    async.parallel({
            getGenres: function (callback) {
                if(checkempty(req.query.genres) === true){
                    getGenresId(req.query.genres).done(function(val){
                        callback(null, val);
                    }, function (err){
                        console.log(err);
                    });
                }
                else{
                    callback(null, '');
                }

            },
            getActor: function (outercallback) {
                if(checkempty(req.query.actors) === true) {
                    getActorsId(req.query.actors).done(function(val){
                        outercallback(null, val);
                    }, function (err){
                        console.log(err);
                    });
                }
                else{
                    outercallback(null, '');
                }


            },
            getKeywords: function (outercallback) {

                if(checkempty(req.query.keyword) === true) {
                    getKeywordsId(req.query.keyword).done(function(val){
                        outercallback(null, val);
                    }, function (err){
                        console.log(err);
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
//                resp.results.splice(0,1);
                console.log("spliced");
                    res.json(resp);

                });

            // results is now equals to: {one: 1, two: 2}
    });

});

//app.get('/get')

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



