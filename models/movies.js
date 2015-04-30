/**
 * Created by mac on 1/6/15.
 */

'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * Movie Schema
 */
var MovieSchema = new Schema({
    imdb_rank : {
        type : Number
    },
    adult: {
        type: Boolean
    },
    backdrop_path: {
        type: String
    },
    genres: [{
        type: Schema.Types.ObjectId,
        ref: 'Genre'
    }],
    id: {
        type: Number
    },
    imdb_id: {
        type: String
    },
    language: {
        type: String
    },

    original_title: {
        type: String
    },
    poster_path: {
        type: String
    },
    overview: {
        type: String
    },
    popularity: {
        type: Number
    },
    release_date: {
        type: Date
    },
    runtime: {
        type: Number
    },
    tagline: {
        type: String
    },
    title:{
        type: String
    },
    vote_average:{
        type: Number
    },
    vote_count:{
        type: Number
    },
    imdb_rating: {
        type: Number
    },
    reviews: [
        {
            isCritic: Boolean,
            review: String,
            rating: {
                type: Number,
                default: 0
            }
        }
    ],
    keywords: [{
        type: String
    }]

});


mongoose.model('Movie', MovieSchema);