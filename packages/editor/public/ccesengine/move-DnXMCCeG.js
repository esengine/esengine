import { c as assertsArrayIndex } from './gc-object-CShF5lzx.js';

function shift(array, first, last) {
  assertsArrayIndex(array, first);
  assertsArrayIndex(array, last);
  if (first === last) {
    return array;
  }
  var element = array[first];
  if (first < last) {
    for (var iElement = first + 1; iElement <= last; ++iElement) {
      array[iElement - 1] = array[iElement];
    }
  } else {
    for (var _iElement = first; _iElement !== last; --_iElement) {
      array[_iElement] = array[_iElement - 1];
    }
  }
  array[last] = element;
  return array;
}

export { shift as s };
//# sourceMappingURL=move-DnXMCCeG.js.map
