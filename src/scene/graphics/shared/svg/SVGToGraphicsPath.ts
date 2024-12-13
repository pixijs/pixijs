import parse from 'parse-svg-path';
import { warn } from '../../../../utils/logging/warn';

import type { GraphicsPath } from '../path/GraphicsPath';

interface SubPath
{
    startX: number;
    startY: number;
}

// TODO optimise and cache the paths?
export function SVGToGraphicsPath(svgPath: string, path: GraphicsPath): GraphicsPath
{
    const commands = parse(svgPath);

    const subpaths: SubPath[] = [];
    let currentSubPath: SubPath | null = null;

    let lastX = 0;
    let lastY = 0;

    for (let i = 0; i < commands.length; i++)
    {
        const command = commands[i];
        const type = command[0];
        const data = command; // alias for 1-based referencing

        switch (type)
        {
            case 'M':
                lastX = data[1];
                lastY = data[2];

                path.moveTo(lastX, lastY);
                break;
            case 'm':

                lastX += data[1];
                lastY += data[2];

                path.moveTo(lastX, lastY);
                break;
            case 'H':
                lastX = data[1];

                path.lineTo(lastX, lastY);
                break;
            case 'h':
                lastX += data[1];

                path.lineTo(lastX, lastY);
                break;
            case 'V':
                lastY = data[1];

                path.lineTo(lastX, lastY);
                break;
            case 'v':
                lastY += data[1];

                path.lineTo(lastX, lastY);
                break;
            case 'L':
                lastX = data[1];
                lastY = data[2];

                path.lineTo(lastX, lastY);
                break;
            case 'l':
                lastX += data[1];
                lastY += data[2];

                path.lineTo(lastX, lastY);
                break;
            case 'C':

                lastX = data[5];
                lastY = data[6];

                path.bezierCurveTo(
                    data[1], data[2],
                    data[3], data[4],
                    lastX, lastY
                );
                break;
            case 'c':
                path.bezierCurveTo(
                    lastX + data[1], lastY + data[2],
                    lastX + data[3], lastY + data[4],
                    lastX + data[5], lastY + data[6]
                );

                lastX += data[5];
                lastY += data[6];
                break;
            case 'S':
                lastX = data[3];
                lastY = data[4];

                path.bezierCurveToShort(
                    data[1], data[2],
                    lastX, lastY
                );
                break;
            case 's':
                path.bezierCurveToShort(
                    lastX + data[1], lastY + data[2],
                    lastX + data[3], lastY + data[4],
                );

                lastX += data[3];
                lastY += data[4];
                break;
            case 'Q':
                lastX = data[3];
                lastY = data[4];

                path.quadraticCurveTo(
                    data[1], data[2],
                    lastX, lastY
                );
                break;
            case 'q':
                path.quadraticCurveTo(
                    lastX + data[1], lastY + data[2],
                    lastX + data[3], lastY + data[4]
                );

                lastX += data[3];
                lastY += data[4];
                break;
            case 'T':
                lastX = data[1];
                lastY = data[2];

                path.quadraticCurveToShort(
                    lastX, lastY
                );
                break;
            case 't':
                lastX += data[1];
                lastY += data[2];

                path.quadraticCurveToShort(
                    lastX, lastY
                );
                break;
            case 'A':
                lastX = data[6];
                lastY = data[7];

                path.arcToSvg(
                    data[1],
                    data[2],
                    data[3],
                    data[4],
                    data[5],
                    lastX, lastY
                );
                break;
            case 'a':
                lastX += data[6];
                lastY += data[7];

                path.arcToSvg(
                    data[1],
                    data[2],
                    data[3],
                    data[4],
                    data[5],
                    lastX, lastY
                );
                break;
            case 'Z':
            case 'z':
                path.closePath();
                if (subpaths.length > 0)
                {
                    currentSubPath = subpaths.pop();
                    if (currentSubPath)
                    {
                        lastX = currentSubPath.startX;
                        lastY = currentSubPath.startY;
                    }
                    else
                    {
                        lastX = 0;
                        lastY = 0;
                    }
                }
                currentSubPath = null;
                break;
            default:
                // #if _DEBUG
                warn(`Unknown SVG path command: ${type}`);
                // #endif
        }

        if (type !== 'Z' && type !== 'z')
        {
            if (currentSubPath === null)
            {
                currentSubPath = { startX: lastX, startY: lastY };
                subpaths.push(currentSubPath);
            }
        }
    }

    return path;
}
