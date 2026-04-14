// description: This example demonstrates exporting Graphics to SVG with a side-by-side comparison view
import { Application, FillGradient, Graphics, graphicsContextToSvg } from 'pixi.js';

(async () => {
  // --- Layout: split screen left (pixi) / right (svg) ---
  const container = document.createElement('div');

  container.style.cssText = 'display:flex;width:100vw;height:100vh;margin:0;';
  document.body.style.margin = '0';
  document.body.style.overflow = 'hidden';
  document.body.appendChild(container);

  // Left pane — Pixi canvas
  const leftPane = document.createElement('div');

  leftPane.style.cssText = 'flex:1;position:relative;background:#ffffff;overflow:hidden;';
  container.appendChild(leftPane);

  // Divider
  const divider = document.createElement('div');

  divider.style.cssText = 'width:2px;background:#ccc;flex-shrink:0;';
  container.appendChild(divider);

  // Right pane — SVG preview
  const rightPane = document.createElement('div');

  rightPane.style.cssText = 'flex:1;position:relative;background:#ffffff;overflow:hidden;';
  container.appendChild(rightPane);

  // Labels
  const makeLabel = (text: string) => {
    const label = document.createElement('div');

    label.textContent = text;
    label.style.cssText = `
      position:absolute;bottom:12px;left:50%;transform:translateX(-50%);
      padding:4px 12px;border-radius:4px;background:rgba(0,0,0,0.6);
      color:#fff;font:600 13px sans-serif;pointer-events:none;z-index:5;
    `;

    return label;
  };

  leftPane.appendChild(makeLabel('PixiJS'));
  rightPane.appendChild(makeLabel('SVG Export'));

  // --- Pixi app ---
  const app = new Application();

  await app.init({ background: '#ffffff', resizeTo: leftPane });
  leftPane.appendChild(app.canvas);

  const graphics = new Graphics();

  app.stage.addChild(graphics);

  // SVG container
  const svgContainer = document.createElement('div');

  svgContainer.style.cssText = 'width:100%;height:100%;';
  rightPane.appendChild(svgContainer);

  // --- Toolbar ---
  const toolbar = document.createElement('div');

  toolbar.style.cssText = `
    position:fixed;top:12px;left:50%;transform:translateX(-50%);
    display:flex;gap:8px;z-index:10;font-family:sans-serif;
  `;
  document.body.appendChild(toolbar);

  // eslint-disable-next-line operator-linebreak
  const btnStyle =
    'padding:8px 16px;border:none;border-radius:6px;cursor:pointer;font-size:14px;font-weight:600;';

  const addBtn = document.createElement('button');

  addBtn.textContent = 'Add Random Shapes';
  addBtn.style.cssText = `${btnStyle}background:#4fc3f7;color:#1a1a2e;`;
  addBtn.onclick = () => {
    addRandomShapes(graphics, leftPane);
    updateSvgPreview();
  };
  toolbar.appendChild(addBtn);

  const clearBtn = document.createElement('button');

  clearBtn.textContent = 'Clear';
  clearBtn.style.cssText = `${btnStyle}background:#ef5350;color:white;`;
  clearBtn.onclick = () => {
    graphics.clear();
    updateSvgPreview();
  };
  toolbar.appendChild(clearBtn);

  const copyBtn = document.createElement('button');

  copyBtn.textContent = 'Copy SVG';
  copyBtn.style.cssText = `${btnStyle}background:#66bb6a;color:white;`;
  copyBtn.onclick = () => {
    navigator.clipboard.writeText(graphicsContextToSvg(graphics.context));
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      copyBtn.textContent = 'Copy SVG';
    }, 1500);
  };
  toolbar.appendChild(copyBtn);

  const downloadBtn = document.createElement('button');

  downloadBtn.textContent = 'Download .svg';
  downloadBtn.style.cssText = `${btnStyle}background:#7e57c2;color:white;`;
  downloadBtn.onclick = () => {
    const svgString = graphicsContextToSvg(graphics.context);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = 'pixi-export.svg';
    a.click();
    URL.revokeObjectURL(url);
  };
  toolbar.appendChild(downloadBtn);

  function updateSvgPreview(): void {
    const svgString = graphicsContextToSvg(graphics.context);

    svgContainer.innerHTML = svgString;

    const svgEl = svgContainer.querySelector('svg');

    if (svgEl) {
      svgEl.style.width = '100%';
      svgEl.style.height = '100%';
    }
  }

  // Start with some shapes
  addRandomShapes(graphics, leftPane);
  updateSvgPreview();
})();

// ------------------------------------------------------------------
// Random shape generation
// ------------------------------------------------------------------

function rand(min: number, max: number): number {
  return (Math.random() * (max - min)) + min;
}

function randColor(): number {
  return Math.floor(Math.random() * 0xffffff);
}

function addRandomShapes(g: Graphics, pane: HTMLElement): void {
  const w = pane.clientWidth;
  const h = pane.clientHeight;
  const count = Math.floor(rand(4, 10));

  for (let i = 0; i < count; i++) {
    const type = Math.floor(rand(0, 7));
    const x = rand(50, w - 50);
    const y = rand(50, h - 50);
    const alpha = rand(0.4, 1);

    const doFill = Math.random() > 0.25;
    const doStroke = Math.random() > 0.5;

    switch (type) {
      case 0: // Rectangle
      {
        g.rect(x, y, rand(40, 200), rand(40, 150));
        break;
      }
      case 1: // Rounded rectangle
      {
        g.roundRect(x, y, rand(40, 200), rand(40, 150), rand(5, 25));
        break;
      }
      case 2: // Circle
      {
        g.circle(x, y, rand(20, 80));
        break;
      }
      case 3: // Ellipse
      {
        g.ellipse(x, y, rand(30, 100), rand(20, 60));
        break;
      }
      case 4: // Polygon
      {
        const sides = Math.floor(rand(3, 7));
        const r = rand(30, 80);
        const pts: number[] = [];

        for (let s = 0; s < sides; s++) {
          const a = ((s / sides) * Math.PI * 2) - (Math.PI / 2);

          pts.push(x + (r * Math.cos(a)), y + (r * Math.sin(a)));
        }
        g.poly(pts, true);
        break;
      }
      case 5: // Bezier curve
      {
        g.moveTo(x, y);
        g.bezierCurveTo(
          x + rand(-80, 80),
          y + rand(-80, 80),
          x + rand(40, 160),
          y + rand(-80, 80),
          x + rand(60, 180),
          y + rand(20, 100),
        );
        break;
      }
      case 6: // Shape with hole
      {
        if (Math.random() > 0.5) {
          // Rect with circular hole
          const rw = rand(80, 200);
          const rh = rand(80, 150);

          g.rect(x, y, rw, rh);
          g.fill({ color: randColor(), alpha });
          const holeR = Math.min(rw, rh) * rand(0.15, 0.35);

          g.circle(x + (rw / 2), y + (rh / 2), holeR);
          g.cut();
        } else {
          // Circle with rect hole
          const outerR = rand(40, 80);

          g.circle(x, y, outerR);
          g.fill({ color: randColor(), alpha });
          const holeSize = outerR * rand(0.4, 0.7);

          g.rect(x - (holeSize / 2), y - (holeSize / 2), holeSize, holeSize);
          g.cut();
        }
        continue;
      }
    }

    if (doFill) {
      if (Math.random() > 0.7) {
        const gradient = new FillGradient({
          type: 'linear',
          colorStops: [
            { offset: 0, color: randColor() },
            { offset: 1, color: randColor() },
          ],
        });

        g.fill({ fill: gradient, alpha });
      } else {
        g.fill({ color: randColor(), alpha });
      }
    }

    if (doStroke) {
      g.stroke({ color: randColor(), width: rand(1, 5), alpha });
    }

    if (!doFill && !doStroke) {
      g.fill({ color: randColor(), alpha });
    }
  }
}
