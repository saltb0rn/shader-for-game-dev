// attribute vec3 position;
// uniform mat4 viewMatrix;
// uniform mat4 projectionMatrix;

uniform sampler2D tHeightfield;  // 水面高度场
uniform sampler2D tEnvShadowMap; // 水底深度贴图
uniform vec3 uLightDir;          // 光线在世界坐标上的方向
uniform mat4 uWaterModelMatrix;  // 水面的模型变换矩阵
uniform vec2 uResolution;        // 水底深度贴图 tEnvShadowMap 的解析度

varying vec3 vOrigin;           // 折射光的起点
varying vec3 vHitPoint;         // 折射光与水底场景的交点
varying float vOriginDepth;     // 折射光的起点的深度
varying float vHitPointDepth;   // 交点的深度

#define AIR_IOR 1.0
#define WATER_IOR 1.325
#define MAX_ITERATIONS 100

void main () {
  vec4 info = texture2D(tHeightfield, uv);
  vec3 waterPos = vec3(position.xy, position.z + info.r);
  vec3 waterNorm = vec3(info.ba, sqrt(1.0 - dot(info.ba, info.ba)));
  vec3 waterPosWorld = (uWaterModelMatrix * vec4(waterPos, 1.)).xyz;
  vec3 waterNormWorld = (uWaterModelMatrix * vec4(waterNorm, 0.)).xyz;

  // projectionMatrix 和 viewMatrix 是光源相机的矩阵
  mat4 VP = projectionMatrix * viewMatrix;

  vOrigin = waterPosWorld;
  vec4 waterPosClip = VP * vec4(waterPosWorld, 1.0);
  vOriginDepth = waterPosClip.z / waterPosClip.w * 0.5 + 0.5; // 光与水面交点的 NDC 深度

  float eta = AIR_IOR / WATER_IOR;
  vec3 refractedDirWorld = normalize(refract(uLightDir, waterNormWorld, eta));
  vec4 refractedClip = VP * vec4(refractedDirWorld, 0.0);
  vec3 refractedNDC = refractedClip.xyz;
  vec3 refractedUVW = refractedNDC * 0.5;
  vec2 refractedScreen = refractedUVW.xy * uResolution;
  vec2 dFrag = refractedScreen / max(abs(refractedScreen.x), abs(refractedScreen.y));
  float dW = length(dFrag) / length(refractedScreen) * refractedUVW.z;
  // tEnvShadowMap 以裁剪坐标的 z 分量作为深度, 所以要把 NDC 中的深度变化还原到裁剪空间上
  vec3 delta = vec3(dFrag, dW * 2.0) * 0.1;

  vec2 currentPos = (waterPosClip.xy * 0.5 + 0.5) * uResolution;
  float currentDepth = waterPosClip.z;
  vec2 deltaDirection = delta.xy;
  float deltaDepth = delta.z;

  for (int i = 0; i < MAX_ITERATIONS; i++) {
    vec2 uv = currentPos.xy / uResolution;
    vec4 smInfo = texture2D(tEnvShadowMap, uv);
    vHitPoint = smInfo.xyz;

    if (smInfo.w <= currentDepth) {
      break;
    }

    currentPos += deltaDirection;
    currentDepth += deltaDepth;
  }

  vec4 hitPointClip = VP * vec4(vHitPoint, 1.);
  vHitPointDepth = hitPointClip.z / hitPointClip.w * 0.5 + 0.5; // 折射光与水底交点的 NDC 深度

  gl_Position = hitPointClip;
}
