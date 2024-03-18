import type { CanvasAndContext } from '../../rendering/renderers/shared/texture/CanvasPool';

export const nssvg = 'http://www.w3.org/2000/svg';
export const nsxhtml = 'http://www.w3.org/1999/xhtml';

export class HTMLTextRenderData
{
    public svgRoot = document.createElementNS(nssvg, 'svg');
    public foreignObject = document.createElementNS(nssvg, 'foreignObject');
    public domElement = document.createElementNS(nsxhtml, 'div');
    public styleElement = document.createElementNS(nsxhtml, 'style');
    public image = new Image();
    public canvasAndContext?: CanvasAndContext;

    constructor()
    {
        const { foreignObject, svgRoot, styleElement, domElement } = this;
        // Arbitrary max size

        foreignObject.setAttribute('width', '10000');
        foreignObject.setAttribute('height', '10000');
        foreignObject.style.overflow = 'hidden';

        svgRoot.appendChild(foreignObject);

        foreignObject.appendChild(styleElement);
        foreignObject.appendChild(domElement);
    }
}
