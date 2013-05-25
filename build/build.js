
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);
  var index = path + '/index.js';

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
  }

  if (require.aliases.hasOwnProperty(index)) {
    return require.aliases[index];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-indexof/index.js", Function("exports, require, module",
"\nvar indexOf = [].indexOf;\n\nmodule.exports = function(arr, obj){\n  if (indexOf) return arr.indexOf(obj);\n  for (var i = 0; i < arr.length; ++i) {\n    if (arr[i] === obj) return i;\n  }\n  return -1;\n};//@ sourceURL=component-indexof/index.js"
));
require.register("component-emitter/index.js", Function("exports, require, module",
"\n/**\n * Module dependencies.\n */\n\nvar index = require('indexof');\n\n/**\n * Expose `Emitter`.\n */\n\nmodule.exports = Emitter;\n\n/**\n * Initialize a new `Emitter`.\n *\n * @api public\n */\n\nfunction Emitter(obj) {\n  if (obj) return mixin(obj);\n};\n\n/**\n * Mixin the emitter properties.\n *\n * @param {Object} obj\n * @return {Object}\n * @api private\n */\n\nfunction mixin(obj) {\n  for (var key in Emitter.prototype) {\n    obj[key] = Emitter.prototype[key];\n  }\n  return obj;\n}\n\n/**\n * Listen on the given `event` with `fn`.\n *\n * @param {String} event\n * @param {Function} fn\n * @return {Emitter}\n * @api public\n */\n\nEmitter.prototype.on = function(event, fn){\n  this._callbacks = this._callbacks || {};\n  (this._callbacks[event] = this._callbacks[event] || [])\n    .push(fn);\n  return this;\n};\n\n/**\n * Adds an `event` listener that will be invoked a single\n * time then automatically removed.\n *\n * @param {String} event\n * @param {Function} fn\n * @return {Emitter}\n * @api public\n */\n\nEmitter.prototype.once = function(event, fn){\n  var self = this;\n  this._callbacks = this._callbacks || {};\n\n  function on() {\n    self.off(event, on);\n    fn.apply(this, arguments);\n  }\n\n  fn._off = on;\n  this.on(event, on);\n  return this;\n};\n\n/**\n * Remove the given callback for `event` or all\n * registered callbacks.\n *\n * @param {String} event\n * @param {Function} fn\n * @return {Emitter}\n * @api public\n */\n\nEmitter.prototype.off =\nEmitter.prototype.removeListener =\nEmitter.prototype.removeAllListeners = function(event, fn){\n  this._callbacks = this._callbacks || {};\n\n  // all\n  if (0 == arguments.length) {\n    this._callbacks = {};\n    return this;\n  }\n\n  // specific event\n  var callbacks = this._callbacks[event];\n  if (!callbacks) return this;\n\n  // remove all handlers\n  if (1 == arguments.length) {\n    delete this._callbacks[event];\n    return this;\n  }\n\n  // remove specific handler\n  var i = index(callbacks, fn._off || fn);\n  if (~i) callbacks.splice(i, 1);\n  return this;\n};\n\n/**\n * Emit `event` with the given args.\n *\n * @param {String} event\n * @param {Mixed} ...\n * @return {Emitter}\n */\n\nEmitter.prototype.emit = function(event){\n  this._callbacks = this._callbacks || {};\n  var args = [].slice.call(arguments, 1)\n    , callbacks = this._callbacks[event];\n\n  if (callbacks) {\n    callbacks = callbacks.slice(0);\n    for (var i = 0, len = callbacks.length; i < len; ++i) {\n      callbacks[i].apply(this, args);\n    }\n  }\n\n  return this;\n};\n\n/**\n * Return array of callbacks for `event`.\n *\n * @param {String} event\n * @return {Array}\n * @api public\n */\n\nEmitter.prototype.listeners = function(event){\n  this._callbacks = this._callbacks || {};\n  return this._callbacks[event] || [];\n};\n\n/**\n * Check if this emitter has `event` handlers.\n *\n * @param {String} event\n * @return {Boolean}\n * @api public\n */\n\nEmitter.prototype.hasListeners = function(event){\n  return !! this.listeners(event).length;\n};\n//@ sourceURL=component-emitter/index.js"
));
require.register("stagas-audio-process/index.js", Function("exports, require, module",
"\n/**\n * Create a stereo script processor node `fn`\n * for `context` with sample `length`.\n *\n * @param {AudioContext} context\n * @param {Number} length\n * @param {Function} fn\n * @return {AudioNode}\n */\n\nmodule.exports = function(context, length, fn){\n  var node = context.createScriptProcessor(length, 1, 2);\n  node.onaudioprocess = onaudioprocess;\n\n  return node;\n\n  function onaudioprocess(ev){\n    fn(\n      ev.outputBuffer.getChannelData(0)\n    , ev.outputBuffer.getChannelData(1)\n    , ev.outputBuffer.length\n    , ev\n    );\n  }\n};\n//@ sourceURL=stagas-audio-process/index.js"
));
require.register("stagas-mod-parser/index.js", Function("exports, require, module",
"\n/**\n * Export `ModParser`.\n */\n\nexports = module.exports = ModParser;\n\n/**\n * Channel count by identifier table.\n */\n\nvar channelCountByIdentifier = exports.channelCountByIdentifier = {\n  'TDZ1': 1, '1CHN': 1, 'TDZ2': 2, '2CHN': 2, 'TDZ3': 3, '3CHN': 3,\n  'M.K.': 4, 'FLT4': 4, 'M!K!': 4, '4CHN': 4, 'TDZ4': 4, '5CHN': 5, 'TDZ5': 5,\n  '6CHN': 6, 'TDZ6': 6, '7CHN': 7, 'TDZ7': 7, '8CHN': 8, 'TDZ8': 8, 'OCTA': 8, 'CD81': 8,\n  '9CHN': 9, 'TDZ9': 9,\n  '10CH': 10, '11CH': 11, '12CH': 12, '13CH': 13, '14CH': 14, '15CH': 15, '16CH': 16, '17CH': 17,\n  '18CH': 18, '19CH': 19, '20CH': 20, '21CH': 21, '22CH': 22, '23CH': 23, '24CH': 24, '25CH': 25,\n  '26CH': 26, '27CH': 27, '28CH': 28, '29CH': 29, '30CH': 30, '31CH': 31, '32CH': 32\n}\n\n/**\n * ModParser class.\n *\n * @param {String} mod\n * @api public\n */\n\nfunction ModParser(mod){\n  this.data = mod;\n  this.samples = [];\n  this.sampleData = [];\n  this.positions = [];\n  this.patternCount = 0;\n  this.patterns = [];\n\n  this.title = trimNulls(mod.substr(0, 20))\n\n  this.sampleCount = 31;\n\n  for (var i = 0; i < this.sampleCount; i++) {\n    var sampleInfo = mod.substr(20 + i*30, 30);\n    var sampleName = trimNulls(sampleInfo.substr(0, 22));\n    this.samples[i] = {\n      name: sampleName,\n      length: getWord(sampleInfo, 22) * 2,\n      finetune: sampleInfo.charCodeAt(24),\n      volume: sampleInfo.charCodeAt(25),\n      repeatOffset: getWord(sampleInfo, 26) * 2,\n      repeatLength: getWord(sampleInfo, 28) * 2,\n    }\n  }\n\n  this.positionCount = mod.charCodeAt(950);\n  this.positionLoopPoint = mod.charCodeAt(951);\n  for (var i = 0; i < 128; i++) {\n    this.positions[i] = mod.charCodeAt(952+i);\n    if (this.positions[i] >= this.patternCount) {\n      this.patternCount = this.positions[i]+1;\n    }\n  }\n\n  var identifier = mod.substr(1080, 4);\n\n  this.channelCount = channelCountByIdentifier[identifier];\n  if (!this.channelCount) {\n    this.channelCount = 4;\n  }\n\n  var patternOffset = 1084;\n  for (var pat = 0; pat < this.patternCount; pat++) {\n    this.patterns[pat] = [];\n    for (var row = 0; row < 64; row++) {\n      this.patterns[pat][row] = [];\n      for (var chan = 0; chan < this.channelCount; chan++) {\n        b0 = mod.charCodeAt(patternOffset);\n        b1 = mod.charCodeAt(patternOffset + 1);\n        b2 = mod.charCodeAt(patternOffset + 2);\n        b3 = mod.charCodeAt(patternOffset + 3);\n        var eff = b2 & 0x0f;\n        this.patterns[pat][row][chan] = {\n          sample: (b0 & 0xf0) | (b2 >> 4),\n          period: ((b0 & 0x0f) << 8) | b1,\n          effect: eff,\n          effectParameter: b3\n        };\n        if (eff == 0x0E) {\n          this.patterns[pat][row][chan].extEffect = (b3 & 0xF0) >> 4;\n          this.patterns[pat][row][chan].extEffectParameter = (b3 & 0x0F);\n        }\n        patternOffset += 4;\n      }\n    }\n  }\n\n  var sampleOffset = patternOffset;\n  for (var s = 0; s < this.sampleCount; s++) {\n    this.samples[s].startOffset = sampleOffset;\n    this.sampleData[s] = new Uint8Array(this.samples[s].length);\n    var i = 0;\n    for (var o = sampleOffset, e = sampleOffset + this.samples[s].length; o < e; o++) {\n      this.sampleData[s][i] = mod.charCodeAt(o);\n      i++;\n    }\n    sampleOffset += this.samples[s].length;\n  }\n}\n\nfunction trimNulls(str){\n  return str.replace(/\\x00+$/, '');\n}\n\nfunction getWord(str, pos){\n  return (str.charCodeAt(pos) << 8) + str.charCodeAt(pos+1);\n}\n\n//@ sourceURL=stagas-mod-parser/index.js"
));
require.register("mod-player/index.js", Function("exports, require, module",
"/*\n  Useful docs\n    Explains effect calculations: http://www.mediatel.lu/workshop/audio/fileformat/h_mod.html\n\n*/\n\n/*\nModPeriodTable[ft][n] = the period to use for note number n at finetune value ft.\nFinetune values are in twos-complement, i.e. [0,1,2,3,4,5,6,7,-8,-7,-6,-5,-4,-3,-2,-1]\nThe first table is used to generate a reverse lookup table, to find out the note number\nfor a period given in the MOD file.\n*/\nvar ModPeriodTable = [\n  [1712, 1616, 1524, 1440, 1356, 1280, 1208, 1140, 1076, 1016, 960 , 906,\n   856 , 808 , 762 , 720 , 678 , 640 , 604 , 570 , 538 , 508 , 480 , 453,\n   428 , 404 , 381 , 360 , 339 , 320 , 302 , 285 , 269 , 254 , 240 , 226,\n   214 , 202 , 190 , 180 , 170 , 160 , 151 , 143 , 135 , 127 , 120 , 113,\n   107 , 101 , 95  , 90  , 85  , 80  , 75  , 71  , 67  , 63  , 60  , 56 ],\n  [1700, 1604, 1514, 1430, 1348, 1274, 1202, 1134, 1070, 1010, 954 , 900,\n   850 , 802 , 757 , 715 , 674 , 637 , 601 , 567 , 535 , 505 , 477 , 450,\n   425 , 401 , 379 , 357 , 337 , 318 , 300 , 284 , 268 , 253 , 239 , 225,\n   213 , 201 , 189 , 179 , 169 , 159 , 150 , 142 , 134 , 126 , 119 , 113,\n   106 , 100 , 94  , 89  , 84  , 79  , 75  , 71  , 67  , 63  , 59  , 56 ],\n  [1688, 1592, 1504, 1418, 1340, 1264, 1194, 1126, 1064, 1004, 948 , 894,\n   844 , 796 , 752 , 709 , 670 , 632 , 597 , 563 , 532 , 502 , 474 , 447,\n   422 , 398 , 376 , 355 , 335 , 316 , 298 , 282 , 266 , 251 , 237 , 224,\n   211 , 199 , 188 , 177 , 167 , 158 , 149 , 141 , 133 , 125 , 118 , 112,\n   105 , 99  , 94  , 88  , 83  , 79  , 74  , 70  , 66  , 62  , 59  , 56 ],\n  [1676, 1582, 1492, 1408, 1330, 1256, 1184, 1118, 1056, 996 , 940 , 888,\n   838 , 791 , 746 , 704 , 665 , 628 , 592 , 559 , 528 , 498 , 470 , 444,\n   419 , 395 , 373 , 352 , 332 , 314 , 296 , 280 , 264 , 249 , 235 , 222,\n   209 , 198 , 187 , 176 , 166 , 157 , 148 , 140 , 132 , 125 , 118 , 111,\n   104 , 99  , 93  , 88  , 83  , 78  , 74  , 70  , 66  , 62  , 59  , 55 ],\n  [1664, 1570, 1482, 1398, 1320, 1246, 1176, 1110, 1048, 990 , 934 , 882,\n   832 , 785 , 741 , 699 , 660 , 623 , 588 , 555 , 524 , 495 , 467 , 441,\n   416 , 392 , 370 , 350 , 330 , 312 , 294 , 278 , 262 , 247 , 233 , 220,\n   208 , 196 , 185 , 175 , 165 , 156 , 147 , 139 , 131 , 124 , 117 , 110,\n   104 , 98  , 92  , 87  , 82  , 78  , 73  , 69  , 65  , 62  , 58  , 55 ],\n  [1652, 1558, 1472, 1388, 1310, 1238, 1168, 1102, 1040, 982 , 926 , 874,\n   826 , 779 , 736 , 694 , 655 , 619 , 584 , 551 , 520 , 491 , 463 , 437,\n   413 , 390 , 368 , 347 , 328 , 309 , 292 , 276 , 260 , 245 , 232 , 219,\n   206 , 195 , 184 , 174 , 164 , 155 , 146 , 138 , 130 , 123 , 116 , 109,\n   103 , 97  , 92  , 87  , 82  , 77  , 73  , 69  , 65  , 61  , 58  , 54 ],\n  [1640, 1548, 1460, 1378, 1302, 1228, 1160, 1094, 1032, 974 , 920 , 868,\n   820 , 774 , 730 , 689 , 651 , 614 , 580 , 547 , 516 , 487 , 460 , 434,\n   410 , 387 , 365 , 345 , 325 , 307 , 290 , 274 , 258 , 244 , 230 , 217,\n   205 , 193 , 183 , 172 , 163 , 154 , 145 , 137 , 129 , 122 , 115 , 109,\n   102 , 96  , 91  , 86  , 81  , 77  , 72  , 68  , 64  , 61  , 57  , 54 ],\n  [1628, 1536, 1450, 1368, 1292, 1220, 1150, 1086, 1026, 968 , 914 , 862,\n   814 , 768 , 725 , 684 , 646 , 610 , 575 , 543 , 513 , 484 , 457 , 431,\n   407 , 384 , 363 , 342 , 323 , 305 , 288 , 272 , 256 , 242 , 228 , 216,\n   204 , 192 , 181 , 171 , 161 , 152 , 144 , 136 , 128 , 121 , 114 , 108,\n   102 , 96  , 90  , 85  , 80  , 76  , 72  , 68  , 64  , 60  , 57  , 54 ],\n  [1814, 1712, 1616, 1524, 1440, 1356, 1280, 1208, 1140, 1076, 1016, 960,\n   907 , 856 , 808 , 762 , 720 , 678 , 640 , 604 , 570 , 538 , 508 , 480,\n   453 , 428 , 404 , 381 , 360 , 339 , 320 , 302 , 285 , 269 , 254 , 240,\n   226 , 214 , 202 , 190 , 180 , 170 , 160 , 151 , 143 , 135 , 127 , 120,\n   113 , 107 , 101 , 95  , 90  , 85  , 80  , 75  , 71  , 67  , 63  , 60 ],\n  [1800, 1700, 1604, 1514, 1430, 1350, 1272, 1202, 1134, 1070, 1010, 954,\n   900 , 850 , 802 , 757 , 715 , 675 , 636 , 601 , 567 , 535 , 505 , 477,\n   450 , 425 , 401 , 379 , 357 , 337 , 318 , 300 , 284 , 268 , 253 , 238,\n   225 , 212 , 200 , 189 , 179 , 169 , 159 , 150 , 142 , 134 , 126 , 119,\n   112 , 106 , 100 , 94  , 89  , 84  , 79  , 75  , 71  , 67  , 63  , 59 ],\n  [1788, 1688, 1592, 1504, 1418, 1340, 1264, 1194, 1126, 1064, 1004, 948,\n   894 , 844 , 796 , 752 , 709 , 670 , 632 , 597 , 563 , 532 , 502 , 474,\n   447 , 422 , 398 , 376 , 355 , 335 , 316 , 298 , 282 , 266 , 251 , 237,\n   223 , 211 , 199 , 188 , 177 , 167 , 158 , 149 , 141 , 133 , 125 , 118,\n   111 , 105 , 99  , 94  , 88  , 83  , 79  , 74  , 70  , 66  , 62  , 59 ],\n  [1774, 1676, 1582, 1492, 1408, 1330, 1256, 1184, 1118, 1056, 996 , 940,\n   887 , 838 , 791 , 746 , 704 , 665 , 628 , 592 , 559 , 528 , 498 , 470,\n   444 , 419 , 395 , 373 , 352 , 332 , 314 , 296 , 280 , 264 , 249 , 235,\n   222 , 209 , 198 , 187 , 176 , 166 , 157 , 148 , 140 , 132 , 125 , 118,\n   111 , 104 , 99  , 93  , 88  , 83  , 78  , 74  , 70  , 66  , 62  , 59 ],\n  [1762, 1664, 1570, 1482, 1398, 1320, 1246, 1176, 1110, 1048, 988 , 934,\n   881 , 832 , 785 , 741 , 699 , 660 , 623 , 588 , 555 , 524 , 494 , 467,\n   441 , 416 , 392 , 370 , 350 , 330 , 312 , 294 , 278 , 262 , 247 , 233,\n   220 , 208 , 196 , 185 , 175 , 165 , 156 , 147 , 139 , 131 , 123 , 117,\n   110 , 104 , 98  , 92  , 87  , 82  , 78  , 73  , 69  , 65  , 61  , 58 ],\n  [1750, 1652, 1558, 1472, 1388, 1310, 1238, 1168, 1102, 1040, 982 , 926,\n   875 , 826 , 779 , 736 , 694 , 655 , 619 , 584 , 551 , 520 , 491 , 463,\n   437 , 413 , 390 , 368 , 347 , 328 , 309 , 292 , 276 , 260 , 245 , 232,\n   219 , 206 , 195 , 184 , 174 , 164 , 155 , 146 , 138 , 130 , 123 , 116,\n   109 , 103 , 97  , 92  , 87  , 82  , 77  , 73  , 69  , 65  , 61  , 58 ],\n  [1736, 1640, 1548, 1460, 1378, 1302, 1228, 1160, 1094, 1032, 974 , 920,\n   868 , 820 , 774 , 730 , 689 , 651 , 614 , 580 , 547 , 516 , 487 , 460,\n   434 , 410 , 387 , 365 , 345 , 325 , 307 , 290 , 274 , 258 , 244 , 230,\n   217 , 205 , 193 , 183 , 172 , 163 , 154 , 145 , 137 , 129 , 122 , 115,\n   108 , 102 , 96  , 91  , 86  , 81  , 77  , 72  , 68  , 64  , 61  , 57 ],\n  [1724, 1628, 1536, 1450, 1368, 1292, 1220, 1150, 1086, 1026, 968 , 914,\n   862 , 814 , 768 , 725 , 684 , 646 , 610 , 575 , 543 , 513 , 484 , 457,\n   431 , 407 , 384 , 363 , 342 , 323 , 305 , 288 , 272 , 256 , 242 , 228,\n   216 , 203 , 192 , 181 , 171 , 161 , 152 , 144 , 136 , 128 , 121 , 114,\n   108 , 101 , 96  , 90  , 85  , 80  , 76  , 72  , 68  , 64  , 60  , 57 ]];\n   \nvar SineTable = [\n  0,24,49,74,97,120,141,161,180,197,212,224,235,244,250,253,\n  255,253,250,244,235,224,212,197,180,161,141,120,97,74,49,\n  24,0,-24,-49,-74,-97,-120,-141,-161,-180,-197,-212,-224,\n  -235,-244,-250,-253,-255,-253,-250,-244,-235,-224,-212,-197,\n  -180,-161,-141,-120,-97,-74,-49,-24\n];\n\nvar ModPeriodToNoteNumber = {};\nfor (var i = 0; i < ModPeriodTable[0].length; i++) {\n  ModPeriodToNoteNumber[ModPeriodTable[0][i]] = i;\n}\n\nmodule.exports = ModPlayer;\n\n/**\n * Module Player class.\n *\n * @param {ModParser} mod \n * @param {Number} rate \n * @api public\n */\n\nfunction ModPlayer(mod, rate) {\n  /* timing calculations */\n  var ticksPerSecond = 7093789.2; /* PAL frequency */\n  var ticksPerFrame; /* calculated by setBpm */\n  var ticksPerOutputSample = Math.round(ticksPerSecond / rate);\n  var ticksSinceStartOfFrame = 0;\n  \n  function setBpm(bpm) {\n    /* x beats per minute => x*4 rows per minute */\n    ticksPerFrame = Math.round(ticksPerSecond * 2.5/bpm);\n  }\n  setBpm(125);\n  \n  /* initial player state */\n  var framesPerRow = 6;\n  var currentFrame = 0;\n  var currentPattern;\n  var currentPosition;\n  var currentRow;\n  var exLoop = false;   //whether E6x looping is currently set\n  var exLoopStart = 0;  //loop point set up by E60\n  var exLoopEnd = 0;    //end of loop (where we hit a E6x cmd) for accurate counting\n  var exLoopCount = 0;  //loops remaining\n  var doBreak = false;  //Bxx, Dxx - jump to order and pattern break\n  var breakPos = 0;\n  var breakRow = 0;\n  var delayRows = false; //EEx pattern delay.\n  \n  var channels = [];\n  for (var chan = 0; chan < mod.channelCount; chan++) {\n    channels[chan] = {\n      playing: false,\n      sample: mod.samples[0],\n      finetune: 0,\n      volume: 0,\n      pan: 0x7F,  //unimplemented\n      volumeDelta: 0,\n      periodDelta: 0,\n      fineVolumeDelta: 0,\n      finePeriodDelta: 0,\n      tonePortaTarget: 0, //target for 3xx, 5xy as period value\n      tonePortaDelta: 0,\n      tonePortaVolStep: 0, //remember pitch slide step for when 5xx is used\n      tonePortaActive: false,\n      cut: false,     //tick to cut at, or false if no cut\n      delay: false,   //tick to delay note until, or false if no delay\n      arpeggioActive: false\n    };\n  }\n  \n  function loadRow(rowNumber) {\n    currentRow = rowNumber;\n    currentFrame = 0;\n    doBreak = false;\n    breakPos = 0;\n    breakRow = 0;\n\n    for (var chan = 0; chan < mod.channelCount; chan++) {\n      var channel = channels[chan];\n      var prevNote = channel.prevNote;\n      var note = currentPattern[currentRow][chan];\n      if (channel.sampleNum == undefined) {\n          channel.sampleNum = 0;\n      }\n      if (note.period != 0 || note.sample != 0) {\n        channel.playing = true;\n        channel.samplePosition = 0;\n        channel.ticksSinceStartOfSample = 0; /* that's 'sample' as in 'individual volume reading' */\n        if (note.sample != 0) {\n          channel.sample = mod.samples[note.sample - 1];\n          channel.sampleNum = note.sample - 1;\n          channel.volume = channel.sample.volume;\n          channel.finetune = channel.sample.finetune;\n        }\n        if (note.period != 0) { // && note.effect != 0x03\n          //the note specified in a tone porta command is not actually played\n          if (note.effect != 0x03) {\n            channel.noteNumber = ModPeriodToNoteNumber[note.period];\n            channel.ticksPerSample = ModPeriodTable[channel.finetune][channel.noteNumber] * 2;\n          } else {\n            channel.noteNumber = ModPeriodToNoteNumber[prevNote.period]\n            channel.ticksPerSample = ModPeriodTable[channel.finetune][channel.noteNumber] * 2;\n          }\n        }\n      }\n      channel.finePeriodDelta = 0;\n      channel.fineVolumeDelta = 0;\n      channel.cut = false;\n      channel.delay = false;\n      channel.retrigger = false;\n      channel.tonePortaActive = false;\n      if (note.effect != 0 || note.effectParameter != 0) {\n        channel.volumeDelta = 0; /* new effects cancel volumeDelta */\n        channel.periodDelta = 0; /* new effects cancel periodDelta */\n        channel.arpeggioActive = false;\n        switch (note.effect) {\n          case 0x00: /* arpeggio: 0xy */\n            channel.arpeggioActive = true;\n            channel.arpeggioNotes = [\n              channel.noteNumber,\n              channel.noteNumber + (note.effectParameter >> 4),\n              channel.noteNumber + (note.effectParameter & 0x0f)\n            ]\n            channel.arpeggioCounter = 0;\n            break;\n          case 0x01: /* pitch slide up - 1xx */\n            channel.periodDelta = -note.effectParameter;\n            break;\n          case 0x02: /* pitch slide down - 2xx */\n            channel.periodDelta = note.effectParameter;\n            break;\n          case 0x03: /* slide to note 3xy - */\n            channel.tonePortaActive = true;\n            channel.tonePortaTarget = (note.period != 0) ? note.period : channel.tonePortaTarget;\n            var dir = (channel.tonePortaTarget < prevNote.period) ? -1 : 1;\n            channel.tonePortaDelta = (note.effectParameter * dir);\n            channel.tonePortaVolStep = (note.effectParameter * dir);\n            channel.tonePortaDir = dir;\n            break;\n          case 0x05: /* portamento to note with volume slide 5xy */\n            channel.tonePortaActive = true;\n            if (note.effectParameter & 0xf0) {\n              channel.volumeDelta = note.effectParameter >> 4;\n            } else {\n              channel.volumeDelta = -note.effectParameter;\n            }\n            channel.tonePortaDelta = channel.tonePortaVolStep;\n            break;\n          case 0x09: /* sample offset - 9xx */\n            channel.samplePosition = 256 * note.effectParameter;\n            break;\n          case 0x0A: /* volume slide - Axy */\n            if (note.effectParameter & 0xf0) {\n              /* volume increase by x */\n              channel.volumeDelta = note.effectParameter >> 4;\n            } else {\n              /* volume decrease by y */\n              channel.volumeDelta = -note.effectParameter;\n            }\n            break;\n          case 0x0B: /* jump to order */\n            doBreak = true;\n            breakPos = note.effectParameter;\n            breakRow = 0;\n            break;\n          case 0x0C: /* volume */\n            if (note.effectParameter > 64) {\n              channel.volume = 64;\n            } else {\n              channel.volume = note.effectParameter;\n            }\n            break;\n          case 0x0D: /* pattern break; jump to next pattern at specified row */\n            doBreak = true;\n            breakPos = currentPosition + 1;\n            //Row is written as DECIMAL so grab the high part as a single digit and do some math\n            breakRow = ((note.effectParameter & 0xF0) >> 4) * 10 + (note.effectParameter & 0x0F);\n            break;\n            \n          case 0x0E:\n            switch (note.extEffect) { //yes we're doing nested switch\n              case 0x01: /* fine pitch slide up - E1x */\n                channel.finePeriodDelta = -note.extEffectParameter;\n                break;\n              case 0x02: /* fine pitch slide down - E2x */\n                channel.finePeriodDelta = note.extEffectParameter;\n                break;\n              case 0x05: /* set finetune - E5x */\n                channel.finetune = note.extEffectParameter;\n                break;\n              case 0x09: /* retrigger sample - E9x */\n                channel.retrigger = note.extEffectParameter;\n                break;\n              case 0x0A: /* fine volume slide up - EAx */\n                channel.fineVolumeDelta = note.extEffectParameter;\n                break;\n              case 0x0B: /* fine volume slide down - EBx */\n                channel.fineVolumeDelta = -note.extEffectParameter;\n                break;\n              case 0x0C: /* note cute - ECx */\n                channel.cut = note.extEffectParameter;\n                break;\n              case 0x0D: /* note delay - EDx */\n                channel.delay = note.extEffectParameter;\n                break;\n              case 0x0E: /* pattern delay EEx */\n                delayRows = note.extEffectParameter;\n                break;\n              case 0x06:\n                //set loop start with E60\n                if (note.extEffectParameter == 0) {\n                  exLoopStart = currentRow;\n                } else {\n                  //set loop end with E6x\n                  exLoopEnd = currentRow;\n                  //activate the loop only if it's new\n                  if (!exLoop) {\n                    exLoop = true;\n                    exLoopCount = note.extEffectParameter;\n                  }\n                }\n                break;\n            }\n            \n            break;\n            \n          case 0x0F: /* tempo change. <=32 sets ticks/row, greater sets beats/min instead */\n            var newSpeed = (note.effectParameter == 0) ? 1 : note.effectParameter; /* 0 is treated as 1 */\n            if (newSpeed <= 32) { \n              framesPerRow = newSpeed;\n            } else {\n              setBpm(newSpeed);\n            }\n            break;\n        }\n      }\n      \n      //for figuring out tone portamento effect\n      if (note.period != 0) { channel.prevNote = note; }\n      \n      if (channel.tonePortaActive == false) {\n        channel.tonePortaDelta = 0;\n        channel.tonePortaTarget = 0;\n        channel.tonePortaVolStep = 0;\n      }\n    }\n    \n  }\n  \n  function loadPattern(patternNumber) {\n    var row = doBreak ? breakRow : 0;\n    currentPattern = mod.patterns[patternNumber];\n    loadRow(row);\n  }\n  \n  function loadPosition(positionNumber) {\n    //Handle invalid position numbers that may be passed by invalid loop points\n    positionNumber = (positionNumber > mod.positionCount - 1) ? 0 : positionNumber; \n    currentPosition = positionNumber;\n    loadPattern(mod.positions[currentPosition]);\n  }\n  \n  loadPosition(0);\n  \n  function getNextPosition() {\n    if (currentPosition + 1 >= mod.positionCount) {\n      loadPosition(mod.positionLoopPoint);\n    } else {\n      loadPosition(currentPosition + 1);\n    }\n  }\n  \n  function getNextRow() {\n    /*\n      Determine where we're gonna go based on active effect.\n      Either:\n        break (jump to new pattern),\n        do extended loop,\n        advance normally\n    */\n    if (doBreak) {\n      //Dxx commands at the end of modules are fairly common for some reason\n      //so make sure jumping past the end loops back to the start\n      breakPos = (breakPos >= mod.positionCount) ? mod.positionLoopPoint : breakPos;\n      loadPosition(breakPos);\n    } else if (exLoop && currentRow == exLoopEnd && exLoopCount > 0) {\n      //count down the loop and jump back\n      loadRow(exLoopStart);\n      exLoopCount--;\n    } else {\n      if (currentRow == 63) {\n        getNextPosition();\n      } else {\n        loadRow(currentRow + 1);\n      }\n    }\n    \n    if (exLoopCount < 0) { exLoop = false; }\n  }\n\n  function doFrame() {\n    /* apply volume/pitch slide before fetching row, because the first frame of a row does NOT\n    have the slide applied */\n\n    for (var chan = 0; chan < mod.channelCount; chan++) {\n      var channel = channels[chan];\n      var finetune = channel.finetune;\n      if (currentFrame == 0) { /* apply fine slides only once */\n        channel.ticksPerSample += channel.finePeriodDelta * 2;\n        channel.volume += channel.fineVolumeDelta;\n      }\n      channel.volume += channel.volumeDelta;\n      if (channel.volume > 64) {\n        channel.volume = 64;\n      } else if (channel.volume < 0) {\n        channel.volume = 0;\n      }\n      if (channel.cut !== false && currentFrame >= channel.cut) {\n        channel.volume = 0;\n      }\n      if (channel.delay !== false && currentFrame <= channel.delay) {\n        channel.volume = 0;\n      }\n      if (channel.retrigger !== false) {\n        //short-circuit prevents x mod 0\n        if (channel.retrigger == 0 || currentFrame % channel.retrigger == 0) { \n          channel.samplePosition = 0;\n        }\n      }\n      channel.ticksPerSample += channel.periodDelta * 2;\n      if (channel.tonePortaActive) {\n        channel.ticksPerSample += channel.tonePortaDelta * 2;\n        //don't slide below or above allowed note, depending on slide direction\n        if (channel.tonePortaDir == 1 && channel.ticksPerSample > channel.tonePortaTarget * 2) {\n          channel.ticksPerSample = channel.tonePortaTarget * 2;\n        } else if (channel.tonePortaDir == -1 && channel.ticksPerSample < channel.tonePortaTarget * 2)  {\n          channel.ticksPerSample = channel.tonePortaTarget * 2;\n        }\n      }\n      \n      if (channel.ticksPerSample > 4096) {\n        channel.ticksPerSample = 4096;\n      } else if (channel.ticksPerSample < 96) { /* equivalent to period 48, a bit higher than the highest note */\n        channel.ticksPerSample = 96;\n      }\n      if (channel.arpeggioActive) {\n        channel.arpeggioCounter++;\n        var noteNumber = channel.arpeggioNotes[channel.arpeggioCounter % 3];\n        channel.ticksPerSample = ModPeriodTable[finetune][noteNumber] * 2;\n      }\n    }\n\n    currentFrame++;\n    if (currentFrame == framesPerRow) {\n      currentFrame = 0;\n      //Don't advance to reading more rows if pattern delay effect is active\n      if (delayRows !== false) {\n        delayRows--;\n        if (delayRows < 0) { delayRows = false; }\n      } else {\n        getNextRow();\n      }\n    }\n  }\n  \n  this.process = function(L, R, sampleLength) {\n    for (var i=0; i<sampleLength; i++) {\n      ticksSinceStartOfFrame += ticksPerOutputSample;\n      while (ticksSinceStartOfFrame >= ticksPerFrame) {\n        doFrame();\n        ticksSinceStartOfFrame -= ticksPerFrame;\n      }\n      \n      leftOutputLevel = 0;\n      rightOutputLevel = 0;\n      for (var chan = 0; chan < mod.channelCount; chan++) {\n        var channel = channels[chan];\n        if (channel.playing) {\n          channel.ticksSinceStartOfSample += ticksPerOutputSample;\n          while (channel.ticksSinceStartOfSample >= channel.ticksPerSample) {\n            channel.samplePosition++;\n            if (channel.sample.repeatLength > 2 && channel.samplePosition >= channel.sample.repeatOffset + channel.sample.repeatLength) {\n              channel.samplePosition = channel.sample.repeatOffset;\n            } else if (channel.samplePosition >= channel.sample.length) {\n              channel.playing = false;\n              break;\n            } else \n            channel.ticksSinceStartOfSample -= channel.ticksPerSample;\n          }\n          if (channel.playing) {\n            \n            var rawVol = mod.sampleData[channel.sampleNum][channel.samplePosition];\n            var vol = (((rawVol + 128) & 0xff) - 128) * channel.volume; /* range (-128*64)..(127*64) */\n            if (chan & 3 == 0 || chan & 3 == 3) { /* hard panning(?): left, right, right, left */\n              leftOutputLevel += (vol + channel.pan) * 3;\n              rightOutputLevel += (vol + 0xFF - channel.pan);\n            } else {\n              leftOutputLevel += (vol + 0xFF - channel.pan)\n              rightOutputLevel += (vol + channel.pan) * 3;\n            }\n            /* range of outputlevels is 128*64*2*channelCount */\n            /* (well, it could be more for odd channel counts) */\n          }\n        }\n      }\n      \n      L[i] = leftOutputLevel / (128 * 128 * mod.channelCount);\n      R[i] = rightOutputLevel / (128 * 128 * mod.channelCount);\n    }\n  };\n}\n//@ sourceURL=mod-player/index.js"
));
require.alias("component-emitter/index.js", "mod-player/deps/emitter/index.js");
require.alias("component-emitter/index.js", "emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("stagas-audio-process/index.js", "mod-player/deps/audio-process/index.js");
require.alias("stagas-audio-process/index.js", "audio-process/index.js");

require.alias("stagas-mod-parser/index.js", "mod-player/deps/mod-parser/index.js");
require.alias("stagas-mod-parser/index.js", "mod-parser/index.js");

