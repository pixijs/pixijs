
in vec2 vTextureCoord;
in vec4 vColor;

out vec4 finalColor;

uniform float uBlend;

uniform sampler2D uSampler;
uniform sampler2D backTexture;

{FUNCTIONS}

void main()
{ 
    vec4 back = texture(backTexture, vTextureCoord);
    vec4 front = texture(uSampler, vTextureCoord);

    {MAIN}
}
