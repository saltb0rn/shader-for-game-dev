varying vec3 vNormal;
varying vec3 vPosition;
uniform vec4 uLightPos;

void main () {

  vec3 viewDir = normalize(cameraPosition - vPosition);
  vec3 lightDir = normalize(uLightPos.w > 0.0 ? uLightPos.xyz - vPosition: uLightPos.xyz);
  vec3 halfDir = normalize(viewDir + lightDir);
  float shiness = uLightPos.w > 0.0 ? length(uLightPos.xyz - vPosition) * 4.0: 60.0;
  float kSpecular = pow(max(dot(halfDir, vNormal), .0), shiness);
  float kDiffuse = max(dot(vNormal, lightDir), .0);

  vec3 color = vec3(vNormal * 0.5 + 0.5);

  // 光线和法线之间的角度需要小于 41 度且 halfDir 和视线之间的角度小于 60 角时标记为高亮
  if (kDiffuse > 0.75 && kSpecular >= .5) {
    color = vec3(0.0);
  }

  // 输出 kDiffuse 作为光照计算结果, 高亮区域已经被法线标记, 所以 kSpecular 就不需要返回.
  gl_FragColor = vec4(color, kDiffuse);

}
