varying vec3 vRefracted;

void main() {

  gl_FragColor = vec4(vRefracted * 0.5 + 0.5, 1.);
  // gl_FragColor = vec4(vec3(1.), 1.);
}
