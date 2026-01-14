varying vec3 vNormal;

void main() {
  vNormal = normalize((modelViewMatrix * vec4(normal, 0.0)).xyz);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
}
