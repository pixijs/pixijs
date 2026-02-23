import { Container, Graphics, Sprite } from 'pixi.js';
import { intersect } from './intersect';

/* ---------------------------------
Spinner 4. Rounded rectangle edges.
------------------------------- */
export function generateSpinner4(app, position) {
  const container = new Container();

  container.position = position;
  app.stage.addChild(container);

  const size = 100;
  const arcRadius = 15;

  const base = Sprite.from('https://pixijs.com/assets/bg_scene_rotate.jpg');

  base.width = size;
  base.height = size;

  // For better performance having assets prerounded would be better than masking.
  const roundingMask = new Graphics();

  roundingMask.roundRect(0, 0, size, size, arcRadius).fill({ color: 0x0 });
  base.mask = roundingMask;

  // The edge could be replaced with image as well.
  const lineSize = 5;
  const edge = new Graphics();

  edge.roundRect(0, 0, size, size, arcRadius).stroke({ width: lineSize, color: 0xff0000 });

  // Mask in this example works basically the same way as in example 1.
  // Except it is reversed and calculates the mask in straight lines in edges.
  const mask = new Graphics();

  mask.position.set(size / 2, size / 2);
  edge.mask = mask;

  container.addChild(base);
  container.addChild(roundingMask);
  container.addChild(edge);
  container.addChild(mask);

  let phase = 0;

  return (delta) => {
    // Update phase
    phase += delta / 160;
    phase %= Math.PI * 2;

    // Calculate target point.
    const x = Math.cos(phase - (Math.PI / 2)) * size;
    const y = Math.sin(phase - (Math.PI / 2)) * size;
    // Line segments
    const segments = [
      [(-size / 2) + lineSize, (-size / 2) + lineSize, (size / 2) - lineSize, (-size / 2) + lineSize], // top segment
      [(size / 2) - lineSize, (-size / 2) + lineSize, (size / 2) - lineSize, (size / 2) - lineSize], // right
      [(-size / 2) + lineSize, (size / 2) - lineSize, (size / 2) - lineSize, (size / 2) - lineSize], // bottom
      [(-size / 2) + lineSize, (-size / 2) + lineSize, (-size / 2) + lineSize, (size / 2) - lineSize], // left
    ];
    // To which dir should mask continue at each segment
    let outDir: any = [
      [0, -1],
      [1, 0],
      [0, 1],
      [-1, 0],
    ];

    // Find the intersecting segment.
    let intersection = null;
    let winding = 0;
    // What direction should the line continue after hit has been found before hitting the line size

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const hit = intersect(0, 0, x, y, segment[0], segment[1], segment[2], segment[3]);

      if (hit) {
        intersection = hit;
        if (i === 0) winding = hit.x < 0 ? 0 : 4;
        else winding = 4 - i;
        outDir = outDir[i];
        break;
      }
    }

    const corners = [
      (-size / 2) - lineSize,
      (-size / 2) - lineSize, // Top left,
      (-size / 2) - lineSize,
      (size / 2) + lineSize, // Bottom left
      (size / 2) + lineSize,
      (size / 2) + lineSize, // Bottom right
      (size / 2) + lineSize,
      (-size / 2) - lineSize, // Top right
    ];

    // Redraw mask
    mask
      .clear()
      .moveTo(0, 0)
      .moveTo(0, (-size / 2) - lineSize);

    // fill the corners
    for (let i = 0; i < winding; i++) {
      mask.lineTo(corners[i * 2], corners[(i * 2) + 1]);
    }

    mask
      .lineTo(intersection.x + (outDir[0] * lineSize * 2), intersection.y + (outDir[1] * lineSize * 2))
      .lineTo(intersection.x, intersection.y)
      .lineTo(0, 0)
      .fill({ color: 0xff0000 });
  };
}
