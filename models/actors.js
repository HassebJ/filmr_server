/**
 * Created by mac on 4/13/15.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ActorsSchema = new Schema({
    id : {
        type : Number
    },
    known_for:[{
        type: Schema.Types.ObjectId,
        ref: 'Movie'
    }],
    popularity : {
        type: Number
    },
    name : {
        type : String
    },
    profile_path: {
        type : String
    }

});


mongoose.model('Actor', ActorsSchema);