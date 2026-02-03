import { CategoryRouter, DocumentReflection } from 'typedoc';

const Chars = {
    EOF: -1,
    NULL: 0,
    TAB: 0x9,
    LF: 0xa,
    FF: 0xc,
    SPACE: 0x20,
    NUMBER_SIGN: 0x23,
    BANG: 0x21,
    QUOTATION_MARK: 0x22,
    DOLLAR: 0x24,
    AMPERSAND: 0x26,
    APOSTROPHE: 0x27,
    LEFT_PAREN: 0x28,
    RIGHT_PAREN: 0x29,
    ASTERISK: 0x2a,
    PLUS: 0x2b,
    COMMA: 0x2c,
    DASH: 0x2d,
    DOT: 0x2e,
    SOLIDUS: 0x2f,
    ZERO: 0x30,
    NINE: 0x39,
    COLON: 0x3a,
    SEMICOLON: 0x3b,
    LESS_THAN: 0x3c,
    EQUALS: 0x3d,
    GREATER_THAN: 0x3e,
    QUESTION_MARK: 0x3f,
    AT: 0x40,
    UPPERCASE_A: 0x41,
    UPPERCASE_F: 0x46,
    UPPERCASE_X: 0x58,
    UPPERCASE_Z: 0x5a,
    UNDERSCORE: 0x5f,
    GRAVE_ACCENT: 0x60,
    LOWERCASE_A: 0x61,
    LOWERCASE_F: 0x66,
    LOWERCASE_X: 0x78,
    LOWERCASE_Z: 0x7a,
    TILDE: 0x7e,
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
        let cat = this.getCategory(reflection)
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

        if (reflection instanceof DocumentReflection)
        {
            // For document reflections, we use the category as the base name
            return `${cat}`;
        }

        // remap text classes back to scene for backwards compatibility
        switch (baseName)
        {
            case 'Text':
            case 'BitmapText':
            case 'HTMLText':
            case 'TextDestroyOptions':
            case 'AbstractText':
            case 'CanvasTextOptions':
                cat = 'scene';
                break;
        }

        return `${cat}.${baseName}`;
    }
}

export function load(app)
{
    // Register the custom category router
    app.renderer.defineRouter('pixi', PixiRouter);
}
