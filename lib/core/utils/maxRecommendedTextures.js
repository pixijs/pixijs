'use strict';

exports.__esModule = true;
exports.default = maxRecommendedTextures;

var _ismobilejs = require('ismobilejs');

var _ismobilejs2 = _interopRequireDefault(_ismobilejs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function maxRecommendedTextures(max) {
    if (_ismobilejs2.default.tablet || _ismobilejs2.default.phone) {
        // check if the res is iphone 6 or higher..
        return 4;
    }

    // desktop should be ok
    return max;
}
//# sourceMappingURL=maxRecommendedTextures.js.map