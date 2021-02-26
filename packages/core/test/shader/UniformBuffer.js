const {
    Renderer,
    Shader,
    Geometry,
    createUBOElements,
    generateUniformBufferSync,
    getUBOData,
    Buffer,
    UniformGroup,
} = require('../../');
const chai = require('chai');

const { skipHello } = require('@pixi/utils');
const { Matrix, Rectangle, Point } = require('@pixi/math');
const { expect } = require('chai');

skipHello();

const vertexSrc = `
#version 300 es
precision highp float;

in vec2 aVertexPosition;

void main() {

    gl_Position = vec4(aVertexPosition.x, aVertexPosition.y, 0.0, 1.0);

}`;

const stubRenderer = {
    buffer: {
        update: () =>
        {
            // nothing!
        }
    },
    gl: {}
};

describe('generateUniformBufferSync', function ()
{
    it('should generate the correct correctly ordered UBO data', function ()
    {
        const uniformData = {
            uAlpha: {
                index: 1,
                isArray: false,
                name: 'uAlpha',
                size: 1,
                type: 'float',
                value: 0,
            },
            uOtherParam: {
                index: 2,
                isArray: false,
                name: 'uOtherParam',
                size: 1,
                type: 'float',
                value: 0,
            },
        };

        const group = new UniformGroup({
            uOtherParam: 23,
            uAlpha: 1,
        }, false, true);

        const usedUniformData = getUBOData(group.uniforms, uniformData);

        const expectedResult = [{
            index: 1,
            isArray: false,
            name: 'uAlpha',
            size: 1,
            type: 'float',
            value: 0,
        },
        {
            index: 2,
            isArray: false,
            name: 'uOtherParam',
            size: 1,
            type: 'float',
            value: 0,
        }];

        chai.expect(usedUniformData).to.deep.equal(expectedResult);

        const group2 = UniformGroup.uboFrom({
            uAlpha: 1,
            uOtherParam: 23,
        });

        const usedUniformData2 = getUBOData(group2.uniforms, uniformData);

        chai.expect(usedUniformData2).to.deep.equal(expectedResult);

        const group3 = UniformGroup.uboFrom({
            uAlpha: 1,
            uOtherParam: 23,
            uNonExistant: 2
        });

        const usedUniformData3 = getUBOData(group3.uniforms, uniformData);

        chai.expect(usedUniformData3).to.deep.equal(expectedResult);
    });

    it('should generate correct UBO elements', function ()
    {
        const uniformData = [
            { name: 'uFloat', index: 1, type: 'float', size: 1, isArray: false, value: 0 },
            { name: 'uBool', index: 2, type: 'bool', size: 1, isArray: false, value: false },
            { name: 'uInt', index: 3, type: 'int', size: 1, isArray: false, value: 0 },
            { name: 'uUInt', index: 4, type: 'uint', size: 1, isArray: false, value: 0 }
        ];

        const uboData = createUBOElements(uniformData);

        const expectedObject = {
            uboElements: [
                {
                    data: { name: 'uFloat', index: 1, type: 'float', size: 1, isArray: false, value: 0 },
                    offset: 0,
                    dataLen: 4,
                    dirty: 0
                },
                {
                    data: { name: 'uBool', index: 2, type: 'bool', size: 1, isArray: false, value: false },
                    offset: 4,
                    dataLen: 4,
                    dirty: 0
                },
                {
                    data: { name: 'uInt', index: 3, type: 'int', size: 1, isArray: false, value: 0 },
                    offset: 8,
                    dataLen: 4,
                    dirty: 0 },
                {
                    data: { name: 'uUInt', index: 4, type: 'uint', size: 1, isArray: false, value: 0 },
                    offset: 12,
                    dataLen: 4,
                    dirty: 0
                }
            ],
            size: 16
        };

        chai.expect(uboData).to.deep.equal(expectedObject);
    });

    it('should generate the correct update function using the parsers', function ()
    {
        const fragmentSrc = `
        #version 300 es
        precision highp float;
        out vec4 color;

        uniform uboTest {
            float uFloat;
            mat3 uMat3;
            vec2 uPoint;
            vec4 uRect;
        };
      
        void main() {
        
            color = vec4( 0.);
         
        }`;

        const shader = Shader.from(vertexSrc, fragmentSrc);

        const group = UniformGroup.uboFrom({
            uFloat: 23,
            uMat3: new Matrix(10, 20, 30, 40, 50, 60),
            uPoint: new Point(23, 11),
            uRect: new Rectangle(0, 0, 33, 33),
        });

        const f = generateUniformBufferSync(group, shader.program.uniformData);

        const buffer = group.buffer;

        f(shader.program.uniformData, group.uniforms, stubRenderer, {}, buffer);

        const expectedBufferValue = new Float32Array([
            23, 0, 0, 0,
            10, 20, 0, 30, 40, 0, 50, 60, 1, 0, 0, 0,
            23, 11, 0, 0,
            0, 0, 33, 33
        ]);

        chai.expect(buffer.data).to.deep.equal(expectedBufferValue);
    });

    it.only('should write arrays types to buffer correctly', function ()
    {
        [
            {
                debug: true,
                uboSrc: ` uniform uboTest {
                    mat4 uProjectionMatrix;
                    mat4 uViewMatrix;
                    vec3 uEyePosition;
                    vec2 uResolution;
                };`,
                groupData: {
                    uProjectionMatrix: new Float32Array(16),
                    uViewMatrix: new Float32Array(16),
                    uEyePosition: [3, 3, 3],
                    uResolution: [4, 4],
                },
                expectedBuffer: new Float32Array([
                    0, 0, 0, 0,
                    0, 0, 0, 0,
                    0, 0, 0, 0,
                    0, 0, 0, 0,
                    0, 0, 0, 0,
                    0, 0, 0, 0,
                    0, 0, 0, 0,
                    0, 0, 0, 0,
                    3, 3, 3, 0,
                    4, 4, 0, 0,
                ])
            },
            {
                uboSrc: ` uniform uboTest {
                    vec3 uLightColor10;
                    vec3 uLightDirection10;
                    vec3 uLightPosition10;
                    float uLightDistance10;
                    vec3 uLightColor11;
                    vec3 uLightDirection11;
                    vec3 uLightPosition11;
                    float uLightDistance11;
                    vec3 uGlobalAmbient;
                };`,
                groupData: {
                    uLightColor10: [1, 1, 1],
                    uLightDirection10: [2, 2, 2],
                    uLightPosition10: [3, 3, 3],
                    uLightDistance10: 4,

                    uLightColor11: [5, 5, 5],
                    uLightDirection11: [6, 6, 6],
                    uLightPosition11: [7, 7, 7],
                    uLightDistance11: 8,
                    uGlobalAmbient: [9, 9, 9],
                },
                expectedBuffer: new Float32Array([
                    1, 1, 1, 0,
                    2, 2, 2, 0,
                    3, 3, 3, 4,
                    5, 5, 5, 0,
                    6, 6, 6, 0,
                    7, 7, 7, 8,
                    9, 9, 9, 0

                ])
            },

            {
                uboSrc: ` uniform uboTest {
                    float uNormalScale;
                    vec3 uEmissiveColor;
                };`,
                groupData: {
                    uNormalScale: 1,
                    uEmissiveColor: [2, 2, 2],
                },
                expectedBuffer: new Float32Array([
                    1, 0, 0, 0,
                    2, 2, 2, 0
                ])
            },
            {
                uboSrc: ` uniform uboTest {
                    float uFirst;
                    vec2 uSecond; 
                };`,
                debug: true,
                groupData: {
                    uFirst: 1,
                    uSecond: [2, 2],
                },
                expectedBuffer: new Float32Array([
                    1, 0, 2, 2,
                ])
            },
            {
                uboSrc: ` uniform uboTest {
                    vec2 uSecond; 
                    float uFirst;
                };`,
                groupData: {
                    uSecond: [2, 2],
                    uFirst: 1,
                },
                expectedBuffer: new Float32Array([
                    2, 2, 1, 0,
                ])
            },
            {
                uboSrc: ` uniform uboTest {
                    mat3 uMatrixArray[2];
                    vec2 uSecond; 
                };`,
                groupData: {
                    uMatrixArray: [
                        1, 1, 1, 1, 1, 1, 1, 1, 1,
                        2, 2, 2, 2, 2, 2, 2, 2, 2
                    ],
                    uSecond: [100, 101],
                },
                expectedBuffer: new Float32Array([
                    1, 1, 1, 0,
                    1, 1, 1, 0,
                    1, 1, 1, 0,
                    2, 2, 2, 0,
                    2, 2, 2, 0,
                    2, 2, 2, 0,
                    100, 101, 0, 0,

                ])
            },
            {
                uboSrc: ` uniform uboTest {
                    float uFloatArray[10];
                };`,
                groupData: {
                    uFloatArray: new Float32Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
                },
                expectedBuffer: new Float32Array([
                    0, 0, 0, 0,
                    1, 0, 0, 0,
                    2, 0, 0, 0,
                    3, 0, 0, 0,
                    4, 0, 0, 0,
                    5, 0, 0, 0,
                    6, 0, 0, 0,
                    7, 0, 0, 0,
                    8, 0, 0, 0,
                    9, 0, 0, 0
                ])

            },
            {
                uboSrc: ` uniform uboTest {
                    float uFirst; 
                    float uFloatArray[5];
                };`,
                groupData: {
                    uFirst: 2,
                    uFloatArray: new Float32Array([11, 12, 13, 14, 15]),
                },
                expectedBuffer: new Float32Array([
                    2, 0, 0, 0,
                    11, 0, 0, 0,
                    12, 0, 0, 0,
                    13, 0, 0, 0,
                    14, 0, 0, 0,
                    15, 0, 0, 0,
                ])

            },
            {
                uboSrc: ` uniform uboTest {
                    float uFirst; 
                    float uSecond; 
                    float uThird; 
                    float uForth; 
                    float uFloatArray[5];
                };`,
                groupData: {
                    uFirst: 2,
                    uSecond: 3,
                    uThird: 4,
                    uForth: 5,
                    uFloatArray: new Float32Array([11, 12, 13, 14, 15]),
                },
                expectedBuffer: new Float32Array([
                    2, 3, 4, 5,
                    11, 0, 0, 0,
                    12, 0, 0, 0,
                    13, 0, 0, 0,
                    14, 0, 0, 0,
                    15, 0, 0, 0,
                ])

            },
            {
                uboSrc: ` uniform uboTest {
                    float uFirst; 
                    float uSecond; 
                    float uThird; 
                    float uForth; 
                    float uFifth; 
                    float uFloatArray[5];
                };`,
                groupData: {
                    uFirst: 2,
                    uSecond: 3,
                    uThird: 4,
                    uForth: 5,
                    uFifth: 6,
                    uFloatArray: new Float32Array([11, 12, 13, 14, 15]),
                },
                expectedBuffer: new Float32Array([
                    2, 3, 4, 5,
                    6, 0, 0, 0,
                    11, 0, 0, 0,
                    12, 0, 0, 0,
                    13, 0, 0, 0,
                    14, 0, 0, 0,
                    15, 0, 0, 0,
                ])

            },
            {
                uboSrc: ` uniform uboTest {
                    float uFirst; 
                    vec2 uFirstVec2Array[2];
                    vec2 uSecond; 
                    float uSecondFloatArray[2];

                };`,
                groupData: {
                    uFirst: 2,
                    uFirstVec2Array: [11, 12, 13, 14],
                    uSecond: [100, 101],
                    uSecondFloatArray: new Float32Array([14, 15]),
                },

                expectedBuffer: new Float32Array([
                    2, 0, 0, 0,
                    11, 12, 0, 0,
                    13, 14, 0, 0,
                    100, 101, 0, 0, 14, 0, 0, 0, 15, 0, 0, 0
                ])
            },
            {
                uboSrc: ` uniform uboTest {
                    float uFirst[3]; 
                    vec3 uVec3[3]; 
                    mat4 uMat4[2];
                };`,
                groupData: {
                    uFirst: [1, 2, 3],
                    uVec3: [1, 1, 1, 2, 2, 2, 3, 3, 3],
                    uMat4: [
                        1, 1, 1, 1,
                        2, 2, 2, 2,
                        3, 3, 3, 3,
                        4, 4, 4, 4,

                        5, 5, 5, 5,
                        6, 6, 6, 6,
                        7, 7, 7, 7,
                        8, 8, 8, 8,

                    ],
                },
                expectedBuffer: new Float32Array([
                    1, 0, 0, 0,
                    2, 0, 0, 0,
                    3, 0, 0, 0,

                    1, 1, 1, 0,
                    2, 2, 2, 0,
                    3, 3, 3, 0,

                    1, 1, 1, 1,
                    2, 2, 2, 2,
                    3, 3, 3, 3,
                    4, 4, 4, 4,

                    5, 5, 5, 5,
                    6, 6, 6, 6,
                    7, 7, 7, 7,
                    8, 8, 8, 8,
                ])

            },
            {
                uboSrc: ` uniform uboTest {
                    float uFirst[3]; 
                    vec3 uVec3[3]; 
                    mat4 uMat4[2];
                };`,
                groupData: new Buffer(new Float32Array([1, 0, 0, 0, 2, 0, 0, 0])),
                expectedBuffer: new Float32Array([
                    1, 0, 0, 0, 2, 0, 0, 0
                ])

            },
            {
                uboSrc: ` uniform uboTest {
                    vec3 uLightColor;
                    float uLightDistance;
                };`,
                groupData: {
                    uLightColor: [1, 2, 3],
                    uLightDistance: 4
                },
                expectedBuffer: new Float32Array([
                    1, 2, 3, 4,
                ])

            },
            {

                uboSrc: ` uniform uboTest {
                    vec3 uLightColor;
                    vec3 uLightPosition;
                    float uLightDistance;
                    vec2 uLimit;
                    vec3 uGlobalAmbient;
                };`,
                groupData: {
                    uLightColor: [1, 1, 1],
                    uLightPosition: [2, 2, 2],
                    uLightDistance: 3,
                    uLimit: [4, 4],
                    uGlobalAmbient: [5, 5, 5],
                },
                expectedBuffer: new Float32Array([
                    1, 1, 1, 0,
                    2, 2, 2, 3,
                    4, 4, 0, 0,
                    5, 5, 5, 0,
                ])

            },
        ].forEach((toTest) =>
        {
            const fragmentSrc = `
            #version 300 es
            precision highp float;
            out vec4 color;
            
            ${toTest.uboSrc}
          
            void main() {
            
                color = vec4(0.);
             
            }`;

            const shader = Shader.from(vertexSrc, fragmentSrc);

            const group =  UniformGroup.uboFrom(toTest.groupData);

            const f = generateUniformBufferSync(group, shader.program.uniformData);

            const buffer = group.buffer;

            if (buffer.data.length === 1)
            {
                buffer.data = new Float32Array(f.size / 4);
            }

            f.syncFunc(shader.program.uniformData, group.uniforms, stubRenderer, {}, buffer);

            // handy for testing
            // if (toTest.debug)
            // {
            //     console.log('expected', toTest.expectedBuffer);
            //     console.log('actual  ', buffer.data);
            // }

            chai.expect(buffer.data).to.deep.equal(toTest.expectedBuffer);
        });
    });
});

