import math from '../../../math';

/*
 * Calculates the mapped matrix
 * @param filterArea {Rectangle} The filter area
 * @param sprite {Sprite} the target sprite
 * @param outputMatrix {Matrix} @alvin
 */
// TODO playing around here.. this is temporary - (will end up in the shader)
// thia returns a matrix that will normalise map filter cords in the filter to screen space
const calculateScreenSpaceMatrix = function (outputMatrix, filterArea, textureSize)
{
     //let worldTransform = sprite.worldTransform.copy(math.Matrix.TEMP_MATRIX),
    // let texture = {width:1136, height:700};//sprite._texture.baseTexture;

    // TODO unwrap?
    const mappedMatrix = outputMatrix.identity();

    mappedMatrix.translate(filterArea.x / textureSize.width, filterArea.y / textureSize.height );

    mappedMatrix.scale( textureSize.width , textureSize.height );

    return mappedMatrix;

};

const calculateNormalizedScreenSpaceMatrix = function (outputMatrix, filterArea, textureSize)
{
    const mappedMatrix = outputMatrix.identity();

    mappedMatrix.translate(filterArea.x / textureSize.width, filterArea.y / textureSize.height );

    const translateScaleX = (textureSize.width / filterArea.width);
    const translateScaleY = (textureSize.height / filterArea.height);

    mappedMatrix.scale( translateScaleX , translateScaleY );

    return mappedMatrix;
};

// this will map the filter coord so that a texture can be used based on the transform of a sprite
const calculateSpriteMatrix = function (outputMatrix, filterArea, textureSize, sprite)
{
    const worldTransform = sprite.worldTransform.copy(math.Matrix.TEMP_MATRIX),
    texture = sprite._texture.baseTexture;

    // TODO unwrap?
    const mappedMatrix = outputMatrix.identity();

    // scale..
    const ratio = textureSize.height / textureSize.width;

    mappedMatrix.translate(filterArea.x / textureSize.width, filterArea.y / textureSize.height );

    mappedMatrix.scale(1 , ratio);

    const translateScaleX = (textureSize.width / texture.width);
    const translateScaleY = (textureSize.height / texture.height);

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

export default {
    calculateScreenSpaceMatrix,
    calculateNormalizedScreenSpaceMatrix,
    calculateSpriteMatrix
};
