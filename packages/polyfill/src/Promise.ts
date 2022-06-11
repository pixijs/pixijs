import Polyfill from 'promise-polyfill';

// Support for IE 9 - 11 which does not include Promises
if (!globalThis.Promise)
{
    globalThis.Promise = Polyfill;
}
