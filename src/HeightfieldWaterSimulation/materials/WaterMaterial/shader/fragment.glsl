uniform samplerCube tSkyBox;
uniform sampler2D tEnvMap;

varying float vFresnelFactor;
varying vec3 vReflectedDir;
varying vec2 vChromaticAberrationUV[3];

void main() {
  vec3 reflectedColor = textureCube(tSkyBox, vReflectedDir).xyz;

  vec3 refractedColor = vec3(1.);
  refractedColor.r = texture2D(tEnvMap, vChromaticAberrationUV[0]).r;
  refractedColor.g = texture2D(tEnvMap, vChromaticAberrationUV[1]).g;
  refractedColor.b = texture2D(tEnvMap, vChromaticAberrationUV[2]).b;

  vec3 color = mix(refractedColor, reflectedColor, clamp(vFresnelFactor, 0., 1.));

  gl_FragColor = vec4(color, 1.);
}
