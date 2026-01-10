import { a5 as Pool, I as assert, _ as _inheritsLoose, w as warnID, a as _createClass, b as _applyDecoratedDescriptor, d as CCObjectFlags } from './gc-object-CShF5lzx.js';
import { V as Vec2, c as ccclass, t as type, C as Color, b as applyDecoratedInitializer, s as serializable, r as requireComponent, l as executionOrder } from './index-uXI1_UMk.js';
import './_virtual_internal_constants-DWlew7Dp.js';
import { c as cclegacy } from './global-exports-DnCP_14L.js';
import './sprite-frame-DHXMUUT-.js';
import { S as Sprite, b as SpriteAtlas } from './sprite-BKXaVEzt.js';
import { o as HtmlTextParser, L as Label, T as TTFFont, t as getEnglishWordPartAtFirst, u as getEnglishWordPartAtLast, f as fragmentText, a as BASELINE_RATIO, c as getSymbolAt, e as isUnicodeCJK, i as isUnicodeSpace, H as HorizontalTextAlignment, n as Font, V as VerticalTextAlignment, k as CacheMode } from './label-B6xdfUV_.js';
import './prefab-DYg_oxpo.js';
import { N as Node } from './scene-vWcxM1_c.js';
import './pipeline-state-manager-C5U4ouGL.js';
import { N as NodeEventType, C as Component } from './node-event-Ccvtv8bJ.js';
import './sprite-renderer-C7_6H1N4.js';
import { i as UITransform } from './ui-renderer-JpGcj-VM.js';
import './device-manager-CBXP-ttm.js';
import './buffer-barrier-BlQXg9Aa.js';
import './deprecated-Dswa7XeN.js';
import './director-F7e_Lqjg.js';
import './debug-view-BuNhRPv_.js';
import './deprecated-n0w4kK7g.js';
import './create-mesh-CfKC5EQd.js';
import './mesh-XWfHgs1t.js';
import './wasm-web-BpK36a26.js';
import './zlib.min-3VC1ush6.js';
import './touch-BKrZ-fxl.js';
import './camera-component-BFt9vSC_.js';
import './deprecated-CzzdLkmW.js';
import './model-renderer-BBapFDY7.js';
import './renderer-C7HM72NY.js';
import './sorting-layers-BHqhkSbY.js';

var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _class, _class2, _initializer, _initializer2, _initializer3, _initializer4, _initializer5, _initializer6, _initializer7, _initializer8, _initializer9, _initializer0, _initializer1, _initializer10, _initializer11, _initializer12, _RichText;
var _htmlTextParser = new HtmlTextParser();
var RichTextChildName = 'RICHTEXT_CHILD';
var RichTextChildImageName = 'RICHTEXT_Image_CHILD';
var _tempSize = new Vec2();
var _tempSizeLeft = new Vec2();
var labelPool = new Pool(function (seg) {
  {
    assert(!seg.node.parent, 'Recycling node\'s parent should be null!');
  }
  if (!cclegacy.isValid(seg.node)) {
    return false;
  } else {
    var label = seg.node.getComponent(Label);
    if (label) {
      label.outlineWidth = 0;
    }
  }
  return true;
}, 20);
var imagePool = new Pool(function (seg) {
  {
    assert(!seg.node.parent, 'Recycling node\'s parent should be null!');
  }
  return cclegacy.isValid(seg.node);
}, 10);
function createSegment(type) {
  return {
    node: new Node(type),
    comp: null,
    lineCount: 0,
    styleIndex: 0,
    imageOffset: '',
    clickParam: '',
    clickHandler: '',
    type: type
  };
}
function getSegmentByPool(type, content) {
  var seg;
  if (type === RichTextChildName) {
    seg = labelPool._get();
  } else if (type === RichTextChildImageName) {
    seg = imagePool._get();
  }
  seg = seg || createSegment(type);
  var node = seg.node;
  if (!node) {
    node = new Node(type);
  }
  node.hideFlags |= CCObjectFlags.DontSave | CCObjectFlags.HideInHierarchy;
  node.active = true;
  if (type === RichTextChildImageName) {
    seg.comp = node.getComponent(Sprite) || node.addComponent(Sprite);
    seg.comp.spriteFrame = content;
    seg.comp.type = Sprite.Type.SLICED;
    seg.comp.sizeMode = Sprite.SizeMode.CUSTOM;
  } else {
    seg.comp = node.getComponent(Label) || node.addComponent(Label);
    seg.comp.string = content;
    seg.comp.horizontalAlign = HorizontalTextAlignment.LEFT;
    seg.comp.verticalAlign = VerticalTextAlignment.TOP;
    seg.comp.underlineHeight = 2;
  }
  node.setPosition(0, 0, 0);
  var trans = node._getUITransformComp();
  trans.setAnchorPoint(0.5, 0.5);
  seg.node = node;
  seg.lineCount = 0;
  seg.styleIndex = 0;
  seg.imageOffset = '';
  seg.clickParam = '';
  seg.clickHandler = '';
  return seg;
}
var RichText = (_dec = ccclass('cc.RichText'), _dec2 = requireComponent(UITransform), _dec3 = executionOrder(110), _dec4 = type(HorizontalTextAlignment), _dec5 = type(VerticalTextAlignment), _dec6 = type(Color), _dec7 = type(Font), _dec8 = type(CacheMode), _dec9 = type(SpriteAtlas), _dec(_class = _dec2(_class = _dec3(_class = (_class2 = (_RichText = function (_Component) {
  function RichText() {
    var _this;
    _this = _Component.call(this) || this;
    _this._lineHeight = _initializer && _initializer();
    _this._string = _initializer2 && _initializer2();
    _this._horizontalAlign = _initializer3 && _initializer3();
    _this._verticalAlign = _initializer4 && _initializer4();
    _this._fontSize = _initializer5 && _initializer5();
    _this._fontColor = _initializer6 && _initializer6();
    _this._maxWidth = _initializer7 && _initializer7();
    _this._fontFamily = _initializer8 && _initializer8();
    _this._font = _initializer9 && _initializer9();
    _this._isSystemFontUsed = _initializer0 && _initializer0();
    _this._userDefinedFont = _initializer1 && _initializer1();
    _this._cacheMode = _initializer10 && _initializer10();
    _this._imageAtlas = _initializer11 && _initializer11();
    _this._handleTouchEvent = _initializer12 && _initializer12();
    _this._textArray = [];
    _this._segments = [];
    _this._labelSegmentsCache = [];
    _this._linesWidth = [];
    _this._lineCount = 1;
    _this._labelWidth = 0;
    _this._labelHeight = 0;
    _this._layoutDirty = true;
    _this._lineOffsetX = 0;
    _this._labelChildrenNum = 0;
    _this._updateRichTextStatus = _this._updateRichText;
    return _this;
  }
  _inheritsLoose(RichText, _Component);
  var _proto = RichText.prototype;
  _proto.onLoad = function onLoad() {
    this.node.on(NodeEventType.LAYER_CHANGED, this._applyLayer, this);
    this.node.on(NodeEventType.ANCHOR_CHANGED, this._updateRichTextPosition, this);
  };
  _proto.onEnable = function onEnable() {
    if (this.handleTouchEvent) {
      this._addEventListeners();
    }
    this._updateRichText();
    this._activateChildren(true);
  };
  _proto.onDisable = function onDisable() {
    if (this.handleTouchEvent) {
      this._removeEventListeners();
    }
    this._activateChildren(false);
  };
  _proto.onRestore = function onRestore() {
    {
      return;
    }
  };
  _proto.onDestroy = function onDestroy() {
    this._segments.forEach(function (seg) {
      seg.node.removeFromParent();
      if (seg.type === RichTextChildName) {
        labelPool.put(seg);
      } else if (seg.type === RichTextChildImageName) {
        imagePool.put(seg);
      }
    });
    this.node.off(NodeEventType.ANCHOR_CHANGED, this._updateRichTextPosition, this);
    this.node.off(NodeEventType.LAYER_CHANGED, this._applyLayer, this);
  };
  _proto._addEventListeners = function _addEventListeners() {
    this.node.on(NodeEventType.TOUCH_END, this._onTouchEnded, this);
  };
  _proto._removeEventListeners = function _removeEventListeners() {
    this.node.off(NodeEventType.TOUCH_END, this._onTouchEnded, this);
  };
  _proto._updateLabelSegmentTextAttributes = function _updateLabelSegmentTextAttributes() {
    var _this2 = this;
    this._segments.forEach(function (item) {
      _this2._applyTextAttribute(item);
    });
  };
  _proto._createFontLabel = function _createFontLabel(str) {
    return getSegmentByPool(RichTextChildName, str);
  };
  _proto._createImage = function _createImage(spriteFrame) {
    return getSegmentByPool(RichTextChildImageName, spriteFrame);
  };
  _proto._onTTFLoaded = function _onTTFLoaded() {
    if (this._font instanceof TTFFont) {
      this._layoutDirty = true;
      this._updateRichText();
    } else {
      this._layoutDirty = true;
      this._updateRichText();
    }
  };
  _proto.splitLongStringApproximatelyIn2048 = function splitLongStringApproximatelyIn2048(text, styleIndex) {
    var approxSize = text.length * this.fontSize;
    var partStringArr = [];
    if (approxSize <= 2048 * 0.8) {
      partStringArr.push(text);
      return partStringArr;
    }
    this._calculateSize(_tempSize, styleIndex, text);
    if (_tempSize.x < 2048) {
      partStringArr.push(text);
    } else {
      var multilineTexts = text.split('\n');
      for (var i = 0; i < multilineTexts.length; i++) {
        this._calculateSize(_tempSize, styleIndex, multilineTexts[i]);
        if (_tempSize.x < 2048) {
          partStringArr.push(multilineTexts[i]);
        } else {
          var thisPartSplitResultArr = this.splitLongStringOver2048(multilineTexts[i], styleIndex);
          partStringArr.push.apply(partStringArr, thisPartSplitResultArr);
        }
      }
    }
    return partStringArr;
  };
  _proto.splitLongStringOver2048 = function splitLongStringOver2048(text, styleIndex) {
    var partStringArr = [];
    var longStr = text;
    var curStart = 0;
    var curEnd = longStr.length / 2;
    var curString = longStr.substring(curStart, curEnd);
    var leftString = longStr.substring(curEnd);
    var curStringSize = this._calculateSize(_tempSize, styleIndex, curString);
    var leftStringSize = this._calculateSize(_tempSizeLeft, styleIndex, leftString);
    var maxWidth = this._maxWidth;
    if (this._maxWidth === 0) {
      maxWidth = 2047.9;
    }
    var lineCountForOnePart = 1;
    var sizeForOnePart = lineCountForOnePart * maxWidth;
    while (curStringSize.x > sizeForOnePart) {
      curEnd /= 2;
      if (curEnd < 1) {
        curEnd *= 2;
        break;
      }
      curString = curString.substring(curStart, curEnd);
      leftString = longStr.substring(curEnd);
      this._calculateSize(curStringSize, styleIndex, curString);
    }
    var leftTryTimes = 1000;
    var curWordStep = 1;
    while (leftTryTimes && curStart < text.length) {
      while (leftTryTimes && curStringSize.x < sizeForOnePart) {
        var nextPartExec = getEnglishWordPartAtFirst(leftString);
        if (nextPartExec && nextPartExec.length > 0) {
          curWordStep = nextPartExec[0].length;
        }
        curEnd += curWordStep;
        curString = longStr.substring(curStart, curEnd);
        leftString = longStr.substring(curEnd);
        this._calculateSize(curStringSize, styleIndex, curString);
        leftTryTimes--;
      }
      while (leftTryTimes && curString.length >= 2 && curStringSize.x > sizeForOnePart) {
        curEnd -= curWordStep;
        curString = longStr.substring(curStart, curEnd);
        this._calculateSize(curStringSize, styleIndex, curString);
        curWordStep = 1;
        leftTryTimes--;
      }
      if (curString.length >= 2) {
        var lastWordExec = getEnglishWordPartAtLast(curString);
        if (lastWordExec && lastWordExec.length > 0 && curString !== lastWordExec[0]) {
          curEnd -= lastWordExec[0].length;
          curString = longStr.substring(curStart, curEnd);
        }
      }
      partStringArr.push(curString);
      var partStep = curString.length;
      curStart = curEnd;
      curEnd += partStep;
      curString = longStr.substring(curStart, curEnd);
      leftString = longStr.substring(curEnd);
      this._calculateSize(leftStringSize, styleIndex, leftString);
      this._calculateSize(curStringSize, styleIndex, curString);
      leftTryTimes--;
      if (leftStringSize.x < 2048 && curStringSize.x < sizeForOnePart) {
        partStringArr.push(curString);
        curStart = text.length;
        curEnd = text.length;
        curString = leftString;
        if (leftString !== '') {
          partStringArr.push(curString);
        }
        break;
      }
    }
    return partStringArr;
  };
  _proto._measureText = function _measureText(styleIndex, string) {
    var _this3 = this;
    var func = function func(s) {
      var width = _this3._calculateSize(_tempSize, styleIndex, s).x;
      return width;
    };
    if (string) {
      return func(string);
    } else {
      return func;
    }
  };
  _proto._calculateSize = function _calculateSize(out, styleIndex, s) {
    var label;
    if (this._labelSegmentsCache.length === 0) {
      label = this._createFontLabel(s);
      this._labelSegmentsCache.push(label);
    } else {
      label = this._labelSegmentsCache[0];
      label.node.getComponent(Label).string = s;
    }
    label.styleIndex = styleIndex;
    this._applyTextAttribute(label);
    var size = label.node._getUITransformComp().contentSize;
    Vec2.set(out, size.x, size.y);
    return out;
  };
  _proto._onTouchEnded = function _onTouchEnded(event) {
    var _this4 = this;
    var components = this.node.getComponents(Component);
    this._segments.forEach(function (seg) {
      var clickHandler = seg.clickHandler;
      var clickParam = seg.clickParam;
      if (clickHandler && _this4._containsTouchLocation(seg, event.touch.getUILocation())) {
        components.forEach(function (component) {
          var func = component[clickHandler];
          if (component.enabledInHierarchy && func) {
            func.call(component, event, clickParam);
          }
        });
        event.propagationStopped = true;
      }
    });
  };
  _proto._containsTouchLocation = function _containsTouchLocation(label, point) {
    var comp = label.node.getComponent(UITransform);
    if (!comp) {
      return false;
    }
    var myRect = comp.getBoundingBoxToWorld();
    return myRect.contains(point);
  };
  _proto._resetState = function _resetState() {
    var children = this.node.children;
    for (var i = children.length - 1; i >= 0; i--) {
      var child = children[i];
      if (child.name === RichTextChildName || child.name === RichTextChildImageName) {
        {
          assert(child.parent === this.node);
        }
        child.parent = null;
        var segment = createSegment(child.name);
        segment.node = child;
        if (child.name === RichTextChildName) {
          segment.comp = child.getComponent(Label);
          labelPool.put(segment);
        } else {
          segment.comp = child.getComponent(Sprite);
          imagePool.put(segment);
        }
        this._labelChildrenNum--;
      }
    }
    this._segments.length = 0;
    this._labelSegmentsCache.length = 0;
    this._linesWidth.length = 0;
    this._lineOffsetX = 0;
    this._lineCount = 1;
    this._labelWidth = 0;
    this._labelHeight = 0;
    this._layoutDirty = true;
  };
  _proto._activateChildren = function _activateChildren(active) {
    for (var i = this.node.children.length - 1; i >= 0; i--) {
      var child = this.node.children[i];
      if (child.name === RichTextChildName || child.name === RichTextChildImageName) {
        child.active = active;
      }
    }
  };
  _proto._addLabelSegment = function _addLabelSegment(stringToken, styleIndex) {
    var labelSegment;
    if (this._labelSegmentsCache.length === 0) {
      labelSegment = this._createFontLabel(stringToken);
    } else {
      labelSegment = this._labelSegmentsCache.pop();
      var label = labelSegment.node.getComponent(Label);
      if (label) {
        label.string = stringToken;
      }
    }
    var labelComp = labelSegment.comp;
    if (labelComp.verticalAlign !== this._verticalAlign) {
      labelComp.verticalAlign = this._verticalAlign;
    }
    labelSegment.styleIndex = styleIndex;
    labelSegment.lineCount = this._lineCount;
    labelSegment.node._getUITransformComp().setAnchorPoint(0, 0);
    labelSegment.node.layer = this.node.layer;
    this.node.insertChild(labelSegment.node, this._labelChildrenNum++);
    this._applyTextAttribute(labelSegment);
    this._segments.push(labelSegment);
    return labelSegment;
  };
  _proto._updateRichTextWithMaxWidth = function _updateRichTextWithMaxWidth(labelString, labelWidth, styleIndex) {
    var fragmentWidth = labelWidth;
    var labelSegment;
    if (this._lineOffsetX > 0 && fragmentWidth + this._lineOffsetX > this._maxWidth) {
      var checkStartIndex = 0;
      while (this._lineOffsetX <= this._maxWidth) {
        var checkEndIndex = this._getFirstWordLen(labelString, checkStartIndex, labelString.length);
        var checkString = labelString.substr(checkStartIndex, checkEndIndex);
        var checkStringWidth = this._measureText(styleIndex, checkString);
        if (this._lineOffsetX + checkStringWidth <= this._maxWidth) {
          this._lineOffsetX += checkStringWidth;
          checkStartIndex += checkEndIndex;
        } else {
          if (checkStartIndex > 0) {
            var remainingString = labelString.substr(0, checkStartIndex);
            this._addLabelSegment(remainingString, styleIndex);
            labelString = labelString.substr(checkStartIndex, labelString.length);
            fragmentWidth = this._measureText(styleIndex, labelString);
          }
          this._updateLineInfo();
          break;
        }
      }
    }
    if (fragmentWidth > this._maxWidth) {
      var fragments = fragmentText(labelString, fragmentWidth, this._maxWidth, this._measureText(styleIndex));
      for (var k = 0; k < fragments.length; ++k) {
        var splitString = fragments[k];
        labelSegment = this._addLabelSegment(splitString, styleIndex);
        var labelSize = labelSegment.node._getUITransformComp().contentSize;
        this._lineOffsetX += labelSize.width;
        if (fragments.length > 1 && k < fragments.length - 1) {
          this._updateLineInfo();
        }
      }
    } else {
      this._lineOffsetX += fragmentWidth;
      this._addLabelSegment(labelString, styleIndex);
    }
  };
  _proto._isLastComponentCR = function _isLastComponentCR(stringToken) {
    return stringToken.length - 1 === stringToken.lastIndexOf('\n');
  };
  _proto._updateLineInfo = function _updateLineInfo() {
    this._linesWidth.push(this._lineOffsetX);
    this._lineOffsetX = 0;
    this._lineCount++;
  };
  _proto._needsUpdateTextLayout = function _needsUpdateTextLayout(newTextArray) {
    if (this._layoutDirty || !this._textArray || !newTextArray) {
      return true;
    }
    if (this._textArray.length !== newTextArray.length) {
      return true;
    }
    for (var i = 0; i < this._textArray.length; i++) {
      var oldItem = this._textArray[i];
      var newItem = newTextArray[i];
      if (oldItem.text !== newItem.text) {
        return true;
      } else {
        var oldStyle = oldItem.style;
        var newStyle = newItem.style;
        if (oldStyle) {
          if (newStyle) {
            if (!!newStyle.outline !== !!oldStyle.outline) {
              return true;
            }
            if (oldStyle.size !== newStyle.size || oldStyle.italic !== newStyle.italic || oldStyle.isImage !== newStyle.isImage) {
              return true;
            }
            if (oldStyle.src !== newStyle.src || oldStyle.imageAlign !== newStyle.imageAlign || oldStyle.imageHeight !== newStyle.imageHeight || oldStyle.imageWidth !== newStyle.imageWidth || oldStyle.imageOffset !== newStyle.imageOffset) {
              return true;
            }
          } else if (oldStyle.size || oldStyle.italic || oldStyle.isImage || oldStyle.outline) {
            return true;
          }
        } else if (newStyle) {
          if (newStyle.size || newStyle.italic || newStyle.isImage || newStyle.outline) {
            return true;
          }
        }
      }
    }
    return false;
  };
  _proto._addRichTextImageElement = function _addRichTextImageElement(richTextElement) {
    if (!richTextElement.style) {
      return;
    }
    var style = richTextElement.style;
    var spriteFrameName = style.src;
    var spriteFrame = this._imageAtlas && spriteFrameName && this._imageAtlas.getSpriteFrame(spriteFrameName);
    if (!spriteFrame) {
      warnID(4400);
    } else {
      var segment = this._createImage(spriteFrame);
      var uiTransform = segment.node._getUITransformComp();
      switch (style.imageAlign) {
        case 'top':
          uiTransform.setAnchorPoint(0, 1);
          break;
        case 'center':
          uiTransform.setAnchorPoint(0, 0.5);
          break;
        default:
          uiTransform.setAnchorPoint(0, 0);
          break;
      }
      if (style.imageOffset) {
        segment.imageOffset = style.imageOffset;
      }
      segment.node.layer = this.node.layer;
      this.node.insertChild(segment.node, this._labelChildrenNum++);
      this._segments.push(segment);
      var spriteRect = spriteFrame.rect.clone();
      var scaleFactor = 1;
      var spriteWidth = spriteRect.width;
      var spriteHeight = spriteRect.height;
      var expectWidth = style.imageWidth || 0;
      var expectHeight = style.imageHeight || 0;
      if (expectHeight > 0) {
        scaleFactor = expectHeight / spriteHeight;
        spriteWidth *= scaleFactor;
        spriteHeight *= scaleFactor;
      } else {
        scaleFactor = this._lineHeight / spriteHeight;
        spriteWidth *= scaleFactor;
        spriteHeight *= scaleFactor;
      }
      if (expectWidth > 0) {
        spriteWidth = expectWidth;
      }
      if (this._maxWidth > 0) {
        if (this._lineOffsetX + spriteWidth > this._maxWidth) {
          this._updateLineInfo();
        }
        this._lineOffsetX += spriteWidth;
      } else {
        this._lineOffsetX += spriteWidth;
        if (this._lineOffsetX > this._labelWidth) {
          this._labelWidth = this._lineOffsetX;
        }
      }
      uiTransform.setContentSize(spriteWidth, spriteHeight);
      segment.lineCount = this._lineCount;
      segment.clickHandler = '';
      segment.clickParam = '';
      var event = style.event;
      if (event) {
        segment.clickHandler = event.click;
        segment.clickParam = event.param;
      }
    }
  };
  _proto._updateTextDefaultColor = function _updateTextDefaultColor() {
    for (var i = 0; i < this._segments.length; ++i) {
      var _this$_textArray$segm, _this$_textArray$segm2;
      var segment = this._segments[i];
      var label = segment.node.getComponent(Label);
      if (!label) {
        continue;
      }
      if ((_this$_textArray$segm = this._textArray[segment.styleIndex]) != null && (_this$_textArray$segm2 = _this$_textArray$segm.style) != null && _this$_textArray$segm2.color) {
        continue;
      }
      label.color = this._fontColor;
    }
  };
  _proto._updateRichText = function _updateRichText() {
    if (!this.enabledInHierarchy) {
      return;
    }
    var newTextArray = _htmlTextParser.parse(this._string);
    if (!this._needsUpdateTextLayout(newTextArray)) {
      this._textArray = newTextArray.slice();
      this._updateLabelSegmentTextAttributes();
      return;
    }
    this._textArray = newTextArray.slice();
    this._resetState();
    var lastEmptyLine = false;
    var label;
    for (var i = 0; i < this._textArray.length; ++i) {
      var richTextElement = this._textArray[i];
      var text = richTextElement.text;
      if (text === undefined) {
        continue;
      }
      if (text === '') {
        if (richTextElement.style && richTextElement.style.isNewLine) {
          this._updateLineInfo();
          continue;
        }
        if (richTextElement.style && richTextElement.style.isImage && this._imageAtlas) {
          this._addRichTextImageElement(richTextElement);
          continue;
        }
      }
      var splitArr = this.splitLongStringApproximatelyIn2048(text, i);
      text = splitArr.join('\n');
      var multilineTexts = text.split('\n');
      for (var j = 0; j < multilineTexts.length; ++j) {
        var labelString = multilineTexts[j];
        if (labelString === '') {
          if (this._isLastComponentCR(text) && j === multilineTexts.length - 1) {
            continue;
          }
          this._updateLineInfo();
          lastEmptyLine = true;
          continue;
        }
        lastEmptyLine = false;
        if (this._maxWidth > 0) {
          var labelWidth = this._measureText(i, labelString);
          this._updateRichTextWithMaxWidth(labelString, labelWidth, i);
          if (multilineTexts.length > 1 && j < multilineTexts.length - 1) {
            this._updateLineInfo();
          }
        } else {
          label = this._addLabelSegment(labelString, i);
          this._lineOffsetX += label.node._getUITransformComp().width;
          if (this._lineOffsetX > this._labelWidth) {
            this._labelWidth = this._lineOffsetX;
          }
          if (multilineTexts.length > 1 && j < multilineTexts.length - 1) {
            this._updateLineInfo();
          }
        }
      }
    }
    if (!lastEmptyLine) {
      this._linesWidth.push(this._lineOffsetX);
    }
    if (this._maxWidth > 0) {
      this._labelWidth = this._maxWidth;
    }
    this._labelHeight = (this._lineCount + BASELINE_RATIO) * this._lineHeight;
    this.node._getUITransformComp().setContentSize(this._labelWidth, this._labelHeight);
    this._updateRichTextPosition();
    this._layoutDirty = false;
  };
  _proto._getFirstWordLen = function _getFirstWordLen(text, startIndex, textLen) {
    var character = getSymbolAt(text, startIndex);
    if (isUnicodeCJK(character) || isUnicodeSpace(character)) {
      return 1;
    }
    var len = 1;
    for (var index = startIndex + 1; index < textLen; ++index) {
      character = getSymbolAt(text, index);
      if (isUnicodeSpace(character) || isUnicodeCJK(character)) {
        break;
      }
      len++;
    }
    return len;
  };
  _proto._updateRichTextPosition = function _updateRichTextPosition() {
    var nextTokenX = 0;
    var nextLineIndex = 1;
    var totalLineCount = this._lineCount;
    var trans = this.node._getUITransformComp();
    var anchorX = trans.anchorX;
    var anchorY = trans.anchorY;
    for (var i = 0; i < this._segments.length; ++i) {
      var segment = this._segments[i];
      var lineCount = segment.lineCount;
      if (lineCount > nextLineIndex) {
        nextTokenX = 0;
        nextLineIndex = lineCount;
      }
      var lineOffsetX = this._labelWidth * (this._horizontalAlign * 0.5 - anchorX);
      switch (this._horizontalAlign) {
        case HorizontalTextAlignment.LEFT:
          break;
        case HorizontalTextAlignment.CENTER:
          lineOffsetX -= this._linesWidth[lineCount - 1] / 2;
          break;
        case HorizontalTextAlignment.RIGHT:
          lineOffsetX -= this._linesWidth[lineCount - 1];
          break;
      }
      var segmentNode = segment.node;
      var pos = segmentNode.position;
      segmentNode.setPosition(nextTokenX + lineOffsetX, this._lineHeight * (totalLineCount - lineCount) - this._labelHeight * anchorY, pos.z);
      if (lineCount === nextLineIndex) {
        nextTokenX += segmentNode._getUITransformComp().width;
      }
      var sprite = segmentNode.getComponent(Sprite);
      if (sprite) {
        var position = segmentNode.position.clone();
        var lineHeightSet = this._lineHeight;
        var lineHeightReal = this._lineHeight * (1 + BASELINE_RATIO);
        switch (segmentNode._getUITransformComp().anchorY) {
          case 1:
            position.y += lineHeightSet + (lineHeightReal - lineHeightSet) / 2;
            break;
          case 0.5:
            position.y += lineHeightReal / 2;
            break;
          default:
            position.y += (lineHeightReal - lineHeightSet) / 2;
            break;
        }
        if (segment.imageOffset) {
          var offsets = segment.imageOffset.split(',');
          if (offsets.length === 1 && offsets[0]) {
            var offsetY = parseFloat(offsets[0]);
            if (Number.isInteger(offsetY)) position.y += offsetY;
          } else if (offsets.length === 2) {
            var offsetX = parseFloat(offsets[0]);
            var _offsetY = parseFloat(offsets[1]);
            if (Number.isInteger(offsetX)) position.x += offsetX;
            if (Number.isInteger(_offsetY)) position.y += _offsetY;
          }
        }
        segmentNode.position = position;
      }
      var label = segmentNode.getComponent(Label);
      if (label && label.enableOutline) {
        var _position = segmentNode.position.clone();
        _position.y -= label.outlineWidth;
        segmentNode.position = _position;
      }
    }
  };
  _proto._convertLiteralColorValue = function _convertLiteralColorValue(color) {
    var colorValue = color.toUpperCase();
    if (Color[colorValue]) {
      var colorUse = Color[colorValue];
      return colorUse;
    } else {
      var out = new Color();
      return out.fromHEX(color);
    }
  };
  _proto._applyTextAttribute = function _applyTextAttribute(labelSeg) {
    var label = labelSeg.node.getComponent(Label);
    if (!label) {
      return;
    }
    this._resetLabelState(label);
    var index = labelSeg.styleIndex;
    var textStyle;
    if (this._textArray[index]) {
      textStyle = this._textArray[index].style;
    }
    if (textStyle) {
      if (textStyle.color) {
        label.color = this._convertLiteralColorValue(textStyle.color);
      } else {
        label.color = this._fontColor;
      }
      label.isBold = !!textStyle.bold;
      label.isItalic = !!textStyle.italic;
      label.isUnderline = !!textStyle.underline;
      if (textStyle.outline) {
        label.enableOutline = true;
        label.outlineColor = this._convertLiteralColorValue(textStyle.outline.color);
        label.outlineWidth = textStyle.outline.width;
      }
      label.fontSize = textStyle.size || this._fontSize;
      labelSeg.clickHandler = '';
      labelSeg.clickParam = '';
      var event = textStyle.event;
      if (event) {
        labelSeg.clickHandler = event.click || '';
        labelSeg.clickParam = event.param || '';
      }
    }
    label.cacheMode = this._cacheMode;
    var isAsset = this._font instanceof Font;
    if (isAsset && !this._isSystemFontUsed) {
      label.font = this._font;
    } else {
      label.fontFamily = this._fontFamily;
    }
    label.useSystemFont = this._isSystemFontUsed;
    label.lineHeight = this._lineHeight;
    label.updateRenderData(true);
  };
  _proto._applyLayer = function _applyLayer() {
    var _this5 = this;
    this._segments.forEach(function (seg) {
      seg.node.layer = _this5.node.layer;
    });
  };
  _proto._resetLabelState = function _resetLabelState(label) {
    label.fontSize = this._fontSize;
    label.color = this._fontColor;
    label.isBold = false;
    label.isItalic = false;
    label.isUnderline = false;
  };
  return _createClass(RichText, [{
    key: "string",
    get: function get() {
      return this._string;
    },
    set: function set(value) {
      if (this._string === value) {
        return;
      }
      this._string = value;
      this._updateRichTextStatus();
    }
  }, {
    key: "horizontalAlign",
    get: function get() {
      return this._horizontalAlign;
    },
    set: function set(value) {
      if (this.horizontalAlign === value) {
        return;
      }
      this._horizontalAlign = value;
      this._layoutDirty = true;
      this._updateRichTextStatus();
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
      this._layoutDirty = true;
      this._updateRichTextStatus();
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
      this._layoutDirty = true;
      this._updateRichTextStatus();
    }
  }, {
    key: "fontColor",
    get: function get() {
      return this._fontColor;
    },
    set: function set(value) {
      if (this._fontColor === value) {
        return;
      }
      this._fontColor = value;
      this._updateTextDefaultColor();
    }
  }, {
    key: "fontFamily",
    get: function get() {
      return this._fontFamily;
    },
    set: function set(value) {
      if (this._fontFamily === value) return;
      this._fontFamily = value;
      this._layoutDirty = true;
      this._updateRichTextStatus();
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
      this._font = value;
      this._layoutDirty = true;
      if (this._font) {
        this.useSystemFont = false;
        this._onTTFLoaded();
      } else {
        this.useSystemFont = true;
      }
      this._updateRichTextStatus();
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
      this._isSystemFontUsed = value;
      this._layoutDirty = true;
      this._updateRichTextStatus();
    }
  }, {
    key: "cacheMode",
    get: function get() {
      return this._cacheMode;
    },
    set: function set(value) {
      if (this._cacheMode === value) {
        return;
      }
      this._cacheMode = value;
      this._updateRichTextStatus();
    }
  }, {
    key: "maxWidth",
    get: function get() {
      return this._maxWidth;
    },
    set: function set(value) {
      if (this._maxWidth === value) {
        return;
      }
      this._maxWidth = value;
      this._layoutDirty = true;
      this._updateRichTextStatus();
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
      this._layoutDirty = true;
      this._updateRichTextStatus();
    }
  }, {
    key: "imageAtlas",
    get: function get() {
      return this._imageAtlas;
    },
    set: function set(value) {
      if (this._imageAtlas === value) {
        return;
      }
      this._imageAtlas = value;
      this._layoutDirty = true;
      this._updateRichTextStatus();
    }
  }, {
    key: "handleTouchEvent",
    get: function get() {
      return this._handleTouchEvent;
    },
    set: function set(value) {
      if (this._handleTouchEvent === value) {
        return;
      }
      this._handleTouchEvent = value;
      if (this.enabledInHierarchy) {
        if (this.handleTouchEvent) {
          this._addEventListeners();
        } else {
          this._removeEventListeners();
        }
      }
    }
  }]);
}(Component), _RichText.HorizontalAlign = HorizontalTextAlignment, _RichText.VerticalAlign = VerticalTextAlignment, _RichText), _applyDecoratedDescriptor(_class2.prototype, "horizontalAlign", [_dec4], Object.getOwnPropertyDescriptor(_class2.prototype, "horizontalAlign"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "verticalAlign", [_dec5], Object.getOwnPropertyDescriptor(_class2.prototype, "verticalAlign"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "fontColor", [_dec6], Object.getOwnPropertyDescriptor(_class2.prototype, "fontColor"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "font", [_dec7], Object.getOwnPropertyDescriptor(_class2.prototype, "font"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "cacheMode", [_dec8], Object.getOwnPropertyDescriptor(_class2.prototype, "cacheMode"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "imageAtlas", [_dec9], Object.getOwnPropertyDescriptor(_class2.prototype, "imageAtlas"), _class2.prototype), _initializer = applyDecoratedInitializer(_class2.prototype, "_lineHeight", [serializable], function () {
  return 40;
}), _initializer2 = applyDecoratedInitializer(_class2.prototype, "_string", [serializable], function () {
  return '<color=#00ff00>Rich</color><color=#0fffff>Text</color>';
}), _initializer3 = applyDecoratedInitializer(_class2.prototype, "_horizontalAlign", [serializable], function () {
  return HorizontalTextAlignment.LEFT;
}), _initializer4 = applyDecoratedInitializer(_class2.prototype, "_verticalAlign", [serializable], function () {
  return VerticalTextAlignment.TOP;
}), _initializer5 = applyDecoratedInitializer(_class2.prototype, "_fontSize", [serializable], function () {
  return 40;
}), _initializer6 = applyDecoratedInitializer(_class2.prototype, "_fontColor", [serializable], function () {
  return Color.WHITE.clone();
}), _initializer7 = applyDecoratedInitializer(_class2.prototype, "_maxWidth", [serializable], function () {
  return 0;
}), _initializer8 = applyDecoratedInitializer(_class2.prototype, "_fontFamily", [serializable], function () {
  return 'Arial';
}), _initializer9 = applyDecoratedInitializer(_class2.prototype, "_font", [serializable], function () {
  return null;
}), _initializer0 = applyDecoratedInitializer(_class2.prototype, "_isSystemFontUsed", [serializable], function () {
  return true;
}), _initializer1 = applyDecoratedInitializer(_class2.prototype, "_userDefinedFont", [serializable], function () {
  return null;
}), _initializer10 = applyDecoratedInitializer(_class2.prototype, "_cacheMode", [serializable], function () {
  return CacheMode.NONE;
}), _initializer11 = applyDecoratedInitializer(_class2.prototype, "_imageAtlas", [serializable], function () {
  return null;
}), _initializer12 = applyDecoratedInitializer(_class2.prototype, "_handleTouchEvent", [serializable], function () {
  return true;
}), _class2)) || _class) || _class) || _class);
cclegacy.RichText = RichText;

export { RichText };
//# sourceMappingURL=rich-text.js.map
