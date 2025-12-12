uniform sampler2D tDiffuse;     // 场景的颜色贴图
uniform sampler2D tSSAO;        // SSAO 贴图
uniform vec2 uResolution;       // SSAO 贴图的解析度

varying vec2 vUV;

void main() {
  vec2 uvDelta = 1.0 / uResolution;

  int blurSize = 5;
  int halfSize = blurSize / 2;
  float ssao = 0.0;
  float avg = 1. / float(blurSize * blurSize);

  // 盒状模糊
  for (int row = -halfSize; row <= halfSize; row++) {

    float y = float(row);
    
    for (int col = -halfSize; col <= halfSize; col++) {

      float x = float(col);
      vec2 uv = vUV + vec2(x, y) * uvDelta;
      ssao += texture2D(tSSAO, uv).r;
        
    }

  }

  ssao *= avg;

  vec4 diffuse = texture2D(tDiffuse, vUV);

  gl_FragColor = vec4(diffuse.rgb * ssao, diffuse.a);
}
