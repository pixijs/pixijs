import { CategoryRouter } from 'typedoc';

const Chars = {
    LEFT_PAREN: 0x28,
    RIGHT_PAREN: 0x29,
    PLUS: 0x2b,
    COMMA: 0x2c,
    DASH: 0x2d,
    DOT: 0x2e,
    UNDERSCORE: 0x5f,
};

function isalpha(ch)
{
    return Chars.LOWERCASE_A <= (ch | 0x20) && (ch | 0x20) <= Chars.LOWERCASE_Z;
}

function isdigit(ch)
{
    return Chars.ZERO <= ch && ch <= Chars.NINE;
}

function isalnum(ch)
{
    return isalpha(ch) || isdigit(ch);
}

// https://infra.spec.whatwg.org/#leading-surrogate
function isLeadingSurrogate(ch)
{
    return ch >= 0xd800 && ch <= 0xdbff;
}

// https://infra.spec.whatwg.org/#trailing-surrogate
function isTrailingSurrogate(ch)
{
    return ch >= 0xdc00 && ch <= 0xdfff;
}

// https://infra.spec.whatwg.org/#surrogate
function isSurrogate(ch)
{
    return isLeadingSurrogate(ch) || isTrailingSurrogate(ch);
}

function createNormalizedUrl(url)
{
    // We are intentionally operating on code points here.
    const codePoints = [...url].map((c) => c.codePointAt(0));

    for (let i = 0; i < codePoints.length; ++i)
    {
        if (isalnum(codePoints[i])) continue;

        switch (codePoints[i])
        {
            case Chars.LEFT_PAREN:
            case Chars.RIGHT_PAREN:
            case Chars.PLUS:
            case Chars.COMMA:
            case Chars.DASH:
            case Chars.DOT:
            case Chars.UNDERSCORE:
                continue;
        }

        if (codePoints[i] >= 0xa0 && codePoints[i] <= 0x10fffd)
        {
            if (!isSurrogate(codePoints[i]))
            {
                continue;
            }
        }

        codePoints[i] = Chars.UNDERSCORE;
    }

    return String.fromCodePoint(...codePoints);
}

class PixiRouter extends CategoryRouter
{
    getIdealBaseName(reflection)
    {
        const cat = this.getCategory(reflection)
            .split('/')
            .map(createNormalizedUrl)
            .join('/');
        const parts = [createNormalizedUrl(reflection.name)];

        while (reflection.parent && !reflection.parent.isProject())
        {
            reflection = reflection.parent;
            parts.unshift(createNormalizedUrl(reflection.name));
        }

        const baseName = parts.join('.');

        return `${cat}.${baseName}`;
    }
}

export function load(app)
{
    // Register the custom category router
    app.renderer.defineRouter('pixi', PixiRouter);
}
