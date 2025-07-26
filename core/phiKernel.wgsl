// core/phiKernel.wgsl  – GPU shader for Φ(P)

// Golden constants
let PI      : f32 = 3.141592653589793;
let PHI     : f32 = 1.61803398875;
let G_ANGLE : f32 = 2.0 * PI * (2.0 - PHI); // ≈ 137.507°

// light positions (skewed equilateral)
let L0 : vec3<f32> = vec3<f32>( 0.6,  0.8, 1.2);
let L1 : vec3<f32> = vec3<f32>(-0.7,  0.7, 1.1);
let L2 : vec3<f32> = vec3<f32>( 0.0, -0.9, 1.3);

// uniforms
struct Params {
  zoom      : f32;   // scale factor a
  lambda    : f32;   // membrane fall-off (ZCM dependent)
  kMax      : u32;   // ribs to iterate
};
@group(0) @binding(0) var<uniform> params : Params;

// colour output
struct VSOut { @builtin(position) pos: vec4<f32>, @location(0) uv: vec2<f32> };
@vertex fn vMain(@location(0) inPos: vec2<f32>) -> VSOut {
  var out: VSOut;
  out.pos = vec4<f32>(inPos, 0.0, 1.0);
  out.uv  = inPos;
  return out;
}

@fragment fn fMain(frag: VSOut) -> @location(0) vec4<f32> {
  var P = vec3<f32>(frag.uv * params.zoom, 0.0);

  // φ-fan ribs – additive field Φ(P)
  var phiField : f32 = 0.0;
  var k : u32  = 0u;
  loop {
    if (k >= params.kMax) { break; }
    let rk = params.zoom * sqrt(f32(k));
    let th = f32(k) * G_ANGLE;
    let rib = vec3<f32>(rk * cos(th), rk * sin(th), 0.0);
    let d   = distance(P, rib);
    phiField += cos(d / params.lambda);
    k += 1u;
  }

  // triple-light interference (rainbow)
  let t0 = dot(normalize(L0-P), vec3<f32>(0.0,0.0,1.0));
  let t1 = dot(normalize(L1-P), vec3<f32>(0.0,0.0,1.0));
  let t2 = dot(normalize(L2-P), vec3<f32>(0.0,0.0,1.0));
  let overlap = (t0+t1+t2+3.0) / 6.0; // range 0-1

  // rainbow palette
  let hue = fract(overlap + phiField*0.1);
  let col = hsv2rgb(vec3<f32>(hue, 0.9, 1.0));
  return vec4<f32>(col, 1.0);
}

// helper – HSV ➜ RGB
fn hsv2rgb(c: vec3<f32>) -> vec3<f32> {
  let K = vec4<f32>(1.0, 2.0/3.0, 1.0/3.0, 3.0);
  let p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, vec3<f32>(0.0), vec3<f32>(1.0)), c.y);
}
