import { Assets } from '@/assets/Assets';
import { MeshPlane } from '@/scene/mesh-plane/MeshPlane';
import { MeshRope } from '@/scene/mesh-simple/MeshRope';

import type { TestScene } from '../../types';
import type { Container } from '@/scene/container/Container';
import type { Spritesheet } from '@/spritesheet/Spritesheet';

export const scene: TestScene = {
    it: 'should render meshes from sprite sheets',
    create: async (scene: Container) =>
    {
        const spriteSheet = await Assets.load<Spritesheet>(`building1.json`);

        const starTexture = spriteSheet.textures['star1.png'];

        const plane = new MeshPlane({
            texture: starTexture,
            verticesX: 20,
            verticesY: 20
        });

        const points = [
            { x: 0, y: 0 },
            { x: 100, y: 0 },
            { x: 100, y: 100 },
            { x: 0, y: 100 }
        ];
        const rope = new MeshRope({
            texture: starTexture,
            points
        });

        scene.addChild(plane);
        scene.addChild(rope);
    },
};
