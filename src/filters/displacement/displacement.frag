precision mediump float;

varying vec2 vMapCoord;
varying vec2 vTextureCoord;
varying vec4 vColor;

uniform vec2 scale;

uniform sampler2D uSampler;
uniform sampler2D mapSampler;

void main(void)
{
<<<<<<< HEAD
<<<<<<< HEAD
    vec2 mapCords = vTextureCoord;
    mapCords += (dimensions.zw + offset)/ dimensions.xy ;

    vec2 matSample = texture2D(displacementMap, mapCords).xy;
    matSample -= 0.5;
    matSample *= scale;
    matSample /= mapDimensions;

    gl_FragColor = texture2D(uSampler, mapCords);//vec2(vTextureCoord.x + matSample.x, vTextureCoord.y + matSample.y));

    // TODO: Is this needed?
 //    gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb, 0.5);
=======
   vec4 original =  texture2D(uSampler, vTextureCoord);
=======
>>>>>>> dev
   vec4 map =  texture2D(mapSampler, vMapCoord);

   map -= 0.5;
   map.xy *= scale;

   gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.x + map.x, vTextureCoord.y + map.y));
>>>>>>> dev
}
