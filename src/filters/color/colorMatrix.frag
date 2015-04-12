precision mediump float;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float m[24];

void main(void)
{

    vec4 c = texture2D(uSampler, vTextureCoord);

    gl_FragColor.r = (m[0] * c.r) + m[20];
        gl_FragColor.r += (m[1] * c.g) + m[21];
        gl_FragColor.r += (m[2] * c.b) + m[22];
        gl_FragColor.r += (m[3] * c.a) + m[23];
        gl_FragColor.r += m[4];
    gl_FragColor.g = (m[5] * c.r) + m[20];
        gl_FragColor.g += (m[6] * c.g) + m[21];
        gl_FragColor.g += (m[7] * c.b) + m[22];
        gl_FragColor.g += (m[8] * c.a) + m[23];
        gl_FragColor.g += m[9];
     gl_FragColor.b = (m[10] * c.r) + m[20];
        gl_FragColor.b += (m[11] * c.g) + m[21];
        gl_FragColor.b += (m[12] * c.b) + m[22];
        gl_FragColor.b += (m[13] * c.a) + m[23];
        gl_FragColor.b += m[14];
     gl_FragColor.a = (m[15] * c.r) + m[20];
        gl_FragColor.a += (m[16] * c.g) + m[21];
        gl_FragColor.a += (m[17] * c.b) + m[22];
        gl_FragColor.a += (m[18] * c.a) + m[23];
        gl_FragColor.a += m[19];

}
