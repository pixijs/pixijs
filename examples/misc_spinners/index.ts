// description: Various loading spinners using masks and graphics
import { Application, Assets, Container, Graphics, Point, Sprite } from 'pixi.js';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ antialias: true, background: '#1099bb', resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  // Load the textures
  await Assets.load([
    'https://pixijs.com/assets/bg_scene_rotate.jpg',
    'https://pixijs.com/assets/bg_rotate.jpg',
    'https://pixijs.com/assets/circle.png',
  ]);

  /* ---------------------------------------
    Spinner 1. Square with radial completion.
    -------------------------------------- */
  const generateSpinner1 = (position) => {
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
  };

  /* -----------------------
    Spinner 2. Scaling balls.
    ---------------------- */
  const generateSpinner2 = (position) => {
    const container = new Container();

    container.position = position;
    app.stage.addChild(container);

    const size = 100;
    const ballAmount = 7;
    const balls = [];

    for (let i = 0; i < ballAmount; i++) {
      const ball = Sprite.from('https://pixijs.com/assets/circle.png');

      ball.anchor.set(0.5);
      container.addChild(ball);
      ball.position.set(
        (size / 2) + ((Math.cos((i / ballAmount) * Math.PI * 2) * size) / 3),
        (size / 2) + ((Math.sin((i / ballAmount) * Math.PI * 2) * size) / 3),
      );
      balls.push(ball);
    }

    let phase = 0;

    return (delta) => {
      // Update phase
      phase += delta / 60;
      phase %= Math.PI * 2;

      // Update ball scales
      balls.forEach((b, i) => {
        const sin = Math.sin(((i / ballAmount) * Math.PI) - phase);
        // Multiply sin with itself to get more steeper edge.

        b.scale.set(Math.abs(sin * sin * sin * 0.5) + 0.5);
      });
    };
  };

  /* ---------------------
    Spinner 3. Radial mask.
    -------------------- */
  const generateSpinner3 = (position) => {
    const container = new Container();

    container.position = position;
    app.stage.addChild(container);

    const base = Sprite.from('https://pixijs.com/assets/bg_scene_rotate.jpg');
    const size = 100;

    base.width = size;
    base.height = size;

    const mask = new Graphics();

    mask.position.set(size / 2, size / 2);
    base.mask = mask;

    container.addChild(base);
    container.addChild(mask);

    let phase = 0;

    return (delta) => {
      // Update phase
      phase += delta / 60;
      phase %= Math.PI * 2;

      const angleStart = 0 - (Math.PI / 2);
      const angle = phase + angleStart;
      const radius = 50;

      const x1 = Math.cos(angleStart) * radius;
      const y1 = Math.sin(angleStart) * radius;

      // Redraw mask
      mask
        .clear()
        .moveTo(0, 0)
        .lineTo(x1, y1)
        .arc(0, 0, radius, angleStart, angle, false)
        .lineTo(0, 0)
        .fill({ color: 0xff0000 });
    };
  };

  /* ---------------------------------
    Spinner 4. Rounded rectangle edges.
    ------------------------------- */
  const generateSpinner4 = (position) => {
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
  };

  /* ---------------------
    Spinner 5. Rounded rectangle fixed length spinner by jonlepage
    -------------------- */
  const generateSpinner5 = (position) => {
    const container = new Container();

    container.position = position;
    app.stage.addChild(container);

    const halfCircle = new Graphics().arc(0, 0, 100, 0, Math.PI).fill({ color: 0xff0000 });

    halfCircle.position.set(50, 50);

    const rectangle = new Graphics().roundRect(0, 0, 100, 100, 16).stroke({ width: 2, color: 0xffffff });

    rectangle.mask = halfCircle;

    container.addChild(rectangle);
    container.addChild(halfCircle);

    let phase = 0;

    return (delta) => {
      // Update phase
      phase += delta / 6;
      phase %= Math.PI * 2;

      halfCircle.rotation = phase;
    };
  };

  const onTick = [
    generateSpinner1(new Point(50, 50)),
    generateSpinner2(new Point(160, 50)),
    generateSpinner3(new Point(270, 50)),
    generateSpinner4(new Point(380, 50)),
    generateSpinner5(new Point(490, 50)),
  ];

  // Listen for animate update
  app.ticker.add((time) => {
    // Call tick handling for each spinner.
    onTick.forEach((cb) => {
      cb(time.deltaTime);
    });
  });

  /**
   * Helper functions
   * line intercept math by Paul Bourke http://paulbourke.net/geometry/pointlineplane/
   * Determine the intersection point of two line segments
   * Return FALSE if the lines don't intersect
   *
   * Code modified from original to match pixi examples linting rules.
   */
  function intersect(x1, y1, x2, y2, x3, y3, x4, y4) {
    // Check if none of the lines are of length 0
    if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
      return false;
    }

    const denominator = ((y4 - y3) * (x2 - x1)) - ((x4 - x3) * (y2 - y1));

    // Lines are parallel
    if (denominator === 0) {
      return false;
    }

    const ua = (((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3))) / denominator;
    const ub = (((x2 - x1) * (y1 - y3)) - ((y2 - y1) * (x1 - x3))) / denominator;

    // is the intersection along the segments
    if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
      return false;
    }

    // Return a object with the x and y coordinates of the intersection
    const x = x1 + (ua * (x2 - x1));
    const y = y1 + (ua * (y2 - y1));

    return { x, y };
  }
})();
