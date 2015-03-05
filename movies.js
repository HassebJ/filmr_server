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
    genres: [
        {
            type: String
        }
    ],
    tmdb_id: {
        type: Number
    },
    imdb_id: {
        type: String
    },
    language: {
        type: String
    },

    title: {
        type: String
    },
    overview: {
        type: String
    },
    poster_path: {
        type: String
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
    tmdb_rating: {
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