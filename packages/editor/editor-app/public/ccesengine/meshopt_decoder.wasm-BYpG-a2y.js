var MeshoptDecoder = function () {

  var instance;
  var supported = false;
  var ready = function ready(instantiateWasm) {
    if (instantiateWasm === void 0) {
      instantiateWasm = {};
    }
    if (typeof instantiateWasm !== 'function') {
      return Promise.reject(new Error('No wasm support detected'));
    }
    return instantiateWasm().then(function (result) {
      supported = true;
      instance = result.instance;
      instance.exports.__wasm_call_ctors();
    });
  };
  function decode(fun, target, count, size, source, filter) {
    var sbrk = instance.exports.sbrk;
    var count4 = count + 3 & -4;
    var tp = sbrk(count4 * size);
    var sp = sbrk(source.length);
    var heap = new Uint8Array(instance.exports.memory.buffer);
    heap.set(source, sp);
    var res = fun(tp, count, size, sp, source.length);
    if (res == 0 && filter) {
      filter(tp, count4, size);
    }
    target.set(heap.subarray(tp, tp + count * size));
    sbrk(tp - sbrk(0));
    if (res != 0) {
      throw new Error("Malformed buffer data: " + res);
    }
  }
  var filters = {
    NONE: "",
    OCTAHEDRAL: "meshopt_decodeFilterOct",
    QUATERNION: "meshopt_decodeFilterQuat",
    EXPONENTIAL: "meshopt_decodeFilterExp"
  };
  var decoders = {
    ATTRIBUTES: "meshopt_decodeVertexBuffer",
    TRIANGLES: "meshopt_decodeIndexBuffer",
    INDICES: "meshopt_decodeIndexSequence"
  };
  var workers = [];
  var requestId = 0;
  function createWorker(url) {
    var worker = {
      object: new Worker(url),
      pending: 0,
      requests: {}
    };
    worker.object.onmessage = function (event) {
      var data = event.data;
      worker.pending -= data.count;
      worker.requests[data.id][data.action](data.value);
      delete worker.requests[data.id];
    };
    return worker;
  }
  function initWorkers(count) {
    var source = "var instance; var ready = WebAssembly.instantiate(new Uint8Array([" + new Uint8Array(unpack(wasm)) + "]), {})" + ".then(function(result) { instance = result.instance; instance.exports.__wasm_call_ctors(); });" + "self.onmessage = workerProcess;" + decode.toString() + workerProcess.toString();
    var blob = new Blob([source], {
      type: 'text/javascript'
    });
    var url = URL.createObjectURL(blob);
    for (var i = 0; i < count; ++i) {
      workers[i] = createWorker(url);
    }
    URL.revokeObjectURL(url);
  }
  function decodeWorker(count, size, source, mode, filter) {
    var worker = workers[0];
    for (var i = 1; i < workers.length; ++i) {
      if (workers[i].pending < worker.pending) {
        worker = workers[i];
      }
    }
    return new Promise(function (resolve, reject) {
      var data = new Uint8Array(source);
      var id = requestId++;
      worker.pending += count;
      worker.requests[id] = {
        resolve: resolve,
        reject: reject
      };
      worker.object.postMessage({
        id: id,
        count: count,
        size: size,
        source: data,
        mode: mode,
        filter: filter
      }, [data.buffer]);
    });
  }
  function workerProcess(event) {
    ready.then(function () {
      var data = event.data;
      try {
        var target = new Uint8Array(data.count * data.size);
        decode(instance.exports[data.mode], target, data.count, data.size, data.source, instance.exports[data.filter]);
        self.postMessage({
          id: data.id,
          count: data.count,
          action: "resolve",
          value: target
        }, [target.buffer]);
      } catch (error) {
        self.postMessage({
          id: data.id,
          count: data.count,
          action: "reject",
          value: error
        });
      }
    });
  }
  return {
    ready: ready,
    supported: supported,
    useWorkers: function useWorkers(count) {
      initWorkers(count);
    },
    decodeVertexBuffer: function decodeVertexBuffer(target, count, size, source, filter) {
      decode(instance.exports.meshopt_decodeVertexBuffer, target, count, size, source, instance.exports[filters[filter]]);
    },
    decodeIndexBuffer: function decodeIndexBuffer(target, count, size, source) {
      decode(instance.exports.meshopt_decodeIndexBuffer, target, count, size, source);
    },
    decodeIndexSequence: function decodeIndexSequence(target, count, size, source) {
      decode(instance.exports.meshopt_decodeIndexSequence, target, count, size, source);
    },
    decodeGltfBuffer: function decodeGltfBuffer(target, count, size, source, mode, filter) {
      decode(instance.exports[decoders[mode]], target, count, size, source, instance.exports[filters[filter]]);
    },
    decodeGltfBufferAsync: function decodeGltfBufferAsync(count, size, source, mode, filter) {
      if (workers.length > 0) {
        return decodeWorker(count, size, source, decoders[mode], filters[filter]);
      }
      return ready.then(function () {
        var target = new Uint8Array(count * size);
        decode(instance.exports[decoders[mode]], target, count, size, source, instance.exports[filters[filter]]);
        return target;
      });
    }
  };
}();

export { MeshoptDecoder as default };
//# sourceMappingURL=meshopt_decoder.wasm-BYpG-a2y.js.map
