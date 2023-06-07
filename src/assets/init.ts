import { extensions } from '../extensions/Extensions';
import { bitmapFontCachePlugin, xmlBitmapFontLoader } from '../rendering/text/bitmap/asset/loadBitmapFont';
import { cacheTextureArray } from './cache/parsers/cacheTextureArray';
import { detectAvif } from './detections/parsers/detectAvif';
import { detectDefaults } from './detections/parsers/detectDefaults';
import { detectMp4 } from './detections/parsers/detectMp4';
import { detectOgv } from './detections/parsers/detectOgv';
import { detectWebm } from './detections/parsers/detectWebm';
import { detectWebp } from './detections/parsers/detectWebp';
import { loadJson } from './loader/parsers/loadJson';
import { loadTxt } from './loader/parsers/loadTxt';
import { loadWebFont } from './loader/parsers/loadWebFont';
import { loadSvg } from './loader/parsers/textures/loadSVG';
import { loadTextures } from './loader/parsers/textures/loadTextures';
import { resolveTextureUrl } from './resolver/parsers/resolveTextureUrl';

extensions.add(
    cacheTextureArray,

    detectDefaults,
    detectAvif,
    detectWebp,
    detectMp4,
    detectOgv,
    detectWebm,

    loadJson,
    loadTxt,
    loadWebFont,
    loadSvg,
    loadTextures,

    resolveTextureUrl,

    // TODO: these should probably be moved to its own init, along with splitting out all the
    // text pipeline stuff
    xmlBitmapFontLoader,
    bitmapFontCachePlugin
);
