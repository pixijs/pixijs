
in vec2 vTextureCoord;
in vec2 backgroundUv;
in vec4 vColor;

out vec4 fragColor;

uniform float uBlend;

uniform sampler2D myTexture;
uniform sampler2D backTexture;

{FUNCTIONS}

void main()
{ 
    vec4 back = texture(backTexture, backgroundUv);
    vec4 front = texture(myTexture, vTextureCoord);

    {MAIN}
}
