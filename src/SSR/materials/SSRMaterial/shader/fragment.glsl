uniform vec2 uResolution;
uniform sampler2D tViewNormal;
uniform sampler2D tViewPosition;
uniform sampler2D tDiffuse;
uniform mat4 uProjectionMatrix;
uniform mat4 uInverseProjectionMatrix;
uniform float uNear;
uniform float uFar;
uniform float uMaxDistance;  // 可以反射的最大像素距离
uniform float uThickness;

varying vec2 vUV;

float pointToLineDistance(vec3 x0, vec3 x1, vec3 x2) {
  //x0: point, x1: linePointA, x2: linePointB
  // https://mathworld.wolfram.com/Point-LineDistance3-Dimensional.html
  return length(cross(x0 - x1, x0 - x2)) / length(x2 - x1);
}

float pointToPlaneDistance(vec3 point, vec3 planePoint, vec3 planeNormal){
  // https://mathworld.wolfram.com/Point-PlaneDistance.html
  //// https://en.wikipedia.org/wiki/Plane_(geometry)
  //// http://paulbourke.net/geometry/pointlineplane/
  float a = planeNormal.x,
    b = planeNormal.y,
    c = planeNormal.z;
  float x0 = point.x,
    y0 = point.y,
    z0 = point.z;
  float x = planePoint.x,
    y = planePoint.y,
    z = planePoint.z;
  float d = -(a * x + b * y + c * z);
  float dist = (a * x0 + b * y0 + c * z0 + d) / sqrt(a * a + b * b + c * c);
  return dist;
}

vec3 getViewPosition( vec2 uv, float viewZ ) {
  // https://blog.darksalt.me/docs/posts/2020/06/graphics-opengl-transformation.html#depth-buffer
  float iN = 1.0 / uNear,
    iF = 1.0 / uFar,
    iViewZ = 1.0 / viewZ;
  float depth = (-iViewZ - iN) / (iF - iN);
  float clipW = -viewZ;

  vec4 ndc = vec4( vec3( uv, depth ) * 2. - 1., 1.0 );
  vec4 clip = ndc * clipW;
  return ( uInverseProjectionMatrix * clip ).xyz;
}

float chash11(float p) {
  p = fract(p * .1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}

void main() {
  vec4 normalInfo = texture2D(tViewNormal, vUV);
  vec3 normalView = normalize(normalInfo.xyz * 2. - 1.);
  float mirrorFlag = normalInfo.w;

  vec4 positionInfo = texture2D(tViewPosition, vUV);
  vec3 startPosView = positionInfo.xyz;

  if (mirrorFlag < 1.0 ||      // 不能反射的片元
      positionInfo.w <= 0.0 ) {  // 背景片元
    return;
  }

  vec3 incidentView = normalize(startPosView); // 入射光线 I 的方向
  vec3 reflectView = normalize(reflect(incidentView, normalView)); // O 点的反射光线 R

  // 粗糙度模拟
  // float roughness = positionInfo.w;
  // float jitt = mix(0., chash11(roughness), roughness);
  // reflectView += vec3(jitt) / 20.;
  // reflectView = normalize(reflectView);

  // 计算当前反射方向最大的长度
  float maxReflectDistance =  uMaxDistance / dot(-incidentView, normalView);

  // 计算位移向量, 移动一个单位像素
  vec4 startPosClip = uProjectionMatrix * vec4(startPosView, 1.0);
  vec3 startPosNDC = startPosClip.xyz / startPosClip.w;
  vec2 startPosScreen = (startPosNDC.xy * 0.5 + 0.5) * uResolution;

  vec3 endPosView = startPosView + reflectView * maxReflectDistance;
  // 如果反射光线往近裁剪平面射去, 并且超出近裁剪平面, 那么就对射线进行截断
  if (endPosView.z > -uNear) {
    float t = (-uNear - startPosView.z) / reflectView.z;
    endPosView = startPosView + reflectView * t;
  }
  vec4 endPosClip = uProjectionMatrix * vec4(endPosView, 1.);
  vec3 endPosNDC = endPosClip.xyz / endPosClip.w;
  vec2 endPosScreen = (endPosNDC.xy * 0.5 + 0.5) * uResolution;

  // 在屏幕空间上的位置差
  vec2 offsetScreen = endPosScreen - startPosScreen;
  float maxComp = max(abs(offsetScreen.x), abs(offsetScreen.y));
  vec2 dFrag = offsetScreen / maxComp;

  for (float i = 0.; i < maxComp; i++) {
    vec2 currentPosScreen = startPosScreen + i * dFrag;
    vec2 uv = currentPosScreen / uResolution;
    if (currentPosScreen.x < 0. || currentPosScreen.x > uResolution.x ||
        currentPosScreen.y < 0. || currentPosScreen.y > uResolution.y) break;
    float t = i / maxComp;
    vec3 samplingPosView = texture2D(tViewPosition, uv).xyz;
    float currentPosViewZ = (startPosView.z * endPosView.z /
                             mix(endPosView.z, startPosView.z, t));

    // float s = dot(-incidentView, normalView);
    // float epsilon = 0.5 * s * samplingPosView.z * samplingPosView.z * uThickness;
    // float depthDiff = samplingPosView.z - currentPosViewZ;
    // 不知道为何这样会有性能问题
    // if (depthDiff > 0. && depthDiff < epsilon) {
    if (currentPosViewZ <= samplingPosView.z) {
        bool hit;

        float distSampPosLine = pointToLineDistance(samplingPosView, startPosView, endPosView);
        vec2 neighborPosScreen = currentPosScreen + vec2(1., 0.);
        vec2 neighborUV = neighborPosScreen / uResolution;
        vec3 neighborView = getViewPosition(neighborUV, samplingPosView.z);
        float minThickness = (neighborView.x - samplingPosView.x) * 3.;
        float tk = max(uThickness, minThickness);
        hit = distSampPosLine <= tk;
        // 这种判断方法容易出现自反射的情况: 交点在镜子自身上

        if (hit) {
          vec3 samplingNormalView = normalize(texture2D(tViewNormal, uv).xyz * 2. - 1.);
          // 保证反射光线 reflectView 是向着场景的交点 samplingPosView 所处的表面射去, 而不是从内部往外射
          // 以及避免自反射, 自反射的出现通常在 i = 0. 时
          // 因为当前位置的屏幕空间坐标计算为 vec2 currentPosScreen = startPosScreen + i * dFrag;
          // 这个时候 currentPosScreen 和 startPosScreen 是一样的
          // 通常反射光线的起点和第一个采样点是同一个位置, 大概率发生自相交的情况
          if (dot(reflectView, samplingNormalView) >= 0.) continue;
          // 保证交点与反射平面的距离不超过最大距离
          float dist = pointToPlaneDistance(samplingPosView, startPosView, normalView);
          if (dist > uMaxDistance) break;

          float opacity = 0.5;
          float op = opacity;
          float ratio = 1. - (dist / uMaxDistance);
          float attenuation = ratio * ratio;
          op = opacity * attenuation;

          float fresnelCoe = (dot(incidentView, reflectView) + 1.) * 0.5;
          op *= fresnelCoe;

          vec4 color = texture2D(tDiffuse, uv);
          color.a = op;
          gl_FragColor = color;
          break;
        }

    }

  }

}
