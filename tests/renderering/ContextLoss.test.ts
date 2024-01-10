describe('Context Lose', () =>
{
    // it('calling forceContextLoss should reset context', async () =>
    // {
    //     const render = await getWebGLRenderer();

    //     const success = await new Promise((resolve) =>
    //     {
    //         render.view.canvas.addEventListener('webglcontextlost', () =>
    //         {
    //             resolve(true);
    //         });

    //         // this can take a moment to execute, so wrapping into a promise
    //         render.context.forceContextLoss();
    //     });

    //     expect(success).toEqual(true);
    // });

    // it('should null systems that hold things created by the lost context', async () =>
    // {
    //     const checkObjectHasEntries = (obj: Record<string, any>): void =>
    //     {
    //         expect(Object.keys(obj).length).toBeGreaterThan(0);
    //     };

    //     const checkObjectIsEmpty = (obj: Record<string, any>): void =>
    //     {
    //         expect(Object.keys(obj).length).toEqual(0);
    //     };

    //     const render = await getWebGLRenderer();

    //     const sprite = new Sprite(Texture.WHITE);

    //     render.render(sprite);

    //     checkObjectHasEntries(render.buffer['_gpuBuffers']);

    //     checkObjectHasEntries(render.geometry['_geometryVaoHash']);
    //     expect(render.geometry['_activeGeometry']).not.toBeNull();
    //     expect(render.geometry['_activeVao']).not.toBeNull();

    //     checkObjectHasEntries(render.shader['_programDataHash']);
    //     expect(render.shader['_activeProgram']).not.toBeNull();

    //     checkObjectHasEntries(render.texture['_glTextures']);

    //     checkObjectHasEntries(render.renderTarget['_gpuRenderTargetHash']);

    //     const success = await new Promise((resolve) =>
    //     {
    //         render.view.canvas.addEventListener('webglcontextrestored', () =>
    //         {
    //             resolve(true);
    //         });

    //         // this can take a moment to execute, so wrapping into a promise
    //         render.context.forceContextLoss();
    //     });

    //     expect(success).toEqual(true);

    //     checkObjectIsEmpty(render.buffer['_gpuBuffers']);

    //     checkObjectIsEmpty(render.geometry['_geometryVaoHash']);

    //     expect(render.geometry['_activeGeometry']).toBeNull();

    //     expect(render.geometry['_activeVao']).toBeNull();

    //     checkObjectIsEmpty(render.shader['_programDataHash']);

    //     expect(render.shader['_activeProgram']).toBeNull();

    //     // this is one as we have bound an empty texture..
    //     expect(Object.keys(render.texture['_glTextures']).length).toEqual(1);

    //     checkObjectIsEmpty(render.renderTarget['_gpuRenderTargetHash']);
    // });
});
