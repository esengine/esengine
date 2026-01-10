import { E as Enum, _ as _inheritsLoose, a5 as Pool, g as getError, W as logID, k as errorID, Q as error, w as warnID, a as _createClass, b as _applyDecoratedDescriptor } from './gc-object-CShF5lzx.js';
import { V as Vec2, g as Vec4, C as Color, X as random, a as clamp, h as toRadian, Y as toDegree, c as ccclass$1, b as applyDecoratedInitializer, s as serializable$1, t as type, L as override, k as formerlySerializedAs } from './index-uXI1_UMk.js';
import './_virtual_internal_constants-DWlew7Dp.js';
import { c as cclegacy, a as ccwindow } from './global-exports-DnCP_14L.js';
import { e as getComponentPerVertex, v as vfmtPosUvColor, U as UIRenderer, R as RenderEntityFillColorType, M as MeshRenderData } from './ui-renderer-JpGcj-VM.js';
import { S as SpriteFrame } from './sprite-frame-DHXMUUT-.js';
import { k as assetManager, d as builtinResMgr, I as ImageAsset, i as Texture2D } from './scene-vWcxM1_c.js';
import { A as Asset, c as changeBasename } from './node-event-Ccvtv8bJ.js';
import './device-manager-CBXP-ttm.js';
import { ag as BlendFactor } from './buffer-barrier-BlQXg9Aa.js';
import { _ as _p } from './zlib.min-3VC1ush6.js';
import { c as codec } from './ZipUtils-UyrG9qFl.js';
import './deprecated-n0w4kK7g.js';
import './sprite-renderer-C7_6H1N4.js';
import './debug-view-BuNhRPv_.js';
import './pipeline-state-manager-C5U4ouGL.js';
import './director-F7e_Lqjg.js';
import './prefab-DYg_oxpo.js';
import './touch-BKrZ-fxl.js';
import './deprecated-Dswa7XeN.js';
import './renderer-C7HM72NY.js';
import './sorting-layers-BHqhkSbY.js';
import './create-mesh-CfKC5EQd.js';
import './mesh-XWfHgs1t.js';
import './wasm-web-BpK36a26.js';
import './camera-component-BFt9vSC_.js';
import './deprecated-CzzdLkmW.js';
import './model-renderer-BBapFDY7.js';

var DURATION_INFINITY = -1;
var START_SIZE_EQUAL_TO_END_SIZE = -1;
var START_RADIUS_EQUAL_TO_END_RADIUS = -1;
var EmitterMode = Enum({
  GRAVITY: 0,
  RADIUS: 1
});
var PositionType = Enum({
  FREE: 0,
  RELATIVE: 1,
  GROUPED: 2
});

var _pos = new Vec2();
var _tpa = new Vec2();
var _tpb = new Vec2();
var _tpc = new Vec2();
var _col = new Vec4();
var formatBytes = getComponentPerVertex(vfmtPosUvColor);
function getWorldRotation(node) {
  var rotation = 0;
  var tempNode = node;
  while (tempNode) {
    rotation += tempNode.eulerAngles.z;
    tempNode = tempNode.parent;
  }
  return rotation;
}
var Particle = function Particle() {
  this.pos = new Vec2(0, 0);
  this.startPos = new Vec2(0, 0);
  this.color = new Color(0, 0, 0, 255);
  this.deltaColor = {
    r: 0,
    g: 0,
    b: 0,
    a: 255
  };
  this.size = 0;
  this.deltaSize = 0;
  this.rotation = 0;
  this.deltaRotation = 0;
  this.timeToLive = 0;
  this.drawPos = new Vec2(0, 0);
  this.aspectRatio = 1;
  this.dir = new Vec2(0, 0);
  this.radialAccel = 0;
  this.tangentialAccel = 0;
  this.angle = 0;
  this.degreesPerSecond = 0;
  this.radius = 0;
  this.deltaRadius = 0;
};
var ParticlePool = function (_js$Pool) {
  function ParticlePool() {
    return _js$Pool.apply(this, arguments) || this;
  }
  _inheritsLoose(ParticlePool, _js$Pool);
  var _proto = ParticlePool.prototype;
  _proto.get = function get() {
    return this._get() || new Particle();
  };
  return ParticlePool;
}(Pool);
var pool = new ParticlePool(function (par) {
  par.pos.set(Vec2.ZERO);
  par.startPos.set(Vec2.ZERO);
  par.color.set(0, 0, 0, 255);
  par.deltaColor.r = par.deltaColor.g = par.deltaColor.b = 0;
  par.deltaColor.a = 255;
  par.size = 0;
  par.deltaSize = 0;
  par.rotation = 0;
  par.deltaRotation = 0;
  par.timeToLive = 0;
  par.drawPos.set(Vec2.ZERO);
  par.aspectRatio = 1;
  par.dir.set(Vec2.ZERO);
  par.radialAccel = 0;
  par.tangentialAccel = 0;
  par.angle = 0;
  par.degreesPerSecond = 0;
  par.radius = 0;
  par.deltaRadius = 0;
}, 1024);
var Simulator = function () {
  function Simulator(system) {
    this.particles = [];
    this.active = false;
    this.uvFilled = 0;
    this.finished = false;
    this.renderData = null;
    this.readyToPlay = true;
    this.elapsed = 0;
    this.emitCounter = 0;
    this._worldRotation = 0;
    this.sys = system;
    this.particles = [];
    this.active = false;
    this.readyToPlay = true;
    this.finished = false;
    this.elapsed = 0;
    this.emitCounter = 0;
    this.uvFilled = 0;
    this._worldRotation = 0;
  }
  var _proto2 = Simulator.prototype;
  _proto2.stop = function stop() {
    this.active = false;
    this.readyToPlay = false;
    this.elapsed = this.sys.duration;
    this.emitCounter = 0;
  };
  _proto2.reset = function reset() {
    this.active = true;
    this.readyToPlay = true;
    this.elapsed = 0;
    this.emitCounter = 0;
    this.finished = false;
    var particles = this.particles;
    for (var id = 0; id < particles.length; ++id) pool.put(particles[id]);
    particles.length = 0;
    if (this.renderData) this.renderData.resize(0, 0);
  };
  _proto2.emitParticle = function emitParticle(pos) {
    var psys = this.sys;
    var particle = pool.get();
    this.particles.push(particle);
    particle.timeToLive = psys.life + psys.lifeVar * (random() - 0.5) * 2;
    var timeToLive = particle.timeToLive = Math.max(0, particle.timeToLive);
    particle.pos.x = psys.sourcePos.x + psys.posVar.x * (random() - 0.5) * 2;
    particle.pos.y = psys.sourcePos.y + psys.posVar.y * (random() - 0.5) * 2;
    var sr = 0;
    var sg = 0;
    var sb = 0;
    var sa = 0;
    var startColor = psys.startColor;
    var startColorVar = psys.startColorVar;
    var endColor = psys.endColor;
    var endColorVar = psys.endColorVar;
    particle.color.r = sr = clamp(startColor.r + startColorVar.r * (random() - 0.5) * 2, 0, 255);
    particle.color.g = sg = clamp(startColor.g + startColorVar.g * (random() - 0.5) * 2, 0, 255);
    particle.color.b = sb = clamp(startColor.b + startColorVar.b * (random() - 0.5) * 2, 0, 255);
    particle.color.a = sa = clamp(startColor.a + startColorVar.a * (random() - 0.5) * 2, 0, 255);
    particle.deltaColor.r = (clamp(endColor.r + endColorVar.r * (random() - 0.5) * 2, 0, 255) - sr) / timeToLive;
    particle.deltaColor.g = (clamp(endColor.g + endColorVar.g * (random() - 0.5) * 2, 0, 255) - sg) / timeToLive;
    particle.deltaColor.b = (clamp(endColor.b + endColorVar.b * (random() - 0.5) * 2, 0, 255) - sb) / timeToLive;
    particle.deltaColor.a = (clamp(endColor.a + endColorVar.a * (random() - 0.5) * 2, 0, 255) - sa) / timeToLive;
    var startS = psys.startSize + psys.startSizeVar * (random() - 0.5) * 2;
    startS = Math.max(0, startS);
    particle.size = startS;
    if (psys.endSize === START_SIZE_EQUAL_TO_END_SIZE) {
      particle.deltaSize = 0;
    } else {
      var endS = psys.endSize + psys.endSizeVar * (random() - 0.5) * 2;
      endS = Math.max(0, endS);
      particle.deltaSize = (endS - startS) / timeToLive;
    }
    var startA = psys.startSpin + psys.startSpinVar * (random() - 0.5) * 2;
    var endA = psys.endSpin + psys.endSpinVar * (random() - 0.5) * 2;
    particle.rotation = startA;
    particle.deltaRotation = (endA - startA) / timeToLive;
    particle.startPos.x = pos.x;
    particle.startPos.y = pos.y;
    particle.aspectRatio = psys.aspectRatio || 1;
    var a = toRadian(psys.angle + this._worldRotation + psys.angleVar * (random() - 0.5) * 2);
    if (psys.emitterMode === EmitterMode.GRAVITY) {
      var s = psys.speed + psys.speedVar * (random() - 0.5) * 2;
      particle.dir.x = Math.cos(a);
      particle.dir.y = Math.sin(a);
      particle.dir.multiplyScalar(s);
      particle.radialAccel = psys.radialAccel + psys.radialAccelVar * (random() - 0.5) * 2;
      particle.tangentialAccel = psys.tangentialAccel + psys.tangentialAccelVar * (random() - 0.5) * 2;
      if (psys.rotationIsDir) {
        particle.rotation = -toDegree(Math.atan2(particle.dir.y, particle.dir.x));
      }
    } else {
      var startRadius = psys.startRadius + psys.startRadiusVar * (random() - 0.5) * 2;
      var endRadius = psys.endRadius + psys.endRadiusVar * (random() - 0.5) * 2;
      particle.radius = startRadius;
      particle.deltaRadius = psys.endRadius === START_RADIUS_EQUAL_TO_END_RADIUS ? 0 : (endRadius - startRadius) / timeToLive;
      particle.angle = a;
      particle.degreesPerSecond = toRadian(psys.rotatePerS + psys.rotatePerSVar * (random() - 0.5) * 2);
    }
  };
  _proto2.updateUVs = function updateUVs(force) {
    var renderData = this.renderData;
    if (renderData && this.sys._renderSpriteFrame) {
      var vbuf = renderData.vData;
      var uv = this.sys._renderSpriteFrame.uv;
      var start = force ? 0 : this.uvFilled;
      var particleCount = this.particles.length;
      for (var i = start; i < particleCount; i++) {
        var offset = i * formatBytes * 4;
        vbuf[offset + 3] = uv[0];
        vbuf[offset + 4] = uv[1];
        vbuf[offset + 12] = uv[2];
        vbuf[offset + 13] = uv[3];
        vbuf[offset + 21] = uv[4];
        vbuf[offset + 22] = uv[5];
        vbuf[offset + 30] = uv[6];
        vbuf[offset + 31] = uv[7];
      }
      this.uvFilled = particleCount;
    }
  };
  _proto2.updateParticleBuffer = function updateParticleBuffer(particle, pos, buffer, offset) {
    var vbuf = buffer.vData;
    var x = pos.x;
    var y = pos.y;
    var width = particle.size;
    var height = width;
    var aspectRatio = particle.aspectRatio;
    if (aspectRatio > 1) {
      height = width / aspectRatio;
    } else {
      width = height * aspectRatio;
    }
    var halfWidth = width / 2;
    var halfHeight = height / 2;
    if (particle.rotation) {
      var x1 = -halfWidth;
      var y1 = -halfHeight;
      var x2 = halfWidth;
      var y2 = halfHeight;
      var rad = -toRadian(particle.rotation);
      var cr = Math.cos(rad);
      var sr = Math.sin(rad);
      vbuf[offset] = x1 * cr - y1 * sr + x;
      vbuf[offset + 1] = x1 * sr + y1 * cr + y;
      vbuf[offset + 2] = 0;
      vbuf[offset + 9] = x2 * cr - y1 * sr + x;
      vbuf[offset + 10] = x2 * sr + y1 * cr + y;
      vbuf[offset + 11] = 0;
      vbuf[offset + 18] = x1 * cr - y2 * sr + x;
      vbuf[offset + 19] = x1 * sr + y2 * cr + y;
      vbuf[offset + 20] = 0;
      vbuf[offset + 27] = x2 * cr - y2 * sr + x;
      vbuf[offset + 28] = x2 * sr + y2 * cr + y;
      vbuf[offset + 29] = 0;
    } else {
      vbuf[offset] = x - halfWidth;
      vbuf[offset + 1] = y - halfHeight;
      vbuf[offset + 2] = 0;
      vbuf[offset + 9] = x + halfWidth;
      vbuf[offset + 10] = y - halfHeight;
      vbuf[offset + 11] = 0;
      vbuf[offset + 18] = x - halfWidth;
      vbuf[offset + 19] = y + halfHeight;
      vbuf[offset + 20] = 0;
      vbuf[offset + 27] = x + halfWidth;
      vbuf[offset + 28] = y + halfHeight;
      vbuf[offset + 29] = 0;
    }
    var pcol = particle.color;
    _col.x = pcol.r / 255;
    _col.y = pcol.g / 255;
    _col.z = pcol.b / 255;
    _col.w = pcol.a / 255;
    Vec4.toArray(vbuf, _col, offset + 5);
    Vec4.toArray(vbuf, _col, offset + 14);
    Vec4.toArray(vbuf, _col, offset + 23);
    Vec4.toArray(vbuf, _col, offset + 32);
  };
  _proto2.step = function step(dt) {
    var assembler = this.sys.assembler;
    var psys = this.sys;
    var node = psys.node;
    var particles = this.particles;
    dt = dt > assembler.maxParticleDeltaTime ? assembler.maxParticleDeltaTime : dt;
    node.updateWorldTransform();
    if (psys.positionType === PositionType.FREE) {
      this._worldRotation = getWorldRotation(node);
      var m = node.worldMatrix;
      _pos.x = m.m12;
      _pos.y = m.m13;
    } else if (psys.positionType === PositionType.RELATIVE) {
      this._worldRotation = node.eulerAngles.z;
      _pos.x = node.position.x;
      _pos.y = node.position.y;
    } else {
      this._worldRotation = 0;
    }
    if (this.active && psys.emissionRate) {
      var rate = 1.0 / psys.emissionRate;
      if (particles.length < psys.totalParticles) this.emitCounter += dt;
      while (particles.length < psys.totalParticles && this.emitCounter > rate) {
        this.emitParticle(_pos);
        this.emitCounter -= rate;
      }
      this.elapsed += dt;
      if (psys.duration !== -1 && psys.duration < this.elapsed) {
        psys.stopSystem();
      }
    }
    var renderData = this.renderData;
    if (!renderData) return;
    var particleCount = particles.length;
    renderData.reset();
    this.requestData(particleCount * 4, particleCount * 6);
    if (particleCount > this.uvFilled) {
      this.updateUVs();
    }
    var particleIdx = 0;
    while (particleIdx < particles.length) {
      _tpa.x = _tpa.y = _tpb.x = _tpb.y = _tpc.x = _tpc.y = 0;
      var particle = particles[particleIdx];
      particle.timeToLive -= dt;
      if (particle.timeToLive > 0) {
        if (psys.emitterMode === EmitterMode.GRAVITY) {
          var tmp = _tpc;
          var radial = _tpa;
          var tangential = _tpb;
          if (particle.pos.x || particle.pos.y) {
            radial.set(particle.pos);
            radial.normalize();
          }
          tangential.set(radial);
          radial.multiplyScalar(particle.radialAccel);
          var newy = tangential.x;
          tangential.x = -tangential.y;
          tangential.y = newy;
          tangential.multiplyScalar(particle.tangentialAccel);
          tmp.set(radial);
          tmp.add(tangential);
          tmp.add(psys.gravity);
          tmp.multiplyScalar(dt);
          particle.dir.add(tmp);
          tmp.set(particle.dir);
          tmp.multiplyScalar(dt);
          particle.pos.add(tmp);
        } else {
          particle.angle += particle.degreesPerSecond * dt;
          particle.radius += particle.deltaRadius * dt;
          particle.pos.x = -Math.cos(particle.angle) * particle.radius;
          particle.pos.y = -Math.sin(particle.angle) * particle.radius;
        }
        particle.color.r += particle.deltaColor.r * dt;
        particle.color.g += particle.deltaColor.g * dt;
        particle.color.b += particle.deltaColor.b * dt;
        particle.color.a += particle.deltaColor.a * dt;
        particle.size += particle.deltaSize * dt;
        if (particle.size < 0) {
          particle.size = 0;
        }
        particle.rotation += particle.deltaRotation * dt;
        var newPos = _tpa;
        newPos.set(particle.pos);
        if (psys.positionType !== PositionType.GROUPED) {
          newPos.add(particle.startPos);
        }
        var offset = formatBytes * particleIdx * 4;
        this.updateParticleBuffer(particle, newPos, renderData, offset);
        ++particleIdx;
      } else {
        var deadParticle = particles[particleIdx];
        if (particleIdx !== particles.length - 1) {
          particles[particleIdx] = particles[particles.length - 1];
        }
        pool.put(deadParticle);
        particles.length--;
        renderData.resize(renderData.vertexCount - 4, renderData.indexCount - 6);
      }
    }
    renderData.material = this.sys.getRenderMaterial(0);
    renderData.frame = this.sys._renderSpriteFrame;
    renderData.setRenderDrawInfoAttributes();
    if (particles.length === 0 && !this.active && !this.readyToPlay) {
      this.finished = true;
      psys._finishedSimulation();
    }
  };
  _proto2.requestData = function requestData(vertexCount, indexCount) {
    if (!this.renderData) return;
    var offset = this.renderData.indexCount;
    this.renderData.request(vertexCount, indexCount);
    var count = this.renderData.indexCount / 6;
    var buffer = this.renderData.iData;
    for (var i = offset; i < count; i++) {
      var vId = i * 4;
      buffer[offset++] = vId;
      buffer[offset++] = vId + 1;
      buffer[offset++] = vId + 2;
      buffer[offset++] = vId + 1;
      buffer[offset++] = vId + 3;
      buffer[offset++] = vId + 2;
    }
  };
  _proto2.initDrawInfo = function initDrawInfo() {
    var _this$renderData;
    (_this$renderData = this.renderData) == null ? void 0 : _this$renderData.setRenderDrawInfoAttributes();
  };
  return Simulator;
}();

var _dec$2, _class$2, _class2$2, _initializer$2;
var ccclass = ccclass$1,
  serializable = serializable$1;
var ParticleAsset = (_dec$2 = ccclass('cc.ParticleAsset'), _dec$2(_class$2 = (_class2$2 = function (_Asset) {
  function ParticleAsset() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _Asset.call.apply(_Asset, [this].concat(args)) || this;
    _this.spriteFrame = _initializer$2 && _initializer$2();
    return _this;
  }
  _inheritsLoose(ParticleAsset, _Asset);
  return ParticleAsset;
}(Asset), _initializer$2 = applyDecoratedInitializer(_class2$2.prototype, "spriteFrame", [serializable], function () {
  return null;
}), _class2$2)) || _class$2);
cclegacy.ParticleAsset = ParticleAsset;

var PNGReader = function () {
  function PNGReader(data) {
    var _this = this;
    this.pos = 8;
    this.palette = [];
    this.imgData = [];
    this.transparency = {
      indexed: [],
      rgb: [],
      grayscale: 0
    };
    this.text = {};
    this.width = 0;
    this.height = 0;
    this.bits = 0;
    this.colorType = 0;
    this.compressionMethod = 0;
    this.filterMethod = 0;
    this.interlaceMethod = 0;
    this.colors = 0;
    this.hasAlphaChannel = false;
    this.pixelBitlength = 0;
    this._decodedPalette = null;
    var thisData = this.data = data;
    var frame;
    var chunkSize = 0;
    while (true) {
      chunkSize = this.readUInt32();
      var section = function () {
        var results = [];
        for (var _i = 0; _i < 4; ++_i) {
          results.push(String.fromCharCode(thisData[_this.pos++]));
        }
        return results;
      }.call(this).join('');
      switch (section) {
        case 'IHDR':
          {
            this.width = this.readUInt32();
            this.height = this.readUInt32();
            this.bits = thisData[this.pos++];
            this.colorType = thisData[this.pos++];
            this.compressionMethod = thisData[this.pos++];
            this.filterMethod = thisData[this.pos++];
            this.interlaceMethod = thisData[this.pos++];
            break;
          }
        case 'acTL':
          this.animation = {
            numFrames: this.readUInt32(),
            numPlays: this.readUInt32() || Infinity,
            frames: []
          };
          break;
        case 'PLTE':
          this.palette = this.read(chunkSize);
          break;
        case 'fcTL':
          {
            if (frame) {
              this.animation.frames.push(frame);
            }
            this.pos += 4;
            frame = {
              width: this.readUInt32(),
              height: this.readUInt32(),
              xOffset: this.readUInt32(),
              yOffset: this.readUInt32(),
              delay: 0,
              disposeOp: 0,
              blendOp: 0,
              data: []
            };
            var delayNum = this.readUInt16();
            var delayDen = this.readUInt16() || 100;
            frame.delay = 1000 * delayNum / delayDen;
            frame.disposeOp = thisData[this.pos++];
            frame.blendOp = thisData[this.pos++];
            break;
          }
        case 'IDAT':
        case 'fdAT':
          {
            if (section === 'fdAT') {
              this.pos += 4;
              chunkSize -= 4;
            }
            data = (frame != null ? frame.data : undefined) || this.imgData;
            for (var _i = 0; chunkSize >= 0 ? _i < chunkSize : _i > chunkSize; chunkSize >= 0 ? ++_i : --_i) {
              data.push(thisData[this.pos++]);
            }
            break;
          }
        case 'tRNS':
          this.transparency = {};
          switch (this.colorType) {
            case 3:
              {
                this.transparency.indexed = this.read(chunkSize);
                var ccshort = 255 - this.transparency.indexed.length;
                if (ccshort > 0) {
                  for (var _j = 0; ccshort >= 0 ? _j < ccshort : _j > ccshort; ccshort >= 0 ? ++_j : --_j) {
                    this.transparency.indexed.push(255);
                  }
                }
                break;
              }
            case 0:
              this.transparency.grayscale = this.read(chunkSize)[0];
              break;
            case 2:
              this.transparency.rgb = this.read(chunkSize);
              break;
          }
          break;
        case 'tEXt':
          {
            var text = this.read(chunkSize);
            var index = text.indexOf(0);
            var key = String.fromCharCode.apply(String, text.slice(0, index));
            this.text[key] = String.fromCharCode.apply(String, text.slice(index + 1));
            break;
          }
        case 'IEND':
          {
            if (frame) {
              this.animation.frames.push(frame);
            }
            this.colors = function () {
              switch (_this.colorType) {
                case 0:
                case 3:
                case 4:
                  return 1;
                case 2:
                case 6:
                  return 3;
                default:
                  return undefined;
              }
            }.call(this);
            var _ref = this.colorType;
            this.hasAlphaChannel = _ref === 4 || _ref === 6;
            var colors = this.colors + (this.hasAlphaChannel ? 1 : 0);
            this.pixelBitlength = this.bits * colors;
            this.colorSpace = function () {
              switch (_this.colors) {
                case 1:
                  return 'DeviceGray';
                case 3:
                  return 'DeviceRGB';
                default:
                  return undefined;
              }
            }.call(this);
            if (!(this.imgData instanceof Uint8Array)) {
              this.imgData = new Uint8Array(this.imgData);
            }
            return;
          }
        default:
          this.pos += chunkSize;
      }
      this.pos += 4;
      if (this.pos > thisData.length) {
        throw new Error(getError(6017));
      }
    }
  }
  var _proto = PNGReader.prototype;
  _proto.read = function read(bytes) {
    var _i = 0;
    var _results = [];
    for (_i = 0; bytes >= 0 ? _i < bytes : _i > bytes; bytes >= 0 ? ++_i : --_i) {
      _results.push(this.data[this.pos++]);
    }
    return _results;
  };
  _proto.readUInt32 = function readUInt32() {
    var data = this.data;
    var b1 = data[this.pos++] << 24;
    var b2 = data[this.pos++] << 16;
    var b3 = data[this.pos++] << 8;
    var b4 = data[this.pos++];
    return b1 | b2 | b3 | b4;
  };
  _proto.readUInt16 = function readUInt16() {
    var b1 = this.data[this.pos++] << 8;
    var b2 = this.data[this.pos++];
    return b1 | b2;
  };
  _proto.decodePixels = function decodePixels(data) {
    if (data == null) {
      data = this.imgData;
    }
    if (data.length === 0) {
      return new Uint8Array(0);
    }
    var inflate = new _p.Inflate(data, {
      index: 0,
      verify: false
    });
    data = inflate.decompress();
    var pixelBytes = this.pixelBitlength / 8;
    var scanlineLength = pixelBytes * this.width;
    var pixels = new Uint8Array(scanlineLength * this.height);
    var length = data.length;
    var row = 0;
    var pos = 0;
    var c = 0;
    var ccbyte = 0;
    var col = 0;
    var i = 0;
    var _i = 0;
    var _j = 0;
    var _k = 0;
    var _l = 0;
    var _m = 0;
    var left = 0;
    var p = 0;
    var pa = 0;
    var paeth = 0;
    var pb = 0;
    var pc = 0;
    var upper = 0;
    var upperLeft = 0;
    while (pos < length) {
      switch (data[pos++]) {
        case 0:
          for (i = _i = 0; _i < scanlineLength; i = _i += 1) {
            pixels[c++] = data[pos++];
          }
          break;
        case 1:
          for (i = _j = 0; _j < scanlineLength; i = _j += 1) {
            ccbyte = data[pos++];
            left = i < pixelBytes ? 0 : pixels[c - pixelBytes];
            pixels[c++] = (ccbyte + left) % 256;
          }
          break;
        case 2:
          for (i = _k = 0; _k < scanlineLength; i = _k += 1) {
            ccbyte = data[pos++];
            col = (i - i % pixelBytes) / pixelBytes;
            upper = row && pixels[(row - 1) * scanlineLength + col * pixelBytes + i % pixelBytes];
            pixels[c++] = (upper + ccbyte) % 256;
          }
          break;
        case 3:
          for (i = _l = 0; _l < scanlineLength; i = _l += 1) {
            ccbyte = data[pos++];
            col = (i - i % pixelBytes) / pixelBytes;
            left = i < pixelBytes ? 0 : pixels[c - pixelBytes];
            upper = row && pixels[(row - 1) * scanlineLength + col * pixelBytes + i % pixelBytes];
            pixels[c++] = (ccbyte + Math.floor((left + upper) / 2)) % 256;
          }
          break;
        case 4:
          for (i = _m = 0; _m < scanlineLength; i = _m += 1) {
            ccbyte = data[pos++];
            col = (i - i % pixelBytes) / pixelBytes;
            left = i < pixelBytes ? 0 : pixels[c - pixelBytes];
            if (row === 0) {
              upper = upperLeft = 0;
            } else {
              upper = pixels[(row - 1) * scanlineLength + col * pixelBytes + i % pixelBytes];
              upperLeft = col && pixels[(row - 1) * scanlineLength + (col - 1) * pixelBytes + i % pixelBytes];
            }
            p = left + upper - upperLeft;
            pa = Math.abs(p - left);
            pb = Math.abs(p - upper);
            pc = Math.abs(p - upperLeft);
            if (pa <= pb && pa <= pc) {
              paeth = left;
            } else if (pb <= pc) {
              paeth = upper;
            } else {
              paeth = upperLeft;
            }
            pixels[c++] = (ccbyte + paeth) % 256;
          }
          break;
        default:
          throw new Error(getError(6018, data[pos - 1]));
      }
      row++;
    }
    return pixels;
  };
  _proto.copyToImageData = function copyToImageData(imageData, pixels) {
    var alpha = this.hasAlphaChannel;
    var palette;
    var colors = this.colors;
    if (this.palette.length) {
      palette = this._decodedPalette != null ? this._decodedPalette : this._decodedPalette = this.decodePalette();
      colors = 4;
      alpha = true;
    }
    var data = imageData.data || imageData;
    var length = data.length;
    var input = palette || pixels;
    var i = 0;
    var j = 0;
    var k = 0;
    var v = 0;
    if (colors === 1) {
      while (i < length) {
        k = palette ? pixels[i / 4] * 4 : j;
        v = input[k++];
        data[i++] = v;
        data[i++] = v;
        data[i++] = v;
        data[i++] = alpha ? input[k++] : 255;
        j = k;
      }
    } else {
      while (i < length) {
        k = palette ? pixels[i / 4] * 4 : j;
        data[i++] = input[k++];
        data[i++] = input[k++];
        data[i++] = input[k++];
        data[i++] = alpha ? input[k++] : 255;
        j = k;
      }
    }
  };
  _proto.decodePalette = function decodePalette() {
    var palette = this.palette;
    var transparency = this.transparency.indexed || [];
    var ret = new Uint8Array((transparency.length || 0) + palette.length);
    var pos = 0;
    var c = 0;
    var _ref1 = 0;
    for (var i = 0, _i = 0, _ref = palette.length; _i < _ref; i = _i += 3) {
      ret[pos++] = palette[i];
      ret[pos++] = palette[i + 1];
      ret[pos++] = palette[i + 2];
      _ref1 = transparency[c++];
      ret[pos++] = _ref1 != null ? _ref1 : 255;
    }
    return ret;
  };
  _proto.render = function render(canvas) {
    canvas.width = this.width;
    canvas.height = this.height;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    var data = ctx.createImageData(this.width, this.height);
    this.copyToImageData(data, this.decodePixels(null));
    ctx.putImageData(data, 0, 0);
  };
  return PNGReader;
}();

var TiffReader = function () {
  function TiffReader() {
    this._littleEndian = false;
    this._tiffData = [];
    this._fileDirectories = [];
    this._canvas = null;
  }
  var _proto = TiffReader.prototype;
  _proto.getUint8 = function getUint8(offset) {
    return this._tiffData[offset];
  };
  _proto.getUint16 = function getUint16(offset) {
    if (this._littleEndian) return this._tiffData[offset + 1] << 8 | this._tiffData[offset];else return this._tiffData[offset] << 8 | this._tiffData[offset + 1];
  };
  _proto.getUint32 = function getUint32(offset) {
    var a = this._tiffData;
    if (this._littleEndian) return a[offset + 3] << 24 | a[offset + 2] << 16 | a[offset + 1] << 8 | a[offset];else return a[offset] << 24 | a[offset + 1] << 16 | a[offset + 2] << 8 | a[offset + 3];
  };
  _proto.checkLittleEndian = function checkLittleEndian() {
    var BOM = this.getUint16(0);
    if (BOM === 0x4949) {
      this._littleEndian = true;
    } else if (BOM === 0x4D4D) {
      this._littleEndian = false;
    } else {
      throw TypeError(getError(6019));
    }
    return this._littleEndian;
  };
  _proto.hasTowel = function hasTowel() {
    if (this.getUint16(2) !== 42) {
      throw RangeError(getError(6020));
    }
    return true;
  };
  _proto.getFieldTypeName = function getFieldTypeName(fieldType) {
    var typeNames = fieldTypeNames;
    if (fieldType in typeNames) {
      return typeNames[fieldType];
    }
    return null;
  };
  _proto.getFieldTagName = function getFieldTagName(fieldTag) {
    var tagNames = fieldTagNames;
    if (fieldTag in tagNames) {
      return tagNames[fieldTag];
    } else {
      logID(6021, fieldTag);
      return "Tag" + fieldTag;
    }
  };
  _proto.getFieldTypeLength = function getFieldTypeLength(fieldTypeName) {
    if (['BYTE', 'ASCII', 'SBYTE', 'UNDEFINED'].indexOf(fieldTypeName) !== -1) {
      return 1;
    } else if (['SHORT', 'SSHORT'].indexOf(fieldTypeName) !== -1) {
      return 2;
    } else if (['LONG', 'SLONG', 'FLOAT'].indexOf(fieldTypeName) !== -1) {
      return 4;
    } else if (['RATIONAL', 'SRATIONAL', 'DOUBLE'].indexOf(fieldTypeName) !== -1) {
      return 8;
    }
    return 0;
  };
  _proto.getFieldValues = function getFieldValues(fieldTagName, fieldTypeName, typeCount, valueOffset) {
    var fieldValues = [];
    var fieldTypeLength = this.getFieldTypeLength(fieldTypeName);
    var fieldValueSize = fieldTypeLength * typeCount;
    if (fieldValueSize <= 4) {
      if (this._littleEndian === false) fieldValues.push(valueOffset >>> (4 - fieldTypeLength) * 8);else fieldValues.push(valueOffset);
    } else {
      for (var i = 0; i < typeCount; i++) {
        var indexOffset = fieldTypeLength * i;
        if (fieldTypeLength >= 8) {
          if (['RATIONAL', 'SRATIONAL'].indexOf(fieldTypeName) !== -1) {
            fieldValues.push(this.getUint32(valueOffset + indexOffset));
            fieldValues.push(this.getUint32(valueOffset + indexOffset + 4));
          } else {
            logID(8000);
          }
        } else {
          fieldValues.push(this.getBytes(fieldTypeLength, valueOffset + indexOffset));
        }
      }
    }
    if (fieldTypeName === 'ASCII') {
      fieldValues.forEach(function (e, i, a) {
        a[i] = String.fromCharCode(e);
      });
    }
    return fieldValues;
  };
  _proto.getBytes = function getBytes(numBytes, offset) {
    if (numBytes <= 0) {
      logID(8001);
    } else if (numBytes <= 1) {
      return this.getUint8(offset);
    } else if (numBytes <= 2) {
      return this.getUint16(offset);
    } else if (numBytes <= 3) {
      return this.getUint32(offset) >>> 8;
    } else if (numBytes <= 4) {
      return this.getUint32(offset);
    } else {
      logID(8002);
    }
    return 0;
  };
  _proto.getBits = function getBits(numBits, byteOffset, bitOffset) {
    bitOffset = bitOffset || 0;
    var extraBytes = Math.floor(bitOffset / 8);
    var newByteOffset = byteOffset + extraBytes;
    var totalBits = bitOffset + numBits;
    var shiftRight = 32 - numBits;
    var shiftLeft = 0;
    var rawBits = 0;
    if (totalBits <= 0) {
      logID(6023);
    } else if (totalBits <= 8) {
      shiftLeft = 24 + bitOffset;
      rawBits = this.getUint8(newByteOffset);
    } else if (totalBits <= 16) {
      shiftLeft = 16 + bitOffset;
      rawBits = this.getUint16(newByteOffset);
    } else if (totalBits <= 32) {
      shiftLeft = bitOffset;
      rawBits = this.getUint32(newByteOffset);
    } else {
      logID(6022);
    }
    return {
      bits: rawBits << shiftLeft >>> shiftRight,
      byteOffset: newByteOffset + Math.floor(totalBits / 8),
      bitOffset: totalBits % 8
    };
  };
  _proto.parseFileDirectory = function parseFileDirectory(offset) {
    var numDirEntries = this.getUint16(offset);
    var tiffFields = {};
    var i = 0;
    var entryCount = 0;
    for (i = offset + 2, entryCount = 0; entryCount < numDirEntries; i += 12, entryCount++) {
      var fieldTag = this.getUint16(i);
      var fieldType = this.getUint16(i + 2);
      var typeCount = this.getUint32(i + 4);
      var valueOffset = this.getUint32(i + 8);
      var fieldTagName = this.getFieldTagName(fieldTag);
      var fieldTypeName = this.getFieldTypeName(fieldType);
      var fieldValues = this.getFieldValues(fieldTagName, fieldTypeName, typeCount, valueOffset);
      tiffFields[fieldTagName] = {
        type: fieldTypeName,
        values: fieldValues
      };
    }
    this._fileDirectories.push(tiffFields);
    var nextIFDByteOffset = this.getUint32(i);
    if (nextIFDByteOffset !== 0x00000000) {
      this.parseFileDirectory(nextIFDByteOffset);
    }
  };
  _proto.clampColorSample = function clampColorSample(colorSample, bitsPerSample) {
    var multiplier = Math.pow(2, 8 - bitsPerSample);
    return Math.floor(colorSample * multiplier + (multiplier - 1));
  };
  _proto.reset = function reset() {
    this._littleEndian = false;
    this._tiffData = [];
    this._fileDirectories = [];
    this._canvas = null;
  };
  _proto.parseTIFF = function parseTIFF(tiffData, canvas) {
    var _this = this;
    canvas = canvas || ccwindow.document.createElement('canvas');
    this._tiffData = tiffData;
    this._canvas = canvas;
    this.checkLittleEndian();
    if (!this.hasTowel()) {
      return;
    }
    var firstIFDByteOffset = this.getUint32(4);
    this._fileDirectories.length = 0;
    this.parseFileDirectory(firstIFDByteOffset);
    var fileDirectory = this._fileDirectories[0];
    var imageWidth = fileDirectory.ImageWidth.values[0];
    var imageLength = fileDirectory.ImageLength.values[0];
    this._canvas.width = imageWidth;
    this._canvas.height = imageLength;
    var strips = [];
    var compression = fileDirectory.Compression ? fileDirectory.Compression.values[0] : 1;
    var samplesPerPixel = fileDirectory.SamplesPerPixel.values[0];
    var sampleProperties = [];
    var bitsPerPixel = 0;
    var hasBytesPerPixel = false;
    fileDirectory.BitsPerSample.values.forEach(function (bitsPerSample, i, bitsPerSampleValues) {
      sampleProperties[i] = {
        bitsPerSample: bitsPerSample,
        hasBytesPerSample: false,
        bytesPerSample: undefined
      };
      if (bitsPerSample % 8 === 0) {
        sampleProperties[i].hasBytesPerSample = true;
        sampleProperties[i].bytesPerSample = bitsPerSample / 8;
      }
      bitsPerPixel += bitsPerSample;
    }, this);
    var bytesPerPixel = 0;
    if (bitsPerPixel % 8 === 0) {
      hasBytesPerPixel = true;
      bytesPerPixel = bitsPerPixel / 8;
    }
    var stripOffsetValues = fileDirectory.StripOffsets.values;
    var numStripOffsetValues = stripOffsetValues.length;
    var stripByteCountValues;
    if (fileDirectory.StripByteCounts) {
      stripByteCountValues = fileDirectory.StripByteCounts.values;
    } else {
      logID(8003);
      if (numStripOffsetValues === 1) {
        stripByteCountValues = [Math.ceil(imageWidth * imageLength * bitsPerPixel / 8)];
      } else {
        throw Error(getError(6024));
      }
    }
    var blockLength = 1;
    var iterations = 1;
    for (var i = 0; i < numStripOffsetValues; i++) {
      var stripOffset = stripOffsetValues[i];
      strips[i] = [];
      var stripByteCount = stripByteCountValues[i];
      for (var byteOffset = 0, bitOffset = 0, jIncrement = 1, getHeader = true, pixel = [], numBytes = 0, sample = 0, currentSample = 0; byteOffset < stripByteCount; byteOffset += jIncrement) {
        switch (compression) {
          case 1:
            pixel = [];
            for (var m = 0; m < samplesPerPixel; m++) {
              var s = sampleProperties[m];
              if (s.hasBytesPerSample) {
                var sampleOffset = s.bytesPerSample * m;
                pixel.push(this.getBytes(s.bytesPerSample, stripOffset + byteOffset + sampleOffset));
              } else {
                var sampleInfo = this.getBits(s.bitsPerSample, stripOffset + byteOffset, bitOffset);
                pixel.push(sampleInfo.bits);
                byteOffset = sampleInfo.byteOffset - stripOffset;
                bitOffset = sampleInfo.bitOffset;
                throw RangeError(getError(6025));
              }
            }
            strips[i].push(pixel);
            if (hasBytesPerPixel) {
              jIncrement = bytesPerPixel;
            } else {
              jIncrement = 0;
              throw RangeError(getError(6026));
            }
            break;
          case 2:
            break;
          case 3:
            break;
          case 4:
            break;
          case 5:
            break;
          case 6:
            break;
          case 7:
            break;
          case 32773:
            if (getHeader) {
              getHeader = false;
              var header = this.getUint8(stripOffset + byteOffset);
              if (header >= 0 && header <= 127) {
                blockLength = header + 1;
              } else if (header >= -127 && header <= -1) {
                iterations = -header + 1;
              } else {
                  getHeader = true;
                }
            } else {
              var currentByte = this.getUint8(stripOffset + byteOffset);
              for (var _m = 0; _m < iterations; _m++) {
                var _s = sampleProperties[sample];
                if (_s.hasBytesPerSample) {
                  currentSample = currentSample << 8 * numBytes | currentByte;
                  numBytes++;
                  if (numBytes === _s.bytesPerSample) {
                    pixel.push(currentSample);
                    currentSample = numBytes = 0;
                    sample++;
                  }
                } else {
                  throw RangeError(getError(6025));
                }
                if (sample === samplesPerPixel) {
                  strips[i].push(pixel);
                  pixel = [];
                  sample = 0;
                }
              }
              blockLength--;
              if (blockLength === 0) {
                getHeader = true;
              }
            }
            jIncrement = 1;
            break;
        }
      }
    }
    var ctx = this._canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = 'rgba(255, 255, 255, 0)';
    var rowsPerStrip = fileDirectory.RowsPerStrip ? fileDirectory.RowsPerStrip.values[0] : imageLength;
    var numStrips = strips.length;
    var imageLengthModRowsPerStrip = imageLength % rowsPerStrip;
    var rowsInLastStrip = imageLengthModRowsPerStrip === 0 ? rowsPerStrip : imageLengthModRowsPerStrip;
    var numRowsInStrip = rowsPerStrip;
    var numRowsInPreviousStrip = 0;
    var photometricInterpretation = fileDirectory.PhotometricInterpretation.values[0];
    var extraSamplesValues = [];
    var numExtraSamples = 0;
    if (fileDirectory.ExtraSamples) {
      extraSamplesValues = fileDirectory.ExtraSamples.values;
      numExtraSamples = extraSamplesValues.length;
    }
    var colorMapValues = [];
    var colorMapSampleSize = 0;
    if (fileDirectory.ColorMap) {
      colorMapValues = fileDirectory.ColorMap.values;
      colorMapSampleSize = Math.pow(2, sampleProperties[0].bitsPerSample);
    }
    for (var _i = 0; _i < numStrips; _i++) {
      if (_i + 1 === numStrips) {
        numRowsInStrip = rowsInLastStrip;
      }
      var numPixels = strips[_i].length;
      var yPadding = numRowsInPreviousStrip * _i;
      for (var y = 0, j = 0; y < numRowsInStrip && j < numPixels; y++) {
        var _loop = function _loop() {
          var pixelSamples = strips[_i][j];
          var red = 0;
          var green = 0;
          var blue = 0;
          var opacity = 1.0;
          if (numExtraSamples > 0) {
            for (var k = 0; k < numExtraSamples; k++) {
              if (extraSamplesValues[k] === 1 || extraSamplesValues[k] === 2) {
                opacity = pixelSamples[3 + k] / 256;
                break;
              }
            }
          }
          switch (photometricInterpretation) {
            case 0:
              {
                var invertValue = 0;
                if (sampleProperties[0].hasBytesPerSample) {
                  invertValue = Math.pow(0x10, sampleProperties[0].bytesPerSample * 2);
                }
                pixelSamples.forEach(function (sample, index, samples) {
                  samples[index] = invertValue - sample;
                });
              }
            case 1:
              {
                red = green = blue = _this.clampColorSample(pixelSamples[0], sampleProperties[0].bitsPerSample);
                break;
              }
            case 2:
              red = _this.clampColorSample(pixelSamples[0], sampleProperties[0].bitsPerSample);
              green = _this.clampColorSample(pixelSamples[1], sampleProperties[1].bitsPerSample);
              blue = _this.clampColorSample(pixelSamples[2], sampleProperties[2].bitsPerSample);
              break;
            case 3:
              {
                if (colorMapValues === undefined) {
                  throw Error(getError(6027));
                }
                var colorMapIndex = pixelSamples[0];
                red = _this.clampColorSample(colorMapValues[colorMapIndex], 16);
                green = _this.clampColorSample(colorMapValues[colorMapSampleSize + colorMapIndex], 16);
                blue = _this.clampColorSample(colorMapValues[2 * colorMapSampleSize + colorMapIndex], 16);
                break;
              }
            default:
              throw RangeError(getError(6028, photometricInterpretation));
          }
          ctx.fillStyle = "rgba(" + red + ", " + green + ", " + blue + ", " + opacity + ")";
          ctx.fillRect(x, yPadding + y, 1, 1);
        };
        for (var x = 0; x < imageWidth; x++, j++) {
          _loop();
        }
      }
      numRowsInPreviousStrip = numRowsInStrip;
    }
  };
  return TiffReader;
}();
var fieldTagNames = {
  0x013B: 'Artist',
  0x0102: 'BitsPerSample',
  0x0109: 'CellLength',
  0x0108: 'CellWidth',
  0x0140: 'ColorMap',
  0x0103: 'Compression',
  0x8298: 'Copyright',
  0x0132: 'DateTime',
  0x0152: 'ExtraSamples',
  0x010A: 'FillOrder',
  0x0121: 'FreeByteCounts',
  0x0120: 'FreeOffsets',
  0x0123: 'GrayResponseCurve',
  0x0122: 'GrayResponseUnit',
  0x013C: 'HostComputer',
  0x010E: 'ImageDescription',
  0x0101: 'ImageLength',
  0x0100: 'ImageWidth',
  0x010F: 'Make',
  0x0119: 'MaxSampleValue',
  0x0118: 'MinSampleValue',
  0x0110: 'Model',
  0x00FE: 'NewSubfileType',
  0x0112: 'Orientation',
  0x0106: 'PhotometricInterpretation',
  0x011C: 'PlanarConfiguration',
  0x0128: 'ResolutionUnit',
  0x0116: 'RowsPerStrip',
  0x0115: 'SamplesPerPixel',
  0x0131: 'Software',
  0x0117: 'StripByteCounts',
  0x0111: 'StripOffsets',
  0x00FF: 'SubfileType',
  0x0107: 'Threshholding',
  0x011A: 'XResolution',
  0x011B: 'YResolution',
  0x0146: 'BadFaxLines',
  0x0147: 'CleanFaxData',
  0x0157: 'ClipPath',
  0x0148: 'ConsecutiveBadFaxLines',
  0x01B1: 'Decode',
  0x01B2: 'DefaultImageColor',
  0x010D: 'DocumentName',
  0x0150: 'DotRange',
  0x0141: 'HalftoneHints',
  0x015A: 'Indexed',
  0x015B: 'JPEGTables',
  0x011D: 'PageName',
  0x0129: 'PageNumber',
  0x013D: 'Predictor',
  0x013F: 'PrimaryChromaticities',
  0x0214: 'ReferenceBlackWhite',
  0x0153: 'SampleFormat',
  0x022F: 'StripRowCounts',
  0x014A: 'SubIFDs',
  0x0124: 'T4Options',
  0x0125: 'T6Options',
  0x0145: 'TileByteCounts',
  0x0143: 'TileLength',
  0x0144: 'TileOffsets',
  0x0142: 'TileWidth',
  0x012D: 'TransferFunction',
  0x013E: 'WhitePoint',
  0x0158: 'XClipPathUnits',
  0x011E: 'XPosition',
  0x0211: 'YCbCrCoefficients',
  0x0213: 'YCbCrPositioning',
  0x0212: 'YCbCrSubSampling',
  0x0159: 'YClipPathUnits',
  0x011F: 'YPosition',
  0x9202: 'ApertureValue',
  0xA001: 'ColorSpace',
  0x9004: 'DateTimeDigitized',
  0x9003: 'DateTimeOriginal',
  0x8769: 'Exif IFD',
  0x9000: 'ExifVersion',
  0x829A: 'ExposureTime',
  0xA300: 'FileSource',
  0x9209: 'Flash',
  0xA000: 'FlashpixVersion',
  0x829D: 'FNumber',
  0xA420: 'ImageUniqueID',
  0x9208: 'LightSource',
  0x927C: 'MakerNote',
  0x9201: 'ShutterSpeedValue',
  0x9286: 'UserComment',
  0x83BB: 'IPTC',
  0x8773: 'ICC Profile',
  0x02BC: 'XMP',
  0xA480: 'GDAL_METADATA',
  0xA481: 'GDAL_NODATA',
  0x8649: 'Photoshop'
};
var fieldTypeNames = {
  0x0001: 'BYTE',
  0x0002: 'ASCII',
  0x0003: 'SHORT',
  0x0004: 'LONG',
  0x0005: 'RATIONAL',
  0x0006: 'SBYTE',
  0x0007: 'UNDEFINED',
  0x0008: 'SSHORT',
  0x0009: 'SLONG',
  0x000A: 'SRATIONAL',
  0x000B: 'FLOAT',
  0x000C: 'DOUBLE'
};
var tiffReader = new TiffReader();

var _dec$1, _dec2$1, _dec3, _dec4, _dec5, _dec6, _class$1, _class2$1, _initializer$1, _initializer2$1, _initializer3$1, _initializer4$1, _initializer5$1, _initializer6$1, _initializer7, _initializer8, _initializer9, _initializer0, _initializer1, _initializer10, _initializer11, _initializer12, _initializer13, _initializer14, _initializer15, _initializer16, _initializer17, _initializer18, _initializer19, _initializer20, _initializer21, _initializer22, _initializer23, _initializer24, _initializer25, _initializer26, _initializer27, _initializer28, _initializer29, _initializer30, _initializer31, _initializer32, _initializer33, _initializer34, _initializer35, _initializer36, _initializer37, _initializer38, _initializer39, _initializer40, _initializer41, _ParticleSystem2D;
var ImageFormat;
(function (ImageFormat) {
  ImageFormat[ImageFormat["JPG"] = 0] = "JPG";
  ImageFormat[ImageFormat["PNG"] = 1] = "PNG";
  ImageFormat[ImageFormat["TIFF"] = 2] = "TIFF";
  ImageFormat[ImageFormat["WEBP"] = 3] = "WEBP";
  ImageFormat[ImageFormat["PVR"] = 4] = "PVR";
  ImageFormat[ImageFormat["ETC"] = 5] = "ETC";
  ImageFormat[ImageFormat["S3TC"] = 6] = "S3TC";
  ImageFormat[ImageFormat["ATITC"] = 7] = "ATITC";
  ImageFormat[ImageFormat["TGA"] = 8] = "TGA";
  ImageFormat[ImageFormat["RAWDATA"] = 9] = "RAWDATA";
  ImageFormat[ImageFormat["UNKNOWN"] = 10] = "UNKNOWN";
})(ImageFormat || (ImageFormat = {}));
function getImageFormatByData(imgData) {
  if (imgData.length > 8 && imgData[0] === 0x89 && imgData[1] === 0x50 && imgData[2] === 0x4E && imgData[3] === 0x47 && imgData[4] === 0x0D && imgData[5] === 0x0A && imgData[6] === 0x1A && imgData[7] === 0x0A) {
    return ImageFormat.PNG;
  }
  if (imgData.length > 2 && (imgData[0] === 0x49 && imgData[1] === 0x49 || imgData[0] === 0x4d && imgData[1] === 0x4d || imgData[0] === 0xff && imgData[1] === 0xd8)) {
    return ImageFormat.TIFF;
  }
  return ImageFormat.UNKNOWN;
}
function getParticleComponents(node) {
  var parent = node.parent;
  var comp = node.getComponent(ParticleSystem2D);
  if (!parent || !comp) {
    return node.getComponentsInChildren(ParticleSystem2D);
  }
  return getParticleComponents(parent);
}
var wrapParseInt = parseInt;
var wrapParseFloat = parseFloat;
var ParticleSystem2D = (_dec$1 = ccclass$1('cc.ParticleSystem2D'), _dec2$1 = type(ParticleAsset), _dec3 = type(SpriteFrame), _dec4 = type(PositionType), _dec5 = type(EmitterMode), _dec6 = formerlySerializedAs('preview'), _dec$1(_class$1 = (_class2$1 = (_ParticleSystem2D = function (_UIRenderer) {
  function ParticleSystem2D() {
    var _this;
    _this = _UIRenderer.call(this) || this;
    _this.duration = _initializer$1 && _initializer$1();
    _this.emissionRate = _initializer2$1 && _initializer2$1();
    _this.life = _initializer3$1 && _initializer3$1();
    _this.lifeVar = _initializer4$1 && _initializer4$1();
    _this.angle = _initializer5$1 && _initializer5$1();
    _this.angleVar = _initializer6$1 && _initializer6$1();
    _this.startSize = _initializer7 && _initializer7();
    _this.startSizeVar = _initializer8 && _initializer8();
    _this.endSize = _initializer9 && _initializer9();
    _this.endSizeVar = _initializer0 && _initializer0();
    _this.startSpin = _initializer1 && _initializer1();
    _this.startSpinVar = _initializer10 && _initializer10();
    _this.endSpin = _initializer11 && _initializer11();
    _this.endSpinVar = _initializer12 && _initializer12();
    _this.sourcePos = _initializer13 && _initializer13();
    _this.posVar = _initializer14 && _initializer14();
    _this.emitterMode = _initializer15 && _initializer15();
    _this.gravity = _initializer16 && _initializer16();
    _this.speed = _initializer17 && _initializer17();
    _this.speedVar = _initializer18 && _initializer18();
    _this.tangentialAccel = _initializer19 && _initializer19();
    _this.tangentialAccelVar = _initializer20 && _initializer20();
    _this.radialAccel = _initializer21 && _initializer21();
    _this.radialAccelVar = _initializer22 && _initializer22();
    _this.rotationIsDir = _initializer23 && _initializer23();
    _this.startRadius = _initializer24 && _initializer24();
    _this.startRadiusVar = _initializer25 && _initializer25();
    _this.endRadius = _initializer26 && _initializer26();
    _this.endRadiusVar = _initializer27 && _initializer27();
    _this.rotatePerS = _initializer28 && _initializer28();
    _this.rotatePerSVar = _initializer29 && _initializer29();
    _this.aspectRatio = 1;
    _this.playOnLoad = _initializer30 && _initializer30();
    _this.autoRemoveOnFinish = _initializer31 && _initializer31();
    _this._preview = _initializer32 && _initializer32();
    _this._custom = _initializer33 && _initializer33();
    _this._file = _initializer34 && _initializer34();
    _this._spriteFrame = _initializer35 && _initializer35();
    _this._totalParticles = _initializer36 && _initializer36();
    _this._startColor = _initializer37 && _initializer37();
    _this._startColorVar = _initializer38 && _initializer38();
    _this._endColor = _initializer39 && _initializer39();
    _this._endColorVar = _initializer40 && _initializer40();
    _this._positionType = _initializer41 && _initializer41();
    _this._stopped = true;
    _this._useFile = void 0;
    _this.initProperties();
    _this._useFile = false;
    return _this;
  }
  _inheritsLoose(ParticleSystem2D, _UIRenderer);
  var _proto = ParticleSystem2D.prototype;
  _proto.onEnable = function onEnable() {
    _UIRenderer.prototype.onEnable.call(this);
    this._updateMaterial();
    this._updatePositionType();
  };
  _proto.onDestroy = function onDestroy() {
    _UIRenderer.prototype.onDestroy.call(this);
    if (this.autoRemoveOnFinish) {
      this.autoRemoveOnFinish = false;
    }
    this._simulator.uvFilled = 0;
    this.destroyRenderData();
  };
  _proto.initProperties = function initProperties() {
    this._previewTimer = null;
    this._focused = false;
    this.aspectRatio = 1;
    this._simulator = new Simulator(this);
  };
  _proto.onFocusInEditor = function onFocusInEditor() {
    this._focused = true;
    var components = getParticleComponents(this.node);
    for (var i = 0; i < components.length; ++i) {
      components[i]._startPreview();
    }
  };
  _proto.onLostFocusInEditor = function onLostFocusInEditor() {
    this._focused = false;
    var components = getParticleComponents(this.node);
    for (var i = 0; i < components.length; ++i) {
      components[i]._stopPreview();
    }
  };
  _proto._startPreview = function _startPreview() {
    if (this._preview) {
      this.resetSystem();
    }
  };
  _proto._stopPreview = function _stopPreview() {
    if (this._preview) {
      this.resetSystem();
      this.stopSystem();
    }
    if (this._previewTimer) {
      clearInterval(this._previewTimer);
    }
  };
  _proto.__preload = function __preload() {
    _UIRenderer.prototype.__preload.call(this);
    if (this._custom && this.spriteFrame && !this._renderSpriteFrame) {
      this._applySpriteFrame();
    } else if (this._file) {
      if (this._custom) {
        var missCustomTexture = !this._getTexture();
        if (missCustomTexture) {
          this._applyFile();
        }
      } else {
        this._applyFile();
      }
    }
    {
      if (this.playOnLoad) {
        this.resetSystem();
      }
    }
  };
  _proto.destroyRenderData = function destroyRenderData() {
    if (this._simulator.renderData) {
      var assembler = this._assembler;
      if (assembler && assembler.removeData) {
        assembler.removeData(this._simulator.renderData);
      }
      this._simulator.renderData = null;
    }
    _UIRenderer.prototype.destroyRenderData.call(this);
  };
  _proto._flushAssembler = function _flushAssembler() {
    var assembler = ParticleSystem2D.Assembler.getAssembler(this);
    if (this._assembler !== assembler) {
      this._assembler = assembler;
    }
    if (this._assembler && this._assembler.createData) {
      var simulator = this._simulator;
      var renderData = simulator.renderData;
      if (!renderData) {
        renderData = simulator.renderData = this._assembler.createData(this);
        simulator.uvFilled = 0;
        renderData.particleInitRenderDrawInfo(this.renderEntity);
        simulator.initDrawInfo();
      }
    }
  };
  _proto.lateUpdate = function lateUpdate(dt) {
    if (!this._simulator.finished) {
      this._simulator.step(dt);
    }
  };
  _proto.addParticle = function addParticle() {};
  _proto.stopSystem = function stopSystem() {
    this._stopped = true;
    this._simulator.stop();
  };
  _proto.resetSystem = function resetSystem() {
    this._stopped = false;
    this._simulator.reset();
    this._markForUpdateRenderData();
  };
  _proto.isFull = function isFull() {
    return this.particleCount >= this.totalParticles;
  };
  _proto._applyFile = function _applyFile() {
    var file = this._file;
    if (file) {
      if (!file) {
        errorID(6029);
        return;
      }
      if (!this.isValid) {
        return;
      }
      this._plistFile = file.nativeUrl;
      if (!this._custom) {
        var isDiffFrame = this._spriteFrame !== file.spriteFrame;
        if (isDiffFrame) this.spriteFrame = file.spriteFrame;
        this._initWithDictionary(file._nativeAsset);
      }
      if (!this._spriteFrame) {
        if (file.spriteFrame) {
          this.spriteFrame = file.spriteFrame;
        } else if (this._custom) {
          this._initTextureWithDictionary(file._nativeAsset);
        }
      } else if (!this._renderSpriteFrame && this._spriteFrame) {
        this._applySpriteFrame();
      }
    }
  };
  _proto._initTextureWithDictionary = function _initTextureWithDictionary(dict) {
    var _this2 = this;
    if (dict.spriteFrameUuid) {
      var spriteFrameUuid = dict.spriteFrameUuid;
      assetManager.loadAny(spriteFrameUuid, function (err, spriteFrame) {
        if (!_this2.isValid) return;
        if (err) {
          dict.spriteFrameUuid = undefined;
          _this2._initTextureWithDictionary(dict);
          error(err);
        } else {
          _this2.spriteFrame = spriteFrame;
        }
      });
    } else {
      var imgPath = changeBasename(this._plistFile, dict.textureFileName || '');
      if (dict.textureFileName) {
        assetManager.loadRemote(imgPath, function (err, imageAsset) {
          if (!_this2.isValid) return;
          if (err) {
            dict.textureFileName = undefined;
            _this2._initTextureWithDictionary(dict);
            error(err);
          } else {
            if (imageAsset) {
              _this2.spriteFrame = SpriteFrame.createWithImage(imageAsset);
            } else {
              _this2.spriteFrame = SpriteFrame.createWithImage(builtinResMgr.get('white-texture'));
            }
          }
        });
      } else if (dict.textureImageData) {
        var textureData = dict.textureImageData;
        if (textureData && textureData.length > 0) {
          var imgPathName = imgPath;
          if (this.file) {
            imgPathName += "-" + this.file.uuid;
          }
          var imageAsset = assetManager.assets.get(imgPathName);
          if (!imageAsset) {
            var buffer = codec.unzipBase64AsArray(textureData, 1);
            if (!buffer) {
              warnID(6030, this._file.name);
              return false;
            }
            var imageFormat = getImageFormatByData(buffer);
            if (imageFormat !== ImageFormat.TIFF && imageFormat !== ImageFormat.PNG) {
              warnID(6031, this._file.name);
              return false;
            }
            var canvasObj = ccwindow.document.createElement('canvas');
            if (imageFormat === ImageFormat.PNG) {
              var myPngObj = new PNGReader(buffer);
              myPngObj.render(canvasObj);
            } else {
              tiffReader.parseTIFF(buffer, canvasObj);
              tiffReader.reset();
            }
            imageAsset = new ImageAsset(canvasObj);
            assetManager.assets.add(imgPathName, imageAsset);
          }
          if (!imageAsset) {
            warnID(6032, this._file.name);
          }
          if (imageAsset) {
            this.spriteFrame = SpriteFrame.createWithImage(imageAsset);
          } else {
            this.spriteFrame = SpriteFrame.createWithImage(builtinResMgr.get('white-texture'));
          }
        } else {
          return false;
        }
      }
    }
    return true;
  };
  _proto._initWithDictionary = function _initWithDictionary(dict) {
    this._useFile = true;
    this.totalParticles = wrapParseInt(dict.maxParticles || 0);
    this.life = wrapParseFloat(dict.particleLifespan || 0);
    this.lifeVar = wrapParseFloat(dict.particleLifespanVariance || 0);
    var _tempEmissionRate = dict.emissionRate;
    if (_tempEmissionRate) {
      this.emissionRate = _tempEmissionRate;
    } else {
      this.emissionRate = Math.min(this.totalParticles / this.life, Number.MAX_VALUE);
    }
    this.duration = wrapParseFloat(dict.duration || 0);
    this._srcBlendFactor = wrapParseInt(dict.blendFuncSource || BlendFactor.SRC_ALPHA);
    this._dstBlendFactor = wrapParseInt(dict.blendFuncDestination || BlendFactor.ONE_MINUS_SRC_ALPHA);
    var locStartColor = this._startColor;
    locStartColor.r = wrapParseFloat(dict.startColorRed || 0) * 255;
    locStartColor.g = wrapParseFloat(dict.startColorGreen || 0) * 255;
    locStartColor.b = wrapParseFloat(dict.startColorBlue || 0) * 255;
    locStartColor.a = wrapParseFloat(dict.startColorAlpha || 0) * 255;
    var locStartColorVar = this._startColorVar;
    locStartColorVar.r = wrapParseFloat(dict.startColorVarianceRed || 0) * 255;
    locStartColorVar.g = wrapParseFloat(dict.startColorVarianceGreen || 0) * 255;
    locStartColorVar.b = wrapParseFloat(dict.startColorVarianceBlue || 0) * 255;
    locStartColorVar.a = wrapParseFloat(dict.startColorVarianceAlpha || 0) * 255;
    var locEndColor = this._endColor;
    locEndColor.r = wrapParseFloat(dict.finishColorRed || 0) * 255;
    locEndColor.g = wrapParseFloat(dict.finishColorGreen || 0) * 255;
    locEndColor.b = wrapParseFloat(dict.finishColorBlue || 0) * 255;
    locEndColor.a = wrapParseFloat(dict.finishColorAlpha || 0) * 255;
    var locEndColorVar = this._endColorVar;
    locEndColorVar.r = wrapParseFloat(dict.finishColorVarianceRed || 0) * 255;
    locEndColorVar.g = wrapParseFloat(dict.finishColorVarianceGreen || 0) * 255;
    locEndColorVar.b = wrapParseFloat(dict.finishColorVarianceBlue || 0) * 255;
    locEndColorVar.a = wrapParseFloat(dict.finishColorVarianceAlpha || 0) * 255;
    this.startSize = wrapParseFloat(dict.startParticleSize || 0);
    this.startSizeVar = wrapParseFloat(dict.startParticleSizeVariance || 0);
    this.endSize = wrapParseFloat(dict.finishParticleSize || 0);
    this.endSizeVar = wrapParseFloat(dict.finishParticleSizeVariance || 0);
    this.positionType = wrapParseFloat(dict.positionType !== undefined ? dict.positionType : PositionType.FREE);
    this.sourcePos.set(0, 0);
    this.posVar.set(wrapParseFloat(dict.sourcePositionVariancex || 0), wrapParseFloat(dict.sourcePositionVariancey || 0));
    this.angle = wrapParseFloat(dict.angle || 0);
    this.angleVar = wrapParseFloat(dict.angleVariance || 0);
    this.startSpin = wrapParseFloat(dict.rotationStart || 0);
    this.startSpinVar = wrapParseFloat(dict.rotationStartVariance || 0);
    this.endSpin = wrapParseFloat(dict.rotationEnd || 0);
    this.endSpinVar = wrapParseFloat(dict.rotationEndVariance || 0);
    this.emitterMode = wrapParseInt(dict.emitterType || EmitterMode.GRAVITY);
    if (this.emitterMode === EmitterMode.GRAVITY) {
      this.gravity.set(wrapParseFloat(dict.gravityx || 0), wrapParseFloat(dict.gravityy || 0));
      this.speed = wrapParseFloat(dict.speed || 0);
      this.speedVar = wrapParseFloat(dict.speedVariance || 0);
      this.radialAccel = wrapParseFloat(dict.radialAcceleration || 0);
      this.radialAccelVar = wrapParseFloat(dict.radialAccelVariance || 0);
      this.tangentialAccel = wrapParseFloat(dict.tangentialAcceleration || 0);
      this.tangentialAccelVar = wrapParseFloat(dict.tangentialAccelVariance || 0);
      var locRotationIsDir = dict.rotationIsDir || '';
      if (locRotationIsDir !== null) {
        locRotationIsDir = locRotationIsDir.toString().toLowerCase();
        this.rotationIsDir = locRotationIsDir === 'true' || locRotationIsDir === '1';
      } else {
        this.rotationIsDir = false;
      }
    } else if (this.emitterMode === EmitterMode.RADIUS) {
      this.startRadius = wrapParseFloat(dict.maxRadius || 0);
      this.startRadiusVar = wrapParseFloat(dict.maxRadiusVariance || 0);
      this.endRadius = wrapParseFloat(dict.minRadius || 0);
      this.endRadiusVar = wrapParseFloat(dict.minRadiusVariance || 0);
      this.rotatePerS = wrapParseFloat(dict.rotatePerSecond || 0);
      this.rotatePerSVar = wrapParseFloat(dict.rotatePerSecondVariance || 0);
    } else {
      warnID(6009);
      return false;
    }
    this._initTextureWithDictionary(dict);
    return true;
  };
  _proto._syncAspect = function _syncAspect() {
    if (this._renderSpriteFrame) {
      var frameRect = this._renderSpriteFrame.rect;
      this.aspectRatio = frameRect.width / frameRect.height;
    }
  };
  _proto._applySpriteFrame = function _applySpriteFrame() {
    this._renderSpriteFrame = this._renderSpriteFrame || this._spriteFrame;
    if (this._renderSpriteFrame) {
      if (this._renderSpriteFrame.texture) {
        if (this._simulator) {
          this._simulator.updateUVs(true);
        }
        this._syncAspect();
        this._updateMaterial();
        this._stopped = false;
        this._markForUpdateRenderData();
      }
    } else {
      this.resetSystem();
    }
  };
  _proto._getTexture = function _getTexture() {
    return this._renderSpriteFrame && this._renderSpriteFrame.texture;
  };
  _proto._updateMaterial = function _updateMaterial() {
    if (this._customMaterial) {
      this.setSharedMaterial(this._customMaterial, 0);
      var target = this.getRenderMaterial(0).passes[0].blendState.targets[0];
      this._dstBlendFactor = target.blendDst;
      this._srcBlendFactor = target.blendSrc;
    }
    var mat = this.getMaterialInstance(0);
    if (mat) mat.recompileShaders({
      USE_LOCAL: this._positionType !== PositionType.FREE
    });
    if (mat && mat.passes.length > 0) {
      this._updateBlendFunc();
    }
  };
  _proto._finishedSimulation = function _finishedSimulation() {
    this.resetSystem();
    this.stopSystem();
    this._markForUpdateRenderData();
    if (this.autoRemoveOnFinish && this._stopped) {
      this.node.destroy();
    }
  };
  _proto._canRender = function _canRender() {
    return _UIRenderer.prototype._canRender.call(this) && !this._stopped && this._renderSpriteFrame !== null && this._renderSpriteFrame !== undefined;
  };
  _proto._render = function _render(render) {
    if (this._positionType === PositionType.RELATIVE) {
      render.commitComp(this, this._simulator.renderData, this._renderSpriteFrame, this._assembler, this.node.parent);
    } else if (this.positionType === PositionType.GROUPED) {
      render.commitComp(this, this._simulator.renderData, this._renderSpriteFrame, this._assembler, this.node);
    } else {
      render.commitComp(this, this._simulator.renderData, this._renderSpriteFrame, this._assembler, null);
    }
  };
  _proto._updatePositionType = function _updatePositionType() {
    if (this._positionType === PositionType.RELATIVE) {
      this._renderEntity.setRenderTransform(this.node.parent);
      this._renderEntity.setUseLocal(true);
    } else if (this.positionType === PositionType.GROUPED) {
      this._renderEntity.setRenderTransform(this.node);
      this._renderEntity.setUseLocal(true);
    } else {
      this._renderEntity.setRenderTransform(null);
      this._renderEntity.setUseLocal(false);
    }
  };
  return _createClass(ParticleSystem2D, [{
    key: "custom",
    get: function get() {
      return this._custom;
    },
    set: function set(value) {
      if (this._custom !== value) {
        this._custom = value;
        this._applyFile();
        this._updateMaterial();
      }
    }
  }, {
    key: "file",
    get: function get() {
      return this._file;
    },
    set: function set(value) {
      if (this._file !== value) {
        this._file = value;
        if (value) {
          this._applyFile();
        } else {
          this.custom = true;
        }
      }
    }
  }, {
    key: "spriteFrame",
    get: function get() {
      return this._spriteFrame;
    },
    set: function set(value) {
      var lastSprite = this._renderSpriteFrame;
      if (lastSprite === value) {
        return;
      }
      this._renderSpriteFrame = value;
      if (!value || value._uuid) {
        this._spriteFrame = value;
      }
      this._applySpriteFrame();
    }
  }, {
    key: "particleCount",
    get: function get() {
      return this._simulator.particles.length;
    }
  }, {
    key: "totalParticles",
    get: function get() {
      return this._totalParticles;
    },
    set: function set(value) {
      if (this._totalParticles === value) return;
      this._totalParticles = value;
    }
  }, {
    key: "startColor",
    get: function get() {
      return this._startColor;
    },
    set: function set(val) {
      this._startColor.r = val.r;
      this._startColor.g = val.g;
      this._startColor.b = val.b;
      this._startColor.a = val.a;
    }
  }, {
    key: "startColorVar",
    get: function get() {
      return this._startColorVar;
    },
    set: function set(val) {
      this._startColorVar.r = val.r;
      this._startColorVar.g = val.g;
      this._startColorVar.b = val.b;
      this._startColorVar.a = val.a;
    }
  }, {
    key: "color",
    get: function get() {
      return this._color;
    },
    set: function set(value) {}
  }, {
    key: "endColor",
    get: function get() {
      return this._endColor;
    },
    set: function set(val) {
      this._endColor.r = val.r;
      this._endColor.g = val.g;
      this._endColor.b = val.b;
      this._endColor.a = val.a;
    }
  }, {
    key: "endColorVar",
    get: function get() {
      return this._endColorVar;
    },
    set: function set(val) {
      this._endColorVar.r = val.r;
      this._endColorVar.g = val.g;
      this._endColorVar.b = val.b;
      this._endColorVar.a = val.a;
    }
  }, {
    key: "positionType",
    get: function get() {
      return this._positionType;
    },
    set: function set(val) {
      this._positionType = val;
      this._updateMaterial();
      this._updatePositionType();
    }
  }, {
    key: "preview",
    get: function get() {
      return this._preview;
    },
    set: function set(val) {
      if (val) {
        this._startPreview();
      } else {
        this._stopPreview();
      }
      this._preview = val;
    }
  }, {
    key: "stopped",
    get: function get() {
      return this._stopped;
    }
  }, {
    key: "active",
    get: function get() {
      return this._simulator.active;
    }
  }, {
    key: "assembler",
    get: function get() {
      return this._assembler;
    }
  }]);
}(UIRenderer), _ParticleSystem2D.EmitterMode = EmitterMode, _ParticleSystem2D.PositionType = PositionType, _ParticleSystem2D.DURATION_INFINITY = DURATION_INFINITY, _ParticleSystem2D.START_SIZE_EQUAL_TO_END_SIZE = START_SIZE_EQUAL_TO_END_SIZE, _ParticleSystem2D.START_RADIUS_EQUAL_TO_END_RADIUS = START_RADIUS_EQUAL_TO_END_RADIUS, _ParticleSystem2D), _applyDecoratedDescriptor(_class2$1.prototype, "file", [_dec2$1], Object.getOwnPropertyDescriptor(_class2$1.prototype, "file"), _class2$1.prototype), _applyDecoratedDescriptor(_class2$1.prototype, "spriteFrame", [_dec3], Object.getOwnPropertyDescriptor(_class2$1.prototype, "spriteFrame"), _class2$1.prototype), _initializer$1 = applyDecoratedInitializer(_class2$1.prototype, "duration", [serializable$1], function () {
  return -1;
}), _initializer2$1 = applyDecoratedInitializer(_class2$1.prototype, "emissionRate", [serializable$1], function () {
  return 10;
}), _initializer3$1 = applyDecoratedInitializer(_class2$1.prototype, "life", [serializable$1], function () {
  return 1;
}), _initializer4$1 = applyDecoratedInitializer(_class2$1.prototype, "lifeVar", [serializable$1], function () {
  return 0;
}), _applyDecoratedDescriptor(_class2$1.prototype, "color", [override], Object.getOwnPropertyDescriptor(_class2$1.prototype, "color"), _class2$1.prototype), _initializer5$1 = applyDecoratedInitializer(_class2$1.prototype, "angle", [serializable$1], function () {
  return 90;
}), _initializer6$1 = applyDecoratedInitializer(_class2$1.prototype, "angleVar", [serializable$1], function () {
  return 20;
}), _initializer7 = applyDecoratedInitializer(_class2$1.prototype, "startSize", [serializable$1], function () {
  return 50;
}), _initializer8 = applyDecoratedInitializer(_class2$1.prototype, "startSizeVar", [serializable$1], function () {
  return 0;
}), _initializer9 = applyDecoratedInitializer(_class2$1.prototype, "endSize", [serializable$1], function () {
  return 0;
}), _initializer0 = applyDecoratedInitializer(_class2$1.prototype, "endSizeVar", [serializable$1], function () {
  return 0;
}), _initializer1 = applyDecoratedInitializer(_class2$1.prototype, "startSpin", [serializable$1], function () {
  return 0;
}), _initializer10 = applyDecoratedInitializer(_class2$1.prototype, "startSpinVar", [serializable$1], function () {
  return 0;
}), _initializer11 = applyDecoratedInitializer(_class2$1.prototype, "endSpin", [serializable$1], function () {
  return 0;
}), _initializer12 = applyDecoratedInitializer(_class2$1.prototype, "endSpinVar", [serializable$1], function () {
  return 0;
}), _initializer13 = applyDecoratedInitializer(_class2$1.prototype, "sourcePos", [serializable$1], function () {
  return Vec2.ZERO.clone();
}), _initializer14 = applyDecoratedInitializer(_class2$1.prototype, "posVar", [serializable$1], function () {
  return Vec2.ZERO.clone();
}), _applyDecoratedDescriptor(_class2$1.prototype, "positionType", [_dec4], Object.getOwnPropertyDescriptor(_class2$1.prototype, "positionType"), _class2$1.prototype), _initializer15 = applyDecoratedInitializer(_class2$1.prototype, "emitterMode", [serializable$1, _dec5], function () {
  return EmitterMode.GRAVITY;
}), _initializer16 = applyDecoratedInitializer(_class2$1.prototype, "gravity", [serializable$1], function () {
  return Vec2.ZERO.clone();
}), _initializer17 = applyDecoratedInitializer(_class2$1.prototype, "speed", [serializable$1], function () {
  return 180;
}), _initializer18 = applyDecoratedInitializer(_class2$1.prototype, "speedVar", [serializable$1], function () {
  return 50;
}), _initializer19 = applyDecoratedInitializer(_class2$1.prototype, "tangentialAccel", [serializable$1], function () {
  return 80;
}), _initializer20 = applyDecoratedInitializer(_class2$1.prototype, "tangentialAccelVar", [serializable$1], function () {
  return 0;
}), _initializer21 = applyDecoratedInitializer(_class2$1.prototype, "radialAccel", [serializable$1], function () {
  return 0;
}), _initializer22 = applyDecoratedInitializer(_class2$1.prototype, "radialAccelVar", [serializable$1], function () {
  return 0;
}), _initializer23 = applyDecoratedInitializer(_class2$1.prototype, "rotationIsDir", [serializable$1], function () {
  return false;
}), _initializer24 = applyDecoratedInitializer(_class2$1.prototype, "startRadius", [serializable$1], function () {
  return 0;
}), _initializer25 = applyDecoratedInitializer(_class2$1.prototype, "startRadiusVar", [serializable$1], function () {
  return 0;
}), _initializer26 = applyDecoratedInitializer(_class2$1.prototype, "endRadius", [serializable$1], function () {
  return 0;
}), _initializer27 = applyDecoratedInitializer(_class2$1.prototype, "endRadiusVar", [serializable$1], function () {
  return 0;
}), _initializer28 = applyDecoratedInitializer(_class2$1.prototype, "rotatePerS", [serializable$1], function () {
  return 0;
}), _initializer29 = applyDecoratedInitializer(_class2$1.prototype, "rotatePerSVar", [serializable$1], function () {
  return 0;
}), _initializer30 = applyDecoratedInitializer(_class2$1.prototype, "playOnLoad", [serializable$1], function () {
  return true;
}), _initializer31 = applyDecoratedInitializer(_class2$1.prototype, "autoRemoveOnFinish", [serializable$1], function () {
  return false;
}), _initializer32 = applyDecoratedInitializer(_class2$1.prototype, "_preview", [_dec6], function () {
  return true;
}), _initializer33 = applyDecoratedInitializer(_class2$1.prototype, "_custom", [serializable$1], function () {
  return false;
}), _initializer34 = applyDecoratedInitializer(_class2$1.prototype, "_file", [serializable$1], function () {
  return null;
}), _initializer35 = applyDecoratedInitializer(_class2$1.prototype, "_spriteFrame", [serializable$1], function () {
  return null;
}), _initializer36 = applyDecoratedInitializer(_class2$1.prototype, "_totalParticles", [serializable$1], function () {
  return 150;
}), _initializer37 = applyDecoratedInitializer(_class2$1.prototype, "_startColor", [serializable$1], function () {
  return new Color(255, 255, 255, 255);
}), _initializer38 = applyDecoratedInitializer(_class2$1.prototype, "_startColorVar", [serializable$1], function () {
  return new Color(0, 0, 0, 0);
}), _initializer39 = applyDecoratedInitializer(_class2$1.prototype, "_endColor", [serializable$1], function () {
  return new Color(255, 255, 255, 0);
}), _initializer40 = applyDecoratedInitializer(_class2$1.prototype, "_endColorVar", [serializable$1], function () {
  return new Color(0, 0, 0, 0);
}), _initializer41 = applyDecoratedInitializer(_class2$1.prototype, "_positionType", [serializable$1], function () {
  return PositionType.FREE;
}), _class2$1)) || _class$1);

var _dec, _dec2, _class, _class2, _initializer, _initializer2, _initializer3, _initializer4, _initializer5, _initializer6, _MotionStreak;
var Point = function () {
  function Point(point, dir) {
    this.point = new Vec2();
    this.dir = new Vec2();
    this.distance = 0;
    this.time = 0;
    if (point) this.point.set(point);
    if (dir) this.dir.set(dir);
  }
  var _proto = Point.prototype;
  _proto.setPoint = function setPoint(x, y) {
    this.point.x = x;
    this.point.y = y;
  };
  _proto.setDir = function setDir(x, y) {
    this.dir.x = x;
    this.dir.y = y;
  };
  return Point;
}();
var MotionStreak = (_dec = ccclass$1('cc.MotionStreak'), _dec2 = type(Texture2D), _dec(_class = (_class2 = (_MotionStreak = function (_UIRenderer) {
  function MotionStreak() {
    var _this;
    _this = _UIRenderer.call(this) || this;
    _this._preview = _initializer && _initializer();
    _this._fadeTime = _initializer2 && _initializer2();
    _this._minSeg = _initializer3 && _initializer3();
    _this._stroke = _initializer4 && _initializer4();
    _this._texture = _initializer5 && _initializer5();
    _this._fastMode = _initializer6 && _initializer6();
    _this._points = [];
    _this.setFillColorType(RenderEntityFillColorType.VERTEX);
    return _this;
  }
  _inheritsLoose(MotionStreak, _UIRenderer);
  var _proto2 = MotionStreak.prototype;
  _proto2.onEnable = function onEnable() {
    _UIRenderer.prototype.onEnable.call(this);
    this.reset();
  };
  _proto2._flushAssembler = function _flushAssembler() {
    var assembler = MotionStreak.Assembler.getAssembler(this);
    if (this._assembler !== assembler) {
      this._assembler = assembler;
    }
    if (!this._renderData) {
      if (this._assembler && this._assembler.createData) {
        this._renderData = this._assembler.createData(this);
        this._renderData.material = this.material;
        this._updateColor();
      }
    }
  };
  _proto2.onFocusInEditor = function onFocusInEditor() {
    if (this._preview) {
      this.reset();
    }
  };
  _proto2.onLostFocusInEditor = function onLostFocusInEditor() {
    if (this._preview) {
      this.reset();
    }
  };
  _proto2.reset = function reset() {
    this._points.length = 0;
    if (this._renderData) this._renderData.clear();
  };
  _proto2.lateUpdate = function lateUpdate(dt) {
    if (this._assembler && this._assembler.update) {
      this._assembler.update(this, dt);
    }
  };
  _proto2._render = function _render(render) {
    render.commitComp(this, this._renderData, this._texture, this._assembler, null);
  };
  return _createClass(MotionStreak, [{
    key: "preview",
    get: function get() {
      return this._preview;
    },
    set: function set(val) {
      this._preview = val;
      this.reset();
    }
  }, {
    key: "fadeTime",
    get: function get() {
      return this._fadeTime;
    },
    set: function set(val) {
      this._fadeTime = val;
      this.reset();
    }
  }, {
    key: "minSeg",
    get: function get() {
      return this._minSeg;
    },
    set: function set(val) {
      this._minSeg = val;
    }
  }, {
    key: "stroke",
    get: function get() {
      return this._stroke;
    },
    set: function set(val) {
      this._stroke = val;
    }
  }, {
    key: "texture",
    get: function get() {
      return this._texture;
    },
    set: function set(val) {
      if (this._texture === val) return;
      this._texture = val;
    }
  }, {
    key: "fastMode",
    get: function get() {
      return this._fastMode;
    },
    set: function set(val) {
      this._fastMode = val;
    }
  }, {
    key: "points",
    get: function get() {
      return this._points;
    }
  }]);
}(UIRenderer), _MotionStreak.Point = Point, _MotionStreak), _applyDecoratedDescriptor(_class2.prototype, "texture", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "texture"), _class2.prototype), _initializer = applyDecoratedInitializer(_class2.prototype, "_preview", [serializable$1], function () {
  return false;
}), _initializer2 = applyDecoratedInitializer(_class2.prototype, "_fadeTime", [serializable$1], function () {
  return 1;
}), _initializer3 = applyDecoratedInitializer(_class2.prototype, "_minSeg", [serializable$1], function () {
  return 1;
}), _initializer4 = applyDecoratedInitializer(_class2.prototype, "_stroke", [serializable$1], function () {
  return 64;
}), _initializer5 = applyDecoratedInitializer(_class2.prototype, "_texture", [serializable$1], function () {
  return null;
}), _initializer6 = applyDecoratedInitializer(_class2.prototype, "_fastMode", [serializable$1], function () {
  return false;
}), _class2)) || _class);

var _normal = new Vec2();
var _vec2 = new Vec2();
function normal(out, dir) {
  out.x = -dir.y;
  out.y = dir.x;
  return out;
}
var MotionStreakAssembler = function () {
  function MotionStreakAssembler() {}
  var _proto = MotionStreakAssembler.prototype;
  _proto.createData = function createData(comp) {
    var renderData = comp.requestRenderData();
    renderData.dataLength = 4;
    renderData.resize(16, (16 - 2) * 3);
    return renderData;
  };
  _proto.update = function update(comp, dt) {
    var stroke = comp.stroke / 2;
    var node = comp.node;
    var matrix = node.worldMatrix;
    var tx = matrix.m12;
    var ty = matrix.m13;
    var points = comp.points;
    var cur;
    if (points.length > 1) {
      var point = points[0];
      var difx = point.point.x - tx;
      var dify = point.point.y - ty;
      if (difx * difx + dify * dify < comp.minSeg) {
        cur = point;
      }
    }
    if (!cur) {
      cur = new Point();
      points.unshift(cur);
    }
    cur.setPoint(tx, ty);
    cur.time = comp.fadeTime + dt;
    var vertexCount = 0;
    var indexCount = 0;
    var renderData = comp.renderData;
    if (points.length < 2 || !renderData) {
      return;
    }
    this.updateRenderDataCache(comp, renderData);
    var color = comp.color;
    var cr = color.r;
    var cg = color.g;
    var cb = color.b;
    var ca = node._uiProps.opacity * color.a;
    var prev = points[1];
    prev.distance = Vec2.subtract(_vec2, cur.point, prev.point).length();
    _vec2.normalize();
    prev.setDir(_vec2.x, _vec2.y);
    cur.setDir(_vec2.x, _vec2.y);
    renderData.dataLength = points.length * 2;
    var data = renderData.data;
    var fadeTime = comp.fadeTime;
    var findLast = false;
    for (var i = points.length - 1; i >= 0; i--) {
      var p = points[i];
      var _point = p.point;
      var dir = p.dir;
      p.time -= dt;
      if (p.time < 0) {
        points.splice(i, 1);
        continue;
      }
      var progress = p.time / fadeTime;
      var next = points[i - 1];
      if (!findLast) {
        if (!next) {
          points.splice(i, 1);
          continue;
        }
        _point.x = next.point.x - dir.x * progress;
        _point.y = next.point.y - dir.y * progress;
      }
      findLast = true;
      normal(_normal, dir);
      var da = progress * ca;
      var offset = vertexCount;
      data[offset].x = _point.x + _normal.x * stroke;
      data[offset].y = _point.y + _normal.y * stroke;
      data[offset].u = 1;
      data[offset].v = progress;
      data[offset].color.set(cr, cg, cb, da);
      offset += 1;
      data[offset].x = _point.x - _normal.x * stroke;
      data[offset].y = _point.y - _normal.y * stroke;
      data[offset].u = 0;
      data[offset].v = progress;
      data[offset].color.set(cr, cg, cb, da);
      vertexCount += 2;
    }
    indexCount = vertexCount <= 2 ? 0 : (vertexCount - 2) * 3;
    renderData.resize(vertexCount, indexCount);
  };
  _proto.updateWorldVertexAllData = function updateWorldVertexAllData(comp) {
    return;
  };
  _proto.createQuadIndices = function createQuadIndices(comp, indexCount) {
    return;
  };
  _proto.updateRenderDataCache = function updateRenderDataCache(comp, renderData) {
    if (renderData.passDirty) {
      renderData.updatePass(comp);
    }
    if (renderData.nodeDirty) {
      renderData.updateNode(comp);
    }
    if (renderData.textureDirty && comp.texture) {
      renderData.updateTexture(comp.texture);
      renderData.material = comp.getRenderMaterial(0);
    }
    if (renderData.hashDirty) {
      renderData.updateHash();
    }
  };
  _proto.fillBuffers = function fillBuffers(comp, renderer) {
    var renderData = comp.renderData;
    if (!renderData) return;
    var chunk = renderData.chunk;
    var dataList = renderData.data;
    var vertexCount = renderData.vertexCount;
    var indexCount = renderData.indexCount;
    var vData = chunk.vb;
    var vertexOffset = 0;
    for (var i = 0; i < vertexCount; i++) {
      var vert = dataList[i];
      vData[vertexOffset++] = vert.x;
      vData[vertexOffset++] = vert.y;
      vData[vertexOffset++] = vert.z;
      vData[vertexOffset++] = vert.u;
      vData[vertexOffset++] = vert.v;
      Color.toArray(vData, vert.color, vertexOffset);
      vertexOffset += 4;
    }
    chunk.bufferId;
    var vid = chunk.vertexOffset;
    var meshBuffer = chunk.meshBuffer;
    var ib = chunk.meshBuffer.iData;
    var indexOffset = meshBuffer.indexOffset;
    for (var _i = 0, l = indexCount; _i < l; _i += 2) {
      var start = vid + _i;
      ib[indexOffset++] = start;
      ib[indexOffset++] = start + 2;
      ib[indexOffset++] = start + 1;
      ib[indexOffset++] = start + 1;
      ib[indexOffset++] = start + 2;
      ib[indexOffset++] = start + 3;
    }
    meshBuffer.indexOffset += renderData.indexCount;
    meshBuffer.setDirty();
  };
  return MotionStreakAssembler;
}();
var motionStreakAssembler = new MotionStreakAssembler();
var MotionStreakAssemblerManager = {
  getAssembler: function getAssembler(comp) {
    return motionStreakAssembler;
  }
};
MotionStreak.Assembler = MotionStreakAssemblerManager;

var Particle2DAssembler = function () {
  function Particle2DAssembler() {
    this.maxParticleDeltaTime = 0;
  }
  var _proto = Particle2DAssembler.prototype;
  _proto.createData = function createData(comp) {
    return MeshRenderData.add();
  };
  _proto.removeData = function removeData(data) {
    MeshRenderData.remove(data);
  };
  return Particle2DAssembler;
}();
var particle2DAssembler = new Particle2DAssembler();
var ParticleSystem2DAssembler = {
  getAssembler: function getAssembler(comp) {
    if (!particle2DAssembler.maxParticleDeltaTime) {
      particle2DAssembler.maxParticleDeltaTime = cclegacy.game.frameTime / 1000 * 2;
    }
    return particle2DAssembler;
  }
};
ParticleSystem2D.Assembler = ParticleSystem2DAssembler;

export { MotionStreak, MotionStreakAssemblerManager, ParticleAsset, ParticleSystem2D, ParticleSystem2DAssembler };
//# sourceMappingURL=particle-2d.js.map
