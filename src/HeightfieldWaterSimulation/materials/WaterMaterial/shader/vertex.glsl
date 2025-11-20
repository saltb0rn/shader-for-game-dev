uniform sampler2D tHeightfield;

varying float fresnelFactor;
varying vec3 reflectedDir;
varying vec2 chromaticAberrationUV[3];

#define AIR_IOR 1.0
#define WATER_IOR 1.333
// IOR 可以从这里查找 https://pixelandpoly.com/ior.html

void main () {
  vec4 info = texture2D(tHeightfield, uv);

  // 根据高度场计算出当前顶点的坐标
  vec3 pos = vec3(position.xy, position.z + info.r);
  vec3 posWorld = (modelMatrix * vec4(pos, 1.)).xyz;
  // 计算出当前顶点的法线向量: 这种方法只限于水面的模型的缩放为等比缩放
  vec3 normWorld = (modelMatrix * vec4(info.ba, sqrt(1. - dot(info.ba, info.ba)), 0.)).xyz;

  const float eta = AIR_IOR / WATER_IOR;
  vec3 eye = normalize(posWorld.xyz - cameraPosition);
  // 计算折射向量
  vec3 refractedDir = normalize(refract(eye, normWorld, eta));
  // 计算反射向量
  reflectedDir = normalize(reflect(eye, normWorld));

  // 计算菲涅耳系数
  const float f0 = pow((AIR_IOR - WATER_IOR) / (AIR_IOR + WATER_IOR), 2.0);
  fresnelFactor = f0 + (1.0 - f0) * pow(1.0 - dot(-eye, normWorld), 5.0);

  mat4 VP = projectionMatrix * viewMatrix;

  // 计算色差 (chromatic aberration), 模拟不同波长的光对折射率的影响
  float etaGrad = 0.04;        // Chromatic Aberration Factor
  vec4 refractedPos = VP * normalize(vec4(posWorld + refractedDir, 1.0));
  chromaticAberrationUV[0] = refractedPos.xy / refractedPos.w * 0.5 + 0.5;

  refractedPos = VP * normalize(vec4(posWorld + normalize(refract(eye, normWorld, eta * (1.0 - etaGrad))), 1.0));
  chromaticAberrationUV[1] = refractedPos.xy / refractedPos.w * 0.5 + 0.5;

  refractedPos = VP * normalize(vec4(posWorld + normalize(refract(eye, normWorld, eta * (1.0 - etaGrad * 2.0))), 1.0));
  chromaticAberrationUV[2] = refractedPos.xy / refractedPos.w * 0.5 + 0.5;

  gl_Position = VP * vec4(posWorld, 1.);

}
