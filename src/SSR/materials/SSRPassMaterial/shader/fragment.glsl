uniform sampler2D tDiffuse;
uniform sampler2D tSSR;

varying vec2 vUV;

void main() {
  vec4 ssr = texture2D(tSSR, vUV);
  // vec4 oColor = texture2D(tDiffuse, vUV);
  // gl_FragColor = vec4(mix(ssr.rgb, oColor.rgb, ssr.a), 1.);
  if (ssr.w > 0.0) {
    gl_FragColor = ssr;
  } else {
    gl_FragColor = texture2D(tDiffuse, vUV);
  }
}
