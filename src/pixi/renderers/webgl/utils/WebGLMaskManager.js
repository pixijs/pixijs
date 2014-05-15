/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */
 
//BA0285
//Intercontinental Hotel, 888 Howard Street
//San Francisco

/**
* @class WebGLMaskManager
* @constructor
* @param gl {WebGLContext} the current WebGL drawing context
* @private
*/
PIXI.WebGLMaskManager = function(gl)
{
    this.maskStack = [];
    this.maskPosition = 0;

    this.setContext(gl);

    this.reverse = false;
    this.count = 0;
};  

/**
* Sets the drawing context to the one given in parameter
* @method setContext 
* @param gl {WebGLContext} the current WebGL drawing context
*/
PIXI.WebGLMaskManager.prototype.setContext = function(gl)
{
    this.gl = gl;
};

/**
* Applies the Mask and adds it to the current filter stack
* @method pushMask
* @param maskData {Array}
* @param renderSession {RenderSession}
*/
PIXI.WebGLMaskManager.prototype.pushMask = function(maskData, renderSession)
{
    this.count = 0;
    this.pushMaskReal(maskData, renderSession);

    return;
    this.maskStack.push(maskData);

    
    this.popMaskReal(maskData, renderSession);

    maskData.worldTransform.tx += 30;
    
    this.pushMaskReal(maskData, renderSession);
    //this.popMaskReal(maskData, renderSession);

    maskData.worldTransform.tx -= 30;

    maskData.worldTransform.tx += -50;
    
    //this.pushMaskReal(maskData, renderSession);
    //this.popMaskReal(maskData, renderSession);

    maskData.worldTransform.tx -= -50;


    return;
    var gl = this.gl;


    if(this.maskStack.length === 0)
    {
        gl.enable(gl.STENCIL_TEST);
        gl.stencilFunc(gl.ALWAYS,1,1);
    }
    
    //  maskData.visible = false;

    this.maskStack.push(maskData);
    gl.clear(gl.STENCIL_BUFFER_BIT);

    gl.colorMask(false, false, false, false);
    
    // draw that mask! 
    
    gl.stencilFunc(gl.ALWAYS,1,0xFF);
    gl.stencilOp(gl.KEEP,gl.KEEP,gl.INVERT);
    PIXI.WebGLGraphics.renderGraphicsMask(maskData, renderSession);


    gl.stencilFunc(gl.EQUAL,0xFF, 0xFF);
    gl.stencilOp(gl.KEEP,gl.KEEP,gl.DECR);
    PIXI.WebGLGraphics.renderGraphicsQuadMask(maskData, renderSession);

    // second mask
    
    maskData.worldTransform.tx += 10;

    gl.stencilFunc(gl.ALWAYS,1,0xFF);
    gl.stencilOp(gl.KEEP,gl.KEEP,gl.INVERT); 

    PIXI.WebGLGraphics.renderGraphicsMask(maskData, renderSession);
    

    gl.stencilFunc(gl.EQUAL, 1, 0xFF);
    gl.stencilOp(gl.KEEP,gl.KEEP,gl.INCR);
    PIXI.WebGLGraphics.renderGraphicsQuadMask(maskData, renderSession);

    maskData.worldTransform.tx -= 10;

    // 3rd..
    
    maskData.worldTransform.tx -= 50;

    gl.stencilFunc(gl.ALWAYS,1,0xFF);
    gl.stencilOp(gl.KEEP,gl.KEEP,gl.INVERT);
    PIXI.WebGLGraphics.renderGraphicsMask(maskData, renderSession);


    gl.stencilFunc(gl.EQUAL,0xFF-2, 0xFF);
    gl.stencilOp(gl.KEEP,gl.KEEP,gl.DECR);
    PIXI.WebGLGraphics.renderGraphicsQuadMask(maskData, renderSession);

    maskData.worldTransform.tx += 50;

/*
    //  PIXI.WebGLGraphics.renderGraphicsMask(maskData, renderSession);


    // first mask is a freebee!
    if(this.maskStack.length === 1)
    {

    }
    else
    {
        //gl.colorMask(false, false, false, false);
        //gl.stencilOp(gl.KEEP,gl.KEEP,gl.INCR);   
    }

    */
   
    gl.colorMask(true, true, true, true);
    gl.stencilFunc(gl.EQUAL,0xFF-3, 0xFF);///this.maskStack.length);
   // gl.stencilFunc(gl.EQUAL,2, 0xFF)
    gl.stencilOp(gl.KEEP,gl.KEEP,gl.KEEP);
};

PIXI.WebGLMaskManager.prototype.pushMaskReal = function(maskData, renderSession)
{
    var gl = this.gl;
    this.maskStack.push(maskData);
  //  console.log(this.maskStack.length, this.count++)
    var level = this.count++;
    var reverse = !(level % 2);
  
    if(level === 0)
    {
        gl.enable(gl.STENCIL_TEST);
        gl.stencilFunc(gl.ALWAYS,1,1);
        gl.clear(gl.STENCIL_BUFFER_BIT);
    }
    

    gl.colorMask(false, false, false, false); 
    
    gl.stencilFunc(gl.ALWAYS,0,0xFF);
    gl.stencilOp(gl.KEEP,gl.KEEP,gl.INVERT);
    PIXI.WebGLGraphics.renderGraphicsMask(maskData, renderSession);
   
    if(reverse)
    {
        gl.stencilFunc(gl.EQUAL, 0xFF - level, 0xFF);
        gl.stencilOp(gl.KEEP,gl.KEEP,gl.DECR);      
    }
    else
    {
        gl.stencilFunc(gl.EQUAL,level, 0xFF);
        gl.stencilOp(gl.KEEP,gl.KEEP,gl.INCR);      
    }

    PIXI.WebGLGraphics.renderGraphicsQuadMask(maskData, renderSession);

    if(reverse)
    {
        gl.stencilFunc(gl.EQUAL,0xFF-(level+1), 0xFF)
    }
    else
    {
        gl.stencilFunc(gl.EQUAL,level+1, 0xFF)
    }

    gl.colorMask(true, true, true, true);
    gl.stencilOp(gl.KEEP,gl.KEEP,gl.KEEP);
}



/**
* Removes the last filter from the filter stack and doesn't return it
* @method popMask
*
* @param renderSession {RenderSession} an object containing all the useful parameters
*/
PIXI.WebGLMaskManager.prototype.popMask = function(renderSession)
{
    this.popMaskReal(renderSession);
    return;
   // return;
    var gl = this.gl;

    var maskData = this.maskStack.pop();

    if(maskData)
    {
        gl.colorMask(false, false, false, false);

        //gl.stencilFunc(gl.ALWAYS,1,1);
        gl.stencilOp(gl.KEEP,gl.KEEP,gl.DECR);

        PIXI.WebGLGraphics.renderGraphics(maskData, renderSession);

        gl.colorMask(true, true, true, true);
        gl.stencilFunc(gl.LESS,0,this.maskStack.length);
        gl.stencilOp(gl.KEEP,gl.KEEP,gl.KEEP);
    }
   
    if(this.maskStack.length === 0)gl.disable(gl.STENCIL_TEST);
};

PIXI.WebGLMaskManager.prototype.popMaskReal = function(renderSession)
{
    var gl = this.gl;
    var maskData = this.maskStack.pop();

    var level = this.count;
    var reverse = !(this.count % 2);
  

    /*if(level === 0)
    {
        gl.enable(gl.STENCIL_TEST);
        gl.stencilFunc(gl.ALWAYS,1,1);
        gl.clear(gl.STENCIL_BUFFER_BIT);
    }*/

    if(maskData)
    {

        gl.colorMask(false, false, false, false); 
        
         if(!reverse)
        {
            gl.stencilFunc(gl.EQUAL, 0xFF - level, 0xFF);
            gl.stencilOp(gl.KEEP,gl.KEEP,gl.INCR);      
        }
        else
        {
            gl.stencilFunc(gl.EQUAL,level, 0xFF);
            gl.stencilOp(gl.KEEP,gl.KEEP,gl.DECR);      
        }

        PIXI.WebGLGraphics.renderGraphicsQuadMask(maskData, renderSession);

        gl.stencilFunc(gl.ALWAYS,0,0xFF);
        gl.stencilOp(gl.KEEP,gl.KEEP,gl.INVERT);
        PIXI.WebGLGraphics.renderGraphicsMask(maskData, renderSession);
       
    }
    
    if(level === 0)
    {
        //console.log(">>")
        gl.disable(gl.STENCIL_TEST);
    }
    else
    {  

        if(reverse)
        {
            gl.stencilFunc(gl.EQUAL,0xFF-(level-1), 0xFF)
        }
        else
        {
            gl.stencilFunc(gl.EQUAL,level-1, 0xFF)
        }

        gl.colorMask(true, true, true, true);
        gl.stencilOp(gl.KEEP,gl.KEEP,gl.KEEP);

    }   

    this.count--;
}

/**
* Destroys the mask stack
* @method destroy
*/
PIXI.WebGLMaskManager.prototype.destroy = function()
{
    this.maskStack = null;
    this.gl = null;
};