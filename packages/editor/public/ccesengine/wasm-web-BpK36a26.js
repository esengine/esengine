import { E as EDITOR, P as PREVIEW } from './_virtual_internal_constants-DWlew7Dp.js';

function instantiateWasm(wasmUrl, importObject) {
  return fetchBuffer(wasmUrl).then(function (arrayBuffer) {
    return WebAssembly.instantiate(arrayBuffer, importObject);
  });
}
function fetchBuffer(binaryUrl) {
  return new Promise(function (resolve, reject) {
    try {
      if (EDITOR) ; else if (PREVIEW) {
        fetch("/engine_external/?url=" + binaryUrl).then(function (response) {
          return response.arrayBuffer().then(resolve);
        })["catch"](function (e) {});
        return;
      }
      binaryUrl = new URL(binaryUrl, import.meta.url).href;
      fetch(binaryUrl).then(function (response) {
        return response.arrayBuffer().then(resolve);
      })["catch"](function (e) {});
    } catch (e) {
      reject(e);
    }
  });
}
function ensureWasmModuleReady() {
  return Promise.resolve();
}

export { ensureWasmModuleReady as e, fetchBuffer as f, instantiateWasm as i };
//# sourceMappingURL=wasm-web-BpK36a26.js.map
