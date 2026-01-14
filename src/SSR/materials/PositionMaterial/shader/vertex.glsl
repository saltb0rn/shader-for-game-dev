varying vec4 vPosInViewSpace;
varying vec2 vUV;

void main() {
  vPosInViewSpace = modelViewMatrix * vec4(position, 1.);
  vUV = uv;
  gl_Position = projectionMatrix * vPosInViewSpace;
}
