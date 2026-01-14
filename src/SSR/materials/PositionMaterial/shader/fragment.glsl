varying vec4 vPosInViewSpace;
varying vec2 vUV;

float chash12(vec2 p)
{
  vec3 p3  = fract(vec3(p.xyx) * .1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

void main() {
  float roughness = chash12(vUV);
  gl_FragColor = vec4(vPosInViewSpace.xyz, roughness);
}
