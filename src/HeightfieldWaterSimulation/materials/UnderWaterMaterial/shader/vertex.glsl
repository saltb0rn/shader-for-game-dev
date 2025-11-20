// attribute vec3 normal;
// attribute vec3 position;
// uniform mat4 modelMatrix;
// uniform mat4 modelViewMatrix;
// uniform mat4 projectionMatrix;

uniform mat4 uLightProjectionMatrix;
uniform mat4 uLightViewMatrix;
uniform sampler2D tRefractedLight;

varying vec3 vPosInLightNDC;
varying float vLightDiffuse;

void main () {

  vec3 normalWorld = normalize((modelMatrix * vec4(normal, 0)).xyz);

  // 计算顶点在光源相机中的 NDC 坐标得出深度, 用在后续的阴影计算中
  vec4 posInLightClip = uLightProjectionMatrix * uLightViewMatrix * modelMatrix * vec4(position, 1.);
  vPosInLightNDC = posInLightClip.xyz / posInLightClip.w;

  // 这里应该计算折射光与物体表面法线的点积
  vec2 uvLight = vPosInLightNDC.xy * 0.5 + 0.5;
  vec3 refracted = texture2D(tRefractedLight, uvLight).xyz * 2. - 1.;
  vLightDiffuse = max(dot(normalize(-refracted), normalWorld), 0.);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
}
