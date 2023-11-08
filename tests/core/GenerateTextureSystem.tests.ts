// import { Rectangle } from '../../src/maths/shapes/Rectangle';
// import { Sprite } from '../../src/scene/sprite/Sprite';
// import { getRenderer } from '../utils/getRenderer';
// note: renderer.generateTexture() deprecated, need renderer.renderTexture.current for v8
// describe('GenerateTextureSystem', () =>
// {
//     it('should bind render texture', async () =>
//     {
//         const renderer = await getRenderer();
//         const sprite = new Sprite();
//         const renderTexture = renderer.generateTexture(sprite);

//         expect(renderer.renderTexture.current).toBe(renderTexture);

//         renderTexture.destroy(true);
//         renderer.destroy();
//     });

//     it('should not mutate region argument', () =>
//     {
//         const renderer = await getRenderer();
//         const sprite = new Sprite();
//         const region = new Rectangle(0.3, 0.2, 0.1, 0);
//         const renderTexture = renderer.generateTexture(sprite, { region });

//         expect(region.x).toBe(0.3);
//         expect(region.y).toBe(0.2);
//         expect(region.width).toBe(0.1);
//         expect(region.height).toBe(0);

//         renderTexture.destroy(true);
//         renderer.destroy();
//     });
// });
