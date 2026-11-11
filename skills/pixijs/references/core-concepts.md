# core-concepts

How PixiJS v8 gets pixels on screen: choosing WebGL/WebGPU/Canvas, `renderer.render()` and render targets, baking containers into textures, and context loss. Details live in [renderers](core-concepts/renderers.md).

`app.renderer` is the `WebGLRenderer`, `WebGPURenderer`, or `CanvasRenderer` chosen by `autoDetectRenderer` inside `app.init({ preference })`; it is `undefined` until `init()` resolves ([application](application.md)). The `TickerPlugin` calls `app.render()` every frame; the frame order, priorities and manual loops are in [ticker](ticker.md).

- **Choosing between WebGL and WebGPU?** Leave `preference` unset (WebGL first) for production; WebGPU is still experimental. Preference forms, fallbacks and what the Canvas renderer skips: [renderers](core-concepts/renderers.md#preference-forms).
- **Rendering into a texture or a custom render target?** Pass `target` to `renderer.render()`, or build a `RenderTarget` with explicit color and depth attachments: [renderers](core-concepts/renderers.md#render-targets).
- **Baking a container into a texture?** `renderer.generateTexture(container)` or `generateTexture({ target, frame: new Rectangle(...), resolution })`; its local-space capture and the `frame` rules: [renderers](core-concepts/renderers.md#generating-a-texture-from-a-container).
- **Code-splitting backend-specific systems and pipes?** Renderer loader extensions (`WebGLLoader`, `WebGPULoader`, `CanvasLoader`): [renderers](core-concepts/renderers.md#lazy-loading-backend-specific-systems-and-pipes).
- **Mixing PixiJS with Three.js or another GPU library, or recovering from context loss?** [renderers](core-concepts/renderers.md#interop-with-other-gpu-libraries).
- **Running in a Web Worker, Node, or under strict CSP?** [environments](environments.md).
- **Writing a custom renderable?** Implement a `RenderPipe` and register it via extensions: [custom-rendering](custom-rendering.md).
