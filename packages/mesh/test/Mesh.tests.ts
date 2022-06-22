import { Mesh, MeshGeometry, MeshMaterial } from '@pixi/mesh';
import { skipHello } from '@pixi/utils';

import { Texture } from '@pixi/core';

skipHello();

describe('Mesh', () =>
{
    it('should dispose geometry correctly', () =>
    {
        const geometry1 = new MeshGeometry(new Float32Array([0, 0]));
        const geometry2 = new MeshGeometry(new Float32Array([1, 1]));

        const dispose1 = jest.spyOn(geometry1, 'dispose');
        const dispose2 = jest.spyOn(geometry2, 'dispose');

        expect(geometry1.refCount).toEqual(0);
        expect(geometry2.refCount).toEqual(0);
        expect(dispose1).not.toHaveBeenCalled();
        expect(dispose2).not.toHaveBeenCalled();

        const mesh = new Mesh(geometry1, new MeshMaterial(Texture.EMPTY));

        expect(mesh.geometry).toEqual(geometry1);
        expect(mesh['vertexDirty']).toEqual(-1);
        expect(geometry1.refCount).toEqual(1);
        expect(geometry2.refCount).toEqual(0);
        expect(dispose1).not.toHaveBeenCalled();
        expect(dispose2).not.toHaveBeenCalled();

        mesh.calculateVertices();

        expect(mesh['vertexDirty']).toEqual(mesh.verticesBuffer._updateID);
        expect(mesh['vertexData'][0]).toEqual(0);
        expect(mesh['vertexData'][1]).toEqual(0);

        mesh.geometry = geometry1;

        expect(mesh.geometry).toEqual(geometry1);
        expect(mesh['vertexDirty']).toEqual(mesh.verticesBuffer._updateID);
        expect(mesh['vertexData'][0]).toEqual(0);
        expect(mesh['vertexData'][1]).toEqual(0);
        expect(geometry1.refCount).toEqual(1);
        expect(geometry2.refCount).toEqual(0);
        expect(dispose1).not.toHaveBeenCalled();
        expect(dispose2).not.toHaveBeenCalled();

        mesh.geometry = geometry2;

        expect(mesh.geometry).toEqual(geometry2);
        expect(mesh['vertexDirty']).toEqual(-1);
        expect(geometry1.refCount).toEqual(0);
        expect(geometry2.refCount).toEqual(1);
        expect(dispose1).toBeCalled();
        expect(dispose2).not.toHaveBeenCalled();

        mesh.calculateVertices();

        expect(mesh['vertexDirty']).toEqual(mesh.verticesBuffer._updateID);
        expect(mesh['vertexData'][0]).toEqual(1);
        expect(mesh['vertexData'][1]).toEqual(1);

        mesh.destroy();

        expect(mesh.geometry).toEqual(null);
        expect(mesh['vertexDirty']).toEqual(-1);
        expect(geometry1.refCount).toEqual(0);
        expect(geometry2.refCount).toEqual(0);
        expect(dispose1).toBeCalled();
        expect(dispose2).toBeCalled();
    });
});
