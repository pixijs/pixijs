// description: An interactive HTML form rendered via HTMLSource onto a cursor-tilted PerspectiveMesh (rotation clamped); a per-frame CSS matrix3d homography keeps the real inputs aligned and usable under the 3D warp, and the slider drives a BlurFilter
import { Application, BlurFilter, PerspectiveMesh, Texture } from 'pixi.js';
import { HTMLSource } from 'pixi.js/html-source';

(async () => {
  const app = new Application();

  await app.init({ backgroundColor: 0x1099bb, resizeTo: window });
  document.body.appendChild(app.canvas);
  document.body.style.cssText = 'margin: 0; overflow: hidden';

  // The element must be a direct child of the Pixi canvas so HTMLSource can capture it.
  const form = document.createElement('div');

  // transform-origin 0 0 so the matrix3d below maps the form's local (0,0)-(w,h) box
  // straight onto screen pixels, matching the mesh's projected corners exactly.
  form.style.cssText = [
    'position: absolute',
    'top: 0',
    'left: 0',
    'transform-origin: 0 0',
    'padding: 20px',
    'background: #ffffff',
    'border-radius: 12px',
    'font-family: system-ui, sans-serif',
    'font-size: 16px',
    'display: flex',
    'flex-direction: column',
    'gap: 12px',
    'width: 260px',
  ].join(';');

  form.innerHTML = `
    <label style="display:flex;flex-direction:column;gap:4px;color:#333">
      Name
      <input type="text" value="Pixi" style="padding:6px;border:1px solid #ccc;border-radius:6px;font-size:14px" />
    </label>
    <label style="display:flex;flex-direction:column;gap:4px;color:#333">
      Blur
      <input type="range" min="0" max="100" value="0" />
    </label>
  `;

  app.canvas.appendChild(form);

  const source = new HTMLSource({ resource: form });
  const texture = Texture.from(source);

  const formWidth = form.offsetWidth;
  const formHeight = form.offsetHeight;
  const halfFormWidth = formWidth / 2;
  const halfFormHeight = formHeight / 2;

  const mesh = app.stage.addChild(
    new PerspectiveMesh({
      texture,
      pivot: { x: halfFormWidth, y: halfFormHeight },
      x: app.screen.width / 2,
      y: app.screen.height / 2,
      width: formWidth,
      height: formHeight,
    }),
  );

  const blurFilter = new BlurFilter({ strength: 0 });
  const rangeInput = form.querySelector<HTMLInputElement>('input[type="range"]')!;

  // Maps the slider's 0–100 range onto a 0–4 blur strength and drops the filter
  // entirely at zero to skip the extra render pass.
  const applyBlur = () => {
    const strength = (Number(rangeInput.value) / 100) * 4;

    if (strength === 0) {
      mesh.filters = [];
    } else {
      blurFilter.strength = strength;
      mesh.filters = [blurFilter];
    }
  };

  rangeInput.addEventListener('input', applyBlur);
  applyBlur();

  // Corner order is TL, TR, BR, BL throughout.
  const points = [
    { x: 0, y: 0 },
    { x: formWidth, y: 0 },
    { x: formWidth, y: formHeight },
    { x: 0, y: formHeight },
  ];
  const outPoints = points.map((p) => ({ ...p }));

  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

  // Cursor drives the tilt, clamped so the form never folds past a readable angle.
  const MAX_ANGLE = 18;
  let angleX = 0;
  let angleY = 0;

  // Projects the form's 4 corners through a 3D rotation + perspective divide,
  // the same maths as the mesh_perspective_3d example, just clamped and form-sized.
  function rotate3D(perspective: number) {
    const radX = (angleX * Math.PI) / 180;
    const radY = (angleY * Math.PI) / 180;
    const cosX = Math.cos(radX);
    const sinX = Math.sin(radX);
    const cosY = Math.cos(radY);
    const sinY = Math.sin(radY);

    for (let i = 0; i < points.length; i++) {
      const src = points[i];
      const out = outPoints[i];
      const x = src.x - halfFormWidth;
      const y = src.y - halfFormHeight;
      let z = 0;

      const xY = (cosY * x) - (sinY * z);

      z = (sinY * x) + (cosY * z);

      const yX = (cosX * y) - (sinX * z);

      z = (sinX * y) + (cosX * z);

      const scale = perspective / (perspective - z);

      out.x = (xY * scale) + halfFormWidth;
      out.y = (yX * scale) + halfFormHeight;
    }
  }

  // --- CSS matrix3d homography -----------------------------------------------
  // Standard 4-point projective transform (adjugate method). It builds the 3x3
  // matrix that maps the form's flat rect onto the same screen quad the mesh
  // renders, so the DOM inputs stay clickable under the perspective warp.
  type Mat3 = number[];

  function adj(m: Mat3): Mat3 {
    return [
      (m[4] * m[8]) - (m[5] * m[7]), (m[2] * m[7]) - (m[1] * m[8]), (m[1] * m[5]) - (m[2] * m[4]),
      (m[5] * m[6]) - (m[3] * m[8]), (m[0] * m[8]) - (m[2] * m[6]), (m[2] * m[3]) - (m[0] * m[5]),
      (m[3] * m[7]) - (m[4] * m[6]), (m[1] * m[6]) - (m[0] * m[7]), (m[0] * m[4]) - (m[1] * m[3]),
    ];
  }

  function multmm(a: Mat3, b: Mat3): Mat3 {
    const c: Mat3 = [];

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        let acc = 0;

        for (let k = 0; k < 3; k++) {
          acc += a[(3 * i) + k] * b[(3 * k) + j];
        }
        c[(3 * i) + j] = acc;
      }
    }

    return c;
  }

  function multmv(m: Mat3, v: number[]): number[] {
    return [
      (m[0] * v[0]) + (m[1] * v[1]) + (m[2] * v[2]),
      (m[3] * v[0]) + (m[4] * v[1]) + (m[5] * v[2]),
      (m[6] * v[0]) + (m[7] * v[1]) + (m[8] * v[2]),
    ];
  }

  // q: 4 corners in TL, TR, BL, BR order: [x1,y1, x2,y2, x3,y3, x4,y4].
  function basisToPoints(q: number[]): Mat3 {
    const m: Mat3 = [q[0], q[2], q[4], q[1], q[3], q[5], 1, 1, 1];
    const v = multmv(adj(m), [q[6], q[7], 1]);

    return multmm(m, [v[0], 0, 0, 0, v[1], 0, 0, 0, v[2]]);
  }

  function general2DProjection(src: number[], dst: number[]): Mat3 {
    return multmm(basisToPoints(dst), adj(basisToPoints(src)));
  }

  // Source quad in TL, TR, BL, BR order — never changes.
  const srcQuad = [0, 0, formWidth, 0, 0, formHeight, formWidth, formHeight];

  function formMatrix3d(): string {
    // Mesh local point (lx, ly) renders at (mesh.x - pivot + l) with scale 1.
    const offsetX = mesh.x - halfFormWidth;
    const offsetY = mesh.y - halfFormHeight;

    // outPoints is TL, TR, BR, BL; reorder to TL, TR, BL, BR for the solver.
    const dstQuad = [
      offsetX + outPoints[0].x, offsetY + outPoints[0].y,
      offsetX + outPoints[1].x, offsetY + outPoints[1].y,
      offsetX + outPoints[3].x, offsetY + outPoints[3].y,
      offsetX + outPoints[2].x, offsetY + outPoints[2].y,
    ];

    const matrix = general2DProjection(srcQuad, dstQuad);
    const h = matrix.map((value) => value / matrix[8]);

    // Embed the 3x3 homography into a column-major 4x4 matrix3d (z passthrough).
    return `matrix3d(${[
      h[0], h[3], 0, h[6],
      h[1], h[4], 0, h[7],
      0, 0, 1, 0,
      h[2], h[5], 0, h[8],
    ].join(',')})`;
  }

  app.ticker.add(() => {
    rotate3D(300);

    mesh.setCorners(
      outPoints[0].x,
      outPoints[0].y,
      outPoints[1].x,
      outPoints[1].y,
      outPoints[2].x,
      outPoints[2].y,
      outPoints[3].x,
      outPoints[3].y,
    );

    form.style.transform = formMatrix3d();
  });

  app.stage.hitArea = app.screen;
  app.stage.eventMode = 'static';
  app.stage.on('pointermove', (e) => {
    const { x, y } = e.global;

    angleY = clamp(-(x - mesh.x) / 10, -MAX_ANGLE, MAX_ANGLE);
    angleX = clamp(-(y - mesh.y) / 10, -MAX_ANGLE, MAX_ANGLE);
  });
})();
