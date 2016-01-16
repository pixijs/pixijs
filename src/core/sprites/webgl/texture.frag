precision lowp float;

vec4 getSampleFromArray16(sampler2D textures[16], int ndx, vec2 uv) {

vec4 color;

if(ndx == 0)
{
    color = texture2D(textures[0], uv);
}
else if(ndx == 1)
{
    color = texture2D(textures[1], uv);
}
else if(ndx == 2)
{
    color = texture2D(textures[2], uv);
}
else if(ndx == 3)
{
    color = texture2D(textures[3], uv);
}
else if(ndx == 4)
{
    color = texture2D(textures[4], uv);
}
else if(ndx == 5)
{
    color = texture2D(textures[5], uv);
}
else if(ndx == 6)
{
    color = texture2D(textures[6], uv);
}
else if(ndx == 7)
{
    color = texture2D(textures[7], uv);
}
else if(ndx == 8)
{
    color = texture2D(textures[8], uv);
}
else if(ndx == 9)
{
    color = texture2D(textures[9], uv);
}
else if(ndx == 10)
{
    color = texture2D(textures[10], uv);
}
else if(ndx == 11)
{
    color = texture2D(textures[11], uv);
}
else if(ndx == 12)
{
    color = texture2D(textures[12], uv);
}
else if(ndx == 13)
{
    color = texture2D(textures[13], uv);
}
else if(ndx == 14)
{
    color = texture2D(textures[14], uv);
}
else 
{
    color = texture2D(textures[15], uv);
}

return color;
}

varying vec2 vTextureCoord;
varying vec4 vColor;
varying float vTextureId;
uniform sampler2D uSamplers[16];
void main(void){
gl_FragColor = getSampleFromArray16(uSamplers, int(vTextureId), vTextureCoord) * vColor;
}