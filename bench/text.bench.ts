/**
 * `text updates`: N canvas `Text` labels of which N / 10 get a new string every frame, rotating through all N, over
 * 10 N `BitmapText` counters whose digits all change every frame. The bitmap font is installed in `create` from a
 * generated style, so nothing is loaded.
 *
 * Judged on `cpu.frame`: the update is the string writes, and the render is where the cost lands. `t300` is 30
 * canvas text rasterisations and texture uploads plus 3000 bitmap texts re-laid-out into glyph quads a frame, with
 * the rest of the 300 labels drawn from their existing textures; `t1000` is 100 and 10 000 of each. The per-frame
 * work scales with the variant (it used to be 30 and 3000 at every N, so the ladder only grew the static labels).
 *
 * The strings are a function of the frame alone, and the labels start from what a whole pass leaves them showing,
 * so every pass draws the same frames.
 */

import { frame } from 'benchy';
import { BitmapFont, BitmapText, Container, Text, TextStyle } from 'pixi.js';

import type { PixiStage } from './shared.ts';

/** Frames in one pass: `duration` below, at 60 Hz. */
const PASS_FRAMES = 240;
const FONT = 'bench-digits';
const WORDS = ['Score', 'Lives', 'Gold', 'Time', 'Level', 'Combo', 'Ammo', 'Speed'];
/** Distinct label strings, so a frame's strings come from a table and allocate nothing. */
const TABLE = 10_000;

/** Which label table entry text `index` shows after being changed on frame `step`. */
function labelAt(index: number, step: number): number {
  return (index * 7919 + step * 31) % TABLE;
}

frame('text updates', {
  variants: {
    t300: { count: 300, changed: 30, bitmaps: 3000 },
    t1000: { count: 1000, changed: 100, bitmaps: 10_000 },
    labels300: { count: 300, changed: 300, bitmaps: 0 },
  },
  primary: 'cpu.frame',
  duration: 4,
  create({ stage, width, height }: PixiStage, { count, changed, bitmaps }) {
    /** Labels given a new string each frame. */
    const CHANGED = changed;
    const BITMAP_COUNT = bitmaps;
    const labels: string[] = new Array(TABLE);
    const digits: string[] = new Array(TABLE);
    for (let k = 0; k < TABLE; k++) {
      labels[k] = `${WORDS[k % WORDS.length]} ${String(k).padStart(4, '0')}`;
      digits[k] = String(k * 7).padStart(5, '0');
    }

    // The frame each label was last changed on by the end of a pass, which is what it shows when a pass begins.
    const lastChanged = new Int32Array(count).fill(-1);
    for (let step = 0; step < PASS_FRAMES; step++) {
      for (let j = 0; j < CHANGED; j++) lastChanged[(step * CHANGED + j) % count] = step;
    }

    const root = new Container({ label: 'text' });
    stage.addChild(root);

    // Canvas labels over the top half of the canvas.
    const style = new TextStyle({ fontFamily: 'Arial', fontSize: count > 500 ? 12 : 16, fill: 0xf2f2f2 });
    const columns = Math.ceil(Math.sqrt((count * width) / (height / 2)));
    const cellW = width / columns;
    const cellH = height / 2 / Math.ceil(count / columns);
    const texts: Text[] = new Array(count);
    for (let i = 0; i < count; i++) {
      const text = new Text({ text: labels[labelAt(i, lastChanged[i] ?? 0)], style });
      text.position.set((i % columns) * cellW + 4, Math.floor(i / columns) * cellH + 2);
      texts[i] = text;
      root.addChild(text);
    }

    // Bitmap counters over the bottom half, from a font made in-page and tinted from white.
    BitmapFont.install({
      name: FONT,
      style: { fontFamily: 'Arial', fontSize: 24, fill: 0xffffff },
      chars: '0123456789',
    });
    const bitmapColumns = Math.ceil(Math.sqrt((BITMAP_COUNT * width) / (height / 2)));
    const bitmapW = width / bitmapColumns;
    const bitmapH = height / 2 / Math.ceil(BITMAP_COUNT / bitmapColumns);
    const counters: BitmapText[] = new Array(BITMAP_COUNT);
    for (let i = 0; i < BITMAP_COUNT; i++) {
      const counter = new BitmapText({ text: digits[i % TABLE], style: { fontFamily: FONT, fontSize: 12 } });
      counter.position.set((i % bitmapColumns) * bitmapW + 2, height / 2 + Math.floor(i / bitmapColumns) * bitmapH);
      counter.tint = i % 3 === 0 ? 0xffd93d : i % 3 === 1 ? 0x9bf6ff : 0xffffff;
      counters[i] = counter;
      root.addChild(counter);
    }

    // What the frame writes, chosen by `simulate`.
    const changedIndex = new Int32Array(CHANGED);
    const changedText: string[] = new Array(CHANGED);
    const counterText: string[] = new Array(BITMAP_COUNT);

    return {
      simulate(seconds) {
        const step = Math.round(seconds * 60) % PASS_FRAMES;
        for (let j = 0; j < CHANGED; j++) {
          const index = (step * CHANGED + j) % count;
          changedIndex[j] = index;
          changedText[j] = labels[labelAt(index, step)];
        }
        for (let i = 0; i < BITMAP_COUNT; i++) counterText[i] = digits[(i * 37 + step * 13) % TABLE];
      },
      update() {
        for (let j = 0; j < CHANGED; j++) texts[changedIndex[j]].text = changedText[j];
        for (let i = 0; i < BITMAP_COUNT; i++) counters[i].text = counterText[i];
      },
      destroy() {
        root.destroy({ children: true });
        style.destroy();
        BitmapFont.uninstall(FONT);
      },
    };
  },
});
