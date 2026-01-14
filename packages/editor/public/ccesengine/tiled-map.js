import { x as ccenum, W as logID, Q as error, k as errorID, e as warn, a as _createClass, _ as _inheritsLoose, b as _applyDecoratedDescriptor, p as CCInteger, w as warnID, d as CCObjectFlags, C as CCBoolean, j as CCString, l as _createForOfIteratorHelperLoose } from './gc-object-CShF5lzx.js';
import { V as Vec2, C as Color, B as Size, m as Rect, c as ccclass, t as type, b as applyDecoratedInitializer, r as requireComponent, M as Mat4, f as Vec3, O as screenAdapter, s as serializable, n as sys } from './index-uXI1_UMk.js';
import { E as EDITOR } from './_virtual_internal_constants-DWlew7Dp.js';
import './global-exports-DnCP_14L.js';
import { N as NodeEventType, C as Component, A as Asset } from './node-event-Ccvtv8bJ.js';
import './sprite-renderer-C7_6H1N4.js';
import { i as UITransform, j as RenderDrawInfo, k as RenderDrawInfoType, l as RenderData, f as RenderEntity, h as RenderEntityType, U as UIRenderer, a as StaticVBAccessor, v as vfmtPosUvColor } from './ui-renderer-JpGcj-VM.js';
import { L as Label } from './label-B6xdfUV_.js';
import { c as codec } from './ZipUtils-UyrG9qFl.js';
import { _ as _p } from './zlib.min-3VC1ush6.js';
import { o as SAXParser, N as Node, p as TextAsset } from './scene-vWcxM1_c.js';
import './prefab-DYg_oxpo.js';
import './pipeline-state-manager-C5U4ouGL.js';
import { V as View } from './deprecated-Dswa7XeN.js';
import { d as director } from './director-F7e_Lqjg.js';
import { S as Sprite } from './sprite-BKXaVEzt.js';
import './device-manager-CBXP-ttm.js';
import { ag as BlendFactor } from './buffer-barrier-BlQXg9Aa.js';
import { S as SpriteFrame } from './sprite-frame-DHXMUUT-.js';
import './debug-view-BuNhRPv_.js';
import './camera-component-BFt9vSC_.js';
import './deprecated-n0w4kK7g.js';
import './deprecated-CzzdLkmW.js';
import './model-renderer-BBapFDY7.js';
import './renderer-C7HM72NY.js';
import './sorting-layers-BHqhkSbY.js';
import './touch-BKrZ-fxl.js';
import './create-mesh-CfKC5EQd.js';
import './mesh-XWfHgs1t.js';
import './wasm-web-BpK36a26.js';

var Orientation;
(function (Orientation) {
  Orientation[Orientation["ORTHO"] = 0] = "ORTHO";
  Orientation[Orientation["HEX"] = 1] = "HEX";
  Orientation[Orientation["ISO"] = 2] = "ISO";
})(Orientation || (Orientation = {}));
ccenum(Orientation);
var Property;
(function (Property) {
  Property[Property["NONE"] = 0] = "NONE";
  Property[Property["MAP"] = 1] = "MAP";
  Property[Property["LAYER"] = 2] = "LAYER";
  Property[Property["OBJECTGROUP"] = 3] = "OBJECTGROUP";
  Property[Property["OBJECT"] = 4] = "OBJECT";
  Property[Property["TILE"] = 5] = "TILE";
})(Property || (Property = {}));
ccenum(Property);
var TileFlag;
(function (TileFlag) {
  TileFlag[TileFlag["HORIZONTAL"] = 2147483648] = "HORIZONTAL";
  TileFlag[TileFlag["VERTICAL"] = 1073741824] = "VERTICAL";
  TileFlag[TileFlag["DIAGONAL"] = 536870912] = "DIAGONAL";
  TileFlag[TileFlag["FLIPPED_ALL"] = 4026531840] = "FLIPPED_ALL";
  TileFlag[TileFlag["FLIPPED_MASK"] = 268435455] = "FLIPPED_MASK";
})(TileFlag || (TileFlag = {}));
ccenum(TileFlag);
var StaggerAxis;
(function (StaggerAxis) {
  StaggerAxis[StaggerAxis["STAGGERAXIS_X"] = 0] = "STAGGERAXIS_X";
  StaggerAxis[StaggerAxis["STAGGERAXIS_Y"] = 1] = "STAGGERAXIS_Y";
})(StaggerAxis || (StaggerAxis = {}));
ccenum(StaggerAxis);
var StaggerIndex;
(function (StaggerIndex) {
  StaggerIndex[StaggerIndex["STAGGERINDEX_ODD"] = 0] = "STAGGERINDEX_ODD";
  StaggerIndex[StaggerIndex["STAGGERINDEX_EVEN"] = 1] = "STAGGERINDEX_EVEN";
})(StaggerIndex || (StaggerIndex = {}));
ccenum(StaggerIndex);
var RenderOrder;
(function (RenderOrder) {
  RenderOrder[RenderOrder["RightDown"] = 0] = "RightDown";
  RenderOrder[RenderOrder["RightUp"] = 1] = "RightUp";
  RenderOrder[RenderOrder["LeftDown"] = 2] = "LeftDown";
  RenderOrder[RenderOrder["LeftUp"] = 3] = "LeftUp";
})(RenderOrder || (RenderOrder = {}));
ccenum(RenderOrder);
var TMXObjectType;
(function (TMXObjectType) {
  TMXObjectType[TMXObjectType["RECT"] = 0] = "RECT";
  TMXObjectType[TMXObjectType["ELLIPSE"] = 1] = "ELLIPSE";
  TMXObjectType[TMXObjectType["POLYGON"] = 2] = "POLYGON";
  TMXObjectType[TMXObjectType["POLYLINE"] = 3] = "POLYLINE";
  TMXObjectType[TMXObjectType["IMAGE"] = 4] = "IMAGE";
  TMXObjectType[TMXObjectType["TEXT"] = 5] = "TEXT";
})(TMXObjectType || (TMXObjectType = {}));
ccenum(TMXObjectType);
var TMXTilesetInfo = function () {
  function TMXTilesetInfo() {
    this.name = '';
    this.firstGid = 0;
    this.spacing = 0;
    this.margin = 0;
    this.sourceImage = void 0;
    this.imageName = null;
    this.imageOffset = null;
    this.imageSize = new Size(0, 0);
    this.tileOffset = new Vec2(0, 0);
    this._tileSize = new Size(0, 0);
    this.collection = false;
  }
  var _proto = TMXTilesetInfo.prototype;
  _proto.rectForGID = function rectForGID(gid_, result) {
    var rect = result || new Rect(0, 0, 0, 0);
    rect.width = this._tileSize.width;
    rect.height = this._tileSize.height;
    var gid = gid_;
    gid &= TileFlag.FLIPPED_MASK;
    gid -= this.firstGid;
    if (this.imageOffset) {
      rect.x = this.imageOffset.x;
      rect.y = this.imageOffset.y;
    } else {
      var max_x = Math.floor((this.imageSize.width - this.margin * 2 + this.spacing) / (this._tileSize.width + this.spacing));
      rect.x = Math.round(gid % max_x * (this._tileSize.width + this.spacing) + this.margin);
      rect.y = Math.round(Math.floor(gid / max_x) * (this._tileSize.height + this.spacing) + this.margin);
    }
    return rect;
  };
  return TMXTilesetInfo;
}();
var TMXObjectGroupInfo = function () {
  function TMXObjectGroupInfo() {
    this.properties = {};
    this.name = '';
    this.objects = [];
    this.visible = true;
    this.opacity = 0;
    this.color = new Color(255, 255, 255, 255);
    this.offset = new Vec2(0, 0);
    this.draworder = 'topdown';
    this.tintColor = null;
  }
  var _proto2 = TMXObjectGroupInfo.prototype;
  _proto2.getProperties = function getProperties() {
    return this.properties;
  };
  _proto2.setProperties = function setProperties(value) {
    this.properties = value;
  };
  return TMXObjectGroupInfo;
}();
var TMXLayerInfo = function () {
  function TMXLayerInfo() {
    this.properties = {};
    this.name = '';
    this.layerSize = null;
    this.tiles = [];
    this.visible = true;
    this.opacity = 0;
    this.ownTiles = true;
    this.minGID = 100000;
    this.maxGID = 0;
    this.offset = new Vec2(0, 0);
    this.tintColor = null;
  }
  var _proto3 = TMXLayerInfo.prototype;
  _proto3.getProperties = function getProperties() {
    return this.properties;
  };
  _proto3.setProperties = function setProperties(value) {
    this.properties = value;
  };
  return TMXLayerInfo;
}();
TMXLayerInfo.ATTRIB_NONE = 1 << 0;
TMXLayerInfo.ATTRIB_BASE64 = 1 << 1;
TMXLayerInfo.ATTRIB_GZIP = 1 << 2;
TMXLayerInfo.ATTRIB_ZLIB = 1 << 3;
var TMXImageLayerInfo = function TMXImageLayerInfo() {
  this.name = '';
  this.visible = true;
  this.width = 0;
  this.height = 0;
  this.offset = new Vec2(0, 0);
  this.opacity = 0;
  this.trans = new Color(255, 255, 255, 255);
  this.sourceImage = void 0;
  this.tintColor = null;
};

function uint8ArrayToUint32Array(uint8Arr) {
  if (uint8Arr.length % 4 !== 0) return null;
  var arrLen = uint8Arr.length / 4;
  var retArr = window.Uint32Array ? new Uint32Array(arrLen) : [];
  for (var i = 0; i < arrLen; i++) {
    var offset = i * 4;
    retArr[i] = uint8Arr[offset] + uint8Arr[offset + 1] * (1 << 8) + uint8Arr[offset + 2] * (1 << 16) + uint8Arr[offset + 3] * (1 << 24);
  }
  return retArr;
}
function strToHAlign(value) {
  var hAlign = Label.HorizontalAlign;
  switch (value) {
    case 'center':
      return hAlign.CENTER;
    case 'right':
      return hAlign.RIGHT;
    default:
      return hAlign.LEFT;
  }
}
function strToVAlign(value) {
  var vAlign = Label.VerticalAlign;
  switch (value) {
    case 'center':
      return vAlign.CENTER;
    case 'bottom':
      return vAlign.BOTTOM;
    default:
      return vAlign.TOP;
  }
}
function strToColor(value) {
  if (!value) {
    return new Color(0, 0, 0, 255);
  }
  value = value.indexOf('#') !== -1 ? value.substring(1) : value;
  if (value.length === 8) {
    var a = parseInt(value.substr(0, 2), 16) || 255;
    var r = parseInt(value.substr(2, 2), 16) || 0;
    var g = parseInt(value.substr(4, 2), 16) || 0;
    var b = parseInt(value.substr(6, 2), 16) || 0;
    return new Color(r, g, b, a);
  } else {
    var _r = parseInt(value.substr(0, 2), 16) || 0;
    var _g = parseInt(value.substr(2, 2), 16) || 0;
    var _b = parseInt(value.substr(4, 2), 16) || 0;
    return new Color(_r, _g, _b, 255);
  }
}
function getPropertyList(node, map) {
  var res = [];
  var properties = Array.from(node.getElementsByTagName('properties')).filter(function (element) {
    return element.parentNode === node;
  });
  for (var i = 0; i < properties.length; ++i) {
    var property = properties[i].getElementsByTagName('property');
    for (var j = 0; j < property.length; ++j) {
      res.push(property[j]);
    }
  }
  map = map || {};
  for (var _i = 0; _i < res.length; _i++) {
    var element = res[_i];
    var name = element.getAttribute('name');
    var type = element.getAttribute('type') || 'string';
    var value = element.getAttribute('value');
    if (type === 'int') {
      value = parseInt(value);
    } else if (type === 'float') {
      value = parseFloat(value);
    } else if (type === 'bool') {
      value = value === 'true';
    } else if (type === 'color') {
      value = strToColor(value);
    }
    map[name] = value;
  }
  return map;
}
var TMXMapInfo = function () {
  function TMXMapInfo(tmxFile, tsxContentMap, spfTexturesMap, textureSizes, imageLayerTextures) {
    this.properties = {};
    this.orientation = null;
    this.parentElement = null;
    this.parentGID = 0;
    this.layerAttrs = 0;
    this.storingCharacters = false;
    this.currentString = null;
    this.renderOrder = RenderOrder.RightDown;
    this._supportVersion = [1, 4, 0];
    this._objectGroups = [];
    this._allChildren = [];
    this._mapSize = new Size(0, 0);
    this._tileSize = new Size(0, 0);
    this._layers = [];
    this._tilesets = [];
    this._imageLayers = [];
    this._tileProperties = new Map();
    this._tileAnimations = {};
    this._tsxContentMap = null;
    this._spriteFrameMap = null;
    this._spfSizeMap = {};
    this._staggerAxis = null;
    this._staggerIndex = null;
    this._hexSideLength = 0;
    this._imageLayerSPF = null;
    this.initWithXML(tmxFile, tsxContentMap, spfTexturesMap, textureSizes, imageLayerTextures);
  }
  var _proto = TMXMapInfo.prototype;
  _proto.getOrientation = function getOrientation() {
    return this.orientation;
  };
  _proto.setOrientation = function setOrientation(value) {
    this.orientation = value;
  };
  _proto.getStaggerAxis = function getStaggerAxis() {
    return this._staggerAxis;
  };
  _proto.setStaggerAxis = function setStaggerAxis(value) {
    this._staggerAxis = value;
  };
  _proto.getStaggerIndex = function getStaggerIndex() {
    return this._staggerIndex;
  };
  _proto.setStaggerIndex = function setStaggerIndex(value) {
    this._staggerIndex = value;
  };
  _proto.getHexSideLength = function getHexSideLength() {
    return this._hexSideLength;
  };
  _proto.setHexSideLength = function setHexSideLength(value) {
    this._hexSideLength = value;
  };
  _proto.getMapSize = function getMapSize() {
    return new Size(this._mapSize.width, this._mapSize.height);
  };
  _proto.setMapSize = function setMapSize(value) {
    this._mapSize.width = value.width;
    this._mapSize.height = value.height;
  };
  _proto.getTileSize = function getTileSize() {
    return new Size(this._tileSize.width, this._tileSize.height);
  };
  _proto.setTileSize = function setTileSize(value) {
    this._tileSize.width = value.width;
    this._tileSize.height = value.height;
  };
  _proto.getLayers = function getLayers() {
    return this._layers;
  };
  _proto.setLayers = function setLayers(value) {
    this._allChildren.push(value);
    this._layers.push(value);
  };
  _proto.getImageLayers = function getImageLayers() {
    return this._imageLayers;
  };
  _proto.setImageLayers = function setImageLayers(value) {
    this._allChildren.push(value);
    this._imageLayers.push(value);
  };
  _proto.getTilesets = function getTilesets() {
    return this._tilesets;
  };
  _proto.setTilesets = function setTilesets(value) {
    this._tilesets.push(value);
  };
  _proto.getObjectGroups = function getObjectGroups() {
    return this._objectGroups;
  };
  _proto.setObjectGroups = function setObjectGroups(value) {
    this._allChildren.push(value);
    this._objectGroups.push(value);
  };
  _proto.getAllChildren = function getAllChildren() {
    return this._allChildren;
  };
  _proto.getParentElement = function getParentElement() {
    return this.parentElement;
  };
  _proto.setParentElement = function setParentElement(value) {
    this.parentElement = value;
  };
  _proto.getParentGID = function getParentGID() {
    return this.parentGID;
  };
  _proto.setParentGID = function setParentGID(value) {
    this.parentGID = value;
  };
  _proto.getLayerAttribs = function getLayerAttribs() {
    return this.layerAttrs;
  };
  _proto.setLayerAttribs = function setLayerAttribs(value) {
    this.layerAttrs = value;
  };
  _proto.getStoringCharacters = function getStoringCharacters() {
    return this.storingCharacters;
  };
  _proto.setStoringCharacters = function setStoringCharacters(value) {
    this.storingCharacters = value;
  };
  _proto.getProperties = function getProperties() {
    return this.properties;
  };
  _proto.setProperties = function setProperties(value) {
    this.properties = value;
  };
  _proto.initWithXML = function initWithXML(tmxString, tsxMap, spfTextureMap, textureSizes, imageLayerTextures) {
    this._tilesets.length = 0;
    this._layers.length = 0;
    this._imageLayers.length = 0;
    this._tsxContentMap = tsxMap;
    this._spriteFrameMap = spfTextureMap;
    this._imageLayerSPF = imageLayerTextures;
    this._spfSizeMap = textureSizes;
    this._objectGroups.length = 0;
    this._allChildren.length = 0;
    this.properties = {};
    this._tileProperties = new Map();
    this._tileAnimations = new Map();
    this.currentString = '';
    this.storingCharacters = false;
    this.layerAttrs = TMXLayerInfo.ATTRIB_NONE;
    this.parentElement = null;
    return this.parseXMLString(tmxString);
  };
  _proto.parseXMLString = function parseXMLString(xmlStr, tilesetFirstGid) {
    var parser = new SAXParser();
    var mapXML = parser.parse(xmlStr);
    var i;
    var map = mapXML.documentElement;
    var orientationStr = map.getAttribute('orientation');
    var staggerAxisStr = map.getAttribute('staggeraxis');
    var staggerIndexStr = map.getAttribute('staggerindex');
    var hexSideLengthStr = map.getAttribute('hexsidelength');
    var renderorderStr = map.getAttribute('renderorder');
    var version = map.getAttribute('version') || '1.0.0';
    if (map.nodeName === 'map') {
      var versionArr = version.split('.');
      var supportVersion = this._supportVersion;
      for (i = 0; i < supportVersion.length; i++) {
        var v = parseInt(versionArr[i]) || 0;
        var sv = supportVersion[i];
        if (sv < v) {
          logID(7216, version);
          break;
        }
      }
      if (orientationStr === 'orthogonal') this.orientation = Orientation.ORTHO;else if (orientationStr === 'isometric') this.orientation = Orientation.ISO;else if (orientationStr === 'hexagonal') this.orientation = Orientation.HEX;else if (orientationStr !== null) logID(7217, orientationStr);
      if (renderorderStr === 'right-up') {
        this.renderOrder = RenderOrder.RightUp;
      } else if (renderorderStr === 'left-up') {
        this.renderOrder = RenderOrder.LeftUp;
      } else if (renderorderStr === 'left-down') {
        this.renderOrder = RenderOrder.LeftDown;
      } else {
        this.renderOrder = RenderOrder.RightDown;
      }
      if (staggerAxisStr === 'x') {
        this.setStaggerAxis(StaggerAxis.STAGGERAXIS_X);
      } else if (staggerAxisStr === 'y') {
        this.setStaggerAxis(StaggerAxis.STAGGERAXIS_Y);
      }
      if (staggerIndexStr === 'odd') {
        this.setStaggerIndex(StaggerIndex.STAGGERINDEX_ODD);
      } else if (staggerIndexStr === 'even') {
        this.setStaggerIndex(StaggerIndex.STAGGERINDEX_EVEN);
      }
      if (hexSideLengthStr) {
        this.setHexSideLength(parseFloat(hexSideLengthStr));
      }
      var mapSize = new Size(0, 0);
      mapSize.width = parseFloat(map.getAttribute('width'));
      mapSize.height = parseFloat(map.getAttribute('height'));
      this.setMapSize(mapSize);
      mapSize = new Size(0, 0);
      mapSize.width = parseFloat(map.getAttribute('tilewidth'));
      mapSize.height = parseFloat(map.getAttribute('tileheight'));
      this.setTileSize(mapSize);
      this.properties = getPropertyList(map);
    }
    var tilesets = map.getElementsByTagName('tileset');
    if (map.nodeName !== 'map') {
      tilesets = [];
      tilesets.push(map);
    }
    for (i = 0; i < tilesets.length; i++) {
      var curTileset = tilesets[i];
      var tsxName = curTileset.getAttribute('source');
      if (tsxName) {
        var currentFirstGID = parseInt(curTileset.getAttribute('firstgid'));
        var tsxXmlString = this._tsxContentMap[tsxName];
        if (tsxXmlString) {
          this.parseXMLString(tsxXmlString, currentFirstGID);
        }
      } else {
        var images = curTileset.getElementsByTagName('image');
        var collection = images.length > 1;
        var firstImage = images[0];
        var firstImageName = firstImage.getAttribute('source');
        firstImageName = firstImageName.replace(/\\/g, '/');
        var tiles = curTileset.getElementsByTagName('tile');
        var tileCount = tiles && tiles.length || 1;
        var tile = null;
        var tilesetName = curTileset.getAttribute('name') || '';
        var tilesetSpacing = parseInt(curTileset.getAttribute('spacing')) || 0;
        var tilesetMargin = parseInt(curTileset.getAttribute('margin')) || 0;
        var fgid = tilesetFirstGid || parseInt(curTileset.getAttribute('firstgid')) || 0;
        var tilesetSize = new Size(0, 0);
        tilesetSize.width = parseFloat(curTileset.getAttribute('tilewidth'));
        tilesetSize.height = parseFloat(curTileset.getAttribute('tileheight'));
        var curTileOffset = curTileset.getElementsByTagName('tileoffset')[0];
        var tileOffsetX = 0;
        var tileOffsetY = 0;
        if (curTileOffset) {
          tileOffsetX = parseFloat(curTileOffset.getAttribute('x')) || 0;
          tileOffsetY = parseFloat(curTileOffset.getAttribute('y')) || 0;
        }
        var tileset = null;
        for (var tileIdx = 0; tileIdx < tileCount; tileIdx++) {
          var curImage = images[tileIdx] ? images[tileIdx] : firstImage;
          if (!curImage) continue;
          var curImageName = curImage.getAttribute('source');
          curImageName = curImageName.replace(/\\/g, '/');
          if (!tileset || collection) {
            tileset = new TMXTilesetInfo();
            tileset.name = tilesetName;
            tileset.firstGid = fgid & TileFlag.FLIPPED_MASK;
            tileset.tileOffset.x = tileOffsetX;
            tileset.tileOffset.y = tileOffsetY;
            tileset.collection = collection;
            if (!collection) {
              tileset.imageName = curImageName;
              tileset.imageSize.width = parseFloat(curImage.getAttribute('width')) || 0;
              tileset.imageSize.height = parseFloat(curImage.getAttribute('height')) || 0;
              tileset.sourceImage = this._spriteFrameMap[curImageName];
              if (!tileset.sourceImage) {
                var nameWithPostfix = TMXMapInfo.getNameWithPostfix(curImageName);
                tileset.imageName = nameWithPostfix;
                tileset.sourceImage = this._spriteFrameMap[nameWithPostfix];
                if (!tileset.sourceImage) {
                  var shortName = TMXMapInfo.getShortName(curImageName);
                  tileset.imageName = shortName;
                  tileset.sourceImage = this._spriteFrameMap[shortName];
                  if (!tileset.sourceImage) {
                    error("[error]: " + shortName + " not find in [" + Object.keys(this._spriteFrameMap).join(', ') + "]");
                    errorID(7221, curImageName);
                    warn("Please try asset type of " + curImageName + " to 'sprite-frame'");
                  }
                }
              }
            }
            tileset.spacing = tilesetSpacing;
            tileset.margin = tilesetMargin;
            tileset._tileSize.width = tilesetSize.width;
            tileset._tileSize.height = tilesetSize.height;
            this.setTilesets(tileset);
          }
          tile = tiles && tiles[tileIdx];
          if (!tile) {
            continue;
          }
          this.parentGID = fgid + (parseInt(tile.getAttribute('id')) || 0);
          var tileImages = tile.getElementsByTagName('image');
          if (tile.hasAttribute('x') && tile.hasAttribute('y')) {
            tileset.imageOffset = new Vec2(parseFloat(tile.getAttribute('x')) || 0, parseFloat(tile.getAttribute('y')) || 0);
          }
          var hastilesize = tile.hasAttribute('width') && tile.hasAttribute('height');
          if (hastilesize) {
            tileset._tileSize.width = parseFloat(tile.getAttribute('width')) || 0;
            tileset._tileSize.height = parseFloat(tile.getAttribute('height')) || 0;
          }
          if (tileImages && tileImages.length > 0) {
            var image = tileImages[0];
            var imageName = image.getAttribute('source');
            imageName = imageName.replace(/\\/g, '/');
            tileset.imageName = imageName;
            tileset.imageSize.width = parseFloat(image.getAttribute('width')) || 0;
            tileset.imageSize.height = parseFloat(image.getAttribute('height')) || 0;
            if (!hastilesize) {
              tileset._tileSize.width = tileset.imageSize.width;
              tileset._tileSize.height = tileset.imageSize.height;
            }
            tileset.sourceImage = this._spriteFrameMap[imageName];
            if (!tileset.sourceImage) {
              var _nameWithPostfix = TMXMapInfo.getNameWithPostfix(imageName);
              tileset.imageName = _nameWithPostfix;
              tileset.sourceImage = this._spriteFrameMap[_nameWithPostfix];
              if (!tileset.sourceImage) {
                var _shortName = TMXMapInfo.getShortName(imageName);
                tileset.imageName = _shortName;
                tileset.sourceImage = this._spriteFrameMap[_shortName];
                if (!tileset.sourceImage) {
                  errorID(7221, imageName);
                  warn("Please try asset type of " + imageName + " to 'sprite-frame'");
                }
              }
            }
            tileset.firstGid = this.parentGID & TileFlag.FLIPPED_MASK;
          }
          var pid = (TileFlag.FLIPPED_MASK & this.parentGID) >>> 0;
          this._tileProperties.set(pid, getPropertyList(tile));
          var animations = tile.getElementsByTagName('animation');
          if (animations && animations.length > 0) {
            var animation = animations[0];
            var framesData = animation.getElementsByTagName('frame');
            var animationProp = {
              frames: [],
              dt: 0,
              frameIdx: 0
            };
            this._tileAnimations.set(pid, animationProp);
            var frames = animationProp.frames;
            for (var frameIdx = 0; frameIdx < framesData.length; frameIdx++) {
              var frame = framesData[frameIdx];
              var tileid = fgid + (parseInt(frame.getAttribute('tileid')) || 0);
              var duration = parseFloat(frame.getAttribute('duration')) || 0;
              frames.push({
                tileid: tileid,
                duration: duration / 1000,
                grid: null
              });
            }
          }
        }
      }
    }
    var childNodes = map.childNodes;
    for (i = 0; i < childNodes.length; i++) {
      var childNode = childNodes[i];
      if (this._shouldIgnoreNode(childNode)) {
        continue;
      }
      if (childNode.nodeName === 'imagelayer') {
        var imageLayer = this._parseImageLayer(childNode);
        if (imageLayer) {
          this.setImageLayers(imageLayer);
        }
      }
      if (childNode.nodeName === 'layer') {
        var layer = this._parseLayer(childNode);
        this.setLayers(layer);
      }
      if (childNode.nodeName === 'objectgroup') {
        var objectGroup = this._parseObjectGroup(childNode);
        this.setObjectGroups(objectGroup);
      }
    }
    return map;
  };
  _proto._shouldIgnoreNode = function _shouldIgnoreNode(node) {
    return node.nodeType === 3 || node.nodeType === 8 || node.nodeType === 4;
  };
  _proto._parseImageLayer = function _parseImageLayer(selLayer) {
    var datas = selLayer.getElementsByTagName('image');
    if (!datas || datas.length === 0) return null;
    var imageLayer = new TMXImageLayerInfo();
    imageLayer.name = selLayer.getAttribute('name');
    imageLayer.offset.x = parseFloat(selLayer.getAttribute('offsetx')) || 0;
    imageLayer.offset.y = parseFloat(selLayer.getAttribute('offsety')) || 0;
    var visible = selLayer.getAttribute('visible');
    imageLayer.visible = !(visible === '0');
    var opacity = selLayer.getAttribute('opacity');
    imageLayer.opacity = opacity ? Math.round(255 * parseFloat(opacity)) : 255;
    var tintColor = selLayer.getAttribute('tintcolor');
    imageLayer.tintColor = tintColor ? strToColor(tintColor) : null;
    var data = datas[0];
    var source = data.getAttribute('source');
    imageLayer.sourceImage = this._imageLayerSPF[source];
    imageLayer.width = parseInt(data.getAttribute('width')) || 0;
    imageLayer.height = parseInt(data.getAttribute('height')) || 0;
    imageLayer.trans = strToColor(data.getAttribute('trans'));
    if (!imageLayer.sourceImage) {
      errorID(7221, source);
      warn("Please try asset type of " + source + " to 'sprite-frame'");
      return null;
    }
    return imageLayer;
  };
  _proto._parseLayer = function _parseLayer(selLayer) {
    var data = selLayer.getElementsByTagName('data')[0];
    var layer = new TMXLayerInfo();
    layer.name = selLayer.getAttribute('name');
    var layerSize = new Size(0, 0);
    layerSize.width = parseFloat(selLayer.getAttribute('width'));
    layerSize.height = parseFloat(selLayer.getAttribute('height'));
    layer.layerSize = layerSize;
    var visible = selLayer.getAttribute('visible');
    layer.visible = !(visible === '0');
    var opacity = selLayer.getAttribute('opacity');
    if (opacity) layer.opacity = Math.round(255 * parseFloat(opacity));else layer.opacity = 255;
    layer.offset = new Vec2(parseFloat(selLayer.getAttribute('offsetx')) || 0, parseFloat(selLayer.getAttribute('offsety')) || 0);
    var tintColor = selLayer.getAttribute('tintcolor');
    layer.tintColor = tintColor ? strToColor(tintColor) : null;
    var nodeValue = '';
    for (var j = 0; j < data.childNodes.length; j++) {
      nodeValue += data.childNodes[j].nodeValue;
    }
    nodeValue = nodeValue.trim();
    var compression = data.getAttribute('compression');
    var encoding = data.getAttribute('encoding');
    if (compression && compression !== 'gzip' && compression !== 'zlib') {
      logID(7218);
      return null;
    }
    var tiles;
    switch (compression) {
      case 'gzip':
        tiles = codec.unzipBase64AsArray(nodeValue, 4);
        break;
      case 'zlib':
        {
          var inflator = new _p.Inflate(codec.Base64.decodeAsArray(nodeValue, 1));
          tiles = uint8ArrayToUint32Array(inflator.decompress());
          break;
        }
      case null:
      case '':
        if (encoding === 'base64') tiles = codec.Base64.decodeAsArray(nodeValue, 4);else if (encoding === 'csv') {
          tiles = [];
          var csvTiles = nodeValue.split(',');
          for (var csvIdx = 0; csvIdx < csvTiles.length; csvIdx++) tiles.push(parseInt(csvTiles[csvIdx]));
        } else {
          var selDataTiles = data.getElementsByTagName('tile');
          tiles = [];
          for (var xmlIdx = 0; xmlIdx < selDataTiles.length; xmlIdx++) tiles.push(parseInt(selDataTiles[xmlIdx].getAttribute('gid')));
        }
        break;
      default:
        if (this.layerAttrs === TMXLayerInfo.ATTRIB_NONE) logID(7219);
        break;
    }
    if (tiles) {
      layer.tiles = new Uint32Array(tiles);
    }
    layer.properties = getPropertyList(selLayer);
    return layer;
  };
  _proto._parseObjectGroup = function _parseObjectGroup(selGroup) {
    var objectGroup = new TMXObjectGroupInfo();
    objectGroup.name = selGroup.getAttribute('name') || '';
    objectGroup.offset = new Vec2(parseFloat(selGroup.getAttribute('offsetx')), parseFloat(selGroup.getAttribute('offsety')));
    var opacity = selGroup.getAttribute('opacity');
    if (opacity) objectGroup.opacity = Math.round(255 * parseFloat(opacity));else objectGroup.opacity = 255;
    var tintColor = selGroup.getAttribute('tintcolor');
    objectGroup.tintColor = tintColor ? strToColor(tintColor) : null;
    var visible = selGroup.getAttribute('visible');
    if (visible && parseInt(visible) === 0) objectGroup.visible = false;
    var color = selGroup.getAttribute('color');
    if (color) objectGroup.color.fromHEX(color);
    var draworder = selGroup.getAttribute('draworder');
    if (draworder) objectGroup.draworder = draworder;
    objectGroup.setProperties(getPropertyList(selGroup));
    var objects = selGroup.getElementsByTagName('object');
    if (objects) {
      for (var j = 0; j < objects.length; j++) {
        var selObj = objects[j];
        var objectProp = {};
        objectProp.id = selObj.getAttribute('id') || j;
        objectProp.name = selObj.getAttribute('name') || '';
        objectProp.width = parseFloat(selObj.getAttribute('width')) || 0;
        objectProp.height = parseFloat(selObj.getAttribute('height')) || 0;
        objectProp.x = parseFloat(selObj.getAttribute('x')) || 0;
        objectProp.y = parseFloat(selObj.getAttribute('y')) || 0;
        objectProp.rotation = parseFloat(selObj.getAttribute('rotation')) || 0;
        objectProp.properties = getPropertyList(selObj);
        var visibleAttr = selObj.getAttribute('visible');
        objectProp.visible = !(visibleAttr && parseInt(visibleAttr) === 0);
        var texts = selObj.getElementsByTagName('text');
        if (texts && texts.length > 0) {
          var text = texts[0];
          objectProp.type = TMXObjectType.TEXT;
          objectProp.wrap = text.getAttribute('wrap') === '1';
          objectProp.color = strToColor(text.getAttribute('color'));
          objectProp.halign = strToHAlign(text.getAttribute('halign'));
          objectProp.valign = strToVAlign(text.getAttribute('valign'));
          objectProp.pixelsize = parseInt(text.getAttribute('pixelsize')) || 16;
          objectProp.text = text.childNodes[0].nodeValue;
        }
        var gid = selObj.getAttribute('gid');
        if (gid) {
          objectProp.gid = parseInt(gid);
          objectProp.type = TMXObjectType.IMAGE;
        }
        var ellipse = selObj.getElementsByTagName('ellipse');
        if (ellipse && ellipse.length > 0) {
          objectProp.type = TMXObjectType.ELLIPSE;
        }
        var polygonProps = selObj.getElementsByTagName('polygon');
        if (polygonProps && polygonProps.length > 0) {
          objectProp.type = TMXObjectType.POLYGON;
          var selPgPointStr = polygonProps[0].getAttribute('points');
          if (selPgPointStr) objectProp.points = this._parsePointsString(selPgPointStr);
        }
        var polylineProps = selObj.getElementsByTagName('polyline');
        if (polylineProps && polylineProps.length > 0) {
          objectProp.type = TMXObjectType.POLYLINE;
          var selPlPointStr = polylineProps[0].getAttribute('points');
          if (selPlPointStr) objectProp.polylinePoints = this._parsePointsString(selPlPointStr);
        }
        if (!objectProp.type) {
          objectProp.type = TMXObjectType.RECT;
        }
        objectGroup.objects.push(objectProp);
      }
      if (draworder !== 'index') {
        objectGroup.objects.sort(function (a, b) {
          return a.y - b.y;
        });
      }
    }
    return objectGroup;
  };
  _proto._parsePointsString = function _parsePointsString(pointsString) {
    if (!pointsString) return null;
    var points = [];
    var pointsStr = pointsString.split(' ');
    for (var i = 0; i < pointsStr.length; i++) {
      var selPointStr = pointsStr[i].split(',');
      points.push({
        x: parseFloat(selPointStr[0]),
        y: parseFloat(selPointStr[1])
      });
    }
    return points;
  };
  _proto.setTileAnimations = function setTileAnimations(animations) {
    this._tileAnimations = animations;
  };
  _proto.getTileAnimations = function getTileAnimations() {
    return this._tileAnimations;
  };
  _proto.getTileProperties = function getTileProperties() {
    return this._tileProperties;
  };
  _proto.setTileProperties = function setTileProperties(tileProperties) {
    this._tileProperties = tileProperties;
  };
  _proto.getCurrentString = function getCurrentString() {
    return this.currentString;
  };
  _proto.setCurrentString = function setCurrentString(currentString) {
    this.currentString = currentString;
  };
  TMXMapInfo.getNameWithPostfix = function getNameWithPostfix(name) {
    name = name.replace(/\\/g, '/');
    var slashIndex = name.lastIndexOf('/') + 1;
    var strLen = name.length;
    return name.substring(slashIndex, strLen);
  };
  TMXMapInfo.getShortName = function getShortName(name) {
    name = name.replace(/\\/g, '/');
    var slashIndex = name.lastIndexOf('/') + 1;
    var dotIndex = name.lastIndexOf('.');
    dotIndex = dotIndex < 0 ? name.length : dotIndex;
    return name.substring(slashIndex, dotIndex);
  };
  return _createClass(TMXMapInfo, [{
    key: "mapSize",
    get: function get() {
      return this._mapSize;
    }
  }, {
    key: "tileSize",
    get: function get() {
      return this._tileSize;
    }
  }, {
    key: "mapWidth",
    get: function get() {
      return this._mapSize.width;
    },
    set: function set(width) {
      this._mapSize.width = width;
    }
  }, {
    key: "mapHeight",
    get: function get() {
      return this._mapSize.height;
    },
    set: function set(height) {
      this._mapSize.height = height;
    }
  }, {
    key: "tileWidth",
    get: function get() {
      return this._tileSize.width;
    },
    set: function set(width) {
      this._tileSize.width = width;
    }
  }, {
    key: "tileHeight",
    get: function get() {
      return this._tileSize.height;
    },
    set: function set(height) {
      this._tileSize.height = height;
    }
  }]);
}();

var _dec$4, _dec2$4, _dec3$3, _dec4$1, _dec5$1, _dec6$1, _dec7$1, _class$4, _class2$4, _initializer$2, _initializer2$2;
var TiledTile = (_dec$4 = ccclass('cc.TiledTile'), _dec2$4 = requireComponent(UITransform), _dec3$3 = type(CCInteger), _dec4$1 = type(CCInteger), _dec5$1 = type(CCInteger), _dec6$1 = type(CCInteger), _dec7$1 = type(CCInteger), _dec$4(_class$4 = _dec2$4(_class$4 = (_class2$4 = function (_Component) {
  function TiledTile() {
    var _this;
    _this = _Component.call(this) || this;
    _this._layer = null;
    _this._x = _initializer$2 && _initializer$2();
    _this._y = _initializer2$2 && _initializer2$2();
    return _this;
  }
  _inheritsLoose(TiledTile, _Component);
  var _proto = TiledTile.prototype;
  _proto.onEnable = function onEnable() {
    var parent = this.node.parent;
    this._layer = parent.getComponent('cc.TiledLayer');
    this.node.on(NodeEventType.TRANSFORM_CHANGED, this._updatePosition, this);
    this.node.on(NodeEventType.SIZE_CHANGED, this._updatePosition, this);
    this._resetTile();
    this.updateInfo();
  };
  _proto.onDisable = function onDisable() {
    this._resetTile();
    this.node.off(NodeEventType.TRANSFORM_CHANGED, this._updatePosition, this);
    this.node.off(NodeEventType.SIZE_CHANGED, this._updatePosition, this);
  };
  _proto._resetTile = function _resetTile() {
    if (this._layer && this._layer.getTiledTileAt(this._x, this._y) === this) {
      this._layer.setTiledTileAt(this._x, this._y, null);
    }
  };
  _proto.updateInfo = function updateInfo() {
    if (!this._layer) return;
    var x = this._x;
    var y = this._y;
    if (this._layer.getTiledTileAt(x, y)) {
      warn('There is already a TiledTile at [%s, %s]', x, y);
      return;
    }
    var p = this._layer.getPositionAt(x, y);
    this.node.setPosition(p.x, p.y);
    this._layer.setTiledTileAt(x, y, this);
    this._layer._markForUpdateRenderData();
  };
  _proto._updatePosition = function _updatePosition() {
    this._layer._markForUpdateRenderData();
  };
  return _createClass(TiledTile, [{
    key: "x",
    get: function get() {
      return this._x;
    },
    set: function set(value) {
      if (value === this._x) return;
      if (this._layer && this._layer.isInvalidPosition(value, this._y)) {
        warn("Invalid x, the valid value is between [%s] ~ [%s]", 0, this._layer.layerSize.width);
        return;
      }
      this._resetTile();
      this._x = value;
      this.updateInfo();
    }
  }, {
    key: "y",
    get: function get() {
      return this._y;
    },
    set: function set(value) {
      if (value === this._y) return;
      if (this._layer && this._layer.isInvalidPosition(this._x, value)) {
        warn("Invalid y, the valid value is between [%s] ~ [%s]", 0, this._layer.layerSize.height);
        return;
      }
      this._resetTile();
      this._y = value;
      this.updateInfo();
    }
  }, {
    key: "grid",
    get: function get() {
      if (this._layer) {
        return this._layer.getTileGIDAt(this._x, this._y);
      }
      return 0;
    },
    set: function set(value) {
      if (this._layer) {
        this._layer.setTileGIDAt(value, this._x, this._y);
      }
    }
  }]);
}(Component), _initializer$2 = applyDecoratedInitializer(_class2$4.prototype, "_x", [_dec3$3], function () {
  return 0;
}), _initializer2$2 = applyDecoratedInitializer(_class2$4.prototype, "_y", [_dec4$1], function () {
  return 0;
}), _applyDecoratedDescriptor(_class2$4.prototype, "x", [_dec5$1], Object.getOwnPropertyDescriptor(_class2$4.prototype, "x"), _class2$4.prototype), _applyDecoratedDescriptor(_class2$4.prototype, "y", [_dec6$1], Object.getOwnPropertyDescriptor(_class2$4.prototype, "y"), _class2$4.prototype), _applyDecoratedDescriptor(_class2$4.prototype, "grid", [_dec7$1], Object.getOwnPropertyDescriptor(_class2$4.prototype, "grid"), _class2$4.prototype), _class2$4)) || _class$4) || _class$4);

var _enableTexelOffset = false;
function enableTexelOffsetUtils(enable) {
  _enableTexelOffset = enable;
}
function fillTextureGrids(tileset, texGrids, spFrame) {
  var spf = spFrame || tileset.sourceImage;
  var tex = spf.texture;
  var collection = tileset.collection;
  if (!tileset.imageSize.width || !tileset.imageSize.height) {
    var sourceImage = tileset.sourceImage;
    tileset.imageSize.width = sourceImage.width;
    tileset.imageSize.height = sourceImage.height;
  }
  var imageWidth = tileset.imageSize.width;
  var imageHeight = tileset.imageSize.height;
  var tw = tileset._tileSize.width;
  var th = tileset._tileSize.height;
  var texWidth = spf.width;
  var texHeight = spf.height;
  var spacing = tileset.spacing;
  var margin = tileset.margin;
  var count = 1;
  if (!collection) {
    var cols = Math.floor((imageWidth - margin * 2 + spacing) / (tw + spacing));
    var rows = Math.floor((imageHeight - margin * 2 + spacing) / (th + spacing));
    count = Math.max(1, rows * cols);
  }
  var firstGid = tileset.firstGid;
  var grid = null;
  var override = !!texGrids.get(firstGid);
  var maxGid = tileset.firstGid + count;
  var gid = firstGid;
  for (; gid < maxGid; ++gid) {
    if (override && !texGrids.get(gid)) {
      override = false;
    }
    if (!override && texGrids.get(gid)) {
      break;
    }
    grid = {
      tileset: tileset,
      x: 0,
      y: 0,
      width: tw,
      height: th,
      t: 0,
      l: 0,
      r: 0,
      b: 0,
      cx: 0,
      cy: 0,
      offsetX: 0,
      offsetY: 0,
      rotated: false,
      gid: gid,
      spriteFrame: spf,
      texture: tex
    };
    tileset.rectForGID(gid, grid);
    if (!spFrame || count > 1 || tileset.imageOffset) {
      if (spFrame) {
        grid._name = spFrame.name;
        var lm = spFrame.unbiasUV[0];
        var bm = spFrame.rotated ? spFrame.unbiasUV[1] : spFrame.unbiasUV[5];
        if (_enableTexelOffset) {
          grid.l = lm + (grid.x + 0.5) / texWidth;
          grid.t = bm + (grid.y + 0.5) / texHeight;
          grid.r = lm + (grid.x + grid.width - 0.5) / texWidth;
          grid.b = bm + (grid.y + grid.height - 0.5) / texHeight;
        } else {
          grid.l = lm + grid.x / texWidth;
          grid.t = bm + grid.y / texHeight;
          grid.r = lm + (grid.x + grid.width) / texWidth;
          grid.b = bm + (grid.y + grid.height) / texHeight;
        }
        grid._rect = new Rect(grid.x, grid.y, grid.width, grid.height);
      } else {
        grid.l = grid.x / texWidth;
        grid.t = grid.y / texHeight;
        grid.r = (grid.x + grid.width) / texWidth;
        grid.b = (grid.y + grid.height) / texHeight;
        grid._rect = new Rect(grid.x, grid.y, grid.width, grid.height);
      }
    } else if (spFrame.rotated) {
      grid._rotated = true;
      grid._name = spFrame.name;
      grid._rect = spFrame.getRect();
      grid.l = spFrame.unbiasUV[0];
      grid.t = spFrame.unbiasUV[1];
      grid.r = spFrame.unbiasUV[4];
      grid.b = spFrame.unbiasUV[3];
    } else {
      grid._name = spFrame.name;
      grid._rect = spFrame.getRect();
      grid.l = spFrame.unbiasUV[0];
      grid.t = spFrame.unbiasUV[5];
      grid.r = spFrame.unbiasUV[2];
      grid.b = spFrame.unbiasUV[1];
    }
    grid.cx = (grid.l + grid.r) / 2;
    grid.cy = (grid.t + grid.b) / 2;
    texGrids.set(gid, grid);
  }
}

var _dec$3, _class$3, _dec2$3, _class2$3;
var _mat4_temp$1 = new Mat4();
var _vec2_temp = new Vec2();
var _vec3_temp = new Vec3();
var _vec3_temp2 = new Vec3();
var _tempRowCol = {
  row: 0,
  col: 0
};
function isTiledSubNodeData(data) {
  return 'subNodes' in data;
}
var TiledUserNodeData = (_dec$3 = ccclass('cc.TiledUserNodeData'), _dec$3(_class$3 = function (_Component) {
  function TiledUserNodeData() {
    var _this;
    _this = _Component.call(this) || this;
    _this._index = -1;
    _this._row = -1;
    _this._col = -1;
    _this._tiledLayer = null;
    return _this;
  }
  _inheritsLoose(TiledUserNodeData, _Component);
  return TiledUserNodeData;
}(Component)) || _class$3);
var TiledLayer = (_dec2$3 = ccclass('cc.TiledLayer'), _dec2$3(_class2$3 = function (_UIRenderer) {
  function TiledLayer() {
    var _this2;
    _this2 = _UIRenderer.call(this) || this;
    _this2._userNodeGrid = {};
    _this2._userNodeMap = {};
    _this2._userNodeDirty = false;
    _this2.tiledTiles = [];
    _this2._viewPort = {
      x: -1,
      y: -1,
      width: -1,
      height: -1
    };
    _this2._cullingRect = {
      leftDown: {
        row: -1,
        col: -1
      },
      rightTop: {
        row: -1,
        col: -1
      }
    };
    _this2._cullingDirty = true;
    _this2._rightTop = {
      row: -1,
      col: -1
    };
    _this2._layerInfo = null;
    _this2._mapInfo = null;
    _this2._topOffset = 0;
    _this2._downOffset = 0;
    _this2._leftOffset = 0;
    _this2._rightOffset = 0;
    _this2.tiles = [];
    _this2.vertices = [];
    _this2._verticesDirty = true;
    _this2._layerName = '';
    _this2._layerSize = void 0;
    _this2._minGID = void 0;
    _this2._maxGID = void 0;
    _this2._layerOrientation = null;
    _this2._opacity = void 0;
    _this2._tintColor = void 0;
    _this2.texGrids = null;
    _this2._textures = [];
    _this2._tilesets = [];
    _this2._leftDownToCenterX = 0;
    _this2._leftDownToCenterY = 0;
    _this2._hasTiledNodeGrid = false;
    _this2._hasAniGrid = false;
    _this2._animations = null;
    _this2._enableCulling = void 0;
    _this2.colorChanged = false;
    _this2._properties = void 0;
    _this2.renderOrder = void 0;
    _this2._staggerAxis = void 0;
    _this2._staggerIndex = void 0;
    _this2._hexSideLength = void 0;
    _this2._mapTileSize = void 0;
    _this2._odd_even = void 0;
    _this2._diffX1 = void 0;
    _this2._diffY1 = void 0;
    _this2._useAutomaticVertexZ = void 0;
    _this2._vertexZvalue = void 0;
    _this2._offset = void 0;
    _this2._tiledDataArray = [];
    _this2._cameraNode = void 0;
    _this2._drawInfoList = [];
    _this2._tiledDataArrayIdx = 0;
    return _this2;
  }
  _inheritsLoose(TiledLayer, _UIRenderer);
  var _proto = TiledLayer.prototype;
  _proto.requestDrawInfo = function requestDrawInfo(idx) {
    if (!this._drawInfoList[idx]) {
      this._drawInfoList[idx] = new RenderDrawInfo();
      this._drawInfoList[idx].setDrawInfoType(RenderDrawInfoType.MIDDLEWARE);
    }
    return this._drawInfoList[idx];
  };
  _proto.hasTiledNode = function hasTiledNode() {
    return this._hasTiledNodeGrid;
  };
  _proto.hasAnimation = function hasAnimation() {
    return this._hasAniGrid;
  };
  _proto.addUserNode = function addUserNode(node) {
    var dataComp = node.getComponent(TiledUserNodeData);
    if (dataComp) {
      warnID(7242);
      return false;
    }
    dataComp = node.addComponent(TiledUserNodeData);
    node.parent = this.node;
    this._userNodeMap[node.uuid] = dataComp;
    dataComp._row = -1;
    dataComp._col = -1;
    dataComp._tiledLayer = this;
    this._nodeLocalPosToLayerPos(node.getPosition(), _vec2_temp);
    this._positionToRowCol(_vec2_temp.x, _vec2_temp.y, _tempRowCol);
    this._addUserNodeToGrid(dataComp, _tempRowCol);
    this._updateCullingOffsetByUserNode(node);
    node.on(NodeEventType.TRANSFORM_CHANGED, this._userNodePosChange, dataComp);
    node.on(NodeEventType.SIZE_CHANGED, this._userNodeSizeChange, dataComp);
    return true;
  };
  _proto.removeUserNode = function removeUserNode(node) {
    var dataComp = node.getComponent(TiledUserNodeData);
    if (!dataComp) {
      warnID(7243);
      return false;
    }
    node.off(NodeEventType.TRANSFORM_CHANGED, this._userNodePosChange, dataComp);
    node.off(NodeEventType.SIZE_CHANGED, this._userNodeSizeChange, dataComp);
    this._removeUserNodeFromGrid(dataComp);
    delete this._userNodeMap[node.uuid];
    node._removeComponent(dataComp);
    dataComp.destroy();
    node.removeFromParent();
    return true;
  };
  _proto.destroyUserNode = function destroyUserNode(node) {
    this.removeUserNode(node);
    node.destroy();
  };
  _proto._nodeLocalPosToLayerPos = function _nodeLocalPosToLayerPos(nodePos, out) {
    out.x = nodePos.x + this._leftDownToCenterX;
    out.y = nodePos.y + this._leftDownToCenterY;
  };
  _proto.getNodesByRowCol = function getNodesByRowCol(row, col) {
    var rowData = this._userNodeGrid[row];
    if (!rowData) return null;
    return rowData[col];
  };
  _proto.getNodesCountByRow = function getNodesCountByRow(row) {
    var rowData = this._userNodeGrid[row];
    if (!rowData) return 0;
    return rowData.count;
  };
  _proto._updateAllUserNode = function _updateAllUserNode() {
    this._userNodeGrid = {};
    for (var dataId in this._userNodeMap) {
      var dataComp = this._userNodeMap[dataId];
      this._nodeLocalPosToLayerPos(dataComp.node.getPosition(), _vec2_temp);
      this._positionToRowCol(_vec2_temp.x, _vec2_temp.y, _tempRowCol);
      this._addUserNodeToGrid(dataComp, _tempRowCol);
      this._updateCullingOffsetByUserNode(dataComp.node);
    }
  };
  _proto._updateCullingOffsetByUserNode = function _updateCullingOffsetByUserNode(node_) {
    var node = node_._getUITransformComp().contentSize;
    if (this._topOffset < node.height) {
      this._topOffset = node.height;
    }
    if (this._downOffset < node.height) {
      this._downOffset = node.height;
    }
    if (this._leftOffset < node.width) {
      this._leftOffset = node.width;
    }
    if (this._rightOffset < node.width) {
      this._rightOffset = node.width;
    }
  };
  _proto._userNodeSizeChange = function _userNodeSizeChange() {
    var dataComp = this;
    var node = dataComp.node;
    var self = dataComp._tiledLayer;
    self._updateCullingOffsetByUserNode(node);
    self._userNodeDirty = true;
    self._markForUpdateRenderData();
  };
  _proto._userNodePosChange = function _userNodePosChange() {
    var dataComp = this;
    var node = dataComp.node;
    var self = dataComp._tiledLayer;
    self._nodeLocalPosToLayerPos(node.getPosition(), _vec2_temp);
    self._positionToRowCol(_vec2_temp.x, _vec2_temp.y, _tempRowCol);
    self._limitInLayer(_tempRowCol);
    if (_tempRowCol.row === dataComp._row && _tempRowCol.col === dataComp._col) return;
    self._removeUserNodeFromGrid(dataComp);
    self._addUserNodeToGrid(dataComp, _tempRowCol);
  };
  _proto._removeUserNodeFromGrid = function _removeUserNodeFromGrid(dataComp) {
    var row = dataComp._row;
    var col = dataComp._col;
    var index = dataComp._index;
    var rowData = this._userNodeGrid[row];
    var colData = rowData && rowData[col];
    if (colData) {
      rowData.count--;
      colData.count--;
      colData.list[index] = null;
      if (colData.count <= 0) {
        colData.list.length = 0;
        colData.count = 0;
      }
    }
    dataComp._row = -1;
    dataComp._col = -1;
    dataComp._index = -1;
    this._userNodeDirty = true;
    this._markForUpdateRenderData();
  };
  _proto._limitInLayer = function _limitInLayer(rowCol) {
    var row = rowCol.row;
    var col = rowCol.col;
    if (row < 0) rowCol.row = 0;
    if (row > this._rightTop.row) rowCol.row = this._rightTop.row;
    if (col < 0) rowCol.col = 0;
    if (col > this._rightTop.col) rowCol.col = this._rightTop.col;
  };
  _proto._addUserNodeToGrid = function _addUserNodeToGrid(dataComp, tempRowCol) {
    var row = tempRowCol.row;
    var col = tempRowCol.col;
    var rowData = this._userNodeGrid[row] = this._userNodeGrid[row] || {
      count: 0
    };
    var colData = rowData[col] = rowData[col] || {
      count: 0,
      list: []
    };
    dataComp._row = row;
    dataComp._col = col;
    dataComp._index = colData.list.length;
    rowData.count++;
    colData.count++;
    colData.list.push(dataComp);
    this._userNodeDirty = true;
    this._markForUpdateRenderData();
  };
  _proto.isUserNodeDirty = function isUserNodeDirty() {
    return this._userNodeDirty;
  };
  _proto.setUserNodeDirty = function setUserNodeDirty(value) {
    this._userNodeDirty = value;
  };
  _proto._reinstallCamera = function _reinstallCamera() {
    var camera = director.root.batcher2D.getFirstRenderCamera(this.node);
    var cameraNode = camera == null ? void 0 : camera.node;
    if (this._cameraNode !== cameraNode) {
      this._uninstallCamera();
      if (cameraNode) {
        cameraNode.on(NodeEventType.TRANSFORM_CHANGED, this.updateCulling, this);
        cameraNode.on(NodeEventType.SIZE_CHANGED, this.updateCulling, this);
        this._cameraNode = cameraNode;
      }
    }
    return camera;
  };
  _proto._uninstallCamera = function _uninstallCamera() {
    if (this._cameraNode) {
      this._cameraNode.off(NodeEventType.TRANSFORM_CHANGED, this.updateCulling, this);
      this._cameraNode.off(NodeEventType.SIZE_CHANGED, this.updateCulling, this);
      delete this._cameraNode;
    }
  };
  _proto.onEnable = function onEnable() {
    _UIRenderer.prototype.onEnable.call(this);
    this.node.on(NodeEventType.ANCHOR_CHANGED, this._syncAnchorPoint, this);
    this.node.on(NodeEventType.TRANSFORM_CHANGED, this.updateCulling, this);
    this.node.on(NodeEventType.SIZE_CHANGED, this.updateCulling, this);
    this.node.parent.on(NodeEventType.TRANSFORM_CHANGED, this.updateCulling, this);
    this.node.parent.on(NodeEventType.SIZE_CHANGED, this.updateCulling, this);
    View.instance.on('canvas-resize', this._resize, this);
    screenAdapter.on('window-resize', this._resize, this);
    this._markForUpdateRenderData();
    this.scheduleOnce(this.updateCulling.bind(this));
  };
  _proto.onDisable = function onDisable() {
    var _this$node$parent, _this$node$parent2;
    _UIRenderer.prototype.onDisable.call(this);
    (_this$node$parent = this.node.parent) == null ? void 0 : _this$node$parent.off(NodeEventType.SIZE_CHANGED, this.updateCulling, this);
    (_this$node$parent2 = this.node.parent) == null ? void 0 : _this$node$parent2.off(NodeEventType.TRANSFORM_CHANGED, this.updateCulling, this);
    this.node.off(NodeEventType.SIZE_CHANGED, this.updateCulling, this);
    this.node.off(NodeEventType.TRANSFORM_CHANGED, this.updateCulling, this);
    this.node.off(NodeEventType.ANCHOR_CHANGED, this._syncAnchorPoint, this);
    View.instance.off('canvas-resize', this._resize, this);
    screenAdapter.off('window-resize', this._resize, this);
    this._uninstallCamera();
  };
  _proto._syncAnchorPoint = function _syncAnchorPoint() {
    var node = this.node;
    var trans = node._getUITransformComp();
    var scale = node.getScale();
    this._leftDownToCenterX = trans.width * trans.anchorX * scale.x;
    this._leftDownToCenterY = trans.height * trans.anchorY * scale.y;
    this._cullingDirty = true;
    this._markForUpdateRenderData();
  };
  _proto._resize = function _resize() {
    this._markForUpdateRenderData();
  };
  _proto.getLayerName = function getLayerName() {
    return this._layerName;
  };
  _proto.setLayerName = function setLayerName(layerName) {
    this._layerName = layerName;
  };
  _proto.getProperty = function getProperty(propertyName) {
    return this._properties[propertyName];
  };
  _proto.getPositionAt = function getPositionAt(pos, y) {
    var x;
    if (y !== undefined) {
      x = Math.floor(pos);
      y = Math.floor(y);
    } else {
      x = Math.floor(pos.x);
      y = Math.floor(pos.y);
    }
    switch (this._layerOrientation) {
      case Orientation.ORTHO:
        return this._positionForOrthoAt(x, y);
      case Orientation.ISO:
        return this._positionForIsoAt(x, y);
      case Orientation.HEX:
        return this._positionForHexAt(x, y);
    }
    return null;
  };
  _proto.isInvalidPosition = function isInvalidPosition(x, y) {
    return x >= this._layerSize.width || y >= this._layerSize.height || x < 0 || y < 0;
  };
  _proto._positionForIsoAt = function _positionForIsoAt(x, y) {
    var offsetX = 0;
    var offsetY = 0;
    var index = Math.floor(x) + Math.floor(y) * this._layerSize.width;
    var gidAndFlags = this.tiles[index];
    if (gidAndFlags) {
      var gid = (gidAndFlags & TileFlag.FLIPPED_MASK) >>> 0;
      var tileset = this.texGrids.get(gid).tileset;
      var offset = tileset.tileOffset;
      offsetX = offset.x;
      offsetY = offset.y;
    }
    return new Vec2(this._mapTileSize.width * 0.5 * (this._layerSize.height + x - y - 1) + offsetX, this._mapTileSize.height * 0.5 * (this._layerSize.width - x + this._layerSize.height - y - 2) - offsetY);
  };
  _proto._positionForOrthoAt = function _positionForOrthoAt(x, y) {
    var offsetX = 0;
    var offsetY = 0;
    var index = Math.floor(x) + Math.floor(y) * this._layerSize.width;
    var gidAndFlags = this.tiles[index];
    if (gidAndFlags) {
      var gid = (gidAndFlags & TileFlag.FLIPPED_MASK) >>> 0;
      var tileset = this.texGrids.get(gid).tileset;
      var offset = tileset.tileOffset;
      offsetX = offset.x;
      offsetY = offset.y;
    }
    return new Vec2(x * this._mapTileSize.width + offsetX, (this._layerSize.height - y - 1) * this._mapTileSize.height - offsetY);
  };
  _proto._positionForHexAt = function _positionForHexAt(col, row) {
    var tileWidth = this._mapTileSize.width;
    var tileHeight = this._mapTileSize.height;
    var rows = this._layerSize.height;
    var index = Math.floor(col) + Math.floor(row) * this._layerSize.width;
    var gid = (this.tiles[index] & TileFlag.FLIPPED_MASK) >>> 0;
    var offset;
    if (this.texGrids.get(gid)) {
      offset = this.texGrids.get(gid).tileset.tileOffset;
    } else {
      offset = {
        x: 0,
        y: 0
      };
    }
    var odd_even = this._staggerIndex === StaggerIndex.STAGGERINDEX_ODD ? 1 : -1;
    var x = 0;
    var y = 0;
    var diffX = 0;
    var diffY = 0;
    switch (this._staggerAxis) {
      case StaggerAxis.STAGGERAXIS_Y:
        diffX = 0;
        if (row % 2 === 1) {
          diffX = tileWidth / 2 * odd_even;
        }
        x = col * tileWidth + diffX + offset.x;
        y = (rows - row - 1) * (tileHeight - (tileHeight - this._hexSideLength) / 2) - offset.y;
        break;
      case StaggerAxis.STAGGERAXIS_X:
        diffY = 0;
        if (col % 2 === 1) {
          diffY = tileHeight / 2 * -odd_even;
        }
        x = col * (tileWidth - (tileWidth - this._hexSideLength) / 2) + offset.x;
        y = (rows - row - 1) * tileHeight + diffY - offset.y;
        break;
    }
    return new Vec2(x, y);
  };
  _proto.setTilesGIDAt = function setTilesGIDAt(gids, beginCol, beginRow, totalCols) {
    if (!gids || gids.length === 0 || totalCols <= 0) return;
    if (beginRow < 0) beginRow = 0;
    if (beginCol < 0) beginCol = 0;
    var gidsIdx = 0;
    var endCol = beginCol + totalCols;
    for (var row = beginRow;; row++) {
      for (var col = beginCol; col < endCol; col++) {
        if (gidsIdx >= gids.length) return;
        this._updateTileForGID(gids[gidsIdx], col, row);
        gidsIdx++;
      }
    }
  };
  _proto.setTileGIDAt = function setTileGIDAt(gid, x, y, flags) {
    var ugid = (gid & TileFlag.FLIPPED_MASK) >>> 0;
    x = Math.floor(x);
    y = Math.floor(y);
    if (this.isInvalidPosition(x, y)) {
      throw new Error('cc.TiledLayer.setTileGIDAt(): invalid position');
    }
    if (!this.tiles || !this._tilesets || this._tilesets.length === 0) {
      logID(7238);
      return;
    }
    if (ugid !== 0 && ugid < this._tilesets[0].firstGid) {
      logID(7239, gid);
      return;
    }
    flags = flags || 0;
    this._updateTileForGID((ugid | flags) >>> 0, x, y);
  };
  _proto._updateTileForGID = function _updateTileForGID(gidAndFlags, x, y) {
    var idx = 0 | x + y * this._layerSize.width;
    if (idx >= this.tiles.length) return;
    var oldGIDAndFlags = this.tiles[idx];
    if (gidAndFlags === oldGIDAndFlags) return;
    var gid = (gidAndFlags & TileFlag.FLIPPED_MASK) >>> 0;
    var grid = this.texGrids.get(gid);
    if (grid) {
      this.tiles[idx] = gidAndFlags;
      this._updateVertex(x, y);
    } else {
      this.tiles[idx] = 0;
    }
    this._cullingDirty = true;
  };
  _proto.getTileGIDAt = function getTileGIDAt(x, y) {
    if (this.isInvalidPosition(x, y)) {
      throw new Error('cc.TiledLayer.getTileGIDAt(): invalid position');
    }
    if (!this.tiles) {
      logID(7237);
      return null;
    }
    var index = Math.floor(x) + Math.floor(y) * this._layerSize.width;
    var tile = this.tiles[index];
    return (tile & TileFlag.FLIPPED_MASK) >>> 0;
  };
  _proto.getTileFlagsAt = function getTileFlagsAt(x, y) {
    if (this.isInvalidPosition(x, y)) {
      throw new Error('TiledLayer.getTileFlagsAt: invalid position');
    }
    if (!this.tiles) {
      logID(7240);
      return null;
    }
    var idx = Math.floor(x) + Math.floor(y) * this._layerSize.width;
    var tile = this.tiles[idx];
    return (tile & TileFlag.FLIPPED_ALL) >>> 0;
  };
  _proto.setCullingDirty = function setCullingDirty(value) {
    this._cullingDirty = value;
  };
  _proto.isCullingDirty = function isCullingDirty() {
    return this._cullingDirty;
  };
  _proto.updateViewPort = function updateViewPort(x, y, width, height) {
    if (this._viewPort.width === width && this._viewPort.height === height && this._viewPort.x === x && this._viewPort.y === y) {
      return;
    }
    this._viewPort.x = x;
    this._viewPort.y = y;
    this._viewPort.width = width;
    this._viewPort.height = height;
    var reserveLine = 1;
    if (this._layerOrientation === Orientation.ISO) {
      reserveLine = 2;
    }
    var vpx = this._viewPort.x - this._offset.x + this._leftDownToCenterX;
    var vpy = this._viewPort.y - this._offset.y + this._leftDownToCenterY;
    var leftDownX = vpx - this._leftOffset;
    var leftDownY = vpy - this._downOffset;
    var rightTopX = vpx + width + this._rightOffset;
    var rightTopY = vpy + height + this._topOffset;
    var leftDown = this._cullingRect.leftDown;
    var rightTop = this._cullingRect.rightTop;
    if (leftDownX < 0) leftDownX = 0;
    if (leftDownY < 0) leftDownY = 0;
    this._positionToRowCol(leftDownX, leftDownY, _tempRowCol);
    _tempRowCol.row -= reserveLine;
    _tempRowCol.col -= reserveLine;
    _tempRowCol.row = _tempRowCol.row > 0 ? _tempRowCol.row : 0;
    _tempRowCol.col = _tempRowCol.col > 0 ? _tempRowCol.col : 0;
    if (_tempRowCol.row !== leftDown.row || _tempRowCol.col !== leftDown.col) {
      leftDown.row = _tempRowCol.row;
      leftDown.col = _tempRowCol.col;
      this._cullingDirty = true;
    }
    if (rightTopX < 0 || rightTopY < 0) {
      _tempRowCol.row = -1;
      _tempRowCol.col = -1;
    } else {
      this._positionToRowCol(rightTopX, rightTopY, _tempRowCol);
      _tempRowCol.row++;
      _tempRowCol.col++;
    }
    if (_tempRowCol.row !== rightTop.row || _tempRowCol.col !== rightTop.col) {
      rightTop.row = _tempRowCol.row;
      rightTop.col = _tempRowCol.col;
      this._cullingDirty = true;
    }
    if (this._cullingDirty) this._markForUpdateRenderData();
  };
  _proto._positionToRowCol = function _positionToRowCol(x, y, result) {
    var maptw = this._mapTileSize.width;
    var mapth = this._mapTileSize.height;
    var maptw2 = maptw * 0.5;
    var mapth2 = mapth * 0.5;
    var row = 0;
    var col = 0;
    var diffX2 = 0;
    var diffY2 = 0;
    var axis = this._staggerAxis;
    switch (this._layerOrientation) {
      case Orientation.ORTHO:
        col = Math.floor(x / maptw);
        row = Math.floor(y / mapth);
        break;
      case Orientation.ISO:
        col = Math.floor(x / maptw2);
        row = Math.floor(y / mapth2);
        break;
      case Orientation.HEX:
        if (axis === StaggerAxis.STAGGERAXIS_Y) {
          row = Math.floor(y / (mapth - this._diffY1));
          diffX2 = row % 2 === 1 ? maptw2 * this._odd_even : 0;
          col = Math.floor((x - diffX2) / maptw);
        } else {
          col = Math.floor(x / (maptw - this._diffX1));
          diffY2 = col % 2 === 1 ? mapth2 * -this._odd_even : 0;
          row = Math.floor((y - diffY2) / mapth);
        }
        break;
    }
    result.row = row;
    result.col = col;
    return result;
  };
  _proto.updateCulling = function updateCulling() {
    if (this._enableCulling) {
      this.node.updateWorldTransform();
      Mat4.invert(_mat4_temp$1, this.node.getWorldMatrix());
      var camera = this._reinstallCamera();
      if (camera) {
        _vec3_temp.x = 0;
        _vec3_temp.y = 0;
        _vec3_temp.z = 0;
        _vec3_temp2.x = camera.width;
        _vec3_temp2.y = camera.height;
        _vec3_temp2.z = 0;
        camera.screenToWorld(_vec3_temp, _vec3_temp);
        camera.screenToWorld(_vec3_temp2, _vec3_temp2);
        Vec3.transformMat4(_vec3_temp, _vec3_temp, _mat4_temp$1);
        Vec3.transformMat4(_vec3_temp2, _vec3_temp2, _mat4_temp$1);
        this.updateViewPort(_vec3_temp.x, _vec3_temp.y, _vec3_temp2.x - _vec3_temp.x, _vec3_temp2.y - _vec3_temp.y);
      }
    }
  };
  _proto.getLayerOrientation = function getLayerOrientation() {
    return this._layerOrientation;
  };
  _proto.getProperties = function getProperties() {
    return this._properties;
  };
  _proto._updateVertex = function _updateVertex(col, row) {
    var FLIPPED_MASK = TileFlag.FLIPPED_MASK;
    var vertices = this.vertices;
    var layerOrientation = this._layerOrientation;
    var tiles = this.tiles;
    if (!tiles) {
      return;
    }
    var rightTop = this._rightTop;
    var maptw = this._mapTileSize.width;
    var mapth = this._mapTileSize.height;
    var maptw2 = maptw * 0.5;
    var mapth2 = mapth * 0.5;
    var rows = this._layerSize.height;
    var cols = this._layerSize.width;
    var grids = this.texGrids;
    var left = 0;
    var bottom = 0;
    var axis;
    var diffX1;
    var diffY1;
    var odd_even;
    var diffX2;
    var diffY2;
    if (layerOrientation === Orientation.HEX) {
      axis = this._staggerAxis;
      diffX1 = this._diffX1;
      diffY1 = this._diffY1;
      odd_even = this._odd_even;
    }
    var cullingCol = 0;
    var cullingRow = 0;
    var gridGID = 0;
    var topBorder = 0;
    var downBorder = 0;
    var leftBorder = 0;
    var rightBorder = 0;
    var index = row * cols + col;
    var gid = tiles[index];
    gridGID = (gid & FLIPPED_MASK) >>> 0;
    var grid = grids.get(gridGID);
    if (!grid) {
      return;
    }
    if (this._animations.get(gridGID)) {
      this._hasAniGrid = this._hasAniGrid || true;
    }
    switch (layerOrientation) {
      case Orientation.ORTHO:
        cullingCol = col;
        cullingRow = rows - row - 1;
        left = cullingCol * maptw;
        bottom = cullingRow * mapth;
        break;
      case Orientation.ISO:
        cullingCol = rows + col - row - 1;
        cullingRow = rows + cols - col - row - 2;
        left = maptw2 * cullingCol;
        bottom = mapth2 * cullingRow;
        break;
      case Orientation.HEX:
        diffX2 = axis === StaggerAxis.STAGGERAXIS_Y && row % 2 === 1 ? maptw2 * odd_even : 0;
        diffY2 = axis === StaggerAxis.STAGGERAXIS_X && col % 2 === 1 ? mapth2 * -odd_even : 0;
        left = col * (maptw - diffX1) + diffX2;
        bottom = (rows - row - 1) * (mapth - diffY1) + diffY2;
        cullingCol = col;
        cullingRow = rows - row - 1;
        break;
    }
    var rowData = vertices[cullingRow] = vertices[cullingRow] || {
      minCol: 0,
      maxCol: 0
    };
    var colData = rowData[cullingCol] = rowData[cullingCol] || {
      left: 0,
      bottom: 0,
      index: 0
    };
    if (rowData.minCol > cullingCol) {
      rowData.minCol = cullingCol;
    }
    if (rowData.maxCol < cullingCol) {
      rowData.maxCol = cullingCol;
    }
    if (rightTop.row < cullingRow) {
      rightTop.row = cullingRow;
      if (layerOrientation === Orientation.ISO) {
        rightTop.row += 1;
      }
    }
    if (rightTop.col < cullingCol) {
      rightTop.col = cullingCol;
      if (layerOrientation === Orientation.ISO) {
        rightTop.col += 1;
      }
    }
    var tileOffset = grid.tileset.tileOffset;
    left += this._offset.x + tileOffset.x + grid.offsetX;
    bottom += this._offset.y - tileOffset.y - grid.offsetY;
    topBorder = -tileOffset.y + grid.tileset._tileSize.height - mapth;
    topBorder = topBorder < 0 ? 0 : topBorder;
    downBorder = tileOffset.y < 0 ? 0 : tileOffset.y;
    leftBorder = -tileOffset.x < 0 ? 0 : -tileOffset.x;
    rightBorder = tileOffset.x + grid.tileset._tileSize.width - maptw;
    rightBorder = rightBorder < 0 ? 0 : rightBorder;
    if (this._rightOffset < leftBorder) {
      this._rightOffset = leftBorder;
    }
    if (this._leftOffset < rightBorder) {
      this._leftOffset = rightBorder;
    }
    if (this._topOffset < downBorder) {
      this._topOffset = downBorder;
    }
    if (this._downOffset < topBorder) {
      this._downOffset = topBorder;
    }
    colData.left = left;
    colData.bottom = bottom;
    colData.index = index;
    this._cullingDirty = true;
  };
  _proto._updateVertices = function _updateVertices() {
    var vertices = this.vertices;
    vertices.length = 0;
    var tiles = this.tiles;
    if (!tiles) {
      return;
    }
    var rightTop = this._rightTop;
    rightTop.row = -1;
    rightTop.col = -1;
    var rows = this._layerSize.height;
    var cols = this._layerSize.width;
    this._topOffset = 0;
    this._downOffset = 0;
    this._leftOffset = 0;
    this._rightOffset = 0;
    this._hasAniGrid = false;
    for (var row = 0; row < rows; ++row) {
      for (var col = 0; col < cols; ++col) {
        this._updateVertex(col, row);
      }
    }
    this._verticesDirty = false;
  };
  _proto.getTiledTileAt = function getTiledTileAt(x, y, forceCreate) {
    if (this.isInvalidPosition(x, y)) {
      throw new Error('TiledLayer.getTiledTileAt: invalid position');
    }
    if (!this.tiles) {
      logID(7236);
      return null;
    }
    var index = Math.floor(x) + Math.floor(y) * this._layerSize.width;
    var tile = this.tiledTiles[index];
    if (!tile && forceCreate) {
      var node = new Node();
      tile = node.addComponent(TiledTile);
      tile._x = x;
      tile._y = y;
      tile._layer = this;
      tile.updateInfo();
      node.parent = this.node;
      return tile;
    }
    return tile;
  };
  _proto.setTiledTileAt = function setTiledTileAt(x, y, tiledTile) {
    if (this.isInvalidPosition(x, y)) {
      throw new Error('TiledLayer.setTiledTileAt: invalid position');
    }
    if (!this.tiles) {
      logID(7236);
      return null;
    }
    var index = Math.floor(x) + Math.floor(y) * this._layerSize.width;
    this.tiledTiles[index] = tiledTile;
    this._cullingDirty = true;
    if (tiledTile) {
      this._hasTiledNodeGrid = true;
    } else {
      this._hasTiledNodeGrid = this.tiledTiles.some(function (tiledNode) {
        return !!tiledNode;
      });
    }
    return tiledTile;
  };
  _proto.getTexture = function getTexture(index) {
    index = index || 0;
    if (this._textures && index >= 0 && this._textures.length > index) {
      return this._textures[index];
    }
    return null;
  };
  _proto.getTextures = function getTextures() {
    return this._textures;
  };
  _proto.setTexture = function setTexture(texture) {
    this.setTextures([texture]);
  };
  _proto.setTextures = function setTextures(textures) {
    this._textures = textures;
    this._markForUpdateRenderData();
  };
  _proto.getLayerSize = function getLayerSize() {
    return this._layerSize;
  };
  _proto.getMapTileSize = function getMapTileSize() {
    return this._mapTileSize;
  };
  _proto.getTileSet = function getTileSet(index) {
    index = index || 0;
    if (this._tilesets && index >= 0 && this._tilesets.length > index) {
      return this._tilesets[index];
    }
    return null;
  };
  _proto.getTileSets = function getTileSets() {
    return this._tilesets;
  };
  _proto.setTileSet = function setTileSet(tileset) {
    this.setTileSets([tileset]);
  };
  _proto.setTileSets = function setTileSets(tilesets) {
    this._tilesets = tilesets;
    var textures = this._textures = [];
    var texGrids = this.texGrids;
    texGrids.clear();
    for (var i = 0; i < tilesets.length; i++) {
      var tileset = tilesets[i];
      if (tileset) {
        textures[i] = tileset.sourceImage;
      }
    }
    for (var _i = 0, l = tilesets.length; _i < l; ++_i) {
      var tilesetInfo = tilesets[_i];
      if (!tilesetInfo) continue;
      fillTextureGrids(tilesetInfo, texGrids, tilesetInfo.sourceImage);
    }
    this._prepareToRender();
  };
  _proto.init = function init(layerInfo, mapInfo, tilesets, textures, texGrids) {
    var self = this;
    self._cullingDirty = true;
    self._layerInfo = layerInfo;
    self._mapInfo = mapInfo;
    var size = layerInfo.layerSize;
    self._layerName = layerInfo.name;
    self.tiles = layerInfo.tiles;
    self._properties = layerInfo.properties;
    self._layerSize = size;
    self._minGID = layerInfo.minGID;
    self._maxGID = layerInfo.maxGID;
    self._opacity = layerInfo.opacity;
    if (layerInfo.tintColor) {
      self._tintColor = layerInfo.tintColor;
    }
    self.renderOrder = mapInfo.renderOrder;
    self._staggerAxis = mapInfo.getStaggerAxis();
    self._staggerIndex = mapInfo.getStaggerIndex();
    self._hexSideLength = mapInfo.getHexSideLength();
    self._animations = mapInfo.getTileAnimations();
    self._tilesets = tilesets;
    self._textures = textures;
    self.texGrids = texGrids;
    self._layerOrientation = mapInfo.orientation;
    self._mapTileSize = mapInfo.getTileSize();
    var maptw = self._mapTileSize.width;
    var mapth = self._mapTileSize.height;
    var layerW = self._layerSize.width;
    var layerH = self._layerSize.height;
    var uiTransformComp = self.node._getUITransformComp();
    if (self._layerOrientation === Orientation.HEX) {
      var width = 0;
      var height = 0;
      var tileWidth = maptw & -2;
      var tileHeight = mapth & -2;
      self._odd_even = self._staggerIndex === StaggerIndex.STAGGERINDEX_ODD ? 1 : -1;
      if (self._staggerAxis === StaggerAxis.STAGGERAXIS_X) {
        self._diffX1 = (tileWidth - self._hexSideLength) / 2;
        self._diffY1 = 0;
        width = (self._diffX1 + self._hexSideLength) * layerW + self._diffX1;
        height = tileHeight * layerH + tileHeight / 2;
      } else {
        self._diffX1 = 0;
        self._diffY1 = (tileHeight - self._hexSideLength) / 2;
        width = tileWidth * layerW + tileWidth / 2;
        height = (self._diffY1 + self._hexSideLength) * layerH + self._diffY1;
      }
      uiTransformComp.setContentSize(width, height);
    } else if (self._layerOrientation === Orientation.ISO) {
      var wh = layerW + layerH;
      uiTransformComp.setContentSize(maptw * 0.5 * wh, mapth * 0.5 * wh);
    } else {
      uiTransformComp.setContentSize(layerW * maptw, layerH * mapth);
    }
    self._offset = new Vec2(layerInfo.offset.x, -layerInfo.offset.y);
    self._useAutomaticVertexZ = false;
    self._vertexZvalue = 0;
    self._syncAnchorPoint();
    self._prepareToRender();
  };
  _proto._prepareToRender = function _prepareToRender() {
    this._updateVertices();
    this._updateAllUserNode();
  };
  _proto.requestTiledRenderData = function requestTiledRenderData() {
    var arr = this._tiledDataArray;
    while (arr.length > 0 && arr[arr.length - 1].subNodes && arr[arr.length - 1].subNodes.length === 0) {
      arr.pop();
    }
    if (arr.length > 0) {
      var last = arr[arr.length - 1];
      if (last.renderData && last.renderData.vertexCount === 0) {
        return last;
      }
    }
    var comb = {
      renderData: null,
      texture: null
    };
    this._tiledDataArray.push(comb);
    return comb;
  };
  _proto.requestSubNodesData = function requestSubNodesData() {
    var arr = this._tiledDataArray;
    if (arr.length > 0) {
      var last = arr[arr.length - 1];
      if (isTiledSubNodeData(last) && last.subNodes.length === 0) {
        return last;
      }
    }
    var renderData = [];
    var comb = {
      subNodes: renderData
    };
    this._tiledDataArray.push(comb);
    return comb;
  };
  _proto.destroyRenderData = function destroyRenderData() {
    this._tiledDataArray.forEach(function (rd) {
      var renderData = rd.renderData;
      if (renderData) RenderData.remove(renderData);
    });
    this._tiledDataArray.length = 0;
    _UIRenderer.prototype.destroyRenderData.call(this);
  };
  _proto._flushAssembler = function _flushAssembler() {
    var assembler = TiledLayer.Assembler.getAssembler(this);
    if (this._assembler !== assembler) {
      this._assembler = assembler;
      this._assembler.createData(this);
    }
    if (this._tiledDataArray.length === 0) {
      this._markForUpdateRenderData();
      this._updateColor();
    }
  };
  _proto._render = function _render(ui) {
    for (var i = 0; i < this._tiledDataArray.length; i++) {
      this._tiledDataArrayIdx = i;
      var m = this._tiledDataArray[i];
      if (m.subNodes) {
        m.subNodes.forEach(function (c) {
          if (c) ui.walk(c.node);
        });
      } else {
        var td = m;
        if (td.texture) {
          ui.commitComp(this, td.renderData, td.texture, this._assembler, null);
        }
      }
    }
    this.node._static = true;
  };
  _proto.createRenderEntity = function createRenderEntity() {
    return new RenderEntity(RenderEntityType.CROSSED);
  };
  _proto.fillIndicesBuffer = function fillIndicesBuffer(renderData, drawInfo) {
    var iBuf = renderData.chunk.meshBuffer.iData;
    var vertexId = renderData.chunk.vertexOffset;
    var quadCount = renderData.vertexCount / 4;
    var indexOffset = vertexId / 4 * 6;
    drawInfo.setIndexOffset(indexOffset);
    for (var i = 0; i < quadCount; i += 1) {
      iBuf[indexOffset] = vertexId;
      iBuf[indexOffset + 1] = vertexId + 1;
      iBuf[indexOffset + 2] = vertexId + 2;
      iBuf[indexOffset + 3] = vertexId + 2;
      iBuf[indexOffset + 4] = vertexId + 1;
      iBuf[indexOffset + 5] = vertexId + 3;
      indexOffset += 6;
      vertexId += 4;
    }
    renderData.chunk.meshBuffer.indexOffset = indexOffset;
    drawInfo.setIBCount(quadCount * 6);
  };
  _proto.prepareDrawData = function prepareDrawData() {
    var _this3 = this;
    this._drawInfoList.length = 0;
    var entity = this.renderEntity;
    entity.clearDynamicRenderDrawInfos();
    var tiledDataArray = this._tiledDataArray;
    var idx = 0;
    tiledDataArray.forEach(function (m) {
      if (isTiledSubNodeData(m)) {
        m.subNodes.forEach(function (c) {
          if (c) {
            if (!_this3._drawInfoList[idx]) {
              _this3._drawInfoList[idx] = new RenderDrawInfo();
            }
            var drawInfo = _this3._drawInfoList[idx];
            drawInfo.setDrawInfoType(RenderDrawInfoType.SUB_NODE);
            drawInfo.setSubNode(c.node);
            entity.setDynamicRenderDrawInfo(drawInfo, idx);
            idx++;
          }
        });
      } else {
        var td = m;
        if (td.texture && td.renderData) {
          if (!_this3._drawInfoList[idx]) {
            _this3._drawInfoList[idx] = new RenderDrawInfo();
          }
          var drawInfo = _this3._drawInfoList[idx];
          td.renderData.fillDrawInfoAttributes(drawInfo);
          drawInfo.setTexture(td.texture.getGFXTexture());
          drawInfo.setSampler(td.texture.getGFXSampler());
          drawInfo.setMaterial(_this3.getRenderMaterial(0));
          _this3.fillIndicesBuffer(td.renderData, drawInfo);
          entity.setDynamicRenderDrawInfo(drawInfo, idx);
          idx++;
        }
      }
    });
  };
  return _createClass(TiledLayer, [{
    key: "cullingRect",
    get: function get() {
      return this._cullingRect;
    }
  }, {
    key: "rightTop",
    get: function get() {
      return this._rightTop;
    }
  }, {
    key: "layerSize",
    get: function get() {
      return this._layerSize;
    }
  }, {
    key: "tiledDataArray",
    get: function get() {
      return this._tiledDataArray;
    }
  }, {
    key: "leftDownToCenterX",
    get: function get() {
      return this._leftDownToCenterX;
    }
  }, {
    key: "leftDownToCenterY",
    get: function get() {
      return this._leftDownToCenterY;
    }
  }, {
    key: "enableCulling",
    get: function get() {
      return this._enableCulling;
    },
    set: function set(value) {
      if (this._enableCulling !== value) {
        this._enableCulling = value;
        this._cullingDirty = true;
        this._markForUpdateRenderData();
      }
    }
  }]);
}(UIRenderer)) || _class2$3);

var _dec$2, _dec2$2, _dec3$2, _class$2, _class2$2;
var TiledObjectGroup = (_dec$2 = ccclass('cc.TiledObjectGroup'), _dec2$2 = requireComponent(UITransform), _dec3$2 = type(CCBoolean), _dec$2(_class$2 = _dec2$2(_class$2 = (_class2$2 = function (_Component) {
  function TiledObjectGroup() {
    var _this;
    _this = _Component.call(this) || this;
    _this._premultiplyAlpha = false;
    _this._groupName = void 0;
    _this._positionOffset = void 0;
    _this._mapInfo = void 0;
    _this._properties = void 0;
    _this._offset = void 0;
    _this._opacity = void 0;
    _this._tintColor = null;
    _this._animations = void 0;
    _this._hasAniObj = void 0;
    _this._texGrids = void 0;
    _this.aniObjects = void 0;
    _this._objects = [];
    return _this;
  }
  _inheritsLoose(TiledObjectGroup, _Component);
  var _proto = TiledObjectGroup.prototype;
  _proto.getPositionOffset = function getPositionOffset() {
    return this._positionOffset;
  };
  _proto.getProperties = function getProperties() {
    return this._properties;
  };
  _proto.getGroupName = function getGroupName() {
    return this._groupName;
  };
  _proto.getProperty = function getProperty(propertyName) {
    return this._properties[propertyName.toString()];
  };
  _proto.getObject = function getObject(objectName) {
    for (var i = 0, len = this._objects.length; i < len; i++) {
      var obj = this._objects[i];
      if (obj && obj.name === objectName) {
        return obj;
      }
    }
    return null;
  };
  _proto.getObjects = function getObjects() {
    return this._objects;
  };
  _proto._init = function _init(groupInfo, mapInfo, texGrids) {
    var FLIPPED_MASK = TileFlag.FLIPPED_MASK;
    var FLAG_HORIZONTAL = TileFlag.HORIZONTAL;
    var FLAG_VERTICAL = TileFlag.VERTICAL;
    this._groupName = groupInfo.name;
    this._positionOffset = groupInfo.offset;
    this._mapInfo = mapInfo;
    this._properties = groupInfo.getProperties();
    this._offset = new Vec2(groupInfo.offset.x, -groupInfo.offset.y);
    this._opacity = groupInfo.opacity;
    if (groupInfo.tintColor) {
      this._tintColor = groupInfo.tintColor;
    }
    this._texGrids = texGrids;
    this._animations = mapInfo.getTileAnimations();
    this.aniObjects = [];
    this._hasAniObj = false;
    var mapSize = mapInfo.mapSize;
    var tileSize = mapInfo.tileSize;
    var width = 0;
    var height = 0;
    var colorVal = new Color();
    var iso = Orientation.ISO === mapInfo.orientation;
    if (mapInfo.orientation === Orientation.HEX) {
      if (mapInfo.getStaggerAxis() === StaggerAxis.STAGGERAXIS_X) {
        height = tileSize.height * (mapSize.height + 0.5);
        width = (tileSize.width + mapInfo.getHexSideLength()) * Math.floor(mapSize.width / 2) + tileSize.width * (mapSize.width % 2);
      } else {
        width = tileSize.width * (mapSize.width + 0.5);
        height = (tileSize.height + mapInfo.getHexSideLength()) * Math.floor(mapSize.height / 2) + tileSize.height * (mapSize.height % 2);
      }
    } else if (iso) {
      var wh = mapSize.width + mapSize.height;
      width = tileSize.width * 0.5 * wh;
      height = tileSize.height * 0.5 * wh;
    } else {
      width = mapSize.width * tileSize.width;
      height = mapSize.height * tileSize.height;
    }
    var transComp = this.node._getUITransformComp();
    transComp.setContentSize(width, height);
    var leftTopX = width * transComp.anchorX;
    var leftTopY = height * (1 - transComp.anchorY);
    var objects = groupInfo.objects;
    var aliveNodes = {};
    for (var i = 0, l = objects.length; i < l; i++) {
      var object = objects[i];
      var objType = object.type;
      object.offset = new Vec2(object.x, object.y);
      var points = object.points || object.polylinePoints;
      if (points) {
        for (var pi = 0; pi < points.length; pi++) {
          points[pi].y *= -1;
        }
      }
      if (iso) {
        var posIdxX = object.x / tileSize.height;
        var posIdxY = object.y / tileSize.height;
        object.x = tileSize.width * 0.5 * (mapSize.height + posIdxX - posIdxY);
        object.y = tileSize.height * 0.5 * (mapSize.width + mapSize.height - posIdxX - posIdxY);
      } else {
        object.y = height - object.y;
      }
      if (objType === TMXObjectType.TEXT) {
        var textName = "text" + object.id;
        aliveNodes[textName] = true;
        var textNode = this.node.getChildByName(textName);
        if (!textNode) {
          textNode = new Node();
        }
        textNode.setRotationFromEuler(0, 0, -object.rotation);
        textNode.setPosition(object.x - leftTopX, object.y - leftTopY);
        textNode.name = textName;
        textNode.parent = this.node;
        textNode.setSiblingIndex(i);
        textNode.layer = this.node.layer;
        var label = textNode.getComponent(Label);
        if (!label) {
          label = textNode.addComponent(Label);
        }
        var textTransComp = textNode._getUITransformComp();
        textNode.active = object.visible;
        textTransComp.anchorX = 0;
        textTransComp.anchorY = 1;
        if (this._tintColor) {
          colorVal.set(this._tintColor);
          colorVal.a *= this._opacity / 255;
          label.color.set(colorVal);
        } else {
          var c = label.color;
          c.a *= this._opacity / 255;
        }
        label.overflow = Label.Overflow.SHRINK;
        label.lineHeight = object.height;
        label.string = object.text;
        label.horizontalAlign = object.halign;
        label.verticalAlign = object.valign;
        label.fontSize = object.pixelsize;
        textTransComp.setContentSize(object.width, object.height);
      } else if (objType === TMXObjectType.IMAGE) {
        var gid = object.gid;
        var gridGID = (gid & FLIPPED_MASK) >>> 0;
        var grid = texGrids.get(gridGID);
        if (!grid) continue;
        var tileset = grid.tileset;
        var imgName = "img" + object.id;
        aliveNodes[imgName] = true;
        var imgNode = this.node.getChildByName(imgName);
        object.width = object.width || grid.width;
        object.height = object.height || grid.height;
        if (imgNode && imgNode._objFlags & CCObjectFlags.HideInHierarchy) {
          imgNode.removeFromParent();
          imgNode.hideFlags |= CCObjectFlags.DontSave;
          imgNode.destroy();
          imgNode = null;
        }
        if (!imgNode) {
          imgNode = new Node();
        }
        if (this._animations.get(gridGID)) {
          this.aniObjects.push({
            object: object,
            imgNode: imgNode,
            gridGID: gridGID
          });
          this._hasAniObj = true;
        }
        var tileOffsetX = tileset.tileOffset.x;
        var tileOffsetY = tileset.tileOffset.y;
        imgNode.active = object.visible;
        imgNode.setRotationFromEuler(0, 0, -object.rotation);
        imgNode.setPosition(object.x - leftTopX, object.y - leftTopY);
        imgNode.name = imgName;
        imgNode.parent = this.node;
        imgNode.setSiblingIndex(i);
        imgNode.layer = this.node.layer;
        var sprite = imgNode.getComponent(Sprite);
        if (!sprite) {
          sprite = imgNode.addComponent(Sprite);
        }
        var imgTrans = imgNode._getUITransformComp();
        if (iso) {
          imgTrans.anchorX = 0.5 + tileOffsetX / object.width;
          imgTrans.anchorY = tileOffsetY / object.height;
        } else {
          imgTrans.anchorX = tileOffsetX / object.width;
          imgTrans.anchorY = tileOffsetY / object.height;
        }
        if (this._tintColor) {
          colorVal.set(this._tintColor);
          colorVal.a *= this._opacity / 255;
          sprite.color.set(colorVal);
        } else {
          var _c = sprite.color;
          _c.a *= this._opacity / 255;
        }
        sprite.sizeMode = Sprite.SizeMode.CUSTOM;
        var srcBlendFactor = this._premultiplyAlpha ? BlendFactor.ONE : BlendFactor.SRC_ALPHA;
        if (sprite.srcBlendFactor !== srcBlendFactor) {
          sprite.srcBlendFactor = srcBlendFactor;
          if (sprite.material) {
            sprite._updateBlendFunc();
          }
        }
        var spf = grid.spriteFrame;
        if (!spf) {
          spf = new SpriteFrame();
        } else {
          spf = spf.clone();
        }
        if ((gid & FLAG_HORIZONTAL) >>> 0) {
          spf.flipUVX = !spf.flipUVX;
        }
        if ((gid & FLAG_VERTICAL) >>> 0) {
          spf.flipUVY = !spf.flipUVY;
        }
        spf.rotated = grid._rotated;
        spf.rect = grid._rect;
        sprite.spriteFrame = spf;
        imgTrans.setContentSize(object.width, object.height);
        sprite._markForUpdateRenderData();
      }
    }
    this._objects = objects;
    var children = this.node.children;
    var uselessExp = /^(?:img|text)\d+$/;
    for (var _i = 0, n = children.length; _i < n; _i++) {
      var _c2 = children[_i];
      var cName = _c2.name;
      var isUseless = uselessExp.test(cName);
      if (isUseless && !aliveNodes[cName]) _c2.destroy();
    }
  };
  _proto.update = function update(dt) {
    if (!this._hasAniObj) {
      return;
    }
    var aniObjects = this.aniObjects;
    var _texGrids = this._texGrids;
    var iso = Orientation.ISO === this._mapInfo.orientation;
    for (var i = 0, len = aniObjects.length; i < len; i++) {
      var aniObj = aniObjects[i];
      var gridGID = aniObj.gridGID;
      var grid = _texGrids.get(gridGID);
      if (!grid) {
        continue;
      }
      var tileset = grid.tileset;
      var object = aniObj.object;
      var imgNode = aniObj.imgNode;
      var tileOffsetX = tileset.tileOffset.x;
      var tileOffsetY = tileset.tileOffset.y;
      var imgTrans = imgNode._getUITransformComp();
      if (iso) {
        imgTrans.anchorX = 0.5 + tileOffsetX / object.width;
        imgTrans.anchorY = tileOffsetY / object.height;
      } else {
        imgTrans.anchorX = tileOffsetX / object.width;
        imgTrans.anchorY = tileOffsetY / object.height;
      }
      var sp = imgNode.getComponent(Sprite);
      var spf = sp.spriteFrame;
      spf.rotated = grid._rotated;
      spf.rect = grid._rect;
      sp.spriteFrame = spf;
      sp._markForUpdateRenderData();
    }
  };
  return _createClass(TiledObjectGroup, [{
    key: "premultiplyAlpha",
    get: function get() {
      return this._premultiplyAlpha;
    },
    set: function set(value) {
      this._premultiplyAlpha = value;
    }
  }, {
    key: "offset",
    get: function get() {
      return this._offset;
    }
  }]);
}(Component), _applyDecoratedDescriptor(_class2$2.prototype, "premultiplyAlpha", [_dec3$2], Object.getOwnPropertyDescriptor(_class2$2.prototype, "premultiplyAlpha"), _class2$2.prototype), _class2$2)) || _class$2) || _class$2);

var _dec$1, _dec2$1, _dec3$1, _dec4, _dec5, _dec6, _dec7, _dec8, _class$1, _class2$1, _initializer$1, _initializer2$1, _initializer3$1, _initializer4, _initializer5, _initializer6, _initializer7, _initializer8;
var TiledMapAsset = (_dec$1 = ccclass('cc.TiledMapAsset'), _dec2$1 = type([TextAsset]), _dec3$1 = type([CCString]), _dec4 = type([SpriteFrame]), _dec5 = type([SpriteFrame]), _dec6 = type([CCString]), _dec7 = type([CCString]), _dec8 = type([Size]), _dec$1(_class$1 = (_class2$1 = function (_Asset) {
  function TiledMapAsset() {
    var _this;
    _this = _Asset.call(this) || this;
    _this.tmxXmlStr = _initializer$1 && _initializer$1();
    _this.tsxFiles = _initializer2$1 && _initializer2$1();
    _this.tsxFileNames = _initializer3$1 && _initializer3$1();
    _this.spriteFrames = _initializer4 && _initializer4();
    _this.imageLayerSpriteFrame = _initializer5 && _initializer5();
    _this.imageLayerSpriteFrameNames = _initializer6 && _initializer6();
    _this.spriteFrameNames = _initializer7 && _initializer7();
    _this.spriteFrameSizes = _initializer8 && _initializer8();
    return _this;
  }
  _inheritsLoose(TiledMapAsset, _Asset);
  return TiledMapAsset;
}(Asset), _initializer$1 = applyDecoratedInitializer(_class2$1.prototype, "tmxXmlStr", [serializable], function () {
  return '';
}), _initializer2$1 = applyDecoratedInitializer(_class2$1.prototype, "tsxFiles", [serializable, _dec2$1], function () {
  return [];
}), _initializer3$1 = applyDecoratedInitializer(_class2$1.prototype, "tsxFileNames", [serializable, _dec3$1], function () {
  return [];
}), _initializer4 = applyDecoratedInitializer(_class2$1.prototype, "spriteFrames", [serializable, _dec4], function () {
  return [];
}), _initializer5 = applyDecoratedInitializer(_class2$1.prototype, "imageLayerSpriteFrame", [serializable, _dec5], function () {
  return [];
}), _initializer6 = applyDecoratedInitializer(_class2$1.prototype, "imageLayerSpriteFrameNames", [serializable, _dec6], function () {
  return [];
}), _initializer7 = applyDecoratedInitializer(_class2$1.prototype, "spriteFrameNames", [serializable, _dec7], function () {
  return [];
}), _initializer8 = applyDecoratedInitializer(_class2$1.prototype, "spriteFrameSizes", [serializable, _dec8], function () {
  return [];
}), _class2$1)) || _class$1);

var _dec, _dec2, _dec3, _class, _class2, _initializer, _initializer2, _initializer3, _TiledMap;
var TiledMap = (_dec = ccclass('cc.TiledMap'), _dec2 = requireComponent(UITransform), _dec3 = type(TiledMapAsset), _dec(_class = _dec2(_class = (_class2 = (_TiledMap = function (_Component) {
  function TiledMap() {
    var _this;
    _this = _Component.call(this) || this;
    _this._texGrids = new Map();
    _this._textures = [];
    _this._tilesets = [];
    _this._animations = new Map();
    _this._imageLayers = [];
    _this._layers = [];
    _this._groups = [];
    _this._images = [];
    _this._properties = {};
    _this._tileProperties = new Map();
    _this._mapInfo = null;
    _this._mapSize = new Size(0, 0);
    _this._tileSize = new Size(0, 0);
    _this._mapOrientation = Orientation.ORTHO;
    _this._isApplied = false;
    _this._tmxFile = _initializer && _initializer();
    _this._enableCulling = _initializer2 && _initializer2();
    _this.cleanupImageCache = _initializer3 && _initializer3();
    return _this;
  }
  _inheritsLoose(TiledMap, _Component);
  var _proto = TiledMap.prototype;
  _proto.getMapSize = function getMapSize() {
    return this._mapSize;
  };
  _proto.getTileSize = function getTileSize() {
    return this._tileSize;
  };
  _proto.getMapOrientation = function getMapOrientation() {
    return this._mapOrientation;
  };
  _proto.getObjectGroups = function getObjectGroups() {
    return this._groups;
  };
  _proto.getObjectGroup = function getObjectGroup(groupName) {
    var groups = this._groups;
    for (var i = 0, l = groups.length; i < l; i++) {
      var group = groups[i];
      if (group && group.getGroupName() === groupName) {
        return group;
      }
    }
    return null;
  };
  _proto.getProperties = function getProperties() {
    return this._properties;
  };
  _proto.getLayers = function getLayers() {
    return this._layers;
  };
  _proto.getLayer = function getLayer(layerName) {
    var layers = this._layers;
    for (var i = 0, l = layers.length; i < l; i++) {
      var layer = layers[i];
      if (layer && layer.getLayerName() === layerName) {
        return layer;
      }
    }
    return null;
  };
  _proto._changeLayer = function _changeLayer(layerName, replaceLayer) {
    var layers = this._layers;
    for (var i = 0, l = layers.length; i < l; i++) {
      var layer = layers[i];
      if (layer && layer.getLayerName() === layerName) {
        layers[i] = replaceLayer;
        return;
      }
    }
  };
  _proto.getProperty = function getProperty(propertyName) {
    return this._properties[propertyName.toString()];
  };
  _proto.getPropertiesForGID = function getPropertiesForGID(gid) {
    return this._tileProperties.get(gid);
  };
  _proto.enableTexelOffset = function enableTexelOffset(enable) {
    enableTexelOffsetUtils(enable);
  };
  _proto.__preload = function __preload() {
    if (!this._tmxFile) {
      return;
    }
    if (this._isApplied === false) {
      this._applyFile();
      this._isApplied = true;
    }
  };
  _proto.onEnable = function onEnable() {
    this.node.on(NodeEventType.ANCHOR_CHANGED, this._syncAnchorPoint, this);
  };
  _proto.onDisable = function onDisable() {
    this.node.off(NodeEventType.ANCHOR_CHANGED, this._syncAnchorPoint, this);
  };
  _proto._applyFile = function _applyFile() {
    var spriteFrames = [];
    var spriteFramesCache = {};
    var file = this._tmxFile;
    if (file) {
      var spfNames = file.spriteFrameNames;
      var spfSizes = file.spriteFrameSizes;
      var fSpriteFrames = file.spriteFrames;
      var spfTexturesMap = {};
      var spfTextureSizeMap = {};
      for (var i = 0; i < spfNames.length; ++i) {
        var texName = spfNames[i];
        spfTextureSizeMap[texName] = spfSizes[i];
        spriteFrames[i] = fSpriteFrames[i];
        var frame = spriteFrames[i];
        if (frame) {
          spriteFramesCache[frame.name] = frame;
          spfTexturesMap[texName] = frame;
        }
      }
      var imageLayerTextures = {};
      var texValues = file.imageLayerSpriteFrame;
      spfNames = file.imageLayerSpriteFrameNames;
      for (var _i = 0; _i < texValues.length; ++_i) {
        imageLayerTextures[spfNames[_i]] = texValues[_i];
      }
      var tsxFileNames = file.tsxFileNames;
      var tsxFiles = file.tsxFiles;
      var tsxContentMap = {};
      for (var _i2 = 0; _i2 < tsxFileNames.length; ++_i2) {
        if (tsxFileNames[_i2].length > 0) {
          tsxContentMap[tsxFileNames[_i2]] = tsxFiles[_i2].text;
        }
      }
      var mapInfo = new TMXMapInfo(file.tmxXmlStr, tsxContentMap, spfTexturesMap, spfTextureSizeMap, imageLayerTextures);
      var tilesets = mapInfo.getTilesets();
      if (!tilesets || tilesets.length === 0) {
        logID(7241);
      }
      this._buildWithMapInfo(mapInfo);
    } else {
      this._releaseMapInfo();
    }
  };
  _proto._releaseMapInfo = function _releaseMapInfo() {
    var layers = this._layers;
    for (var i = 0, l = layers.length; i < l; i++) {
      var _layers$i$node$parent, _layers$i$node$parent2;
      (_layers$i$node$parent = layers[i].node.parent) == null ? void 0 : _layers$i$node$parent.off(NodeEventType.SIZE_CHANGED, layers[i].updateCulling, layers[i]);
      (_layers$i$node$parent2 = layers[i].node.parent) == null ? void 0 : _layers$i$node$parent2.off(NodeEventType.TRANSFORM_CHANGED, layers[i].updateCulling, layers[i]);
      layers[i].node.removeFromParent();
      layers[i].node.destroy();
    }
    layers.length = 0;
    var groups = this._groups;
    for (var _i3 = 0, _l = groups.length; _i3 < _l; _i3++) {
      groups[_i3].node.removeFromParent();
      groups[_i3].node.destroy();
    }
    groups.length = 0;
    var images = this._images;
    for (var _i4 = 0, _l2 = images.length; _i4 < _l2; _i4++) {
      images[_i4].removeFromParent();
      images[_i4].destroy();
    }
    images.length = 0;
  };
  _proto._syncAnchorPoint = function _syncAnchorPoint() {
    var anchor = this.node._getUITransformComp().anchorPoint;
    var leftTopX = this.node._getUITransformComp().width * anchor.x;
    var leftTopY = this.node._getUITransformComp().height * (1 - anchor.y);
    var i;
    var l;
    for (i = 0, l = this._layers.length; i < l; i++) {
      var layerInfo = this._layers[i];
      var layerNode = layerInfo.node;
      layerNode._getUITransformComp().setAnchorPoint(anchor);
    }
    for (i = 0, l = this._groups.length; i < l; i++) {
      var groupInfo = this._groups[i];
      var groupNode = groupInfo.node._getUITransformComp();
      groupNode.anchorX = 0.5;
      groupNode.anchorY = 0.5;
      var x = groupInfo.offset.x - leftTopX + groupNode.width * groupNode.anchorX;
      var y = groupInfo.offset.y + leftTopY - groupNode.height * groupNode.anchorY;
      groupInfo.node.setPosition(x, y);
    }
    for (i = 0, l = this._images.length; i < l; i++) {
      var image = this._images[i]._getUITransformComp();
      image.anchorX = 0.5;
      image.anchorY = 0.5;
      var _x = this._images[i]._offset.x - leftTopX + image.width * image.anchorX;
      var _y = this._images[i]._offset.y + leftTopY - image.height * image.anchorY;
      this._images[i].setPosition(_x, _y);
    }
  };
  _proto._fillAniGrids = function _fillAniGrids(texGrids, animations) {
    for (var _iterator = _createForOfIteratorHelperLoose(animations.keys()), _step; !(_step = _iterator()).done;) {
      var i = _step.value;
      var animation = animations.get(i);
      if (!animation) continue;
      var frames = animation.frames;
      for (var j = 0; j < frames.length; j++) {
        var frame = frames[j];
        frame.grid = texGrids.get(frame.tileid);
      }
    }
  };
  _proto._buildLayerAndGroup = function _buildLayerAndGroup() {
    var tilesets = this._tilesets;
    var texGrids = this._texGrids;
    var animations = this._animations;
    texGrids.clear();
    for (var i = 0, l = tilesets.length; i < l; ++i) {
      var tilesetInfo = tilesets[i];
      if (!tilesetInfo) continue;
      if (!tilesetInfo.sourceImage) {
        warnID(16406, i);
        continue;
      }
      fillTextureGrids(tilesetInfo, texGrids, tilesetInfo.sourceImage);
    }
    this._fillAniGrids(texGrids, animations);
    var layers = this._layers;
    var groups = this._groups;
    var images = this._images;
    var oldNodeNames = {};
    for (var _i5 = 0, n = layers.length; _i5 < n; _i5++) {
      oldNodeNames[layers[_i5].node.name] = true;
    }
    for (var _i6 = 0, _n = groups.length; _i6 < _n; _i6++) {
      oldNodeNames[groups[_i6].node.name] = true;
    }
    for (var _i7 = 0, _n2 = images.length; _i7 < _n2; _i7++) {
      oldNodeNames[images[_i7].name] = true;
    }
    layers = this._layers = [];
    groups = this._groups = [];
    images = this._images = [];
    var mapInfo = this._mapInfo;
    var node = this.node;
    var layerInfos = mapInfo.getAllChildren();
    var textures = this._textures;
    var maxWidth = 0;
    var maxHeight = 0;
    if (layerInfos && layerInfos.length > 0) {
      for (var _i8 = 0, len = layerInfos.length; _i8 < len; _i8++) {
        var layerInfo = layerInfos[_i8];
        var name = layerInfo.name;
        var child = this.node.getChildByName(name);
        oldNodeNames[name] = false;
        if (!child) {
          child = new Node();
          child.name = name;
          child.layer = node.layer;
          node.addChild(child);
        }
        child.setSiblingIndex(_i8);
        child.active = layerInfo.visible;
        if (layerInfo instanceof TMXLayerInfo) {
          var layer = child.getComponent(TiledLayer);
          if (!layer) {
            layer = child.addComponent(TiledLayer);
          }
          layer.init(layerInfo, mapInfo, tilesets, textures, texGrids);
          layer.enableCulling = this._enableCulling;
          layerInfo.ownTiles = false;
          layers.push(layer);
        } else if (layerInfo instanceof TMXObjectGroupInfo) {
          var group = child.getComponent(TiledObjectGroup);
          if (!group) {
            group = child.addComponent(TiledObjectGroup);
          }
          group._init(layerInfo, mapInfo, texGrids);
          groups.push(group);
        } else if (layerInfo instanceof TMXImageLayerInfo) {
          var spriteFrame = layerInfo.sourceImage;
          child.layerInfo = layerInfo;
          child._offset = new Vec2(layerInfo.offset.x, -layerInfo.offset.y);
          var image = child.getComponent(Sprite);
          if (!image) {
            image = child.addComponent(Sprite);
          }
          var color = image.color;
          color.a *= layerInfo.opacity;
          image.spriteFrame = spriteFrame;
          var width = spriteFrame.width;
          var height = spriteFrame.height;
          if (spriteFrame.original) {
            width = spriteFrame.originalSize.width;
            height = spriteFrame.originalSize.height;
          }
          child._getUITransformComp().setContentSize(width, height);
          images.push(child);
        }
        maxWidth = Math.max(maxWidth, child._getUITransformComp().width);
        maxHeight = Math.max(maxHeight, child._getUITransformComp().height);
      }
    }
    var children = node.children;
    for (var _i9 = 0, _n3 = children.length; _i9 < _n3; _i9++) {
      var c = children[_i9];
      if (oldNodeNames[c.name]) {
        c.destroy();
      }
    }
    this.node._getUITransformComp().setContentSize(maxWidth, maxHeight);
    this._syncAnchorPoint();
  };
  _proto._buildWithMapInfo = function _buildWithMapInfo(mapInfo) {
    var _this2 = this;
    this._mapInfo = mapInfo;
    this._mapSize = mapInfo.getMapSize();
    this._tileSize = mapInfo.getTileSize();
    this._mapOrientation = mapInfo.orientation;
    this._properties = mapInfo.properties;
    this._tileProperties = mapInfo.getTileProperties();
    this._imageLayers = mapInfo.getImageLayers();
    this._animations = mapInfo.getTileAnimations();
    this._tilesets = mapInfo.getTilesets();
    var tilesets = this._tilesets;
    this._textures.length = 0;
    var totalTextures = [];
    for (var i = 0, l = tilesets.length; i < l; ++i) {
      var tilesetInfo = tilesets[i];
      if (!tilesetInfo || !tilesetInfo.sourceImage) continue;
      this._textures[i] = tilesetInfo.sourceImage;
      totalTextures.push(tilesetInfo.sourceImage);
    }
    for (var _i0 = 0; _i0 < this._imageLayers.length; _i0++) {
      var imageLayer = this._imageLayers[_i0];
      if (!imageLayer || !imageLayer.sourceImage) continue;
      totalTextures.push(imageLayer.sourceImage);
    }
    this._buildLayerAndGroup();
    if (this.cleanupImageCache) {
      this._textures.forEach(function (tex) {
        _this2.doCleanupImageCache(tex);
      });
    }
  };
  _proto.doCleanupImageCache = function doCleanupImageCache(texture) {
    if (texture._image instanceof HTMLImageElement) {
      texture._image.src = '';
    } else if (sys.hasFeature(sys.Feature.IMAGE_BITMAP) && texture._image instanceof ImageBitmap) {
      if (texture._image.close) texture._image.close();
    }
    texture._image = null;
  };
  _proto.lateUpdate = function lateUpdate(dt) {
    var animations = this._animations;
    var texGrids = this._texGrids;
    for (var _iterator2 = _createForOfIteratorHelperLoose(animations.keys()), _step2; !(_step2 = _iterator2()).done;) {
      var aniGID = _step2.value;
      var animation = animations.get(aniGID);
      var frames = animation.frames;
      var frame = frames[animation.frameIdx];
      animation.dt += dt;
      if (frame.duration < animation.dt) {
        animation.dt = 0;
        animation.frameIdx++;
        if (animation.frameIdx >= frames.length) {
          animation.frameIdx = 0;
        }
        frame = frames[animation.frameIdx];
      }
      texGrids.set(aniGID, frame.grid);
    }
    var layers = this.getLayers();
    for (var i = 0, l = layers.length; i < l; i++) {
      var layer = layers[i];
      if (layer.hasAnimation() || layer.node.hasChangedFlags) {
        layer._markForUpdateRenderData();
      }
    }
  };
  return _createClass(TiledMap, [{
    key: "tmxAsset",
    get: function get() {
      return this._tmxFile;
    },
    set: function set(value) {
      if (this._tmxFile !== value || EDITOR) {
        this._tmxFile = value;
        this._applyFile();
        this._isApplied = true;
      }
    }
  }, {
    key: "enableCulling",
    get: function get() {
      return this._enableCulling;
    },
    set: function set(value) {
      this._enableCulling = value;
      var layers = this._layers;
      for (var i = 0; i < layers.length; ++i) {
        layers[i].enableCulling = value;
      }
    }
  }]);
}(Component), _TiledMap.Orientation = Orientation, _TiledMap.Property = Property, _TiledMap.TileFlag = TileFlag, _TiledMap.StaggerAxis = StaggerAxis, _TiledMap.StaggerIndex = StaggerIndex, _TiledMap.TMXObjectType = TMXObjectType, _TiledMap.RenderOrder = RenderOrder, _TiledMap), _initializer = applyDecoratedInitializer(_class2.prototype, "_tmxFile", [serializable], function () {
  return null;
}), _applyDecoratedDescriptor(_class2.prototype, "tmxAsset", [_dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "tmxAsset"), _class2.prototype), _initializer2 = applyDecoratedInitializer(_class2.prototype, "_enableCulling", [serializable], function () {
  return true;
}), _initializer3 = applyDecoratedInitializer(_class2.prototype, "cleanupImageCache", [serializable], function () {
  return true;
}), _class2)) || _class) || _class);

var MaxGridsLimit = Math.ceil(65535 / 6);
var vec3_temps = [];
for (var i = 0; i < 4; i++) {
  vec3_temps.push(new Vec3());
}
var _mat4_temp = new Mat4();
var _vec3u_temp = new Vec3();
var _leftDown = {
  row: 0,
  col: 0
};
var _uva = {
  x: 0,
  y: 0
};
var _uvb = {
  x: 0,
  y: 0
};
var _uvc = {
  x: 0,
  y: 0
};
var _uvd = {
  x: 0,
  y: 0
};
var _vfOffset = 0;
var _moveX = 0;
var _moveY = 0;
var _fillCount = 0;
var _curTexture = null;
var _tempBuffers;
var _curLayer;
var flipTexture;
var _accessor = null;
var Simple = function () {
  function Simple() {}
  var _proto = Simple.prototype;
  _proto.ensureAccessor = function ensureAccessor() {
    if (!_accessor) {
      var device = director.root.device;
      director.root.batcher2D;
      _accessor = new StaticVBAccessor(device, vfmtPosUvColor);
    }
  };
  _proto.createData = function createData(layer) {
    return null;
  };
  _proto.fillBuffers = function fillBuffers(layer, renderer) {
    if (!layer || layer.tiledDataArray.length === 0) return;
    var dataArray = layer.tiledDataArray;
    var data = dataArray[layer._tiledDataArrayIdx];
    var renderData = data.renderData;
    if (!renderData) return;
    var iBuf = renderData.chunk.meshBuffer.iData;
    var indexOffset = renderData.chunk.meshBuffer.indexOffset;
    var vertexId = renderData.chunk.vertexOffset;
    var quadCount = renderData.vertexCount / 4;
    for (var _i = 0; _i < quadCount; _i += 1) {
      iBuf[indexOffset] = vertexId;
      iBuf[indexOffset + 1] = vertexId + 1;
      iBuf[indexOffset + 2] = vertexId + 2;
      iBuf[indexOffset + 3] = vertexId + 2;
      iBuf[indexOffset + 4] = vertexId + 1;
      iBuf[indexOffset + 5] = vertexId + 3;
      indexOffset += 6;
      vertexId += 4;
    }
    renderData.chunk.meshBuffer.indexOffset = indexOffset;
  };
  _proto.updateRenderData = function updateRenderData(comp) {
    comp.updateCulling();
    _moveX = comp.leftDownToCenterX;
    _moveY = comp.leftDownToCenterY;
    if (comp.colorChanged || comp.isCullingDirty() || comp.isUserNodeDirty() || comp.hasAnimation() || comp.hasTiledNode() || comp.node.hasChangedFlags) {
      comp.colorChanged = false;
      comp.destroyRenderData();
      var leftDown;
      var rightTop;
      if (comp.enableCulling) {
        var cullingRect = comp.cullingRect;
        leftDown = cullingRect.leftDown;
        rightTop = cullingRect.rightTop;
      } else {
        leftDown = _leftDown;
        rightTop = comp.rightTop;
      }
      switch (comp.renderOrder) {
        case RenderOrder.RightDown:
          traverseGrids(leftDown, rightTop, -1, 1, comp);
          break;
        case RenderOrder.LeftDown:
          traverseGrids(leftDown, rightTop, -1, -1, comp);
          break;
        case RenderOrder.RightUp:
          traverseGrids(leftDown, rightTop, 1, 1, comp);
          break;
        case RenderOrder.LeftUp:
        default:
          traverseGrids(leftDown, rightTop, 1, -1, comp);
          break;
      }
      comp.setCullingDirty(false);
      comp.setUserNodeDirty(false);
    }
  };
  _proto.updateColor = function updateColor(tiled) {
    var color = tiled.color;
    var colorV = new Float32Array(4);
    colorV[0] = color.r / 255;
    colorV[1] = color.g / 255;
    colorV[2] = color.b / 255;
    colorV[3] = color.a / 255;
    var rs = tiled.tiledDataArray;
    for (var index = 0; index < rs.length; index++) {
      var r = rs[index];
      if (!r.renderData) continue;
      var renderData = r.renderData;
      var vs = renderData.vData;
      for (var _i2 = renderData.vertexStart, l = renderData.vertexCount; _i2 < l; _i2++) {
        vs.set(colorV, _i2 * 9 + 5);
      }
    }
  };
  return Simple;
}();
var simple = new Simple();
function _flipTexture(inGrid, gid) {
  if (inGrid._rotated) {
    _uva.x = inGrid.r;
    _uva.y = inGrid.t;
    _uvb.x = inGrid.l;
    _uvb.y = inGrid.t;
    _uvc.x = inGrid.r;
    _uvc.y = inGrid.b;
    _uvd.x = inGrid.l;
    _uvd.y = inGrid.b;
  } else {
    _uva.x = inGrid.l;
    _uva.y = inGrid.t;
    _uvb.x = inGrid.l;
    _uvb.y = inGrid.b;
    _uvc.x = inGrid.r;
    _uvc.y = inGrid.t;
    _uvd.x = inGrid.r;
    _uvd.y = inGrid.b;
  }
  var tempVal;
  if ((gid & TileFlag.DIAGONAL) >>> 0) {
    tempVal = _uvb;
    _uvb = _uvc;
    _uvc = tempVal;
  }
  if ((gid & TileFlag.HORIZONTAL) >>> 0) {
    tempVal = _uva;
    _uva = _uvc;
    _uvc = tempVal;
    tempVal = _uvb;
    _uvb = _uvd;
    _uvd = tempVal;
  }
  if ((gid & TileFlag.VERTICAL) >>> 0) {
    tempVal = _uva;
    _uva = _uvb;
    _uvb = tempVal;
    tempVal = _uvc;
    _uvc = _uvd;
    _uvd = tempVal;
  }
}
function packRenderData() {
  if (_fillCount < 1 || !_curTexture) return;
  var vbCount = 4 * _fillCount;
  var ibCount = 6 * _fillCount;
  var tiledData = _curLayer.requestTiledRenderData();
  {
    tiledData.renderData = RenderData.add(vfmtPosUvColor);
  }
  tiledData.texture = _curTexture;
  var rd = tiledData.renderData;
  rd.resize(vbCount, ibCount);
  var vb = rd.chunk.vb;
  vb.set(_tempBuffers.subarray(0, vbCount * 9), 0);
  _fillCount = 0;
  _curTexture = null;
}
function traverseGrids(leftDown, rightTop, rowMoveDir, colMoveDir, comp) {
  if (rightTop.row < 0 || rightTop.col < 0) return;
  _curLayer = comp;
  var matrix = comp.node.worldMatrix;
  _vfOffset = 0;
  var tiledTiles = comp.tiledTiles;
  var texGrids = comp.texGrids;
  var tiles = comp.tiles;
  var vertStep = 9;
  var vertStep2 = vertStep * 2;
  var vertStep3 = vertStep * 3;
  var vertices = comp.vertices;
  var rowData;
  var col;
  var cols;
  var row;
  var rows;
  var colData;
  var tileSize;
  var grid;
  var gid = 0;
  var left = 0;
  var bottom = 0;
  var right = 0;
  var top = 0;
  var tiledNode;
  var colNodesCount = 0;
  var isCheckColRange = true;
  flipTexture = _flipTexture;
  var color = new Float32Array(4);
  color[0] = comp.color.r / 255;
  color[1] = comp.color.g / 255;
  color[2] = comp.color.b / 255;
  color[3] = comp.color.a / 255;
  if (rowMoveDir === -1) {
    row = rightTop.row;
    rows = leftDown.row;
  } else {
    row = leftDown.row;
    rows = rightTop.row;
  }
  var _tempRows = Math.abs(leftDown.row - rightTop.row) + 1;
  var _tempClos = Math.abs(rightTop.col - leftDown.col) + 1;
  _tempBuffers = new Float32Array(_tempRows * _tempClos * 9 * 4);
  _fillCount = 0;
  var vertexBuf = _tempBuffers;
  for (; (rows - row) * rowMoveDir >= 0; row += rowMoveDir) {
    rowData = vertices[row];
    colNodesCount = comp.getNodesCountByRow(row);
    isCheckColRange = rowData && colNodesCount === 0;
    if (colMoveDir === 1) {
      col = isCheckColRange && leftDown.col < rowData.minCol ? rowData.minCol : leftDown.col;
      cols = isCheckColRange && rightTop.col > rowData.maxCol ? rowData.maxCol : rightTop.col;
    } else {
      col = isCheckColRange && rightTop.col > rowData.maxCol ? rowData.maxCol : rightTop.col;
      cols = isCheckColRange && leftDown.col < rowData.minCol ? rowData.minCol : leftDown.col;
    }
    for (; (cols - col) * colMoveDir >= 0; col += colMoveDir) {
      colData = rowData && rowData[col];
      if (colNodesCount > 0) {
        packRenderData();
        var nodes = comp.requestSubNodesData();
        var celData = comp.getNodesByRowCol(row, col);
        if (celData && celData.count > 0) {
          nodes.subNodes = celData.list;
        }
      }
      if (!colData) {
        continue;
      }
      gid = tiles[colData.index];
      grid = texGrids.get((gid & TileFlag.FLIPPED_MASK) >>> 0);
      if (!grid) continue;
      if (_curTexture !== grid.texture) {
        packRenderData();
        _curTexture = grid.texture;
      }
      tileSize = grid.tileset._tileSize;
      left = colData.left - _moveX;
      bottom = colData.bottom - _moveY;
      right = left + tileSize.width;
      top = bottom + tileSize.height;
      tiledNode = tiledTiles[colData.index];
      _vfOffset = _fillCount * 4 * 9;
      if (!tiledNode) {
        {
          vec3_temps[0].x = left;
          vec3_temps[0].y = top;
          vec3_temps[1].x = left;
          vec3_temps[1].y = bottom;
          vec3_temps[2].x = right;
          vec3_temps[2].y = top;
          vec3_temps[3].x = right;
          vec3_temps[3].y = bottom;
        }
        vec3_temps[0].transformMat4(matrix);
        vertexBuf[_vfOffset] = vec3_temps[0].x;
        vertexBuf[_vfOffset + 1] = vec3_temps[0].y;
        vertexBuf[_vfOffset + 2] = vec3_temps[0].z;
        vec3_temps[1].transformMat4(matrix);
        vertexBuf[_vfOffset + vertStep] = vec3_temps[1].x;
        vertexBuf[_vfOffset + vertStep + 1] = vec3_temps[1].y;
        vertexBuf[_vfOffset + vertStep + 2] = vec3_temps[1].z;
        vec3_temps[2].transformMat4(matrix);
        vertexBuf[_vfOffset + vertStep2] = vec3_temps[2].x;
        vertexBuf[_vfOffset + vertStep2 + 1] = vec3_temps[2].y;
        vertexBuf[_vfOffset + vertStep2 + 2] = vec3_temps[2].z;
        vec3_temps[3].transformMat4(matrix);
        vertexBuf[_vfOffset + vertStep3] = vec3_temps[3].x;
        vertexBuf[_vfOffset + vertStep3 + 1] = vec3_temps[3].y;
        vertexBuf[_vfOffset + vertStep3 + 2] = vec3_temps[3].z;
        vertexBuf.set(color, _vfOffset + 5);
        vertexBuf.set(color, _vfOffset + vertStep + 5);
        vertexBuf.set(color, _vfOffset + vertStep2 + 5);
        vertexBuf.set(color, _vfOffset + vertStep3 + 5);
      } else if (tiledNode.node.active) {
        fillByTiledNode(tiledNode.node, color, vertexBuf, left, right, top, bottom);
      }
      flipTexture(grid, gid);
      vertexBuf[_vfOffset + 3] = _uva.x;
      vertexBuf[_vfOffset + 4] = _uva.y;
      vertexBuf[_vfOffset + vertStep + 3] = _uvb.x;
      vertexBuf[_vfOffset + vertStep + 4] = _uvb.y;
      vertexBuf[_vfOffset + vertStep2 + 3] = _uvc.x;
      vertexBuf[_vfOffset + vertStep2 + 4] = _uvc.y;
      vertexBuf[_vfOffset + vertStep3 + 3] = _uvd.x;
      vertexBuf[_vfOffset + vertStep3 + 4] = _uvd.y;
      _fillCount++;
      if (_fillCount >= MaxGridsLimit) {
        packRenderData();
      }
    }
  }
  packRenderData();
}
function fillByTiledNode(tiledNode, color, vbuf, left, right, top, bottom, diamondTile) {
  var vertStep = 9;
  var vertStep2 = vertStep * 2;
  var vertStep3 = vertStep * 3;
  tiledNode.updateWorldTransform();
  Mat4.fromRTS(_mat4_temp, tiledNode.rotation, tiledNode.position, tiledNode.scale);
  Vec3.set(_vec3u_temp, -(left + _moveX), -(bottom + _moveY), 0);
  Mat4.transform(_mat4_temp, _mat4_temp, _vec3u_temp);
  Mat4.multiply(_mat4_temp, tiledNode.parent.worldMatrix, _mat4_temp);
  var m = _mat4_temp;
  var tx = m.m12;
  var ty = m.m13;
  var a = m.m00;
  var b = m.m01;
  var c = m.m04;
  var d = m.m05;
  var justTranslate = a === 1 && b === 0 && c === 0 && d === 1;
  if (justTranslate) {
    vbuf[_vfOffset] = left + tx;
    vbuf[_vfOffset + 1] = top + ty;
    vbuf[_vfOffset + vertStep] = left + tx;
    vbuf[_vfOffset + vertStep + 1] = bottom + ty;
    vbuf[_vfOffset + vertStep2] = right + tx;
    vbuf[_vfOffset + vertStep2 + 1] = top + ty;
    vbuf[_vfOffset + vertStep3] = right + tx;
    vbuf[_vfOffset + vertStep3 + 1] = bottom + ty;
  } else {
    vbuf[_vfOffset] = left * a + top * c + tx;
    vbuf[_vfOffset + 1] = left * b + top * d + ty;
    vbuf[_vfOffset + vertStep] = left * a + bottom * c + tx;
    vbuf[_vfOffset + vertStep + 1] = left * b + bottom * d + ty;
    vbuf[_vfOffset + vertStep2] = right * a + top * c + tx;
    vbuf[_vfOffset + vertStep2 + 1] = right * b + top * d + ty;
    vbuf[_vfOffset + vertStep3] = right * a + bottom * c + tx;
    vbuf[_vfOffset + vertStep3 + 1] = right * b + bottom * d + ty;
  }
  vbuf.set(color, _vfOffset + 5);
  vbuf.set(color, _vfOffset + vertStep + 5);
  vbuf.set(color, _vfOffset + vertStep2 + 5);
  vbuf.set(color, _vfOffset + vertStep3 + 5);
}

var tiledLayerAssembler = {
  getAssembler: function getAssembler() {
    return simple;
  }
};
TiledLayer.Assembler = tiledLayerAssembler;

export { TiledLayer, TiledMap, TiledMapAsset, TiledObjectGroup, TiledTile, TiledUserNodeData, tiledLayerAssembler };
//# sourceMappingURL=tiled-map.js.map
