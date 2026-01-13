"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbURLRoot = void 0;
exports.resolveFileName = resolveFileName;
exports.toLowerCase = toLowerCase;
exports.removeTSExt = removeTSExt;
exports.toFileNameLowerCase = toFileNameLowerCase;
exports.isPathEqual = isPathEqual;
exports.getDbName = getDbName;
function resolveFileName(path) {
    return path.replace(/\\/g, '/');
}
/** Returns lower case string */
function toLowerCase(x) {
    return x.toLowerCase();
}
function removeTSExt(path) {
    return path.replace(/(\.d)?.ts$/, '');
}
// We convert the file names to lower case as key for file name on case insensitive file system
// While doing so we need to handle special characters (eg \u0130) to ensure that we dont convert
// it to lower case, fileName with its lowercase form can exist along side it.
// Handle special characters and make those case sensitive instead
//
// |-#--|-Unicode--|-Char code-|-Desc-------------------------------------------------------------------|
// | 1. | i        | 105       | Ascii i                                                                |
// | 2. | I        | 73        | Ascii I                                                                |
// |-------- Special characters ------------------------------------------------------------------------|
// | 3. | \u0130   | 304       | Upper case I with dot above                                            |
// | 4. | i,\u0307 | 105,775   | i, followed by 775: Lower case of (3rd item)                           |
// | 5. | I,\u0307 | 73,775    | I, followed by 775: Upper case of (4th item), lower case is (4th item) |
// | 6. | \u0131   | 305       | Lower case i without dot, upper case is I (2nd item)                   |
// | 7. | \u00DF   | 223       | Lower case sharp s                                                     |
//
// Because item 3 is special where in its lowercase character has its own
// upper case form we cant convert its case.
// Rest special characters are either already in lower case format or
// they have corresponding upper case character so they dont need special handling
//
// But to avoid having to do string building for most common cases, also ignore
// a-z, 0-9, \u0131, \u00DF, \, /, ., : and space
const fileNameLowerCaseRegExp = /[^\u0130\u0131\u00DFa-z0-9\\/:\-_\. ]+/g;
/**
 * Case insensitive file systems have descripencies in how they handle some characters (eg. turkish Upper case I with dot on top - \u0130)
 * This function is used in places where we want to make file name as a key on these systems
 * It is possible on mac to be able to refer to file name with I with dot on top as a fileName with its lower case form
 * But on windows we cannot. Windows can have fileName with I with dot on top next to its lower case and they can not each be referred with the lowercase forms
 * Technically we would want this function to be platform sepcific as well but
 * our api has till now only taken caseSensitive as the only input and just for some characters we dont want to update API and ensure all customers use those api
 * We could use upper case and we would still need to deal with the descripencies but
 * we want to continue using lower case since in most cases filenames are lowercasewe and wont need any case changes and avoid having to store another string for the key
 * So for this function purpose, we go ahead and assume character I with dot on top it as case sensitive since its very unlikely to use lower case form of that special character
 */
function toFileNameLowerCase(x) {
    return fileNameLowerCaseRegExp.test(x) ?
        x.replace(fileNameLowerCaseRegExp, toLowerCase) :
        x;
}
function isPathEqual(a, b) {
    return toFileNameLowerCase(a) === toFileNameLowerCase(b);
}
const reg = /^db:\/\/(.*?)\//;
function getDbName(dbURL) {
    return reg.exec(dbURL)?.[1];
}
exports.dbURLRoot = 'db://';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb3JlL3NjcmlwdGluZy91dGlscy9wYXRoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLDBDQUVDO0FBR0Qsa0NBRUM7QUFFRCxrQ0FFQztBQW1DRCxrREFJQztBQUNELGtDQUVDO0FBRUQsOEJBRUM7QUF6REQsU0FBZ0IsZUFBZSxDQUFDLElBQVk7SUFDeEMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNwQyxDQUFDO0FBRUQsZ0NBQWdDO0FBQ2hDLFNBQWdCLFdBQVcsQ0FBQyxDQUFTO0lBQ2pDLE9BQU8sQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQzNCLENBQUM7QUFFRCxTQUFnQixXQUFXLENBQUMsSUFBWTtJQUNwQyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQzFDLENBQUM7QUFDRCwrRkFBK0Y7QUFDL0YsaUdBQWlHO0FBQ2pHLDhFQUE4RTtBQUM5RSxrRUFBa0U7QUFDbEUsRUFBRTtBQUNGLHlHQUF5RztBQUN6Ryx5R0FBeUc7QUFDekcseUdBQXlHO0FBQ3pHLHlHQUF5RztBQUN6Ryx5R0FBeUc7QUFDekcseUdBQXlHO0FBQ3pHLHlHQUF5RztBQUN6Ryx5R0FBeUc7QUFDekcseUdBQXlHO0FBQ3pHLEVBQUU7QUFDRix5RUFBeUU7QUFDekUsNENBQTRDO0FBQzVDLHFFQUFxRTtBQUNyRSxrRkFBa0Y7QUFDbEYsRUFBRTtBQUNGLCtFQUErRTtBQUMvRSxpREFBaUQ7QUFDakQsTUFBTSx1QkFBdUIsR0FBRyx5Q0FBeUMsQ0FBQztBQUMxRTs7Ozs7Ozs7OztHQVVHO0FBQ0gsU0FBZ0IsbUJBQW1CLENBQUMsQ0FBUztJQUN6QyxPQUFPLHVCQUF1QixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BDLENBQUMsQ0FBQyxPQUFPLENBQUMsdUJBQXVCLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUNqRCxDQUFDLENBQUM7QUFDVixDQUFDO0FBQ0QsU0FBZ0IsV0FBVyxDQUFDLENBQVMsRUFBRSxDQUFTO0lBQzVDLE9BQU8sbUJBQW1CLENBQUMsQ0FBQyxDQUFDLEtBQUssbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDN0QsQ0FBQztBQUNELE1BQU0sR0FBRyxHQUFHLGlCQUFpQixDQUFDO0FBQzlCLFNBQWdCLFNBQVMsQ0FBQyxLQUFhO0lBQ25DLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2hDLENBQUM7QUFFWSxRQUFBLFNBQVMsR0FBRyxPQUFPLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJcclxuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVGaWxlTmFtZShwYXRoOiBzdHJpbmcpe1xyXG4gICAgcmV0dXJuIHBhdGgucmVwbGFjZSgvXFxcXC9nLCAnLycpO1xyXG59XHJcblxyXG4vKiogUmV0dXJucyBsb3dlciBjYXNlIHN0cmluZyAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdG9Mb3dlckNhc2UoeDogc3RyaW5nKSB7XHJcbiAgICByZXR1cm4geC50b0xvd2VyQ2FzZSgpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlVFNFeHQocGF0aDogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgIHJldHVybiBwYXRoLnJlcGxhY2UoLyhcXC5kKT8udHMkLywgJycpO1xyXG59XHJcbi8vIFdlIGNvbnZlcnQgdGhlIGZpbGUgbmFtZXMgdG8gbG93ZXIgY2FzZSBhcyBrZXkgZm9yIGZpbGUgbmFtZSBvbiBjYXNlIGluc2Vuc2l0aXZlIGZpbGUgc3lzdGVtXHJcbi8vIFdoaWxlIGRvaW5nIHNvIHdlIG5lZWQgdG8gaGFuZGxlIHNwZWNpYWwgY2hhcmFjdGVycyAoZWcgXFx1MDEzMCkgdG8gZW5zdXJlIHRoYXQgd2UgZG9udCBjb252ZXJ0XHJcbi8vIGl0IHRvIGxvd2VyIGNhc2UsIGZpbGVOYW1lIHdpdGggaXRzIGxvd2VyY2FzZSBmb3JtIGNhbiBleGlzdCBhbG9uZyBzaWRlIGl0LlxyXG4vLyBIYW5kbGUgc3BlY2lhbCBjaGFyYWN0ZXJzIGFuZCBtYWtlIHRob3NlIGNhc2Ugc2Vuc2l0aXZlIGluc3RlYWRcclxuLy9cclxuLy8gfC0jLS18LVVuaWNvZGUtLXwtQ2hhciBjb2RlLXwtRGVzYy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS18XHJcbi8vIHwgMS4gfCBpICAgICAgICB8IDEwNSAgICAgICB8IEFzY2lpIGkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxyXG4vLyB8IDIuIHwgSSAgICAgICAgfCA3MyAgICAgICAgfCBBc2NpaSBJICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcclxuLy8gfC0tLS0tLS0tIFNwZWNpYWwgY2hhcmFjdGVycyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS18XHJcbi8vIHwgMy4gfCBcXHUwMTMwICAgfCAzMDQgICAgICAgfCBVcHBlciBjYXNlIEkgd2l0aCBkb3QgYWJvdmUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcclxuLy8gfCA0LiB8IGksXFx1MDMwNyB8IDEwNSw3NzUgICB8IGksIGZvbGxvd2VkIGJ5IDc3NTogTG93ZXIgY2FzZSBvZiAoM3JkIGl0ZW0pICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxyXG4vLyB8IDUuIHwgSSxcXHUwMzA3IHwgNzMsNzc1ICAgIHwgSSwgZm9sbG93ZWQgYnkgNzc1OiBVcHBlciBjYXNlIG9mICg0dGggaXRlbSksIGxvd2VyIGNhc2UgaXMgKDR0aCBpdGVtKSB8XHJcbi8vIHwgNi4gfCBcXHUwMTMxICAgfCAzMDUgICAgICAgfCBMb3dlciBjYXNlIGkgd2l0aG91dCBkb3QsIHVwcGVyIGNhc2UgaXMgSSAoMm5kIGl0ZW0pICAgICAgICAgICAgICAgICAgIHxcclxuLy8gfCA3LiB8IFxcdTAwREYgICB8IDIyMyAgICAgICB8IExvd2VyIGNhc2Ugc2hhcnAgcyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxyXG4vL1xyXG4vLyBCZWNhdXNlIGl0ZW0gMyBpcyBzcGVjaWFsIHdoZXJlIGluIGl0cyBsb3dlcmNhc2UgY2hhcmFjdGVyIGhhcyBpdHMgb3duXHJcbi8vIHVwcGVyIGNhc2UgZm9ybSB3ZSBjYW50IGNvbnZlcnQgaXRzIGNhc2UuXHJcbi8vIFJlc3Qgc3BlY2lhbCBjaGFyYWN0ZXJzIGFyZSBlaXRoZXIgYWxyZWFkeSBpbiBsb3dlciBjYXNlIGZvcm1hdCBvclxyXG4vLyB0aGV5IGhhdmUgY29ycmVzcG9uZGluZyB1cHBlciBjYXNlIGNoYXJhY3RlciBzbyB0aGV5IGRvbnQgbmVlZCBzcGVjaWFsIGhhbmRsaW5nXHJcbi8vXHJcbi8vIEJ1dCB0byBhdm9pZCBoYXZpbmcgdG8gZG8gc3RyaW5nIGJ1aWxkaW5nIGZvciBtb3N0IGNvbW1vbiBjYXNlcywgYWxzbyBpZ25vcmVcclxuLy8gYS16LCAwLTksIFxcdTAxMzEsIFxcdTAwREYsIFxcLCAvLCAuLCA6IGFuZCBzcGFjZVxyXG5jb25zdCBmaWxlTmFtZUxvd2VyQ2FzZVJlZ0V4cCA9IC9bXlxcdTAxMzBcXHUwMTMxXFx1MDBERmEtejAtOVxcXFwvOlxcLV9cXC4gXSsvZztcclxuLyoqXHJcbiAqIENhc2UgaW5zZW5zaXRpdmUgZmlsZSBzeXN0ZW1zIGhhdmUgZGVzY3JpcGVuY2llcyBpbiBob3cgdGhleSBoYW5kbGUgc29tZSBjaGFyYWN0ZXJzIChlZy4gdHVya2lzaCBVcHBlciBjYXNlIEkgd2l0aCBkb3Qgb24gdG9wIC0gXFx1MDEzMClcclxuICogVGhpcyBmdW5jdGlvbiBpcyB1c2VkIGluIHBsYWNlcyB3aGVyZSB3ZSB3YW50IHRvIG1ha2UgZmlsZSBuYW1lIGFzIGEga2V5IG9uIHRoZXNlIHN5c3RlbXNcclxuICogSXQgaXMgcG9zc2libGUgb24gbWFjIHRvIGJlIGFibGUgdG8gcmVmZXIgdG8gZmlsZSBuYW1lIHdpdGggSSB3aXRoIGRvdCBvbiB0b3AgYXMgYSBmaWxlTmFtZSB3aXRoIGl0cyBsb3dlciBjYXNlIGZvcm1cclxuICogQnV0IG9uIHdpbmRvd3Mgd2UgY2Fubm90LiBXaW5kb3dzIGNhbiBoYXZlIGZpbGVOYW1lIHdpdGggSSB3aXRoIGRvdCBvbiB0b3AgbmV4dCB0byBpdHMgbG93ZXIgY2FzZSBhbmQgdGhleSBjYW4gbm90IGVhY2ggYmUgcmVmZXJyZWQgd2l0aCB0aGUgbG93ZXJjYXNlIGZvcm1zXHJcbiAqIFRlY2huaWNhbGx5IHdlIHdvdWxkIHdhbnQgdGhpcyBmdW5jdGlvbiB0byBiZSBwbGF0Zm9ybSBzZXBjaWZpYyBhcyB3ZWxsIGJ1dFxyXG4gKiBvdXIgYXBpIGhhcyB0aWxsIG5vdyBvbmx5IHRha2VuIGNhc2VTZW5zaXRpdmUgYXMgdGhlIG9ubHkgaW5wdXQgYW5kIGp1c3QgZm9yIHNvbWUgY2hhcmFjdGVycyB3ZSBkb250IHdhbnQgdG8gdXBkYXRlIEFQSSBhbmQgZW5zdXJlIGFsbCBjdXN0b21lcnMgdXNlIHRob3NlIGFwaVxyXG4gKiBXZSBjb3VsZCB1c2UgdXBwZXIgY2FzZSBhbmQgd2Ugd291bGQgc3RpbGwgbmVlZCB0byBkZWFsIHdpdGggdGhlIGRlc2NyaXBlbmNpZXMgYnV0XHJcbiAqIHdlIHdhbnQgdG8gY29udGludWUgdXNpbmcgbG93ZXIgY2FzZSBzaW5jZSBpbiBtb3N0IGNhc2VzIGZpbGVuYW1lcyBhcmUgbG93ZXJjYXNld2UgYW5kIHdvbnQgbmVlZCBhbnkgY2FzZSBjaGFuZ2VzIGFuZCBhdm9pZCBoYXZpbmcgdG8gc3RvcmUgYW5vdGhlciBzdHJpbmcgZm9yIHRoZSBrZXlcclxuICogU28gZm9yIHRoaXMgZnVuY3Rpb24gcHVycG9zZSwgd2UgZ28gYWhlYWQgYW5kIGFzc3VtZSBjaGFyYWN0ZXIgSSB3aXRoIGRvdCBvbiB0b3AgaXQgYXMgY2FzZSBzZW5zaXRpdmUgc2luY2UgaXRzIHZlcnkgdW5saWtlbHkgdG8gdXNlIGxvd2VyIGNhc2UgZm9ybSBvZiB0aGF0IHNwZWNpYWwgY2hhcmFjdGVyXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdG9GaWxlTmFtZUxvd2VyQ2FzZSh4OiBzdHJpbmcpIHtcclxuICAgIHJldHVybiBmaWxlTmFtZUxvd2VyQ2FzZVJlZ0V4cC50ZXN0KHgpID9cclxuICAgICAgICB4LnJlcGxhY2UoZmlsZU5hbWVMb3dlckNhc2VSZWdFeHAsIHRvTG93ZXJDYXNlKSA6XHJcbiAgICAgICAgeDtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gaXNQYXRoRXF1YWwoYTogc3RyaW5nLCBiOiBzdHJpbmcpe1xyXG4gICAgcmV0dXJuIHRvRmlsZU5hbWVMb3dlckNhc2UoYSkgPT09IHRvRmlsZU5hbWVMb3dlckNhc2UoYik7XHJcbn1cclxuY29uc3QgcmVnID0gL15kYjpcXC9cXC8oLio/KVxcLy87XHJcbmV4cG9ydCBmdW5jdGlvbiBnZXREYk5hbWUoZGJVUkw6IHN0cmluZyl7XHJcbiAgICByZXR1cm4gcmVnLmV4ZWMoZGJVUkwpPy5bMV07XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBkYlVSTFJvb3QgPSAnZGI6Ly8nO1xyXG4iXX0=