"use strict";

exports.__esModule = true;
exports.default = canUploadSameBuffer;
function canUploadSameBuffer() {
	// Uploading the same buffer multiple times in a single frame can cause perf issues.
	// Apparent on IOS so only check for that at the moment
	// this check may become more complex if this issue pops up elsewhere.
	var ios = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);

	return !ios;
}
//# sourceMappingURL=canUploadSameBuffer.js.map