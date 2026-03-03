import { Container, Sprite, type Texture } from 'pixi.js';
import { CharacterUI } from './CharacterUI';

export class Fish extends Container {
  public ui: CharacterUI;
  public _speed: number = 1 + Number(Math.random());
  public _direction: number = Math.random() * Math.PI * 2;
  public fishView: Sprite;

  constructor(name: string, texture: Texture) {
    super();

    this.fishView = new Sprite(texture);

    this.fishView.anchor.set(0.5);

    this.addChild(this.fishView);

    this.ui = new CharacterUI(name);
    this.ui.y = 0;
    this.addChild(this.ui);
  }

  public update() {
    this._direction += 0.001;

    this.fishView.rotation = Math.PI - this._direction;
    this.x += this._speed * Math.cos(-this._direction);
    this.y += this._speed * Math.sin(-this._direction);

    // wrap around the screen
    const padding = 100;
    const width = 630;
    const height = 410;

    if (this.x > width + padding) this.x -= width + (padding * 2);
    if (this.x < -padding) this.x += width + (padding * 2);
    if (this.y > height + padding) this.y -= height + (padding * 2);
    if (this.y < -padding) this.y += height + (padding * 2);
  }
}
