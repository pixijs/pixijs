# Video textures

Video through `Assets.load`: `VideoSourceOptions` defaults, autoplay and sound, manual playback, upload rate, and CORS.

```ts
import { Assets, Sprite, type Texture, type VideoSource } from "pixi.js";

const texture = await Assets.load<Texture>({
  src: "city.mp4",
  data: { autoPlay: false, loop: true, preload: true, updateFPS: 30 },
});
const sprite = new Sprite(texture);

const video = (texture.source as VideoSource).resource;
video.play();
```

The result is a regular `Texture` wrapping a `VideoSource`; the sprite shows the current frame without any `update()` calls. Control playback (`play()`, `pause()`, `currentTime`, `paused`) on `texture.source.resource`, the `HTMLVideoElement`. List formats for fallback (`clip.{webm,mp4}`). An extension-less URL needs `parser: "video"` and `data: { mime: "video/mp4" }` ([assets](../assets.md#forcing-a-parser-with-parser)).

`data` takes `VideoSourceOptions`; defaults come from `VideoSource.defaultOptions`:

| Option        | Default                | Purpose |
| ------------- | ---------------------- | ------- |
| `autoLoad`    | `true`                 | Start downloading as soon as it's assigned |
| `autoPlay`    | `true`                 | Start playing once `canplay` fires |
| `loop`        | `false`                | Restart at the end |
| `muted`       | `true`                 | Required for autoplay on most browsers |
| `playsinline` | `true`                 | Prevents iOS fullscreen takeover |
| `preload`     | `false`                | Await `canplaythrough` before resolving, so the first frame is uploaded before `play()` |
| `updateFPS`   | `0`                    | Texture re-upload rate; `0` re-uploads every render frame, `15` caps it at 15 per second for static-ish backgrounds |
| `crossorigin` | `true`                 | CORS mode for cross-origin URLs |
| `alphaMode`   | auto-detected          | `'no-premultiply-alpha'` for straight alpha |
| `mime`        | derived from extension | Force a MIME type when the URL lacks an extension |

## Sound and autoplay

```ts
import { Assets, type Container, type Texture, type VideoSource } from "pixi.js";

declare const playButton: Container;

const texture = await Assets.load<Texture>("intro.mp4");
const video = (texture.source as VideoSource).resource;

playButton.on("pointertap", () => {
  video.muted = false;
  video.currentTime = 0;
});
```

Browsers autoplay only muted video, and iOS only inline video, which is why `muted` and `playsinline` default to `true`. With `data: { muted: false }`, the autoplay `play()` call is blocked until the user has interacted with the page: the promise from `Assets.load` still resolves, the rejection is unhandled, and the video sits on its first frame. Keep it muted and unmute (or call `video.play()`) inside a pointer or key handler. `playsinline: false` lets iOS take the video fullscreen.

## CORS

WebGL cannot upload a cross-origin video unless the server sends `Access-Control-Allow-Origin`; the default `crossorigin: true` requests it in CORS mode. `data: { crossorigin: false }` is not a workaround: the load resolves, but every render throws "texImage2D ... The video element contains cross-origin data" and the sprite draws nothing. Serve the video with CORS headers or from the page's origin.
