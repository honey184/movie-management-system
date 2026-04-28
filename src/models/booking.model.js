const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User is required']
        },

        movie: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Movie',
            required: [true, 'Movie is required']
        },

        showDate: {
            type: Date,
            required: [true, 'Show date is required']
        },

        showTime: {
            type: String,
            required: [true, 'Show time is required'],
            enum: ['10:00', '13:00', '16:00', '19:00', '22:00']
        },

        seats: {
            type: Number,
            required: [true, 'Number of seats is required'],
            min: [1, 'At least 1 seat is required'],
            max: [10, 'Maximum 10 seats allowed']
        },

        totalPrice: {
            type: Number,
            required: true,
            min: 0
        },

        status: {
            type: String,
            enum: ['pending', 'confirmed', 'cancelled'],
            default: 'confirmed'
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// Index for better query performance
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ movie: 1, showDate: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
