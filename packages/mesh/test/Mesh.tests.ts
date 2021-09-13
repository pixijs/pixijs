import { Mesh, MeshGeometry, MeshMaterial } from '@pixi/mesh';
import { skipHello } from '@pixi/utils';
import sinon from 'sinon';
import { expect } from 'chai';

skipHello();

describe('Mesh', function ()
{
    it('should dispose geometry correctly', function ()
    {
        const geometry1 = new MeshGeometry([0, 0]);
        const geometry2 = new MeshGeometry([1, 1]);

        const dispose1 = sinon.spy(geometry1, 'dispose');
        const dispose2 = sinon.spy(geometry2, 'dispose');

        expect(geometry1.refCount).to.equal(0);
        expect(geometry2.refCount).to.equal(0);
        expect(dispose1.called).to.be.false;
        expect(dispose2.called).to.be.false;

        const mesh = new Mesh(geometry1, new MeshMaterial());

        expect(mesh.geometry).to.equal(geometry1);
        expect(mesh.vertexDirty).to.equal(-1);
        expect(geometry1.refCount).to.equal(1);
        expect(geometry2.refCount).to.equal(0);
        expect(dispose1.called).to.be.false;
        expect(dispose2.called).to.be.false;

        mesh.calculateVertices();

        expect(mesh.vertexDirty).to.equal(mesh.verticesBuffer._updateID);
        expect(mesh.vertexData[0]).to.equal(0);
        expect(mesh.vertexData[1]).to.equal(0);

        mesh.geometry = geometry1;

        expect(mesh.geometry).to.equal(geometry1);
        expect(mesh.vertexDirty).to.equal(mesh.verticesBuffer._updateID);
        expect(mesh.vertexData[0]).to.equal(0);
        expect(mesh.vertexData[1]).to.equal(0);
        expect(geometry1.refCount).to.equal(1);
        expect(geometry2.refCount).to.equal(0);
        expect(dispose1.called).to.be.false;
        expect(dispose2.called).to.be.false;

        mesh.geometry = geometry2;

        expect(mesh.geometry).to.equal(geometry2);
        expect(mesh.vertexDirty).to.equal(-1);
        expect(geometry1.refCount).to.equal(0);
        expect(geometry2.refCount).to.equal(1);
        expect(dispose1.called).to.be.true;
        expect(dispose2.called).to.be.false;

        mesh.calculateVertices();

        expect(mesh.vertexDirty).to.equal(mesh.verticesBuffer._updateID);
        expect(mesh.vertexData[0]).to.equal(1);
        expect(mesh.vertexData[1]).to.equal(1);

        mesh.destroy();

        expect(mesh.geometry).to.equal(null);
        expect(mesh.vertexDirty).to.equal(-1);
        expect(geometry1.refCount).to.equal(0);
        expect(geometry2.refCount).to.equal(0);
        expect(dispose1.called).to.be.true;
        expect(dispose2.called).to.be.true;
    });
});
