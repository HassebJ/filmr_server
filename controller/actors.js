/**
 * Created by mac on 3/22/15.
 */
require('../models/actors');
require('../models/movies');
var async = require('async');
var mongoose = require('mongoose');
var mongodb = mongoose.connect('mongodb://localhost/moviedb');
var tmdb = require('moviedb')(['ac16918a1af4a39ca7b490be17f2ea78', '9dae15b604f445963788ff49473649ed', '8143d0742846bc51481b6ccf367e6e87']);
var Actor = mongoose.model('Actor');
var Movie = mongoose.model('Movie');
var app = require('express')();
var fs = require('fs');

function charPairs(){

    var str = "abcdfghijklmnopqrstuvwxyz".split("");
    var charPairs = [];
    for (var i = 0; i<str.length; i++) {
        for (var j = 0; j < str.length; j++) {
            charPairs.push(str[i] + str[j]);
        }
    }
    return charPairs;
}

var getActors = function() {
//app.get('/getKeywords',function(req, res){
    var total = 0;
    async.eachSeries(['yq',
        'yr',
        'ys',
        'yt',
        'yu',
        'yv',
        'yw',
        'yx',
        'yy',
        'yz',
        'za',
        'zb',
        'zc',
        'zd',
        'zf',
        'zg',
        'zh',
        'zi',
        'zj',
        'zk',
        'zl',
        'zm',
        'zn',
        'zo',
        'zp',
        'zq',
        'zr',
        'zs',
        'zt',
        'zu',
        'zv',
        'zw',
        'zx',
        'zy',
        'zz' ], function (char, eachcallback) {
        var outer_error;
        async.doUntil(
            function (outerdountilcallback) {
                tmdb.searchPerson({query: char }, function (err, outerresp) {
                    outer_error = err;
                    if (err) {
                        console.log('err at initial search: ' +err );
                    } else if ( outerresp.total_pages >1000){
                        fs.appendFile('retry.txt', char + ':-\n' , function (err) {
                            if (err) throw err;
                            console.log('The "data to append" was appended to file!');
                        });
                        console.log(char + ':-\n' );
                        eachcallback();

                    }
                    else {
                        var total_pages = outerresp.total_pages;
//                        if(total_pages >1000){
//                            fs.appendFile('retry.txt', char + ':-\n' , function (err) {
//                                if (err) throw err;
//                                console.log('The "data to append" was appended to file!');
//                            });
//                            console.log(char + ':-\n' );
//                            eachcallback();
//                        }else{
                            total += outerresp.total_results;
//                        }
                        var page = 2;
                        console.log('char('+char + ') , totalResults('+outerresp.total_results + ') , resultsCached(' + total + ') , totalPages(' + total_pages + ')');
                        outerresp.results.forEach(function (actor) {
                            var movies = [];
                            var actorObj = new Actor();
                            async.eachSeries(actor.known_for, function(movie, callback){
                                var movieObj = new Movie();
                                movieObj.backdrop_path = movie.backdrop_path;
                                movieObj.id= movie.id;
                                movieObj.original_title= movie.original_title;
                                movieObj.release_date= movie.release_date;
                                movieObj.profile_path= movie.profile_path;
                                movieObj.popularity= movie.popularity;
                                movieObj.title= movie.title;
                                movieObj.vote_average= movie.vote_average;
                                movieObj.vote_count= movie.vote_count;
                                movieObj.save(function(err, newMovie){
                                    if (err){
                                        console.log(err);
                                        callback(err);
                                    }
                                    actorObj.known_for.push(newMovie._id);
                                    callback();
                                });
                            },function(err){
                                if(err){
                                    console.log(err);
                                }else{
                                    actorObj.id = actor.id;
                                    actorObj.name = actor.name;
                                    actorObj.popularity = actor.popularity;
                                    actorObj.profile_path = actor.profile_path;
                                    actorObj.save(function (err, newActor) {
                                        if (err) {
                                            console.log(err);
                                        }
                                    });

                                }

                            });

                        });


                        async.whilst(
                            function () {
                                return page <= total_pages;
                            },
                            function (whilstcallback) {
                                page++;
                                var error;
                                async.doUntil(
                                    function (dountilcallback) {
                                        tmdb.searchPerson({query: char, page: page }, function (err, resp) {
                                            error = err;

                                            if (err) {
                                                console.log('err at retrying ' + char + ' : ' + page + ' : ' +err );
                                                var query = err.toString().indexOf('query',58);
                                                var pageIndex = err.toString().indexOf('page',58);
                                                var errPrint = err.toString().substr(query + 6, 2) + ':' + err.toString().substr(pageIndex + 5, err.toString().indexOf(' ',pageIndex)-pageIndex-5);
                                                console.log(errPrint);
                                                fs.appendFile('retry2.txt', errPrint+'\n' , function (err) {
                                                    if (err) throw err;
                                                });

                                            } else {
                                                resp.results.forEach(function (actor) {
                                                    var movies = [];
                                                    var actorObj = new Actor();
                                                    async.eachSeries(actor.known_for, function(movie, callback){
                                                        var movieObj = new Movie();
                                                        movieObj.backdrop_path = movie.backdrop_path;
                                                        movieObj.id= movie.id;
                                                        movieObj.original_title= movie.original_title;
                                                        movieObj.release_date= movie.release_date;
                                                        movieObj.profile_path= movie.profile_path;
                                                        movieObj.popularity= movie.popularity;
                                                        movieObj.title= movie.title;
                                                        movieObj.vote_average= movie.vote_average;
                                                        movieObj.vote_count= movie.vote_count;
                                                        movieObj.save(function(err, newMovie){
                                                            if (err){
                                                                console.log(err);
                                                                callback(err);
                                                            }
                                                            actorObj.known_for.push(newMovie._id);
                                                            callback();
                                                        });

                                                    },function(err){
                                                        if(err){
                                                            console.log(err);
                                                        }else{
                                                            actorObj.id = actor.id;
                                                            actorObj.name = actor.name;
                                                            actorObj.popularity = actor.popularity;
                                                            actorObj.profile_path = actor.profile_path;
                                                            actorObj.save(function (err, newActor) {
                                                                if (err) {
                                                                    console.log(err);
                                                                }
                                                            });
                                                        }
                                                    });
                                                });
                                            }
                                        });

                                        dountilcallback();
                                    },
                                    function () {
                                        return !error;
                                    },
                                    function (err) {
                                        if (err)
                                            console.log('dounitl err' + err);
                                        else{
                                            if(page % 14 === 0){
//                                                console.log('15 sec wait at page:' + page);
                                                setTimeout(function(){
                                                    whilstcallback();

                                                }, 2000);
                                            }
                                            else{

                                            whilstcallback();
                                            }

                                        }
                                    }
                                );
                            },
                            function (err) {
                                if (err)
                                    console.log('dowhilst err' + err);

                                eachcallback();

                            }
                        );
                    }
                });

                outerdountilcallback();
            },
            function () {
                return !outer_error;

//                if(!outer_error){
//                    console.log('API err, waiting for 10 seconds');
//                    setTimeout(function(){
//                        return false;
//
//                    }, 10000);
//
//                }
//                else{
//                    return true;
//                }
            },
            function (err) {
                // 5 seconds have passed
//                whilstcallback();
            }
        );


    }, function (err) {
        console.log('total:' + total);
        // if any of the file processing produced an error, err would equal that error
        if (err) {
            // One of the iterations produced an error.
            // All processing will now stop.
            console.log('A file failed to process');
        } else {
            console.log('All files have been processed successfully');
        }
    });

};
getActors();

