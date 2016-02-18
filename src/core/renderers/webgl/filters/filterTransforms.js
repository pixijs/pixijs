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
     //var worldTransform = sprite.worldTransform.copy(math.Matrix.TEMP_MATRIX),
    // var texture = {width:1136, height:700};//sprite._texture.baseTexture;

    // TODO unwrap?
    var mappedMatrix = outputMatrix.identity();

    mappedMatrix.translate(filterArea.x / textureSize.width, filterArea.y / textureSize.height );

    mappedMatrix.scale( textureSize.width , textureSize.height );

    return mappedMatrix;

};

var calculateNormalisedScreenSpaceMatrix = function (outputMatrix, filterArea, textureSize)
{
    //var worldTransform = sprite.worldTransform.copy(math.Matrix.TEMP_MATRIX),
    var texture = {width:800, height:600};//sprite._texture.baseTexture;

    // TODO unwrap?
    var mappedMatrix = outputMatrix.identity();

    // scale..
    var ratio = textureSize.height / textureSize.width;

    mappedMatrix.translate(filterArea.x / textureSize.width, filterArea.y / textureSize.height );

    mappedMatrix.scale(1 , ratio);

    var translateScaleX = (textureSize.width / texture.width);
    var translateScaleY = (textureSize.height / texture.height);

   // worldTransform.tx /= texture.width * translateScaleX;

    //this...?  free beer for anyone who can explain why this makes sense!
   // worldTransform.ty /= texture.width * translateScaleX;
    // worldTransform.ty /= texture.height * translateScaleY;

   // worldTransform.invert();
   // mappedMatrix.prepend(worldTransform);

    // apply inverse scale..
    mappedMatrix.scale(1 , 1/ratio);

    mappedMatrix.scale( translateScaleX , translateScaleY );

   // mappedMatrix.translate(sprite.anchor.x, sprite.anchor.y);

    return mappedMatrix;

};

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

    //this...?  free beer for anyone who can explain why this makes sense!
    worldTransform.ty /= texture.width * translateScaleX;
    // worldTransform.ty /= texture.height * translateScaleY;

    worldTransform.invert();
    mappedMatrix.prepend(worldTransform);

    // apply inverse scale..
    mappedMatrix.scale(1 , 1/ratio);

    mappedMatrix.scale( translateScaleX , translateScaleY );

    mappedMatrix.translate(sprite.anchor.x, sprite.anchor.y);

    return mappedMatrix;
};

module.exports = {
    calculateScreenSpaceMatrix:calculateScreenSpaceMatrix,
    calculateNormalisedScreenSpaceMatrix:calculateNormalisedScreenSpaceMatrix,
    calculateSpriteMatrix:calculateSpriteMatrix
};
