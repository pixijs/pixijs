// References:
// https://github.com/sindresorhus/object-assign
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign

import objectAssign from 'object-assign';

if (!Object.assign)
{
    Object.assign = objectAssign;
}
