import type { AssetsBundle, AssetsManifest, ResolvedAsset, UnresolvedAsset, UnresolvedAssetObject } from './types';

/**
 * Please use `ResolvedAsset` instead.
 * @memberof PIXI
 * @deprecated since 7.2.0
 */
export type ResolveAsset<T = any> = ResolvedAsset<T>;
/**
 * Please use `ResolvedAsset` instead.
 * @memberof PIXI
 * @deprecated since 7.2.0
 */
export type LoadAsset<T = any> = ResolvedAsset<T>;
/**
 * Please use `AssetsBundle` instead.
 * @memberof PIXI
 * @deprecated since 7.2.0
 */
export type ResolverBundle = AssetsBundle;
/**
 * Please use `AssetsManifest` instead.
 * @memberof PIXI
 * @deprecated since 7.2.0
 */
export type ResolverManifest = AssetsManifest;
/**
 * Please use `UnresolvedAsset[]` instead.
 * @memberof PIXI
 * @deprecated since 7.2.0
 */
export type ResolverAssetsArray = UnresolvedAsset[];
/**
 * Please use `UnresolvedAssetObject` instead.
 * @memberof PIXI
 * @deprecated since 7.2.0
 */
export type ResolverAssetsObject = UnresolvedAssetObject;
