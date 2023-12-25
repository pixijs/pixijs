/* eslint-disable no-console */
/* eslint-disable max-len */
import { Application } from '../src/app/Application';
import { Graphics } from '../src/scene/graphics/shared/Graphics';

async function test()
{
    const app = new Application();

    await app.init({
        width: 1000,
        height: 1000,
        preference: 'webgpu',
        autoDensity: true,
        resolution: window.devicePixelRatio,
        bezierSmoothness: 0.9,
        antialias: true,
    });
    document.body.appendChild(app.canvas);

    const roundRect = new Graphics();

    roundRect.fillStyle = 0xffff00;
    roundRect.roundRect(0, 0, 100, 100);
    roundRect.stroke({ color: 0xff0000, width: 5, alignment: 0 });
    roundRect.fill();
    roundRect.angle=10;
    roundRect.scale.set(2);
    roundRect.position.set(50, 50);
    app.stage.addChild(roundRect);

    // from svg path
    const svg = new Graphics();

    svg.fillStyle = 0xffff00;
    svg.svg(`
        <?xml version="1.0" encoding="utf-8"?>
        <svg xmlns="http://www.w3.org/2000/svg" class="vL6BBg" viewBox="0 0 64 64" style="overflow: hidden;" >
        <path d="M 11.5 0 L 52.5 0 C 58.25 0 64 5.75 64 11.5 L 64 52.5 C 64 58.25 58.25 64 52.5 64 L 11.5 64 C 5.75 64 0 58.25 0 52.5 L 0 11.5 C 0 5.75 5.75 0 11.5 0 Z" stroke="#ff0000" stroke-width="5" stroke-linecap="butt"  fill="#ffff00" vector-effect="non-scaling-stroke" stroke-dasharray="30,10" />
        </svg>`);
    svg.fill();
    svg.angle=10;
    svg.scale.set(3.2);
    svg.position.set(300, 50);
    app.stage.addChild(svg);

    const circle = new Graphics();

    circle.fillStyle = 0xffff00;
    circle.circle(0, 0, 50);
    circle.stroke({ color: 0xff0000, width: 5, alignment: 0 });
    circle.fill();
    circle.scale.set(2);
    circle.position.set(700, 150);
    app.stage.addChild(circle);

    const line = new Graphics();

    line.fillStyle = 0xffff00;
    line.moveTo(0, 0);
    line.lineTo(100, 5);
    line.stroke({ color: 0xff0000, width: 1, alignment: 0 });
    line.scale.set(2);
    line.position.set(700, 150);
    app.stage.addChild(line);

    const rect = new Graphics();

    rect.fillStyle = 0xffff00;
    rect.rect(0, 0, 100, 100);
    rect.stroke({ color: 0xff0000, width: 1, alignment: 0 });
    rect.scale.set(2);
    rect.position.set(50, 300);
    rect.angle = 5;
    app.stage.addChild(rect);

    const sprites = [roundRect, svg, circle, line, rect];

    for (const sprite of sprites)
    {
        sprite.eventMode = 'static';
        sprite.on('click', () =>
        {
            console.log('click');
            console.log(sprite.localTransform);
            console.log(sprite.worldTransform);
            console.log(sprite.getLocalBounds());
            console.log(sprite.getBounds());

            // sprite.destroy();

            const bounds1 = sprite.getBounds();
            const g1 = new Graphics();

            g1.rect(bounds1.x, bounds1.y, bounds1.width, bounds1.height);
            g1.stroke({ width: 1, color: 0xff0000 });
            app.stage.addChild(g1);

            const bounds2 = sprite.getLocalBounds();
            const g2 = new Graphics();

            g2.rect(bounds2.x, bounds2.y, bounds2.width, bounds2.height);
            g2.stroke({ width: 1, color: 0xff00ff, alignment: 0 });
            sprite.addChild(g2);
        });
    }
}

await test();
