precision highp float;
precision highp int;

uniform sampler2D tLastFrame;
uniform vec2 uDelta;
varying vec2 vUV;

void main() {
  vec4 info = texture2D(tLastFrame, vUV);

  // 计算相邻纹理的平均高度
  vec2 dx = vec2(uDelta.x, 0.0);
  vec2 dy = vec2(0.0, uDelta.y);
  float g = (
    texture2D(tLastFrame, vUV - dx).r +
    texture2D(tLastFrame, vUV - dy).r +
    texture2D(tLastFrame, vUV + dx).r +
    texture2D(tLastFrame, vUV + dy).r -
    4.0 * texture2D(tLastFrame, vUV).r
  ) * 0.25;
  /*
    使用拉普拉斯核模拟扩散

    1 / 4 * [0 1 0
             1 -4 1
             0 1 0]
   */

  // 计算水面高度到平均值的速度
  info.g += g;
  // 模拟能量转移, 因此速度被衰减
  info.g *= 0.99;

  // 沿着速度方向更新水面高度
  info.r += info.g;

  // 计算法线
  float ht = texture2D(tLastFrame, vUV + dx).r;
  vec3 tangent = vec3(uDelta.x, 0.0, ht - info.r);
  float hbt = texture2D(tLastFrame, vUV + dy).r;
  vec3 bitangent = vec3(0.0, uDelta.y, hbt - info.r);
  info.ba = normalize(cross(tangent, bitangent)).xy;


  /*
    水面的波纹顶点: (vUV.x, vUV.y, h), 以 UV 坐标平面作为 XY 平面,

    因为 threejs 的 PlaneGeometry 是从 XY 平面构建的.

    水平方向相邻纹理的高度: hx = texture2D(tLastFrame, vec2(vUV.x + uDelta.x, vUV.y)).r

    水平方向相邻纹理对应的水面顶点: (vUV.x + uDelta.x, UV.y, hx)

    tagent = (vUV.x + uDelta.x, vUV.y, hx) - (vUV.x, vUV.y, h) = (uDelta.x, 0, hx - h)

    垂直方向相邻纹理的高度: hy = texture2D(tLastFrame, vec2(vUV.x, vUV.y + uDelta.y)).r

    垂直方向相邻纹理对应的水面顶点: (vUV.x, vUV.y + uDelta.y, hy)

    bitangent = (vUV.x, vUV.y + uDelta.y, hy) - (vUV.x, vUV.y, h) = (0, uDelta.y, hy - h)

    normal = normalize(cross(bitangent, tangent))

    [i, j, k
     a, 0, b
     0, c, d]

    normal = [-bc, -ad, ac]: [ -(hx - h) * uDelta.y, uDelta.x * (hy - h), uDelta.x * Delta.y ]

    储存时只需要储存 nomral.xy 即可, 因为 (normal.x)^2 + (normal.y)^2 + (normal.z)^2 = 1,

    可以根据 sqrt(1 - (normal.x)^2 - (normal.y)^2) = ±normal.z 还原出 normal,

    需要注意正负号, 所以:

    (info.b, info.a, sqrt(1. - dot(info.ba, info.ba)))
  */

  gl_FragColor = info;
}
