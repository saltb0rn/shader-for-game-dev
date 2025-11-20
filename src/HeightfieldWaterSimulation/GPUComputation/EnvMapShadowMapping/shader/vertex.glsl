varying vec4 vPosWorld;
varying float vDepth;

void main() {
  vPosWorld = modelMatrix * vec4(position, 1.);
  vec4 posClip = projectionMatrix * viewMatrix * vPosWorld;
  // vDepth = posClip.z / posClip.w * 0.5 + 0.5;
  vDepth = posClip.z;
  gl_Position = posClip;
}
