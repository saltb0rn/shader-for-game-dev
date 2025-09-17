varying vec2 vUV;
uniform sampler2D tDiffuse;
uniform sampler2D tDepth;
uniform sampler2D tNormal;
uniform float uCameraNear;
uniform float uCameraFar;
uniform vec2 uResolution;

float getLinearDepth(sampler2D t, vec2 uv) {
  float ndcZ = 2.0 * texture2D(t, uv).r - 1.0;
  float viewZ = 2.0 * uCameraNear * uCameraFar /
    (ndcZ * (uCameraFar - uCameraNear) - (uCameraNear + uCameraFar));
  float modelZ = -viewZ;
  float linearDepth = (modelZ - uCameraNear) / (uCameraFar - uCameraNear);
  return linearDepth;
}

float luma(vec3 color) {
  return dot(vec3(0.2125, 0.7154, 0.0721), color);
}

// 卷积运算符
float convolution(vec2 uv, float[9] kernel, float[9] pixels) {
  float conv = 0.0;
  for (int i = 0; i <= 2; i++) {
    for (int j = 0; j <= 2; j++) {
      int index = j * 3 + i;
      conv += pixels[index] * kernel[index];
    }
  }
  return conv;
}

void main () {
  vec2 uv = vUV;
  vec4 color = texture2D(tDiffuse, uv);

  vec2 texelSize = 1.0 / uResolution;
  float outlineThickness = 3.0;
  vec4 outlineColor = vec4(0.0, 0.0, 0.0, 1.0);

  float attrs[9];

  for (int i = -1; i <= 1; i++) {
    for (int j = -1; j <= 1; j++) {
      int index = (-j + 1) * 3 + (i + 1);
      vec2 coord = uv + outlineThickness * vec2(i, j) * texelSize;
      float d = getLinearDepth(tDepth, coord);
      // 这里无需把法线变量还原到 [-1, 1] 的范围， 不影响连续性判断
      // float l = luma(2.0 * texture2D(tNormal, coord).xyz - 1.0);
      float l = luma(texture2D(tNormal, coord).xyz);
      // 只提取外轮廓
      attrs[index] += 25.0 * d;
      // 只提取内轮廓
      attrs[index] += l;
      // 卷积运算满足分配律: F * (G1 + G2) = F * G1 + F * G2
    }
  }

  float kernelX[9] = float[9](-1.0, 0.0, 1.0, -2.0, 0.0, 2.0, -1.0, 0.0, 1.0);
  float kernelY[9] = float[9](1.0, 2.0, 1.0, 0.0, 0.0, 0.0, -1.0, -2.0, -1.0);

  float convX = convolution(uv, kernelX, attrs);
  float convY = convolution(uv, kernelY, attrs);
  float g = sqrt(convX * convX + convY * convY);

  // 1. 显示深度贴图
  // gl_FragColor = vec4(vec3(getLinearDepth(tDepth, uv)), 1.0);
  // 2. 显示法线亮度贴图
  // gl_FragColor = vec4(vec3(luma(texture2D(tNormal, uv).xyz)), 1.0);
  // 3. 显示轮廓图
  // gl_FragColor = vec4(1.0 - vec3(g), 1.0);
  // 4. 对场景进行描边
  gl_FragColor = mix(color, outlineColor, g);
}
