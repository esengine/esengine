var ESEngine = (function (exports) {
  'use strict';

  function e$1(e,t,n,s){var i,r=arguments.length,o=r<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,n):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(e,t,n,s);else for(var a=e.length-1;a>=0;a--)(i=e[a])&&(o=(r<3?i(o):r>3?i(t,n,o):i(t,n))||o);return r>3&&o&&Object.defineProperty(t,n,o),o}function t$1(e,t){if("object"==typeof Reflect&&"function"==typeof Reflect.metadata)return Reflect.metadata(e,t)}let n$1 = class n{static update(e){this.unscaledDeltaTime=e,this.deltaTime=e*this.timeScale,this.unscaledTotalTime+=this.unscaledDeltaTime,this.totalTime+=this.deltaTime,this.frameCount++;}static sceneChanged(){this.frameCount=0,this.totalTime=0,this.unscaledTotalTime=0,this.deltaTime=0,this.unscaledDeltaTime=0;}static checkEvery(e,t){return this.totalTime-t>=e}};n$1.deltaTime=0,n$1.unscaledDeltaTime=0,n$1.totalTime=0,n$1.unscaledTotalTime=0,n$1.timeScale=1,n$1.frameCount=0;let s$1 = class s{constructor(){this._timeInSeconds=0,this._repeats=false,this._isDone=false,this._elapsedTime=0;}getContext(){return this.context}get isDone(){return this._isDone}get elapsedTime(){return this._elapsedTime}reset(){this._elapsedTime=0;}stop(){this._isDone=true;}tick(){return !this._isDone&&this._elapsedTime>this._timeInSeconds&&(this._elapsedTime-=this._timeInSeconds,this._onTime(this),this._isDone||this._repeats||(this._isDone=true)),this._elapsedTime+=n$1.deltaTime,this._isDone}initialize(e,t,n,s){this._timeInSeconds=e,this._repeats=t,this.context=n,this._onTime=s.bind(n);}unload(){this.context=null,this._onTime=null;}};const i$1=new WeakMap,r$1=new WeakMap;function o$1(){return function(e){const t=i$1.get(e);i$1.set(e,{injectable:true,dependencies:[],...t?.properties&&{properties:t.properties}});}}function a$1(e=0){return function(t){const n=t.prototype;if(!n||"function"!=typeof n.update)throw new Error(`@Updatable() decorator requires class ${t.name} to implement IUpdatable interface with update() method. Please add 'implements IUpdatable' and define update(deltaTime?: number): void method.`);r$1.set(t,{updatable:true,priority:e});}}function c$1(e){return function(t,n){let s=i$1.get(t.constructor);s||(s={injectable:true,dependencies:[]},i$1.set(t.constructor,s)),s.properties||(s.properties=new Map),s.properties.set(n,e);}}function h(e){const t=i$1.get(e);return t?.injectable??false}function d(e,t){const n=new e;return u$1(n,t),n}function u$1(e,t){const n=e.constructor,s=(r=n,i$1.get(r));var r;if(s?.properties&&0!==s.properties.size)for(const[n,i]of s.properties){const s=t.resolve(i);null!==s&&(e[n]=s);}}function m(e){const t=r$1.get(e);return t?.updatable??false}function p(e){return r$1.get(e)}exports.TimerManager=class g{constructor(){this._timers=[];}update(){for(let e=this._timers.length-1;e>=0;e--)this._timers[e].tick()&&(this._timers[e].unload(),this._timers.splice(e,1));}schedule(e,t,n,i){const r=new s$1;return r.initialize(e,t,n,i),this._timers.push(r),r}dispose(){for(const e of this._timers)e.unload();this._timers=[];}};var y;exports.TimerManager=e$1([a$1()],exports.TimerManager),function(e){e.HIGH_EXECUTION_TIME="high_execution_time",e.HIGH_MEMORY_USAGE="high_memory_usage",e.HIGH_CPU_USAGE="high_cpu_usage",e.FREQUENT_GC="frequent_gc",e.LOW_FPS="low_fps",e.HIGH_ENTITY_COUNT="high_entity_count";}(y||(y={}));class _{constructor(){this._systemData=new Map,this._systemStats=new Map,this._isEnabled=false,this._maxRecentSamples=60;}updateFPS(e){}enable(){this._isEnabled=true;}disable(){this._isEnabled=false;}get isEnabled(){return this._isEnabled}startMonitoring(e){return this._isEnabled?performance.now():0}endMonitoring(e,t,n=0){if(!this._isEnabled||0===t)return;const s=performance.now(),i=s-t,r={name:e,executionTime:i,entityCount:n,averageTimePerEntity:n>0?i/n:0,lastUpdateTime:s};this._systemData.set(e,r),this.updateStats(e,i);}updateStats(e,t){let n=this._systemStats.get(e);n||(n={totalTime:0,averageTime:0,minTime:Number.MAX_VALUE,maxTime:0,executionCount:0,recentTimes:[],standardDeviation:0,percentile95:0,percentile99:0},this._systemStats.set(e,n)),n.totalTime+=t,n.executionCount++,n.averageTime=n.totalTime/n.executionCount,n.minTime=Math.min(n.minTime,t),n.maxTime=Math.max(n.maxTime,t),n.recentTimes.push(t),n.recentTimes.length>this._maxRecentSamples&&n.recentTimes.shift(),this.calculateAdvancedStats(n);}calculateAdvancedStats(e){if(0===e.recentTimes.length)return;const t=e.recentTimes.reduce((e,t)=>e+t,0)/e.recentTimes.length,n=e.recentTimes.reduce((e,n)=>e+Math.pow(n-t,2),0)/e.recentTimes.length;e.standardDeviation=Math.sqrt(n);const s=[...e.recentTimes].sort((e,t)=>e-t),i=s.length;e.percentile95=s[Math.floor(.95*i)]||0,e.percentile99=s[Math.floor(.99*i)]||0;}getSystemData(e){return this._systemData.get(e)}getSystemStats(e){return this._systemStats.get(e)}getAllSystemData(){return new Map(this._systemData)}getAllSystemStats(){return new Map(this._systemStats)}getPerformanceReport(){if(!this._isEnabled)return "Performance monitoring is disabled.";const e=[];e.push("=== ECS Performance Report ==="),e.push("");const t=Array.from(this._systemStats.entries()).sort((e,t)=>t[1].averageTime-e[1].averageTime);for(const[n,s]of t){const t=this._systemData.get(n);e.push(`System: ${n}`),e.push(`  Current: ${t?.executionTime.toFixed(2)}ms (${t?.entityCount} entities)`),e.push(`  Average: ${s.averageTime.toFixed(2)}ms`),e.push(`  Min/Max: ${s.minTime.toFixed(2)}ms / ${s.maxTime.toFixed(2)}ms`),e.push(`  Total: ${s.totalTime.toFixed(2)}ms (${s.executionCount} calls)`),t?.averageTimePerEntity&&t.averageTimePerEntity>0&&e.push(`  Per Entity: ${t.averageTimePerEntity.toFixed(4)}ms`),e.push("");}const n=Array.from(this._systemData.values()).reduce((e,t)=>e+t.executionTime,0);return e.push(`Total Frame Time: ${n.toFixed(2)}ms`),e.push(`Systems Count: ${this._systemData.size}`),e.join("\n")}reset(){this._systemData.clear(),this._systemStats.clear();}resetSystem(e){this._systemData.delete(e),this._systemStats.delete(e);}getPerformanceWarnings(e=16.67){const t=[];for(const[n,s]of this._systemData.entries())s.executionTime>e&&t.push(`${n}: ${s.executionTime.toFixed(2)}ms (>${e}ms)`);return t}setMaxRecentSamples(e){this._maxRecentSamples=e;for(const t of this._systemStats.values())for(;t.recentTimes.length>e;)t.recentTimes.shift();}dispose(){this._systemData.clear(),this._systemStats.clear(),this._isEnabled=false;}}class S{constructor(e,t=100,n=1024){this._objects=[],this._createFn=e,this._maxSize=t,this._objectSize=n,this._stats={size:0,maxSize:t,totalCreated:0,totalObtained:0,totalReleased:0,hitRate:0,estimatedMemoryUsage:0};}static getPool(e,t=100,n=1024){let s=this._pools.get(e);return s||(s=new S(()=>new e,t,n),this._pools.set(e,s)),s}obtain(){if(this._stats.totalObtained++,this._objects.length>0){const e=this._objects.pop();return this._stats.size--,this._updateHitRate(),this._updateMemoryUsage(),e}return this._stats.totalCreated++,this._updateHitRate(),this._createFn()}release(e){e&&(this._stats.totalReleased++,this._stats.size<this._maxSize&&(e.reset(),this._objects.push(e),this._stats.size++,this._updateMemoryUsage()));}getStats(){return {...this._stats}}clear(){for(const e of this._objects)e.reset();this._objects.length=0,this._stats.size=0,this._updateMemoryUsage();}compact(e){const t=e??Math.floor(this._objects.length/2);for(;this._objects.length>t;){const e=this._objects.pop();e&&(e.reset(),this._stats.size--);}this._updateMemoryUsage();}prewarm(e){const t=Math.min(e,this._maxSize-this._objects.length);for(let e=0;e<t;e++){const e=this._createFn();e.reset(),this._objects.push(e),this._stats.totalCreated++,this._stats.size++;}this._updateMemoryUsage();}setMaxSize(e){this._maxSize=e,this._stats.maxSize=e,this._objects.length>e&&this.compact(e);}getAvailableCount(){return this._objects.length}isEmpty(){return 0===this._objects.length}isFull(){return this._objects.length>=this._maxSize}static getAllPoolTypes(){return Array.from(this._pools.keys())}static getAllPoolStats(){const e={};for(const[t,n]of this._pools){e[t.name||t.toString()]=n.getStats();}return e}static compactAllPools(){for(const e of this._pools.values())e.compact();}static clearAllPools(){for(const e of this._pools.values())e.clear();this._pools.clear();}static getGlobalStatsString(){const e=this.getAllPoolStats(),t=["=== Object Pool Global Statistics ===",""];if(0===Object.keys(e).length)return t.push("No pools registered"),t.join("\n");for(const[n,s]of Object.entries(e))t.push(`${n}:`),t.push(`  Size: ${s.size}/${s.maxSize}`),t.push(`  Hit Rate: ${(100*s.hitRate).toFixed(1)}%`),t.push(`  Total Created: ${s.totalCreated}`),t.push(`  Total Obtained: ${s.totalObtained}`),t.push(`  Memory: ${(s.estimatedMemoryUsage/1024).toFixed(1)} KB`),t.push("");return t.join("\n")}_updateHitRate(){if(0===this._stats.totalObtained)this._stats.hitRate=0;else {const e=this._stats.totalObtained-this._stats.totalCreated;this._stats.hitRate=e/this._stats.totalObtained;}}_updateMemoryUsage(){this._stats.estimatedMemoryUsage=this._stats.size*this._objectSize;}}S._pools=new Map;class C{constructor(){this.pools=new Map,this.autoCompactInterval=6e4,this.lastCompactTime=0;}registerPool(e,t){this.pools.set(e,t);}getPool(e){return this.pools.get(e)||null}update(){const e=Date.now();e-this.lastCompactTime>this.autoCompactInterval&&(this.compactAllPools(),this.lastCompactTime=e);}createPool(e,t,n=100,s=1024){let i=this.pools.get(e);return i||(i=new S(t,n,s),this.pools.set(e,i)),i}removePool(e){const t=this.pools.get(e);return !!t&&(t.clear(),this.pools.delete(e),true)}getPoolNames(){return Array.from(this.pools.keys())}getPoolCount(){return this.pools.size}compactAllPools(){for(const e of this.pools.values())e.compact();}clearAllPools(){for(const e of this.pools.values())e.clear();}getAllStats(){const e=new Map;for(const[t,n]of this.pools)e.set(t,n.getStats());return e}getGlobalStats(){let e=0,t=0,n=0,s=0,i=0,r=0;for(const o of this.pools.values()){const a=o.getStats();e+=a.size,t+=a.maxSize,n+=a.totalCreated,s+=a.totalObtained,i+=a.totalReleased,r+=a.estimatedMemoryUsage;}return {size:e,maxSize:t,totalCreated:n,totalObtained:s,totalReleased:i,hitRate:0===s?0:(s-n)/s,estimatedMemoryUsage:r}}getStatsString(){const e=["=== Pool Manager Statistics ===",""];if(0===this.pools.size)return e.push("No pools registered"),e.join("\n");const t=this.getGlobalStats();e.push(`Total Pools: ${this.pools.size}`),e.push(`Global Hit Rate: ${(100*t.hitRate).toFixed(1)}%`),e.push(`Global Memory Usage: ${(t.estimatedMemoryUsage/1024).toFixed(1)} KB`),e.push("");for(const[t,n]of this.pools){const s=n.getStats();e.push(`${t}:`),e.push(`  Size: ${s.size}/${s.maxSize}`),e.push(`  Hit Rate: ${(100*s.hitRate).toFixed(1)}%`),e.push(`  Memory: ${(s.estimatedMemoryUsage/1024).toFixed(1)} KB`),e.push("");}return e.join("\n")}setAutoCompactInterval(e){this.autoCompactInterval=e;}prewarmAllPools(){for(const e of this.pools.values()){const t=e.getStats(),n=Math.floor(.2*t.maxSize);e.prewarm(n);}}reset(){this.clearAllPools(),this.pools.clear(),this.lastCompactTime=0;}dispose(){this.reset();}}const v=Symbol("ComponentTypeName"),E=Symbol("ComponentDependencies"),b=Symbol("ComponentEditorOptions");function T(e){return void 0!==e[v]}function w(e){const t=e[v];return t||(e.name||"UnknownComponent")}function I(e){return w(e.constructor)}var O;exports.LogLevel = void 0;!function(e){e[e.LOW=0]="LOW",e[e.HIGH=1]="HIGH";}(O||(O={}));class R{static create(e){if(e<0)throw new Error(`Bit index ${e} out of range [0, ∞)`);const t={base:[0,0]};return R.setBit(t,e),t}static fromNumber(e){return {base:[e>>>0,0]}}static hasAny(e,t){const n=t.base,s=e.base,i=t.segments,r=e.segments,o=0!==(s[O.LOW]&n[O.LOW])||0!==(s[O.HIGH]&n[O.HIGH]);return !o&&i&&r?r.some((e,t)=>{const n=i[t];return n&&(0!==(e[O.LOW]&n[O.LOW])||0!==(e[O.HIGH]&n[O.HIGH]))}):o}static hasAll(e,t){const n=e.base,s=t.base,i=e.segments,r=t.segments,o=(n[O.LOW]&s[O.LOW])===s[O.LOW]&&(n[O.HIGH]&s[O.HIGH])===s[O.HIGH];if(!o||!r)return o;const a=i?.length??0;if(i)for(let e=0;e<Math.min(a,r.length);e++){const t=i[e],n=r[e];if((t[O.LOW]&n[O.LOW])!==n[O.LOW]||(t[O.HIGH]&n[O.HIGH])!==n[O.HIGH])return  false}for(let e=a;e<r.length;e++){const t=r[e];if(0!==t[O.LOW]||0!==t[O.HIGH])return  false}return  true}static hasNone(e,t){const n=e.base,s=t.base,i=e.segments,r=t.segments,o=0===(n[O.LOW]&s[O.LOW])&&0===(n[O.HIGH]&s[O.HIGH]);return i&&o&&r?i.every((e,t)=>{const n=r[t];return !n||0===(e[O.LOW]&n[O.LOW])&&0===(e[O.HIGH]&n[O.HIGH])}):o}static isZero(e){const t=0===e.base[O.LOW]&&0===e.base[O.HIGH];return e.segments&&t?e.segments.every(e=>0===e[O.LOW]&&0===e[O.HIGH]):t}static equals(e,t){const n=e.base[O.LOW]===t.base[O.LOW]&&e.base[O.HIGH]===t.base[O.HIGH];if(!n||!e.segments&&!t.segments)return n;const s=e.segments??[],i=t.segments??[];for(let e=0;e<Math.max(s.length,i.length);e++){const t=s[e],n=i[e];if(t&&!n){if(0!==t[O.LOW]||0!==t[O.HIGH])return  false}else if(!t&&n){if(0!==n[O.LOW]||0!==n[O.HIGH])return  false}else if(t&&n&&(t[O.LOW]!==n[O.LOW]||t[O.HIGH]!==n[O.HIGH]))return  false}return  true}static setBit(e,t){if(t<0)throw new Error(`Bit index ${t} out of range [0, 63]`);const n=R.getSegmentByBitIndex(e,t),s=63&t;s<32?n[O.LOW]|=1<<s:n[O.HIGH]|=1<<s-32;}static getBit(e,t){if(t<0)return  false;const n=R.getSegmentByBitIndex(e,t,false);if(!n)return  false;const s=63&t;return s<32?!!(n[O.LOW]&1<<s):!!(n[O.HIGH]&1<<s-32)}static clearBit(e,t){if(t<0)throw new Error(`Bit index ${t} out of range [0, 63]`);const n=R.getSegmentByBitIndex(e,t,false);if(!n)return;const s=63&t;s<32?n[O.LOW]&=~(1<<s):n[O.HIGH]&=~(1<<s-32);}static orInPlace(e,t){e.base[O.LOW]|=t.base[O.LOW],e.base[O.HIGH]|=t.base[O.HIGH];const n=t.segments;if(n&&n.length>0){e.segments||(e.segments=[]);const t=e.segments;for(;t.length<n.length;)t.push([0,0]);for(let e=0;e<n.length;e++){const s=t[e],i=n[e];s[O.LOW]|=i[O.LOW],s[O.HIGH]|=i[O.HIGH];}}}static andInPlace(e,t){e.base[O.LOW]&=t.base[O.LOW],e.base[O.HIGH]&=t.base[O.HIGH];const n=t.segments;if(n&&n.length>0){e.segments||(e.segments=[]);const t=e.segments;for(;t.length<n.length;)t.push([0,0]);for(let e=0;e<n.length;e++){const s=t[e],i=n[e];s[O.LOW]&=i[O.LOW],s[O.HIGH]&=i[O.HIGH];}}}static xorInPlace(e,t){e.base[O.LOW]^=t.base[O.LOW],e.base[O.HIGH]^=t.base[O.HIGH];const n=t.segments;if(!n||0==n.length)return;e.segments||(e.segments=[]);const s=e.segments;for(;s.length<n.length;)s.push([0,0]);for(let e=0;e<n.length;e++){const t=s[e],i=n[e];t[O.LOW]^=i[O.LOW],t[O.HIGH]^=i[O.HIGH];}}static clear(e){if(e.base[O.LOW]=0,e.base[O.HIGH]=0,e.segments)for(let t=0;t<e.segments.length;t++){const n=e.segments[t];n[O.LOW]=0,n[O.HIGH]=0;}}static copy(e,t){if(R.clear(t),t.base[O.LOW]=e.base[O.LOW],t.base[O.HIGH]=e.base[O.HIGH],!e.segments||0==e.segments.length)return;if(!t.segments)return void(t.segments=e.segments.map(e=>[...e]));const n=e.segments.length-t.segments.length;for(let e=0;e<n;e++)t.segments.push([0,0]);const s=t.segments,i=e.segments;for(let e=0;e<i.length;e++){const t=s[e],n=i[e];t[O.LOW]=n[O.LOW],t[O.HIGH]=n[O.HIGH];}}static clone(e){return {base:e.base.slice(),...e.segments&&{segments:e.segments.map(e=>[...e])}}}static toString(e,t=2,n=false){2!=t&&16!=t&&(t=2);const s=e.segments?.length??0;let i="";if(n){let e=0;e=2===t?66:19;for(let t=0;t<=s;t++){i+=(0===t?"0 (Base):":`${t} (${64*t}):`).toString().padEnd(e);}i+="\n";}for(let r=-1;r<s;r++){let s="";const o=-1==r?e.base:e.segments[r],a=o[O.HIGH],c=o[O.LOW];if(2==t){s=a.toString(2).padStart(32,"0")+"_"+c.toString(2).padStart(32,"0");}else {let e=a?a.toString(16).toUpperCase():"";n&&(e=e.padStart(8,"0"));let t=c.toString(16).toUpperCase();e&&(t=t.padStart(8,"0")),s="0x"+e+t;}i+=-1===r?s:" "+s;}return i}static popCount(e){let t=0;for(let n=-1;n<(e.segments?.length??0);n++){const s=-1==n?e.base:e.segments[n];let i=s[O.LOW],r=s[O.HIGH];for(;i;)i&=i-1,t++;for(;r;)r&=r-1,t++;}return t}static getSegmentByBitIndex(e,t,n=true){if(t<=63)return e.base;{let s=e.segments;if(!s){if(!n)return null;s=e.segments=[];}const i=(t>>6)-1;if(s.length<=i){if(!n)return null;const e=i-s.length+1;for(let t=0;t<e;t++)s.push([0,0]);}return s[i]??null}}}R.ZERO={base:[0,0]},function(e){e[e.Debug=0]="Debug",e[e.Info=1]="Info",e[e.Warn=2]="Warn",e[e.Error=3]="Error",e[e.Fatal=4]="Fatal",e[e.None=5]="None";}(exports.LogLevel||(exports.LogLevel={}));const z={RED:"[31m",GREEN:"[32m",YELLOW:"[33m",BRIGHT_BLACK:"[90m",BRIGHT_RED:"[91m",RESET:"[0m"};class N{constructor(e={}){this._config={level:exports.LogLevel.Info,enableTimestamp:true,enableColors:"undefined"==typeof window,...e};}debug(e,...t){this.log(exports.LogLevel.Debug,e,...t);}info(e,...t){this.log(exports.LogLevel.Info,e,...t);}warn(e,...t){this.log(exports.LogLevel.Warn,e,...t);}error(e,...t){this.log(exports.LogLevel.Error,e,...t);}fatal(e,...t){this.log(exports.LogLevel.Fatal,e,...t);}setLevel(e){this._config.level=e;}setColors(e){0===Object.keys(e).length?delete this._config.colors:this._config.colors={...this._config.colors,...e};}setPrefix(e){this._config.prefix=e;}log(e,t,...n){if(e<this._config.level)return;let s=t;if(this._config.enableTimestamp){s=`[${(new Date).toISOString()}] ${s}`;}this._config.prefix&&(s=`[${this._config.prefix}] ${s}`);s=`[${exports.LogLevel[e].toUpperCase()}] ${s}`,this._config.output?this._config.output(e,s):this.outputToConsole(e,s,...n);}outputToConsole(e,t,...n){const s=this._config.enableColors?this.getColors():null;switch(e){case exports.LogLevel.Debug:s?console.debug(`${s.debug}${t}${s.reset}`,...n):console.debug(t,...n);break;case exports.LogLevel.Info:s?console.info(`${s.info}${t}${s.reset}`,...n):console.info(t,...n);break;case exports.LogLevel.Warn:s?console.warn(`${s.warn}${t}${s.reset}`,...n):console.warn(t,...n);break;case exports.LogLevel.Error:s?console.error(`${s.error}${t}${s.reset}`,...n):console.error(t,...n);break;case exports.LogLevel.Fatal:s?console.error(`${s.fatal}${t}${s.reset}`,...n):console.error(t,...n);}}getColors(){return {...{debug:z.BRIGHT_BLACK,info:z.GREEN,warn:z.YELLOW,error:z.RED,fatal:z.BRIGHT_RED,reset:z.RESET},...this._config.colors}}}class F{constructor(){this._loggers=new Map,this._defaultLevel=exports.LogLevel.Info;}get defaultLogger(){return this._defaultLogger||(this._defaultLogger=this.createDefaultLogger()),this._defaultLogger}createDefaultLogger(){return this._loggerFactory?this._loggerFactory():new N({level:this._defaultLevel})}static getInstance(){return F._instance||(F._instance=new F),F._instance}getLogger(e){return e?this._loggerFactory?this._loggerFactory(e):(this._loggers.has(e)||this._loggers.set(e,new N({prefix:e,level:this._defaultLevel})),this._loggers.get(e)):this.defaultLogger}setLogger(e,t){this._loggers.set(e,t);}setGlobalLevel(e){this._defaultLevel=e,this._defaultLogger instanceof N&&this._defaultLogger.setLevel(e);for(const t of this._loggers.values())t instanceof N&&t.setLevel(e);}createChildLogger(e,t){const n=`${e}.${t}`;return this.getLogger(n)}setGlobalColors(e){this._defaultLogger instanceof N&&this._defaultLogger.setColors(e);for(const t of this._loggers.values())t instanceof N&&t.setColors(e);}resetColors(){this._defaultLogger instanceof N&&this._defaultLogger.setColors({});for(const e of this._loggers.values())e instanceof N&&e.setColors({});}setLoggerFactory(e){this._loggerFactory=e,delete this._defaultLogger,this._loggers.clear();}}const B=F.getInstance().getLogger();function $(e){return F.getInstance().getLogger(e)}const G=$("ComponentRegistry");class q{constructor(){this._componentTypes=new Map,this._bitIndexToType=new Map,this._componentNameToType=new Map,this._componentNameToId=new Map,this._maskCache=new Map,this._nextBitIndex=0,this._hotReloadEnabled=false,this._warnedComponents=new Set;}register(e){const t=w(e);if(T(e)||this._warnedComponents.has(e)||(this._warnedComponents.add(e),G.warn(`Component "${t}" is missing @ECSComponent decorator. This may cause issues with serialization and code minification. Please add: @ECSComponent('${t}') | 组件 "${t}" 缺少 @ECSComponent 装饰器，可能导致序列化和代码压缩问题`)),this._componentTypes.has(e))return this._componentTypes.get(e);if(this._hotReloadEnabled&&this._componentNameToType.has(t)){const n=this._componentNameToType.get(t);if(n!==e){const s=this._componentTypes.get(n);return this._componentTypes.delete(n),this._componentTypes.set(e,s),this._bitIndexToType.set(s,e),this._componentNameToType.set(t,e),G.debug(`Hot reload: replaced component "${t}"`),s}}const n=this._nextBitIndex++;return this._componentTypes.set(e,n),this._bitIndexToType.set(n,e),this._componentNameToType.set(t,e),this._componentNameToId.set(t,n),n}getBitMask(e){const t=this._componentTypes.get(e);if(void 0===t){const t=w(e);throw new Error(`Component type ${t} is not registered`)}return R.create(t)}getBitIndex(e){const t=this._componentTypes.get(e);if(void 0===t){const t=w(e);throw new Error(`Component type ${t} is not registered`)}return t}isRegistered(e){return this._componentTypes.has(e)}getTypeByBitIndex(e){return this._bitIndexToType.get(e)||null}getRegisteredCount(){return this._nextBitIndex}getComponentType(e){return this._componentNameToType.get(e)||null}getAllRegisteredTypes(){return new Map(this._componentTypes)}getAllComponentNames(){return new Map(this._componentNameToType)}getComponentId(e){return this._componentNameToId.get(e)}registerComponentByName(e){if(this._componentNameToId.has(e))return this._componentNameToId.get(e);const t=this._nextBitIndex++;return this._componentNameToId.set(e,t),t}createSingleComponentMask(e){const t=`single:${e}`;if(this._maskCache.has(t))return this._maskCache.get(t);const n=this.getComponentId(e);if(void 0===n)throw new Error(`Component type ${e} is not registered`);const s=R.create(n);return this._maskCache.set(t,s),s}createComponentMask(e){const t=`multi:${[...e].sort().join(",")}`;if(this._maskCache.has(t))return this._maskCache.get(t);const n=R.clone(R.ZERO);for(const t of e){const e=this.getComponentId(t);if(void 0!==e){const t=R.create(e);R.orInPlace(n,t);}}return this._maskCache.set(t,n),n}clearMaskCache(){this._maskCache.clear();}enableHotReload(){this._hotReloadEnabled=true;}disableHotReload(){this._hotReloadEnabled=false;}isHotReloadEnabled(){return this._hotReloadEnabled}unregister(e){const t=this._componentNameToType.get(e);if(!t)return;const n=this._componentTypes.get(t);this._componentTypes.delete(t),void 0!==n&&this._bitIndexToType.delete(n),this._componentNameToType.delete(e),this._componentNameToId.delete(e),this.clearMaskCache(),G.debug(`Component unregistered: ${e}`);}getRegisteredComponents(){const e=[];for(const[t,n]of this._componentNameToType){const s=this._componentTypes.get(n);void 0!==s&&e.push({name:t,type:n,bitIndex:s});}return e}reset(){this._componentTypes.clear(),this._bitIndexToType.clear(),this._componentNameToType.clear(),this._componentNameToId.clear(),this._maskCache.clear(),this._warnedComponents.clear(),this._nextBitIndex=0,this._hotReloadEnabled=false;}cloneFrom(e){const t=e.getAllRegisteredTypes();for(const[e,n]of t){this._componentTypes.set(e,n),this._bitIndexToType.set(n,e);const t=w(e);this._componentNameToType.set(t,e),this._componentNameToId.set(t,n);}this._nextBitIndex=e.getRegisteredCount(),this._hotReloadEnabled=e.isHotReloadEnabled();}}const j=new q;var V;!function(e){e[e.FULL=0]="FULL",e[e.DELTA=1]="DELTA",e[e.SPAWN=2]="SPAWN",e[e.DESPAWN=3]="DESPAWN";}(V||(V={}));const Y=Symbol("SyncMetadata"),Z=Symbol("SystemTypeName");function X(e,t){return function(n){if(!e||"string"!=typeof e)throw new Error("ECSComponent装饰器必须提供有效的类型名称");const s=n;s[v]=e,t?.requires&&(s[E]=t.requires),t?.editor&&(s[b]=t.editor);const i=n[Y];return i&&(i.typeId=e),j.register(n),n}}function K(e,t){return function(n){if(!e||"string"!=typeof e)throw new Error("ECSSystem装饰器必须提供有效的类型名称");const s=n;return s[Z]=e,t&&(s.__systemMetadata__=t),n}}function ee(e){return e.__systemMetadata__}function te(e){return ee(e.constructor)}function ne(e){const t=e[Z];return t||(e.name||"UnknownSystem")}function se(e){return ne(e.constructor)}const ie="undefined"!=typeof globalThis&&globalThis.WeakRef||"undefined"!=typeof global&&global.WeakRef||"undefined"!=typeof window&&window.WeakRef||class{constructor(e){this._target=e;}deref(){return this._target}},re=new Map;class ae{constructor(){this._references=new Map;}registerReference(e,t,n){const s=e.id;let i=this._references.get(s);i||(i=new Set,this._references.set(s,i));this._findRecord(i,t,n)||i.add({component:new ie(t),propertyKey:n});}unregisterReference(e,t,n){const s=e.id,i=this._references.get(s);if(!i)return;const r=this._findRecord(i,t,n);r&&(i.delete(r),0===i.size&&this._references.delete(s));}clearReferencesTo(e){const t=this._references.get(e);if(!t)return;const n=[];for(const e of t){e.component.deref()&&n.push(e);}for(const e of n){const t=e.component.deref();t&&(t[e.propertyKey]=null);}this._references.delete(e);}clearComponentReferences(e){for(const[t,n]of this._references.entries()){const s=[];for(const t of n){const n=t.component.deref();n&&n!==e||s.push(t);}for(const e of s)n.delete(e);0===n.size&&this._references.delete(t);}}getReferencesTo(e){const t=this._references.get(e);if(!t)return [];const n=[];for(const e of t){e.component.deref()&&n.push(e);}return n}cleanup(){const e=[];for(const[t,n]of this._references.entries()){const s=[];for(const e of n)e.component.deref()||s.push(e);for(const e of s)n.delete(e);0===n.size&&e.push(t);}for(const t of e)this._references.delete(t);}registerEntityScene(e,t){re.set(e,new ie(t));}unregisterEntityScene(e){re.delete(e);}getDebugInfo(){const e={};for(const[t,n]of this._references.entries()){const s=[];for(const e of n){const t=e.component.deref();t&&s.push({componentId:t.id,propertyKey:e.propertyKey});}s.length>0&&(e[`entity_${t}`]=s);}return e}_findRecord(e,t,n){for(const s of e){if(s.component.deref()===t&&s.propertyKey===n)return s}}}$("EntityRefDecorator");const he=Symbol("EntityRefMetadata");function me(e){if(!e)return null;return ("function"==typeof e?e:e.constructor)[he]||null}function fe(e,t){const n=me(e);return !!n&&n.properties.has(t)}const ye=new WeakMap;function Se(e){return (t,n)=>{const s=t.constructor,i=ye.get(s)||{};i[n]=e,ye.set(s,i);}}const Ee=Symbol("schedulingMetadata");function Ae(e){let t=Object.getPrototypeOf(e);for(;t;){const e=t[Ee];if(e)return e;t=Object.getPrototypeOf(t);}}class Re{static getConstructor(e){return this.TYPE_CONSTRUCTORS[e]||Float32Array}static getBytesPerElement(e){return this.TYPE_BYTES[e]||4}static getTypeName(e){return e instanceof Float32Array?"float32":e instanceof Float64Array?"float64":e instanceof Int32Array?"int32":e instanceof Uint32Array?"uint32":e instanceof Int16Array?"int16":e instanceof Uint16Array?"uint16":e instanceof Int8Array?"int8":e instanceof Uint8Array?"uint8":e instanceof Uint8ClampedArray?"uint8clamped":"float32"}static createSameType(e,t){const n=this.getTypeName(e);return new(this.getConstructor(n))(t)}static extractFieldMetadata(e){const t=new e,n=new Map,s=e,i=new Map,r=(e,t)=>{if(e)for(const n of e)i.set(n,t);};r(s.__float64Fields,"float64"),r(s.__float32Fields,"float32"),r(s.__int32Fields,"int32"),r(s.__uint32Fields,"uint32"),r(s.__int16Fields,"int16"),r(s.__uint16Fields,"uint16"),r(s.__int8Fields,"int8"),r(s.__uint8Fields,"uint8"),r(s.__uint8ClampedFields,"uint8clamped");const o=Object.keys(t).filter(e=>"id"!==e);for(const e of o){const r=typeof t[e];if("function"===r)continue;const o={name:e,type:r},a=i.get(e);a?o.arrayType=a:"number"===r?o.arrayType="float32":"boolean"===r&&(o.arrayType="uint8"),s.__serializeMapFields?.has(e)&&(o.isSerializedMap=true),s.__serializeSetFields?.has(e)&&(o.isSerializedSet=true),s.__serializeArrayFields?.has(e)&&(o.isSerializedArray=true),s.__deepCopyFields?.has(e)&&(o.isDeepCopy=true),n.set(e,o);}return n}}Re.TYPE_CONSTRUCTORS={float32:Float32Array,float64:Float64Array,int32:Int32Array,uint32:Uint32Array,int16:Int16Array,uint16:Uint16Array,int8:Int8Array,uint8:Uint8Array,uint8clamped:Uint8ClampedArray},Re.TYPE_BYTES={float32:4,float64:8,int32:4,uint32:4,int16:2,uint16:2,int8:1,uint8:1,uint8clamped:1};class ze{static serialize(e,t,n={}){try{return n.isMap&&e instanceof Map?JSON.stringify(Array.from(e.entries())):n.isSet&&e instanceof Set?JSON.stringify(Array.from(e)):(n.isArray&&Array.isArray(e),JSON.stringify(e))}catch(e){return this._logger.warn(`SoA序列化字段 ${t} 失败:`,e),"{}"}}static deserialize(e,t,n={}){try{const t=JSON.parse(e);return n.isMap?new Map(t):n.isSet?new Set(t):t}catch(e){return this._logger.warn(`SoA反序列化字段 ${t} 失败:`,e),null}}static deepClone(e){if(null===e||"object"!=typeof e)return e;if(e instanceof Date)return new Date(e.getTime());if(Array.isArray(e))return e.map(e=>this.deepClone(e));if(e instanceof Map){const t=new Map;for(const[n,s]of e.entries())t.set(n,this.deepClone(s));return t}if(e instanceof Set){const t=new Set;for(const n of e.values())t.add(this.deepClone(n));return t}const t={};for(const n in e)Object.prototype.hasOwnProperty.call(e,n)&&(t[n]=this.deepClone(e[n]));return t}}function Fe(e,t){const n=e.constructor;let s=n[t];return s||(s=new Set,n[t]=s),s}function Le(e,t){Fe(e,"__int32Fields").add(String(t));}ze._logger=$("SoASerializer");class Ze{constructor(e){this.fields=new Map,this.stringFields=new Map,this.serializedFields=new Map,this.complexFields=new Map,this.entityToIndex=new Map,this.indexToEntity=[],this.freeIndices=[],this._size=0,this._capacity=1e3,this.fieldTypes=new Map,this.serializeMapFields=new Set,this.serializeSetFields=new Set,this.serializeArrayFields=new Set,this.type=e,this.initializeFields(e);}initializeFields(e){const t=new e,n=e,s=n.__float64Fields||new Set,i=n.__float32Fields||new Set,r=n.__int32Fields||new Set,o=n.__uint32Fields||new Set,a=n.__int16Fields||new Set,c=n.__uint16Fields||new Set,h=n.__int8Fields||new Set,l=n.__uint8Fields||new Set,d=n.__uint8ClampedFields||new Set;this.serializeMapFields=n.__serializeMapFields||new Set,this.serializeSetFields=n.__serializeSetFields||new Set,this.serializeArrayFields=n.__serializeArrayFields||new Set;const u=new Map;for(const e of s)u.set(e,"float64");for(const e of i)u.set(e,"float32");for(const e of r)u.set(e,"int32");for(const e of o)u.set(e,"uint32");for(const e of a)u.set(e,"int16");for(const e of c)u.set(e,"uint16");for(const e of h)u.set(e,"int8");for(const e of l)u.set(e,"uint8");for(const e of d)u.set(e,"uint8clamped");const m=Object.keys(t).filter(e=>"id"!==e);for(const e of m){const n=t[e],s=typeof n;if("function"===s)continue;const i=u.get(e),r=i?"number":s;if(this.fieldTypes.set(e,r),i){const t=Re.getConstructor(i);this.fields.set(e,new t(this._capacity));}else "number"===s?this.fields.set(e,new Float32Array(this._capacity)):"boolean"===s?this.fields.set(e,new Uint8Array(this._capacity)):"string"===s?this.stringFields.set(e,new Array(this._capacity)):"object"===s&&null!==n&&(this.serializeMapFields.has(e)||this.serializeSetFields.has(e)||this.serializeArrayFields.has(e))&&this.serializedFields.set(e,new Array(this._capacity));}}addComponent(e,t){if(this.entityToIndex.has(e)){const n=this.entityToIndex.get(e);return void this.updateComponentAtIndex(n,t)}let n;this.freeIndices.length>0?n=this.freeIndices.pop():(n=this._size,n>=this._capacity&&this.resize(2*this._capacity)),this.entityToIndex.set(e,n),this.indexToEntity[n]=e,this.updateComponentAtIndex(n,t),this._size++;}updateComponentAtIndex(e,t){const n=this.indexToEntity[e],s=new Map,i=this.type,r=i.__highPrecisionFields||new Set,o=i.__serializeMapFields||new Set,a=i.__serializeSetFields||new Set,c=i.__serializeArrayFields||new Set,h=i.__deepCopyFields||new Set,l=t;for(const n in t)if(Object.prototype.hasOwnProperty.call(t,n)&&"id"!==n){const t=l[n],i=typeof t;if("number"===i){const i=t;if(r.has(n)||!this.fields.has(n))s.set(n,i);else {this.fields.get(n)[e]=i;}}else if("boolean"===i&&this.fields.has(n)){this.fields.get(n)[e]=t?1:0;}else if(this.stringFields.has(n)){this.stringFields.get(n)[e]=String(t);}else if(this.serializedFields.has(n)){this.serializedFields.get(n)[e]=ze.serialize(t,n,{isMap:o.has(n),isSet:a.has(n),isArray:c.has(n)});}else h.has(n)?s.set(n,ze.deepClone(t)):s.set(n,t);}s.size>0&&this.complexFields.set(n,s);}getComponent(e){const t=this.entityToIndex.get(e);return void 0===t?null:this.createProxyView(e,t)}createProxyView(e,t){const n=this;return new Proxy({},{get(s,i){const r=String(i),o=n.fields.get(r);if(o){return "boolean"===n.getFieldType(r)?1===o[t]:o[t]}const a=n.stringFields.get(r);if(a)return a[t];const c=n.serializedFields.get(r);if(c){const e=c[t];return e?ze.deserialize(e,r,{isMap:n.serializeMapFields.has(r),isSet:n.serializeSetFields.has(r),isArray:n.serializeArrayFields.has(r)}):void 0}const h=n.complexFields.get(e);return h?.has(r)?h.get(r):void 0},set(s,i,r){const o=String(i);if("entityId"===o)return  false;const a=n.fields.get(o);if(a){const e=n.getFieldType(o);return a[t]="boolean"===e?r?1:0:r,true}const c=n.stringFields.get(o);if(c)return c[t]=String(r),true;if(n.serializedFields.has(o)){return n.serializedFields.get(o)[t]=ze.serialize(r,o,{isMap:n.serializeMapFields.has(o),isSet:n.serializeSetFields.has(o),isArray:n.serializeArrayFields.has(o)}),true}let h=n.complexFields.get(e);return h||(h=new Map,n.complexFields.set(e,h)),h.set(o,r),true},has(t,s){const i=String(s);return n.fields.has(i)||n.stringFields.has(i)||n.serializedFields.has(i)||n.complexFields.get(e)?.has(i)||false},ownKeys(){const t=[];for(const e of n.fields.keys())t.push(e);for(const e of n.stringFields.keys())t.push(e);for(const e of n.serializedFields.keys())t.push(e);const s=n.complexFields.get(e);if(s)for(const e of s.keys())t.push(e);return t},getOwnPropertyDescriptor(t,s){const i=String(s);if(n.fields.has(i)||n.stringFields.has(i)||n.serializedFields.has(i)||n.complexFields.get(e)?.has(i))return {enumerable:true,configurable:true,writable:"entityId"!==i}}})}getComponentSnapshot(e){const t=this.entityToIndex.get(e);if(void 0===t)return null;const n=new this.type,s=n;for(const[e,n]of this.fields.entries()){const i=n[t],r=this.getFieldType(e);s[e]="boolean"===r?1===i:i;}for(const[e,n]of this.stringFields.entries())s[e]=n[t];for(const[e,n]of this.serializedFields.entries()){const i=n[t];i&&(s[e]=ze.deserialize(i,e,{isMap:this.serializeMapFields.has(e),isSet:this.serializeSetFields.has(e),isArray:this.serializeArrayFields.has(e)}));}const i=this.complexFields.get(e);if(i)for(const[e,t]of i.entries())s[e]=t;return n}getFieldType(e){return this.fieldTypes.get(e)||"unknown"}hasComponent(e){return this.entityToIndex.has(e)}removeComponent(e){const t=this.entityToIndex.get(e);if(void 0===t)return null;const n=this.getComponent(e);return this.complexFields.delete(e),this.entityToIndex.delete(e),this.freeIndices.push(t),this._size--,n}resize(e){for(const[t,n]of this.fields.entries()){const s=Re.createSameType(n,e);s.set(n),this.fields.set(t,s);}for(const[t,n]of this.stringFields.entries()){const s=new Array(e);for(let e=0;e<n.length;e++)s[e]=n[e];this.stringFields.set(t,s);}for(const[t,n]of this.serializedFields.entries()){const s=new Array(e);for(let e=0;e<n.length;e++)s[e]=n[e];this.serializedFields.set(t,s);}this._capacity=e;}getActiveIndices(){return Array.from(this.entityToIndex.values())}getFieldArray(e){return this.fields.get(e)||null}getTypedFieldArray(e){return this.fields.get(String(e))||null}getEntityIndex(e){return this.entityToIndex.get(e)}getEntityIdByIndex(e){return this.indexToEntity[e]}size(){return this._size}clear(){this.entityToIndex.clear(),this.indexToEntity=[],this.freeIndices=[],this.complexFields.clear(),this._size=0;for(const e of this.fields.values())e.fill(0);for(const e of this.stringFields.values())for(let t=0;t<e.length;t++)e[t]=void 0;for(const e of this.serializedFields.values())for(let t=0;t<e.length;t++)e[t]=void 0;}compact(){if(0===this.freeIndices.length)return;const e=Array.from(this.entityToIndex.entries()).sort((e,t)=>e[1]-t[1]),t=new Map,n=[];for(let s=0;s<e.length;s++){const i=e[s];if(!i)continue;const[r,o]=i;if(t.set(r,s),n[s]=r,s!==o){for(const[,e]of this.fields.entries()){const t=e[o];void 0!==t&&(e[s]=t);}for(const[,e]of this.stringFields.entries()){const t=e[o];void 0!==t&&(e[s]=t);}for(const[,e]of this.serializedFields.entries()){const t=e[o];void 0!==t&&(e[s]=t);}}}this.entityToIndex=t,this.indexToEntity=n,this.freeIndices=[],this._size=e.length;}getStats(){let e=0;const t=new Map;for(const[n,s]of this.fields.entries()){const i=Re.getTypeName(s),r=Re.getBytesPerElement(i),o=s.length*r;e+=o,t.set(n,{size:this._size,capacity:s.length,type:i,memory:o});}return {size:this._size,capacity:this._capacity,totalSlots:this._capacity,usedSlots:this._size,freeSlots:this._capacity-this._size,fragmentation:this.freeIndices.length/this._capacity,memoryUsage:e,fieldStats:t}}performVectorizedOperation(e){const t=this.getActiveIndices();e(this.fields,t);}}class Xe{get lastWriteEpoch(){return this._lastWriteEpoch}constructor(){this.entityId=null,this._lastWriteEpoch=0,this.id=Xe._idGenerator++;}markDirty(e){this._lastWriteEpoch=e;}onAddedToEntity(){}onRemovedFromEntity(){}onDeserialized(){}}Xe._idGenerator=0,e$1([Le,t$1("design:type",Object)],Xe.prototype,"entityId",void 0);const Ke=Symbol("SerializableMetadata");function nt(e){return function(t){if(!e||"number"!=typeof e.version)throw new Error("Serializable装饰器必须提供有效的版本号");let n;if(Object.prototype.hasOwnProperty.call(t,Ke))n=t[Ke],n.options=e;else {const s=t[Ke];n={options:e,fields:s?new Map(s.fields):new Map,ignoredFields:s?new Set(s.ignoredFields):new Set},t[Ke]=n;}return t}}function st(e){return function(t,n){const s=t.constructor;let i;if(Object.prototype.hasOwnProperty.call(s,Ke))i=s[Ke];else {const e=s[Ke];i={options:e?{...e.options}:{version:1},fields:e?new Map(e.fields):new Map,ignoredFields:e?new Set(e.ignoredFields):new Set},s[Ke]=i;}i.fields.set(n,{});}}function at(e){if(!e)return null;return ("function"==typeof e?e:e.constructor)[Ke]||null}let ht=class extends Xe{constructor(){super(...arguments),this.parentId=null,this.childIds=[],this.depth=0,this.bActiveInHierarchy=true,this.bCacheDirty=true;}};e$1([st(),t$1("design:type",Object)],ht.prototype,"parentId",void 0),e$1([st(),t$1("design:type",Array)],ht.prototype,"childIds",void 0),ht=e$1([X("Hierarchy",{editor:{hideInInspector:true}}),nt({version:1,typeId:"Hierarchy"})],ht);class lt{constructor(){this.condition={all:[],any:[],none:[]};}static all(...e){return (new lt).all(...e)}static any(...e){return (new lt).any(...e)}static none(...e){return (new lt).none(...e)}static byTag(e){return (new lt).withTag(e)}static byName(e){return (new lt).withName(e)}static byComponent(e){return (new lt).withComponent(e)}static complex(){return new lt}static empty(){return new lt}static nothing(){const e=new lt;return e.condition.matchNothing=true,e}all(...e){return this.condition.all.push(...e),this}any(...e){return this.condition.any.push(...e),this}none(...e){return this.condition.none.push(...e),this}exclude(...e){return this.none(...e)}one(...e){return this.any(...e)}withTag(e){return this.condition.tag=e,this}withName(e){return this.condition.name=e,this}withComponent(e){return this.condition.component=e,this}withoutTag(){return delete this.condition.tag,this}withoutName(){return delete this.condition.name,this}withoutComponent(){return delete this.condition.component,this}getCondition(){return {all:[...this.condition.all],any:[...this.condition.any],none:[...this.condition.none],...void 0!==this.condition.tag&&{tag:this.condition.tag},...void 0!==this.condition.name&&{name:this.condition.name},...void 0!==this.condition.component&&{component:this.condition.component},...this.condition.matchNothing&&{matchNothing:true}}}isEmpty(){return 0===this.condition.all.length&&0===this.condition.any.length&&0===this.condition.none.length&&void 0===this.condition.tag&&void 0===this.condition.name&&void 0===this.condition.component&&!this.condition.matchNothing}isNothing(){return  true===this.condition.matchNothing}reset(){return this.condition.all.length=0,this.condition.any.length=0,this.condition.none.length=0,delete this.condition.tag,delete this.condition.name,delete this.condition.component,delete this.condition.matchNothing,this}clone(){const e=new lt;return e.condition.all.push(...this.condition.all),e.condition.any.push(...this.condition.any),e.condition.none.push(...this.condition.none),void 0!==this.condition.tag&&(e.condition.tag=this.condition.tag),void 0!==this.condition.name&&(e.condition.name=this.condition.name),void 0!==this.condition.component&&(e.condition.component=this.condition.component),this.condition.matchNothing&&(e.condition.matchNothing=true),e}toString(){if(this.condition.matchNothing)return "Matcher[nothing]";const e=[];return this.condition.all.length>0&&e.push(`all(${this.condition.all.map(e=>w(e)).join(", ")})`),this.condition.any.length>0&&e.push(`any(${this.condition.any.map(e=>w(e)).join(", ")})`),this.condition.none.length>0&&e.push(`none(${this.condition.none.map(e=>w(e)).join(", ")})`),void 0!==this.condition.tag&&e.push(`tag(${this.condition.tag})`),void 0!==this.condition.name&&e.push(`name(${this.condition.name})`),void 0!==this.condition.component&&e.push(`component(${w(this.condition.component)})`),`Matcher[${e.join(" & ")}]`}}class dt{constructor(){this._frameCache=null,this._persistentCache=null,this._trackedEntities=new Set;}getFrame(){return this._frameCache}setFrame(e){this._frameCache=e;}getPersistent(){return this._persistentCache}setPersistent(e){this._persistentCache=e;}getTracked(){return this._trackedEntities}addTracked(e){this._trackedEntities.add(e);}removeTracked(e){this._trackedEntities.delete(e);}isTracked(e){return this._trackedEntities.has(e)}invalidate(){this._persistentCache=null;}clearFrame(){this._frameCache=null;}clearAll(){this._frameCache=null,this._persistentCache=null,this._trackedEntities.clear();}hasPersistent(){return null!==this._persistentCache}hasFrame(){return null!==this._frameCache}getStats(){return {hasFrame:null!==this._frameCache,hasPersistent:null!==this._persistentCache,trackedCount:this._trackedEntities.size,frameEntityCount:this._frameCache?.length??0,persistentEntityCount:this._persistentCache?.length??0}}}class ut{constructor(e){this.dense=[],this.entityIds=[],this.entityToIndex=new Map,this.componentType=e;}addComponent(e,t){if(this.entityToIndex.has(e))throw new Error(`Entity ${e} already has component ${w(this.componentType)}`);const n=this.dense.length;this.dense.push(t),this.entityIds.push(e),this.entityToIndex.set(e,n);}getComponent(e){const t=this.entityToIndex.get(e);return void 0!==t?this.dense[t]:null}hasComponent(e){return this.entityToIndex.has(e)}removeComponent(e){const t=this.entityToIndex.get(e);if(void 0===t)return null;const n=this.dense[t],s=this.dense.length-1;if(t!==s){const e=this.dense[s],n=this.entityIds[s];this.dense[t]=e,this.entityIds[t]=n,this.entityToIndex.set(n,t);}return this.dense.pop(),this.entityIds.pop(),this.entityToIndex.delete(e),n}forEach(e){for(let t=0;t<this.dense.length;t++)e(this.dense[t],this.entityIds[t],t);}getDenseArray(){return {components:[...this.dense],entityIds:[...this.entityIds]}}clear(){this.dense.length=0,this.entityIds.length=0,this.entityToIndex.clear();}get size(){return this.dense.length}get type(){return this.componentType}getStats(){return {totalSlots:this.dense.length,usedSlots:this.dense.length,freeSlots:0,fragmentation:0}}}class mt{constructor(){this.storages=new Map;}isSoAStorage(e){return this.storages.get(e)instanceof Ze}getSoAStorage(e){const t=this.getStorage(e);return t instanceof Ze?t:null}getFieldArray(e,t){const n=this.getSoAStorage(e);return n?n.getFieldArray(t):null}getTypedFieldArray(e,t){const n=this.getSoAStorage(e);return n?n.getTypedFieldArray(t):null}getActiveIndices(e){const t=this.getSoAStorage(e);return t?t.getActiveIndices():[]}getEntityIndex(e,t){const n=this.getSoAStorage(e);return n?n.getEntityIndex(t):void 0}getEntityIdByIndex(e,t){const n=this.getSoAStorage(e);return n?n.getEntityIdByIndex(t):void 0}getStorage(e){let t=this.storages.get(e);if(!t){e.__enableSoA?(t=new Ze(e),mt._logger.info(`为 ${w(e)} 启用SoA优化（适用于大规模批量操作）`)):t=new ut(e),this.storages.set(e,t);}return t}addComponent(e,t){const n=t.constructor;this.getStorage(n).addComponent(e,t);}getComponent(e,t){const n=this.storages.get(t);return n?n.getComponent(e):null}hasComponent(e,t){const n=this.storages.get(t);return !!n&&n.hasComponent(e)}removeComponent(e,t){const n=this.storages.get(t);return n?n.removeComponent(e):null}removeAllComponents(e){for(const t of this.storages.values())t.removeComponent(e);}getComponentMask(e,t=j){const n=R.clone(R.ZERO);for(const[s,i]of this.storages.entries())if(i.hasComponent(e)){const e=t.getBitMask(s);R.orInPlace(n,e);}return n}getAllStats(){const e=new Map;for(const[t,n]of this.storages.entries()){const s=w(t);e.set(s,n.getStats());}return e}clear(){for(const e of this.storages.values())e.clear();this.storages.clear();}}mt._logger=$("ComponentStorage");const pt=$("CommandBuffer");var ft,gt;!function(e){e.ADD_COMPONENT="add_component",e.REMOVE_COMPONENT="remove_component",e.DESTROY_ENTITY="destroy_entity",e.SET_ENTITY_ACTIVE="set_entity_active";}(ft||(ft={}));class yt{constructor(e,t=false){this._pending=new Map,this._commands=[],this._scene=null,this._debug=false,this._useDeduplication=true,this._scene=e??null,this._debug=t;}setScene(e){this._scene=e;}get scene(){return this._scene}setDeduplication(e){this._useDeduplication=e;}get pendingCount(){if(this._useDeduplication){let e=0;for(const t of this._pending.values())t.bDestroy&&e++,void 0!==t.active&&e++,t.adds&&(e+=t.adds.size),t.removes&&(e+=t.removes.size);return e}return this._commands.length}get hasPending(){return this._useDeduplication?this._pending.size>0:this._commands.length>0}getPending(e){let t=this._pending.get(e);return t||(t={},this._pending.set(e,t)),t}getTypeId(e){return "function"==typeof e?j.getBitIndex(e):j.getBitIndex(e.constructor)}addComponent(e,t){if(this._useDeduplication){const n=this.getPending(e);if(n.bDestroy)return void(this._debug&&pt.debug(`CommandBuffer: 忽略添加组件，实体 ${e.name} 已标记销毁`));const s=this.getTypeId(t);if(n.removes?.delete(s),n.adds||(n.adds=new Map),n.adds.set(s,t),this._debug){const n=w(t.constructor);pt.debug(`CommandBuffer: 延迟添加组件 ${n} 到实体 ${e.name}`);}}else this._commands.push({type:ft.ADD_COMPONENT,entity:e,component:t});}removeComponent(e,t){if(this._useDeduplication){const n=this.getPending(e);if(n.bDestroy)return void(this._debug&&pt.debug(`CommandBuffer: 忽略移除组件，实体 ${e.name} 已标记销毁`));const s=this.getTypeId(t);n.adds?.delete(s),n.removes||(n.removes=new Set),n.removes.add(s),this._debug&&pt.debug(`CommandBuffer: 延迟移除组件 ${t.name} 从实体 ${e.name}`);}else this._commands.push({type:ft.REMOVE_COMPONENT,entity:e,componentType:t});}destroyEntity(e){if(this._useDeduplication){const t=this.getPending(e);t.adds?.clear(),t.removes?.clear(),delete t.active,t.bDestroy=true,this._debug&&pt.debug(`CommandBuffer: 延迟销毁实体 ${e.name}`);}else this._commands.push({type:ft.DESTROY_ENTITY,entity:e});}setEntityActive(e,t){if(this._useDeduplication){const n=this.getPending(e);if(n.bDestroy)return void(this._debug&&pt.debug(`CommandBuffer: 忽略设置激活状态，实体 ${e.name} 已标记销毁`));n.active=t,this._debug&&pt.debug(`CommandBuffer: 延迟设置实体 ${e.name} 激活状态为 ${t}`);}else this._commands.push({type:ft.SET_ENTITY_ACTIVE,entity:e,value:t});}flush(){return this._useDeduplication?this.flushDeduplication():this.flushLegacy()}flushDeduplication(){if(0===this._pending.size)return 0;const e=this._pending.size;let t=0;this._debug&&pt.debug(`CommandBuffer: 开始执行 ${e} 个实体的延迟命令`);const n=this._pending;this._pending=new Map;for(const[e,s]of n)if(!s.bDestroy&&e.scene&&s.removes&&s.removes.size>0)for(const n of s.removes)try{const s=j.getTypeByBitIndex(n);s&&(e.removeComponentByType(s),t++);}catch(t){pt.error("CommandBuffer: 移除组件失败",{entity:e.name,typeId:n,error:t});}for(const[e,s]of n)if(!s.bDestroy&&e.scene&&s.adds&&s.adds.size>0)for(const n of s.adds.values())try{e.addComponent(n),t++;}catch(t){const s=w(n.constructor);pt.error("CommandBuffer: 添加组件失败",{entity:e.name,component:s,error:t});}for(const[e,s]of n)if(!s.bDestroy&&e.scene&&void 0!==s.active)try{e.active=s.active,t++;}catch(t){pt.error("CommandBuffer: 设置激活状态失败",{entity:e.name,error:t});}for(const[e,s]of n)if(s.bDestroy&&e.scene)try{e.destroy(),t++;}catch(t){pt.error("CommandBuffer: 销毁实体失败",{entity:e.name,error:t});}return this._debug&&pt.debug(`CommandBuffer: 完成执行 ${t} 个延迟命令`),t}flushLegacy(){if(0===this._commands.length)return 0;const e=this._commands.length;this._debug&&pt.debug(`CommandBuffer: 开始执行 ${e} 个延迟命令`);const t=this._commands;this._commands=[];for(const e of t)this.executeCommand(e);return this._debug&&pt.debug(`CommandBuffer: 完成执行 ${e} 个延迟命令`),e}executeCommand(e){if(e.entity.scene)try{switch(e.type){case ft.ADD_COMPONENT:e.component&&e.entity.addComponent(e.component);break;case ft.REMOVE_COMPONENT:e.componentType&&e.entity.removeComponentByType(e.componentType);break;case ft.DESTROY_ENTITY:e.entity.destroy();break;case ft.SET_ENTITY_ACTIVE:void 0!==e.value&&(e.entity.active=e.value);}}catch(t){pt.error("CommandBuffer: 执行命令失败",{command:e,error:t});}else this._debug&&pt.debug(`CommandBuffer: 跳过命令，实体 ${e.entity.name} 已无效`);}clear(){if(this._debug){const e=this._useDeduplication?this._pending.size:this._commands.length;e>0&&pt.debug(`CommandBuffer: 清空 ${e} 个未执行的命令`);}this._pending.clear(),this._commands.length=0;}dispose(){this.clear(),this._scene=null;}}class _t{get entities(){const e=this._entityCache.getFrame();return null!==e?e:(this._entityCache.hasPersistent()||this._entityCache.setPersistent(this.queryEntities()),this._entityCache.getPersistent())}get updateOrder(){return this._updateOrder}set updateOrder(e){this.setUpdateOrder(e);}get addOrder(){return this._addOrder}set addOrder(e){this._addOrder=e;}get enabled(){return this._enabled}set enabled(e){this._enabled=e;}get systemName(){return this._systemName}constructor(e){this.commands=new yt,this._lastProcessEpoch=0,this._shouldProcessThisFrame=false,this._updateOrder=0,this._addOrder=0,this._enabled=true,this._performanceMonitor=null,this._systemName=se(this),this._initialized=false,this._matcher=e||lt.empty(),this._eventListeners=[],this._scene=null,this._destroyed=false,this._entityIdMap=null,this._entityIdMapVersion=-1,this.logger=$(this.getLoggerName()),this._entityCache=new dt;const t=Ae(this);this._schedulingMetadata=t?{...t}:{stage:"update",before:[],after:[],sets:[]};}get scene(){return this._scene}set scene(e){this._scene=e,this.commands.setScene(e);}setPerformanceMonitor(e){this._performanceMonitor=e;}getPerformanceMonitor(){if(!this._performanceMonitor)throw new Error(`${this._systemName}: PerformanceMonitor未注入，请确保在Core.create()之后再添加System到Scene`);return this._performanceMonitor}get matcher(){return this._matcher}setUpdateOrder(e){this._updateOrder!==e&&(this._updateOrder=e,this._scene?.markSystemsOrderDirty());}stage(e){return this._schedulingMetadata.stage=e,this._scene?.markSystemsOrderDirty(),this}before(...e){return this._schedulingMetadata.before.push(...e),this._scene?.markSystemsOrderDirty(),this}after(...e){return this._schedulingMetadata.after.push(...e),this._scene?.markSystemsOrderDirty(),this}inSet(...e){return this._schedulingMetadata.sets.push(...e),this._scene?.markSystemsOrderDirty(),this}getStage(){return this._schedulingMetadata.stage}getBefore(){return this._schedulingMetadata.before}getAfter(){return this._schedulingMetadata.after}getSets(){return this._schedulingMetadata.sets}initialize(){if(!this._initialized){if(this._initialized=true,this.scene){this._entityCache.invalidate();const e=this.queryEntities();for(const t of e)this.onAdded(t);}this.onInitialize();}}onInitialize(){}clearEntityCache(){this._entityCache.invalidate();}resetEntityTracking(){this._entityCache.clearAll(),this._entityIdMap=null,this._entityIdMapVersion=-1;}reset(){this._destroyed||(this.scene=null,this._initialized=false,this._entityCache.clearAll(),this._entityIdMap=null,this._entityIdMapVersion=-1,this.destroy());}queryEntities(){if(!this.scene?.querySystem||!this._matcher)return [];const e=this._matcher.getCondition(),t=this.scene.querySystem;let n=[];return this._matcher.isNothing()?[]:(n=this._matcher.isEmpty()?t.getAllEntities():this.isSingleCondition(e)?this.executeSingleConditionQuery(e,t):this.executeComplexQuery(e,t),this.updateEntityTracking(n),n)}isSingleCondition(e){const t=(e.all.length>0?1:0)|(e.any.length>0?2:0)|(e.none.length>0?4:0)|(void 0!==e.tag?8:0)|(void 0!==e.name?16:0)|(void 0!==e.component?32:0);return 0!==t&&!(t&t-1)}executeSingleConditionQuery(e,t){return void 0!==e.tag?t.queryByTag(e.tag).entities:void 0!==e.name?t.queryByName(e.name).entities:void 0!==e.component?t.queryByComponent(e.component).entities:e.all.length>0&&0===e.any.length&&0===e.none.length?t.queryAll(...e.all).entities:0===e.all.length&&e.any.length>0&&0===e.none.length?t.queryAny(...e.any).entities:0===e.all.length&&0===e.any.length&&e.none.length>0?t.queryNone(...e.none).entities:[]}executeComplexQueryWithIdSets(e,t){let n=null;if(void 0!==e.tag){const s=t.queryByTag(e.tag);n=this.extractEntityIds(s.entities);}if(void 0!==e.name){const s=this.extractEntityIds(t.queryByName(e.name).entities);n=n?this.intersectIdSets(n,s):s;}if(void 0!==e.component){const s=this.extractEntityIds(t.queryByComponent(e.component).entities);n=n?this.intersectIdSets(n,s):s;}if(e.all.length>0){const s=this.extractEntityIds(t.queryAll(...e.all).entities);n=n?this.intersectIdSets(n,s):s;}if(e.any.length>0){const s=this.extractEntityIds(t.queryAny(...e.any).entities);n=n?this.intersectIdSets(n,s):s;}if(e.none.length>0){n||(n=this.extractEntityIds(t.getAllEntities()));const s=t.queryAny(...e.none),i=this.extractEntityIds(s.entities);n=this.differenceIdSets(n,i);}return n?this.idSetToEntityArray(n,t.getAllEntities()):[]}extractEntityIds(e){const t=e.length,n=new Set;for(let s=0;s<t;s=s+1|0)n.add(0|e[s].id);return n}intersectIdSets(e,t){let n,s;e.size<=t.size?(n=e,s=t):(n=t,s=e);const i=new Set;for(const e of n)s.has(e)&&i.add(e);return i}differenceIdSets(e,t){const n=new Set;for(const s of e)t.has(s)||n.add(s);return n}getEntityIdMap(e){const t=this.scene?.querySystem?.version??0;return null!==this._entityIdMap&&this._entityIdMapVersion===t?this._entityIdMap:this.rebuildEntityIdMap(e,t)}rebuildEntityIdMap(e,t){let n=this._entityIdMap;n?n.clear():n=new Map;const s=e.length;for(let t=0;t<s;t=t+1|0){const s=e[t];n.set(0|s.id,s);}return this._entityIdMap=n,this._entityIdMapVersion=t,n}idSetToEntityArray(e,t){const n=this.getEntityIdMap(t),s=e.size,i=new Array(s);let r=0;for(const t of e){const e=n.get(t);void 0!==e&&(i[r]=e,r=r+1|0);}return r<s&&(i.length=r),i}executeComplexQuery(e,t){return this.executeComplexQueryWithIdSets(e,t)}update(){if(this._shouldProcessThisFrame=this._enabled&&this.onCheckProcessing(),!this._shouldProcessThisFrame)return;const e=this.getPerformanceMonitor(),t=e.startMonitoring(this._systemName);let n=0;try{this.onBegin();const e=this.queryEntities();this._entityCache.setFrame(e),n=e.length,this.process(e);}finally{e.endMonitoring(this._systemName,t,n);}}lateUpdate(){if(!this._shouldProcessThisFrame)return;const e=this.getPerformanceMonitor(),t=e.startMonitoring(`${this._systemName}_Late`);let n=0;try{const e=this.queryEntities();this._entityCache.setFrame(e),n=e.length,this.lateProcess(e),this.onEnd();}finally{e.endMonitoring(`${this._systemName}_Late`,t,n),this._entityCache.clearFrame();}}flushCommands(){return this.commands.flush()}onBegin(){}process(e){}lateProcess(e){}onEnd(){}onCheckProcessing(){return  true}getPerformanceData(){return this.getPerformanceMonitor().getSystemData(this._systemName)}getPerformanceStats(){return this.getPerformanceMonitor().getSystemStats(this._systemName)}resetPerformanceData(){this.getPerformanceMonitor().resetSystem(this._systemName);}toString(){const e=this.entities.length,t=this.getPerformanceData(),n=t?` (${t.executionTime.toFixed(2)}ms)`:"";return `${this._systemName}[${e} entities]${n}`}matchesEntity(e){if(!this._matcher)return  false;if(this._matcher.isNothing())return  false;if(this._matcher.isEmpty())return  true;const t=this._matcher.getCondition();for(const n of t.all)if(!e.hasComponent(n))return  false;if(t.any.length>0){let n=false;for(const s of t.any)if(e.hasComponent(s)){n=true;break}if(!n)return  false}for(const n of t.none)if(e.hasComponent(n))return  false;return (void 0===t.tag||e.tag===t.tag)&&((void 0===t.name||e.name===t.name)&&!(void 0!==t.component&&!e.hasComponent(t.component)))}isTracking(e){return this._entityCache.isTracked(e)}handleEntityComponentChanged(e){if(!this._matcher||!this._enabled)return;const t=this._entityCache.isTracked(e),n=this.matchesEntity(e);!t&&n?(this._entityCache.addTracked(e),this._entityCache.invalidate(),this.onAdded(e)):t&&!n&&(this._entityCache.removeTracked(e),this._entityCache.invalidate(),this.onRemoved(e));}updateEntityTracking(e){const t=new Set(e);let n=false;for(const t of e)this._entityCache.isTracked(t)||(this._entityCache.addTracked(t),n=true);for(const e of this._entityCache.getTracked())t.has(e)||(this._entityCache.removeTracked(e),n=true);n&&this._entityCache.invalidate();}onAdded(e){}onRemoved(e){}dispose(){this._destroyed||(this.cleanupManualEventListeners(),this.onDestroy(),this._entityCache.clearAll(),this._entityIdMap=null,this.commands.dispose(),this._initialized=false,this._scene=null,this._destroyed=true,this.logger.debug(`System ${this._systemName} disposed`));}addEventListener(e,t,n){if(!this.scene?.eventSystem)return this.logger.warn(`${this.systemName}: 无法添加事件监听器，scene.eventSystem 不可用`),null;const s=this.scene.eventSystem.on(e,t,n);return s&&this._eventListeners.push({eventSystem:this.scene.eventSystem,eventType:e,listenerRef:s}),s}removeEventListener(e,t){const n=this._eventListeners.findIndex(n=>n.eventType===e&&n.listenerRef===t);if(n>=0){const t=this._eventListeners[n];if(!t)return;t.eventSystem.off(e,t.listenerRef),this._eventListeners.splice(n,1);}}cleanupManualEventListeners(){for(const e of this._eventListeners)try{e.eventSystem.off(e.eventType,e.listenerRef);}catch(t){this.logger.warn(`${this.systemName}: 移除事件监听器失败 "${e.eventType}"`,t);}this._eventListeners.length=0;}destroy(){this._destroyed||(this.cleanupManualEventListeners(),this._destroyed=true,this.onDestroy());}getLoggerName(){return se(this)}onDestroy(){}requireComponent(e,t){const n=e.getComponent(t);if(!n)throw new Error(`Component ${t.name} not found on entity ${e.name} in ${this.systemName}`);return n}getComponents(e,...t){return t.map(t=>this.requireComponent(e,t))}forEach(e,t){for(let n=0;n<e.length;n++)t(e[n],n);}filterEntities(e,t){return Array.from(e).filter(t)}mapEntities(e,t){return Array.from(e).map(t)}findEntity(e,t){for(let n=0;n<e.length;n++)if(t(e[n],n))return e[n]}someEntity(e,t){for(let n=0;n<e.length;n++)if(t(e[n],n))return  true;return  false}everyEntity(e,t){for(let n=0;n<e.length;n++)if(!t(e[n],n))return  false;return  true}get lastProcessEpoch(){return this._lastProcessEpoch}get currentEpoch(){return this._scene?.epochManager?.current??0}saveEpoch(){this._lastProcessEpoch=this.currentEpoch;}forEachChanged(e,t,n,s){const i=s??this._lastProcessEpoch;for(let s=0;s<e.length;s++){const r=e[s];let o=false;for(const e of t){const t=r.getComponent(e);if(t&&t.lastWriteEpoch>i){o=true;break}}o&&n(r,s);}this._lastProcessEpoch=this.currentEpoch;}filterChanged(e,t,n){const s=n??this._lastProcessEpoch,i=[];for(let n=0;n<e.length;n++){const r=e[n];for(const e of t){const t=r.getComponent(e);if(t&&t.lastWriteEpoch>s){i.push(r);break}}}return i}hasChanged(e,t,n){const s=n??this._lastProcessEpoch;for(const n of t){const t=e.getComponent(n);if(t&&t.lastWriteEpoch>s)return  true}return  false}}class St extends _t{constructor(){super(lt.empty().all(ht)),this.dirtyEntities=new Set;}get updateOrder(){return  -1e3}process(e){if(0!==this.dirtyEntities.size){for(const e of this.dirtyEntities)e.scene&&this.updateHierarchyCache(e);this.dirtyEntities.clear();}}setParent(e,t){let n=e.getComponent(ht);n||(n=new ht,e.addComponent(n));const s=n.parentId;if(s!==(t?.id??null)){if(t&&this.isAncestorOf(e,t))throw new Error("Cannot set parent: would create circular reference");if(null!==s){const t=this.scene?.findEntityById(s);if(t){const n=t.getComponent(ht);if(n){const t=n.childIds.indexOf(e.id);-1!==t&&n.childIds.splice(t,1);}}}if(t){let s=t.getComponent(ht);s||(s=new ht,t.addComponent(s)),n.parentId=t.id,s.childIds.push(e.id);}else n.parentId=null;this.markCacheDirty(e);}}insertChildAt(e,t,n){let s=t.getComponent(ht),i=e.getComponent(ht);if(s||(s=new ht,t.addComponent(s)),i||(i=new ht,e.addComponent(i)),this.isAncestorOf(t,e))throw new Error("Cannot set parent: would create circular reference");if(null!==s.parentId&&s.parentId!==e.id){const e=this.scene?.findEntityById(s.parentId);if(e){const n=e.getComponent(ht);if(n){const e=n.childIds.indexOf(t.id);-1!==e&&n.childIds.splice(e,1);}}}s.parentId=e.id;const r=i.childIds.indexOf(t.id);-1!==r&&i.childIds.splice(r,1),n<0||n>=i.childIds.length?i.childIds.push(t.id):i.childIds.splice(n,0,t.id),this.markCacheDirty(t);}removeChild(e,t){const n=e.getComponent(ht),s=t.getComponent(ht);if(!n||!s)return  false;if(s.parentId!==e.id)return  false;const i=n.childIds.indexOf(t.id);return  -1!==i&&n.childIds.splice(i,1),s.parentId=null,this.markCacheDirty(t),true}removeAllChildren(e){const t=e.getComponent(ht);if(!t)return;const n=[...t.childIds];for(const t of n){const n=this.scene?.findEntityById(t);n&&this.removeChild(e,n);}}getParent(e){const t=e.getComponent(ht);return t&&null!==t.parentId?this.scene?.findEntityById(t.parentId)??null:null}getChildren(e){const t=e.getComponent(ht);if(!t)return [];const n=[];for(const e of t.childIds){const t=this.scene?.findEntityById(e);t&&n.push(t);}return n}getChildCount(e){const t=e.getComponent(ht);return t?.childIds.length??0}hasChildren(e){return this.getChildCount(e)>0}isAncestorOf(e,t){let n=this.getParent(t),s=0;for(;n&&s<St.MAX_DEPTH;){if(n.id===e.id)return  true;n=this.getParent(n),s++;}return  false}isDescendantOf(e,t){return this.isAncestorOf(t,e)}getRoot(e){let t=e,n=this.getParent(t),s=0;for(;n&&s<St.MAX_DEPTH;)t=n,n=this.getParent(t),s++;return t}getDepth(e){const t=e.getComponent(ht);if(!t)return 0;if(!t.bCacheDirty)return t.depth;let n=0,s=this.getParent(e);for(;s&&n<St.MAX_DEPTH;)n++,s=this.getParent(s);return t.depth=n,n}isActiveInHierarchy(e){if(!e.active)return  false;const t=e.getComponent(ht);if(!t)return e.active;if(!t.bCacheDirty)return t.bActiveInHierarchy;const n=this.getParent(e);return t.bActiveInHierarchy=n?e.active&&this.isActiveInHierarchy(n):e.active,t.bActiveInHierarchy}getRootEntities(){const e=[];for(const t of this.entities){const n=t.getComponent(ht);n&&null===n.parentId&&e.push(t);}return e}findChild(e,t,n=false){const s=this.getChildren(e);for(const e of s)if(e.name===t)return e;if(n)for(const e of s){const n=this.findChild(e,t,true);if(n)return n}return null}findChildrenByTag(e,t,n=false){const s=[],i=this.getChildren(e);for(const e of i)0!==(e.tag&t)&&s.push(e),n&&s.push(...this.findChildrenByTag(e,t,true));return s}forEachChild(e,t,n=false){const s=this.getChildren(e);for(const e of s)t(e),n&&this.forEachChild(e,t,true);}flattenHierarchy(e){const t=[],n=(s,i)=>{const r=this.hasChildren(s),o=e.has(s.id);if(t.push({entity:s,depth:i,bHasChildren:r,bIsExpanded:o}),r&&o)for(const e of this.getChildren(s))n(e,i+1);};for(const e of this.getRootEntities())n(e,0);return t}markCacheDirty(e){const t=e.getComponent(ht);if(t&&!t.bCacheDirty){t.bCacheDirty=true,this.dirtyEntities.add(e);for(const e of t.childIds){const t=this.scene?.findEntityById(e);t&&this.markCacheDirty(t);}}}updateHierarchyCache(e){const t=e.getComponent(ht);t&&(t.depth=this.getDepth(e),t.bActiveInHierarchy=this.isActiveInHierarchy(e),t.bCacheDirty=false);}onAdded(e){const t=e.getComponent(ht);t&&t.bCacheDirty&&this.dirtyEntities.add(e);}onRemoved(e){this.dirtyEntities.delete(e);const t=e.getComponent(ht);if(t){if(null!==t.parentId){const n=this.scene?.findEntityById(t.parentId);if(n){const t=n.getComponent(ht);if(t){const n=t.childIds.indexOf(e.id);-1!==n&&t.childIds.splice(n,1);}}}for(const e of t.childIds){const t=this.scene?.findEntityById(e);if(t){const e=t.getComponent(ht);e&&(e.parentId=null,this.markCacheDirty(t));}}}}dispose(){this.dirtyEntities.clear();}}St.MAX_DEPTH=32;class Ct{collectEntityData(e){if(!e)return this.getEmptyEntityDebugData();const t=e.entities;if(!t)return this.getEmptyEntityDebugData();let n;try{n=t.getStats?t.getStats():this.calculateFallbackEntityStats(t);}catch(e){return {totalEntities:0,activeEntities:0,pendingAdd:0,pendingRemove:0,entitiesPerArchetype:[],topEntitiesByComponents:[],entityHierarchy:[],entityDetailsMap:{}}}const s=this.collectArchetypeData(e);return {totalEntities:n.totalEntities,activeEntities:n.activeEntities,pendingAdd:n.pendingAdd||0,pendingRemove:n.pendingRemove||0,entitiesPerArchetype:s.distribution,topEntitiesByComponents:s.topEntities,entityHierarchy:[],entityDetailsMap:{}}}getRawEntityList(e){if(!e)return [];const t=e.entities;if(!t?.buffer)return [];const n=e.getSystem(St);return t.buffer.map(e=>{const t=e.getComponent(ht),s=n?.isActiveInHierarchy(e)??e.active,i=n?.getDepth(e)??0;return {id:e.id,name:e.name||`Entity_${e.id}`,active:false!==e.active,enabled:false!==e.enabled,activeInHierarchy:s,componentCount:e.components.length,componentTypes:e.components.map(e=>I(e)),parentId:t?.parentId??null,childIds:t?.childIds??[],depth:i,tag:e.tag||0,updateOrder:e.updateOrder||0}})}getEntityDetails(e,t){try{if(!t)return null;const n=t.entities;if(!n?.buffer)return null;const s=n.buffer.find(t=>t.id===e);if(!s)return null;const i=t.getSystem(St),r=i?.getParent(s),o=r?.name??null,a=s.getDebugInfo?s.getDebugInfo():this.buildFallbackEntityInfo(s,t,i),c=this.extractComponentDetails(s.components),h=this.getSceneInfo(t);return {...a,scene:h.name,sceneName:h.name,sceneType:h.type,parentName:o,components:c||[],componentCount:s.components?.length||0,componentTypes:s.components?.map(e=>I(e))||[]}}catch(e){return {error:`获取实体详情失败: ${e instanceof Error?e.message:String(e)}`,scene:"获取失败",components:[],componentCount:0,componentTypes:[]}}}getSceneInfo(e){let t="当前场景",n="Scene";try{if(e.name&&"string"==typeof e.name&&e.name.trim())t=e.name.trim();else if(e.constructor&&e.constructor.name)t=e.constructor.name,n=e.constructor.name;else if(e._name&&"string"==typeof e._name&&e._name.trim())t=e._name.trim();else {const s=Object.getPrototypeOf(e)?.constructor?.name;s&&"Object"!==s&&(t=s,n=s);}}catch(e){t="场景名获取失败";}return {name:t,type:n}}collectEntityDataWithMemory(e){if(!e)return this.getEmptyEntityDebugData();const t=e.entities;if(!t)return this.getEmptyEntityDebugData();let n;try{n=t.getStats?t.getStats():this.calculateFallbackEntityStats(t);}catch(e){return {totalEntities:0,activeEntities:0,pendingAdd:0,pendingRemove:0,entitiesPerArchetype:[],topEntitiesByComponents:[],entityHierarchy:[],entityDetailsMap:{}}}const s=this.collectArchetypeDataWithMemory(e);return {totalEntities:n.totalEntities,activeEntities:n.activeEntities,pendingAdd:n.pendingAdd||0,pendingRemove:n.pendingRemove||0,entitiesPerArchetype:s.distribution,topEntitiesByComponents:s.topEntities,entityHierarchy:this.buildEntityHierarchyTree(t,e),entityDetailsMap:this.buildEntityDetailsMap(t,e)}}collectArchetypeData(e){if(e&&e.archetypeSystem&&"function"==typeof e.archetypeSystem.getAllArchetypes)return this.extractArchetypeStatistics(e.archetypeSystem);const t={entities:e.entities?.buffer||[]};return {distribution:this.getArchetypeDistributionFast(t),topEntities:this.getTopEntitiesByComponentsFast(t)}}getArchetypeDistributionFast(e){const t=new Map;return e&&e.entities&&e.entities.forEach(e=>{const n=e.components?.map(e=>I(e))||[],s=n.length>0?n.sort().join(", "):"无组件",i=t.get(s);i?i.count++:t.set(s,{count:1,componentTypes:n});}),Array.from(t.entries()).map(([e,t])=>({signature:e,count:t.count,memory:0})).sort((e,t)=>t.count-e.count).slice(0,20)}getTopEntitiesByComponentsFast(e){return e&&e.entities?e.entities.map(e=>({id:e.id.toString(),name:e.name||`Entity_${e.id}`,componentCount:e.components?.length||0,memory:0})).sort((e,t)=>t.componentCount-e.componentCount):[]}collectArchetypeDataWithMemory(e){if(e&&e.archetypeSystem&&"function"==typeof e.archetypeSystem.getAllArchetypes)return this.extractArchetypeStatisticsWithMemory(e.archetypeSystem);const t={entities:e.entities?.buffer||[]};return {distribution:this.getArchetypeDistributionWithMemory(t),topEntities:this.getTopEntitiesByComponentsWithMemory(t)}}extractArchetypeStatistics(e){const t=e.getAllArchetypes(),n=[],s=[];return t.forEach(e=>{const t=e.componentTypes?.map(e=>e.name).join(",")||"Unknown",i=e.entities?.length||0;n.push({signature:t,count:i,memory:0}),e.entities&&e.entities.forEach(e=>{s.push({id:e.id.toString(),name:e.name||`Entity_${e.id}`,componentCount:e.components?.length||0,memory:0});});}),n.sort((e,t)=>t.count-e.count),s.sort((e,t)=>t.componentCount-e.componentCount),{distribution:n,topEntities:s}}extractArchetypeStatisticsWithMemory(e){const t=e.getAllArchetypes(),n=[],s=[];return t.forEach(e=>{const t=e.componentTypes?.map(e=>e.name).join(",")||"Unknown",i=e.entities?.length||0;let r=0;if(e.entities&&e.entities.length>0){const t=Math.min(5,e.entities.length);let n=0;for(let s=0;s<t;s++)n+=this.estimateEntityMemoryUsage(e.entities[s]);r=n/t*i;}n.push({signature:t,count:i,memory:r}),e.entities&&e.entities.forEach(e=>{s.push({id:e.id.toString(),name:e.name||`Entity_${e.id}`,componentCount:e.components?.length||0,memory:this.estimateEntityMemoryUsage(e)});});}),n.sort((e,t)=>t.count-e.count),s.sort((e,t)=>t.componentCount-e.componentCount),{distribution:n,topEntities:s}}getArchetypeDistributionWithMemory(e){const t=new Map;return e&&e.entities&&e.entities.forEach(e=>{const n=e.components?.map(e=>I(e))||[],s=n.length>0?n.sort().join(", "):"无组件",i=t.get(s);let r=this.estimateEntityMemoryUsage(e);(isNaN(r)||r<0)&&(r=0),i?(i.count++,i.memory+=r):t.set(s,{count:1,memory:r,componentTypes:n});}),Array.from(t.entries()).map(([e,t])=>({signature:e,count:t.count,memory:isNaN(t.memory)?0:t.memory})).sort((e,t)=>t.count-e.count)}getTopEntitiesByComponentsWithMemory(e){return e&&e.entities?e.entities.map(e=>({id:e.id.toString(),name:e.name||`Entity_${e.id}`,componentCount:e.components?.length||0,memory:this.estimateEntityMemoryUsage(e)})).sort((e,t)=>t.componentCount-e.componentCount):[]}getEmptyEntityDebugData(){return {totalEntities:0,activeEntities:0,pendingAdd:0,pendingRemove:0,entitiesPerArchetype:[],topEntitiesByComponents:[],entityHierarchy:[],entityDetailsMap:{}}}calculateFallbackEntityStats(e){const t=e.buffer||[],n=t.filter(e=>e.enabled&&!e.isDestroyed);return {totalEntities:t.length,activeEntities:n.length,pendingAdd:0,pendingRemove:0,averageComponentsPerEntity:n.length>0?t.reduce((e,t)=>e+(t.components?.length||0),0)/n.length:0}}estimateEntityMemoryUsage(e){try{let t=0;const n=this.calculateObjectSize(e,["components","children","parent"]);return !isNaN(n)&&n>0&&(t+=n),e.components&&Array.isArray(e.components)&&e.components.forEach(e=>{const n=this.calculateObjectSize(e,["entity"]);!isNaN(n)&&n>0&&(t+=n);}),isNaN(t)||t<0?0:t}catch(e){return 0}}calculateObjectSize(e,t=[]){if(!e||"object"!=typeof e)return 0;const n=new WeakSet,s=(e,i=0)=>{if(!e||"object"!=typeof e||i>=2)return 0;if(n.has(e))return 0;n.add(e);let r=32;try{const n=Object.keys(e),o=Math.min(n.length,20);for(let a=0;a<o;a++){const o=n[a];if(!o||t.includes(o)||"constructor"===o||"__proto__"===o||o.startsWith("_cc_")||o.startsWith("__"))continue;const c=e[o];r+=2*o.length,"string"==typeof c?r+=Math.min(2*c.length,200):"number"==typeof c?r+=8:"boolean"==typeof c?r+=4:Array.isArray(c)?r+=40+Math.min(8*c.length,160):"object"==typeof c&&null!==c&&(r+=s(c,i+1));}}catch(e){return 64}return r};try{const t=s(e);return Math.max(t,32)}catch(e){return 64}}buildEntityHierarchyTree(e,t){if(!e?.buffer)return [];const n=t?.getSystem(St),s=[];return e.buffer.forEach(e=>{const t=e.getComponent(ht);if(null==t?.parentId){const t=this.buildEntityHierarchyNode(e,n);s.push(t);}}),s.sort((e,t)=>e.name<t.name?-1:e.name>t.name?1:e.id-t.id),s}buildEntityHierarchyNode(e,t){const n=e.getComponent(ht),s=t?.isActiveInHierarchy(e)??e.active,i=t?.getDepth(e)??0;let r={id:e.id,name:e.name||`Entity_${e.id}`,active:false!==e.active,enabled:false!==e.enabled,activeInHierarchy:s,componentCount:e.components.length,componentTypes:e.components.map(e=>I(e)),parentId:n?.parentId??null,children:[],depth:i,tag:e.tag||0,updateOrder:e.updateOrder||0};if(t){const n=t.getChildren(e);n.length>0&&(r.children=n.map(e=>this.buildEntityHierarchyNode(e,t)));}if("function"==typeof e.getDebugInfo){const t=e.getDebugInfo();r={...r,...t};}return e.components&&e.components.length>0&&(r.componentDetails=this.extractComponentDetails(e.components)),r}buildEntityDetailsMap(e,t){if(!e?.buffer)return {};const n=t?.getSystem(St),s={},i=e.buffer;for(let e=0;e<i.length;e+=100){i.slice(e,e+100).forEach(e=>{const i=e.getDebugInfo?e.getDebugInfo():this.buildFallbackEntityInfo(e,t,n),r=e.getComponentCacheStats?e.getComponentCacheStats():null,o=this.extractComponentDetails(e.components),a=n?.getParent(e),c=a?.name??null;s[e.id]={...i,parentName:c,components:o,componentTypes:i.componentTypes||o.map(e=>e.typeName),cachePerformance:r?{hitRate:r.cacheStats.hitRate,size:r.cacheStats.size,maxSize:r.cacheStats.maxSize}:null};});}return s}buildFallbackEntityInfo(e,t,n){const s=this.getSceneInfo(t),i=e.getComponent(ht),r=n?.isActiveInHierarchy(e)??e.active,o=n?.getDepth(e)??0;return {name:e.name||`Entity_${e.id}`,id:e.id,enabled:false!==e.enabled,active:false!==e.active,activeInHierarchy:r,destroyed:e.isDestroyed||false,scene:s.name,sceneName:s.name,sceneType:s.type,componentCount:e.components.length,componentTypes:e.components.map(e=>I(e)),componentMask:e.componentMask?.toString()||"0",parentId:i?.parentId??null,childCount:i?.childIds?.length??0,childIds:i?.childIds??[],depth:o,tag:e.tag||0,updateOrder:e.updateOrder||0}}extractComponentDetails(e){return e.map(e=>{const t=I(e),n={};try{Object.keys(e).forEach(t=>{if(!t.startsWith("_")&&"entity"!==t&&"constructor"!==t){const s=e[t];null!=s&&(n[t]=this.formatPropertyValue(s));}}),0===Object.keys(n).length&&(n._info="该组件没有公开属性",n._componentId=I(e));}catch(t){n._error="属性提取失败",n._componentId=I(e);}return {typeName:t,properties:n}})}getComponentProperties(e,t,n){try{if(!n)return {};const s=n.entities;if(!s?.buffer)return {};const i=s.buffer.find(t=>t.id===e);if(!i||t>=i.components.length)return {};const r=i.components[t];if(!r)return {};const o={};return Object.keys(r).forEach(e=>{if(!e.startsWith("_")&&"entity"!==e){const t=r[e];null!=t&&(o[e]=this.formatPropertyValue(t));}}),o}catch(e){return {_error:"属性提取失败"}}}formatPropertyValue(e,t=0){return null==e?e:"object"!=typeof e?"string"==typeof e&&e.length>200?`[长字符串: ${e.length}字符] ${e.substring(0,100)}...`:e:0===t?this.formatObjectFirstLevel(e):this.createLazyLoadPlaceholder(e)}formatObjectFirstLevel(e){try{if(Array.isArray(e)){if(0===e.length)return [];if(e.length>10){const t=e.slice(0,3).map(e=>this.formatPropertyValue(e,1));return {_isLazyArray:!0,_arrayLength:e.length,_sample:t,_summary:`数组[${e.length}个元素]`}}return e.map(e=>this.formatPropertyValue(e,1))}const t=Object.keys(e);if(0===t.length)return {};const n={};let s=0;const i=15;for(const r of t){if(s>=i){n._hasMoreProperties=!0,n._totalProperties=t.length,n._hiddenCount=t.length-s;break}if(!r.startsWith("_")&&!r.startsWith("$")&&"function"!=typeof e[r])try{const t=e[r];null!=t&&(n[r]=this.formatPropertyValue(t,1),s++);}catch(e){n[r]=`[访问失败: ${e instanceof Error?e.message:String(e)}]`,s++;}}return n}catch(e){return `[对象解析失败: ${e instanceof Error?e.message:String(e)}]`}}createLazyLoadPlaceholder(e){try{const t=e.constructor?.name||"Object";return {_isLazyObject:!0,_typeName:t,_summary:this.getObjectSummary(e,t),_objectId:this.generateObjectId(e)}}catch(e){return {_isLazyObject:true,_typeName:"Unknown",_summary:`无法分析的对象: ${e instanceof Error?e.message:String(e)}`,_objectId:Math.random().toString(36).substr(2,9)}}}getObjectSummary(e,t){try{if((t.toLowerCase().includes("vec")||t.toLowerCase().includes("vector"))&&void 0!==e.x&&void 0!==e.y){const n=void 0!==e.z?e.z:"";return `${t}(${e.x}, ${e.y}${n?", "+n:""})`}if(t.toLowerCase().includes("color")&&void 0!==e.r&&void 0!==e.g&&void 0!==e.b){const n=void 0!==e.a?e.a:1;return `${t}(${e.r}, ${e.g}, ${e.b}, ${n})`}if(t.toLowerCase().includes("node")){return `${t}: ${e.name||e._name||"未命名"}`}if(t.toLowerCase().includes("component")){const n=e.node?.name||e.node?._name||"";return `${t}${n?` on ${n}`:""}`}const n=Object.keys(e);return 0===n.length?`${t} (空对象)`:`${t} (${n.length}个属性)`}catch(e){return `${t} (无法分析)`}}generateObjectId(e){try{return void 0!==e.id?`obj_${e.id}`:void 0!==e._id?`obj_${e._id}`:void 0!==e.uuid?`obj_${e.uuid}`:void 0!==e._uuid?`obj_${e._uuid}`:`obj_${Math.random().toString(36).substr(2,9)}`}catch{return `obj_${Math.random().toString(36).substr(2,9)}`}}expandLazyObject(e,t,n,s){try{if(!s)return null;const i=s.entities;if(!i?.buffer)return null;const r=i.buffer.find(t=>t.id===e);if(!r)return null;if(t>=r.components.length)return null;const o=r.components[t],a=this.getObjectByPath(o,n);return a?this.formatObjectFirstLevel(a):null}catch(e){return {error:`展开失败: ${e instanceof Error?e.message:String(e)}`}}}getObjectByPath(e,t){if(!t)return e;const n=t.split(".");let s=e;for(const e of n){if(null==s)return null;if(e.includes("[")&&e.includes("]")){const t=e.substring(0,e.indexOf("[")),n=parseInt(e.substring(e.indexOf("[")+1,e.indexOf("]")));if(t&&(s=s[t]),!(Array.isArray(s)&&n>=0&&n<s.length))return null;s=s[n];}else s=s[e];}return s}}class vt{collectSystemData(e,t){if(!t)return {totalSystems:0,systemsInfo:[]};const n=t.systems||[];let s=new Map,i=new Map;if(e)try{s=e.getAllSystemStats(),i=e.getAllSystemData();}catch(e){}return {totalSystems:n.length,systemsInfo:n.map(e=>{const t=e.systemName||se(e),n=s.get(t),r=i.get(t);return {name:t,type:se(e),entityCount:e.entities?.length||0,executionTime:n?.averageTime||r?.executionTime||0,minExecutionTime:n?.minTime===Number.MAX_VALUE?0:n?.minTime||0,maxExecutionTime:n?.maxTime||0,executionTimeHistory:n?.recentTimes||[],updateOrder:e.updateOrder||0,enabled:false!==e.enabled,lastUpdateTime:r?.lastUpdateTime||0}})}}}class Et{constructor(){this.frameTimeHistory=[],this.maxHistoryLength=60,this.gcCollections=0,this.lastMemoryCheck=0;}collectPerformanceData(e){const t=n$1.deltaTime,s=1e3*t,i=t>0?Math.round(1/t):0,r=this.getECSPerformanceData(e),o=r.totalExecutionTime,a=s>0?o/s*100:0;let c=0;performance.memory&&(c=performance.memory.usedJSHeapSize/1024/1024),this.frameTimeHistory.push(o),this.frameTimeHistory.length>this.maxHistoryLength&&this.frameTimeHistory.shift();const h=this.frameTimeHistory.filter(e=>e>=0);return {frameTime:o,engineFrameTime:s,ecsPercentage:a,memoryUsage:c,fps:i,averageFrameTime:h.length>0?h.reduce((e,t)=>e+t,0)/h.length:o,minFrameTime:h.length>0?Math.min(...h):o,maxFrameTime:h.length>0?Math.max(...h):o,frameTimeHistory:[...this.frameTimeHistory],systemPerformance:this.getSystemPerformance(e),systemBreakdown:r.systemBreakdown,memoryDetails:this.getMemoryDetails()}}getECSPerformanceData(e){if(!e)return {totalExecutionTime:0,systemBreakdown:[]};if(!e.enabled){try{e.enabled=!0;}catch(e){}return {totalExecutionTime:0,systemBreakdown:[]}}try{let t=0;const n=[],s=e.getAllSystemStats();if(0===s.size)return {totalExecutionTime:0,systemBreakdown:[]};for(const[e,i]of s.entries()){const s=i.recentTimes&&i.recentTimes.length>0?i.recentTimes[i.recentTimes.length-1]:i.averageTime||0;t+=s,n.push({systemName:e,executionTime:s,percentage:0});}return n.forEach(e=>{e.percentage=t>0?e.executionTime/t*100:0;}),n.sort((e,t)=>t.executionTime-e.executionTime),{totalExecutionTime:t,systemBreakdown:n}}catch(e){return {totalExecutionTime:0,systemBreakdown:[]}}}getSystemPerformance(e){if(!e)return [];try{const t=e.getAllSystemStats(),n=e.getAllSystemData();return Array.from(t.entries()).map(([e,t])=>{const s=n.get(e);return {systemName:e,averageTime:t.averageTime||0,maxTime:t.maxTime||0,minTime:t.minTime===Number.MAX_VALUE?0:t.minTime||0,samples:t.executionCount||0,percentage:0,entityCount:s?.entityCount||0,lastExecutionTime:s?.executionTime||0}})}catch(e){return []}}getMemoryDetails(){const e={entities:0,components:0,systems:0,pooled:0,totalMemory:0,usedMemory:0,freeMemory:0,gcCollections:this.updateGCCount()};try{if(performance.memory){const t=performance.memory;if(e.totalMemory=t.jsHeapSizeLimit||536870912,e.usedMemory=t.usedJSHeapSize||0,e.freeMemory=e.totalMemory-e.usedMemory,this.lastMemoryCheck>0){this.lastMemoryCheck-e.usedMemory>1048576&&this.gcCollections++;}this.lastMemoryCheck=e.usedMemory;}else e.totalMemory=536870912,e.freeMemory=536870912;}catch(e){return {totalMemory:0,usedMemory:0,freeMemory:0,entityMemory:0,componentMemory:0,systemMemory:0,pooledMemory:0,gcCollections:this.gcCollections}}return e}updateGCCount(){try{return "undefined"!=typeof PerformanceObserver||performance.measureUserAgentSpecificMemory,this.gcCollections}catch(e){return this.gcCollections}}}class bt{constructor(e,t,n=1e3,s=10){this.pool=[],this.stats={totalCreated:0,totalAcquired:0,totalReleased:0},this.createFn=e,t&&(this.resetFn=t),this.maxSize=n,this.minSize=Math.max(1,s);}acquire(){return this.stats.totalAcquired++,this.pool.length>0?this.pool.pop():(this.stats.totalCreated++,this.createFn())}release(e){this.stats.totalReleased++,this.pool.length>=this.maxSize||(this.resetFn&&this.resetFn(e),this.pool.push(e));}prewarm(e){const t=Math.min(e,this.maxSize);for(let e=this.pool.length;e<t;e++){const e=this.createFn();this.resetFn&&this.resetFn(e),this.pool.push(e),this.stats.totalCreated++;}}shrink(){for(;this.pool.length>this.minSize;)this.pool.pop();}clear(){this.pool.length=0;}getAvailableCount(){return this.pool.length}getMaxSize(){return this.maxSize}getStats(){const e=0===this.stats.totalAcquired?0:(this.stats.totalAcquired-this.stats.totalCreated)/this.stats.totalAcquired;return {totalCreated:this.stats.totalCreated,totalAcquired:this.stats.totalAcquired,totalReleased:this.stats.totalReleased,hitRate:e,currentSize:this.pool.length,maxSize:this.maxSize,minSize:this.minSize,utilizationRate:this.pool.length/this.maxSize}}}class Tt{constructor(){this._pools=new Map,this._usageTracker=new Map,this._autoCleanupInterval=6e4,this._lastCleanupTime=0;}static getInstance(){return Tt._instance||(Tt._instance=new Tt),Tt._instance}registerPool(e,t,n,s,i){this._pools.set(e,new bt(t,n,s,i)),this._usageTracker.set(e,{createCount:0,releaseCount:0,lastAccessTime:Date.now()});}acquireComponent(e){const t=this._pools.get(e);return this._trackUsage(e,"create"),t?t.acquire():null}releaseComponent(e,t){const n=this._pools.get(e);this._trackUsage(e,"release"),n&&n.release(t);}_trackUsage(e,t){let n=this._usageTracker.get(e);n||(n={createCount:0,releaseCount:0,lastAccessTime:Date.now()},this._usageTracker.set(e,n)),"create"===t?n.createCount++:n.releaseCount++,n.lastAccessTime=Date.now();}update(){const e=Date.now();if(!(e-this._lastCleanupTime<this._autoCleanupInterval)){for(const[t,n]of this._usageTracker.entries()){if(e-n.lastAccessTime>12e4){const e=this._pools.get(t);e&&e.shrink();}}this._lastCleanupTime=e;}}getHotComponents(e=100){return Array.from(this._usageTracker.entries()).filter(([t,n])=>n.createCount>e).map(([e])=>e)}prewarmAll(e=100){for(const t of this._pools.values())t.prewarm(e);}clearAll(){for(const e of this._pools.values())e.clear();}reset(){this._pools.clear(),this._usageTracker.clear();}getGlobalStats(){const e=[];for(const[t,n]of this._pools.entries())e.push({componentName:t,poolStats:n.getStats(),usage:this._usageTracker.get(t)});return e}getPoolStats(){const e=new Map;for(const[t,n]of this._pools)e.set(t,{available:n.getAvailableCount(),maxSize:n.getMaxSize()});return e}getPoolUtilization(){const e=new Map;for(const[t,n]of this._pools){const s=n.getAvailableCount(),i=n.getMaxSize(),r=i-s,o=i>0?r/i*100:0;e.set(t,{used:r,total:i,utilization:o});}return e}getComponentUtilization(e){const t=this._pools.get(e);if(!t)return 0;const n=t.getAvailableCount(),s=t.getMaxSize();return s>0?(s-n)/s*100:0}}class wt{collectComponentData(e){if(!e)return {componentTypes:0,componentInstances:0,componentStats:[]};const t=e.entities;if(!t?.buffer)return {componentTypes:0,componentInstances:0,componentStats:[]};const n=new Map;let s=0;t.buffer.forEach(e=>{e.components&&e.components.forEach(e=>{const t=I(e),i=n.get(t)||{count:0,entities:0};i.count++,s++,n.set(t,i);});});const i=new Map,r=new Map;try{const e=Tt.getInstance(),t=e.getPoolStats(),n=e.getPoolUtilization();for(const[e,n]of t.entries())r.set(e,n.maxSize);for(const[e,t]of n.entries())i.set(e,t.utilization);}catch(e){}return {componentTypes:n.size,componentInstances:s,componentStats:Array.from(n.entries()).map(([n,s])=>{const o=r.get(n)||0,a=i.get(n)||0,c=this.getEstimatedComponentSize(n,e);return {typeName:n,instanceCount:s.count,memoryPerInstance:c,totalMemory:s.count*c,poolSize:o,poolUtilization:a,averagePerEntity:s.count/t.buffer.length}})}}getEstimatedComponentSize(e,t){if(wt.componentSizeCache.has(e))return wt.componentSizeCache.get(e);if(!t)return 64;const n=t.entities;if(!n?.buffer)return 64;let s=64;try{for(const t of n.buffer)if(t.components){const n=t.components.find(t=>I(t)===e);if(n){s=this.calculateQuickObjectSize(n);break}}}catch(e){s=64;}return wt.componentSizeCache.set(e,s),s}calculateQuickObjectSize(e){if(!e||"object"!=typeof e)return 8;let t=32;const n=new WeakSet,s=(e,t=0)=>{if(!e||"object"!=typeof e||n.has(e)||t>3)return 0;n.add(e);let i=0;try{const n=Object.keys(e);for(let r=0;r<Math.min(n.length,20);r++){const o=n[r];if(!o||"entity"===o||"_entity"===o||"constructor"===o)continue;const a=e[o];i+=2*o.length,"string"==typeof a?i+=Math.min(2*a.length,200):"number"==typeof a?i+=8:"boolean"==typeof a?i+=4:"object"==typeof a&&null!==a&&(i+=s(a,t+1));}}catch(e){return 32}return i};return t+=s(e),Math.max(t,32)}calculateDetailedComponentMemory(e,t){if(!t)return this.getEstimatedComponentSize(e,t);const n=t.entities;if(!n?.buffer)return this.getEstimatedComponentSize(e,t);try{for(const t of n.buffer)if(t.components){const n=t.components.find(t=>I(t)===e);if(n)return this.estimateObjectSize(n)}}catch(e){}return this.getEstimatedComponentSize(e,t)}estimateObjectSize(e,t=new WeakSet,n=0){if(null==e||n>10)return 0;if(t.has(e))return 0;let s=0;switch(typeof e){case "boolean":s=4;break;case "number":default:s=8;break;case "string":s=24+Math.min(2*e.length,1e3);break;case "object":if(t.add(e),Array.isArray(e)){s=40+8*e.length;const i=Math.min(e.length,50);for(let r=0;r<i;r++)s+=this.estimateObjectSize(e[r],t,n+1);}else {s=32;try{const i=Object.getOwnPropertyNames(e),r=Math.min(i.length,30);for(let o=0;o<r;o++){const r=i[o];if(r&&("constructor"!==r&&"__proto__"!==r&&"entity"!==r&&"_entity"!==r&&!r.startsWith("_cc_")&&!r.startsWith("__")))try{s+=16+2*r.length;const i=e[r];null!=i&&(s+=this.estimateObjectSize(i,t,n+1));}catch(e){continue}}}catch(e){s=128;}}}return 8*Math.ceil(s/8)}static clearCache(){wt.componentSizeCache.clear();}}wt.componentSizeCache=new Map;class It{constructor(){this.sceneStartTime=Date.now();}collectSceneData(e){if(!e)return {currentSceneName:"No Scene",isInitialized:false,sceneRunTime:0,sceneEntityCount:0,sceneSystemCount:0,sceneUptime:0};const t=(Date.now()-this.sceneStartTime)/1e3,n=e.getStats();return {currentSceneName:e.name||"Unnamed Scene",isInitialized:true,sceneRunTime:t,sceneEntityCount:n.entityCount,sceneSystemCount:n.processorCount,sceneUptime:t}}setSceneStartTime(e){this.sceneStartTime=e;}}class Mt{constructor(e,t=true){this.isConnected=false,this.reconnectAttempts=0,this.maxReconnectAttempts=5,this.url=e,this.autoReconnect=t;}setMessageHandler(e){this.messageHandler=e;}connect(){return new Promise((e,t)=>{try{this.ws=new WebSocket(this.url),this.ws.onopen=t=>{this.handleOpen(t),e();},this.ws.onclose=e=>{this.handleClose(e);},this.ws.onerror=e=>{this.handleError(e),t(e);},this.ws.onmessage=e=>{this.handleMessage(e);};}catch(e){this.handleConnectionFailure(e),t(e);}})}disconnect(){this.ws&&(this.autoReconnect=false,this.ws.close(),delete this.ws),this.isConnected=false;}send(e){if(this.isConnected&&this.ws)try{const t="string"==typeof e?e:JSON.stringify(e);this.ws.send(t);}catch(e){}}getConnectionStatus(){return this.isConnected}setMaxReconnectAttempts(e){this.maxReconnectAttempts=e;}scheduleReconnect(){this.reconnectTimer&&clearTimeout(this.reconnectTimer);const e=Math.min(1e3*Math.pow(2,this.reconnectAttempts),3e4);this.reconnectAttempts++,this.reconnectTimer=setTimeout(()=>{this.connect().catch(e=>{this.reconnectAttempts<this.maxReconnectAttempts&&this.scheduleReconnect();});},e);}handleMessage(e){try{const t=JSON.parse(e.data);this.messageHandler&&this.messageHandler(t);}catch(e){}}handleOpen(e){this.isConnected=true,this.reconnectAttempts=0,this.onOpen&&this.onOpen(e);}handleClose(e){this.isConnected=false,this.onClose&&this.onClose(e),this.autoReconnect&&this.reconnectAttempts<this.maxReconnectAttempts&&this.scheduleReconnect();}handleError(e){this.onError&&this.onError(e);}handleConnectionFailure(e){this.onError&&this.onError(e);}}!function(e){e.ECS="ECS",e.Rendering="Rendering",e.Physics="Physics",e.Audio="Audio",e.Network="Network",e.Script="Script",e.Memory="Memory",e.Animation="Animation",e.AI="AI",e.Input="Input",e.Loading="Loading",e.Custom="Custom";}(gt||(gt={}));const At={enabled:false,maxFrameHistory:300,maxSampleDepth:32,collectMemory:true,memorySampleInterval:100,detectLongTasks:true,longTaskThreshold:50,enabledCategories:new Set(Object.values(gt))};let kt=0;class Dt{constructor(e){this.currentFrame=null,this.frameHistory=[],this.frameNumber=0,this.activeSamples=new Map,this.sampleStack=[],this.counters=new Map,this.callGraph=new Map,this.gcCount=0,this.previousHeapSize=0,this.longTasks=[],this.performanceObserver=null,this._config={...At,...e},this._config.detectLongTasks&&this._setupLongTaskObserver();}static getInstance(e){return Dt._instance||(Dt._instance=new Dt(e)),Dt._instance}static resetInstance(){Dt._instance&&(Dt._instance.dispose(),Dt._instance=null);}static beginSample(e,t=gt.Custom){return Dt.getInstance().beginSample(e,t)}static endSample(e){e&&Dt.getInstance().endSample(e);}static measure(e,t,n=gt.Custom){return Dt.getInstance().measure(e,t,n)}static async measureAsync(e,t,n=gt.Custom){return Dt.getInstance().measureAsync(e,t,n)}static beginFrame(){Dt.getInstance().beginFrame();}static endFrame(){Dt.getInstance().endFrame();}static incrementCounter(e,t=1,n=gt.Custom){Dt.getInstance().incrementCounter(e,t,n);}static setGauge(e,t,n=gt.Custom){Dt.getInstance().setGauge(e,t,n);}static setEnabled(e){Dt.getInstance().setEnabled(e);}static isEnabled(){return Dt.getInstance()._config.enabled}static getCurrentFrame(){return Dt.getInstance().currentFrame}static getFrameHistory(){return Dt.getInstance().frameHistory}static getReport(e){return Dt.getInstance().generateReport(e)}static reset(){Dt.getInstance().reset();}beginSample(e,t=gt.Custom){if(!this._config.enabled||!this._config.enabledCategories.has(t))return null;const n=this.sampleStack.length>0?this.sampleStack[this.sampleStack.length-1]:void 0;if(n&&this.sampleStack.length>=this._config.maxSampleDepth)return null;const s={id:`sample_${++kt}_${Date.now()}`,name:e,category:t,startTime:performance.now(),depth:this.sampleStack.length,parentId:n?.id};return this.activeSamples.set(s.id,s),this.sampleStack.push(s),s}endSample(e){if(!this._config.enabled||!this.activeSamples.has(e.id))return;const t=performance.now(),n=t-e.startTime,s=e.parentId?this.activeSamples.get(e.parentId):void 0,i={id:e.id,name:e.name,category:e.category,startTime:e.startTime,endTime:t,duration:n,selfTime:n,parentId:e.parentId,parentName:s?.name,depth:e.depth,callCount:1};this.currentFrame&&this.currentFrame.samples.push(i),this._updateCallGraph(e.name,e.category,n,s),this.activeSamples.delete(e.id);const r=this.sampleStack.indexOf(e);-1!==r&&this.sampleStack.splice(r,1);}measure(e,t,n=gt.Custom){const s=this.beginSample(e,n);try{return t()}finally{s&&this.endSample(s);}}async measureAsync(e,t,n=gt.Custom){const s=this.beginSample(e,n);try{return await t()}finally{s&&this.endSample(s);}}beginFrame(){this._config.enabled&&(this.frameNumber++,this.currentFrame={frameNumber:this.frameNumber,startTime:performance.now(),endTime:0,duration:0,samples:[],sampleStats:[],counters:new Map(this.counters),memory:this._captureMemory(),categoryStats:new Map},this._resetFrameCounters());}endFrame(){if(this._config.enabled&&this.currentFrame){for(this.currentFrame.endTime=performance.now(),this.currentFrame.duration=this.currentFrame.endTime-this.currentFrame.startTime,this._calculateSampleStats(),this._calculateCategoryStats(),this.frameHistory.push(this.currentFrame);this.frameHistory.length>this._config.maxFrameHistory;)this.frameHistory.shift();this.sampleStack=[],this.activeSamples.clear();}}incrementCounter(e,t=1,n=gt.Custom){if(!this._config.enabled)return;let s=this.counters.get(e);s||(s={name:e,category:n,value:0,type:"counter",history:[]},this.counters.set(e,s)),s.value+=t,s.history.push({time:performance.now(),value:s.value}),s.history.length>100&&s.history.shift();}setGauge(e,t,n=gt.Custom){if(!this._config.enabled)return;let s=this.counters.get(e);s||(s={name:e,category:n,value:0,type:"gauge",history:[]},this.counters.set(e,s)),s.value=t,s.history.push({time:performance.now(),value:t}),s.history.length>100&&s.history.shift();}setEnabled(e){this._config.enabled=e,e&&this._config.detectLongTasks&&!this.performanceObserver&&this._setupLongTaskObserver();}reset(){this.frameHistory=[],this.currentFrame=null,this.frameNumber=0,this.activeSamples.clear(),this.sampleStack=[],this.counters.clear(),this.callGraph.clear(),this.gcCount=0,this.longTasks=[];}generateReport(e){const t=e?this.frameHistory.slice(-e):this.frameHistory;if(0===t.length)return this._createEmptyReport();const n=t.map(e=>e.duration),s=[...n].sort((e,t)=>e-t),i=this._aggregateSampleStats(t).sort((e,t)=>t.inclusiveTime-e.inclusiveTime).slice(0,20),r=this._aggregateCategoryStats(t),o=this._buildCallGraphFromFrames(t),a=t[0],c=t[t.length-1];return {startTime:a?.startTime??0,endTime:c?.endTime??0,totalFrames:t.length,averageFrameTime:n.reduce((e,t)=>e+t,0)/n.length,minFrameTime:Math.min(...n),maxFrameTime:Math.max(...n),p95FrameTime:s[Math.floor(.95*s.length)]||0,p99FrameTime:s[Math.floor(.99*s.length)]||0,hotspots:i,callGraph:o,categoryBreakdown:r,memoryTrend:t.map(e=>e.memory),longTasks:[...this.longTasks]}}_buildCallGraphFromFrames(e){const t=new Map;for(const n of e)for(const e of n.samples){let n=t.get(e.name);if(n||(n={category:e.category,callCount:0,totalTime:0,callers:new Map,callees:new Map},t.set(e.name,n)),n.callCount++,n.totalTime+=e.duration,e.parentName){const s=n.callers.get(e.parentName)||{count:0,totalTime:0};s.count++,s.totalTime+=e.duration,n.callers.set(e.parentName,s);let i=t.get(e.parentName);i||(i={category:e.category,callCount:0,totalTime:0,callers:new Map,callees:new Map},t.set(e.parentName,i));const r=i.callees.get(e.name)||{count:0,totalTime:0};r.count++,r.totalTime+=e.duration,i.callees.set(e.name,r);}}const n=new Map;for(const[e,s]of t){const t=new Map;for(const[e,n]of s.callers)t.set(e,{count:n.count,totalTime:n.count>0?n.totalTime/n.count:0});const i=new Map;for(const[e,t]of s.callees)i.set(e,{count:t.count,totalTime:t.count>0?t.totalTime/t.count:0});n.set(e,{name:e,category:s.category,callCount:s.callCount,totalTime:s.callCount>0?s.totalTime/s.callCount:0,callers:t,callees:i});}return n}getCallGraph(){return new Map(this.callGraph)}getFunctionCallInfo(e){const t=this.callGraph.get(e);return t?{callers:Array.from(t.callers.entries()).map(([e,t])=>({name:e,...t})),callees:Array.from(t.callees.entries()).map(([e,t])=>({name:e,...t}))}:null}dispose(){this.performanceObserver&&(this.performanceObserver.disconnect(),this.performanceObserver=null),this.reset();}_captureMemory(){const e=performance.now();let t=0,n=0,s=0;const i=performance;return i.memory&&(t=i.memory.usedJSHeapSize||0,n=i.memory.totalJSHeapSize||0,s=i.memory.jsHeapSizeLimit||0,this.previousHeapSize>0&&t<this.previousHeapSize-1048576&&this.gcCount++,this.previousHeapSize=t),{timestamp:e,usedHeapSize:t,totalHeapSize:n,heapSizeLimit:s,utilizationPercent:s>0?t/s*100:0,gcCount:this.gcCount}}_resetFrameCounters(){for(const e of this.counters.values())"counter"===e.type&&(e.value=0);}_calculateSampleStats(){if(!this.currentFrame)return;const e=new Map;for(const t of this.currentFrame.samples){let n=e.get(t.name);n||(n={name:t.name,category:t.category,inclusiveTime:0,exclusiveTime:0,callCount:0,averageTime:0,minTime:Number.MAX_VALUE,maxTime:0,percentOfFrame:0,percentOfParent:0,children:[],depth:t.depth},e.set(t.name,n)),n.inclusiveTime+=t.duration,n.callCount+=1,n.minTime=Math.min(n.minTime,t.duration),n.maxTime=Math.max(n.maxTime,t.duration);}for(const t of this.currentFrame.samples)if(t.parentId){const n=this.currentFrame.samples.find(e=>e.id===t.parentId);if(n){const t=e.get(n.name);if(t){t.exclusiveTime=t.inclusiveTime;for(const e of this.currentFrame.samples)e.parentId===n.id&&(t.exclusiveTime-=e.duration);}}}const t=this.currentFrame.duration||1;for(const n of e.values())n.averageTime=n.inclusiveTime/n.callCount,n.percentOfFrame=n.inclusiveTime/t*100,0===n.exclusiveTime&&(n.exclusiveTime=n.inclusiveTime);this.currentFrame.sampleStats=Array.from(e.values()).sort((e,t)=>t.inclusiveTime-e.inclusiveTime);}_calculateCategoryStats(){if(!this.currentFrame)return;const e=new Map;for(const t of this.currentFrame.samples)if(0===t.depth){let n=e.get(t.category);n||(n={totalTime:0,sampleCount:0},e.set(t.category,n)),n.totalTime+=t.duration,n.sampleCount+=1;}const t=this.currentFrame.duration||1;for(const[n,s]of e)this.currentFrame.categoryStats.set(n,{...s,percentOfFrame:s.totalTime/t*100});}_updateCallGraph(e,t,n,s){let i=this.callGraph.get(e);if(i||(i={name:e,category:t,callCount:0,totalTime:0,callers:new Map,callees:new Map},this.callGraph.set(e,i)),i.callCount++,i.totalTime+=n,s){const t=i.callers.get(s.name)||{count:0,totalTime:0};t.count++,t.totalTime+=n,i.callers.set(s.name,t);let r=this.callGraph.get(s.name);r||(r={name:s.name,category:s.category,callCount:0,totalTime:0,callers:new Map,callees:new Map},this.callGraph.set(s.name,r));const o=r.callees.get(e)||{count:0,totalTime:0};o.count++,o.totalTime+=n,r.callees.set(e,o);}}_aggregateSampleStats(e){const t=new Map;for(const n of e)for(const e of n.sampleStats){let n=t.get(e.name);n?(n.inclusiveTime+=e.inclusiveTime,n.exclusiveTime+=e.exclusiveTime,n.callCount+=e.callCount,n.minTime=Math.min(n.minTime,e.minTime),n.maxTime=Math.max(n.maxTime,e.maxTime)):(n={...e,minTime:Number.MAX_VALUE},t.set(e.name,n));}const n=e.reduce((e,t)=>e+t.duration,0);for(const e of t.values())e.averageTime=e.inclusiveTime/e.callCount,e.percentOfFrame=e.inclusiveTime/n*100;return Array.from(t.values())}_aggregateCategoryStats(e){const t=new Map;for(const n of e)for(const[e,s]of n.categoryStats){let n=t.get(e);n||(n={totalTime:0,frameCount:0},t.set(e,n)),n.totalTime+=s.totalTime,n.frameCount++;}const n=e.reduce((e,t)=>e+t.duration,0),s=new Map;for(const[e,i]of t)s.set(e,{totalTime:i.totalTime,averageTime:i.frameCount>0?i.totalTime/i.frameCount:0,percentOfTotal:n>0?i.totalTime/n*100:0});return s}_setupLongTaskObserver(){if("undefined"!=typeof PerformanceObserver)try{this.performanceObserver=new PerformanceObserver(e=>{for(const t of e.getEntries())t.duration>this._config.longTaskThreshold&&(this.longTasks.push({startTime:t.startTime,duration:t.duration,attribution:t.attribution?.map(e=>e.name)||[]}),this.longTasks.length>100&&this.longTasks.shift());}),this.performanceObserver.observe({entryTypes:["longtask"]});}catch{}}_createEmptyReport(){return {startTime:0,endTime:0,totalFrames:0,averageFrameTime:0,minFrameTime:0,maxFrameTime:0,p95FrameTime:0,p99FrameTime:0,hotspots:[],callGraph:new Map,categoryBreakdown:new Map,memoryTrend:[],longTasks:[]}}}Dt._instance=null;class xt{constructor(){this.selectedFunction=null,this.peakMemory=0;}setSelectedFunction(e){this.selectedFunction=e;}collectAdvancedData(e){const t=Dt.getFrameHistory(),n=Dt.getCurrentFrame(),s=Dt.getReport(300),i=n?.memory||this.getDefaultMemory();return i.usedHeapSize>this.peakMemory&&(this.peakMemory=i.usedHeapSize),{currentFrame:this.buildCurrentFrameData(n),frameTimeHistory:this.buildFrameTimeHistory(t),categoryStats:this.buildCategoryStats(n,e),hotspots:this.buildHotspots(s),callGraph:this.buildCallGraph(s),longTasks:s.longTasks,memoryTrend:this.buildMemoryTrend(s.memoryTrend),summary:this.buildSummary(s,i)}}collectFromLegacyMonitor(e){if(!e)return this.createEmptyData();const t=e.getAllSystemStats?.()||new Map,s=e.getAllSystemData?.()||new Map,i=1e3*n$1.deltaTime,r=i>0?Math.round(1e3/i):0,o=this.buildCategoryStatsFromLegacy(t,s,i),a=this.buildHotspotsFromLegacy(t,s,i);return {currentFrame:{frameNumber:0,frameTime:i,fps:r,memory:this.getCurrentMemory()},frameTimeHistory:[],categoryStats:o,hotspots:a,callGraph:{currentFunction:this.selectedFunction,callers:[],callees:[]},longTasks:[],memoryTrend:[],summary:{totalFrames:0,averageFrameTime:i,minFrameTime:i,maxFrameTime:i,p95FrameTime:i,p99FrameTime:i,currentMemoryMB:this.getCurrentMemory().usedHeapSize/1048576,peakMemoryMB:this.peakMemory/1048576,gcCount:0,longTaskCount:0}}}buildCurrentFrameData(e){if(!e){const e=1e3*n$1.deltaTime;return {frameNumber:0,frameTime:e,fps:e>0?Math.round(1e3/e):0,memory:this.getCurrentMemory()}}return {frameNumber:e.frameNumber,frameTime:e.duration,fps:e.duration>0?Math.round(1e3/e.duration):0,memory:e.memory}}buildFrameTimeHistory(e){return e.map(e=>({frameNumber:e.frameNumber,time:e.startTime,duration:e.duration}))}buildCategoryStats(e,t){const s=[];if(e&&e.categoryStats.size>0){const t=e.duration||1;for(const[n,i]of e.categoryStats){const r=e.sampleStats.filter(e=>e.category===n).map(e=>({name:e.name,inclusiveTime:e.inclusiveTime,exclusiveTime:e.exclusiveTime,callCount:e.callCount,percentOfCategory:i.totalTime>0?e.inclusiveTime/i.totalTime*100:0,percentOfFrame:e.inclusiveTime/t*100})).sort((e,t)=>t.inclusiveTime-e.inclusiveTime);s.push({category:n,totalTime:i.totalTime,percentOfFrame:i.percentOfFrame,sampleCount:i.sampleCount,items:r});}}if(t&&0===s.length){const e=t.getAllSystemStats?.()||new Map,s=t.getAllSystemData?.()||new Map,i=1e3*n$1.deltaTime||1;return this.buildCategoryStatsFromLegacy(e,s,i)}return s.sort((e,t)=>t.totalTime-e.totalTime)}buildCategoryStatsFromLegacy(e,t,n){const s=[];let i=0;for(const[r,o]of e.entries()){const e=t.get(r),a=e?.executionTime||o?.averageTime||0;i+=a,s.push({name:r,inclusiveTime:a,exclusiveTime:a,callCount:1,percentOfCategory:0,percentOfFrame:n>0?a/n*100:0});}for(const e of s)e.percentOfCategory=i>0?e.inclusiveTime/i*100:0;return s.sort((e,t)=>t.inclusiveTime-e.inclusiveTime),0===s.length?[]:[{category:gt.ECS,totalTime:i,percentOfFrame:n>0?i/n*100:0,sampleCount:s.length,items:s}]}buildHotspots(e){const t=e.hotspots.reduce((e,t)=>e+t.inclusiveTime,0)||1,n=new Set,s=new Set;for(const[t,i]of e.callGraph)if(0===i.callers.size)n.add(t);else {let r=false;for(const n of i.callers.keys())if(e.callGraph.has(n)){r=true,s.add(t);break}r||n.add(t);}const i=(n,s,r)=>{if(r.has(n))return null;r.add(n);const o=e.hotspots.find(e=>e.name===n),a=e.callGraph.get(n);if(!o&&!a)return null;const c=o?.inclusiveTime||a?.totalTime||0,h=o?.exclusiveTime||c,l=o?.callCount||a?.callCount||1,d=[];if(a&&s<5){for(const[e]of a.callees){const t=i(e,s+1,r);t&&d.push(t);}d.sort((e,t)=>t.inclusiveTime-e.inclusiveTime);}return {name:n,category:o?.category||a?.category||gt.Custom,inclusiveTime:c,inclusiveTimePercent:c/t*100,exclusiveTime:h,exclusiveTimePercent:h/t*100,callCount:l,avgCallTime:l>0?c/l:0,depth:s,children:d.length>0?d:void 0}},r=[],o=new Set;for(const e of n){const t=i(e,0,o);t&&r.push(t);}return r.sort((e,t)=>t.inclusiveTime-e.inclusiveTime),r.slice(0,50)}buildHotspotsFromLegacy(e,t,n){const s=[];for(const[i,r]of e.entries()){const e=t.get(i),o=e?.executionTime||r?.averageTime||0;s.push({name:i,category:gt.ECS,inclusiveTime:o,inclusiveTimePercent:n>0?o/n*100:0,exclusiveTime:o,exclusiveTimePercent:n>0?o/n*100:0,callCount:r?.executionCount||1,avgCallTime:r?.averageTime||o,depth:0});}return s.sort((e,t)=>t.inclusiveTime-e.inclusiveTime).slice(0,50)}buildCallGraph(e){if(!this.selectedFunction)return {currentFunction:null,callers:[],callees:[]};const t=e.callGraph.get(this.selectedFunction);if(!t)return {currentFunction:this.selectedFunction,callers:[],callees:[]};let n=0;for(const e of t.callers.values())n+=e.count;const s=Array.from(t.callers.entries()).map(([e,t])=>({name:e,callCount:t.count,totalTime:t.totalTime,percentOfCurrent:n>0?t.count/n*100:0})).sort((e,t)=>t.callCount-e.callCount),i=Array.from(t.callees.entries()).map(([e,n])=>({name:e,callCount:n.count,totalTime:n.totalTime,percentOfCurrent:t.totalTime>0?n.totalTime/t.totalTime*100:0})).sort((e,t)=>t.totalTime-e.totalTime);return {currentFunction:this.selectedFunction,callers:s,callees:i}}buildMemoryTrend(e){return e.map(e=>({time:e.timestamp,usedMB:e.usedHeapSize/1048576,totalMB:e.totalHeapSize/1048576,gcCount:e.gcCount}))}buildSummary(e,t){return {totalFrames:e.totalFrames,averageFrameTime:e.averageFrameTime,minFrameTime:e.minFrameTime,maxFrameTime:e.maxFrameTime,p95FrameTime:e.p95FrameTime,p99FrameTime:e.p99FrameTime,currentMemoryMB:t.usedHeapSize/1048576,peakMemoryMB:this.peakMemory/1048576,gcCount:t.gcCount,longTaskCount:e.longTasks.length}}getCurrentMemory(){const e=performance,t=e.memory?.usedJSHeapSize||0,n=e.memory?.totalJSHeapSize||0,s=e.memory?.jsHeapSizeLimit||0;return {timestamp:performance.now(),usedHeapSize:t,totalHeapSize:n,heapSizeLimit:s,utilizationPercent:s>0?t/s*100:0,gcCount:0}}getDefaultMemory(){return {timestamp:performance.now(),usedHeapSize:0,totalHeapSize:0,heapSizeLimit:0,utilizationPercent:0,gcCount:0}}createEmptyData(){return {currentFrame:{frameNumber:0,frameTime:0,fps:0,memory:this.getDefaultMemory()},frameTimeHistory:[],categoryStats:[],hotspots:[],callGraph:{currentFunction:null,callers:[],callees:[]},longTasks:[],memoryTrend:[],summary:{totalFrames:0,averageFrameTime:0,minFrameTime:0,maxFrameTime:0,p95FrameTime:0,p99FrameTime:0,currentMemoryMB:0,peakMemoryMB:0,gcCount:0,longTaskCount:0}}}}function Ot(){return "undefined"!=typeof crypto&&"function"==typeof crypto.randomUUID?crypto.randomUUID():function(){if("undefined"!=typeof crypto&&"function"==typeof crypto.getRandomValues){const e=new Uint8Array(16);return crypto.getRandomValues(e),e[6]=15&e[6]|64,e[8]=63&e[8]|128,function(e){const t=Array.from(e,e=>e.toString(16).padStart(2,"0")).join("");return `${t.slice(0,8)}-${t.slice(8,12)}-${t.slice(12,16)}-${t.slice(16,20)}-${t.slice(20)}`}(e)}return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,e=>{const t=16*Math.random()|0;return ("x"===e?t:3&t|8).toString(16)})}()}const Ft=268435455,Bt=1048575,$t=1<<28,Lt=1<<20;function Ht(e,t){return (t&Bt)*$t+(e&Ft)}function Ut(e){return e&Ft}function Gt(e){return Math.floor(e/$t)&Bt}function qt(e){return 0!==e}var Qt,Yt;!function(e){e.ENTITY_CREATED="entity:created",e.ENTITY_DESTROYED="entity:destroyed",e.ENTITY_ENABLED="entity:enabled",e.ENTITY_DISABLED="entity:disabled",e.ENTITY_TAG_ADDED="entity:tag:added",e.ENTITY_TAG_REMOVED="entity:tag:removed",e.ENTITY_NAME_CHANGED="entity:name:changed",e.COMPONENT_ADDED="component:added",e.COMPONENT_REMOVED="component:removed",e.COMPONENT_MODIFIED="component:modified",e.COMPONENT_ENABLED="component:enabled",e.COMPONENT_DISABLED="component:disabled",e.SYSTEM_ADDED="system:added",e.SYSTEM_REMOVED="system:removed",e.SYSTEM_ENABLED="system:enabled",e.SYSTEM_DISABLED="system:disabled",e.SYSTEM_PROCESSING_START="system:processing:start",e.SYSTEM_PROCESSING_END="system:processing:end",e.SYSTEM_ERROR="system:error",e.SCENE_CREATED="scene:created",e.SCENE_DESTROYED="scene:destroyed",e.SCENE_ACTIVATED="scene:activated",e.SCENE_DEACTIVATED="scene:deactivated",e.SCENE_PAUSED="scene:paused",e.SCENE_RESUMED="scene:resumed",e.QUERY_EXECUTED="query:executed",e.QUERY_CACHE_HIT="query:cache:hit",e.QUERY_CACHE_MISS="query:cache:miss",e.QUERY_OPTIMIZED="query:optimized",e.PERFORMANCE_WARNING="performance:warning",e.PERFORMANCE_CRITICAL="performance:critical",e.MEMORY_USAGE_HIGH="memory:usage:high",e.FRAME_RATE_DROP="frame:rate:drop",e.INDEX_CREATED="index:created",e.INDEX_UPDATED="index:updated",e.INDEX_OPTIMIZED="index:optimized",e.ARCHETYPE_CREATED="archetype:created",e.ARCHETYPE_ENTITY_ADDED="archetype:entity:added",e.ARCHETYPE_ENTITY_REMOVED="archetype:entity:removed",e.DIRTY_MARK_ADDED="dirty:mark:added",e.DIRTY_BATCH_PROCESSED="dirty:batch:processed",e.ERROR_OCCURRED="error:occurred",e.WARNING_ISSUED="warning:issued",e.FRAMEWORK_INITIALIZED="framework:initialized",e.FRAMEWORK_SHUTDOWN="framework:shutdown",e.DEBUG_INFO="debug:info",e.DEBUG_STATS_UPDATED="debug:stats:updated";}(Qt||(Qt={})),function(e){e[e.LOWEST=0]="LOWEST",e[e.LOW=25]="LOW",e[e.NORMAL=50]="NORMAL",e[e.HIGH=75]="HIGH",e[e.HIGHEST=100]="HIGHEST",e[e.CRITICAL=200]="CRITICAL";}(Yt||(Yt={}));const Jt={ENTITY:{CREATED:Qt.ENTITY_CREATED,DESTROYED:Qt.ENTITY_DESTROYED,ENABLED:Qt.ENTITY_ENABLED,DISABLED:Qt.ENTITY_DISABLED,TAG_ADDED:Qt.ENTITY_TAG_ADDED,TAG_REMOVED:Qt.ENTITY_TAG_REMOVED,NAME_CHANGED:Qt.ENTITY_NAME_CHANGED},COMPONENT:{ADDED:Qt.COMPONENT_ADDED,REMOVED:Qt.COMPONENT_REMOVED,MODIFIED:Qt.COMPONENT_MODIFIED,ENABLED:Qt.COMPONENT_ENABLED,DISABLED:Qt.COMPONENT_DISABLED},SYSTEM:{ADDED:Qt.SYSTEM_ADDED,REMOVED:Qt.SYSTEM_REMOVED,ENABLED:Qt.SYSTEM_ENABLED,DISABLED:Qt.SYSTEM_DISABLED,PROCESSING_START:Qt.SYSTEM_PROCESSING_START,PROCESSING_END:Qt.SYSTEM_PROCESSING_END,ERROR:Qt.SYSTEM_ERROR},PERFORMANCE:{WARNING:Qt.PERFORMANCE_WARNING,CRITICAL:Qt.PERFORMANCE_CRITICAL,MEMORY_HIGH:Qt.MEMORY_USAGE_HIGH,FRAME_DROP:Qt.FRAME_RATE_DROP}};new Set([...Object.values(Qt),...Object.values(Jt.ENTITY),...Object.values(Jt.COMPONENT),...Object.values(Jt.SYSTEM),...Object.values(Jt.PERFORMANCE)]);class Xt{constructor(e,t,n){this._handle=0,this.scene=null,this._isDestroyed=false,this._active=true,this._tag=0,this._enabled=true,this._updateOrder=0,this._componentMask=R.clone(R.ZERO),this._componentCache=null,this._lifecyclePolicy=0,this.name=e,this.id=t,this.persistentId=n??Ot();}get lifecyclePolicy(){return this._lifecyclePolicy}get isPersistent(){return 1===this._lifecyclePolicy}get handle(){return this._handle}setHandle(e){this._handle=e;}setPersistent(){return this._lifecyclePolicy=1,this}setSceneLocal(){return this._lifecyclePolicy=0,this}get isDestroyed(){return this._isDestroyed}setDestroyedState(e){this._isDestroyed=e;}get components(){return null===this._componentCache&&this._rebuildComponentCache(),this._componentCache}_rebuildComponentCache(){const e=[];if(!this.scene?.componentStorageManager)return void(this._componentCache=e);const t=this._componentMask,n=this.scene.componentRegistry,s=n.getRegisteredCount();for(let i=0;i<s;i++)if(R.getBit(t,i)){const t=n.getTypeByBitIndex(i);if(t){const n=this.scene.componentStorageManager.getComponent(this.id,t);n&&e.push(n);}}this._componentCache=e;}get active(){return this._active}set active(e){this._active!==e&&(this._active=e,this.onActiveChanged());}get tag(){return this._tag}set tag(e){this._tag=e;}get enabled(){return this._enabled}set enabled(e){this._enabled=e;}get updateOrder(){return this._updateOrder}set updateOrder(e){this._updateOrder=e;}get componentMask(){return this._componentMask}createComponent(e,...t){const n=new e(...t);return this.addComponent(n)}addComponentInternal(e){const t=e.constructor,n=(this.scene?.componentRegistry??j).getBitMask(t);return R.orInPlace(this._componentMask,n),this._componentCache=null,e}notifyQuerySystems(e){this.scene?.querySystem&&(this.scene.querySystem.updateEntity(this),this.scene.clearSystemEntityCaches(),this.scene.notifyEntityComponentChanged?.(this,e));}addComponent(e){const t=e.constructor;if(!this.scene)throw new Error("Entity must be added to Scene before adding components. Use scene.createEntity() instead of new Entity()");if(!this.scene.componentStorageManager)throw new Error("Scene does not have componentStorageManager");if(this.hasComponent(t))throw new Error(`Entity ${this.name} already has component ${w(t)}`);return this.addComponentInternal(e),this.scene.componentStorageManager.addComponent(this.id,e),e.entityId=this.id,this.scene.referenceTracker?.registerEntityScene(this.id,this.scene),this.scene.isEditorMode?this.scene.queueDeferredComponentCallback(()=>e.onAddedToEntity()):e.onAddedToEntity(),this.scene.eventSystem&&this.scene.eventSystem.emitSync(Qt.COMPONENT_ADDED,{timestamp:Date.now(),source:"Entity",entity:this,entityId:this.id,entityName:this.name,entityTag:this.tag?.toString(),componentType:w(t),component:e}),this.notifyQuerySystems(t),e}getComponent(e){if(!this.hasComponent(e))return null;if(!this.scene?.componentStorageManager)return null;return this.scene.componentStorageManager.getComponent(this.id,e)}hasComponent(e){const t=this.scene?.componentRegistry??j;if(!t.isRegistered(e))return  false;const n=t.getBitMask(e);return R.hasAny(this._componentMask,n)}getOrCreateComponent(e,...t){let n=this.getComponent(e);return n||(n=this.createComponent(e,...t)),n}markDirty(...e){if(!this.scene)return;const t=this.scene.epochManager.current;for(const n of e)n.markDirty(t);}removeComponent(e){const t=e.constructor,n=this.scene?.componentRegistry??j;if(!n.isRegistered(t))return;const s=n.getBitIndex(t);R.clearBit(this._componentMask,s),this._componentCache=null,this.scene?.componentStorageManager?.removeComponent(this.id,t),this.scene?.referenceTracker?.clearComponentReferences(e),e.onRemovedFromEntity?.(),e.entityId=null,this.scene?.eventSystem&&this.scene.eventSystem.emitSync(Qt.COMPONENT_REMOVED,{timestamp:Date.now(),source:"Entity",entityId:this.id,entityName:this.name,entityTag:this.tag?.toString(),componentType:w(t),component:e}),this.notifyQuerySystems(t);}removeComponentByType(e){const t=this.getComponent(e);return t?(this.removeComponent(t),t):null}removeAllComponents(){const e=[...this.components];R.clear(this._componentMask),this._componentCache=null;for(const t of e){const e=t.constructor;this.scene?.componentStorageManager?.removeComponent(this.id,e),t.onRemovedFromEntity();}this.notifyQuerySystems();}addComponents(e){const t=[];for(const n of e)try{t.push(this.addComponent(n));}catch(e){Xt._logger.warn(`添加组件失败 ${I(n)}:`,e);}return t}removeComponentsByTypes(e){const t=[];for(const n of e)t.push(this.removeComponentByType(n));return t}getComponents(e){const t=[];for(const n of this.components)n instanceof e&&t.push(n);return t}getComponentByType(e){for(const t of this.components)if(t instanceof e)return t;return null}onActiveChanged(){if(this.scene?.eventSystem){const e=this._active?Qt.ENTITY_ENABLED:Qt.ENTITY_DISABLED;this.scene.eventSystem.emitSync(e,{entity:this,scene:this.scene});}}destroy(){this._isDestroyed||(this._isDestroyed=true,this.scene?.eventSystem&&this.scene.eventSystem.emitSync(Qt.ENTITY_DESTROYED,{entity:this,entityId:this.id,scene:this.scene}),this.scene&&this.scene.referenceTracker&&(this.scene.referenceTracker.clearReferencesTo(this.id),this.scene.referenceTracker.unregisterEntityScene(this.id)),this.removeAllComponents(),this.scene&&(this.scene.querySystem&&this.scene.querySystem.removeEntity(this),this.scene.entities&&this.scene.entities.remove(this)));}compareTo(e){return n=e,(t=this).updateOrder-n.updateOrder||t.id-n.id;var t,n;}toString(){return `Entity[${this.name}:${this.id}:${this.persistentId.slice(0,8)}]`}getDebugInfo(){return {name:this.name,id:this.id,persistentId:this.persistentId,enabled:this._enabled,active:this._active,destroyed:this._isDestroyed,componentCount:this.components.length,componentTypes:this.components.map(e=>I(e)),componentMask:R.toString(this._componentMask,2),cacheBuilt:null!==this._componentCache}}}Xt._logger=$("Entity");class Kt{get count(){return this.buffer.length}constructor(e){this.buffer=[],this._idToEntity=new Map,this._nameToEntities=new Map,this._entitiesToAdd=[],this._entitiesToRemove=[],this._scene=e;}add(e){this.addImmediate(e);}addImmediate(e){this._idToEntity.has(e.id)||(this.buffer.push(e),this._idToEntity.set(e.id,e),this.updateNameIndex(e,true));}remove(e){this.removeImmediate(e);}removeImmediate(e){const t=this.buffer.indexOf(e);-1!==t&&(this.buffer.splice(t,1),this._idToEntity.delete(e.id),this.updateNameIndex(e,false),this._scene&&this._scene.identifierPool&&this._scene.identifierPool.checkIn(e.id));}removeAllEntities(){const e=[];for(let t=this.buffer.length-1;t>=0;t--)e.push(this.buffer[t].id),this.buffer[t].destroy();for(const t of this._entitiesToAdd)e.push(t.id),t.destroy();if(this._scene&&this._scene.identifierPool)for(const t of e)this._scene.identifierPool.checkIn(t);this.buffer.length=0,this._idToEntity.clear(),this._nameToEntities.clear(),this._entitiesToAdd.length=0,this._entitiesToRemove.length=0;}updateLists(){if(this._entitiesToAdd.length>0){for(const e of this._entitiesToAdd)this.addImmediate(e);this._entitiesToAdd.length=0;}if(this._entitiesToRemove.length>0){for(const e of this._entitiesToRemove)this.removeImmediate(e);this._entitiesToRemove.length=0;}}update(){this.updateLists();}findEntity(e){const t=this._nameToEntities.get(e);return t&&t.length>0?t[0]:null}findEntitiesByName(e){return this._nameToEntities.get(e)||[]}findEntityById(e){return this._idToEntity.get(e)||null}findEntitiesByTag(e){const t=[];for(const n of this.buffer)n.tag===e&&t.push(n);return t}findEntitiesWithComponent(e){const t=[];for(const n of this.buffer)n.hasComponent(e)&&t.push(n);return t}forEach(e){for(const t of this.buffer)e(t);}forEachWhere(e,t){for(const n of this.buffer)e(n)&&t(n);}updateNameIndex(e,t){if(e.name)if(t){let t=this._nameToEntities.get(e.name);t||(t=[],this._nameToEntities.set(e.name,t)),t.push(e);}else {const t=this._nameToEntities.get(e.name);if(t){const n=t.indexOf(e);-1!==n&&(t.splice(n,1),0===t.length&&this._nameToEntities.delete(e.name));}}}reorderEntity(e,t){const n=this._idToEntity.get(e);if(!n)return;const s=this.buffer.indexOf(n);if(-1===s||s===t)return;const i=Math.max(0,Math.min(t,this.buffer.length-1));this.buffer.splice(s,1),this.buffer.splice(i,0,n);}getStats(){let e=0;for(const t of this.buffer)t.enabled&&!t.isDestroyed&&e++;return {totalEntities:this.buffer.length,activeEntities:e,pendingAdd:this._entitiesToAdd.length,pendingRemove:this._entitiesToRemove.length,nameIndexSize:this._nameToEntities.size}}}class en{constructor(e=100,t=1024){this._nextAvailableIndex=0,this._freeIndices=[],this._generations=new Map,this._pendingRecycle=[],this._recycleDelay=100,this._stats={totalAllocated:0,totalRecycled:0,currentActive:0,memoryExpansions:0},this._recycleDelay=e,this._expansionBlockSize=t,this._preAllocateGenerations(0,this._expansionBlockSize);}checkOut(){let e;if(this._processDelayedRecycle(),this._freeIndices.length>0)e=this._freeIndices.pop();else {if(this._nextAvailableIndex>en.MAX_INDEX)throw new Error(`实体索引已达到框架设计限制 (${en.MAX_INDEX})。这意味着您已经分配了超过65535个不同的实体索引。这是16位索引设计的限制，考虑优化实体回收策略或升级到64位ID设计。`);e=this._nextAvailableIndex++,this._ensureGenerationCapacity(e);}const t=this._generations.get(e)||1;return this._stats.totalAllocated++,this._stats.currentActive++,this._packId(e,t)}checkIn(e){const t=this._unpackIndex(e),n=this._unpackGeneration(e);if(!this._isValidId(t,n))return  false;return !this._pendingRecycle.some(e=>e.index===t&&e.generation===n)&&(this._pendingRecycle.push({index:t,generation:n,timestamp:Date.now()}),this._stats.currentActive--,this._stats.totalRecycled++,true)}isValid(e){const t=this._unpackIndex(e),n=this._unpackGeneration(e);return this._isValidId(t,n)}getStats(){let e=0,t=0;for(const[n,s]of this._generations)n<this._nextAvailableIndex&&(e+=s,t++);const n=t>0?e/t:1;return {totalAllocated:this._stats.totalAllocated,totalRecycled:this._stats.totalRecycled,currentActive:this._stats.currentActive,currentlyFree:this._freeIndices.length,pendingRecycle:this._pendingRecycle.length,maxPossibleEntities:en.MAX_INDEX+1,maxUsedIndex:this._nextAvailableIndex-1,memoryUsage:this._calculateMemoryUsage(),memoryExpansions:this._stats.memoryExpansions,averageGeneration:Math.round(100*n)/100,generationStorageSize:this._generations.size}}forceProcessDelayedRecycle(){this._processDelayedRecycle(true);}_processDelayedRecycle(e=false){if(0===this._pendingRecycle.length)return;const t=Date.now(),n=[],s=[];for(const i of this._pendingRecycle)e||t-i.timestamp>=this._recycleDelay?n.push(i):s.push(i);for(const e of n)if(this._isValidId(e.index,e.generation)){let t=e.generation+1;t>en.MAX_GENERATION&&(t=1),this._generations.set(e.index,t),this._freeIndices.push(e.index);}this._pendingRecycle=s;}_preAllocateGenerations(e,t){for(let n=0;n<t;n++){const t=e+n;t<=en.MAX_INDEX&&this._generations.set(t,1);}this._stats.memoryExpansions++;}_ensureGenerationCapacity(e){if(!this._generations.has(e)){const t=Math.floor(e/this._expansionBlockSize)*this._expansionBlockSize;this._preAllocateGenerations(t,this._expansionBlockSize);}}_calculateMemoryUsage(){return 16*this._generations.size+8*this._freeIndices.length+32*this._pendingRecycle.length}_packId(e,t){return t<<16|e}_unpackIndex(e){return 65535&e}_unpackGeneration(e){return e>>>16&65535}_isValidId(e,t){if(e<0||e>=this._nextAvailableIndex)return  false;const n=this._generations.get(e);return void 0!==n&&n===t}}en.MAX_INDEX=65535,en.MAX_GENERATION=65535;$("EntityProcessorList");class rn extends Set{constructor(...e){super();}reset(){this.clear();}}S.getPool(rn,50,512);class an{constructor(){this.buckets=new Map,this._size=0;}get size(){return this._size}get innerBuckets(){return this.buckets}murmur32(e,t){let n=t>>>0;const s=e=>{e=(e=Math.imul(e,3432918353)>>>0)<<15|e>>>17,e=Math.imul(e,461845907)>>>0,n^=e,n=n<<13|n>>>19,n=Math.imul(n,5)+3864292196>>>0;};if(s(e.base[0]>>>0),s(e.base[1]>>>0),e.segments)for(const t of e.segments)s(t[0]>>>0),s(t[1]>>>0);return n^=e.segments?8*e.segments.length:8,n^=n>>>16,n=Math.imul(n,2246822507)>>>0,n^=n>>>13,n=Math.imul(n,3266489909)>>>0,n^=n>>>16,n>>>0}getHashes(e){return [this.murmur32(e,2538058380),this.murmur32(e,305419896)]}set(e,t){const[n,s]=this.getHashes(e);let i=this.buckets.get(n);i||(i=[],this.buckets.set(n,i));for(let e=0;e<i.length;e++)if(i[e][0]===s)return i[e][1]=t,this;return i.push([s,t]),this._size++,this}get(e){const[t,n]=this.getHashes(e),s=this.buckets.get(t);if(s)for(let e=0;e<s.length;e++)if(s[e][0]===n)return s[e][1]}has(e){return void 0!==this.get(e)}delete(e){const[t,n]=this.getHashes(e),s=this.buckets.get(t);if(!s)return  false;for(let e=0;e<s.length;e++)if(s[e][0]===n)return s.splice(e,1),this._size--,0===s.length&&this.buckets.delete(t),true;return  false}clear(){this.buckets.clear(),this._size=0;}*entries(){for(const[e,t]of this.buckets)for(const[e,n]of t)yield [void 0,n];}*values(){for(const e of this.buckets.values())for(const[t,n]of e)yield n;}}class cn{constructor(){this._archetypes=new an,this._entityToArchetype=new Map,this._componentToArchetypes=new Map,this._entityComponentTypesCache=new Map,this._allArchetypes=[];}addEntity(e){const t=this.getEntityComponentTypes(e),n=this.generateArchetypeId(t);let s=this._archetypes.get(n);s||(s=this.createArchetype(t)),s.entities.add(e),this._entityToArchetype.set(e,s);}removeEntity(e){const t=this._entityToArchetype.get(e);t&&(t.entities.delete(e),this._entityComponentTypesCache.delete(e),this._entityToArchetype.delete(e));}updateEntity(e){const t=this._entityToArchetype.get(e);this._entityComponentTypesCache.delete(e);const n=this.getEntityComponentTypes(e),s=this.generateArchetypeId(n);if(t&&t.id===s)return;t&&t.entities.delete(e);let i=this._archetypes.get(s);i||(i=this.createArchetype(n)),i.entities.add(e),this._entityToArchetype.set(e,i);}queryArchetypes(e,t="AND"){const n=[];let s=0;if("AND"===t){if(0===e.length){for(const e of this._allArchetypes)n.push(e),s+=e.entities.size;return {archetypes:n,totalEntities:s}}if(1===e.length){const t=this._componentToArchetypes.get(e[0]);if(t)for(const e of t)n.push(e),s+=e.entities.size;return {archetypes:n,totalEntities:s}}let t,i=1/0;for(const n of e){const e=this._componentToArchetypes.get(n);if(!e||0===e.size)return {archetypes:[],totalEntities:0};e.size<i&&(i=e.size,t=e);}const r=this.generateArchetypeId(e);if(t)for(const e of t)R.hasAll(e.id,r)&&(n.push(e),s+=e.entities.size);}else {const t=new Set;for(const n of e){const e=this._componentToArchetypes.get(n);if(e)for(const n of e)t.add(n);}for(const e of t)n.push(e),s+=e.entities.size;}return {archetypes:n,totalEntities:s}}getEntityArchetype(e){return this._entityToArchetype.get(e)}getAllArchetypes(){return this._allArchetypes.slice()}getEntitiesByComponent(e){const t=this._componentToArchetypes.get(e);if(!t||0===t.size)return [];const n=[];for(const e of t)for(const t of e.entities)n.push(t);return n}clear(){this._archetypes.clear(),this._entityToArchetype.clear(),this._componentToArchetypes.clear(),this._entityComponentTypesCache.clear(),this._allArchetypes=[];}updateAllArchetypeArrays(){this._allArchetypes=[];for(const e of this._archetypes.values())this._allArchetypes.push(e);}getEntityComponentTypes(e){let t=this._entityComponentTypesCache.get(e);return t||(t=e.components.map(e=>e.constructor),this._entityComponentTypesCache.set(e,t)),t}generateArchetypeId(e){const t=R.clone(R.ZERO);for(const n of e){const e=j.getBitMask(n);R.orInPlace(t,e);}return t}createArchetype(e){const t=this.generateArchetypeId(e),n={id:t,componentTypes:[...e],entities:new Set};this._archetypes.set(t,n),this.updateAllArchetypeArrays();for(const t of e){let e=this._componentToArchetypes.get(t);e||(e=new Set,this._componentToArchetypes.set(t,e)),e.add(n);}return n}}var hn;!function(e){e.ALL="all",e.ANY="any",e.NONE="none";}(hn||(hn={}));const ln=$("ReactiveQuery");var dn;!function(e){e.ADDED="added",e.REMOVED="removed",e.BATCH_UPDATE="batch_update";}(dn||(dn={}));class un{constructor(e,t={}){this._entities=[],this._entityIdSet=new Set,this._snapshot=null,this._listeners=[],this._active=true,this._condition=e,this._config={enableBatchMode:t.enableBatchMode??true,batchDelay:t.batchDelay??16,debug:t.debug??false},this._id=this.generateQueryId(),this._batchChanges={added:[],removed:[],timer:null},this._config.debug&&ln.debug(`创建ReactiveQuery: ${this._id}`);}generateQueryId(){return `${this._condition.type}:${this._condition.componentTypes.map(e=>e.name).sort().join(",")}`}subscribe(e){if(!this._active)throw new Error(`Cannot subscribe to disposed ReactiveQuery ${this._id}`);if("function"!=typeof e)throw new TypeError("Listener must be a function");return this._listeners.push(e),this._config.debug&&ln.debug(`订阅ReactiveQuery: ${this._id}, 监听器数量: ${this._listeners.length}`),()=>{const t=this._listeners.indexOf(e);-1!==t&&this._listeners.splice(t,1);}}unsubscribeAll(){this._listeners.length=0;}getEntities(){return null!==this._snapshot||(this._snapshot=[...this._entities]),this._snapshot}get count(){return this._entities.length}matches(e){const t=e.componentMask;switch(this._condition.type){case hn.ALL:return R.hasAll(t,this._condition.mask);case hn.ANY:return R.hasAny(t,this._condition.mask);case hn.NONE:return R.hasNone(t,this._condition.mask);default:return  false}}notifyEntityAdded(e){this._active&&this.matches(e)&&(this._entityIdSet.has(e.id)||(this._entities.push(e),this._entityIdSet.add(e.id),this._snapshot=null,this._config.enableBatchMode?this.addToBatch("added",e):this.notifyListeners({type:dn.ADDED,entity:e}),this._config.debug&&ln.debug(`ReactiveQuery ${this._id}: 实体添加 ${e.name}(${e.id})`)));}notifyEntityRemoved(e){if(!this._active)return;if(!this._entityIdSet.has(e.id))return;const t=this._entities.indexOf(e);-1!==t&&this._entities.splice(t,1),this._entityIdSet.delete(e.id),this._snapshot=null,this._config.enableBatchMode?this.addToBatch("removed",e):this.notifyListeners({type:dn.REMOVED,entity:e}),this._config.debug&&ln.debug(`ReactiveQuery ${this._id}: 实体移除 ${e.name}(${e.id})`);}notifyEntityChanged(e){if(!this._active)return;const t=this._entityIdSet.has(e.id),n=this.matches(e);t&&!n?this.notifyEntityRemoved(e):!t&&n&&this.notifyEntityAdded(e);}initializeWith(e){this._entities.length=0,this._entityIdSet.clear(),this._snapshot=null;for(const t of e)this.matches(t)&&(this._entities.push(t),this._entityIdSet.add(t.id));this._config.debug&&ln.debug(`ReactiveQuery ${this._id}: 初始化 ${this._entities.length} 个实体`);}addToBatch(e,t){"added"===e?this._batchChanges.added.push(t):this._batchChanges.removed.push(t),null===this._batchChanges.timer&&(this._batchChanges.timer=setTimeout(()=>{this.flushBatchChanges();},this._config.batchDelay));}flushBatchChanges(){if(0===this._batchChanges.added.length&&0===this._batchChanges.removed.length)return void(this._batchChanges.timer=null);const e=[...this._batchChanges.added],t=[...this._batchChanges.removed];this._batchChanges.added.length=0,this._batchChanges.removed.length=0,this._batchChanges.timer=null,this.notifyListeners({type:dn.BATCH_UPDATE,added:e,removed:t,entities:this._entities}),this._config.debug&&ln.debug(`ReactiveQuery ${this._id}: 批量更新 +${e.length} -${t.length}`);}notifyListeners(e){const t=[...this._listeners];for(const n of t)try{n(e);}catch(e){ln.error(`ReactiveQuery ${this._id}: 监听器执行出错`,e);}}pause(){this._active=false,null!==this._batchChanges.timer&&(clearTimeout(this._batchChanges.timer),this._batchChanges.timer=null),this._batchChanges.added.length=0,this._batchChanges.removed.length=0;}resume(){this._active=true;}dispose(){null!==this._batchChanges.timer&&(clearTimeout(this._batchChanges.timer),this._batchChanges.timer=null),this._batchChanges.added.length=0,this._batchChanges.removed.length=0,this._active=false,this.unsubscribeAll(),this._entities.length=0,this._entityIdSet.clear(),this._snapshot=null,this._config.debug&&ln.debug(`ReactiveQuery ${this._id}: 已销毁`);}get condition(){return this._condition}get id(){return this._id}get active(){return this._active}get listenerCount(){return this._listeners.length}}class mn{constructor(e,...t){this._lastVersion=-1,this._cachedEntities=[],this._querySystem=e,this._componentTypes=t;}get componentTypes(){return this._componentTypes}get entities(){return this._refreshCache(),this._cachedEntities}get count(){return this.entities.length}_refreshCache(){const e=this._querySystem.version;if(this._lastVersion!==e){const t=this._querySystem.queryAll(...this._componentTypes);this._cachedEntities=t.entities,this._lastVersion=e;}}forEach(e){const t=this.entities,n=this._componentTypes,s=n.length;for(let i=0,r=t.length;i<r;i++){const r=t[i],o=new Array(s);for(let e=0;e<s;e++){const t=r.getComponent(n[e]);t&&(o[e]=t);}e(r,...o);}}forEachChanged(e,t){const n=this.entities,s=this._componentTypes,i=s.length;for(let r=0,o=n.length;r<o;r++){const o=n[r],a=new Array(i);let c=false;for(let t=0;t<i;t++){const n=o.getComponent(s[t]);n&&(a[t]=n,n.lastWriteEpoch>e&&(c=true));}c&&t(o,...a);}}first(){const e=this.entities;if(0===e.length)return null;const t=e[0],n=[];for(const e of this._componentTypes){const s=t.getComponent(e);if(!s)return null;n.push(s);}return [t,...n]}toArray(){const e=[];return this.forEach((t,...n)=>{e.push([t,...n]);}),e}map(e){const t=[];return this.forEach((n,...s)=>{t.push(e(n,...s));}),t}filter(e){const t=[];return this.forEach((n,...s)=>{e(n,...s)&&t.push(n);}),t}find(e){const t=this.entities,n=this._componentTypes,s=n.length;for(let i=0,r=t.length;i<r;i++){const r=t[i],o=new Array(s);for(let e=0;e<s;e++){const t=r.getComponent(n[e]);t&&(o[e]=t);}if(e(r,...o))return r}}any(){return this.count>0}empty(){return 0===this.count}}class pn{constructor(){this._logger=$("QuerySystem"),this._entities=[],this._version=0,this._queryCache=new Map,this._cacheMaxSize=1e3,this._cacheTimeout=5e3,this._componentMaskCache=new Map,this._queryStats={totalQueries:0,cacheHits:0,indexHits:0,linearScans:0,archetypeHits:0,dirtyChecks:0},this._reactiveQueries=new Map,this._reactiveQueriesByComponent=new Map,this._entityIndex={byTag:new Map,byName:new Map},this._archetypeSystem=new cn;}setEntities(e){this._entities=e,this.clearQueryCache(),this.clearReactiveQueries(),this.rebuildIndexes();}addEntity(e,t=false){this._entities.includes(e)||(this._entities.push(e),this.addEntityToIndexes(e),this._archetypeSystem.addEntity(e),this.notifyReactiveQueriesEntityAdded(e),t||this.clearQueryCache(),this._version++);}addEntities(e){if(0===e.length)return;const t=new Set(this._entities.map(e=>e.id));let n=0;for(const s of e)t.has(s.id)||(this._entities.push(s),this.addEntityToIndexes(s),this._archetypeSystem.addEntity(s),t.add(s.id),n++);n>0&&this.clearQueryCache();}addEntitiesUnchecked(e){if(0!==e.length){for(const t of e)this._entities.push(t);for(const t of e)this.addEntityToIndexes(t),this._archetypeSystem.addEntity(t);this.clearQueryCache();}}removeEntity(e){const t=this._entities.indexOf(e);if(-1!==t){const n=[];for(const t of e.components)n.push(t.constructor);this._entities.splice(t,1),this.removeEntityFromIndexes(e),this._archetypeSystem.removeEntity(e),n.length>0?this.notifyReactiveQueriesEntityRemoved(e,n):this.notifyReactiveQueriesEntityRemovedFallback(e),this.clearQueryCache(),this._version++;}}updateEntity(e){this._entities.includes(e)?(this.removeEntityFromIndexes(e),this._archetypeSystem.updateEntity(e),this.addEntityToIndexes(e),this.notifyReactiveQueriesEntityChanged(e),this.clearQueryCache(),this._version++):this.addEntity(e);}addEntityToIndexes(e){const t=e.tag;if(void 0!==t){(this._entityIndex.byTag.get(t)||this.createAndSetTagIndex(t)).add(e);}const n=e.name;if(n){(this._entityIndex.byName.get(n)||this.createAndSetNameIndex(n)).add(e);}}createAndSetTagIndex(e){const t=new Set;return this._entityIndex.byTag.set(e,t),t}createAndSetNameIndex(e){const t=new Set;return this._entityIndex.byName.set(e,t),t}removeEntityFromIndexes(e){if(void 0!==e.tag){const t=this._entityIndex.byTag.get(e.tag);t&&(t.delete(e),0===t.size&&this._entityIndex.byTag.delete(e.tag));}if(e.name){const t=this._entityIndex.byName.get(e.name);t&&(t.delete(e),0===t.size&&this._entityIndex.byName.delete(e.name));}}rebuildIndexes(){this._entityIndex.byTag.clear(),this._entityIndex.byName.clear(),this._archetypeSystem.clear();for(const e of this._entities)this.addEntityToIndexes(e),this._archetypeSystem.addEntity(e);}queryAll(...e){const t=performance.now();this._queryStats.totalQueries++;const n=this.getOrCreateReactiveQuery(hn.ALL,e).getEntities();return this._queryStats.cacheHits++,{entities:n,count:n.length,executionTime:performance.now()-t,fromCache:true}}queryAny(...e){const t=performance.now();this._queryStats.totalQueries++;const n=this.getOrCreateReactiveQuery(hn.ANY,e).getEntities();return this._queryStats.cacheHits++,{entities:n,count:n.length,executionTime:performance.now()-t,fromCache:true}}queryNone(...e){const t=performance.now();this._queryStats.totalQueries++;const n=this.getOrCreateReactiveQuery(hn.NONE,e).getEntities();return this._queryStats.cacheHits++,{entities:n,count:n.length,executionTime:performance.now()-t,fromCache:true}}queryByTag(e){const t=performance.now();this._queryStats.totalQueries++;const n=`tag:${e}`,s=this.getFromCache(n);if(s)return this._queryStats.cacheHits++,{entities:s,count:s.length,executionTime:performance.now()-t,fromCache:true};this._queryStats.indexHits++;const i=Array.from(this._entityIndex.byTag.get(e)||[]);return this.addToCache(n,i),{entities:i,count:i.length,executionTime:performance.now()-t,fromCache:false}}queryByName(e){const t=performance.now();this._queryStats.totalQueries++;const n=`name:${e}`,s=this.getFromCache(n);if(s)return this._queryStats.cacheHits++,{entities:s,count:s.length,executionTime:performance.now()-t,fromCache:true};this._queryStats.indexHits++;const i=Array.from(this._entityIndex.byName.get(e)||[]);return this.addToCache(n,i),{entities:i,count:i.length,executionTime:performance.now()-t,fromCache:false}}queryChangedSince(e,...t){const n=performance.now();this._queryStats.totalQueries++,this._queryStats.dirtyChecks++;const s=this.queryAll(...t),i=[];for(const n of s.entities){let s=false;for(const i of t){const t=n.getComponent(i);if(t&&t.lastWriteEpoch>e){s=true;break}}s&&i.push(n);}return {entities:i,count:i.length,executionTime:performance.now()-n,fromCache:false}}queryByComponent(e){const t=performance.now();this._queryStats.totalQueries++;const n=this.generateCacheKey("component",[e]),s=this.getFromCache(n);if(s)return this._queryStats.cacheHits++,{entities:s,count:s.length,executionTime:performance.now()-t,fromCache:true};this._queryStats.indexHits++;const i=this._archetypeSystem.getEntitiesByComponent(e);return this.addToCache(n,i),{entities:i,count:i.length,executionTime:performance.now()-t,fromCache:false}}getFromCache(e){const t=this._queryCache.get(e);return t?Date.now()-t.timestamp>this._cacheTimeout||t.version!==this._version?(this._queryCache.delete(e),null):(t.hitCount++,t.entities):null}addToCache(e,t){this._queryCache.size>=this._cacheMaxSize&&this.cleanupCache(),this._queryCache.set(e,{entities:t,timestamp:Date.now(),hitCount:0,version:this._version});}cleanupCache(){const e=Date.now();for(const[t,n]of this._queryCache.entries())e-n.timestamp>this._cacheTimeout&&this._queryCache.delete(t);if(this._queryCache.size>=this._cacheMaxSize){let e=1/0,t="",n=1/0;for(const[s,i]of this._queryCache.entries())(i.hitCount<e||i.hitCount===e&&i.timestamp<n)&&(e=i.hitCount,t=s,n=i.timestamp);t&&this._queryCache.delete(t);}}clearQueryCache(){this._queryCache.clear(),this._componentMaskCache.clear();}clearReactiveQueries(){for(const e of this._reactiveQueries.values())e.dispose();this._reactiveQueries.clear(),this._reactiveQueriesByComponent.clear();}generateCacheKey(e,t){if(1===t.length){return `${e}:${w(t[0])}`}return `${e}:${t.map(e=>w(e)).sort().join(",")}`}clearCache(){this.clearQueryCache(),this.clearReactiveQueries();}compile(...e){return new mn(this,...e)}createReactiveQuery(e,t){if(!e||0===e.length)throw new Error("组件类型列表不能为空");const n=this.createComponentMask(e),s={type:hn.ALL,componentTypes:e,mask:n},i=new un(s,t),r=this.executeTraditionalQuery(hn.ALL,e);i.initializeWith(r);const o=this.generateCacheKey("all",e);this._reactiveQueries.set(o,i);for(const t of e){let e=this._reactiveQueriesByComponent.get(t);e||(e=new Set,this._reactiveQueriesByComponent.set(t,e)),e.add(i);}return i}destroyReactiveQuery(e){if(!e)return;const t=e.id;this._reactiveQueries.delete(t);for(const t of e.condition.componentTypes){const n=this._reactiveQueriesByComponent.get(t);n&&(n.delete(e),0===n.size&&this._reactiveQueriesByComponent.delete(t));}e.dispose();}createComponentMask(e){const t=e.map(e=>w(e)).sort().join(","),n=this._componentMaskCache.get(t);if(n)return n;const s=R.clone(R.ZERO);for(const t of e){const e=j.getBitMask(t);R.orInPlace(s,e);}return this._componentMaskCache.set(t,s),s}get version(){return this._version}getAllEntities(){return this._entities}getStats(){return {entityCount:this._entities.length,indexStats:{componentIndexSize:this._archetypeSystem.getAllArchetypes().length,tagIndexSize:this._entityIndex.byTag.size,nameIndexSize:this._entityIndex.byName.size},queryStats:{...this._queryStats,cacheHitRate:this._queryStats.totalQueries>0?(this._queryStats.cacheHits/this._queryStats.totalQueries*100).toFixed(2)+"%":"0%"},optimizationStats:{archetypeSystem:this._archetypeSystem.getAllArchetypes().map(e=>({id:e.id,componentTypes:e.componentTypes.map(e=>w(e)),entityCount:e.entities.size}))},cacheStats:{size:this._reactiveQueries.size,hitRate:this._queryStats.totalQueries>0?(this._queryStats.cacheHits/this._queryStats.totalQueries*100).toFixed(2)+"%":"0%"}}}getEntityArchetype(e){return this._archetypeSystem.getEntityArchetype(e)}getOrCreateReactiveQuery(e,t){const n=this.generateCacheKey(e,t);let s=this._reactiveQueries.get(n);if(!s){const i=this.createComponentMask(t);s=new un({type:e,componentTypes:t,mask:i},{enableBatchMode:false,debug:false});const r=this.executeTraditionalQuery(e,t);s.initializeWith(r),this._reactiveQueries.set(n,s);for(const e of t){let t=this._reactiveQueriesByComponent.get(e);t||(t=new Set,this._reactiveQueriesByComponent.set(e,t)),t.add(s);}this._logger.debug(`创建内部响应式查询缓存: ${n}`);}return s}executeTraditionalQuery(e,t){switch(e){case hn.ALL:{const e=this._archetypeSystem.queryArchetypes(t,"AND"),n=[];for(const t of e.archetypes)for(const e of t.entities)n.push(e);return n}case hn.ANY:{const e=this._archetypeSystem.queryArchetypes(t,"OR"),n=[];for(const t of e.archetypes)for(const e of t.entities)n.push(e);return n}case hn.NONE:{const e=this.createComponentMask(t);return this._entities.filter(t=>R.hasNone(t.componentMask,e))}default:return []}}notifyReactiveQueriesEntityAdded(e){if(0===this._reactiveQueries.size)return;const t=new Set;for(const n of e.components){const s=n.constructor,i=this._reactiveQueriesByComponent.get(s);if(i)for(const n of i)t.has(n)||(n.notifyEntityAdded(e),t.add(n));}}notifyReactiveQueriesEntityRemoved(e,t){if(0===this._reactiveQueries.size)return;const n=new Set;for(const s of t){const t=this._reactiveQueriesByComponent.get(s);if(t)for(const s of t)n.has(s)||(s.notifyEntityRemoved(e),n.add(s));}}notifyReactiveQueriesEntityRemovedFallback(e){if(0!==this._reactiveQueries.size)for(const t of this._reactiveQueries.values())t.notifyEntityRemoved(e);}notifyReactiveQueriesEntityChanged(e){if(0===this._reactiveQueries.size)return;const t=new Set;for(const n of e.components){const s=n.constructor,i=this._reactiveQueriesByComponent.get(s);if(i)for(const n of i)t.has(n)||(n.notifyEntityChanged(e),t.add(n));}for(const n of this._reactiveQueries.values())t.has(n)||n.notifyEntityChanged(e);}}class fn{constructor(e){this._logger=$("QueryBuilder"),this.conditions=[],this.querySystem=e;}withAll(...e){return this.conditions.push({type:hn.ALL,componentTypes:e,mask:this.createComponentMask(e)}),this}withAny(...e){return this.conditions.push({type:hn.ANY,componentTypes:e,mask:this.createComponentMask(e)}),this}without(...e){return this.conditions.push({type:hn.NONE,componentTypes:e,mask:this.createComponentMask(e)}),this}execute(){const e=performance.now();if(1===this.conditions.length){const e=this.conditions[0];switch(e.type){case hn.ALL:return this.querySystem.queryAll(...e.componentTypes);case hn.ANY:return this.querySystem.queryAny(...e.componentTypes);case hn.NONE:return this.querySystem.queryNone(...e.componentTypes)}}return {entities:[],count:0,executionTime:performance.now()-e,fromCache:false}}createComponentMask(e){const t=R.clone(R.ZERO);for(const n of e)try{const e=j.getBitMask(n);R.orInPlace(t,e);}catch(e){this._logger.warn(`组件类型 ${w(n)} 未注册，跳过`);}return t}reset(){return this.conditions=[],this}}class gn{constructor(){this.listeners=new Map,this.stats=new Map,this.batchQueue=new Map,this.batchTimers=new Map,this.batchConfigs=new Map,this.nextListenerId=0,this.isEnabled=true,this.maxListeners=100;}on(e,t,n={}){return this.addListener(e,t,n)}once(e,t,n={}){return this.addListener(e,t,{...n,once:true})}onAsync(e,t,n={}){return this.addListener(e,t,{...n,async:true})}off(e,t){const n=this.listeners.get(e);if(!n)return  false;const s=n.findIndex(e=>e.id===t);return  -1!==s&&(n.splice(s,1),0===n.length&&(this.listeners.delete(e),this.stats.delete(e)),true)}offAll(e){this.listeners.delete(e),this.stats.delete(e),this.clearBatch(e);}async emit(e,t){if(!this.isEnabled)return;const n=this.batchConfigs.get(e);n?.enabled?this.addToBatch(e,t):await this.executeEvent(e,t);}emitSync(e,t){if(!this.isEnabled)return;const n=this.listeners.get(e);if(!n||0===n.length)return;const s=performance.now(),i=[],r=this.sortListenersByPriority(n);for(const n of r)if(!n.config.async)try{n.config.thisArg?n.handler.call(n.config.thisArg,t):n.handler(t),n.config.once&&i.push(n.id);}catch(t){gn._logger.error(`事件处理器执行错误 ${e}:`,t);}this.removeListeners(e,i),this.updateStats(e,performance.now()-s);}setBatchConfig(e,t){this.batchConfigs.set(e,t);}flushBatch(e){const t=this.batchQueue.get(e);if(!t||0===t.length)return;const n=this.batchTimers.get(e);n&&(clearTimeout(n),this.batchTimers.delete(e)),this.processBatch(e,t),this.batchQueue.delete(e);}getStats(e){return e?this.stats.get(e)||this.createEmptyStats(e):new Map(this.stats)}resetStats(e){e?this.stats.delete(e):this.stats.clear();}setEnabled(e){this.isEnabled=e;}hasListeners(e){const t=this.listeners.get(e);return !!t&&t.length>0}getListenerCount(e){const t=this.listeners.get(e);return t?t.length:0}clear(){this.listeners.clear(),this.stats.clear(),this.clearAllBatches();}setMaxListeners(e){this.maxListeners=e;}addListener(e,t,n){let s=this.listeners.get(e);if(s||(s=[],this.listeners.set(e,s)),s.length>=this.maxListeners)return gn._logger.warn(`事件类型 ${e} 的监听器数量超过最大限制 (${this.maxListeners})`),"";const i="listener_"+this.nextListenerId++,r={handler:t,config:{priority:0,...n},id:i};return s.push(r),this.stats.has(e)||this.stats.set(e,this.createEmptyStats(e)),i}async executeEvent(e,t){const n=this.listeners.get(e);if(!n||0===n.length)return;const s=performance.now(),i=[],r=this.sortListenersByPriority(n),o=r.filter(e=>!e.config.async),a=r.filter(e=>e.config.async);for(const n of o)try{n.config.thisArg?n.handler.call(n.config.thisArg,t):n.handler(t),n.config.once&&i.push(n.id);}catch(t){gn._logger.error(`同步事件处理器执行错误 ${e}:`,t);}const c=a.map(async n=>{try{n.config.thisArg?await n.handler.call(n.config.thisArg,t):await n.handler(t),n.config.once&&i.push(n.id);}catch(t){gn._logger.error(`异步事件处理器执行错误 ${e}:`,t);}});await Promise.all(c),this.removeListeners(e,i),this.updateStats(e,performance.now()-s);}sortListenersByPriority(e){return e.slice().sort((e,t)=>(t.config.priority||0)-(e.config.priority||0))}removeListeners(e,t){if(0===t.length)return;const n=this.listeners.get(e);if(n){for(const e of t){const t=n.findIndex(t=>t.id===e);-1!==t&&n.splice(t,1);}0===n.length&&(this.listeners.delete(e),this.stats.delete(e));}}addToBatch(e,t){let n=this.batchQueue.get(e);n||(n=[],this.batchQueue.set(e,n)),n.push(t);const s=this.batchConfigs.get(e);if(n.length>=s.batchSize)this.flushBatch(e);else if(!this.batchTimers.has(e)){const t=setTimeout(()=>{this.flushBatch(e);},s.delay);this.batchTimers.set(e,t);}}async processBatch(e,t){const n={type:e,events:t,count:t.length,timestamp:Date.now()};await this.executeEvent(`${e}:batch`,n);}clearBatch(e){this.batchQueue.delete(e);const t=this.batchTimers.get(e);t&&(clearTimeout(t),this.batchTimers.delete(e));}clearAllBatches(){this.batchQueue.clear();for(const e of this.batchTimers.values())clearTimeout(e);this.batchTimers.clear(),this.batchConfigs.clear();}updateStats(e,t){let n=this.stats.get(e);n||(n=this.createEmptyStats(e),this.stats.set(e,n)),n.triggerCount++,n.totalExecutionTime+=t,n.averageExecutionTime=n.totalExecutionTime/n.triggerCount,n.lastTriggerTime=Date.now(),n.listenerCount=this.getListenerCount(e);}createEmptyStats(e){return {eventType:e,listenerCount:0,triggerCount:0,totalExecutionTime:0,averageExecutionTime:0,lastTriggerTime:0}}}gn._logger=$("EventSystem");const yn=new class{constructor(){this._runtimeEnvironment="standalone";}get runtimeEnvironment(){return this._runtimeEnvironment}set runtimeEnvironment(e){this._runtimeEnvironment=e;}get isServer(){return "server"===this._runtimeEnvironment}get isClient(){return "client"===this._runtimeEnvironment}};class Sn{constructor(e,t,n,s,i){this._all=e||[],this._any=t||[],this._none=n||[],void 0!==s&&(this._tag=s),void 0!==i&&(this._name=i);}withAll(...e){return new Sn([...this._all,...e],this._any,this._none,this._tag,this._name)}withAny(...e){return new Sn(this._all,[...this._any,...e],this._none,this._tag,this._name)}withNone(...e){return new Sn(this._all,this._any,[...this._none,...e],this._tag,this._name)}withTag(e){return new Sn(this._all,this._any,this._none,e,this._name)}withName(e){return new Sn(this._all,this._any,this._none,this._tag,e)}buildMatcher(){let e=lt.complex();return this._all.length>0&&(e=e.all(...this._all)),this._any.length>0&&(e=e.any(...this._any)),this._none.length>0&&(e=e.none(...this._none)),void 0!==this._tag&&(e=e.withTag(this._tag)),void 0!==this._name&&(e=e.withName(this._name)),e}getCondition(){return {all:[...this._all],any:[...this._any],none:[...this._none],...void 0!==this._tag&&{tag:this._tag},...void 0!==this._name&&{name:this._name}}}getRequiredTypes(){return this._all}clone(){return new Sn([...this._all],[...this._any],[...this._none],this._tag,this._name)}}const bn=new Map;function Tn(e,t){bn.set(e,t);}Tn("Date",{check:e=>e instanceof Date,serialize:e=>({__type:"Date",value:e.toISOString()}),deserialize:e=>new Date(e.value)}),Tn("Map",{check:e=>e instanceof Map,serialize:(e,t)=>({__type:"Map",value:[...e].map(([e,n])=>[t(e),t(n)])}),deserialize:e=>new Map(e.value)}),Tn("Set",{check:e=>e instanceof Set,serialize:(e,t)=>({__type:"Set",value:[...e].map(t)}),deserialize:e=>new Set(e.value)});const wn={serialize:function e(t,n=new WeakSet){if(null==t)return t;const s=typeof t;if("string"===s||"number"===s||"boolean"===s)return t;if("function"===s)return;const i=t;if(n.has(i))return;n.add(i);for(const[,s]of bn)if(s.check(t))return s.serialize(t,t=>e(t,n));if(Array.isArray(t))return t.map(t=>e(t,n));const r={};for(const s of Object.keys(t))r[s]=e(t[s],n);return r},deserialize:function e(t){if(null==t)return t;const n=typeof t;if("string"===n||"number"===n||"boolean"===n)return t;if(function(e){if(null===e||"object"!=typeof e)return  false;return "__type"in e}(t)){const e=bn.get(t.__type);return e?e.deserialize(t):t}if(Array.isArray(t))return t.map(e);const s={};for(const n of Object.keys(t))s[n]=e(t[n]);return s},register:Tn},In=$("ComponentSerializer");class Mn{static serialize(e){const t=at(e);if(!t)return null;const n=e.constructor,s=t.options.typeId||w(n),i={};for(const[n,s]of t.fields){if(t.ignoredFields.has(n))continue;const r="symbol"==typeof n?n.toString():n,o=e[n];let a;a=fe(e,r)?this.serializeEntityRef(o):s.serializer?s.serializer(o):wn.serialize(o),i[s.alias||r]=a;}return {type:s,version:t.options.version,data:i}}static deserialize(e,t,n){const s=t.get(e.type);if(!s)return In.warn(`Component type not found: ${e.type} | 未找到组件类型: ${e.type}`),null;const i=at(s);if(!i)return In.warn(`Component ${e.type} is not serializable | 组件 ${e.type} 不可序列化`),null;const r=new s;for(const[t,s]of i.fields){const i="symbol"==typeof t?t.toString():t,o=s.alias||i,a=e.data[o];if(void 0===a)continue;if(this.isSerializedEntityRef(a)){if(n){const e=a.__entityRef;n.registerPendingRef(r,i,e.id,e.guid);}r[t]=null;continue}const c=s.deserializer?s.deserializer(a):wn.deserialize(a);r[t]=c;}return r}static serializeComponents(e){return e.map(e=>this.serialize(e)).filter(e=>null!==e)}static deserializeComponents(e,t,n){return e.map(e=>this.deserialize(e,t,n)).filter(e=>null!==e)}static validateVersion(e,t){return e.version===t}static getSerializationInfo(e){const t=at(e);if(!t)return {type:"unknown",version:0,fields:[],ignoredFields:[],isSerializable:false};const n="function"==typeof e?e:e.constructor;return {type:t.options.typeId||w(n),version:t.options.version,fields:Array.from(t.fields.keys()).map(e=>"symbol"==typeof e?e.toString():e),ignoredFields:Array.from(t.ignoredFields).map(e=>"symbol"==typeof e?e.toString():e),isSerializable:true}}static serializeEntityRef(e){return e?{__entityRef:{id:e.id,guid:e.persistentId}}:null}static isSerializedEntityRef(e){return "object"==typeof e&&null!==e&&"__entityRef"in e}}class An{static serialize(e,t=true,n){const s=Mn.serializeComponents(Array.from(e.components)),i={id:e.id,guid:e.persistentId,name:e.name,tag:e.tag,active:e.active,enabled:e.enabled,updateOrder:e.updateOrder,components:s,children:[]},r=e.getComponent(ht);if(null!=r?.parentId&&(i.parentId=r.parentId),t&&r&&r.childIds.length>0){const t=n?.scene??e.scene;if(t)for(const e of r.childIds){const s=t.findEntityById(e);s&&i.children.push(this.serialize(s,true,n));}}return i}static deserialize(e,t,n,s=false,i,r,o,a){const c=s?e.id:n(),h=new Xt(e.name,c,e.guid);o?.set(h.id,h),a&&a.registerEntity(h,e.id,e.guid),i&&(h.scene=i),h.tag=e.tag,h.active=e.active,h.enabled=e.enabled,h.updateOrder=e.updateOrder;const l=Mn.deserializeComponents(e.components,t,a);for(const e of l)h.addComponent(e);const d=h.getComponent(ht);d&&(d.parentId=null,d.childIds=[]);for(const c of e.children){const e=this.deserialize(c,t,n,s,i,r,o,a);r?.setParent(e,h);}return h}static serializeEntities(e,t=true,n){const s=[];for(const i of e){const e=i.getComponent(ht);null!=e?.parentId&&t||s.push(this.serialize(i,t,n));}return s}static deserializeEntities(e,t,n,s=false,i,r,o){const a=[],c=new Map;for(const h of e){const e=this.deserialize(h,t,n,s,i,r,c,o);a.push(e);}return {rootEntities:a,allEntities:c}}static clone(e,t,n){const s=this.serialize(e,true);return this.deserialize(s,t,n,false)}}class kn{static stringToUtf8(e){const t=e.length;let n=0;const s=[];for(let i=0;i<t;i++){let r=e.charCodeAt(i);if(r>=55296&&r<=56319&&i+1<t){const t=r,n=e.charCodeAt(i+1);n>=56320&&n<=57343&&(r=65536+(t-55296<<10)+(n-56320),i++);}r<128?s[n++]=r:r<2048?(s[n++]=192|r>>6,s[n++]=128|63&r):r<65536?(s[n++]=224|r>>12,s[n++]=128|r>>6&63,s[n++]=128|63&r):(s[n++]=240|r>>18,s[n++]=128|r>>12&63,s[n++]=128|r>>6&63,s[n++]=128|63&r);}return new Uint8Array(s)}static utf8ToString(e){const t=e.length;let n="",s=0;for(;s<t;){const t=e[s++];if(void 0===t)break;if(t<128)n+=String.fromCharCode(t);else if(192==(224&t)){const i=e[s++];if(void 0===i)break;n+=String.fromCharCode((31&t)<<6|63&i);}else if(224==(240&t)){const i=e[s++],r=e[s++];if(void 0===i||void 0===r)break;n+=String.fromCharCode((15&t)<<12|(63&i)<<6|63&r);}else if(240==(248&t)){const i=e[s++],r=e[s++],o=e[s++];if(void 0===i||void 0===r||void 0===o)break;let a=(7&t)<<18|(63&i)<<12|(63&r)<<6|63&o;a-=65536,n+=String.fromCharCode(55296+(a>>10),56320+(1023&a));}}return n}static encode(e){const t=JSON.stringify(e);return this.stringToUtf8(t)}static decode(e){const t=this.utf8ToString(e);return JSON.parse(t)}}class Dn{constructor(){this._idRemapping=new Map,this._guidLookup=new Map,this._pendingRefs=[],this._preserveIds=false;}setPreserveIds(e){this._preserveIds=e;}get preserveIds(){return this._preserveIds}registerEntity(e,t,n){const s=n??e.persistentId;this._guidLookup.set(s,e),void 0!==t&&this._idRemapping.set(t,e);}getEntityById(e){return this._idRemapping.get(e)??null}getEntityByGuid(e){return this._guidLookup.get(e)??null}resolveEntityRef(e){if(!e)return null;if(e.guid){const t=this._guidLookup.get(e.guid);if(t)return t}if(void 0!==e.id){const t=this._idRemapping.get(e.id);if(t)return t}return null}registerPendingRef(e,t,n,s){this._pendingRefs.push({component:e,propertyKey:t,originalId:n,originalGuid:s});}resolveAllReferences(){let e=0;for(const t of this._pendingRefs){const n=this.resolveEntityRef({id:t.originalId,guid:t.originalGuid});n&&(t.component[t.propertyKey]=n,e++);}return e}getUnresolvedCount(){let e=0;for(const t of this._pendingRefs){this.resolveEntityRef({id:t.originalId,guid:t.originalGuid})||e++;}return e}getPendingCount(){return this._pendingRefs.length}getRegisteredEntityCount(){return this._guidLookup.size}clear(){this._idRemapping.clear(),this._guidLookup.clear(),this._pendingRefs=[];}getDebugInfo(){return {registeredEntities:this._guidLookup.size,pendingRefs:this._pendingRefs.length,unresolvedRefs:this.getUnresolvedCount(),preserveIds:this._preserveIds}}}const xn=$("SceneSerializer");class On{static serialize(e,t){const n={systems:false,format:"json",pretty:true,includeMetadata:true,...t},s=this.filterEntities(e,n),i=e.getSystem(St),r=An.serializeEntities(s,true,i??void 0),o=this.buildComponentTypeRegistry(s),a=this.serializeSceneData(e.sceneData),c={name:e.name,version:this.SERIALIZATION_VERSION,entities:r,componentTypeRegistry:o};return a&&Object.keys(a).length>0&&(c.sceneData=a),n.includeMetadata&&(c.timestamp=Date.now(),c.metadata={entityCount:r.length,componentTypeCount:o.length,serializationOptions:n}),"json"===n.format?n.pretty?JSON.stringify(c,null,2):JSON.stringify(c):kn.encode(c)}static deserialize(e,t,n){const s={strategy:"replace",preserveIds:false,...n};let i;try{i="string"==typeof t?JSON.parse(t):kn.decode(t);}catch(e){throw new Error(`Failed to parse save data: ${e}`)}s.migration&&i.version!==this.SERIALIZATION_VERSION&&(i=s.migration(i.version,this.SERIALIZATION_VERSION,i));const r=s.componentRegistry||this.getGlobalComponentRegistry();"replace"===s.strategy&&e.destroyAllEntities();const o=e.getSystem(St),a=new Dn;a.setPreserveIds(s.preserveIds||false);const{rootEntities:c,allEntities:h}=An.deserializeEntities(i.entities,r,()=>e.identifierPool.checkOut(),s.preserveIds||false,e,o,a);for(const t of c)e.addEntity(t,true),this.addChildrenRecursively(t,e,o,h);e.querySystem.clearCache(),e.clearSystemEntityCaches();const l=a.resolveAllReferences(),d=a.getUnresolvedCount();d>0&&xn.warn(`${d} EntityRef(s) could not be resolved. Resolved: ${l}, Total pending: ${a.getPendingCount()} | ${d} 个实体引用无法解析`),i.sceneData&&this.deserializeSceneData(i.sceneData,e.sceneData);const u=[];for(const e of h.values())this.callOnDeserializedForEntity(e,u);u.length>0&&Promise.all(u).catch(e=>{xn.error("Error in onDeserialized | onDeserialized 执行错误:",e);});}static callOnDeserializedForEntity(e,t){for(const n of e.components)try{const e=n.onDeserialized();e instanceof Promise&&t.push(e);}catch(e){const t=w(n.constructor);xn.error(`Error calling onDeserialized on component ${t} | 调用组件 ${t} 的 onDeserialized 时出错:`,e);}}static addChildrenRecursively(e,t,n,s){const i=e.getComponent(ht);if(i&&0!==i.childIds.length)for(const e of i.childIds){const i=s?.get(e)??t.findEntityById(e);i&&(t.addEntity(i,true),this.addChildrenRecursively(i,t,n,s));}}static serializeSceneData(e){const t={};for(const[n,s]of e)t[n]=wn.serialize(s);return t}static deserializeSceneData(e,t){t.clear();for(const[n,s]of Object.entries(e))t.set(n,wn.deserialize(s));}static filterEntities(e,t){const n=Array.from(e.entities.buffer);if(t.components&&t.components.length>0){const e=new Set(t.components);return n.filter(t=>Array.from(t.components).some(t=>e.has(t.constructor)))}return n}static buildComponentTypeRegistry(e){const t=new Map;for(const n of e)for(const e of n.components){const n=w(e.constructor),s=at(e);s&&!t.has(n)&&t.set(n,s.options.version);}return Array.from(t.entries()).map(([e,t])=>({typeName:e,version:t}))}static getGlobalComponentRegistry(){return j.getAllComponentNames()}static validate(e){const t=[];try{const n=JSON.parse(e);return n.version||t.push("Missing version field"),n.entities&&Array.isArray(n.entities)||t.push("Missing or invalid entities field"),n.componentTypeRegistry&&Array.isArray(n.componentTypeRegistry)||t.push("Missing or invalid componentTypeRegistry field"),{valid:0===t.length,version:n.version,...t.length>0&&{errors:t}}}catch(e){return {valid:false,errors:[`JSON parse error: ${e}`]}}}static getInfo(e){try{const t=JSON.parse(e);return {name:t.name,version:t.version,...void 0!==t.timestamp&&{timestamp:t.timestamp},entityCount:t.metadata?.entityCount||t.entities.length,componentTypeCount:t.componentTypeRegistry.length}}catch(e){return null}}}var Pn;On.SERIALIZATION_VERSION=1,function(e){e.EntityAdded="entity_added",e.EntityRemoved="entity_removed",e.EntityUpdated="entity_updated",e.ComponentAdded="component_added",e.ComponentRemoved="component_removed",e.ComponentUpdated="component_updated",e.SceneDataUpdated="scene_data_updated";}(Pn||(Pn={}));const Rn={deepComponentComparison:true,trackSceneData:true,compressSnapshot:false,format:"json",pretty:false};class zn{static createSnapshot(e,t){const n={...Rn,...t},s={version:++this.snapshotVersion,entityIds:new Set,entities:new Map,components:new Map,sceneData:new Map};for(const t of e.entities.buffer){if(n.entityFilter&&!n.entityFilter(t))continue;s.entityIds.add(t.id);const e=t.getComponent(ht),i=e?.parentId;if(s.entities.set(t.id,{name:t.name,tag:t.tag,active:t.active,enabled:t.enabled,updateOrder:t.updateOrder,...null!=i&&{parentId:i}}),n.deepComponentComparison){const e=new Map;for(const n of t.components){const t=Mn.serialize(n);t&&e.set(t.type,JSON.stringify(t.data));}e.size>0&&s.components.set(t.id,e);}}if(n.trackSceneData)for(const[t,n]of e.sceneData)s.sceneData.set(t,JSON.stringify(n));return s}static computeIncremental(e,t,n){const s={...Rn,...n},i={version:++this.snapshotVersion,timestamp:Date.now(),sceneName:e.name,baseVersion:t.version,entityChanges:[],componentChanges:[],sceneDataChanges:[]},r=new Set;for(const n of e.entities.buffer){if(s.entityFilter&&!s.entityFilter(n))continue;r.add(n.id);const e=n.getComponent(ht),o=e?.parentId;if(t.entityIds.has(n.id)){const e=t.entities.get(n.id);(e.name!==n.name||e.tag!==n.tag||e.active!==n.active||e.enabled!==n.enabled||e.updateOrder!==n.updateOrder||e.parentId!==o)&&i.entityChanges.push({operation:Pn.EntityUpdated,entityId:n.id,entityData:{name:n.name,tag:n.tag,active:n.active,enabled:n.enabled,updateOrder:n.updateOrder,...null!=o&&{parentId:o}}}),s.deepComponentComparison&&this.detectComponentChanges(n,t,i.componentChanges);}else {i.entityChanges.push({operation:Pn.EntityAdded,entityId:n.id,entityName:n.name,entityData:{id:n.id,name:n.name,tag:n.tag,active:n.active,enabled:n.enabled,updateOrder:n.updateOrder,...null!=o&&{parentId:o},components:[],children:[]}});for(const e of n.components){const t=Mn.serialize(e);t&&i.componentChanges.push({operation:Pn.ComponentAdded,entityId:n.id,componentType:t.type,componentData:t});}}}for(const e of t.entityIds)r.has(e)||i.entityChanges.push({operation:Pn.EntityRemoved,entityId:e});return s.trackSceneData&&this.detectSceneDataChanges(e,t,i.sceneDataChanges),i}static detectComponentChanges(e,t,n){const s=t.components.get(e.id),i=new Map;for(const t of e.components){const e=Mn.serialize(t);e&&i.set(e.type,e);}for(const[t,r]of i){const i=JSON.stringify(r.data);s&&s.has(t)?s.get(t)!==i&&n.push({operation:Pn.ComponentUpdated,entityId:e.id,componentType:t,componentData:r}):n.push({operation:Pn.ComponentAdded,entityId:e.id,componentType:t,componentData:r});}if(s)for(const t of s.keys())i.has(t)||n.push({operation:Pn.ComponentRemoved,entityId:e.id,componentType:t});}static detectSceneDataChanges(e,t,n){const s=new Set;for(const[i,r]of e.sceneData){s.add(i);const e=JSON.stringify(r),o=t.sceneData.get(i);o&&o===e||n.push({operation:Pn.SceneDataUpdated,key:i,value:r});}for(const e of t.sceneData.keys())s.has(e)||n.push({operation:Pn.SceneDataUpdated,key:e,value:void 0,deleted:true});}static applyIncremental(e,t,n){for(const n of t.entityChanges)switch(n.operation){case Pn.EntityAdded:this.applyEntityAdded(e,n);break;case Pn.EntityRemoved:this.applyEntityRemoved(e,n);break;case Pn.EntityUpdated:this.applyEntityUpdated(e,n);}for(const s of t.componentChanges)switch(s.operation){case Pn.ComponentAdded:this.applyComponentAdded(e,s,n);break;case Pn.ComponentRemoved:this.applyComponentRemoved(e,s,n);break;case Pn.ComponentUpdated:this.applyComponentUpdated(e,s,n);}for(const n of t.sceneDataChanges)n.deleted?e.sceneData.delete(n.key):e.sceneData.set(n.key,n.value);}static applyEntityAdded(e,t){if(!t.entityData)return;const n=new Xt(t.entityName||"Entity",t.entityId);n.tag=t.entityData.tag||0,n.active=t.entityData.active??true,n.enabled=t.entityData.enabled??true,n.updateOrder=t.entityData.updateOrder||0,e.addEntity(n);}static applyEntityRemoved(e,t){const n=e.entities.findEntityById(t.entityId);n&&n.destroy();}static applyEntityUpdated(e,t){if(!t.entityData)return;const n=e.entities.findEntityById(t.entityId);if(!n)return;void 0!==t.entityData.name&&(n.name=t.entityData.name),void 0!==t.entityData.tag&&(n.tag=t.entityData.tag),void 0!==t.entityData.active&&(n.active=t.entityData.active),void 0!==t.entityData.enabled&&(n.enabled=t.entityData.enabled),void 0!==t.entityData.updateOrder&&(n.updateOrder=t.entityData.updateOrder);const s=e.getSystem(St);if(s){const i=n.getComponent(ht),r=i?.parentId;if(void 0!==t.entityData.parentId){const i=e.entities.findEntityById(t.entityData.parentId);i&&r!==t.entityData.parentId&&s.setParent(n,i);}else null!=r&&s.setParent(n,null);}}static applyComponentAdded(e,t,n){if(!t.componentData)return;const s=e.entities.findEntityById(t.entityId);if(!s)return;const i=Mn.deserialize(t.componentData,n);i&&s.addComponent(i);}static applyComponentRemoved(e,t,n){const s=e.entities.findEntityById(t.entityId);if(!s)return;const i=n.get(t.componentType);i&&s.removeComponentByType(i);}static applyComponentUpdated(e,t,n){if(!t.componentData)return;const s=e.entities.findEntityById(t.entityId);if(!s)return;const i=n.get(t.componentType);if(!i)return;s.removeComponentByType(i);const r=Mn.deserialize(t.componentData,n);r&&s.addComponent(r);}static serializeIncremental(e,t){const n=t?.format??"json",s=t?.pretty??false;return "binary"===n?kn.encode(e):s?JSON.stringify(e,null,2):JSON.stringify(e)}static deserializeIncremental(e){return "string"==typeof e?JSON.parse(e):kn.decode(e)}static getIncrementalStats(e){const t={added:0,removed:0,updated:0},n={added:0,removed:0,updated:0};for(const n of e.entityChanges)n.operation===Pn.EntityAdded?t.added++:n.operation===Pn.EntityRemoved?t.removed++:n.operation===Pn.EntityUpdated&&t.updated++;for(const t of e.componentChanges)t.operation===Pn.ComponentAdded?n.added++:t.operation===Pn.ComponentRemoved?n.removed++:t.operation===Pn.ComponentUpdated&&n.updated++;return {totalChanges:e.entityChanges.length+e.componentChanges.length+e.sceneDataChanges.length,entityChanges:e.entityChanges.length,componentChanges:e.componentChanges.length,sceneDataChanges:e.sceneDataChanges.length,addedEntities:t.added,removedEntities:t.removed,updatedEntities:t.updated,addedComponents:n.added,removedComponents:n.removed,updatedComponents:n.updated}}static resetVersion(){this.snapshotVersion=0;}}zn.snapshotVersion=0;const Nn={enabled:true,sampleInterval:10,minDuration:.1,trackAsync:true,excludePatterns:[/^_/,/^get[A-Z]/,/^set[A-Z]/,/^is[A-Z]/,/^has[A-Z]/],maxBufferSize:1e4};class Fn{constructor(e){this.wrappedObjects=new WeakMap,this.samplingProfiler=null,this.registeredClasses=new Map,this._config={...Nn,...e};}static getInstance(e){return Fn._instance||(Fn._instance=new Fn(e)),Fn._instance}static resetInstance(){Fn._instance&&(Fn._instance.dispose(),Fn._instance=null);}static setEnabled(e){Fn.getInstance().setEnabled(e);}static registerClass(e,t=gt.Custom,n){return Fn.getInstance().registerClass(e,t,n)}static wrapInstance(e,t,n=gt.Custom){return Fn.getInstance().wrapInstance(e,t,n)}static wrapFunction(e,t,n=gt.Custom){return Fn.getInstance().wrapFunction(e,t,n)}static startSampling(){Fn.getInstance().startSampling();}static stopSampling(){return Fn.getInstance().stopSampling()}setEnabled(e){this._config.enabled=e,!e&&this.samplingProfiler&&this.samplingProfiler.stop();}registerClass(e,t=gt.Custom,n){const s=n||e.name;this.registeredClasses.set(s,{constructor:e,category:t});const i=this;return new Proxy(e,{construct(e,n,r){const o=Reflect.construct(e,n,r);return i._config.enabled&&i.wrapInstance(o,s,t),o}})}wrapInstance(e,t,n=gt.Custom){if(!this._config.enabled)return e;if(this.wrappedObjects.has(e))return e;const s=new Map;this.wrappedObjects.set(e,s);const i=this._getAllMethodNames(e);for(const r of i){if(this._shouldExcludeMethod(r))continue;const i=this._getPropertyDescriptor(e,r);if(!i||"function"!=typeof i.value)continue;const o=i.value,a=this._createWrappedMethod(o,t,r,n);s.set(r,{className:t,methodName:r,category:n,original:o});try{e[r]=a;}catch{}}return e}wrapFunction(e,t,n=gt.Custom){if(!this._config.enabled)return e;const s=this,i=function(...i){const r=Dt.beginSample(t,n);try{const t=e.apply(this,i);return s._config.trackAsync&&t instanceof Promise?t.finally(()=>{Dt.endSample(r);}):(Dt.endSample(r),t)}catch(e){throw Dt.endSample(r),e}};return Object.defineProperty(i,"name",{value:e.name||t}),Object.defineProperty(i,"length",{value:e.length}),i}startSampling(){this.samplingProfiler||(this.samplingProfiler=new Bn(this._config)),this.samplingProfiler.start();}stopSampling(){return this.samplingProfiler?this.samplingProfiler.stop():[]}dispose(){this.samplingProfiler&&(this.samplingProfiler.stop(),this.samplingProfiler=null),this.registeredClasses.clear();}_createWrappedMethod(e,t,n,s){const i=this,r=`${t}.${n}`,o=this._config.minDuration;return function(...t){if(!i._config.enabled||!Dt.isEnabled())return e.apply(this,t);const n=performance.now(),a=Dt.beginSample(r,s);try{const s=e.apply(this,t);if(i._config.trackAsync&&s instanceof Promise)return s.then(e=>(performance.now()-n>=o&&Dt.endSample(a),e),e=>{throw Dt.endSample(a),e});return performance.now()-n>=o&&Dt.endSample(a),s}catch(e){throw Dt.endSample(a),e}}}_getAllMethodNames(e){const t=new Set;let n=e;for(;n&&n!==Object.prototype;){for(const e of Object.getOwnPropertyNames(n))"constructor"!==e&&t.add(e);n=Object.getPrototypeOf(n);}return Array.from(t)}_getPropertyDescriptor(e,t){let n=e;for(;n&&n!==Object.prototype;){const e=Object.getOwnPropertyDescriptor(n,t);if(e)return e;n=Object.getPrototypeOf(n);}}_shouldExcludeMethod(e){if("constructor"===e||e.startsWith("__"))return  true;for(const t of this._config.excludePatterns)if(t.test(e))return  true;return  false}}Fn._instance=null;class Bn{constructor(e){this.samples=[],this.intervalId=null,this.isRunning=false,this.config=e;}start(){if(this.isRunning)return;this.isRunning=true,this.samples=[];const e=()=>{if(!this.isRunning)return;const t=this.captureStack();t.length>0&&(this.samples.push({timestamp:performance.now(),stack:t}),this.samples.length>this.config.maxBufferSize&&this.samples.shift()),this.config.sampleInterval,this.intervalId=setTimeout(e,this.config.sampleInterval);};e();}stop(){return this.isRunning=false,null!==this.intervalId&&(clearTimeout(this.intervalId),this.intervalId=null),[...this.samples]}captureStack(){try{const e=new Error,t=(e.stack||"").split("\n").slice(3),n=[];for(const e of t){const t=this.parseStackFrame(e);t&&!this.isInternalFrame(t)&&n.push(t);}return n}catch{return []}}parseStackFrame(e){let t=(e=e.trim()).match(/at\s+(.+?)\s+\(/);if(t&&t[1])return t[1];if(t=e.match(/at\s+(.+)/),t&&t[1]){const e=t[1];if(!e.includes("("))return e}return t=e.match(/^(.+?)@/),t&&t[1]?t[1]:null}isInternalFrame(e){return ["SamplingProfiler","AutoProfiler","ProfilerSDK","setTimeout","setInterval","requestAnimationFrame","<anonymous>","eval"].some(t=>e.includes(t))}}const Wn=$("ServiceContainer");exports.ServiceLifetime = void 0;!function(e){e.Singleton="singleton",e.Transient="transient";}(exports.ServiceLifetime||(exports.ServiceLifetime={}));class Un{constructor(){this._services=new Map,this._resolving=new Set,this._updatableServices=[];}registerSingleton(e,t){this._services.has(e)?Wn.warn(`Service ${e.name} is already registered`):(this._services.set(e,{identifier:e,type:e,...t&&{factory:t},lifetime:exports.ServiceLifetime.Singleton}),Wn.debug(`Registered singleton service: ${e.name}`));}registerTransient(e,t){this._services.has(e)?Wn.warn(`Service ${e.name} is already registered`):(this._services.set(e,{identifier:e,type:e,...t&&{factory:t},lifetime:exports.ServiceLifetime.Transient}),Wn.debug(`Registered transient service: ${e.name}`));}registerInstance(e,t){if(this._services.has(e)){const t="symbol"==typeof e?e.description:e.name;return void Wn.warn(`Service ${t} is already registered`)}if(this._services.set(e,{identifier:e,instance:t,lifetime:exports.ServiceLifetime.Singleton}),"symbol"!=typeof e&&m(e)){const n=p(e),s=n?.priority??0;this._updatableServices.push({instance:t,priority:s}),this._updatableServices.sort((e,t)=>e.priority-t.priority),Wn.debug(`Service ${e.name} is updatable (priority: ${s}), added to update list`);}const n="symbol"==typeof e?e.description:e.name;Wn.debug(`Registered service instance: ${n}`);}resolve(e){const t=this._services.get(e),n="symbol"==typeof e?e.description:e.name;if(!t)throw new Error(`Service ${n} is not registered`);if(this._resolving.has(e)){const e=Array.from(this._resolving).map(e=>"symbol"==typeof e?e.description:e.name).join(" -> ");throw new Error(`Circular dependency detected: ${e} -> ${n}`)}if(t.lifetime===exports.ServiceLifetime.Singleton&&t.instance)return t.instance;this._resolving.add(e);try{let e;if(t.factory)e=t.factory(this);else {if(!t.type)throw new Error(`Service ${n} has no factory or type to construct`);e=new t.type;}if(t.lifetime===exports.ServiceLifetime.Singleton&&(t.instance=e,t.type&&m(t.type))){const s=p(t.type),i=s?.priority??0;this._updatableServices.push({instance:e,priority:i}),this._updatableServices.sort((e,t)=>e.priority-t.priority),Wn.debug(`Service ${n} is updatable (priority: ${i}), added to update list`);}return e}finally{this._resolving.delete(e);}}tryResolve(e){try{return this.resolve(e)}catch{return null}}isRegistered(e){return this._services.has(e)}unregister(e){const t=this._services.get(e);if(!t)return  false;if(t.instance){const e=this._updatableServices.findIndex(e=>e.instance===t.instance);-1!==e&&this._updatableServices.splice(e,1),t.instance.dispose();}this._services.delete(e);const n="symbol"==typeof e?e.description:e.name;return Wn.debug(`Unregistered service: ${n}`),true}clear(){for(const[,e]of this._services)e.instance&&e.instance.dispose();this._services.clear(),this._updatableServices=[],Wn.debug("Cleared all services");}getRegisteredServices(){return Array.from(this._services.keys())}updateAll(e){for(const{instance:t}of this._updatableServices)t.update(e);}getUpdatableCount(){return this._updatableServices.length}getAll(){const e=[];for(const t of this._services.values())t.instance&&e.push(t.instance);return e}}class Gn extends Error{constructor(e){super(`[SystemDependencyGraph] 检测到循环依赖 | Cycle dependency detected: ${e.join(" -> ")}`),this.name="CycleDependencyError",this.involvedNodes=e,Object.setPrototypeOf(this,new.target.prototype);}}const qn="set:";class jn{constructor(){this._nodes=new Map;}addSystemNode(e){this.getOrCreateNode(e,false);}addSetNode(e){const t=qn+e;this.getOrCreateNode(t,true);}addEdge(e,t){if(e===t)return;const n=this.getOrCreateNode(e,e.startsWith(qn)),s=this.getOrCreateNode(t,t.startsWith(qn));n.outEdges.add(t),s.inEdges.add(e);}buildFromSystems(e){this.clear();for(const t of e){this.addSystemNode(t.name);for(const e of t.sets)this.addSetNode(e);}for(const t of e){for(const e of t.sets){const n=qn+e;this.addEdge(n,t.name);}for(const e of t.before){const n=this.resolveTargetId(e);this.addEdge(t.name,n);}for(const e of t.after){const n=this.resolveTargetId(e);this.addEdge(n,t.name);}}}topologicalSort(){const e=new Map;for(const[t,n]of this._nodes)e.set(t,n.inEdges.size);const t=[];for(const[n,s]of e)0===s&&t.push(n);const n=[];let s=0;for(;t.length>0;){const i=t.shift();s++;const r=this._nodes.get(i);if(r){r.bIsVirtual||n.push(i);for(const n of r.outEdges){const s=(e.get(n)??0)-1;e.set(n,s),0===s&&t.push(n);}}}if(s<this._nodes.size){const t=[];for(const[n,s]of e)s>0&&t.push(n);throw new Gn(t)}return n}clear(){this._nodes.clear();}get size(){return this._nodes.size}getOrCreateNode(e,t){let n=this._nodes.get(e);return n||(n={id:e,bIsVirtual:t,inEdges:new Set,outEdges:new Set},this._nodes.set(e,n)),n}resolveTargetId(e){return e.startsWith(qn),e}}const Vn=$("SystemScheduler"),Qn=["startup","preUpdate","update","postUpdate","cleanup"];class Yn{constructor(){this._sortedByStage=new Map,this._dirty=true,this._graph=new jn,this._useDependencySort=true;}setUseDependencySort(e){this._useDependencySort!==e&&(this._useDependencySort=e,this._dirty=true);}markDirty(){this._dirty=true;}getSortedSystems(e,t){if(this.ensureBuilt(e),t)return this._sortedByStage.get(t)??[];const n=[];for(const e of Qn){const t=this._sortedByStage.get(e);t&&n.push(...t);}return n}getAllSortedSystems(e){return this.getSortedSystems(e)}ensureBuilt(e){this._dirty&&(this._sortedByStage.clear(),this._useDependencySort&&this.hasDependencies(e)?this.buildWithDependencyGraph(e):this.buildWithUpdateOrder(e),this._dirty=false);}hasDependencies(e){for(const t of e){const e=this.getSchedulingMetadata(t);if(e.before.length>0||e.after.length>0||e.sets.length>0)return  true;if("update"!==e.stage)return  true}return  false}buildWithUpdateOrder(e){const t=[...e].sort((e,t)=>{const n=e.updateOrder-t.updateOrder;return 0!==n?n:e.addOrder-t.addOrder});this._sortedByStage.set("update",t);}buildWithDependencyGraph(e){const t=new Map;for(const e of Qn)t.set(e,[]);for(const n of e){const e=this.getSchedulingMetadata(n).stage,s=t.get(e);s?s.push(n):t.get("update").push(n);}for(const[e,n]of t){if(0===n.length){this._sortedByStage.set(e,[]);continue}const t=this.sortSystemsInStage(n);this._sortedByStage.set(e,t);}}sortSystemsInStage(e){const t=new Map,n=[];for(const s of e){const e=s.systemName;t.set(e,s);const i=this.getSchedulingMetadata(s);n.push({name:e,before:i.before,after:i.after,sets:i.sets});}this._graph.buildFromSystems(n);try{const e=this._graph.topologicalSort(),n=[];for(const s of e){const e=t.get(s);e&&n.push(e);}return this.stableSortByUpdateOrder(n)}catch(t){if(t instanceof Gn)throw t;return Vn.warn("Topological sort failed, falling back to updateOrder | 拓扑排序失败，回退到 updateOrder 排序",t),this.fallbackSort(e)}}stableSortByUpdateOrder(e){return e}fallbackSort(e){return [...e].sort((e,t)=>{const n=e.updateOrder-t.updateOrder;return 0!==n?n:e.addOrder-t.addOrder})}getSchedulingMetadata(e){return {stage:e.getStage(),before:[...e.getBefore()],after:[...e.getAfter()],sets:[...e.getSets()]}}}class Jn{constructor(e=1024){this._freeList=[],this._nextIndex=1,this._aliveCount=0,this._capacity=e,this._generations=new Uint32Array(e),this._alive=new Uint8Array(e),this._enabled=new Uint8Array(e),this._alive[0]=0,this._enabled[0]=0;}get aliveCount(){return this._aliveCount}get capacity(){return this._capacity}create(){let e;this._freeList.length>0?e=this._freeList.pop():(e=this._nextIndex++,e>=this._capacity&&this.grow(e));const t=this._generations[e];return this._alive[e]=1,this._enabled[e]=1,this._aliveCount++,Ht(e,t)}destroy(e){const t=Ut(e),n=Gt(e);if(t>=this._capacity||0===t)return  false;if(this._generations[t]!==n)return  false;if(1!==this._alive[t])return  false;this._alive[t]=0,this._enabled[t]=0,this._aliveCount--;const s=(n+1)%Lt;return this._generations[t]=s,this._freeList.push(t),true}isAlive(e){const t=Ut(e),n=Gt(e);return !(t>=this._capacity||0===t)&&(1===this._alive[t]&&this._generations[t]===n)}isEnabled(e){if(!this.isAlive(e))return  false;const t=Ut(e);return 1===this._enabled[t]}setEnabled(e,t){if(!this.isAlive(e))return  false;const n=Ut(e);return this._enabled[n]=t?1:0,true}validate(e){return this.isAlive(e)}grow(e){let t=this._capacity;for(;t<=e;)t<<=1;if(t>$t&&(t=$t,e>=t))throw new Error("EntityHandleManager: 超过最大实体数量 268435456");const n=new Uint32Array(t),s=new Uint8Array(t),i=new Uint8Array(t);n.set(this._generations),s.set(this._alive),i.set(this._enabled),this._generations=n,this._alive=s,this._enabled=i,this._capacity=t;}reset(){this._generations.fill(0),this._alive.fill(0),this._enabled.fill(0),this._freeList.length=0,this._nextIndex=1,this._aliveCount=0;}forEach(e){for(let t=1;t<this._nextIndex;t++)if(1===this._alive[t]){e(Ht(t,this._generations[t]));}}getAllAlive(){const e=[];return this.forEach(t=>e.push(t)),e}}class Zn{constructor(){this._current=1;}get current(){return this._current}increment(){this._current++,this._current>=Number.MAX_SAFE_INTEGER&&(this._current=1);}reset(){this._current=1;}isChangedSince(e,t){return e>t}}class Xn{get runtimeEnvironment(){return this._runtimeEnvironmentOverride?this._runtimeEnvironmentOverride:yn.runtimeEnvironment}get isServer(){return "server"===this.runtimeEnvironment}get isClient(){return "client"===this.runtimeEnvironment}get systems(){return !this._systemsOrderDirty&&this._cachedSystems||(this._cachedSystems=this._rebuildSystemsCache(),this._systemsOrderDirty=false),this._cachedSystems}_rebuildSystemsCache(){const e=this._services.getAll(),t=this._filterEntitySystems(e);try{return this._systemScheduler.markDirty(),this._systemScheduler.getAllSortedSystems(t)}catch(e){return e instanceof Gn?this._logger.error("[Scene] 系统存在循环依赖，回退到 updateOrder 排序 | Cycle dependency detected, falling back to updateOrder sort",e.involvedNodes):this._logger.error("[Scene] 系统排序失败 | System sorting failed",e),this._sortSystemsByUpdateOrder(t)}}_filterEntitySystems(e){return e.filter(e=>e instanceof _t)}_sortSystemsByUpdateOrder(e){return e.sort((e,t)=>{const n=e.updateOrder-t.updateOrder;return 0!==n?n:e.addOrder-t.addOrder})}getSystem(e){return this._services.tryResolve(e)}markSystemsOrderDirty(){this._systemsOrderDirty=true;}get services(){return this._services}constructor(e){this.name="",this.sceneData=new Map,this._handleToEntity=new Map,this.epochManager=new Zn,this._performanceMonitor=null,this._didSceneBegin=false,this.isEditorMode=false,this._deferredComponentCallbacks=[],this._cachedSystems=null,this._systemsOrderDirty=true,this._systemErrorCount=new Map,this._systemAddCounter=0,this._systemScheduler=new Yn,this._componentIdToSystems=new Map,this._globalNotifySystems=new Set,this.entities=new Kt(this),this.identifierPool=new en,this.componentStorageManager=new mt,this.componentRegistry=new q,false!==e?.inheritGlobalRegistry&&this.componentRegistry.cloneFrom(j),this.querySystem=new pn,this.eventSystem=new gn,this.referenceTracker=new ae,this.handleManager=new Jn,this._services=new Un,this._logger=$("Scene"),this._maxErrorCount=e?.maxSystemErrorCount??10,e?.runtimeEnvironment&&(this._runtimeEnvironmentOverride=e.runtimeEnvironment),e?.name&&(this.name=e.name);}get performanceMonitor(){return this._performanceMonitor||(this._performanceMonitor=this._services.tryResolve(_)??new _),this._performanceMonitor}initialize(){}onStart(){}unload(){}queueDeferredComponentCallback(e){this._deferredComponentCallbacks.push(e);}begin(){if(this._didSceneBegin=true,this._deferredComponentCallbacks.length>0){for(const e of this._deferredComponentCallbacks)try{e();}catch(e){this._logger.error("Error executing deferred component callback:",e);}this._deferredComponentCallbacks=[];}this.onStart();}end(){this._didSceneBegin=false,this.unload(),this.entities.removeAllEntities(),this.querySystem.setEntities([]),this.componentStorageManager.clear(),this._services.clear(),this._cachedSystems=null,this._systemsOrderDirty=true,this._componentIdToSystems.clear(),this._globalNotifySystems.clear(),this._handleToEntity.clear(),this.handleManager.reset(),this.epochManager.reset();}update(){this.epochManager.increment(),Dt.beginFrame();const e=Dt.beginSample("Scene.update",gt.ECS);try{Tt.getInstance().update(),this.entities.updateLists();const e=this.systems;this._runSystemPhase(e,"update","Systems.update"),this._runSystemPhase(e,"lateUpdate","Systems.lateUpdate"),this.flushCommandBuffers(e);}finally{Dt.endSample(e),Dt.endFrame();}}_runSystemPhase(e,t,n){const s=Dt.beginSample(n,gt.ECS);try{for(const n of e){if(!this._shouldSystemRun(n))continue;const e="lateUpdate"===t?".late":"",s=Dt.beginSample(`${n.systemName}${e}`,gt.ECS);try{n[t]();}catch(e){this._handleSystemError(n,t,e);}finally{Dt.endSample(s);}}}finally{Dt.endSample(s);}}_shouldSystemRun(e){if(!e.enabled)return  false;if(!this.isEditorMode)return  true;const t=te(e);return  false!==t?.runInEditMode}flushCommandBuffers(e){const t=Dt.beginSample("Scene.flushCommandBuffers",gt.ECS);try{for(const t of e)try{t.flushCommands();}catch(e){this._logger.error(`Error flushing commands for system ${t.systemName}:`,e);}}finally{Dt.endSample(t);}}_handleSystemError(e,t,n){const s=(this._systemErrorCount.get(e)||0)+1;this._systemErrorCount.set(e,s);const i=e.systemName;this._logger.error(`Error in system ${i}.${t}() [${s}/${this._maxErrorCount}]:`,n),s>=this._maxErrorCount&&(e.enabled=false,this._logger.error(`System ${i} has been disabled due to excessive errors (${s} errors)`));}createEntity(e){const t=new Xt(e,this.identifierPool.checkOut()),n=this.handleManager.create();return t.setHandle(n),this._handleToEntity.set(n,t),this.eventSystem.emitSync("entity:created",{entityName:e,entity:t,scene:this}),this.addEntity(t)}clearSystemEntityCaches(){for(const e of this.systems)e.clearEntityCache();}notifyEntityComponentChanged(e,t){const n=new Set;if(t&&this.componentRegistry.isRegistered(t)){const s=this.componentRegistry.getBitIndex(t),i=this._componentIdToSystems.get(s);if(i)for(const t of i)t.handleEntityComponentChanged(e),n.add(t);}for(const t of this._globalNotifySystems)n.has(t)||(t.handleEntityComponentChanged(e),n.add(t));if(!t)for(const t of this.systems)n.has(t)||t.handleEntityComponentChanged(e);}indexSystemByComponents(e){const t=e.matcher;if(!t)return;if(t.isNothing())return;const n=t.getCondition();if((n.none.length>0||void 0!==n.tag||void 0!==n.name)&&this._globalNotifySystems.add(e),t.isEmpty())this._globalNotifySystems.add(e);else {for(const t of n.all)this.addSystemToComponentIndex(t,e);for(const t of n.any)this.addSystemToComponentIndex(t,e);n.component&&this.addSystemToComponentIndex(n.component,e);}}addSystemToComponentIndex(e,t){const n=this.componentRegistry.getBitIndex(e);let s=this._componentIdToSystems.get(n);s||(s=new Set,this._componentIdToSystems.set(n,s)),s.add(t);}removeSystemFromIndex(e){this._globalNotifySystems.delete(e);for(const t of this._componentIdToSystems.values())t.delete(e);}addEntity(e,t=false){return this.entities.add(e),e.scene=this,this.querySystem.addEntity(e,t),t||this.clearSystemEntityCaches(),this.eventSystem.emitSync("entity:added",{entity:e,scene:this}),e}createEntities(e,t="Entity"){const n=[];for(let s=0;s<e;s++){const e=new Xt(`${t}_${s}`,this.identifierPool.checkOut());e.scene=this;const i=this.handleManager.create();e.setHandle(i),this._handleToEntity.set(i,e),n.push(e);}for(const e of n)this.entities.add(e);return this.querySystem.addEntitiesUnchecked(n),this.eventSystem.emitSync("entities:batch_added",{entities:n,scene:this,count:e}),n}destroyEntities(e){if(0!==e.length){for(const t of e)t.setDestroyedState(true);for(const t of e)t.removeAllComponents();for(const t of e)this.entities.remove(t),this.querySystem.removeEntity(t),qt(t.handle)&&(this._handleToEntity.delete(t.handle),this.handleManager.destroy(t.handle));this.querySystem.clearCache(),this.clearSystemEntityCaches();}}destroyAllEntities(){this.entities.removeAllEntities(),this.querySystem.setEntities([]);}findEntity(e){return this.entities.findEntity(e)}findEntityById(e){return this.entities.findEntityById(e)}findEntityByHandle(e){return qt(e)&&this.handleManager.isAlive(e)?this._handleToEntity.get(e)??null:null}findEntitiesByTag(e){const t=[];for(const n of this.entities.buffer)n.tag===e&&t.push(n);return t}findPersistentEntities(){return this.entities.buffer.filter(e=>e.isPersistent)}extractPersistentEntities(){const e=this.findPersistentEntities();for(const t of e)this.entities.remove(t),this.querySystem.removeEntity(t),t.scene=null;return e}receiveMigratedEntities(e){for(const t of e){t.scene=this,this.entities.add(t),this.querySystem.addEntity(t);for(const e of t.components)this.componentStorageManager.addComponent(t.id,e),this.referenceTracker?.registerEntityScene(t.id,this);}e.length>0&&this.clearSystemEntityCaches();}getEntityByName(e){return this.findEntity(e)}getEntitiesByTag(e){return this.findEntitiesByTag(e)}queryAll(...e){return this.querySystem.queryAll(...e)}queryAny(...e){return this.querySystem.queryAny(...e)}queryNone(...e){return this.querySystem.queryNone(...e)}query(){return new Sn}addEntityProcessor(e){let t,n;if("function"==typeof e){if(n=e,this._services.isRegistered(n)){const e=this._services.resolve(n);return this._logger.debug(`System ${n.name} already registered, returning existing instance`),e}t=h(n)?d(n,this._services):new n;}else if(t=e,n=t.constructor,this._services.isRegistered(n)){const e=this._services.resolve(n);return e===t?(this._logger.debug(`System ${n.name} instance already registered, returning it`),t):(this._logger.warn(`Attempting to register a different instance of ${n.name}, but type is already registered. Returning existing instance.`),e)}t.scene=this,t.addOrder=this._systemAddCounter++,t.setPerformanceMonitor(this.performanceMonitor);const s=ee(n);return void 0!==s?.updateOrder&&t.setUpdateOrder(s.updateOrder),void 0!==s?.enabled&&(t.enabled=s.enabled),this._services.registerInstance(n,t),this.markSystemsOrderDirty(),this.indexSystemByComponents(t),u$1(t,this._services),Dt.isEnabled()&&Fn.wrapInstance(t,t.systemName,gt.ECS),t.initialize(),this._logger.debug(`System ${n.name} registered and initialized`),t}registerSystems(e){const t=[];for(const n of e){const e=this.addEntityProcessor(n);t.push(e);}return t}addSystem(e){return this.addEntityProcessor(e)}removeEntityProcessor(e){const t=e.constructor;this._services.unregister(t),this.markSystemsOrderDirty(),this.removeSystemFromIndex(e),e.reset();}removeSystem(e){this.removeEntityProcessor(e);}getEntityProcessor(e){return this._services.tryResolve(e)}getStats(){return {entityCount:this.entities.count,processorCount:this.systems.length,componentStorageStats:this.componentStorageManager.getAllStats()}}getDebugInfo(){const e=this.systems;return {name:this.name||this.constructor.name,entityCount:this.entities.count,processorCount:e.length,isRunning:this._didSceneBegin,entities:this.entities.buffer.map(e=>({name:e.name,id:e.id,componentCount:e.components.length,componentTypes:e.components.map(e=>I(e))})),processors:e.map(e=>({name:se(e),updateOrder:e.updateOrder,entityCount:e.entities.length})),componentStats:this.componentStorageManager.getAllStats()}}serialize(e){return On.serialize(this,e)}deserialize(e,t){On.deserialize(this,e,t);}createIncrementalSnapshot(e){this._incrementalBaseSnapshot=zn.createSnapshot(this,e);}serializeIncremental(e){if(!this._incrementalBaseSnapshot)throw new Error("必须先调用 createIncrementalSnapshot() 创建基础快照");return zn.computeIncremental(this,this._incrementalBaseSnapshot,e)}applyIncremental(e,t){const n="string"==typeof e||e instanceof Uint8Array?zn.deserializeIncremental(e):e,s=t||this.componentRegistry.getAllComponentNames();zn.applyIncremental(this,n,s);}updateIncrementalSnapshot(e){this.createIncrementalSnapshot(e);}clearIncrementalSnapshot(){this._incrementalBaseSnapshot=void 0;}hasIncrementalSnapshot(){return void 0!==this._incrementalBaseSnapshot}}class Kn{constructor(e,t){this.scene=e,this.storageManager=t;const n=e.identifierPool.checkOut();this.entity=new Xt("",n),this.entity.scene=this.scene;}named(e){return this.entity.name=e,this}tagged(e){return this.entity.tag=e,this}with(e){return this.entity.addComponent(e),this}withComponents(...e){for(const t of e)this.entity.addComponent(t);return this}withIf(e,t){return e&&this.entity.addComponent(t),this}withFactory(e){const t=e();return this.entity.addComponent(t),this}configure(e,t){const n=this.entity.getComponent(e);return n&&t(n),this}enabled(e=true){return this.entity.enabled=e,this}active(e=true){return this.entity.active=e,this}withChild(e){const t=e.build(),n=this.scene.getSystem(St);return n?.setParent(t,this.entity),this}withChildren(...e){const t=this.scene.getSystem(St);for(const n of e){const e=n.build();t?.setParent(e,this.entity);}return this}withChildFactory(e){const t=e(this.entity).build(),n=this.scene.getSystem(St);return n?.setParent(t,this.entity),this}withChildIf(e,t){if(e){const e=t.build(),n=this.scene.getSystem(St);n?.setParent(e,this.entity);}return this}build(){return this.entity}spawn(){return this.scene.addEntity(this.entity),this.entity}clone(){const e=new Kn(this.scene,this.storageManager);return e.entity=this.entity,e}}class es{constructor(){this.scene=new Xn;}named(e){return this.scene.name=e,this}withEntity(e){return this.scene.addEntity(e),this}withEntityBuilder(e){const t=e(new Kn(this.scene,this.scene.componentStorageManager)).build();return this.scene.addEntity(t),this}withEntities(...e){for(const t of e)this.scene.addEntity(t);return this}withSystem(e){return this.scene.addSystem(e),this}withSystems(...e){for(const t of e)this.scene.addSystem(t);return this}build(){return this.scene}}class ts{constructor(e,...t){this.component=new e(...t);}set(e,t){return this.component[e]=t,this}configure(e){return e(this.component),this}setIf(e,t,n){return e&&(this.component[t]=n),this}build(){return this.component}}class ns{constructor(e){this.entities=e;}addComponent(e){for(const t of this.entities)t.addComponent(e);return this}removeComponent(e){for(const t of this.entities)t.removeComponentByType(e);return this}setActive(e){for(const t of this.entities)t.active=e;return this}setTag(e){for(const t of this.entities)t.tag=e;return this}forEach(e){return this.entities.forEach(e),this}filter(e){return new ns(this.entities.filter(e))}toArray(){return this.entities.slice()}count(){return this.entities.length}}class ss{constructor(e,t,n){this.scene=e,this.querySystem=t,this.eventSystem=n;}createEntity(){return new Kn(this.scene,this.scene.componentStorageManager)}createScene(){return new es}createComponent(e,...t){return new ts(e,...t)}query(){return new fn(this.querySystem)}find(...e){return this.querySystem.queryAll(...e).entities}findFirst(...e){const t=this.querySystem.queryAll(...e);return t.entities.length>0?t.entities[0]:null}findByName(e){return this.scene.findEntity(e)}findByTag(e){return this.scene.findEntitiesByTag(e)}emit(e,t){this.eventSystem.emitSync(e,t);}async emitAsync(e,t){await this.eventSystem.emit(e,t);}on(e,t){return this.eventSystem.on(e,t)}once(e,t){return this.eventSystem.once(e,t)}off(e,t){this.eventSystem.off(e,t);}batch(e){return new ns(e)}getStats(){return {entityCount:this.scene.entities.count,systemCount:this.scene.systems.length,componentStats:this.scene.componentStorageManager.getAllStats(),queryStats:this.querySystem.getStats(),eventStats:this.eventSystem.getStats()}}}function is(e,t,n){return new ss(e,t,n)}const rs=$("World"),os={name:"World",debug:false,maxScenes:10,autoCleanup:true,cleanupThresholdMs:3e5};class as{constructor(e={}){this._scenes=new Map,this._activeScenes=new Set,this._globalSystems=[],this._isActive=false,this._config={...os,...e},this.name=this._config.name,this._createdAt=Date.now(),this._services=new Un;}get services(){return this._services}get isActive(){return this._isActive}get sceneCount(){return this._scenes.size}get createdAt(){return this._createdAt}createScene(e,t){this.validateSceneName(e);const n=t??new Xn;if(this._config.debug){const e=new _;e.enable(),n.services.registerInstance(_,e);}return n.id=e,n.name||(n.name=e),this._scenes.set(e,n),n.initialize(),n}removeScene(e){const t=this._scenes.get(e);return !!t&&(this._activeScenes.has(e)&&this.setSceneActive(e,false),t.end(),this._scenes.delete(e),rs.info(`从World '${this.name}' 中移除Scene: ${e}`),true)}removeAllScenes(){this._scenes.forEach((e,t)=>this.removeScene(t)),rs.info(`从World '${this.name}' 中移除所有Scene`);}getScene(e){return this._scenes.get(e)??null}getSceneIds(){return Array.from(this._scenes.keys())}getAllScenes(){return Array.from(this._scenes.values())}setSceneActive(e,t){const n=this._scenes.get(e);n?t?(this._activeScenes.add(e),n.begin?.(),rs.debug(`在World '${this.name}' 中激活Scene: ${e}`)):(this._activeScenes.delete(e),rs.debug(`在World '${this.name}' 中停用Scene: ${e}`)):rs.warn(`Scene '${e}' 不存在于World '${this.name}' 中`);}isSceneActive(e){return this._activeScenes.has(e)}getActiveSceneCount(){return this._activeScenes.size}addGlobalSystem(e){return this._globalSystems.includes(e)||(this._globalSystems.push(e),e.initialize?.(),rs.debug(`在World '${this.name}' 中添加全局System: ${e.name}`)),e}removeGlobalSystem(e){const t=this._globalSystems.indexOf(e);return  -1!==t&&(this._globalSystems.splice(t,1),e.reset?.(),rs.debug(`从World '${this.name}' 中移除全局System: ${e.name}`),true)}getGlobalSystem(e){return this._globalSystems.find(t=>t instanceof e)??null}start(){this._isActive||(this._isActive=true,this._globalSystems.forEach(e=>e.initialize?.()),rs.info(`启动World: ${this.name}`));}stop(){this._isActive&&(this._activeScenes.forEach(e=>this.setSceneActive(e,false)),this._globalSystems.forEach(e=>e.reset?.()),this._isActive=false,rs.info(`停止World: ${this.name}`));}destroy(){rs.info(`销毁World: ${this.name}`),this.stop(),this.removeAllScenes(),this._globalSystems.forEach(e=>e.destroy?.()??e.reset?.()),this._globalSystems.length=0,this._services.clear(),this._scenes.clear(),this._activeScenes.clear();}updateGlobalSystems(){this._isActive&&this._globalSystems.forEach(e=>e.update?.());}updateScenes(){this._isActive&&(this._activeScenes.forEach(e=>{this._scenes.get(e)?.update?.();}),this._config.autoCleanup&&this.cleanup());}getStatus(){const e=[];return this._scenes.forEach((t,n)=>{e.push({id:n,name:t.name||n,isActive:this._activeScenes.has(n)});}),{name:this.name,isActive:this._isActive,sceneCount:this._scenes.size,activeSceneCount:this._activeScenes.size,globalSystemCount:this._globalSystems.length,createdAt:this._createdAt,config:{...this._config},scenes:e}}getStats(){let e=0,t=this._globalSystems.length;return this._scenes.forEach(n=>{e+=n.entities?.count??0,t+=n.systems?.length??0;}),{totalEntities:e,totalSystems:t,memoryUsage:0,performance:{averageUpdateTime:0,maxUpdateTime:0}}}validateSceneName(e){if(!e?.trim())throw new Error("Scene name不能为空");if(this._scenes.has(e))throw new Error(`Scene name '${e}' 已存在于World '${this.name}' 中`);if(this._scenes.size>=this._config.maxScenes)throw new Error(`World '${this.name}' 已达到最大Scene数量限制: ${this._config.maxScenes}`)}isCleanupCandidate(e,t){const n=Date.now()-this._createdAt;return !this._activeScenes.has(e)&&null!=t.entities&&0===t.entities.count&&n>this._config.cleanupThresholdMs}cleanup(){const e=[];this._scenes.forEach((t,n)=>{this.isCleanupCandidate(n,t)&&e.push(n);}),e.forEach(e=>{this.removeScene(e),rs.debug(`自动清理空Scene: ${e} from World ${this.name}`);});}}class cs{constructor(e){this._nextScene=null,this._ecsAPI=null,this._logger=$("SceneManager"),this._performanceMonitor=null,this._pendingPersistentEntities=[],this._defaultWorld=new as({name:"__default__"}),this._defaultWorld.start(),this._performanceMonitor=e||null;}setSceneChangedCallback(e){this._onSceneChangedCallback=e;}setScene(e){const t=this.currentScene;return t&&t instanceof Xn&&(this._pendingPersistentEntities=t.extractPersistentEntities(),this._pendingPersistentEntities.length>0&&this._logger.debug(`Extracted ${this._pendingPersistentEntities.length} persistent entities for migration`)),this._defaultWorld.removeAllScenes(),this._performanceMonitor&&e.services.registerInstance(_,this._performanceMonitor),this._defaultWorld.createScene(cs.DEFAULT_SCENE_ID,e),this._defaultWorld.setSceneActive(cs.DEFAULT_SCENE_ID,true),this._pendingPersistentEntities.length>0&&e instanceof Xn&&(e.receiveMigratedEntities(this._pendingPersistentEntities),this._logger.debug(`Migrated ${this._pendingPersistentEntities.length} persistent entities to new scene`),this._pendingPersistentEntities=[]),e.querySystem&&e.eventSystem?this._ecsAPI=is(e,e.querySystem,e.eventSystem):this._ecsAPI=null,n$1.sceneChanged(),this._onSceneChangedCallback&&this._onSceneChangedCallback(),this._logger.info(`Scene changed to: ${e.name}`),e}loadScene(e){this._nextScene=e,this._logger.info(`Scheduled scene load: ${e.name}`);}get currentScene(){return this._defaultWorld.getScene(cs.DEFAULT_SCENE_ID)}get api(){return this._ecsAPI}update(){this._nextScene&&(this.setScene(this._nextScene),this._nextScene=null),this._defaultWorld.updateGlobalSystems(),this._defaultWorld.updateScenes();}destroy(){this._logger.info("SceneManager destroying"),this._defaultWorld.destroy(),this._nextScene=null,this._ecsAPI=null,this._logger.info("SceneManager destroyed");}get hasScene(){return null!==this._defaultWorld.getScene(cs.DEFAULT_SCENE_ID)}get hasPendingScene(){return null!==this._nextScene}dispose(){this.destroy();}}cs.DEFAULT_SCENE_ID="__main__";let hs=class{constructor(){this._config={enabled:false,websocketUrl:"",debugFrameRate:30,autoReconnect:true,channels:{entities:true,systems:true,performance:true,components:true,scenes:true}};}setConfig(e){this._config=e;}getConfig(){return this._config}isEnabled(){return this._config.enabled}dispose(){}};hs=e$1([o$1(),t$1("design:paramtypes",[])],hs);let ls=class{constructor(){this.frameCounter=0,this.lastSendTime=0,this.sendInterval=0,this.isRunning=false,this.originalConsole={log:console.log.bind(console),debug:console.debug.bind(console),info:console.info.bind(console),warn:console.warn.bind(console),error:console.error.bind(console)};}onInitialize(){this.config=this.configService.getConfig(),this.entityCollector=new Ct,this.systemCollector=new vt,this.performanceCollector=new Et,this.componentCollector=new wt,this.sceneCollector=new It,this.advancedProfilerCollector=new xt,Dt.setEnabled(true),this.webSocketManager=new Mt(this.config.websocketUrl,false!==this.config.autoReconnect),this.webSocketManager.setMessageHandler(this.handleMessage.bind(this));const e=this.config.debugFrameRate||30;this.sendInterval=1e3/e,this.interceptConsole(),this.start();}start(){this.isRunning||(this.isRunning=true,this.connectWebSocket());}stop(){this.isRunning&&(this.isRunning=false,this.webSocketManager.disconnect());}interceptConsole(){console.log=(...e)=>{this.sendLog("info",this.formatLogMessage(e)),this.originalConsole.log(...e);},console.debug=(...e)=>{this.sendLog("debug",this.formatLogMessage(e)),this.originalConsole.debug(...e);},console.info=(...e)=>{this.sendLog("info",this.formatLogMessage(e)),this.originalConsole.info(...e);},console.warn=(...e)=>{this.sendLog("warn",this.formatLogMessage(e)),this.originalConsole.warn(...e);},console.error=(...e)=>{this.sendLog("error",this.formatLogMessage(e)),this.originalConsole.error(...e);};}formatLogMessage(e){return e.map(e=>{if("string"==typeof e)return e;if(e instanceof Error)return `${e.name}: ${e.message}`;if(null===e)return "null";if(void 0===e)return "undefined";if("object"==typeof e)try{return this.safeStringify(e,6)}catch{return Object.prototype.toString.call(e)}return String(e)}).join(" ")}safeStringify(e,t=6){const n=new WeakSet,s=(e,i)=>{if(null===e)return null;if(void 0===e)return;if("object"!=typeof e)return e;if(i>=t)return "[Max Depth Reached]";if(n.has(e))return "[Circular]";if(n.add(e),Array.isArray(e)){const t=e.map(e=>s(e,i+1));return n.delete(e),t}const r={};for(const t in e)Object.prototype.hasOwnProperty.call(e,t)&&(r[t]=s(e[t],i+1));return n.delete(e),r};return JSON.stringify(s(e,0))}sendLog(e,t){if(this.webSocketManager.getConnectionStatus())try{this.webSocketManager.send({type:"log",data:{level:e,message:t,timestamp:(new Date).toISOString()}});}catch(e){}}updateConfig(e){this.config=e;const t=e.debugFrameRate||30;this.sendInterval=1e3/t,this.webSocketManager&&e.websocketUrl&&(this.webSocketManager.disconnect(),this.webSocketManager=new Mt(e.websocketUrl,false!==e.autoReconnect),this.webSocketManager.setMessageHandler(this.handleMessage.bind(this)),this.connectWebSocket());}update(e){if(!this.isRunning||!this.config.enabled)return;this.frameCounter++;const t=Date.now();t-this.lastSendTime>=this.sendInterval&&(this.sendDebugData(),this.lastSendTime=t);}onSceneChanged(){this.isRunning&&this.config.enabled&&this.sendDebugData();}handleMessage(e){try{switch(e.type){case "capture_memory_snapshot":this.handleMemorySnapshotRequest();break;case "config_update":e.config&&this.updateConfig({...this.config,...e.config});break;case "expand_lazy_object":this.handleExpandLazyObjectRequest(e);break;case "get_component_properties":this.handleGetComponentPropertiesRequest(e);break;case "get_raw_entity_list":this.handleGetRawEntityListRequest(e);break;case "get_entity_details":this.handleGetEntityDetailsRequest(e);break;case "get_advanced_profiler_data":this.handleGetAdvancedProfilerDataRequest(e);break;case "set_profiler_selected_function":this.handleSetProfilerSelectedFunction(e);break;case "ping":this.webSocketManager.send({type:"pong",timestamp:Date.now()});}}catch(t){e.requestId&&this.webSocketManager.send({type:"error_response",requestId:e.requestId,error:t instanceof Error?t.message:String(t)});}}handleExpandLazyObjectRequest(e){try{const{entityId:t,componentIndex:n,propertyPath:s,requestId:i}=e;if(void 0===t||void 0===n||!s)return void this.webSocketManager.send({type:"expand_lazy_object_response",requestId:i,error:"缺少必要参数"});const r=this.sceneManager.currentScene,o=this.entityCollector.expandLazyObject(t,n,s,r);this.webSocketManager.send({type:"expand_lazy_object_response",requestId:i,data:o});}catch(t){this.webSocketManager.send({type:"expand_lazy_object_response",requestId:e.requestId,error:t instanceof Error?t.message:String(t)});}}handleGetComponentPropertiesRequest(e){try{const{entityId:t,componentIndex:n,requestId:s}=e;if(void 0===t||void 0===n)return void this.webSocketManager.send({type:"get_component_properties_response",requestId:s,error:"缺少必要参数"});const i=this.sceneManager.currentScene,r=this.entityCollector.getComponentProperties(t,n,i);this.webSocketManager.send({type:"get_component_properties_response",requestId:s,data:r});}catch(t){this.webSocketManager.send({type:"get_component_properties_response",requestId:e.requestId,error:t instanceof Error?t.message:String(t)});}}handleGetRawEntityListRequest(e){try{const{requestId:t}=e,n=this.sceneManager.currentScene,s=this.entityCollector.getRawEntityList(n);this.webSocketManager.send({type:"get_raw_entity_list_response",requestId:t,data:s});}catch(t){this.webSocketManager.send({type:"get_raw_entity_list_response",requestId:e.requestId,error:t instanceof Error?t.message:String(t)});}}handleGetEntityDetailsRequest(e){try{const{entityId:t,requestId:n}=e;if(void 0===t)return void this.webSocketManager.send({type:"get_entity_details_response",requestId:n,error:"缺少实体ID参数"});const s=this.sceneManager.currentScene,i=this.entityCollector.getEntityDetails(t,s);this.webSocketManager.send({type:"get_entity_details_response",requestId:n,data:i});}catch(t){this.webSocketManager.send({type:"get_entity_details_response",requestId:e.requestId,error:t instanceof Error?t.message:String(t)});}}handleGetAdvancedProfilerDataRequest(e){try{const{requestId:t}=e,n=Dt.isEnabled()?this.advancedProfilerCollector.collectAdvancedData(this.performanceMonitor):this.advancedProfilerCollector.collectFromLegacyMonitor(this.performanceMonitor);this.webSocketManager.send({type:"get_advanced_profiler_data_response",requestId:t,data:n});}catch(t){this.webSocketManager.send({type:"get_advanced_profiler_data_response",requestId:e.requestId,error:t instanceof Error?t.message:String(t)});}}handleSetProfilerSelectedFunction(e){try{const{functionName:t,requestId:n}=e;this.advancedProfilerCollector.setSelectedFunction(t||null),this.sendDebugData(),this.webSocketManager.send({type:"set_profiler_selected_function_response",requestId:n,success:!0});}catch(t){this.webSocketManager.send({type:"set_profiler_selected_function_response",requestId:e.requestId,error:t instanceof Error?t.message:String(t)});}}handleMemorySnapshotRequest(){try{const e=this.captureMemorySnapshot();this.webSocketManager.send({type:"memory_snapshot_response",data:e});}catch(e){this.webSocketManager.send({type:"memory_snapshot_error",error:e instanceof Error?e.message:"内存快照捕获失败"});}}captureMemorySnapshot(){const e=Date.now(),t=this.collectBaseMemoryInfo(),n=this.sceneManager.currentScene,s=this.entityCollector.collectEntityDataWithMemory(n),i=n?.entities?this.collectComponentMemoryStats(n.entities):{totalMemory:0,componentTypes:0,totalInstances:0,breakdown:[]},r=this.collectSystemMemoryStats(),o=this.collectPoolMemoryStats(),a=this.collectPerformanceStats(),c=s.entitiesPerArchetype.reduce((e,t)=>e+t.memory,0);return {timestamp:e,version:"2.0",summary:{totalEntities:s.totalEntities,totalMemoryUsage:t.usedMemory,totalMemoryLimit:t.totalMemory,memoryUtilization:t.usedMemory/t.totalMemory*100,gcCollections:t.gcCollections,entityMemory:c,componentMemory:i.totalMemory,systemMemory:r.totalMemory,poolMemory:o.totalMemory},baseMemory:t,entities:{totalMemory:c,entityCount:s.totalEntities,archetypes:s.entitiesPerArchetype,largestEntities:s.topEntitiesByComponents},components:i,systems:r,pools:o,performance:a}}collectBaseMemoryInfo(){const e={totalMemory:0,usedMemory:0,freeMemory:0,gcCollections:0,heapInfo:null,detailedMemory:void 0};try{const t=performance;if(t.memory){const n=t.memory;e.totalMemory=n.jsHeapSizeLimit||536870912,e.usedMemory=n.usedJSHeapSize||0,e.freeMemory=e.totalMemory-e.usedMemory,e.heapInfo={totalJSHeapSize:n.totalJSHeapSize||0,usedJSHeapSize:n.usedJSHeapSize||0,jsHeapSizeLimit:n.jsHeapSizeLimit||0};}else e.totalMemory=536870912,e.freeMemory=536870912;t.measureUserAgentSpecificMemory&&t.measureUserAgentSpecificMemory().then(t=>{e.detailedMemory=t;}).catch(()=>{});}catch(e){}return e}collectComponentMemoryStats(e){const t=new Map;let n=0;const s=new Map;for(const t of e.buffer)if(t&&!t.destroyed&&t.components)for(const e of t.components){const t=I(e);s.set(t,(s.get(t)||0)+1);}for(const[i,r]of s.entries()){const s=this.componentCollector.calculateDetailedComponentMemory(i),o=s*r;n+=o;const a=[];let c=0;for(const t of e.buffer)if(t&&!t.destroyed&&t.components){for(const e of t.components)if(I(e)===i&&(a.push({entityId:t.id,entityName:t.name||`Entity_${t.id}`,memory:s}),c++,c>=100))break;if(c>=100)break}t.set(i,{count:r,totalMemory:o,instances:a.slice(0,10)});}const i=Array.from(t.entries()).map(([e,t])=>({typeName:e,instanceCount:t.count,totalMemory:t.totalMemory,averageMemory:t.totalMemory/t.count,percentage:n>0?t.totalMemory/n*100:0,largestInstances:t.instances.sort((e,t)=>t.memory-e.memory).slice(0,3)})).sort((e,t)=>t.totalMemory-e.totalMemory);return {totalMemory:n,componentTypes:t.size,totalInstances:Array.from(t.values()).reduce((e,t)=>e+t.count,0),breakdown:i}}collectSystemMemoryStats(){const e=this.sceneManager.currentScene;let t=0;const n=[];try{const s=e?.systems;if(s){const e=new Map;for(const i of s){const s=se(i);let r;e.has(s)?r=e.get(s):(r=this.calculateQuickSystemSize(i),e.set(s,r)),t+=r,n.push({name:s,memory:r,enabled:!1!==i.enabled,updateOrder:i.updateOrder||0});}}}catch(e){}return {totalMemory:t,systemCount:n.length,breakdown:n.sort((e,t)=>t.memory-e.memory)}}calculateQuickSystemSize(e){if(!e||"object"!=typeof e)return 64;let t=128;try{const n=Object.keys(e);for(let s=0;s<Math.min(n.length,15);s++){const i=n[s];if(!i||"entities"===i||"scene"===i||"constructor"===i)continue;const r=e[i];t+=2*i.length,"string"==typeof r?t+=Math.min(2*r.length,100):"number"==typeof r?t+=8:"boolean"==typeof r?t+=4:Array.isArray(r)?t+=40+Math.min(8*r.length,200):"object"==typeof r&&null!==r&&(t+=64);}}catch(e){return 128}return Math.max(t,64)}collectPoolMemoryStats(){let e=0;const t=[];try{const n=Tt.getInstance().getPoolStats();for(const[s,i]of n.entries()){const n=i,r=32*n.maxSize;e+=r,t.push({typeName:s,maxSize:n.maxSize,currentSize:n.currentSize||0,estimatedMemory:r,utilization:n.currentSize?n.currentSize/n.maxSize*100:0});}}catch(e){}try{const n=S.getAllPoolStats();for(const[s,i]of Object.entries(n)){const n=i;e+=n.estimatedMemoryUsage,t.push({typeName:`Pool_${s}`,maxSize:n.maxSize,currentSize:n.size,estimatedMemory:n.estimatedMemoryUsage,utilization:n.size/n.maxSize*100,hitRate:100*n.hitRate});}}catch(e){}return {totalMemory:e,poolCount:t.length,breakdown:t.sort((e,t)=>t.estimatedMemory-e.estimatedMemory)}}collectPerformanceStats(){try{if(!this.performanceMonitor)return {enabled:!1};const e=this.performanceMonitor.getAllSystemStats(),t=this.performanceMonitor.getPerformanceWarnings();return {enabled:this.performanceMonitor.enabled??!1,systemCount:e.size,warnings:t.slice(0,10),topSystems:Array.from(e.entries()).map(e=>{const[t,n]=e;return {name:t,averageTime:n.averageTime,maxTime:n.maxTime,samples:n.executionCount}}).sort((e,t)=>t.averageTime-e.averageTime).slice(0,5)}}catch(e){return {enabled:false,error:e instanceof Error?e.message:String(e)}}}getDebugData(){const e=Date.now(),t=this.sceneManager.currentScene,n={timestamp:e,frameworkVersion:"1.0.0",isRunning:this.isRunning,frameworkLoaded:true,currentScene:t?.name||"Unknown"};return this.config.channels.entities&&(n.entities=this.entityCollector.collectEntityData(t)),this.config.channels.systems&&(n.systems=this.systemCollector.collectSystemData(this.performanceMonitor,t)),this.config.channels.performance&&(n.performance=this.performanceCollector.collectPerformanceData(this.performanceMonitor)),this.config.channels.components&&(n.components=this.componentCollector.collectComponentData(t)),this.config.channels.scenes&&(n.scenes=this.sceneCollector.collectSceneData(t)),n}async connectWebSocket(){try{await this.webSocketManager.connect();}catch(e){}}sendDebugData(){if(this.webSocketManager.getConnectionStatus())try{const e=this.getDebugData(),t=Dt.isEnabled(),n={type:"debug_data",data:e,advancedProfiler:t?this.advancedProfilerCollector.collectAdvancedData(this.performanceMonitor):null};this.webSocketManager.send(n);}catch(e){}}dispose(){this.stop(),console.log=this.originalConsole.log,console.debug=this.originalConsole.debug,console.info=this.originalConsole.info,console.warn=this.originalConsole.warn,console.error=this.originalConsole.error;}};var ds;e$1([c$1(cs),t$1("design:type",cs)],ls.prototype,"sceneManager",void 0),e$1([c$1(_),t$1("design:type",_)],ls.prototype,"performanceMonitor",void 0),e$1([c$1(hs),t$1("design:type",hs)],ls.prototype,"configService",void 0),ls=e$1([o$1(),a$1()],ls),function(e){e.NotInstalled="not_installed",e.Installed="installed",e.Failed="failed";}(ds||(ds={}));const us=$("PluginManager");class ms{constructor(){this._plugins=new Map,this._metadata=new Map,this._core=null,this._services=null;}initialize(e,t){this._core=e,this._services=t,us.info("PluginManager initialized");}async install(e){if(!this._core||!this._services)throw new Error("PluginManager not initialized. Call initialize() first.");if(this._plugins.has(e.name))return void us.warn(`Plugin ${e.name} is already installed`);e.dependencies&&e.dependencies.length>0&&this._checkDependencies(e);const t={name:e.name,version:e.version,state:ds.NotInstalled,installedAt:Date.now()};this._metadata.set(e.name,t);try{us.info(`Installing plugin: ${e.name} v${e.version}`),await e.install(this._core,this._services),this._plugins.set(e.name,e),t.state=ds.Installed,us.info(`Plugin ${e.name} installed successfully`);}catch(n){throw t.state=ds.Failed,t.error=n instanceof Error?n.message:String(n),us.error(`Failed to install plugin ${e.name}:`,n),n}}async uninstall(e){const t=this._plugins.get(e);if(!t)throw new Error(`Plugin ${e} is not installed`);this._checkDependents(e);try{us.info(`Uninstalling plugin: ${e}`),await t.uninstall(),this._plugins.delete(e),this._metadata.delete(e),us.info(`Plugin ${e} uninstalled successfully`);}catch(t){throw us.error(`Failed to uninstall plugin ${e}:`,t),t}}getPlugin(e){return this._plugins.get(e)}getMetadata(e){return this._metadata.get(e)}getAllPlugins(){return Array.from(this._plugins.values())}getAllMetadata(){return Array.from(this._metadata.values())}isInstalled(e){return this._plugins.has(e)}_checkDependencies(e){if(!e.dependencies)return;const t=[];for(const n of e.dependencies)this._plugins.has(n)||t.push(n);if(t.length>0)throw new Error(`Plugin ${e.name} has unmet dependencies: ${t.join(", ")}`)}_checkDependents(e){const t=[];for(const n of this._plugins.values())n.dependencies&&n.dependencies.includes(e)&&t.push(n.name);if(t.length>0)throw new Error(`Cannot uninstall plugin ${e}: it is required by ${t.join(", ")}`)}dispose(){const e=Array.from(this._plugins.values()).reverse();for(const t of e)try{us.info(`Disposing plugin: ${t.name}`),t.uninstall();}catch(e){us.error(`Error disposing plugin ${t.name}:`,e);}this._plugins.clear(),this._metadata.clear(),this._core=null,this._services=null,us.info("PluginManager disposed");}}class fs{constructor(){this._services=new Map;}register(e,t){this._services.set(e.id,t);}get(e){return this._services.get(e.id)}require(e){const t=this._services.get(e.id);if(void 0===t)throw new Error(`Service not found: ${e.name}`);return t}has(e){return this._services.has(e.id)}unregister(e){return this._services.delete(e.id)}clear(){this._services.clear();}dispose(){this.clear();}}const gs=$("WorldManager"),ys={maxWorlds:50,autoCleanup:true,cleanupFrameInterval:1800,debug:false};class _s{constructor(e={}){this._worlds=new Map,this._isRunning=true,this._framesSinceCleanup=0,this._config={...ys,...e},gs.info("WorldManager已初始化",{maxWorlds:this._config.maxWorlds,autoCleanup:this._config.autoCleanup,cleanupFrameInterval:this._config.cleanupFrameInterval});}get worldCount(){return this._worlds.size}get activeWorldCount(){let e=0;return this._worlds.forEach(t=>{t.isActive&&e++;}),e}get isRunning(){return this._isRunning}get config(){return {...this._config}}createWorld(e,t){this.validateWorldName(e);const n={...t,name:e,debug:t?.debug??this._config.debug},s=new as(n);return this._worlds.set(e,s),s}removeWorld(e){const t=this._worlds.get(e);return !!t&&(t.destroy(),this._worlds.delete(e),gs.info(`移除World: ${e}`),true)}getWorld(e){return this._worlds.get(e)??null}getWorldIds(){return Array.from(this._worlds.keys())}getAllWorlds(){return Array.from(this._worlds.values())}setWorldActive(e,t){const n=this._worlds.get(e);n?t?(n.start(),gs.debug(`激活World: ${e}`)):(n.stop(),gs.debug(`停用World: ${e}`)):gs.warn(`World '${e}' 不存在`);}isWorldActive(e){return this._worlds.get(e)?.isActive??false}getActiveWorlds(){const e=[];return this._worlds.forEach(t=>{t.isActive&&e.push(t);}),e}findWorlds(e){const t=[];return this._worlds.forEach(n=>{e(n)&&t.push(n);}),t}findWorldByName(e){let t=null;return this._worlds.forEach(n=>{n.name===e&&(t=n);}),t}startAll(){this._isRunning=true,this._worlds.forEach(e=>e.start()),gs.info("启动所有World");}stopAll(){this._isRunning=false,this._worlds.forEach(e=>e.stop()),gs.info("停止所有World");}destroy(){gs.info("正在销毁WorldManager..."),this.stopAll();Array.from(this._worlds.keys()).forEach(e=>this.removeWorld(e)),this._worlds.clear(),this._isRunning=false,gs.info("WorldManager已销毁");}dispose(){this.destroy();}updateAll(){this._isRunning&&(this._worlds.forEach(e=>{e.isActive&&(e.updateGlobalSystems(),e.updateScenes());}),this.processAutoCleanup());}getStats(){let e=0,t=0,n=0;const s=[];return this._worlds.forEach((i,r)=>{const o=i.getStats();e+=i.sceneCount,t+=o.totalEntities,n+=o.totalSystems,s.push({id:r,name:i.name,isActive:i.isActive,sceneCount:i.sceneCount,...o});}),{totalWorlds:this._worlds.size,activeWorlds:this.activeWorldCount,totalScenes:e,totalEntities:t,totalSystems:n,memoryUsage:0,isRunning:this._isRunning,config:{...this._config},worlds:s}}getDetailedStatus(){const e=[];return this._worlds.forEach((t,n)=>{e.push({id:n,isActive:t.isActive,status:t.getStatus()});}),{...this.getStats(),worlds:e}}cleanup(){const e=[];return this._worlds.forEach((t,n)=>{this.isCleanupCandidate(t)&&e.push(n);}),e.forEach(e=>this.removeWorld(e)),e.length>0&&gs.debug(`清理了 ${e.length} 个World`),e.length}validateWorldName(e){if(!e?.trim())throw new Error("World name不能为空");if(this._worlds.has(e))throw new Error(`World name '${e}' 已存在`);if(this._worlds.size>=this._config.maxWorlds)throw new Error(`已达到最大World数量限制: ${this._config.maxWorlds}`)}processAutoCleanup(){this._config.autoCleanup&&(this._framesSinceCleanup++,this._framesSinceCleanup>=this._config.cleanupFrameInterval&&(this.cleanup(),this._framesSinceCleanup=0,this._config.debug&&gs.debug(`执行定期清理World (间隔: ${this._config.cleanupFrameInterval} 帧)`)));}isCleanupCandidate(e){if(e.isActive)return  false;if(Date.now()-e.createdAt<=6e5)return  false;if(0===e.sceneCount)return  true;return !e.getAllScenes().some(e=>e.entities&&e.entities.count>0)}}class Ss{static get runtimeEnvironment(){return yn.runtimeEnvironment}static set runtimeEnvironment(e){yn.runtimeEnvironment=e;}static get isServer(){return yn.isServer}static get isClient(){return yn.isClient}constructor(e={}){if(Ss._instance=this,this._config={debug:true,...e},this._serviceContainer=new Un,e.runtimeEnvironment&&(Ss.runtimeEnvironment=e.runtimeEnvironment),this._timerManager=new exports.TimerManager,this._serviceContainer.registerInstance(exports.TimerManager,this._timerManager),this._performanceMonitor=new _,this._serviceContainer.registerInstance(_,this._performanceMonitor),this._config.debug&&this._performanceMonitor.enable(),this._poolManager=new C,this._serviceContainer.registerInstance(C,this._poolManager),this._sceneManager=new cs(this._performanceMonitor),this._serviceContainer.registerInstance(cs,this._sceneManager),this._sceneManager.setSceneChangedCallback(()=>this._debugManager?.onSceneChanged()),this._worldManager=new _s({debug:!!this._config.debug,...this._config.worldManagerConfig}),this._serviceContainer.registerInstance(_s,this._worldManager),this._pluginManager=new ms,this._pluginManager.initialize(this,this._serviceContainer),this._serviceContainer.registerInstance(ms,this._pluginManager),this._pluginServiceRegistry=new fs,this._serviceContainer.registerInstance(fs,this._pluginServiceRegistry),this.debug=this._config.debug??true,this._config.debugConfig?.enabled){const e=new hs;e.setConfig(this._config.debugConfig),this._serviceContainer.registerInstance(hs,e),this._serviceContainer.registerSingleton(ls,e=>d(ls,e)),this._debugManager=this._serviceContainer.resolve(ls),this._debugManager.onInitialize();}this.initialize();}static get Instance(){return this._instance}static get services(){if(!this._instance)throw new Error("Core instance not created, call Core.create() first | Core实例未创建，请先调用Core.create()");return this._instance._serviceContainer}static get pluginServices(){if(!this._instance)throw new Error("Core instance not created, call Core.create() first | Core实例未创建，请先调用Core.create()");return this._instance._pluginServiceRegistry}static get worldManager(){if(!this._instance)throw new Error("Core instance not created, call Core.create() first | Core实例未创建，请先调用Core.create()");return this._instance._worldManager}static create(e=true){if(null==this._instance){const t="boolean"==typeof e?{debug:e}:e;this._instance=new Ss(t);}else this._logger.warn("Core实例已创建，返回现有实例");return this._instance}static setScene(e){if(!this._instance)throw Ss._logger.warn("Core实例未创建，请先调用Core.create()"),new Error("Core实例未创建");return this._instance._sceneManager.setScene(e)}static get scene(){return this._instance?this._instance._sceneManager.currentScene:null}static get ecsAPI(){return this._instance?this._instance._sceneManager.api:null}static loadScene(e){this._instance?this._instance._sceneManager.loadScene(e):Ss._logger.warn("Core实例未创建，请先调用Core.create()");}static update(e){this._instance?this._instance.updateInternal(e):Ss._logger.warn("Core实例未创建，请先调用Core.create()");}static schedule(e,t=false,n,s){if(!this._instance)throw new Error("Core实例未创建，请先调用Core.create()");if(!s)throw new Error("onTime callback is required");return this._instance._timerManager.schedule(e,t,n,s)}static enableDebug(e){if(this._instance){if(this._instance._debugManager)this._instance._debugManager.updateConfig(e);else {const t=new hs;t.setConfig(e),this._instance._serviceContainer.registerInstance(hs,t),this._instance._serviceContainer.registerSingleton(ls,e=>d(ls,e)),this._instance._debugManager=this._instance._serviceContainer.resolve(ls),this._instance._debugManager.onInitialize();}this._instance._config.debugConfig=e;}else Ss._logger.warn("Core实例未创建，请先调用Core.create()");}static disableDebug(){this._instance&&(this._instance._debugManager&&(this._instance._debugManager.stop(),delete this._instance._debugManager),this._instance._config.debugConfig&&(this._instance._config.debugConfig.enabled=false));}static getDebugData(){return this._instance?._debugManager?this._instance._debugManager.getDebugData():null}static get isDebugEnabled(){return this._instance?._config.debugConfig?.enabled||false}static get performanceMonitor(){return this._instance?._performanceMonitor||null}static async installPlugin(e){if(!this._instance)throw new Error("Core实例未创建，请先调用Core.create()");await this._instance._pluginManager.install(e);}static async uninstallPlugin(e){if(!this._instance)throw new Error("Core实例未创建，请先调用Core.create()");await this._instance._pluginManager.uninstall(e);}static getPlugin(e){if(this._instance)return this._instance._pluginManager.getPlugin(e)}static isPluginInstalled(e){return !!this._instance&&this._instance._pluginManager.isInstalled(e)}initialize(){Ss._logger.info("Core initialized",{debug:this.debug,debugEnabled:this._config.debugConfig?.enabled||false});}updateInternal(e){if(Ss.paused)return;const t=this._performanceMonitor.startMonitoring("Core.update");n$1.update(e),this._performanceMonitor.updateFPS?.(n$1.deltaTime);const s=this._performanceMonitor.startMonitoring("Services.update");this._serviceContainer.updateAll(e),this._performanceMonitor.endMonitoring("Services.update",s,this._serviceContainer.getUpdatableCount()),this._poolManager.update(),this._sceneManager.update(),this._worldManager.updateAll(),this._performanceMonitor.endMonitoring("Core.update",t);}static destroy(){this._instance&&(this._instance._debugManager?.stop(),this._instance._sceneManager.destroy(),this._instance._serviceContainer.clear(),Ss._logger.info("Core destroyed"),this._instance=null);}}Ss.paused=false,Ss._instance=null,Ss._logger=$("Core");$("RuntimeModeService");const Ts=$("DebugPlugin");let ws=class{constructor(e){this.name="@esengine/debug-plugin",this.version="1.0.0",this.worldManager=null,this.updateTimer=null,this.autoStart=e?.autoStart??false,this.updateInterval=e?.updateInterval??1e3;}async install(e,t){this.worldManager=t.resolve(_s),Ts.info("ECS Debug Plugin installed"),this.autoStart&&this.start();}async uninstall(){this.stop(),this.worldManager=null,Ts.info("ECS Debug Plugin uninstalled");}dispose(){this.stop(),this.worldManager=null;}start(){this.updateTimer?Ts.warn("Debug monitoring already started"):(Ts.info("Starting debug monitoring"),this.updateTimer=setInterval(()=>{this.logStats();},this.updateInterval));}stop(){this.updateTimer&&(clearInterval(this.updateTimer),this.updateTimer=null,Ts.info("Debug monitoring stopped"));}getStats(){if(!this.worldManager)throw new Error("Plugin not installed");const e=[];let t=0,n=0;const s=this.worldManager.getAllWorlds();for(const i of s)for(const s of i.getAllScenes()){const i=this.getSceneInfo(s);e.push(i),t+=i.entityCount,n+=i.systems.length;}return {scenes:e,totalEntities:t,totalSystems:n,timestamp:Date.now()}}getSceneInfo(e){const t=e.entities.buffer,n=e.systems;return {name:e.name,entityCount:t.length,systems:n.map(e=>this.getSystemInfo(e)),entities:t.map(e=>this.getEntityInfo(e))}}getSystemInfo(e){const t=e.getPerformanceStats(),n=t?{avgExecutionTime:t.averageTime,maxExecutionTime:t.maxTime,totalCalls:t.executionCount}:void 0;return {name:e.constructor.name,enabled:e.enabled,updateOrder:e.updateOrder,entityCount:e.entities.length,...void 0!==n&&{performance:n}}}getEntityInfo(e){const t=e.components;return {id:e.id,name:e.name,enabled:e.enabled,tag:e.tag,componentCount:t.length,components:t.map(e=>this.getComponentInfo(e))}}getComponentInfo(e){const t=e.constructor.name,n={};for(const t of Object.keys(e))if(!t.startsWith("_")){const s=e[t];"function"!=typeof s&&(n[t]=s);}return {type:t,data:n}}queryEntities(e){if(!this.worldManager)throw new Error("Plugin not installed");const t=[],n=this.worldManager.getAllWorlds();for(const s of n)for(const n of s.getAllScenes())if(!e.sceneName||n.name===e.sceneName)for(const s of n.entities.buffer)if((void 0===e.tag||s.tag===e.tag)&&(!e.name||s.name.includes(e.name))){if(e.hasComponent){if(!s.components.some(t=>t.constructor.name===e.hasComponent))continue}t.push(this.getEntityInfo(s));}return t}logStats(){const e=this.getStats();Ts.info("=== ECS Debug Stats ==="),Ts.info(`Total Entities: ${e.totalEntities}`),Ts.info(`Total Systems: ${e.totalSystems}`),Ts.info(`Scenes: ${e.scenes.length}`);for(const t of e.scenes){Ts.info(`\n[Scene: ${t.name}]`),Ts.info(`  Entities: ${t.entityCount}`),Ts.info(`  Systems: ${t.systems.length}`);for(const e of t.systems){const t=e.performance?` | Avg: ${e.performance.avgExecutionTime.toFixed(2)}ms, Max: ${e.performance.maxExecutionTime.toFixed(2)}ms`:"";Ts.info(`    - ${e.name} (${e.enabled?"enabled":"disabled"}) | Entities: ${e.entityCount}${t}`);}}Ts.info("========================\n");}exportJSON(){const e=this.getStats();return JSON.stringify(e,null,2)}};ws=e$1([o$1(),t$1("design:paramtypes",[Object])],ws);class Is{constructor(e,t){this.func=e,this.context=t;}}class Ms{constructor(){this._messageTable=new Map;}addObserver(e,t,n){let s=this._messageTable.get(e);s||(s=[],this._messageTable.set(e,s)),this.hasObserver(e,t)||s.push(new Is(t,n));}removeObserver(e,t){const n=this._messageTable.get(e);if(n){const e=n.findIndex(e=>e.func==t);-1!=e&&n.splice(e,1);}}emit(e,...t){const n=this._messageTable.get(e);if(n)for(const e of n)e.func.call(e.context,...t);}hasObserver(e,t){const n=this._messageTable.get(e);return !!n&&n.some(e=>e.func===t)}removeAllObservers(e){ void 0!==e?this._messageTable.delete(e):this._messageTable.clear();}dispose(){this._messageTable.clear();}getEventTypeCount(){return this._messageTable.size}getObserverCount(e){const t=this._messageTable.get(e);return t?t.length:0}}class As{constructor(){this._enabled=false;}get enabled(){return this._enabled}set enabled(e){this.setEnabled(e);}setEnabled(e){this._enabled!=e&&(this._enabled=e,this._enabled?this.onEnabled():this.onDisabled());}onEnabled(){}onDisabled(){}update(){}}class ks extends _t{constructor(e){super(e);}process(e){this.processSystem();}}class Ds extends _t{constructor(e){super(e);}process(e){}}class xs extends _t{constructor(e,t){super(t),this.acc=0,this.intervalRemainder=0,this.interval=e;}onCheckProcessing(){return this.acc+=n$1.deltaTime,this.acc>=this.interval&&(this.intervalRemainder=this.acc-this.interval,this.acc=0,true)}getIntervalDelta(){return this.interval+this.intervalRemainder}}let Ns=class extends Xe{constructor(e="",t="",n=false){super(),this.sourcePrefabGuid="",this.sourcePrefabPath="",this.isRoot=false,this.rootInstanceEntityId=null,this.modifiedProperties=[],this.instantiatedAt=0,this.originalValues={},this.sourcePrefabGuid=e,this.sourcePrefabPath=t,this.isRoot=n,this.instantiatedAt=Date.now();}markPropertyModified(e,t){const n=`${e}.${t}`;this.modifiedProperties.includes(n)||this.modifiedProperties.push(n);}isPropertyModified(e,t){const n=`${e}.${t}`;return this.modifiedProperties.includes(n)}clearPropertyModified(e,t){const n=`${e}.${t}`,s=this.modifiedProperties.indexOf(n);-1!==s&&this.modifiedProperties.splice(s,1);}clearAllModifications(){this.modifiedProperties=[],this.originalValues={};}storeOriginalValue(e,t,n){const s=`${e}.${t}`;s in this.originalValues||(this.originalValues[s]=this.deepClone(n));}getOriginalValue(e){return this.originalValues[e]}hasOriginalValue(e,t){return `${e}.${t}`in this.originalValues}deepClone(e){if(null==e)return e;if("object"==typeof e)try{return JSON.parse(JSON.stringify(e))}catch{return e}return e}};e$1([st(),t$1("design:type",String)],Ns.prototype,"sourcePrefabGuid",void 0),e$1([st(),t$1("design:type",String)],Ns.prototype,"sourcePrefabPath",void 0),e$1([st(),t$1("design:type",Boolean)],Ns.prototype,"isRoot",void 0),e$1([st(),t$1("design:type",Object)],Ns.prototype,"rootInstanceEntityId",void 0),e$1([st(),t$1("design:type",Array)],Ns.prototype,"modifiedProperties",void 0),e$1([st(),t$1("design:type",Number)],Ns.prototype,"instantiatedAt",void 0),e$1([st(),t$1("design:type",Object)],Ns.prototype,"originalValues",void 0),Ns=e$1([X("PrefabInstance",{editor:{hideInInspector:true}}),nt({version:1,typeId:"PrefabInstance"}),t$1("design:paramtypes",[String,String,Boolean])],Ns);$("EventBus");$("VersionMigration");"undefined"!=typeof TextEncoder?new TextEncoder:null;"undefined"!=typeof TextDecoder?new TextDecoder:null;

  class t{constructor(t=0,e=0){this.x=t,this.y=e;}get length(){return Math.sqrt(this.x*this.x+this.y*this.y)}get lengthSquared(){return this.x*this.x+this.y*this.y}get angle(){return Math.atan2(this.y,this.x)}get isZero(){return 0===this.x&&0===this.y}get isUnit(){const t=this.lengthSquared;return Math.abs(t-1)<Number.EPSILON}set(t,e){return this.x=t,this.y=e,this}copy(t){return this.x=t.x,this.y=t.y,this}clone(){return new t(this.x,this.y)}add(t){return this.x+=t.x,this.y+=t.y,this}subtract(t){return this.x-=t.x,this.y-=t.y,this}multiply(t){return this.x*=t,this.y*=t,this}divide(t){if(0===t)throw new Error("不能除以零");return this.x/=t,this.y/=t,this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}normalize(){const t=this.length;return 0===t?this:this.divide(t)}normalized(){return this.clone().normalize()}distanceTo(t){const e=this.x-t.x,r=this.y-t.y;return Math.sqrt(e*e+r*r)}distanceToSquared(t){const e=this.x-t.x,r=this.y-t.y;return e*e+r*r}angleTo(t){const e=this.dot(t),r=this.length*t.length;return 0===r?0:Math.acos(Math.max(-1,Math.min(1,e/r)))}projectOnto(e){const r=this.dot(e),a=e.lengthSquared;return 0===a?new t:e.clone().multiply(r/a)}projectOntoLength(t){const e=t.length;return 0===e?0:this.dot(t)/e}perpendicular(){return new t(this.y,-this.x)}rotate(t){const e=Math.cos(t),r=Math.sin(t),a=this.x*e+this.y*r,s=-this.x*r+this.y*e;return this.x=a,this.y=s,this}rotated(t){return this.clone().rotate(t)}rotateAround(t,e){return this.subtract(t).rotate(e).add(t)}reflect(t){const e=this.dot(t);return this.x-=2*e*t.x,this.y-=2*e*t.y,this}reflected(t){return this.clone().reflect(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}clampLength(t){return this.lengthSquared>t*t?this.normalize().multiply(t):this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this}equals(t,e=Number.EPSILON){return Math.abs(this.x-t.x)<e&&Math.abs(this.y-t.y)<e}exactEquals(t){return this.x===t.x&&this.y===t.y}static add(e,r){return new t(e.x+r.x,e.y+r.y)}static subtract(e,r){return new t(e.x-r.x,e.y-r.y)}static multiply(e,r){return new t(e.x*r,e.y*r)}static dot(t,e){return t.x*e.x+t.y*e.y}static cross(t,e){return t.x*e.y-t.y*e.x}static det(t,e){return t.x*e.y-t.y*e.x}static lengthSq(t){return t.x*t.x+t.y*t.y}static len(t){return Math.sqrt(t.x*t.x+t.y*t.y)}static normalize(e){const r=Math.sqrt(e.x*e.x+e.y*e.y);return r<Number.EPSILON?new t(0,0):new t(e.x/r,e.y/r)}static distance(t,e){const r=t.x-e.x,a=t.y-e.y;return Math.sqrt(r*r+a*a)}static distanceSq(t,e){const r=t.x-e.x,a=t.y-e.y;return r*r+a*a}static lerp(e,r,a){return new t(e.x+(r.x-e.x)*a,e.y+(r.y-e.y)*a)}static fromAngle(e){return new t(Math.cos(e),Math.sin(e))}static fromPolar(e,r){return new t(e*Math.cos(r),e*Math.sin(r))}static min(e,r){return new t(Math.min(e.x,r.x),Math.min(e.y,r.y))}static max(e,r){return new t(Math.max(e.x,r.x),Math.max(e.y,r.y))}static perpLeft(e){return new t(-e.y,e.x)}static perpRight(e){return new t(e.y,-e.x)}toString(){return `Vector2(${this.x.toFixed(3)}, ${this.y.toFixed(3)})`}toArray(){return [this.x,this.y]}toObject(){return {x:this.x,y:this.y}}}t.ZERO=new t(0,0),t.ONE=new t(1,1),t.RIGHT=new t(1,0),t.LEFT=new t(-1,0),t.UP=new t(0,1),t.DOWN=new t(0,-1);class e{constructor(t=0,e=0,r=0){this.x=t,this.y=e,this.z=r;}get length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}get lengthSquared(){return this.x*this.x+this.y*this.y+this.z*this.z}get isZero(){return 0===this.x&&0===this.y&&0===this.z}get isUnit(){const t=this.lengthSquared;return Math.abs(t-1)<Number.EPSILON}set(t,e,r){return this.x=t,this.y=e,this.z=r,this}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}clone(){return new e(this.x,this.y,this.z)}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}subtract(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}multiply(t){return this.x*=t,this.y*=t,this.z*=t,this}divide(t){if(0===t)throw new Error("不能除以零");return this.x/=t,this.y/=t,this.z/=t,this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}cross(t){return new e(this.y*t.z-this.z*t.y,this.z*t.x-this.x*t.z,this.x*t.y-this.y*t.x)}normalize(){const t=this.length;return 0===t?this:this.divide(t)}normalized(){return this.clone().normalize()}distanceTo(t){const e=this.x-t.x,r=this.y-t.y,a=this.z-t.z;return Math.sqrt(e*e+r*r+a*a)}distanceToSquared(t){const e=this.x-t.x,r=this.y-t.y,a=this.z-t.z;return e*e+r*r+a*a}angleTo(t){const e=this.dot(t),r=this.length*t.length;return 0===r?0:Math.acos(Math.max(-1,Math.min(1,e/r)))}projectOnto(t){const r=this.dot(t),a=t.lengthSquared;return 0===a?new e:t.clone().multiply(r/a)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}clampLength(t){return this.lengthSquared>t*t?this.normalize().multiply(t):this}equals(t,e=Number.EPSILON){return Math.abs(this.x-t.x)<e&&Math.abs(this.y-t.y)<e&&Math.abs(this.z-t.z)<e}exactEquals(t){return this.x===t.x&&this.y===t.y&&this.z===t.z}static add(t,r){return new e(t.x+r.x,t.y+r.y,t.z+r.z)}static subtract(t,r){return new e(t.x-r.x,t.y-r.y,t.z-r.z)}static multiply(t,r){return new e(t.x*r,t.y*r,t.z*r)}static dot(t,e){return t.x*e.x+t.y*e.y+t.z*e.z}static cross(t,r){return new e(t.y*r.z-t.z*r.y,t.z*r.x-t.x*r.z,t.x*r.y-t.y*r.x)}static distance(t,e){const r=t.x-e.x,a=t.y-e.y,s=t.z-e.z;return Math.sqrt(r*r+a*a+s*s)}static lerp(t,r,a){return new e(t.x+(r.x-t.x)*a,t.y+(r.y-t.y)*a,t.z+(r.z-t.z)*a)}toString(){return `Vector3(${this.x.toFixed(3)}, ${this.y.toFixed(3)}, ${this.z.toFixed(3)})`}toArray(){return [this.x,this.y,this.z]}toObject(){return {x:this.x,y:this.y,z:this.z}}}e.ZERO=new e(0,0,0),e.ONE=new e(1,1,1),e.RIGHT=new e(1,0,0),e.LEFT=new e(-1,0,0),e.UP=new e(0,1,0),e.DOWN=new e(0,-1,0),e.FORWARD=new e(0,0,1),e.BACK=new e(0,0,-1);class r{constructor(t){this.elements=new Float32Array(9),t?this.elements.set(t):this.identity();}get(t,e){return this.elements[3*t+e]}set(t,e,r){return this.elements[3*t+e]=r,this}get m00(){return this.elements[0]}set m00(t){this.elements[0]=t;}get m01(){return this.elements[1]}set m01(t){this.elements[1]=t;}get m02(){return this.elements[2]}set m02(t){this.elements[2]=t;}get m10(){return this.elements[3]}set m10(t){this.elements[3]=t;}get m11(){return this.elements[4]}set m11(t){this.elements[4]=t;}get m12(){return this.elements[5]}set m12(t){this.elements[5]=t;}get m20(){return this.elements[6]}set m20(t){this.elements[6]=t;}get m21(){return this.elements[7]}set m21(t){this.elements[7]=t;}get m22(){return this.elements[8]}set m22(t){this.elements[8]=t;}identity(){return this.elements.set([1,0,0,0,1,0,0,0,1]),this}zero(){return this.elements.fill(0),this}copy(t){return this.elements.set(t.elements),this}clone(){return new r(this.elements)}fromArray(t){return this.elements.set(t),this}add(t){for(let e=0;e<9;e++)this.elements[e]+=t.elements[e];return this}subtract(t){for(let e=0;e<9;e++)this.elements[e]-=t.elements[e];return this}multiplyScalar(t){for(let e=0;e<9;e++)this.elements[e]*=t;return this}multiply(t){const e=this.elements,r=t.elements,a=new Float32Array(9);return a[0]=e[0]*r[0]+e[1]*r[3]+e[2]*r[6],a[1]=e[0]*r[1]+e[1]*r[4]+e[2]*r[7],a[2]=e[0]*r[2]+e[1]*r[5]+e[2]*r[8],a[3]=e[3]*r[0]+e[4]*r[3]+e[5]*r[6],a[4]=e[3]*r[1]+e[4]*r[4]+e[5]*r[7],a[5]=e[3]*r[2]+e[4]*r[5]+e[5]*r[8],a[6]=e[6]*r[0]+e[7]*r[3]+e[8]*r[6],a[7]=e[6]*r[1]+e[7]*r[4]+e[8]*r[7],a[8]=e[6]*r[2]+e[7]*r[5]+e[8]*r[8],this.elements.set(a),this}premultiply(t){const e=t.elements,r=this.elements,a=new Float32Array(9);return a[0]=e[0]*r[0]+e[1]*r[3]+e[2]*r[6],a[1]=e[0]*r[1]+e[1]*r[4]+e[2]*r[7],a[2]=e[0]*r[2]+e[1]*r[5]+e[2]*r[8],a[3]=e[3]*r[0]+e[4]*r[3]+e[5]*r[6],a[4]=e[3]*r[1]+e[4]*r[4]+e[5]*r[7],a[5]=e[3]*r[2]+e[4]*r[5]+e[5]*r[8],a[6]=e[6]*r[0]+e[7]*r[3]+e[8]*r[6],a[7]=e[6]*r[1]+e[7]*r[4]+e[8]*r[7],a[8]=e[6]*r[2]+e[7]*r[5]+e[8]*r[8],this.elements.set(a),this}makeTranslation(t,e){return this.elements.set([1,0,t,0,1,e,0,0,1]),this}makeRotation(t){const e=Math.cos(t),r=Math.sin(t);return this.elements.set([e,r,0,-r,e,0,0,0,1]),this}makeScale(t,e){return this.elements.set([t,0,0,0,e,0,0,0,1]),this}translate(t,e){return this.m02+=this.m00*t+this.m01*e,this.m12+=this.m10*t+this.m11*e,this}rotate(t){const e=Math.cos(t),r=Math.sin(t),a=this.m00*e-this.m01*r,s=this.m00*r+this.m01*e,i=this.m10*e-this.m11*r,n=this.m10*r+this.m11*e;return this.m00=a,this.m01=s,this.m10=i,this.m11=n,this}scale(t,e){return this.m00*=t,this.m01*=e,this.m10*=t,this.m11*=e,this}transpose(){const t=this.elements;let e;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}determinant(){const t=this.elements;return t[0]*(t[4]*t[8]-t[5]*t[7])-t[1]*(t[3]*t[8]-t[5]*t[6])+t[2]*(t[3]*t[7]-t[4]*t[6])}invert(){const t=this.elements,e=this.determinant();if(Math.abs(e)<Number.EPSILON)return console.warn("Matrix3: 矩阵不可逆"),this;const r=1/e,a=new Float32Array(9);return a[0]=(t[4]*t[8]-t[5]*t[7])*r,a[1]=(t[2]*t[7]-t[1]*t[8])*r,a[2]=(t[1]*t[5]-t[2]*t[4])*r,a[3]=(t[5]*t[6]-t[3]*t[8])*r,a[4]=(t[0]*t[8]-t[2]*t[6])*r,a[5]=(t[2]*t[3]-t[0]*t[5])*r,a[6]=(t[3]*t[7]-t[4]*t[6])*r,a[7]=(t[1]*t[6]-t[0]*t[7])*r,a[8]=(t[0]*t[4]-t[1]*t[3])*r,this.elements.set(a),this}transformVector(e){const r=e.x,a=e.y,s=this.m20*r+this.m21*a+this.m22;return new t((this.m00*r+this.m01*a+this.m02)/s,(this.m10*r+this.m11*a+this.m12)/s)}transformDirection(e){return new t(this.m00*e.x+this.m01*e.y,this.m10*e.x+this.m11*e.y)}transformVectors(t){return t.map(t=>this.transformVector(t))}getTranslation(){return new t(this.m02,this.m12)}getRotation(){return Math.atan2(this.m01,this.m00)}getScale(){const e=Math.sqrt(this.m00*this.m00+this.m10*this.m10),r=Math.sqrt(this.m01*this.m01+this.m11*this.m11),a=this.determinant();return new t(a<0?-e:e,r)}decompose(){return {translation:this.getTranslation(),rotation:this.getRotation(),scale:this.getScale()}}equals(t,e=Number.EPSILON){for(let r=0;r<9;r++)if(Math.abs(this.elements[r]-t.elements[r])>=e)return  false;return  true}exactEquals(t){for(let e=0;e<9;e++)if(this.elements[e]!==t.elements[e])return  false;return  true}isIdentity(t=Number.EPSILON){return this.equals(r.IDENTITY,t)}static multiply(t,e){return t.clone().multiply(e)}static translation(t,e){return (new r).makeTranslation(t,e)}static rotation(t){return (new r).makeRotation(t)}static scale(t,e){return (new r).makeScale(t,e)}static TRS(t,e,a){const s=Math.cos(e),i=Math.sin(e);return new r([a.x*s,a.y*i,t.x,-a.x*i,a.y*s,t.y,0,0,1])}toString(){const t=this.elements;return `Matrix3(\n  ${t[0].toFixed(3)}, ${t[1].toFixed(3)}, ${t[2].toFixed(3)}\n  ${t[3].toFixed(3)}, ${t[4].toFixed(3)}, ${t[5].toFixed(3)}\n  ${t[6].toFixed(3)}, ${t[7].toFixed(3)}, ${t[8].toFixed(3)}\n)`}toArray(){return Array.from(this.elements)}toCSSTransform(){const t=this.elements;return `matrix(${t[0]}, ${t[3]}, ${t[1]}, ${t[4]}, ${t[2]}, ${t[5]})`}}r.IDENTITY=new r([1,0,0,0,1,0,0,0,1]),r.ZERO=new r([0,0,0,0,0,0,0,0,0]);class a{constructor(t=0,e=0,r=0,a=0){this.x=t,this.y=e,this.width=r,this.height=a;}get left(){return this.x}get right(){return this.x+this.width}get top(){return this.y}get bottom(){return this.y+this.height}get centerX(){return this.x+.5*this.width}get centerY(){return this.y+.5*this.height}get center(){return new t(this.centerX,this.centerY)}get topLeft(){return new t(this.x,this.y)}get topRight(){return new t(this.right,this.y)}get bottomLeft(){return new t(this.x,this.bottom)}get bottomRight(){return new t(this.right,this.bottom)}get area(){return this.width*this.height}get perimeter(){return 2*(this.width+this.height)}get isEmpty(){return this.width<=0||this.height<=0}get isSquare(){return this.width===this.height&&this.width>0}set(t,e,r,a){return this.x=t,this.y=e,this.width=r,this.height=a,this}copy(t){return this.x=t.x,this.y=t.y,this.width=t.width,this.height=t.height,this}clone(){return new a(this.x,this.y,this.width,this.height)}setPosition(t,e){return this.x=t,this.y=e,this}setSize(t,e){return this.width=t,this.height=e,this}setCenter(t,e){return this.x=t-.5*this.width,this.y=e-.5*this.height,this}translate(t,e){return this.x+=t,this.y+=e,this}scale(t,e=t){const r=this.centerX,a=this.centerY;return this.width*=t,this.height*=e,this.setCenter(r,a)}inflate(t){return this.x-=t,this.y-=t,this.width+=2*t,this.height+=2*t,this}inflateXY(t,e){return this.x-=t,this.y-=e,this.width+=2*t,this.height+=2*e,this}containsPoint(t){return t.x>=this.x&&t.x<=this.right&&t.y>=this.y&&t.y<=this.bottom}contains(t,e){return t>=this.x&&t<=this.right&&e>=this.y&&e<=this.bottom}containsRect(t){return this.x<=t.x&&this.y<=t.y&&this.right>=t.right&&this.bottom>=t.bottom}intersects(t){return this.x<t.right&&this.right>t.x&&this.y<t.bottom&&this.bottom>t.y}intersection(t){if(!this.intersects(t))return a.EMPTY.clone();const e=Math.max(this.x,t.x),r=Math.max(this.y,t.y),s=Math.min(this.right,t.right),i=Math.min(this.bottom,t.bottom);return new a(e,r,s-e,i-r)}union(t){const e=Math.min(this.x,t.x),r=Math.min(this.y,t.y),s=Math.max(this.right,t.right),i=Math.max(this.bottom,t.bottom);return new a(e,r,s-e,i-r)}intersectionArea(t){const e=this.intersection(t);return e.isEmpty?0:e.area}distanceToPoint(t){const e=Math.max(0,Math.max(this.x-t.x,t.x-this.right)),r=Math.max(0,Math.max(this.y-t.y,t.y-this.bottom));return Math.sqrt(e*e+r*r)}distanceToRect(t){if(this.intersects(t))return 0;const e=Math.max(0,Math.max(this.x-t.right,t.x-this.right)),r=Math.max(0,Math.max(this.y-t.bottom,t.y-this.bottom));return Math.sqrt(e*e+r*r)}closestPointTo(e){return new t(Math.max(this.x,Math.min(this.right,e.x)),Math.max(this.y,Math.min(this.bottom,e.y)))}equals(t,e=Number.EPSILON){return Math.abs(this.x-t.x)<e&&Math.abs(this.y-t.y)<e&&Math.abs(this.width-t.width)<e&&Math.abs(this.height-t.height)<e}exactEquals(t){return this.x===t.x&&this.y===t.y&&this.width===t.width&&this.height===t.height}static fromCenter(t,e,r,s){return new a(t-.5*r,e-.5*s,r,s)}static fromPoints(t,e){const r=Math.min(t.x,e.x),s=Math.min(t.y,e.y),i=Math.abs(e.x-t.x),n=Math.abs(e.y-t.y);return new a(r,s,i,n)}static fromPointArray(t){if(0===t.length)return a.EMPTY.clone();let e=t[0].x,r=t[0].y,s=t[0].x,i=t[0].y;for(let a=1;a<t.length;a++)e=Math.min(e,t[a].x),r=Math.min(r,t[a].y),s=Math.max(s,t[a].x),i=Math.max(i,t[a].y);return new a(e,r,s-e,i-r)}static square(t,e,r){return new a(t,e,r,r)}static lerp(t,e,r){return new a(t.x+(e.x-t.x)*r,t.y+(e.y-t.y)*r,t.width+(e.width-t.width)*r,t.height+(e.height-t.height)*r)}toString(){return `Rectangle(${this.x.toFixed(2)}, ${this.y.toFixed(2)}, ${this.width.toFixed(2)}, ${this.height.toFixed(2)})`}toArray(){return [this.x,this.y,this.width,this.height]}toObject(){return {x:this.x,y:this.y,width:this.width,height:this.height}}getVertices(){return [this.topLeft,this.topRight,this.bottomRight,this.bottomLeft]}}a.EMPTY=new a(0,0,0,0);class s{constructor(t=0,e=0,r=0){this.x=t,this.y=e,this.radius=r;}get center(){return new t(this.x,this.y)}set center(t){this.x=t.x,this.y=t.y;}get diameter(){return 2*this.radius}set diameter(t){this.radius=.5*t;}get area(){return Math.PI*this.radius*this.radius}get circumference(){return 2*Math.PI*this.radius}get bounds(){return new a(this.x-this.radius,this.y-this.radius,this.diameter,this.diameter)}get isEmpty(){return this.radius<=0}set(t,e,r){return this.x=t,this.y=e,this.radius=r,this}copy(t){return this.x=t.x,this.y=t.y,this.radius=t.radius,this}clone(){return new s(this.x,this.y,this.radius)}setPosition(t,e){return this.x=t,this.y=e,this}setCenter(t){return this.x=t.x,this.y=t.y,this}setRadius(t){return this.radius=t,this}translate(t,e){return this.x+=t,this.y+=e,this}translateBy(t){return this.x+=t.x,this.y+=t.y,this}scale(t){return this.radius*=t,this}inflate(t){return this.radius+=t,this}containsPoint(t){const e=t.x-this.x,r=t.y-this.y;return e*e+r*r<=this.radius*this.radius}contains(t,e){const r=t-this.x,a=e-this.y;return r*r+a*a<=this.radius*this.radius}containsCircle(t){return this.distanceToCircle(t)+t.radius<=this.radius}pointOnBoundary(t,e=Number.EPSILON){const r=this.distanceToPoint(t);return Math.abs(r-this.radius)<e}intersects(t){const e=this.x-t.x,r=this.y-t.y,a=e*e+r*r,s=this.radius+t.radius;return a<=s*s}intersectsRect(t){const e=Math.max(t.x,Math.min(this.x,t.right)),r=Math.max(t.y,Math.min(this.y,t.bottom)),a=this.x-e,s=this.y-r;return a*a+s*s<=this.radius*this.radius}intersectionArea(t){const e=this.distanceToCircle(t);if(e>=this.radius+t.radius)return 0;if(e<=Math.abs(this.radius-t.radius)){const e=Math.min(this.radius,t.radius);return Math.PI*e*e}const r=this.radius,a=t.radius;return r*r*Math.acos((e*e+r*r-a*a)/(2*e*r))+a*a*Math.acos((e*e+a*a-r*r)/(2*e*a))-.5*Math.sqrt((-e+r+a)*(e+r-a)*(e-r+a)*(e+r+a))}distanceToPoint(t){const e=t.x-this.x,r=t.y-this.y;return Math.sqrt(e*e+r*r)}distanceToPointFromBoundary(t){return this.distanceToPoint(t)-this.radius}distanceToCircle(t){const e=this.x-t.x,r=this.y-t.y;return Math.sqrt(e*e+r*r)}distanceToCircleFromBoundary(t){return this.distanceToCircle(t)-this.radius-t.radius}distanceToRect(t){return Math.max(0,t.distanceToPoint(this.center)-this.radius)}closestPointTo(e){const r=t.subtract(e,this.center);return r.isZero?new t(this.x+this.radius,this.y):this.center.clone().add(r.normalized().multiply(this.radius))}farthestPointFrom(e){const r=t.subtract(e,this.center);return r.isZero?new t(this.x-this.radius,this.y):this.center.clone().subtract(r.normalized().multiply(this.radius))}getPointAtAngle(e){return new t(this.x+this.radius*Math.cos(e),this.y+this.radius*Math.sin(e))}getAngleToPoint(t){return Math.atan2(t.y-this.y,t.x-this.x)}getLineIntersections(e,r){const a=r.x-e.x,s=r.y-e.y,i=e.x-this.x,n=e.y-this.y,o=a*a+s*s,u=2*(i*a+n*s),c=u*u-4*o*(i*i+n*n-this.radius*this.radius);if(c<0)return [];if(0===c){const r=-u/(2*o);return [new t(e.x+r*a,e.y+r*s)]}const l=Math.sqrt(c),h=(-u-l)/(2*o),m=(-u+l)/(2*o);return [new t(e.x+h*a,e.y+h*s),new t(e.x+m*a,e.y+m*s)]}equals(t,e=Number.EPSILON){return Math.abs(this.x-t.x)<e&&Math.abs(this.y-t.y)<e&&Math.abs(this.radius-t.radius)<e}exactEquals(t){return this.x===t.x&&this.y===t.y&&this.radius===t.radius}static fromDiameter(t,e,r){return new s(t,e,.5*r)}static fromThreePoints(t,e,r){const a=t.x,i=t.y,n=e.x,o=e.y,u=r.x,c=r.y,l=2*(a*(o-c)+n*(c-i)+u*(i-o));if(Math.abs(l)<Number.EPSILON)return null;const h=((a*a+i*i)*(o-c)+(n*n+o*o)*(c-i)+(u*u+c*c)*(i-o))/l,m=((a*a+i*i)*(u-n)+(n*n+o*o)*(a-u)+(u*u+c*c)*(n-a))/l,d=Math.sqrt((a-h)*(a-h)+(i-m)*(i-m));return new s(h,m,d)}static fromPointArray(e){if(0===e.length)return s.EMPTY.clone();if(1===e.length)return new s(e[0].x,e[0].y,0);let r=e[0].x,a=e[0].y,i=e[0].x,n=e[0].y;for(const t of e)r=Math.min(r,t.x),a=Math.min(a,t.y),i=Math.max(i,t.x),n=Math.max(n,t.y);const o=.5*(r+i),u=.5*(a+n),c=new t(o,u);let l=0;for(const r of e){const e=t.distance(c,r);l=Math.max(l,e);}return new s(o,u,l)}static lerp(t,e,r){return new s(t.x+(e.x-t.x)*r,t.y+(e.y-t.y)*r,t.radius+(e.radius-t.radius)*r)}toString(){return `Circle(${this.x.toFixed(2)}, ${this.y.toFixed(2)}, r=${this.radius.toFixed(2)})`}toArray(){return [this.x,this.y,this.radius]}toObject(){return {x:this.x,y:this.y,radius:this.radius}}}s.EMPTY=new s(0,0,0),s.UNIT=new s(0,0,1);class i{static signedArea(t){const e=t.length;if(e<3)return 0;let r=0;for(let a=0;a<e;a++){const s=(a+1)%e,i=t[a],n=t[s];r+=i.x*n.y,r-=n.x*i.y;}return .5*r}static area(t){return Math.abs(i.signedArea(t))}static isCCW(t,e=false){const r=i.signedArea(t);return e?r<0:r>0}static isCW(t,e=false){return !i.isCCW(t,e)}static reverse(t){return [...t].reverse()}static reverseInPlace(t){t.reverse();}static ensureCCW(t,e=false){return i.isCCW(t,e)?[...t]:i.reverse(t)}static ensureCW(t,e=false){return i.isCW(t,e)?[...t]:i.reverse(t)}static centroid(t){const e=t.length;if(0===e)return {x:0,y:0};if(1===e)return {x:t[0].x,y:t[0].y};if(2===e)return {x:.5*(t[0].x+t[1].x),y:.5*(t[0].y+t[1].y)};let r=0,a=0,s=0;for(let i=0;i<e;i++){const n=(i+1)%e,o=t[i],u=t[n],c=o.x*u.y-u.x*o.y;s+=c,r+=(o.x+u.x)*c,a+=(o.y+u.y)*c;}s*=.5;const i=1/(6*s);return {x:r*i,y:a*i}}static containsPoint(t,e){const r=e.length;if(r<3)return  false;let a=false;for(let s=0,i=r-1;s<r;i=s++){const r=e[s],n=e[i];r.y>t.y!=n.y>t.y&&t.x<(n.x-r.x)*(t.y-r.y)/(n.y-r.y)+r.x&&(a=!a);}return a}static isConvex(t){const e=t.length;if(e<3)return  false;if(3===e)return  true;let r=null;for(let a=0;a<e;a++){const s=t[a],i=t[(a+1)%e],n=t[(a+2)%e],o=i.x-s.x,u=i.y-s.y,c=n.x-i.x,l=o*(n.y-i.y)-u*c;if(Math.abs(l)>1e-10)if(null===r)r=l>0?1:-1;else if((l>0?1:-1)!==r)return  false}return  true}static perimeter(t){const e=t.length;if(e<2)return 0;let r=0;for(let a=0;a<e;a++){const s=(a+1)%e,i=t[a],n=t[s],o=n.x-i.x,u=n.y-i.y;r+=Math.sqrt(o*o+u*u);}return r}static bounds(t){if(0===t.length)return {minX:0,minY:0,maxX:0,maxY:0};let e=1/0,r=1/0,a=-1/0,s=-1/0;for(const i of t)i.x<e&&(e=i.x),i.y<r&&(r=i.y),i.x>a&&(a=i.x),i.y>s&&(s=i.y);return {minX:e,minY:r,maxX:a,maxY:s}}}class n{constructor(t){this.raw=0|t;}static from(t){return new n(Math.round(t*n.SCALE))}static fromRaw(t){return new n(t)}static fromInt(t){return new n((0|t)<<n.FRACTION_BITS)}toNumber(){return this.raw/n.SCALE}toRaw(){return this.raw}toInt(){return this.raw>>n.FRACTION_BITS}toString(){return `Fixed32(${this.toNumber().toFixed(5)})`}add(t){return new n(this.raw+t.raw)}sub(t){return new n(this.raw-t.raw)}mul(t){const e=this.raw,r=t.raw,a=65535&e,s=e>>16,i=65535&r,o=r>>16,u=a*i>>>16,c=a*o,l=s*i,h=s*o*n.SCALE+c+l+u;return new n(0|h)}div(t){if(0===t.raw)throw new Error("Fixed32: Division by zero");const e=this.raw*n.SCALE/t.raw|0;return new n(e)}mod(t){return new n(this.raw%t.raw)}neg(){return new n(-this.raw)}abs(){return this.raw>=0?this:new n(-this.raw)}eq(t){return this.raw===t.raw}ne(t){return this.raw!==t.raw}lt(t){return this.raw<t.raw}le(t){return this.raw<=t.raw}gt(t){return this.raw>t.raw}ge(t){return this.raw>=t.raw}isZero(){return 0===this.raw}isPositive(){return this.raw>0}isNegative(){return this.raw<0}static sqrt(t){if(t.raw<=0)return n.ZERO;let e=t.raw,r=0;for(let a=0;a<16&&(r=e,e=e+t.raw*n.SCALE/e>>1,e!==r);a++);return new n(e)}static floor(t){return new n(t.raw&~(n.SCALE-1))}static ceil(t){return 0===(t.raw&n.SCALE-1)?t:new n((t.raw&~(n.SCALE-1))+n.SCALE)}static round(t){return new n(t.raw+(n.SCALE>>1)&~(n.SCALE-1))}static min(t,e){return t.raw<e.raw?t:e}static max(t,e){return t.raw>e.raw?t:e}static clamp(t,e,r){return t.raw<e.raw?e:t.raw>r.raw?r:t}static lerp(t,e,r){return t.add(e.sub(t).mul(r))}static sign(t){return t.raw>0?n.ONE:t.raw<0?n.NEG_ONE:n.ZERO}static add(t,e){return t.add(e)}static sub(t,e){return t.sub(e)}static mul(t,e){return t.mul(e)}static div(t,e){return t.div(e)}}n.FRACTION_BITS=16,n.SCALE=65536,n.MAX_VALUE=2147483647,n.MIN_VALUE=-2147483648,n.EPSILON=1,n.ZERO=new n(0),n.ONE=new n(n.SCALE),n.NEG_ONE=new n(-n.SCALE),n.HALF=new n(n.SCALE>>1),n.PI=new n(205887),n.TWO_PI=new n(411775),n.HALF_PI=new n(102944),n.RAD_TO_DEG=new n(3754936),n.DEG_TO_RAD=new n(1144);class o{static generateSinTable(){const t=new Int32Array(o.SIN_TABLE_SIZE+1);for(let e=0;e<=o.SIN_TABLE_SIZE;e++){const r=e*Math.PI/(2*o.SIN_TABLE_SIZE);t[e]=Math.round(Math.sin(r)*n.SCALE);}return t}static sin(t){let e=t.raw%n.TWO_PI.raw;e<0&&(e+=n.TWO_PI.raw);const r=n.HALF_PI.raw,a=n.PI.raw;let s,i=false;e<=r?s=e:e<=a?s=a-e:e<=3*r?(s=e-a,i=true):(s=n.TWO_PI.raw-e,i=true);const u=Math.min(s*o.SIN_TABLE_SIZE/r|0,o.SIN_TABLE_SIZE),c=o.SIN_TABLE[u];return n.fromRaw(i?-c:c)}static cos(t){return o.sin(t.add(n.HALF_PI))}static tan(t){const e=o.cos(t);return e.isZero()?n.fromRaw(n.MAX_VALUE):o.sin(t).div(e)}static atan2(t,e){const r=t.raw,a=e.raw;if(0===a&&0===r)return n.ZERO;const s=Math.abs(r),i=Math.abs(a);let u;return u=i>=s?o.atanApprox(s,i):n.HALF_PI.raw-o.atanApprox(i,s),a<0&&(u=n.PI.raw-u),r<0&&(u=-u),n.fromRaw(u)}static atanApprox(t,e){if(0===e)return n.HALF_PI.raw;const r=t*n.SCALE/e|0,a=r*r/n.SCALE|0,s=n.SCALE+(18432*a/n.SCALE|0);return r*n.SCALE/s|0}static asin(t){const e=n.ONE,r=t.mul(t),a=n.sqrt(e.sub(r));return o.atan2(t,a)}static acos(t){return n.HALF_PI.sub(o.asin(t))}static normalizeAngle(t){let e=t.raw%n.TWO_PI.raw;return e>n.PI.raw?e-=n.TWO_PI.raw:e<-n.PI.raw&&(e+=n.TWO_PI.raw),n.fromRaw(e)}static angleDelta(t,e){return o.normalizeAngle(e.sub(t))}static lerpAngle(t,e,r){const a=o.angleDelta(t,e);return t.add(a.mul(r))}static radToDeg(t){return t.mul(n.RAD_TO_DEG)}static degToRad(t){return t.mul(n.DEG_TO_RAD)}static pow(t,e){if(0===e)return n.ONE;e<0&&(t=n.ONE.div(t),e=-e);let r=n.ONE;for(;e>0;)1&e&&(r=r.mul(t)),t=t.mul(t),e>>=1;return r}static exp(t){const e=n.ONE,r=t.mul(t),a=r.mul(t),s=a.mul(t);return e.add(t).add(r.div(n.from(2))).add(a.div(n.from(6))).add(s.div(n.from(24)))}static ln(t){if(t.raw<=0)throw new Error("FixedMath.ln: argument must be positive");let e=n.ZERO;const r=n.from(2);for(let a=0;a<10;a++){const a=o.exp(e),s=t.sub(a),i=t.add(a);e=e.add(r.mul(s).div(i));}return e}}o.SIN_TABLE_SIZE=1024,o.SIN_TABLE=o.generateSinTable();class u{constructor(t,e){this.x=t,this.y=e;}static from(t,e){return new u(n.from(t),n.from(e))}static fromRaw(t,e){return new u(n.fromRaw(t),n.fromRaw(e))}static fromInt(t,e){return new u(n.fromInt(t),n.fromInt(e))}static fromObject(t){return u.from(t.x,t.y)}toObject(){return {x:this.x.toNumber(),y:this.y.toNumber()}}toArray(){return [this.x.toNumber(),this.y.toNumber()]}toRawObject(){return {x:this.x.toRaw(),y:this.y.toRaw()}}toString(){return `FixedVector2(${this.x.toNumber().toFixed(3)}, ${this.y.toNumber().toFixed(3)})`}clone(){return new u(this.x,this.y)}add(t){return new u(this.x.add(t.x),this.y.add(t.y))}sub(t){return new u(this.x.sub(t.x),this.y.sub(t.y))}mul(t){return new u(this.x.mul(t),this.y.mul(t))}div(t){return new u(this.x.div(t),this.y.div(t))}mulComponents(t){return new u(this.x.mul(t.x),this.y.mul(t.y))}divComponents(t){return new u(this.x.div(t.x),this.y.div(t.y))}neg(){return new u(this.x.neg(),this.y.neg())}dot(t){return this.x.mul(t.x).add(this.y.mul(t.y))}cross(t){return this.x.mul(t.y).sub(this.y.mul(t.x))}lengthSquared(){return this.dot(this)}length(){return n.sqrt(this.lengthSquared())}normalize(){const t=this.length();return t.isZero()?u.ZERO:this.div(t)}distanceSquaredTo(t){const e=this.x.sub(t.x),r=this.y.sub(t.y);return e.mul(e).add(r.mul(r))}distanceTo(t){return n.sqrt(this.distanceSquaredTo(t))}perpendicular(){return new u(this.y,this.x.neg())}perpendicularCCW(){return new u(this.y.neg(),this.x)}projectOnto(t){const e=this.dot(t),r=t.lengthSquared();return r.isZero()?u.ZERO:t.mul(e.div(r))}reflect(t){const e=this.dot(t),r=n.from(2);return this.sub(t.mul(r.mul(e)))}rotate(t){const e=o.cos(t),r=o.sin(t);return new u(this.x.mul(e).add(this.y.mul(r)),this.x.neg().mul(r).add(this.y.mul(e)))}rotateAround(t,e){return this.sub(t).rotate(e).add(t)}angle(){return o.atan2(this.y,this.x)}angleTo(t){const e=this.cross(t),r=this.dot(t);return o.atan2(e,r)}static fromPolar(t,e){return new u(t.mul(o.cos(e)),t.mul(o.sin(e)))}static fromAngle(t){return new u(o.cos(t),o.sin(t))}equals(t){return this.x.eq(t.x)&&this.y.eq(t.y)}isZero(){return this.x.isZero()&&this.y.isZero()}clampLength(t){const e=this.lengthSquared(),r=t.mul(t);return e.gt(r)?this.normalize().mul(t):this}clamp(t,e){return new u(n.clamp(this.x,t.x,e.x),n.clamp(this.y,t.y,e.y))}lerp(t,e){return new u(n.lerp(this.x,t.x,e),n.lerp(this.y,t.y,e))}moveTowards(t,e){const r=t.sub(this),a=r.length();return a.isZero()||a.le(e)?t:this.add(r.div(a).mul(e))}static add(t,e){return t.add(e)}static sub(t,e){return t.sub(e)}static dot(t,e){return t.dot(e)}static cross(t,e){return t.cross(e)}static distance(t,e){return t.distanceTo(e)}static lerp(t,e,r){return t.lerp(e,r)}static min(t,e){return new u(n.min(t.x,e.x),n.min(t.y,e.y))}static max(t,e){return new u(n.max(t.x,e.x),n.max(t.y,e.y))}}u.ZERO=new u(n.ZERO,n.ZERO),u.ONE=new u(n.ONE,n.ONE),u.RIGHT=new u(n.ONE,n.ZERO),u.LEFT=new u(n.NEG_ONE,n.ZERO),u.UP=new u(n.ZERO,n.ONE),u.DOWN=new u(n.ZERO,n.NEG_ONE);class c{static degToRad(t){return t*c.DEG_TO_RAD}static radToDeg(t){return t*c.RAD_TO_DEG}static normalizeAngle(t){for(;t<0;)t+=c.TWO_PI;for(;t>=c.TWO_PI;)t-=c.TWO_PI;return t}static normalizeAngleSigned(t){for(;t<=-Math.PI;)t+=c.TWO_PI;for(;t>Math.PI;)t-=c.TWO_PI;return t}static angleDifference(t,e){let r=e-t;return r=c.normalizeAngleSigned(r),r}static lerpAngle(t,e,r){return t+c.angleDifference(t,e)*r}static clamp(t,e,r){return Math.max(e,Math.min(r,t))}static clamp01(t){return Math.max(0,Math.min(1,t))}static lerp(t,e,r){return t+(e-t)*r}static inverseLerp(t,e,r){return Math.abs(e-t)<c.EPSILON?0:(r-t)/(e-t)}static remap(t,e,r,a,s){const i=c.inverseLerp(e,r,t);return c.lerp(a,s,i)}static smoothStep(t){return (t=c.clamp01(t))*t*(3-2*t)}static smootherStep(t){return (t=c.clamp01(t))*t*t*(t*(6*t-15)+10)}static approximately(t,e,r=c.EPSILON){return Math.abs(t-e)<r}static isZero(t,e=c.EPSILON){return Math.abs(t)<e}static sign(t){return t>0?1:t<0?-1:0}static random(t=0,e=1){return Math.random()*(e-t)+t}static randomInt(t,e){return Math.floor(Math.random()*(e-t+1))+t}static randomChoice(t){return t[Math.floor(Math.random()*t.length)]}static randomBoolean(t=.5){return Math.random()<t}static randomInUnitCircle(){const e=Math.random()*c.TWO_PI,r=Math.sqrt(Math.random());return t.fromPolar(r,e)}static randomOnUnitCircle(){const e=Math.random()*c.TWO_PI;return t.fromAngle(e)}static fastInverseSqrt(t){return 1/Math.sqrt(t)}static fastPow(t,e){return 0===e?1:1===e?t:2===e?t*t:3===e?t*t*t:Math.pow(t,e)}static factorial(t){if(t<0)return NaN;if(0===t||1===t)return 1;let e=1;for(let r=2;r<=t;r++)e*=r;return e}static gcd(t,e){for(t=Math.abs(Math.floor(t)),e=Math.abs(Math.floor(e));0!==e;){const r=e;e=t%e,t=r;}return t}static lcm(t,e){return Math.abs(t*e)/c.gcd(t,e)}static fibonacci(t){if(t<=0)return 0;if(1===t)return 1;let e=0,r=1;for(let a=2;a<=t;a++){const t=e+r;e=r,r=t;}return r}static arithmeticSum(t,e,r){return (t+e)*r*.5}static geometricSum(t,e,r){return Math.abs(e-1)<c.EPSILON?t*r:t*(1-Math.pow(e,r))/(1-e)}static quadraticBezier(e,r,a,s){const i=1-s,n=s*s,o=i*i;return new t(o*e.x+2*i*s*r.x+n*a.x,o*e.y+2*i*s*r.y+n*a.y)}static cubicBezier(e,r,a,s,i){const n=1-i,o=i*i,u=n*n,c=u*n,l=o*i;return new t(c*e.x+3*u*i*r.x+3*n*o*a.x+l*s.x,c*e.y+3*u*i*r.y+3*n*o*a.y+l*s.y)}static catmullRom(e,r,a,s,i){const n=i*i,o=n*i,u=.5*(2*r.x+(-e.x+a.x)*i+(2*e.x-5*r.x+4*a.x-s.x)*n+(-e.x+3*r.x-3*a.x+s.x)*o),c=.5*(2*r.y+(-e.y+a.y)*i+(2*e.y-5*r.y+4*a.y-s.y)*n+(-e.y+3*r.y-3*a.y+s.y)*o);return new t(u,c)}static noise(t,e=0,r=0){const a=43758.5453*Math.sin(12.9898*t+78.233*e+37.719*r);return a-Math.floor(a)}static smoothNoise(t,e=0,r=0){const a=Math.floor(t),s=Math.floor(e),i=t-a,n=e-s,o=c.noise(a,s,r),u=c.noise(a+1,s,r),l=c.noise(a,s+1,r),h=c.noise(a+1,s+1,r),m=c.lerp(o,u,i),d=c.lerp(l,h,i);return c.lerp(m,d,n)}static toPrecision(t,e){const r=Math.pow(10,e);return Math.round(t*r)/r}static inRange(t,e,r){return t>=e&&t<=r}static min(...t){return Math.min(...t)}static max(...t){return Math.max(...t)}static average(t){return 0===t.length?0:t.reduce((t,e)=>t+e,0)/t.length}static median(t){if(0===t.length)return 0;const e=[...t].sort((t,e)=>t-e),r=Math.floor(e.length/2);return e.length%2==0?(e[r-1]+e[r])/2:e[r]}}c.PI=Math.PI,c.TWO_PI=2*Math.PI,c.HALF_PI=.5*Math.PI,c.QUARTER_PI=.25*Math.PI,c.DEG_TO_RAD=Math.PI/180,c.RAD_TO_DEG=180/Math.PI,c.GOLDEN_RATIO=.5*(1+Math.sqrt(5)),c.EPSILON=Number.EPSILON;class l{constructor(t=255,e=255,r=255,a=1){this.r=Math.round(Math.max(0,Math.min(255,t))),this.g=Math.round(Math.max(0,Math.min(255,e))),this.b=Math.round(Math.max(0,Math.min(255,r))),this.a=Math.max(0,Math.min(1,a));}static fromHex(t,e=1){const{r:r,g:a,b:s}=l.hexToRgb(t);return new l(r,a,s,e)}static fromUint32(t,e=false){if(e){return new l(t>>16&255,t>>8&255,255&t,(t>>24&255)/255)}return new l(t>>16&255,t>>8&255,255&t)}static fromHSL(t,e,r,a=1){const{r:s,g:i,b:n}=l.hslToRgb(t,e,r);return new l(s,i,n,a)}static fromFloat(t,e,r,a=1){return new l(255*t,255*e,255*r,a)}static hexToRgb(t){const e=t.replace("#","");let r=255,a=255,s=255;return 6===e.length?(r=parseInt(e.substring(0,2),16),a=parseInt(e.substring(2,4),16),s=parseInt(e.substring(4,6),16)):3===e.length?(r=parseInt(e[0]+e[0],16),a=parseInt(e[1]+e[1],16),s=parseInt(e[2]+e[2],16)):8===e.length&&(r=parseInt(e.substring(2,4),16),a=parseInt(e.substring(4,6),16),s=parseInt(e.substring(6,8),16)),{r:r,g:a,b:s}}static rgbToHex(t,e,r){const a=t=>Math.round(t).toString(16).padStart(2,"0");return `#${a(t)}${a(e)}${a(r)}`}static hslToRgb(t,e,r){let a,s,i;if(t=(t%360+360)%360/360,e=Math.max(0,Math.min(1,e)),r=Math.max(0,Math.min(1,r)),0===e)a=s=i=r;else {const n=(t,e,r)=>(r<0&&(r+=1),r>1&&(r-=1),r<1/6?t+6*(e-t)*r:r<.5?e:r<2/3?t+(e-t)*(2/3-r)*6:t),o=r<.5?r*(1+e):r+e-r*e,u=2*r-o;a=n(u,o,t+1/3),s=n(u,o,t),i=n(u,o,t-1/3);}return {r:Math.round(255*a),g:Math.round(255*s),b:Math.round(255*i)}}static rgbToHsl(t,e,r){t/=255,e/=255,r/=255;const a=Math.max(t,e,r),s=Math.min(t,e,r);let i=0,n=0;const o=(a+s)/2;if(a!==s){const u=a-s;switch(n=o>.5?u/(2-a-s):u/(a+s),a){case t:i=((e-r)/u+(e<r?6:0))/6;break;case e:i=((r-t)/u+2)/6;break;case r:i=((t-e)/u+4)/6;}}return {h:360*i,s:n,l:o}}static packRGB(t,e,r){return (255&t)<<16|(255&e)<<8|255&r}static packARGB(t,e,r,a){return (255&Math.round(255*a))<<24|(255&t)<<16|(255&e)<<8|255&r}static packABGR(t,e,r,a){return (255&Math.round(255*a))<<24|(255&r)<<16|(255&e)<<8|255&t}static packHexAlpha(t,e){const{r:r,g:a,b:s}=l.hexToRgb(t);return l.packABGR(r,a,s,e)}static unpackARGB(t){return {a:(t>>24&255)/255,r:t>>16&255,g:t>>8&255,b:255&t}}static unpackABGR(t){return {a:(t>>24&255)/255,b:t>>16&255,g:t>>8&255,r:255&t}}static lerp(t,e,r){return r=Math.max(0,Math.min(1,r)),new l(t.r+(e.r-t.r)*r,t.g+(e.g-t.g)*r,t.b+(e.b-t.b)*r,t.a+(e.a-t.a)*r)}static lerpUint32(t,e,r){r=Math.max(0,Math.min(1,r));const a=t>>16&255,s=t>>8&255,i=255&t,n=e>>16&255,o=e>>8&255,u=255&e;return Math.round(a+(n-a)*r)<<16|Math.round(s+(o-s)*r)<<8|Math.round(i+(u-i)*r)}static mix(t,e,r=.5){return l.lerp(t,e,r)}static lighten(t,e){const r=l.rgbToHsl(t.r,t.g,t.b);r.l=Math.min(1,r.l+e);const a=l.hslToRgb(r.h,r.s,r.l);return new l(a.r,a.g,a.b,t.a)}static darken(t,e){const r=l.rgbToHsl(t.r,t.g,t.b);r.l=Math.max(0,r.l-e);const a=l.hslToRgb(r.h,r.s,r.l);return new l(a.r,a.g,a.b,t.a)}static saturate(t,e){const r=l.rgbToHsl(t.r,t.g,t.b);r.s=Math.min(1,r.s+e);const a=l.hslToRgb(r.h,r.s,r.l);return new l(a.r,a.g,a.b,t.a)}static desaturate(t,e){const r=l.rgbToHsl(t.r,t.g,t.b);r.s=Math.max(0,r.s-e);const a=l.hslToRgb(r.h,r.s,r.l);return new l(a.r,a.g,a.b,t.a)}static invert(t){return new l(255-t.r,255-t.g,255-t.b,t.a)}static grayscale(t){const e=Math.round(.299*t.r+.587*t.g+.114*t.b);return new l(e,e,e,t.a)}static luminance(t){return (.299*t.r+.587*t.g+.114*t.b)/255}static contrastRatio(t,e){const r=l.luminance(t),a=l.luminance(e);return (Math.max(r,a)+.05)/(Math.min(r,a)+.05)}toHex(){return l.rgbToHex(this.r,this.g,this.b)}toHexAlpha(){return `#${Math.round(255*this.a).toString(16).padStart(2,"0")}${this.toHex().slice(1)}`}toRgba(){return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`}toRgb(){return `rgb(${this.r}, ${this.g}, ${this.b})`}toHSL(){return l.rgbToHsl(this.r,this.g,this.b)}toUint32(){return l.packRGB(this.r,this.g,this.b)}toUint32Alpha(){return l.packARGB(this.r,this.g,this.b,this.a)}toWebGL(){return l.packABGR(this.r,this.g,this.b,this.a)}toFloatArray(){return [this.r/255,this.g/255,this.b/255,this.a]}clone(){return new l(this.r,this.g,this.b,this.a)}set(t,e,r,a){return this.r=Math.round(Math.max(0,Math.min(255,t))),this.g=Math.round(Math.max(0,Math.min(255,e))),this.b=Math.round(Math.max(0,Math.min(255,r))),void 0!==a&&(this.a=Math.max(0,Math.min(1,a))),this}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this.a=t.a,this}equals(t){return this.r===t.r&&this.g===t.g&&this.b===t.b&&this.a===t.a}toString(){return `Color(${this.r}, ${this.g}, ${this.b}, ${this.a})`}}l.WHITE=new l(255,255,255),l.BLACK=new l(0,0,0),l.RED=new l(255,0,0),l.GREEN=new l(0,255,0),l.BLUE=new l(0,0,255),l.YELLOW=new l(255,255,0),l.CYAN=new l(0,255,255),l.MAGENTA=new l(255,0,255),l.TRANSPARENT=new l(0,0,0,0),l.GRAY=new l(128,128,128);

  // src/core/IIncrementalPathfinding.ts
  var PathfindingState = /* @__PURE__ */ (function(PathfindingState2) {
    PathfindingState2["Idle"] = "idle";
    PathfindingState2["InProgress"] = "in_progress";
    PathfindingState2["Paused"] = "paused";
    PathfindingState2["Completed"] = "completed";
    PathfindingState2["Failed"] = "failed";
    PathfindingState2["Cancelled"] = "cancelled";
    return PathfindingState2;
  })({});
  var EMPTY_PROGRESS = {
    state: "idle",
    nodesSearched: 0,
    openListSize: 0,
    estimatedProgress: 0
  };

  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // src/core/IPathfinding.ts
  function createPoint(x, y) {
    return {
      x,
      y
    };
  }
  __name(createPoint, "createPoint");
  var EMPTY_PATH_RESULT = {
    found: false,
    path: [],
    cost: 0,
    nodesSearched: 0
  };
  function manhattanDistance(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }
  __name(manhattanDistance, "manhattanDistance");
  function euclideanDistance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  __name(euclideanDistance, "euclideanDistance");
  function chebyshevDistance(a, b) {
    return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
  }
  __name(chebyshevDistance, "chebyshevDistance");
  function octileDistance(a, b) {
    const dx = Math.abs(a.x - b.x);
    const dy = Math.abs(a.y - b.y);
    const D = 1;
    const D2 = Math.SQRT2;
    return D * (dx + dy) + (D2 - 2 * D) * Math.min(dx, dy);
  }
  __name(octileDistance, "octileDistance");
  var DEFAULT_PATHFINDING_OPTIONS = {
    maxNodes: 1e4,
    heuristicWeight: 1,
    allowDiagonal: true,
    avoidCorners: true
  };

  // src/core/IndexedBinaryHeap.ts
  var _IndexedBinaryHeap = class _IndexedBinaryHeap {
    /**
     * @zh 创建带索引追踪的二叉堆
     * @en Create indexed binary heap
     *
     * @param compare - @zh 比较函数，返回负数表示 a < b @en Compare function, returns negative if a < b
     */
    constructor(compare) {
      __publicField(this, "heap", []);
      __publicField(this, "compare");
      this.compare = compare;
    }
    /**
     * @zh 堆大小
     * @en Heap size
     */
    get size() {
      return this.heap.length;
    }
    /**
     * @zh 是否为空
     * @en Is empty
     */
    get isEmpty() {
      return this.heap.length === 0;
    }
    /**
     * @zh 插入元素
     * @en Push element
     */
    push(item) {
      item.heapIndex = this.heap.length;
      this.heap.push(item);
      this.bubbleUp(this.heap.length - 1);
    }
    /**
     * @zh 弹出最小元素
     * @en Pop minimum element
     */
    pop() {
      if (this.heap.length === 0) {
        return void 0;
      }
      const result = this.heap[0];
      result.heapIndex = -1;
      const last = this.heap.pop();
      if (this.heap.length > 0) {
        last.heapIndex = 0;
        this.heap[0] = last;
        this.sinkDown(0);
      }
      return result;
    }
    /**
     * @zh 查看最小元素（不移除）
     * @en Peek minimum element (without removing)
     */
    peek() {
      return this.heap[0];
    }
    /**
     * @zh 更新元素
     * @en Update element
     */
    update(item) {
      const index = item.heapIndex;
      if (index >= 0 && index < this.heap.length && this.heap[index] === item) {
        this.bubbleUp(index);
        this.sinkDown(item.heapIndex);
      }
    }
    /**
     * @zh 检查是否包含元素
     * @en Check if contains element
     */
    contains(item) {
      const index = item.heapIndex;
      return index >= 0 && index < this.heap.length && this.heap[index] === item;
    }
    /**
     * @zh 从堆中移除指定元素
     * @en Remove specific element from heap
     */
    remove(item) {
      const index = item.heapIndex;
      if (index < 0 || index >= this.heap.length || this.heap[index] !== item) {
        return false;
      }
      item.heapIndex = -1;
      if (index === this.heap.length - 1) {
        this.heap.pop();
        return true;
      }
      const last = this.heap.pop();
      last.heapIndex = index;
      this.heap[index] = last;
      this.bubbleUp(index);
      this.sinkDown(last.heapIndex);
      return true;
    }
    /**
     * @zh 清空堆
     * @en Clear heap
     */
    clear() {
      for (const item of this.heap) {
        item.heapIndex = -1;
      }
      this.heap.length = 0;
    }
    /**
     * @zh 上浮操作
     * @en Bubble up operation
     */
    bubbleUp(index) {
      const item = this.heap[index];
      while (index > 0) {
        const parentIndex = index - 1 >> 1;
        const parent = this.heap[parentIndex];
        if (this.compare(item, parent) >= 0) {
          break;
        }
        parent.heapIndex = index;
        this.heap[index] = parent;
        index = parentIndex;
      }
      item.heapIndex = index;
      this.heap[index] = item;
    }
    /**
     * @zh 下沉操作
     * @en Sink down operation
     */
    sinkDown(index) {
      const length = this.heap.length;
      const item = this.heap[index];
      const halfLength = length >> 1;
      while (index < halfLength) {
        const leftIndex = (index << 1) + 1;
        const rightIndex = leftIndex + 1;
        let smallest = index;
        let smallestItem = item;
        const left = this.heap[leftIndex];
        if (this.compare(left, smallestItem) < 0) {
          smallest = leftIndex;
          smallestItem = left;
        }
        if (rightIndex < length) {
          const right = this.heap[rightIndex];
          if (this.compare(right, smallestItem) < 0) {
            smallest = rightIndex;
            smallestItem = right;
          }
        }
        if (smallest === index) {
          break;
        }
        smallestItem.heapIndex = index;
        this.heap[index] = smallestItem;
        index = smallest;
      }
      item.heapIndex = index;
      this.heap[index] = item;
    }
  };
  __name(_IndexedBinaryHeap, "IndexedBinaryHeap");
  var IndexedBinaryHeap = _IndexedBinaryHeap;

  // src/core/PathCache.ts
  var DEFAULT_PATH_CACHE_CONFIG = {
    maxEntries: 1e3,
    ttlMs: 5e3,
    enableApproximateMatch: false,
    approximateRange: 2
  };
  var _PathCache = class _PathCache {
    constructor(config = {}) {
      __publicField(this, "config");
      __publicField(this, "cache");
      __publicField(this, "accessOrder");
      this.config = {
        ...DEFAULT_PATH_CACHE_CONFIG,
        ...config
      };
      this.cache = /* @__PURE__ */ new Map();
      this.accessOrder = [];
    }
    /**
     * @zh 获取缓存的路径
     * @en Get cached path
     *
     * @param startX - @zh 起点 X 坐标 @en Start X coordinate
     * @param startY - @zh 起点 Y 坐标 @en Start Y coordinate
     * @param endX - @zh 终点 X 坐标 @en End X coordinate
     * @param endY - @zh 终点 Y 坐标 @en End Y coordinate
     * @param mapVersion - @zh 地图版本号 @en Map version number
     * @returns @zh 缓存的路径结果或 null @en Cached path result or null
     */
    get(startX, startY, endX, endY, mapVersion) {
      const key = this.generateKey(startX, startY, endX, endY);
      const entry = this.cache.get(key);
      if (!entry) {
        if (this.config.enableApproximateMatch) {
          return this.getApproximate(startX, startY, endX, endY, mapVersion);
        }
        return null;
      }
      if (!this.isValid(entry, mapVersion)) {
        this.cache.delete(key);
        this.removeFromAccessOrder(key);
        return null;
      }
      this.updateAccessOrder(key);
      return entry.result;
    }
    /**
     * @zh 设置缓存路径
     * @en Set cached path
     *
     * @param startX - @zh 起点 X 坐标 @en Start X coordinate
     * @param startY - @zh 起点 Y 坐标 @en Start Y coordinate
     * @param endX - @zh 终点 X 坐标 @en End X coordinate
     * @param endY - @zh 终点 Y 坐标 @en End Y coordinate
     * @param result - @zh 路径结果 @en Path result
     * @param mapVersion - @zh 地图版本号 @en Map version number
     */
    set(startX, startY, endX, endY, result, mapVersion) {
      if (this.cache.size >= this.config.maxEntries) {
        this.evictLRU();
      }
      const key = this.generateKey(startX, startY, endX, endY);
      const entry = {
        result,
        timestamp: Date.now(),
        mapVersion
      };
      this.cache.set(key, entry);
      this.updateAccessOrder(key);
    }
    /**
     * @zh 使所有缓存失效
     * @en Invalidate all cache
     */
    invalidateAll() {
      this.cache.clear();
      this.accessOrder.length = 0;
    }
    /**
     * @zh 使指定区域的缓存失效
     * @en Invalidate cache for specified region
     *
     * @param minX - @zh 最小 X 坐标 @en Minimum X coordinate
     * @param minY - @zh 最小 Y 坐标 @en Minimum Y coordinate
     * @param maxX - @zh 最大 X 坐标 @en Maximum X coordinate
     * @param maxY - @zh 最大 Y 坐标 @en Maximum Y coordinate
     */
    invalidateRegion(minX, minY, maxX, maxY) {
      const keysToDelete = [];
      for (const [key, entry] of this.cache) {
        const path = entry.result.path;
        if (path.length === 0) continue;
        for (const point of path) {
          if (point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY) {
            keysToDelete.push(key);
            break;
          }
        }
      }
      for (const key of keysToDelete) {
        this.cache.delete(key);
        this.removeFromAccessOrder(key);
      }
    }
    /**
     * @zh 获取缓存统计信息
     * @en Get cache statistics
     */
    getStats() {
      return {
        size: this.cache.size,
        maxSize: this.config.maxEntries
      };
    }
    /**
     * @zh 清理过期条目
     * @en Clean up expired entries
     */
    cleanup() {
      if (this.config.ttlMs === 0) return;
      const now = Date.now();
      const keysToDelete = [];
      for (const [key, entry] of this.cache) {
        if (now - entry.timestamp > this.config.ttlMs) {
          keysToDelete.push(key);
        }
      }
      for (const key of keysToDelete) {
        this.cache.delete(key);
        this.removeFromAccessOrder(key);
      }
    }
    // =========================================================================
    // 私有方法 | Private Methods
    // =========================================================================
    generateKey(startX, startY, endX, endY) {
      return `${startX},${startY}->${endX},${endY}`;
    }
    isValid(entry, mapVersion) {
      if (entry.mapVersion !== mapVersion) {
        return false;
      }
      if (this.config.ttlMs > 0) {
        const age = Date.now() - entry.timestamp;
        if (age > this.config.ttlMs) {
          return false;
        }
      }
      return true;
    }
    getApproximate(startX, startY, endX, endY, mapVersion) {
      const range = this.config.approximateRange;
      for (let sx = startX - range; sx <= startX + range; sx++) {
        for (let sy = startY - range; sy <= startY + range; sy++) {
          for (let ex = endX - range; ex <= endX + range; ex++) {
            for (let ey = endY - range; ey <= endY + range; ey++) {
              const key = this.generateKey(sx, sy, ex, ey);
              const entry = this.cache.get(key);
              if (entry && this.isValid(entry, mapVersion)) {
                this.updateAccessOrder(key);
                return this.adjustPathForApproximate(entry.result, startX, startY, endX, endY);
              }
            }
          }
        }
      }
      return null;
    }
    adjustPathForApproximate(result, newStartX, newStartY, newEndX, newEndY) {
      if (result.path.length === 0) {
        return result;
      }
      const newPath = [];
      const oldStart = result.path[0];
      const oldEnd = result.path[result.path.length - 1];
      if (newStartX !== oldStart.x || newStartY !== oldStart.y) {
        newPath.push({
          x: newStartX,
          y: newStartY
        });
      }
      newPath.push(...result.path);
      if (newEndX !== oldEnd.x || newEndY !== oldEnd.y) {
        newPath.push({
          x: newEndX,
          y: newEndY
        });
      }
      return {
        ...result,
        path: newPath
      };
    }
    updateAccessOrder(key) {
      this.removeFromAccessOrder(key);
      this.accessOrder.push(key);
    }
    removeFromAccessOrder(key) {
      const index = this.accessOrder.indexOf(key);
      if (index !== -1) {
        this.accessOrder.splice(index, 1);
      }
    }
    evictLRU() {
      const lruKey = this.accessOrder.shift();
      if (lruKey) {
        this.cache.delete(lruKey);
      }
    }
  };
  __name(_PathCache, "PathCache");
  var PathCache = _PathCache;
  function createPathCache(config) {
    return new PathCache(config);
  }
  __name(createPathCache, "createPathCache");

  // src/core/IncrementalAStarPathfinder.ts
  var _IncrementalAStarPathfinder = class _IncrementalAStarPathfinder {
    /**
     * @zh 创建增量 A* 寻路器
     * @en Create incremental A* pathfinder
     *
     * @param map - @zh 寻路地图实例 @en Pathfinding map instance
     * @param config - @zh 配置选项 @en Configuration options
     */
    constructor(map, config) {
      __publicField(this, "map");
      __publicField(this, "sessions", /* @__PURE__ */ new Map());
      __publicField(this, "nextRequestId", 0);
      __publicField(this, "affectedRegions", []);
      __publicField(this, "maxRegionAge", 5e3);
      __publicField(this, "cache");
      __publicField(this, "enableCache");
      __publicField(this, "mapVersion", 0);
      __publicField(this, "cacheHits", 0);
      __publicField(this, "cacheMisses", 0);
      this.map = map;
      this.enableCache = config?.enableCache ?? false;
      this.cache = this.enableCache ? new PathCache(config?.cacheConfig) : null;
    }
    /**
     * @zh 请求寻路（非阻塞）
     * @en Request pathfinding (non-blocking)
     */
    requestPath(startX, startY, endX, endY, options) {
      const id = this.nextRequestId++;
      const priority = options?.priority ?? 50;
      const opts = {
        ...DEFAULT_PATHFINDING_OPTIONS,
        ...options
      };
      const request = {
        id,
        startX,
        startY,
        endX,
        endY,
        options: opts,
        priority,
        createdAt: Date.now()
      };
      if (this.cache) {
        const cached = this.cache.get(startX, startY, endX, endY, this.mapVersion);
        if (cached) {
          this.cacheHits++;
          const session2 = {
            request,
            state: cached.found ? PathfindingState.Completed : PathfindingState.Failed,
            options: opts,
            openList: new IndexedBinaryHeap((a, b) => a.f - b.f),
            nodeCache: /* @__PURE__ */ new Map(),
            startNode: this.map.getNodeAt(startX, startY),
            endNode: this.map.getNodeAt(endX, endY),
            endPosition: {
              x: endX,
              y: endY
            },
            nodesSearched: cached.nodesSearched,
            framesUsed: 0,
            initialDistance: 0,
            result: {
              requestId: id,
              found: cached.found,
              path: [
                ...cached.path
              ],
              cost: cached.cost,
              nodesSearched: cached.nodesSearched,
              framesUsed: 0,
              isPartial: false
            },
            affectedByChange: false
          };
          this.sessions.set(id, session2);
          return request;
        }
        this.cacheMisses++;
      }
      const startNode = this.map.getNodeAt(startX, startY);
      const endNode = this.map.getNodeAt(endX, endY);
      if (!startNode || !endNode || !startNode.walkable || !endNode.walkable) {
        const session2 = {
          request,
          state: PathfindingState.Failed,
          options: opts,
          openList: new IndexedBinaryHeap((a, b) => a.f - b.f),
          nodeCache: /* @__PURE__ */ new Map(),
          startNode,
          endNode,
          endPosition: endNode?.position ?? {
            x: endX,
            y: endY
          },
          nodesSearched: 0,
          framesUsed: 0,
          initialDistance: 0,
          result: this.createEmptyResult(id),
          affectedByChange: false
        };
        this.sessions.set(id, session2);
        return request;
      }
      if (startNode.id === endNode.id) {
        const session2 = {
          request,
          state: PathfindingState.Completed,
          options: opts,
          openList: new IndexedBinaryHeap((a, b) => a.f - b.f),
          nodeCache: /* @__PURE__ */ new Map(),
          startNode,
          endNode,
          endPosition: endNode.position,
          nodesSearched: 1,
          framesUsed: 0,
          initialDistance: 0,
          result: {
            requestId: id,
            found: true,
            path: [
              startNode.position
            ],
            cost: 0,
            nodesSearched: 1,
            framesUsed: 0,
            isPartial: false
          },
          affectedByChange: false
        };
        this.sessions.set(id, session2);
        return request;
      }
      const initialDistance = this.map.heuristic(startNode.position, endNode.position);
      const openList = new IndexedBinaryHeap((a, b) => a.f - b.f);
      const nodeCache = /* @__PURE__ */ new Map();
      const startAStarNode = {
        node: startNode,
        g: 0,
        h: initialDistance * opts.heuristicWeight,
        f: initialDistance * opts.heuristicWeight,
        parent: null,
        closed: false,
        opened: true,
        heapIndex: -1
      };
      nodeCache.set(startNode.id, startAStarNode);
      openList.push(startAStarNode);
      const session = {
        request,
        state: PathfindingState.InProgress,
        options: opts,
        openList,
        nodeCache,
        startNode,
        endNode,
        endPosition: endNode.position,
        nodesSearched: 0,
        framesUsed: 0,
        initialDistance,
        result: null,
        affectedByChange: false
      };
      this.sessions.set(id, session);
      return request;
    }
    /**
     * @zh 执行一步搜索
     * @en Execute one step of search
     */
    step(requestId, maxIterations) {
      const session = this.sessions.get(requestId);
      if (!session) {
        return EMPTY_PROGRESS;
      }
      if (session.state !== PathfindingState.InProgress) {
        return this.createProgress(session);
      }
      session.framesUsed++;
      let iterations = 0;
      while (!session.openList.isEmpty && iterations < maxIterations) {
        const current = session.openList.pop();
        current.closed = true;
        session.nodesSearched++;
        iterations++;
        if (current.node.id === session.endNode.id) {
          session.state = PathfindingState.Completed;
          session.result = this.buildResult(session, current);
          if (this.cache && session.result.found) {
            const req = session.request;
            this.cache.set(req.startX, req.startY, req.endX, req.endY, {
              found: true,
              path: session.result.path,
              cost: session.result.cost,
              nodesSearched: session.result.nodesSearched
            }, this.mapVersion);
          }
          return this.createProgress(session);
        }
        this.expandNeighbors(session, current);
        if (session.nodesSearched >= session.options.maxNodes) {
          session.state = PathfindingState.Failed;
          session.result = this.createEmptyResult(requestId);
          return this.createProgress(session);
        }
      }
      if (session.openList.isEmpty && session.state === PathfindingState.InProgress) {
        session.state = PathfindingState.Failed;
        session.result = this.createEmptyResult(requestId);
      }
      return this.createProgress(session);
    }
    /**
     * @zh 暂停寻路
     * @en Pause pathfinding
     */
    pause(requestId) {
      const session = this.sessions.get(requestId);
      if (session && session.state === PathfindingState.InProgress) {
        session.state = PathfindingState.Paused;
      }
    }
    /**
     * @zh 恢复寻路
     * @en Resume pathfinding
     */
    resume(requestId) {
      const session = this.sessions.get(requestId);
      if (session && session.state === PathfindingState.Paused) {
        session.state = PathfindingState.InProgress;
      }
    }
    /**
     * @zh 取消寻路
     * @en Cancel pathfinding
     */
    cancel(requestId) {
      const session = this.sessions.get(requestId);
      if (session && (session.state === PathfindingState.InProgress || session.state === PathfindingState.Paused)) {
        session.state = PathfindingState.Cancelled;
        session.result = this.createEmptyResult(requestId);
      }
    }
    /**
     * @zh 获取寻路结果
     * @en Get pathfinding result
     */
    getResult(requestId) {
      const session = this.sessions.get(requestId);
      return session?.result ?? null;
    }
    /**
     * @zh 获取当前进度
     * @en Get current progress
     */
    getProgress(requestId) {
      const session = this.sessions.get(requestId);
      return session ? this.createProgress(session) : null;
    }
    /**
     * @zh 清理已完成的请求
     * @en Clean up completed request
     */
    cleanup(requestId) {
      const session = this.sessions.get(requestId);
      if (session) {
        session.openList.clear();
        session.nodeCache.clear();
        this.sessions.delete(requestId);
      }
    }
    /**
     * @zh 通知障碍物变化
     * @en Notify obstacle change
     */
    notifyObstacleChange(minX, minY, maxX, maxY) {
      this.mapVersion++;
      if (this.cache) {
        this.cache.invalidateRegion(minX, minY, maxX, maxY);
      }
      const region = {
        minX,
        minY,
        maxX,
        maxY,
        timestamp: Date.now()
      };
      this.affectedRegions.push(region);
      for (const session of this.sessions.values()) {
        if (session.state === PathfindingState.InProgress || session.state === PathfindingState.Paused) {
          if (this.sessionAffectedByRegion(session, region)) {
            session.affectedByChange = true;
          }
        }
      }
      this.cleanupOldRegions();
    }
    /**
     * @zh 清理所有请求
     * @en Clear all requests
     */
    clear() {
      for (const session of this.sessions.values()) {
        session.openList.clear();
        session.nodeCache.clear();
      }
      this.sessions.clear();
      this.affectedRegions.length = 0;
    }
    /**
     * @zh 清空路径缓存
     * @en Clear path cache
     */
    clearCache() {
      if (this.cache) {
        this.cache.invalidateAll();
        this.cacheHits = 0;
        this.cacheMisses = 0;
      }
    }
    /**
     * @zh 获取缓存统计信息
     * @en Get cache statistics
     */
    getCacheStats() {
      if (!this.cache) {
        return {
          enabled: false,
          hits: 0,
          misses: 0,
          hitRate: 0,
          size: 0
        };
      }
      const total = this.cacheHits + this.cacheMisses;
      const hitRate = total > 0 ? this.cacheHits / total : 0;
      return {
        enabled: true,
        hits: this.cacheHits,
        misses: this.cacheMisses,
        hitRate,
        size: this.cache.getStats().size
      };
    }
    /**
     * @zh 检查会话是否被障碍物变化影响
     * @en Check if session is affected by obstacle change
     */
    isAffectedByChange(requestId) {
      const session = this.sessions.get(requestId);
      return session?.affectedByChange ?? false;
    }
    /**
     * @zh 清除会话的变化标记
     * @en Clear session's change flag
     */
    clearChangeFlag(requestId) {
      const session = this.sessions.get(requestId);
      if (session) {
        session.affectedByChange = false;
      }
    }
    // =========================================================================
    // 私有方法 | Private Methods
    // =========================================================================
    /**
     * @zh 展开邻居节点
     * @en Expand neighbor nodes
     */
    expandNeighbors(session, current) {
      const neighbors = this.map.getNeighbors(current.node);
      for (const neighborNode of neighbors) {
        if (!neighborNode.walkable) {
          continue;
        }
        let neighbor = session.nodeCache.get(neighborNode.id);
        if (!neighbor) {
          neighbor = {
            node: neighborNode,
            g: Infinity,
            h: 0,
            f: Infinity,
            parent: null,
            closed: false,
            opened: false,
            heapIndex: -1
          };
          session.nodeCache.set(neighborNode.id, neighbor);
        }
        if (neighbor.closed) {
          continue;
        }
        const movementCost = this.map.getMovementCost(current.node, neighborNode);
        const tentativeG = current.g + movementCost;
        if (!neighbor.opened) {
          neighbor.g = tentativeG;
          neighbor.h = this.map.heuristic(neighborNode.position, session.endPosition) * session.options.heuristicWeight;
          neighbor.f = neighbor.g + neighbor.h;
          neighbor.parent = current;
          neighbor.opened = true;
          session.openList.push(neighbor);
        } else if (tentativeG < neighbor.g) {
          neighbor.g = tentativeG;
          neighbor.f = neighbor.g + neighbor.h;
          neighbor.parent = current;
          session.openList.update(neighbor);
        }
      }
    }
    /**
     * @zh 创建进度对象
     * @en Create progress object
     */
    createProgress(session) {
      let estimatedProgress = 0;
      if (session.state === PathfindingState.Completed) {
        estimatedProgress = 1;
      } else if (session.state === PathfindingState.InProgress && session.initialDistance > 0) {
        const bestNode = session.openList.peek();
        if (bestNode) {
          const currentDistance = bestNode.h / session.options.heuristicWeight;
          estimatedProgress = Math.max(0, Math.min(1, 1 - currentDistance / session.initialDistance));
        }
      }
      return {
        state: session.state,
        nodesSearched: session.nodesSearched,
        openListSize: session.openList.size,
        estimatedProgress
      };
    }
    /**
     * @zh 构建路径结果
     * @en Build path result
     */
    buildResult(session, endNode) {
      const path = [];
      let current = endNode;
      while (current) {
        path.push(current.node.position);
        current = current.parent;
      }
      path.reverse();
      return {
        requestId: session.request.id,
        found: true,
        path,
        cost: endNode.g,
        nodesSearched: session.nodesSearched,
        framesUsed: session.framesUsed,
        isPartial: false
      };
    }
    /**
     * @zh 创建空结果
     * @en Create empty result
     */
    createEmptyResult(requestId) {
      return {
        requestId,
        found: false,
        path: [],
        cost: 0,
        nodesSearched: 0,
        framesUsed: 0,
        isPartial: false
      };
    }
    /**
     * @zh 检查会话是否被区域影响
     * @en Check if session is affected by region
     */
    sessionAffectedByRegion(session, region) {
      for (const astarNode of session.nodeCache.values()) {
        if (astarNode.opened || astarNode.closed) {
          const pos = astarNode.node.position;
          if (pos.x >= region.minX && pos.x <= region.maxX && pos.y >= region.minY && pos.y <= region.maxY) {
            return true;
          }
        }
      }
      const start = session.request;
      const end = session.endPosition;
      if (start.startX >= region.minX && start.startX <= region.maxX && start.startY >= region.minY && start.startY <= region.maxY || end.x >= region.minX && end.x <= region.maxX && end.y >= region.minY && end.y <= region.maxY) {
        return true;
      }
      return false;
    }
    /**
     * @zh 清理过期的变化区域
     * @en Clean up expired change regions
     */
    cleanupOldRegions() {
      const now = Date.now();
      let i = 0;
      while (i < this.affectedRegions.length) {
        if (now - this.affectedRegions[i].timestamp > this.maxRegionAge) {
          this.affectedRegions.splice(i, 1);
        } else {
          i++;
        }
      }
    }
  };
  __name(_IncrementalAStarPathfinder, "IncrementalAStarPathfinder");
  var IncrementalAStarPathfinder = _IncrementalAStarPathfinder;
  function createIncrementalAStarPathfinder(map) {
    return new IncrementalAStarPathfinder(map);
  }
  __name(createIncrementalAStarPathfinder, "createIncrementalAStarPathfinder");

  // src/core/PathValidator.ts
  var _PathValidator = class _PathValidator {
    /**
     * @zh 验证路径段的有效性
     * @en Validate path segment validity
     *
     * @param path - @zh 要验证的路径 @en Path to validate
     * @param fromIndex - @zh 起始索引 @en Start index
     * @param toIndex - @zh 结束索引 @en End index
     * @param map - @zh 地图实例 @en Map instance
     * @returns @zh 验证结果 @en Validation result
     */
    validatePath(path, fromIndex, toIndex, map) {
      const end = Math.min(toIndex, path.length);
      for (let i = fromIndex; i < end; i++) {
        const point = path[i];
        const x = Math.floor(point.x);
        const y = Math.floor(point.y);
        if (!map.isWalkable(x, y)) {
          return {
            valid: false,
            invalidIndex: i
          };
        }
        if (i > fromIndex) {
          const prev = path[i - 1];
          if (!this.checkLineOfSight(prev.x, prev.y, point.x, point.y, map)) {
            return {
              valid: false,
              invalidIndex: i
            };
          }
        }
      }
      return {
        valid: true,
        invalidIndex: -1
      };
    }
    /**
     * @zh 检查两点之间的视线（使用 Bresenham 算法）
     * @en Check line of sight between two points (using Bresenham algorithm)
     *
     * @param x1 - @zh 起点 X @en Start X
     * @param y1 - @zh 起点 Y @en Start Y
     * @param x2 - @zh 终点 X @en End X
     * @param y2 - @zh 终点 Y @en End Y
     * @param map - @zh 地图实例 @en Map instance
     * @returns @zh 是否有视线 @en Whether there is line of sight
     */
    checkLineOfSight(x1, y1, x2, y2, map) {
      const ix1 = Math.floor(x1);
      const iy1 = Math.floor(y1);
      const ix2 = Math.floor(x2);
      const iy2 = Math.floor(y2);
      let dx = Math.abs(ix2 - ix1);
      let dy = Math.abs(iy2 - iy1);
      let x = ix1;
      let y = iy1;
      const sx = ix1 < ix2 ? 1 : -1;
      const sy = iy1 < iy2 ? 1 : -1;
      if (dx > dy) {
        let err = dx / 2;
        while (x !== ix2) {
          if (!map.isWalkable(x, y)) {
            return false;
          }
          err -= dy;
          if (err < 0) {
            y += sy;
            err += dx;
          }
          x += sx;
        }
      } else {
        let err = dy / 2;
        while (y !== iy2) {
          if (!map.isWalkable(x, y)) {
            return false;
          }
          err -= dx;
          if (err < 0) {
            x += sx;
            err += dy;
          }
          y += sy;
        }
      }
      return map.isWalkable(ix2, iy2);
    }
  };
  __name(_PathValidator, "PathValidator");
  var PathValidator = _PathValidator;
  var _ObstacleChangeManager = class _ObstacleChangeManager {
    constructor() {
      __publicField(this, "changes", /* @__PURE__ */ new Map());
      __publicField(this, "epoch", 0);
    }
    /**
     * @zh 记录障碍物变化
     * @en Record obstacle change
     *
     * @param x - @zh X 坐标 @en X coordinate
     * @param y - @zh Y 坐标 @en Y coordinate
     * @param wasWalkable - @zh 变化前是否可通行 @en Was walkable before change
     */
    recordChange(x, y, wasWalkable) {
      const key = `${x},${y}`;
      this.changes.set(key, {
        x,
        y,
        wasWalkable,
        timestamp: Date.now()
      });
    }
    /**
     * @zh 获取影响区域
     * @en Get affected region
     *
     * @returns @zh 影响区域或 null（如果没有变化）@en Affected region or null if no changes
     */
    getAffectedRegion() {
      if (this.changes.size === 0) {
        return null;
      }
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      for (const change of this.changes.values()) {
        minX = Math.min(minX, change.x);
        minY = Math.min(minY, change.y);
        maxX = Math.max(maxX, change.x);
        maxY = Math.max(maxY, change.y);
      }
      return {
        minX,
        minY,
        maxX,
        maxY
      };
    }
    /**
     * @zh 获取所有变化
     * @en Get all changes
     *
     * @returns @zh 变化列表 @en List of changes
     */
    getChanges() {
      return Array.from(this.changes.values());
    }
    /**
     * @zh 检查是否有变化
     * @en Check if there are changes
     *
     * @returns @zh 是否有变化 @en Whether there are changes
     */
    hasChanges() {
      return this.changes.size > 0;
    }
    /**
     * @zh 获取当前 epoch
     * @en Get current epoch
     *
     * @returns @zh 当前 epoch @en Current epoch
     */
    getEpoch() {
      return this.epoch;
    }
    /**
     * @zh 清空变化记录并推进 epoch
     * @en Clear changes and advance epoch
     */
    flush() {
      this.changes.clear();
      this.epoch++;
    }
    /**
     * @zh 清空所有状态
     * @en Clear all state
     */
    clear() {
      this.changes.clear();
      this.epoch = 0;
    }
  };
  __name(_ObstacleChangeManager, "ObstacleChangeManager");
  var ObstacleChangeManager = _ObstacleChangeManager;
  function createPathValidator() {
    return new PathValidator();
  }
  __name(createPathValidator, "createPathValidator");
  function createObstacleChangeManager() {
    return new ObstacleChangeManager();
  }
  __name(createObstacleChangeManager, "createObstacleChangeManager");

  // src/grid/GridMap.ts
  var _GridNode = class _GridNode {
    constructor(x, y, width, walkable = true, cost = 1) {
      __publicField(this, "id");
      __publicField(this, "position");
      __publicField(this, "x");
      __publicField(this, "y");
      __publicField(this, "cost");
      __publicField(this, "walkable");
      this.x = x;
      this.y = y;
      this.id = y * width + x;
      this.position = createPoint(x, y);
      this.walkable = walkable;
      this.cost = cost;
    }
  };
  __name(_GridNode, "GridNode");
  var GridNode = _GridNode;
  var DIRECTIONS_4 = [
    {
      dx: 0,
      dy: -1
    },
    {
      dx: 1,
      dy: 0
    },
    {
      dx: 0,
      dy: 1
    },
    {
      dx: -1,
      dy: 0
    }
    // Left
  ];
  var DIRECTIONS_8 = [
    {
      dx: 0,
      dy: -1
    },
    {
      dx: 1,
      dy: -1
    },
    {
      dx: 1,
      dy: 0
    },
    {
      dx: 1,
      dy: 1
    },
    {
      dx: 0,
      dy: 1
    },
    {
      dx: -1,
      dy: 1
    },
    {
      dx: -1,
      dy: 0
    },
    {
      dx: -1,
      dy: -1
    }
    // Up-Left
  ];
  var DEFAULT_GRID_OPTIONS = {
    allowDiagonal: true,
    diagonalCost: Math.SQRT2,
    avoidCorners: true,
    heuristic: octileDistance
  };
  var _GridMap = class _GridMap {
    constructor(width, height, options) {
      __publicField(this, "width");
      __publicField(this, "height");
      __publicField(this, "nodes");
      __publicField(this, "options");
      this.width = width;
      this.height = height;
      this.options = {
        ...DEFAULT_GRID_OPTIONS,
        ...options
      };
      this.nodes = this.createNodes();
    }
    /**
     * @zh 创建网格节点
     * @en Create grid nodes
     */
    createNodes() {
      const nodes = [];
      for (let y = 0; y < this.height; y++) {
        nodes[y] = [];
        for (let x = 0; x < this.width; x++) {
          nodes[y][x] = new GridNode(x, y, this.width, true, 1);
        }
      }
      return nodes;
    }
    /**
     * @zh 获取指定位置的节点
     * @en Get node at position
     */
    getNodeAt(x, y) {
      if (!this.isInBounds(x, y)) {
        return null;
      }
      return this.nodes[y][x];
    }
    /**
     * @zh 检查坐标是否在边界内
     * @en Check if coordinates are within bounds
     */
    isInBounds(x, y) {
      return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }
    /**
     * @zh 检查位置是否可通行
     * @en Check if position is walkable
     */
    isWalkable(x, y) {
      const node = this.getNodeAt(x, y);
      return node !== null && node.walkable;
    }
    /**
     * @zh 设置位置是否可通行
     * @en Set position walkability
     */
    setWalkable(x, y, walkable) {
      const node = this.getNodeAt(x, y);
      if (node) {
        node.walkable = walkable;
      }
    }
    /**
     * @zh 设置位置的移动代价
     * @en Set movement cost at position
     */
    setCost(x, y, cost) {
      const node = this.getNodeAt(x, y);
      if (node) {
        node.cost = cost;
      }
    }
    /**
     * @zh 获取节点的邻居
     * @en Get neighbors of a node
     */
    getNeighbors(node) {
      const neighbors = [];
      const { x, y } = node.position;
      const directions = this.options.allowDiagonal ? DIRECTIONS_8 : DIRECTIONS_4;
      for (let i = 0; i < directions.length; i++) {
        const dir = directions[i];
        const nx = x + dir.dx;
        const ny = y + dir.dy;
        if (nx < 0 || nx >= this.width || ny < 0 || ny >= this.height) {
          continue;
        }
        const neighbor = this.nodes[ny][nx];
        if (!neighbor.walkable) {
          continue;
        }
        if (this.options.avoidCorners && dir.dx !== 0 && dir.dy !== 0) {
          const hNode = this.nodes[y][x + dir.dx];
          const vNode = this.nodes[y + dir.dy][x];
          if (!hNode.walkable || !vNode.walkable) {
            continue;
          }
        }
        neighbors.push(neighbor);
      }
      return neighbors;
    }
    /**
     * @zh 遍历节点的邻居（零分配）
     * @en Iterate over neighbors (zero allocation)
     */
    forEachNeighbor(node, callback) {
      const { x, y } = node.position;
      const directions = this.options.allowDiagonal ? DIRECTIONS_8 : DIRECTIONS_4;
      for (let i = 0; i < directions.length; i++) {
        const dir = directions[i];
        const nx = x + dir.dx;
        const ny = y + dir.dy;
        if (nx < 0 || nx >= this.width || ny < 0 || ny >= this.height) {
          continue;
        }
        const neighbor = this.nodes[ny][nx];
        if (!neighbor.walkable) {
          continue;
        }
        if (this.options.avoidCorners && dir.dx !== 0 && dir.dy !== 0) {
          const hNode = this.nodes[y][x + dir.dx];
          const vNode = this.nodes[y + dir.dy][x];
          if (!hNode.walkable || !vNode.walkable) {
            continue;
          }
        }
        if (callback(neighbor) === false) {
          return;
        }
      }
    }
    /**
     * @zh 计算启发式距离
     * @en Calculate heuristic distance
     */
    heuristic(a, b) {
      return this.options.heuristic(a, b);
    }
    /**
     * @zh 计算移动代价
     * @en Calculate movement cost
     */
    getMovementCost(from, to) {
      const dx = Math.abs(from.position.x - to.position.x);
      const dy = Math.abs(from.position.y - to.position.y);
      if (dx !== 0 && dy !== 0) {
        return to.cost * this.options.diagonalCost;
      }
      return to.cost;
    }
    /**
     * @zh 从二维数组加载地图
     * @en Load map from 2D array
     *
     * @param data - @zh 0=可通行，非0=不可通行 @en 0=walkable, non-0=blocked
     */
    loadFromArray(data) {
      for (let y = 0; y < Math.min(data.length, this.height); y++) {
        for (let x = 0; x < Math.min(data[y].length, this.width); x++) {
          this.nodes[y][x].walkable = data[y][x] === 0;
        }
      }
    }
    /**
     * @zh 从字符串加载地图
     * @en Load map from string
     *
     * @param str - @zh 地图字符串，'.'=可通行，'#'=障碍 @en Map string, '.'=walkable, '#'=blocked
     */
    loadFromString(str) {
      const lines = str.trim().split("\n");
      for (let y = 0; y < Math.min(lines.length, this.height); y++) {
        const line = lines[y];
        for (let x = 0; x < Math.min(line.length, this.width); x++) {
          this.nodes[y][x].walkable = line[x] !== "#";
        }
      }
    }
    /**
     * @zh 导出为字符串
     * @en Export to string
     */
    toString() {
      let result = "";
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          result += this.nodes[y][x].walkable ? "." : "#";
        }
        result += "\n";
      }
      return result;
    }
    /**
     * @zh 重置所有节点为可通行
     * @en Reset all nodes to walkable
     */
    reset() {
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          this.nodes[y][x].walkable = true;
          this.nodes[y][x].cost = 1;
        }
      }
    }
    /**
     * @zh 设置矩形区域的通行性
     * @en Set walkability for a rectangle region
     */
    setRectWalkable(x, y, width, height, walkable) {
      for (let dy = 0; dy < height; dy++) {
        for (let dx = 0; dx < width; dx++) {
          this.setWalkable(x + dx, y + dy, walkable);
        }
      }
    }
  };
  __name(_GridMap, "GridMap");
  var GridMap = _GridMap;
  function createGridMap(width, height, options) {
    return new GridMap(width, height, options);
  }
  __name(createGridMap, "createGridMap");

  // src/smoothing/PathSmoother.ts
  function bresenhamLineOfSight(x1, y1, x2, y2, map) {
    let ix1 = Math.floor(x1);
    let iy1 = Math.floor(y1);
    const ix2 = Math.floor(x2);
    const iy2 = Math.floor(y2);
    const dx = Math.abs(ix2 - ix1);
    const dy = Math.abs(iy2 - iy1);
    const sx = ix1 < ix2 ? 1 : -1;
    const sy = iy1 < iy2 ? 1 : -1;
    let err = dx - dy;
    while (true) {
      if (!map.isWalkable(ix1, iy1)) {
        return false;
      }
      if (ix1 === ix2 && iy1 === iy2) {
        break;
      }
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        ix1 += sx;
      }
      if (e2 < dx) {
        err += dx;
        iy1 += sy;
      }
    }
    return true;
  }
  __name(bresenhamLineOfSight, "bresenhamLineOfSight");
  function raycastLineOfSight(x1, y1, x2, y2, map, stepSize = 0.5) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance === 0) {
      return map.isWalkable(Math.floor(x1), Math.floor(y1));
    }
    const steps = Math.ceil(distance / stepSize);
    const stepX = dx / steps;
    const stepY = dy / steps;
    let x = x1;
    let y = y1;
    for (let i = 0; i <= steps; i++) {
      if (!map.isWalkable(Math.floor(x), Math.floor(y))) {
        return false;
      }
      x += stepX;
      y += stepY;
    }
    return true;
  }
  __name(raycastLineOfSight, "raycastLineOfSight");
  var _LineOfSightSmoother = class _LineOfSightSmoother {
    constructor(lineOfSight = bresenhamLineOfSight) {
      __publicField(this, "lineOfSight");
      this.lineOfSight = lineOfSight;
    }
    smooth(path, map) {
      if (path.length <= 2) {
        return [
          ...path
        ];
      }
      const result = [
        path[0]
      ];
      let current = 0;
      while (current < path.length - 1) {
        let furthest = current + 1;
        for (let i = path.length - 1; i > current + 1; i--) {
          if (this.lineOfSight(path[current].x, path[current].y, path[i].x, path[i].y, map)) {
            furthest = i;
            break;
          }
        }
        result.push(path[furthest]);
        current = furthest;
      }
      return result;
    }
  };
  __name(_LineOfSightSmoother, "LineOfSightSmoother");
  var LineOfSightSmoother = _LineOfSightSmoother;
  var _CatmullRomSmoother = class _CatmullRomSmoother {
    /**
     * @param segments - @zh 每段之间的插值点数 @en Number of interpolation points per segment
     * @param tension - @zh 张力 (0-1) @en Tension (0-1)
     */
    constructor(segments = 5, tension = 0.5) {
      __publicField(this, "segments");
      __publicField(this, "tension");
      this.segments = segments;
      this.tension = tension;
    }
    smooth(path, _map) {
      if (path.length <= 2) {
        return [
          ...path
        ];
      }
      const result = [];
      const points = [
        path[0],
        ...path,
        path[path.length - 1]
      ];
      for (let i = 1; i < points.length - 2; i++) {
        const p0 = points[i - 1];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2];
        for (let j = 0; j < this.segments; j++) {
          const t = j / this.segments;
          const point = this.interpolate(p0, p1, p2, p3, t);
          result.push(point);
        }
      }
      result.push(path[path.length - 1]);
      return result;
    }
    /**
     * @zh Catmull-Rom 插值
     * @en Catmull-Rom interpolation
     */
    interpolate(p0, p1, p2, p3, t) {
      const t2 = t * t;
      const t3 = t2 * t;
      const tension = this.tension;
      const x = 0.5 * (2 * p1.x + (-p0.x + p2.x) * t * tension + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 * tension + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3 * tension);
      const y = 0.5 * (2 * p1.y + (-p0.y + p2.y) * t * tension + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 * tension + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3 * tension);
      return createPoint(x, y);
    }
  };
  __name(_CatmullRomSmoother, "CatmullRomSmoother");
  var CatmullRomSmoother = _CatmullRomSmoother;
  var _CombinedSmoother = class _CombinedSmoother {
    constructor(curveSegments = 5, tension = 0.5) {
      __publicField(this, "simplifier");
      __publicField(this, "curveSmoother");
      this.simplifier = new LineOfSightSmoother();
      this.curveSmoother = new CatmullRomSmoother(curveSegments, tension);
    }
    smooth(path, map) {
      const simplified = this.simplifier.smooth(path, map);
      return this.curveSmoother.smooth(simplified, map);
    }
  };
  __name(_CombinedSmoother, "CombinedSmoother");
  var CombinedSmoother = _CombinedSmoother;
  function createLineOfSightSmoother(lineOfSight) {
    return new LineOfSightSmoother(lineOfSight);
  }
  __name(createLineOfSightSmoother, "createLineOfSightSmoother");
  function createCatmullRomSmoother(segments, tension) {
    return new CatmullRomSmoother(segments, tension);
  }
  __name(createCatmullRomSmoother, "createCatmullRomSmoother");
  function createCombinedSmoother(curveSegments, tension) {
    return new CombinedSmoother(curveSegments, tension);
  }
  __name(createCombinedSmoother, "createCombinedSmoother");

  // src/avoidance/ILocalAvoidance.ts
  var DEFAULT_ORCA_CONFIG = {
    defaultTimeHorizon: 2,
    defaultTimeHorizonObst: 1,
    timeStep: 1 / 60,
    epsilon: 1e-5
  };
  var DEFAULT_AGENT_PARAMS = {
    radius: 0.5,
    maxSpeed: 5,
    neighborDist: 15,
    maxNeighbors: 10,
    timeHorizon: 2,
    timeHorizonObst: 1
  };
  var EPSILON = 1e-5;
  var { dot, det, lengthSq } = t;
  function linearProgram1(lines, lineNo, radius, optVelocity, directionOpt, result) {
    const line = lines[lineNo];
    const dotProduct = dot(line.point, line.direction);
    const discriminant = dotProduct * dotProduct + radius * radius - lengthSq(line.point);
    if (discriminant < 0) {
      return false;
    }
    const sqrtDiscriminant = Math.sqrt(discriminant);
    let tLeft = -dotProduct - sqrtDiscriminant;
    let tRight = -dotProduct + sqrtDiscriminant;
    for (let i = 0; i < lineNo; i++) {
      const constraint = lines[i];
      const denominator = det(line.direction, constraint.direction);
      const numerator = det(constraint.direction, {
        x: line.point.x - constraint.point.x,
        y: line.point.y - constraint.point.y
      });
      if (Math.abs(denominator) <= EPSILON) {
        if (numerator < 0) {
          return false;
        }
        continue;
      }
      const t2 = numerator / denominator;
      if (denominator >= 0) {
        tRight = Math.min(tRight, t2);
      } else {
        tLeft = Math.max(tLeft, t2);
      }
      if (tLeft > tRight) {
        return false;
      }
    }
    let t;
    if (directionOpt) {
      if (dot(optVelocity, line.direction) > 0) {
        t = tRight;
      } else {
        t = tLeft;
      }
    } else {
      t = dot(line.direction, {
        x: optVelocity.x - line.point.x,
        y: optVelocity.y - line.point.y
      });
      if (t < tLeft) {
        t = tLeft;
      } else if (t > tRight) {
        t = tRight;
      }
    }
    result.x = line.point.x + t * line.direction.x;
    result.y = line.point.y + t * line.direction.y;
    return true;
  }
  __name(linearProgram1, "linearProgram1");
  function linearProgram2(lines, radius, optVelocity, directionOpt, result) {
    if (directionOpt) {
      result.x = optVelocity.x * radius;
      result.y = optVelocity.y * radius;
    } else if (lengthSq(optVelocity) > radius * radius) {
      const len2 = Math.sqrt(lengthSq(optVelocity));
      result.x = optVelocity.x / len2 * radius;
      result.y = optVelocity.y / len2 * radius;
    } else {
      result.x = optVelocity.x;
      result.y = optVelocity.y;
    }
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const detVal = det(line.direction, {
        x: line.point.x - result.x,
        y: line.point.y - result.y
      });
      if (detVal > 0) {
        const tempResult = result.clone();
        if (!linearProgram1(lines, i, radius, optVelocity, directionOpt, result)) {
          result.copy(tempResult);
          return i;
        }
      }
    }
    return lines.length;
  }
  __name(linearProgram2, "linearProgram2");
  function linearProgram3(lines, numObstLines, beginLine, radius, result) {
    let distance = 0;
    for (let i = beginLine; i < lines.length; i++) {
      const line = lines[i];
      if (det(line.direction, {
        x: line.point.x - result.x,
        y: line.point.y - result.y
      }) > distance) {
        const projLines = [];
        for (let j = 0; j < numObstLines; j++) {
          projLines.push(lines[j]);
        }
        for (let j = numObstLines; j < i; j++) {
          const line1 = lines[j];
          const line2 = lines[i];
          let newLine;
          const determinant = det(line1.direction, line2.direction);
          if (Math.abs(determinant) <= EPSILON) {
            if (dot(line1.direction, line2.direction) > 0) {
              continue;
            }
            newLine = {
              point: {
                x: 0.5 * (line1.point.x + line2.point.x),
                y: 0.5 * (line1.point.y + line2.point.y)
              },
              direction: {
                x: 0,
                y: 0
              }
            };
          } else {
            const diff = {
              x: line1.point.x - line2.point.x,
              y: line1.point.y - line2.point.y
            };
            const t = det(line2.direction, diff) / determinant;
            newLine = {
              point: {
                x: line1.point.x + t * line1.direction.x,
                y: line1.point.y + t * line1.direction.y
              },
              direction: {
                x: 0,
                y: 0
              }
            };
          }
          const dirDiff = {
            x: line1.direction.x - line2.direction.x,
            y: line1.direction.y - line2.direction.y
          };
          const dirLen = Math.sqrt(lengthSq(dirDiff));
          if (dirLen > EPSILON) {
            newLine.direction.x = dirDiff.x / dirLen;
            newLine.direction.y = dirDiff.y / dirLen;
          }
          projLines.push(newLine);
        }
        const tempResult = result.clone();
        const optVelocity = {
          x: -lines[i].direction.y,
          y: lines[i].direction.x
        };
        if (linearProgram2(projLines, radius, optVelocity, true, result) < projLines.length) {
          result.copy(tempResult);
        }
        distance = det(lines[i].direction, {
          x: lines[i].point.x - result.x,
          y: lines[i].point.y - result.y
        });
      }
    }
  }
  __name(linearProgram3, "linearProgram3");
  function solveORCALinearProgram(lines, numObstLines, maxSpeed, preferredVelocity) {
    const result = new t();
    const lineFail = linearProgram2(lines, maxSpeed, preferredVelocity, false, result);
    if (lineFail < lines.length) {
      linearProgram3(lines, numObstLines, lineFail, maxSpeed, result);
    }
    return result;
  }
  __name(solveORCALinearProgram, "solveORCALinearProgram");

  // src/avoidance/ObstacleBuilder.ts
  var EPSILON2 = 1e-5;
  function leftOf(p1, p2, p3) {
    return (p1.x - p3.x) * (p2.y - p1.y) - (p1.y - p3.y) * (p2.x - p1.x);
  }
  __name(leftOf, "leftOf");
  function createObstacleVertices(vertices, startId = 0) {
    const n = vertices.length;
    if (n < 2) {
      return [];
    }
    const obstacleVertices = [];
    for (let i = 0; i < n; i++) {
      obstacleVertices.push({
        point: {
          x: vertices[i].x,
          y: vertices[i].y
        },
        direction: {
          x: 0,
          y: 0
        },
        next: null,
        previous: null,
        isConvex: false,
        id: startId + i
      });
    }
    for (let i = 0; i < n; i++) {
      const curr = obstacleVertices[i];
      const next = obstacleVertices[(i + 1) % n];
      const prev = obstacleVertices[(i + n - 1) % n];
      curr.next = next;
      curr.previous = prev;
      const dx = next.point.x - curr.point.x;
      const dy = next.point.y - curr.point.y;
      const edgeLen = Math.sqrt(dx * dx + dy * dy);
      if (edgeLen > EPSILON2) {
        curr.direction = {
          x: dx / edgeLen,
          y: dy / edgeLen
        };
      } else {
        curr.direction = {
          x: 1,
          y: 0
        };
      }
    }
    for (let i = 0; i < n; i++) {
      const curr = obstacleVertices[i];
      const prev = curr.previous;
      const next = curr.next;
      curr.isConvex = leftOf(prev.point, curr.point, next.point) >= 0;
    }
    return obstacleVertices;
  }
  __name(createObstacleVertices, "createObstacleVertices");
  function buildObstacleVertices(obstacles) {
    const allVertices = [];
    let nextId = 0;
    for (const obstacle of obstacles) {
      const vertices = createObstacleVertices(obstacle.vertices, nextId);
      allVertices.push(...vertices);
      nextId += vertices.length;
    }
    return allVertices;
  }
  __name(buildObstacleVertices, "buildObstacleVertices");
  function ensureCCW(vertices, yAxisDown = false) {
    if (vertices.length < 3) {
      return vertices;
    }
    let signedArea = 0;
    for (let i = 0; i < vertices.length; i++) {
      const curr = vertices[i];
      const next = vertices[(i + 1) % vertices.length];
      signedArea += curr.x * next.y - next.x * curr.y;
    }
    signedArea *= 0.5;
    const isCCW = yAxisDown ? signedArea < 0 : signedArea > 0;
    if (isCCW) {
      return vertices;
    }
    return [
      ...vertices
    ].reverse();
  }
  __name(ensureCCW, "ensureCCW");
  var EPSILON3 = 1e-5;
  var { det: det2, dot: dot2, lengthSq: lengthSq2, len } = t;
  function normalize(v) {
    const length = len(v);
    if (length < EPSILON3) {
      return {
        x: 0,
        y: 0
      };
    }
    return {
      x: v.x / length,
      y: v.y / length
    };
  }
  __name(normalize, "normalize");
  var _ORCASolver = class _ORCASolver {
    constructor(config = {}) {
      __publicField(this, "config");
      this.config = {
        ...DEFAULT_ORCA_CONFIG,
        ...config
      };
    }
    /**
     * @zh 计算代理的新速度
     * @en Compute new velocity for agent
     *
     * @param agent - @zh 当前代理 @en Current agent
     * @param neighbors - @zh 邻近代理列表 @en List of neighboring agents
     * @param obstacles - @zh 障碍物列表 @en List of obstacles
     * @param deltaTime - @zh 时间步长 @en Time step
     * @returns @zh 计算得到的新速度 @en Computed new velocity
     */
    computeNewVelocity(agent, neighbors, obstacles, deltaTime) {
      const orcaLines = [];
      const obstacleVertices = buildObstacleVertices(obstacles);
      const numObstLines = this.createObstacleORCALines(agent, obstacleVertices, orcaLines);
      this.createAgentORCALines(agent, neighbors, deltaTime, orcaLines);
      return solveORCALinearProgram(orcaLines, numObstLines, agent.maxSpeed, agent.preferredVelocity);
    }
    /**
     * @zh 创建代理间的 ORCA 约束线
     * @en Create ORCA constraint lines for agent-agent avoidance
     */
    createAgentORCALines(agent, neighbors, deltaTime, orcaLines) {
      const invTimeHorizon = 1 / agent.timeHorizon;
      for (const other of neighbors) {
        if (other.id === agent.id) continue;
        const relativePosition = {
          x: other.position.x - agent.position.x,
          y: other.position.y - agent.position.y
        };
        const relativeVelocity = {
          x: agent.velocity.x - other.velocity.x,
          y: agent.velocity.y - other.velocity.y
        };
        const distSq = lengthSq2(relativePosition);
        const combinedRadius = agent.radius + other.radius;
        const combinedRadiusSq = combinedRadius * combinedRadius;
        const line = {
          point: {
            x: 0,
            y: 0
          },
          direction: {
            x: 0,
            y: 0
          }
        };
        let u;
        if (distSq > combinedRadiusSq) {
          const w = {
            x: relativeVelocity.x - invTimeHorizon * relativePosition.x,
            y: relativeVelocity.y - invTimeHorizon * relativePosition.y
          };
          const wLengthSq = lengthSq2(w);
          const dotProduct1 = dot2(w, relativePosition);
          if (dotProduct1 < 0 && dotProduct1 * dotProduct1 > combinedRadiusSq * wLengthSq) {
            const wLength = Math.sqrt(wLengthSq);
            const unitW = normalize(w);
            line.direction = {
              x: unitW.y,
              y: -unitW.x
            };
            u = {
              x: (combinedRadius * invTimeHorizon - wLength) * unitW.x,
              y: (combinedRadius * invTimeHorizon - wLength) * unitW.y
            };
          } else {
            const leg = Math.sqrt(distSq - combinedRadiusSq);
            if (det2(relativePosition, w) > 0) {
              line.direction = {
                x: (relativePosition.x * leg - relativePosition.y * combinedRadius) / distSq,
                y: (relativePosition.x * combinedRadius + relativePosition.y * leg) / distSq
              };
            } else {
              line.direction = {
                x: -(relativePosition.x * leg + relativePosition.y * combinedRadius) / distSq,
                y: -(-relativePosition.x * combinedRadius + relativePosition.y * leg) / distSq
              };
            }
            const dotProduct2 = dot2(relativeVelocity, line.direction);
            u = {
              x: dotProduct2 * line.direction.x - relativeVelocity.x,
              y: dotProduct2 * line.direction.y - relativeVelocity.y
            };
          }
        } else {
          const invTimeStep = 1 / deltaTime;
          const w = {
            x: relativeVelocity.x - invTimeStep * relativePosition.x,
            y: relativeVelocity.y - invTimeStep * relativePosition.y
          };
          const wLength = len(w);
          const unitW = wLength > EPSILON3 ? {
            x: w.x / wLength,
            y: w.y / wLength
          } : {
            x: 1,
            y: 0
          };
          line.direction = {
            x: unitW.y,
            y: -unitW.x
          };
          u = {
            x: (combinedRadius * invTimeStep - wLength) * unitW.x,
            y: (combinedRadius * invTimeStep - wLength) * unitW.y
          };
        }
        line.point = {
          x: agent.velocity.x + 0.5 * u.x,
          y: agent.velocity.y + 0.5 * u.y
        };
        orcaLines.push(line);
      }
    }
    /**
     * @zh 创建障碍物的 ORCA 约束线
     * @en Create ORCA constraint lines for obstacle avoidance
     */
    createObstacleORCALines(agent, obstacleVertices, orcaLines) {
      const invTimeHorizonObst = 1 / agent.timeHorizonObst;
      const radiusSq = agent.radius * agent.radius;
      let numObstLines = 0;
      for (const obstacle1 of obstacleVertices) {
        const obstacle2 = obstacle1.next;
        const relativePosition1 = {
          x: obstacle1.point.x - agent.position.x,
          y: obstacle1.point.y - agent.position.y
        };
        const relativePosition2 = {
          x: obstacle2.point.x - agent.position.x,
          y: obstacle2.point.y - agent.position.y
        };
        const obstacleVector = {
          x: obstacle2.point.x - obstacle1.point.x,
          y: obstacle2.point.y - obstacle1.point.y
        };
        const signedDistToEdge = det2(obstacleVector, relativePosition1);
        if (signedDistToEdge < -EPSILON3) {
          continue;
        }
        let alreadyCovered = false;
        for (const existingLine of orcaLines) {
          const scaledRelPos1 = {
            x: invTimeHorizonObst * relativePosition1.x - existingLine.point.x,
            y: invTimeHorizonObst * relativePosition1.y - existingLine.point.y
          };
          const scaledRelPos2 = {
            x: invTimeHorizonObst * relativePosition2.x - existingLine.point.x,
            y: invTimeHorizonObst * relativePosition2.y - existingLine.point.y
          };
          if (det2(scaledRelPos1, existingLine.direction) - invTimeHorizonObst * agent.radius >= -EPSILON3 && det2(scaledRelPos2, existingLine.direction) - invTimeHorizonObst * agent.radius >= -EPSILON3) {
            alreadyCovered = true;
            break;
          }
        }
        if (alreadyCovered) {
          continue;
        }
        const distSq1 = lengthSq2(relativePosition1);
        const distSq2 = lengthSq2(relativePosition2);
        const obstacleVectorSq = lengthSq2(obstacleVector);
        const s = obstacleVectorSq > EPSILON3 ? -dot2(relativePosition1, obstacleVector) / obstacleVectorSq : 0;
        const distSqLineToEdge = lengthSq2({
          x: -relativePosition1.x - s * obstacleVector.x,
          y: -relativePosition1.y - s * obstacleVector.y
        });
        const line = {
          point: {
            x: 0,
            y: 0
          },
          direction: {
            x: 0,
            y: 0
          }
        };
        if (s < 0 && distSq1 <= radiusSq) {
          if (obstacle1.isConvex) {
            line.point = {
              x: 0,
              y: 0
            };
            line.direction = normalize({
              x: -relativePosition1.y,
              y: relativePosition1.x
            });
            orcaLines.push(line);
            numObstLines++;
          }
          continue;
        }
        if (s > 1 && distSq2 <= radiusSq) {
          if (obstacle2.isConvex && det2(relativePosition2, obstacle2.direction) >= 0) {
            line.point = {
              x: 0,
              y: 0
            };
            line.direction = normalize({
              x: -relativePosition2.y,
              y: relativePosition2.x
            });
            orcaLines.push(line);
            numObstLines++;
          }
          continue;
        }
        if (s >= 0 && s <= 1 && distSqLineToEdge <= radiusSq) {
          line.point = {
            x: 0,
            y: 0
          };
          line.direction = {
            x: -obstacle1.direction.x,
            y: -obstacle1.direction.y
          };
          orcaLines.push(line);
          numObstLines++;
          continue;
        }
        let obs1 = obstacle1;
        let obs2 = obstacle2;
        let leftLegDirection;
        let rightLegDirection;
        if (s < 0 && distSqLineToEdge <= radiusSq) {
          if (!obstacle1.isConvex) continue;
          obs2 = obstacle1;
          const leg1 = Math.sqrt(Math.max(0, distSq1 - radiusSq));
          leftLegDirection = {
            x: (relativePosition1.x * leg1 - relativePosition1.y * agent.radius) / distSq1,
            y: (relativePosition1.x * agent.radius + relativePosition1.y * leg1) / distSq1
          };
          rightLegDirection = {
            x: (relativePosition1.x * leg1 + relativePosition1.y * agent.radius) / distSq1,
            y: (-relativePosition1.x * agent.radius + relativePosition1.y * leg1) / distSq1
          };
        } else if (s > 1 && distSqLineToEdge <= radiusSq) {
          if (!obstacle2.isConvex) continue;
          obs1 = obstacle2;
          const leg2 = Math.sqrt(Math.max(0, distSq2 - radiusSq));
          leftLegDirection = {
            x: (relativePosition2.x * leg2 - relativePosition2.y * agent.radius) / distSq2,
            y: (relativePosition2.x * agent.radius + relativePosition2.y * leg2) / distSq2
          };
          rightLegDirection = {
            x: (relativePosition2.x * leg2 + relativePosition2.y * agent.radius) / distSq2,
            y: (-relativePosition2.x * agent.radius + relativePosition2.y * leg2) / distSq2
          };
        } else {
          if (obstacle1.isConvex) {
            const leg1 = Math.sqrt(Math.max(0, distSq1 - radiusSq));
            leftLegDirection = {
              x: (relativePosition1.x * leg1 - relativePosition1.y * agent.radius) / distSq1,
              y: (relativePosition1.x * agent.radius + relativePosition1.y * leg1) / distSq1
            };
          } else {
            leftLegDirection = {
              x: -obstacle1.direction.x,
              y: -obstacle1.direction.y
            };
          }
          if (obstacle2.isConvex) {
            const leg2 = Math.sqrt(Math.max(0, distSq2 - radiusSq));
            rightLegDirection = {
              x: (relativePosition2.x * leg2 + relativePosition2.y * agent.radius) / distSq2,
              y: (-relativePosition2.x * agent.radius + relativePosition2.y * leg2) / distSq2
            };
          } else {
            rightLegDirection = {
              x: obstacle1.direction.x,
              y: obstacle1.direction.y
            };
          }
        }
        const leftNeighbor = obs1.previous;
        let isLeftLegForeign = false;
        let isRightLegForeign = false;
        if (obs1.isConvex) {
          const negLeftNeighborDir = {
            x: -leftNeighbor.direction.x,
            y: -leftNeighbor.direction.y
          };
          if (det2(leftLegDirection, negLeftNeighborDir) >= 0) {
            leftLegDirection = negLeftNeighborDir;
            isLeftLegForeign = true;
          }
        }
        if (obs2.isConvex) {
          if (det2(rightLegDirection, obs2.direction) <= 0) {
            rightLegDirection = {
              x: obs2.direction.x,
              y: obs2.direction.y
            };
            isRightLegForeign = true;
          }
        }
        const leftCutoff = {
          x: invTimeHorizonObst * (obs1.point.x - agent.position.x),
          y: invTimeHorizonObst * (obs1.point.y - agent.position.y)
        };
        const rightCutoff = {
          x: invTimeHorizonObst * (obs2.point.x - agent.position.x),
          y: invTimeHorizonObst * (obs2.point.y - agent.position.y)
        };
        const cutoffVector = {
          x: rightCutoff.x - leftCutoff.x,
          y: rightCutoff.y - leftCutoff.y
        };
        const sameVertex = obs1 === obs2;
        const cutoffVectorSq = lengthSq2(cutoffVector);
        const t = sameVertex ? 0.5 : cutoffVectorSq > EPSILON3 ? dot2({
          x: agent.velocity.x - leftCutoff.x,
          y: agent.velocity.y - leftCutoff.y
        }, cutoffVector) / cutoffVectorSq : 0.5;
        const tLeft = dot2({
          x: agent.velocity.x - leftCutoff.x,
          y: agent.velocity.y - leftCutoff.y
        }, leftLegDirection);
        const tRight = dot2({
          x: agent.velocity.x - rightCutoff.x,
          y: agent.velocity.y - rightCutoff.y
        }, rightLegDirection);
        if (t < 0 && tLeft < 0 || sameVertex && tLeft < 0 && tRight < 0) {
          const unitW = normalize({
            x: agent.velocity.x - leftCutoff.x,
            y: agent.velocity.y - leftCutoff.y
          });
          line.direction = {
            x: unitW.y,
            y: -unitW.x
          };
          line.point = {
            x: leftCutoff.x + agent.radius * invTimeHorizonObst * unitW.x,
            y: leftCutoff.y + agent.radius * invTimeHorizonObst * unitW.y
          };
          orcaLines.push(line);
          numObstLines++;
          continue;
        }
        if (t > 1 && tRight < 0) {
          const unitW = normalize({
            x: agent.velocity.x - rightCutoff.x,
            y: agent.velocity.y - rightCutoff.y
          });
          line.direction = {
            x: unitW.y,
            y: -unitW.x
          };
          line.point = {
            x: rightCutoff.x + agent.radius * invTimeHorizonObst * unitW.x,
            y: rightCutoff.y + agent.radius * invTimeHorizonObst * unitW.y
          };
          orcaLines.push(line);
          numObstLines++;
          continue;
        }
        const distSqCutoff = t < 0 || t > 1 || sameVertex ? Infinity : lengthSq2({
          x: agent.velocity.x - (leftCutoff.x + t * cutoffVector.x),
          y: agent.velocity.y - (leftCutoff.y + t * cutoffVector.y)
        });
        const distSqLeft = tLeft < 0 ? Infinity : lengthSq2({
          x: agent.velocity.x - (leftCutoff.x + tLeft * leftLegDirection.x),
          y: agent.velocity.y - (leftCutoff.y + tLeft * leftLegDirection.y)
        });
        const distSqRight = tRight < 0 ? Infinity : lengthSq2({
          x: agent.velocity.x - (rightCutoff.x + tRight * rightLegDirection.x),
          y: agent.velocity.y - (rightCutoff.y + tRight * rightLegDirection.y)
        });
        if (distSqCutoff <= distSqLeft && distSqCutoff <= distSqRight) {
          line.direction = {
            x: -obs1.direction.x,
            y: -obs1.direction.y
          };
          line.point = {
            x: leftCutoff.x + agent.radius * invTimeHorizonObst * -line.direction.y,
            y: leftCutoff.y + agent.radius * invTimeHorizonObst * line.direction.x
          };
          orcaLines.push(line);
          numObstLines++;
          continue;
        }
        if (distSqLeft <= distSqRight) {
          if (isLeftLegForeign) {
            continue;
          }
          line.direction = {
            x: leftLegDirection.x,
            y: leftLegDirection.y
          };
          line.point = {
            x: leftCutoff.x + agent.radius * invTimeHorizonObst * -line.direction.y,
            y: leftCutoff.y + agent.radius * invTimeHorizonObst * line.direction.x
          };
          orcaLines.push(line);
          numObstLines++;
          continue;
        }
        if (isRightLegForeign) {
          continue;
        }
        line.direction = {
          x: -rightLegDirection.x,
          y: -rightLegDirection.y
        };
        line.point = {
          x: rightCutoff.x + agent.radius * invTimeHorizonObst * -line.direction.y,
          y: rightCutoff.y + agent.radius * invTimeHorizonObst * line.direction.x
        };
        orcaLines.push(line);
        numObstLines++;
      }
      return numObstLines;
    }
  };
  __name(_ORCASolver, "ORCASolver");
  var ORCASolver = _ORCASolver;
  function createORCASolver(config) {
    return new ORCASolver(config);
  }
  __name(createORCASolver, "createORCASolver");

  // src/avoidance/KDTree.ts
  var _KDTree = class _KDTree {
    constructor() {
      __publicField(this, "agents", []);
      __publicField(this, "agentIndices", []);
      __publicField(this, "nodes", []);
      /**
       * @zh 最大叶节点大小
       * @en Maximum leaf size
       */
      __publicField(this, "maxLeafSize", 10);
    }
    /**
     * @zh 构建 KD-Tree
     * @en Build KD-Tree
     */
    build(agents) {
      this.agents = agents;
      this.agentIndices = [];
      this.nodes = [];
      if (agents.length === 0) {
        return;
      }
      for (let i = 0; i < agents.length; i++) {
        this.agentIndices.push(i);
      }
      this.buildRecursive(0, agents.length, 0);
    }
    /**
     * @zh 递归构建 KD-Tree
     * @en Recursively build KD-Tree
     */
    buildRecursive(begin, end, depth) {
      const nodeIndex = this.nodes.length;
      const node = {
        agentIndex: -1,
        splitValue: 0,
        left: -1,
        right: -1,
        begin,
        end,
        minX: Infinity,
        minY: Infinity,
        maxX: -Infinity,
        maxY: -Infinity
      };
      this.nodes.push(node);
      for (let i = begin; i < end; i++) {
        const agent = this.agents[this.agentIndices[i]];
        node.minX = Math.min(node.minX, agent.position.x);
        node.minY = Math.min(node.minY, agent.position.y);
        node.maxX = Math.max(node.maxX, agent.position.x);
        node.maxY = Math.max(node.maxY, agent.position.y);
      }
      const count = end - begin;
      if (count <= this.maxLeafSize) {
        return nodeIndex;
      }
      const splitDim = depth % 2;
      if (splitDim === 0) {
        this.sortByX(begin, end);
      } else {
        this.sortByY(begin, end);
      }
      const mid = Math.floor((begin + end) / 2);
      const midAgent = this.agents[this.agentIndices[mid]];
      node.splitValue = splitDim === 0 ? midAgent.position.x : midAgent.position.y;
      node.left = this.buildRecursive(begin, mid, depth + 1);
      node.right = this.buildRecursive(mid, end, depth + 1);
      return nodeIndex;
    }
    /**
     * @zh 按 X 坐标排序
     * @en Sort by X coordinate
     */
    sortByX(begin, end) {
      const indices = this.agentIndices;
      const agents = this.agents;
      for (let i = begin + 1; i < end; i++) {
        const key = indices[i];
        const keyX = agents[key].position.x;
        let j = i - 1;
        while (j >= begin && agents[indices[j]].position.x > keyX) {
          indices[j + 1] = indices[j];
          j--;
        }
        indices[j + 1] = key;
      }
    }
    /**
     * @zh 按 Y 坐标排序
     * @en Sort by Y coordinate
     */
    sortByY(begin, end) {
      const indices = this.agentIndices;
      const agents = this.agents;
      for (let i = begin + 1; i < end; i++) {
        const key = indices[i];
        const keyY = agents[key].position.y;
        let j = i - 1;
        while (j >= begin && agents[indices[j]].position.y > keyY) {
          indices[j + 1] = indices[j];
          j--;
        }
        indices[j + 1] = key;
      }
    }
    /**
     * @zh 查询邻居
     * @en Query neighbors
     */
    queryNeighbors(position, radius, maxResults, excludeId) {
      const results = [];
      const radiusSq = radius * radius;
      if (this.nodes.length === 0) {
        return results;
      }
      this.queryRecursive(0, position, radiusSq, maxResults, excludeId, results);
      results.sort((a, b) => a.distanceSq - b.distanceSq);
      if (results.length > maxResults) {
        results.length = maxResults;
      }
      return results;
    }
    /**
     * @zh 递归查询
     * @en Recursive query
     */
    queryRecursive(nodeIndex, position, radiusSq, maxResults, excludeId, results) {
      const node = this.nodes[nodeIndex];
      if (!node) return;
      const closestX = Math.max(node.minX, Math.min(position.x, node.maxX));
      const closestY = Math.max(node.minY, Math.min(position.y, node.maxY));
      const dx = position.x - closestX;
      const dy = position.y - closestY;
      const distSqToBBox = dx * dx + dy * dy;
      if (distSqToBBox > radiusSq) {
        return;
      }
      if (node.left === -1 && node.right === -1) {
        for (let i = node.begin; i < node.end; i++) {
          const agentIndex = this.agentIndices[i];
          const agent = this.agents[agentIndex];
          if (excludeId !== void 0 && agent.id === excludeId) {
            continue;
          }
          const adx = position.x - agent.position.x;
          const ady = position.y - agent.position.y;
          const distSq = adx * adx + ady * ady;
          if (distSq < radiusSq) {
            results.push({
              agent,
              distanceSq: distSq
            });
          }
        }
        return;
      }
      if (node.left !== -1) {
        this.queryRecursive(node.left, position, radiusSq, maxResults, excludeId, results);
      }
      if (node.right !== -1) {
        this.queryRecursive(node.right, position, radiusSq, maxResults, excludeId, results);
      }
    }
    /**
     * @zh 清空索引
     * @en Clear the index
     */
    clear() {
      this.agents = [];
      this.agentIndices = [];
      this.nodes = [];
    }
    /**
     * @zh 获取代理数量
     * @en Get agent count
     */
    get agentCount() {
      return this.agents.length;
    }
  };
  __name(_KDTree, "KDTree");
  var KDTree = _KDTree;
  function createKDTree() {
    return new KDTree();
  }
  __name(createKDTree, "createKDTree");

  // src/core/BinaryHeap.ts
  var _BinaryHeap = class _BinaryHeap {
    /**
     * @zh 创建二叉堆
     * @en Create binary heap
     *
     * @param compare - @zh 比较函数，返回负数表示 a < b @en Compare function, returns negative if a < b
     */
    constructor(compare) {
      __publicField(this, "heap", []);
      __publicField(this, "compare");
      this.compare = compare;
    }
    /**
     * @zh 堆大小
     * @en Heap size
     */
    get size() {
      return this.heap.length;
    }
    /**
     * @zh 是否为空
     * @en Is empty
     */
    get isEmpty() {
      return this.heap.length === 0;
    }
    /**
     * @zh 插入元素
     * @en Push element
     */
    push(item) {
      this.heap.push(item);
      this.bubbleUp(this.heap.length - 1);
    }
    /**
     * @zh 弹出最小元素
     * @en Pop minimum element
     */
    pop() {
      if (this.heap.length === 0) {
        return void 0;
      }
      const result = this.heap[0];
      const last = this.heap.pop();
      if (this.heap.length > 0) {
        this.heap[0] = last;
        this.sinkDown(0);
      }
      return result;
    }
    /**
     * @zh 查看最小元素（不移除）
     * @en Peek minimum element (without removing)
     */
    peek() {
      return this.heap[0];
    }
    /**
     * @zh 更新元素（重新排序）
     * @en Update element (re-sort)
     */
    update(item) {
      const index = this.heap.indexOf(item);
      if (index !== -1) {
        this.bubbleUp(index);
        this.sinkDown(index);
      }
    }
    /**
     * @zh 检查是否包含元素
     * @en Check if contains element
     */
    contains(item) {
      return this.heap.indexOf(item) !== -1;
    }
    /**
     * @zh 清空堆
     * @en Clear heap
     */
    clear() {
      this.heap.length = 0;
    }
    /**
     * @zh 上浮操作
     * @en Bubble up operation
     */
    bubbleUp(index) {
      const item = this.heap[index];
      while (index > 0) {
        const parentIndex = Math.floor((index - 1) / 2);
        const parent = this.heap[parentIndex];
        if (this.compare(item, parent) >= 0) {
          break;
        }
        this.heap[index] = parent;
        index = parentIndex;
      }
      this.heap[index] = item;
    }
    /**
     * @zh 下沉操作
     * @en Sink down operation
     */
    sinkDown(index) {
      const length = this.heap.length;
      const item = this.heap[index];
      while (true) {
        const leftIndex = 2 * index + 1;
        const rightIndex = 2 * index + 2;
        let smallest = index;
        if (leftIndex < length && this.compare(this.heap[leftIndex], this.heap[smallest]) < 0) {
          smallest = leftIndex;
        }
        if (rightIndex < length && this.compare(this.heap[rightIndex], this.heap[smallest]) < 0) {
          smallest = rightIndex;
        }
        if (smallest === index) {
          break;
        }
        this.heap[index] = this.heap[smallest];
        this.heap[smallest] = item;
        index = smallest;
      }
    }
  };
  __name(_BinaryHeap, "BinaryHeap");
  var BinaryHeap = _BinaryHeap;

  // src/core/AStarPathfinder.ts
  var _AStarPathfinder = class _AStarPathfinder {
    constructor(map) {
      __publicField(this, "map");
      __publicField(this, "nodeCache", /* @__PURE__ */ new Map());
      __publicField(this, "openList");
      this.map = map;
      this.openList = new IndexedBinaryHeap((a, b) => a.f - b.f);
    }
    /**
     * @zh 查找路径
     * @en Find path
     */
    findPath(startX, startY, endX, endY, options) {
      const opts = {
        ...DEFAULT_PATHFINDING_OPTIONS,
        ...options
      };
      this.clear();
      const startNode = this.map.getNodeAt(startX, startY);
      const endNode = this.map.getNodeAt(endX, endY);
      if (!startNode || !endNode) {
        return EMPTY_PATH_RESULT;
      }
      if (!startNode.walkable || !endNode.walkable) {
        return EMPTY_PATH_RESULT;
      }
      if (startNode.id === endNode.id) {
        return {
          found: true,
          path: [
            startNode.position
          ],
          cost: 0,
          nodesSearched: 1
        };
      }
      const start = this.getOrCreateAStarNode(startNode);
      start.g = 0;
      start.h = this.map.heuristic(startNode.position, endNode.position) * opts.heuristicWeight;
      start.f = start.h;
      start.opened = true;
      this.openList.push(start);
      let nodesSearched = 0;
      const endPosition = endNode.position;
      while (!this.openList.isEmpty && nodesSearched < opts.maxNodes) {
        const current = this.openList.pop();
        current.closed = true;
        nodesSearched++;
        if (current.node.id === endNode.id) {
          return this.buildPath(current, nodesSearched);
        }
        const neighbors = this.map.getNeighbors(current.node);
        for (const neighborNode of neighbors) {
          if (!neighborNode.walkable) {
            continue;
          }
          const neighbor = this.getOrCreateAStarNode(neighborNode);
          if (neighbor.closed) {
            continue;
          }
          const movementCost = this.map.getMovementCost(current.node, neighborNode);
          const tentativeG = current.g + movementCost;
          if (!neighbor.opened) {
            neighbor.g = tentativeG;
            neighbor.h = this.map.heuristic(neighborNode.position, endPosition) * opts.heuristicWeight;
            neighbor.f = neighbor.g + neighbor.h;
            neighbor.parent = current;
            neighbor.opened = true;
            this.openList.push(neighbor);
          } else if (tentativeG < neighbor.g) {
            neighbor.g = tentativeG;
            neighbor.f = neighbor.g + neighbor.h;
            neighbor.parent = current;
            this.openList.update(neighbor);
          }
        }
      }
      return {
        found: false,
        path: [],
        cost: 0,
        nodesSearched
      };
    }
    /**
     * @zh 清理状态
     * @en Clear state
     */
    clear() {
      this.nodeCache.clear();
      this.openList.clear();
    }
    /**
     * @zh 获取或创建 A* 节点
     * @en Get or create A* node
     */
    getOrCreateAStarNode(node) {
      let astarNode = this.nodeCache.get(node.id);
      if (!astarNode) {
        astarNode = {
          node,
          g: Infinity,
          h: 0,
          f: Infinity,
          parent: null,
          closed: false,
          opened: false,
          heapIndex: -1
        };
        this.nodeCache.set(node.id, astarNode);
      }
      return astarNode;
    }
    /**
     * @zh 构建路径结果
     * @en Build path result
     */
    buildPath(endNode, nodesSearched) {
      const path = [];
      let current = endNode;
      while (current) {
        path.push(current.node.position);
        current = current.parent;
      }
      path.reverse();
      return {
        found: true,
        path,
        cost: endNode.g,
        nodesSearched
      };
    }
  };
  __name(_AStarPathfinder, "AStarPathfinder");
  var AStarPathfinder = _AStarPathfinder;
  function createAStarPathfinder(map) {
    return new AStarPathfinder(map);
  }
  __name(createAStarPathfinder, "createAStarPathfinder");

  // src/core/GridPathfinder.ts
  var CLOSED_FLAG = 1;
  var OPENED_FLAG = 2;
  var BACKWARD_CLOSED = 4;
  var BACKWARD_OPENED = 8;
  var _a;
  var GridState = (_a = class {
    constructor(width, height, bidirectional = false) {
      __publicField(this, "size");
      __publicField(this, "width");
      __publicField(this, "g");
      __publicField(this, "f");
      __publicField(this, "flags");
      __publicField(this, "parent");
      __publicField(this, "heapIndex");
      __publicField(this, "version");
      __publicField(this, "currentVersion", 1);
      // 双向搜索额外状态
      __publicField(this, "gBack", null);
      __publicField(this, "fBack", null);
      __publicField(this, "parentBack", null);
      __publicField(this, "heapIndexBack", null);
      this.width = width;
      this.size = width * height;
      this.g = new Float32Array(this.size);
      this.f = new Float32Array(this.size);
      this.flags = new Uint8Array(this.size);
      this.parent = new Int32Array(this.size);
      this.heapIndex = new Int32Array(this.size);
      this.version = new Uint32Array(this.size);
      if (bidirectional) {
        this.gBack = new Float32Array(this.size);
        this.fBack = new Float32Array(this.size);
        this.parentBack = new Int32Array(this.size);
        this.heapIndexBack = new Int32Array(this.size);
      }
    }
    reset() {
      this.currentVersion++;
      if (this.currentVersion > 4294967295) {
        this.version.fill(0);
        this.currentVersion = 1;
      }
    }
    isInit(i) {
      return this.version[i] === this.currentVersion;
    }
    init(i) {
      if (!this.isInit(i)) {
        this.g[i] = Infinity;
        this.f[i] = Infinity;
        this.flags[i] = 0;
        this.parent[i] = -1;
        this.heapIndex[i] = -1;
        if (this.gBack) {
          this.gBack[i] = Infinity;
          this.fBack[i] = Infinity;
          this.parentBack[i] = -1;
          this.heapIndexBack[i] = -1;
        }
        this.version[i] = this.currentVersion;
      }
    }
    // Forward
    getG(i) {
      return this.isInit(i) ? this.g[i] : Infinity;
    }
    setG(i, v) {
      this.init(i);
      this.g[i] = v;
    }
    getF(i) {
      return this.isInit(i) ? this.f[i] : Infinity;
    }
    setF(i, v) {
      this.init(i);
      this.f[i] = v;
    }
    getParent(i) {
      return this.isInit(i) ? this.parent[i] : -1;
    }
    setParent(i, v) {
      this.init(i);
      this.parent[i] = v;
    }
    getHeapIndex(i) {
      return this.isInit(i) ? this.heapIndex[i] : -1;
    }
    setHeapIndex(i, v) {
      this.init(i);
      this.heapIndex[i] = v;
    }
    isClosed(i) {
      return this.isInit(i) && (this.flags[i] & CLOSED_FLAG) !== 0;
    }
    setClosed(i) {
      this.init(i);
      this.flags[i] |= CLOSED_FLAG;
    }
    isOpened(i) {
      return this.isInit(i) && (this.flags[i] & OPENED_FLAG) !== 0;
    }
    setOpened(i) {
      this.init(i);
      this.flags[i] |= OPENED_FLAG;
    }
    // Backward
    getGBack(i) {
      return this.isInit(i) ? this.gBack[i] : Infinity;
    }
    setGBack(i, v) {
      this.init(i);
      this.gBack[i] = v;
    }
    getFBack(i) {
      return this.isInit(i) ? this.fBack[i] : Infinity;
    }
    setFBack(i, v) {
      this.init(i);
      this.fBack[i] = v;
    }
    getParentBack(i) {
      return this.isInit(i) ? this.parentBack[i] : -1;
    }
    setParentBack(i, v) {
      this.init(i);
      this.parentBack[i] = v;
    }
    getHeapIndexBack(i) {
      return this.isInit(i) ? this.heapIndexBack[i] : -1;
    }
    setHeapIndexBack(i, v) {
      this.init(i);
      this.heapIndexBack[i] = v;
    }
    isClosedBack(i) {
      return this.isInit(i) && (this.flags[i] & BACKWARD_CLOSED) !== 0;
    }
    setClosedBack(i) {
      this.init(i);
      this.flags[i] |= BACKWARD_CLOSED;
    }
    isOpenedBack(i) {
      return this.isInit(i) && (this.flags[i] & BACKWARD_OPENED) !== 0;
    }
    setOpenedBack(i) {
      this.init(i);
      this.flags[i] |= BACKWARD_OPENED;
    }
  }, __name(_a, "GridState"), _a);
  var _a2;
  var GridHeap = (_a2 = class {
    constructor(state, isBack = false) {
      __publicField(this, "heap", []);
      __publicField(this, "state");
      __publicField(this, "isBack");
      this.state = state;
      this.isBack = isBack;
    }
    get size() {
      return this.heap.length;
    }
    get isEmpty() {
      return this.heap.length === 0;
    }
    getF(i) {
      return this.isBack ? this.state.getFBack(i) : this.state.getF(i);
    }
    getHeapIndex(i) {
      return this.isBack ? this.state.getHeapIndexBack(i) : this.state.getHeapIndex(i);
    }
    setHeapIndex(i, v) {
      if (this.isBack) this.state.setHeapIndexBack(i, v);
      else this.state.setHeapIndex(i, v);
    }
    push(i) {
      this.setHeapIndex(i, this.heap.length);
      this.heap.push(i);
      this.bubbleUp(this.heap.length - 1);
    }
    pop() {
      if (this.heap.length === 0) return -1;
      const result = this.heap[0];
      this.setHeapIndex(result, -1);
      const last = this.heap.pop();
      if (this.heap.length > 0) {
        this.heap[0] = last;
        this.setHeapIndex(last, 0);
        this.sinkDown(0);
      }
      return result;
    }
    update(i) {
      const pos = this.getHeapIndex(i);
      if (pos >= 0 && pos < this.heap.length) {
        this.bubbleUp(pos);
        this.sinkDown(this.getHeapIndex(i));
      }
    }
    clear() {
      this.heap.length = 0;
    }
    bubbleUp(pos) {
      const idx = this.heap[pos];
      const f = this.getF(idx);
      while (pos > 0) {
        const pp = pos - 1 >> 1;
        const pi = this.heap[pp];
        if (f >= this.getF(pi)) break;
        this.heap[pos] = pi;
        this.setHeapIndex(pi, pos);
        pos = pp;
      }
      this.heap[pos] = idx;
      this.setHeapIndex(idx, pos);
    }
    sinkDown(pos) {
      const len = this.heap.length;
      const idx = this.heap[pos];
      const f = this.getF(idx);
      const half = len >> 1;
      while (pos < half) {
        const left = (pos << 1) + 1;
        const right = left + 1;
        let smallest = pos, smallestF = f;
        const lf = this.getF(this.heap[left]);
        if (lf < smallestF) {
          smallest = left;
          smallestF = lf;
        }
        if (right < len) {
          const rf = this.getF(this.heap[right]);
          if (rf < smallestF) smallest = right;
        }
        if (smallest === pos) break;
        const si = this.heap[smallest];
        this.heap[pos] = si;
        this.setHeapIndex(si, pos);
        pos = smallest;
      }
      this.heap[pos] = idx;
      this.setHeapIndex(idx, pos);
    }
  }, __name(_a2, "GridHeap"), _a2);
  var _GridPathfinder = class _GridPathfinder {
    constructor(map, config) {
      __publicField(this, "map");
      __publicField(this, "mode");
      __publicField(this, "state");
      __publicField(this, "openList");
      __publicField(this, "openListBack");
      this.map = map;
      this.mode = config?.mode ?? "fast";
      const isBidir = this.mode === "bidirectional";
      this.state = new GridState(map.width, map.height, isBidir);
      this.openList = new GridHeap(this.state, false);
      this.openListBack = isBidir ? new GridHeap(this.state, true) : null;
    }
    findPath(startX, startY, endX, endY, options) {
      if (this.mode === "bidirectional") {
        return this.findPathBidirectional(startX, startY, endX, endY, options);
      }
      return this.findPathUnidirectional(startX, startY, endX, endY, options);
    }
    findPathUnidirectional(startX, startY, endX, endY, options) {
      const opts = options ? {
        ...DEFAULT_PATHFINDING_OPTIONS,
        ...options
      } : DEFAULT_PATHFINDING_OPTIONS;
      const { width, height } = this.map;
      this.state.reset();
      this.openList.clear();
      if (!this.validate(startX, startY, endX, endY)) return EMPTY_PATH_RESULT;
      const startIdx = startY * width + startX;
      const endIdx = endY * width + endX;
      if (startIdx === endIdx) {
        return {
          found: true,
          path: [
            {
              x: startX,
              y: startY
            }
          ],
          cost: 0,
          nodesSearched: 1
        };
      }
      const hw = opts.heuristicWeight;
      const h0 = this.map.heuristic({
        x: startX,
        y: startY
      }, {
        x: endX,
        y: endY
      }) * hw;
      this.state.setG(startIdx, 0);
      this.state.setF(startIdx, h0);
      this.state.setOpened(startIdx);
      this.openList.push(startIdx);
      let searched = 0;
      const maxNodes = opts.maxNodes;
      const { allowDiagonal, avoidCorners, diagonalCost } = this.map["options"];
      const nodes = this.map["nodes"];
      const dx = allowDiagonal ? [
        0,
        1,
        1,
        1,
        0,
        -1,
        -1,
        -1
      ] : [
        0,
        1,
        0,
        -1
      ];
      const dy = allowDiagonal ? [
        -1,
        -1,
        0,
        1,
        1,
        1,
        0,
        -1
      ] : [
        -1,
        0,
        1,
        0
      ];
      const dirCount = dx.length;
      while (!this.openList.isEmpty && searched < maxNodes) {
        const cur = this.openList.pop();
        this.state.setClosed(cur);
        searched++;
        if (cur === endIdx) {
          return this.buildPath(startIdx, endIdx, searched);
        }
        const cx = cur % width, cy = cur / width | 0;
        const curG = this.state.getG(cur);
        for (let d = 0; d < dirCount; d++) {
          const nx = cx + dx[d], ny = cy + dy[d];
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
          const neighbor = nodes[ny][nx];
          if (!neighbor.walkable) continue;
          if (avoidCorners && dx[d] !== 0 && dy[d] !== 0) {
            if (!nodes[cy][cx + dx[d]].walkable || !nodes[cy + dy[d]][cx].walkable) continue;
          }
          const ni = ny * width + nx;
          if (this.state.isClosed(ni)) continue;
          const isDiag = dx[d] !== 0 && dy[d] !== 0;
          const cost = isDiag ? neighbor.cost * diagonalCost : neighbor.cost;
          const tentG = curG + cost;
          if (!this.state.isOpened(ni)) {
            const h = this.map.heuristic({
              x: nx,
              y: ny
            }, {
              x: endX,
              y: endY
            }) * hw;
            this.state.setG(ni, tentG);
            this.state.setF(ni, tentG + h);
            this.state.setParent(ni, cur);
            this.state.setOpened(ni);
            this.openList.push(ni);
          } else if (tentG < this.state.getG(ni)) {
            const h = this.state.getF(ni) - this.state.getG(ni);
            this.state.setG(ni, tentG);
            this.state.setF(ni, tentG + h);
            this.state.setParent(ni, cur);
            this.openList.update(ni);
          }
        }
      }
      return {
        found: false,
        path: [],
        cost: 0,
        nodesSearched: searched
      };
    }
    findPathBidirectional(startX, startY, endX, endY, options) {
      const opts = options ? {
        ...DEFAULT_PATHFINDING_OPTIONS,
        ...options
      } : DEFAULT_PATHFINDING_OPTIONS;
      const { width, height } = this.map;
      this.state.reset();
      this.openList.clear();
      this.openListBack.clear();
      if (!this.validate(startX, startY, endX, endY)) return EMPTY_PATH_RESULT;
      const startIdx = startY * width + startX;
      const endIdx = endY * width + endX;
      if (startIdx === endIdx) {
        return {
          found: true,
          path: [
            {
              x: startX,
              y: startY
            }
          ],
          cost: 0,
          nodesSearched: 1
        };
      }
      const hw = opts.heuristicWeight;
      const startPos = {
        x: startX,
        y: startY
      };
      const endPos = {
        x: endX,
        y: endY
      };
      const hf = this.map.heuristic(startPos, endPos) * hw;
      this.state.setG(startIdx, 0);
      this.state.setF(startIdx, hf);
      this.state.setOpened(startIdx);
      this.openList.push(startIdx);
      const hb = this.map.heuristic(endPos, startPos) * hw;
      this.state.setGBack(endIdx, 0);
      this.state.setFBack(endIdx, hb);
      this.state.setOpenedBack(endIdx);
      this.openListBack.push(endIdx);
      let searched = 0;
      const maxNodes = opts.maxNodes;
      let meetIdx = -1, bestCost = Infinity;
      const { allowDiagonal, avoidCorners, diagonalCost } = this.map["options"];
      const nodes = this.map["nodes"];
      const dx = allowDiagonal ? [
        0,
        1,
        1,
        1,
        0,
        -1,
        -1,
        -1
      ] : [
        0,
        1,
        0,
        -1
      ];
      const dy = allowDiagonal ? [
        -1,
        -1,
        0,
        1,
        1,
        1,
        0,
        -1
      ] : [
        -1,
        0,
        1,
        0
      ];
      const dirCount = dx.length;
      while ((!this.openList.isEmpty || !this.openListBack.isEmpty) && searched < maxNodes) {
        if (!this.openList.isEmpty) {
          const cur = this.openList.pop();
          this.state.setClosed(cur);
          searched++;
          const curG = this.state.getG(cur);
          if (this.state.isClosedBack(cur)) {
            const total = curG + this.state.getGBack(cur);
            if (total < bestCost) {
              bestCost = total;
              meetIdx = cur;
            }
          }
          if (meetIdx !== -1 && curG >= bestCost) break;
          const cx = cur % width, cy = cur / width | 0;
          for (let d = 0; d < dirCount; d++) {
            const nx = cx + dx[d], ny = cy + dy[d];
            if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
            const neighbor = nodes[ny][nx];
            if (!neighbor.walkable) continue;
            if (avoidCorners && dx[d] !== 0 && dy[d] !== 0) {
              if (!nodes[cy][cx + dx[d]].walkable || !nodes[cy + dy[d]][cx].walkable) continue;
            }
            const ni = ny * width + nx;
            if (this.state.isClosed(ni)) continue;
            const isDiag = dx[d] !== 0 && dy[d] !== 0;
            const cost = isDiag ? neighbor.cost * diagonalCost : neighbor.cost;
            const tentG = curG + cost;
            if (!this.state.isOpened(ni)) {
              const h = this.map.heuristic({
                x: nx,
                y: ny
              }, endPos) * hw;
              this.state.setG(ni, tentG);
              this.state.setF(ni, tentG + h);
              this.state.setParent(ni, cur);
              this.state.setOpened(ni);
              this.openList.push(ni);
            } else if (tentG < this.state.getG(ni)) {
              const h = this.state.getF(ni) - this.state.getG(ni);
              this.state.setG(ni, tentG);
              this.state.setF(ni, tentG + h);
              this.state.setParent(ni, cur);
              this.openList.update(ni);
            }
          }
        }
        if (!this.openListBack.isEmpty) {
          const cur = this.openListBack.pop();
          this.state.setClosedBack(cur);
          searched++;
          const curG = this.state.getGBack(cur);
          if (this.state.isClosed(cur)) {
            const total = curG + this.state.getG(cur);
            if (total < bestCost) {
              bestCost = total;
              meetIdx = cur;
            }
          }
          if (meetIdx !== -1 && curG >= bestCost) break;
          const cx = cur % width, cy = cur / width | 0;
          for (let d = 0; d < dirCount; d++) {
            const nx = cx + dx[d], ny = cy + dy[d];
            if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
            const neighbor = nodes[ny][nx];
            if (!neighbor.walkable) continue;
            if (avoidCorners && dx[d] !== 0 && dy[d] !== 0) {
              if (!nodes[cy][cx + dx[d]].walkable || !nodes[cy + dy[d]][cx].walkable) continue;
            }
            const ni = ny * width + nx;
            if (this.state.isClosedBack(ni)) continue;
            const isDiag = dx[d] !== 0 && dy[d] !== 0;
            const cost = isDiag ? neighbor.cost * diagonalCost : neighbor.cost;
            const tentG = curG + cost;
            if (!this.state.isOpenedBack(ni)) {
              const h = this.map.heuristic({
                x: nx,
                y: ny
              }, startPos) * hw;
              this.state.setGBack(ni, tentG);
              this.state.setFBack(ni, tentG + h);
              this.state.setParentBack(ni, cur);
              this.state.setOpenedBack(ni);
              this.openListBack.push(ni);
            } else if (tentG < this.state.getGBack(ni)) {
              const h = this.state.getFBack(ni) - this.state.getGBack(ni);
              this.state.setGBack(ni, tentG);
              this.state.setFBack(ni, tentG + h);
              this.state.setParentBack(ni, cur);
              this.openListBack.update(ni);
            }
          }
        }
      }
      if (meetIdx === -1) {
        return {
          found: false,
          path: [],
          cost: 0,
          nodesSearched: searched
        };
      }
      return this.buildPathBidirectional(startIdx, endIdx, meetIdx, searched);
    }
    validate(startX, startY, endX, endY) {
      const { width, height } = this.map;
      if (startX < 0 || startX >= width || startY < 0 || startY >= height) return false;
      if (endX < 0 || endX >= width || endY < 0 || endY >= height) return false;
      return this.map.isWalkable(startX, startY) && this.map.isWalkable(endX, endY);
    }
    buildPath(startIdx, endIdx, searched) {
      const w = this.state.width;
      const path = [];
      let cur = endIdx;
      while (cur !== -1) {
        path.push({
          x: cur % w,
          y: cur / w | 0
        });
        cur = cur === startIdx ? -1 : this.state.getParent(cur);
      }
      path.reverse();
      return {
        found: true,
        path,
        cost: this.state.getG(endIdx),
        nodesSearched: searched
      };
    }
    buildPathBidirectional(startIdx, endIdx, meetIdx, searched) {
      const w = this.state.width;
      const path = [];
      let cur = meetIdx;
      while (cur !== -1 && cur !== startIdx) {
        path.push({
          x: cur % w,
          y: cur / w | 0
        });
        cur = this.state.getParent(cur);
      }
      path.push({
        x: startIdx % w,
        y: startIdx / w | 0
      });
      path.reverse();
      cur = this.state.getParentBack(meetIdx);
      while (cur !== -1 && cur !== endIdx) {
        path.push({
          x: cur % w,
          y: cur / w | 0
        });
        cur = this.state.getParentBack(cur);
      }
      if (meetIdx !== endIdx) {
        path.push({
          x: endIdx % w,
          y: endIdx / w | 0
        });
      }
      const cost = this.state.getG(meetIdx) + this.state.getGBack(meetIdx);
      return {
        found: true,
        path,
        cost,
        nodesSearched: searched
      };
    }
    clear() {
      this.state.reset();
      this.openList.clear();
      this.openListBack?.clear();
    }
  };
  __name(_GridPathfinder, "GridPathfinder");
  var GridPathfinder = _GridPathfinder;
  function createGridPathfinder(map, config) {
    return new GridPathfinder(map, config);
  }
  __name(createGridPathfinder, "createGridPathfinder");

  // src/core/JPSPathfinder.ts
  var _JPSPathfinder = class _JPSPathfinder {
    constructor(map) {
      __publicField(this, "map");
      __publicField(this, "width");
      __publicField(this, "height");
      __publicField(this, "openList");
      __publicField(this, "nodeGrid");
      this.map = map;
      const bounds = this.getMapBounds();
      this.width = bounds.width;
      this.height = bounds.height;
      this.openList = new BinaryHeap((a, b) => a.f - b.f);
      this.nodeGrid = [];
    }
    /**
     * @zh 寻找路径
     * @en Find path
     */
    findPath(startX, startY, endX, endY, options) {
      const opts = {
        ...DEFAULT_PATHFINDING_OPTIONS,
        ...options
      };
      if (!this.map.isWalkable(startX, startY) || !this.map.isWalkable(endX, endY)) {
        return EMPTY_PATH_RESULT;
      }
      if (startX === endX && startY === endY) {
        return {
          found: true,
          path: [
            {
              x: startX,
              y: startY
            }
          ],
          cost: 0,
          nodesSearched: 1
        };
      }
      this.initGrid();
      this.openList.clear();
      const startNode = this.getOrCreateNode(startX, startY);
      startNode.g = 0;
      startNode.h = this.heuristic(startX, startY, endX, endY) * opts.heuristicWeight;
      startNode.f = startNode.h;
      this.openList.push(startNode);
      let nodesSearched = 0;
      while (!this.openList.isEmpty && nodesSearched < opts.maxNodes) {
        const current = this.openList.pop();
        current.closed = true;
        nodesSearched++;
        if (current.x === endX && current.y === endY) {
          return {
            found: true,
            path: this.buildPath(current),
            cost: current.g,
            nodesSearched
          };
        }
        this.identifySuccessors(current, endX, endY, opts);
      }
      return {
        found: false,
        path: [],
        cost: 0,
        nodesSearched
      };
    }
    /**
     * @zh 清理状态
     * @en Clear state
     */
    clear() {
      this.openList.clear();
      this.nodeGrid = [];
    }
    // =========================================================================
    // 私有方法 | Private Methods
    // =========================================================================
    /**
     * @zh 获取地图边界
     * @en Get map bounds
     */
    getMapBounds() {
      const mapAny = this.map;
      if (typeof mapAny.width === "number" && typeof mapAny.height === "number") {
        return {
          width: mapAny.width,
          height: mapAny.height
        };
      }
      return {
        width: 1e3,
        height: 1e3
      };
    }
    /**
     * @zh 初始化节点网格
     * @en Initialize node grid
     */
    initGrid() {
      this.nodeGrid = [];
      for (let i = 0; i < this.width; i++) {
        this.nodeGrid[i] = [];
      }
    }
    /**
     * @zh 获取或创建节点
     * @en Get or create node
     */
    getOrCreateNode(x, y) {
      const xi = x | 0;
      const yi = y | 0;
      if (xi < 0 || xi >= this.width || yi < 0 || yi >= this.height) {
        throw new Error("[JPSPathfinder] Invalid grid coordinates");
      }
      if (!this.nodeGrid[xi]) {
        this.nodeGrid[xi] = [];
      }
      if (!this.nodeGrid[xi][yi]) {
        this.nodeGrid[xi][yi] = {
          x: xi,
          y: yi,
          g: Infinity,
          h: 0,
          f: Infinity,
          parent: null,
          closed: false
        };
      }
      return this.nodeGrid[xi][yi];
    }
    /**
     * @zh 启发式函数（八方向距离）
     * @en Heuristic function (octile distance)
     */
    heuristic(x1, y1, x2, y2) {
      const dx = Math.abs(x1 - x2);
      const dy = Math.abs(y1 - y2);
      return dx + dy + (Math.SQRT2 - 2) * Math.min(dx, dy);
    }
    /**
     * @zh 识别后继节点（跳跃点）
     * @en Identify successors (jump points)
     */
    identifySuccessors(node, endX, endY, opts) {
      const neighbors = this.findNeighbors(node);
      for (const neighbor of neighbors) {
        const jumpPoint = this.jump(neighbor.x, neighbor.y, node.x, node.y, endX, endY);
        if (jumpPoint) {
          const jx = jumpPoint.x;
          const jy = jumpPoint.y;
          const jpNode = this.getOrCreateNode(jx, jy);
          if (jpNode.closed) continue;
          const dx = Math.abs(jx - node.x);
          const dy = Math.abs(jy - node.y);
          const distance = Math.sqrt(dx * dx + dy * dy);
          const tentativeG = node.g + distance;
          if (tentativeG < jpNode.g) {
            jpNode.g = tentativeG;
            jpNode.h = this.heuristic(jx, jy, endX, endY) * opts.heuristicWeight;
            jpNode.f = jpNode.g + jpNode.h;
            jpNode.parent = node;
            if (!this.openList.contains(jpNode)) {
              this.openList.push(jpNode);
            } else {
              this.openList.update(jpNode);
            }
          }
        }
      }
    }
    /**
     * @zh 查找邻居（根据父节点方向剪枝）
     * @en Find neighbors (pruned based on parent direction)
     */
    findNeighbors(node) {
      const { x, y, parent } = node;
      const neighbors = [];
      if (!parent) {
        for (let dx2 = -1; dx2 <= 1; dx2++) {
          for (let dy2 = -1; dy2 <= 1; dy2++) {
            if (dx2 === 0 && dy2 === 0) continue;
            const nx = x + dx2;
            const ny = y + dy2;
            if (this.isWalkableAt(nx, ny)) {
              if (dx2 !== 0 && dy2 !== 0) {
                if (this.isWalkableAt(x + dx2, y) || this.isWalkableAt(x, y + dy2)) {
                  neighbors.push({
                    x: nx,
                    y: ny
                  });
                }
              } else {
                neighbors.push({
                  x: nx,
                  y: ny
                });
              }
            }
          }
        }
        return neighbors;
      }
      const dx = Math.sign(x - parent.x);
      const dy = Math.sign(y - parent.y);
      if (dx !== 0 && dy !== 0) {
        if (this.isWalkableAt(x, y + dy)) {
          neighbors.push({
            x,
            y: y + dy
          });
        }
        if (this.isWalkableAt(x + dx, y)) {
          neighbors.push({
            x: x + dx,
            y
          });
        }
        if (this.isWalkableAt(x, y + dy) || this.isWalkableAt(x + dx, y)) {
          if (this.isWalkableAt(x + dx, y + dy)) {
            neighbors.push({
              x: x + dx,
              y: y + dy
            });
          }
        }
        if (!this.isWalkableAt(x - dx, y) && this.isWalkableAt(x, y + dy)) {
          if (this.isWalkableAt(x - dx, y + dy)) {
            neighbors.push({
              x: x - dx,
              y: y + dy
            });
          }
        }
        if (!this.isWalkableAt(x, y - dy) && this.isWalkableAt(x + dx, y)) {
          if (this.isWalkableAt(x + dx, y - dy)) {
            neighbors.push({
              x: x + dx,
              y: y - dy
            });
          }
        }
      } else if (dx !== 0) {
        if (this.isWalkableAt(x + dx, y)) {
          neighbors.push({
            x: x + dx,
            y
          });
          if (!this.isWalkableAt(x, y + 1) && this.isWalkableAt(x + dx, y + 1)) {
            neighbors.push({
              x: x + dx,
              y: y + 1
            });
          }
          if (!this.isWalkableAt(x, y - 1) && this.isWalkableAt(x + dx, y - 1)) {
            neighbors.push({
              x: x + dx,
              y: y - 1
            });
          }
        }
      } else if (dy !== 0) {
        if (this.isWalkableAt(x, y + dy)) {
          neighbors.push({
            x,
            y: y + dy
          });
          if (!this.isWalkableAt(x + 1, y) && this.isWalkableAt(x + 1, y + dy)) {
            neighbors.push({
              x: x + 1,
              y: y + dy
            });
          }
          if (!this.isWalkableAt(x - 1, y) && this.isWalkableAt(x - 1, y + dy)) {
            neighbors.push({
              x: x - 1,
              y: y + dy
            });
          }
        }
      }
      return neighbors;
    }
    /**
     * @zh 跳跃函数（迭代版本，避免递归开销）
     * @en Jump function (iterative version to avoid recursion overhead)
     */
    jump(startX, startY, px, py, endX, endY) {
      const dx = startX - px;
      const dy = startY - py;
      let x = startX;
      let y = startY;
      while (true) {
        if (!this.isWalkableAt(x, y)) {
          return null;
        }
        if (x === endX && y === endY) {
          return {
            x,
            y
          };
        }
        if (dx !== 0 && dy !== 0) {
          if (this.isWalkableAt(x - dx, y + dy) && !this.isWalkableAt(x - dx, y) || this.isWalkableAt(x + dx, y - dy) && !this.isWalkableAt(x, y - dy)) {
            return {
              x,
              y
            };
          }
          if (this.jumpStraight(x + dx, y, dx, 0, endX, endY) || this.jumpStraight(x, y + dy, 0, dy, endX, endY)) {
            return {
              x,
              y
            };
          }
          if (!this.isWalkableAt(x + dx, y) && !this.isWalkableAt(x, y + dy)) {
            return null;
          }
        } else if (dx !== 0) {
          if (this.isWalkableAt(x + dx, y + 1) && !this.isWalkableAt(x, y + 1) || this.isWalkableAt(x + dx, y - 1) && !this.isWalkableAt(x, y - 1)) {
            return {
              x,
              y
            };
          }
        } else if (dy !== 0) {
          if (this.isWalkableAt(x + 1, y + dy) && !this.isWalkableAt(x + 1, y) || this.isWalkableAt(x - 1, y + dy) && !this.isWalkableAt(x - 1, y)) {
            return {
              x,
              y
            };
          }
        }
        x += dx;
        y += dy;
      }
    }
    /**
     * @zh 直线跳跃（水平或垂直方向）
     * @en Straight jump (horizontal or vertical direction)
     */
    jumpStraight(startX, startY, dx, dy, endX, endY) {
      let x = startX;
      let y = startY;
      while (true) {
        if (!this.isWalkableAt(x, y)) {
          return false;
        }
        if (x === endX && y === endY) {
          return true;
        }
        if (dx !== 0) {
          if (this.isWalkableAt(x + dx, y + 1) && !this.isWalkableAt(x, y + 1) || this.isWalkableAt(x + dx, y - 1) && !this.isWalkableAt(x, y - 1)) {
            return true;
          }
        } else if (dy !== 0) {
          if (this.isWalkableAt(x + 1, y + dy) && !this.isWalkableAt(x + 1, y) || this.isWalkableAt(x - 1, y + dy) && !this.isWalkableAt(x - 1, y)) {
            return true;
          }
        }
        x += dx;
        y += dy;
      }
    }
    /**
     * @zh 检查位置是否可通行
     * @en Check if position is walkable
     */
    isWalkableAt(x, y) {
      if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
        return false;
      }
      return this.map.isWalkable(x, y);
    }
    /**
     * @zh 构建路径
     * @en Build path
     */
    buildPath(endNode) {
      const path = [];
      let current = endNode;
      while (current) {
        path.unshift({
          x: current.x,
          y: current.y
        });
        current = current.parent;
      }
      return this.interpolatePath(path);
    }
    /**
     * @zh 插值路径（在跳跃点之间填充中间点）
     * @en Interpolate path (fill intermediate points between jump points)
     */
    interpolatePath(jumpPoints) {
      if (jumpPoints.length < 2) {
        return jumpPoints;
      }
      const path = [
        jumpPoints[0]
      ];
      for (let i = 1; i < jumpPoints.length; i++) {
        const prev = jumpPoints[i - 1];
        const curr = jumpPoints[i];
        const dx = curr.x - prev.x;
        const dy = curr.y - prev.y;
        const steps = Math.max(Math.abs(dx), Math.abs(dy));
        const stepX = dx === 0 ? 0 : dx / Math.abs(dx);
        const stepY = dy === 0 ? 0 : dy / Math.abs(dy);
        let x = prev.x;
        let y = prev.y;
        for (let j = 0; j < steps; j++) {
          if (x !== curr.x && y !== curr.y) {
            x += stepX;
            y += stepY;
          } else if (x !== curr.x) {
            x += stepX;
          } else if (y !== curr.y) {
            y += stepY;
          }
          if (x !== prev.x || y !== prev.y) {
            path.push({
              x,
              y
            });
          }
        }
      }
      return path;
    }
  };
  __name(_JPSPathfinder, "JPSPathfinder");
  var JPSPathfinder = _JPSPathfinder;
  function createJPSPathfinder(map) {
    return new JPSPathfinder(map);
  }
  __name(createJPSPathfinder, "createJPSPathfinder");

  // src/core/HPAPathfinder.ts
  var DEFAULT_HPA_CONFIG = {
    clusterSize: 64,
    maxEntranceWidth: 16,
    cacheInternalPaths: true,
    entranceStrategy: "end",
    lazyIntraEdges: true
  };
  var _a3;
  var SubMap = (_a3 = class {
    constructor(parentMap, originX, originY, width, height) {
      __publicField(this, "parentMap");
      __publicField(this, "originX");
      __publicField(this, "originY");
      __publicField(this, "width");
      __publicField(this, "height");
      this.parentMap = parentMap;
      this.originX = originX;
      this.originY = originY;
      this.width = width;
      this.height = height;
    }
    /**
     * @zh 局部坐标转全局坐标
     * @en Convert local to global coordinates
     */
    localToGlobal(localX, localY) {
      return {
        x: this.originX + localX,
        y: this.originY + localY
      };
    }
    /**
     * @zh 全局坐标转局部坐标
     * @en Convert global to local coordinates
     */
    globalToLocal(globalX, globalY) {
      return {
        x: globalX - this.originX,
        y: globalY - this.originY
      };
    }
    isWalkable(x, y) {
      if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
        return false;
      }
      return this.parentMap.isWalkable(this.originX + x, this.originY + y);
    }
    getNodeAt(x, y) {
      if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
        return null;
      }
      const globalNode = this.parentMap.getNodeAt(this.originX + x, this.originY + y);
      if (!globalNode) return null;
      return {
        id: y * this.width + x,
        position: {
          x,
          y
        },
        cost: globalNode.cost,
        walkable: globalNode.walkable
      };
    }
    getNeighbors(node) {
      const neighbors = [];
      const { x, y } = node.position;
      const directions = [
        {
          dx: 0,
          dy: -1
        },
        {
          dx: 1,
          dy: -1
        },
        {
          dx: 1,
          dy: 0
        },
        {
          dx: 1,
          dy: 1
        },
        {
          dx: 0,
          dy: 1
        },
        {
          dx: -1,
          dy: 1
        },
        {
          dx: -1,
          dy: 0
        },
        {
          dx: -1,
          dy: -1
        }
        // NW
      ];
      for (const dir of directions) {
        const nx = x + dir.dx;
        const ny = y + dir.dy;
        if (nx < 0 || nx >= this.width || ny < 0 || ny >= this.height) {
          continue;
        }
        if (!this.isWalkable(nx, ny)) {
          continue;
        }
        if (dir.dx !== 0 && dir.dy !== 0) {
          if (!this.isWalkable(x + dir.dx, y) || !this.isWalkable(x, y + dir.dy)) {
            continue;
          }
        }
        const neighborNode = this.getNodeAt(nx, ny);
        if (neighborNode) {
          neighbors.push(neighborNode);
        }
      }
      return neighbors;
    }
    heuristic(a, b) {
      const dx = Math.abs(a.x - b.x);
      const dy = Math.abs(a.y - b.y);
      return dx + dy + (Math.SQRT2 - 2) * Math.min(dx, dy);
    }
    getMovementCost(from, to) {
      const dx = Math.abs(to.position.x - from.position.x);
      const dy = Math.abs(to.position.y - from.position.y);
      const baseCost = dx !== 0 && dy !== 0 ? Math.SQRT2 : 1;
      return baseCost * to.cost;
    }
  }, __name(_a3, "SubMap"), _a3);
  var _a4;
  var Cluster = (_a4 = class {
    constructor(id, originX, originY, width, height, parentMap) {
      __publicField(this, "id");
      __publicField(this, "originX");
      __publicField(this, "originY");
      __publicField(this, "width");
      __publicField(this, "height");
      __publicField(this, "subMap");
      /** @zh 集群内的抽象节点 ID 列表 @en Abstract node IDs in this cluster */
      __publicField(this, "nodeIds", []);
      /** @zh 预计算的距离缓存 @en Precomputed distance cache */
      __publicField(this, "distanceCache", /* @__PURE__ */ new Map());
      /** @zh 预计算的路径缓存 @en Precomputed path cache */
      __publicField(this, "pathCache", /* @__PURE__ */ new Map());
      this.id = id;
      this.originX = originX;
      this.originY = originY;
      this.width = width;
      this.height = height;
      this.subMap = new SubMap(parentMap, originX, originY, width, height);
    }
    /**
     * @zh 检查点是否在集群内
     * @en Check if point is in cluster
     */
    containsPoint(x, y) {
      return x >= this.originX && x < this.originX + this.width && y >= this.originY && y < this.originY + this.height;
    }
    /**
     * @zh 添加节点 ID
     * @en Add node ID
     */
    addNodeId(nodeId) {
      if (!this.nodeIds.includes(nodeId)) {
        this.nodeIds.push(nodeId);
      }
    }
    /**
     * @zh 移除节点 ID
     * @en Remove node ID
     */
    removeNodeId(nodeId) {
      const idx = this.nodeIds.indexOf(nodeId);
      if (idx !== -1) {
        this.nodeIds.splice(idx, 1);
      }
    }
    /**
     * @zh 生成缓存键
     * @en Generate cache key
     */
    getCacheKey(fromId, toId) {
      return `${fromId}->${toId}`;
    }
    /**
     * @zh 设置缓存
     * @en Set cache
     */
    setCache(fromId, toId, cost, path) {
      const key = this.getCacheKey(fromId, toId);
      this.distanceCache.set(key, cost);
      this.pathCache.set(key, path);
    }
    /**
     * @zh 获取缓存的距离
     * @en Get cached distance
     */
    getCachedDistance(fromId, toId) {
      return this.distanceCache.get(this.getCacheKey(fromId, toId));
    }
    /**
     * @zh 获取缓存的路径
     * @en Get cached path
     */
    getCachedPath(fromId, toId) {
      return this.pathCache.get(this.getCacheKey(fromId, toId));
    }
    /**
     * @zh 清除缓存
     * @en Clear cache
     */
    clearCache() {
      this.distanceCache.clear();
      this.pathCache.clear();
    }
    /**
     * @zh 获取缓存大小
     * @en Get cache size
     */
    getCacheSize() {
      return this.distanceCache.size;
    }
  }, __name(_a4, "Cluster"), _a4);
  var _HPAPathfinder = class _HPAPathfinder {
    constructor(map, config) {
      __publicField(this, "map");
      __publicField(this, "config");
      __publicField(this, "mapWidth");
      __publicField(this, "mapHeight");
      // 集群管理
      __publicField(this, "clusters", []);
      __publicField(this, "clusterGrid", []);
      __publicField(this, "clustersX", 0);
      __publicField(this, "clustersY", 0);
      // 抽象图
      __publicField(this, "abstractNodes", /* @__PURE__ */ new Map());
      __publicField(this, "nodesByCluster", /* @__PURE__ */ new Map());
      __publicField(this, "nextNodeId", 0);
      // 入口统计
      __publicField(this, "entranceCount", 0);
      // 内部寻路器
      __publicField(this, "localPathfinder");
      // 完整路径缓存
      __publicField(this, "pathCache");
      __publicField(this, "mapVersion", 0);
      __publicField(this, "preprocessed", false);
      this.map = map;
      this.config = {
        ...DEFAULT_HPA_CONFIG,
        ...config
      };
      const bounds = this.getMapBounds();
      this.mapWidth = bounds.width;
      this.mapHeight = bounds.height;
      this.localPathfinder = new AStarPathfinder(map);
      this.pathCache = new PathCache({
        maxEntries: 1e3,
        ttlMs: 0
      });
    }
    // =========================================================================
    // 公共 API | Public API
    // =========================================================================
    /**
     * @zh 预处理地图（构建抽象图）
     * @en Preprocess map (build abstract graph)
     */
    preprocess() {
      this.clear();
      this.buildClusters();
      this.buildEntrances();
      this.buildIntraEdges();
      this.preprocessed = true;
    }
    /**
     * @zh 寻找路径
     * @en Find path
     */
    findPath(startX, startY, endX, endY, options) {
      if (!this.preprocessed) {
        this.preprocess();
      }
      const opts = {
        ...DEFAULT_PATHFINDING_OPTIONS,
        ...options
      };
      if (!this.map.isWalkable(startX, startY) || !this.map.isWalkable(endX, endY)) {
        return EMPTY_PATH_RESULT;
      }
      if (startX === endX && startY === endY) {
        return {
          found: true,
          path: [
            {
              x: startX,
              y: startY
            }
          ],
          cost: 0,
          nodesSearched: 1
        };
      }
      const cached = this.pathCache.get(startX, startY, endX, endY, this.mapVersion);
      if (cached) {
        return cached;
      }
      const startCluster = this.getClusterAt(startX, startY);
      const endCluster = this.getClusterAt(endX, endY);
      if (!startCluster || !endCluster) {
        return EMPTY_PATH_RESULT;
      }
      let result;
      if (startCluster.id === endCluster.id) {
        result = this.findLocalPath(startX, startY, endX, endY, opts);
      } else {
        const startTemp = this.insertTempNode(startX, startY, startCluster);
        const endTemp = this.insertTempNode(endX, endY, endCluster);
        const abstractPath = this.abstractSearch(startTemp, endTemp, opts);
        this.removeTempNode(startTemp, startCluster);
        this.removeTempNode(endTemp, endCluster);
        if (!abstractPath || abstractPath.length === 0) {
          return EMPTY_PATH_RESULT;
        }
        result = this.refinePath(abstractPath, startX, startY, endX, endY, opts);
      }
      if (result.found) {
        this.pathCache.set(startX, startY, endX, endY, result, this.mapVersion);
      }
      return result;
    }
    /**
     * @zh 清理状态
     * @en Clear state
     */
    clear() {
      this.clusters = [];
      this.clusterGrid = [];
      this.abstractNodes.clear();
      this.nodesByCluster.clear();
      this.nextNodeId = 0;
      this.entranceCount = 0;
      this.pathCache.invalidateAll();
      this.mapVersion++;
      this.preprocessed = false;
    }
    /**
     * @zh 通知地图区域变化
     * @en Notify map region change
     */
    notifyRegionChange(minX, minY, maxX, maxY) {
      const affectedClusters = this.getAffectedClusters(minX, minY, maxX, maxY);
      for (const cluster of affectedClusters) {
        cluster.clearCache();
        for (const nodeId of cluster.nodeIds) {
          const node = this.abstractNodes.get(nodeId);
          if (node) {
            node.edges = node.edges.filter((e) => e.isInterEdge);
          }
        }
        this.buildClusterIntraEdges(cluster);
      }
      this.pathCache.invalidateRegion(minX, minY, maxX, maxY);
      this.mapVersion++;
    }
    /**
     * @zh 获取预处理统计信息
     * @en Get preprocessing statistics
     */
    getStats() {
      let cacheSize = 0;
      for (const cluster of this.clusters) {
        cacheSize += cluster.getCacheSize();
      }
      return {
        clusters: this.clusters.length,
        entrances: this.entranceCount,
        abstractNodes: this.abstractNodes.size,
        cacheSize
      };
    }
    // =========================================================================
    // 预处理方法 | Preprocessing Methods
    // =========================================================================
    getMapBounds() {
      const mapAny = this.map;
      if (typeof mapAny.width === "number" && typeof mapAny.height === "number") {
        return {
          width: mapAny.width,
          height: mapAny.height
        };
      }
      return {
        width: 1e3,
        height: 1e3
      };
    }
    /**
     * @zh 构建集群
     * @en Build clusters
     */
    buildClusters() {
      const clusterSize = this.config.clusterSize;
      this.clustersX = Math.ceil(this.mapWidth / clusterSize);
      this.clustersY = Math.ceil(this.mapHeight / clusterSize);
      this.clusterGrid = [];
      for (let cx = 0; cx < this.clustersX; cx++) {
        this.clusterGrid[cx] = [];
        for (let cy = 0; cy < this.clustersY; cy++) {
          this.clusterGrid[cx][cy] = null;
        }
      }
      let clusterId = 0;
      for (let cy = 0; cy < this.clustersY; cy++) {
        for (let cx = 0; cx < this.clustersX; cx++) {
          const originX = cx * clusterSize;
          const originY = cy * clusterSize;
          const width = Math.min(clusterSize, this.mapWidth - originX);
          const height = Math.min(clusterSize, this.mapHeight - originY);
          const cluster = new Cluster(clusterId, originX, originY, width, height, this.map);
          this.clusters.push(cluster);
          this.clusterGrid[cx][cy] = clusterId;
          this.nodesByCluster.set(clusterId, []);
          clusterId++;
        }
      }
    }
    /**
     * @zh 检测入口并创建抽象节点
     * @en Detect entrances and create abstract nodes
     */
    buildEntrances() {
      this.config.clusterSize;
      for (let cy = 0; cy < this.clustersY; cy++) {
        for (let cx = 0; cx < this.clustersX; cx++) {
          const clusterId = this.clusterGrid[cx][cy];
          if (clusterId === null) continue;
          const cluster1 = this.clusters[clusterId];
          if (cx < this.clustersX - 1) {
            const cluster2Id = this.clusterGrid[cx + 1][cy];
            if (cluster2Id !== null) {
              const cluster2 = this.clusters[cluster2Id];
              this.detectAndCreateEntrances(cluster1, cluster2, "vertical");
            }
          }
          if (cy < this.clustersY - 1) {
            const cluster2Id = this.clusterGrid[cx][cy + 1];
            if (cluster2Id !== null) {
              const cluster2 = this.clusters[cluster2Id];
              this.detectAndCreateEntrances(cluster1, cluster2, "horizontal");
            }
          }
        }
      }
    }
    /**
     * @zh 检测并创建两个相邻集群之间的入口
     * @en Detect and create entrances between two adjacent clusters
     */
    detectAndCreateEntrances(cluster1, cluster2, boundaryDirection) {
      const spans = this.detectEntranceSpans(cluster1, cluster2, boundaryDirection);
      for (const span of spans) {
        this.createEntranceNodes(cluster1, cluster2, span, boundaryDirection);
      }
    }
    /**
     * @zh 检测边界上的连续可通行区间
     * @en Detect continuous walkable spans on boundary
     */
    detectEntranceSpans(cluster1, cluster2, boundaryDirection) {
      const spans = [];
      if (boundaryDirection === "vertical") {
        const x1 = cluster1.originX + cluster1.width - 1;
        const x2 = cluster2.originX;
        const startY = Math.max(cluster1.originY, cluster2.originY);
        const endY = Math.min(cluster1.originY + cluster1.height, cluster2.originY + cluster2.height);
        let spanStart = null;
        for (let y = startY; y < endY; y++) {
          const walkable1 = this.map.isWalkable(x1, y);
          const walkable2 = this.map.isWalkable(x2, y);
          if (walkable1 && walkable2) {
            if (spanStart === null) {
              spanStart = y;
            }
          } else {
            if (spanStart !== null) {
              spans.push({
                start: spanStart,
                end: y - 1
              });
              spanStart = null;
            }
          }
        }
        if (spanStart !== null) {
          spans.push({
            start: spanStart,
            end: endY - 1
          });
        }
      } else {
        const y1 = cluster1.originY + cluster1.height - 1;
        const y2 = cluster2.originY;
        const startX = Math.max(cluster1.originX, cluster2.originX);
        const endX = Math.min(cluster1.originX + cluster1.width, cluster2.originX + cluster2.width);
        let spanStart = null;
        for (let x = startX; x < endX; x++) {
          const walkable1 = this.map.isWalkable(x, y1);
          const walkable2 = this.map.isWalkable(x, y2);
          if (walkable1 && walkable2) {
            if (spanStart === null) {
              spanStart = x;
            }
          } else {
            if (spanStart !== null) {
              spans.push({
                start: spanStart,
                end: x - 1
              });
              spanStart = null;
            }
          }
        }
        if (spanStart !== null) {
          spans.push({
            start: spanStart,
            end: endX - 1
          });
        }
      }
      return spans;
    }
    /**
     * @zh 为入口区间创建抽象节点
     * @en Create abstract nodes for entrance span
     */
    createEntranceNodes(cluster1, cluster2, span, boundaryDirection) {
      const spanLength = span.end - span.start + 1;
      const maxWidth = this.config.maxEntranceWidth;
      const strategy = this.config.entranceStrategy;
      const positions = [];
      if (spanLength <= maxWidth) {
        positions.push(Math.floor((span.start + span.end) / 2));
      } else {
        const numNodes = Math.ceil(spanLength / maxWidth);
        const spacing = spanLength / numNodes;
        for (let i = 0; i < numNodes; i++) {
          const pos = Math.floor(span.start + spacing * (i + 0.5));
          positions.push(Math.min(pos, span.end));
        }
        if (strategy === "end") {
          if (!positions.includes(span.start)) {
            positions.unshift(span.start);
          }
          if (!positions.includes(span.end)) {
            positions.push(span.end);
          }
        }
      }
      for (const pos of positions) {
        let p1, p2;
        if (boundaryDirection === "vertical") {
          p1 = {
            x: cluster1.originX + cluster1.width - 1,
            y: pos
          };
          p2 = {
            x: cluster2.originX,
            y: pos
          };
        } else {
          p1 = {
            x: pos,
            y: cluster1.originY + cluster1.height - 1
          };
          p2 = {
            x: pos,
            y: cluster2.originY
          };
        }
        const node1 = this.createAbstractNode(p1, cluster1);
        const node2 = this.createAbstractNode(p2, cluster2);
        const interCost = 1;
        node1.edges.push({
          targetNodeId: node2.id,
          cost: interCost,
          isInterEdge: true,
          innerPath: null
        });
        node2.edges.push({
          targetNodeId: node1.id,
          cost: interCost,
          isInterEdge: true,
          innerPath: null
        });
        this.entranceCount++;
      }
    }
    /**
     * @zh 创建抽象节点
     * @en Create abstract node
     */
    createAbstractNode(position, cluster) {
      const concreteId = position.y * this.mapWidth + position.x;
      for (const nodeId of cluster.nodeIds) {
        const existing = this.abstractNodes.get(nodeId);
        if (existing && existing.concreteNodeId === concreteId) {
          return existing;
        }
      }
      const node = {
        id: this.nextNodeId++,
        position: {
          x: position.x,
          y: position.y
        },
        clusterId: cluster.id,
        concreteNodeId: concreteId,
        edges: []
      };
      this.abstractNodes.set(node.id, node);
      cluster.addNodeId(node.id);
      const clusterNodes = this.nodesByCluster.get(cluster.id);
      if (clusterNodes) {
        clusterNodes.push(node.id);
      }
      return node;
    }
    /**
     * @zh 构建所有集群的 intra-edges
     * @en Build intra-edges for all clusters
     */
    buildIntraEdges() {
      for (const cluster of this.clusters) {
        this.buildClusterIntraEdges(cluster);
      }
    }
    /**
     * @zh 构建单个集群的 intra-edges
     * @en Build intra-edges for single cluster
     */
    buildClusterIntraEdges(cluster) {
      const nodeIds = cluster.nodeIds;
      if (nodeIds.length < 2) return;
      if (this.config.lazyIntraEdges) {
        this.buildLazyIntraEdges(cluster);
      } else {
        this.buildEagerIntraEdges(cluster);
      }
    }
    /**
     * @zh 延迟构建 intra-edges（只用启发式距离）
     * @en Build lazy intra-edges (using heuristic distance only)
     */
    buildLazyIntraEdges(cluster) {
      const nodeIds = cluster.nodeIds;
      for (let i = 0; i < nodeIds.length; i++) {
        for (let j = i + 1; j < nodeIds.length; j++) {
          const node1 = this.abstractNodes.get(nodeIds[i]);
          const node2 = this.abstractNodes.get(nodeIds[j]);
          const heuristicCost = this.heuristic(node1.position, node2.position);
          node1.edges.push({
            targetNodeId: node2.id,
            cost: heuristicCost,
            isInterEdge: false,
            innerPath: null
            // 标记为未计算
          });
          node2.edges.push({
            targetNodeId: node1.id,
            cost: heuristicCost,
            isInterEdge: false,
            innerPath: null
          });
        }
      }
    }
    /**
     * @zh 立即构建 intra-edges（计算真实路径）
     * @en Build eager intra-edges (compute actual paths)
     */
    buildEagerIntraEdges(cluster) {
      const nodeIds = cluster.nodeIds;
      const subPathfinder = new AStarPathfinder(cluster.subMap);
      for (let i = 0; i < nodeIds.length; i++) {
        for (let j = i + 1; j < nodeIds.length; j++) {
          const node1 = this.abstractNodes.get(nodeIds[i]);
          const node2 = this.abstractNodes.get(nodeIds[j]);
          const local1 = cluster.subMap.globalToLocal(node1.position.x, node1.position.y);
          const local2 = cluster.subMap.globalToLocal(node2.position.x, node2.position.y);
          const result = subPathfinder.findPath(local1.x, local1.y, local2.x, local2.y);
          if (result.found && result.path.length > 0) {
            const globalPath = result.path.map((p) => {
              const global = cluster.subMap.localToGlobal(p.x, p.y);
              return global.y * this.mapWidth + global.x;
            });
            if (this.config.cacheInternalPaths) {
              cluster.setCache(node1.id, node2.id, result.cost, globalPath);
              cluster.setCache(node2.id, node1.id, result.cost, [
                ...globalPath
              ].reverse());
            }
            node1.edges.push({
              targetNodeId: node2.id,
              cost: result.cost,
              isInterEdge: false,
              innerPath: this.config.cacheInternalPaths ? globalPath : null
            });
            node2.edges.push({
              targetNodeId: node1.id,
              cost: result.cost,
              isInterEdge: false,
              innerPath: this.config.cacheInternalPaths ? [
                ...globalPath
              ].reverse() : null
            });
          }
        }
      }
    }
    /**
     * @zh 按需计算 intra-edge 的真实路径
     * @en Compute actual path for intra-edge on demand
     */
    computeIntraEdgePath(fromNode, toNode, edge) {
      const cluster = this.clusters[fromNode.clusterId];
      if (!cluster) return null;
      const cachedPath = cluster.getCachedPath(fromNode.id, toNode.id);
      const cachedCost = cluster.getCachedDistance(fromNode.id, toNode.id);
      if (cachedPath && cachedCost !== void 0) {
        edge.cost = cachedCost;
        edge.innerPath = cachedPath;
        return {
          cost: cachedCost,
          path: cachedPath
        };
      }
      const subPathfinder = new AStarPathfinder(cluster.subMap);
      const local1 = cluster.subMap.globalToLocal(fromNode.position.x, fromNode.position.y);
      const local2 = cluster.subMap.globalToLocal(toNode.position.x, toNode.position.y);
      const result = subPathfinder.findPath(local1.x, local1.y, local2.x, local2.y);
      if (result.found && result.path.length > 0) {
        const globalPath = result.path.map((p) => {
          const global = cluster.subMap.localToGlobal(p.x, p.y);
          return global.y * this.mapWidth + global.x;
        });
        if (this.config.cacheInternalPaths) {
          cluster.setCache(fromNode.id, toNode.id, result.cost, globalPath);
          cluster.setCache(toNode.id, fromNode.id, result.cost, [
            ...globalPath
          ].reverse());
        }
        edge.cost = result.cost;
        edge.innerPath = globalPath;
        const reverseEdge = toNode.edges.find((e) => e.targetNodeId === fromNode.id);
        if (reverseEdge) {
          reverseEdge.cost = result.cost;
          reverseEdge.innerPath = [
            ...globalPath
          ].reverse();
        }
        return {
          cost: result.cost,
          path: globalPath
        };
      }
      return null;
    }
    // =========================================================================
    // 搜索方法 | Search Methods
    // =========================================================================
    /**
     * @zh 获取指定位置的集群
     * @en Get cluster at position
     */
    getClusterAt(x, y) {
      const cx = Math.floor(x / this.config.clusterSize);
      const cy = Math.floor(y / this.config.clusterSize);
      if (cx < 0 || cx >= this.clustersX || cy < 0 || cy >= this.clustersY) {
        return null;
      }
      const clusterId = this.clusterGrid[cx]?.[cy];
      if (clusterId === null || clusterId === void 0) {
        return null;
      }
      return this.clusters[clusterId] || null;
    }
    /**
     * @zh 获取受影响的集群
     * @en Get affected clusters
     */
    getAffectedClusters(minX, minY, maxX, maxY) {
      const affected = [];
      const clusterSize = this.config.clusterSize;
      const minCX = Math.floor(minX / clusterSize);
      const maxCX = Math.floor(maxX / clusterSize);
      const minCY = Math.floor(minY / clusterSize);
      const maxCY = Math.floor(maxY / clusterSize);
      for (let cy = minCY; cy <= maxCY; cy++) {
        for (let cx = minCX; cx <= maxCX; cx++) {
          if (cx >= 0 && cx < this.clustersX && cy >= 0 && cy < this.clustersY) {
            const clusterId = this.clusterGrid[cx]?.[cy];
            if (clusterId !== null && clusterId !== void 0) {
              affected.push(this.clusters[clusterId]);
            }
          }
        }
      }
      return affected;
    }
    /**
     * @zh 插入临时节点
     * @en Insert temporary node
     */
    insertTempNode(x, y, cluster) {
      const concreteId = y * this.mapWidth + x;
      for (const nodeId of cluster.nodeIds) {
        const existing = this.abstractNodes.get(nodeId);
        if (existing && existing.concreteNodeId === concreteId) {
          return existing;
        }
      }
      const tempNode = {
        id: this.nextNodeId++,
        position: {
          x,
          y
        },
        clusterId: cluster.id,
        concreteNodeId: concreteId,
        edges: []
      };
      this.abstractNodes.set(tempNode.id, tempNode);
      cluster.addNodeId(tempNode.id);
      const subPathfinder = new AStarPathfinder(cluster.subMap);
      const localPos = cluster.subMap.globalToLocal(x, y);
      for (const existingNodeId of cluster.nodeIds) {
        if (existingNodeId === tempNode.id) continue;
        const existingNode = this.abstractNodes.get(existingNodeId);
        if (!existingNode) continue;
        const targetLocalPos = cluster.subMap.globalToLocal(existingNode.position.x, existingNode.position.y);
        const result = subPathfinder.findPath(localPos.x, localPos.y, targetLocalPos.x, targetLocalPos.y);
        if (result.found && result.path.length > 0) {
          const globalPath = result.path.map((p) => {
            const global = cluster.subMap.localToGlobal(p.x, p.y);
            return global.y * this.mapWidth + global.x;
          });
          tempNode.edges.push({
            targetNodeId: existingNode.id,
            cost: result.cost,
            isInterEdge: false,
            innerPath: globalPath
          });
          existingNode.edges.push({
            targetNodeId: tempNode.id,
            cost: result.cost,
            isInterEdge: false,
            innerPath: [
              ...globalPath
            ].reverse()
          });
        }
      }
      return tempNode;
    }
    /**
     * @zh 移除临时节点
     * @en Remove temporary node
     */
    removeTempNode(node, cluster) {
      for (const existingNodeId of cluster.nodeIds) {
        if (existingNodeId === node.id) continue;
        const existingNode = this.abstractNodes.get(existingNodeId);
        if (existingNode) {
          existingNode.edges = existingNode.edges.filter((e) => e.targetNodeId !== node.id);
        }
      }
      cluster.removeNodeId(node.id);
      this.abstractNodes.delete(node.id);
    }
    /**
     * @zh 在抽象图上进行 A* 搜索
     * @en Perform A* search on abstract graph
     */
    abstractSearch(startNode, endNode, opts) {
      const openList = new IndexedBinaryHeap((a, b) => a.f - b.f);
      const nodeMap = /* @__PURE__ */ new Map();
      const endPosition = endNode.position;
      const h = this.heuristic(startNode.position, endPosition) * opts.heuristicWeight;
      const startSearchNode = {
        node: startNode,
        g: 0,
        h,
        f: h,
        parent: null,
        closed: false,
        opened: true,
        heapIndex: -1
      };
      openList.push(startSearchNode);
      nodeMap.set(startNode.id, startSearchNode);
      let nodesSearched = 0;
      while (!openList.isEmpty && nodesSearched < opts.maxNodes) {
        const current = openList.pop();
        current.closed = true;
        nodesSearched++;
        if (current.node.id === endNode.id) {
          return this.reconstructPath(current);
        }
        for (const edge of current.node.edges) {
          let neighbor = nodeMap.get(edge.targetNodeId);
          if (!neighbor) {
            const neighborNode = this.abstractNodes.get(edge.targetNodeId);
            if (!neighborNode) continue;
            const nh = this.heuristic(neighborNode.position, endPosition) * opts.heuristicWeight;
            neighbor = {
              node: neighborNode,
              g: Infinity,
              h: nh,
              f: Infinity,
              parent: null,
              closed: false,
              opened: false,
              heapIndex: -1
            };
            nodeMap.set(edge.targetNodeId, neighbor);
          }
          if (neighbor.closed) continue;
          const tentativeG = current.g + edge.cost;
          if (!neighbor.opened) {
            neighbor.g = tentativeG;
            neighbor.f = tentativeG + neighbor.h;
            neighbor.parent = current;
            neighbor.opened = true;
            openList.push(neighbor);
          } else if (tentativeG < neighbor.g) {
            neighbor.g = tentativeG;
            neighbor.f = tentativeG + neighbor.h;
            neighbor.parent = current;
            openList.update(neighbor);
          }
        }
      }
      return null;
    }
    /**
     * @zh 重建抽象路径
     * @en Reconstruct abstract path
     */
    reconstructPath(endNode) {
      const path = [];
      let current = endNode;
      while (current) {
        path.unshift(current.node);
        current = current.parent;
      }
      return path;
    }
    /**
     * @zh 细化抽象路径为具体路径
     * @en Refine abstract path to concrete path
     */
    refinePath(abstractPath, startX, startY, endX, endY, opts) {
      if (abstractPath.length === 0) {
        return EMPTY_PATH_RESULT;
      }
      const fullPath = [];
      let totalCost = 0;
      let nodesSearched = abstractPath.length;
      for (let i = 0; i < abstractPath.length - 1; i++) {
        const fromNode = abstractPath[i];
        const toNode = abstractPath[i + 1];
        const edge = fromNode.edges.find((e) => e.targetNodeId === toNode.id);
        if (!edge) {
          const segResult = this.findLocalPath(fromNode.position.x, fromNode.position.y, toNode.position.x, toNode.position.y, opts);
          if (segResult.found) {
            this.appendPath(fullPath, segResult.path);
            totalCost += segResult.cost;
            nodesSearched += segResult.nodesSearched;
          }
        } else if (edge.isInterEdge) {
          if (fullPath.length === 0 || fullPath[fullPath.length - 1].x !== fromNode.position.x || fullPath[fullPath.length - 1].y !== fromNode.position.y) {
            fullPath.push({
              x: fromNode.position.x,
              y: fromNode.position.y
            });
          }
          fullPath.push({
            x: toNode.position.x,
            y: toNode.position.y
          });
          totalCost += edge.cost;
        } else if (edge.innerPath && edge.innerPath.length > 0) {
          const concretePath = edge.innerPath.map((id) => ({
            x: id % this.mapWidth,
            y: Math.floor(id / this.mapWidth)
          }));
          this.appendPath(fullPath, concretePath);
          totalCost += edge.cost;
        } else {
          const computed = this.computeIntraEdgePath(fromNode, toNode, edge);
          if (computed && computed.path.length > 0) {
            const concretePath = computed.path.map((id) => ({
              x: id % this.mapWidth,
              y: Math.floor(id / this.mapWidth)
            }));
            this.appendPath(fullPath, concretePath);
            totalCost += computed.cost;
          } else {
            const segResult = this.findLocalPath(fromNode.position.x, fromNode.position.y, toNode.position.x, toNode.position.y, opts);
            if (segResult.found) {
              this.appendPath(fullPath, segResult.path);
              totalCost += segResult.cost;
              nodesSearched += segResult.nodesSearched;
            }
          }
        }
      }
      if (fullPath.length > 0 && (fullPath[0].x !== startX || fullPath[0].y !== startY)) {
        const firstPoint = fullPath[0];
        if (Math.abs(firstPoint.x - startX) <= 1 && Math.abs(firstPoint.y - startY) <= 1) {
          fullPath.unshift({
            x: startX,
            y: startY
          });
        } else {
          const segResult = this.findLocalPath(startX, startY, firstPoint.x, firstPoint.y, opts);
          if (segResult.found) {
            fullPath.splice(0, 0, ...segResult.path.slice(0, -1));
            totalCost += segResult.cost;
          }
        }
      }
      if (fullPath.length > 0) {
        const lastPoint = fullPath[fullPath.length - 1];
        if (lastPoint.x !== endX || lastPoint.y !== endY) {
          if (Math.abs(lastPoint.x - endX) <= 1 && Math.abs(lastPoint.y - endY) <= 1) {
            fullPath.push({
              x: endX,
              y: endY
            });
          } else {
            const segResult = this.findLocalPath(lastPoint.x, lastPoint.y, endX, endY, opts);
            if (segResult.found) {
              fullPath.push(...segResult.path.slice(1));
              totalCost += segResult.cost;
            }
          }
        }
      }
      return {
        found: fullPath.length > 0,
        path: fullPath,
        cost: totalCost,
        nodesSearched
      };
    }
    /**
     * @zh 追加路径（避免重复点）
     * @en Append path (avoid duplicate points)
     */
    appendPath(fullPath, segment) {
      if (segment.length === 0) return;
      let startIdx = 0;
      if (fullPath.length > 0) {
        const last = fullPath[fullPath.length - 1];
        if (last.x === segment[0].x && last.y === segment[0].y) {
          startIdx = 1;
        }
      }
      for (let i = startIdx; i < segment.length; i++) {
        fullPath.push({
          x: segment[i].x,
          y: segment[i].y
        });
      }
    }
    /**
     * @zh 局部寻路
     * @en Local pathfinding
     */
    findLocalPath(startX, startY, endX, endY, opts) {
      return this.localPathfinder.findPath(startX, startY, endX, endY, opts);
    }
    /**
     * @zh 启发式函数（Octile 距离）
     * @en Heuristic function (Octile distance)
     */
    heuristic(a, b) {
      const dx = Math.abs(a.x - b.x);
      const dy = Math.abs(a.y - b.y);
      return dx + dy + (Math.SQRT2 - 2) * Math.min(dx, dy);
    }
  };
  __name(_HPAPathfinder, "HPAPathfinder");
  var HPAPathfinder = _HPAPathfinder;
  function createHPAPathfinder(map, config) {
    return new HPAPathfinder(map, config);
  }
  __name(createHPAPathfinder, "createHPAPathfinder");

  // src/navmesh/NavMesh.ts
  var _a5;
  var NavMeshNode = (_a5 = class {
    constructor(polygon) {
      __publicField(this, "id");
      __publicField(this, "position");
      __publicField(this, "cost");
      __publicField(this, "walkable");
      __publicField(this, "polygon");
      this.id = polygon.id;
      this.position = polygon.center;
      this.cost = 1;
      this.walkable = true;
      this.polygon = polygon;
    }
  }, __name(_a5, "NavMeshNode"), _a5);
  var _NavMesh = class _NavMesh {
    constructor() {
      __publicField(this, "polygons", /* @__PURE__ */ new Map());
      __publicField(this, "nodes", /* @__PURE__ */ new Map());
      __publicField(this, "nextId", 0);
    }
    /**
     * @zh 添加导航多边形
     * @en Add navigation polygon
     *
     * @returns @zh 多边形ID @en Polygon ID
     */
    addPolygon(vertices, neighbors = []) {
      const id = this.nextId++;
      const center = this.calculateCenter(vertices);
      const polygon = {
        id,
        vertices,
        center,
        neighbors,
        portals: /* @__PURE__ */ new Map()
      };
      this.polygons.set(id, polygon);
      this.nodes.set(id, new NavMeshNode(polygon));
      return id;
    }
    /**
     * @zh 设置两个多边形之间的连接
     * @en Set connection between two polygons
     */
    setConnection(polyA, polyB, portal) {
      const polygonA = this.polygons.get(polyA);
      const polygonB = this.polygons.get(polyB);
      if (!polygonA || !polygonB) {
        return;
      }
      const neighborsA = [
        ...polygonA.neighbors
      ];
      const portalsA = new Map(polygonA.portals);
      if (!neighborsA.includes(polyB)) {
        neighborsA.push(polyB);
      }
      portalsA.set(polyB, portal);
      this.polygons.set(polyA, {
        ...polygonA,
        neighbors: neighborsA,
        portals: portalsA
      });
      const reversePortal = {
        left: portal.right,
        right: portal.left
      };
      const neighborsB = [
        ...polygonB.neighbors
      ];
      const portalsB = new Map(polygonB.portals);
      if (!neighborsB.includes(polyA)) {
        neighborsB.push(polyA);
      }
      portalsB.set(polyA, reversePortal);
      this.polygons.set(polyB, {
        ...polygonB,
        neighbors: neighborsB,
        portals: portalsB
      });
    }
    /**
     * @zh 自动检测并建立相邻多边形的连接
     * @en Auto-detect and build connections between adjacent polygons
     */
    build() {
      const polygonList = Array.from(this.polygons.values());
      for (let i = 0; i < polygonList.length; i++) {
        for (let j = i + 1; j < polygonList.length; j++) {
          const polyA = polygonList[i];
          const polyB = polygonList[j];
          const sharedEdge = this.findSharedEdge(polyA.vertices, polyB.vertices);
          if (sharedEdge) {
            this.setConnection(polyA.id, polyB.id, sharedEdge);
          }
        }
      }
    }
    /**
     * @zh 查找两个多边形的共享边
     * @en Find shared edge between two polygons
     */
    findSharedEdge(verticesA, verticesB) {
      const epsilon = 1e-4;
      for (let i = 0; i < verticesA.length; i++) {
        const a1 = verticesA[i];
        const a2 = verticesA[(i + 1) % verticesA.length];
        for (let j = 0; j < verticesB.length; j++) {
          const b1 = verticesB[j];
          const b2 = verticesB[(j + 1) % verticesB.length];
          const match1 = Math.abs(a1.x - b2.x) < epsilon && Math.abs(a1.y - b2.y) < epsilon && Math.abs(a2.x - b1.x) < epsilon && Math.abs(a2.y - b1.y) < epsilon;
          const match2 = Math.abs(a1.x - b1.x) < epsilon && Math.abs(a1.y - b1.y) < epsilon && Math.abs(a2.x - b2.x) < epsilon && Math.abs(a2.y - b2.y) < epsilon;
          if (match1 || match2) {
            return {
              left: a1,
              right: a2
            };
          }
        }
      }
      return null;
    }
    /**
     * @zh 计算多边形中心
     * @en Calculate polygon center
     */
    calculateCenter(vertices) {
      let x = 0;
      let y = 0;
      for (const v of vertices) {
        x += v.x;
        y += v.y;
      }
      return createPoint(x / vertices.length, y / vertices.length);
    }
    /**
     * @zh 查找包含点的多边形
     * @en Find polygon containing point
     */
    findPolygonAt(x, y) {
      for (const polygon of this.polygons.values()) {
        if (this.isPointInPolygon(x, y, polygon.vertices)) {
          return polygon;
        }
      }
      return null;
    }
    /**
     * @zh 检查点是否在多边形内
     * @en Check if point is inside polygon
     */
    isPointInPolygon(x, y, vertices) {
      let inside = false;
      const n = vertices.length;
      for (let i = 0, j = n - 1; i < n; j = i++) {
        const xi = vertices[i].x;
        const yi = vertices[i].y;
        const xj = vertices[j].x;
        const yj = vertices[j].y;
        if (yi > y !== yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi) {
          inside = !inside;
        }
      }
      return inside;
    }
    // ==========================================================================
    // IPathfindingMap 接口实现 | IPathfindingMap Interface Implementation
    // ==========================================================================
    getNodeAt(x, y) {
      const polygon = this.findPolygonAt(x, y);
      return polygon ? this.nodes.get(polygon.id) ?? null : null;
    }
    getNeighbors(node) {
      const navNode = node;
      const neighbors = [];
      for (const neighborId of navNode.polygon.neighbors) {
        const neighbor = this.nodes.get(neighborId);
        if (neighbor) {
          neighbors.push(neighbor);
        }
      }
      return neighbors;
    }
    heuristic(a, b) {
      return euclideanDistance(a, b);
    }
    getMovementCost(from, to) {
      return euclideanDistance(from.position, to.position);
    }
    isWalkable(x, y) {
      return this.findPolygonAt(x, y) !== null;
    }
    // ==========================================================================
    // 寻路 | Pathfinding
    // ==========================================================================
    /**
     * @zh 在导航网格上寻路
     * @en Find path on navigation mesh
     */
    findPath(startX, startY, endX, endY, options) {
      const opts = {
        ...DEFAULT_PATHFINDING_OPTIONS,
        ...options
      };
      const startPolygon = this.findPolygonAt(startX, startY);
      const endPolygon = this.findPolygonAt(endX, endY);
      if (!startPolygon || !endPolygon) {
        return EMPTY_PATH_RESULT;
      }
      if (startPolygon.id === endPolygon.id) {
        return {
          found: true,
          path: [
            createPoint(startX, startY),
            createPoint(endX, endY)
          ],
          cost: euclideanDistance(createPoint(startX, startY), createPoint(endX, endY)),
          nodesSearched: 1
        };
      }
      const polygonPath = this.findPolygonPath(startPolygon, endPolygon, opts);
      if (!polygonPath.found) {
        return EMPTY_PATH_RESULT;
      }
      const start = createPoint(startX, startY);
      const end = createPoint(endX, endY);
      const pointPath = this.funnelPath(start, end, polygonPath.polygons);
      return {
        found: true,
        path: pointPath,
        cost: this.calculatePathLength(pointPath),
        nodesSearched: polygonPath.nodesSearched
      };
    }
    /**
     * @zh 在多边形图上寻路
     * @en Find path on polygon graph
     */
    findPolygonPath(start, end, opts) {
      const openList = new BinaryHeap((a, b) => a.f - b.f);
      const closed = /* @__PURE__ */ new Set();
      const states = /* @__PURE__ */ new Map();
      const startState = {
        polygon: start,
        g: 0,
        f: euclideanDistance(start.center, end.center) * opts.heuristicWeight,
        parent: null
      };
      states.set(start.id, startState);
      openList.push(startState);
      let nodesSearched = 0;
      while (!openList.isEmpty && nodesSearched < opts.maxNodes) {
        const current = openList.pop();
        nodesSearched++;
        if (current.polygon.id === end.id) {
          const path = [];
          let state = current;
          while (state) {
            path.unshift(state.polygon);
            state = state.parent;
          }
          return {
            found: true,
            polygons: path,
            nodesSearched
          };
        }
        closed.add(current.polygon.id);
        for (const neighborId of current.polygon.neighbors) {
          if (closed.has(neighborId)) {
            continue;
          }
          const neighborPolygon = this.polygons.get(neighborId);
          if (!neighborPolygon) {
            continue;
          }
          const g = current.g + euclideanDistance(current.polygon.center, neighborPolygon.center);
          let neighborState = states.get(neighborId);
          if (!neighborState) {
            neighborState = {
              polygon: neighborPolygon,
              g,
              f: g + euclideanDistance(neighborPolygon.center, end.center) * opts.heuristicWeight,
              parent: current
            };
            states.set(neighborId, neighborState);
            openList.push(neighborState);
          } else if (g < neighborState.g) {
            neighborState.g = g;
            neighborState.f = g + euclideanDistance(neighborPolygon.center, end.center) * opts.heuristicWeight;
            neighborState.parent = current;
            openList.update(neighborState);
          }
        }
      }
      return {
        found: false,
        polygons: [],
        nodesSearched
      };
    }
    /**
     * @zh 使用漏斗算法优化路径
     * @en Optimize path using funnel algorithm
     */
    funnelPath(start, end, polygons) {
      if (polygons.length <= 1) {
        return [
          start,
          end
        ];
      }
      const portals = [];
      for (let i = 0; i < polygons.length - 1; i++) {
        const portal = polygons[i].portals.get(polygons[i + 1].id);
        if (portal) {
          portals.push(portal);
        }
      }
      if (portals.length === 0) {
        return [
          start,
          end
        ];
      }
      const path = [
        start
      ];
      let apex = start;
      let leftIndex = 0;
      let rightIndex = 0;
      let left = portals[0].left;
      let right = portals[0].right;
      for (let i = 1; i <= portals.length; i++) {
        const nextLeft = i < portals.length ? portals[i].left : end;
        const nextRight = i < portals.length ? portals[i].right : end;
        if (this.triArea2(apex, right, nextRight) <= 0) {
          if (apex === right || this.triArea2(apex, left, nextRight) > 0) {
            right = nextRight;
            rightIndex = i;
          } else {
            path.push(left);
            apex = left;
            leftIndex = rightIndex = leftIndex;
            left = right = apex;
            i = leftIndex;
            continue;
          }
        }
        if (this.triArea2(apex, left, nextLeft) >= 0) {
          if (apex === left || this.triArea2(apex, right, nextLeft) < 0) {
            left = nextLeft;
            leftIndex = i;
          } else {
            path.push(right);
            apex = right;
            leftIndex = rightIndex = rightIndex;
            left = right = apex;
            i = rightIndex;
            continue;
          }
        }
      }
      path.push(end);
      return path;
    }
    /**
     * @zh 计算三角形面积的两倍（用于判断点的相对位置）
     * @en Calculate twice the triangle area (for point relative position)
     */
    triArea2(a, b, c) {
      return (c.x - a.x) * (b.y - a.y) - (b.x - a.x) * (c.y - a.y);
    }
    /**
     * @zh 计算路径总长度
     * @en Calculate total path length
     */
    calculatePathLength(path) {
      let length = 0;
      for (let i = 1; i < path.length; i++) {
        length += euclideanDistance(path[i - 1], path[i]);
      }
      return length;
    }
    /**
     * @zh 清空导航网格
     * @en Clear navigation mesh
     */
    clear() {
      this.polygons.clear();
      this.nodes.clear();
      this.nextId = 0;
    }
    /**
     * @zh 获取所有多边形
     * @en Get all polygons
     */
    getPolygons() {
      return Array.from(this.polygons.values());
    }
    /**
     * @zh 获取多边形数量
     * @en Get polygon count
     */
    get polygonCount() {
      return this.polygons.size;
    }
  };
  __name(_NavMesh, "NavMesh");
  var NavMesh = _NavMesh;
  function createNavMesh() {
    return new NavMesh();
  }
  __name(createNavMesh, "createNavMesh");

  function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  }
  __name(_ts_decorate, "_ts_decorate");
  function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
  }
  __name(_ts_metadata, "_ts_metadata");
  var _PathfindingAgentComponent = class _PathfindingAgentComponent extends Xe {
    constructor() {
      super(...arguments);
      // =========================================================================
      // 位置属性 | Position Properties
      // =========================================================================
      /**
       * @zh 当前位置 X 坐标
       * @en Current position X coordinate
       */
      __publicField(this, "x", 0);
      /**
       * @zh 当前位置 Y 坐标
       * @en Current position Y coordinate
       */
      __publicField(this, "y", 0);
      // =========================================================================
      // 目标属性 | Target Properties
      // =========================================================================
      /**
       * @zh 目标位置 X 坐标
       * @en Target position X coordinate
       */
      __publicField(this, "targetX", 0);
      /**
       * @zh 目标位置 Y 坐标
       * @en Target position Y coordinate
       */
      __publicField(this, "targetY", 0);
      /**
       * @zh 是否有新的寻路请求待处理
       * @en Whether there is a new path request pending
       */
      __publicField(this, "hasRequest", false);
      // =========================================================================
      // 配置属性 | Configuration Properties
      // =========================================================================
      /**
       * @zh 寻路优先级（数值越小优先级越高）
       * @en Pathfinding priority (lower number = higher priority)
       */
      __publicField(this, "priority", 50);
      /**
       * @zh 每帧最大迭代次数
       * @en Maximum iterations per frame
       */
      __publicField(this, "maxIterationsPerFrame", 100);
      /**
       * @zh 是否启用动态重规划
       * @en Whether dynamic replanning is enabled
       */
      __publicField(this, "enableDynamicReplan", true);
      /**
       * @zh 向前探测距离（用于障碍物检测）
       * @en Lookahead distance for obstacle detection
       */
      __publicField(this, "lookaheadDistance", 5);
      /**
       * @zh 路径验证间隔（帧数）
       * @en Path validation interval (in frames)
       */
      __publicField(this, "validationInterval", 10);
      // =========================================================================
      // 运行时状态（不序列化）| Runtime State (not serialized)
      // =========================================================================
      /**
       * @zh 当前寻路状态
       * @en Current pathfinding state
       */
      __publicField(this, "state", PathfindingState.Idle);
      /**
       * @zh 当前请求 ID
       * @en Current request ID
       */
      __publicField(this, "currentRequestId", -1);
      /**
       * @zh 当前路径点列表
       * @en Current path waypoints
       */
      __publicField(this, "path", []);
      /**
       * @zh 当前路径索引
       * @en Current path index
       */
      __publicField(this, "pathIndex", 0);
      /**
       * @zh 路径总代价
       * @en Total path cost
       */
      __publicField(this, "pathCost", 0);
      /**
       * @zh 寻路进度 (0-1)
       * @en Pathfinding progress (0-1)
       */
      __publicField(this, "progress", 0);
      /**
       * @zh 上次验证的帧号
       * @en Last validation frame number
       */
      __publicField(this, "lastValidationFrame", 0);
      /**
       * @zh 寻路完成回调
       * @en Pathfinding complete callback
       */
      __publicField(this, "onPathComplete");
      /**
       * @zh 寻路进度回调
       * @en Pathfinding progress callback
       */
      __publicField(this, "onPathProgress");
    }
    // =========================================================================
    // 公共方法 | Public Methods
    // =========================================================================
    /**
     * @zh 请求寻路到目标位置
     * @en Request path to target position
     *
     * @param targetX - @zh 目标 X 坐标 @en Target X coordinate
     * @param targetY - @zh 目标 Y 坐标 @en Target Y coordinate
     */
    requestPathTo(targetX, targetY) {
      this.targetX = targetX;
      this.targetY = targetY;
      this.hasRequest = true;
      this.state = PathfindingState.Idle;
      this.progress = 0;
    }
    /**
     * @zh 取消当前寻路
     * @en Cancel current pathfinding
     */
    cancelPath() {
      this.hasRequest = false;
      this.state = PathfindingState.Cancelled;
      this.path = [];
      this.pathIndex = 0;
      this.progress = 0;
      this.currentRequestId = -1;
    }
    /**
     * @zh 获取下一个路径点
     * @en Get next waypoint
     *
     * @returns @zh 下一个路径点或 null @en Next waypoint or null
     */
    getNextWaypoint() {
      if (this.pathIndex < this.path.length) {
        return this.path[this.pathIndex];
      }
      return null;
    }
    /**
     * @zh 前进到下一个路径点
     * @en Advance to next waypoint
     */
    advanceWaypoint() {
      if (this.pathIndex < this.path.length) {
        this.pathIndex++;
      }
    }
    /**
     * @zh 检查是否到达路径终点
     * @en Check if reached path end
     *
     * @returns @zh 是否到达终点 @en Whether reached end
     */
    isPathComplete() {
      return this.pathIndex >= this.path.length;
    }
    /**
     * @zh 检查是否正在寻路
     * @en Check if pathfinding is in progress
     *
     * @returns @zh 是否正在寻路 @en Whether pathfinding is in progress
     */
    isSearching() {
      return this.state === PathfindingState.InProgress;
    }
    /**
     * @zh 检查是否有有效路径
     * @en Check if has valid path
     *
     * @returns @zh 是否有有效路径 @en Whether has valid path
     */
    hasValidPath() {
      return this.state === PathfindingState.Completed && this.path.length > 0;
    }
    /**
     * @zh 获取剩余路径点数量
     * @en Get remaining waypoint count
     *
     * @returns @zh 剩余路径点数量 @en Remaining waypoint count
     */
    getRemainingWaypointCount() {
      return Math.max(0, this.path.length - this.pathIndex);
    }
    /**
     * @zh 获取当前路径的总长度
     * @en Get total path length
     *
     * @returns @zh 路径总长度 @en Total path length
     */
    getPathLength() {
      return this.path.length;
    }
    /**
     * @zh 重置组件状态
     * @en Reset component state
     */
    reset() {
      this.state = PathfindingState.Idle;
      this.currentRequestId = -1;
      this.path = [];
      this.pathIndex = 0;
      this.pathCost = 0;
      this.progress = 0;
      this.hasRequest = false;
      this.lastValidationFrame = 0;
    }
    /**
     * @zh 组件从实体移除时调用
     * @en Called when component is removed from entity
     */
    onRemovedFromEntity() {
      this.reset();
      this.onPathComplete = void 0;
      this.onPathProgress = void 0;
    }
  };
  __name(_PathfindingAgentComponent, "PathfindingAgentComponent");
  exports.PathfindingAgentComponent = _PathfindingAgentComponent;
  _ts_decorate([
    st(),
    Se({
      type: "number",
      label: "Position X"
    }),
    _ts_metadata("design:type", Number)
  ], exports.PathfindingAgentComponent.prototype, "x", void 0);
  _ts_decorate([
    st(),
    Se({
      type: "number",
      label: "Position Y"
    }),
    _ts_metadata("design:type", Number)
  ], exports.PathfindingAgentComponent.prototype, "y", void 0);
  _ts_decorate([
    st(),
    Se({
      type: "number",
      label: "Target X"
    }),
    _ts_metadata("design:type", Number)
  ], exports.PathfindingAgentComponent.prototype, "targetX", void 0);
  _ts_decorate([
    st(),
    Se({
      type: "number",
      label: "Target Y"
    }),
    _ts_metadata("design:type", Number)
  ], exports.PathfindingAgentComponent.prototype, "targetY", void 0);
  _ts_decorate([
    st(),
    Se({
      type: "number",
      label: "Priority",
      min: 0,
      max: 100
    }),
    _ts_metadata("design:type", Number)
  ], exports.PathfindingAgentComponent.prototype, "priority", void 0);
  _ts_decorate([
    st(),
    Se({
      type: "number",
      label: "Max Iterations/Frame",
      min: 10,
      max: 1e3
    }),
    _ts_metadata("design:type", Number)
  ], exports.PathfindingAgentComponent.prototype, "maxIterationsPerFrame", void 0);
  _ts_decorate([
    st(),
    Se({
      type: "boolean",
      label: "Dynamic Replan"
    }),
    _ts_metadata("design:type", Boolean)
  ], exports.PathfindingAgentComponent.prototype, "enableDynamicReplan", void 0);
  _ts_decorate([
    st(),
    Se({
      type: "number",
      label: "Lookahead Distance",
      min: 1,
      max: 20
    }),
    _ts_metadata("design:type", Number)
  ], exports.PathfindingAgentComponent.prototype, "lookaheadDistance", void 0);
  _ts_decorate([
    st(),
    Se({
      type: "number",
      label: "Validation Interval",
      min: 1,
      max: 60
    }),
    _ts_metadata("design:type", Number)
  ], exports.PathfindingAgentComponent.prototype, "validationInterval", void 0);
  exports.PathfindingAgentComponent = _ts_decorate([
    X("PathfindingAgent"),
    nt({
      version: 1,
      typeId: "PathfindingAgent"
    })
  ], exports.PathfindingAgentComponent);
  function _ts_decorate2(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  }
  __name(_ts_decorate2, "_ts_decorate");
  function _ts_metadata2(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
  }
  __name(_ts_metadata2, "_ts_metadata");
  var _PathfindingMapComponent = class _PathfindingMapComponent extends Xe {
    constructor() {
      super(...arguments);
      // =========================================================================
      // 地图配置 | Map Configuration
      // =========================================================================
      /**
       * @zh 地图类型
       * @en Map type
       */
      __publicField(this, "mapType", "grid");
      /**
       * @zh 网格宽度（仅 grid 类型）
       * @en Grid width (grid type only)
       */
      __publicField(this, "width", 100);
      /**
       * @zh 网格高度（仅 grid 类型）
       * @en Grid height (grid type only)
       */
      __publicField(this, "height", 100);
      /**
       * @zh 是否允许对角移动
       * @en Whether diagonal movement is allowed
       */
      __publicField(this, "allowDiagonal", true);
      /**
       * @zh 是否避免穿角
       * @en Whether to avoid corner cutting
       */
      __publicField(this, "avoidCorners", true);
      // =========================================================================
      // 系统配置 | System Configuration
      // =========================================================================
      /**
       * @zh 每帧处理的最大代理数
       * @en Maximum agents processed per frame
       */
      __publicField(this, "maxAgentsPerFrame", 10);
      /**
       * @zh 每帧总迭代次数预算
       * @en Total iterations budget per frame
       */
      __publicField(this, "iterationsBudget", 1e3);
      /**
       * @zh 是否启用路径平滑
       * @en Whether path smoothing is enabled
       */
      __publicField(this, "enableSmoothing", true);
      /**
       * @zh 路径平滑类型
       * @en Path smoothing type
       */
      __publicField(this, "smoothingType", "los");
      // =========================================================================
      // 缓存配置 | Cache Configuration
      // =========================================================================
      /**
       * @zh 是否启用路径缓存
       * @en Whether path caching is enabled
       */
      __publicField(this, "enableCache", true);
      /**
       * @zh 缓存最大条目数
       * @en Maximum cache entries
       */
      __publicField(this, "cacheMaxEntries", 1e3);
      /**
       * @zh 缓存过期时间（毫秒），0 表示不过期
       * @en Cache TTL in milliseconds, 0 means no expiration
       */
      __publicField(this, "cacheTtlMs", 5e3);
      // =========================================================================
      // 调试配置 | Debug Configuration
      // =========================================================================
      /**
       * @zh 是否显示调试信息
       * @en Whether to show debug info
       */
      __publicField(this, "debugMode", false);
      /**
       * @zh 是否显示网格
       * @en Whether to show grid
       */
      __publicField(this, "showGrid", false);
      /**
       * @zh 是否显示路径
       * @en Whether to show paths
       */
      __publicField(this, "showPaths", false);
      // =========================================================================
      // 运行时实例（不序列化）| Runtime Instances (not serialized)
      // =========================================================================
      /**
       * @zh 地图实例
       * @en Map instance
       */
      __publicField(this, "map", null);
      /**
       * @zh 增量寻路器实例
       * @en Incremental pathfinder instance
       */
      __publicField(this, "pathfinder", null);
      /**
       * @zh 路径平滑器实例
       * @en Path smoother instance
       */
      __publicField(this, "smoother", null);
      /**
       * @zh 是否已初始化
       * @en Whether initialized
       */
      __publicField(this, "initialized", false);
      // =========================================================================
      // 统计信息 | Statistics
      // =========================================================================
      /**
       * @zh 当前活跃请求数
       * @en Current active request count
       */
      __publicField(this, "activeRequests", 0);
      /**
       * @zh 本帧使用的迭代次数
       * @en Iterations used this frame
       */
      __publicField(this, "iterationsUsedThisFrame", 0);
      /**
       * @zh 本帧处理的代理数
       * @en Agents processed this frame
       */
      __publicField(this, "agentsProcessedThisFrame", 0);
      /**
       * @zh 缓存命中次数
       * @en Cache hit count
       */
      __publicField(this, "cacheHits", 0);
      /**
       * @zh 缓存未命中次数
       * @en Cache miss count
       */
      __publicField(this, "cacheMisses", 0);
    }
    // =========================================================================
    // 公共方法 | Public Methods
    // =========================================================================
    /**
     * @zh 设置网格单元格是否可通行
     * @en Set grid cell walkability
     *
     * @param x - @zh X 坐标 @en X coordinate
     * @param y - @zh Y 坐标 @en Y coordinate
     * @param walkable - @zh 是否可通行 @en Is walkable
     */
    setWalkable(x, y, walkable) {
      if (this.map && "setWalkable" in this.map) {
        this.map.setWalkable(x, y, walkable);
        if (this.pathfinder) {
          this.pathfinder.notifyObstacleChange(x - 1, y - 1, x + 1, y + 1);
        }
      }
    }
    /**
     * @zh 设置矩形区域是否可通行
     * @en Set rectangular area walkability
     *
     * @param x - @zh 起始 X @en Start X
     * @param y - @zh 起始 Y @en Start Y
     * @param width - @zh 宽度 @en Width
     * @param height - @zh 高度 @en Height
     * @param walkable - @zh 是否可通行 @en Is walkable
     */
    setRectWalkable(x, y, rectWidth, rectHeight, walkable) {
      if (this.map && "setRectWalkable" in this.map) {
        this.map.setRectWalkable(x, y, rectWidth, rectHeight, walkable);
        if (this.pathfinder) {
          this.pathfinder.notifyObstacleChange(x - 1, y - 1, x + rectWidth + 1, y + rectHeight + 1);
        }
      }
    }
    /**
     * @zh 检查位置是否可通行
     * @en Check if position is walkable
     *
     * @param x - @zh X 坐标 @en X coordinate
     * @param y - @zh Y 坐标 @en Y coordinate
     * @returns @zh 是否可通行 @en Is walkable
     */
    isWalkable(x, y) {
      return this.map?.isWalkable(x, y) ?? false;
    }
    /**
     * @zh 重置统计信息
     * @en Reset statistics
     */
    resetStats() {
      this.iterationsUsedThisFrame = 0;
      this.agentsProcessedThisFrame = 0;
    }
    /**
     * @zh 获取剩余迭代预算
     * @en Get remaining iteration budget
     *
     * @returns @zh 剩余预算 @en Remaining budget
     */
    getRemainingBudget() {
      return Math.max(0, this.iterationsBudget - this.iterationsUsedThisFrame);
    }
    /**
     * @zh 获取缓存统计信息
     * @en Get cache statistics
     *
     * @returns @zh 缓存统计 @en Cache statistics
     */
    getCacheStats() {
      const pathfinderWithCache = this.pathfinder;
      if (pathfinderWithCache?.getCacheStats) {
        const stats = pathfinderWithCache.getCacheStats();
        this.cacheHits = stats.hits;
        this.cacheMisses = stats.misses;
        return {
          enabled: this.enableCache,
          hits: stats.hits,
          misses: stats.misses,
          hitRate: stats.hitRate
        };
      }
      return {
        enabled: this.enableCache,
        hits: this.cacheHits,
        misses: this.cacheMisses,
        hitRate: this.cacheHits + this.cacheMisses > 0 ? this.cacheHits / (this.cacheHits + this.cacheMisses) : 0
      };
    }
    /**
     * @zh 组件从实体移除时调用
     * @en Called when component is removed from entity
     */
    onRemovedFromEntity() {
      if (this.pathfinder) {
        this.pathfinder.clear();
      }
      this.map = null;
      this.pathfinder = null;
      this.smoother = null;
      this.initialized = false;
    }
  };
  __name(_PathfindingMapComponent, "PathfindingMapComponent");
  exports.PathfindingMapComponent = _PathfindingMapComponent;
  _ts_decorate2([
    st(),
    Se({
      type: "enum",
      label: "Map Type",
      options: [
        {
          value: "grid",
          label: "Grid"
        },
        {
          value: "navmesh",
          label: "NavMesh"
        }
      ]
    }),
    _ts_metadata2("design:type", typeof PathfindingMapType === "undefined" ? Object : PathfindingMapType)
  ], exports.PathfindingMapComponent.prototype, "mapType", void 0);
  _ts_decorate2([
    st(),
    Se({
      type: "number",
      label: "Map Width",
      min: 1,
      max: 1e4
    }),
    _ts_metadata2("design:type", Number)
  ], exports.PathfindingMapComponent.prototype, "width", void 0);
  _ts_decorate2([
    st(),
    Se({
      type: "number",
      label: "Map Height",
      min: 1,
      max: 1e4
    }),
    _ts_metadata2("design:type", Number)
  ], exports.PathfindingMapComponent.prototype, "height", void 0);
  _ts_decorate2([
    st(),
    Se({
      type: "boolean",
      label: "Allow Diagonal"
    }),
    _ts_metadata2("design:type", Boolean)
  ], exports.PathfindingMapComponent.prototype, "allowDiagonal", void 0);
  _ts_decorate2([
    st(),
    Se({
      type: "boolean",
      label: "Avoid Corners"
    }),
    _ts_metadata2("design:type", Boolean)
  ], exports.PathfindingMapComponent.prototype, "avoidCorners", void 0);
  _ts_decorate2([
    st(),
    Se({
      type: "number",
      label: "Max Agents/Frame",
      min: 1,
      max: 100
    }),
    _ts_metadata2("design:type", Number)
  ], exports.PathfindingMapComponent.prototype, "maxAgentsPerFrame", void 0);
  _ts_decorate2([
    st(),
    Se({
      type: "number",
      label: "Iterations Budget",
      min: 100,
      max: 1e4
    }),
    _ts_metadata2("design:type", Number)
  ], exports.PathfindingMapComponent.prototype, "iterationsBudget", void 0);
  _ts_decorate2([
    st(),
    Se({
      type: "boolean",
      label: "Enable Smoothing"
    }),
    _ts_metadata2("design:type", Boolean)
  ], exports.PathfindingMapComponent.prototype, "enableSmoothing", void 0);
  _ts_decorate2([
    st(),
    Se({
      type: "enum",
      label: "Smoothing Type",
      options: [
        {
          value: "los",
          label: "Line of Sight"
        },
        {
          value: "catmullrom",
          label: "Catmull-Rom"
        },
        {
          value: "combined",
          label: "Combined"
        }
      ]
    }),
    _ts_metadata2("design:type", String)
  ], exports.PathfindingMapComponent.prototype, "smoothingType", void 0);
  _ts_decorate2([
    st(),
    Se({
      type: "boolean",
      label: "Enable Cache"
    }),
    _ts_metadata2("design:type", Boolean)
  ], exports.PathfindingMapComponent.prototype, "enableCache", void 0);
  _ts_decorate2([
    st(),
    Se({
      type: "number",
      label: "Cache Size",
      min: 100,
      max: 1e4
    }),
    _ts_metadata2("design:type", Number)
  ], exports.PathfindingMapComponent.prototype, "cacheMaxEntries", void 0);
  _ts_decorate2([
    st(),
    Se({
      type: "number",
      label: "Cache TTL (ms)",
      min: 0,
      max: 6e4
    }),
    _ts_metadata2("design:type", Number)
  ], exports.PathfindingMapComponent.prototype, "cacheTtlMs", void 0);
  _ts_decorate2([
    st(),
    Se({
      type: "boolean",
      label: "Debug Mode"
    }),
    _ts_metadata2("design:type", Boolean)
  ], exports.PathfindingMapComponent.prototype, "debugMode", void 0);
  _ts_decorate2([
    st(),
    Se({
      type: "boolean",
      label: "Show Grid"
    }),
    _ts_metadata2("design:type", Boolean)
  ], exports.PathfindingMapComponent.prototype, "showGrid", void 0);
  _ts_decorate2([
    st(),
    Se({
      type: "boolean",
      label: "Show Paths"
    }),
    _ts_metadata2("design:type", Boolean)
  ], exports.PathfindingMapComponent.prototype, "showPaths", void 0);
  exports.PathfindingMapComponent = _ts_decorate2([
    X("PathfindingMap"),
    nt({
      version: 1,
      typeId: "PathfindingMap"
    })
  ], exports.PathfindingMapComponent);
  function _ts_decorate3(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  }
  __name(_ts_decorate3, "_ts_decorate");
  function _ts_metadata3(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
  }
  __name(_ts_metadata3, "_ts_metadata");
  var _PathfindingSystem = class _PathfindingSystem extends _t {
    constructor() {
      super(lt.all(exports.PathfindingAgentComponent));
      __publicField(this, "mapEntity", null);
      __publicField(this, "mapComponent", null);
      __publicField(this, "pathValidator");
      __publicField(this, "agentQueue", []);
      __publicField(this, "frameCounter", 0);
      this.pathValidator = new PathValidator();
    }
    /**
     * @zh 系统初始化
     * @en System initialization
     */
    onInitialize() {
      this.findMapEntity();
      this.initializeMap();
    }
    /**
     * @zh 系统激活时调用
     * @en Called when system is enabled
     */
    onEnable() {
      this.findMapEntity();
    }
    /**
     * @zh 处理实体
     * @en Process entities
     */
    process(entities) {
      if (!this.mapComponent?.pathfinder) {
        this.findMapEntity();
        if (!this.mapComponent?.pathfinder) {
          return;
        }
      }
      this.frameCounter++;
      this.mapComponent.resetStats();
      this.buildAgentQueue(entities);
      this.processAgentsWithBudget();
      this.validatePaths(entities);
    }
    // =========================================================================
    // 私有方法 | Private Methods
    // =========================================================================
    /**
     * @zh 查找地图实体
     * @en Find map entity
     */
    findMapEntity() {
      if (!this.scene) return;
      const entities = this.scene.entities.findEntitiesWithComponent(exports.PathfindingMapComponent);
      if (entities.length > 0) {
        const entity = entities[0];
        const mapComp = entity.getComponent(exports.PathfindingMapComponent);
        if (mapComp) {
          this.mapEntity = entity;
          this.mapComponent = mapComp;
          if (!mapComp.initialized) {
            this.initializeMap();
          }
        }
      }
    }
    /**
     * @zh 初始化地图
     * @en Initialize map
     */
    initializeMap() {
      if (!this.mapComponent) return;
      if (this.mapComponent.initialized) return;
      if (!this.mapComponent.map) {
        if (this.mapComponent.mapType === "grid") {
          this.mapComponent.map = new GridMap(this.mapComponent.width, this.mapComponent.height, {
            allowDiagonal: this.mapComponent.allowDiagonal,
            avoidCorners: this.mapComponent.avoidCorners
          });
        }
      }
      if (!this.mapComponent.pathfinder && this.mapComponent.map) {
        this.mapComponent.pathfinder = new IncrementalAStarPathfinder(this.mapComponent.map, {
          enableCache: this.mapComponent.enableCache,
          cacheConfig: {
            maxEntries: this.mapComponent.cacheMaxEntries,
            ttlMs: this.mapComponent.cacheTtlMs
          }
        });
      }
      if (!this.mapComponent.smoother && this.mapComponent.enableSmoothing) {
        switch (this.mapComponent.smoothingType) {
          case "catmullrom":
            this.mapComponent.smoother = new CatmullRomSmoother();
            break;
          case "combined":
            this.mapComponent.smoother = new CombinedSmoother();
            break;
          case "los":
          default:
            this.mapComponent.smoother = new LineOfSightSmoother();
            break;
        }
      }
      this.mapComponent.initialized = true;
    }
    /**
     * @zh 构建代理优先级队列
     * @en Build agent priority queue
     */
    buildAgentQueue(entities) {
      this.agentQueue.length = 0;
      for (const entity of entities) {
        const agent = entity.getComponent(exports.PathfindingAgentComponent);
        if (!agent) continue;
        if (!agent.hasRequest && (agent.state === PathfindingState.Idle || agent.state === PathfindingState.Completed || agent.state === PathfindingState.Cancelled)) {
          continue;
        }
        this.agentQueue.push({
          entity,
          component: agent
        });
      }
      this.agentQueue.sort((a, b) => a.component.priority - b.component.priority);
    }
    /**
     * @zh 使用预算处理代理
     * @en Process agents with budget
     */
    processAgentsWithBudget() {
      const pathfinder = this.mapComponent.pathfinder;
      const maxAgents = this.mapComponent.maxAgentsPerFrame;
      let remainingBudget = this.mapComponent.iterationsBudget;
      let agentsProcessed = 0;
      for (const { component: agent } of this.agentQueue) {
        if (agentsProcessed >= maxAgents || remainingBudget <= 0) {
          break;
        }
        if (agent.hasRequest && agent.state === PathfindingState.Idle) {
          this.startNewRequest(agent, pathfinder);
        }
        if (agent.state === PathfindingState.InProgress) {
          const iterations = Math.min(agent.maxIterationsPerFrame, remainingBudget);
          const progress = pathfinder.step(agent.currentRequestId, iterations);
          this.updateAgentFromProgress(agent, progress, pathfinder);
          remainingBudget -= progress.nodesSearched;
          this.mapComponent.iterationsUsedThisFrame += progress.nodesSearched;
        }
        agentsProcessed++;
      }
      this.mapComponent.agentsProcessedThisFrame = agentsProcessed;
    }
    /**
     * @zh 启动新的寻路请求
     * @en Start new pathfinding request
     */
    startNewRequest(agent, pathfinder) {
      if (agent.currentRequestId >= 0) {
        pathfinder.cancel(agent.currentRequestId);
        pathfinder.cleanup(agent.currentRequestId);
      }
      const request = pathfinder.requestPath(agent.x, agent.y, agent.targetX, agent.targetY, {
        priority: agent.priority
      });
      agent.currentRequestId = request.id;
      agent.state = PathfindingState.InProgress;
      agent.hasRequest = false;
      agent.progress = 0;
      agent.path = [];
      agent.pathIndex = 0;
      this.mapComponent.activeRequests++;
    }
    /**
     * @zh 从进度更新代理状态
     * @en Update agent state from progress
     */
    updateAgentFromProgress(agent, progress, pathfinder) {
      agent.state = progress.state;
      agent.progress = progress.estimatedProgress;
      agent.onPathProgress?.(progress.estimatedProgress);
      if (progress.state === PathfindingState.Completed) {
        const result = pathfinder.getResult(agent.currentRequestId);
        if (result && result.found) {
          const smoother = this.mapComponent?.smoother;
          const map = this.mapComponent?.map;
          if (smoother && map && this.mapComponent?.enableSmoothing) {
            agent.path = smoother.smooth(result.path, map);
          } else {
            agent.path = [
              ...result.path
            ];
          }
          agent.pathIndex = 0;
          agent.pathCost = result.cost;
          agent.onPathComplete?.(true, agent.path);
        } else {
          agent.path = [];
          agent.state = PathfindingState.Failed;
          agent.onPathComplete?.(false, []);
        }
        pathfinder.cleanup(agent.currentRequestId);
        this.mapComponent.activeRequests--;
      } else if (progress.state === PathfindingState.Failed) {
        agent.path = [];
        agent.onPathComplete?.(false, []);
        pathfinder.cleanup(agent.currentRequestId);
        this.mapComponent.activeRequests--;
      }
    }
    /**
     * @zh 周期性验证路径有效性
     * @en Periodically validate path validity
     */
    validatePaths(entities) {
      const map = this.mapComponent?.map;
      if (!map) return;
      for (const entity of entities) {
        const agent = entity.getComponent(exports.PathfindingAgentComponent);
        if (!agent || !agent.enableDynamicReplan) continue;
        if (agent.path.length === 0 || agent.isPathComplete()) continue;
        if (this.frameCounter - agent.lastValidationFrame < agent.validationInterval) {
          continue;
        }
        agent.lastValidationFrame = this.frameCounter;
        const checkEnd = Math.min(agent.pathIndex + agent.lookaheadDistance, agent.path.length);
        const result = this.pathValidator.validatePath(agent.path, agent.pathIndex, checkEnd, map);
        if (!result.valid) {
          agent.x = agent.path[agent.pathIndex]?.x ?? agent.x;
          agent.y = agent.path[agent.pathIndex]?.y ?? agent.y;
          agent.requestPathTo(agent.targetX, agent.targetY);
        }
      }
    }
  };
  __name(_PathfindingSystem, "PathfindingSystem");
  exports.PathfindingSystem = _PathfindingSystem;
  exports.PathfindingSystem = _ts_decorate3([
    K("Pathfinding", {
      updateOrder: 0
    }),
    _ts_metadata3("design:type", Function),
    _ts_metadata3("design:paramtypes", [])
  ], exports.PathfindingSystem);
  function _ts_decorate4(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  }
  __name(_ts_decorate4, "_ts_decorate");
  function _ts_metadata4(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
  }
  __name(_ts_metadata4, "_ts_metadata");
  var _AvoidanceAgentComponent = class _AvoidanceAgentComponent extends Xe {
    constructor() {
      super(...arguments);
      // =========================================================================
      // 物理属性 | Physical Properties
      // =========================================================================
      /**
       * @zh 代理半径
       * @en Agent radius
       *
       * @zh 用于碰撞检测和避让计算
       * @en Used for collision detection and avoidance computation
       */
      __publicField(this, "radius", DEFAULT_AGENT_PARAMS.radius);
      /**
       * @zh 最大速度
       * @en Maximum speed
       */
      __publicField(this, "maxSpeed", DEFAULT_AGENT_PARAMS.maxSpeed);
      // =========================================================================
      // ORCA 参数 | ORCA Parameters
      // =========================================================================
      /**
       * @zh 邻居检测距离
       * @en Neighbor detection distance
       *
       * @zh 只考虑此范围内的其他代理
       * @en Only considers other agents within this range
       */
      __publicField(this, "neighborDist", DEFAULT_AGENT_PARAMS.neighborDist);
      /**
       * @zh 最大邻居数量
       * @en Maximum number of neighbors to consider
       *
       * @zh 限制计算量，优先考虑最近的邻居
       * @en Limits computation, prioritizes closest neighbors
       */
      __publicField(this, "maxNeighbors", DEFAULT_AGENT_PARAMS.maxNeighbors);
      /**
       * @zh 代理避让时间视野（秒）
       * @en Time horizon for agent avoidance (seconds)
       *
       * @zh 更大的值会让代理更早开始避让，但可能导致过于保守
       * @en Larger values make agents start avoiding earlier, but may be too conservative
       */
      __publicField(this, "timeHorizon", DEFAULT_AGENT_PARAMS.timeHorizon);
      /**
       * @zh 障碍物避让时间视野（秒）
       * @en Time horizon for obstacle avoidance (seconds)
       */
      __publicField(this, "timeHorizonObst", DEFAULT_AGENT_PARAMS.timeHorizonObst);
      // =========================================================================
      // 位置和速度（运行时状态）| Position & Velocity (Runtime State)
      // =========================================================================
      /**
       * @zh 当前位置 X
       * @en Current position X
       *
       * @zh 如果实体有 Transform 组件，系统会自动同步
       * @en If entity has Transform component, system will sync automatically
       */
      __publicField(this, "positionX", 0);
      /**
       * @zh 当前位置 Y
       * @en Current position Y
       */
      __publicField(this, "positionY", 0);
      /**
       * @zh 当前速度 X
       * @en Current velocity X
       */
      __publicField(this, "velocityX", 0);
      /**
       * @zh 当前速度 Y
       * @en Current velocity Y
       */
      __publicField(this, "velocityY", 0);
      /**
       * @zh 首选速度 X（通常指向目标方向）
       * @en Preferred velocity X (usually towards target)
       */
      __publicField(this, "preferredVelocityX", 0);
      /**
       * @zh 首选速度 Y
       * @en Preferred velocity Y
       */
      __publicField(this, "preferredVelocityY", 0);
      /**
       * @zh ORCA 计算的新速度 X
       * @en New velocity X computed by ORCA
       */
      __publicField(this, "newVelocityX", 0);
      /**
       * @zh ORCA 计算的新速度 Y
       * @en New velocity Y computed by ORCA
       */
      __publicField(this, "newVelocityY", 0);
      // =========================================================================
      // 配置选项 | Configuration Options
      // =========================================================================
      /**
       * @zh 是否启用避让
       * @en Whether avoidance is enabled
       */
      __publicField(this, "enabled", true);
      /**
       * @zh 是否自动应用新速度
       * @en Whether to automatically apply new velocity
       *
       * @zh 如果为 true，系统会在计算后自动将 newVelocity 赋值给 velocity
       * @en If true, system will automatically assign newVelocity to velocity after computation
       */
      __publicField(this, "autoApplyVelocity", true);
    }
    // =========================================================================
    // 公共方法 | Public Methods
    // =========================================================================
    /**
     * @zh 设置位置
     * @en Set position
     */
    setPosition(x, y) {
      this.positionX = x;
      this.positionY = y;
    }
    /**
     * @zh 设置当前速度
     * @en Set current velocity
     */
    setVelocity(x, y) {
      this.velocityX = x;
      this.velocityY = y;
    }
    /**
     * @zh 设置首选速度
     * @en Set preferred velocity
     */
    setPreferredVelocity(x, y) {
      this.preferredVelocityX = x;
      this.preferredVelocityY = y;
    }
    /**
     * @zh 设置首选速度朝向目标
     * @en Set preferred velocity towards target
     *
     * @param targetX - @zh 目标 X @en Target X
     * @param targetY - @zh 目标 Y @en Target Y
     * @param currentX - @zh 当前 X（可选，默认使用 positionX）@en Current X (optional, defaults to positionX)
     * @param currentY - @zh 当前 Y（可选，默认使用 positionY）@en Current Y (optional, defaults to positionY)
     */
    setPreferredVelocityTowards(targetX, targetY, currentX, currentY) {
      const x = currentX ?? this.positionX;
      const y = currentY ?? this.positionY;
      const dx = targetX - x;
      const dy = targetY - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 1e-4) {
        const speed = Math.min(this.maxSpeed, dist);
        this.preferredVelocityX = dx / dist * speed;
        this.preferredVelocityY = dy / dist * speed;
      } else {
        this.preferredVelocityX = 0;
        this.preferredVelocityY = 0;
      }
    }
    /**
     * @zh 应用 ORCA 计算的新速度
     * @en Apply new velocity computed by ORCA
     */
    applyNewVelocity() {
      this.velocityX = this.newVelocityX;
      this.velocityY = this.newVelocityY;
    }
    /**
     * @zh 获取新速度的长度
     * @en Get length of new velocity
     */
    getNewSpeed() {
      return Math.sqrt(this.newVelocityX * this.newVelocityX + this.newVelocityY * this.newVelocityY);
    }
    /**
     * @zh 获取当前速度的长度
     * @en Get length of current velocity
     */
    getCurrentSpeed() {
      return Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
    }
    /**
     * @zh 停止代理
     * @en Stop the agent
     */
    stop() {
      this.velocityX = 0;
      this.velocityY = 0;
      this.preferredVelocityX = 0;
      this.preferredVelocityY = 0;
      this.newVelocityX = 0;
      this.newVelocityY = 0;
    }
    /**
     * @zh 重置组件状态
     * @en Reset component state
     */
    reset() {
      this.positionX = 0;
      this.positionY = 0;
      this.velocityX = 0;
      this.velocityY = 0;
      this.preferredVelocityX = 0;
      this.preferredVelocityY = 0;
      this.newVelocityX = 0;
      this.newVelocityY = 0;
    }
    /**
     * @zh 组件从实体移除时调用
     * @en Called when component is removed from entity
     */
    onRemovedFromEntity() {
      this.reset();
    }
  };
  __name(_AvoidanceAgentComponent, "AvoidanceAgentComponent");
  exports.AvoidanceAgentComponent = _AvoidanceAgentComponent;
  _ts_decorate4([
    st(),
    Se({
      type: "number",
      label: "Radius",
      min: 0.1,
      max: 10
    }),
    _ts_metadata4("design:type", Number)
  ], exports.AvoidanceAgentComponent.prototype, "radius", void 0);
  _ts_decorate4([
    st(),
    Se({
      type: "number",
      label: "Max Speed",
      min: 0.1,
      max: 100
    }),
    _ts_metadata4("design:type", Number)
  ], exports.AvoidanceAgentComponent.prototype, "maxSpeed", void 0);
  _ts_decorate4([
    st(),
    Se({
      type: "number",
      label: "Neighbor Dist",
      min: 1,
      max: 100
    }),
    _ts_metadata4("design:type", Number)
  ], exports.AvoidanceAgentComponent.prototype, "neighborDist", void 0);
  _ts_decorate4([
    st(),
    Se({
      type: "number",
      label: "Max Neighbors",
      min: 1,
      max: 50
    }),
    _ts_metadata4("design:type", Number)
  ], exports.AvoidanceAgentComponent.prototype, "maxNeighbors", void 0);
  _ts_decorate4([
    st(),
    Se({
      type: "number",
      label: "Time Horizon",
      min: 0.1,
      max: 10
    }),
    _ts_metadata4("design:type", Number)
  ], exports.AvoidanceAgentComponent.prototype, "timeHorizon", void 0);
  _ts_decorate4([
    st(),
    Se({
      type: "number",
      label: "Time Horizon Obst",
      min: 0.1,
      max: 10
    }),
    _ts_metadata4("design:type", Number)
  ], exports.AvoidanceAgentComponent.prototype, "timeHorizonObst", void 0);
  _ts_decorate4([
    st(),
    Se({
      type: "boolean",
      label: "Enabled"
    }),
    _ts_metadata4("design:type", Boolean)
  ], exports.AvoidanceAgentComponent.prototype, "enabled", void 0);
  _ts_decorate4([
    st(),
    Se({
      type: "boolean",
      label: "Auto Apply"
    }),
    _ts_metadata4("design:type", Boolean)
  ], exports.AvoidanceAgentComponent.prototype, "autoApplyVelocity", void 0);
  exports.AvoidanceAgentComponent = _ts_decorate4([
    X("AvoidanceAgent"),
    nt({
      version: 1,
      typeId: "AvoidanceAgent"
    })
  ], exports.AvoidanceAgentComponent);
  function _ts_decorate5(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  }
  __name(_ts_decorate5, "_ts_decorate");
  function _ts_metadata5(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
  }
  __name(_ts_metadata5, "_ts_metadata");
  var _AvoidanceWorldComponent = class _AvoidanceWorldComponent extends Xe {
    constructor() {
      super(...arguments);
      // =========================================================================
      // ORCA 配置 | ORCA Configuration
      // =========================================================================
      /**
       * @zh 默认时间视野（代理）
       * @en Default time horizon for agents
       */
      __publicField(this, "defaultTimeHorizon", DEFAULT_ORCA_CONFIG.defaultTimeHorizon);
      /**
       * @zh 默认时间视野（障碍物）
       * @en Default time horizon for obstacles
       */
      __publicField(this, "defaultTimeHorizonObst", DEFAULT_ORCA_CONFIG.defaultTimeHorizonObst);
      /**
       * @zh 时间步长
       * @en Time step
       */
      __publicField(this, "timeStep", DEFAULT_ORCA_CONFIG.timeStep);
      // =========================================================================
      // 运行时实例（不序列化）| Runtime Instances (not serialized)
      // =========================================================================
      /**
       * @zh ORCA 求解器实例
       * @en ORCA solver instance
       */
      __publicField(this, "solver", null);
      /**
       * @zh KD-Tree 实例
       * @en KD-Tree instance
       */
      __publicField(this, "kdTree", null);
      /**
       * @zh 静态障碍物列表
       * @en List of static obstacles
       */
      __publicField(this, "obstacles", []);
      /**
       * @zh 是否已初始化
       * @en Whether initialized
       */
      __publicField(this, "initialized", false);
      // =========================================================================
      // 统计信息 | Statistics
      // =========================================================================
      /**
       * @zh 当前代理数量
       * @en Current agent count
       */
      __publicField(this, "agentCount", 0);
      /**
       * @zh 本帧处理的代理数
       * @en Agents processed this frame
       */
      __publicField(this, "agentsProcessedThisFrame", 0);
      /**
       * @zh 本帧 ORCA 计算耗时（毫秒）
       * @en ORCA computation time this frame (ms)
       */
      __publicField(this, "computeTimeMs", 0);
    }
    // =========================================================================
    // 公共方法 | Public Methods
    // =========================================================================
    /**
     * @zh 获取 ORCA 配置
     * @en Get ORCA configuration
     */
    getConfig() {
      return {
        defaultTimeHorizon: this.defaultTimeHorizon,
        defaultTimeHorizonObst: this.defaultTimeHorizonObst,
        timeStep: this.timeStep
      };
    }
    /**
     * @zh 添加静态障碍物
     * @en Add static obstacle
     *
     * @param obstacle - @zh 障碍物（顶点列表，逆时针顺序）@en Obstacle (vertex list, counter-clockwise)
     */
    addObstacle(obstacle) {
      this.obstacles.push(obstacle);
    }
    /**
     * @zh 添加矩形障碍物
     * @en Add rectangular obstacle
     *
     * @param x - @zh 左下角 X @en Bottom-left X
     * @param y - @zh 左下角 Y @en Bottom-left Y
     * @param width - @zh 宽度 @en Width
     * @param height - @zh 高度 @en Height
     */
    addRectObstacle(x, y, width, height) {
      this.obstacles.push({
        vertices: [
          {
            x,
            y
          },
          {
            x: x + width,
            y
          },
          {
            x: x + width,
            y: y + height
          },
          {
            x,
            y: y + height
          }
        ]
      });
    }
    /**
     * @zh 移除所有障碍物
     * @en Remove all obstacles
     */
    clearObstacles() {
      this.obstacles = [];
    }
    /**
     * @zh 重置统计信息
     * @en Reset statistics
     */
    resetStats() {
      this.agentsProcessedThisFrame = 0;
      this.computeTimeMs = 0;
    }
    /**
     * @zh 组件从实体移除时调用
     * @en Called when component is removed from entity
     */
    onRemovedFromEntity() {
      this.solver = null;
      this.kdTree = null;
      this.obstacles = [];
      this.initialized = false;
    }
  };
  __name(_AvoidanceWorldComponent, "AvoidanceWorldComponent");
  exports.AvoidanceWorldComponent = _AvoidanceWorldComponent;
  _ts_decorate5([
    st(),
    Se({
      type: "number",
      label: "Time Horizon",
      min: 0.1,
      max: 10
    }),
    _ts_metadata5("design:type", Number)
  ], exports.AvoidanceWorldComponent.prototype, "defaultTimeHorizon", void 0);
  _ts_decorate5([
    st(),
    Se({
      type: "number",
      label: "Time Horizon Obst",
      min: 0.1,
      max: 10
    }),
    _ts_metadata5("design:type", Number)
  ], exports.AvoidanceWorldComponent.prototype, "defaultTimeHorizonObst", void 0);
  _ts_decorate5([
    st(),
    Se({
      type: "number",
      label: "Time Step",
      min: 1e-3,
      max: 0.1
    }),
    _ts_metadata5("design:type", Number)
  ], exports.AvoidanceWorldComponent.prototype, "timeStep", void 0);
  exports.AvoidanceWorldComponent = _ts_decorate5([
    X("AvoidanceWorld"),
    nt({
      version: 1,
      typeId: "AvoidanceWorld"
    })
  ], exports.AvoidanceWorldComponent);
  function _ts_decorate6(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  }
  __name(_ts_decorate6, "_ts_decorate");
  function _ts_metadata6(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
  }
  __name(_ts_metadata6, "_ts_metadata");
  var _LocalAvoidanceSystem = class _LocalAvoidanceSystem extends _t {
    constructor() {
      super(lt.all(exports.AvoidanceAgentComponent));
      __publicField(this, "worldEntity", null);
      __publicField(this, "worldComponent", null);
      __publicField(this, "solver", null);
      __publicField(this, "kdTree", null);
    }
    /**
     * @zh 系统初始化
     * @en System initialization
     */
    onInitialize() {
      this.findWorldEntity();
      this.initializeSolver();
    }
    /**
     * @zh 系统激活时调用
     * @en Called when system is enabled
     */
    onEnable() {
      this.findWorldEntity();
    }
    /**
     * @zh 处理实体
     * @en Process entities
     */
    process(entities) {
      if (entities.length === 0) return;
      if (!this.solver) {
        this.initializeSolver();
      }
      const startTime = performance.now();
      const agents = this.collectAgentData(entities);
      this.kdTree.build(agents);
      const obstacles = this.worldComponent?.obstacles ?? [];
      const deltaTime = this.worldComponent?.timeStep ?? 1 / 60;
      for (let i = 0; i < entities.length; i++) {
        const entity = entities[i];
        const component = entity.getComponent(exports.AvoidanceAgentComponent);
        if (!component.enabled) continue;
        const agent = agents[i];
        const neighborResults = this.kdTree.queryNeighbors(agent.position, agent.neighborDist, agent.maxNeighbors, agent.id);
        const neighbors = neighborResults.map((r) => r.agent);
        const newVelocity = this.solver.computeNewVelocity(agent, neighbors, obstacles, deltaTime);
        component.newVelocityX = newVelocity.x;
        component.newVelocityY = newVelocity.y;
        if (component.autoApplyVelocity) {
          component.applyNewVelocity();
        }
      }
      const endTime = performance.now();
      if (this.worldComponent) {
        this.worldComponent.agentCount = entities.length;
        this.worldComponent.agentsProcessedThisFrame = entities.length;
        this.worldComponent.computeTimeMs = endTime - startTime;
      }
    }
    // =========================================================================
    // 私有方法 | Private Methods
    // =========================================================================
    /**
     * @zh 查找世界实体
     * @en Find world entity
     */
    findWorldEntity() {
      if (!this.scene) return;
      const entities = this.scene.entities.findEntitiesWithComponent(exports.AvoidanceWorldComponent);
      if (entities.length > 0) {
        const entity = entities[0];
        const worldComp = entity.getComponent(exports.AvoidanceWorldComponent);
        if (worldComp) {
          this.worldEntity = entity;
          this.worldComponent = worldComp;
          if (this.solver && !worldComp.solver) {
            worldComp.solver = this.solver;
          }
          if (this.kdTree && !worldComp.kdTree) {
            worldComp.kdTree = this.kdTree;
          }
          worldComp.initialized = true;
        }
      }
    }
    /**
     * @zh 初始化求解器
     * @en Initialize solver
     */
    initializeSolver() {
      const config = this.worldComponent?.getConfig();
      this.solver = createORCASolver(config);
      this.kdTree = createKDTree();
      if (this.worldComponent) {
        this.worldComponent.solver = this.solver;
        this.worldComponent.kdTree = this.kdTree;
      }
    }
    /**
     * @zh 收集代理数据
     * @en Collect agent data
     */
    collectAgentData(entities) {
      const agents = [];
      for (const entity of entities) {
        const avoidance = entity.getComponent(exports.AvoidanceAgentComponent);
        const pathAgent = entity.getComponent(exports.PathfindingAgentComponent);
        if (pathAgent) {
          avoidance.positionX = pathAgent.x;
          avoidance.positionY = pathAgent.y;
          const waypoint = pathAgent.getNextWaypoint();
          if (waypoint && avoidance.preferredVelocityX === 0 && avoidance.preferredVelocityY === 0) {
            avoidance.setPreferredVelocityTowards(waypoint.x, waypoint.y);
          }
        }
        agents.push({
          id: entity.id,
          position: {
            x: avoidance.positionX,
            y: avoidance.positionY
          },
          velocity: {
            x: avoidance.velocityX,
            y: avoidance.velocityY
          },
          preferredVelocity: {
            x: avoidance.preferredVelocityX,
            y: avoidance.preferredVelocityY
          },
          radius: avoidance.radius,
          maxSpeed: avoidance.maxSpeed,
          neighborDist: avoidance.neighborDist,
          maxNeighbors: avoidance.maxNeighbors,
          timeHorizon: avoidance.timeHorizon,
          timeHorizonObst: avoidance.timeHorizonObst
        });
      }
      return agents;
    }
  };
  __name(_LocalAvoidanceSystem, "LocalAvoidanceSystem");
  exports.LocalAvoidanceSystem = _LocalAvoidanceSystem;
  exports.LocalAvoidanceSystem = _ts_decorate6([
    K("LocalAvoidance", {
      updateOrder: 50
    }),
    _ts_metadata6("design:type", Function),
    _ts_metadata6("design:paramtypes", [])
  ], exports.LocalAvoidanceSystem);

  exports.AStarPathfinder = AStarPathfinder;
  exports.Circle = s;
  exports.Color = l;
  exports.Component = Xe;
  exports.Core = Ss;
  exports.DEFAULT_AGENT_PARAMS = DEFAULT_AGENT_PARAMS;
  exports.DEFAULT_ORCA_CONFIG = DEFAULT_ORCA_CONFIG;
  exports.ECSComponent = X;
  exports.ECSSystem = K;
  exports.Emitter = Ms;
  exports.Entity = Xt;
  exports.EntitySystem = _t;
  exports.Fixed32 = n;
  exports.FixedMath = o;
  exports.FixedVector2 = u;
  exports.GlobalManager = As;
  exports.GridMap = GridMap;
  exports.GridPathfinder = GridPathfinder;
  exports.HPAPathfinder = HPAPathfinder;
  exports.IncrementalAStarPathfinder = IncrementalAStarPathfinder;
  exports.IntervalSystem = xs;
  exports.JPSPathfinder = JPSPathfinder;
  exports.KDTree = KDTree;
  exports.Logger = B;
  exports.Matcher = lt;
  exports.MathUtils = c;
  exports.Matrix3 = r;
  exports.NavMesh = NavMesh;
  exports.ORCASolver = ORCASolver;
  exports.PassiveSystem = Ds;
  exports.Polygon = i;
  exports.ProcessingSystem = ks;
  exports.Rectangle = a;
  exports.Scene = Xn;
  exports.SceneManager = cs;
  exports.ServiceContainer = Un;
  exports.Time = n$1;
  exports.Timer = s$1;
  exports.Vector2 = t;
  exports.Vector3 = e;
  exports.World = as;
  exports.WorldManager = _s;
  exports.chebyshevDistance = chebyshevDistance;
  exports.createAStarPathfinder = createAStarPathfinder;
  exports.createCatmullRomSmoother = createCatmullRomSmoother;
  exports.createCombinedSmoother = createCombinedSmoother;
  exports.createGridMap = createGridMap;
  exports.createKDTree = createKDTree;
  exports.createLineOfSightSmoother = createLineOfSightSmoother;
  exports.createLogger = $;
  exports.createNavMesh = createNavMesh;
  exports.createORCASolver = createORCASolver;
  exports.euclideanDistance = euclideanDistance;
  exports.manhattanDistance = manhattanDistance;
  exports.octileDistance = octileDistance;
  exports.solveORCALinearProgram = solveORCALinearProgram;

  return exports;

})({});
//# sourceMappingURL=esengine.iife.js.map
