uniform sampler2D tHeightfield;
uniform vec3 uLightDir;         // 光线在世界坐标上的方向
uniform mat4 uWaterModelMatrix; // 水面的模型变换矩阵

varying vec3 vRefracted;

#define AIR_IOR 1.0
#define WATER_IOR 1.325

void main () {
  vec4 info = texture2D(tHeightfield, uv);
  vec3 waterPos = vec3(position.xy, position.z + info.r);
  vec3 waterNorm = vec3(info.ba, sqrt(1.0 - dot(info.ba, info.ba)));

  // projectionMatrix 和 viewMatrix 是光源相机的矩阵
  mat4 VP = projectionMatrix * viewMatrix;
  vec4 waterPosWorld = uWaterModelMatrix * vec4(waterPos, 1.);
  vec4 waterNormWorld = uWaterModelMatrix * vec4(waterNorm, 0.);

  vec4 waterPosClip = VP * waterPosWorld;

  float eta = AIR_IOR / WATER_IOR;
  vec3 refractedDirWorld = normalize(refract(uLightDir, waterNormWorld.xyz, eta));

  vRefracted = refractedDirWorld;

  gl_Position = VP * uWaterModelMatrix * vec4(position - vec3(0., 0., 0.001), 1.);
}
