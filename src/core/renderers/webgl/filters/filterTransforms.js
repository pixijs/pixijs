var math = require('../../../math');

/*
 * Calculates the mapped matrix
 * @param filterArea {Rectangle} The filter area
 * @param sprite {Sprite} the target sprite
 * @param outputMatrix {Matrix} @alvin
 */
// TODO playing around here.. this is temporary - (will end up in the shader)
// thia returns a matrix that will normalise map filter cords in the filter to screen space
var calculateScreenSpaceMatrix = function (outputMatrix, filterArea, textureSize)
{
    var mappedMatrix = outputMatrix;

    mappedMatrix.a = textureSize.width;
    mappedMatrix.b = 0;
    mappedMatrix.c = 0;
    mappedMatrix.d = textureSize.height;
    mappedMatrix.tx = filterArea.x;
    mappedMatrix.ty = filterArea.y;

    return mappedMatrix;
}

var calculateNormalisedScreenSpaceMatrix = function (outputMatrix, filterArea, textureSize, screenSize)
{
    var mappedMatrix = outputMatrix;
    
    mappedMatrix.a = textureSize.width / screenSize.width;
    mappedMatrix.b = 0;
    mappedMatrix.c = 0;
    mappedMatrix.d = textureSize.height / screenSize.height;
    mappedMatrix.tx = filterArea.x / screenSize.width;
    mappedMatrix.ty = filterArea.y / screenSize.height;

    return mappedMatrix;
}

// this will map the filter coord so that a texture can be used based on the transform of a sprite
var calculateSpriteMatrix = function (outputMatrix, filterArea, textureSize, sprite)
{
    var worldTransform = sprite.worldTransform.copy(math.Matrix.TEMP_MATRIX),
    texture = sprite._texture.baseTexture;

    // TODO unwrap?
    var mappedMatrix = outputMatrix.identity();

    // scale..
    var ratio = textureSize.height / textureSize.width;

    mappedMatrix.translate(filterArea.x / textureSize.width, filterArea.y / textureSize.height );

    mappedMatrix.scale(1 , ratio);

    var translateScaleX = (textureSize.width / texture.width);
    var translateScaleY = (textureSize.height / texture.height);

    worldTransform.tx /= texture.width * translateScaleX;
 
    //this...?
    //   worldTransform.ty /= texture.width * translateScaleX;
    worldTransform.ty /= texture.height * translateScaleY;

    worldTransform.invert();
    mappedMatrix.prepend(worldTransform);

    // apply inverse scale..
    mappedMatrix.scale(1 , 1/ratio);

    mappedMatrix.scale( translateScaleX , translateScaleY );

    mappedMatrix.translate(sprite.anchor.x, sprite.anchor.y);

    return mappedMatrix;

    // Keeping the orginal as a reminder to me on how this works!
    //
    // var m = new math.Matrix();

    // // scale..
    // var ratio = this.textureSize.height / this.textureSize.width;

    // m.translate(filterArea.x / this.textureSize.width, filterArea.y / this.textureSize.height);


    // m.scale(1 , ratio);


    // var transform = wt.clone();

    // var translateScaleX = (this.textureSize.width / 620);
    // var translateScaleY = (this.textureSize.height / 380);

    // transform.tx /= 620 * translateScaleX;
    // transform.ty /= 620 * translateScaleX;

    // transform.invert();

    // transform.append(m);

    // // apply inverse scale..
    // transform.scale(1 , 1/ratio);

    // transform.scale( translateScaleX , translateScaleY );

    // return transform;
};

module.exports = {
    calculateScreenSpaceMatrix:calculateScreenSpaceMatrix,
    calculateNormalisedScreenSpaceMatrix:calculateNormalisedScreenSpaceMatrix,
    calculateSpriteMatrix:calculateSpriteMatrix  
};