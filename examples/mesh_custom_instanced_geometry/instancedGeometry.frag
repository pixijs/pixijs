in vec2 vUV;
uniform sampler2D uTexture;
uniform float time;

void main() {
    gl_FragColor = texture(uTexture, vUV + sin( (time + (vUV.x) * 14.) ) * 0.1 );
}