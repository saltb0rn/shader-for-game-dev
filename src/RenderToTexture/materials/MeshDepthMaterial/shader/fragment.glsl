void main() {
  float depth = gl_FragCoord.z * 0.5 + 0.5;
  gl_FragColor = vec4(depth);
}
