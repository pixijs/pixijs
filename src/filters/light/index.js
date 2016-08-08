require('../check');

var filter = PIXI.filters.TwistFilter = require('./TwistFilter');

// Export for requiring
if (typeof module !== 'undefined' && module.exports) {
    module.exports = filter;
}