import { g as getDefaultExportFromCjs } from './_commonjsHelpers-B85MJLTf.js';

function _mergeNamespaces(n, m) {
	m.forEach(function (e) {
		e && typeof e !== 'string' && !Array.isArray(e) && Object.keys(e).forEach(function (k) {
			if (k !== 'default' && !(k in n)) {
				var d = Object.getOwnPropertyDescriptor(e, k);
				Object.defineProperty(n, k, d.get ? d : {
					enumerable: true,
					get: function () { return e[k]; }
				});
			}
		});
	});
	return Object.freeze(n);
}

var meshopt_decoder_asm$1 = {exports: {}};

(function (module, exports$1) {
	// This file is part of meshoptimizer library and is distributed under the terms of MIT License.
	// Copyright (C) 2016-2023, by Arseny Kapoulkine (arseny.kapoulkine@gmail.com)
	var MeshoptDecoder = (function () {

		var instance = {};

		var ready = Promise.resolve().then(function () {
			instance.exports = instantiate();
			instance.exports.__wasm_call_ctors();
		});

		function unpack(data) {
			var result = new Uint8Array(data.length);
			for (var i = 0; i < data.length; ++i) {
				var ch = data.charCodeAt(i);
				result[i] = ch > 96 ? ch - 97 : ch > 64 ? ch - 39 : ch + 4;
			}
			var write = 0;
			for (var i = 0; i < data.length; ++i) {
				result[write++] = (result[i] < 60) ? wasmpack[result[i]] : (result[i] - 60) * 64 + result[++i];
			}
			return result.buffer.slice(0, write);
		}

		function decode(fun, target, count, size, source, filter) {
			var sbrk = instance.exports.sbrk;
			var count4 = (count + 3) & -4;
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
			EXPONENTIAL: "meshopt_decodeFilterExp",
		};

		var decoders = {
			ATTRIBUTES: "meshopt_decodeVertexBuffer",
			TRIANGLES: "meshopt_decodeIndexBuffer",
			INDICES: "meshopt_decodeIndexSequence",
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
			var source =
				"var instance; var ready = WebAssembly.instantiate(new Uint8Array([" + new Uint8Array(unpack(wasm)) + "]), {})" +
				".then(function(result) { instance = result.instance; instance.exports.__wasm_call_ctors(); });" +
				"self.onmessage = workerProcess;" +
				decode.toString() + workerProcess.toString();

			var blob = new Blob([source], { type: 'text/javascript' });
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
				worker.requests[id] = { resolve: resolve, reject: reject };
				worker.object.postMessage({ id: id, count: count, size: size, source: data, mode: mode, filter: filter }, [data.buffer]);
			});
		}

		function workerProcess(event) {
			ready.then(function () {
				var data = event.data;
				try {
					var target = new Uint8Array(data.count * data.size);
					decode(instance.exports[data.mode], target, data.count, data.size, data.source, instance.exports[data.filter]);
					self.postMessage({ id: data.id, count: data.count, action: "resolve", value: target }, [target.buffer]);
				} catch (error) {
					self.postMessage({ id: data.id, count: data.count, action: "reject", value: error });
				}
			});
		}

		return {
			ready: ready,
			supported: true,
			useWorkers: function (count) {
				initWorkers(count);
			},
			decodeVertexBuffer: function (target, count, size, source, filter) {
				decode(instance.exports.meshopt_decodeVertexBuffer, target, count, size, source, instance.exports[filters[filter]]);
			},
			decodeIndexBuffer: function (target, count, size, source) {
				decode(instance.exports.meshopt_decodeIndexBuffer, target, count, size, source);
			},
			decodeIndexSequence: function (target, count, size, source) {
				decode(instance.exports.meshopt_decodeIndexSequence, target, count, size, source);
			},
			decodeGltfBuffer: function (target, count, size, source, mode, filter) {
				decode(instance.exports[decoders[mode]], target, count, size, source, instance.exports[filters[filter]]);
			},
			decodeGltfBufferAsync: function (count, size, source, mode, filter) {
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
	})();

	// UMD-style export
	module.exports = MeshoptDecoder;

	function instantiate(asmLibraryArg) {
		var bufferView;
		var base64ReverseLookup = new Uint8Array(123/*'z'+1*/);
		for (var i = 25; i >= 0; --i) {
			base64ReverseLookup[48 + i] = 52 + i; // '0-9'
			base64ReverseLookup[65 + i] = i; // 'A-Z'
			base64ReverseLookup[97 + i] = 26 + i; // 'a-z'
		}
		base64ReverseLookup[43] = 62; // '+'
		base64ReverseLookup[47] = 63; // '/'
		/** @noinline Inlining this function would mean expanding the base64 string 4x times in the source code, which Closure seems to be happy to do. */
		function base64DecodeToExistingUint8Array(uint8Array, offset, b64) {
			var b1, b2, i = 0, j = offset, bLength = b64.length, end = offset + (bLength * 3 >> 2) - (b64[bLength - 2] == '=') - (b64[bLength - 1] == '=');
			for (; i < bLength; i += 4) {
				b1 = base64ReverseLookup[b64.charCodeAt(i + 1)];
				b2 = base64ReverseLookup[b64.charCodeAt(i + 2)];
				uint8Array[j++] = base64ReverseLookup[b64.charCodeAt(i)] << 2 | b1 >> 4;
				if (j < end) uint8Array[j++] = b1 << 4 | b2 >> 2;
				if (j < end) uint8Array[j++] = b2 << 6 | base64ReverseLookup[b64.charCodeAt(i + 3)];
			}
		}
		function initActiveSegments(imports) {
			base64DecodeToExistingUint8Array(bufferView, 1024, "EGQAAA==");
		}
		function asmFunc(env) {
			var buffer = new ArrayBuffer(65536);
			var HEAP8 = new Int8Array(buffer);
			var HEAP16 = new Int16Array(buffer);
			var HEAP32 = new Int32Array(buffer);
			var HEAPU8 = new Uint8Array(buffer);
			var Math_imul = Math.imul;
			var global$0 = 25616;
			function $0() {

			}

			function $1($0_1, $1_1, $2_1, $3_1, $4_1) {
				$0_1 = $0_1 | 0;
				$1_1 = $1_1 | 0;
				$2_1 = $2_1 | 0;
				$3_1 = $3_1 | 0;
				$4_1 = $4_1 | 0;
				var $20 = 0, $19 = 0, $21 = 0, $6 = 0, i64toi32_i32$1 = 0, $8 = 0, $18 = 0, i64toi32_i32$0 = 0, $17 = 0, $13 = 0, $11 = 0, $60 = 0, $7 = 0, $12 = 0, $15 = 0, $10 = 0, $14 = 0, $61 = 0, $62 = 0, $5_1 = 0, $16 = 0, $9 = 0, $117 = 0, $137 = 0, $152 = 0, $166 = 0, $182 = 0, $197 = 0, $212 = 0, $226 = 0, $242 = 0, $257 = 0, $272 = 0, $286 = 0, $302 = 0, $317 = 0, $332 = 0, $338 = 0, $346 = 0, $361 = 0, $380 = 0, $396 = 0, $410 = 0, $426 = 0, $440 = 0, $456 = 0, $470 = 0, $486 = 0, $500 = 0, $516 = 0, $530 = 0, $546 = 0, $560 = 0, $576 = 0, $582 = 0, $590 = 0, $600 = 0, $605 = 0, wasm2js_i32$0 = 0, wasm2js_i32$1 = 0, wasm2js_i32$2 = 0;
				$5_1 = global$0 - 8704 | 0;
				global$0 = $5_1;
				$6 = -2;
				label$1: {
					if (($2_1 + 1 | 0) >>> 0 > $4_1 >>> 0) {
						break label$1
					}
					$6 = -1;
					if ((HEAPU8[$3_1 >> 0] | 0 | 0) != (160 | 0)) {
						break label$1
					}
					$7 = $3_1 + $4_1 | 0;
					$8 = $4($5_1 | 0, $7 - $2_1 | 0 | 0, $2_1 | 0) | 0;
					$4_1 = (8192 >>> 0) / ($2_1 >>> 0) | 0;
					$6 = $3_1 + 1 | 0;
					label$2: {
						if (!$2_1) {
							break label$2
						}
						$4_1 = $4_1 & 16368 | 0;
						$9 = $4_1 >>> 0 < 256 >>> 0 ? $4_1 : 256;
						$10 = 0;
						label$3: while (1) {
							if ($10 >>> 0 >= $1_1 >>> 0) {
								break label$2
							}
							$11 = ($10 + $9 | 0) >>> 0 < $1_1 >>> 0 ? $9 : $1_1 - $10 | 0;
							$4_1 = $11 + 15 | 0;
							$12 = (($4_1 >>> 4 | 0) + 3 | 0) >>> 2 | 0;
							label$4: {
								label$5: {
									label$6: {
										label$7: {
											$13 = $4_1 & -16 | 0;
											if (!$13) {
												break label$7
											}
											$14 = 0;
											$15 = 1;
											$16 = $8 + 256 | 0;
											$17 = $6;
											label$8: while (1) {
												if (($7 - $17 | 0) >>> 0 < $12 >>> 0) {
													break label$5
												}
												label$9: {
													$6 = $17 + $12 | 0;
													if (($7 - $6 | 0) >>> 0 < 24 >>> 0) {
														break label$9
													}
													$4_1 = 16;
													$18 = 0;
													label$10: while (1) {
														$3_1 = $4_1;
														$19 = $4_1 + -16 | 0;
														$4_1 = $19 + ($8 + 8448 | 0) | 0;
														label$11: {
															label$12: {
																switch (((HEAPU8[($17 + ($19 >>> 6 | 0) | 0) >> 0] | 0) >>> ($18 & 6 | 0) | 0) & 3 | 0 | 0) {
																	default:
																		i64toi32_i32$1 = $4_1;
																		i64toi32_i32$0 = 0;
																		HEAP32[$4_1 >> 2] = 0;
																		HEAP32[($4_1 + 4 | 0) >> 2] = i64toi32_i32$0;
																		i64toi32_i32$1 = $4_1 + 8 | 0;
																		i64toi32_i32$0 = 0;
																		HEAP32[i64toi32_i32$1 >> 2] = 0;
																		HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
																		break label$11;
																	case 1:
																		$19 = HEAPU8[$6 >> 0] | 0;
																		$20 = $19 >>> 6 | 0;
																		$117 = $20;
																		$20 = ($20 | 0) == (3 | 0);
																		HEAP8[$4_1 >> 0] = (wasm2js_i32$0 = HEAPU8[($6 + 4 | 0) >> 0] | 0, wasm2js_i32$1 = $117, wasm2js_i32$2 = $20, wasm2js_i32$2 ? wasm2js_i32$0 : wasm2js_i32$1);
																		$4_1 = ($8 + 8448 | 0) + $3_1 | 0;
																		$20 = ($6 + 4 | 0) + $20 | 0;
																		$21 = ($19 >>> 4 | 0) & 3 | 0;
																		$137 = $21;
																		$21 = ($21 | 0) == (3 | 0);
																		HEAP8[($4_1 + -15 | 0) >> 0] = (wasm2js_i32$0 = HEAPU8[$20 >> 0] | 0, wasm2js_i32$1 = $137, wasm2js_i32$2 = $21, wasm2js_i32$2 ? wasm2js_i32$0 : wasm2js_i32$1);
																		$20 = $20 + $21 | 0;
																		$21 = ($19 >>> 2 | 0) & 3 | 0;
																		$152 = $21;
																		$21 = ($21 | 0) == (3 | 0);
																		HEAP8[($4_1 + -14 | 0) >> 0] = (wasm2js_i32$0 = HEAPU8[$20 >> 0] | 0, wasm2js_i32$1 = $152, wasm2js_i32$2 = $21, wasm2js_i32$2 ? wasm2js_i32$0 : wasm2js_i32$1);
																		$20 = $20 + $21 | 0;
																		$19 = $19 & 3 | 0;
																		$166 = $19;
																		$19 = ($19 | 0) == (3 | 0);
																		HEAP8[($4_1 + -13 | 0) >> 0] = (wasm2js_i32$0 = HEAPU8[$20 >> 0] | 0, wasm2js_i32$1 = $166, wasm2js_i32$2 = $19, wasm2js_i32$2 ? wasm2js_i32$0 : wasm2js_i32$1);
																		$20 = $20 + $19 | 0;
																		$19 = HEAPU8[($6 + 1 | 0) >> 0] | 0;
																		$21 = $19 >>> 6 | 0;
																		$182 = $21;
																		$21 = ($21 | 0) == (3 | 0);
																		HEAP8[($4_1 + -12 | 0) >> 0] = (wasm2js_i32$0 = HEAPU8[$20 >> 0] | 0, wasm2js_i32$1 = $182, wasm2js_i32$2 = $21, wasm2js_i32$2 ? wasm2js_i32$0 : wasm2js_i32$1);
																		$20 = $20 + $21 | 0;
																		$21 = ($19 >>> 4 | 0) & 3 | 0;
																		$197 = $21;
																		$21 = ($21 | 0) == (3 | 0);
																		HEAP8[($4_1 + -11 | 0) >> 0] = (wasm2js_i32$0 = HEAPU8[$20 >> 0] | 0, wasm2js_i32$1 = $197, wasm2js_i32$2 = $21, wasm2js_i32$2 ? wasm2js_i32$0 : wasm2js_i32$1);
																		$20 = $20 + $21 | 0;
																		$21 = ($19 >>> 2 | 0) & 3 | 0;
																		$212 = $21;
																		$21 = ($21 | 0) == (3 | 0);
																		HEAP8[($4_1 + -10 | 0) >> 0] = (wasm2js_i32$0 = HEAPU8[$20 >> 0] | 0, wasm2js_i32$1 = $212, wasm2js_i32$2 = $21, wasm2js_i32$2 ? wasm2js_i32$0 : wasm2js_i32$1);
																		$20 = $20 + $21 | 0;
																		$19 = $19 & 3 | 0;
																		$226 = $19;
																		$19 = ($19 | 0) == (3 | 0);
																		HEAP8[($4_1 + -9 | 0) >> 0] = (wasm2js_i32$0 = HEAPU8[$20 >> 0] | 0, wasm2js_i32$1 = $226, wasm2js_i32$2 = $19, wasm2js_i32$2 ? wasm2js_i32$0 : wasm2js_i32$1);
																		$20 = $20 + $19 | 0;
																		$19 = HEAPU8[($6 + 2 | 0) >> 0] | 0;
																		$21 = $19 >>> 6 | 0;
																		$242 = $21;
																		$21 = ($21 | 0) == (3 | 0);
																		HEAP8[($4_1 + -8 | 0) >> 0] = (wasm2js_i32$0 = HEAPU8[$20 >> 0] | 0, wasm2js_i32$1 = $242, wasm2js_i32$2 = $21, wasm2js_i32$2 ? wasm2js_i32$0 : wasm2js_i32$1);
																		$20 = $20 + $21 | 0;
																		$21 = ($19 >>> 4 | 0) & 3 | 0;
																		$257 = $21;
																		$21 = ($21 | 0) == (3 | 0);
																		HEAP8[($4_1 + -7 | 0) >> 0] = (wasm2js_i32$0 = HEAPU8[$20 >> 0] | 0, wasm2js_i32$1 = $257, wasm2js_i32$2 = $21, wasm2js_i32$2 ? wasm2js_i32$0 : wasm2js_i32$1);
																		$20 = $20 + $21 | 0;
																		$21 = ($19 >>> 2 | 0) & 3 | 0;
																		$272 = $21;
																		$21 = ($21 | 0) == (3 | 0);
																		HEAP8[($4_1 + -6 | 0) >> 0] = (wasm2js_i32$0 = HEAPU8[$20 >> 0] | 0, wasm2js_i32$1 = $272, wasm2js_i32$2 = $21, wasm2js_i32$2 ? wasm2js_i32$0 : wasm2js_i32$1);
																		$20 = $20 + $21 | 0;
																		$19 = $19 & 3 | 0;
																		$286 = $19;
																		$19 = ($19 | 0) == (3 | 0);
																		HEAP8[($4_1 + -5 | 0) >> 0] = (wasm2js_i32$0 = HEAPU8[$20 >> 0] | 0, wasm2js_i32$1 = $286, wasm2js_i32$2 = $19, wasm2js_i32$2 ? wasm2js_i32$0 : wasm2js_i32$1);
																		$19 = $20 + $19 | 0;
																		$6 = HEAPU8[($6 + 3 | 0) >> 0] | 0;
																		$20 = $6 >>> 6 | 0;
																		$302 = $20;
																		$20 = ($20 | 0) == (3 | 0);
																		HEAP8[($4_1 + -4 | 0) >> 0] = (wasm2js_i32$0 = HEAPU8[$19 >> 0] | 0, wasm2js_i32$1 = $302, wasm2js_i32$2 = $20, wasm2js_i32$2 ? wasm2js_i32$0 : wasm2js_i32$1);
																		$19 = $19 + $20 | 0;
																		$20 = ($6 >>> 4 | 0) & 3 | 0;
																		$317 = $20;
																		$20 = ($20 | 0) == (3 | 0);
																		HEAP8[($4_1 + -3 | 0) >> 0] = (wasm2js_i32$0 = HEAPU8[$19 >> 0] | 0, wasm2js_i32$1 = $317, wasm2js_i32$2 = $20, wasm2js_i32$2 ? wasm2js_i32$0 : wasm2js_i32$1);
																		$19 = $19 + $20 | 0;
																		$20 = ($6 >>> 2 | 0) & 3 | 0;
																		$332 = $20;
																		$20 = ($20 | 0) == (3 | 0);
																		HEAP8[($4_1 + -2 | 0) >> 0] = (wasm2js_i32$0 = HEAPU8[$19 >> 0] | 0, wasm2js_i32$1 = $332, wasm2js_i32$2 = $20, wasm2js_i32$2 ? wasm2js_i32$0 : wasm2js_i32$1);
																		$338 = $4_1 + -1 | 0;
																		$4_1 = $19 + $20 | 0;
																		$6 = $6 & 3 | 0;
																		$346 = $6;
																		$6 = ($6 | 0) == (3 | 0);
																		HEAP8[$338 >> 0] = (wasm2js_i32$0 = HEAPU8[$4_1 >> 0] | 0, wasm2js_i32$1 = $346, wasm2js_i32$2 = $6, wasm2js_i32$2 ? wasm2js_i32$0 : wasm2js_i32$1);
																		$6 = $4_1 + $6 | 0;
																		break label$11;
																	case 2:
																		$19 = HEAPU8[$6 >> 0] | 0;
																		$20 = $19 >>> 4 | 0;
																		$361 = $20;
																		$20 = ($20 | 0) == (15 | 0);
																		HEAP8[$4_1 >> 0] = (wasm2js_i32$0 = HEAPU8[($6 + 8 | 0) >> 0] | 0, wasm2js_i32$1 = $361, wasm2js_i32$2 = $20, wasm2js_i32$2 ? wasm2js_i32$0 : wasm2js_i32$1);
																		$4_1 = ($8 + 8448 | 0) + $3_1 | 0;
																		$20 = ($6 + 8 | 0) + $20 | 0;
																		$19 = $19 & 15 | 0;
																		$380 = $19;
																		$19 = ($19 | 0) == (15 | 0);
																		HEAP8[($4_1 + -15 | 0) >> 0] = (wasm2js_i32$0 = HEAPU8[$20 >> 0] | 0, wasm2js_i32$1 = $380, wasm2js_i32$2 = $19, wasm2js_i32$2 ? wasm2js_i32$0 : wasm2js_i32$1);
																		$19 = $20 + $19 | 0;
																		$20 = HEAPU8[($6 + 1 | 0) >> 0] | 0;
																		$21 = $20 >>> 4 | 0;
																		$396 = $21;
																		$21 = ($21 | 0) == (15 | 0);
																		HEAP8[($4_1 + -14 | 0) >> 0] = (wasm2js_i32$0 = HEAPU8[$19 >> 0] | 0, wasm2js_i32$1 = $396, wasm2js_i32$2 = $21, wasm2js_i32$2 ? wasm2js_i32$0 : wasm2js_i32$1);
																		$19 = $19 + $21 | 0;
																		$20 = $20 & 15 | 0;
																		$410 = $20;
																		$20 = ($20 | 0) == (15 | 0);
																		HEAP8[($4_1 + -13 | 0) >> 0] = (wasm2js_i32$0 = HEAPU8[$19 >> 0] | 0, wasm2js_i32$1 = $410, wasm2js_i32$2 = $20, wasm2js_i32$2 ? wasm2js_i32$0 : wasm2js_i32$1);
																		$19 = $19 + $20 | 0;
																		$20 = HEAPU8[($6 + 2 | 0) >> 0] | 0;
																		$21 = $20 >>> 4 | 0;
																		$426 = $21;
																		$21 = ($21 | 0) == (15 | 0);
																		HEAP8[($4_1 + -12 | 0) >> 0] = (wasm2js_i32$0 = HEAPU8[$19 >> 0] | 0, wasm2js_i32$1 = $426, wasm2js_i32$2 = $21, wasm2js_i32$2 ? wasm2js_i32$0 : wasm2js_i32$1);
																		$19 = $19 + $21 | 0;
																		$20 = $20 & 15 | 0;
																		$440 = $20;
																		$20 = ($20 | 0) == (15 | 0);
																		HEAP8[($4_1 + -11 | 0) >> 0] = (wasm2js_i32$0 = HEAPU8[$19 >> 0] | 0, wasm2js_i32$1 = $440, wasm2js_i32$2 = $20, wasm2js_i32$2 ? wasm2js_i32$0 : wasm2js_i32$1);
																		$19 = $19 + $20 | 0;
																		$20 = HEAPU8[($6 + 3 | 0) >> 0] | 0;
																		$21 = $20 >>> 4 | 0;
																		$456 = $21;
																		$21 = ($21 | 0) == (15 | 0);
																		HEAP8[($4_1 + -10 | 0) >> 0] = (wasm2js_i32$0 = HEAPU8[$19 >> 0] | 0, wasm2js_i32$1 = $456, wasm2js_i32$2 = $21, wasm2js_i32$2 ? wasm2js_i32$0 : wasm2js_i32$1);
																		$19 = $19 + $21 | 0;
																		$20 = $20 & 15 | 0;
																		$470 = $20;
																		$20 = ($20 | 0) == (15 | 0);
																		HEAP8[($4_1 + -9 | 0) >> 0] = (wasm2js_i32$0 = HEAPU8[$19 >> 0] | 0, wasm2js_i32$1 = $470, wasm2js_i32$2 = $20, wasm2js_i32$2 ? wasm2js_i32$0 : wasm2js_i32$1);
																		$19 = $19 + $20 | 0;
																		$20 = HEAPU8[($6 + 4 | 0) >> 0] | 0;
																		$21 = $20 >>> 4 | 0;
																		$486 = $21;
																		$21 = ($21 | 0) == (15 | 0);
																		HEAP8[($4_1 + -8 | 0) >> 0] = (wasm2js_i32$0 = HEAPU8[$19 >> 0] | 0, wasm2js_i32$1 = $486, wasm2js_i32$2 = $21, wasm2js_i32$2 ? wasm2js_i32$0 : wasm2js_i32$1);
																		$19 = $19 + $21 | 0;
																		$20 = $20 & 15 | 0;
																		$500 = $20;
																		$20 = ($20 | 0) == (15 | 0);
																		HEAP8[($4_1 + -7 | 0) >> 0] = (wasm2js_i32$0 = HEAPU8[$19 >> 0] | 0, wasm2js_i32$1 = $500, wasm2js_i32$2 = $20, wasm2js_i32$2 ? wasm2js_i32$0 : wasm2js_i32$1);
																		$19 = $19 + $20 | 0;
																		$20 = HEAPU8[($6 + 5 | 0) >> 0] | 0;
																		$21 = $20 >>> 4 | 0;
																		$516 = $21;
																		$21 = ($21 | 0) == (15 | 0);
																		HEAP8[($4_1 + -6 | 0) >> 0] = (wasm2js_i32$0 = HEAPU8[$19 >> 0] | 0, wasm2js_i32$1 = $516, wasm2js_i32$2 = $21, wasm2js_i32$2 ? wasm2js_i32$0 : wasm2js_i32$1);
																		$19 = $19 + $21 | 0;
																		$20 = $20 & 15 | 0;
																		$530 = $20;
																		$20 = ($20 | 0) == (15 | 0);
																		HEAP8[($4_1 + -5 | 0) >> 0] = (wasm2js_i32$0 = HEAPU8[$19 >> 0] | 0, wasm2js_i32$1 = $530, wasm2js_i32$2 = $20, wasm2js_i32$2 ? wasm2js_i32$0 : wasm2js_i32$1);
																		$19 = $19 + $20 | 0;
																		$20 = HEAPU8[($6 + 6 | 0) >> 0] | 0;
																		$21 = $20 >>> 4 | 0;
																		$546 = $21;
																		$21 = ($21 | 0) == (15 | 0);
																		HEAP8[($4_1 + -4 | 0) >> 0] = (wasm2js_i32$0 = HEAPU8[$19 >> 0] | 0, wasm2js_i32$1 = $546, wasm2js_i32$2 = $21, wasm2js_i32$2 ? wasm2js_i32$0 : wasm2js_i32$1);
																		$19 = $19 + $21 | 0;
																		$20 = $20 & 15 | 0;
																		$560 = $20;
																		$20 = ($20 | 0) == (15 | 0);
																		HEAP8[($4_1 + -3 | 0) >> 0] = (wasm2js_i32$0 = HEAPU8[$19 >> 0] | 0, wasm2js_i32$1 = $560, wasm2js_i32$2 = $20, wasm2js_i32$2 ? wasm2js_i32$0 : wasm2js_i32$1);
																		$19 = $19 + $20 | 0;
																		$6 = HEAPU8[($6 + 7 | 0) >> 0] | 0;
																		$20 = $6 >>> 4 | 0;
																		$576 = $20;
																		$20 = ($20 | 0) == (15 | 0);
																		HEAP8[($4_1 + -2 | 0) >> 0] = (wasm2js_i32$0 = HEAPU8[$19 >> 0] | 0, wasm2js_i32$1 = $576, wasm2js_i32$2 = $20, wasm2js_i32$2 ? wasm2js_i32$0 : wasm2js_i32$1);
																		$582 = $4_1 + -1 | 0;
																		$4_1 = $19 + $20 | 0;
																		$6 = $6 & 15 | 0;
																		$590 = $6;
																		$6 = ($6 | 0) == (15 | 0);
																		HEAP8[$582 >> 0] = (wasm2js_i32$0 = HEAPU8[$4_1 >> 0] | 0, wasm2js_i32$1 = $590, wasm2js_i32$2 = $6, wasm2js_i32$2 ? wasm2js_i32$0 : wasm2js_i32$1);
																		$6 = $4_1 + $6 | 0;
																		break label$11;
																	case 3:
																		break label$12;
																}															}
															i64toi32_i32$0 = HEAPU8[$6 >> 0] | 0 | ((HEAPU8[($6 + 1 | 0) >> 0] | 0) << 8 | 0) | 0 | ((HEAPU8[($6 + 2 | 0) >> 0] | 0) << 16 | 0 | ((HEAPU8[($6 + 3 | 0) >> 0] | 0) << 24 | 0) | 0) | 0;
															i64toi32_i32$1 = HEAPU8[($6 + 4 | 0) >> 0] | 0 | ((HEAPU8[($6 + 5 | 0) >> 0] | 0) << 8 | 0) | 0 | ((HEAPU8[($6 + 6 | 0) >> 0] | 0) << 16 | 0 | ((HEAPU8[($6 + 7 | 0) >> 0] | 0) << 24 | 0) | 0) | 0;
															$600 = i64toi32_i32$0;
															i64toi32_i32$0 = $4_1;
															$61 = $600;
															HEAP8[$4_1 >> 0] = $61;
															HEAP8[($4_1 + 1 | 0) >> 0] = $61 >>> 8 | 0;
															HEAP8[($4_1 + 2 | 0) >> 0] = $61 >>> 16 | 0;
															HEAP8[($4_1 + 3 | 0) >> 0] = $61 >>> 24 | 0;
															HEAP8[($4_1 + 4 | 0) >> 0] = i64toi32_i32$1;
															HEAP8[($4_1 + 5 | 0) >> 0] = i64toi32_i32$1 >>> 8 | 0;
															HEAP8[($4_1 + 6 | 0) >> 0] = i64toi32_i32$1 >>> 16 | 0;
															HEAP8[($4_1 + 7 | 0) >> 0] = i64toi32_i32$1 >>> 24 | 0;
															$60 = $6 + 8 | 0;
															i64toi32_i32$1 = HEAPU8[$60 >> 0] | 0 | ((HEAPU8[($60 + 1 | 0) >> 0] | 0) << 8 | 0) | 0 | ((HEAPU8[($60 + 2 | 0) >> 0] | 0) << 16 | 0 | ((HEAPU8[($60 + 3 | 0) >> 0] | 0) << 24 | 0) | 0) | 0;
															i64toi32_i32$0 = HEAPU8[($60 + 4 | 0) >> 0] | 0 | ((HEAPU8[($60 + 5 | 0) >> 0] | 0) << 8 | 0) | 0 | ((HEAPU8[($60 + 6 | 0) >> 0] | 0) << 16 | 0 | ((HEAPU8[($60 + 7 | 0) >> 0] | 0) << 24 | 0) | 0) | 0;
															$605 = i64toi32_i32$1;
															i64toi32_i32$1 = $4_1 + 8 | 0;
															$62 = $605;
															HEAP8[i64toi32_i32$1 >> 0] = $62;
															HEAP8[(i64toi32_i32$1 + 1 | 0) >> 0] = $62 >>> 8 | 0;
															HEAP8[(i64toi32_i32$1 + 2 | 0) >> 0] = $62 >>> 16 | 0;
															HEAP8[(i64toi32_i32$1 + 3 | 0) >> 0] = $62 >>> 24 | 0;
															HEAP8[(i64toi32_i32$1 + 4 | 0) >> 0] = i64toi32_i32$0;
															HEAP8[(i64toi32_i32$1 + 5 | 0) >> 0] = i64toi32_i32$0 >>> 8 | 0;
															HEAP8[(i64toi32_i32$1 + 6 | 0) >> 0] = i64toi32_i32$0 >>> 16 | 0;
															HEAP8[(i64toi32_i32$1 + 7 | 0) >> 0] = i64toi32_i32$0 >>> 24 | 0;
															$6 = $6 + 16 | 0;
														}
														label$16: {
															if ($3_1 >>> 0 >= $13 >>> 0) {
																break label$16
															}
															$18 = $18 + 2 | 0;
															$4_1 = $3_1 + 16 | 0;
															if (($7 - $6 | 0) >>> 0 > 23 >>> 0) {
																continue label$10
															}
														}
														break label$10;
													}													if ($3_1 >>> 0 < $13 >>> 0) {
														break label$6
													}
													if (!$6) {
														break label$6
													}
													label$17: {
														if (!$11) {
															break label$17
														}
														$18 = HEAPU8[($8 + $14 | 0) >> 0] | 0;
														$4_1 = $8 + 8448 | 0;
														$3_1 = $16;
														$19 = $11;
														label$18: while (1) {
															$17 = HEAPU8[$4_1 >> 0] | 0;
															$18 = (($17 >>> 1 | 0) ^ (0 - ($17 & 1 | 0) | 0) | 0) + $18 | 0;
															HEAP8[$3_1 >> 0] = $18;
															$3_1 = $3_1 + $2_1 | 0;
															$4_1 = $4_1 + 1 | 0;
															$19 = $19 + -1 | 0;
															if ($19) {
																continue label$18
															}
															break label$18;
														}													}
													$16 = $16 + 1 | 0;
													$14 = $14 + 1 | 0;
													$15 = $14 >>> 0 < $2_1 >>> 0;
													$17 = $6;
													if (($14 | 0) != ($2_1 | 0)) {
														continue label$8
													}
													break label$4;
												}
												break label$8;
											}											$6 = 0;
											if ($15 & 1 | 0) {
												break label$5
											}
											break label$4;
										}
										$21 = $6 + Math_imul($12, $2_1) | 0;
										label$19: {
											if (!$11) {
												break label$19
											}
											$13 = 0;
											$15 = 1;
											$20 = $8 + 256 | 0;
											label$20: while (1) {
												if (($7 - $6 | 0) >>> 0 < $12 >>> 0) {
													break label$5
												}
												if (!$6) {
													break label$6
												}
												$6 = $6 + $12 | 0;
												$18 = HEAPU8[($8 + $13 | 0) >> 0] | 0;
												$4_1 = $8 + 8448 | 0;
												$3_1 = $20;
												$19 = $11;
												label$21: while (1) {
													$17 = HEAPU8[$4_1 >> 0] | 0;
													$18 = (($17 >>> 1 | 0) ^ (0 - ($17 & 1 | 0) | 0) | 0) + $18 | 0;
													HEAP8[$3_1 >> 0] = $18;
													$3_1 = $3_1 + $2_1 | 0;
													$4_1 = $4_1 + 1 | 0;
													$19 = $19 + -1 | 0;
													if ($19) {
														continue label$21
													}
													break label$21;
												}												$20 = $20 + 1 | 0;
												$13 = $13 + 1 | 0;
												$15 = $13 >>> 0 < $2_1 >>> 0;
												if (($13 | 0) != ($2_1 | 0)) {
													continue label$20
												}
												break label$20;
											}											$6 = $21;
											break label$4;
										}
										$4_1 = 0;
										$15 = 1;
										label$22: while (1) {
											if (($7 - $6 | 0) >>> 0 < $12 >>> 0) {
												break label$5
											}
											if (!$6) {
												break label$6
											}
											$6 = $6 + $12 | 0;
											$4_1 = $4_1 + 1 | 0;
											$15 = $4_1 >>> 0 < $2_1 >>> 0;
											if (($2_1 | 0) != ($4_1 | 0)) {
												continue label$22
											}
											break label$22;
										}										$6 = $21;
										break label$4;
									}
									$6 = 0;
									if (!($15 & 1 | 0)) {
										break label$4
									}
								}
								$6 = -2;
								break label$1;
							}
							$4($0_1 + Math_imul($10, $2_1) | 0 | 0, $8 + 256 | 0 | 0, Math_imul($11, $2_1) | 0) | 0;
							$4($8 | 0, ($8 + 256 | 0) + Math_imul($11 + -1 | 0, $2_1) | 0 | 0, $2_1 | 0) | 0;
							$10 = $11 + $10 | 0;
							if ($6) {
								continue label$3
							}
							break label$3;
						}						$6 = -2;
						break label$1;
					}
					$6 = ($7 - $6 | 0 | 0) == (($2_1 >>> 0 > 32 >>> 0 ? $2_1 : 32) | 0) ? 0 : -3;
				}
				global$0 = $5_1 + 8704 | 0;
				return $6 | 0;
			}

			function $2($0_1, $1_1, $2_1, $3_1, $4_1) {
				$0_1 = $0_1 | 0;
				$1_1 = $1_1 | 0;
				$2_1 = $2_1 | 0;
				$3_1 = $3_1 | 0;
				$4_1 = $4_1 | 0;
				var $9 = 0, $15 = 0, $14 = 0, $5_1 = 0, $6 = 0, $17 = 0, $18 = 0, $16 = 0, i64toi32_i32$1 = 0, $13 = 0, i64toi32_i32$0 = 0, $7 = 0, $12 = 0, $19 = 0, $8 = 0, $20 = 0, $10 = 0, $21 = 0, $11 = 0, wasm2js_i32$0 = 0, wasm2js_i32$1 = 0, wasm2js_i32$2 = 0;
				$5_1 = global$0 - 192 | 0;
				global$0 = $5_1;
				$6 = -2;
				label$1: {
					$7 = ($1_1 >>> 0) / (3 >>> 0) | 0;
					if (($7 + 17 | 0) >>> 0 > $4_1 >>> 0) {
						break label$1
					}
					$6 = -1;
					$8 = HEAPU8[$3_1 >> 0] | 0;
					if (($8 & 240 | 0 | 0) != (224 | 0)) {
						break label$1
					}
					$9 = $8 & 15 | 0;
					if ($9 >>> 0 > 1 >>> 0) {
						break label$1
					}
					$5($5_1 + 64 | 0 | 0, 255 | 0, 128 | 0) | 0;
					i64toi32_i32$1 = $5_1 + 56 | 0;
					i64toi32_i32$0 = -1;
					HEAP32[i64toi32_i32$1 >> 2] = -1;
					HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
					i64toi32_i32$1 = $5_1 + 48 | 0;
					i64toi32_i32$0 = -1;
					HEAP32[i64toi32_i32$1 >> 2] = -1;
					HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
					i64toi32_i32$1 = $5_1 + 40 | 0;
					i64toi32_i32$0 = -1;
					HEAP32[i64toi32_i32$1 >> 2] = -1;
					HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
					i64toi32_i32$1 = $5_1 + 32 | 0;
					i64toi32_i32$0 = -1;
					HEAP32[i64toi32_i32$1 >> 2] = -1;
					HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
					i64toi32_i32$1 = $5_1 + 24 | 0;
					i64toi32_i32$0 = -1;
					HEAP32[i64toi32_i32$1 >> 2] = -1;
					HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
					i64toi32_i32$1 = $5_1 + 16 | 0;
					i64toi32_i32$0 = -1;
					HEAP32[i64toi32_i32$1 >> 2] = -1;
					HEAP32[(i64toi32_i32$1 + 4 | 0) >> 2] = i64toi32_i32$0;
					i64toi32_i32$1 = $5_1;
					i64toi32_i32$0 = -1;
					HEAP32[($5_1 + 8 | 0) >> 2] = -1;
					HEAP32[($5_1 + 12 | 0) >> 2] = i64toi32_i32$0;
					i64toi32_i32$1 = $5_1;
					i64toi32_i32$0 = -1;
					HEAP32[$5_1 >> 2] = -1;
					HEAP32[($5_1 + 4 | 0) >> 2] = i64toi32_i32$0;
					$10 = ($3_1 + $4_1 | 0) + -16 | 0;
					$8 = $3_1 + 1 | 0;
					$6 = $8 + $7 | 0;
					label$2: {
						if (!$1_1) {
							break label$2
						}
						$11 = ($9 | 0) == (1 | 0) ? 13 : 15;
						$12 = 0;
						$13 = 0;
						$7 = 0;
						$3_1 = 0;
						$4_1 = 0;
						label$3: while (1) {
							label$4: {
								if ($6 >>> 0 <= $10 >>> 0) {
									break label$4
								}
								$6 = -2;
								break label$1;
							}
							label$5: {
								label$6: {
									$9 = HEAPU8[$8 >> 0] | 0;
									if ($9 >>> 0 > 239 >>> 0) {
										break label$6
									}
									$14 = $9 ^ -1 | 0;
									$15 = ($5_1 + 64 | 0) + ((($4_1 + ($14 >>> 4 | 0) | 0) & 15 | 0) << 3 | 0) | 0;
									$16 = HEAP32[($15 + 4 | 0) >> 2] | 0;
									$17 = HEAP32[$15 >> 2] | 0;
									label$7: {
										$9 = $9 & 15 | 0;
										if ($9 >>> 0 >= $11 >>> 0) {
											break label$7
										}
										$15 = (wasm2js_i32$0 = HEAP32[($5_1 + ((($3_1 + $14 | 0) & 15 | 0) << 2 | 0) | 0) >> 2] | 0, wasm2js_i32$1 = $12, wasm2js_i32$2 = $9, wasm2js_i32$2 ? wasm2js_i32$0 : wasm2js_i32$1);
										$9 = !$9;
										label$8: {
											label$9: {
												if (($2_1 | 0) != (2 | 0)) {
													break label$9
												}
												$14 = $0_1 + ($7 << 1 | 0) | 0;
												HEAP16[$14 >> 1] = $17;
												HEAP16[($14 + 2 | 0) >> 1] = $16;
												HEAP16[($14 + 4 | 0) >> 1] = $15;
												break label$8;
											}
											$14 = $0_1 + ($7 << 2 | 0) | 0;
											HEAP32[$14 >> 2] = $17;
											HEAP32[($14 + 4 | 0) >> 2] = $16;
											HEAP32[($14 + 8 | 0) >> 2] = $15;
										}
										$12 = $12 + $9 | 0;
										$14 = ($5_1 + 64 | 0) + ($4_1 << 3 | 0) | 0;
										HEAP32[$14 >> 2] = $15;
										HEAP32[($14 + 4 | 0) >> 2] = $16;
										HEAP32[($5_1 + ($3_1 << 2 | 0) | 0) >> 2] = $15;
										$4_1 = ($4_1 + 1 | 0) & 15 | 0;
										$14 = ($5_1 + 64 | 0) + ($4_1 << 3 | 0) | 0;
										HEAP32[$14 >> 2] = $17;
										HEAP32[($14 + 4 | 0) >> 2] = $15;
										$3_1 = $3_1 + $9 | 0;
										$4_1 = $4_1 + 1 | 0;
										break label$5;
									}
									label$10: {
										label$11: {
											if (($9 | 0) == (15 | 0)) {
												break label$11
											}
											$13 = (($13 + $9 | 0) + ($9 ^ -4 | 0) | 0) + 1 | 0;
											break label$10;
										}
										$9 = $6 + 1 | 0;
										$15 = HEAP8[$6 >> 0] | 0;
										$14 = $15 & 255 | 0;
										label$12: {
											label$13: {
												if (($15 | 0) <= (-1 | 0)) {
													break label$13
												}
												$6 = $9;
												break label$12;
											}
											$6 = $6 + 5 | 0;
											$14 = $14 & 127 | 0;
											$15 = 7;
											label$14: {
												label$15: while (1) {
													$18 = HEAP8[$9 >> 0] | 0;
													$14 = ($18 & 127 | 0) << $15 | 0 | $14 | 0;
													if (($18 | 0) > (-1 | 0)) {
														break label$14
													}
													$9 = $9 + 1 | 0;
													$15 = $15 + 7 | 0;
													if (($15 | 0) != (35 | 0)) {
														continue label$15
													}
													break label$12;
												}											}
											$6 = $9 + 1 | 0;
										}
										$13 = (($14 >>> 1 | 0) ^ (0 - ($14 & 1 | 0) | 0) | 0) + $13 | 0;
									}
									label$16: {
										label$17: {
											if (($2_1 | 0) != (2 | 0)) {
												break label$17
											}
											$9 = $0_1 + ($7 << 1 | 0) | 0;
											HEAP16[$9 >> 1] = $17;
											HEAP16[($9 + 2 | 0) >> 1] = $16;
											HEAP16[($9 + 4 | 0) >> 1] = $13;
											break label$16;
										}
										$9 = $0_1 + ($7 << 2 | 0) | 0;
										HEAP32[$9 >> 2] = $17;
										HEAP32[($9 + 4 | 0) >> 2] = $16;
										HEAP32[($9 + 8 | 0) >> 2] = $13;
									}
									$9 = ($5_1 + 64 | 0) + ($4_1 << 3 | 0) | 0;
									HEAP32[$9 >> 2] = $13;
									HEAP32[($9 + 4 | 0) >> 2] = $16;
									HEAP32[($5_1 + ($3_1 << 2 | 0) | 0) >> 2] = $13;
									$4_1 = ($4_1 + 1 | 0) & 15 | 0;
									$9 = ($5_1 + 64 | 0) + ($4_1 << 3 | 0) | 0;
									HEAP32[$9 >> 2] = $17;
									HEAP32[($9 + 4 | 0) >> 2] = $13;
									$3_1 = $3_1 + 1 | 0;
									$4_1 = $4_1 + 1 | 0;
									break label$5;
								}
								label$18: {
									if ($9 >>> 0 > 253 >>> 0) {
										break label$18
									}
									$18 = $12 + 1 | 0;
									$15 = HEAPU8[($10 + ($9 & 15 | 0) | 0) >> 0] | 0;
									$14 = $15 >>> 0 < 16 >>> 0;
									$9 = (wasm2js_i32$0 = $18, wasm2js_i32$1 = HEAP32[($5_1 + ((($3_1 - ($15 >>> 4 | 0) | 0) & 15 | 0) << 2 | 0) | 0) >> 2] | 0, wasm2js_i32$2 = $14, wasm2js_i32$2 ? wasm2js_i32$0 : wasm2js_i32$1);
									$16 = $18 + $14 | 0;
									$18 = $15 & 15 | 0;
									$15 = (wasm2js_i32$0 = HEAP32[($5_1 + ((($3_1 - $15 | 0) & 15 | 0) << 2 | 0) | 0) >> 2] | 0, wasm2js_i32$1 = $16, wasm2js_i32$2 = $18, wasm2js_i32$2 ? wasm2js_i32$0 : wasm2js_i32$1);
									$18 = !$18;
									label$19: {
										label$20: {
											if (($2_1 | 0) != (2 | 0)) {
												break label$20
											}
											$17 = $0_1 + ($7 << 1 | 0) | 0;
											HEAP16[$17 >> 1] = $12;
											HEAP16[($17 + 2 | 0) >> 1] = $9;
											HEAP16[($17 + 4 | 0) >> 1] = $15;
											break label$19;
										}
										$17 = $0_1 + ($7 << 2 | 0) | 0;
										HEAP32[$17 >> 2] = $12;
										HEAP32[($17 + 4 | 0) >> 2] = $9;
										HEAP32[($17 + 8 | 0) >> 2] = $15;
									}
									HEAP32[($5_1 + ($3_1 << 2 | 0) | 0) >> 2] = $12;
									$17 = ($5_1 + 64 | 0) + ($4_1 << 3 | 0) | 0;
									HEAP32[$17 >> 2] = $9;
									HEAP32[($17 + 4 | 0) >> 2] = $12;
									$3_1 = $3_1 + 1 | 0;
									HEAP32[($5_1 + (($3_1 & 15 | 0) << 2 | 0) | 0) >> 2] = $9;
									$17 = ($5_1 + 64 | 0) + ((($4_1 + 1 | 0) & 15 | 0) << 3 | 0) | 0;
									HEAP32[$17 >> 2] = $15;
									HEAP32[($17 + 4 | 0) >> 2] = $9;
									$3_1 = ($3_1 + $14 | 0) & 15 | 0;
									HEAP32[($5_1 + ($3_1 << 2 | 0) | 0) >> 2] = $15;
									$4_1 = ($4_1 + 2 | 0) & 15 | 0;
									$9 = ($5_1 + 64 | 0) + ($4_1 << 3 | 0) | 0;
									HEAP32[$9 >> 2] = $12;
									HEAP32[($9 + 4 | 0) >> 2] = $15;
									$4_1 = $4_1 + 1 | 0;
									$3_1 = $3_1 + $18 | 0;
									$12 = $16 + $18 | 0;
									break label$5;
								}
								$17 = HEAPU8[$6 >> 0] | 0;
								$19 = $17 ? $12 : 0;
								$9 = ($9 | 0) == (254 | 0);
								$16 = $19 + $9 | 0;
								$20 = $17 & 15 | 0;
								$21 = $17 >>> 4 | 0;
								label$21: {
									label$22: {
										if ($17 >>> 0 > 15 >>> 0) {
											break label$22
										}
										$18 = $16 + 1 | 0;
										break label$21;
									}
									$18 = $16;
									$16 = HEAP32[($5_1 + ((($3_1 - $21 | 0) & 15 | 0) << 2 | 0) | 0) >> 2] | 0;
								}
								label$23: {
									label$24: {
										if ($20) {
											break label$24
										}
										$12 = $18 + 1 | 0;
										break label$23;
									}
									$12 = $18;
									$18 = HEAP32[($5_1 + ((($3_1 - $17 | 0) & 15 | 0) << 2 | 0) | 0) >> 2] | 0;
								}
								label$25: {
									label$26: {
										if (!$9) {
											break label$26
										}
										$9 = $6 + 1 | 0;
										break label$25;
									}
									$9 = $6 + 2 | 0;
									$14 = HEAP8[($6 + 1 | 0) >> 0] | 0;
									$15 = $14 & 255 | 0;
									label$27: {
										if (($14 | 0) > (-1 | 0)) {
											break label$27
										}
										$19 = $6 + 6 | 0;
										$15 = $15 & 127 | 0;
										$6 = 7;
										label$28: {
											label$29: while (1) {
												$14 = HEAP8[$9 >> 0] | 0;
												$15 = ($14 & 127 | 0) << $6 | 0 | $15 | 0;
												if (($14 | 0) > (-1 | 0)) {
													break label$28
												}
												$9 = $9 + 1 | 0;
												$6 = $6 + 7 | 0;
												if (($6 | 0) != (35 | 0)) {
													continue label$29
												}
												break label$29;
											}											$9 = $19;
											break label$27;
										}
										$9 = $9 + 1 | 0;
									}
									$13 = (($15 >>> 1 | 0) ^ (0 - ($15 & 1 | 0) | 0) | 0) + $13 | 0;
									$19 = $13;
								}
								label$30: {
									label$31: {
										if (($21 | 0) == (15 | 0)) {
											break label$31
										}
										$15 = $9;
										break label$30;
									}
									$15 = $9 + 1 | 0;
									$6 = HEAP8[$9 >> 0] | 0;
									$14 = $6 & 255 | 0;
									label$32: {
										if (($6 | 0) > (-1 | 0)) {
											break label$32
										}
										$16 = $9 + 5 | 0;
										$14 = $14 & 127 | 0;
										$6 = 7;
										label$33: {
											label$34: while (1) {
												$9 = HEAP8[$15 >> 0] | 0;
												$14 = ($9 & 127 | 0) << $6 | 0 | $14 | 0;
												if (($9 | 0) > (-1 | 0)) {
													break label$33
												}
												$15 = $15 + 1 | 0;
												$6 = $6 + 7 | 0;
												if (($6 | 0) != (35 | 0)) {
													continue label$34
												}
												break label$34;
											}											$15 = $16;
											break label$32;
										}
										$15 = $15 + 1 | 0;
									}
									$13 = (($14 >>> 1 | 0) ^ (0 - ($14 & 1 | 0) | 0) | 0) + $13 | 0;
									$16 = $13;
								}
								label$35: {
									label$36: {
										if (($20 | 0) == (15 | 0)) {
											break label$36
										}
										$6 = $15;
										break label$35;
									}
									$6 = $15 + 1 | 0;
									$9 = HEAP8[$15 >> 0] | 0;
									$14 = $9 & 255 | 0;
									label$37: {
										if (($9 | 0) > (-1 | 0)) {
											break label$37
										}
										$18 = $15 + 5 | 0;
										$14 = $14 & 127 | 0;
										$9 = 7;
										label$38: {
											label$39: while (1) {
												$15 = HEAP8[$6 >> 0] | 0;
												$14 = ($15 & 127 | 0) << $9 | 0 | $14 | 0;
												if (($15 | 0) > (-1 | 0)) {
													break label$38
												}
												$6 = $6 + 1 | 0;
												$9 = $9 + 7 | 0;
												if (($9 | 0) != (35 | 0)) {
													continue label$39
												}
												break label$39;
											}											$6 = $18;
											break label$37;
										}
										$6 = $6 + 1 | 0;
									}
									$13 = (($14 >>> 1 | 0) ^ (0 - ($14 & 1 | 0) | 0) | 0) + $13 | 0;
									$18 = $13;
								}
								label$40: {
									label$41: {
										if (($2_1 | 0) != (2 | 0)) {
											break label$41
										}
										$9 = $0_1 + ($7 << 1 | 0) | 0;
										HEAP16[$9 >> 1] = $19;
										HEAP16[($9 + 2 | 0) >> 1] = $16;
										HEAP16[($9 + 4 | 0) >> 1] = $18;
										break label$40;
									}
									$9 = $0_1 + ($7 << 2 | 0) | 0;
									HEAP32[$9 >> 2] = $19;
									HEAP32[($9 + 4 | 0) >> 2] = $16;
									HEAP32[($9 + 8 | 0) >> 2] = $18;
								}
								$9 = ($5_1 + 64 | 0) + ($4_1 << 3 | 0) | 0;
								HEAP32[$9 >> 2] = $16;
								HEAP32[($9 + 4 | 0) >> 2] = $19;
								HEAP32[($5_1 + ($3_1 << 2 | 0) | 0) >> 2] = $19;
								$9 = ($5_1 + 64 | 0) + ((($4_1 + 1 | 0) & 15 | 0) << 3 | 0) | 0;
								HEAP32[$9 >> 2] = $18;
								HEAP32[($9 + 4 | 0) >> 2] = $16;
								$3_1 = $3_1 + 1 | 0;
								HEAP32[($5_1 + (($3_1 & 15 | 0) << 2 | 0) | 0) >> 2] = $16;
								$9 = ($5_1 + 64 | 0) + ((($4_1 + 2 | 0) & 15 | 0) << 3 | 0) | 0;
								HEAP32[$9 >> 2] = $19;
								HEAP32[($9 + 4 | 0) >> 2] = $18;
								$3_1 = $3_1 + ($17 >>> 0 < 16 >>> 0 | ($21 | 0) == (15 | 0) | 0) | 0;
								HEAP32[($5_1 + (($3_1 & 15 | 0) << 2 | 0) | 0) >> 2] = $18;
								$3_1 = $3_1 + (!$20 | ($20 | 0) == (15 | 0) | 0) | 0;
								$4_1 = $4_1 + 3 | 0;
							}
							$8 = $8 + 1 | 0;
							$4_1 = $4_1 & 15 | 0;
							$3_1 = $3_1 & 15 | 0;
							$7 = $7 + 3 | 0;
							if ($7 >>> 0 < $1_1 >>> 0) {
								continue label$3
							}
							break label$3;
						}					}
					$6 = ($6 | 0) == ($10 | 0) ? 0 : -3;
				}
				global$0 = $5_1 + 192 | 0;
				return $6 | 0;
			}

			function $3($0_1) {
				$0_1 = $0_1 | 0;
				var $1_1 = 0, $2_1 = 0, $3_1 = 0;
				$1_1 = HEAP32[(0 + 1024 | 0) >> 2] | 0;
				$0_1 = $1_1 + (($0_1 + 3 | 0) & -4 | 0) | 0;
				HEAP32[(0 + 1024 | 0) >> 2] = $0_1;
				label$1: {
					label$2: {
						$2_1 = __wasm_memory_size() << 16 | 0;
						if ($0_1 >>> 0 <= $2_1 >>> 0) {
							break label$2
						}
						$3_1 = -1;
						if ((__wasm_memory_grow((($0_1 - $2_1 | 0) + 65535 | 0) >>> 16 | 0 | 0) | 0) == (-1 | 0)) {
							break label$1
						}
					}
					$3_1 = $1_1;
				}
				return $3_1 | 0;
			}

			function $4($0_1, $1_1, $2_1) {
				$0_1 = $0_1 | 0;
				$1_1 = $1_1 | 0;
				$2_1 = $2_1 | 0;
				var $3_1 = 0;
				label$1: {
					label$2: {
						if (!(($1_1 | $0_1 | 0) & 3 | 0)) {
							break label$2
						}
						$3_1 = $0_1;
						break label$1;
					}
					label$3: {
						label$4: {
							if ($2_1 >>> 0 >= 16 >>> 0) {
								break label$4
							}
							$3_1 = $0_1;
							break label$3;
						}
						$3_1 = $0_1;
						label$5: while (1) {
							HEAP32[$3_1 >> 2] = HEAP32[$1_1 >> 2] | 0;
							HEAP32[($3_1 + 4 | 0) >> 2] = HEAP32[($1_1 + 4 | 0) >> 2] | 0;
							HEAP32[($3_1 + 8 | 0) >> 2] = HEAP32[($1_1 + 8 | 0) >> 2] | 0;
							HEAP32[($3_1 + 12 | 0) >> 2] = HEAP32[($1_1 + 12 | 0) >> 2] | 0;
							$1_1 = $1_1 + 16 | 0;
							$3_1 = $3_1 + 16 | 0;
							$2_1 = $2_1 + -16 | 0;
							if ($2_1 >>> 0 > 15 >>> 0) {
								continue label$5
							}
							break label$5;
						}					}
					if ($2_1 >>> 0 < 4 >>> 0) {
						break label$1
					}
					label$6: while (1) {
						HEAP32[$3_1 >> 2] = HEAP32[$1_1 >> 2] | 0;
						$1_1 = $1_1 + 4 | 0;
						$3_1 = $3_1 + 4 | 0;
						$2_1 = $2_1 + -4 | 0;
						if ($2_1 >>> 0 > 3 >>> 0) {
							continue label$6
						}
						break label$6;
					}				}
				label$7: {
					if (!$2_1) {
						break label$7
					}
					label$8: while (1) {
						HEAP8[$3_1 >> 0] = HEAPU8[$1_1 >> 0] | 0;
						$3_1 = $3_1 + 1 | 0;
						$1_1 = $1_1 + 1 | 0;
						$2_1 = $2_1 + -1 | 0;
						if ($2_1) {
							continue label$8
						}
						break label$8;
					}				}
				return $0_1 | 0;
			}

			function $5($0_1, $1_1, $2_1) {
				$0_1 = $0_1 | 0;
				$1_1 = $1_1 | 0;
				$2_1 = $2_1 | 0;
				var $3_1 = 0, $4_1 = 0;
				label$1: {
					label$2: {
						if (!($0_1 & 3 | 0)) {
							break label$2
						}
						$3_1 = $0_1;
						break label$1;
					}
					$4_1 = Math_imul($1_1 & 255 | 0, 16843009);
					label$3: {
						label$4: {
							if ($2_1 >>> 0 >= 16 >>> 0) {
								break label$4
							}
							$3_1 = $0_1;
							break label$3;
						}
						$3_1 = $0_1;
						label$5: while (1) {
							HEAP32[$3_1 >> 2] = $4_1;
							HEAP32[($3_1 + 12 | 0) >> 2] = $4_1;
							HEAP32[($3_1 + 8 | 0) >> 2] = $4_1;
							HEAP32[($3_1 + 4 | 0) >> 2] = $4_1;
							$3_1 = $3_1 + 16 | 0;
							$2_1 = $2_1 + -16 | 0;
							if ($2_1 >>> 0 > 15 >>> 0) {
								continue label$5
							}
							break label$5;
						}					}
					if ($2_1 >>> 0 < 4 >>> 0) {
						break label$1
					}
					label$6: while (1) {
						HEAP32[$3_1 >> 2] = $4_1;
						$3_1 = $3_1 + 4 | 0;
						$2_1 = $2_1 + -4 | 0;
						if ($2_1 >>> 0 > 3 >>> 0) {
							continue label$6
						}
						break label$6;
					}				}
				label$7: {
					if (!$2_1) {
						break label$7
					}
					label$8: while (1) {
						HEAP8[$3_1 >> 0] = $1_1;
						$3_1 = $3_1 + 1 | 0;
						$2_1 = $2_1 + -1 | 0;
						if ($2_1) {
							continue label$8
						}
						break label$8;
					}				}
				return $0_1 | 0;
			}
			bufferView = HEAPU8;
			initActiveSegments();
			function __wasm_memory_size() {
				return buffer.byteLength / 65536 | 0;
			}

			function __wasm_memory_grow(pagesToAdd) {
				pagesToAdd = pagesToAdd | 0;
				var oldPages = __wasm_memory_size() | 0;
				var newPages = oldPages + pagesToAdd | 0;
				if ((oldPages < newPages) && (newPages < 65536)) {
					var newBuffer = new ArrayBuffer(Math_imul(newPages, 65536));
					var newHEAP8 = new Int8Array(newBuffer);
					newHEAP8.set(HEAP8);
					HEAP8 = new Int8Array(newBuffer);
					HEAP16 = new Int16Array(newBuffer);
					HEAP32 = new Int32Array(newBuffer);
					HEAPU8 = new Uint8Array(newBuffer);
					buffer = newBuffer;
					bufferView = HEAPU8;
				}
				return oldPages;
			}

			return {
				"memory": Object.create(Object.prototype, {
					"grow": {
						"value": __wasm_memory_grow
					},
					"buffer": {
						"get": function () {
							return buffer;
						}

					}
				}),
				"__wasm_call_ctors": $0,
				"meshopt_decodeVertexBuffer": $1,
				"meshopt_decodeIndexBuffer": $2,
				"sbrk": $3
			};
		}

		return asmFunc();
	} 
} (meshopt_decoder_asm$1));

var meshopt_decoder_asmExports = meshopt_decoder_asm$1.exports;
var meshopt_decoder_asm_default = /*@__PURE__*/getDefaultExportFromCjs(meshopt_decoder_asmExports);

var meshopt_decoder_asm = /*#__PURE__*/_mergeNamespaces({
	__proto__: null,
	default: meshopt_decoder_asm_default
}, [meshopt_decoder_asmExports]);

export { meshopt_decoder_asm as m };
//# sourceMappingURL=meshopt_decoder.asm-JLPh_vof.js.map
