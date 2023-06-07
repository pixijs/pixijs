export function convertNumberToHex(color: string | number): string
{
    if (typeof color === 'string')
    {
        return color;
    }

    let hexString = (color | 0).toString(16);

    hexString = '000000'.substring(0, 6 - hexString.length) + hexString;

    return `#${hexString}`;
}
