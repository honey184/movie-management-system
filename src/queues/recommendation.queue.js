const Queue = require('bull');

const recommendationQueue = new Queue(
    'recommendation-queue',
    'redis://127.0.0.1:6379'
);

module.exports = recommendationQueue;