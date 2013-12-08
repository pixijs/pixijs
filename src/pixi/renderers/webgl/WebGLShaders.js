/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

PIXI.initDefaultShaders = function()
{
    PIXI.primitiveShader = new PIXI.PrimitiveShader();
    PIXI.primitiveShader.init();

    PIXI.stripShader = new PIXI.StripShader();
    PIXI.stripShader.init();

    PIXI.defaultShader = new PIXI.PixiShader();
    PIXI.defaultShader.init();

    var gl = PIXI.gl;
    var shaderProgram = PIXI.defaultShader.program;

    gl.useProgram(shaderProgram);

    gl.enableVertexAttribArray(PIXI.defaultShader.aVertexPosition);
    gl.enableVertexAttribArray(PIXI.defaultShader.colorAttribute);
    gl.enableVertexAttribArray(PIXI.defaultShader.aTextureCoord);
};

PIXI.activatePrimitiveShader = function()
{
    var gl = PIXI.gl;

    gl.useProgram(PIXI.primitiveShader.program);

    gl.disableVertexAttribArray(PIXI.defaultShader.aVertexPosition);
    gl.disableVertexAttribArray(PIXI.defaultShader.colorAttribute);
    gl.disableVertexAttribArray(PIXI.defaultShader.aTextureCoord);

    gl.enableVertexAttribArray(PIXI.primitiveShader.aVertexPosition);
    gl.enableVertexAttribArray(PIXI.primitiveShader.colorAttribute);
};

PIXI.deactivatePrimitiveShader = function()
{
    var gl = PIXI.gl;

    gl.useProgram(PIXI.defaultShader.program);

    gl.disableVertexAttribArray(PIXI.primitiveShader.aVertexPosition);
    gl.disableVertexAttribArray(PIXI.primitiveShader.colorAttribute);

    gl.enableVertexAttribArray(PIXI.defaultShader.aVertexPosition);
    gl.enableVertexAttribArray(PIXI.defaultShader.colorAttribute);
    gl.enableVertexAttribArray(PIXI.defaultShader.aTextureCoord);
};

PIXI.activateStripShader = function()
{
    var gl = PIXI.gl;

    gl.useProgram(PIXI.stripShader.program);
 // gl.disableVertexAttribArray(PIXI.defaultShader.aTextureCoord);
};

PIXI.deactivateStripShader = function()
{
    var gl = PIXI.gl;

    gl.useProgram(PIXI.defaultShader.program);
    //gl.enableVertexAttribArray(PIXI.defaultShader.aTextureCoord);
};

/*

SHADER COMPILER HELPERS
*/

PIXI.CompileVertexShader = function(gl, shaderSrc)
{
    return PIXI._CompileShader(gl, shaderSrc, gl.VERTEX_SHADER);
};

PIXI.CompileFragmentShader = function(gl, shaderSrc)
{
    return PIXI._CompileShader(gl, shaderSrc, gl.FRAGMENT_SHADER);
};

PIXI._CompileShader = function(gl, shaderSrc, shaderType)
{
    var src = shaderSrc.join("\n");
    var shader = gl.createShader(shaderType);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        window.console.log(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
};

PIXI.compileProgram = function(vertexSrc, fragmentSrc)
{
    var gl = PIXI.gl;
    var fragmentShader = PIXI.CompileFragmentShader(gl, fragmentSrc);
    var vertexShader = PIXI.CompileVertexShader(gl, vertexSrc);

    var shaderProgram = gl.createProgram();

    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        window.console.log("Could not initialise shaders");
    }

    return shaderProgram;
};
