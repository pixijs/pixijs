function extractOutputs(fragmentSource: string, out: string[])
{
    let match;
    const regex = /@out\s+([^;]+);/g;

    while ((match = regex.exec(fragmentSource)) !== null)
    {
        out.push(match[1]);
    }
}

function extractVariableName(value: string)
{
    const regex = /\b(\w+)\s*:/g;

    const match = regex.exec(value);

    return match ? match[1] : '';
}

function stripVariable(value: string)
{
    const regex = /@.*?\s+/g;

    return value.replace(regex, '');
}

export function compileOutputs(fragments: any[], template: string)
{
    // get all the inputs from the fragments..
    const results: string[] = [];

    extractOutputs(template, results);

    fragments.forEach((fragment) =>
    {
        if (fragment.header)
        {
            extractOutputs(fragment.header, results);
        }
    });

    let index = 0;

    // generate the output struct
    const mainStruct = results
        .sort()
        .map((inValue) =>
        {
            if (inValue.indexOf('builtin') > -1)
            {
                return inValue;
            }

            return `@location(${index++}) ${inValue}`;
        })
        .join(',\n');

    // generate the variables we will set:
    const mainStart = results
        .sort()
        .map((inValue) => `       var ${stripVariable(inValue)};`)
        .join('\n');

    // generate the return object
    const mainEnd = `return VSOutput(
            ${results
                .sort()
                .map((inValue) => ` ${extractVariableName(inValue)}`)
                .join(',\n')});`;

    // Remove lines from original string
    let compiledCode = template.replace(/@out\s+[^;]+;\s*/g, '');

    compiledCode = compiledCode.replace('{{struct}}', `\n${mainStruct}\n`);
    compiledCode = compiledCode.replace('{{start}}', `\n${mainStart}\n`);
    compiledCode = compiledCode.replace('{{return}}', `\n${mainEnd}\n`);

    return compiledCode;
}
