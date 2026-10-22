/**
 * `ui tree`: a mostly-static interface, about N nodes ten levels deep under six panels, each panel clipped by a
 * rectangular `Graphics` mask. Under each panel: a scroll container, sections, groups, rows, cells, and two wrapper
 * containers above every leaf (the nesting layout code tends to make), and the leaves a mix of `Sprite`s from one
 * sheet, `Text` labels and `Graphics` rectangles.
 *
 * Each frame only 2% of the leaves move (sliders and scrolling items, a few pixels side to side) and one panel is
 * dragged. Everything else is unchanged from the frame before. `tick5k` adds one label whose text changes every frame.
 *
 * Judged on `cpu.render`: what the renderer pays to draw a large tree that barely changed (the transform walk, the
 * instruction rebuild or reuse, the masks), which is the question for a UI-heavy app. The update is a few hundred
 * setter calls.
 */

import { frame } from 'benchy';
import { Container, Graphics, Sprite, Text, TextStyle } from 'pixi.js';

import { makeSheet, PALETTE } from './shared.ts';
import type { PixiStage } from './shared.ts';

/** Nodes in one section: 2 groups of 4 rows of 6 cells, each cell a chain of four nodes down to its leaf. */
const GROUPS = 2;
const ROWS = 4;
const CELLS = 6;
const SECTION_NODES = 1 + GROUPS * (1 + ROWS * (1 + CELLS * 4));
/** A panel's own nodes: itself, its background, its mask and its scroll container. */
const PANEL_NODES = 4;
const PANELS = 6;
const ROW_HEIGHT = 24;
const GROUP_GAP = 8;
const SECTION_GAP = 16;

const LABELS = ['Play', 'Settings', 'Volume', 'Score', 'Level', 'Inventory', 'Quests', 'Map', 'Shop', 'Profile', 'Back', 'OK'];

frame('ui tree', {
  variants: { n5k: { count: 5000, tickers: 0 }, n20k: { count: 20_000, tickers: 0 }, tick5k: { count: 5000, tickers: 1 } },
  primary: 'cpu.render',
  create({ stage, width, height, rng }: PixiStage, { count, tickers }) {
    const sheet = makeSheet(32);
    const labelStyle = new TextStyle({ fontFamily: 'Arial', fontSize: 12, fill: 0xe8eef5 });
    const sections = Math.max(1, Math.round((count / PANELS - PANEL_NODES) / SECTION_NODES));

    const root = new Container({ label: 'ui' });
    stage.addChild(root);

    const panelWidth = Math.floor(width / 3);
    const panelHeight = Math.floor(height / 2);
    const gap = 12;
    const innerWidth = panelWidth - gap * 2;
    const innerHeight = panelHeight - gap * 2;
    const cellWidth = Math.floor((innerWidth - 16) / CELLS);

    const panels: Container[] = [];
    const panelX: number[] = [];
    const panelY: number[] = [];
    const leaves: Container[] = [];
    const leafX: number[] = [];

    for (let p = 0; p < PANELS; p++) {
      const panel = new Container({ label: `panel ${p}` });
      panel.x = (p % 3) * panelWidth + gap;
      panel.y = Math.floor(p / 3) * panelHeight + gap;
      panels.push(panel);
      panelX.push(panel.x);
      panelY.push(panel.y);

      const background = new Graphics()
        .roundRect(0, 0, innerWidth, innerHeight, 10)
        .fill(0x1b2430)
        .stroke({ width: 2, color: 0x3c4c60 });
      const scroll = new Container({ label: 'scroll' });
      scroll.position.set(8, 8);
      const mask = new Graphics().rect(0, 0, innerWidth, innerHeight).fill(0xffffff);
      panel.addChild(background, scroll, mask);
      panel.mask = mask;

      let sectionY = 0;
      for (let s = 0; s < sections; s++) {
        const section = new Container({ label: 'section' });
        section.y = sectionY;
        scroll.addChild(section);
        let groupY = 0;
        for (let g = 0; g < GROUPS; g++) {
          const group = new Container({ label: 'group' });
          group.y = groupY;
          section.addChild(group);
          for (let r = 0; r < ROWS; r++) {
            const row = new Container({ label: 'row' });
            row.y = r * ROW_HEIGHT;
            group.addChild(row);
            for (let c = 0; c < CELLS; c++) {
              const cell = new Container({ label: 'cell' });
              cell.x = c * cellWidth;
              const inner = new Container({ label: 'inner' });
              inner.position.set(2, 3);
              const wrapper = new Container({ label: 'wrapper' });
              const kind = rng.int(3);
              let leaf: Container;
              if (kind === 0) {
                const sprite = new Sprite(sheet.textures[rng.int(4)]);
                sprite.setSize(18);
                sprite.tint = PALETTE[rng.int(16)];
                leaf = sprite;
              } else if (kind === 1) {
                leaf = new Text({ text: LABELS[rng.int(LABELS.length)], style: labelStyle });
              } else {
                leaf = new Graphics()
                  .roundRect(0, 0, rng.range(cellWidth * 0.3, cellWidth - 8), 16, 4)
                  .fill(PALETTE[rng.int(16)]);
              }
              wrapper.addChild(leaf);
              inner.addChild(wrapper);
              cell.addChild(inner);
              row.addChild(cell);
              leaves.push(leaf);
              leafX.push(leaf.x);
            }
          }
          groupY += ROWS * ROW_HEIGHT + GROUP_GAP;
        }
        sectionY += groupY + SECTION_GAP;
      }
      root.addChild(panel);
    }

    // The 2% of leaves that move: sliders and scrolling items, each on a phase of its own.
    const movers: Container[] = [];
    const moverBase: number[] = [];
    const moverPhase: number[] = [];
    const moverCount = Math.max(1, Math.round(leaves.length * 0.02));
    for (let m = 0; m < moverCount; m++) {
      const index = rng.int(leaves.length);
      const leaf = leaves[index];
      if (!leaf || movers.includes(leaf)) continue;
      movers.push(leaf);
      moverBase.push(leafX[index] ?? 0);
      moverPhase.push(rng.range(0, Math.PI * 2));
    }

    const moverX = new Float32Array(movers.length);
    // `tickers` labels get a new string every frame (a score, a clock): the case where one changing Text
    // costs a whole render-group rebuild if the pipe cannot swap its texture in place.
    const tickTexts = leaves.filter((leaf): leaf is Text => leaf instanceof Text).slice(0, tickers);
    let tickValue = '';
    const dragged = panels[0];
    let draggedX = panelX[0] ?? 0;
    let draggedY = panelY[0] ?? 0;

    return {
      simulate(seconds) {
        for (let m = 0; m < movers.length; m++) {
          moverX[m] = (moverBase[m] ?? 0) + Math.sin(seconds * 2.5 + (moverPhase[m] ?? 0)) * 6;
        }
        draggedX = (panelX[0] ?? 0) + Math.sin(seconds * 0.8) * 40;
        draggedY = (panelY[0] ?? 0) + Math.sin(seconds * 1.3) * 24;
        tickValue = `Score ${String(Math.round(seconds * 60) % 10_000).padStart(4, '0')}`;
      },
      update() {
        for (let m = 0; m < movers.length; m++) movers[m].x = moverX[m];
        for (let t = 0; t < tickTexts.length; t++) tickTexts[t].text = tickValue;
        dragged.position.set(draggedX, draggedY);
      },
      destroy() {
        root.destroy({ children: true, context: true });
        labelStyle.destroy();
        sheet.destroy();
      },
    };
  },
});
