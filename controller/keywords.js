/**
 * Created by mac on 3/22/15.
 */
require('../models/keywords');
var async = require('async');
var mongoose = require('mongoose');
var mongodb = mongoose.connect('mongodb://localhost/moviedb');
var tmdb = require('moviedb')('ac16918a1af4a39ca7b490be17f2ea78');
var Keyword = mongoose.model('Keyword');
var app = require('express')();

var getKeywords = function() {
//app.get('/getKeywords',function(req, res){
    var total = 0;
    async.eachSeries("abcdefghijklmnopqrstuvwxyz".split(""), function (char, eachcallback) {
        var outer_error;
        async.doUntil(
            function (outerdountilcallback) {

                tmdb.searchKeyword({query: char }, function (err, outerresp) {
                    outer_error = err;
                    if (err) {
                        console.log('err at initial search: ' +err );
                    } else {

                        var total_pages = outerresp.total_pages;
                        total += outerresp.total_results;
                        var page = 2;
                        console.log(char + ' : ' + outerresp.total_results + ' : ' + total);
                        outerresp.results.forEach(function (keyword) {
                            var keywordObj = new Keyword();
                            keywordObj.id = keyword.id;
                            keywordObj.name = keyword.name;
                            keywordObj.save(function (err, newKeyword) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    //                        console.log("Keyword saved : "+newKeyword.name);
                                }
                            });
                        });


                        async.whilst(
                            function () {
                                return page <= total_pages;
                            },
                            function (whilstcallback) {
                                page++;
                                //                        console.log(innerresp);
                                var error;

                                async.doUntil(
                                    function (dountilcallback) {
                                        tmdb.searchKeyword({query: char, page: page }, function (err, resp) {
                                            error = err;
                                            if (err) {
                                                console.log('err at retrying ' + char + ' : ' + page + ' : ' +err );

                                            } else {
                                                resp.results.forEach(function (keyword) {
                                                    var keywordObj = new Keyword();
                                                    keywordObj.id = keyword.id;
                                                    keywordObj.name = keyword.name;
                                                    keywordObj.save(function (err, newKeyword) {
                                                        if (err) {
                                                            console.log(err);
                                                        } else {
                                                            //                                            console.log("Keyword saved : "+newKeyword.name);
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
                                        if(page % 20 === 0){
                                            console.log('waiting for 10 seconds');
                                            setTimeout(function(){
                                                whilstcallback();

                                            }, 10000);
                                        }
                                        else{
                                            whilstcallback();
                                        }


                                    }
                                );


                            },
                            function (err) {
                                if (err)
                                    console.log('dowhilst err' + err);
                                //console.log('waiting for 10 seconds');
                                //setTimeout(function(){
                                    eachcallback();

                                //}, 10000);

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


//    res.send(200);
//});
};
getKeywords();

//var server = app.listen(3000, function () {
//
//    var host = server.address().address;
//    var port = server.address().port;
//
//    console.log('Example app listening at http://%s:%s', host, port)
//
//});