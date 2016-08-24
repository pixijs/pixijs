var core = require('../../core'),
    ParticleShader = require('./ParticleShader'),
    ParticleBuffer = require('./ParticleBuffer');

/**
 * @author Mat Groves
 *
 * Big thanks to the very clever Matt DesLauriers <mattdesl> https://github.com/mattdesl/
 * for creating the original pixi version!
 * Also a thanks to https://github.com/bchevalier for tweaking the tint and alpha so that they now share 4 bytes on the vertex buffer
 *
 * Heavily inspired by LibGDX's ParticleRenderer:
 * https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx/graphics/g2d/ParticleRenderer.java
 */

/**
 *
 * @class
 * @private
 * @memberof PIXI
 * @param renderer {PIXI.WebGLRenderer} The renderer this sprite batch works for.
 */
function ParticleRenderer(renderer)
{
    core.ObjectRenderer.call(this, renderer);

    // 65535 is max vertex index in the index buffer (see ParticleRenderer)
    // so max number of particles is 65536 / 4 = 16384
    // and max number of element in the index buffer is 16384 * 6 = 98304
    // Creating a full index buffer, overhead is 98304 * 2 = 196Ko
    // var numIndices = 98304;

    /**
     * The default shader that is used if a sprite doesn't have a more specific one.
     *
     * @member {PIXI.Shader}
     */
    this.shader = null;

    this.indexBuffer = null;

    this.properties = null;

    this.tempMatrix = new core.Matrix();

    this.CONTEXT_UID = 0;
}

ParticleRenderer.prototype = Object.create(core.ObjectRenderer.prototype);
ParticleRenderer.prototype.constructor = ParticleRenderer;
module.exports = ParticleRenderer;

core.WebGLRenderer.registerPlugin('particle', ParticleRenderer);

/**
 * When there is a WebGL context change
 *
 * @private
 */
ParticleRenderer.prototype.onContextChange = function ()
{
    var gl = this.renderer.gl;

    this.CONTEXT_UID = this.renderer.CONTEXT_UID;

    // setup default shader
    this.shader = new ParticleShader(gl);

    this.properties = [
        // verticesData
        {
            attribute:this.shader.attributes.aVertexPosition,
            size:2,
            uploadFunction:this.uploadVertices,
            offset:0
        },
        // positionData
        {
            attribute:this.shader.attributes.aPositionCoord,
            size:2,
            uploadFunction:this.uploadPosition,
            offset:0
        },
        // rotationData
        {
            attribute:this.shader.attributes.aRotation,
            size:1,
            uploadFunction:this.uploadRotation,
            offset:0
        },
        // uvsData
        {
            attribute:this.shader.attributes.aTextureCoord,
            size:2,
            uploadFunction:this.uploadUvs,
            offset:0
        },
        // alphaData
        {
            attribute:this.shader.attributes.aColor,
            size:1,
            uploadFunction:this.uploadAlpha,
            offset:0
        }
    ];

};

/**
 * Starts a new particle batch.
 *
 */
ParticleRenderer.prototype.start = function ()
{
    this.renderer.bindShader(this.shader);
};


/**
 * Renders the particle container object.
 *
 * @param container {PIXI.ParticleContainer} The container to render using this ParticleRenderer
 */
ParticleRenderer.prototype.render = function (container)
{
    var children = container.children,
        totalChildren = children.length,
        maxSize = container._maxSize,
        batchSize = container._batchSize;

    if(totalChildren === 0)
    {
        return;
    }
    else if(totalChildren > maxSize)
    {
        totalChildren = maxSize;
    }

    var buffers = container._glBuffers[this.renderer.CONTEXT_UID];

    if(!buffers)
    {
        buffers = container._glBuffers[this.renderer.CONTEXT_UID] = this.generateBuffers( container );
    }

    // if the uvs have not updated then no point rendering just yet!
    this.renderer.setBlendMode(container.blendMode);

    var gl = this.renderer.gl;

    var m = container.worldTransform.copy( this.tempMatrix );
    m.prepend( this.renderer._activeRenderTarget.projectionMatrix );
    this.shader.uniforms.projectionMatrix = m.toArray(true);
    this.shader.uniforms.uAlpha = container.worldAlpha;


    // make sure the texture is bound..
    var baseTexture = children[0]._texture.baseTexture;

    this.renderer.bindTexture(baseTexture);

    // now lets upload and render the buffers..
    for (var i = 0, j = 0; i < totalChildren; i += batchSize, j += 1)
    {
        var amount = ( totalChildren - i);
        if(amount > batchSize)
        {
            amount = batchSize;
        }

        var buffer = buffers[j];

        // we always upload the dynamic
        buffer.uploadDynamic(children, i, amount);

        // we only upload the static content when we have to!
        if(container._bufferToUpdate === j)
        {
            buffer.uploadStatic(children, i, amount);
            container._bufferToUpdate = j + 1;
        }

        // bind the buffer
        buffer.vao.bind()
        .draw(gl.TRIANGLES, amount * 6)
        .unbind();

         // now draw those suckas!
       // gl.drawElements(gl.TRIANGLES, amount * 6, gl.UNSIGNED_SHORT, 0);
       //  this.renderer.drawCount++;
    }
};

/**
 * Creates one particle buffer for each child in the container we want to render and updates internal properties
 *
 * @param container {PIXI.ParticleContainer} The container to render using this ParticleRenderer
 */
ParticleRenderer.prototype.generateBuffers = function (container)
{
    var gl = this.renderer.gl,
        buffers = [],
        size = container._maxSize,
        batchSize = container._batchSize,
        dynamicPropertyFlags = container._properties,
        i;

    for (i = 0; i < size; i += batchSize)
    {
        buffers.push(new ParticleBuffer(gl, this.properties, dynamicPropertyFlags, batchSize));
    }

    return buffers;
};

/**
 * Uploads the verticies.
 *
 * @param children {PIXI.DisplayObject[]} the array of display objects to render
 * @param startIndex {number} the index to start from in the children array
 * @param amount {number} the amount of children that will have their vertices uploaded
 * @param array {number[]}
 * @param stride {number}
 * @param offset {number}
 */
ParticleRenderer.prototype.uploadVertices = function (children, startIndex, amount, array, stride, offset)
{
    var sprite,
        texture,
        trim,
        orig,
        sx,
        sy,
        w0, w1, h0, h1;

    for (var i = 0; i < amount; i++) {

        sprite = children[startIndex + i];
        texture = sprite._texture;
        sx = sprite.scale.x;
        sy = sprite.scale.y;
        trim = texture.trim;
        orig = texture.orig;

        if (trim)
        {
            // if the sprite is trimmed and is not a tilingsprite then we need to add the extra space before transforming the sprite coords..
            w1 = trim.x - sprite.anchor.x * orig.width;
            w0 = w1 + trim.width;

            h1 = trim.y - sprite.anchor.y * orig.height;
            h0 = h1 + trim.height;

        }
        else
        {
            w0 = (orig.width ) * (1-sprite.anchor.x);
            w1 = (orig.width ) * -sprite.anchor.x;

            h0 = orig.height * (1-sprite.anchor.y);
            h1 = orig.height * -sprite.anchor.y;
        }

        array[offset] = w1 * sx;
        array[offset + 1] = h1 * sy;

        array[offset + stride] = w0 * sx;
        array[offset + stride + 1] = h1 * sy;

        array[offset + stride * 2] = w0 * sx;
        array[offset + stride * 2 + 1] = h0 * sy;

        array[offset + stride * 3] = w1 * sx;
        array[offset + stride * 3 + 1] = h0 * sy;

        offset += stride * 4;
    }

};

/**
 *
 * @param children {PIXI.DisplayObject[]} the array of display objects to render
 * @param startIndex {number} the index to start from in the children array
 * @param amount {number} the amount of children that will have their positions uploaded
 * @param array {number[]}
 * @param stride {number}
 * @param offset {number}
 */
ParticleRenderer.prototype.uploadPosition = function (children,startIndex, amount, array, stride, offset)
{
    for (var i = 0; i < amount; i++)
    {
        var spritePosition = children[startIndex + i].position;

        array[offset] = spritePosition.x;
        array[offset + 1] = spritePosition.y;

        array[offset + stride] = spritePosition.x;
        array[offset + stride + 1] = spritePosition.y;

        array[offset + stride * 2] = spritePosition.x;
        array[offset + stride * 2 + 1] = spritePosition.y;

        array[offset + stride * 3] = spritePosition.x;
        array[offset + stride * 3 + 1] = spritePosition.y;

        offset += stride * 4;
    }

};

/**
 *
 * @param children {PIXI.DisplayObject[]} the array of display objects to render
 * @param startIndex {number} the index to start from in the children array
 * @param amount {number} the amount of children that will have their rotation uploaded
 * @param array {number[]}
 * @param stride {number}
 * @param offset {number}
 */
ParticleRenderer.prototype.uploadRotation = function (children,startIndex, amount, array, stride, offset)
{
    for (var i = 0; i < amount; i++)
    {
        var spriteRotation = children[startIndex + i].rotation;


        array[offset] = spriteRotation;
        array[offset + stride] = spriteRotation;
        array[offset + stride * 2] = spriteRotation;
        array[offset + stride * 3] = spriteRotation;

        offset += stride * 4;
    }
};

/**
 *
 * @param children {PIXI.DisplayObject[]} the array of display objects to render
 * @param startIndex {number} the index to start from in the children array
 * @param amount {number} the amount of children that will have their Uvs uploaded
 * @param array {number[]}
 * @param stride {number}
 * @param offset {number}
 */
ParticleRenderer.prototype.uploadUvs = function (children,startIndex, amount, array, stride, offset)
{
    for (var i = 0; i < amount; i++)
    {
        var textureUvs = children[startIndex + i]._texture._uvs;

        if (textureUvs)
        {
            array[offset] = textureUvs.x0;
            array[offset + 1] = textureUvs.y0;

            array[offset + stride] = textureUvs.x1;
            array[offset + stride + 1] = textureUvs.y1;

            array[offset + stride * 2] = textureUvs.x2;
            array[offset + stride * 2 + 1] = textureUvs.y2;

            array[offset + stride * 3] = textureUvs.x3;
            array[offset + stride * 3 + 1] = textureUvs.y3;

            offset += stride * 4;
        }
        else
        {
            //TODO you know this can be easier!
            array[offset] = 0;
            array[offset + 1] = 0;

            array[offset + stride] = 0;
            array[offset + stride + 1] = 0;

            array[offset + stride * 2] = 0;
            array[offset + stride * 2 + 1] = 0;

            array[offset + stride * 3] = 0;
            array[offset + stride * 3 + 1] = 0;

            offset += stride * 4;
        }
    }
};

/**
 *
 * @param children {PIXI.DisplayObject[]} the array of display objects to render
 * @param startIndex {number} the index to start from in the children array
 * @param amount {number} the amount of children that will have their alpha uploaded
 * @param array {number[]}
 * @param stride {number}
 * @param offset {number}
 */
ParticleRenderer.prototype.uploadAlpha = function (children,startIndex, amount, array, stride, offset)
{
     for (var i = 0; i < amount; i++)
     {
        var spriteAlpha = children[startIndex + i].alpha;

        array[offset] = spriteAlpha;
        array[offset + stride] = spriteAlpha;
        array[offset + stride * 2] = spriteAlpha;
        array[offset + stride * 3] = spriteAlpha;

        offset += stride * 4;
    }
};


/**
 * Destroys the ParticleRenderer.
 *
 */
ParticleRenderer.prototype.destroy = function ()
{
    if (this.renderer.gl) {
        this.renderer.gl.deleteBuffer(this.indexBuffer);
    }
    core.ObjectRenderer.prototype.destroy.apply(this, arguments);

    this.shader.destroy();

    this.indices = null;
    this.tempMatrix = null;
};
