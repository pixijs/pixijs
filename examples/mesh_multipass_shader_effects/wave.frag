precision mediump float;
varying vec2 vUvs;
uniform float amplitude;
uniform float time;

void main()
{
    //Offset uv so that center is 0,0 and edges are -1,1
    vec2 uv = (vUvs-vec2(0.5))*2.0;

    vec3 outColor = vec3(0.);

    //Simple wavefunctions inversed and with small offsets.
    outColor += 5./length(uv.y*200. - 50.0*sin( uv.x*0.25+ time*0.25)*amplitude);
    outColor += 4./length(uv.y*300. - 100.0*sin(uv.x*0.5+time*0.5)*amplitude*1.2);
    outColor += 3./length(uv.y*400. - 150.0*sin(uv.x*0.75+time*0.75)*amplitude*1.4);
    outColor += 2./length(uv.y*500. - 200.0*sin(uv.x+time)*amplitude*1.6);

    gl_FragColor = vec4(outColor,1.0);
}