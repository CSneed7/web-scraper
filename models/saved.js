var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var SavedSchema = new Schema({
    save: [{
    title: {
        type: String,
        required: true,
        unique: true
    },
    link: {
        type: String,
        required: true,
        unique: true
    },
    summary: {
        type: String,
        required: true,
        unique: true
    },
    note: {
        type: Schema.Types.ObjectId,
        ref: "Note"
    }}],
    articles: [
        {
            type: Schema.Types.ObjectId,
            ref: "Article"
        }
    ]
});
var Saved = mongoose.model("Saved", SavedSchema);

module.exports = Saved;