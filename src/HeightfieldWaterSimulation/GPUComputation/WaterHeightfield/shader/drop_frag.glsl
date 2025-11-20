precision highp float;
precision highp int;

#define PI 3.141592653589793
uniform sampler2D tLastFrame;
uniform vec2 uDropUV;      // 水滴击中水面的位置, 要求是 [0, 1] 范围的 uv 坐标
uniform float uDropRadius; // 水滴击中水面时所影响的范围
uniform float uDropStrength;   // 水滴击中水面时最大的溅起高度

varying vec2 vUV;

void main() {
  vec4 info = texture2D(tLastFrame, vUV);
  // <r, g, b, a> => <水面高度, 高度变化速度, 法线的 x 分量, 法线的 y 分量>

  float dist = length(uDropUV - vUV);
  float drop = max(0.0, 1.0 - dist / uDropRadius);
  drop = 0.5 - cos(drop * PI) * 0.5;

  info.r += drop * uDropStrength;

  gl_FragColor = info;
}
