var glUtils = module.exports = {
    /**
     * @static
     * @private
     */
    initDefaultShaders: function () {
    },

    /**
     * @static
     * @param gl {WebGLContext} the current WebGL drawing context
     * @param shaderSrc {Array}
     * @return {Any}
     */
    CompileVertexShader: function (gl, shaderSrc) {
        return glUtils._CompileShader(gl, shaderSrc, gl.VERTEX_SHADER);
    },

    /**
     * @static
     * @param gl {WebGLContext} the current WebGL drawing context
     * @param shaderSrc {Array}
     * @return {Any}
     */
    CompileFragmentShader: function (gl, shaderSrc) {
        return glUtils._CompileShader(gl, shaderSrc, gl.FRAGMENT_SHADER);
    },

    /**
     * @static
     * @private
     * @param gl {WebGLContext} the current WebGL drawing context
     * @param shaderSrc {Array}
     * @param shaderType {number}
     * @return {Any}
     */
    _CompileShader: function (gl, shaderSrc, shaderType) {
        var src = shaderSrc.join("\n");
        var shader = gl.createShader(shaderType);
        gl.shaderSource(shader, src);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            window.console.log(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    },

    /**
     * @static
     * @param gl {WebGLContext} the current WebGL drawing context
     * @param vertexSrc {Array}
     * @param fragmentSrc {Array}
     * @return {Any}
     */
    compileProgram: function (gl, vertexSrc, fragmentSrc) {
        var fragmentShader = glUtils.CompileFragmentShader(gl, fragmentSrc);
        var vertexShader = glUtils.CompileVertexShader(gl, vertexSrc);

        var shaderProgram = gl.createProgram();

        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            window.console.log("Could not initialise shaders");
        }

        return shaderProgram;
    }
};
