/**
 * Cleans up what a test file leaves running once the file finishes: its WebGL contexts and its animation frame loops.
 *
 * jest-electron runs many test files in each window, so a renderer or application a test never destroys keeps its
 * context, and keeps rendering, for the rest of the run. Chromium allows 16 live contexts per window; past that it
 * drops the context that drew least recently, which can be a renderer the running test has just created, and that
 * test then fails on a null shader.
 */
type WebGLContext = WebGLRenderingContext | WebGL2RenderingContext;

interface Leftovers
{
    /** WebGL contexts created since the current test file started. */
    contexts: Set<WeakRef<WebGLContext>>;
    /** Counts finished test files, so frame callbacks a finished file scheduled don't run. */
    finishedFiles: number;
}

const windowGlobals = globalThis as typeof globalThis & { __testFileLeftovers?: Leftovers };

// Every test file runs this setup in the same window, so wrap the browser functions only once.
if (!windowGlobals.__testFileLeftovers)
{
    const leftovers: Leftovers = { contexts: new Set(), finishedFiles: 0 };

    for (const proto of [HTMLCanvasElement.prototype, OffscreenCanvas.prototype])
    {
        const getContext = proto.getContext as (this: unknown, ...args: unknown[]) => unknown;

        proto.getContext = function trackWebGLContext(this: unknown, ...args: unknown[])
        {
            const context = getContext.apply(this, args);

            if (context instanceof WebGLRenderingContext || context instanceof WebGL2RenderingContext)
            {
                leftovers.contexts.add(new WeakRef(context));
            }

            return context;
        } as typeof proto.getContext;
    }

    const requestAnimationFrame = window.requestAnimationFrame.bind(window);

    window.requestAnimationFrame = (callback) =>
    {
        const file = leftovers.finishedFiles;

        return requestAnimationFrame((time) =>
        {
            if (file === leftovers.finishedFiles) callback(time);
        });
    };

    windowGlobals.__testFileLeftovers = leftovers;
}

const leftovers = windowGlobals.__testFileLeftovers;

function lose(context: WebGLContext): void
{
    context.getExtension('WEBGL_lose_context')?.loseContext();
}

afterAll(() =>
{
    leftovers.finishedFiles++;

    for (const ref of leftovers.contexts)
    {
        const context = ref.deref();

        if (!context) continue;

        if (context.isContextLost())
        {
            // Chromium already dropped it and, because Pixi's handler allows a restore, brings it back once there's
            // room, so lose it again then.
            context.canvas.addEventListener('webglcontextrestored', () => lose(context), { once: true });
        }
        else
        {
            lose(context);
        }
    }

    leftovers.contexts.clear();
});
