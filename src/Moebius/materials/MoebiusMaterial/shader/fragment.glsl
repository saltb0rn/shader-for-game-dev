varying vec2 vUV;
uniform sampler2D tDiffuse;
uniform sampler2D tDepth;
uniform sampler2D tNormal;
uniform float uCameraNear;
uniform float uCameraFar;
uniform vec2 uResolution;
uniform bool uGammaCorrection;

float getLinearDepth(sampler2D t, vec2 uv) {
  vec4 pixel = texture2D(t, uv);
  float ndcZ = 2.0 * pixel.r - 1.0;
  float viewZ = 2.0 * uCameraNear * uCameraFar /
    (ndcZ * (uCameraFar - uCameraNear) - (uCameraFar + uCameraNear));
  float modelZ = -viewZ;
  float linearDepth = (modelZ - uCameraNear) / (uCameraFar - uCameraNear);
  return linearDepth;
}

float luma(vec3 color) {
  return dot(vec3(0.2125, 0.7154, 0.0721), color);
}

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

vec2 rand(vec2 st){
    st = vec2(dot(st, vec2(127.1,311.7)),
              dot(st, vec2(269.5,183.3)));
    return -1.0 + 2.0 * fract(sin(st) * 43758.5453123);
}

float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  // vec2 u = f * f * (3.0 - 2.0 * f);
  vec2 u = smoothstep(vec2(0.0), vec2(1.0), f);

  vec2 a = rand(i);
  vec2 va = f - vec2(0.0, 0.0);
  vec2 b = rand(i + vec2(1.0, 0.0));
  vec2 vb = f - vec2(1.0, 0.0);
  vec2 c = rand(i + vec2(0.0, 1.0));
  vec2 vc = f - vec2(0.0, 1.0);
  vec2 d = rand(i + vec2(1.0, 1.0));
  vec2 vd = f - vec2(1.0, 1.0);

  float dotA = dot(a, va);
  float dotB = dot(b, vb);
  float dotC = dot(c, vc);
  float dotD = dot(d, vd);

  float ab = mix(dotA, dotB, u.x);
  float cd = mix(dotC, dotD, u.x);

  return mix(ab, cd, u.y);
}

void main () {
  vec2 uv = vUV;
  vec2 texelSize = 1.0 / uResolution;
  float outlineThickness = 1.5;
  vec4 outlineColor = vec4(0.0, 0.0, 0.0, 1.0);

  float amplitude = 1.2;
  float frequency = noise(gl_FragCoord.xy * texelSize) / amplitude * 0.6;
  vec2 displacement = vec2(sin(gl_FragCoord.y * frequency),
                           cos(gl_FragCoord.x * frequency)) * amplitude * texelSize;

  float attrs[9];

  for (int i = -1; i <= 1; i++) {
    for (int j = -1; j <= 1; j++) {
      int index = (-j + 1) * 3 + (i + 1);
      vec2 coord = uv + displacement + outlineThickness * vec2(i, j) * texelSize;
      float d = getLinearDepth(tDepth, coord);
      float l = luma(texture2D(tNormal, coord).xyz);
      attrs[index] = 25.0 * d + l;
    }
  }

  float kernelX[9] = float[9](-1.0, 0.0, 1.0, -2.0, 0.0, 2.0, -1.0, 0.0, 1.0);
  float kernelY[9] = float[9](1.0, 2.0, 1.0, 0.0, 0.0, 0.0, -1.0, -2.0, -1.0);

  float convX = convolution(uv, kernelX, attrs);
  float convY = convolution(uv, kernelY, attrs);
  float g = sqrt(convX * convX + convY * convY);

  vec4 pixelColor = texture2D(tDiffuse, uv);
  vec4 normal = texture2D(tNormal, uv);

  #define LOW_LUMA_1 0.32
  #define LOW_LUMA_2 0.18
  #define LOW_LUMA_3 0.04

  float diffuseFactor = 0.17;
  float pixelLuma = clamp(luma(pixelColor.rgb) + normal.a * diffuseFactor, .0, 1.);
  float depth = getLinearDepth(tDepth, uv);

  float interval = 20.0;        // 阴影线的间隔
  float shadowThickness = 4.0;  // 阴影线的粗细

  // 绘制斜对角阴影线
  if (pixelLuma <= LOW_LUMA_1 && depth <= 0.99) {

    // 转 x 轴对齐对角线, 在旋转后的 x 轴方向绘制线条
    float angle = -atan(uResolution.y, uResolution.x);
    float rx = dot(vec2(cos(angle), -sin(angle)), uv);
    // 每 interval 个单位绘制一条粗细为 4 的对角线
    if (mod((rx + displacement.x) * uResolution.x, interval) < shadowThickness) {
      pixelColor = outlineColor;
    }
  }

  // 绘制垂直阴影线
  if (pixelLuma <= LOW_LUMA_2 && depth <= 0.99) {
    if (mod((uv.x + displacement.x) * uResolution.x, interval) < shadowThickness) {
      pixelColor = outlineColor;
    }
  }

  // 绘制水平阴影线
  if (pixelLuma <= LOW_LUMA_3 && depth <= 0.99) {
    if (mod((uv.y + displacement.y) * uResolution.y, interval) < shadowThickness) {
      pixelColor = outlineColor;
    }
  }

  // 绘制高亮区
  if (pixelLuma > LOW_LUMA_1 && depth <= 0.99) {
    // pixelLuma > LOW_LUMA_1 表示片元不在阴影区, 在阴影区时直接不绘制高亮区域
    if (all(lessThanEqual(normal.xyz, vec3(0.0)))) {
      pixelColor = vec4(1.0);
    }
  }

  // 上色
  pixelColor = mix(pixelColor, outlineColor, g);

  if (uGammaCorrection) {
    pixelColor = pow(pixelColor, vec4(0.4545));
  }

  gl_FragColor = pixelColor;
  // gl_FragColor = vec4(vec3(luma(normal.xyz)), 1.0);
}
