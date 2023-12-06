import { Application } from "../src/app/Application";
import { Assets } from "../src/assets/Assets";
import { Sprite } from "../src/scene/sprite/Sprite";

const count = 100000;

async function test() {
    const app = new Application();

    await app.init({ width: 800, height: 800 });
    document.body.appendChild(app.canvas);

    console.log("sprite count", count);

    const texture = await Assets.load("assets/apple2.png");
    // const texture = await Texture.from("assets/apple2.png");

    const sprites: Sprite[] = [];

    for (let i = 0; i < count; i++) {
        const sprite = new Sprite(texture);

        sprite.position.x = Math.random() * 800;
        sprite.position.y = Math.random() * 800;
        sprite.scale.x = 0.3;
        sprite.scale.y = 0.3;
        sprite.rotation = Math.random() * Math.PI * 2;
        (sprite as any).speed = Math.random() * 10 + 2;
        sprites.push(sprite);
        app.stage.addChild(sprite);
    }

    app.ticker.add(() => {
        sprites.forEach((sprite) => {
            sprite.position.y += (sprite as any).speed;
            if (sprite.position.y > 800) {
                sprite.position.y = -texture.height;
            }
        });
    });
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
test();
