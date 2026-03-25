import '~/accessibility/init';
import '~/events/init';
import { Gl2d } from '../Gl2d';
import '../init';
import { Rectangle } from '~/maths/shapes/Rectangle';
import { Container } from '~/scene/container/Container';

describe('gl2d Container serialization', () =>
{
    it('should serialize an empty Container', () =>
    {
        const container = new Container();
        const file = Gl2d.serialize(container);

        expect(file.asset).toEqual({ version: '1.0', generator: 'pixi.js' });
        expect(file.scene).toBe(0);
        expect(file.scenes).toHaveLength(1);
        expect(file.scenes[0].nodes).toEqual([0]);
        expect(file.nodes).toHaveLength(1);

        const node = file.nodes[0];

        expect(node.type).toBe('container');
        expect(node.uid).toBeDefined();
        expect(node.children).toBeUndefined();
    });

    it('should use label as scene name', () =>
    {
        const container = new Container({ label: 'myScene' });
        const file = Gl2d.serialize(container);

        expect(file.scenes[0].name).toBe('myScene');

        const node = file.nodes[0];

        expect(node.name).toBe('myScene');
    });

    it('should serialize nested Containers with correct child refs', () =>
    {
        const parent = new Container();
        const childA = new Container();
        const childB = new Container();

        parent.addChild(childA, childB);

        const file = Gl2d.serialize(parent);

        expect(file.nodes).toHaveLength(3);

        const parentNode = file.nodes[0];

        expect(parentNode.children).toEqual([1, 2]);
        expect(file.nodes[1].type).toBe('container');
        expect(file.nodes[2].type).toBe('container');
    });

    it('should serialize non-default transform values', () =>
    {
        const container = new Container();

        container.position.set(10, 20);
        container.rotation = 1.5;
        container.scale.set(2, 3);

        const file = Gl2d.serialize(container);
        const node = file.nodes[0];

        expect(node.translation).toEqual([10, 20]);
        expect(node.rotation).toBe(1.5);
        expect(node.scale).toEqual([2, 3]);
    });

    it('should omit default transform values', () =>
    {
        const container = new Container();
        const file = Gl2d.serialize(container);
        const node = file.nodes[0];

        expect(node.translation).toBeUndefined();
        expect(node.rotation).toBeUndefined();
        expect(node.scale).toBeUndefined();
        expect(node.alpha).toBeUndefined();
        expect(node.visible).toBeUndefined();
    });

    it('should serialize alpha and visible', () =>
    {
        const container = new Container();

        container.alpha = 0.5;
        container.visible = false;

        const file = Gl2d.serialize(container);
        const node = file.nodes[0];

        expect(node.alpha).toBe(0.5);
        expect(node.visible).toBe(false);
    });

    it('should serialize pixi_container_node extension properties', () =>
    {
        const container = new Container();

        container.skew.set(0.1, 0.2);
        container.pivot.set(50, 60);
        container.tint = 0xFF0000;
        container.zIndex = 5;

        const file = Gl2d.serialize(container);
        const node = file.nodes[0];
        const ext = node.extensions?.pixi_container_node;

        expect(ext).toBeDefined();
        expect(ext.skew).toEqual([0.1, 0.2]);
        expect(ext.pivot).toEqual([50, 60]);
        expect(ext.tint).toBe('#ff0000');
        expect(ext.zIndex).toBe(5);
    });

    it('should omit pixi_container_node extension when all defaults', () =>
    {
        const container = new Container();
        const file = Gl2d.serialize(container);
        const node = file.nodes[0];

        expect(node.extensions).toBeUndefined();
    });

    it('should serialize boundsArea', () =>
    {
        const container = new Container();

        container.boundsArea = new Rectangle(10, 20, 100, 200);

        const file = Gl2d.serialize(container);
        const ext = file.nodes[0].extensions?.pixi_container_node;

        expect(ext.boundsArea).toEqual([10, 20, 100, 200]);
    });

    it('should serialize sortableChildren', () =>
    {
        const container = new Container();

        container.sortableChildren = true;

        const file = Gl2d.serialize(container);
        const ext = file.nodes[0].extensions?.pixi_container_node;

        expect(ext.sortableChildren).toBe(true);
    });

    it('should serialize renderable=false', () =>
    {
        const container = new Container();

        container.renderable = false;

        const file = Gl2d.serialize(container);
        const ext = file.nodes[0].extensions?.pixi_container_node;

        expect(ext.renderable).toBe(false);
    });

    it('should serialize container without mask when mask not set', () =>
    {
        const parent = new Container();
        const child = new Container();

        parent.addChild(child);

        const file = Gl2d.serialize(parent);

        expect(file.nodes).toHaveLength(2);
        expect(file.nodes[0].children).toEqual([1]);
        expect(file.nodes[0].mask).toBeUndefined();
    });

    it('should return valid Gl2dFile structure', () =>
    {
        const root = new Container({ label: 'root' });

        root.addChild(new Container());

        const file = Gl2d.serialize(root);

        expect(file.asset.version).toBe('1.0');
        expect(file.asset.generator).toBe('pixi.js');
        expect(file.scene).toBe(0);
        expect(file.scenes).toHaveLength(1);
        expect(file.scenes[0].name).toBe('root');
        expect(file.scenes[0].nodes).toEqual([0]);
        expect(file.nodes.length).toBeGreaterThanOrEqual(2);
        expect(file.resources).toBeUndefined();
    });

    it('should serialize deeply nested hierarchy', () =>
    {
        const a = new Container();
        const b = new Container();
        const c = new Container();

        a.addChild(b);
        b.addChild(c);

        const file = Gl2d.serialize(a);

        expect(file.nodes).toHaveLength(3);
        expect(file.nodes[0].children).toEqual([1]);
        expect(file.nodes[1].children).toEqual([2]);
        expect(file.nodes[2].children).toBeUndefined();
    });

    it('should populate extensionsUsed when pixi_container_node extension is present', () =>
    {
        const container = new Container();

        container.tint = 0xFF0000;

        const file = Gl2d.serialize(container);

        expect(file.extensionsUsed).toEqual(['pixi_container_node']);
    });

    it('should not include extensionsUsed when all defaults', () =>
    {
        const container = new Container();
        const file = Gl2d.serialize(container);

        expect(file.extensionsUsed).toBeUndefined();
    });

    it('should deduplicate extensionsUsed across multiple nodes', () =>
    {
        const parent = new Container();
        const child = new Container();

        parent.tint = 0xFF0000;
        child.zIndex = 5;
        parent.addChild(child);

        const file = Gl2d.serialize(parent);

        expect(file.extensionsUsed).toEqual(['pixi_container_node']);
    });

    // --- Events ---

    it('should serialize non-default eventMode', () =>
    {
        const container = new Container();

        container.eventMode = 'static';

        const file = Gl2d.serialize(container);
        const ext = file.nodes[0].extensions?.pixi_container_node;

        expect(ext.eventMode).toBe('static');
    });

    it('should serialize interactiveChildren=false', () =>
    {
        const container = new Container();

        container.interactiveChildren = false;

        const file = Gl2d.serialize(container);
        const ext = file.nodes[0].extensions?.pixi_container_node;

        expect(ext.interactiveChildren).toBe(false);
    });

    it('should serialize cursor', () =>
    {
        const container = new Container();

        container.cursor = 'pointer';

        const file = Gl2d.serialize(container);
        const ext = file.nodes[0].extensions?.pixi_container_node;

        expect(ext.cursor).toBe('pointer');
    });

    it('should omit event properties when defaults', () =>
    {
        const container = new Container();
        const file = Gl2d.serialize(container);
        const node = file.nodes[0];

        expect(node.extensions?.pixi_container_node?.eventMode).toBeUndefined();
        expect(node.extensions?.pixi_container_node?.interactiveChildren).toBeUndefined();
        expect(node.extensions?.pixi_container_node?.cursor).toBeUndefined();
    });

    // --- Accessibility ---

    it('should serialize accessible=true', () =>
    {
        const container = new Container();

        container.accessible = true;

        const file = Gl2d.serialize(container);
        const ext = file.nodes[0].extensions?.pixi_container_node;

        expect(ext.accessible).toBe(true);
    });

    it('should serialize accessibleChildren=false', () =>
    {
        const container = new Container();

        container.accessibleChildren = false;

        const file = Gl2d.serialize(container);
        const ext = file.nodes[0].extensions?.pixi_container_node;

        expect(ext.accessibleChildren).toBe(false);
    });

    it('should serialize accessibleHint', () =>
    {
        const container = new Container();

        container.accessibleHint = 'Click to open';

        const file = Gl2d.serialize(container);
        const ext = file.nodes[0].extensions?.pixi_container_node;

        expect(ext.accessibleHint).toBe('Click to open');
    });

    it('should serialize non-default accessibleType', () =>
    {
        const container = new Container();

        container.accessibleType = 'div';

        const file = Gl2d.serialize(container);
        const ext = file.nodes[0].extensions?.pixi_container_node;

        expect(ext.accessibleType).toBe('div');
    });

    it('should serialize non-default tabIndex', () =>
    {
        const container = new Container();

        container.tabIndex = 3;

        const file = Gl2d.serialize(container);
        const ext = file.nodes[0].extensions?.pixi_container_node;

        expect(ext.tabIndex).toBe(3);
    });

    it('should omit accessibility properties when defaults', () =>
    {
        const container = new Container();
        const file = Gl2d.serialize(container);
        const node = file.nodes[0];

        expect(node.extensions?.pixi_container_node?.accessible).toBeUndefined();
        expect(node.extensions?.pixi_container_node?.accessibleChildren).toBeUndefined();
        expect(node.extensions?.pixi_container_node?.accessibleHint).toBeUndefined();
        expect(node.extensions?.pixi_container_node?.accessibleType).toBeUndefined();
        expect(node.extensions?.pixi_container_node?.tabIndex).toBeUndefined();
    });

    // --- Culling ---

    it('should serialize cullable=true', () =>
    {
        const container = new Container();

        container.cullable = true;

        const file = Gl2d.serialize(container);
        const ext = file.nodes[0].extensions?.pixi_container_node;

        expect(ext.cullable).toBe(true);
    });

    it('should serialize cullableChildren=false', () =>
    {
        const container = new Container();

        container.cullableChildren = false;

        const file = Gl2d.serialize(container);
        const ext = file.nodes[0].extensions?.pixi_container_node;

        expect(ext.cullableChildren).toBe(false);
    });

    it('should serialize cullArea', () =>
    {
        const container = new Container();

        container.cullArea = new Rectangle(0, 0, 800, 600);

        const file = Gl2d.serialize(container);
        const ext = file.nodes[0].extensions?.pixi_container_node;

        expect(ext.cullArea).toEqual([0, 0, 800, 600]);
    });

    it('should omit culling properties when defaults', () =>
    {
        const container = new Container();
        const file = Gl2d.serialize(container);
        const node = file.nodes[0];

        expect(node.extensions?.pixi_container_node?.cullable).toBeUndefined();
        expect(node.extensions?.pixi_container_node?.cullableChildren).toBeUndefined();
        expect(node.extensions?.pixi_container_node?.cullArea).toBeUndefined();
    });
});
