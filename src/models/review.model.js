const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        movieId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Movie",
            required: true
        },

        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: true
        },

        comment: {
            type: String,
            trim: true,
            maxlength: 500,

        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);



reviewSchema.statics.updateMovieRatings = async function (movieId) {
    const stats = await this.aggregate([
        { $match: { movieId: new mongoose.Types.ObjectId(movieId) } },
        {
            $group: {
                _id: '$movieId',
                ratingsAvg: { $avg: '$rating' },
                ratingsCount: { $sum: 1 },
            },
        },
    ]);

    const Movie = require('./movie.model');
    if (stats.length > 0) {
        await Movie.findByIdAndUpdate(movieId, {
            ratingsAvg: stats[0].ratingsAvg,
            ratingsCount: stats[0].ratingsCount,
        });
    } else {
        await Movie.findByIdAndUpdate(movieId, { ratingsAvg: 0, ratingsCount: 0 });
    }
};

reviewSchema.post('save', function () {
    this.constructor.updateMovieRatings(this.movieId);
});

reviewSchema.post('findOneAndDelete', function (doc) {
    if (doc) doc.constructor.updateMovieRatings(doc.movieId);
});

reviewSchema.index({ userId: 1, movieId: 1 }, { unique: true });
reviewSchema.index({ movieId: 1 });  // fast lookup by movie

module.exports = mongoose.model("Review", reviewSchema);