import { JOINT_TYPE } from './const';

import type { SmoothBuildData } from './SmoothBuildData';

/**
 * Lookup table: number of packed vertices emitted per joint type.
 * Indexed by the lower 5 bits of a joint value.
 * @internal
 */
const vertsByJoint: number[] = [];

for (let i = 0; i < 256; i++)
{
    vertsByJoint.push(0);
}

vertsByJoint[JOINT_TYPE.FILL] = 1;

for (let i = 0; i < 8; i++)
{
    vertsByJoint[JOINT_TYPE.FILL_EXPAND + i] = 3;
}

vertsByJoint[JOINT_TYPE.JOINT_BEVEL] = 4 + 5;
vertsByJoint[JOINT_TYPE.JOINT_BEVEL + 1] = 4 + 5;
vertsByJoint[JOINT_TYPE.JOINT_BEVEL + 2] = 4 + 5;
vertsByJoint[JOINT_TYPE.JOINT_BEVEL + 3] = 4 + 5;
vertsByJoint[JOINT_TYPE.JOINT_ROUND] = 4 + 5;
vertsByJoint[JOINT_TYPE.JOINT_ROUND + 1] = 4 + 5;
vertsByJoint[JOINT_TYPE.JOINT_ROUND + 2] = 4 + 5;
vertsByJoint[JOINT_TYPE.JOINT_ROUND + 3] = 4 + 5;
vertsByJoint[JOINT_TYPE.JOINT_MITER] = 4 + 5;
vertsByJoint[JOINT_TYPE.JOINT_MITER + 1] = 4 + 5;
vertsByJoint[JOINT_TYPE.JOINT_MITER + 2] = 4;
vertsByJoint[JOINT_TYPE.JOINT_MITER + 3] = 4;
vertsByJoint[JOINT_TYPE.JOINT_CAP_BUTT] = 4;
vertsByJoint[JOINT_TYPE.JOINT_CAP_BUTT + 1] = 4;
vertsByJoint[JOINT_TYPE.JOINT_CAP_SQUARE] = 4;
vertsByJoint[JOINT_TYPE.JOINT_CAP_SQUARE + 1] = 4;
vertsByJoint[JOINT_TYPE.JOINT_CAP_ROUND] = 4 + 5;
vertsByJoint[JOINT_TYPE.JOINT_CAP_ROUND + 1] = 4 + 5;

vertsByJoint[JOINT_TYPE.CAP_ROUND] = 4;

/** Number of floats per vertex in the geometry-only interleaved buffer */
const GEOM_STRIDE = 10;

/**
 * Packs smooth graphics joints/verts into a 10-float-per-vertex interleaved geometry buffer.
 *
 * Layout per vertex (10 floats):
 *   [prevX, prevY, p1X, p1Y, p2X, p2Y, nextX, nextY, travel, vertexJoint]
 *
 * Style data (lineWidth, alignment, color, textureId) is added later during
 * batcher packAttributes.
 * @category scene
 * @advanced
 */
export class SmoothSegmentPacker
{
    /**
     * Count vertices and indices needed for a range of joints.
     * @param jointStart - Start index in the joints array
     * @param jointLen - Number of joints to process
     * @param triangleCount - Number of earcut triangle indices (for FILL joints)
     * @param target - Build data to accumulate sizes into
     */
    public updateBufferSize(jointStart: number, jointLen: number, triangleCount: number, target: SmoothBuildData): void
    {
        const { joints } = target;
        let foundTriangle = false;
        let vertexSize = 0;
        let indexSize = 0;

        for (let i = jointStart; i < jointStart + jointLen; i++)
        {
            const prevCap = joints[i] & ~31;
            const joint = joints[i] & 31;

            if (joint === JOINT_TYPE.FILL)
            {
                foundTriangle = true;
                vertexSize++;
                continue;
            }

            if (joint >= JOINT_TYPE.FILL_EXPAND)
            {
                vertexSize += 3;
                indexSize += 3;
                continue;
            }

            const vs = vertsByJoint[joint] + vertsByJoint[prevCap];

            if (vs >= 4)
            {
                vertexSize += vs;
                indexSize += 6 + (3 * Math.max(vs - 6, 0));
            }
        }

        if (foundTriangle)
        {
            indexSize += triangleCount;
        }

        target.vertexSize += vertexSize;
        target.indexSize += indexSize;
    }

    /**
     * Pack joint/vert data into an interleaved Float32Array + index array.
     * Writes 10 floats per vertex (geometry only).
     * @param jointStart - Start index in the joints array
     * @param jointLen - Number of joints to process
     * @param triangles - Earcut triangle indices (relative to FILL vertex start)
     * @param buildData - Source build data (joints + verts)
     * @param bufFloat - Output float32 buffer
     * @param indices - Output index buffer
     * @param bufferPos - Starting float offset in bufFloat
     * @param indexPos - Starting offset in indices
     * @returns Updated [bufferPos, indexPos]
     */
    public packInterleavedGeometry(
        jointStart: number,
        jointLen: number,
        triangles: number[],
        buildData: SmoothBuildData,
        bufFloat: Float32Array,
        indices: Uint16Array | Uint32Array,
        bufferPos: number,
        indexPos: number,
    ): [number, number]
    {
        const { joints, verts } = buildData;

        let bufPos = bufferPos;
        let indPos = indexPos;
        let index = bufferPos / GEOM_STRIDE;

        let hasTriangle = false;
        let travel = 0;

        for (let j = jointStart; j < jointStart + jointLen; j++)
        {
            const fullJoint = joints[j];
            const prevCap = joints[j] & ~31;
            const joint = joints[j] & 31;

            if (joint === JOINT_TYPE.FILL)
            {
                hasTriangle = true;
                const x1 = verts[j * 2];
                const y1 = verts[(j * 2) + 1];

                bufFloat[bufPos] = x1;
                bufFloat[bufPos + 1] = y1;
                bufFloat[bufPos + 2] = x1;
                bufFloat[bufPos + 3] = y1;
                bufFloat[bufPos + 4] = x1;
                bufFloat[bufPos + 5] = y1;
                bufFloat[bufPos + 6] = x1;
                bufFloat[bufPos + 7] = y1;
                bufFloat[bufPos + 8] = travel;
                bufFloat[bufPos + 9] = 16 * joint;
                bufPos += GEOM_STRIDE;
                continue;
            }

            if (joint >= JOINT_TYPE.FILL_EXPAND)
            {
                const prevX = verts[j * 2];
                const prevY = verts[(j * 2) + 1];
                const x1 = verts[(j * 2) + 2];
                const y1 = verts[(j * 2) + 3];
                const x2 = verts[(j * 2) + 4];
                const y2 = verts[(j * 2) + 5];

                const bis = j + 3;

                for (let i = 0; i < 3; i++)
                {
                    bufFloat[bufPos] = prevX;
                    bufFloat[bufPos + 1] = prevY;
                    bufFloat[bufPos + 2] = x1;
                    bufFloat[bufPos + 3] = y1;
                    bufFloat[bufPos + 4] = x2;
                    bufFloat[bufPos + 5] = y2;
                    bufFloat[bufPos + 6] = verts[(bis + i) * 2];
                    bufFloat[bufPos + 7] = verts[((bis + i) * 2) + 1];
                    bufFloat[bufPos + 8] = travel;
                    bufFloat[bufPos + 9] = (16 * fullJoint) + i;
                    bufPos += GEOM_STRIDE;
                }

                indices[indPos] = index;
                indices[indPos + 1] = index + 1;
                indices[indPos + 2] = index + 2;
                indPos += 3;
                index += 3;
                continue;
            }

            const vs = vertsByJoint[joint] + vertsByJoint[prevCap];

            if (vs === 0)
            {
                continue;
            }

            const x1 = verts[j * 2];
            const y1 = verts[(j * 2) + 1];
            const x2 = verts[(j * 2) + 2];
            const y2 = verts[(j * 2) + 3];
            const prevX = verts[(j * 2) - 2];
            const prevY = verts[(j * 2) - 1];

            const dist = Math.sqrt(((x2 - x1) * (x2 - x1)) + ((y2 - y1) * (y2 - y1)));

            if (vertsByJoint[joint] === 0)
            {
                travel -= dist;
            }

            let nextX: number;
            let nextY: number;

            if ((joint & ~2) !== JOINT_TYPE.JOINT_CAP_BUTT)
            {
                nextX = verts[(j * 2) + 4];
                nextY = verts[(j * 2) + 5];
            }
            else
            {
                nextX = x1;
                nextY = y1;
            }

            for (let i = 0; i < vs; i++)
            {
                bufFloat[bufPos] = prevX;
                bufFloat[bufPos + 1] = prevY;
                bufFloat[bufPos + 2] = x1;
                bufFloat[bufPos + 3] = y1;
                bufFloat[bufPos + 4] = x2;
                bufFloat[bufPos + 5] = y2;
                bufFloat[bufPos + 6] = nextX;
                bufFloat[bufPos + 7] = nextY;
                bufFloat[bufPos + 8] = travel;
                bufFloat[bufPos + 9] = (16 * fullJoint) + i;
                bufPos += GEOM_STRIDE;
            }

            travel += dist;

            indices[indPos] = index;
            indices[indPos + 1] = index + 1;
            indices[indPos + 2] = index + 2;
            indices[indPos + 3] = index;
            indices[indPos + 4] = index + 2;
            indices[indPos + 5] = index + 3;
            indPos += 6;

            for (let k = 5; k + 1 < vs; k++)
            {
                indices[indPos] = index + 4;
                indices[indPos + 1] = index + k;
                indices[indPos + 2] = index + k + 1;
                indPos += 3;
            }

            index += vs;
        }

        if (hasTriangle)
        {
            for (let i = 0; i < triangles.length; i++)
            {
                indices[indPos + i] = triangles[i] + index;
            }
            indPos += triangles.length;
        }

        return [bufPos, indPos];
    }
}
