
/**
 * @author Mat Groves
 *
 * Big thanks to the very clever Matt DesLauriers <mattdesl> https://github.com/mattdesl/
 * for creating the original pixi version!
 * Also a thanks to https://github.com/bchevalier for tweaking the tint and alpha so that they now share 4 bytes on the vertex buffer
 *
 * Heavily inspired by LibGDX's ParticleBuffer:
 * https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx/graphics/g2d/ParticleBuffer.java
 */

/**
 *
 * @class
 * @private
 * @namespace PIXI
 * @param renderer {WebGLRenderer} The renderer this sprite batch works for.
 */
function ParticleBuffer(gl, size, shader )
{
    this.gl = gl;

    /**
     *
     *
     * @member {number}
     */
    this.vertSize = 2;

    /**
     *
     *
     * @member {number}
     */
    this.vertByteSize = this.vertSize * 4;

    /**
     * The number of images in the SpriteBatch before it flushes.
     *
     * @member {number}
     */
    this.size = size;

    this.verticiesData = {
        attribute:shader.attributes.aVertexPosition,
        dynamic:true,
        size:2,
        uploadFunction:this.uploadVerticies.bind(this),
        offset:0
    };

    this.positionData = {
        attribute:shader.attributes.aPositionCoord,
        dynamic:true,
        size:2,
        uploadFunction:this.uploadPosition.bind(this),
        offset:0
    };

    this.rotationData = {
        attribute:shader.attributes.aRotation,
        dynamic:true,
        size:1,
        uploadFunction:this.uploadRotation.bind(this),
        offset:0
    };

    this.uvsData = {
        attribute:shader.attributes.aTextureCoord,
        dynamic:true,
        size:2,
        uploadFunction:this.uploadUvs.bind(this),
        offset:0
    };

    this.alphaData = {
        attribute:shader.attributes.aColor,
        dynamic:true,
        size:1,
        uploadFunction:this.uploadAlpha.bind(this),
        offset:0
    };

    this.dynamicProperties = [
       // this.verticiesData,
        this.positionData
       // this.rotationData,
       // this.uvsData
       // this.alphaData
    ];

    this.staticProperties = [
        this.verticiesData,
      //  this.positionData,
        this.rotationData,
        this.uvsData,
        this.alphaData
    ];

    this.staticStride = 0;
    this.staticBuffer = null;
    this.staticData = null;

    this.dynamicStride = 0;
    this.dynamicBuffer = null;
    this.dynamicData = null;

    this.initBuffers();

}

ParticleBuffer.prototype.constructor = ParticleBuffer;
module.exports = ParticleBuffer;

/**
 * Sets up the renderer context and necessary buffers.
 *
 * @private
 * @param gl {WebGLContext} the current WebGL drawing context
 */
ParticleBuffer.prototype.initBuffers = function ()
{
    var gl = this.gl;
    var i;
    var property;

    var dynamicOffset = 0;
    this.dynamicStride = 0;

    for (i = 0; i < this.dynamicProperties.length; i++)
    {
        property = this.dynamicProperties[i];

        if(property.dynamic)
        {
            property.offset = dynamicOffset;
            dynamicOffset += property.size;
            this.dynamicStride += property.size;
        }
    }

    this.dynamicData = new Float32Array( this.size * this.dynamicStride * 4);
    this.dynamicBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.dynamicBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.dynamicData, gl.DYNAMIC_DRAW);


    // static //
    var staticOffset = 0;
    this.staticStride = 0;

    for (i = 0; i < this.staticProperties.length; i++)
    {
        property = this.staticProperties[i];

        if(property.dynamic)
        {
            property.offset = staticOffset;
            staticOffset += property.size;
            this.staticStride += property.size;
        }
    }

    this.staticData = new Float32Array( this.size * this.staticStride * 4);
    this.staticBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.staticBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.staticData, gl.DYNAMIC_DRAW);

};

ParticleBuffer.prototype.upload = function(children, startIndex, amount, uploadStatic)
{
    var i, property;
    var gl = this.gl;

    for (i = 0; i < this.dynamicProperties.length; i++)
    {
        property = this.dynamicProperties[i];
        property.uploadFunction(children, startIndex, amount, this.dynamicData, this.dynamicStride, property.offset);
    }



    gl.bindBuffer(gl.ARRAY_BUFFER, this.dynamicBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.dynamicData);

    if(uploadStatic)
    {
        for (i = 0; i < this.staticProperties.length; i++)
        {
            property = this.staticProperties[i];
            property.uploadFunction(children, startIndex, amount, this.staticData, this.staticStride, property.offset);
        }


        gl.bindBuffer(gl.ARRAY_BUFFER, this.staticBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.staticData);
    }
};

ParticleBuffer.prototype.uploadVerticies = function (children, startIndex, amount, array, stride, offset)
{
    //console.log(">>>", array)
    //var vertices = this.vertices,
        var sprite,
        texture,
        trim,
        sx,
        sy,
        w0, w1, h0, h1;

    for (var i = 0; i < amount; i++) {

        sprite = children[startIndex + i];
        texture = sprite._texture;
        sx = sprite.scale.x;
        sy = sprite.scale.y;

        if (texture.trim)
        {
            // if the sprite is trimmed then we need to add the extra space before transforming the sprite coords..
            trim = texture.trim;

            w1 = trim.x - sprite.anchor.x * trim.width;
            w0 = w1 + texture.crop.width;

            h1 = trim.y - sprite.anchor.y * trim.height;
            h0 = h1 + texture.crop.height;
        }
        else
        {
            w0 = (texture._frame.width ) * (1-sprite.anchor.x);
            w1 = (texture._frame.width ) * -sprite.anchor.x;

            h0 = texture._frame.height * (1-sprite.anchor.y);
            h1 = texture._frame.height * -sprite.anchor.y;
        }

    //    var pos = stride * i;

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


ParticleBuffer.prototype.uploadPosition = function (children,startIndex, amount, array, stride, offset)
{
        var spritePosition;

    for (var i = 0; i < amount; i++) {

        spritePosition = children[startIndex + i].position;

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

ParticleBuffer.prototype.uploadRotation = function (children,startIndex, amount, array, stride, offset)
{
        var spriteRotation;

    for (var i = 0; i < amount; i++) {

        spriteRotation = children[startIndex + i].rotation;


         array[offset] = spriteRotation;
         array[offset + stride] = spriteRotation;
         array[offset + stride * 2] = spriteRotation;
         array[offset + stride * 3] = spriteRotation;

        offset += stride * 4;
    }
};

ParticleBuffer.prototype.uploadUvs = function (children,startIndex, amount, array, stride, offset)
{
    var textureUvs;

    for (var i = 0; i < amount; i++) {

        textureUvs = children[startIndex + i]._texture._uvs;

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

ParticleBuffer.prototype.uploadAlpha = function (children,startIndex, amount, array, stride, offset)
{
    var spriteAlpha;

     for (var i = 0; i < amount; i++) {

        spriteAlpha = children[startIndex + i].alpha;

        array[offset] = spriteAlpha;
        array[offset + stride] = spriteAlpha;
        array[offset + stride * 2] = spriteAlpha;
        array[offset + stride * 3] = spriteAlpha;

        offset += stride * 4;
    }
};

ParticleBuffer.prototype.uploadToBuffer = function (buffer, data, dataSize, amount)
{
    var gl = this.gl;

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    if (this.currentBatchSize > ( this.size * 0.5 ) )
    {
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, data);
    }
    else
    {
        var view = data.subarray(0,  amount * dataSize);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, view);
    }
};

/**
 * Starts a new sprite batch.
 *
 */
ParticleBuffer.prototype.bind = function ()
{
    var gl = this.gl;
    var i, property;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.dynamicBuffer);

    for (i = 0; i < this.dynamicProperties.length; i++)
    {
        property = this.dynamicProperties[i];
        gl.vertexAttribPointer(property.attribute, property.size, gl.FLOAT, false, this.dynamicStride * 4, property.offset * 4);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.staticBuffer);

    for (i = 0; i < this.staticProperties.length; i++)
    {
        property = this.staticProperties[i];
        gl.vertexAttribPointer(property.attribute, property.size, gl.FLOAT, false, this.staticStride * 4, property.offset * 4);
    }
};

/**
 * Destroys the SpriteBatch.
 *
 */
ParticleBuffer.prototype.destroy = function ()
{
    //TODO implement this :) to busy making the fun bits..
};
