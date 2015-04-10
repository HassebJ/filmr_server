/**
 * Created by mac on 3/6/15.
 */


var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var KeywordsSchema = new Schema({
    id : {
        type : Number
    },
    name : {
        type : String
    }



});


mongoose.model('Keyword', KeywordsSchema);
