/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable newline-before-return */
/* eslint-disable newline-after-var */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/quotes */
import { Application } from "../src/app/Application";
import { Assets } from "../src/assets/Assets";
import { Graphics } from "../src/scene/graphics/shared/Graphics";
import { Sprite } from "../src/scene/sprite/Sprite";
// import { analyzer } from "./gpu";

async function myTest() {
    // analyzer();
    const app = new Application();

    await app.init({
        width: 1000,
        height: 1000,
        preference: "webgpu",
        autoDensity: true,
        resolution: window.devicePixelRatio,
    });
    document.body.appendChild(app.canvas);

    const texture = await Assets.load("assets/boat.jpeg");
    const sprite = Sprite.from(texture);
    sprite.position.set(100);
    // sprite.tint = 0xff0000;
    // sprite.scale.set(2)
    app.stage.addChild(sprite);

    sprite.eventMode = "static";
    sprite.on("click", () => {
        console.log("click");
        sprite.width=100;
    });

    // from svg path
    const svg = new Graphics();
    svg.svg(`
    <?xml version="1.0" encoding="utf-8"?>
    <svg xmlns="http://www.w3.org/2000/svg" class="urh_lA" style="stroke: rgb(0, 0, 0); fill: rgb(0, 0, 0);" viewBox="0 -6 272 16" >
    <g >
        <g type="line" class="_682gpw" style="touch-action: pan-x pan-y pinch-zoom;" >
            <path d="M 0,2 L 261,2" stroke-linecap="butt" stroke-width="4" fill="none" pointer-events="auto" stroke="#f35d58" stroke-dasharray="12,4" />
        </g>
        <g type="endpoint_r" sub-type="solid_arrow" transform="translate(272 2) scale(4)" >
            <path fill="#f35d58" stroke-linecap="round" stroke-linejoin="round" d="M -2.5,-1.5,-0.5,0,-2.5,1.5 Z" stroke="#f35d58" />
        </g>
    </g>
    </svg>`);
    svg.scale.set(2);
    svg.position.set(100, 600);
    app.stage.addChild(svg);
}

myTest();
