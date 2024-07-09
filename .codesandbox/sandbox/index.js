import * as PIXI from "pixi.js";
import stats from "stats.js";
import { Bunny } from "./Bunny";

// Application settings
const settings = {
  bounds: new PIXI.Rectangle(0, 0, 800, 600),
  maxCount: 200000,
  startCount: 100000,
  amount: 100,
};

// Application state
const state = {
  bunnies: [],
  count: 0,
  isAdding: false,
  textures: [],
};

// Initialize performance stats
const statsInstance = new stats();
statsInstance.showPanel(0);
document.body.appendChild(statsInstance.dom);

class BunnyApp {
  constructor() {
    this.app = new PIXI.Application();
  }

  async init() {
    await this.app.init({
      background: "0x1099bb",
      resizeTo: window,
      preference: "webgl",
    });
    document.body.appendChild(this.app.view);
    await this.loadAssets();
    this.addEventListeners();
    this.app.ticker.add(this.renderUpdate.bind(this));
  }

  async loadAssets() {
    const res = await PIXI.Assets.load([
      "https://pixijs.io/bunny-mark/rabbitv3_ash.f9b51f87.png",
      "https://pixijs.io/bunny-mark/rabbitv3_batman.f2366b28.png",
      "https://pixijs.io/bunny-mark/rabbitv3_bb8.5643fc2e.png",
      "https://pixijs.io/bunny-mark/rabbitv3_neo.9dae7d26.png",
      "https://pixijs.io/bunny-mark/rabbitv3_sonic.47c6e256.png",
      "https://pixijs.io/bunny-mark/rabbitv3_spidey.eaca10f8.png",
      "https://pixijs.io/bunny-mark/rabbitv3_stormtrooper.94ae236d.png",
      "https://pixijs.io/bunny-mark/rabbitv3_superman.171d1c7c.png",
      "https://pixijs.io/bunny-mark/rabbitv3_tron.2766ecee.png",
      "https://pixijs.io/bunny-mark/rabbitv3_wolverine.106572e8.png",
      "https://pixijs.io/bunny-mark/rabbitv3.cc496818.png",
      "https://pixijs.io/bunny-mark/rabbitv3_frankenstein.57d299cf.png",
    ]);
    state.textures = Object.values(res);
    this.addBunnies(settings.startCount);
  }

  addEventListeners() {
    this.app.view.addEventListener("mousedown", () => {
      state.isAdding = true;
    });
    this.app.view.addEventListener("mouseup", () => {
      state.isAdding = false;
    });
    requestAnimationFrame(this.stats.bind(this));
  }

  stats() {
    statsInstance.update();
    requestAnimationFrame(this.stats.bind(this));
  }

  addBunnies(num) {
    for (let i = 0; i < num; i++) {
      const bunny = new Bunny(
        state.textures[state.count % state.textures.length],
        settings.bounds
      );
      bunny.position.x = (state.count % 2) * 800;
      this.app.stage.addChild(bunny);
      state.bunnies.push(bunny);
      state.count++;
    }
  }

  renderUpdate() {
    if (state.isAdding && state.count < settings.maxCount) {
      this.addBunnies(settings.amount);
    }

    for (let i = 0; i < state.bunnies.length; i++) {
      state.bunnies[i].update();
    }
  }
}

// Initialize the application
new BunnyApp().init();
