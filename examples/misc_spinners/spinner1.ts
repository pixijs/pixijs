import { Container, Graphics, Sprite } from 'pixi.js';
import { intersect } from './intersect';

/* ---------------------------------------
Spinner 1. Square with radial completion.
-------------------------------------- */
export function generateSpinner1(app, position) {
  const container = new Container();

  container.position = position;
  app.stage.addChild(container);

  const base = Sprite.from('https://pixijs.com/assets/bg_scene_rotate.jpg');
  const size = 100;

  base.width = size;
  base.height = size;

  const bottom = Sprite.from('https://pixijs.com/assets/bg_rotate.jpg');

  bottom.width = size;
  bottom.height = size;

  const mask = new Graphics();

  mask.position.set(size / 2, size / 2);
  base.mask = mask;

  container.addChild(bottom);
  container.addChild(base);
  container.addChild(mask);

  let phase = 0;

  return (delta) => {
    // Update phase
    phase += delta / 60;
    phase %= Math.PI * 2;

    // Calculate target point.
    const x = Math.cos(phase - (Math.PI / 2)) * size;
    const y = Math.sin(phase - (Math.PI / 2)) * size;

    const segments = [
      [-size / 2, -size / 2, size / 2, -size / 2], // top segment
      [size / 2, -size / 2, size / 2, size / 2], // right
      [-size / 2, size / 2, size / 2, size / 2], // bottom
      [-size / 2, -size / 2, -size / 2, size / 2], // left
    ];

    // Find the intersecting segment.
    let intersection = null;
    let winding = 0;

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const hit = intersect(0, 0, x, y, segment[0], segment[1], segment[2], segment[3]);

      if (hit) {
        intersection = hit;
        if (i === 0) winding = hit.x > 0 ? 0 : 4;
        else winding = i;
        break;
      }
    }

    const corners = [
      size / 2,
      -size / 2, // Top right
      size / 2,
      size / 2, // Bottom right
      -size / 2,
      size / 2, // Bottom left
      -size / 2,
      -size / 2, // Top left,
      0,
      -size / 2, // End point
    ];

    // Redraw mask
    mask
      .clear()
      .moveTo(0, -size / 2)
      .lineTo(0, 0)
      .lineTo(intersection.x, intersection.y);

    // fill the corners
    for (let i = winding; i < corners.length / 2; i++) {
      mask.lineTo(corners[i * 2], corners[(i * 2) + 1]);
    }

    mask.fill({ color: 0xff0000 });
  };
}
