uniform sampler2D tCaustics;
uniform vec2 uResolution;

varying vec3 vPosInLightNDC;
varying float vLightDiffuse;

const vec3 underwaterColor = vec3(0.4, 0.9, 1.0);

float blur(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
  float intensity = 0.;
  vec2 off1 = vec2(1.3846153846) * direction;
  vec2 off2 = vec2(3.2307692308) * direction;
  intensity += texture2D(image, uv).x * 0.2270270270;
  intensity += texture2D(image, uv + (off1 / resolution)).x * 0.3162162162;
  intensity += texture2D(image, uv - (off1 / resolution)).x * 0.3162162162;
  intensity += texture2D(image, uv + (off2 / resolution)).x * 0.0702702703;
  intensity += texture2D(image, uv - (off2 / resolution)).x * 0.0702702703;
  return intensity;
}

void main () {
  float computedLightIntensity = 0.5;
  float lightIntensity = 0.3;
  computedLightIntensity += lightIntensity * vLightDiffuse;

  vec2 uv = vPosInLightNDC.xy * 0.5 + 0.5;
  float depth = vPosInLightNDC.z * 0.5 + 0.5;
  vec4 info = texture2D(tCaustics, uv);
  float closestDepth = info.w;

  float bias = 0.01;
  // 只有未被遮蔽的情况下才应用焦散
  if (closestDepth > depth - bias) {

    float causticsIntensity = 0.5 * (
      blur(tCaustics, uv, uResolution, vec2(0., 0.5)) +
      blur(tCaustics, uv, uResolution, vec2(0.5, 0.))
    );

    computedLightIntensity += causticsIntensity * smoothstep(0., 1., vLightDiffuse);
  }

  gl_FragColor = vec4(underwaterColor * computedLightIntensity, 1.0);
}
