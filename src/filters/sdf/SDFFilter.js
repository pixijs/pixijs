var core = require('../../core');
// @see https://github.com/substack/brfs/issues/25


/**
 * This applies a filter to vectorize Sined Distance Field Images.
 *
 * @class
 * @extends AbstractFilter
 * @memberof PIXI.filters
 */
function SDFFilter()
{
    core.AbstractFilter.call(this,
        // vertex shader
        null,
        // fragment shader
        "precision mediump float;\n\nvarying vec2 vTextureCoord;\n\nuniform float threshStart;\nuniform float threshEnd;\nuniform float useTexture;\nuniform vec4 color;\nuniform sampler2D texture;\nuniform sampler2D uSampler;\n\nvoid main(void) \n{\n    vec4 sample = texture2D(uSampler, vTextureCoord);\n    vec4 tex = texture2D(texture, vTextureCoord);\n\n    vec4 c;\n    if (useTexture == 1.0) {\n        c = tex;\n    } else {\n        c = color;\n    }\n\n    gl_FragColor = c * smoothstep(threshStart, threshEnd, sample.r);\n}\n",
        // custom uniforms
        {
            threshStart: {type: '1f', value: 0.5},
            threshEnd: {type: '1f', value: 0.5},
            useTexture: {type: '1f', value: 0.0},
            texture: {type: 'sampler2D', value: 0},
            color: {type: '4f', value: [1.0, 1.0, 1.0, 1.0]},
        }
    );
}

SDFFilter.prototype = Object.create(core.AbstractFilter.prototype);
SDFFilter.prototype.constructor = SDFFilter;
module.exports = SDFFilter;

Object.defineProperties(SDFFilter.prototype, {
    color: {
        get: function ()
        {
            return this.uniforms.color.value;
        },
        set: function (value)
        {
            this.uniforms.useTexture.value = 0.0;
            this.uniforms.color.value = value; 
            this.syncUniform(this.uniforms);
        }
    },

    texture: {
        get: function ()
        {
            return this.uniforms.texture.value;
        },
        set: function (value) {
            this.uniforms.useTexture.value = 1.0;
            this.uniforms.texture.value = value;
            this.syncUniform(this.uniforms);
        }
    },

    threshStart: {
        get: function ()
        {
            return this.uniforms.threshStart.value;
        },
        set: function (value)
        {
            this.uniforms.threshStart.value = value; 
            this.syncUniform(this.uniforms);
        }
    },

    threshEnd: {
        get: function ()
        {
            return this.uniforms.threshEnd.value;
        },
        set: function (value)
        {
            this.uniforms.threshEnd.value = value; 
            this.syncUniform(this.uniforms);
        }
    }
});