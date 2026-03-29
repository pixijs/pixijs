/* eslint-disable max-len */

// ─── GLSL utilities ─────────────────────────────────────────────────

/**
 * Generates GLSL texture sampling switch for N textures.
 * @param maxTextures - max batch textures
 * @internal
 */
export function generateGlSampleSrc(maxTextures: number): string
{
    let src = '';

    for (let i = 0; i < maxTextures; i++)
    {
        if (i > 0) src += '\nelse ';
        if (i < maxTextures - 1) src += `if(textureId < ${i}.5)`;
        src += `\n{ texColor = texture2D(uSamplers[${i}], vTextureCoord); }`;
    }

    return src;
}

/**
 * Builds the GLSL vertex shader source code.
 * @param includeLocalUniforms - whether to include local uniform variables
 * @internal
 */
export function buildGlVertexSrc(includeLocalUniforms = true): string
{
    return `
precision highp float;

const float FILL = 1.0;
const float BEVEL = 4.0;
const float MITER = 8.0;
const float ROUND = 12.0;
const float JOINT_CAP_BUTT = 16.0;
const float JOINT_CAP_SQUARE = 18.0;
const float JOINT_CAP_ROUND = 20.0;
const float FILL_EXPAND = 24.0;

const float CAP_BUTT = 1.0;
const float CAP_SQUARE = 2.0;
const float CAP_ROUND = 3.0;
const float CAP_BUTT2 = 4.0;

const float MITER_LIMIT = 10.0;

attribute vec2 aPrev;
attribute vec2 aPoint1;
attribute vec2 aPoint2;
attribute vec2 aNext;
attribute float aTravel;
attribute float aVertexJoint;
attribute float aLineWidth;
attribute float aStylePacked;
attribute vec4 aColor;
attribute vec2 aTextureIdAndRound;

uniform mat3 uProjectionMatrix;
uniform mat3 uWorldTransformMatrix;
${includeLocalUniforms ? 'uniform mat3 uTransformMatrix;\nuniform vec4 uColor;' : 'uniform vec4 uWorldColorAlpha;'}

varying vec4 vLine1;
varying vec4 vLine2;
varying vec4 vArc;
varying float vType;
varying vec4 vColor;
varying vec2 vTextureCoord;
varying vec2 vTravel;
varying float vTextureId;

vec2 doBisect(vec2 norm, float len, vec2 norm2, float len2,
    float dy, float inner) {
    vec2 bisect = (norm + norm2) / 2.0;
    bisect /= dot(norm, bisect);
    vec2 shift = dy * bisect;
    if (inner > 0.5) {
        if (len < len2) {
            if (abs(dy * (bisect.x * norm.y - bisect.y * norm.x)) > len) {
                return dy * norm;
            }
        } else {
            if (abs(dy * (bisect.x * norm2.y - bisect.y * norm2.x)) > len2) {
                return dy * norm;
            }
        }
    }
    return dy * bisect;
}

float getScale(mat3 m, float scaleMode) {
    if (scaleMode > 0.5) {
        vec2 d = (m * vec3(1.0, 1.0, 0.0)).xy;
        return sqrt(dot(d, d) * 0.5);
    }
    return 1.0;
}

void main(void){
    ${includeLocalUniforms ? 'mat3 worldMatrix = uWorldTransformMatrix * uTransformMatrix;' : 'mat3 worldMatrix = uWorldTransformMatrix;'}

    vec2 pointA = (worldMatrix * vec3(aPoint1, 1.0)).xy;
    vec2 pointB = (worldMatrix * vec3(aPoint2, 1.0)).xy;

    vec2 xBasis = pointB - pointA;
    float len = length(xBasis);
    vec2 forward = xBasis / len;
    vec2 norm = vec2(forward.y, -forward.x);

    float type = floor(aVertexJoint / 16.0);
    float vertexNum = aVertexJoint - type * 16.0;
    float dx = 0.0, dy = 1.0;

    float capType = floor(type / 32.0);
    type -= capType * 32.0;

    float scaleMode = floor(aStylePacked);
    float alignment = aStylePacked - scaleMode;

    float renderGroupScale = getScale(worldMatrix, scaleMode);
    float lineWidth = aLineWidth * renderGroupScale;
    float avgScale = renderGroupScale;

    lineWidth *= 0.5;
    float lineAlignment = 2.0 * alignment - 1.0;
    float expand = 1.0;
    float resolution = 1.0;

    vTextureId = aTextureIdAndRound.y;
    vTextureCoord = vec2(0.0);

    vec2 pos;

    if (capType == CAP_ROUND) {
        vertexNum += 4.0;
        type = JOINT_CAP_ROUND;
        capType = 0.0;
        lineAlignment = -lineAlignment;
    }

    vLine1 = vec4(0.0, 10.0, 1.0, 0.0);
    vLine2 = vec4(0.0, 10.0, 1.0, 0.0);
    vArc = vec4(0.0);
    if (type == FILL) {
        pos = pointA;
        vType = 0.0;
        vLine2 = vec4(-2.0, -2.0, -2.0, 0.0);
    } else if (type >= FILL_EXPAND && type < FILL_EXPAND + 7.5) {
        float flags = type - FILL_EXPAND;
        float flag3 = floor(flags / 4.0);
        float flag2 = floor((flags - flag3 * 4.0) / 2.0);
        float flag1 = flags - flag3 * 4.0 - flag2 * 2.0;

        vec2 prev = (worldMatrix * vec3(aPrev, 1.0)).xy;

        if (vertexNum < 0.5) {
            pos = prev;
        } else if (vertexNum < 1.5) {
            pos = pointA;
        } else {
            pos = pointB;
        }
        float len2 = length(aNext);
        vec2 bisect = (worldMatrix * vec3(aNext, 0.0)).xy;
        if (len2 > 0.01) {
            bisect = normalize(bisect) * len2;
        }

        vec2 n1 = normalize(vec2(pointA.y - prev.y, -(pointA.x - prev.x)));
        vec2 n2 = normalize(vec2(pointB.y - pointA.y, -(pointB.x - pointA.x)));
        vec2 n3 = normalize(vec2(prev.y - pointB.y, -(prev.x - pointB.x)));

        if (n1.x * n2.y - n1.y * n2.x < 0.0) {
            n1 = -n1;
            n2 = -n2;
            n3 = -n3;
        }
        pos += bisect * expand;

        vLine1 = vec4(16.0, 16.0, 16.0, -1.0);
        if (flag1 > 0.5) {
            vLine1.x = -dot(pos - prev, n1);
        }
        if (flag2 > 0.5) {
            vLine1.y = -dot(pos - pointA, n2);
        }
        if (flag3 > 0.5) {
            vLine1.z = -dot(pos - pointB, n3);
        }
        vLine1.xyz *= resolution;
        vType = 2.0;
    } else if (type >= BEVEL) {
        float dy = lineWidth + expand;
        float shift = lineWidth * lineAlignment;
        float inner = 0.0;
        if (vertexNum >= 1.5) {
            dy = -dy;
            inner = 1.0;
        }

        vec2 base, next, xBasis2, bisect;
        float flag = 0.0;
        float side2 = 1.0;
        if (vertexNum < 0.5 || vertexNum > 2.5 && vertexNum < 3.5) {
            next = (worldMatrix * vec3(aPrev, 1.0)).xy;
            base = pointA;
            flag = type - floor(type / 2.0) * 2.0;
            side2 = -1.0;
        } else {
            next = (worldMatrix * vec3(aNext, 1.0)).xy;
            base = pointB;
            if (type >= MITER && type < MITER + 3.5) {
                flag = step(MITER + 1.5, type);
            }
        }
        xBasis2 = next - base;
        float len2 = length(xBasis2);
        vec2 norm2 = vec2(xBasis2.y, -xBasis2.x) / len2;
        float D = norm.x * norm2.y - norm.y * norm2.x;
        if (D < 0.0) {
            inner = 1.0 - inner;
        }

        norm2 *= side2;

        float collinear = step(0.0, dot(norm, norm2));

        vType = 0.0;
        float dy2 = -1000.0;

        if (abs(D) < 0.01 && collinear < 0.5) {
            if (type >= ROUND && type < ROUND + 1.5) {
                type = JOINT_CAP_ROUND;
            }
        }

        vLine1 = vec4(0.0, lineWidth, max(abs(norm.x), abs(norm.y)), min(abs(norm.x), abs(norm.y)));
        vLine2 = vec4(0.0, lineWidth, max(abs(norm2.x), abs(norm2.y)), min(abs(norm2.x), abs(norm2.y)));

        if (vertexNum < 3.5) {
            if (abs(D) < 0.01 && collinear < 0.5) {
                pos = (shift + dy) * norm;
            } else {
                if (flag < 0.5 && inner < 0.5) {
                    pos = (shift + dy) * norm;
                } else {
                    pos = doBisect(norm, len, norm2, len2, shift + dy, inner);
                }
            }
            vLine2.y = -1000.0;
            if (capType >= CAP_BUTT && capType < CAP_ROUND) {
                float extra = step(CAP_SQUARE, capType) * lineWidth;
                vec2 back = -forward;
                if (vertexNum < 0.5 || vertexNum > 2.5) {
                    pos += back * (expand + extra);
                    dy2 = expand;
                } else {
                    dy2 = dot(pos + base - pointA, back) - extra;
                }
            }
            if (type >= JOINT_CAP_BUTT && type < JOINT_CAP_SQUARE + 0.5) {
                float extra = step(JOINT_CAP_SQUARE, type) * lineWidth;
                if (vertexNum < 0.5 || vertexNum > 2.5) {
                    vLine2.y = dot(pos + base - pointB, forward) - extra;
                } else {
                    pos += forward * (expand + extra);
                    vLine2.y = expand;
                    if (capType >= CAP_BUTT) {
                        dy2 -= expand + extra;
                    }
                }
            }
        } else if (type >= JOINT_CAP_ROUND && type < JOINT_CAP_ROUND + 1.5) {
            base += shift * norm;
            if (inner > 0.5) {
                dy = -dy;
                inner = 0.0;
            }
            vec2 d2 = abs(dy) * forward;
            if (vertexNum < 4.5) {
                dy = -dy;
                pos = dy * norm;
            } else if (vertexNum < 5.5) {
                pos = dy * norm;
            } else if (vertexNum < 6.5) {
                pos = dy * norm + d2;
                vArc.x = abs(dy);
            } else {
                dy = -dy;
                pos = dy * norm + d2;
                vArc.x = abs(dy);
            }
            vLine2 = vec4(0.0, lineWidth * 2.0 + 10.0, 1.0, 0.0);
            vArc.y = dy;
            vArc.z = 0.0;
            vArc.w = lineWidth;
            vType = 3.0;
        } else if (abs(D) < 0.01 && collinear < 0.5) {
            pos = dy * norm;
        } else {
            if (inner > 0.5) {
                dy = -dy;
                inner = 0.0;
            }
            float side = sign(dy);
            vec2 norm3 = normalize(norm + norm2);

            if (type >= MITER && type < MITER + 3.5) {
                vec2 farVertex = doBisect(norm, len, norm2, len2, shift + dy, 0.0);
                if (length(farVertex) > abs(shift + dy) * MITER_LIMIT) {
                    type = BEVEL;
                }
            }

            if (vertexNum < 4.5) {
                pos = doBisect(norm, len, norm2, len2, shift - dy, 1.0);
            } else if (vertexNum < 5.5) {
                pos = (shift + dy) * norm;
            } else if (vertexNum > 7.5) {
                pos = (shift + dy) * norm2;
            } else {
                if (type >= ROUND && type < ROUND + 1.5) {
                    pos = doBisect(norm, len, norm2, len2, shift + dy, 0.0);
                    float d2 = abs(shift + dy);
                    if (length(pos) > abs(shift + dy) * 1.5) {
                        if (vertexNum < 6.5) {
                            pos.x = (shift + dy) * norm.x - d2 * norm.y;
                            pos.y = (shift + dy) * norm.y + d2 * norm.x;
                        } else {
                            pos.x = (shift + dy) * norm2.x + d2 * norm2.y;
                            pos.y = (shift + dy) * norm2.y - d2 * norm2.x;
                        }
                    }
                } else if (type >= MITER && type < MITER + 3.5) {
                    pos = doBisect(norm, len, norm2, len2, shift + dy, 0.0);
                } else if (type >= BEVEL && type < BEVEL + 1.5) {
                    float d2 = side / resolution;
                    if (vertexNum < 6.5) {
                        pos = (shift + dy) * norm + d2 * norm3;
                    } else {
                        pos = (shift + dy) * norm2 + d2 * norm3;
                    }
                }
            }

            if (type >= ROUND && type < ROUND + 1.5) {
                vArc.x = side * dot(pos, norm3);
                vArc.y = pos.x * norm3.y - pos.y * norm3.x;
                vArc.z = dot(norm, norm3) * (lineWidth + side * shift);
                vArc.w = lineWidth + side * shift;
                vType = 3.0;
            } else if (type >= MITER && type < MITER + 3.5) {
                vType = 1.0;
            } else if (type >= BEVEL && type < BEVEL + 1.5) {
                vType = 4.0;
                vArc.z = dot(norm, norm3) * (lineWidth + side * shift) - side * dot(pos, norm3);
            }

            dy = side * (dot(pos, norm) - shift);
            dy2 = side * (dot(pos, norm2) - shift);
        }

        pos += base;
        vLine1.xy = vec2(dy, vLine1.y) * resolution;
        vLine2.xy = vec2(dy2, vLine2.y) * resolution;
        vArc = vArc * resolution;
        vTravel = vec2(aTravel * avgScale + dot(pos - pointA, vec2(-norm.y, norm.x)), avgScale);
    }

    gl_Position = vec4((uProjectionMatrix * vec3(pos, 1.0)).xy, 0.0, 1.0);

    vec4 col = ${includeLocalUniforms ? 'aColor * uColor' : 'aColor * uWorldColorAlpha'};
    vColor = vec4(col.rgb * col.a, col.a);
}
`;
}

// ─── GLSL fragment snippets ─────────────────────────────────────────

/**
 * GLSL fragment preamble: precision, varyings, and uniforms.
 * @param maxTextures - max batch textures
 * @param extraUniforms - additional uniform declarations to append
 * @internal
 */
export function glFragmentPreamble(maxTextures: number, extraUniforms = ''): string
{
    return `
#ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
#else
  precision mediump float;
#endif

varying vec4 vColor;
varying vec4 vLine1;
varying vec4 vLine2;
varying vec4 vArc;
varying float vType;
varying float vTextureId;
varying vec2 vTextureCoord;
varying vec2 vTravel;
uniform sampler2D uSamplers[${maxTextures}];
${extraUniforms}`;
}

/** @internal */
export function glPixelLineFunction(): string
{
    return `
float pixelLine(float x, float A, float B) {
    float y = abs(x), s = sign(x);
    if (y * 2.0 < A - B) {
        return 0.5 + s * y / A;
    }
    y -= (A - B) * 0.5;
    y = max(1.0 - y / B, 0.0);
    return (1.0 + s * (1.0 - y * y)) * 0.5;
}
`;
}

/** @internal */
export function glHhaaAlphaBlock(): string
{
    return `    if (vType < 0.5) {
        float left = pixelLine(-vLine1.y - vLine1.x, vLine1.z, vLine1.w);
        float right = pixelLine(vLine1.y - vLine1.x, vLine1.z, vLine1.w);
        float near = vLine2.x - 0.5;
        float far = min(vLine2.x + 0.5, 0.0);
        float top = vLine2.y - 0.5;
        float bottom = min(vLine2.y + 0.5, 0.0);
        alpha = (right - left) * max(bottom - top, 0.0) * max(far - near, 0.0);
    } else if (vType < 1.5) {
        float a1 = pixelLine(-vLine1.y - vLine1.x, vLine1.z, vLine1.w);
        float a2 = pixelLine(vLine1.y - vLine1.x, vLine1.z, vLine1.w);
        float b1 = pixelLine(-vLine2.y - vLine2.x, vLine2.z, vLine2.w);
        float b2 = pixelLine(vLine2.y - vLine2.x, vLine2.z, vLine2.w);
        alpha = a2 * b2 - a1 * b1;
    } else if (vType < 2.5) {
        alpha *= max(min(vLine1.x + 0.5, 1.0), 0.0);
        alpha *= max(min(vLine1.y + 0.5, 1.0), 0.0);
        alpha *= max(min(vLine1.z + 0.5, 1.0), 0.0);
    } else if (vType < 3.5) {
        float a1 = pixelLine(-vLine1.y - vLine1.x, vLine1.z, vLine1.w);
        float a2 = pixelLine(vLine1.y - vLine1.x, vLine1.z, vLine1.w);
        float b1 = pixelLine(-vLine2.y - vLine2.x, vLine2.z, vLine2.w);
        float b2 = pixelLine(vLine2.y - vLine2.x, vLine2.z, vLine2.w);
        float alpha_miter = a2 * b2 - a1 * b1;
        float alpha_plane = clamp(vArc.z - vArc.x + 0.5, 0.0, 1.0);
        float d = length(vArc.xy);
        float circle_hor = max(min(vArc.w, d + 0.5) - max(-vArc.w, d - 0.5), 0.0);
        float circle_vert = min(vArc.w * 2.0, 1.0);
        float alpha_circle = circle_hor * circle_vert;
        alpha = min(alpha_miter, max(alpha_circle, alpha_plane));
    } else {
        float a1 = pixelLine(-vLine1.y - vLine1.x, vLine1.z, vLine1.w);
        float a2 = pixelLine(vLine1.y - vLine1.x, vLine1.z, vLine1.w);
        float b1 = pixelLine(-vLine2.y - vLine2.x, vLine2.z, vLine2.w);
        float b2 = pixelLine(vLine2.y - vLine2.x, vLine2.z, vLine2.w);
        alpha = a2 * b2 - a1 * b1;
        alpha *= clamp(vArc.z + 0.5, 0.0, 1.0);
    }
`;
}

/**
 * @param maxTextures - max batch textures
 * @internal
 */
export function glTextureSampleAndOutput(maxTextures: number): string
{
    const sampleSrc = generateGlSampleSrc(maxTextures);

    return `
    vec4 texColor;
    float textureId = floor(vTextureId + 0.5);
    ${sampleSrc}

    gl_FragColor = vColor * texColor * alpha;
}
`;
}

// ─── WGSL utilities ─────────────────────────────────────────────────

/**
 * Generates WGSL texture binding declarations and sampling branches.
 * @param maxTextures - max batch textures
 * @internal
 */
export function wgslTextureBindingsAndBranches(maxTextures: number): { bindings: string; branches: string }
{
    let bindings = '';
    let branches = '';

    for (let i = 0; i < maxTextures; i++)
    {
        bindings += `@group(1) @binding(${i * 2}) var uTexture${i}: texture_2d<f32>;\n`;
        bindings += `@group(1) @binding(${(i * 2) + 1}) var uSampler${i}: sampler;\n`;

        const cond = i < maxTextures - 1 ? `if textureIndex == ${i}u` : '';
        const elseStr = i > 0 ? 'else ' : '';

        branches += `    ${elseStr}${cond} {\n`;
        branches += `        texColor = textureSample(uTexture${i}, uSampler${i}, vTextureCoord);\n`;
        branches += `    }\n`;
    }

    return { bindings, branches };
}

// ─── WGSL declaration snippets ──────────────────────────────────────

/** @internal */
export function wgslStructsAndConstants(): string
{
    return `struct GlobalUniforms {
    uProjectionMatrix: mat3x3<f32>,
    uWorldTransformMatrix: mat3x3<f32>,
    uWorldColorAlpha: vec4<f32>,
    uResolution: vec2<f32>,
}

@group(0) @binding(0) var<uniform> globalUniforms: GlobalUniforms;

struct VSInput {
    @location(0) aPrev: vec2<f32>,
    @location(1) aPoint1: vec2<f32>,
    @location(2) aPoint2: vec2<f32>,
    @location(3) aNext: vec2<f32>,
    @location(4) aTravel: f32,
    @location(5) aVertexJoint: f32,
    @location(6) aLineWidth: f32,
    @location(7) aStylePacked: f32,
    @location(8) aColor: vec4<f32>,
    @location(9) aTextureIdAndRound: vec2<u32>,
}

struct VSOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) vLine1: vec4<f32>,
    @location(1) vLine2: vec4<f32>,
    @location(2) vArc: vec4<f32>,
    @location(3) vType: f32,
    @location(4) vColor: vec4<f32>,
    @location(5) vTextureCoord: vec2<f32>,
    @location(6) vTravel: vec2<f32>,
    @location(7) @interpolate(flat) vTextureId: u32,
}

const FILL: f32 = 1.0;
const BEVEL: f32 = 4.0;
const MITER: f32 = 8.0;
const ROUND: f32 = 12.0;
const JOINT_CAP_BUTT: f32 = 16.0;
const JOINT_CAP_SQUARE: f32 = 18.0;
const JOINT_CAP_ROUND: f32 = 20.0;
const FILL_EXPAND: f32 = 24.0;
const CAP_BUTT: f32 = 1.0;
const CAP_SQUARE: f32 = 2.0;
const CAP_ROUND: f32 = 3.0;
const MITER_LIMIT: f32 = 10.0;
`;
}

/** @internal */
export function wgslLocalUniformsBlock(): string
{
    return `struct LocalUniforms {
    uTransformMatrix: mat3x3<f32>,
    uColor: vec4<f32>,
    uRound: f32,
}

@group(2) @binding(0) var<uniform> localUniforms: LocalUniforms;
`;
}

// ─── WGSL function snippets ─────────────────────────────────────────

/** @internal */
export function wgslHelperFunctions(): string
{
    return `fn doBisect(norm: vec2<f32>, len: f32, norm2: vec2<f32>, len2: f32, dy: f32, inner: f32) -> vec2<f32> {
    var bisect = (norm + norm2) / 2.0;
    bisect = bisect / dot(norm, bisect);
    if (inner > 0.5) {
        if (len < len2) {
            if (abs(dy * (bisect.x * norm.y - bisect.y * norm.x)) > len) {
                return dy * norm;
            }
        } else {
            if (abs(dy * (bisect.x * norm2.y - bisect.y * norm2.x)) > len2) {
                return dy * norm;
            }
        }
    }
    return dy * bisect;
}

fn getScale(m: mat3x3<f32>, scaleMode: f32) -> f32 {
    if (scaleMode > 0.5) {
        let d = (m * vec3<f32>(1.0, 1.0, 0.0)).xy;
        return sqrt(dot(d, d) * 0.5);
    }
    return 1.0;
}
`;
}

/**
 * @param worldMatrixExpr - expression for computing the world matrix
 * @param rawColorExpr - expression for computing the raw vertex color
 * @internal
 */
export function wgslVertexBody(worldMatrixExpr: string, rawColorExpr: string): string
{
    return `@vertex
fn mainVertex(input: VSInput) -> VSOutput {
    var output: VSOutput;
    let worldMatrix = ${worldMatrixExpr};

    let pointA = (worldMatrix * vec3<f32>(input.aPoint1, 1.0)).xy;
    let pointB = (worldMatrix * vec3<f32>(input.aPoint2, 1.0)).xy;

    let xBasis = pointB - pointA;
    let segLen = length(xBasis);
    let forward = xBasis / segLen;
    let norm = vec2<f32>(forward.y, -forward.x);

    var jointType = floor(input.aVertexJoint / 16.0);
    var vertexNum = input.aVertexJoint - jointType * 16.0;

    var capType = floor(jointType / 32.0);
    jointType = jointType - capType * 32.0;

    let scaleMode = floor(input.aStylePacked);
    let alignmentVal = input.aStylePacked - scaleMode;

    let renderGroupScale = getScale(worldMatrix, scaleMode);
    var lineWidth = input.aLineWidth * renderGroupScale * 0.5;
    let avgScale = renderGroupScale;
    var lineAlignment = 2.0 * alignmentVal - 1.0;
    let expand: f32 = 1.0;
    let resolution: f32 = 1.0;

    output.vTextureId = input.aTextureIdAndRound.y;
    output.vTextureCoord = vec2<f32>(0.0);
    output.vLine1 = vec4<f32>(0.0, 10.0, 1.0, 0.0);
    output.vLine2 = vec4<f32>(0.0, 10.0, 1.0, 0.0);
    output.vArc = vec4<f32>(0.0);
    output.vType = 0.0;
    output.vTravel = vec2<f32>(0.0);

    var pos = vec2<f32>(0.0);

    if (capType == CAP_ROUND) {
        vertexNum += 4.0;
        jointType = JOINT_CAP_ROUND;
        capType = 0.0;
        lineAlignment = -lineAlignment;
    }

    if (jointType == FILL) {
        pos = pointA;
        output.vType = 0.0;
        output.vLine2 = vec4<f32>(-2.0, -2.0, -2.0, 0.0);
    } else if (jointType >= FILL_EXPAND && jointType < FILL_EXPAND + 7.5) {
        let flags = jointType - FILL_EXPAND;
        let flag3 = floor(flags / 4.0);
        let flag2 = floor((flags - flag3 * 4.0) / 2.0);
        let flag1 = flags - flag3 * 4.0 - flag2 * 2.0;

        let prev = (worldMatrix * vec3<f32>(input.aPrev, 1.0)).xy;

        if (vertexNum < 0.5) {
            pos = prev;
        } else if (vertexNum < 1.5) {
            pos = pointA;
        } else {
            pos = pointB;
        }
        let len2 = length(input.aNext);
        var bisect = (worldMatrix * vec3<f32>(input.aNext, 0.0)).xy;
        if (len2 > 0.01) {
            bisect = normalize(bisect) * len2;
        }

        var n1 = normalize(vec2<f32>(pointA.y - prev.y, -(pointA.x - prev.x)));
        var n2 = normalize(vec2<f32>(pointB.y - pointA.y, -(pointB.x - pointA.x)));
        var n3 = normalize(vec2<f32>(prev.y - pointB.y, -(prev.x - pointB.x)));

        if (n1.x * n2.y - n1.y * n2.x < 0.0) {
            n1 = -n1; n2 = -n2; n3 = -n3;
        }
        pos += bisect * expand;

        output.vLine1 = vec4<f32>(16.0, 16.0, 16.0, -1.0);
        if (flag1 > 0.5) { output.vLine1.x = -dot(pos - prev, n1); }
        if (flag2 > 0.5) { output.vLine1.y = -dot(pos - pointA, n2); }
        if (flag3 > 0.5) { output.vLine1.z = -dot(pos - pointB, n3); }
        output.vLine1 = vec4<f32>(output.vLine1.xyz * resolution, output.vLine1.w);
        output.vType = 2.0;
    } else if (jointType >= BEVEL) {
        var dy = lineWidth + expand;
        let shift = lineWidth * lineAlignment;
        var inner: f32 = 0.0;
        if (vertexNum >= 1.5) { dy = -dy; inner = 1.0; }

        var base: vec2<f32>;
        var nextPt: vec2<f32>;
        var flag: f32 = 0.0;
        var side2: f32 = 1.0;
        if (vertexNum < 0.5 || (vertexNum > 2.5 && vertexNum < 3.5)) {
            nextPt = (worldMatrix * vec3<f32>(input.aPrev, 1.0)).xy;
            base = pointA;
            flag = jointType - floor(jointType / 2.0) * 2.0;
            side2 = -1.0;
        } else {
            nextPt = (worldMatrix * vec3<f32>(input.aNext, 1.0)).xy;
            base = pointB;
            if (jointType >= MITER && jointType < MITER + 3.5) {
                flag = step(MITER + 1.5, jointType);
            }
        }
        let xBasis2 = nextPt - base;
        let len2 = length(xBasis2);
        var norm2 = vec2<f32>(xBasis2.y, -xBasis2.x) / len2;
        let D = norm.x * norm2.y - norm.y * norm2.x;
        if (D < 0.0) { inner = 1.0 - inner; }
        norm2 *= side2;
        let collinear = step(0.0, dot(norm, norm2));

        output.vType = 0.0;
        var dy2: f32 = -1000.0;

        if (abs(D) < 0.01 && collinear < 0.5) {
            if (jointType >= ROUND && jointType < ROUND + 1.5) {
                jointType = JOINT_CAP_ROUND;
            }
        }

        output.vLine1 = vec4<f32>(0.0, lineWidth, max(abs(norm.x), abs(norm.y)), min(abs(norm.x), abs(norm.y)));
        output.vLine2 = vec4<f32>(0.0, lineWidth, max(abs(norm2.x), abs(norm2.y)), min(abs(norm2.x), abs(norm2.y)));

        if (vertexNum < 3.5) {
            if (abs(D) < 0.01 && collinear < 0.5) {
                pos = (shift + dy) * norm;
            } else {
                if (flag < 0.5 && inner < 0.5) {
                    pos = (shift + dy) * norm;
                } else {
                    pos = doBisect(norm, segLen, norm2, len2, shift + dy, inner);
                }
            }
            output.vLine2 = vec4<f32>(output.vLine2.x, -1000.0, output.vLine2.z, output.vLine2.w);
            if (capType >= CAP_BUTT && capType < CAP_ROUND) {
                let extra = step(CAP_SQUARE, capType) * lineWidth;
                let back = -forward;
                if (vertexNum < 0.5 || vertexNum > 2.5) {
                    pos += back * (expand + extra);
                    dy2 = expand;
                } else {
                    dy2 = dot(pos + base - pointA, back) - extra;
                }
            }
            if (jointType >= JOINT_CAP_BUTT && jointType < JOINT_CAP_SQUARE + 0.5) {
                let extra = step(JOINT_CAP_SQUARE, jointType) * lineWidth;
                if (vertexNum < 0.5 || vertexNum > 2.5) {
                    output.vLine2 = vec4<f32>(output.vLine2.x, dot(pos + base - pointB, forward) - extra, output.vLine2.z, output.vLine2.w);
                } else {
                    pos += forward * (expand + extra);
                    output.vLine2 = vec4<f32>(output.vLine2.x, expand, output.vLine2.z, output.vLine2.w);
                    if (capType >= CAP_BUTT) {
                        dy2 -= expand + extra;
                    }
                }
            }
        } else if (jointType >= JOINT_CAP_ROUND && jointType < JOINT_CAP_ROUND + 1.5) {
            var baseShifted = base + shift * norm;
            if (inner > 0.5) { dy = -dy; inner = 0.0; }
            let d2 = abs(dy) * forward;
            if (vertexNum < 4.5) { dy = -dy; pos = dy * norm; }
            else if (vertexNum < 5.5) { pos = dy * norm; }
            else if (vertexNum < 6.5) { pos = dy * norm + d2; output.vArc = vec4<f32>(abs(dy), output.vArc.y, output.vArc.z, output.vArc.w); }
            else { dy = -dy; pos = dy * norm + d2; output.vArc = vec4<f32>(abs(dy), output.vArc.y, output.vArc.z, output.vArc.w); }
            output.vLine2 = vec4<f32>(0.0, lineWidth * 2.0 + 10.0, 1.0, 0.0);
            output.vArc = vec4<f32>(output.vArc.x, dy, 0.0, lineWidth);
            output.vType = 3.0;
            base = baseShifted;
        } else if (abs(D) < 0.01 && collinear < 0.5) {
            pos = dy * norm;
        } else {
            if (inner > 0.5) { dy = -dy; inner = 0.0; }
            let side = sign(dy);
            let norm3 = normalize(norm + norm2);

            if (jointType >= MITER && jointType < MITER + 3.5) {
                let farVertex = doBisect(norm, segLen, norm2, len2, shift + dy, 0.0);
                if (length(farVertex) > abs(shift + dy) * MITER_LIMIT) {
                    jointType = BEVEL;
                }
            }

            if (vertexNum < 4.5) {
                pos = doBisect(norm, segLen, norm2, len2, shift - dy, 1.0);
            } else if (vertexNum < 5.5) {
                pos = (shift + dy) * norm;
            } else if (vertexNum > 7.5) {
                pos = (shift + dy) * norm2;
            } else {
                if (jointType >= ROUND && jointType < ROUND + 1.5) {
                    pos = doBisect(norm, segLen, norm2, len2, shift + dy, 0.0);
                    let dd = abs(shift + dy);
                    if (length(pos) > abs(shift + dy) * 1.5) {
                        if (vertexNum < 6.5) {
                            pos = vec2<f32>((shift + dy) * norm.x - dd * norm.y, (shift + dy) * norm.y + dd * norm.x);
                        } else {
                            pos = vec2<f32>((shift + dy) * norm2.x + dd * norm2.y, (shift + dy) * norm2.y - dd * norm2.x);
                        }
                    }
                } else if (jointType >= MITER && jointType < MITER + 3.5) {
                    pos = doBisect(norm, segLen, norm2, len2, shift + dy, 0.0);
                } else if (jointType >= BEVEL && jointType < BEVEL + 1.5) {
                    let dd = side / resolution;
                    if (vertexNum < 6.5) {
                        pos = (shift + dy) * norm + dd * norm3;
                    } else {
                        pos = (shift + dy) * norm2 + dd * norm3;
                    }
                }
            }

            if (jointType >= ROUND && jointType < ROUND + 1.5) {
                output.vArc = vec4<f32>(side * dot(pos, norm3), pos.x * norm3.y - pos.y * norm3.x, dot(norm, norm3) * (lineWidth + side * shift), lineWidth + side * shift);
                output.vType = 3.0;
            } else if (jointType >= MITER && jointType < MITER + 3.5) {
                output.vType = 1.0;
            } else if (jointType >= BEVEL && jointType < BEVEL + 1.5) {
                output.vType = 4.0;
                output.vArc = vec4<f32>(output.vArc.x, output.vArc.y, dot(norm, norm3) * (lineWidth + side * shift) - side * dot(pos, norm3), output.vArc.w);
            }

            dy = side * (dot(pos, norm) - shift);
            dy2 = side * (dot(pos, norm2) - shift);
        }

        pos += base;
        output.vLine1 = vec4<f32>(dy * resolution, output.vLine1.y * resolution, output.vLine1.z, output.vLine1.w);
        output.vLine2 = vec4<f32>(dy2 * resolution, output.vLine2.y * resolution, output.vLine2.z, output.vLine2.w);
        output.vArc = output.vArc * resolution;
        output.vTravel = vec2<f32>(input.aTravel * avgScale + dot(pos - pointA, vec2<f32>(-norm.y, norm.x)), avgScale);
    }

    output.position = vec4<f32>((globalUniforms.uProjectionMatrix * vec3<f32>(pos, 1.0)).xy, 0.0, 1.0);
    let rawCol = ${rawColorExpr};
    output.vColor = vec4<f32>(rawCol.rgb * rawCol.a, rawCol.a);

    return output;
}
`;
}

/** @internal */
export function wgslPixelLineFunction(): string
{
    return `fn pixelLine(x: f32, A: f32, B: f32) -> f32 {
    let y = abs(x);
    let s = sign(x);
    if (y * 2.0 < A - B) {
        return 0.5 + s * y / A;
    }
    let yy = max(1.0 - (y - (A - B) * 0.5) / B, 0.0);
    return (1.0 + s * (1.0 - yy * yy)) * 0.5;
}
`;
}

// ─── WGSL fragment snippets ─────────────────────────────────────────

/** @internal */
export function wgslFragmentOpen(): string
{
    return `@fragment
fn mainFragment(input: VSOutput) -> @location(0) vec4<f32> {
    var alpha: f32 = 1.0;
    let vLine1 = input.vLine1;
    let vLine2 = input.vLine2;
    let vArc = input.vArc;
`;
}

/** @internal */
export function wgslHhaaAlphaBlock(): string
{
    return `
    if (input.vType < 0.5) {
        let left = pixelLine(-vLine1.y - vLine1.x, vLine1.z, vLine1.w);
        let right = pixelLine(vLine1.y - vLine1.x, vLine1.z, vLine1.w);
        let near = vLine2.x - 0.5;
        let far = min(vLine2.x + 0.5, 0.0);
        let top = vLine2.y - 0.5;
        let bottom = min(vLine2.y + 0.5, 0.0);
        alpha = (right - left) * max(bottom - top, 0.0) * max(far - near, 0.0);
    } else if (input.vType < 1.5) {
        let a1 = pixelLine(-vLine1.y - vLine1.x, vLine1.z, vLine1.w);
        let a2 = pixelLine(vLine1.y - vLine1.x, vLine1.z, vLine1.w);
        let b1 = pixelLine(-vLine2.y - vLine2.x, vLine2.z, vLine2.w);
        let b2 = pixelLine(vLine2.y - vLine2.x, vLine2.z, vLine2.w);
        alpha = a2 * b2 - a1 * b1;
    } else if (input.vType < 2.5) {
        alpha *= max(min(vLine1.x + 0.5, 1.0), 0.0);
        alpha *= max(min(vLine1.y + 0.5, 1.0), 0.0);
        alpha *= max(min(vLine1.z + 0.5, 1.0), 0.0);
    } else if (input.vType < 3.5) {
        let a1 = pixelLine(-vLine1.y - vLine1.x, vLine1.z, vLine1.w);
        let a2 = pixelLine(vLine1.y - vLine1.x, vLine1.z, vLine1.w);
        let b1 = pixelLine(-vLine2.y - vLine2.x, vLine2.z, vLine2.w);
        let b2 = pixelLine(vLine2.y - vLine2.x, vLine2.z, vLine2.w);
        let alpha_miter = a2 * b2 - a1 * b1;
        let alpha_plane = clamp(vArc.z - vArc.x + 0.5, 0.0, 1.0);
        let d = length(vArc.xy);
        let circle_hor = max(min(vArc.w, d + 0.5) - max(-vArc.w, d - 0.5), 0.0);
        let circle_vert = min(vArc.w * 2.0, 1.0);
        let alpha_circle = circle_hor * circle_vert;
        alpha = min(alpha_miter, max(alpha_circle, alpha_plane));
    } else {
        let a1 = pixelLine(-vLine1.y - vLine1.x, vLine1.z, vLine1.w);
        let a2 = pixelLine(vLine1.y - vLine1.x, vLine1.z, vLine1.w);
        let b1 = pixelLine(-vLine2.y - vLine2.x, vLine2.z, vLine2.w);
        let b2 = pixelLine(vLine2.y - vLine2.x, vLine2.z, vLine2.w);
        alpha = a2 * b2 - a1 * b1;
        alpha *= clamp(vArc.z + 0.5, 0.0, 1.0);
    }
`;
}

/**
 * @param sampleBranches - WGSL texture sampling if/else branches
 * @internal
 */
export function wgslTextureSampleAndReturn(sampleBranches: string): string
{
    return `    var texColor: vec4<f32> = vec4<f32>(1.0);
    let textureIndex = input.vTextureId;
    let vTextureCoord = input.vTextureCoord;
${sampleBranches}

    return input.vColor * texColor * alpha;
}
`;
}
