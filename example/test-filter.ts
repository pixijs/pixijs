/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable newline-before-return */
/* eslint-disable newline-after-var */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/quotes */
import dat from "dat.gui";
import { Application } from "../src/app/Application";
import { Assets } from "../src/assets/Assets";
import { GrainFilter } from "../src/filters/defaults/grain/GrainFilter";
import { OilFilter } from "../src/filters/defaults/oil/OilFilter";
import { Sprite } from "../src/scene/sprite/Sprite";
import { AdjustFilter } from "../src/filters/defaults/adjust/AdjustFilter";
// import { analyzer } from "./gpu";

async function myTest() {
    // analyzer();
    const app = new Application();

    await app.init({
        width: 1000,
        height: 1000,
        preference: "webgl",
        autoDensity: true,
        resolution: window.devicePixelRatio,
    });
    document.body.appendChild(app.canvas);

    const texture = await Assets.load("assets/boat2.jpeg");
    const sprite = Sprite.from(texture);
    sprite.position.set(150);
    sprite.width = 648;
    sprite.height = 431;
    app.stage.addChild(sprite);
    const filters = [];

    const gui = new dat.GUI();
    const group = gui.addFolder("texture");

    const grainTexture = await Assets.load("assets/grain.png");
    const grainFilter = new GrainFilter({
        mapTexture: grainTexture,
        width: texture.width,
        height: texture.height,
        value: 0,
    });
    grainFilter.resolution = window.devicePixelRatio;
    filters.push(grainFilter);
    group.add(grainFilter, "value", 0, 1, 0.1).name("grain");

    const oilTexture = await Assets.load("assets/oil.png");
    const oilFilter = new OilFilter({
        mapTexture: oilTexture,
        width: texture.width,
        height: texture.height,
        value: 0,
    });
    oilFilter.resolution = window.devicePixelRatio;
    filters.push(oilFilter);
    group.add(oilFilter, "value", 0, 1, 0.1).name("oil");

    // const adjustTexture = await Assets.load("assets/adjust.png");
    // const adjustFilter = new AdjustFilter({ mapTexture: adjustTexture });
    // adjustFilter.resolution = window.devicePixelRatio;
    // filters.push(adjustFilter);
    // const adjust = gui.addFolder("adjust");
    // adjust.add(adjustFilter, "brightness", 0, 1, 0.1).name("adjust");

    sprite.filters = filters;
}

myTest();
