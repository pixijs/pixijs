/* eslint-disable */

// Copyright (C) 2019 Binomial LLC. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// https://github.com/BinomialLLC/basis_universal/blob/master/webgl/transcoder/build/basis_transcoder.js

var BASIS = (function ()
{
    let _scriptDir = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : undefined;

    if (typeof __filename !== 'undefined') _scriptDir = _scriptDir || __filename;

    return (
        function (BASIS)
        {

            BASIS = BASIS || {};
            const Module = typeof BASIS !== 'undefined' ? BASIS : {}; let moduleOverrides = {}; let key;

            for (key in Module) { if (Module.hasOwnProperty(key)) { moduleOverrides[key] = Module[key]; } } let arguments_ = []; let thisProgram = './this.program'; let quit_ = function (status, toThrow) { throw toThrow; }; let ENVIRONMENT_IS_WEB = false; let ENVIRONMENT_IS_WORKER = false; let ENVIRONMENT_IS_NODE = false; let ENVIRONMENT_IS_SHELL = false;

            ENVIRONMENT_IS_WEB = typeof window === 'object'; ENVIRONMENT_IS_WORKER = typeof importScripts === 'function'; ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof process.versions === 'object' && typeof process.versions.node === 'string'; ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER; let scriptDirectory = '';

            function locateFile(path)
            {
                if (Module.locateFile) { return Module.locateFile(path, scriptDirectory); }

                return scriptDirectory + path;
            } let read_; let readAsync; let readBinary; let setWindowTitle; let nodeFS; let nodePath;

            if (ENVIRONMENT_IS_NODE)
            {
                if (ENVIRONMENT_IS_WORKER) { scriptDirectory = `${require('path').dirname(scriptDirectory)}/`; }
                else { scriptDirectory = `${__dirname}/`; }read_ = function shell_read(filename, binary)
                {
                    if (!nodeFS)nodeFS = require('fs'); if (!nodePath)nodePath = require('path'); filename = nodePath.normalize(filename);

                    return nodeFS.readFileSync(filename, binary ? null : 'utf8');
                }; readBinary = function readBinary(filename)
                {
                    let ret = read_(filename, true);

                    if (!ret.buffer) { ret = new Uint8Array(ret); }assert(ret.buffer);

                    return ret;
                }; if (process.argv.length > 1) { thisProgram = process.argv[1].replace(/\\/g, '/'); }arguments_ = process.argv.slice(2); process.on('uncaughtException', function (ex) { if (!(ex instanceof ExitStatus)) { throw ex; } }); process.on('unhandledRejection', abort); quit_ = function (status) { process.exit(status); }; Module.inspect = function () { return '[Emscripten Module object]'; };
            }
            else if (ENVIRONMENT_IS_SHELL)
            {
                if (typeof read !== 'undefined') { read_ = function shell_read(f) { return read(f); }; }readBinary = function readBinary(f)
                {
                    let data;

                    if (typeof readbuffer === 'function') { return new Uint8Array(readbuffer(f)); }data = read(f, 'binary'); assert(typeof data === 'object');

                    return data;
                }; if (typeof scriptArgs !== 'undefined') { arguments_ = scriptArgs; }
                else if (typeof arguments !== 'undefined') { arguments_ = arguments; } if (typeof quit === 'function') { quit_ = function (status) { quit(status); }; } if (typeof print !== 'undefined') { if (typeof console === 'undefined')console = {}; console.log = print; console.warn = console.error = typeof printErr !== 'undefined' ? printErr : print; }
            }
            else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)
            {
                if (ENVIRONMENT_IS_WORKER) { scriptDirectory = self.location.href; }
                else if (document.currentScript) { scriptDirectory = document.currentScript.src; } if (_scriptDir) { scriptDirectory = _scriptDir; } if (scriptDirectory.indexOf('blob:') !== 0) { scriptDirectory = scriptDirectory.substr(0, scriptDirectory.lastIndexOf('/') + 1); }
                else { scriptDirectory = ''; } { read_ = function shell_read(url)
                {

                    const xhr = new XMLHttpRequest();

                    xhr.open('GET', url, false); xhr.send(null);

                    return xhr.responseText;
                }; if (ENVIRONMENT_IS_WORKER)
                {
                    readBinary = function readBinary(url)
                    {
                        const xhr = new XMLHttpRequest();

                        xhr.open('GET', url, false); xhr.responseType = 'arraybuffer'; xhr.send(null);

                        return new Uint8Array(xhr.response);
                    };
                }readAsync = function readAsync(url, onload, onerror)
                {
                    const xhr = new XMLHttpRequest();

                    xhr.open('GET', url, true); xhr.responseType = 'arraybuffer'; xhr.onload = function xhr_onload()
                    {
                        if (xhr.status == 200 || xhr.status == 0 && xhr.response)
                        {
                            onload(xhr.response);

                            return;
                        }onerror();
                    }; xhr.onerror = onerror; xhr.send(null);
                }; }setWindowTitle = function (title) { document.title = title; };
            }
            else {} const out = Module.print || console.log.bind(console); const err = Module.printErr || console.warn.bind(console);

            for (key in moduleOverrides) { if (moduleOverrides.hasOwnProperty(key)) { Module[key] = moduleOverrides[key]; } }moduleOverrides = null; if (Module.arguments)arguments_ = Module.arguments; if (Module.thisProgram)thisProgram = Module.thisProgram; if (Module.quit)quit_ = Module.quit; let tempRet0 = 0; const setTempRet0 = function (value) { tempRet0 = value; }; let wasmBinary;

            if (Module.wasmBinary)wasmBinary = Module.wasmBinary; let noExitRuntime;

            if (Module.noExitRuntime)noExitRuntime = Module.noExitRuntime; if (typeof WebAssembly !== 'object') { err('no native wasm support detected'); } let wasmMemory; const wasmTable = new WebAssembly.Table({ initial: 59, maximum: 59 + 0, element: 'anyfunc' }); let ABORT = false; let EXITSTATUS = 0;

            function assert(condition, text) { if (!condition) { abort(`Assertion failed: ${text}`); } } const UTF8Decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf8') : undefined;

            function UTF8ArrayToString(u8Array, idx, maxBytesToRead)
            {
                const endIdx = idx + maxBytesToRead; let endPtr = idx;

                while (u8Array[endPtr] && !(endPtr >= endIdx))++endPtr; if (endPtr - idx > 16 && u8Array.subarray && UTF8Decoder) { return UTF8Decoder.decode(u8Array.subarray(idx, endPtr)); }

                let str = '';

                while (idx < endPtr)
                {
                    let u0 = u8Array[idx++];

                    if (!(u0 & 128)) { str += String.fromCharCode(u0); continue; } const u1 = u8Array[idx++] & 63;

                    if ((u0 & 224) == 192) { str += String.fromCharCode((u0 & 31) << 6 | u1); continue; } const u2 = u8Array[idx++] & 63;

                    if ((u0 & 240) == 224) { u0 = (u0 & 15) << 12 | u1 << 6 | u2; }
                    else { u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | u8Array[idx++] & 63; } if (u0 < 65536) { str += String.fromCharCode(u0); }
                    else
                    {
                        const ch = u0 - 65536;

                        str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
                    }
                }

                return str;
            } function UTF8ToString(ptr, maxBytesToRead) { return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : ''; } function stringToUTF8Array(str, outU8Array, outIdx, maxBytesToWrite)
            {
                if (!(maxBytesToWrite > 0)) return 0; const startIdx = outIdx; const endIdx = outIdx + maxBytesToWrite - 1;

                for (let i = 0; i < str.length; ++i)
                {
                    let u = str.charCodeAt(i);

                    if (u >= 55296 && u <= 57343)
                    {
                        const u1 = str.charCodeAt(++i);

                        u = 65536 + ((u & 1023) << 10) | u1 & 1023;
                    } if (u <= 127) { if (outIdx >= endIdx) break; outU8Array[outIdx++] = u; }
                    else if (u <= 2047) { if (outIdx + 1 >= endIdx) break; outU8Array[outIdx++] = 192 | u >> 6; outU8Array[outIdx++] = 128 | u & 63; }
                    else if (u <= 65535) { if (outIdx + 2 >= endIdx) break; outU8Array[outIdx++] = 224 | u >> 12; outU8Array[outIdx++] = 128 | u >> 6 & 63; outU8Array[outIdx++] = 128 | u & 63; }
                    else { if (outIdx + 3 >= endIdx) break; outU8Array[outIdx++] = 240 | u >> 18; outU8Array[outIdx++] = 128 | u >> 12 & 63; outU8Array[outIdx++] = 128 | u >> 6 & 63; outU8Array[outIdx++] = 128 | u & 63; }
                }outU8Array[outIdx] = 0;

                return outIdx - startIdx;
            } function stringToUTF8(str, outPtr, maxBytesToWrite) { return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite); } function lengthBytesUTF8(str)
            {
                let len = 0;

                for (let i = 0; i < str.length; ++i)
                {
                    let u = str.charCodeAt(i);

                    if (u >= 55296 && u <= 57343)u = 65536 + ((u & 1023) << 10) | str.charCodeAt(++i) & 1023; if (u <= 127)++len; else if (u <= 2047)len += 2; else if (u <= 65535)len += 3; else len += 4;
                }

                return len;
            } const UTF16Decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-16le') : undefined;

            function UTF16ToString(ptr)
            {
                let endPtr = ptr; let idx = endPtr >> 1;

                while (HEAP16[idx])++idx; endPtr = idx << 1; if (endPtr - ptr > 32 && UTF16Decoder) { return UTF16Decoder.decode(HEAPU8.subarray(ptr, endPtr)); }

                let i = 0; let str = '';

                while (1)
                {
                    const codeUnit = HEAP16[ptr + i * 2 >> 1];

                    if (codeUnit == 0) return str; ++i; str += String.fromCharCode(codeUnit);
                }
            } function stringToUTF16(str, outPtr, maxBytesToWrite)
            {
                if (maxBytesToWrite === undefined) { maxBytesToWrite = 2147483647; } if (maxBytesToWrite < 2) return 0; maxBytesToWrite -= 2; const startPtr = outPtr; const numCharsToWrite = maxBytesToWrite < str.length * 2 ? maxBytesToWrite / 2 : str.length;

                for (let i = 0; i < numCharsToWrite; ++i)
                {
                    const codeUnit = str.charCodeAt(i);

                    HEAP16[outPtr >> 1] = codeUnit; outPtr += 2;
                }HEAP16[outPtr >> 1] = 0;

                return outPtr - startPtr;
            } function lengthBytesUTF16(str) { return str.length * 2; } function UTF32ToString(ptr)
            {
                let i = 0; let str = '';

                while (1)
                {
                    const utf32 = HEAP32[ptr + i * 4 >> 2];

                    if (utf32 == 0) return str; ++i; if (utf32 >= 65536)
                    {
                        const ch = utf32 - 65536;

                        str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
                    }
                    else { str += String.fromCharCode(utf32); }
                }
            } function stringToUTF32(str, outPtr, maxBytesToWrite)
            {
                if (maxBytesToWrite === undefined) { maxBytesToWrite = 2147483647; } if (maxBytesToWrite < 4) return 0; const startPtr = outPtr; const endPtr = startPtr + maxBytesToWrite - 4;

                for (let i = 0; i < str.length; ++i)
                {
                    let codeUnit = str.charCodeAt(i);

                    if (codeUnit >= 55296 && codeUnit <= 57343)
                    {
                        const trailSurrogate = str.charCodeAt(++i);

                        codeUnit = 65536 + ((codeUnit & 1023) << 10) | trailSurrogate & 1023;
                    }HEAP32[outPtr >> 2] = codeUnit; outPtr += 4; if (outPtr + 4 > endPtr) break;
                }HEAP32[outPtr >> 2] = 0;

                return outPtr - startPtr;
            } function lengthBytesUTF32(str)
            {
                let len = 0;

                for (let i = 0; i < str.length; ++i)
                {
                    const codeUnit = str.charCodeAt(i);

                    if (codeUnit >= 55296 && codeUnit <= 57343)++i; len += 4;
                }

                return len;
            } const WASM_PAGE_SIZE = 65536;

            function alignUp(x, multiple)
            {
                if (x % multiple > 0) { x += multiple - x % multiple; }

                return x;
            } let buffer; let HEAP8; let HEAPU8; let HEAP16; let HEAPU16; let HEAP32; let HEAPU32; let HEAPF32; let HEAPF64;

            function updateGlobalBufferAndViews(buf) { buffer = buf; Module.HEAP8 = HEAP8 = new Int8Array(buf); Module.HEAP16 = HEAP16 = new Int16Array(buf); Module.HEAP32 = HEAP32 = new Int32Array(buf); Module.HEAPU8 = HEAPU8 = new Uint8Array(buf); Module.HEAPU16 = HEAPU16 = new Uint16Array(buf); Module.HEAPU32 = HEAPU32 = new Uint32Array(buf); Module.HEAPF32 = HEAPF32 = new Float32Array(buf); Module.HEAPF64 = HEAPF64 = new Float64Array(buf); } const DYNAMIC_BASE = 5561216; const DYNAMICTOP_PTR = 318176; let INITIAL_INITIAL_MEMORY = Module.INITIAL_MEMORY || 16777216;

            if (Module.wasmMemory) { wasmMemory = Module.wasmMemory; }
            else { wasmMemory = new WebAssembly.Memory({ initial: INITIAL_INITIAL_MEMORY / WASM_PAGE_SIZE }); } if (wasmMemory) { buffer = wasmMemory.buffer; }INITIAL_INITIAL_MEMORY = buffer.byteLength; updateGlobalBufferAndViews(buffer); HEAP32[DYNAMICTOP_PTR >> 2] = DYNAMIC_BASE; function callRuntimeCallbacks(callbacks)
            {
                while (callbacks.length > 0)
                {
                    const callback = callbacks.shift();

                    if (typeof callback === 'function') { callback(); continue; } const func = callback.func;

                    if (typeof func === 'number')
                    {
                        if (callback.arg === undefined) { Module.dynCall_v(func); }
                        else { Module.dynCall_vi(func, callback.arg); }
                    }
                    else { func(callback.arg === undefined ? null : callback.arg); }
                }
            } const __ATPRERUN__ = []; const __ATINIT__ = []; const __ATMAIN__ = []; const __ATPOSTRUN__ = []; let runtimeInitialized = false;

            function preRun() { if (Module.preRun) { if (typeof Module.preRun === 'function')Module.preRun = [Module.preRun]; while (Module.preRun.length) { addOnPreRun(Module.preRun.shift()); } }callRuntimeCallbacks(__ATPRERUN__); } function initRuntime() { runtimeInitialized = true; callRuntimeCallbacks(__ATINIT__); } function preMain() { callRuntimeCallbacks(__ATMAIN__); } function postRun() { if (Module.postRun) { if (typeof Module.postRun === 'function')Module.postRun = [Module.postRun]; while (Module.postRun.length) { addOnPostRun(Module.postRun.shift()); } }callRuntimeCallbacks(__ATPOSTRUN__); } function addOnPreRun(cb) { __ATPRERUN__.unshift(cb); } function addOnPostRun(cb) { __ATPOSTRUN__.unshift(cb); } const Math_ceil = Math.ceil; const Math_floor = Math.floor; let runDependencies = 0; let runDependencyWatcher = null; let dependenciesFulfilled = null;

            function addRunDependency(id) { runDependencies++; if (Module.monitorRunDependencies) { Module.monitorRunDependencies(runDependencies); } } function removeRunDependency(id)
            {
                runDependencies--; if (Module.monitorRunDependencies) { Module.monitorRunDependencies(runDependencies); } if (runDependencies == 0)
                {
                    if (runDependencyWatcher !== null) { clearInterval(runDependencyWatcher); runDependencyWatcher = null; } if (dependenciesFulfilled)
                    {
                        const callback = dependenciesFulfilled;

                        dependenciesFulfilled = null; callback();
                    }
                }
            }Module.preloadedImages = {}; Module.preloadedAudios = {}; function abort(what) { if (Module.onAbort) { Module.onAbort(what); }what = String(what); out(what); err(what); ABORT = true; EXITSTATUS = 1; what = `abort(${what}). Build with -s ASSERTIONS=1 for more info.`; throw new WebAssembly.RuntimeError(what); } const dataURIPrefix = 'data:application/octet-stream;base64,';

            function isDataURI(filename) { return String.prototype.startsWith ? filename.startsWith(dataURIPrefix) : filename.indexOf(dataURIPrefix) === 0; } let wasmBinaryFile = 'basis_transcoder.wasm';

            if (!isDataURI(wasmBinaryFile)) { wasmBinaryFile = locateFile(wasmBinaryFile); } function getBinary()
            {
                try
                {
                    if (wasmBinary) { return new Uint8Array(wasmBinary); } if (readBinary) { return readBinary(wasmBinaryFile); }
                    throw 'both async and sync fetching of the wasm failed';
                }
                catch (err) { abort(err); }
            } function getBinaryPromise()
            {
                if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) && typeof fetch === 'function')
                {
                    return fetch(wasmBinaryFile, { credentials: 'same-origin' }).then(function (response)
                    {
                        if (!response.ok) { throw `failed to load wasm binary file at '${wasmBinaryFile}'`; }

                        return response.arrayBuffer();
                    }).catch(function () { return getBinary(); });
                }

                return new Promise(function (resolve, reject) { resolve(getBinary()); });
            } function createWasm()
            {
                const info = { a: asmLibraryArg };

                function receiveInstance(instance, module)
                {
                    const exports = instance.exports;

                    Module.asm = exports; removeRunDependency('wasm-instantiate');
                }addRunDependency('wasm-instantiate'); function receiveInstantiatedSource(output) { receiveInstance(output.instance); } function instantiateArrayBuffer(receiver) { return getBinaryPromise().then(function (binary) { return WebAssembly.instantiate(binary, info); }).then(receiver, function (reason) { err(`failed to asynchronously prepare wasm: ${reason}`); abort(reason); }); } function instantiateAsync()
                {
                    if (!wasmBinary && typeof WebAssembly.instantiateStreaming === 'function' && !isDataURI(wasmBinaryFile) && typeof fetch === 'function')
                    {
                        fetch(wasmBinaryFile, { credentials: 'same-origin' }).then(function (response)
                        {
                            const result = WebAssembly.instantiateStreaming(response, info);

                            return result.then(receiveInstantiatedSource, function (reason) { err(`wasm streaming compile failed: ${reason}`); err('falling back to ArrayBuffer instantiation'); instantiateArrayBuffer(receiveInstantiatedSource); });
                        });
                    }
                    else { return instantiateArrayBuffer(receiveInstantiatedSource); }
                } if (Module.instantiateWasm)
                {
                    try
                    {
                        const exports = Module.instantiateWasm(info, receiveInstance);

                        return exports;
                    }
                    catch (e)
                    {
                        err(`Module.instantiateWasm callback failed with error: ${e}`);

                        return false;
                    }
                }instantiateAsync();

                return {};
            }__ATINIT__.push({ func() { ___wasm_call_ctors(); } }); function ___cxa_allocate_exception(size) { return _malloc(size); } const ___exception_infos = {}; let ___exception_last = 0;

            function __ZSt18uncaught_exceptionv() { return __ZSt18uncaught_exceptionv.uncaught_exceptions > 0; } function ___cxa_throw(ptr, type, destructor)
            {
                ___exception_infos[ptr] = { ptr, adjusted: [ptr], type, destructor, refcount: 0, caught: false, rethrown: false }; ___exception_last = ptr; if (!('uncaught_exception' in __ZSt18uncaught_exceptionv)) { __ZSt18uncaught_exceptionv.uncaught_exceptions = 1; }
                else { __ZSt18uncaught_exceptionv.uncaught_exceptions++; } throw ptr;
            } function getShiftFromSize(size) { switch (size) { case 1:return 0; case 2:return 1; case 4:return 2; case 8:return 3; default:throw new TypeError(`Unknown type size: ${size}`); } } function embind_init_charCodes()
            {
                const codes = new Array(256);

                for (let i = 0; i < 256; ++i) { codes[i] = String.fromCharCode(i); }embind_charCodes = codes;
            } var embind_charCodes = undefined;

            function readLatin1String(ptr)
            {
                let ret = ''; let c = ptr;

                while (HEAPU8[c]) { ret += embind_charCodes[HEAPU8[c++]]; }

                return ret;
            } const awaitingDependencies = {}; const registeredTypes = {}; const typeDependencies = {}; const char_0 = 48; const char_9 = 57;

            function makeLegalFunctionName(name)
            {
                if (undefined === name) { return '_unknown'; }name = name.replace(/[^a-zA-Z0-9_]/g, '$'); const f = name.charCodeAt(0);

                if (f >= char_0 && f <= char_9) { return `_${name}`; }

                return name;
            } function createNamedFunction(name, body)
            {
                name = makeLegalFunctionName(name);

                return new Function('body', `return function ${name}() {\n` + `    "use strict";` + `    return body.apply(this, arguments);\n` + `};\n`)(body);
            } function extendError(baseErrorType, errorName)
            {
                const errorClass = createNamedFunction(errorName, function (message)
                {
                    this.name = errorName; this.message = message; const stack = new Error(message).stack;

                    if (stack !== undefined) { this.stack = `${this.toString()}\n${stack.replace(/^Error(:[^\n]*)?\n/, '')}`; }
                });

                errorClass.prototype = Object.create(baseErrorType.prototype); errorClass.prototype.constructor = errorClass; errorClass.prototype.toString = function ()
                {
                    if (this.message === undefined) { return this.name; }

                    return `${this.name}: ${this.message}`;
                };

                return errorClass;
            } let BindingError;

            function throwBindingError(message) { throw new BindingError(message); } let InternalError;

            function throwInternalError(message) { throw new InternalError(message); } function whenDependentTypesAreResolved(myTypes, dependentTypes, getTypeConverters)
            {
                myTypes.forEach(function (type) { typeDependencies[type] = dependentTypes; }); function onComplete(typeConverters)
                {
                    const myTypeConverters = getTypeConverters(typeConverters);

                    if (myTypeConverters.length !== myTypes.length) { throwInternalError('Mismatched type converter count'); } for (let i = 0; i < myTypes.length; ++i) { registerType(myTypes[i], myTypeConverters[i]); }
                } const typeConverters = new Array(dependentTypes.length); const unregisteredTypes = []; let registered = 0;

                dependentTypes.forEach(function (dt, i)
                {
                    if (registeredTypes.hasOwnProperty(dt)) { typeConverters[i] = registeredTypes[dt]; }
                    else { unregisteredTypes.push(dt); if (!awaitingDependencies.hasOwnProperty(dt)) { awaitingDependencies[dt] = []; }awaitingDependencies[dt].push(function () { typeConverters[i] = registeredTypes[dt]; ++registered; if (registered === unregisteredTypes.length) { onComplete(typeConverters); } }); }
                }); if (unregisteredTypes.length === 0) { onComplete(typeConverters); }
            } function registerType(rawType, registeredInstance, options)
            {
                options = options || {}; if (!('argPackAdvance' in registeredInstance)) { throw new TypeError('registerType registeredInstance requires argPackAdvance'); } const name = registeredInstance.name;

                if (!rawType) { throwBindingError(`type "${name}" must have a positive integer typeid pointer`); } if (registeredTypes.hasOwnProperty(rawType))
                {
                    if (options.ignoreDuplicateRegistrations) { return; }
                    throwBindingError(`Cannot register type '${name}' twice`);
                }registeredTypes[rawType] = registeredInstance; delete typeDependencies[rawType]; if (awaitingDependencies.hasOwnProperty(rawType))
                {
                    const callbacks = awaitingDependencies[rawType];

                    delete awaitingDependencies[rawType]; callbacks.forEach(function (cb) { cb(); });
                }
            } function __embind_register_bool(rawType, name, size, trueValue, falseValue)
            {
                const shift = getShiftFromSize(size);

                name = readLatin1String(name); registerType(rawType, { name, fromWireType(wt) { return !!wt; }, toWireType(destructors, o) { return o ? trueValue : falseValue; }, argPackAdvance: 8, readValueFromPointer(pointer)
                {
                    let heap;

                    if (size === 1) { heap = HEAP8; }
                    else if (size === 2) { heap = HEAP16; }
                    else if (size === 4) { heap = HEAP32; }
                    else { throw new TypeError(`Unknown boolean type size: ${name}`); }

                    return this.fromWireType(heap[pointer >> shift]);
                }, destructorFunction: null });
            } function ClassHandle_isAliasOf(other)
            {
                if (!(this instanceof ClassHandle)) { return false; } if (!(other instanceof ClassHandle)) { return false; } let leftClass = this.$$.ptrType.registeredClass; let left = this.$$.ptr; let rightClass = other.$$.ptrType.registeredClass; let right = other.$$.ptr;

                while (leftClass.baseClass) { left = leftClass.upcast(left); leftClass = leftClass.baseClass; } while (rightClass.baseClass) { right = rightClass.upcast(right); rightClass = rightClass.baseClass; }

                return leftClass === rightClass && left === right;
            } function shallowCopyInternalPointer(o) { return { count: o.count, deleteScheduled: o.deleteScheduled, preservePointerOnDelete: o.preservePointerOnDelete, ptr: o.ptr, ptrType: o.ptrType, smartPtr: o.smartPtr, smartPtrType: o.smartPtrType }; } function throwInstanceAlreadyDeleted(obj) { function getInstanceTypeName(handle) { return handle.$$.ptrType.registeredClass.name; }throwBindingError(`${getInstanceTypeName(obj)} instance already deleted`); } let finalizationGroup = false;

            function detachFinalizer(handle) {} function runDestructor($$)
            {
                if ($$.smartPtr) { $$.smartPtrType.rawDestructor($$.smartPtr); }
                else { $$.ptrType.registeredClass.rawDestructor($$.ptr); }
            } function releaseClassHandle($$)
            {
                $$.count.value -= 1; const toDelete = $$.count.value === 0;

                if (toDelete) { runDestructor($$); }
            } function attachFinalizer(handle)
            {
                if (typeof FinalizationGroup === 'undefined')
                {
                    attachFinalizer = function (handle) { return handle; };

                    return handle;
                }finalizationGroup = new FinalizationGroup(function (iter)
                {
                    for (let result = iter.next(); !result.done; result = iter.next())
                    {
                        const $$ = result.value;

                        if (!$$.ptr) { console.warn(`object already deleted: ${$$.ptr}`); }
                        else { releaseClassHandle($$); }
                    }
                }); attachFinalizer = function (handle)
                {
                    finalizationGroup.register(handle, handle.$$, handle.$$);

                    return handle;
                }; detachFinalizer = function (handle) { finalizationGroup.unregister(handle.$$); };

                return attachFinalizer(handle);
            } function ClassHandle_clone()
            {
                if (!this.$$.ptr) { throwInstanceAlreadyDeleted(this); } if (this.$$.preservePointerOnDelete)
                {
                    this.$$.count.value += 1;

                    return this;
                }
                const clone = attachFinalizer(Object.create(Object.getPrototypeOf(this), { $$: { value: shallowCopyInternalPointer(this.$$) } }));

                clone.$$.count.value += 1; clone.$$.deleteScheduled = false;

                return clone;
            } function ClassHandle_delete() { if (!this.$$.ptr) { throwInstanceAlreadyDeleted(this); } if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) { throwBindingError('Object already scheduled for deletion'); }detachFinalizer(this); releaseClassHandle(this.$$); if (!this.$$.preservePointerOnDelete) { this.$$.smartPtr = undefined; this.$$.ptr = undefined; } } function ClassHandle_isDeleted() { return !this.$$.ptr; } let delayFunction; const deletionQueue = [];

            function flushPendingDeletes()
            {
                while (deletionQueue.length)
                {
                    const obj = deletionQueue.pop();

                    obj.$$.deleteScheduled = false; obj.delete();
                }
            } function ClassHandle_deleteLater()
            {
                if (!this.$$.ptr) { throwInstanceAlreadyDeleted(this); } if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) { throwBindingError('Object already scheduled for deletion'); }deletionQueue.push(this); if (deletionQueue.length === 1 && delayFunction) { delayFunction(flushPendingDeletes); } this.$$.deleteScheduled = true;

                return this;
            } function init_ClassHandle() { ClassHandle.prototype.isAliasOf = ClassHandle_isAliasOf; ClassHandle.prototype.clone = ClassHandle_clone; ClassHandle.prototype.delete = ClassHandle_delete; ClassHandle.prototype.isDeleted = ClassHandle_isDeleted; ClassHandle.prototype.deleteLater = ClassHandle_deleteLater; } function ClassHandle() {} const registeredPointers = {};

            function ensureOverloadTable(proto, methodName, humanName)
            {
                if (undefined === proto[methodName].overloadTable)
                {
                    const prevFunc = proto[methodName];

                    proto[methodName] = function ()
                    {
                        if (!proto[methodName].overloadTable.hasOwnProperty(arguments.length)) { throwBindingError(`Function '${humanName}' called with an invalid number of arguments (${arguments.length}) - expects one of (${proto[methodName].overloadTable})!`); }

                        return proto[methodName].overloadTable[arguments.length].apply(this, arguments);
                    }; proto[methodName].overloadTable = []; proto[methodName].overloadTable[prevFunc.argCount] = prevFunc;
                }
            } function exposePublicSymbol(name, value, numArguments)
            {
                if (Module.hasOwnProperty(name)) { if (undefined === numArguments || undefined !== Module[name].overloadTable && undefined !== Module[name].overloadTable[numArguments]) { throwBindingError(`Cannot register public name '${name}' twice`); }ensureOverloadTable(Module, name, name); if (Module.hasOwnProperty(numArguments)) { throwBindingError(`Cannot register multiple overloads of a function with the same number of arguments (${numArguments})!`); }Module[name].overloadTable[numArguments] = value; }
                else { Module[name] = value; if (undefined !== numArguments) { Module[name].numArguments = numArguments; } }
            } function RegisteredClass(name, constructor, instancePrototype, rawDestructor, baseClass, getActualType, upcast, downcast) { this.name = name; this.constructor = constructor; this.instancePrototype = instancePrototype; this.rawDestructor = rawDestructor; this.baseClass = baseClass; this.getActualType = getActualType; this.upcast = upcast; this.downcast = downcast; this.pureVirtualFunctions = []; } function upcastPointer(ptr, ptrClass, desiredClass)
            {
                while (ptrClass !== desiredClass) { if (!ptrClass.upcast) { throwBindingError(`Expected null or instance of ${desiredClass.name}, got an instance of ${ptrClass.name}`); }ptr = ptrClass.upcast(ptr); ptrClass = ptrClass.baseClass; }

                return ptr;
            } function constNoSmartPtrRawPointerToWireType(destructors, handle)
            {
                if (handle === null)
                {
                    if (this.isReference) { throwBindingError(`null is not a valid ${this.name}`); }

                    return 0;
                } if (!handle.$$) { throwBindingError(`Cannot pass "${_embind_repr(handle)}" as a ${this.name}`); } if (!handle.$$.ptr) { throwBindingError(`Cannot pass deleted object as a pointer of type ${this.name}`); } const handleClass = handle.$$.ptrType.registeredClass; const ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);

                return ptr;
            } function genericPointerToWireType(destructors, handle)
            {
                let ptr;

                if (handle === null)
                {
                    if (this.isReference) { throwBindingError(`null is not a valid ${this.name}`); } if (this.isSmartPointer)
                    {
                        ptr = this.rawConstructor(); if (destructors !== null) { destructors.push(this.rawDestructor, ptr); }

                        return ptr;
                    }

                    return 0;
                } if (!handle.$$) { throwBindingError(`Cannot pass "${_embind_repr(handle)}" as a ${this.name}`); } if (!handle.$$.ptr) { throwBindingError(`Cannot pass deleted object as a pointer of type ${this.name}`); } if (!this.isConst && handle.$$.ptrType.isConst) { throwBindingError(`Cannot convert argument of type ${handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name} to parameter type ${this.name}`); } const handleClass = handle.$$.ptrType.registeredClass;

                ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass); if (this.isSmartPointer)
                {
                    if (undefined === handle.$$.smartPtr) { throwBindingError('Passing raw pointer to smart pointer is illegal'); } switch (this.sharingPolicy)
                    {
                        case 0:if (handle.$$.smartPtrType === this) { ptr = handle.$$.smartPtr; }
                        else { throwBindingError(`Cannot convert argument of type ${handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name} to parameter type ${this.name}`); } break; case 1:ptr = handle.$$.smartPtr; break; case 2:if (handle.$$.smartPtrType === this) { ptr = handle.$$.smartPtr; }
                        else
                        {
                            const clonedHandle = handle.clone();

                            ptr = this.rawShare(ptr, __emval_register(function () { clonedHandle.delete(); })); if (destructors !== null) { destructors.push(this.rawDestructor, ptr); }
                        } break; default:throwBindingError('Unsupporting sharing policy');
                    }
                }

                return ptr;
            } function nonConstNoSmartPtrRawPointerToWireType(destructors, handle)
            {
                if (handle === null)
                {
                    if (this.isReference) { throwBindingError(`null is not a valid ${this.name}`); }

                    return 0;
                } if (!handle.$$) { throwBindingError(`Cannot pass "${_embind_repr(handle)}" as a ${this.name}`); } if (!handle.$$.ptr) { throwBindingError(`Cannot pass deleted object as a pointer of type ${this.name}`); } if (handle.$$.ptrType.isConst) { throwBindingError(`Cannot convert argument of type ${handle.$$.ptrType.name} to parameter type ${this.name}`); } const handleClass = handle.$$.ptrType.registeredClass; const ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);

                return ptr;
            } function simpleReadValueFromPointer(pointer) { return this.fromWireType(HEAPU32[pointer >> 2]); } function RegisteredPointer_getPointee(ptr)
            {
                if (this.rawGetPointee) { ptr = this.rawGetPointee(ptr); }

                return ptr;
            } function RegisteredPointer_destructor(ptr) { if (this.rawDestructor) { this.rawDestructor(ptr); } } function RegisteredPointer_deleteObject(handle) { if (handle !== null) { handle.delete(); } } function downcastPointer(ptr, ptrClass, desiredClass)
            {
                if (ptrClass === desiredClass) { return ptr; } if (undefined === desiredClass.baseClass) { return null; } const rv = downcastPointer(ptr, ptrClass, desiredClass.baseClass);

                if (rv === null) { return null; }

                return desiredClass.downcast(rv);
            } function getInheritedInstanceCount() { return Object.keys(registeredInstances).length; } function getLiveInheritedInstances()
            {
                const rv = [];

                for (const k in registeredInstances) { if (registeredInstances.hasOwnProperty(k)) { rv.push(registeredInstances[k]); } }

                return rv;
            } function setDelayFunction(fn) { delayFunction = fn; if (deletionQueue.length && delayFunction) { delayFunction(flushPendingDeletes); } } function init_embind() { Module.getInheritedInstanceCount = getInheritedInstanceCount; Module.getLiveInheritedInstances = getLiveInheritedInstances; Module.flushPendingDeletes = flushPendingDeletes; Module.setDelayFunction = setDelayFunction; } var registeredInstances = {};

            function getBasestPointer(class_, ptr)
            {
                if (ptr === undefined) { throwBindingError('ptr should not be undefined'); } while (class_.baseClass) { ptr = class_.upcast(ptr); class_ = class_.baseClass; }

                return ptr;
            } function getInheritedInstance(class_, ptr)
            {
                ptr = getBasestPointer(class_, ptr);

                return registeredInstances[ptr];
            } function makeClassHandle(prototype, record)
            {
                if (!record.ptrType || !record.ptr) { throwInternalError('makeClassHandle requires ptr and ptrType'); } const hasSmartPtrType = !!record.smartPtrType; const hasSmartPtr = !!record.smartPtr;

                if (hasSmartPtrType !== hasSmartPtr) { throwInternalError('Both smartPtrType and smartPtr must be specified'); }record.count = { value: 1 };

                return attachFinalizer(Object.create(prototype, { $$: { value: record } }));
            } function RegisteredPointer_fromWireType(ptr)
            {
                const rawPointer = this.getPointee(ptr);

                if (!rawPointer)
                {
                    this.destructor(ptr);

                    return null;
                } const registeredInstance = getInheritedInstance(this.registeredClass, rawPointer);

                if (undefined !== registeredInstance)
                {
                    if (registeredInstance.$$.count.value === 0)
                    {
                        registeredInstance.$$.ptr = rawPointer; registeredInstance.$$.smartPtr = ptr;

                        return registeredInstance.clone();
                    }
                    const rv = registeredInstance.clone();

                    this.destructor(ptr);

                    return rv;
                } function makeDefaultHandle()
                {
                    if (this.isSmartPointer) { return makeClassHandle(this.registeredClass.instancePrototype, { ptrType: this.pointeeType, ptr: rawPointer, smartPtrType: this, smartPtr: ptr }); }

                    return makeClassHandle(this.registeredClass.instancePrototype, { ptrType: this, ptr });
                } const actualType = this.registeredClass.getActualType(rawPointer); const registeredPointerRecord = registeredPointers[actualType];

                if (!registeredPointerRecord) { return makeDefaultHandle.call(this); } let toType;

                if (this.isConst) { toType = registeredPointerRecord.constPointerType; }
                else { toType = registeredPointerRecord.pointerType; } const dp = downcastPointer(rawPointer, this.registeredClass, toType.registeredClass);

                if (dp === null) { return makeDefaultHandle.call(this); } if (this.isSmartPointer) { return makeClassHandle(toType.registeredClass.instancePrototype, { ptrType: toType, ptr: dp, smartPtrType: this, smartPtr: ptr }); }

                return makeClassHandle(toType.registeredClass.instancePrototype, { ptrType: toType, ptr: dp });
            } function init_RegisteredPointer() { RegisteredPointer.prototype.getPointee = RegisteredPointer_getPointee; RegisteredPointer.prototype.destructor = RegisteredPointer_destructor; RegisteredPointer.prototype.argPackAdvance = 8; RegisteredPointer.prototype.readValueFromPointer = simpleReadValueFromPointer; RegisteredPointer.prototype.deleteObject = RegisteredPointer_deleteObject; RegisteredPointer.prototype.fromWireType = RegisteredPointer_fromWireType; } function RegisteredPointer(name, registeredClass, isReference, isConst, isSmartPointer, pointeeType, sharingPolicy, rawGetPointee, rawConstructor, rawShare, rawDestructor)
            {
                this.name = name; this.registeredClass = registeredClass; this.isReference = isReference; this.isConst = isConst; this.isSmartPointer = isSmartPointer; this.pointeeType = pointeeType; this.sharingPolicy = sharingPolicy; this.rawGetPointee = rawGetPointee; this.rawConstructor = rawConstructor; this.rawShare = rawShare; this.rawDestructor = rawDestructor; if (!isSmartPointer && registeredClass.baseClass === undefined)
                {
                    if (isConst) { this.toWireType = constNoSmartPtrRawPointerToWireType; this.destructorFunction = null; }
                    else { this.toWireType = nonConstNoSmartPtrRawPointerToWireType; this.destructorFunction = null; }
                }
                else { this.toWireType = genericPointerToWireType; }
            } function replacePublicSymbol(name, value, numArguments)
            {
                if (!Module.hasOwnProperty(name)) { throwInternalError('Replacing nonexistent public symbol'); } if (undefined !== Module[name].overloadTable && undefined !== numArguments) { Module[name].overloadTable[numArguments] = value; }
                else { Module[name] = value; Module[name].argCount = numArguments; }
            } function embind__requireFunction(signature, rawFunction)
            {
                signature = readLatin1String(signature); function makeDynCaller(dynCall)
                {
                    const args = [];

                    for (let i = 1; i < signature.length; ++i) { args.push(`a${i}`); } const name = `dynCall_${signature}_${rawFunction}`; let body = `return function ${name}(${args.join(', ')}) {\n`;

                    body += `    return dynCall(rawFunction${args.length ? ', ' : ''}${args.join(', ')});\n`; body += '};\n';

                    return new Function('dynCall', 'rawFunction', body)(dynCall, rawFunction);
                } const dc = Module[`dynCall_${signature}`]; const fp = makeDynCaller(dc);

                if (typeof fp !== 'function') { throwBindingError(`unknown function pointer with signature ${signature}: ${rawFunction}`); }

                return fp;
            } let UnboundTypeError;

            function getTypeName(type)
            {
                const ptr = ___getTypeName(type); const rv = readLatin1String(ptr);

                _free(ptr);

                return rv;
            } function throwUnboundTypeError(message, types)
            {
                const unboundTypes = []; const seen = {};

                function visit(type)
                {
                    if (seen[type]) { return; } if (registeredTypes[type]) { return; } if (typeDependencies[type])
                    {
                        typeDependencies[type].forEach(visit);

                        return;
                    }unboundTypes.push(type); seen[type] = true;
                }types.forEach(visit); throw new UnboundTypeError(`${message}: ${unboundTypes.map(getTypeName).join([', '])}`);
            } function __embind_register_class(rawType, rawPointerType, rawConstPointerType, baseClassRawType, getActualTypeSignature, getActualType, upcastSignature, upcast, downcastSignature, downcast, name, destructorSignature, rawDestructor)
            {
                name = readLatin1String(name); getActualType = embind__requireFunction(getActualTypeSignature, getActualType); if (upcast) { upcast = embind__requireFunction(upcastSignature, upcast); } if (downcast) { downcast = embind__requireFunction(downcastSignature, downcast); }rawDestructor = embind__requireFunction(destructorSignature, rawDestructor); const legalFunctionName = makeLegalFunctionName(name);

                exposePublicSymbol(legalFunctionName, function () { throwUnboundTypeError(`Cannot construct ${name} due to unbound types`, [baseClassRawType]); }); whenDependentTypesAreResolved([rawType, rawPointerType, rawConstPointerType], baseClassRawType ? [baseClassRawType] : [], function (base)
                {
                    base = base[0]; let baseClass; let basePrototype;

                    if (baseClassRawType) { baseClass = base.registeredClass; basePrototype = baseClass.instancePrototype; }
                    else { basePrototype = ClassHandle.prototype; } const constructor = createNamedFunction(legalFunctionName, function ()
                    {
                        if (Object.getPrototypeOf(this) !== instancePrototype) { throw new BindingError(`Use 'new' to construct ${name}`); } if (undefined === registeredClass.constructor_body) { throw new BindingError(`${name} has no accessible constructor`); } const body = registeredClass.constructor_body[arguments.length];

                        if (undefined === body) { throw new BindingError(`Tried to invoke ctor of ${name} with invalid number of parameters (${arguments.length}) - expected (${Object.keys(registeredClass.constructor_body).toString()}) parameters instead!`); }

                        return body.apply(this, arguments);
                    }); var instancePrototype = Object.create(basePrototype, { constructor: { value: constructor } });

                    constructor.prototype = instancePrototype; var registeredClass = new RegisteredClass(name, constructor, instancePrototype, rawDestructor, baseClass, getActualType, upcast, downcast); const referenceConverter = new RegisteredPointer(name, registeredClass, true, false, false); const pointerConverter = new RegisteredPointer(`${name}*`, registeredClass, false, false, false); const constPointerConverter = new RegisteredPointer(`${name} const*`, registeredClass, false, true, false);

                    registeredPointers[rawType] = { pointerType: pointerConverter, constPointerType: constPointerConverter }; replacePublicSymbol(legalFunctionName, constructor);

                    return [referenceConverter, pointerConverter, constPointerConverter];
                });
            } function heap32VectorToArray(count, firstElement)
            {
                const array = [];

                for (let i = 0; i < count; i++) { array.push(HEAP32[(firstElement >> 2) + i]); }

                return array;
            } function runDestructors(destructors)
            {
                while (destructors.length)
                {
                    const ptr = destructors.pop(); const del = destructors.pop();

                    del(ptr);
                }
            } function __embind_register_class_constructor(rawClassType, argCount, rawArgTypesAddr, invokerSignature, invoker, rawConstructor)
            {
                assert(argCount > 0); const rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);

                invoker = embind__requireFunction(invokerSignature, invoker); const args = [rawConstructor]; const destructors = [];

                whenDependentTypesAreResolved([], [rawClassType], function (classType)
                {
                    classType = classType[0]; const humanName = `constructor ${classType.name}`;

                    if (undefined === classType.registeredClass.constructor_body) { classType.registeredClass.constructor_body = []; } if (undefined !== classType.registeredClass.constructor_body[argCount - 1]) { throw new BindingError(`Cannot register multiple constructors with identical number of parameters (${argCount - 1}) for class '${classType.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`); }classType.registeredClass.constructor_body[argCount - 1] = function unboundTypeHandler() { throwUnboundTypeError(`Cannot construct ${classType.name} due to unbound types`, rawArgTypes); }; whenDependentTypesAreResolved([], rawArgTypes, function (argTypes)
                    {
                        classType.registeredClass.constructor_body[argCount - 1] = function constructor_body()
                        {
                            if (arguments.length !== argCount - 1) { throwBindingError(`${humanName} called with ${arguments.length} arguments, expected ${argCount - 1}`); }destructors.length = 0; args.length = argCount; for (let i = 1; i < argCount; ++i) { args[i] = argTypes[i].toWireType(destructors, arguments[i - 1]); } const ptr = invoker.apply(null, args);

                            runDestructors(destructors);

                            return argTypes[0].fromWireType(ptr);
                        };

                        return [];
                    });

                    return [];
                });
            } function new_(constructor, argumentList)
            {
                if (!(constructor instanceof Function)) { throw new TypeError(`new_ called with constructor type ${typeof constructor} which is not a function`); } const dummy = createNamedFunction(constructor.name || 'unknownFunctionName', function () {});

                dummy.prototype = constructor.prototype; const obj = new dummy(); const r = constructor.apply(obj, argumentList);

                return r instanceof Object ? r : obj;
            } function craftInvokerFunction(humanName, argTypes, classType, cppInvokerFunc, cppTargetFunc)
            {
                const argCount = argTypes.length;

                if (argCount < 2) { throwBindingError('argTypes array size mismatch! Must at least get return value and \'this\' types!'); } const isClassMethodFunc = argTypes[1] !== null && classType !== null; let needsDestructorStack = false;

                for (var i = 1; i < argTypes.length; ++i) { if (argTypes[i] !== null && argTypes[i].destructorFunction === undefined) { needsDestructorStack = true; break; } } const returns = argTypes[0].name !== 'void'; let argsList = ''; let argsListWired = '';

                for (var i = 0; i < argCount - 2; ++i) { argsList += `${i !== 0 ? ', ' : ''}arg${i}`; argsListWired += `${i !== 0 ? ', ' : ''}arg${i}Wired`; } let invokerFnBody = `return function ${makeLegalFunctionName(humanName)}(${argsList}) {\n` + `if (arguments.length !== ${argCount - 2}) {\n` + `throwBindingError('function ${humanName} called with ' + arguments.length + ' arguments, expected ${argCount - 2} args!');\n` + `}\n`;

                if (needsDestructorStack) { invokerFnBody += 'var destructors = [];\n'; } const dtorStack = needsDestructorStack ? 'destructors' : 'null'; const args1 = ['throwBindingError', 'invoker', 'fn', 'runDestructors', 'retType', 'classParam']; const args2 = [throwBindingError, cppInvokerFunc, cppTargetFunc, runDestructors, argTypes[0], argTypes[1]];

                if (isClassMethodFunc) { invokerFnBody += `var thisWired = classParam.toWireType(${dtorStack}, this);\n`; } for (var i = 0; i < argCount - 2; ++i) { invokerFnBody += `var arg${i}Wired = argType${i}.toWireType(${dtorStack}, arg${i}); // ${argTypes[i + 2].name}\n`; args1.push(`argType${i}`); args2.push(argTypes[i + 2]); } if (isClassMethodFunc) { argsListWired = `thisWired${argsListWired.length > 0 ? ', ' : ''}${argsListWired}`; }invokerFnBody += `${returns ? 'var rv = ' : ''}invoker(fn${argsListWired.length > 0 ? ', ' : ''}${argsListWired});\n`; if (needsDestructorStack) { invokerFnBody += 'runDestructors(destructors);\n'; }
                else
                {
                    for (var i = isClassMethodFunc ? 1 : 2; i < argTypes.length; ++i)
                    {
                        const paramName = i === 1 ? 'thisWired' : `arg${i - 2}Wired`;

                        if (argTypes[i].destructorFunction !== null) { invokerFnBody += `${paramName}_dtor(${paramName}); // ${argTypes[i].name}\n`; args1.push(`${paramName}_dtor`); args2.push(argTypes[i].destructorFunction); }
                    }
                } if (returns) { invokerFnBody += 'var ret = retType.fromWireType(rv);\n' + 'return ret;\n'; }
                else {}invokerFnBody += '}\n'; args1.push(invokerFnBody); const invokerFunction = new_(Function, args1).apply(null, args2);

                return invokerFunction;
            } function __embind_register_class_function(rawClassType, methodName, argCount, rawArgTypesAddr, invokerSignature, rawInvoker, context, isPureVirtual)
            {
                const rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);

                methodName = readLatin1String(methodName); rawInvoker = embind__requireFunction(invokerSignature, rawInvoker); whenDependentTypesAreResolved([], [rawClassType], function (classType)
                {
                    classType = classType[0]; const humanName = `${classType.name}.${methodName}`;

                    if (isPureVirtual) { classType.registeredClass.pureVirtualFunctions.push(methodName); } function unboundTypesHandler() { throwUnboundTypeError(`Cannot call ${humanName} due to unbound types`, rawArgTypes); } const proto = classType.registeredClass.instancePrototype; const method = proto[methodName];

                    if (undefined === method || undefined === method.overloadTable && method.className !== classType.name && method.argCount === argCount - 2) { unboundTypesHandler.argCount = argCount - 2; unboundTypesHandler.className = classType.name; proto[methodName] = unboundTypesHandler; }
                    else { ensureOverloadTable(proto, methodName, humanName); proto[methodName].overloadTable[argCount - 2] = unboundTypesHandler; }whenDependentTypesAreResolved([], rawArgTypes, function (argTypes)
                    {
                        const memberFunction = craftInvokerFunction(humanName, argTypes, classType, rawInvoker, context);

                        if (undefined === proto[methodName].overloadTable) { memberFunction.argCount = argCount - 2; proto[methodName] = memberFunction; }
                        else { proto[methodName].overloadTable[argCount - 2] = memberFunction; }

                        return [];
                    });

                    return [];
                });
            } const emval_free_list = []; const emval_handle_array = [{}, { value: undefined }, { value: null }, { value: true }, { value: false }];

            function __emval_decref(handle) { if (handle > 4 && --emval_handle_array[handle].refcount === 0) { emval_handle_array[handle] = undefined; emval_free_list.push(handle); } } function count_emval_handles()
            {
                let count = 0;

                for (let i = 5; i < emval_handle_array.length; ++i) { if (emval_handle_array[i] !== undefined) { ++count; } }

                return count;
            } function get_first_emval()
            {
                for (let i = 5; i < emval_handle_array.length; ++i) { if (emval_handle_array[i] !== undefined) { return emval_handle_array[i]; } }

                return null;
            } function init_emval() { Module.count_emval_handles = count_emval_handles; Module.get_first_emval = get_first_emval; } function __emval_register(value)
            {
                switch (value)
                {
                    case undefined: { return 1; } case null: { return 2; } case true: { return 3; } case false: { return 4; } default: { const handle = emval_free_list.length ? emval_free_list.pop() : emval_handle_array.length;

                        emval_handle_array[handle] = { refcount: 1, value };

                        return handle; }
                }
            } function __embind_register_emval(rawType, name)
            {
                name = readLatin1String(name); registerType(rawType, { name, fromWireType(handle)
                {
                    const rv = emval_handle_array[handle].value;

                    __emval_decref(handle);

                    return rv;
                }, toWireType(destructors, value) { return __emval_register(value); }, argPackAdvance: 8, readValueFromPointer: simpleReadValueFromPointer, destructorFunction: null });
            } function _embind_repr(v)
            {
                if (v === null) { return 'null'; } const t = typeof v;

                if (t === 'object' || t === 'array' || t === 'function') { return v.toString(); }

                return `${v}`;
            } function floatReadValueFromPointer(name, shift) { switch (shift) { case 2:return function (pointer) { return this.fromWireType(HEAPF32[pointer >> 2]); }; case 3:return function (pointer) { return this.fromWireType(HEAPF64[pointer >> 3]); }; default:throw new TypeError(`Unknown float type: ${name}`); } } function __embind_register_float(rawType, name, size)
            {
                const shift = getShiftFromSize(size);

                name = readLatin1String(name); registerType(rawType, { name, fromWireType(value) { return value; }, toWireType(destructors, value)
                {
                    if (typeof value !== 'number' && typeof value !== 'boolean') { throw new TypeError(`Cannot convert "${_embind_repr(value)}" to ${this.name}`); }

                    return value;
                }, argPackAdvance: 8, readValueFromPointer: floatReadValueFromPointer(name, shift), destructorFunction: null });
            } function __embind_register_function(name, argCount, rawArgTypesAddr, signature, rawInvoker, fn)
            {
                const argTypes = heap32VectorToArray(argCount, rawArgTypesAddr);

                name = readLatin1String(name); rawInvoker = embind__requireFunction(signature, rawInvoker); exposePublicSymbol(name, function () { throwUnboundTypeError(`Cannot call ${name} due to unbound types`, argTypes); }, argCount - 1); whenDependentTypesAreResolved([], argTypes, function (argTypes)
                {
                    const invokerArgsArray = [argTypes[0], null].concat(argTypes.slice(1));

                    replacePublicSymbol(name, craftInvokerFunction(name, invokerArgsArray, null, rawInvoker, fn), argCount - 1);

                    return [];
                });
            } function integerReadValueFromPointer(name, shift, signed) { switch (shift) { case 0:return signed ? function readS8FromPointer(pointer) { return HEAP8[pointer]; } : function readU8FromPointer(pointer) { return HEAPU8[pointer]; }; case 1:return signed ? function readS16FromPointer(pointer) { return HEAP16[pointer >> 1]; } : function readU16FromPointer(pointer) { return HEAPU16[pointer >> 1]; }; case 2:return signed ? function readS32FromPointer(pointer) { return HEAP32[pointer >> 2]; } : function readU32FromPointer(pointer) { return HEAPU32[pointer >> 2]; }; default:throw new TypeError(`Unknown integer type: ${name}`); } } function __embind_register_integer(primitiveType, name, size, minRange, maxRange)
            {
                name = readLatin1String(name); if (maxRange === -1) { maxRange = 4294967295; } const shift = getShiftFromSize(size); let fromWireType = function (value) { return value; };

                if (minRange === 0)
                {
                    const bitshift = 32 - 8 * size;

                    fromWireType = function (value) { return value << bitshift >>> bitshift; };
                } const isUnsignedType = name.indexOf('unsigned') != -1;

                registerType(primitiveType, { name, fromWireType, toWireType(destructors, value)
                {
                    if (typeof value !== 'number' && typeof value !== 'boolean') { throw new TypeError(`Cannot convert "${_embind_repr(value)}" to ${this.name}`); } if (value < minRange || value > maxRange) { throw new TypeError(`Passing a number "${_embind_repr(value)}" from JS side to C/C++ side to an argument of type "${name}", which is outside the valid range [${minRange}, ${maxRange}]!`); }

                    return isUnsignedType ? value >>> 0 : value | 0;
                }, argPackAdvance: 8, readValueFromPointer: integerReadValueFromPointer(name, shift, minRange !== 0), destructorFunction: null });
            } function __embind_register_memory_view(rawType, dataTypeIndex, name)
            {
                const typeMapping = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array]; const TA = typeMapping[dataTypeIndex];

                function decodeMemoryView(handle)
                {
                    handle = handle >> 2; const heap = HEAPU32; const size = heap[handle]; const data = heap[handle + 1];

                    return new TA(buffer, data, size);
                }name = readLatin1String(name); registerType(rawType, { name, fromWireType: decodeMemoryView, argPackAdvance: 8, readValueFromPointer: decodeMemoryView }, { ignoreDuplicateRegistrations: true });
            } function __embind_register_std_string(rawType, name)
            {
                name = readLatin1String(name); const stdStringIsUTF8 = name === 'std::string';

                registerType(rawType, { name, fromWireType(value)
                {
                    const length = HEAPU32[value >> 2]; let str;

                    if (stdStringIsUTF8)
                    {
                        const endChar = HEAPU8[value + 4 + length]; let endCharSwap = 0;

                        if (endChar != 0) { endCharSwap = endChar; HEAPU8[value + 4 + length] = 0; } let decodeStartPtr = value + 4;

                        for (var i = 0; i <= length; ++i)
                        {
                            const currentBytePtr = value + 4 + i;

                            if (HEAPU8[currentBytePtr] == 0)
                            {
                                const stringSegment = UTF8ToString(decodeStartPtr);

                                if (str === undefined) { str = stringSegment; }
                                else { str += String.fromCharCode(0); str += stringSegment; }decodeStartPtr = currentBytePtr + 1;
                            }
                        } if (endCharSwap != 0) { HEAPU8[value + 4 + length] = endCharSwap; }
                    }
                    else
                    {
                        const a = new Array(length);

                        for (var i = 0; i < length; ++i) { a[i] = String.fromCharCode(HEAPU8[value + 4 + i]); }str = a.join('');
                    }_free(value);

                    return str;
                }, toWireType(destructors, value)
                {
                    if (value instanceof ArrayBuffer) { value = new Uint8Array(value); } let getLength; const valueIsOfTypeString = typeof value === 'string';

                    if (!(valueIsOfTypeString || value instanceof Uint8Array || value instanceof Uint8ClampedArray || value instanceof Int8Array)) { throwBindingError('Cannot pass non-string to std::string'); } if (stdStringIsUTF8 && valueIsOfTypeString) { getLength = function () { return lengthBytesUTF8(value); }; }
                    else { getLength = function () { return value.length; }; } const length = getLength(); const ptr = _malloc(4 + length + 1);

                    HEAPU32[ptr >> 2] = length; if (stdStringIsUTF8 && valueIsOfTypeString) { stringToUTF8(value, ptr + 4, length + 1); }
                    else
                    if (valueIsOfTypeString)
                    {
                        for (var i = 0; i < length; ++i)
                        {
                            const charCode = value.charCodeAt(i);

                            if (charCode > 255) { _free(ptr); throwBindingError('String has UTF-16 code units that do not fit in 8 bits'); }HEAPU8[ptr + 4 + i] = charCode;
                        }
                    }
                    else { for (var i = 0; i < length; ++i) { HEAPU8[ptr + 4 + i] = value[i]; } } if (destructors !== null) { destructors.push(_free, ptr); }

                    return ptr;
                }, argPackAdvance: 8, readValueFromPointer: simpleReadValueFromPointer, destructorFunction(ptr) { _free(ptr); } });
            } function __embind_register_std_wstring(rawType, charSize, name)
            {
                name = readLatin1String(name); let decodeString; let encodeString; let getHeap; let lengthBytesUTF; let shift;

                if (charSize === 2) { decodeString = UTF16ToString; encodeString = stringToUTF16; lengthBytesUTF = lengthBytesUTF16; getHeap = function () { return HEAPU16; }; shift = 1; }
                else if (charSize === 4) { decodeString = UTF32ToString; encodeString = stringToUTF32; lengthBytesUTF = lengthBytesUTF32; getHeap = function () { return HEAPU32; }; shift = 2; }registerType(rawType, { name, fromWireType(value)
                {
                    const length = HEAPU32[value >> 2]; const HEAP = getHeap(); let str; const endChar = HEAP[value + 4 + length * charSize >> shift]; let endCharSwap = 0;

                    if (endChar != 0) { endCharSwap = endChar; HEAP[value + 4 + length * charSize >> shift] = 0; } let decodeStartPtr = value + 4;

                    for (let i = 0; i <= length; ++i)
                    {
                        const currentBytePtr = value + 4 + i * charSize;

                        if (HEAP[currentBytePtr >> shift] == 0)
                        {
                            const stringSegment = decodeString(decodeStartPtr);

                            if (str === undefined) { str = stringSegment; }
                            else { str += String.fromCharCode(0); str += stringSegment; }decodeStartPtr = currentBytePtr + charSize;
                        }
                    } if (endCharSwap != 0) { HEAP[value + 4 + length * charSize >> shift] = endCharSwap; }_free(value);

                    return str;
                }, toWireType(destructors, value)
                {
                    if (!(typeof value === 'string')) { throwBindingError(`Cannot pass non-string to C++ string type ${name}`); } const length = lengthBytesUTF(value); const ptr = _malloc(4 + length + charSize);

                    HEAPU32[ptr >> 2] = length >> shift; encodeString(value, ptr + 4, length + charSize); if (destructors !== null) { destructors.push(_free, ptr); }

                    return ptr;
                }, argPackAdvance: 8, readValueFromPointer: simpleReadValueFromPointer, destructorFunction(ptr) { _free(ptr); } });
            } function __embind_register_void(rawType, name) { name = readLatin1String(name); registerType(rawType, { isVoid: true, name, argPackAdvance: 0, fromWireType() { return undefined; }, toWireType(destructors, o) { return undefined; } }); } function requireHandle(handle)
            {
                if (!handle) { throwBindingError(`Cannot use deleted val. handle = ${handle}`); }

                return emval_handle_array[handle].value;
            } function requireRegisteredType(rawType, humanName)
            {
                const impl = registeredTypes[rawType];

                if (undefined === impl) { throwBindingError(`${humanName} has unknown type ${getTypeName(rawType)}`); }

                return impl;
            } function __emval_as(handle, returnType, destructorsRef)
            {
                handle = requireHandle(handle); returnType = requireRegisteredType(returnType, 'emval::as'); const destructors = []; const rd = __emval_register(destructors);

                HEAP32[destructorsRef >> 2] = rd;

                return returnType.toWireType(destructors, handle);
            } const emval_symbols = {};

            function getStringOrSymbol(address)
            {
                const symbol = emval_symbols[address];

                if (symbol === undefined) { return readLatin1String(address); }

                return symbol;
            } const emval_methodCallers = [];

            function __emval_call_void_method(caller, handle, methodName, args) { caller = emval_methodCallers[caller]; handle = requireHandle(handle); methodName = getStringOrSymbol(methodName); caller(handle, methodName, null, args); } function emval_get_global()
            {
                if (typeof globalThis === 'object') { return globalThis; }

                return (function () { return Function; })()('return this')();
            } function __emval_get_global(name)
            {
                if (name === 0) { return __emval_register(emval_get_global()); }
                name = getStringOrSymbol(name);

                return __emval_register(emval_get_global()[name]);
            } function __emval_addMethodCaller(caller)
            {
                const id = emval_methodCallers.length;

                emval_methodCallers.push(caller);

                return id;
            } function __emval_lookupTypes(argCount, argTypes)
            {
                const a = new Array(argCount);

                for (let i = 0; i < argCount; ++i) { a[i] = requireRegisteredType(HEAP32[(argTypes >> 2) + i], `parameter ${i}`); }

                return a;
            } function __emval_get_method_caller(argCount, argTypes)
            {
                const types = __emval_lookupTypes(argCount, argTypes); const retType = types[0]; const signatureName = `${retType.name}_$${types.slice(1).map(function (t) { return t.name; }).join('_')}$`; const params = ['retType']; const args = [retType]; let argsList = '';

                for (var i = 0; i < argCount - 1; ++i) { argsList += `${i !== 0 ? ', ' : ''}arg${i}`; params.push(`argType${i}`); args.push(types[1 + i]); } const functionName = makeLegalFunctionName(`methodCaller_${signatureName}`); let functionBody = `return function ${functionName}(handle, name, destructors, args) {\n`; let offset = 0;

                for (var i = 0; i < argCount - 1; ++i) { functionBody += `    var arg${i} = argType${i}.readValueFromPointer(args${offset ? `+${offset}` : ''});\n`; offset += types[i + 1].argPackAdvance; }functionBody += `    var rv = handle[name](${argsList});\n`; for (var i = 0; i < argCount - 1; ++i) { if (types[i + 1].deleteObject) { functionBody += `    argType${i}.deleteObject(arg${i});\n`; } } if (!retType.isVoid) { functionBody += '    return retType.toWireType(destructors, rv);\n'; }functionBody += '};\n'; params.push(functionBody); const invokerFunction = new_(Function, params).apply(null, args);

                return __emval_addMethodCaller(invokerFunction);
            } function __emval_get_module_property(name)
            {
                name = getStringOrSymbol(name);

                return __emval_register(Module[name]);
            } function __emval_get_property(handle, key)
            {
                handle = requireHandle(handle); key = requireHandle(key);

                return __emval_register(handle[key]);
            } function __emval_incref(handle) { if (handle > 4) { emval_handle_array[handle].refcount += 1; } } function craftEmvalAllocator(argCount)
            {
                let argsList = '';

                for (var i = 0; i < argCount; ++i) { argsList += `${i !== 0 ? ', ' : ''}arg${i}`; } let functionBody = `return function emval_allocator_${argCount}(constructor, argTypes, args) {\n`;

                for (var i = 0; i < argCount; ++i) { functionBody += `var argType${i} = requireRegisteredType(Module['HEAP32'][(argTypes >> 2) + ${i}], "parameter ${i}");\n` + `var arg${i} = argType${i}.readValueFromPointer(args);\n` + `args += argType${i}['argPackAdvance'];\n`; }functionBody += `var obj = new constructor(${argsList});\n` + `return __emval_register(obj);\n` + `}\n`;

                return new Function('requireRegisteredType', 'Module', '__emval_register', functionBody)(requireRegisteredType, Module, __emval_register);
            } const emval_newers = {};

            function __emval_new(handle, argCount, argTypes, args)
            {
                handle = requireHandle(handle); let newer = emval_newers[argCount];

                if (!newer) { newer = craftEmvalAllocator(argCount); emval_newers[argCount] = newer; }

                return newer(handle, argTypes, args);
            } function __emval_new_cstring(v) { return __emval_register(getStringOrSymbol(v)); } function __emval_run_destructors(handle)
            {
                const destructors = emval_handle_array[handle].value;

                runDestructors(destructors); __emval_decref(handle);
            } function _abort() { abort(); } function _emscripten_get_heap_size() { return HEAPU8.length; } function _emscripten_memcpy_big(dest, src, num) { HEAPU8.copyWithin(dest, src, src + num); } function emscripten_realloc_buffer(size)
            {
                try
                {
                    wasmMemory.grow(size - buffer.byteLength + 65535 >> 16); updateGlobalBufferAndViews(wasmMemory.buffer);

                    return 1;
                }
                catch (e) {}
            } function _emscripten_resize_heap(requestedSize)
            {
                const oldSize = _emscripten_get_heap_size(); const PAGE_MULTIPLE = 65536; const maxHeapSize = 2147483648 - PAGE_MULTIPLE;

                if (requestedSize > maxHeapSize) { return false; } const minHeapSize = 16777216;

                for (let cutDown = 1; cutDown <= 4; cutDown *= 2)
                {
                    let overGrownHeapSize = oldSize * (1 + 0.2 / cutDown);

                    overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296); const newSize = Math.min(maxHeapSize, alignUp(Math.max(minHeapSize, requestedSize, overGrownHeapSize), PAGE_MULTIPLE)); const replacement = emscripten_realloc_buffer(newSize);

                    if (replacement) { return true; }
                }

                return false;
            } var PATH = { splitPath(filename)
            {
                const splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;

                return splitPathRe.exec(filename).slice(1);
            }, normalizeArray(parts, allowAboveRoot)
            {
                let up = 0;

                for (let i = parts.length - 1; i >= 0; i--)
                {
                    const last = parts[i];

                    if (last === '.') { parts.splice(i, 1); }
                    else if (last === '..') { parts.splice(i, 1); up++; }
                    else if (up) { parts.splice(i, 1); up--; }
                } if (allowAboveRoot) { for (;up; up--) { parts.unshift('..'); } }

                return parts;
            }, normalize(path)
            {
                const isAbsolute = path.charAt(0) === '/'; const trailingSlash = path.substr(-1) === '/';

                path = PATH.normalizeArray(path.split('/').filter(function (p) { return !!p; }), !isAbsolute).join('/'); if (!path && !isAbsolute) { path = '.'; } if (path && trailingSlash) { path += '/'; }

                return (isAbsolute ? '/' : '') + path;
            }, dirname(path)
            {
                const result = PATH.splitPath(path); const root = result[0]; let dir = result[1];

                if (!root && !dir) { return '.'; } if (dir) { dir = dir.substr(0, dir.length - 1); }

                return root + dir;
            }, basename(path)
            {
                if (path === '/') return '/'; const lastSlash = path.lastIndexOf('/');

                if (lastSlash === -1) return path;

                return path.substr(lastSlash + 1);
            }, extname(path) { return PATH.splitPath(path)[3]; }, join()
            {
                const paths = Array.prototype.slice.call(arguments, 0);

                return PATH.normalize(paths.join('/'));
            }, join2(l, r) { return PATH.normalize(`${l}/${r}`); } }; var SYSCALLS = { mappings: {}, buffers: [null, [], []], printChar(stream, curr)
            {
                const buffer = SYSCALLS.buffers[stream];

                if (curr === 0 || curr === 10) { (stream === 1 ? out : err)(UTF8ArrayToString(buffer, 0)); buffer.length = 0; }
                else { buffer.push(curr); }
            }, varargs: undefined, get()
            {
                SYSCALLS.varargs += 4; const ret = HEAP32[SYSCALLS.varargs - 4 >> 2];

                return ret;
            }, getStr(ptr)
            {
                const ret = UTF8ToString(ptr);

                return ret;
            }, get64(low, high) { return low; } };

            function _fd_close(fd) { return 0; } function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {} function _fd_write(fd, iov, iovcnt, pnum)
            {
                let num = 0;

                for (let i = 0; i < iovcnt; i++)
                {
                    const ptr = HEAP32[iov + i * 8 >> 2]; const len = HEAP32[iov + (i * 8 + 4) >> 2];

                    for (let j = 0; j < len; j++) { SYSCALLS.printChar(fd, HEAPU8[ptr + j]); }num += len;
                }HEAP32[pnum >> 2] = num;

                return 0;
            } function _roundf(d)
            {
                d = Number(d);

                return d >= +0 ? Number(Math_floor(d + +0.5)) : Number(Math_ceil(d - +0.5));
            } function _setTempRet0($i) { setTempRet0($i | 0); }embind_init_charCodes(); BindingError = Module.BindingError = extendError(Error, 'BindingError'); InternalError = Module.InternalError = extendError(Error, 'InternalError'); init_ClassHandle(); init_RegisteredPointer(); init_embind(); UnboundTypeError = Module.UnboundTypeError = extendError(Error, 'UnboundTypeError'); init_emval(); var asmLibraryArg = { G: ___cxa_allocate_exception, D: ___cxa_throw, A: __embind_register_bool, t: __embind_register_class, s: __embind_register_class_constructor, c: __embind_register_class_function, z: __embind_register_emval, j: __embind_register_float, x: __embind_register_function, d: __embind_register_integer, b: __embind_register_memory_view, k: __embind_register_std_string, i: __embind_register_std_wstring, B: __embind_register_void, r: __emval_as, m: __emval_call_void_method, a: __emval_decref, F: __emval_get_global, n: __emval_get_method_caller, p: __emval_get_module_property, f: __emval_get_property, h: __emval_incref, o: __emval_new, g: __emval_new_cstring, q: __emval_run_destructors, E: _abort, w: _emscripten_memcpy_big, y: _emscripten_resize_heap, C: _fd_close, u: _fd_seek, l: _fd_write, memory: wasmMemory, e: _roundf, v: _setTempRet0, table: wasmTable }; const asm = createWasm();

            Module.asm = asm; var ___wasm_call_ctors = Module.___wasm_call_ctors = function () { return (___wasm_call_ctors = Module.___wasm_call_ctors = Module.asm.H).apply(null, arguments); }; var _malloc = Module._malloc = function () { return (_malloc = Module._malloc = Module.asm.I).apply(null, arguments); }; var _free = Module._free = function () { return (_free = Module._free = Module.asm.J).apply(null, arguments); }; var ___getTypeName = Module.___getTypeName = function () { return (___getTypeName = Module.___getTypeName = Module.asm.K).apply(null, arguments); }; var ___embind_register_native_and_builtin_types = Module.___embind_register_native_and_builtin_types = function () { return (___embind_register_native_and_builtin_types = Module.___embind_register_native_and_builtin_types = Module.asm.L).apply(null, arguments); }; var dynCall_viii = Module.dynCall_viii = function () { return (dynCall_viii = Module.dynCall_viii = Module.asm.M).apply(null, arguments); }; var dynCall_ii = Module.dynCall_ii = function () { return (dynCall_ii = Module.dynCall_ii = Module.asm.N).apply(null, arguments); }; var dynCall_vi = Module.dynCall_vi = function () { return (dynCall_vi = Module.dynCall_vi = Module.asm.O).apply(null, arguments); }; var dynCall_v = Module.dynCall_v = function () { return (dynCall_v = Module.dynCall_v = Module.asm.P).apply(null, arguments); }; var dynCall_iii = Module.dynCall_iii = function () { return (dynCall_iii = Module.dynCall_iii = Module.asm.Q).apply(null, arguments); }; var dynCall_vii = Module.dynCall_vii = function () { return (dynCall_vii = Module.dynCall_vii = Module.asm.R).apply(null, arguments); }; var dynCall_iiii = Module.dynCall_iiii = function () { return (dynCall_iiii = Module.dynCall_iiii = Module.asm.S).apply(null, arguments); }; var dynCall_iiiii = Module.dynCall_iiiii = function () { return (dynCall_iiiii = Module.dynCall_iiiii = Module.asm.T).apply(null, arguments); }; var dynCall_iiiiii = Module.dynCall_iiiiii = function () { return (dynCall_iiiiii = Module.dynCall_iiiiii = Module.asm.U).apply(null, arguments); }; var dynCall_iiiiiiii = Module.dynCall_iiiiiiii = function () { return (dynCall_iiiiiiii = Module.dynCall_iiiiiiii = Module.asm.V).apply(null, arguments); }; var dynCall_iiiiiiiii = Module.dynCall_iiiiiiiii = function () { return (dynCall_iiiiiiiii = Module.dynCall_iiiiiiiii = Module.asm.W).apply(null, arguments); }; var dynCall_iidiiii = Module.dynCall_iidiiii = function () { return (dynCall_iidiiii = Module.dynCall_iidiiii = Module.asm.X).apply(null, arguments); }; var dynCall_jiji = Module.dynCall_jiji = function () { return (dynCall_jiji = Module.dynCall_jiji = Module.asm.Y).apply(null, arguments); }; var dynCall_viiiiii = Module.dynCall_viiiiii = function () { return (dynCall_viiiiii = Module.dynCall_viiiiii = Module.asm.Z).apply(null, arguments); }; var dynCall_viiiii = Module.dynCall_viiiii = function () { return (dynCall_viiiii = Module.dynCall_viiiii = Module.asm._).apply(null, arguments); }; var dynCall_viiii = Module.dynCall_viiii = function () { return (dynCall_viiii = Module.dynCall_viiii = Module.asm.$).apply(null, arguments); };

            Module.asm = asm; let calledRun;

            Module.then = function (func)
            {
                if (calledRun) { func(Module); }
                else
                {
                    const old = Module.onRuntimeInitialized;

                    Module.onRuntimeInitialized = function () { if (old)old(); func(Module); };
                }

                return Module;
            }; function ExitStatus(status) { this.name = 'ExitStatus'; this.message = `Program terminated with exit(${status})`; this.status = status; }dependenciesFulfilled = function runCaller() { if (!calledRun)run(); if (!calledRun)dependenciesFulfilled = runCaller; }; function run(args)
            {
                args = args || arguments_; if (runDependencies > 0) { return; }preRun(); if (runDependencies > 0) return; function doRun() { if (calledRun) return; calledRun = true; Module.calledRun = true; if (ABORT) return; initRuntime(); preMain(); if (Module.onRuntimeInitialized)Module.onRuntimeInitialized(); postRun(); } if (Module.setStatus) { Module.setStatus('Running...'); setTimeout(function () { setTimeout(function () { Module.setStatus(''); }, 1); doRun(); }, 1); }
                else { doRun(); }
            }Module.run = run; if (Module.preInit) { if (typeof Module.preInit === 'function')Module.preInit = [Module.preInit]; while (Module.preInit.length > 0) { Module.preInit.pop()(); } }noExitRuntime = true; run();

            return BASIS;
        }
    );


})();

if (typeof exports === 'object' && typeof module === 'object')
{ module.exports = BASIS; }
else if (typeof define === 'function' && define.amd)
{ define([], function () { return BASIS; }); }
else if (typeof exports === 'object')
{ exports.BASIS = BASIS; }
