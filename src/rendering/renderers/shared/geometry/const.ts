import { deprecation, v8_0_0 } from '../../../../utils/logging/deprecation';

/**
 * The different topology types supported by the renderer used to describe how the geometry should be renderer
 * @memberof rendering
 */
export type Topology =
    'point-list'
    | 'line-list'
    | 'line-strip'
    | 'triangle-list'
    | 'triangle-strip';

const DEPRECATED_DRAW_MODES = {
    POINTS: 'point-list',
    LINES: 'line-list',
    LINE_STRIP: 'line-strip',
    TRIANGLES: 'triangle-list',
    TRIANGLE_STRIP: 'triangle-strip',
};

/** @deprecated since 8.0.0 */
export const DRAW_MODES = new Proxy(DEPRECATED_DRAW_MODES, {
    get(target, prop: keyof typeof DEPRECATED_DRAW_MODES)
    {
        // #if _DEBUG
        deprecation(v8_0_0, `DRAW_MODES.${prop} is deprecated, use '${DEPRECATED_DRAW_MODES[prop]}' instead`);
        // #endif

        return target[prop];
    },
});

/**
 * The different types of vertex formats supported by the renderer
 * @memberof rendering
 */
export type VertexFormat =
    | 'uint8x2'
    | 'uint8x4'
    | 'sint8x2'
    | 'sint8x4'
    | 'unorm8x2'
    | 'unorm8x4'
    | 'snorm8x2'
    | 'snorm8x4'
    | 'uint16x2'
    | 'uint16x4'
    | 'sint16x2'
    | 'sint16x4'
    | 'unorm16x2'
    | 'unorm16x4'
    | 'snorm16x2'
    | 'snorm16x4'
    | 'float16x2'
    | 'float16x4'
    | 'float32'
    | 'float32x2'
    | 'float32x3'
    | 'float32x4'
    | 'uint32'
    | 'uint32x2'
    | 'uint32x3'
    | 'uint32x4'
    | 'sint32'
    | 'sint32x2'
    | 'sint32x3'
    | 'sint32x4';

