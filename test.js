const mongoose = require('mongoose');
const { Schema } = mongoose;

const connectDB = async () => {
    try {

        const conn = await mongoose.connect("mongodb://127.0.0.1:27017/test");
        console.log(`MongoDB Connected: ${conn.connection.host}`);

    } catch (error) {

        console.error('MongoDB connection failed');
        console.error(error.message);
        process.exit(1);

    }
};

const exampleSchema = new Schema({
    title: String,
    genre: [String]
});

const TestModel = mongoose.model('example', exampleSchema);

const run = async () => {

    await connectDB();

    const genres = ["action", "horror"];

    const recommendations = await TestModel.find({
        genre: { $in: genres },
    })

    if (recommendations.length == 0) return console.log("no recommendation");


    return console.log(recommendations);

};

run();