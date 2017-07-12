'use strict';

exports.__esModule = true;
exports.default = generateFragBlurSource;
var GAUSSIAN_VALUES = {
    5: [0.153388, 0.221461, 0.250301],
    7: [0.071303, 0.131514, 0.189879, 0.214607],
    9: [0.028532, 0.067234, 0.124009, 0.179044, 0.20236],
    11: [0.0093, 0.028002, 0.065984, 0.121703, 0.175713, 0.198596],
    13: [0.002406, 0.009255, 0.027867, 0.065666, 0.121117, 0.174868, 0.197641],
    15: [0.000489, 0.002403, 0.009246, 0.02784, 0.065602, 0.120999, 0.174697, 0.197448]
};

var fragTemplate = ['varying vec2 vBlurTexCoords[%size%];', 'uniform sampler2D uSampler;', 'void main(void)', '{', '    gl_FragColor = vec4(0.0);', '    %blur%', '}'].join('\n');

function generateFragBlurSource(kernelSize) {
    var kernel = GAUSSIAN_VALUES[kernelSize];
    var halfLength = kernel.length;

    var fragSource = fragTemplate;

    var blurLoop = '';
    var template = 'gl_FragColor += texture2D(uSampler, vBlurTexCoords[%index%]) * %value%;';
    var value = void 0;

    for (var i = 0; i < kernelSize; i++) {
        var blur = template.replace('%index%', i);

        value = i;

        if (i >= halfLength) {
            value = kernelSize - i - 1;
        }

        blur = blur.replace('%value%', kernel[value]);

        blurLoop += blur;
        blurLoop += '\n';
    }

    fragSource = fragSource.replace('%blur%', blurLoop);
    fragSource = fragSource.replace('%size%', kernelSize);

    return fragSource;
}
//# sourceMappingURL=generateBlurFragSource.js.map