import { Polyfill } from 'es6-promise-polyfill';

// Support for IE 9 - 11 which does not include Promises
if (typeof window !== 'undefined' && typeof window.Promise === 'undefined')
{
    window.Promise = Polyfill;
}
