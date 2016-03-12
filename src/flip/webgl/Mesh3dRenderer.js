var core = require('../../core'),
    Mesh = require('../../mesh/Mesh'),
    MeshRenderer = require('../../mesh/webgl/MeshRenderer'),
    glMat = require('gl-matrix');

/**
 * @author Mat Groves
 *
 * Big thanks to the very clever Matt DesLauriers <mattdesl> https://github.com/mattdesl/
 * for creating the original pixi version!
 * Also a thanks to https://github.com/bchevalier for tweaking the tint and alpha so that they now share 4 bytes on the vertex buffer
 *
 * Heavily inspired by LibGDX's MeshRenderer:
 * https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx/graphics/g2d/MeshRenderer.java
 */

/**
 *
 * @class
 * @private
 * @memberof PIXI.mesh
 * @extends PIXI.ObjectRenderer
 * @param renderer {PIXI.WebGLRenderer} The renderer this sprite batch works for.
 */
function Mesh3dRenderer(renderer)
{
    MeshRenderer.call(this, renderer);
    this.projection3d = glMat.mat4.create();
}

Mesh3dRenderer.prototype = Object.create(MeshRenderer.prototype);
Mesh3dRenderer.prototype.constructor = Mesh3dRenderer;
module.exports = Mesh3dRenderer;

core.WebGLRenderer.registerPlugin('mesh3d', Mesh3dRenderer);

/**
 * Renders the sprite object.
 *
 * @param mesh {PIXI.mesh.Mesh} the mesh to render
 */
Mesh3dRenderer.prototype.render = function (mesh)
{
    if(!mesh._vertexBuffer)
    {
        this._initWebGL(mesh);
    }

    var renderer = this.renderer,
        gl = renderer.gl,
        texture = mesh._texture.baseTexture,
        shader = mesh.shader;// || renderer.shaderManager.plugins.meshShader;

    var drawMode = mesh.drawMode === Mesh.DRAW_MODES.TRIANGLE_MESH ? gl.TRIANGLE_STRIP : gl.TRIANGLES;

    renderer.blendModeManager.setBlendMode(mesh.blendMode);

    //TODO cache custom state..
    if (!shader)
    {
        shader = renderer.shaderManager.plugins.mesh3dShader;
    }
    else
    {
        shader = shader.shaders[gl.id] || shader.getShader(renderer);// : shader;
    }

    this.renderer.shaderManager.setShader(shader);

    var projection2d = this.renderer.currentRenderTarget.projectionMatrix;
    var projection3d = this.projection3d;
    projection3d[0] = projection2d.a;
    projection3d[5] = projection2d.d;
    projection3d[12] = projection2d.tx;
    projection3d[13] = projection2d.ty;

    var currentProjection = mesh.worldProjectionMatrix;
    glMat.mat4.copy(shader.uniforms.translationMatrix.value, mesh.worldTransform3d);
    if (currentProjection) {
        glMat.mat4.multiply(shader.uniforms.projectionMatrix.value, projection3d, currentProjection);
    } else {
        glMat.mat4.copy(shader.uniforms.projectionMatrix.value, projection3d);
    }
    shader.uniforms.alpha.value = mesh.worldAlpha;

    shader.syncUniforms();

    if (!mesh.dirty)
    {
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh._vertexBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, mesh.vertices);
        gl.vertexAttribPointer(shader.attributes.aVertexPosition, 2, gl.FLOAT, false, 0, 0);

        // update the uvs
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh._uvBuffer);
        gl.vertexAttribPointer(shader.attributes.aTextureCoord, 2, gl.FLOAT, false, 0, 0);


        gl.activeTexture(gl.TEXTURE0);

       if (!texture._glTextures[gl.id])
        {
            this.renderer.updateTexture(texture);
        }
        else
        {
            // bind the current texture
            gl.bindTexture(gl.TEXTURE_2D, texture._glTextures[gl.id]);
        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh._indexBuffer);
        gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 0, mesh.indices);
    }
    else
    {
        mesh.dirty = false;
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh._vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, mesh.vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(shader.attributes.aVertexPosition, 2, gl.FLOAT, false, 0, 0);

        // update the uvs
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh._uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, mesh.uvs, gl.STATIC_DRAW);
        gl.vertexAttribPointer(shader.attributes.aTextureCoord, 2, gl.FLOAT, false, 0, 0);

         gl.activeTexture(gl.TEXTURE0);

        if (!texture._glTextures[gl.id])
        {
            this.renderer.updateTexture(texture);
        }
        else
        {
            // bind the current texture
            gl.bindTexture(gl.TEXTURE_2D, texture._glTextures[gl.id]);
        }

        // dont need to upload!
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh._indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW);

    }

    gl.drawElements(drawMode, mesh.indices.length, gl.UNSIGNED_SHORT, 0);

};
