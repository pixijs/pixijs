var GraphicsRenderer = require('../../core/graphics/webgl/GraphicsRenderer'),
    WebGLRenderer = require('../../core/renderers/webgl/WebGLRenderer'),
    Primitive3dShader = require('./Primitive3dShader'),
    utils = require('../../core/utils'),
    glMat = require('gl-matrix')

/**
 * @author Mat Groves
 *
 * Big thanks to the very clever Matt DesLauriers <mattdesl> https://github.com/mattdesl/
 * for creating the original pixi version!
 * Also a thanks to https://github.com/bchevalier for tweaking the tint and alpha so that they now share 4 bytes on the vertex buffer
 *
 * Heavily inspired by LibGDX's Graphics3dRenderer:
 * https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx/graphics/g2d/Graphics3dRenderer.java
 */

/**
 *
 * @class
 * @private
 * @namespace PIXI
 * @param renderer {WebGLRenderer} The renderer this sprite batch works for.
 */
function Graphics3dRenderer(renderer)
{
    GraphicsRenderer.call(this, renderer);

    this.shader3d = null;

      // TODO will need to set up this proper fov. but this works great for now!
    this.perspectiveMatrix = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 1,
        0, 0, 0, 1
    ];

    //this.perspectiveMatrix = makePerspective(45 * (Math.PI / 180), 1, 1, 2000)
    this.projection3d = glMat.mat4.create();
}


Graphics3dRenderer.prototype = Object.create(GraphicsRenderer.prototype);
Graphics3dRenderer.prototype.constructor = Graphics3dRenderer;

/**
 * Renders a graphics object.
 *
 * @param graphics {Graphics} The graphics object to render.
 */
Graphics3dRenderer.prototype.render = function(graphics)
{
    var renderer = this.renderer;
    var gl = renderer.gl;

    var shader =  this.shader3d,
        webGLData;

    if (graphics.dirty)
    {
        this.updateGraphics(graphics, gl);
    }

    var webGL = graphics._webGL[gl.id];

  //  console.log("HI MAAMM")
    // This  could be speeded up for sure!

    renderer.blendModeManager.setBlendMode( graphics.blendMode );

//    var matrix =  graphics.worldTransform.clone();
//    var matrix =  renderer.currentRenderTarget.projectionMatrix.clone();
//    matrix.append(graphics.worldTransform);

    for (var i = 0; i < webGL.data.length; i++)
    {
        if (webGL.data[i].mode === 1)
        {
            webGLData = webGL.data[i];

            renderer.stencilManager.pushStencil(graphics, webGLData, renderer);

            gl.uniform1f(renderer.shaderManager.complexPrimitiveShader.uniforms.alpha._location, graphics.worldAlpha * webGLData.alpha);

            // render quad..
            gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_SHORT, ( webGLData.indices.length - 4 ) * 2 );

            renderer.stencilManager.popStencil(graphics, webGLData, renderer);
        }
        else
        {
            webGLData = webGL.data[i];


            shader =  this.shader3d//renderer.shaderManager.primitiveShader;

            renderer.shaderManager.setShader( shader );//activatePrimitiveShader();



            var projection2d = this.renderer.currentRenderTarget.projectionMatrix;
            var projection3d = this.projection3d;

            projection3d[0] = projection2d.a;
            projection3d[5] = projection2d.d;
            projection3d[10] = 2 / 1700;

            // tx // ty
            projection3d[12] = projection2d.tx;
            projection3d[13] = projection2d.ty;

             // time to make a 3d one!
            var combinedMatrix = glMat.mat4.multiply(glMat.mat4.create(), this.perspectiveMatrix, projection3d);

            gl.uniformMatrix4fv(shader.uniforms.projectionMatrix3d._location, false, combinedMatrix);
            gl.uniformMatrix4fv(shader.uniforms.translationMatrix3d._location, false, graphics.worldTransform3d);

            gl.uniform3fv(shader.uniforms.tint._location, utils.hex2rgb(graphics.tint));
            gl.uniform1f(shader.uniforms.alpha._location, graphics.worldAlpha);

            gl.bindBuffer(gl.ARRAY_BUFFER, webGLData.buffer);

            gl.vertexAttribPointer(shader.attributes.aVertexPosition, 2, gl.FLOAT, false, 4 * 6, 0);
            gl.vertexAttribPointer(shader.attributes.aColor, 4, gl.FLOAT, false,4 * 6, 2 * 4);

            // set the index buffer!
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, webGLData.indexBuffer);
            gl.drawElements(gl.TRIANGLE_STRIP,  webGLData.indices.length, gl.UNSIGNED_SHORT, 0 );
        }
    }
};

Graphics3dRenderer.prototype.onContextChange = function ()
{
    var gl = this.renderer.gl;

    // setup default shader
    this.shader3d = new Primitive3dShader(this.renderer.shaderManager);// this.renderer.shaderManager.defaultShader;

}

module.exports = Graphics3dRenderer;

WebGLRenderer.registerPlugin('graphics3d', Graphics3dRenderer);

