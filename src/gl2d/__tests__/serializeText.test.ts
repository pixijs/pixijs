import '~/accessibility/init';
import '~/events/init';
import '~/rendering/init';
import { Gl2d } from '../Gl2d';
import { type Gl2dPixiTextNode } from '../types/pixi/PixiGl2dNodes';
import {
    type Gl2dPixiCanvasGradientResource,
    type Gl2dPixiCanvasPatternResource,
    type Gl2dPixiTextStyleResource,
    type Gl2dPixiWebFontResource,
} from '../types/pixi/PixiGl2dResources';
import '../init';
import { Cache } from '~/assets/cache/Cache';
import { type FontFaceCache } from '~/assets/loader/parsers/loadWebFont';
import { TextureSource } from '~/rendering/renderers/shared/texture/sources/TextureSource';
import { Texture } from '~/rendering/renderers/shared/texture/Texture';
import { Container } from '~/scene/container/Container';
import { FillGradient } from '~/scene/graphics/shared/fill/FillGradient';
import { FillPattern } from '~/scene/graphics/shared/fill/FillPattern';
import { Text } from '~/scene/text/Text';
import { TextStyle } from '~/scene/text/TextStyle';

function createTestTexture(options: { label?: string; width?: number; height?: number } = {}): Texture
{
    const source = new TextureSource({
        width: options.width ?? 64,
        height: options.height ?? 64,
        label: options.label ?? 'test-texture.png',
    });

    return new Texture({ source });
}

function mockWebFontCache(family: string, url: string): void
{
    const entry = {
        url,
        faces: [{
            weight: 'normal',
            style: 'normal',
            display: 'auto',
            stretch: 'normal',
            unicodeRange: 'U+0-10FFFF',
            featureSettings: 'normal',
        }] as unknown as FontFace[],
    };

    Cache.set<FontFaceCache>(`${family}-and-url`, { entries: [entry] });
}

describe('gl2d Text serialization', () =>
{
    afterEach(() =>
    {
        Cache.reset();
    });

    it('should serialize a basic Text node', () =>
    {
        const text = new Text({ text: 'Hello', style: { fontFamily: 'Arial', fontSize: 24 } });
        const file = Gl2d.serialize(text);

        expect(file.nodes).toHaveLength(1);

        const node = file.nodes[0] as Gl2dPixiTextNode;

        expect(node.type).toBe('text');
        expect(node.text).toBe('Hello');
        expect(node.uid).toBeDefined();
        expect(typeof node.style).toBe('number');
    });

    it('should serialize style as a text_style resource', () =>
    {
        const text = new Text({ text: 'Test', style: { fontFamily: 'Arial', fontSize: 32 } });
        const file = Gl2d.serialize(text);

        const node = file.nodes[0] as Gl2dPixiTextNode;
        const styleResource = file.resources[node.style] as Gl2dPixiTextStyleResource;

        expect(styleResource.type).toBe('text_style');
        expect(styleResource.fontFamily).toBe('Arial');
        expect(styleResource.fontSize).toBe(32);
    });

    it('should omit default style values', () =>
    {
        const text = new Text({ text: 'Test', style: { fontFamily: 'Arial' } });
        const file = Gl2d.serialize(text);

        const node = file.nodes[0] as Gl2dPixiTextNode;
        const styleResource = file.resources[node.style] as Gl2dPixiTextStyleResource;

        expect(styleResource.fontFamily).toBe('Arial');
        expect(styleResource.fontSize).toBeUndefined();
        expect(styleResource.fontStyle).toBeUndefined();
        expect(styleResource.fontVariant).toBeUndefined();
        expect(styleResource.fontWeight).toBeUndefined();
        expect(styleResource.fill).toBeUndefined();
        expect(styleResource.align).toBeUndefined();
        expect(styleResource.letterSpacing).toBeUndefined();
        expect(styleResource.padding).toBeUndefined();
        expect(styleResource.breakWords).toBeUndefined();
        expect(styleResource.whiteSpace).toBeUndefined();
    });

    it('should serialize non-default style values', () =>
    {
        const text = new Text({
            text: 'Styled',
            style: {
                fontFamily: 'Helvetica',
                fontSize: 48,
                fontStyle: 'italic',
                fontVariant: 'small-caps',
                fontWeight: 'bold',
                fill: 0xff0000,
                align: 'center',
                letterSpacing: 2,
                padding: 4,
                textBaseline: 'bottom',
                breakWords: true,
                whiteSpace: 'normal',
            },
        });

        const file = Gl2d.serialize(text);
        const node = file.nodes[0] as Gl2dPixiTextNode;
        const styleResource = file.resources[node.style] as Gl2dPixiTextStyleResource;

        expect(styleResource.fontFamily).toBe('Helvetica');
        expect(styleResource.fontSize).toBe(48);
        expect(styleResource.fontStyle).toBe('italic');
        expect(styleResource.fontVariant).toBe('small-caps');
        expect(styleResource.fontWeight).toBe('bold');
        expect(styleResource.fill).toBe('#ff0000');
        expect(styleResource.align).toBe('center');
        expect(styleResource.letterSpacing).toBe(2);
        expect(styleResource.padding).toBe(4);
        expect(styleResource.breakWords).toBe(true);
        expect(styleResource.whiteSpace).toBe('normal');
    });

    it('should omit fill when it is the default #000000', () =>
    {
        const text = new Text({ text: 'Test', style: { fontFamily: 'Arial', fill: '#000000' } });
        const file = Gl2d.serialize(text);

        const node = file.nodes[0] as Gl2dPixiTextNode;
        const styleResource = file.resources[node.style] as Gl2dPixiTextStyleResource;

        expect(styleResource.fill).toBeUndefined();
    });

    it('should serialize stroke', () =>
    {
        const text = new Text({
            text: 'Stroke',
            style: {
                fontFamily: 'Arial',
                stroke: { color: '#ff0000', width: 3 },
            },
        });

        const file = Gl2d.serialize(text);
        const node = file.nodes[0] as Gl2dPixiTextNode;
        const styleResource = file.resources[node.style] as Gl2dPixiTextStyleResource;

        expect(styleResource.stroke).toBeDefined();
        expect(styleResource.stroke.fill).toBe('#ff0000');
        expect(styleResource.stroke.width).toBe(3);
    });

    it('should omit default stroke properties', () =>
    {
        const text = new Text({
            text: 'Stroke',
            style: {
                fontFamily: 'Arial',
                stroke: { color: '#0000ff', width: 1 },
            },
        });

        const file = Gl2d.serialize(text);
        const node = file.nodes[0] as Gl2dPixiTextNode;
        const styleResource = file.resources[node.style] as Gl2dPixiTextStyleResource;

        expect(styleResource.stroke).toBeDefined();
        expect(styleResource.stroke.fill).toBe('#0000ff');
        expect(styleResource.stroke.width).toBeUndefined();
    });

    it('should serialize drop shadow', () =>
    {
        const text = new Text({
            text: 'Shadow',
            style: {
                fontFamily: 'Arial',
                dropShadow: {
                    color: '#ff0000',
                    blur: 4,
                    distance: 6,
                    angle: 0,
                },
            },
        });

        const file = Gl2d.serialize(text);
        const node = file.nodes[0] as Gl2dPixiTextNode;
        const styleResource = file.resources[node.style] as Gl2dPixiTextStyleResource;

        expect(styleResource.shadow).toBeDefined();
        expect(styleResource.shadow.color).toBe('#ff0000');
        expect(styleResource.shadow.blur).toBe(4);
        // angle=0 => offsetX = cos(0)*6 = 6, offsetY = sin(0)*6 = 0
        expect(styleResource.shadow.offsetX).toBe(6);
        expect(styleResource.shadow.offsetY).toBeUndefined();
    });

    it('should serialize word wrap', () =>
    {
        const text = new Text({
            text: 'Wrapped text here',
            style: {
                fontFamily: 'Arial',
                wordWrap: true,
                wordWrapWidth: 200,
            },
        });

        const file = Gl2d.serialize(text);
        const node = file.nodes[0] as Gl2dPixiTextNode;
        const styleResource = file.resources[node.style] as Gl2dPixiTextStyleResource;

        expect(styleResource.wordWrap).toEqual({ enabled: true, width: 200 });
    });

    it('should omit wordWrap when disabled', () =>
    {
        const text = new Text({ text: 'Test', style: { fontFamily: 'Arial' } });
        const file = Gl2d.serialize(text);

        const node = file.nodes[0] as Gl2dPixiTextNode;
        const styleResource = file.resources[node.style] as Gl2dPixiTextStyleResource;

        expect(styleResource.wordWrap).toBeUndefined();
    });

    it('should serialize pixi text style extensions for non-default values', () =>
    {
        const text = new Text({
            text: 'Test',
            style: {
                fontFamily: 'Arial',
                trim: true,
                leading: 5,
                lineHeight: 30,
            },
        });

        const file = Gl2d.serialize(text);
        const node = file.nodes[0] as Gl2dPixiTextNode;
        const styleResource = file.resources[node.style] as Gl2dPixiTextStyleResource;

        expect(styleResource.extensions?.pixi_text_style_resource).toBeDefined();

        const ext = styleResource.extensions.pixi_text_style_resource;

        expect(ext.trim).toBe(true);
        expect(ext.leading).toBe(5);
        expect(ext.lineHeight).toBe(30);
    });

    it('should omit pixi text style extensions when all defaults', () =>
    {
        const text = new Text({ text: 'Test', style: { fontFamily: 'Arial' } });
        const file = Gl2d.serialize(text);

        const node = file.nodes[0] as Gl2dPixiTextNode;
        const styleResource = file.resources[node.style] as Gl2dPixiTextStyleResource;

        expect(styleResource.extensions).toBeUndefined();
    });

    it('should strip quotes from font family', () =>
    {
        const text = new Text({ text: 'Test', style: { fontFamily: '"Comic Sans MS"' } });
        const file = Gl2d.serialize(text);

        const node = file.nodes[0] as Gl2dPixiTextNode;
        const styleResource = file.resources[node.style] as Gl2dPixiTextStyleResource;

        expect(styleResource.fontFamily).toBe('Comic Sans MS');
    });

    it('should serialize font family array', () =>
    {
        const text = new Text({ text: 'Test', style: { fontFamily: ['"Roboto"', 'Arial', 'sans-serif'] } });
        const file = Gl2d.serialize(text);

        const node = file.nodes[0] as Gl2dPixiTextNode;
        const styleResource = file.resources[node.style] as Gl2dPixiTextStyleResource;

        expect(styleResource.fontFamily).toEqual(['Roboto', 'Arial', 'sans-serif']);
    });

    it('should serialize non-default resolution', () =>
    {
        const text = new Text({ text: 'Test', style: { fontFamily: 'Arial' }, resolution: 2 });
        const file = Gl2d.serialize(text);

        const node = file.nodes[0] as Gl2dPixiTextNode;

        expect(node.resolution).toBe(2);
    });

    it('should omit default resolution', () =>
    {
        const text = new Text({ text: 'Test', style: { fontFamily: 'Arial' }, resolution: 1 });
        const file = Gl2d.serialize(text);

        const node = file.nodes[0] as Gl2dPixiTextNode;

        expect(node.resolution).toBeUndefined();
    });

    it('should deduplicate shared text styles', () =>
    {
        const style = new TextStyle({ fontFamily: 'Arial', fontSize: 20 });
        const parent = new Container();
        const textA = new Text({ text: 'A', style });
        const textB = new Text({ text: 'B', style });

        parent.addChild(textA, textB);

        const file = Gl2d.serialize(parent);

        const nodeA = file.nodes[1] as Gl2dPixiTextNode;
        const nodeB = file.nodes[2] as Gl2dPixiTextNode;

        expect(nodeA.style).toBe(nodeB.style);

        const styleResources = file.resources.filter((r) => r.type === 'text_style');

        expect(styleResources).toHaveLength(1);
    });

    it('should serialize Text as child of Container', () =>
    {
        const parent = new Container();
        const text = new Text({ text: 'Child', style: { fontFamily: 'Arial' } });

        parent.addChild(text);

        const file = Gl2d.serialize(parent);

        expect(file.nodes).toHaveLength(2);
        expect(file.nodes[0].type).toBe('container');
        expect(file.nodes[0].children).toEqual([1]);
        expect(file.nodes[1].type).toBe('text');
    });

    it('should serialize transform values on Text', () =>
    {
        const text = new Text({ text: 'Moved', style: { fontFamily: 'Arial' } });

        text.position.set(100, 200);
        text.rotation = 0.5;
        text.scale.set(2, 2);

        const file = Gl2d.serialize(text);
        const node = file.nodes[0];

        expect(node.translation).toEqual([100, 200]);
        expect(node.rotation).toBe(0.5);
        expect(node.scale).toEqual([2, 2]);
    });

    it('should serialize text with mask', () =>
    {
        const text = new Text({ text: 'Masked', style: { fontFamily: 'Arial' } });
        const maskContainer = new Container();

        text.mask = maskContainer;

        const file = Gl2d.serialize(text);
        const node = file.nodes[0] as Gl2dPixiTextNode;

        expect(node.mask).toBeDefined();
        expect(typeof node.mask.node).toBe('number');
    });

    it('should populate extensionsUsed for text style resource', () =>
    {
        const text = new Text({
            text: 'Test',
            style: { fontFamily: 'Arial', trim: true },
        });

        const file = Gl2d.serialize(text);

        expect(file.extensionsUsed).toContain('pixi_text_style_resource');
    });

    it('should serialize web font reference when font is cached', () =>
    {
        mockWebFontCache('TestFont', 'https://example.com/testfont.woff2');

        const text = new Text({ text: 'Web Font', style: { fontFamily: 'TestFont' } });
        const file = Gl2d.serialize(text);

        const node = file.nodes[0] as Gl2dPixiTextNode;

        expect(node.webFont).toBeDefined();

        const webFontResource = file.resources[node.webFont as number] as Gl2dPixiWebFontResource;

        expect(webFontResource.type).toBe('web_font');
        expect(webFontResource.family).toBe('TestFont');
        expect(webFontResource.uri).toBe('https://example.com/testfont.woff2');
    });

    it('should omit web font when font is not cached', () =>
    {
        const text = new Text({ text: 'System Font', style: { fontFamily: 'Arial' } });
        const file = Gl2d.serialize(text);

        const node = file.nodes[0] as Gl2dPixiTextNode;

        expect(node.webFont).toBeUndefined();
    });

    it('should serialize web font with default style values omitted', () =>
    {
        mockWebFontCache('DefaultFont', 'https://example.com/font.woff2');

        const text = new Text({ text: 'Test', style: { fontFamily: 'DefaultFont' } });
        const file = Gl2d.serialize(text);

        const node = file.nodes[0] as Gl2dPixiTextNode;
        const webFontResource = file.resources[node.webFont as number] as Gl2dPixiWebFontResource;

        expect(webFontResource.style).toBeUndefined();
        expect(webFontResource.display).toBeUndefined();
        expect(webFontResource.stretch).toBeUndefined();
        expect(webFontResource.unicodeRange).toBeUndefined();
        expect(webFontResource.featureSettings).toBeUndefined();
        expect(webFontResource.weights).toBeUndefined();
    });
});

describe('gl2d Text fill serialization', () =>
{
    it('should serialize a linear gradient fill', () =>
    {
        const gradient = new FillGradient({
            type: 'linear',
            start: { x: 0, y: 0 },
            end: { x: 1, y: 1 },
            colorStops: [
                { offset: 0, color: 'red' },
                { offset: 1, color: 'blue' },
            ],
            textureSpace: 'local',
        });

        const text = new Text({
            text: 'Gradient',
            style: { fontFamily: 'Arial', fill: gradient },
        });

        const file = Gl2d.serialize(text);
        const node = file.nodes[0] as Gl2dPixiTextNode;
        const styleResource = file.resources[node.style] as Gl2dPixiTextStyleResource;

        expect(typeof styleResource.fill).toBe('number');

        const gradientResource = file.resources[styleResource.fill as number] as Gl2dPixiCanvasGradientResource;

        expect(gradientResource.type).toBe('canvas_gradient');
        expect(gradientResource.gradientType).toBe('linear');
        expect(gradientResource.gradientUnits).toBe('local');
        expect(gradientResource.linear).toBeDefined();
        expect(gradientResource.linear.start).toEqual([0, 0]);
        expect(gradientResource.linear.end).toEqual([1, 1]);
        expect(gradientResource.stops).toEqual([0, '#ff0000ff', 1, '#0000ffff']);
    });

    it('should serialize a radial gradient fill', () =>
    {
        const gradient = new FillGradient({
            type: 'radial',
            center: { x: 0.5, y: 0.5 },
            innerRadius: 0,
            outerCenter: { x: 0.5, y: 0.5 },
            outerRadius: 0.5,
            colorStops: [
                { offset: 0, color: 'white' },
                { offset: 1, color: 'black' },
            ],
            textureSpace: 'local',
        });

        const text = new Text({
            text: 'Radial',
            style: { fontFamily: 'Arial', fill: gradient },
        });

        const file = Gl2d.serialize(text);
        const node = file.nodes[0] as Gl2dPixiTextNode;
        const styleResource = file.resources[node.style] as Gl2dPixiTextStyleResource;
        const gradientResource = file.resources[styleResource.fill as number] as Gl2dPixiCanvasGradientResource;

        expect(gradientResource.gradientType).toBe('radial');
        expect(gradientResource.radial).toBeDefined();
        expect(gradientResource.radial.innerCircle).toEqual([0.5, 0.5, 0]);
        expect(gradientResource.radial.outerCircle).toEqual([0.5, 0.5, 0.5]);
        expect(gradientResource.linear).toBeUndefined();
    });

    it('should serialize a pattern fill', () =>
    {
        const texture = createTestTexture({ label: 'pattern.png' });
        const pattern = new FillPattern(texture, 'repeat');

        const text = new Text({
            text: 'Pattern',
            style: { fontFamily: 'Arial', fill: pattern },
        });

        const file = Gl2d.serialize(text);
        const node = file.nodes[0] as Gl2dPixiTextNode;
        const styleResource = file.resources[node.style] as Gl2dPixiTextStyleResource;

        expect(typeof styleResource.fill).toBe('number');

        const patternResource = file.resources[styleResource.fill as number] as Gl2dPixiCanvasPatternResource;

        expect(patternResource.type).toBe('canvas_pattern');
        expect(typeof patternResource.source).toBe('number');
    });

    it('should omit default repeat on pattern', () =>
    {
        const texture = createTestTexture();
        const pattern = new FillPattern(texture, 'repeat');

        const text = new Text({
            text: 'Pattern',
            style: { fontFamily: 'Arial', fill: pattern },
        });

        const file = Gl2d.serialize(text);
        const node = file.nodes[0] as Gl2dPixiTextNode;
        const styleResource = file.resources[node.style] as Gl2dPixiTextStyleResource;
        const patternResource = file.resources[styleResource.fill as number] as Gl2dPixiCanvasPatternResource;

        expect(patternResource.repeat).toBeUndefined();
    });

    it('should serialize non-default repeat on pattern', () =>
    {
        const texture = createTestTexture();
        const pattern = new FillPattern(texture, 'repeat-x');

        const text = new Text({
            text: 'Pattern',
            style: { fontFamily: 'Arial', fill: pattern },
        });

        const file = Gl2d.serialize(text);
        const node = file.nodes[0] as Gl2dPixiTextNode;
        const styleResource = file.resources[node.style] as Gl2dPixiTextStyleResource;
        const patternResource = file.resources[styleResource.fill as number] as Gl2dPixiCanvasPatternResource;

        expect(patternResource.repeat).toBe('repeat-x');
    });

    it('should serialize stroke with #000000 fill (not suppressed)', () =>
    {
        const text = new Text({
            text: 'Stroke',
            style: {
                fontFamily: 'Arial',
                stroke: { color: '#000000', width: 2 },
            },
        });

        const file = Gl2d.serialize(text);
        const node = file.nodes[0] as Gl2dPixiTextNode;
        const styleResource = file.resources[node.style] as Gl2dPixiTextStyleResource;

        expect(styleResource.stroke).toBeDefined();
        expect(styleResource.stroke.fill).toBe('#000000');
        expect(styleResource.stroke.width).toBe(2);
    });

    it('should deduplicate gradient resources', () =>
    {
        const gradient = new FillGradient({
            type: 'linear',
            colorStops: [
                { offset: 0, color: 'red' },
                { offset: 1, color: 'blue' },
            ],
        });

        const parent = new Container();
        const textA = new Text({ text: 'A', style: { fontFamily: 'Arial', fill: gradient } });
        const textB = new Text({ text: 'B', style: { fontFamily: 'Arial', fill: gradient } });

        parent.addChild(textA, textB);

        const file = Gl2d.serialize(parent);

        const gradientResources = file.resources.filter((r) => r.type === 'canvas_gradient');

        expect(gradientResources).toHaveLength(1);
    });

    it('should serialize pixi_canvas_gradient extension for non-default values', () =>
    {
        const gradient = new FillGradient({
            type: 'linear',
            colorStops: [
                { offset: 0, color: 'white' },
                { offset: 1, color: 'black' },
            ],
            textureSize: 512,
            wrapMode: 'repeat',
        });

        const text = new Text({
            text: 'Gradient',
            style: { fontFamily: 'Arial', fill: gradient },
        });

        const file = Gl2d.serialize(text);
        const node = file.nodes[0] as Gl2dPixiTextNode;
        const styleResource = file.resources[node.style] as Gl2dPixiTextStyleResource;
        const gradientResource = file.resources[styleResource.fill as number] as Gl2dPixiCanvasGradientResource;

        expect(gradientResource.extensions?.pixi_canvas_gradient).toBeDefined();

        const ext = gradientResource.extensions.pixi_canvas_gradient;

        expect(ext.textureSize).toBe(512);
        expect(ext.wrapMode).toBe('repeat');
    });

    it('should serialize tag styles', () =>
    {
        const text = new Text({
            text: 'Hello <b>World</b>',
            style: {
                fontFamily: 'Arial',
                tagStyles: {
                    b: {
                        fontWeight: 'bold',
                        fill: '#ff0000',
                    },
                },
            },
        });

        const file = Gl2d.serialize(text);
        const node = file.nodes[0] as Gl2dPixiTextNode;
        const styleResource = file.resources[node.style] as Gl2dPixiTextStyleResource;

        expect(styleResource.extensions?.pixi_text_style_resource).toBeDefined();

        const ext = styleResource.extensions.pixi_text_style_resource;

        expect(ext.tagStyles).toBeDefined();
        expect(ext.tagStyles.b).toBeDefined();
        expect(ext.tagStyles.b.fontWeight).toBe('bold');
        expect(ext.tagStyles.b.fill).toBe('#ff0000');
    });

    it('should omit default values in tag styles', () =>
    {
        const text = new Text({
            text: 'Hello <b>World</b>',
            style: {
                fontFamily: 'Arial',
                tagStyles: {
                    b: {
                        fontWeight: 'bold',
                        fontSize: 26,
                    },
                },
            },
        });

        const file = Gl2d.serialize(text);
        const node = file.nodes[0] as Gl2dPixiTextNode;
        const styleResource = file.resources[node.style] as Gl2dPixiTextStyleResource;
        const ext = styleResource.extensions?.pixi_text_style_resource;

        expect(ext.tagStyles.b.fontWeight).toBe('bold');
        // fontSize 26 is the default, should be omitted
        expect(ext.tagStyles.b.fontSize).toBeUndefined();
    });

    it('should serialize pixi_text_node extension for autoGenerateMipmaps', () =>
    {
        const text = new Text({
            text: 'Mipmaps',
            style: { fontFamily: 'Arial' },
            autoGenerateMipmaps: true,
        });

        const file = Gl2d.serialize(text);
        const node = file.nodes[0] as Gl2dPixiTextNode;

        expect(node.extensions?.pixi_text_node).toBeDefined();
        expect(node.extensions.pixi_text_node.autoGenerateMipmaps).toBe(true);
    });
});
