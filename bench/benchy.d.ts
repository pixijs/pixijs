// Generated from benchy's src/api/index.ts by `npm run build:types`; `benchy init` copies it here.
// Do not edit: `benchy init` replaces it.
declare module 'benchy' {
  /**
   * `benchy`: what a bench file imports. A bench file is any `*.bench.ts` in the repository being
   * measured, and `benchy` finds and runs it the way `vitest bench` does for a unit bench:
   *
   * ```ts
   * import { cpu, frame, gpu } from 'benchy';
   *
   * cpu('skeleton update, 64 bones', () => {
   *   skeleton.update(1 / 60);
   *   return skeleton.checksum();
   * });
   *
   * cpu('sort 10k', {
   *   variants: { old: { impl: 'old' }, new: { impl: 'new' } },
   *   run({ impl }) {
   *     return impl === 'old' ? sortOld(data) : sortNew(data);
   *   },
   * });
   *
   * frame('256 skinned foxes', {
   *   variants: { c256: { count: 256 }, c1024: { count: 1024 } },
   *   create({ view }, { count }) {
   *     return { update(dt) {}, destroy() {} };
   *   },
   * });
   *
   * gpu('pbr, 8 lights', { create({ view }) {} });
   * ```
   *
   * `cpu()` times a function in Node (through `@pmndrs/labs`), `frame()` times a scene's frames in a real browser,
   * and `gpu()` times the GPU work of one static frame of a scene. Each call only declares a bench: `benchy` reads
   * the names, the variants and the other literal fields out of the source without running it, then runs the file
   * where each kind runs. This module keeps what the calls declared for that runner, and imports nothing, so a
   * repository type-checks its bench files against this file alone: `benchy init` copies it there as an ambient module.
   */
  /** A knob's value: what a variant sets, and what `create` is handed. */
  export type KnobValue = string | number | boolean;
  export type Knobs = Record<string, KnobValue>;
  /** Named variants of a bench, `{ name: { knob: value } }`, the first the baseline the others are compared with. */
  export type Variants<K extends Knobs> = Record<string, K>;
  /**
   * A seeded stream, the same numbers in every run and on every build, which is what lets two arms draw the same
   * scene. Lay a scene out with it, never with `Math.random`.
   */
  export interface Rng {
    next(): number;
    range(min: number, max: number): number;
    int(maxExclusive: number): number;
    /** A uniform random unit vector, written into `out` at `at`. */
    unit(out: Float32Array | number[], at?: number): void;
  }
  /** One model `benchy assets` downloaded, where the page serves it and how big it is. */
  export interface Asset {
    url: string;
    bounds: {
      min: number[];
      max: number[];
    };
    /** The extent with the node transforms applied; null for a model whose meshes are all skinned. */
    worldBounds: {
      min: number[];
      max: number[];
    } | null;
  }
  /**
   * What every engine's stage carries besides its own handles. The canvas is 1920×1080 device pixels for every
   * scene, at resolution 1, ACES tone mapping and exposure 1, an opaque clear and a depth buffer.
   */
  export type FrameContext = {
    readonly width: number;
    readonly height: number;
    readonly backend: 'webgpu' | 'webgl2';
    /** Whether the canvas is multisampled: `--msaa 4` or `--msaa 1`, and on by default. */
    readonly antialias: boolean;
    /** The variant this run measures. */
    readonly variant: string;
    readonly rng: Rng;
    /** A model from `benchy assets`' manifest, by name (`'Sponza'`, `'Fox'`). */
    asset(name: string): Promise<Asset>;
  };
  /**
   * The engine's own objects, which only the engine's types describe; the tool's docs/authoring.md ("What `create`
   * receives") lists each engine's. Name the handles a bench uses in its `create` parameter with the engine's types,
   * `FrameStage<{ view: View3D }>`.
   */
  export type EngineHandles = {
    readonly [handle: string]: unknown;
  };
  /** What `create` is handed first: the engine's handles and the run's own fields, in one object. */
  export type FrameStage<Handles extends object = EngineHandles> = Handles & FrameContext;
  /**
   * What a frame bench's `create` returns: the scene's work per frame and the release of what it made. The loop
   * steps the scene at a fixed 60 Hz, `simulate(seconds)` then `update(1 / 60)` then the engine's render.
   */
  export interface FrameScene {
    /**
     * The scene's own arithmetic for the frame at `seconds`: untimed. `seconds` is the frame's place in a pass, n / 60
     * for its nth frame: the warmup starts at 0 and the window replays the pass (the bench's `duration`) from 0 in
     * whole repeats, so every arm measures the same frames however fast it runs. What `update` steps is not on this
     * clock: it advances with every frame rendered, warmup included.
     */
    simulate?(seconds: number): void;
    /** The scene's calls into the engine before it renders, and nothing it could have computed in `simulate`: timed as `cpu.update`. */
    update?(dt: number): void;
    /** Releases what `create` made that the stage does not own. The stage destroys its own objects and the renderer. */
    destroy?(): void;
  }
  /** The metrics a frame bench's verdict may rest on. All five of a frame's numbers are reported either way. */
  export type FrameMetric = 'cpu.frame' | 'cpu.render' | 'cpu.update' | 'gpu.frame';
  /** The fields a frame or gpu bench shares. Everything but `options` and `create` is read without running the file, so it is written out as literals. */
  interface SceneBench<K extends Knobs, Handles extends object, Made> {
    /** Named knob values, the first the baseline. Every variant names the same knobs. Without it the bench has one variant, `default`. */
    variants?: Variants<K>;
    /**
     * How far one variant's frame on two engine trees may differ before the verdict is `output-changed`: `'warn'`
     * (the default) reports a difference over 0.1 % of pixels and keeps the speed reading, `'strict'` refuses it.
     */
    gate?: 'warn' | 'strict';
    /** The backends the bench runs on, both unless it says; on another one it is listed as skipped, with no run. */
    backends?: ('webgpu' | 'webgl2')[];
    /**
     * Seconds of scene time one pass of the window covers, a whole number of 60 Hz frames: the window replays
     * `simulate` from 0 s to here in whole repeats. Without it a pass is the session's window of frames, 4 s on a
     * desktop and 2 s on a phone. Set it to a camera path's period so the window measures the whole path; two files
     * paired by `--vs` have to declare the same.
     */
    duration?: number;
    /**
     * Whether the canvas is multisampled when the command line does not say (`--msaa 1|4` overrides it): on unless
     * the bench says `false`. The stage reports what was used as `antialias`.
     */
    antialias?: boolean;
    /** What the engine's stage takes at construction besides the fairness settings, listed per engine in the tool's docs/authoring.md. */
    options?: Record<string, unknown>;
    /** Fills the stage before the first frame; it may be async. */
    create(stage: FrameStage<Handles>, knobs: K): Made | void | Promise<Made | void>;
  }
  /** A scene timed frame by frame: `cpu.update`, `cpu.render`, `cpu.frame`, `gpu.frame` and `cpu.interval`. */
  export interface FrameBench<K extends Knobs = Knobs, Handles extends object = EngineHandles> extends SceneBench<
    K,
    Handles,
    FrameScene
  > {
    /** The metric the verdict rests on, `cpu.frame` unless the question is narrower. */
    primary?: FrameMetric;
  }
  /** What a gpu bench's `create` returns: the release of what it made. The frame never changes. */
  export interface GpuScene {
    destroy?(): void;
  }
  /** A scene drawn as the same static frame again and again, judged on `gpu.frame`: the engine's GPU work alone. */
  export type GpuBench<K extends Knobs = Knobs, Handles extends object = EngineHandles> = SceneBench<
    K,
    Handles,
    GpuScene
  >;
  /** What the yielded object of a generator bench may carry: the timed function and what to snapshot after it. */
  export interface CpuTimed {
    bench: () => unknown;
    /** The output compared across arms, taken after measuring; without it, the generator's return value. */
    snapshot?: () => unknown;
  }
  /**
   * A cpu bench: a function timed as it is, whose first return value is the snapshot compared across arms, or
   * labs' generator form, where the code before the `yield` is setup, the yielded function (or `{ bench, snapshot }`)
   * is timed, and the code after it is teardown.
   */
  export type CpuBench = (() => unknown) | CpuGenerator;
  /** Labs' generator form of a cpu bench. */
  export type CpuGenerator = () => Generator<(() => unknown) | CpuTimed, unknown, unknown>;
  /**
   * Whether a cpu bench's variants return one output. `'same'`, the default, is two implementations of one job: a
   * variant whose snapshot is not the first variant's is `output-changed`. `'differs'` is a sweep, variants that do
   * different work by design, whose outputs are not compared with each other. One variant on two trees is compared
   * either way.
   */
  export type CpuOutput = 'same' | 'differs';
  /**
   * A cpu bench with variants. Everything but `run` is read without running the file, so it is written out as
   * literals.
   */
  export interface CpuVariantsBench<K extends Knobs> {
    /** Named knob values, the first the baseline. Every variant names the same knobs. Without it the bench has one variant, `default`. */
    variants?: Variants<K>;
    output?: CpuOutput;
    /**
     * The bench, handed the variant's knobs, in either form a cpu bench takes: a function timed as it is, called with
     * the knobs, or labs' generator form. Each variant runs in processes of its own.
     */
    run: ((knobs: K) => unknown) | ((knobs: K) => Generator<(() => unknown) | CpuTimed, unknown, unknown>);
  }
  /** One call, as the runner reads it back. */
  export type Declared =
    | {
        kind: 'cpu';
        name: string;
        bench: CpuBench | CpuVariantsBench<Knobs>;
      }
    | {
        kind: 'frame';
        name: string;
        bench: FrameBench<Knobs, object>;
      }
    | {
        kind: 'gpu';
        name: string;
        bench: GpuBench<Knobs, object>;
      };
  /** Takes what the files imported since the last call declared, in the order they declared it. */
  export function takeDeclared(): Declared[];
  /**
   * Declares a function timed in Node: in fresh processes, a garbage collection before each sample, interleaved
   * blocks. Two implementations of one job are two variants of one bench, each judged against the first.
   */
  export function cpu<K extends Knobs>(name: string, bench: CpuVariantsBench<K>): void;
  export function cpu(name: string, bench: CpuGenerator): void;
  export function cpu(name: string, bench: () => unknown): void;
  /** Declares a scene timed frame by frame in a real browser. */
  export function frame<K extends Knobs, Handles extends object = EngineHandles>(
    name: string,
    bench: FrameBench<K, Handles>,
  ): void;
  /** Declares a static scene whose GPU time per frame is the question: a shader, a pass, a material. */
  export function gpu<K extends Knobs, Handles extends object = EngineHandles>(
    name: string,
    bench: GpuBench<K, Handles>,
  ): void;
}
