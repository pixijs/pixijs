precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform float radius;
uniform float angle;
uniform vec2 offset;

void main(void)
{
   vec2 coord = vTextureCoord - offset;
   float dist = length(coord);

   if (dist < radius)
   {
       float ratio = (radius - dist) / radius;
       float angleMod = ratio * ratio * angle;
       float s = sin(angleMod);
       float c = cos(angleMod);
       coord = vec2(coord.x * c - coord.y * s, coord.x * s + coord.y * c);
   }

   gl_FragColor = texture2D(uSampler, coord+offset);
}
