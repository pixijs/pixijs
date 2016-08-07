require('../check');

var filter = PIXI.filters.BloomFilter = require('./BloomFilter');

// Export for requiring
if (typeof module !== 'undefined' && module.exports) {
    module.exports = filter;
}