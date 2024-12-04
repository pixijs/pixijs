import earcut from 'earcut';
import { isMobile } from '../browser/isMobile';
import { isWebGLSupported } from '../browser/isWebGLSupported';
import { EventEmitter } from '../const';
import { removeItems } from '../data/removeItems';
import { uid } from '../data/uid';
import { getResolutionOfUrl } from '../network/getResolutionOfUrl';
import { sayHello } from '../sayHello';

describe('utils', () =>
{
    describe('uid', () =>
    {
        it('should exist', () =>
        {
            expect(uid).toBeInstanceOf(Function);
        });

        it('should return a number', () =>
        {
            expect(uid()).toBeNumber();
        });
    });

    describe('getResolutionOfUrl', () =>
    {
        it('should exist', () =>
        {
            expect(getResolutionOfUrl).toBeInstanceOf(Function);
        });
    });

    describe('sayHello', () =>
    {
        it('should exist', () =>
        {
            expect(sayHello).toBeInstanceOf(Function);
        });
    });

    describe('isWebGLSupported', () =>
    {
        it('should exist', () =>
        {
            expect(isWebGLSupported).toBeInstanceOf(Function);
        });
    });

    describe('.removeItems', () =>
    {
        it('should exist', () =>
        {
            expect(removeItems).toBeInstanceOf(Function);
        });

        it('should return if the start index is greater than or equal to the length of the array', () =>
        {
            const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

            removeItems(arr, arr.length + 1, 5);
            expect(arr.length).toEqual(10);
        });

        it('should return if the remove count is 0', () =>
        {
            const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

            removeItems(arr, 2, 0);
            expect(arr.length).toEqual(10);
        });

        it('should remove the number of elements specified from the array, starting from the start index', () =>
        {
            const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

            removeItems(arr, 3, 4);
            expect(arr).toEqual([1, 2, 3, 8, 9, 10]);
        });

        it('should remove other elements if delete count is > than the number of elements after start index', () =>
        {
            const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

            removeItems(arr, 7, 10);
            expect(arr).toEqual([1, 2, 3, 4, 5, 6, 7]);
        });
    });

    describe('EventEmitter', () =>
    {
        it('should exist', () =>
        {
            expect(EventEmitter).toBeInstanceOf(Function);
        });
    });

    describe('isMobile', () =>
    {
        it('should exist', () =>
        {
            expect(isMobile).toBeObject();
        });

        it('should return a boolean for .any', () =>
        {
            expect(isMobile.any).toBeBoolean();
        });
    });

    describe('earcut', () =>
    {
        it('should exist', () =>
        {
            expect(earcut).toBeInstanceOf(Function);
        });
    });
});
