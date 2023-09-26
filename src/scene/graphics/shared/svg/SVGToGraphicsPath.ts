import { warn } from '../../../../utils/logging/warn';

import type { GraphicsPath } from '../path/GraphicsPath';

const commandSizeMap = {
    a: 7,
    c: 6,
    h: 1,
    l: 2,
    m: 2,
    q: 4,
    s: 4,
    t: 2,
    v: 1,
    z: 0,
};

// TODO optimise and cache the paths?
export function SVGToGraphicsPath(svgPath: string, path: GraphicsPath): GraphicsPath
{
    // get commands removing spaces at the end

    const commands = svgPath.match(/[a-df-z][^a-df-z]*/gi);
    // get command data size

    const data = svgPath.match(/[+-]?\d*\.?\d+(?:[eE][+-]?\d+)?/g)?.map(parseFloat);

    const betterCommands: string[] = [];

    commands.forEach((command) =>
    {
        const data = command.match(/[+-]?\d*\.?\d+(?:[eE][+-]?\d+)?/g)?.map(parseFloat);

        const type = command[0];

        let totalInstructions = 1;

        if (data)
        {
            totalInstructions = data.length / commandSizeMap[type.toLowerCase() as keyof typeof commandSizeMap];
        }

        for (let i = 0; i < totalInstructions; i++)
        {
            betterCommands.push(type);
        }
    });

    let dataIndex = 0;

    let lastX = 0;
    let lastY = 0;

    for (let i = 0; i < betterCommands.length; i++)
    {
        const type = betterCommands[i];

        // const command = commands[i];

        //        const type = betterCommand.type;

        switch (type)
        {
            case 'M':
                lastX = data[dataIndex++];
                lastY = data[dataIndex++];

                path.moveTo(lastX, lastY);
                break;
            case 'm':

                lastX += data[dataIndex++];
                lastY += data[dataIndex++];

                path.moveTo(lastX, lastY);
                break;
            case 'H':
                lastX = data[dataIndex++];

                path.lineTo(lastX, lastY);
                break;
            case 'h':
                lastX += data[dataIndex++];

                path.lineTo(lastX, lastY);
                break;
            case 'V':
                lastY = data[dataIndex++];

                path.lineTo(lastX, lastY);
                break;
            case 'v':
                lastY += data[dataIndex++];

                path.lineTo(lastX, lastY);
                break;
            case 'L':
                lastX = data[dataIndex++];
                lastY = data[dataIndex++];

                path.lineTo(lastX, lastY);
                break;
            case 'l':
                lastX += data[dataIndex++];
                lastY += data[dataIndex++];

                path.lineTo(lastX, lastY);
                break;
            case 'C':

                lastX = data[dataIndex + 4];
                lastY = data[dataIndex + 5];

                path.bezierCurveTo(
                    data[dataIndex], data[dataIndex + 1],
                    data[dataIndex + 2], data[dataIndex + 3],
                    lastX, lastY
                );

                dataIndex += 6;
                break;
            case 'c':

                path.bezierCurveTo(
                    lastX + data[dataIndex], lastY + data[dataIndex + 1],
                    lastX + data[dataIndex + 2], lastY + data[dataIndex + 3],
                    lastX + data[dataIndex + 4], lastY + data[dataIndex + 5]
                );

                lastX += data[dataIndex + 4];
                lastY += data[dataIndex + 5];

                dataIndex += 6;
                break;
            case 'S':
                lastX = data[dataIndex + 2];
                lastY = data[dataIndex + 3];

                path.bezierCurveToShort(
                    data[dataIndex], data[dataIndex + 1],
                    lastX, lastY
                );

                dataIndex += 4;
                break;
            case 's':
                path.bezierCurveToShort(
                    lastX + data[dataIndex], lastY + data[dataIndex + 1],
                    lastX + data[dataIndex + 2], lastY + data[dataIndex + 3],
                );

                lastX += data[dataIndex + 2];
                lastY += data[dataIndex + 3];

                dataIndex += 4;
                break;
            case 'Q':
                lastX = data[dataIndex + 2];
                lastY = data[dataIndex + 3];

                path.quadraticCurveTo(
                    data[dataIndex], data[dataIndex + 1],
                    lastX, lastY
                );

                dataIndex += 4;
                break;
            case 'q':

                path.quadraticCurveTo(
                    lastX + data[dataIndex], lastY + data[dataIndex + 1],
                    lastX + data[dataIndex + 2], lastY + data[dataIndex + 3]
                );

                lastX += data[dataIndex + 2];
                lastY += data[dataIndex + 3];

                dataIndex += 4;
                break;
            case 'T':

                lastX = data[dataIndex++];
                lastY = data[dataIndex++];

                path.quadraticCurveToShort(
                    lastX, lastY
                );

                break;
            case 't':

                lastX += data[dataIndex++];
                lastY += data[dataIndex++];

                path.quadraticCurveToShort(
                    lastX, lastY
                );

                break;
            case 'A':

                lastX = data[dataIndex + 5];
                lastY = data[dataIndex + 6];

                path.arcToSvg(
                    data[dataIndex],
                    data[dataIndex + 1],
                    data[dataIndex + 2],
                    data[dataIndex + 3],
                    data[dataIndex + 4],
                    lastX, lastY
                );

                dataIndex += 7;

                break;
            case 'a':
                lastX += data[dataIndex + 5];
                lastY += data[dataIndex + 6];

                path.arcToSvg(
                    data[dataIndex],
                    data[dataIndex + 1],
                    data[dataIndex + 2],
                    data[dataIndex + 3],
                    data[dataIndex + 4],
                    lastX, lastY
                );

                dataIndex += 7;

                break;
            case 'Z':
            case 'z':
                path.closePath();
                break;
            default:
                // #if _DEBUG
                warn(`Unknown SVG path command: ${type}`);
                // #endif
        }
    }

    return path;
}
