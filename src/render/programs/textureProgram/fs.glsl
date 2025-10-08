precision mediump float;

varying vec2 vTexPos;

uniform sampler2D uTexture;


void main()
{
    gl_FragColor = texture2D(uTexture, vTexPos);
}