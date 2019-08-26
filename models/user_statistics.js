var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var user_statisticsSchema = new Schema({
    user_id: String,
    question_type: String,
    question: String
});

module.exports = mongoose.model('user_statistics', user_statisticsSchema);