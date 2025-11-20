varying vec4 vPosWorld;
varying float vDepth;

void main() {
  gl_FragColor = vec4(vPosWorld.xyz, vDepth);
}
