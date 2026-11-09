import { Filter, GlProgram, GpuProgram } from 'pixi.js';

import type { FilterSystem, RenderSurface, Texture } from 'pixi.js';

interface DustMotesOptions {
  count?: number;
  speed?: number;
  size?: number;
  alpha?: number;
  color?: number;
}

const vertex = `
in vec2 aPosition;
out vec2 vTextureCoord;

uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;

vec4 filterVertexPosition(void) {
    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
    position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0 * uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;
    return vec4(position, 0.0, 1.0);
}

vec2 filterTextureCoord(void) {
    return aPosition * (uOutputFrame.zw * uInputSize.zw);
}

void main(void) {
    gl_Position = filterVertexPosition();
    vTextureCoord = filterTextureCoord();
}
`;

const fragment = `
in vec2 vTextureCoord;
out vec4 finalColor;

uniform sampler2D uTexture;

uniform highp vec4 uInputSize;
uniform vec3 uColor;
uniform highp float uTime;
uniform float uCount;
uniform float uSpeed;
uniform float uSize;
uniform float uAlpha;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
    vec4 original = texture(uTexture, vTextureCoord);
    float dustAccum = 0.0;
    float aspect = uInputSize.x / uInputSize.y;

    for (int i = 0; i < 200; i++) {
        if (float(i) >= uCount) break;
        float id = float(i) + 0.5;
        float rx = hash(vec2(id, 0.0));
        float ry = hash(vec2(id, 1.0));
        float rs = hash(vec2(id, 2.0));
        float rsp = hash(vec2(id, 3.0));
        float rph = hash(vec2(id, 4.0));
        float rbr = hash(vec2(id, 5.0));

        float t = uTime * uSpeed * (0.3 + rsp * 0.7);

        float px = fract(rx + sin(t * 0.7 + rph * 6.283) * 0.08 + cos(t * 0.3 + rph * 3.0) * 0.04);
        float py = fract(ry + cos(t * 0.5 + rph * 4.0) * 0.06 - t * 0.015);

        vec2 diff = vTextureCoord - vec2(px, py);
        diff.x *= aspect;
        float dist = length(diff);

        float moteSize = uSize * (0.3 + rs * 0.7);
        float mote = smoothstep(moteSize, moteSize * 0.2, dist);

        float twinkle = 0.5 + 0.5 * sin(t * 2.0 + rph * 6.283);

        dustAccum += mote * (0.3 + rbr * 0.7) * twinkle;
    }

    dustAccum *= uAlpha;
    vec3 color = original.rgb + uColor * dustAccum * original.a;
    finalColor = vec4(color, original.a);
}
`;

const source = `
struct GlobalFilterUniforms {
  uInputSize:vec4<f32>,
  uInputPixel:vec4<f32>,
  uInputClamp:vec4<f32>,
  uOutputFrame:vec4<f32>,
  uGlobalFrame:vec4<f32>,
  uOutputTexture:vec4<f32>,
};

struct DustMotesUniforms {
  uColor:vec3<f32>,
  uTime:f32,
  uCount:f32,
  uSpeed:f32,
  uSize:f32,
  uAlpha:f32,
};

@group(0) @binding(0) var<uniform> gfu: GlobalFilterUniforms;
@group(0) @binding(1) var uTexture: texture_2d<f32>;
@group(0) @binding(2) var uSampler: sampler;

@group(1) @binding(0) var<uniform> dust: DustMotesUniforms;

struct VSOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
};

fn filterVertexPosition(aPosition:vec2<f32>) -> vec4<f32> {
    var position = aPosition * gfu.uOutputFrame.zw + gfu.uOutputFrame.xy;
    position.x = position.x * (2.0 / gfu.uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0 * gfu.uOutputTexture.z / gfu.uOutputTexture.y) - gfu.uOutputTexture.z;
    return vec4(position, 0.0, 1.0);
}

fn filterTextureCoord(aPosition:vec2<f32>) -> vec2<f32> {
    return aPosition * (gfu.uOutputFrame.zw * gfu.uInputSize.zw);
}

fn hash(p: vec2<f32>) -> f32 {
    return fract(sin(dot(p, vec2<f32>(127.1, 311.7))) * 43758.5453);
}

@vertex
fn mainVertex(@location(0) aPosition: vec2<f32>) -> VSOutput {
    return VSOutput(
        filterVertexPosition(aPosition),
        filterTextureCoord(aPosition),
    );
}

@fragment
fn mainFragment(@location(0) uv: vec2<f32>, @builtin(position) position: vec4<f32>) -> @location(0) vec4<f32> {
    var original = textureSample(uTexture, uSampler, uv);
    var dustAccum: f32 = 0.0;
    let aspect = gfu.uInputSize.x / gfu.uInputSize.y;

    let count = min(i32(dust.uCount), 200);
    for (var i: i32 = 0; i < count; i++) {
        let id = f32(i) + 0.5;
        let rx = hash(vec2<f32>(id, 0.0));
        let ry = hash(vec2<f32>(id, 1.0));
        let rs = hash(vec2<f32>(id, 2.0));
        let rsp = hash(vec2<f32>(id, 3.0));
        let rph = hash(vec2<f32>(id, 4.0));
        let rbr = hash(vec2<f32>(id, 5.0));

        let t = dust.uTime * dust.uSpeed * (0.3 + rsp * 0.7);

        let px = fract(rx + sin(t * 0.7 + rph * 6.283) * 0.08 + cos(t * 0.3 + rph * 3.0) * 0.04);
        let py = fract(ry + cos(t * 0.5 + rph * 4.0) * 0.06 - t * 0.015);

        var diff = uv - vec2<f32>(px, py);
        diff.x *= aspect;
        let dist = length(diff);

        let moteSize = dust.uSize * (0.3 + rs * 0.7);
        let mote = smoothstep(moteSize, moteSize * 0.2, dist);

        let twinkle = 0.5 + 0.5 * sin(t * 2.0 + rph * 6.283);

        dustAccum += mote * (0.3 + rbr * 0.7) * twinkle;
    }

    dustAccum *= dust.uAlpha;
    let color = original.rgb + dust.uColor * dustAccum * original.a;
    return vec4(color, original.a);
}
`;

export class DustMotesFilter extends Filter {
  private _color: number;
  private readonly _startTime: number;

  constructor(options: DustMotesOptions = {}) {
    const { count = 60, speed = 1.0, size = 0.008, alpha = 0.6, color = 0xffffff } = options;

    const gpuProgram = GpuProgram.from({
      vertex: { source, entryPoint: 'mainVertex' },
      fragment: { source, entryPoint: 'mainFragment' },
    });

    const glProgram = GlProgram.from({
      vertex,
      fragment,
      name: 'dust-motes-filter',
    });

    super({
      gpuProgram,
      glProgram,
      resources: {
        dustMotesUniforms: {
          uColor: { value: new Float32Array(3), type: 'vec3<f32>' },
          uTime: { value: 0, type: 'f32' },
          uCount: { value: count, type: 'f32' },
          uSpeed: { value: speed, type: 'f32' },
          uSize: { value: size, type: 'f32' },
          uAlpha: { value: alpha, type: 'f32' },
        },
      },
    });

    this._color = color;
    this._startTime = performance.now();
    this.color = color;
  }

  public apply(filterManager: FilterSystem, input: Texture, output: RenderSurface, clearMode: boolean) {
    this.resources.dustMotesUniforms.uniforms.uTime = (performance.now() - this._startTime) / 1000;

    filterManager.applyFilter(this, input, output, clearMode);
  }

  get color() {
    return this._color;
  }
  set color(value) {
    this._color = value;
    const u = this.resources.dustMotesUniforms.uniforms;
    u.uColor[0] = ((value >> 16) & 0xff) / 255;
    u.uColor[1] = ((value >> 8) & 0xff) / 255;
    u.uColor[2] = (value & 0xff) / 255;
  }

  get alpha() {
    return this.resources.dustMotesUniforms.uniforms.uAlpha;
  }
  set alpha(value) {
    this.resources.dustMotesUniforms.uniforms.uAlpha = value;
  }

  get count() {
    return this.resources.dustMotesUniforms.uniforms.uCount;
  }
  set count(value) {
    this.resources.dustMotesUniforms.uniforms.uCount = value;
  }

  get speed() {
    return this.resources.dustMotesUniforms.uniforms.uSpeed;
  }
  set speed(value) {
    this.resources.dustMotesUniforms.uniforms.uSpeed = value;
  }

  get size() {
    return this.resources.dustMotesUniforms.uniforms.uSize;
  }
  set size(value) {
    this.resources.dustMotesUniforms.uniforms.uSize = value;
  }
}
