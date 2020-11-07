import Polyfill from 'promise-polyfill';

// Support for IE 9 - 11 which does not include Promises
if (!self.Promise)
{
    self.Promise = Polyfill;
}
