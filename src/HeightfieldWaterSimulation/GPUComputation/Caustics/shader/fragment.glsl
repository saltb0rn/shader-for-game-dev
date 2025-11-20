varying vec3 vOrigin;
varying vec3 vHitPoint;
varying float vOriginDepth;
varying float vHitPointDepth;

void main() {

  float causticsIntensity = 0.;
  float causticsFactor = 0.15;

  if (vHitPointDepth >= vOriginDepth) {
    float oldArea = length(dFdx(vOrigin)) * length(dFdy(vOrigin));
    float newArea = length(dFdx(vHitPoint)) * length(dFdy(vHitPoint));

    float ratio;

    if (newArea == 0.) {
      ratio = 2.0e+20;
    } else {
      ratio = oldArea / newArea;
    }

    causticsIntensity = causticsFactor * ratio;
  }

  gl_FragColor = vec4(causticsIntensity, 0.0, 0.0, vHitPointDepth);
}
