uniform samplerCube tSkyBox;
uniform sampler2D tEnvMap;

varying float fresnelFactor;
varying vec3 reflectedDir;
varying vec2 chromaticAberrationUV[3];

void main() {
  vec3 reflectedColor = textureCube(tSkyBox, reflectedDir).xyz;

  vec3 refractedColor = vec3(1.);
  refractedColor.r = texture2D(tEnvMap, chromaticAberrationUV[0]).r;
  refractedColor.g = texture2D(tEnvMap, chromaticAberrationUV[1]).g;
  refractedColor.b = texture2D(tEnvMap, chromaticAberrationUV[2]).b;

  vec3 color = mix(refractedColor, reflectedColor, clamp(fresnelFactor, 0., 1.));

  gl_FragColor = vec4(color, 1.);
}
