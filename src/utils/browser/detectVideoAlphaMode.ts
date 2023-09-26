import type { ALPHA_MODES } from '../../rendering/renderers/shared/texture/const';

let promise: Promise<ALPHA_MODES> | undefined;

/**
 * Helper for detecting the correct alpha mode for video textures.
 * For some reason, some browsers/devices/WebGL implementations premultiply the alpha
 * of a video before and then a second time if `UNPACK_PREMULTIPLY_ALPHA_WEBGL`
 * is true. So the video is premultiplied twice if the alpha mode is `UNPACK`.
 * In this case we need the alpha mode to be `PMA`. This function detects
 * the upload behavior by uploading a white 2x2 webm with 50% alpha
 * without `UNPACK_PREMULTIPLY_ALPHA_WEBGL` and then checking whether
 * the uploaded pixels are premultiplied.
 * @memberof utils
 * @function detectVideoAlphaMode
 * @returns {Promise<ALPHA_MODES>} The correct alpha mode for video textures.
 */
export async function detectVideoAlphaMode(): Promise<ALPHA_MODES>
{
    promise ??= (async () =>
    {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl');

        if (!gl)
        {
            return 'premultiply-alpha-on-upload';
        }

        const video = await new Promise<HTMLVideoElement | null>((resolve) =>
        {
            const video = document.createElement('video');

            video.onloadeddata = () => resolve(video);
            video.onerror = () => resolve(null);
            video.autoplay = false;
            video.crossOrigin = 'anonymous';
            video.preload = 'auto';
            // eslint-disable-next-line max-len
            video.src = 'data:video/webm;base64,GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQJChYECGFOAZwEAAAAAAAHTEU2bdLpNu4tTq4QVSalmU6yBoU27i1OrhBZUrmtTrIHGTbuMU6uEElTDZ1OsggEXTbuMU6uEHFO7a1OsggG97AEAAAAAAABZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVSalmoCrXsYMPQkBNgIRMYXZmV0GETGF2ZkSJiEBEAAAAAAAAFlSua8yuAQAAAAAAAEPXgQFzxYgAAAAAAAAAAZyBACK1nIN1bmSIgQCGhVZfVlA5g4EBI+ODhAJiWgDglLCBArqBApqBAlPAgQFVsIRVuYEBElTDZ9Vzc9JjwItjxYgAAAAAAAAAAWfInEWjh0VOQ09ERVJEh49MYXZjIGxpYnZweC12cDlnyKJFo4hEVVJBVElPTkSHlDAwOjAwOjAwLjA0MDAwMDAwMAAAH0O2dcfngQCgwqGggQAAAIJJg0IAABAAFgA4JBwYSgAAICAAEb///4r+AAB1oZ2mm+6BAaWWgkmDQgAAEAAWADgkHBhKAAAgIABIQBxTu2uRu4+zgQC3iveBAfGCAXHwgQM=';
            video.load();
        });

        if (!video)
        {
            return 'premultiply-alpha-on-upload';
        }

        const texture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, texture);

        const framebuffer = gl.createFramebuffer();

        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D,
            texture,
            0
        );

        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);

        const pixel = new Uint8Array(4);

        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

        gl.deleteFramebuffer(framebuffer);
        gl.deleteTexture(texture);
        gl.getExtension('WEBGL_lose_context')?.loseContext();

        return pixel[0] <= pixel[3] ? 'premultiplied-alpha' : 'premultiply-alpha-on-upload';
    })();

    return promise;
}
