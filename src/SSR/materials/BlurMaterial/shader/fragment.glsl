uniform sampler2D tDiffuse;
uniform vec2 uResolution;

varying vec2 vUV;

void main() {
  //reverse engineering from PhotoShop blur filter, then change coefficient

  vec2 texelSize = ( 1.0 / uResolution );

  vec4 c = texture2D(tDiffuse, vUV);

  vec2 offset;

  offset = (vec2(-1,0)) * texelSize;
  vec4 cl = texture2D(tDiffuse, vUV + offset);

  offset = (vec2(1,0)) * texelSize;
  vec4 cr = texture2D(tDiffuse, vUV + offset);

  offset = (vec2(0, -1)) * texelSize;
  vec4 cb = texture2D(tDiffuse, vUV + offset);

  offset = (vec2(0,1)) * texelSize;
  vec4 ct = texture2D(tDiffuse, vUV + offset);

  // float coeCenter=.5;
  // float coeSide=.125;
  float coeCenter = .2;
  float coeSide = .2;
  float a = (c.a * coeCenter +
             cl.a * coeSide +
             cr.a * coeSide +
             cb.a * coeSide +
             ct.a * coeSide);
  vec3 rgb = (c.rgb * c.a * coeCenter +
              cl.rgb * cl.a * coeSide +
              cr.rgb * cr.a * coeSide +
              cb.rgb * cb.a * coeSide +
              ct.rgb * ct.a * coeSide) / a;
  gl_FragColor = vec4(rgb, a);
}
