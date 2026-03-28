declare module 'tess2'
{
    interface TessResult
    {
        vertices: number[];
        vertexIndices: number[];
        vertexCount: number;
        elements: number[];
        elementCount: number;
        mesh: unknown;
    }

    interface TessOptions
    {
        contours: number[][];
        windingRule?: number;
        elementType?: number;
        polySize?: number;
        vertexSize?: number;
        normal?: number[];
    }

    interface Tess2Static
    {
        WINDING_ODD: number;
        WINDING_NONZERO: number;
        WINDING_POSITIVE: number;
        WINDING_NEGATIVE: number;
        WINDING_ABS_GEQ_TWO: number;
        POLYGONS: number;
        CONNECTED_POLYGONS: number;
        BOUNDARY_CONTOURS: number;
        tesselate(opts: TessOptions): TessResult;
    }

    const Tess2: Tess2Static;

    export default Tess2;
}
