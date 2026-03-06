/** @internal */
export const mSDFBit = {
    name: 'msdf-bit',
    fragment: {
        header: /* wgsl */`
            fn calculateMSDFAlpha(msdfColor:vec4<f32>, shapeColor:vec4<f32>, distance:f32) -> f32 {

                // MSDF
                var median = msdfColor.r + msdfColor.g + msdfColor.b -
                    min(msdfColor.r, min(msdfColor.g, msdfColor.b)) -
                    max(msdfColor.r, max(msdfColor.g, msdfColor.b));

                // SDF
                median = min(median, msdfColor.a);

                // Clamp distance to at least 1.0 to prevent overly soft edges
                // at small scales (zoomed out), matching the msdf-atlas-gen
                // reference: max(screenPxRange, 1.0)
                var clampedDistance = max(distance, 1.0);

                var screenPxDistance = clampedDistance * (median - 0.5);
                var alpha = clamp(screenPxDistance + 0.5, 0.0, 1.0);
                if (median < 0.01) {
                    alpha = 0.0;
                } else if (median > 0.99) {
                    alpha = 1.0;
                }

                // Note: do NOT multiply by shapeColor.a here. The shader
                // template already applies vColor (which carries the user's
                // alpha) via: finalColor = outColor * vColor.
                // Including shapeColor.a here would square the alpha.
                return alpha;

            }
        `,
    }

};

/** @internal */
export const mSDFBitGl = {
    name: 'msdf-bit',
    fragment: {
        header: /* glsl */`
            float calculateMSDFAlpha(vec4 msdfColor, vec4 shapeColor, float distance) {

                // MSDF
                float median = msdfColor.r + msdfColor.g + msdfColor.b -
                                min(msdfColor.r, min(msdfColor.g, msdfColor.b)) -
                                max(msdfColor.r, max(msdfColor.g, msdfColor.b));

                // SDF
                median = min(median, msdfColor.a);

                // Clamp distance to at least 1.0 to prevent overly soft edges
                // at small scales (zoomed out), matching the msdf-atlas-gen
                // reference: max(screenPxRange, 1.0)
                float clampedDistance = max(distance, 1.0);

                float screenPxDistance = clampedDistance * (median - 0.5);
                float alpha = clamp(screenPxDistance + 0.5, 0.0, 1.0);

                if (median < 0.01) {
                    alpha = 0.0;
                } else if (median > 0.99) {
                    alpha = 1.0;
                }

                // Note: do NOT multiply by shapeColor.a here. The shader
                // template already applies vColor (which carries the user's
                // alpha) via: finalColor = outColor * vColor.
                // Including shapeColor.a here would square the alpha.
                return alpha;
            }
        `,
    }

};
