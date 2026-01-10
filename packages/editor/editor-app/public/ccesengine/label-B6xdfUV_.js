import { _ as _inheritsLoose, a as _createClass, b as _applyDecoratedDescriptor, a5 as Pool, w as warnID, l as _createForOfIteratorHelperLoose, ap as mixin, G as macro, x as ccenum } from './gc-object-CShF5lzx.js';
import { c as ccclass, b as applyDecoratedInitializer, s as serializable, L as override, b1 as string, t as type, C as Color, B as Size, m as Rect, V as Vec2, l as executionOrder } from './index-uXI1_UMk.js';
import './_virtual_internal_constants-DWlew7Dp.js';
import { c as cclegacy, a as ccwindow } from './global-exports-DnCP_14L.js';
import { S as SpriteFrame } from './sprite-frame-DHXMUUT-.js';
import './sprite-BKXaVEzt.js';
import './debug-view-BuNhRPv_.js';
import { A as Asset, e as extname } from './node-event-Ccvtv8bJ.js';
import { m as downloader, n as factory, P as PixelFormat, i as Texture2D, I as ImageAsset, f as TextureBase } from './scene-vWcxM1_c.js';
import './device-manager-CBXP-ttm.js';
import { J as BufferTextureCopy } from './buffer-barrier-BlQXg9Aa.js';
import { d as director, D as DirectorEvent } from './director-F7e_Lqjg.js';
import { I as InstanceMaterialType, U as UIRenderer } from './ui-renderer-JpGcj-VM.js';

var _dec$4, _class$4;
var Font = (_dec$4 = ccclass('cc.Font'), _dec$4(_class$4 = function (_Asset) {
  function Font(name) {
    return _Asset.call(this, name) || this;
  }
  _inheritsLoose(Font, _Asset);
  return Font;
}(Asset)) || _class$4);
cclegacy.Font = Font;

var _dec$3, _class$3, _class2$2, _initializer$2;
var TTFFont = (_dec$3 = ccclass('cc.TTFFont'), _dec$3(_class$3 = (_class2$2 = function (_Font) {
  function TTFFont() {
    var _this;
    _this = _Font.call(this) || this;
    _this._fontFamily = _initializer$2 && _initializer$2();
    return _this;
  }
  _inheritsLoose(TTFFont, _Font);
  var _proto = TTFFont.prototype;
  _proto.initDefault = function initDefault(uuid) {
    this._fontFamily = 'Arial';
    _Font.prototype.initDefault.call(this, uuid);
  };
  return _createClass(TTFFont, [{
    key: "_nativeAsset",
    get: function get() {
      return this._fontFamily;
    },
    set: function set(value) {
      this._fontFamily = value || 'Arial';
    }
  }, {
    key: "_nativeDep",
    get: function get() {
      return {
        uuid: this._uuid,
        __nativeName__: this._native,
        ext: extname(this._native),
        __isNative__: true
      };
    }
  }]);
}(Font), _initializer$2 = applyDecoratedInitializer(_class2$2.prototype, "_fontFamily", [serializable], function () {
  return null;
}), _applyDecoratedDescriptor(_class2$2.prototype, "_nativeAsset", [override, string], Object.getOwnPropertyDescriptor(_class2$2.prototype, "_nativeAsset"), _class2$2.prototype), _applyDecoratedDescriptor(_class2$2.prototype, "_nativeDep", [override], Object.getOwnPropertyDescriptor(_class2$2.prototype, "_nativeDep"), _class2$2.prototype), _class2$2)) || _class$3);
cclegacy.TTFFont = TTFFont;

var BASELINE_RATIO = 0.26;
var _BASELINE_OFFSET = 0;
var MIDDLE_RATIO = (BASELINE_RATIO + 1) / 2 - BASELINE_RATIO;
function getBaselineOffset() {
  return _BASELINE_OFFSET;
}
var MAX_CACHE_SIZE = 100;
var pool = new Pool(2);
pool.get = function () {
  return this._get() || {
    key: '',
    value: 0,
    prev: null,
    next: null
  };
};
var LRUCache = function () {
  function LRUCache(size) {
    this.count = 0;
    this.limit = 0;
    this.datas = {};
    this.head = null;
    this.tail = null;
    this.limit = size;
  }
  var _proto = LRUCache.prototype;
  _proto.moveToHead = function moveToHead(node) {
    node.next = this.head;
    node.prev = null;
    if (this.head) this.head.prev = node;
    this.head = node;
    if (!this.tail) this.tail = node;
    this.count++;
    this.datas[node.key] = node;
  };
  _proto.put = function put(key, value) {
    var node = pool.get();
    node.key = key;
    node.value = value;
    if (this.count >= this.limit) {
      var discard = this.tail;
      delete this.datas[discard.key];
      this.count--;
      this.tail = discard.prev;
      this.tail.next = null;
      discard.prev = null;
      discard.next = null;
      pool.put(discard);
    }
    this.moveToHead(node);
  };
  _proto.remove = function remove(node) {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }
    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
    delete this.datas[node.key];
    this.count--;
  };
  _proto.get = function get(key) {
    var node = this.datas[key];
    if (node) {
      this.remove(node);
      this.moveToHead(node);
      return node.value;
    }
    return null;
  };
  _proto.clear = function clear() {
    this.count = 0;
    this.datas = {};
    this.head = null;
    this.tail = null;
  };
  _proto.has = function has(key) {
    return !!this.datas[key];
  };
  _proto["delete"] = function _delete(key) {
    var node = this.datas[key];
    this.remove(node);
  };
  return LRUCache;
}();
var measureCache = new LRUCache(MAX_CACHE_SIZE);
var WORD_REG = /([a-zA-Z0-9ÄÖÜäöüßéèçàùêâîôûа-яА-ЯЁё]+|\S)/;
var SYMBOL_REG = /^[!,.:;'}\]%\?>、‘“》？。，！]/;
var CHAR_SET = '[a-zA-Z0-9ÄÖÜäöüßéèçàùêâîôûаíìÍÌïÁÀáàÉÈÒÓòóŐőÙÚŰúűñÑæÆœŒÃÂãÔõěščřžýáíéóúůťďňĚŠČŘŽÁÍÉÓÚŤżźśóńłęćąŻŹŚÓŃŁĘĆĄ-яА-ЯЁёáàảạãăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệiíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđÁÀẢẠÃĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆIÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴĐ]';
var LAST_WORD_REG = new RegExp("(" + CHAR_SET + "+|\\S)$");
var LAST_ENGLISH_REG = new RegExp(CHAR_SET + "+$");
var FIRST_ENGLISH_REG = new RegExp("^" + CHAR_SET);
function isUnicodeCJK(ch) {
  var __CHINESE_REG = /^[\u4E00-\u9FFF\u3400-\u4DFF]+$/;
  var __JAPANESE_REG = /[\u3000-\u303F]|[\u3040-\u309F]|[\u30A0-\u30FF]|[\uFF00-\uFFEF]|[\u4E00-\u9FAF]|[\u2605-\u2606]|[\u2190-\u2195]|\u203B/g;
  var __KOREAN_REG = /^[\u1100-\u11FF]|[\u3130-\u318F]|[\uA960-\uA97F]|[\uAC00-\uD7AF]|[\uD7B0-\uD7FF]+$/;
  return __CHINESE_REG.test(ch) || __JAPANESE_REG.test(ch) || __KOREAN_REG.test(ch);
}
function isUnicodeSpace(ch) {
  var chCode = ch.charCodeAt(0);
  return chCode >= 9 && chCode <= 13 || chCode === 32 || chCode === 133 || chCode === 160 || chCode === 5760 || chCode >= 8192 && chCode <= 8202 || chCode === 8232 || chCode === 8233 || chCode === 8239 || chCode === 8287 || chCode === 12288;
}
function safeMeasureText(ctx, string, desc) {
  var font = desc || ctx.font;
  var key = font + "\uD83C\uDFAE" + string;
  var cache = measureCache.get(key);
  if (cache !== null) {
    return cache;
  }
  var metric = ctx.measureText(string);
  var width = metric && metric.width || 0;
  measureCache.put(key, width);
  return width;
}
function getSymbolLength(str) {
  var length = str.length;
  var count = 0;
  var charCode = 0;
  for (var i = 0; i < length; i++) {
    charCode = str.charCodeAt(i);
    if (charCode === 0x200d) {
      continue;
    }
    if (charCode >= 0xd800 && charCode <= 0xdbff) {
      charCode = str.charCodeAt(i + 1);
      if (charCode >= 0xdc00 && charCode <= 0xdfff) {
        if (i + 2 >= length || str.charCodeAt(i + 2) !== 0x200d) {
          count++;
        }
        i++;
        continue;
      }
    }
    count++;
  }
  return count;
}
function getSymbolAt(str, index) {
  var length = str.length;
  var len = 0;
  var count = 0;
  var start = 0;
  var charCode = 0;
  for (var i = 0; i < length; i++) {
    charCode = str.charCodeAt(i);
    if (charCode === 0x200d) {
      len++;
      continue;
    }
    if (charCode >= 0xd800 && charCode <= 0xdbff) {
      len++;
      charCode = str.charCodeAt(i + 1);
      if (charCode >= 0xdc00 && charCode <= 0xdfff) {
        len++;
        if (i + 2 >= length || str.charCodeAt(i + 2) !== 0x200d) {
          if (index === count) {
            return str.slice(start, start + len);
          }
          start += len;
          count++;
          len = 0;
        }
        i++;
        continue;
      }
    }
    if (index === count) {
      return str.charAt(i);
    }
    start = i + 1;
    count++;
    len = 0;
  }
  return '';
}
function getSymbolCodeAt(str, index) {
  var _char = getSymbolAt(str, index);
  if (_char.length === 1) {
    return "" + _char.charCodeAt(0);
  }
  var charCodes = '';
  for (var j = 0; j < _char.length; j++) {
    charCodes += "" + _char.charCodeAt(j);
  }
  return "" + charCodes;
}
function getSymbolStartIndex(targetString, index) {
  if (index >= targetString.length) {
    return targetString.length;
  }
  var startCheckIndex = index;
  var startChar = targetString[startCheckIndex];
  while (startCheckIndex >= 0) {
    if (startChar === "\u200D") {
      startCheckIndex--;
      startChar = targetString[startCheckIndex];
    }
    if (startChar >= "\uDC00" && startChar <= "\uDFFF") {
      if (startCheckIndex - 1 >= 0) {
        startCheckIndex--;
        startChar = targetString[startCheckIndex];
      }
    }
    if (startChar >= "\uD800" && startChar <= "\uDBFF") {
      if (startCheckIndex - 1 >= 0 && targetString[startCheckIndex - 1] === "\u200D") {
        startCheckIndex--;
        startChar = targetString[startCheckIndex];
      } else {
        break;
      }
    } else {
      break;
    }
  }
  return startCheckIndex;
}
function getSymbolEndIndex(targetString, index) {
  var newEndIndex = index;
  var endCheckIndex = index;
  var endChar = targetString[endCheckIndex];
  while (endCheckIndex < targetString.length) {
    if (endChar === "\u200D") {
      endCheckIndex++;
      newEndIndex++;
      endChar = targetString[endCheckIndex];
      if (endChar >= "\uD800" && endChar <= "\uDBFF") {
        endCheckIndex++;
        newEndIndex++;
        endChar = targetString[endCheckIndex];
      }
    }
    if (endChar >= "\uD800" && endChar <= "\uDBFF") {
      endCheckIndex++;
      newEndIndex++;
      endChar = targetString[endCheckIndex];
    } else if (endChar >= "\uDC00" && endChar <= "\uDFFF") {
      endCheckIndex++;
      endChar = targetString[endCheckIndex];
      if (endCheckIndex < targetString.length && targetString[endCheckIndex] === "\u200D") {
        newEndIndex++;
        endChar = targetString[endCheckIndex];
      } else {
        break;
      }
    } else {
      break;
    }
  }
  return newEndIndex;
}
function _safeSubstring(targetString, startIndex, endIndex) {
  var newStartIndex = getSymbolStartIndex(targetString, startIndex);
  if (newStartIndex < startIndex) {
    newStartIndex = getSymbolEndIndex(targetString, startIndex) + 1;
  }
  var newEndIndex = endIndex;
  if (endIndex !== undefined) {
    endIndex = Math.max(0, endIndex - 1);
    newEndIndex = getSymbolEndIndex(targetString, endIndex);
    var newStartEndIndex = getSymbolStartIndex(targetString, endIndex);
    if (newStartEndIndex < newStartIndex || newStartEndIndex === newStartIndex && startIndex > newStartIndex) {
      newEndIndex = newStartIndex;
    } else {
      newEndIndex += 1;
    }
  }
  return targetString.substring(newStartIndex, newEndIndex);
}
function isEnglishWordPartAtFirst(stringToken) {
  return FIRST_ENGLISH_REG.test(stringToken);
}
function isEnglishWordPartAtLast(stringToken) {
  return LAST_ENGLISH_REG.test(stringToken);
}
function getEnglishWordPartAtFirst(stringToken) {
  var result = FIRST_ENGLISH_REG.exec(stringToken);
  return result;
}
function getEnglishWordPartAtLast(stringToken) {
  var result = LAST_ENGLISH_REG.exec(stringToken);
  return result;
}
function fragmentText(stringToken, allWidth, maxWidth, measureText) {
  var wrappedWords = [];
  if (stringToken.length === 0 || maxWidth < 0) {
    wrappedWords.push('');
    return wrappedWords;
  }
  var text = stringToken;
  while (allWidth > maxWidth && text.length > 1) {
    var fuzzyLen = text.length * (maxWidth / allWidth) | 0;
    var tmpText = _safeSubstring(text, fuzzyLen);
    var width = allWidth - measureText(tmpText);
    var sLine = tmpText;
    var pushNum = 0;
    var checkWhile = 0;
    var checkCount = 100;
    while (width > maxWidth && checkWhile++ < checkCount) {
      fuzzyLen *= maxWidth / width;
      fuzzyLen |= 0;
      tmpText = _safeSubstring(text, fuzzyLen);
      width = allWidth - measureText(tmpText);
    }
    checkWhile = 0;
    while (tmpText && width <= maxWidth && checkWhile++ < checkCount) {
      var exec = WORD_REG.exec(tmpText);
      pushNum = exec ? exec[0].length : 1;
      sLine = tmpText;
      fuzzyLen += pushNum;
      tmpText = _safeSubstring(text, fuzzyLen);
      width = allWidth - measureText(tmpText);
    }
    fuzzyLen -= pushNum;
    if (fuzzyLen === 0) {
      fuzzyLen = 1;
      sLine = _safeSubstring(text, 1);
    } else if (fuzzyLen === 1 && text[0] >= "\uD800" && text[0] <= "\uDBFF") {
      fuzzyLen = 2;
      sLine = _safeSubstring(text, 2);
    }
    var sText = _safeSubstring(text, 0, fuzzyLen);
    var result = void 0;
    {
      if (SYMBOL_REG.test(sLine || tmpText)) {
        result = LAST_WORD_REG.exec(sText);
        fuzzyLen -= result ? result[0].length : 0;
        if (fuzzyLen === 0) {
          fuzzyLen = 1;
        }
        sLine = _safeSubstring(text, fuzzyLen);
        sText = _safeSubstring(text, 0, fuzzyLen);
      }
    }
    if (FIRST_ENGLISH_REG.test(sLine)) {
      result = LAST_ENGLISH_REG.exec(sText);
      if (result && sText !== result[0]) {
        fuzzyLen -= result[0].length;
        sLine = _safeSubstring(text, fuzzyLen);
        sText = _safeSubstring(text, 0, fuzzyLen);
      }
    }
    if (wrappedWords.length === 0) {
      wrappedWords.push(sText);
    } else {
      sText = sText.trim();
      if (sText.length > 0) {
        wrappedWords.push(sText);
      }
    }
    text = sLine || tmpText;
    allWidth = measureText(text);
  }
  if (wrappedWords.length === 0) {
    wrappedWords.push(text);
  } else {
    text = text.trim();
    if (text.length > 0) {
      wrappedWords.push(text);
    }
  }
  return wrappedWords;
}

var ccdocument = ccwindow.document;
var _canvasContext = null;
var _intervalId = -1;
var _testString = "BES bswy:->@123\u4E01\u3041\u1101";
var _fontFaces = Object.create(null);
var _loadingFonts = [];
var _timeout = 3000;
var useNativeCheck = function () {
  var nativeCheck;
  return function () {
    if (nativeCheck === undefined) {
      if ('FontFace' in ccwindow) {
        var match = /Gecko.*Firefox\/(\d+)/.exec(ccwindow.navigator.userAgent);
        var safari10Match = /OS X.*Version\/10\..*Safari/.exec(ccwindow.navigator.userAgent) && /Apple/.exec(ccwindow.navigator.vendor);
        if (match) {
          nativeCheck = parseInt(match[1], 10) > 42;
        } else if (safari10Match) {
          nativeCheck = false;
        } else {
          nativeCheck = true;
        }
      } else {
        nativeCheck = false;
      }
    }
    return nativeCheck;
  };
}();
function checkFontLoaded() {
  var allFontsLoaded = true;
  var now = Date.now();
  for (var i = _loadingFonts.length - 1; i >= 0; i--) {
    var fontLoadHandle = _loadingFonts[i];
    var fontFamily = fontLoadHandle.fontFamilyName;
    if (now - fontLoadHandle.startTime > _timeout) {
      warnID(4933, fontFamily);
      fontLoadHandle.onComplete(null, fontFamily);
      _loadingFonts.splice(i, 1);
      continue;
    }
    var oldWidth = fontLoadHandle.refWidth;
    var fontDesc = "40px " + fontFamily;
    _canvasContext.font = fontDesc;
    var newWidth = safeMeasureText(_canvasContext, _testString, fontDesc);
    if (oldWidth !== newWidth) {
      _loadingFonts.splice(i, 1);
      fontLoadHandle.onComplete(null, fontFamily);
    } else {
      allFontsLoaded = false;
    }
  }
  if (allFontsLoaded) {
    clearInterval(_intervalId);
    _intervalId = -1;
  }
}
function nativeCheckFontLoaded(start, font, callback) {
  var loader = new Promise(function (resolve, reject) {
    var _check = function check() {
      var now = Date.now();
      if (now - start >= _timeout) {
        reject();
      } else {
        ccdocument.fonts.load("40px " + font).then(function (fonts) {
          if (fonts.length >= 1) {
            resolve();
          } else {
            setTimeout(_check, 100);
          }
        }, function () {
          reject();
        });
      }
    };
    _check();
  });
  var timeoutId = null;
  var timer = new Promise(function (resolve, reject) {
    timeoutId = setTimeout(reject, _timeout);
  });
  Promise.race([timer, loader]).then(function () {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    callback(null, font);
  }, function () {
    warnID(4933, font);
    callback(null, font);
  });
}
function loadFont(url, options, onComplete) {
  var fontFamilyName = getFontFamily(url);
  if (_fontFaces[fontFamilyName]) {
    onComplete(null, fontFamilyName);
    return;
  }
  if (!_canvasContext) {
    var labelCanvas = ccdocument.createElement('canvas');
    labelCanvas.width = 100;
    labelCanvas.height = 100;
    _canvasContext = labelCanvas.getContext('2d');
  }
  var fontDesc = "40px " + fontFamilyName;
  var fontStyle = ccdocument.createElement('style');
  fontStyle.type = 'text/css';
  var fontStr = '';
  if (Number.isNaN(fontFamilyName)) {
    fontStr += "@font-face { font-family:" + fontFamilyName + "; src:";
  } else {
    fontStr += "@font-face { font-family:\"" + fontFamilyName + "\"; src:";
  }
  fontStr += "url(\"" + url + "\");";
  fontStyle.textContent = fontStr + "}";
  ccdocument.body.appendChild(fontStyle);
  var preloadDiv = ccdocument.createElement('div');
  var divStyle = preloadDiv.style;
  divStyle.fontFamily = fontFamilyName;
  preloadDiv.innerHTML = '.';
  divStyle.position = 'absolute';
  divStyle.left = '-100px';
  divStyle.top = '-100px';
  ccdocument.body.appendChild(preloadDiv);
  if (useNativeCheck()) {
    nativeCheckFontLoaded(Date.now(), fontFamilyName, onComplete);
  } else {
    var refWidth = safeMeasureText(_canvasContext, _testString, fontDesc);
    var fontLoadHandle = {
      fontFamilyName: fontFamilyName,
      refWidth: refWidth,
      onComplete: onComplete,
      startTime: Date.now()
    };
    _loadingFonts.push(fontLoadHandle);
    if (_intervalId === -1) {
      _intervalId = setInterval(checkFontLoaded, 100);
    }
  }
  _fontFaces[fontFamilyName] = fontStyle;
}
function getFontFamily(fontHandle) {
  var ttfIndex = fontHandle.lastIndexOf('.ttf');
  if (ttfIndex === -1) {
    return fontHandle;
  }
  var slashPos = fontHandle.lastIndexOf('/');
  var fontFamilyName;
  if (slashPos === -1) {
    fontFamilyName = fontHandle.substring(0, ttfIndex) + "_LABEL";
  } else {
    fontFamilyName = fontHandle.substring(slashPos + 1, ttfIndex) + "_LABEL";
  }
  if (fontFamilyName.indexOf(' ') !== -1) {
    fontFamilyName = "\"" + fontFamilyName + "\"";
  }
  return fontFamilyName;
}
function createFont(id, data, options, onComplete) {
  var out = new TTFFont();
  out._nativeUrl = id;
  out._nativeAsset = data;
  onComplete(null, out);
}
downloader.register({
  '.font': loadFont,
  '.eot': loadFont,
  '.ttf': loadFont,
  '.woff': loadFont,
  '.svg': loadFont,
  '.ttc': loadFont
});
factory.register({
  '.font': createFont,
  '.eot': createFont,
  '.ttf': createFont,
  '.woff': createFont,
  '.svg': createFont,
  '.ttc': createFont
});

var eventRegx = /^(click)(\s)*=|(param)(\s)*=/;
var imageAttrReg = /(\s)*src(\s)*=|(\s)*height(\s)*=|(\s)*width(\s)*=|(\s)*align(\s)*=|(\s)*offset(\s)*=|(\s)*click(\s)*=|(\s)*param(\s)*=/;
var HtmlTextParser = function () {
  function HtmlTextParser() {
    this._specialSymbolArray = [];
    this._stack = [];
    this._resultObjectArray = [];
    this._specialSymbolArray.push([/&lt;/g, '<']);
    this._specialSymbolArray.push([/&gt;/g, '>']);
    this._specialSymbolArray.push([/&amp;/g, '&']);
    this._specialSymbolArray.push([/&quot;/g, '"']);
    this._specialSymbolArray.push([/&apos;/g, '\'']);
  }
  var _proto = HtmlTextParser.prototype;
  _proto.parse = function parse(htmlString) {
    this._resultObjectArray.length = 0;
    this._stack.length = 0;
    var startIndex = 0;
    var length = htmlString.length;
    while (startIndex < length) {
      var tagEndIndex = htmlString.indexOf('>', startIndex);
      var tagBeginIndex = -1;
      if (tagEndIndex >= 0) {
        tagBeginIndex = htmlString.lastIndexOf('<', tagEndIndex);
        var noTagBegin = tagBeginIndex < startIndex - 1;
        if (noTagBegin) {
          tagBeginIndex = htmlString.indexOf('<', tagEndIndex + 1);
          tagEndIndex = htmlString.indexOf('>', tagBeginIndex + 1);
        }
      }
      if (tagBeginIndex < 0) {
        this._stack.pop();
        this._processResult(htmlString.substring(startIndex));
        startIndex = length;
      } else {
        var newStr = htmlString.substring(startIndex, tagBeginIndex);
        var tagStr = htmlString.substring(tagBeginIndex + 1, tagEndIndex);
        if (tagStr === '') newStr = htmlString.substring(startIndex, tagEndIndex + 1);
        this._processResult(newStr);
        if (tagEndIndex === -1) {
          tagEndIndex = tagBeginIndex;
        } else if (htmlString.charAt(tagBeginIndex + 1) === '/') {
          this._stack.pop();
        } else {
          this._addToStack(tagStr);
        }
        startIndex = tagEndIndex + 1;
      }
    }
    return this._resultObjectArray;
  };
  _proto._attributeToObject = function _attributeToObject(attribute) {
    attribute = attribute.trim();
    var obj = {};
    var header = /^(color|size)(\s)*=/.exec(attribute);
    var tagName = '';
    var nextSpace = 0;
    var eventHandlerString = '';
    if (header) {
      tagName = header[0];
      attribute = attribute.substring(tagName.length).trim();
      if (attribute === '') {
        return obj;
      }
      nextSpace = attribute.indexOf(' ');
      switch (tagName[0]) {
        case 'c':
          if (nextSpace > -1) {
            obj.color = attribute.substring(0, nextSpace).trim();
          } else {
            obj.color = attribute;
          }
          break;
        case 's':
          obj.size = parseInt(attribute);
          break;
      }
      if (nextSpace > -1) {
        eventHandlerString = attribute.substring(nextSpace + 1).trim();
        obj.event = this._processEventHandler(eventHandlerString);
      }
      return obj;
    }
    header = /^(br(\s)*\/)/.exec(attribute);
    if (header && header[0].length > 0) {
      tagName = header[0].trim();
      if (tagName.startsWith('br') && tagName[tagName.length - 1] === '/') {
        obj.isNewLine = true;
        this._resultObjectArray.push({
          text: '',
          style: {
            isNewLine: true
          }
        });
        return obj;
      }
    }
    header = /^(img(\s)*src(\s)*=[^>]+\/)/.exec(attribute);
    var remainingArgument = '';
    var rightQuot = -1;
    if (header && header[0].length > 0) {
      tagName = header[0].trim();
      if (tagName.startsWith('img') && tagName[tagName.length - 1] === '/') {
        header = imageAttrReg.exec(attribute);
        var tagValue;
        var isValidImageTag = false;
        while (header) {
          attribute = attribute.substring(attribute.indexOf(header[0]));
          tagName = attribute.substring(0, header[0].length);
          var originTagNameLength = tagName.length;
          tagName = tagName.replace(/[^a-zA-Z]/g, '').trim();
          tagName = tagName.toLowerCase();
          remainingArgument = attribute.substring(originTagNameLength).trim();
          if (tagName === 'src') {
            rightQuot = this.getRightQuotationIndex(remainingArgument);
          } else {
            rightQuot = -1;
          }
          nextSpace = remainingArgument.indexOf(' ', rightQuot + 1 >= remainingArgument.length ? -1 : rightQuot + 1);
          tagValue = nextSpace > -1 ? remainingArgument.substring(0, nextSpace) : remainingArgument;
          attribute = remainingArgument.substring(nextSpace).trim();
          if (tagValue.endsWith('/')) {
            tagValue = tagValue.slice(0, -1);
          }
          if (tagName === 'src') {
            switch (tagValue.charCodeAt(0)) {
              case 34:
              case 39:
                isValidImageTag = true;
                tagValue = tagValue.slice(1, -1);
                break;
            }
            obj.isImage = true;
            obj.src = tagValue;
          } else if (tagName === 'height') {
            obj.imageHeight = parseInt(tagValue);
          } else if (tagName === 'width') {
            obj.imageWidth = parseInt(tagValue);
          } else if (tagName === 'align') {
            switch (tagValue.charCodeAt(0)) {
              case 34:
              case 39:
                tagValue = tagValue.slice(1, -1);
                break;
            }
            obj.imageAlign = tagValue.toLowerCase();
          } else if (tagName === 'offset') {
            obj.imageOffset = tagValue;
          } else if (tagName === 'click') {
            obj.event = this._processEventHandler(tagName + "=" + tagValue);
          }
          if (obj.event && tagName === 'param') {
            obj.event[tagName] = tagValue.replace(/^"|"$/g, '');
          }
          header = imageAttrReg.exec(attribute);
        }
        if (isValidImageTag && obj.isImage) {
          this._resultObjectArray.push({
            text: '',
            style: obj
          });
        }
        return {};
      }
    }
    header = /^(outline(\s)*[^>]*)/.exec(attribute);
    if (header) {
      attribute = header[0].substring('outline'.length).trim();
      var defaultOutlineObject = {
        color: '#ffffff',
        width: 1
      };
      if (attribute) {
        var outlineAttrReg = /(\s)*color(\s)*=|(\s)*width(\s)*=|(\s)*click(\s)*=|(\s)*param(\s)*=/;
        header = outlineAttrReg.exec(attribute);
        var _tagValue;
        while (header) {
          attribute = attribute.substring(attribute.indexOf(header[0]));
          tagName = attribute.substring(0, header[0].length);
          remainingArgument = attribute.substring(tagName.length).trim();
          nextSpace = remainingArgument.indexOf(' ');
          if (nextSpace > -1) {
            _tagValue = remainingArgument.substring(0, nextSpace);
          } else {
            _tagValue = remainingArgument;
          }
          tagName = tagName.replace(/[^a-zA-Z]/g, '').trim();
          tagName = tagName.toLowerCase();
          attribute = remainingArgument.substring(nextSpace).trim();
          if (tagName === 'click') {
            obj.event = this._processEventHandler(tagName + "=" + _tagValue);
          } else if (tagName === 'color') {
            defaultOutlineObject.color = _tagValue;
          } else if (tagName === 'width') {
            defaultOutlineObject.width = parseInt(_tagValue);
          }
          if (obj.event && tagName === 'param') {
            obj.event[tagName] = _tagValue.replace(/^"|"$/g, '');
          }
          header = outlineAttrReg.exec(attribute);
        }
      }
      obj.outline = defaultOutlineObject;
    }
    header = /^(on|u|b|i)(\s)*/.exec(attribute);
    if (header && header[0].length > 0) {
      tagName = header[0];
      attribute = attribute.substring(tagName.length).trim();
      switch (tagName[0]) {
        case 'u':
          obj.underline = true;
          break;
        case 'i':
          obj.italic = true;
          break;
        case 'b':
          obj.bold = true;
          break;
      }
      if (attribute === '') {
        return obj;
      }
      obj.event = this._processEventHandler(attribute);
    }
    return obj;
  };
  _proto.getRightQuotationIndex = function getRightQuotationIndex(remainingArgument) {
    var leftQuot = -1;
    var rightQuot = -1;
    var leftSingleQuot = remainingArgument.indexOf('\'');
    var leftDoubleQuot = remainingArgument.indexOf('"');
    var useSingleQuot = leftSingleQuot > -1 && (leftSingleQuot < leftDoubleQuot || leftDoubleQuot === -1);
    var useDoubleQuot = leftDoubleQuot > -1 && (leftDoubleQuot < leftSingleQuot || leftSingleQuot === -1);
    if (useSingleQuot) {
      leftQuot = leftSingleQuot;
      rightQuot = remainingArgument.indexOf('\'', leftQuot + 1 >= remainingArgument.length ? -1 : leftQuot + 1);
    } else if (useDoubleQuot) {
      leftQuot = leftDoubleQuot;
      rightQuot = remainingArgument.indexOf('"', leftQuot + 1 >= remainingArgument.length ? -1 : leftQuot + 1);
    }
    return rightQuot;
  };
  _proto._processEventHandler = function _processEventHandler(eventString) {
    var obj = {};
    var index = 0;
    var isValidTag = false;
    var eventNames = eventRegx.exec(eventString);
    while (eventNames) {
      var eventName = eventNames[0];
      var eventValue = '';
      isValidTag = false;
      eventString = eventString.substring(eventName.length).trim();
      if (eventString.charAt(0) === '"') {
        index = eventString.indexOf('"', 1);
        if (index > -1) {
          eventValue = eventString.substring(1, index).trim();
          isValidTag = true;
        }
        index++;
      } else if (eventString.charAt(0) === '\'') {
        index = eventString.indexOf('\'', 1);
        if (index > -1) {
          eventValue = eventString.substring(1, index).trim();
          isValidTag = true;
        }
        index++;
      } else {
        var match = /(\S)+/.exec(eventString);
        if (match) {
          eventValue = match[0];
        } else {
          eventValue = '';
        }
        index = eventValue.length;
      }
      if (isValidTag) {
        eventName = eventName.substring(0, eventName.length - 1).trim();
        obj[eventName] = eventValue;
      }
      eventString = eventString.substring(index).trim();
      eventNames = eventRegx.exec(eventString);
    }
    return obj;
  };
  _proto._addToStack = function _addToStack(attribute) {
    var obj = this._attributeToObject(attribute);
    if (this._stack.length === 0) {
      this._stack.push(obj);
    } else {
      if (obj.isNewLine || obj.isImage) {
        return;
      }
      var previousTagObj = this._stack[this._stack.length - 1];
      for (var key in previousTagObj) {
        if (!obj[key]) {
          obj[key] = previousTagObj[key];
        }
      }
      this._stack.push(obj);
    }
  };
  _proto._processResult = function _processResult(value) {
    if (value.length === 0) {
      return;
    }
    value = this._escapeSpecialSymbol(value);
    if (this._stack.length > 0) {
      this._resultObjectArray.push({
        text: value,
        style: this._stack[this._stack.length - 1]
      });
    } else {
      this._resultObjectArray.push({
        text: value
      });
    }
  };
  _proto._escapeSpecialSymbol = function _escapeSpecialSymbol(str) {
    for (var _iterator = _createForOfIteratorHelperLoose(this._specialSymbolArray), _step; !(_step = _iterator()).done;) {
      var symbolArr = _step.value;
      var key = symbolArr[0];
      var value = symbolArr[1];
      str = str.replace(key, value);
    }
    return str;
  };
  return HtmlTextParser;
}();

var _dec$2, _dec2$1, _class$2, _class2$1, _initializer$1, _initializer2$1, _initializer3$1, _initializer4$1;
var FontLetterDefinition = function FontLetterDefinition() {
  this.u = 0;
  this.v = 0;
  this.w = 0;
  this.h = 0;
  this.offsetX = 0;
  this.offsetY = 0;
  this.valid = false;
  this.xAdvance = 0;
};
var FontAtlas = function () {
  function FontAtlas(texture) {
    this.letterDefinitions = {};
    this._texture = null;
    this.texture = texture;
  }
  var _proto = FontAtlas.prototype;
  _proto.addLetterDefinitions = function addLetterDefinitions(letter, letterDefinition) {
    this.letterDefinitions[letter] = letterDefinition;
  };
  _proto.cloneLetterDefinition = function cloneLetterDefinition() {
    var copyLetterDefinitions = {};
    for (var _key in this.letterDefinitions) {
      var value = new FontLetterDefinition();
      mixin(value, this.letterDefinitions[_key]);
      copyLetterDefinitions[_key] = value;
    }
    return copyLetterDefinitions;
  };
  _proto.getTexture = function getTexture() {
    return this._texture;
  };
  _proto.getLetter = function getLetter(key) {
    return this.letterDefinitions[key];
  };
  _proto.getLetterDefinitionForChar = function getLetterDefinitionForChar(_char, labelInfo) {
    var key = getSymbolCodeAt(_char, 0);
    var hasKey = Object.prototype.hasOwnProperty.call(this.letterDefinitions, key);
    var letter = null;
    if (hasKey) {
      letter = this.letterDefinitions[key];
    }
    return letter;
  };
  _proto.clear = function clear() {
    this.letterDefinitions = {};
  };
  return _createClass(FontAtlas, [{
    key: "texture",
    get: function get() {
      return this._texture;
    },
    set: function set(texture) {
      var oldTexture = this._texture;
      if (oldTexture === texture) return;
      if (oldTexture) {
        oldTexture.decRef(false);
        if (oldTexture.refCount <= 0) {
          oldTexture.destroy();
        }
      }
      if (texture) {
        texture.addRef();
      }
      this._texture = texture;
    }
  }]);
}();
var BitmapFont = (_dec$2 = ccclass('cc.BitmapFont'), _dec2$1 = type(SpriteFrame), _dec$2(_class$2 = (_class2$1 = function (_Font) {
  function BitmapFont() {
    var _this;
    _this = _Font.call(this) || this;
    _this.fntDataStr = _initializer$1 && _initializer$1();
    _this.spriteFrame = _initializer2$1 && _initializer2$1();
    _this.fontSize = _initializer3$1 && _initializer3$1();
    _this.fntConfig = _initializer4$1 && _initializer4$1();
    return _this;
  }
  _inheritsLoose(BitmapFont, _Font);
  var _proto2 = BitmapFont.prototype;
  _proto2.onLoaded = function onLoaded() {
    var spriteFrame = this.spriteFrame;
    if (!this.fontDefDictionary && spriteFrame) {
      this.fontDefDictionary = new FontAtlas(spriteFrame.texture);
    }
    var fntConfig = this.fntConfig;
    if (!fntConfig) {
      warnID(16376);
      return;
    }
    var fontDict = fntConfig.fontDefDictionary;
    for (var fontDef in fontDict) {
      var info = fontDict[fontDef];
      var letter = new FontLetterDefinition();
      var rect = info.rect;
      letter.offsetX = info.xOffset;
      letter.offsetY = info.yOffset;
      letter.w = rect.width;
      letter.h = rect.height;
      letter.u = rect.x;
      letter.v = rect.y;
      letter.valid = true;
      letter.xAdvance = info.xAdvance;
      this.fontDefDictionary.addLetterDefinitions(fontDef, letter);
    }
  };
  return BitmapFont;
}(Font), _initializer$1 = applyDecoratedInitializer(_class2$1.prototype, "fntDataStr", [serializable], function () {
  return '';
}), _initializer2$1 = applyDecoratedInitializer(_class2$1.prototype, "spriteFrame", [_dec2$1], function () {
  return null;
}), _initializer3$1 = applyDecoratedInitializer(_class2$1.prototype, "fontSize", [serializable], function () {
  return -1;
}), _initializer4$1 = applyDecoratedInitializer(_class2$1.prototype, "fntConfig", [serializable], function () {
  return null;
}), _class2$1)) || _class$2);
cclegacy.BitmapFont = BitmapFont;

var _dec$1, _class$1;
var LabelAtlas = (_dec$1 = ccclass('cc.LabelAtlas'), _dec$1(_class$1 = function (_BitmapFont) {
  function LabelAtlas() {
    return _BitmapFont.apply(this, arguments) || this;
  }
  _inheritsLoose(LabelAtlas, _BitmapFont);
  return LabelAtlas;
}(BitmapFont)) || _class$1);
cclegacy.LabelAtlas = LabelAtlas;

var _canvasPool;
var CanvasPool = function () {
  function CanvasPool() {
    this.pool = [];
  }
  CanvasPool.getInstance = function getInstance() {
    if (!_canvasPool) {
      _canvasPool = new CanvasPool();
    }
    return _canvasPool;
  };
  var _proto = CanvasPool.prototype;
  _proto.get = function get() {
    var data = this.pool.pop();
    if (!data) {
      var canvas = ccwindow.document.createElement('canvas');
      var context = canvas.getContext('2d');
      data = {
        canvas: canvas,
        context: context
      };
    }
    return data;
  };
  _proto.put = function put(canvas) {
    if (this.pool.length >= macro.MAX_LABEL_CANVAS_POOL_SIZE) {
      return;
    }
    this.pool.push(canvas);
  };
  return CanvasPool;
}();
var WHITE = Color.WHITE.clone();
var space = 0;
var bleed = 2;
var _backgroundStyle = "rgba(255, 255, 255, " + (1 / 255).toFixed(3) + ")";
var BASELINE_OFFSET = getBaselineOffset();
var LetterTexture = function () {
  function LetterTexture(_char, labelInfo) {
    this.image = null;
    this.data = null;
    this.canvas = null;
    this.context = null;
    this.width = 0;
    this.height = 0;
    this.offsetY = 0;
    this["char"] = _char;
    this.labelInfo = labelInfo;
    this.hash = "" + getSymbolCodeAt(_char, 0) + labelInfo.hash;
  }
  var _proto2 = LetterTexture.prototype;
  _proto2.updateRenderData = function updateRenderData() {
    this._updateProperties();
    this._updateTexture();
  };
  _proto2.destroy = function destroy() {
    this.image = null;
    CanvasPool.getInstance().put(this.data);
    this.data = null;
  };
  _proto2._updateProperties = function _updateProperties() {
    this.data = CanvasPool.getInstance().get();
    this.canvas = this.data.canvas;
    this.context = this.data.context;
    if (this.context) {
      var fontScale = this.labelInfo.fontScale;
      this.context.font = this.labelInfo.fontDesc;
      var width = safeMeasureText(this.context, this["char"], this.labelInfo.fontDesc);
      var blank = this.labelInfo.margin * 2 + bleed;
      this.width = parseFloat(width.toFixed(2)) * fontScale + blank;
      this.height = (1 + BASELINE_RATIO) * this.labelInfo.fontSize * fontScale + blank;
      this.offsetY = -(this.labelInfo.fontSize * BASELINE_RATIO) * fontScale / 2;
    }
    if (this.canvas.width !== this.width) {
      this.canvas.width = this.width;
    }
    if (this.canvas.height !== this.height) {
      this.canvas.height = this.height;
    }
    if (!this.image) {
      this.image = new ImageAsset();
    }
    this.image.reset(this.canvas);
  };
  _proto2._updateTexture = function _updateTexture() {
    if (!this.context || !this.canvas) {
      return;
    }
    var context = this.context;
    var labelInfo = this.labelInfo;
    var width = this.canvas.width;
    var height = this.canvas.height;
    var fontScale = labelInfo.fontScale;
    context.textAlign = 'center';
    context.textBaseline = 'alphabetic';
    context.clearRect(0, 0, width, height);
    context.fillStyle = _backgroundStyle;
    context.fillRect(0, 0, width, height);
    context.font = labelInfo.fontDesc.replace(/(\d+)(\.\d+)?(px|em|rem|pt)/g, function (w, m, n, u) {
      return (+m * fontScale + (+n || 0) * fontScale).toString() + u;
    });
    var fontSize = labelInfo.fontSize * fontScale;
    var startX = width / 2;
    var startY = height / 2 + fontSize * MIDDLE_RATIO + fontSize * BASELINE_OFFSET;
    var color = labelInfo.color;
    context.lineJoin = 'round';
    context.fillStyle = "rgba(" + color.r + ", " + color.g + ", " + color.b + ", " + 1 + ")";
    if (labelInfo.isOutlined) {
      var strokeColor = labelInfo.out || WHITE;
      context.strokeStyle = "rgba(" + strokeColor.r + ", " + strokeColor.g + ", " + strokeColor.b + ", " + strokeColor.a / 255 + ")";
      context.lineWidth = labelInfo.margin * 2 * fontScale;
      context.strokeText(this["char"], startX, startY);
    }
    context.fillText(this["char"], startX, startY);
  };
  return LetterTexture;
}();
var LetterRenderTexture = function (_Texture2D) {
  function LetterRenderTexture() {
    return _Texture2D.apply(this, arguments) || this;
  }
  _inheritsLoose(LetterRenderTexture, _Texture2D);
  var _proto3 = LetterRenderTexture.prototype;
  _proto3.initWithSize = function initWithSize(width, height, format) {
    if (format === void 0) {
      format = PixelFormat.RGBA8888;
    }
    this.reset({
      width: width,
      height: height,
      format: format
    });
  };
  _proto3.drawTextureAt = function drawTextureAt(image, x, y) {
    var gfxTexture = this.getGFXTexture();
    if (!image || !gfxTexture) {
      return;
    }
    var gfxDevice = this._getGFXDevice();
    if (!gfxDevice) {
      warnID(16363);
      return;
    }
    var region = new BufferTextureCopy();
    region.texOffset.x = x;
    region.texOffset.y = y;
    region.texExtent.width = image.width;
    region.texExtent.height = image.height;
    gfxDevice.copyTexImagesToTexture([image.data], gfxTexture, [region]);
  };
  return LetterRenderTexture;
}(Texture2D);
var LetterAtlas = function () {
  function LetterAtlas(width, height) {
    this._x = space;
    this._y = space;
    this._nextY = space;
    this._width = 0;
    this._height = 0;
    this._halfBleed = 0;
    this._dirty = false;
    var texture = new LetterRenderTexture();
    texture.initWithSize(width, height);
    this.fontDefDictionary = new FontAtlas(texture);
    this._halfBleed = bleed / 2;
    this._width = width;
    this._height = height;
    director.on(DirectorEvent.BEFORE_SCENE_LAUNCH, this.beforeSceneLoad, this);
  }
  var _proto4 = LetterAtlas.prototype;
  _proto4.insertLetterTexture = function insertLetterTexture(letterTexture) {
    var img = letterTexture.image;
    var device = director.root.device;
    if (!img || !this.fontDefDictionary || !device) {
      return null;
    }
    var width = img.width;
    var height = img.height;
    if (this._x + width + space > this._width) {
      this._x = space;
      this._y = this._nextY;
    }
    if (this._y + height > this._nextY) {
      this._nextY = this._y + height + space;
    }
    if (this._nextY > this._height) {
      warnID(12100);
      return null;
    }
    if (!this.fontDefDictionary.texture) {
      return null;
    }
    var rt = this.fontDefDictionary.texture;
    rt.drawTextureAt(img, this._x, this._y);
    this._dirty = true;
    var letterDefinition = new FontLetterDefinition();
    letterDefinition.u = this._x + this._halfBleed;
    letterDefinition.v = this._y + this._halfBleed;
    letterDefinition.valid = true;
    letterDefinition.w = letterTexture.width - bleed;
    letterDefinition.h = letterTexture.height - bleed;
    letterDefinition.xAdvance = letterDefinition.w;
    letterDefinition.offsetY = letterTexture.offsetY;
    this._x += width + space;
    this.fontDefDictionary.addLetterDefinitions(letterTexture.hash, letterDefinition);
    return letterDefinition;
  };
  _proto4.update = function update() {
    if (!this._dirty) {
      return;
    }
    this._dirty = false;
  };
  _proto4.reset = function reset() {
    this._x = space;
    this._y = space;
    this._nextY = space;
    this.fontDefDictionary.clear();
  };
  _proto4.destroy = function destroy() {
    this.reset();
    var dict = this.fontDefDictionary;
    if (dict && dict.texture) {
      dict.texture = null;
    }
  };
  _proto4.getTexture = function getTexture() {
    return this.fontDefDictionary.getTexture();
  };
  _proto4.beforeSceneLoad = function beforeSceneLoad() {
    this.clearAllCache();
  };
  _proto4.clearAllCache = function clearAllCache() {
    this.destroy();
    var texture = new LetterRenderTexture();
    texture.initWithSize(this._width, this._height);
    this.fontDefDictionary.texture = texture;
  };
  _proto4.getLetter = function getLetter(key) {
    return this.fontDefDictionary.letterDefinitions[key];
  };
  _proto4.getLetterDefinitionForChar = function getLetterDefinitionForChar(_char2, labelInfo) {
    var hash = getSymbolCodeAt(_char2, 0) + labelInfo.hash;
    var letter = this.fontDefDictionary.letterDefinitions[hash];
    if (!letter) {
      var temp = new LetterTexture(_char2, labelInfo);
      temp.updateRenderData();
      letter = this.insertLetterTexture(temp);
      temp.destroy();
    }
    return letter;
  };
  return _createClass(LetterAtlas, [{
    key: "width",
    get: function get() {
      return this._width;
    }
  }, {
    key: "height",
    get: function get() {
      return this._height;
    }
  }]);
}();
var shareLabelInfo = {
  fontAtlas: null,
  fontSize: 0,
  lineHeight: 0,
  hAlign: 0,
  vAlign: 0,
  hash: '',
  fontFamily: '',
  fontDesc: 'Arial',
  color: Color.WHITE.clone(),
  isOutlined: false,
  out: Color.WHITE.clone(),
  margin: 0,
  fontScale: 1
};
function computeHash(labelInfo) {
  var hashData = '';
  var color = labelInfo.color.toHEX();
  var out = '';
  if (labelInfo.isOutlined && labelInfo.margin > 0) {
    out = out + labelInfo.margin + labelInfo.out.toHEX();
  }
  return hashData + labelInfo.fontSize + labelInfo.fontFamily + color + out;
}

var TextStyle = function () {
  function TextStyle() {
    this.isBold = false;
    this.isItalic = false;
    this.isUnderline = false;
    this.underlineHeight = 1;
    this.isOutlined = false;
    this.outlineColor = Color.WHITE.clone();
    this.outlineWidth = 1;
    this.hasShadow = false;
    this.shadowColor = Color.BLACK.clone();
    this.shadowBlur = 2;
    this.shadowOffsetX = 0;
    this.shadowOffsetY = 0;
    this.color = Color.WHITE.clone();
    this.fontSize = 40;
    this.actualFontSize = 0;
    this.isSystemFontUsed = false;
    this.originFontSize = 0;
    this.bmfontScale = 1.0;
    this.fontFamily = 'Arial';
    this.fontDesc = '';
    this.fntConfig = null;
    this.spriteFrame = null;
    this.fontScale = 1;
  }
  var _proto = TextStyle.prototype;
  _proto.reset = function reset() {
    this.isBold = false;
    this.isItalic = false;
    this.isUnderline = false;
    this.underlineHeight = 1;
    this.isOutlined = false;
    this.outlineColor.set();
    this.outlineWidth = 1;
    this.hasShadow = false;
    this.shadowColor.set();
    this.shadowBlur = 2;
    this.shadowOffsetX = 0;
    this.shadowOffsetY = 0;
  };
  return TextStyle;
}();

var TextLayout = function () {
  function TextLayout() {
    this.horizontalAlign = 0;
    this.verticalAlign = 0;
    this.wrapping = true;
    this.overFlow = 0;
    this.lineHeight = 10;
    this.maxLineWidth = 0;
    this.spacingX = 0;
    this.textWidthTemp = 0;
    this.textHeightTemp = 0;
    this.textDimensions = new Size();
    this.horizontalKerning = [];
    this.numberOfLines = 1;
    this.linesOffsetX = [];
    this.letterOffsetY = 0;
    this.tailoredTopY = 0;
    this.tailoredBottomY = 0;
    this.textDesiredHeight = 0;
    this.linesWidth = [];
  }
  var _proto = TextLayout.prototype;
  _proto.reset = function reset() {
    this.horizontalAlign = 0;
    this.verticalAlign = 0;
    this.wrapping = true;
    this.overFlow = 0;
    this.lineHeight = 10;
    this.maxLineWidth = 0;
    this.spacingX = 0;
    this.textWidthTemp = 0;
    this.textHeightTemp = 0;
    this.textDimensions.set();
    this.horizontalKerning.length = 0;
    this.numberOfLines = 1;
    this.linesOffsetX.length = 0;
    this.letterOffsetY = 0;
    this.tailoredTopY = 0;
    this.tailoredBottomY = 0;
    this.textDesiredHeight = 0;
    this.linesWidth.length = 0;
  };
  return TextLayout;
}();

var TextOutputLayoutData = function () {
  function TextOutputLayoutData() {
    this.parsedString = [];
    this.nodeContentSize = Size.ZERO.clone();
    this.canvasSize = new Size();
    this.canvasPadding = new Rect();
    this.contentSizeExtend = Size.ZERO.clone();
    this.startPosition = Vec2.ZERO.clone();
  }
  var _proto = TextOutputLayoutData.prototype;
  _proto.reset = function reset() {
    this.parsedString.length = 0;
    this.nodeContentSize.set(0, 0);
    this.canvasSize.set();
    this.canvasPadding.set();
    this.contentSizeExtend.set();
    this.startPosition.set();
  };
  return TextOutputLayoutData;
}();
var TextOutputRenderData = function () {
  function TextOutputRenderData() {
    this.quadCount = 0;
    this.vertexBuffer = [];
    this.texture = null;
    this.uiTransAnchorX = 0.5;
    this.uiTransAnchorY = 0.5;
  }
  var _proto2 = TextOutputRenderData.prototype;
  _proto2.reset = function reset() {
    this.quadCount = 0;
    this.vertexBuffer.length = 0;
    this.texture = null;
    this.uiTransAnchorX = 0.5;
    this.uiTransAnchorY = 0.5;
  };
  return TextOutputRenderData;
}();

var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _class, _class2, _initializer, _initializer2, _initializer3, _initializer4, _initializer5, _initializer6, _initializer7, _initializer8, _initializer9, _initializer0, _initializer1, _initializer10, _initializer11, _initializer12, _initializer13, _initializer14, _initializer15, _initializer16, _initializer17, _initializer18, _initializer19, _initializer20, _initializer21, _initializer22, _Label;
Color.WHITE.clone();
var HorizontalTextAlignment;
(function (HorizontalTextAlignment) {
  HorizontalTextAlignment[HorizontalTextAlignment["LEFT"] = 0] = "LEFT";
  HorizontalTextAlignment[HorizontalTextAlignment["CENTER"] = 1] = "CENTER";
  HorizontalTextAlignment[HorizontalTextAlignment["RIGHT"] = 2] = "RIGHT";
})(HorizontalTextAlignment || (HorizontalTextAlignment = {}));
ccenum(HorizontalTextAlignment);
var VerticalTextAlignment;
(function (VerticalTextAlignment) {
  VerticalTextAlignment[VerticalTextAlignment["TOP"] = 0] = "TOP";
  VerticalTextAlignment[VerticalTextAlignment["CENTER"] = 1] = "CENTER";
  VerticalTextAlignment[VerticalTextAlignment["BOTTOM"] = 2] = "BOTTOM";
})(VerticalTextAlignment || (VerticalTextAlignment = {}));
ccenum(VerticalTextAlignment);
var Overflow;
(function (Overflow) {
  Overflow[Overflow["NONE"] = 0] = "NONE";
  Overflow[Overflow["CLAMP"] = 1] = "CLAMP";
  Overflow[Overflow["SHRINK"] = 2] = "SHRINK";
  Overflow[Overflow["RESIZE_HEIGHT"] = 3] = "RESIZE_HEIGHT";
})(Overflow || (Overflow = {}));
ccenum(Overflow);
var CacheMode;
(function (CacheMode) {
  CacheMode[CacheMode["NONE"] = 0] = "NONE";
  CacheMode[CacheMode["BITMAP"] = 1] = "BITMAP";
  CacheMode[CacheMode["CHAR"] = 2] = "CHAR";
})(CacheMode || (CacheMode = {}));
ccenum(CacheMode);
var Label = (_dec = ccclass('cc.Label'), _dec2 = executionOrder(110), _dec3 = type(HorizontalTextAlignment), _dec4 = type(VerticalTextAlignment), _dec5 = type(Overflow), _dec6 = type(Font), _dec7 = type(CacheMode), _dec(_class = _dec2(_class = (_class2 = (_Label = function (_UIRenderer) {
  function Label() {
    var _this;
    _this = _UIRenderer.call(this) || this;
    _this._string = _initializer && _initializer();
    _this._horizontalAlign = _initializer2 && _initializer2();
    _this._verticalAlign = _initializer3 && _initializer3();
    _this._actualFontSize = _initializer4 && _initializer4();
    _this._fontSize = _initializer5 && _initializer5();
    _this._fontFamily = _initializer6 && _initializer6();
    _this._lineHeight = _initializer7 && _initializer7();
    _this._overflow = _initializer8 && _initializer8();
    _this._enableWrapText = _initializer9 && _initializer9();
    _this._font = _initializer0 && _initializer0();
    _this._isSystemFontUsed = _initializer1 && _initializer1();
    _this._spacingX = _initializer10 && _initializer10();
    _this._isItalic = _initializer11 && _initializer11();
    _this._isBold = _initializer12 && _initializer12();
    _this._isUnderline = _initializer13 && _initializer13();
    _this._underlineHeight = _initializer14 && _initializer14();
    _this._cacheMode = _initializer15 && _initializer15();
    _this._enableOutline = _initializer16 && _initializer16();
    _this._outlineColor = _initializer17 && _initializer17();
    _this._outlineWidth = _initializer18 && _initializer18();
    _this._enableShadow = _initializer19 && _initializer19();
    _this._shadowColor = _initializer20 && _initializer20();
    _this._shadowOffset = _initializer21 && _initializer21();
    _this._shadowBlur = _initializer22 && _initializer22();
    _this._N$file = null;
    _this._texture = null;
    _this._ttfSpriteFrame = null;
    _this._userDefinedFont = null;
    _this._assemblerData = null;
    _this._fontAtlas = null;
    _this._letterTexture = null;
    _this._contentWidth = 0;
    _this._textStyle = null;
    _this._textLayout = null;
    _this._textRenderData = null;
    _this._textLayoutData = null;
    _this._ttfSpriteFrame = null;
    _this._textStyle = new TextStyle();
    _this._textLayout = new TextLayout();
    _this._textLayoutData = new TextOutputLayoutData();
    _this._textRenderData = new TextOutputRenderData();
    return _this;
  }
  _inheritsLoose(Label, _UIRenderer);
  var _proto = Label.prototype;
  _proto.onEnable = function onEnable() {
    _UIRenderer.prototype.onEnable.call(this);
    if (!this._font && !this._isSystemFontUsed) {
      this.useSystemFont = true;
    }
    if (this._isSystemFontUsed && !this._fontFamily) {
      this.fontFamily = 'Arial';
    }
    this._applyFontTexture();
  };
  _proto.destroyTtfSpriteFrame = function destroyTtfSpriteFrame() {
    if (!this._ttfSpriteFrame) {
      return;
    }
    this._ttfSpriteFrame._resetDynamicAtlasFrame();
    var tex = this._ttfSpriteFrame.texture;
    this._ttfSpriteFrame.destroy();
    if (tex) {
      var tex2d = tex;
      if (tex2d.image) {
        tex2d.image.destroy();
      }
      tex.destroy();
    }
    this._ttfSpriteFrame = null;
  };
  _proto._onPreDestroy = function _onPreDestroy() {
    _UIRenderer.prototype._onPreDestroy.call(this);
    if (!this._isOnLoadCalled) {
      this.destroyTtfSpriteFrame();
    }
  };
  _proto.onDestroy = function onDestroy() {
    if (this._assembler && this._assembler.resetAssemblerData) {
      this._assembler.resetAssemblerData(this._assemblerData);
    }
    this._assemblerData = null;
    this.destroyTtfSpriteFrame();
    this.destroyLetterTexture();
    _UIRenderer.prototype.onDestroy.call(this);
  };
  _proto.destroyLetterTexture = function destroyLetterTexture() {
    var letterTexture = this._letterTexture;
    if (letterTexture) {
      letterTexture.decRef(false);
      if (letterTexture.refCount <= 0) {
        letterTexture.destroy();
      }
    }
    this._letterTexture = null;
  };
  _proto.updateRenderData = function updateRenderData(force) {
    if (force === void 0) {
      force = false;
    }
    if (force) {
      this._flushAssembler();
      if (this.renderData) this.renderData.vertDirty = true;
      this._applyFontTexture();
    }
    if (this._assembler) {
      this._assembler.updateRenderData(this);
    }
  };
  _proto._render = function _render(render) {
    render.commitComp(this, this.renderData, this._texture, this._assembler, null);
  };
  _proto._updateColor = function _updateColor() {
    _UIRenderer.prototype._updateColor.call(this);
    this._markForUpdateRenderData();
  };
  _proto.setEntityColor = function setEntityColor(color) {
  };
  _proto._canRender = function _canRender() {
    if (!_UIRenderer.prototype._canRender.call(this) || !this._string) {
      return false;
    }
    var font = this._font;
    if (font && font instanceof BitmapFont) {
      var spriteFrame = font.spriteFrame;
      if (!spriteFrame || !spriteFrame.texture) {
        return false;
      }
    }
    return true;
  };
  _proto._flushAssembler = function _flushAssembler() {
    var assembler = Label.Assembler.getAssembler(this);
    if (this._assembler !== assembler) {
      this.destroyRenderData();
      this._assembler = assembler;
      this.textStyle.reset();
      this.textLayout.reset();
      this.textLayoutData.reset();
      this.textRenderData.reset();
    }
    if (!this.renderData) {
      if (this._assembler && this._assembler.createData) {
        this._renderData = this._assembler.createData(this);
        this.renderData.material = this.getRenderMaterial(0);
        this._updateColor();
      }
    }
  };
  _proto._applyFontTexture = function _applyFontTexture() {
    this._markForUpdateRenderData();
    var font = this._font;
    if (font instanceof BitmapFont) {
      var spriteFrame = font.spriteFrame;
      if (spriteFrame && spriteFrame.texture) {
        this._texture = spriteFrame;
        if (this.renderData) {
          this.renderData.textureDirty = true;
        }
        this.changeMaterialForDefine();
        if (this._assembler) {
          this._assembler.updateRenderData(this);
        }
      }
    } else {
      if (this.cacheMode === CacheMode.CHAR) {
        var oldLetterTexture = this._letterTexture;
        var letterTexture = this._assembler.getAssemblerData();
        if (letterTexture !== oldLetterTexture) {
          this.destroyLetterTexture();
          if (letterTexture) {
            letterTexture.addRef();
          }
        }
        this._texture = this._letterTexture = letterTexture;
      } else if (!this._ttfSpriteFrame) {
        this._ttfSpriteFrame = new SpriteFrame();
        this._assemblerData = this._assembler.getAssemblerData();
        var image = new ImageAsset(this._assemblerData.canvas);
        var texture = new Texture2D();
        texture.image = image;
        this._ttfSpriteFrame.texture = texture;
      }
      if (this.cacheMode !== CacheMode.CHAR) {
        this._texture = this._ttfSpriteFrame;
      }
      this.changeMaterialForDefine();
    }
  };
  _proto.changeMaterialForDefine = function changeMaterialForDefine() {
    if (!this._texture) {
      return;
    }
    var value = false;
    if (this.cacheMode !== CacheMode.CHAR) {
      var spriteFrame = this._texture;
      var texture = spriteFrame.texture;
      if (texture instanceof TextureBase) {
        var format = texture.getPixelFormat();
        value = format === PixelFormat.RGBA_ETC1 || format === PixelFormat.RGB_A_PVRTC_4BPPV1 || format === PixelFormat.RGB_A_PVRTC_2BPPV1;
      }
    }
    if (value) {
      this._instanceMaterialType = InstanceMaterialType.USE_ALPHA_SEPARATED;
    } else {
      this._instanceMaterialType = InstanceMaterialType.ADD_COLOR_AND_TEXTURE;
    }
    this.updateMaterial();
  };
  _proto._updateBlendFunc = function _updateBlendFunc() {
    _UIRenderer.prototype._updateBlendFunc.call(this);
  };
  return _createClass(Label, [{
    key: "string",
    get: function get() {
      return this._string;
    },
    set: function set(value) {
      if (value === null || value === undefined) {
        value = '';
      } else {
        value = value.toString();
      }
      if (this._string === value) {
        return;
      }
      this._string = value;
      this._markForUpdateRenderData();
    }
  }, {
    key: "horizontalAlign",
    get: function get() {
      return this._horizontalAlign;
    },
    set: function set(value) {
      if (this._horizontalAlign === value) {
        return;
      }
      this._horizontalAlign = value;
      this._markForUpdateRenderData();
    }
  }, {
    key: "verticalAlign",
    get: function get() {
      return this._verticalAlign;
    },
    set: function set(value) {
      if (this._verticalAlign === value) {
        return;
      }
      this._verticalAlign = value;
      this._markForUpdateRenderData();
    }
  }, {
    key: "actualFontSize",
    get: function get() {
      return this._actualFontSize;
    },
    set: function set(value) {
      this._actualFontSize = value;
    }
  }, {
    key: "fontSize",
    get: function get() {
      return this._fontSize;
    },
    set: function set(value) {
      if (this._fontSize === value) {
        return;
      }
      this._fontSize = value;
      this._markForUpdateRenderData();
    }
  }, {
    key: "lineHeight",
    get: function get() {
      return this._lineHeight;
    },
    set: function set(value) {
      if (this._lineHeight === value) {
        return;
      }
      this._lineHeight = value;
      this._markForUpdateRenderData();
    }
  }, {
    key: "spacingX",
    get: function get() {
      return this._spacingX;
    },
    set: function set(value) {
      if (this._spacingX === value) {
        return;
      }
      this._spacingX = value;
      this._markForUpdateRenderData();
    }
  }, {
    key: "overflow",
    get: function get() {
      return this._overflow;
    },
    set: function set(value) {
      if (this._overflow === value) {
        return;
      }
      this._overflow = value;
      this._markForUpdateRenderData();
    }
  }, {
    key: "enableWrapText",
    get: function get() {
      return this._enableWrapText;
    },
    set: function set(value) {
      if (this._enableWrapText === value) {
        return;
      }
      this._enableWrapText = value;
      this._markForUpdateRenderData();
    }
  }, {
    key: "useSystemFont",
    get: function get() {
      return this._isSystemFontUsed;
    },
    set: function set(value) {
      if (this._isSystemFontUsed === value) {
        return;
      }
      this.destroyRenderData();
      this._isSystemFontUsed = !!value;
      if (value) {
        this.font = null;
      }
      this._flushAssembler();
      this._markForUpdateRenderData();
    }
  }, {
    key: "fontFamily",
    get: function get() {
      return this._fontFamily;
    },
    set: function set(value) {
      if (this._fontFamily === value) {
        return;
      }
      this._fontFamily = value;
      this._markForUpdateRenderData();
    }
  }, {
    key: "font",
    get: function get() {
      return this._font;
    },
    set: function set(value) {
      if (this._font === value) {
        return;
      }
      this._isSystemFontUsed = !value;
      this._font = value;
      this.destroyRenderData();
      this._fontAtlas = null;
      this.updateRenderData(true);
    }
  }, {
    key: "cacheMode",
    get: function get() {
      return this._cacheMode;
    },
    set: function set(value) {
      var oldCacheMode = this._cacheMode;
      if (oldCacheMode === value) {
        return;
      }
      if (oldCacheMode === CacheMode.BITMAP && !(this._font instanceof BitmapFont) && this._ttfSpriteFrame) {
        this._ttfSpriteFrame._resetDynamicAtlasFrame();
      }
      if (oldCacheMode === CacheMode.CHAR) {
        this._ttfSpriteFrame = null;
        this.destroyLetterTexture();
      }
      this._cacheMode = value;
      this.updateRenderData(true);
    }
  }, {
    key: "isBold",
    get: function get() {
      return this._isBold;
    },
    set: function set(value) {
      if (this._isBold === value) {
        return;
      }
      this._isBold = value;
      this._markForUpdateRenderData();
    }
  }, {
    key: "isItalic",
    get: function get() {
      return this._isItalic;
    },
    set: function set(value) {
      if (this._isItalic === value) {
        return;
      }
      this._isItalic = value;
      this._markForUpdateRenderData();
    }
  }, {
    key: "isUnderline",
    get: function get() {
      return this._isUnderline;
    },
    set: function set(value) {
      if (this._isUnderline === value) {
        return;
      }
      this._isUnderline = value;
      this._markForUpdateRenderData();
    }
  }, {
    key: "underlineHeight",
    get: function get() {
      return this._underlineHeight;
    },
    set: function set(value) {
      if (this._underlineHeight === value) return;
      this._underlineHeight = value;
      this._markForUpdateRenderData();
    }
  }, {
    key: "enableOutline",
    get: function get() {
      return this._enableOutline;
    },
    set: function set(value) {
      if (this._enableOutline === value) return;
      this._enableOutline = value;
      this._markForUpdateRenderData();
    }
  }, {
    key: "outlineColor",
    get: function get() {
      return this._outlineColor;
    },
    set: function set(value) {
      if (this._outlineColor === value) return;
      this._outlineColor.set(value);
      this._markForUpdateRenderData();
    }
  }, {
    key: "outlineWidth",
    get: function get() {
      return this._outlineWidth;
    },
    set: function set(value) {
      if (this._outlineWidth === value) return;
      this._outlineWidth = value;
      this._markForUpdateRenderData();
    }
  }, {
    key: "enableShadow",
    get: function get() {
      return this._enableShadow;
    },
    set: function set(value) {
      if (this._enableShadow === value) return;
      this._enableShadow = value;
      this._markForUpdateRenderData();
    }
  }, {
    key: "shadowColor",
    get: function get() {
      return this._shadowColor;
    },
    set: function set(value) {
      if (this._shadowColor === value) return;
      this._shadowColor.set(value);
      this._markForUpdateRenderData();
    }
  }, {
    key: "shadowOffset",
    get: function get() {
      return this._shadowOffset;
    },
    set: function set(value) {
      if (this._shadowOffset === value) return;
      this._shadowOffset.set(value);
      this._markForUpdateRenderData();
    }
  }, {
    key: "shadowBlur",
    get: function get() {
      return this._shadowBlur;
    },
    set: function set(value) {
      if (this._shadowBlur === value) return;
      this._shadowBlur = value;
      this._markForUpdateRenderData();
    }
  }, {
    key: "spriteFrame",
    get: function get() {
      return this._texture;
    }
  }, {
    key: "ttfSpriteFrame",
    get: function get() {
      return this._ttfSpriteFrame;
    }
  }, {
    key: "assemblerData",
    get: function get() {
      return this._assemblerData;
    }
  }, {
    key: "fontAtlas",
    get: function get() {
      return this._fontAtlas;
    },
    set: function set(value) {
      this._fontAtlas = value;
    }
  }, {
    key: "_bmFontOriginalSize",
    get: function get() {
      if (this._font instanceof BitmapFont) {
        return this._font.fontSize;
      } else {
        return -1;
      }
    }
  }, {
    key: "textStyle",
    get: function get() {
      return this._textStyle;
    }
  }, {
    key: "textLayout",
    get: function get() {
      return this._textLayout;
    }
  }, {
    key: "textRenderData",
    get: function get() {
      return this._textRenderData;
    }
  }, {
    key: "textLayoutData",
    get: function get() {
      return this._textLayoutData;
    }
  }, {
    key: "contentWidth",
    get: function get() {
      return this._contentWidth;
    },
    set: function set(val) {
      this._contentWidth = val;
    }
  }]);
}(UIRenderer), _Label.HorizontalAlign = HorizontalTextAlignment, _Label.VerticalAlign = VerticalTextAlignment, _Label.Overflow = Overflow, _Label.CacheMode = CacheMode, _Label._canvasPool = CanvasPool.getInstance(), _Label), _applyDecoratedDescriptor(_class2.prototype, "horizontalAlign", [_dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "horizontalAlign"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "verticalAlign", [_dec4], Object.getOwnPropertyDescriptor(_class2.prototype, "verticalAlign"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "overflow", [_dec5], Object.getOwnPropertyDescriptor(_class2.prototype, "overflow"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "font", [_dec6], Object.getOwnPropertyDescriptor(_class2.prototype, "font"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "cacheMode", [_dec7], Object.getOwnPropertyDescriptor(_class2.prototype, "cacheMode"), _class2.prototype), _initializer = applyDecoratedInitializer(_class2.prototype, "_string", [serializable], function () {
  return 'label';
}), _initializer2 = applyDecoratedInitializer(_class2.prototype, "_horizontalAlign", [serializable], function () {
  return HorizontalTextAlignment.CENTER;
}), _initializer3 = applyDecoratedInitializer(_class2.prototype, "_verticalAlign", [serializable], function () {
  return VerticalTextAlignment.CENTER;
}), _initializer4 = applyDecoratedInitializer(_class2.prototype, "_actualFontSize", [serializable], function () {
  return 0;
}), _initializer5 = applyDecoratedInitializer(_class2.prototype, "_fontSize", [serializable], function () {
  return 40;
}), _initializer6 = applyDecoratedInitializer(_class2.prototype, "_fontFamily", [serializable], function () {
  return 'Arial';
}), _initializer7 = applyDecoratedInitializer(_class2.prototype, "_lineHeight", [serializable], function () {
  return 40;
}), _initializer8 = applyDecoratedInitializer(_class2.prototype, "_overflow", [serializable], function () {
  return Overflow.NONE;
}), _initializer9 = applyDecoratedInitializer(_class2.prototype, "_enableWrapText", [serializable], function () {
  return true;
}), _initializer0 = applyDecoratedInitializer(_class2.prototype, "_font", [serializable], function () {
  return null;
}), _initializer1 = applyDecoratedInitializer(_class2.prototype, "_isSystemFontUsed", [serializable], function () {
  return true;
}), _initializer10 = applyDecoratedInitializer(_class2.prototype, "_spacingX", [serializable], function () {
  return 0;
}), _initializer11 = applyDecoratedInitializer(_class2.prototype, "_isItalic", [serializable], function () {
  return false;
}), _initializer12 = applyDecoratedInitializer(_class2.prototype, "_isBold", [serializable], function () {
  return false;
}), _initializer13 = applyDecoratedInitializer(_class2.prototype, "_isUnderline", [serializable], function () {
  return false;
}), _initializer14 = applyDecoratedInitializer(_class2.prototype, "_underlineHeight", [serializable], function () {
  return 2;
}), _initializer15 = applyDecoratedInitializer(_class2.prototype, "_cacheMode", [serializable], function () {
  return CacheMode.NONE;
}), _initializer16 = applyDecoratedInitializer(_class2.prototype, "_enableOutline", [serializable], function () {
  return false;
}), _initializer17 = applyDecoratedInitializer(_class2.prototype, "_outlineColor", [serializable], function () {
  return new Color(0, 0, 0, 255);
}), _initializer18 = applyDecoratedInitializer(_class2.prototype, "_outlineWidth", [serializable], function () {
  return 2;
}), _initializer19 = applyDecoratedInitializer(_class2.prototype, "_enableShadow", [serializable], function () {
  return false;
}), _initializer20 = applyDecoratedInitializer(_class2.prototype, "_shadowColor", [serializable], function () {
  return new Color(0, 0, 0, 255);
}), _initializer21 = applyDecoratedInitializer(_class2.prototype, "_shadowOffset", [serializable], function () {
  return new Vec2(2, 2);
}), _initializer22 = applyDecoratedInitializer(_class2.prototype, "_shadowBlur", [serializable], function () {
  return 2;
}), _class2)) || _class) || _class);
cclegacy.Label = Label;

export { BitmapFont as B, CanvasPool as C, FontAtlas as F, HorizontalTextAlignment as H, Label as L, MIDDLE_RATIO as M, Overflow as O, TTFFont as T, VerticalTextAlignment as V, BASELINE_RATIO as a, safeMeasureText as b, getSymbolAt as c, getSymbolCodeAt as d, isUnicodeCJK as e, fragmentText as f, getSymbolLength as g, getBaselineOffset as h, isUnicodeSpace as i, LetterAtlas as j, CacheMode as k, computeHash as l, LabelAtlas as m, Font as n, HtmlTextParser as o, LRUCache as p, isEnglishWordPartAtFirst as q, isEnglishWordPartAtLast as r, shareLabelInfo as s, getEnglishWordPartAtFirst as t, getEnglishWordPartAtLast as u };
//# sourceMappingURL=label-B6xdfUV_.js.map
