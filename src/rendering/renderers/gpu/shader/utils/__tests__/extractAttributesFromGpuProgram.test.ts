import { extractAttributesFromGpuProgram }
    from '../extractAttributesFromGpuProgram';

const shaderCodeInline = `
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

const shaderCodeStruct = `
struct VertexInput {
    @location(0) position: vec2f,
    @location(1) uv: vec2<f32>,
    @location(2) color: vec4<f32>,
    @builtin(vertex_index) vertexIndex: u32,
};

@vertex
fn mainVert(input: VertexInput) -> @builtin(position) vec4<f32> {
    return vec4(input.position, 0.0, 1.0);
}
`;

describe('extractAttributesFromGpuProgram', () =>
{
    it('should extract attributes from inline @location decorators', () =>
    {
        const extractedAttributeData = extractAttributesFromGpuProgram({
            source: shaderCodeInline,
            entryPoint: 'mainVert'
        });

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

    it('should extract attributes from struct-based input (ignoring @builtin, supporting shorthand types)', () =>
    {
        const extractedAttributeData = extractAttributesFromGpuProgram({
            source: shaderCodeStruct,
            entryPoint: 'mainVert'
        });

        expect(extractedAttributeData).toEqual({
            position: {
                format: 'float32x2',
                instance: false,
                offset: 0,
                location: 0,
                start: 0,
                stride: 8
            },
            uv: {
                format: 'float32x2',
                instance: false,
                offset: 0,
                location: 1,
                start: 0,
                stride: 8
            },
            color: {
                format: 'float32x4',
                instance: false,
                offset: 0,
                location: 2,
                start: 0,
                stride: 16
            }
        });
    });

    it('should extract attributes when type is immediately followed by closing parenthesis', () =>
    {
        // Test case for issue #11819: attributes should be recognized even without whitespace before ')'
        const shaderWithNoSpaceBeforeParen = `
            @vertex
            fn main(@location(0) aPosition: vec2f, @location(1) aColor: vec3f) -> @builtin(position) vec4f {
                return vec4f(aPosition, 0.0, 1.0);
            }
        `;

        const extractedAttributeData = extractAttributesFromGpuProgram({
            source: shaderWithNoSpaceBeforeParen,
            entryPoint: 'main'
        });

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
            }
        });
    });

    it('should return empty object when entry point is not found', () =>
    {
        const extractedAttributeData = extractAttributesFromGpuProgram({
            source: shaderCodeInline,
            entryPoint: 'nonExistentFunction'
        });

        expect(extractedAttributeData).toEqual({});
    });

    it('should prefer inline decorators over struct when both exist', () =>
    {
        const shaderWithBothStyles = `
            struct VertexInput {
                @location(0) structPos: vec2<f32>,
            };

            @vertex
            fn mainVert(
                @location(0) inlinePos: vec3<f32>,
            ) -> @builtin(position) vec4<f32> {
                return vec4(inlinePos, 1.0);
            }
        `;

        const extractedAttributeData = extractAttributesFromGpuProgram({
            source: shaderWithBothStyles,
            entryPoint: 'mainVert'
        });

        expect(extractedAttributeData.inlinePos).toBeDefined();
        expect(extractedAttributeData.structPos).toBeUndefined();
    });

    it('should not match function name prefixes (mainVert vs mainVertHelper)', () =>
    {
        const shaderWithSimilarNames = `
            fn mainVertHelper(@location(0) wrongPos: vec2<f32>) -> vec4<f32> {
                return vec4(wrongPos, 0.0, 1.0);
            }

            @vertex
            fn mainVert(@location(0) correctPos: vec3<f32>) -> @builtin(position) vec4<f32> {
                return vec4(correctPos, 1.0);
            }
        `;

        const extractedAttributeData = extractAttributesFromGpuProgram({
            source: shaderWithSimilarNames,
            entryPoint: 'mainVert'
        });

        expect(extractedAttributeData.correctPos).toBeDefined();
        expect(extractedAttributeData.correctPos.format).toBe('float32x3');
        expect(extractedAttributeData.wrongPos).toBeUndefined();
    });

    it('should handle struct input with multiple parameters', () =>
    {
        const shaderWithMultipleParams = `
            struct VertexInput {
                @location(0) position: vec2<f32>,
                @location(1) color: vec4<f32>,
            };

            @vertex
            fn mainVert(input: VertexInput, @builtin(vertex_index) idx: u32) -> @builtin(position) vec4<f32> {
                return vec4(input.position, 0.0, 1.0);
            }
        `;

        const extractedAttributeData = extractAttributesFromGpuProgram({
            source: shaderWithMultipleParams,
            entryPoint: 'mainVert'
        });

        expect(extractedAttributeData.position).toBeDefined();
        expect(extractedAttributeData.color).toBeDefined();
    });

    it('should ignore commented-out code', () =>
    {
        const shaderWithComments = `
            // fn mainVert(@location(0) commentedPos: vec2<f32>) -> vec4<f32> { }
            /*
            fn mainVert(@location(0) blockCommentPos: vec2<f32>) -> vec4<f32> { }
            */

            @vertex
            fn mainVert(@location(0) realPos: vec3<f32>) -> @builtin(position) vec4<f32> {
                return vec4(realPos, 1.0);
            }
        `;

        const extractedAttributeData = extractAttributesFromGpuProgram({
            source: shaderWithComments,
            entryPoint: 'mainVert'
        });

        expect(extractedAttributeData.realPos).toBeDefined();
        expect(extractedAttributeData.commentedPos).toBeUndefined();
        expect(extractedAttributeData.blockCommentPos).toBeUndefined();
    });
});
