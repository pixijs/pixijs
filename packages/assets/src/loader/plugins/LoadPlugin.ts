/**
 * All function are optional here. The flow:
 *
 * for every asset,
 *
 * 1. Test the asset url.
 * 2. If test passes call the load function with the url
 * 3. Test to see if the asset should be parsed by the plugin
 * 4. If test is parsed, then run the parse function on the asset.
 *
 * some plugins may only be used for parsing,
 * some only for loading
 * and some for both!
 */
export interface LoadPlugin
{
    /**
     * each url to load will be tested here,
     * if the test is passed the the assets is loaded using the load function below.
     * Good place to test for things like file extensions!
     *
     * @param url - the url to test
     */
    test?(url: string): boolean;

    /**
     * This is the promise that loads the url provided
     * resolves with a loaded asset if
     *
     * @param url - the url to load
     */
    load?<T>(url: string): Promise<T>;

    /**
     * this function is used to test if the parse function should be run on the asset
     * If this returns true then parse is called with the asset
     * @param asset - the asset loaded
     * @param url - the assets url
     */
    testParse?(asset: any, url: string): boolean;

    /**
     * gets called on the asset it testParse passes. Useful to convert a raw asset into something more useful than
     *
     * @param asset - the asset to parse and do something with!
     * @param url - the assets url
     */
    parse?<T>(asset: any, url: string): Promise<T>;
}
