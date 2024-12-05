import { extractAttributesFromGpuProgram }
    from '../extractAttributesFromGpuProgram';

const shaderCode = `
struct VSOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) color : vec3<f32>,
    @location(1) uv : vec2<f32>,
  };

@vertex
fn mainVert(
  @location(0) aPosition : vec2<f32>,
  @location(1) aColor : vec3<f32>,
  @location(2) aUV : vec2<f32>
) -> VSOutput {
  return VSOutput(
    vec4(aPosition, 0.0, 1.0),
    aColor,
    aUV
  );
};

@binding(0) @group(0) var mySampler: sampler;
@binding(1) @group(0) var myTexture: texture_2d<f32>;

@fragment
fn mainFrag(
  @location(0) color: vec3<f32>,
  @location(1) uv: vec2<f32>
) -> @location(0) vec4<f32> {


  return  textureSample(myTexture, mySampler, uv) * vec4(color, 1.);
};
`;

describe('extractAttributesFromGpuProgram', () =>
{
    it('should load a single image', async () =>
    {
        const extractedAttributeData = extractAttributesFromGpuProgram({ source: shaderCode, entryPoint: 'mainVert' });

        expect(extractedAttributeData).toEqual({
            aPosition: {
                format: 'float32x2',
                instance: false,
                offset: 0,
                location: 0,
                start: 0,
                stride: 8
            },
            aColor: {
                format: 'float32x3',
                instance: false,
                offset: 0,
                location: 1,
                start: 0,
                stride: 12
            },
            aUV: {
                format: 'float32x2',
                instance: false,
                offset: 0,
                location: 2,
                start: 0,
                stride: 8
            }
        });
    });
});
