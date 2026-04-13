import { Container, Graphics, Text } from 'pixi.js';

export class CharacterUI extends Container {
  constructor(name) {
    super();

    const label = new Text({
      text: name,
      resolution: 2,
      style: { fontSize: 16, fill: 0x000000 },
      anchor: 0.5,
    });

    const padding = 10;

    const bg = new Graphics()
      .roundRect(
        (-label.width / 2) - padding,
        (-label.height / 2) - padding,
        label.width + (padding * 2),
        label.height + (padding * 2),
        20,
      )
      .fill({
        color: 0xffff00,
        alpha: 1,
      });

    this.addChild(bg, label);
  }
}
