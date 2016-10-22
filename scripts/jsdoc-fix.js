'use strict';

// JSDoc has issues getting the name of `export default class NAME {}`
// this gross regex hacks around that issue until it is fixed.
// See: https://github.com/jsdoc3/jsdoc/issues/1137#issuecomment-174829004

const rgxGross = /(\/\*{2}[\W\w]+?\*\/)\s*export\s+default\s+class\s+([^\s]*)/g;
const grossReplace = 'export default $2;\n\n$1\nclass $2';

exports.handlers = {
    /**
     * Called before parsing a file, giving us a change to replace the source.
     *
     * @param {*} e - The `beforeParse` event data.
     * @param {string} e.filename - The name of the file being parsed.
     * @param {string} e.source - The source of the file being parsed.
     */
    beforeParse(e)
    {
        e.source = e.source.replace(rgxGross, grossReplace);
    },
};
