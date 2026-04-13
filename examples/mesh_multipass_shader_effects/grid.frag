precision mediump float;
varying vec2 vUvs;
uniform float zoom;

void main()
{
    //Generate a simple grid.
    //Offset uv so that center is 0,0 and edges are -1,1
    vec2 uv = (vUvs-vec2(0.5))*2.0;
    vec2 gUv = floor(uv*zoom);
    vec4 color1 = vec4(0.8, 0.8, 0.8, 1.0);
    vec4 color2 = vec4(0.4, 0.4, 0.4, 1.0);
    vec4 outColor = mod(gUv.x + gUv.y, 2.) < 0.5 ? color1 : color2;
    finalColor = outColor;

}