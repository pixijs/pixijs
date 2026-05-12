# Video Textures

PixiJS loads videos through `Assets.load()` and returns a regular `Texture`. Pass the texture to a `Sprite` and it paints the current video frame each render. Use video textures for backgrounds, cutscenes, or any animated surface driven by a video source.

Supported extensions: `.mp4`, `.m4v`, `.webm`, `.ogg`, `.ogv`, `.h264`, `.avi`, `.mov`. Browser support varies; always provide a fallback format.

## Quick Start

```ts
const videoTex = await Assets.load("intro.mp4");
const sprite = new Sprite(videoTex);
app.stage.addChild(sprite);
```

The returned texture wraps a `VideoSource`. The video starts playing automatically unless you set `autoPlay: false` in the `data` options.

## Core Patterns

### Load options via `data`

```ts
const texture = await Assets.load({
  src: "city.mp4",
  data: {
    autoPlay: false,
    loop: true,
    muted: true,
    preload: true,
    playsinline: true,
    updateFPS: 30,
    alphaMode: "premultiply-alpha-on-upload",
  },
});
```

`data` accepts `VideoSourceOptions` fields. Defaults come from `VideoSource.defaultOptions`.

| Option        | Default                | Purpose                                                    |
| ------------- | ---------------------- | ---------------------------------------------------------- |
| `autoLoad`    | `true`                 | Start downloading the video as soon as it's assigned       |
| `autoPlay`    | `true`                 | Start playing once `canplay` fires                         |
| `loop`        | `false`                | Restart at the end                                         |
| `muted`       | `true`                 | Required for autoplay on most browsers                     |
| `playsinline` | `true`                 | Prevents iOS fullscreen takeover                           |
| `preload`     | `false`                | Await `canplaythrough` before resolving                    |
| `updateFPS`   | `0`                    | Texture update rate. `0` updates every render frame        |
| `crossorigin` | `true`                 | CORS mode for cross-origin URLs                            |
| `alphaMode`   | auto-detected          | `'no-premultiply-alpha'` for straight alpha                |
| `mime`        | derived from extension | Force a specific MIME type when the URL lacks an extension |

### Format fallback

```ts
Assets.add({
  alias: "clip",
  src: "clip.{webm,mp4}",
});

const texture = await Assets.load("clip");
```

List multiple formats so the resolver picks the first one the browser supports. WebM and MP4 together cover all current browsers.

### Mobile autoplay

```ts
const texture = await Assets.load({
  src: "ad.mp4",
  data: {
    muted: true,
    playsinline: true,
    autoPlay: true,
  },
});
```

iOS and mobile Chrome only autoplay muted, inline video. Set both `muted: true` and `playsinline: true` or playback stalls on the first frame until the user taps.

### Manual playback control

```ts
const texture = await Assets.load({
  src: "boss-fight.mp4",
  data: { autoPlay: false, preload: true },
});

const videoSource = texture.source as VideoSource;

startButton.on("pointertap", () => {
  videoSource.resource.play();
});
```

With `autoPlay: false`, grab the underlying `VideoSource` from `texture.source` and call `.play()`, `.pause()`, or `.currentTime =` on its `resource` (the `HTMLVideoElement`). Pair with `preload: true` to guarantee the first frame is uploaded before you call `play()`.

### Updating at a fixed rate

```ts
await Assets.load({
  src: "background.mp4",
  data: { updateFPS: 15 },
});
```

`updateFPS` caps how often the GPU texture re-uploads from the video element. `0` re-uploads every render tick (smoothest; highest cost). `15` caps it to 15 uploads per second, which saves bandwidth on static-ish video backgrounds.

## Forcing the video parser

If your video URL lacks an extension (e.g., a CDN signed URL or a blob), the loader can't pick a parser by test. Force it with the top-level `parser` field:

```ts
const texture = await Assets.load({
  src: "https://cdn.example.com/stream/abc123",
  parser: "video",
  data: { mime: "video/mp4" },
});
```

See the main `SKILL.md` section on "Forcing a parser with `parser`" for the full list of parser IDs.

## Common Mistakes

### [HIGH] Autoplay without mute on mobile

Wrong:

```ts
await Assets.load({ src: "ad.mp4", data: { autoPlay: true } });
```

Correct:

```ts
await Assets.load({
  src: "ad.mp4",
  data: { autoPlay: true, muted: true, playsinline: true },
});
```

Mobile browsers block autoplay with sound. The promise resolves, but the video stays frozen on frame 0 until the user interacts.


### [MEDIUM] Expecting sprite.texture to update itself

The `Sprite` reflects the current video frame automatically because `VideoSource` re-uploads on every render. You don't need to call `update()` yourself. If playback looks frozen, check that the underlying video element is actually playing (`videoSource.resource.paused` should be `false`).


### [MEDIUM] Missing CORS for cross-origin video

Video served from another origin without `Access-Control-Allow-Origin` headers taints the canvas and most WebGL operations (`readPixels`, snapshots) fail silently. Either serve with CORS headers or pass `data: { crossorigin: false }` and accept that the texture can't be extracted.


## API Reference

- [VideoSource](https://pixijs.download/release/docs/rendering.VideoSource.html.md)
- [VideoSourceOptions](https://pixijs.download/release/docs/rendering.VideoSourceOptions.html.md)
- [loadVideoTextures](https://pixijs.download/release/docs/assets.loadVideoTextures.html.md)
- [Assets](https://pixijs.download/release/docs/assets.Assets.html.md)
