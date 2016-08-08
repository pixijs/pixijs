attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;
uniform vec4 filterArea;
uniform vec2 center;
uniform float haloScale;

varying vec2 vTextureCoord;
varying vec2 vTextureCoordScaled;


vec2 mapCoord( vec2 coord )
{
    coord *= filterArea.xy;
    coord += filterArea.zw;

    return coord;
}

vec2 unmapCoord( vec2 coord )
{
    coord -= filterArea.zw;
    coord /= filterArea.xy;

    return coord;
}


void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;

    vec2 transl = mapCoord(aTextureCoord);

    vec2 c = center;//vec2(1280.0/2.0, 720.0/2.0);

    transl -= c;

    transl *= haloScale;

    transl += c ;

    transl = unmapCoord(transl);

//    center
    vTextureCoordScaled = transl;
}

