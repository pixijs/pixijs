/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */
 
PIXI.WebGLMaskManager = function(gl)
{
    this.maskStack = [];
    this.maskPosition = 0;

    this.setContext(gl);
};

PIXI.WebGLMaskManager.prototype.setContext = function(gl)
{
    this.gl = gl;
};

PIXI.WebGLMaskManager.prototype.pushMask = function(maskData, renderSession)
{
    var gl = this.gl;

    if(this.maskStack.length === 0)
    {
        gl.enable(gl.STENCIL_TEST);
        gl.stencilFunc(gl.ALWAYS,1,1);
    }
    
  //  maskData.visible = false;

    this.maskStack.push(maskData);
    
    gl.colorMask(false, false, false, true);
    gl.stencilOp(gl.KEEP,gl.KEEP,gl.INCR);

    PIXI.WebGLGraphics.renderGraphics(maskData, renderSession);

    gl.colorMask(true, true, true, true);
    gl.stencilFunc(gl.NOTEQUAL,0, this.maskStack.length);
    gl.stencilOp(gl.KEEP,gl.KEEP,gl.KEEP);
};

PIXI.WebGLMaskManager.prototype.popMask = function(renderSession)
{
    var gl = this.gl;

    var maskData = this.maskStack.pop();

    if(maskData)
    {
        gl.colorMask(false, false, false, false);

        //gl.stencilFunc(gl.ALWAYS,1,1);
        gl.stencilOp(gl.KEEP,gl.KEEP,gl.DECR);

        PIXI.WebGLGraphics.renderGraphics(maskData, renderSession);

        gl.colorMask(true, true, true, true);
        gl.stencilFunc(gl.NOTEQUAL,0,this.maskStack.length);
        gl.stencilOp(gl.KEEP,gl.KEEP,gl.KEEP);
    }
   
    if(this.maskStack.length === 0)gl.disable(gl.STENCIL_TEST);
};