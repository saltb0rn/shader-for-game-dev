varying vec4 vPosInViewSpace;

void main() {
  vPosInViewSpace = modelViewMatrix * vec4(position, 1.);
  gl_Position = projectionMatrix * vPosInViewSpace;
}
