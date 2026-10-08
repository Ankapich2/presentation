import { useEffect, useRef, useState } from 'react';

type Props = { variant: 'clouds' | 'paper'; className?: string };

const shader = /* wgsl */ `
struct Uniforms { size: vec2f, mode: f32, pad: f32 };
@group(0) @binding(0) var<uniform> u: Uniforms;

fn hash(p: vec2f) -> f32 {
  let p3 = fract(vec3f(p.xyx) * 0.1031);
  let q = p3 + dot(p3, p3.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}
fn noise(p: vec2f) -> f32 {
  let i = floor(p); let f = fract(p); let s = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2f(1,0)), s.x), mix(hash(i+vec2f(0,1)), hash(i+vec2f(1,1)), s.x), s.y);
}
fn fbm(pin: vec2f) -> f32 {
  var p=pin; var v=0.0; var a=0.5;
  for(var i=0;i<6;i++){ v += a*noise(p); p=p*2.03+vec2f(2.1,1.3); a*=0.5; }
  return v;
}
fn bayer4(p: vec2u) -> f32 {
  let x=p.x%4u; let y=p.y%4u;
  let idx=y*4u+x;
  let m=array<f32,16>(0.,8.,2.,10.,12.,4.,14.,6.,3.,11.,1.,9.,15.,7.,13.,5.);
  return (m[idx]+0.5)/16.0;
}
@vertex fn vs(@builtin(vertex_index) i:u32)->@builtin(position) vec4f {
  let p=array<vec2f,3>(vec2f(-1,-1),vec2f(3,-1),vec2f(-1,3)); return vec4f(p[i],0,1);
}
@fragment fn fs(@builtin(position) pos:vec4f)->@location(0) vec4f {
  let uv=pos.xy/u.size;
  if(u.mode < 0.5){
    let p=pos.xy;
    let fiber=(fbm(vec2f(p.x*.018,p.y*.072))-.5)*.085;
    let pulp=(fbm(p*.007)-.5)*.055;
    let tooth=(noise(p*1.2)-.5)*.025;
    let base=vec3f(.899,.861,.804)+fiber+pulp+tooth;
    return vec4f(base,1);
  }
  var n=fbm(uv*3.0+vec2f(.2,-.35));
  n=smoothstep(.50,.68,n);
  var col=mix(vec3f(.004,.584,1.0),vec3f(1.0),n);
  let levels=6.0; let threshold=(bayer4(vec2u(pos.xy))-.5)/levels;
  col=round(clamp(col+threshold,vec3f(0),vec3f(1))*levels)/levels;
  return vec4f(col,1);
}`;

export function ShaderBackdrop({ variant, className }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [unsupported, setUnsupported] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const canvas = ref.current;
      const gpu = (navigator as Navigator & { gpu?: any }).gpu;
      if (!canvas || !gpu) { setUnsupported(true); return; }
      const adapter = await gpu.requestAdapter();
      if (!adapter || cancelled) { setUnsupported(true); return; }
      const device = await adapter.requestDevice();
      const context = canvas.getContext('webgpu') as any;
      const format = gpu.getPreferredCanvasFormat();
      context.configure({ device, format, alphaMode: 'premultiplied' });
      const module = device.createShaderModule({ code: shader });
      const pipeline = device.createRenderPipeline({
        layout: 'auto', vertex: { module, entryPoint: 'vs' },
        fragment: { module, entryPoint: 'fs', targets: [{ format }] },
        primitive: { topology: 'triangle-list' },
      });
      const uniform = device.createBuffer({ size: 16, usage: 0x40 | 0x08 });
      device.queue.writeBuffer(uniform, 0, new Float32Array([1732, 1080, variant === 'clouds' ? 1 : 0, 0]));
      const group = device.createBindGroup({ layout: pipeline.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer: uniform } }] });
      const encoder = device.createCommandEncoder();
      const pass = encoder.beginRenderPass({ colorAttachments: [{ view: context.getCurrentTexture().createView(), clearValue: { r: 0, g: 0, b: 0, a: 1 }, loadOp: 'clear', storeOp: 'store' }] });
      pass.setPipeline(pipeline); pass.setBindGroup(0, group); pass.draw(3); pass.end();
      device.queue.submit([encoder.finish()]);
    })();
    return () => { cancelled = true; };
  }, [variant]);

  return <canvas ref={ref} width={1732} height={1080} className={className ?? 'shader-canvas'} aria-hidden="true" data-webgpu={unsupported ? 'unsupported' : 'ready'} />;
}
