import { GlobalUniformSystem } from '../shared/renderTarget/GlobalUniformSystem';
import { Matrix, Point } from '~/maths';

import type { WebGLRenderer } from '../gl/WebGLRenderer';
import type { UboSystem } from '../shared/shader/UboSystem';
import type { UniformGroup } from '../shared/shader/UniformGroup';

function createGlobalUniformSystem(): GlobalUniformSystem
{
    const renderer = {
        renderTarget: {
            projectionMatrix: new Matrix(2, 2, 2, 2, 2, 2),
            renderTarget: {
                size: [1, 1],
            }
        },
        renderPipes: {},
        ubo: {
            updateUniformGroup: () =>
            {
                // do nothing
            },
        } as unknown as UboSystem,
    } as WebGLRenderer;

    const globalUniformSystem = new GlobalUniformSystem(renderer);

    globalUniformSystem.start({
        projectionMatrix: new Matrix(1, 1, 1, 1, 1, 1),
        size: [1, 1],

        worldTransformMatrix: new Matrix(2, 2, 2, 2, 2, 2),
    });

    return globalUniformSystem;
}

describe('GlobalUniformSystem', () =>
{
    it('should start correctly', async () =>
    {
        const globalUniformSystem = createGlobalUniformSystem();

        const bindGroup = globalUniformSystem.bindGroup;

        expect((bindGroup.resources[0] as UniformGroup).uniforms.uProjectionMatrix).toMatchObject({
            a: 1, b: 1, c: 1, d: 1, tx: 1, ty: 1,
        });

        expect((bindGroup.resources[0] as UniformGroup).uniforms.uWorldTransformMatrix).toMatchObject({
            a: 2, b: 2, c: 2, d: 2, tx: 2, ty: 2,
        });
    });

    it('should push correctly', async () =>
    {
        const globalUniformSystem = createGlobalUniformSystem();

        const bindGroup = globalUniformSystem.bindGroup;

        globalUniformSystem.push({

            projectionMatrix: new Matrix(3, 3, 3, 3, 3, 3),
            size: [1, 1]

        });

        const bindGroup2 = globalUniformSystem.bindGroup;

        globalUniformSystem.push({
            projectionMatrix: new Matrix(4, 4, 4, 4, 4, 4),
            size: [1, 1],
            worldTransformMatrix: new Matrix(5, 5, 5, 5, 5, 5),
        });

        const bindGroup3 = globalUniformSystem.bindGroup;

        globalUniformSystem.pop();

        const bindGroup4 = globalUniformSystem.bindGroup;

        globalUniformSystem.pop();

        const bindGroup5 = globalUniformSystem.bindGroup;

        expect((bindGroup2.resources[0] as UniformGroup).uniforms.uProjectionMatrix).toMatchObject({
            a: 3, b: 3, c: 3, d: 3, tx: 3, ty: 3,
        });

        expect((bindGroup2.resources[0] as UniformGroup).uniforms.uWorldTransformMatrix).toMatchObject({
            a: 2, b: 2, c: 2, d: 2, tx: 2, ty: 2,
        });

        //

        expect((bindGroup3.resources[0] as UniformGroup).uniforms.uProjectionMatrix).toMatchObject({
            a: 4, b: 4, c: 4, d: 4, tx: 4, ty: 4,
        });

        expect((bindGroup3.resources[0] as UniformGroup).uniforms.uWorldTransformMatrix).toMatchObject({
            a: 5, b: 5, c: 5, d: 5, tx: 5, ty: 5,
        });

        //

        expect(bindGroup4).toBe(bindGroup2);

        expect(bindGroup5).toBe(bindGroup);
    });

    it('should apply offset correctly to world uniform matrix', async () =>
    {
        const globalUniformSystem = createGlobalUniformSystem();

        globalUniformSystem.push({
            worldTransformMatrix: new Matrix(1, 1, 1, 1, 1, 1),
            offset: new Point(-100, -100),
        });

        const bindGroup = globalUniformSystem.bindGroup;

        globalUniformSystem.push({
            worldTransformMatrix: new Matrix(2, 2, 2, 2, 2, 2),
        });

        const bindGroup2 = globalUniformSystem.bindGroup;

        globalUniformSystem.pop();

        globalUniformSystem.push({
            worldTransformMatrix: new Matrix(3, 3, 3, 3, 3, 3),
        });

        const bindGroup3 = globalUniformSystem.bindGroup;

        globalUniformSystem.pop();

        globalUniformSystem.push({
            offset: new Point(-1000, -1000),
        });

        const bindGroup4 = globalUniformSystem.bindGroup;

        expect((bindGroup.resources[0] as UniformGroup).uniforms.uWorldTransformMatrix).toMatchObject({
            a: 1, b: 1, c: 1, d: 1, tx: 101, ty: 101,
        });

        expect((bindGroup2.resources[0] as UniformGroup).uniforms.uWorldTransformMatrix).toMatchObject({
            a: 2, b: 2, c: 2, d: 2, tx: 102, ty: 102,
        });

        expect((bindGroup3.resources[0] as UniformGroup).uniforms.uWorldTransformMatrix).toMatchObject({
            a: 3, b: 3, c: 3, d: 3, tx: 103, ty: 103,
        });

        expect((bindGroup4.resources[0] as UniformGroup).uniforms.uWorldTransformMatrix).toMatchObject({
            a: 1, b: 1, c: 1, d: 1, tx: 1001, ty: 1001,
        });
    });

    it('should start correctly second time', async () =>
    {
        const globalUniformSystem = createGlobalUniformSystem();

        globalUniformSystem.push({
            worldTransformMatrix: new Matrix(1, 1, 1, 1, 1, 1),
            offset: new Point(100, 100),
        });

        globalUniformSystem.push({
            worldTransformMatrix: new Matrix(2, 2, 2, 2, 2, 2),
        });

        expect(globalUniformSystem['_activeUniforms']).toHaveLength(3);
        expect(globalUniformSystem['_activeBindGroups']).toHaveLength(3);

        globalUniformSystem.pop();

        expect(globalUniformSystem['_activeBindGroups']).toHaveLength(3);

        globalUniformSystem.push({
            worldTransformMatrix: new Matrix(2, 2, 2, 2, 2, 2),
        });

        expect(globalUniformSystem['_activeBindGroups']).toHaveLength(4);

        // start again!
        globalUniformSystem.reset();

        expect(globalUniformSystem['_stackIndex']).toEqual(0);
        expect(globalUniformSystem['_activeUniforms']).toHaveLength(0);
        expect(globalUniformSystem['_activeBindGroups']).toHaveLength(0);
    });

    it('should store color correctly second time', async () =>
    {
        const globalUniformSystem = createGlobalUniformSystem();

        globalUniformSystem.push({
            worldColor: 0xFFFFFFFF // ABGR
        });

        const bindGroup = globalUniformSystem.bindGroup;

        globalUniformSystem.push({
            worldColor: 0x00FFFFFF // ABGR
        });

        const bindGroup2 = globalUniformSystem.bindGroup;

        globalUniformSystem.pop();

        const bindGroup3 = globalUniformSystem.bindGroup;

        expect((bindGroup.resources[0] as UniformGroup).uniforms.uWorldColorAlpha).toEqual(new Float32Array([1, 1, 1, 1]));

        expect((bindGroup2.resources[0]as UniformGroup).uniforms.uWorldColorAlpha).toEqual(new Float32Array([0, 0, 0, 0]));

        expect((bindGroup3.resources[0]as UniformGroup).uniforms.uWorldColorAlpha).toEqual(new Float32Array([1, 1, 1, 1]));
    });
});
