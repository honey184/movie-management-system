const mongoose = require("mongoose");

const watchlistSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },
        movieIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Movie"
            }
        ]
    },
    {
        timestamps: true,
        versionKey: false
    }
);


module.exports = mongoose.model("Watchlist", watchlistSchema);