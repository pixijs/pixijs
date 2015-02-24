precision mediump float;

varying vec2 vTextureCoord;
varying vec4 vColor;

uniform sampler2D displacementMap;
uniform sampler2D uSampler;
uniform vec2 scale;
uniform vec2 offset;
uniform vec4 dimensions;
uniform vec2 mapDimensions; // = vec2(256.0, 256.0);
// const vec2 textureDimensions = vec2(750.0, 750.0);

void main(void)
{
    vec2 mapCords = vTextureCoord;
    mapCords += (dimensions.zw + offset)/ dimensions.xy ;

    vec2 matSample = texture2D(displacementMap, mapCords).xy;
    matSample -= 0.5;
    matSample *= scale;
    matSample /= mapDimensions;

    gl_FragColor = texture2D(uSampler, mapCords);//vec2(vTextureCoord.x + matSample.x, vTextureCoord.y + matSample.y));

    // TODO: Is this needed?
 //    gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb, 0.5);
}
