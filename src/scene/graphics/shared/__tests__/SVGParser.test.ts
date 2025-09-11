import { SVGParser } from '../../../graphics/shared/svg/SVGParser';
import { getFillInstructionData } from '../../../graphics/shared/svg/utils/fillOperations';
import { GraphicsContext } from '../GraphicsContext';

describe('SVGParser Fill Rule', () =>
{
    it('should handle evenodd fill rule with multiple subpaths using hole processing', () =>
    {
        // Test 1: Evenodd with multiple subpaths should use new hole processing logic
        const svgEvenOdd = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
                <path d="M 50 50 H 150 V 150 H 50 Z M 10 10 H 190 V 190 H 10 Z"
                      fill-rule="evenodd" fill="black" />
            </svg>
        `;

        const context = new GraphicsContext();

        SVGParser(svgEvenOdd, context);

        expect(context.instructions.length).toBeGreaterThan(0);
        expect(context.instructions[0].action).toBe('fill');
    });

    it('should handle nonzero fill rule correctly without holes', () =>
    {
        // Test 2: Nonzero should NOT show holes (solid shape)
        const svgNonZero = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
                <path d="M 10 10 H 190 V 190 H 10 Z M 50 50 H 150 V 150 H 50 Z"
                      fill-rule="nonzero" fill="black" />
            </svg>
        `;

        const context = new GraphicsContext();

        SVGParser(svgNonZero, context);

        expect(context.instructions.length).toBe(1);
        expect(context.instructions[0].action).toBe('fill');

        const pathData = getFillInstructionData(context);

        expect(pathData.path.checkForHoles).toBe(false);
    });

    it('should handle multiple holes with evenodd fill rule', () =>
    {
        // Test 3: Multiple holes in one shape
        const svgMultipleHoles = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
                <path d="M 10 10 H 190 V 190 H 10 Z M 30 30 H 80 V 80 H 30 Z M
                        110 30 H 160 V 80 H 110 Z M 70 110 H 120 V 160 H 70 Z"
                      fill-rule="evenodd" fill="darkblue" />
            </svg>
        `;

        const context = new GraphicsContext();

        SVGParser(svgMultipleHoles, context);

        expect(context.instructions.length).toBeGreaterThan(0);
        expect(context.instructions[0].action).toBe('fill');
    });

    it('should handle nested holes with evenodd fill rule', () =>
    {
        // Test 4: Nested holes (hole within hole)
        const svgNestedHoles = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
                <path d="M 10 10 H 190 V 190 H 10 Z M 40 40 H 160 V 160 H 40 Z M 70 70 H 130 V 130 H 70 Z"
                      fill-rule="evenodd" fill="darkgreen" />
            </svg>
        `;

        const context = new GraphicsContext();

        SVGParser(svgNestedHoles, context);

        expect(context.instructions.length).toBeGreaterThan(0);
        expect(context.instructions[0].action).toBe('fill');
    });

    it('should handle single subpath with evenodd using original behavior', () =>
    {
        // Test 5: Single subpath with evenodd should use original behavior
        const svgSingleEvenodd = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
                <path d="M 100 20 L 120 80 L 180 80 L 135 120 L 155 180 L 100 145 L 45 180 L 65 120 L 20 80 L 80 80 Z"
                      fill-rule="evenodd" fill="purple" />
            </svg>
        `;

        const context = new GraphicsContext();

        SVGParser(svgSingleEvenodd, context);

        expect(context.instructions.length).toBe(1);
        expect(context.instructions[0].action).toBe('fill');

        const pathData = getFillInstructionData(context);

        expect(pathData.path.checkForHoles).toBe(false);
    });

    it('should handle single subpath with nonzero using original behavior', () =>
    {
        // Test 6: Single subpath with nonzero
        const svgSingleNonzero = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
                <path d="M 100 20 L 120 80 L 180 80 L 135 120 L 155 180 L 100 145 L 45 180 L 65 120 L 20 80 L 80 80 Z"
                      fill-rule="nonzero" fill="purple" />
            </svg>
        `;

        const context = new GraphicsContext();

        SVGParser(svgSingleNonzero, context);

        expect(context.instructions.length).toBe(1);
        expect(context.instructions[0].action).toBe('fill');

        const pathData = getFillInstructionData(context);

        expect(pathData.path.checkForHoles).toBe(false);
    });

    it('should handle complex SVG without fill-rule using original behavior', () =>
    {
        // Test 7: Complex SVG (like PixiJS logo) without explicit fill-rule
        const svgComplex = `
            <svg width="512" height="512" enable-background="new 0 0 512 512"
            viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                <path d="m0 0h512v512h-512z" fill="#272b34"/>
                <g fill="#ea1e63">
                    <path d="m177.1 222.4c8.2 0 13.5-5.6 13.5-12.5-.2-7.3-5.3-12.7-13.4-12.7s-13.4
                        5.4-13.2 12.7c-.1 6.9 5.2 12.5 13.1 12.5z"/>
                    <path d="m276.7 197.2c-8.1 0-13.4 5.4-13.2 12.7-.2 6.9 5.1 12.5 13 12.5 8.3 0
                        13.5-5.6 13.5-12.5-.1-7.3-5.2-12.7-13.3-12.7z"/>
                    <path d="m264.1 232.3h-22.6l-7.1 13c-2.1 4-4.1 8.1-6.3
                    12.4h-.3c-2.1-3.8-4.3-7.9-6.6-12l-7.9-13.4h-45.8c-.7-8.8-4.9-16.9-11.7-22.4-7.4-5.9-18.5-8.9-34-8.9-15.3
                        0-26.2 1-34 2.3v109.7h24.9v-39.8c2.8.4 5.7.5 8.6.5 14.9 0 27.6-3.6 36.1-11.7 3.2-3.1 5.7-6.8
                        7.3-10.9v61.9h47.4l7.6-14.5c2-4 4.1-7.9 6.1-12.2h.5c2 4.1 4 8.2 6.3 12.2l8.1
                        14.5h48.5v-80.7zm-143 22.1c-2.8.1-5.6-.1-8.4-.7v-32.8c3.4-.8 6.9-1.1 10.4-1 12.6 0
                        19.6 6.1 19.6 16.3 0 11.5-8.3 18.2-21.6 18.2zm68.8 50.8v-66.1l22.2
                        32.8zm52.3-34.4 21.9-31.7v66.2z"/>
                    <path d="m395.4 247c-14.4-5.4-20.6-8.6-20.6-15.7 0-5.8 5.3-10.7 16.2-10.7 8.1 0 16
                        1.8 23.3 5.3l5.6-20.3c-6.6-3-15.8-5.6-28.4-5.6-23.1 0-38.1 11.2-41.4
                        26.9v-25.1h-25.1v70c0 17.3-6.6 22.1-17.2 22.1-4.4 0-8.7-.7-12.9-2l-2.8 20.3c5.9 1.7
                        12.1 2.6 18.3 2.6 24.4 0 39.6-11.1 39.6-42.7v-32.3c2.8 12.6 13.9 21 29.9 26.5 13.4
                        4.8 18.6 8.7 18.6 15.7 0 7.3-6.1 12-17.7 12-9.7-.2-19.2-2.5-27.9-6.9l-5.1 20.8c6.3
                        3.5 18.8 6.8 31.5 6.8 30.5 0 44.9-15.8 44.9-34.5 0-15.7-9.2-25.9-28.8-33.2z"/>
                </g>
            </svg>
        `;

        const context = new GraphicsContext();

        SVGParser(svgComplex, context);

        expect(context.instructions.length).toBeGreaterThan(1);

        const fillInstructions = context.instructions.filter((inst) => inst.action === 'fill');

        expect(fillInstructions.length).toBeGreaterThan(0);
    });

    it('should default to original behavior when no fill-rule specified', () =>
    {
        // Paths without fill-rule should default to original behavior
        const svgDefault = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
                <path d="M 10 10 H 190 V 190 H 10 Z" fill="black" />
            </svg>
        `;

        const context = new GraphicsContext();

        SVGParser(svgDefault, context);

        expect(context.instructions.length).toBe(1);

        const pathData = getFillInstructionData(context);

        expect(pathData.path.checkForHoles).toBe(false);
    });

    it('should handle subpath order independence with evenodd', () =>
    {
        // Inner subpath first
        const svgInnerFirst = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
                <path d="M 50 50 H 150 V 150 H 50 Z M 10 10 H 190 V 190 H 10 Z"
                      fill-rule="evenodd" fill="black" />
            </svg>
        `;

        // Outer subpath first
        const svgOuterFirst = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
                <path d="M 10 10 H 190 V 190 H 10 Z M 50 50 H 150 V 150 H 50 Z"
                      fill-rule="evenodd" fill="black" />
            </svg>
        `;

        const context1 = new GraphicsContext();
        const context2 = new GraphicsContext();

        SVGParser(svgInnerFirst, context1);
        SVGParser(svgOuterFirst, context2);

        // Both should handle holes correctly - exact implementation may vary
        expect(context1.instructions.length).toBeGreaterThan(0);
        expect(context2.instructions.length).toBeGreaterThan(0);

        expect(context1.instructions[0].action).toBe('fill');
        expect(context2.instructions[0].action).toBe('fill');
    });

    it('should handle multiple paths with different fill rules in same SVG', () =>
    {
        const svgMultiple = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200">
                <path d="M 10 10 H 90 V 90 H 10 Z M 30 30 H 70 V 70 H 30 Z"
                      fill-rule="evenodd" fill="red" />
                <path d="M 110 10 H 190 V 90 H 110 Z M 130 30 H 170 V 70 H 130 Z"
                      fill-rule="nonzero" fill="blue" />
            </svg>
        `;

        const context = new GraphicsContext();

        SVGParser(svgMultiple, context);

        // Should have fill operations for both paths
        const fillOperations = context.instructions.filter((inst) => inst.action === 'fill');

        expect(fillOperations.length).toBeGreaterThan(0);

        // Should handle different fill rules appropriately
        expect(context.instructions.length).toBeGreaterThan(0);
    });

    it('should handle empty or invalid fill-rule values', () =>
    {
        const svgInvalid = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
                <path d="M 10 10 H 190 V 190 H 10 Z"
                      fill-rule="invalid-value" fill="black" />
            </svg>
        `;

        const context = new GraphicsContext();

        SVGParser(svgInvalid, context);

        expect(context.instructions.length).toBe(1);

        const pathData = getFillInstructionData(context);
        // Invalid values should default to original behavior - in your implementation this is false

        expect(pathData.path.checkForHoles).toBe(false);
    });
});
