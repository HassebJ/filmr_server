var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

require('./models/movies');
var mongoose = require('mongoose');
var Movie = mongoose.model('Movie');
var db = require('moviedb')('ac16918a1af4a39ca7b490be17f2ea78');
var mongodb = mongoose.connect('mongodb://localhost/moviedb');
var app = {};

function sleep(time) {
    var stop = new Date().getTime();
    while(new Date().getTime() < stop + time) {
        ;
    }
//    callback();
}

app.write250 = function(){
    var url = 'http://www.imdb.com/chart/top?ref_=nv_ch_250_4/';

    request(url, function(error, response, html){
        if(!error){
            var $ = cheerio.load(html);
            var movies = [];
            $('.titleColumn').filter(function(){
                var data = $(this);
                movies.push({ rank : data.children().first().text(), rating : data.children().first().attr('data-value'), title:data.children().first().next().text(), link : data.children().first().next().attr('href')});

            });

        }

    });


};

app.getDetails = function(){

    var movie = require('./top250');
    var i = 0;

        movie.forEach(function(m){
            request({
                method: 'GET',
                url: 'http://api.themoviedb.org/3/movie/'+m.link.split('/')[2]+'?api_key=ac16918a1af4a39ca7b490be17f2ea78&append_to_response=keywords,reviews',
                headers: {
                    'Accept': 'application/json'
                }}, function (error, response, data) {
//                console.log('Response:', response);
                var body = JSON.parse(data);
                var kw = body.keywords.keywords;
                var rw = body.reviews.results;
                var movieobj = new Movie();
                movieobj.adult = body.adult;
                movieobj.backdrop_path = body.backdrop_path;
                movieobj.poster_path = body.poster_path;
                body.genres.forEach(function(genre){
                    movieobj.genres.push(genre.name);
                });
                movieobj.tmdb_id = body.id;
                movieobj.imdb_id = body.imdb_id;
                movieobj.language = body.original_language;
                movieobj.overview = body.overview;
                movieobj.poster_path = body.poster_path;
                movieobj.release_date = new Date(body.release_date);
                movieobj.runtime = body.runtime;
                movieobj.tagline = body.tagline;
                movieobj.title = body.title;
                movieobj.tmdb_rating = body.vote_average;
                kw.forEach(function(keyword){
                    movieobj.keywords.push(keyword.name);
                });
                rw.forEach(function(review){
                    movieobj.reviews.push({isCritic : false, review: review.content});

                });
                movieobj.imdb_rank = parseFloat(m.rank);
                movieobj.imdb_rating = m.rating;
                movieobj.save(function(err, newMovie) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Movie saved : "+newMovie.title);
                    }
                });


            });
            if(i % 10 === 0 && i !== 0 ){

                sleep(1000 * 4);

            }
            i++;

        });






};

app.getDetails();


exports = module.exports = app;
