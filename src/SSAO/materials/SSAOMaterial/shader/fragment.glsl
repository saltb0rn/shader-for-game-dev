#define NUM_SAMPLES 8
#define NUM_NOISE 4

varying vec2 vUV;

uniform sampler2D tViewNormal;   // 记录了视点空间法线的贴图
uniform sampler2D tViewPosition; // 记录了视点空间顶点的贴图
uniform sampler2D tNoise;        // 噪声贴图
uniform mat4 uProjectionMatrix; // 用于生成法线/顶点贴图的相机的投影矩阵
uniform float uNear;            // 近裁剪平面的深度
uniform float uFar;             // 远裁剪平面的深度
uniform vec2 uResolution;       // 噪声贴图的解析度

// 随机函数
// vec2 chash22(vec2 p)
// {
//   vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
//   p3 += dot(p3, p3.yzx+33.33);
//   return fract((p3.xx+p3.yz)*p3.zy);
// }

vec3 chash13(float p)
{
  vec3 p3 = fract(p * vec3(.1031, .1030, .0973));
  p3 += dot(p3, p3.yzx+33.33);
  return fract((p3.xxy+p3.yzz)*p3.zyx);
}

// 生成随机位移向量 v, 配合顶点 p 和半球半径计算出采样点 p + v * radius
vec3 getSampleVec( float i ) {
  float scale = float(i) / float(NUM_SAMPLES);
  scale = mix(0.1, 1.0, scale * scale);
  vec3 r = chash13(i);
  r.x = r.x * 2.0 - 1.0;
  r.y = r.y * 2.0 - 1.0;
  return normalize(r) * scale;
}

// 生成随机向量
vec3 getRandomVec( vec2 p ) {
  /*
    // 不使用噪声贴图的方式

    vec2 noiseScale = uResolution / float(NUM_NOISE);
    vec2 r2 = chash22(p * noiseScale);
    vec3 randomVec = vec3(r2 * 2. - 1., 0.);
    return normalize(randomVec);
   */

  vec2 noiseScale = uResolution / float(NUM_NOISE);
  vec3 randomVec = vec3(texture2D(tNoise, p * noiseScale).rg, 0.);
  return normalize(randomVec);
}

void main() {

  float radius = 0.6;

  // 后处理相机的的 UV
  vec2 uv = vUV;
  vec4 origin = texture2D(tViewPosition, uv);

  // 计算顶点在成像相机中的深度
  vec4 posClip = uProjectionMatrix * origin;
  float depth = (posClip.z / posClip.w) * .5 + .5;

  if (depth >= 1.0) {

    /*
      找出背景片元(即并非根据顶点得到的片元), 不对背景做遮蔽处理.

      这里把深度接近远裁剪平面的片元认为是背景片元, 即深度为 1 的片元.

      做深度判断时, 如果是用正交相机成像, 用线性深度判断; 如果是用透视相机成像, 用非线性深度判断;

      这里的深度已经完成了这种"适配".
    */
    // 也可以用 -origin.z >= uFar 做判断
    gl_FragColor = vec4(1.0);

  } else {

    vec3 normal = (texture2D(tViewNormal, uv) * 2. - 1.).xyz;

    // 切线空间的随机 tagent 向量
    vec3 rvec = getRandomVec(uv);

    // 利用随机 tagent 向量构建出不同的 TBN 坐标系, 从而实现 TBN 坐标系围绕 z 轴随机旋转的效果
    vec3 tangent = normalize(rvec - dot(rvec, normal) * normal);
    vec3 bitangent = cross(normal, tangent);
    mat3 tbn = mat3(tangent, bitangent, normal);

    float openness = 1.0;
    float avg = 1.0 / float(NUM_SAMPLES);

    for (int i = 0; i < NUM_SAMPLES; i++) {
      // 把切线空间上的采样变换到视点空间上
      vec3 dir = tbn * getSampleVec(float(i) + 1.);
      // 计算视点空间上的采样点
      vec3 samplePointView = origin.xyz + dir * radius;
      // 把视点空间上的采样点变换到裁剪空间上
      vec4 samplePointClip = uProjectionMatrix * vec4(samplePointView, 1.);
      // 从裁剪空间变换到 NDC 坐标系上
      vec3 samplePointNDC = samplePointClip.xyz / samplePointClip.w;
      // 从 NDC 坐标计算出 UV 坐标
      vec2 samplePointUV = samplePointNDC.xy * .5 + .5;

      vec4 info = texture2D(tViewPosition, samplePointUV);
      /*
        Three.js 中的视点变换并没有对 z 轴进行翻转, z 轴正方向指向屏幕外,

        但相机是看向屏幕内的, 所以用视点坐标的 z 分量作为深度需要对它乘以 -1 进行翻转.
      */
      float closestDepth = -info.z;
      float samplePointDepth = -samplePointView.z;
      // 结合采样点与顶点之间的距离计算被遮蔽的程度
      float rangeCheck = smoothstep(1., 0., length(info.xyz - origin.xyz) / radius);
      openness -= (closestDepth <= samplePointDepth ? 1.: 0.) * rangeCheck * avg;
    }

    gl_FragColor = vec4(vec3(openness), 1.);
  }
}
