import { Assets } from '../../../../src/assets/Assets';
import { Filter } from '../../../../src/filters/Filter';
import { Sprite } from '../../../../src/scene/sprite/Sprite';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'do not clip to viewport filter texture',
    only: true,
    create: async (scene: Container) =>
    {
        const texture = await Assets.load('desert.jpg');
        const sprite = new Sprite({
            texture,
            width: 128,
            height: 128,
        });

        sprite.x = -64;

        const wgslFragment = `
struct GlobalFilterUniforms {
  uInputSize:vec4<f32>,
  uInputPixel:vec4<f32>,
  uInputClamp:vec4<f32>,
  uOutputFrame:vec4<f32>,
  uGlobalFrame:vec4<f32>,
  uOutputTexture:vec4<f32>,
};

@group(0) @binding(0) var<uniform> gfu: GlobalFilterUniforms;
@group(0) @binding(1) var uTexture: texture_2d<f32>;
@group(0) @binding(2) var uSampler: sampler;

const center: vec2<f32> = vec2(0.5);
const angleToRotate: f32 = 180.0 * (3.14159265 / 180.0);

fn mapCoord(coord: vec2<f32> ) -> vec2<f32>
{
  var mappedCoord: vec2<f32> = coord;
  mappedCoord *= gfu.uInputSize.xy;
  mappedCoord += gfu.uOutputFrame.xy;
  return mappedCoord;
}

fn unmapCoord(coord: vec2<f32> ) -> vec2<f32>
{
  var mappedCoord: vec2<f32> = coord;
  mappedCoord -= gfu.uOutputFrame.xy;
  mappedCoord /= gfu.uInputSize.xy;
  return mappedCoord;
}

@fragment
fn mainFragment(
    @builtin(position) position: vec4<f32>,
    @location(0) uv : vec2<f32>
) -> @location(0) vec4<f32>
{
    var centerInPx: vec2<f32> = mapCoord(center);
    var coord: vec2<f32> = mapCoord(uv);
    coord -= centerInPx;

    var radius: f32 = length(coord);
    var angle: f32 = atan2(coord.y, coord.x) + angleToRotate;

    var rotatedPoint: vec2<f32> = coord;

    if (radius < 32.0) {
        rotatedPoint = vec2(cos(angle), sin(angle)) * radius;
    }

    rotatedPoint += centerInPx;
    rotatedPoint = unmapCoord(rotatedPoint);

    var resultColor: vec4<f32> = textureSample(uTexture, uSampler, rotatedPoint);

    return resultColor;
}
        `;

        const wgslVertex = `
struct GlobalFilterUniforms {
  uInputSize:vec4<f32>,
  uInputPixel:vec4<f32>,
  uInputClamp:vec4<f32>,
  uOutputFrame:vec4<f32>,
  uGlobalFrame:vec4<f32>,
  uOutputTexture:vec4<f32>,
};

@group(0) @binding(0) var<uniform> gfu: GlobalFilterUniforms;

struct VSOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv : vec2<f32>
  };

fn filterVertexPosition(aPosition:vec2<f32>) -> vec4<f32>
{
    var position = aPosition * gfu.uOutputFrame.zw + gfu.uOutputFrame.xy;

    position.x = position.x * (2.0 / gfu.uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0*gfu.uOutputTexture.z / gfu.uOutputTexture.y) - gfu.uOutputTexture.z;

    return vec4(position, 0.0, 1.0);
}

fn filterTextureCoord( aPosition:vec2<f32> ) -> vec2<f32>
{
    return aPosition * (gfu.uOutputFrame.zw * gfu.uInputSize.zw);
}

@vertex
fn mainVertex(
  @location(0) aPosition : vec2<f32>,
) -> VSOutput {
  return VSOutput(
   filterVertexPosition(aPosition),
   filterTextureCoord(aPosition)
  );
}
`;

        const glVertex = `
        in vec2 aPosition;
out vec2 vTextureCoord;

uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;

vec4 filterVertexPosition( void )
{
    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;

    position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0*uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;

    return vec4(position, 0.0, 1.0);
}

vec2 filterTextureCoord( void )
{
    return aPosition * (uOutputFrame.zw * uInputSize.zw);
}

void main(void)
{
    gl_Position = filterVertexPosition();
    vTextureCoord = filterTextureCoord();
}`;

        const glFragment = `
precision highp float;

in vec2 vTextureCoord;
out vec4 finalColor;

uniform vec4 filterArea;
uniform sampler2D uSampler;
uniform vec4 uInputSize;

vec2 center = vec2(0.5);
float angleToRotate = 180.0 * (3.14159265 / 180.0);

vec2 mapCoord( vec2 coord )
{
    coord *= uInputSize.xy;
    coord += uInputSize.zw;

    return coord;
}

vec2 unmapCoord( vec2 coord )
{
    coord -= uInputSize.zw;
    coord /= uInputSize.xy;

    return coord;
}

void main(void)
{
    vec2 centerInPx = mapCoord(center);
    vec2 coord = mapCoord(vTextureCoord);
    coord -= centerInPx;

    float radius = length(coord);
    float angle = atan(coord.y, coord.x) + angleToRotate;

    vec2 rotatedPoint = coord;

    if (radius < 32.0) {
        rotatedPoint = vec2(cos(angle), sin(angle)) * radius;
    }

    rotatedPoint += centerInPx;
    rotatedPoint = unmapCoord(rotatedPoint);

    finalColor = texture(uSampler, rotatedPoint);
}
`;

        const customFilter = Filter.from({
            clipToViewport: false,
            gpu: {
                vertex: {
                    source: wgslVertex,
                    entryPoint: 'mainVertex',
                },
                fragment: {
                    source: wgslFragment,
                    entryPoint: 'mainFragment',
                },
            },
            gl: {
                vertex: glVertex,
                fragment: glFragment,
            },
        });

        sprite.filters = customFilter;

        scene.addChild(sprite);
    },
};
