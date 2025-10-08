attribute vec2 aPos;
attribute vec2 aTexPos;

uniform mat3 uMatP;
uniform mat3 uMatV;
uniform mat3 uMat;

varying vec2 vTexPos;


void main()
{
    vec2 pos = (uMatP * uMatV * uMat * vec3(aPos, 1)).xy;
    gl_Position = vec4(pos, 0, 1);

    vTexPos = aTexPos;
}