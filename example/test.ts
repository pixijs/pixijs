/* eslint-disable no-console */
import { Application } from '../src/app/Application';
import { Assets } from '../src/assets/Assets';
import { Container } from '../src/scene/container/Container';
import { Graphics } from '../src/scene/graphics/shared/Graphics';
import { Sprite } from '../src/scene/sprite/Sprite';

async function test()
{
    const app = new Application();

    await app.init({ width: 800, height: 800 });
    document.body.appendChild(app.canvas);
    const texture = await Assets.load('assets/apple2.png');

    const container = new Container();

    app.stage.addChild(container);

    container.label = 'container';
    container.position.set(100);
    container.width = 250;
    container.height = 100;
    // container.scale.set(2);
    container.rotation = Math.PI / 6;
    app.stage.addChild(container);

    const g = new Graphics();

    g.rect(0, 0, container.width, container.height);
    g.fill({ color: 0xff0000 });
    container.addChild(g);

    const sprite = new Sprite(texture);

    sprite.label = 'child1';
    sprite.position.x = 50;
    sprite.position.y = 20;
    container.addChild(sprite);

    const sprite2 = new Sprite(texture);

    sprite2.label = 'child2';
    sprite2.position.x = 150;
    sprite2.position.y = 20;
    sprite2.rotation = Math.PI / 6;
    container.addChild(sprite2);

    setTimeout(() =>
    {
        console.log(sprite.label, sprite.localTransform, sprite.worldTransform);
        console.log(sprite2.label, sprite2.localTransform, sprite2.worldTransform);
    }, 1000);
}
await test();
