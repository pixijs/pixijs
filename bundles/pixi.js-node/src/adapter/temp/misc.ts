import path from 'path';
/**
 * Return font face name from a file name
 * Ex.: 'fonts/tital-one.woff' turns into 'Titan One'
 * @param url - File url
 */
export function getFontFamilyName(url: string): string
{
    const ext = path.extname(url);
    const name = path.basename(url, ext);

    // Replace dashes by white spaces
    const nameWithSpaces = name.replace(/(-|_)/g, ' ');

    // Upper case first character of each word
    const nameTitleCase = nameWithSpaces.toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    return nameTitleCase;
}
