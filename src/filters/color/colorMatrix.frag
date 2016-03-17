precision mediump float;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float m[25];

void main(void)
{

    vec4 c = texture2D(uSampler, vTextureCoord);

    gl_FragColor.r = (m[0] * c.r);
        gl_FragColor.r += (m[1] * c.g);
        gl_FragColor.r += (m[2] * c.b);
        gl_FragColor.r += (m[3] * c.a);
        gl_FragColor.r += m[4] * c.a;

    gl_FragColor.g = (m[5] * c.r);
        gl_FragColor.g += (m[6] * c.g);
        gl_FragColor.g += (m[7] * c.b);
        gl_FragColor.g += (m[8] * c.a);
        gl_FragColor.g += m[9] * c.a;

     gl_FragColor.b = (m[10] * c.r);
        gl_FragColor.b += (m[11] * c.g);
        gl_FragColor.b += (m[12] * c.b);
        gl_FragColor.b += (m[13] * c.a);
        gl_FragColor.b += m[14] * c.a;

     gl_FragColor.a = (m[15] * c.r);
        gl_FragColor.a += (m[16] * c.g);
        gl_FragColor.a += (m[17] * c.b);
        gl_FragColor.a += (m[18] * c.a);
        gl_FragColor.a += m[19] * c.a;

}
