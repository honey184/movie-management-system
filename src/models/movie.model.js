const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            lowercase: true
        },

        description: {
            type: String
        },

        genre: [
            {
                type: String,
                required: [true, 'At least one genre is required'],
                lowercase: true
            }
        ],

        releaseYear: {
            type: Number,
            required: [true, 'Release year is required'],
            max: new Date().getFullYear() + 1
        },

        cast: [
            {
                type: String
            }
        ],

        ratingsAvg: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
            set: (val) => Math.round(val * 10) / 10,
        },

        ratingsCount: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

movieSchema.index({ title: 'text', description: 'text', genre: 'text' });
movieSchema.index({ genre: 1 });
movieSchema.index({ releaseYear: 1 });
movieSchema.index({ ratingsAvg: -1 });
movieSchema.index({ genre: 1, ratingsAvg: -1 });


module.exports = mongoose.model("Movie", movieSchema);