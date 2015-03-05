/**
 * Created by mac on 2/25/15.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var GenresSchema = new Schema({
    id : {
        type : Number
    },
    name : {
        type : String
    }



});


mongoose.model('Genre', GenresSchema);
