require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Movie = require('./models/movie.model');
const User = require('./models/user.model');
const Admin = require('./models/admin.model');
const Review = require('./models/review.model');
const Watchlist = require('./models/watchlist.model');

const GENRES = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Thriller', 'Animation', 'Documentary', 'Adventure'];
const CAST_POOL = ['Actor A', 'Actor B', 'Actor C', 'Actor D', 'Actor E', 'Actor F', 'Actor G', 'Actor H'];

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(1));
const sample = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // ── Clean existing data ─────────────────────────────────────────
    console.log('Clearing existing data...');
    await Promise.all([
        Movie.deleteMany(),
        User.deleteMany(),
        Admin.deleteMany(),
        Review.deleteMany(),
        Watchlist.deleteMany(),
    ]);

    // ── Create default admin ────────────────────────────────────────
    console.log('Creating admin...');
    await Admin.create({
        name: 'Super Admin',
        email: 'admin@gmail.com',
        password: 'Honey@123',
        role: 'admin',
    });
    console.log('Admin → email: admin@movies.com | password: admin123');

    // ── Create 10 test users ────────────────────────────────────────
    console.log('👥 Creating test users...');
    const hashedPwd = await bcrypt.hash('user1234', 12);
    const users = await User.insertMany(
        Array.from({ length: 10 }, (_, i) => ({
            name: `Test User ${i + 1}`,
            email: `user${i + 1}@movies.com`,
            password: hashedPwd,
            role: 'user',
        }))
    );
    console.log('10 test users created (password: user1234)');

    // ── Seed 50,000 movies in batches of 1000 ──────────────────────
    console.log('Seeding 50,000 movies...');
    const TOTAL_MOVIES = 50000;
    const BATCH_SIZE = 1000;
    const allMovieIds = [];

    for (let i = 0; i < TOTAL_MOVIES / BATCH_SIZE; i++) {
        const batch = Array.from({ length: BATCH_SIZE }, (_, j) => ({
            title: `${rand(['The', 'A', 'One', 'Last', 'Dark', 'Lost', 'Bright', 'Wild'])} ${rand(['Night', 'Storm', 'Hero', 'Journey', 'Legacy', 'Code', 'Fire', 'Dream'])} ${i * BATCH_SIZE + j + 1}`,
            genre: sample(GENRES, randInt(1, 3)),
            cast: sample(CAST_POOL, randInt(2, 4)),
            releaseYear: randInt(1990, 2024),
            ratingsAvg: randFloat(1, 5),
            ratingsCount: randInt(0, 1000),
        }));

        const inserted = await Movie.insertMany(batch);
        inserted.forEach((m) => allMovieIds.push(m._id));

        if ((i + 1) % 10 === 0) {
            console.log(`  ↳ ${(i + 1) * BATCH_SIZE} movies inserted...`);
        }
    }
    console.log('50,000 movies seeded');

    // ── Seed Reviews (500 reviews across random movies) ────────────
    console.log('Seeding reviews...');
    const reviewBatch = [];
    const usedPairs = new Set();

    for (let i = 0; i < 500; i++) {
        const userId = rand(users)._id;
        const movieId = allMovieIds[randInt(0, allMovieIds.length - 1)];
        const key = `${userId}-${movieId}`;
        if (usedPairs.has(key)) continue;
        usedPairs.add(key);

        reviewBatch.push({
            userId,
            movieId,
            rating: randInt(1, 5),
            comment: rand([
                'Absolutely loved it!',
                'Not bad, worth watching.',
                'Could have been better.',
                'One of the best movies!',
                'Great cinematography.',
                'Storyline was weak.',
                'Highly recommended!',
                'Average experience.',
            ]),
        });
    }
    await Review.insertMany(reviewBatch);
    console.log(`${reviewBatch.length} reviews seeded`);

    // ── Seed Watchlists for test users ─────────────────────────────
    console.log('Seeding watchlists...');
    const watchlistBatch = users.map((user) => ({
        userId: user._id,
        movieIds: sample(allMovieIds, randInt(5, 20)),
    }));
    await Watchlist.insertMany(watchlistBatch);
    console.log('Watchlists seeded for all users');

    console.log('\nSeeding complete!');
    console.log('─────────────────────────────────────');
    console.log('Admin   → admin@movies.com / admin123');
    console.log('Users   → user1@movies.com / user1234');
    console.log('Movies  → 50,000 records');
    console.log('─────────────────────────────────────');

    process.exit(0);
}

seed().catch((err) => {
    console.error(' Seed failed:', err);
    process.exit(1);
});