(function () {var shim = function (require) {
        window.requestDraw = function () {
            return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback, element) {
                window.setTimeout(callback, 1000 / 60);
            };
        }();
    }({});
var constants = function (require) {
        var PI = Math.PI;
        return {
            CROSS: 'crosshair',
            HAND: 'pointer',
            MOVE: 'move',
            TEXT: 'text',
            WAIT: 'wait',
            HALF_PI: PI / 2,
            PI: PI,
            QUARTER_PI: PI / 4,
            TAU: PI * 2,
            TWO_PI: PI * 2,
            DEGREES: 'degrees',
            RADIANS: 'radians',
            CORNER: 'corner',
            CORNERS: 'corners',
            RADIUS: 'radius',
            RIGHT: 'right',
            LEFT: 'left',
            CENTER: 'center',
            POINTS: 'points',
            LINES: 'lines',
            TRIANGLES: 'triangles',
            TRIANGLE_FAN: 'triangles_fan',
            TRIANGLE_STRIP: 'triangles_strip',
            QUADS: 'quads',
            QUAD_STRIP: 'quad_strip',
            CLOSE: 'close',
            OPEN: 'open',
            CHORD: 'chord',
            PIE: 'pie',
            PROJECT: 'square',
            SQUARE: 'butt',
            ROUND: 'round',
            BEVEL: 'bevel',
            MITER: 'miter',
            RGB: 'rgb',
            HSB: 'hsb',
            AUTO: 'auto',
            NORMAL: 'normal',
            ITALIC: 'italic',
            BOLD: 'bold'
        };
    }({});
var core = function (require, shim, constants) {
        'use strict';
        var constants = constants;
        var P5 = function (node, sketch) {
            var self = this;
            this.startTime = new Date().getTime();
            this.preload_count = 0;
            this.isGlobal = false;
            this.frameCount = 0;
            this._frameRate = 0;
            this._lastFrameTime = 0;
            this._targetFrameRate = 60;
            this.focused = true;
            this.displayWidth = screen.width;
            this.displayHeight = screen.height;
            this.shapeKind = null;
            this.shapeInited = false;
            this.mouseX = 0;
            this.mouseY = 0;
            this.pmouseX = 0;
            this.pmouseY = 0;
            this.mouseButton = 0;
            this.key = '';
            this.keyCode = 0;
            this.keyDown = false;
            this.touchX = 0;
            this.touchY = 0;
            this.pWriters = [];
            this._textLeading = 15;
            this._textFont = 'sans-serif';
            this._textSize = 12;
            this._textStyle = constants.NORMAL;
            this.curElement = null;
            this.matrices = [[
                    1,
                    0,
                    0,
                    1,
                    0,
                    0
                ]];
            this.settings = {
                loop: true,
                fill: false,
                startTime: 0,
                updateInterval: 0,
                rectMode: constants.CORNER,
                imageMode: constants.CORNER,
                ellipseMode: constants.CENTER,
                colorMode: constants.RGB,
                mousePressed: false,
                angleMode: constants.RADIANS
            };
            this.styles = [];
            if (!sketch) {
                this.isGlobal = true;
                for (var method in P5.prototype) {
                    window[method] = P5.prototype[method].bind(this);
                }
                for (var prop in this) {
                    if (this.hasOwnProperty(prop)) {
                        window[prop] = this[prop];
                    }
                }
                for (var constant in constants) {
                    if (constants.hasOwnProperty(constant)) {
                        window[constant] = constants[constant];
                    }
                }
            } else {
                sketch(this);
            }
            if (document.readyState === 'complete') {
                this._start();
            } else {
                window.addEventListener('load', self._start.bind(self), false);
            }
        };
        P5._init = function () {
            if (window.setup && typeof window.setup === 'function') {
                new P5();
            }
        };
        P5.prototype._start = function () {
            this.createGraphics(800, 600, true);
            var preload = this.preload || window.preload;
            var context = this.isGlobal ? window : this;
            if (preload) {
                context.loadJSON = function (path) {
                    return context.preloadFunc('loadJSON', path);
                };
                context.loadStrings = function (path) {
                    return context.preloadFunc('loadStrings', path);
                };
                context.loadXML = function (path) {
                    return context.preloadFunc('loadXML', path);
                };
                context.loadImage = function (path) {
                    return context.preloadFunc('loadImage', path);
                };
                preload();
                context.loadJSON = P5.prototype.loadJSON;
                context.loadStrings = P5.prototype.loadStrings;
                context.loadXML = P5.prototype.loadXML;
                context.loadImage = P5.prototype.loadImage;
            } else {
                this._setup();
                this._runFrames();
                this._drawSketch();
            }
        };
        P5.prototype.preloadFunc = function (func, path) {
            this._setProperty('preload_count', this.preload_count + 1);
            var context = this.isGlobal ? window : this;
            return this[func](path, function (resp) {
                context._setProperty('preload_count', context.preload_count - 1);
                if (context.preload_count === 0) {
                    context._setup();
                    context._runFrames();
                    context._drawSketch();
                }
            });
        };
        P5.prototype._setup = function () {
            var setup = this.setup || window.setup;
            if (typeof setup === 'function') {
                setup();
            } else {
                throw 'sketch must include a setup function';
            }
        };
        P5.prototype._drawSketch = function () {
            var self = this;
            var now = new Date().getTime();
            self._frameRate = 1000 / (now - self._lastFrameTime);
            self._lastFrameTime = now;
            var userDraw = self.draw || window.draw;
            if (self.settings.loop) {
                setTimeout(function () {
                    window.requestDraw(self._drawSketch.bind(self));
                }, 1000 / self._targetFrameRate);
            }
            if (typeof userDraw === 'function') {
                userDraw();
            }
            self.curElement.context.setTransform(1, 0, 0, 1, 0, 0);
        };
        P5.prototype._runFrames = function () {
            var self = this;
            if (this.updateInterval) {
                clearInterval(this.updateInterval);
            }
            this.updateInterval = setInterval(function () {
                self._setProperty('frameCount', self.frameCount + 1);
            }, 1000 / self._targetFrameRate);
        };
        P5.prototype._applyDefaults = function () {
            this.curElement.context.fillStyle = '#FFFFFF';
            this.curElement.context.strokeStyle = '#000000';
            this.curElement.context.lineCap = constants.ROUND;
        };
        P5.prototype._setProperty = function (prop, value) {
            this[prop] = value;
            if (this.isGlobal) {
                window[prop] = value;
            }
        };
        return P5;
    }({}, shim, constants);
var mathpvector = function (require) {
        'use strict';
        function PVector(x, y, z) {
            this.x = x || 0;
            this.y = y || 0;
            this.z = z || 0;
        }
        PVector.prototype.set = function (x, y, z) {
            if (x instanceof PVector) {
                return this.set(x.x, x.y, x.z);
            }
            if (x instanceof Array) {
                return this.set(x[0], x[1], x[2]);
            }
            this.x = x || 0;
            this.y = y || 0;
            this.z = z || 0;
        };
        PVector.prototype.get = function () {
            return new PVector(this.x, this.y, this.z);
        };
        PVector.prototype.add = function (x, y, z) {
            if (x instanceof PVector) {
                return this.add(x.x, x.y, x.z);
            }
            if (x instanceof Array) {
                return this.add(x[0], x[1], x[2]);
            }
            this.x += x || 0;
            this.y += y || 0;
            this.z += z || 0;
            return this;
        };
        PVector.prototype.sub = function (x, y, z) {
            if (x instanceof PVector) {
                return this.sub(x.x, x.y, x.z);
            }
            if (x instanceof Array) {
                return this.sub(x[0], x[1], x[2]);
            }
            this.x -= x || 0;
            this.y -= y || 0;
            this.z -= z || 0;
            return this;
        };
        PVector.prototype.mult = function (n) {
            this.x *= n || 0;
            this.y *= n || 0;
            this.z *= n || 0;
            return this;
        };
        PVector.prototype.div = function (n) {
            this.x /= n;
            this.y /= n;
            this.z /= n;
            return this;
        };
        PVector.prototype.mag = function () {
            return Math.sqrt(this.magSq());
        };
        PVector.prototype.magSq = function () {
            var x = this.x, y = this.y, z = this.z;
            return x * x + y * y + z * z;
        };
        PVector.prototype.dot = function (x, y, z) {
            if (x instanceof PVector) {
                return this.dot(x.x, x.y, x.z);
            }
            return this.x * (x || 0) + this.y * (y || 0) + this.z * (z || 0);
        };
        PVector.prototype.cross = function (v) {
            var x = this.y * v.z - this.z * v.y;
            var y = this.z * v.x - this.x * v.z;
            var z = this.x * v.y - this.y * v.x;
            return new PVector(x, y, z);
        };
        PVector.prototype.dist = function (v) {
            var d = v.get().sub(this);
            return d.mag();
        };
        PVector.prototype.normalize = function () {
            return this.div(this.mag());
        };
        PVector.prototype.limit = function (l) {
            var mSq = this.magSq();
            if (mSq > l * l) {
                this.div(Math.sqrt(mSq));
                this.mult(l);
            }
            return this;
        };
        PVector.prototype.setMag = function (n) {
            return this.normalize().mult(n);
        };
        PVector.prototype.heading = function () {
            return Math.atan2(this.y, this.x);
        };
        PVector.prototype.rotate2D = function (a) {
            var newHeading = this.heading() + a;
            var mag = this.mag();
            this.x = Math.cos(newHeading) * mag;
            this.y = Math.sin(newHeading) * mag;
            return this;
        };
        PVector.prototype.lerp = function (x, y, z, amt) {
            if (x instanceof PVector) {
                return this.lerp(x.x, x.y, x.z, y);
            }
            this.x += (x - this.x) * amt || 0;
            this.y += (y - this.y) * amt || 0;
            this.z += (z - this.z) * amt || 0;
            return this;
        };
        PVector.prototype.array = function () {
            return [
                this.x || 0,
                this.y || 0,
                this.z || 0
            ];
        };
        PVector.fromAngle = function (angle) {
            return new PVector(Math.cos(angle), Math.sin(angle), 0);
        };
        PVector.random2D = function () {
            return this.fromAngle(Math.random(Math.PI * 2));
        };
        PVector.random3D = function () {
            var angle = Math.random() * Math.PI * 2;
            var vz = Math.random() * 2 - 1;
            var vx = Math.sqrt(1 - vz * vz) * Math.cos(angle);
            var vy = Math.sqrt(1 - vz * vz) * Math.sin(angle);
            return new PVector(vx, vy, vz);
        };
        PVector.add = function (v1, v2) {
            return v1.get().add(v2);
        };
        PVector.sub = function (v1, v2) {
            return v1.get().sub(v2);
        };
        PVector.mult = function (v, n) {
            return v.get().mult(n);
        };
        PVector.div = function (v, n) {
            return v.get().div(n);
        };
        PVector.dot = function (v1, v2) {
            return v1.dot(v2);
        };
        PVector.cross = function (v1, v2) {
            return v1.cross(v2);
        };
        PVector.dist = function (v1, v2) {
            return v1.dist(v2);
        };
        PVector.lerp = function (v1, v2, amt) {
            return v1.get().lerp(v2, amt);
        };
        PVector.angleBetween = function (v1, v2) {
            return Math.acos(v1.dot(v2) / (v1.mag() * v2.mag()));
        };
        return PVector;
    }({});
var mathcalculation = function (require, core) {
        'use strict';
        var P5 = core;
        P5.prototype.abs = Math.abs;
        P5.prototype.ceil = Math.ceil;
        P5.prototype.constrain = function (n, l, h) {
            return this.max(this.min(n, h), l);
        };
        P5.prototype.dist = function (x1, y1, x2, y2) {
            var xs = x2 - x1;
            var ys = y2 - y1;
            return Math.sqrt(xs * xs + ys * ys);
        };
        P5.prototype.exp = Math.exp;
        P5.prototype.floor = Math.floor;
        P5.prototype.lerp = function (start, stop, amt) {
            return amt * (stop - start) + start;
        };
        P5.prototype.log = Math.log;
        P5.prototype.mag = function (x, y) {
            return Math.sqrt(x * x + y * y);
        };
        P5.prototype.map = function (n, start1, stop1, start2, stop2) {
            return (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
        };
        P5.prototype.max = Math.max;
        P5.prototype.min = Math.min;
        P5.prototype.norm = function (n, start, stop) {
            return this.map(n, start, stop, 0, 1);
        };
        P5.prototype.pow = Math.pow;
        P5.prototype.round = Math.round;
        P5.prototype.sq = function (n) {
            return n * n;
        };
        P5.prototype.sqrt = Math.sqrt;
        return P5;
    }({}, core);
var colorcreating_reading = function (require, core, mathcalculation) {
        'use strict';
        var P5 = core;
        var calculation = mathcalculation;
        P5.prototype.alpha = function (rgb) {
            if (rgb.length > 3) {
                return rgb[3];
            } else {
                return 255;
            }
        };
        P5.prototype.blue = function (rgb) {
            if (rgb.length > 2) {
                return rgb[2];
            } else {
                return 0;
            }
        };
        P5.prototype.brightness = function (hsv) {
            if (hsv.length > 2) {
                return hsv[2];
            } else {
                return 0;
            }
        };
        P5.prototype.color = function () {
            return this.getNormalizedColor(arguments);
        };
        P5.prototype.green = function (rgb) {
            if (rgb.length > 2) {
                return rgb[1];
            } else {
                return 0;
            }
        };
        P5.prototype.hue = function (hsv) {
            if (hsv.length > 2) {
                return hsv[0];
            } else {
                return 0;
            }
        };
        P5.prototype.lerpColor = function (c1, c2, amt) {
            var c = [];
            for (var i = 0; i < c1.length; i++) {
                c.push(calculation.lerp(c1[i], c2[i], amt));
            }
            return c;
        };
        P5.prototype.red = function (rgb) {
            if (rgb.length > 2) {
                return rgb[0];
            } else {
                return 0;
            }
        };
        P5.prototype.saturation = function (hsv) {
            if (hsv.length > 2) {
                return hsv[1];
            } else {
                return 0;
            }
        };
        return P5;
    }({}, core, mathcalculation);
var colorsetting = function (require, core, constants) {
        'use strict';
        var P5 = core;
        var constants = constants;
        P5.prototype.background = function () {
            var c = this.getNormalizedColor(arguments);
            var curFill = this.curElement.context.fillStyle;
            this.curElement.context.fillStyle = this.getCSSRGBAColor(c);
            this.curElement.context.fillRect(0, 0, this.width, this.height);
            this.curElement.context.fillStyle = curFill;
        };
        P5.prototype.clear = function () {
            this.curElement.context.clearRect(0, 0, this.width, this.height);
        };
        P5.prototype.colorMode = function (mode) {
            if (mode === constants.RGB || mode === constants.HSB) {
                this.settings.colorMode = mode;
            }
        };
        P5.prototype.fill = function () {
            var c = this.getNormalizedColor(arguments);
            this.curElement.context.fillStyle = this.getCSSRGBAColor(c);
        };
        P5.prototype.noFill = function () {
            this.curElement.context.fillStyle = 'rgba(0,0,0,0)';
        };
        P5.prototype.noStroke = function () {
            this.curElement.context.strokeStyle = 'rgba(0,0,0,0)';
        };
        P5.prototype.stroke = function () {
            var c = this.getNormalizedColor(arguments);
            this.curElement.context.strokeStyle = this.getCSSRGBAColor(c);
        };
        P5.prototype.getNormalizedColor = function (args) {
            var r, g, b, a, rgba;
            var _args = typeof args[0].length === 'number' ? args[0] : args;
            if (_args.length >= 3) {
                r = _args[0];
                g = _args[1];
                b = _args[2];
                a = typeof _args[3] === 'number' ? _args[3] : 255;
            } else {
                r = g = b = _args[0];
                a = typeof _args[1] === 'number' ? _args[1] : 255;
            }
            if (this.settings.colorMode === constants.HSB) {
                rgba = this.hsv2rgb(r, g, b).concat(a);
            } else {
                rgba = [
                    r,
                    g,
                    b,
                    a
                ];
            }
            return rgba;
        };
        P5.prototype.hsv2rgb = function (h, s, b) {
            return [
                h,
                s,
                b
            ];
        };
        P5.prototype.getCSSRGBAColor = function (arr) {
            var a = arr.map(function (val) {
                    return Math.floor(val);
                });
            var alpha = a[3] ? a[3] / 255 : 1;
            return 'rgba(' + a[0] + ',' + a[1] + ',' + a[2] + ',' + alpha + ')';
        };
        return P5;
    }({}, core, constants);
var dataarray_functions = function (require, core) {
        'use strict';
        var P5 = core;
        P5.prototype.append = function (array, value) {
            array.push(value);
            return array;
        };
        P5.prototype.arrayCopy = function (src, srcPosition, dst, dstPosition, length) {
            if (typeof length !== 'undefined') {
                for (var i = srcPosition; i < Math.min(srcPosition + length, src.length); i++) {
                    dst[dstPosition + i] = src[i];
                }
            } else if (typeof dst !== 'undefined') {
                srcPosition = src.slice(0, Math.min(dst, src.length));
            } else {
                srcPosition = src.slice(0);
            }
        };
        P5.prototype.concat = function (list0, list1) {
            return list0.concat(list1);
        };
        P5.prototype.reverse = function (list) {
            return list.reverse();
        };
        P5.prototype.shorten = function (list) {
            list.pop();
            return list;
        };
        P5.prototype.sort = function (list, count) {
            var arr = count ? list.slice(0, Math.min(count, list.length)) : list;
            var rest = count ? list.slice(Math.min(count, list.length)) : [];
            if (typeof arr[0] === 'string') {
                arr = arr.sort();
            } else {
                arr = arr.sort(function (a, b) {
                    return a - b;
                });
            }
            return arr.concat(rest);
        };
        P5.prototype.splice = function (list, value, index) {
            return list.splice(index, 0, value);
        };
        P5.prototype.subset = function (list, start, count) {
            if (typeof count !== 'undefined') {
                return list.slice(start, start + count);
            } else {
                return list.slice(start, list.length - 1);
            }
        };
        return P5;
    }({}, core);
var datastring_functions = function (require, core) {
        'use strict';
        var P5 = core;
        P5.prototype.join = function (list, separator) {
            return list.join(separator);
        };
        P5.prototype.match = function (str, reg) {
            return str.match(reg);
        };
        P5.prototype.matchAll = function (str, reg) {
            var re = new RegExp(reg, 'g');
            var match = re.exec(str);
            var matches = [];
            while (match !== null) {
                matches.push(match);
                match = re.exec(str);
            }
            return matches;
        };
        P5.prototype.nf = function () {
            if (arguments[0] instanceof Array) {
                var a = arguments[1];
                var b = arguments[2];
                return arguments[0].map(function (x) {
                    return doNf(x, a, b);
                });
            } else {
                return doNf.apply(this, arguments);
            }
        };
        function doNf() {
            var num = arguments[0];
            var neg = num < 0;
            var n = neg ? num.toString().substring(1) : num.toString();
            var decimalInd = n.indexOf('.');
            var intPart = decimalInd !== -1 ? n.substring(0, decimalInd) : n;
            var decPart = decimalInd !== -1 ? n.substring(decimalInd + 1) : '';
            var str = neg ? '-' : '';
            if (arguments.length === 3) {
                for (var i = 0; i < arguments[1] - intPart.length; i++) {
                    str += '0';
                }
                str += intPart;
                str += '.';
                str += decPart;
                for (var j = 0; j < arguments[2] - decPart.length; j++) {
                    str += '0';
                }
                return str;
            } else {
                for (var k = 0; k < Math.max(arguments[1] - intPart.length, 0); k++) {
                    str += '0';
                }
                str += n;
                return str;
            }
        }
        P5.prototype.nfc = function () {
            if (arguments[0] instanceof Array) {
                var a = arguments[1];
                return arguments[0].map(function (x) {
                    return doNfc(x, a);
                });
            } else {
                return doNfc.apply(this, arguments);
            }
        };
        function doNfc() {
            var num = arguments[0].toString();
            var dec = num.indexOf('.');
            var rem = dec !== -1 ? num.substring(dec) : '';
            var n = dec !== -1 ? num.substring(0, dec) : num;
            n = n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            if (arguments.length > 1) {
                rem = rem.substring(0, arguments[1] + 1);
            }
            return n + rem;
        }
        P5.prototype.nfp = function () {
            var nfRes = this.nf(arguments);
            if (nfRes instanceof Array) {
                return nfRes.map(addNfp);
            } else {
                return addNfp(nfRes);
            }
        };
        function addNfp() {
            return parseFloat(arguments[0]) > 0 ? '+' + arguments[0].toString() : arguments[0].toString();
        }
        P5.prototype.nfs = function () {
            var nfRes = this.nf(arguments);
            if (nfRes instanceof Array) {
                return nfRes.map(addNfs);
            } else {
                return addNfs(nfRes);
            }
        };
        function addNfs() {
            return parseFloat(arguments[0]) > 0 ? ' ' + arguments[0].toString() : arguments[0].toString();
        }
        P5.prototype.split = function (str, delim) {
            return str.split(delim);
        };
        P5.prototype.splitTokens = function () {
            var d = arguments.length > 0 ? arguments[1] : /\s/g;
            return arguments[0].split(d).filter(function (n) {
                return n;
            });
        };
        P5.prototype.trim = function (str) {
            if (str instanceof Array) {
                return str.map(this.trim);
            } else {
                return str.trim();
            }
        };
        return P5;
    }({}, core);
var inputmouse = function (require, core, constants) {
        'use strict';
        var P5 = core;
        var constants = constants;
        P5.prototype.isMousePressed = P5.prototype.mouseIsPressed = function () {
            return this.settings.mousePressed;
        };
        P5.prototype.updateMouseCoords = function (e) {
            this._setProperty('pmouseX', this.mouseX);
            this._setProperty('pmouseY', this.mouseY);
            this._setProperty('mouseX', e.offsetX);
            this._setProperty('mouseY', e.offsetY);
            this._setProperty('pwindowMouseX', this.windowMouseX);
            this._setProperty('pwindowMouseY', this.windowMouseY);
            this._setProperty('windowMouseX', e.pageX);
            this._setProperty('windowMouseY', e.pageY);
        };
        P5.prototype.setMouseButton = function (e) {
            if (e.button === 1) {
                this._setProperty('mouseButton', constants.CENTER);
            } else if (e.button === 2) {
                this._setProperty('mouseButton', constants.RIGHT);
            } else {
                this._setProperty('mouseButton', constants.LEFT);
            }
        };
        P5.prototype.onmousemove = function (e) {
            var context = this.isGlobal ? window : this;
            this.updateMouseCoords(e);
            if (!this.isMousePressed() && typeof context.mouseMoved === 'function') {
                context.mouseMoved(e);
            }
            if (this.isMousePressed() && typeof context.mouseDragged === 'function') {
                context.mouseDragged(e);
            }
        };
        P5.prototype.onmousedown = function (e) {
            var context = this.isGlobal ? window : this;
            this.settings.mousePressed = true;
            this.setMouseButton(e);
            if (typeof context.mousePressed === 'function') {
                context.mousePressed(e);
            }
        };
        P5.prototype.onmouseup = function (e) {
            var context = this.isGlobal ? window : this;
            this.settings.mousePressed = false;
            if (typeof context.mouseReleased === 'function') {
                context.mouseReleased(e);
            }
        };
        P5.prototype.onmouseclick = function (e) {
            var context = this.isGlobal ? window : this;
            if (typeof context.mouseClicked === 'function') {
                context.mouseClicked(e);
            }
        };
        P5.prototype.onmousewheel = function (e) {
            var context = this.isGlobal ? window : this;
            if (typeof context.mouseWheel === 'function') {
                context.mouseWheel(e);
            }
        };
        return P5;
    }({}, core, constants);
var inputtouch = function (require, core) {
        'use strict';
        var P5 = core;
        P5.prototype.setTouchPoints = function (e) {
            this._setProperty('touchX', e.changedTouches[0].pageX);
            this._setProperty('touchY', e.changedTouches[0].pageY);
            var touches = [];
            for (var i = 0; i < e.changedTouches.length; i++) {
                var ct = e.changedTouches[i];
                touches[i] = {
                    x: ct.pageX,
                    y: ct.pageY
                };
            }
            this._setProperty('touches', touches);
        };
        P5.prototype.ontouchstart = function (e) {
            this.setTouchPoints(e);
            if (typeof this.touchStarted === 'function') {
                this.touchStarted(e);
            }
            var m = typeof touchMoved === 'function';
            if (m) {
                e.preventDefault();
            }
        };
        P5.prototype.ontouchmove = function (e) {
            this.setTouchPoints(e);
            if (typeof this.touchMoved === 'function') {
                this.touchMoved(e);
            }
        };
        P5.prototype.ontouchend = function (e) {
            this.setTouchPoints(e);
            if (typeof this.touchEnded === 'function') {
                this.touchEnded(e);
            }
        };
        return P5;
    }({}, core);
var dompelement = function (require, constants) {
        var constants = constants;
        function PElement(elt, pInst) {
            this.elt = elt;
            this.pInst = pInst;
            this.width = this.elt.offsetWidth;
            this.height = this.elt.offsetHeight;
            this.elt.style.position = 'absolute';
            this.x = 0;
            this.y = 0;
            this.elt.style.left = this.x + 'px';
            this.elt.style.top = this.y + 'px';
            if (elt instanceof HTMLCanvasElement) {
                this.context = elt.getContext('2d');
            }
        }
        PElement.prototype.html = function (html) {
            this.elt.innerHTML = html;
        };
        PElement.prototype.position = function (x, y) {
            this.x = x;
            this.y = y;
            this.elt.style.left = x + 'px';
            this.elt.style.top = y + 'px';
        };
        PElement.prototype.size = function (w, h) {
            var aW = w;
            var aH = h;
            var AUTO = constants.AUTO;
            if (aW !== AUTO || aH !== AUTO) {
                if (aW === AUTO) {
                    aW = h * this.elt.width / this.elt.height;
                } else if (aH === AUTO) {
                    aH = w * this.elt.height / this.elt.width;
                }
                if (this.elt instanceof HTMLCanvasElement) {
                    this.elt.setAttribute('width', aW);
                    this.elt.setAttribute('height', aH);
                } else {
                    this.elt.style.width = aW;
                    this.elt.style.height = aH;
                }
                this.width = this.elt.offsetWidth;
                this.height = this.elt.offsetHeight;
                if (this.pInst.curElement.elt === this.elt) {
                    this.pInst.width = this.elt.offsetWidth;
                    this.pInst.height = this.elt.offsetHeight;
                }
            }
        };
        PElement.prototype.style = function (s) {
            this.elt.style.cssText += s;
        };
        PElement.prototype.id = function (id) {
            this.elt.id = id;
        };
        PElement.prototype.class = function (c) {
            this.elt.className = c;
        };
        PElement.prototype.show = function () {
            this.elt.style.display = 'block';
        };
        PElement.prototype.hide = function () {
            this.elt.style.display = 'none';
        };
        PElement.prototype.mousePressed = function (fxn) {
            var _this = this;
            this.elt.addEventListener('click', function (e) {
                fxn(e, _this);
            }, false);
        };
        PElement.prototype.mouseOver = function (fxn) {
            var _this = this;
            this.elt.addEventListener('mouseover', function (e) {
                fxn(e, _this);
            }, false);
        };
        PElement.prototype.mouseOut = function (fxn) {
            var _this = this;
            this.elt.addEventListener('mouseout', function (e) {
                fxn(e, _this);
            }, false);
        };
        return PElement;
    }({}, constants);
var dommanipulate = function (require, core, inputmouse, inputtouch, dompelement) {
        var P5 = core;
        var PElement = dompelement;
        P5.prototype.createGraphics = function (w, h, isDefault, targetID) {
            var c = document.createElement('canvas');
            c.setAttribute('width', w);
            c.setAttribute('height', h);
            if (isDefault) {
                c.id = 'defaultCanvas';
                document.body.appendChild(c);
            } else {
                var defaultCanvas = document.getElementById('defaultCanvas');
                if (defaultCanvas) {
                    defaultCanvas.parentNode.removeChild(defaultCanvas);
                }
                if (targetID) {
                    var target = document.getElementById(targetID);
                    if (target) {
                        target.appendChild(c);
                    } else {
                        document.body.appendChild(c);
                    }
                } else {
                    document.body.appendChild(c);
                }
            }
            var cnv = new PElement(c, this);
            this.context(cnv);
            this._applyDefaults();
            return cnv;
        };
        P5.prototype.createHTML = function (html) {
            var elt = document.createElement('div');
            elt.innerHTML = html;
            document.body.appendChild(elt);
            var c = new PElement(elt, this);
            this.context(c);
            return c;
        };
        P5.prototype.createHTMLImage = function (src, alt) {
            var elt = document.createElement('img');
            elt.src = src;
            if (typeof alt !== 'undefined') {
                elt.alt = alt;
            }
            document.body.appendChild(elt);
            var c = new PElement(elt, this);
            this.context(c);
            return c;
        };
        P5.prototype.find = function (e) {
            var res = document.getElementById(e);
            if (res) {
                return [new PElement(res, this)];
            } else {
                res = document.getElementsByClassName(e);
                if (res) {
                    var arr = [];
                    for (var i = 0, resl = res.length; i !== resl; i++) {
                        arr.push(new PElement(res[i], this));
                    }
                    return arr;
                }
            }
            return [];
        };
        P5.prototype.context = function (e) {
            var obj;
            if (typeof e === 'string' || e instanceof String) {
                var elt = document.getElementById(e);
                obj = elt ? new PElement(elt, this) : null;
            } else {
                obj = e;
            }
            if (typeof obj !== 'undefined') {
                this.curElement = obj;
                this._setProperty('width', obj.elt.offsetWidth);
                this._setProperty('height', obj.elt.offsetHeight);
                this.curElement.onfocus = function () {
                    this.focused = true;
                };
                this.curElement.onblur = function () {
                    this.focused = false;
                };
                if (!this.isGlobal) {
                    this.curElement.context.canvas.onmousemove = this.onmousemove.bind(this);
                    this.curElement.context.canvas.onmousedown = this.onmousedown.bind(this);
                    this.curElement.context.canvas.onmouseup = this.onmouseup.bind(this);
                    this.curElement.context.canvas.onmouseclick = this.onmouseclick.bind(this);
                    this.curElement.context.canvas.onmousewheel = this.onmousewheel.bind(this);
                    this.curElement.context.canvas.onkeydown = this.onkeydown.bind(this);
                    this.curElement.context.canvas.onkeyup = this.onkeyup.bind(this);
                    this.curElement.context.canvas.onkeypress = this.onkeypress.bind(this);
                    this.curElement.context.canvas.ontouchstart = this.ontouchstart.bind(this);
                    this.curElement.context.canvas.ontouchmove = this.ontouchmove.bind(this);
                    this.curElement.context.canvas.ontouchend = this.ontouchend.bind(this);
                }
                if (typeof this.curElement.context !== 'undefined') {
                    this.curElement.context.setTransform(1, 0, 0, 1, 0, 0);
                }
            }
        };
        return P5;
    }({}, core, inputmouse, inputtouch, dompelement);
var environment = function (require, core) {
        'use strict';
        var P5 = core;
        P5.prototype.cursor = function (type) {
            this.curElement.style.cursor = type || 'auto';
        };
        P5.prototype.frameRate = function (fps) {
            if (typeof fps === 'undefined') {
                return this._frameRate;
            } else {
                this._setProperty('_targetFrameRate', fps);
                this._runFrames();
                return this;
            }
        };
        P5.prototype.getFrameRate = function () {
            return this.frameRate();
        };
        P5.prototype.setFrameRate = function (fps) {
            return this.frameRate(fps);
        };
        P5.prototype.noCursor = function () {
            this.curElement.style.cursor = 'none';
        };
        return P5;
    }({}, core);
var canvas = function (require, constants) {
        var constants = constants;
        return {
            modeAdjust: function (a, b, c, d, mode) {
                if (mode === constants.CORNER) {
                    return {
                        x: a,
                        y: b,
                        w: c,
                        h: d
                    };
                } else if (mode === constants.CORNERS) {
                    return {
                        x: a,
                        y: b,
                        w: c - a,
                        h: d - b
                    };
                } else if (mode === constants.RADIUS) {
                    return {
                        x: a - c,
                        y: b - d,
                        w: 2 * c,
                        h: 2 * d
                    };
                } else if (mode === constants.CENTER) {
                    return {
                        x: a - c * 0.5,
                        y: b - d * 0.5,
                        w: c,
                        h: d
                    };
                }
            }
        };
    }({}, constants);
var filters = function (require) {
        'use strict';
        var Filters = {};
        Filters._toPixels = function (canvas) {
            if (canvas instanceof ImageData) {
                return canvas.data;
            } else {
                return canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
            }
        };
        Filters._toImageData = function (canvas) {
            if (canvas instanceof ImageData) {
                return canvas;
            } else {
                return canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
            }
        };
        Filters._createImageData = function (width, height) {
            Filters._tmpCanvas = document.createElement('canvas');
            Filters._tmpCtx = Filters._tmpCanvas.getContext('2d');
            return this._tmpCtx.createImageData(width, height);
        };
        Filters.apply = function (canvas, func, filterParam) {
            var ctx = canvas.getContext('2d');
            var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            var newImageData = func(imageData, filterParam);
            if (newImageData instanceof ImageData) {
                ctx.putImageData(newImageData, 0, 0, 0, 0, canvas.width, canvas.height);
            } else {
                ctx.putImageData(imageData, 0, 0, 0, 0, canvas.width, canvas.height);
            }
        };
        Filters.threshold = function (canvas, level) {
            var pixels = Filters._toPixels(canvas);
            if (level === undefined) {
                level = 0.5;
            }
            var thresh = Math.floor(level * 255);
            for (var i = 0; i < pixels.length; i += 4) {
                var r = pixels[i];
                var g = pixels[i + 1];
                var b = pixels[i + 2];
                var grey = 0.2126 * r + 0.7152 * g + 0.0722 * b;
                var val;
                if (grey >= thresh) {
                    val = 255;
                } else {
                    val = 0;
                }
                pixels[i] = pixels[i + 1] = pixels[i + 2] = val;
            }
        };
        Filters.gray = function (canvas) {
            var pixels = Filters._toPixels(canvas);
            for (var i = 0; i < pixels.length; i += 4) {
                var r = pixels[i];
                var g = pixels[i + 1];
                var b = pixels[i + 2];
                var gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
                pixels[i] = pixels[i + 1] = pixels[i + 2] = gray;
            }
        };
        Filters.opaque = function (canvas) {
            var pixels = Filters._toPixels(canvas);
            for (var i = 0; i < pixels.length; i += 4) {
                pixels[i + 3] = 255;
            }
            return pixels;
        };
        Filters.invert = function (canvas) {
            var pixels = Filters._toPixels(canvas);
            for (var i = 0; i < pixels.length; i += 4) {
                pixels[i] = 255 - pixels[i];
                pixels[i + 1] = 255 - pixels[i + 1];
                pixels[i + 2] = 255 - pixels[i + 2];
            }
        };
        Filters.posterize = function (canvas, level) {
            var pixels = Filters._toPixels(canvas);
            if (level < 2 || level > 255) {
                throw new Error('Level must be greater than 2 and less than 255 for posterize');
            }
            var levels1 = level - 1;
            for (var i = 0; i < pixels.length; i++) {
                var rlevel = pixels[i] >> 16 & 255;
                var glevel = pixels[i] >> 8 & 255;
                var blevel = pixels[i] & 255;
                rlevel = (rlevel * level >> 8) * 255 / levels1;
                glevel = (glevel * level >> 8) * 255 / levels1;
                blevel = (blevel * level >> 8) * 255 / levels1;
                pixels[i] = 4278190080 & pixels[i] | rlevel << 16 | glevel << 8 | blevel;
            }
        };
        return Filters;
    }({});
var image = function (require, core, canvas, constants, filters) {
        'use strict';
        var P5 = core;
        var canvas = canvas;
        var constants = constants;
        var Filters = filters;
        P5.prototype.createImage = function (width, height) {
            return new PImage(width, height, this);
        };
        P5.prototype.loadImage = function (path, callback) {
            var img = new Image();
            var pImg = new PImage(1, 1, this);
            img.onload = function () {
                pImg.width = pImg.canvas.width = img.width;
                pImg.height = pImg.canvas.height = img.height;
                pImg.canvas.getContext('2d').drawImage(img, 0, 0);
                if (typeof callback !== 'undefined') {
                    callback(pImg);
                }
            };
            img.crossOrigin = 'Anonymous';
            img.src = path;
            return pImg;
        };
        P5.prototype.image = function (image, x, y, width, height) {
            if (width === undefined) {
                width = image.width;
            }
            if (height === undefined) {
                height = image.height;
            }
            var vals = canvas.modeAdjust(x, y, width, height, this.settings.imageMode);
            this.curElement.context.drawImage(image.canvas, vals.x, vals.y, vals.w, vals.h);
        };
        P5.prototype.imageMode = function (m) {
            if (m === constants.CORNER || m === constants.CORNERS || m === constants.CENTER) {
                this.settings.imageMode = m;
            }
        };
        function PImage(width, height, pInst) {
            this.width = width;
            this.height = height;
            this.pInst = pInst;
            this.canvas = document.createElement('canvas');
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            this.pixels = [];
        }
        PImage.prototype.loadPixels = function () {
            var x = 0;
            var y = 0;
            var w = this.width;
            var h = this.height;
            var imageData = this.canvas.getContext('2d').getImageData(x, y, w, h);
            var data = imageData.data;
            var pixels = [];
            for (var i = 0; i < data.length; i += 4) {
                pixels.push([
                    data[i],
                    data[i + 1],
                    data[i + 2],
                    data[i + 3]
                ]);
            }
            this.pixels = pixels;
        };
        PImage.prototype.updatePixels = function (x, y, w, h) {
            if (x === undefined && y === undefined && w === undefined && h === undefined) {
                x = 0;
                y = 0;
                w = this.width;
                h = this.height;
            }
            var imageData = this.canvas.getContext('2d').getImageData(x, y, w, h);
            var data = imageData.data;
            for (var i = 0; i < this.pixels.length; i += 1) {
                var j = i * 4;
                data[j] = this.pixels[i][0];
                data[j + 1] = this.pixels[i][1];
                data[j + 2] = this.pixels[i][2];
                data[j + 3] = this.pixels[i][3];
            }
            this.canvas.getContext('2d').putImageData(imageData, x, y, 0, 0, w, h);
        };
        PImage.prototype.get = function (x, y, w, h) {
            if (x === undefined && y === undefined && w === undefined && h === undefined) {
                x = 0;
                y = 0;
                w = this.width;
                h = this.height;
            } else if (w === undefined && h === undefined) {
                w = 1;
                h = 1;
            }
            if (x > this.width || y > this.height) {
                return undefined;
            }
            var imageData = this.canvas.getContext('2d').getImageData(x, y, w, h);
            var data = imageData.data;
            if (w === 1 && h === 1) {
                var pixels = [];
                for (var i = 0; i < data.length; i += 4) {
                    pixels.push(data[i], data[i + 1], data[i + 2], data[i + 3]);
                }
                return pixels;
            } else {
                w = Math.min(w, this.width);
                h = Math.min(h, this.height);
                var region = new PImage(w, h, this.pInst);
                region.canvas.getContext('2d').putImageData(imageData, 0, 0, 0, 0, w, h);
                return region;
            }
        };
        PImage.prototype.set = function (x, y, imgOrCol) {
            var idx = y * this.width + x;
            if (imgOrCol instanceof Array) {
                if (idx < this.pixels.length) {
                    this.pixels[idx] = imgOrCol;
                    this.updatePixels();
                }
            } else {
                this.canvas.getContext('2d').drawImage(imgOrCol.canvas, 0, 0);
                this.loadPixels();
            }
        };
        PImage.prototype.resize = function (width, height) {
            var tempCanvas = document.createElement('canvas');
            tempCanvas.width = width;
            tempCanvas.height = height;
            tempCanvas.getContext('2d').drawImage(this.canvas, 0, 0, this.canvas.width, this.canvas.height, 0, 0, tempCanvas.width, tempCanvas.width);
            this.canvas.width = this.width = width;
            this.canvas.height = this.height = height;
            this.canvas.getContext('2d').drawImage(tempCanvas, 0, 0, width, height, 0, 0, width, height);
            if (this.pixels.length > 0) {
                this.loadPixels();
            }
        };
        PImage.prototype.copy = function () {
            var srcImage, sx, sy, sw, sh, dx, dy, dw, dh;
            if (arguments.length === 9) {
                srcImage = arguments[0];
                sx = arguments[1];
                sy = arguments[2];
                sw = arguments[3];
                sh = arguments[4];
                dx = arguments[5];
                dy = arguments[6];
                dw = arguments[7];
                dh = arguments[8];
            } else if (arguments.length === 8) {
                sx = arguments[0];
                sy = arguments[1];
                sw = arguments[2];
                sh = arguments[3];
                dx = arguments[4];
                dy = arguments[5];
                dw = arguments[6];
                dh = arguments[7];
                srcImage = this;
            } else {
                throw new Error('Signature not supported');
            }
            this.canvas.getContext('2d').drawImage(srcImage.canvas, sx, sy, sw, sh, dx, dy, dw, dh);
        };
        PImage.prototype.mask = function (pImage) {
            if (pImage === undefined) {
                pImage = this;
            }
            var currBlend = this.canvas.getContext('2d').globalCompositeOperation;
            var copyArgs = [
                    pImage,
                    0,
                    0,
                    pImage.width,
                    pImage.height,
                    0,
                    0,
                    this.width,
                    this.height
                ];
            this.canvas.getContext('2d').globalCompositeOperation = 'destination-out';
            this.copy.apply(this, copyArgs);
            this.canvas.getContext('2d').globalCompositeOperation = currBlend;
        };
        PImage.prototype.filter = function (operation, value) {
            Filters.apply(this.canvas, Filters[operation.toLowerCase()], value);
        };
        PImage.prototype.blend = function () {
            var currBlend = this.canvas.getContext('2d').globalCompositeOperation;
            var blendMode = arguments[arguments.length - 1];
            var copyArgs = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
            this.canvas.getContext('2d').globalCompositeOperation = blendMode;
            this.copy.apply(this, copyArgs);
            this.canvas.getContext('2d').globalCompositeOperation = currBlend;
        };
        PImage.prototype.save = function (extension) {
            var mimeType;
            switch (extension.toLowerCase()) {
            case 'png':
                mimeType = 'image/png';
                break;
            case 'jpeg':
                mimeType = 'image/jpeg';
                break;
            case 'jpg':
                mimeType = 'image/jpeg';
                break;
            default:
                mimeType = 'image/png';
                break;
            }
            if (mimeType !== undefined) {
                var downloadMime = 'image/octet-stream';
                var imageData = this.canvas.toDataURL(mimeType);
                imageData = imageData.replace(mimeType, downloadMime);
                window.location.href = imageData;
            }
        };
        return PImage;
    }({}, core, canvas, constants, filters);
var imageloading_displaying = function (require, core) {
        'use strict';
        var P5 = core;
        P5.prototype.blend = function () {
        };
        P5.prototype.copy = function () {
        };
        P5.prototype.filter = function () {
        };
        P5.prototype.get = function (x, y) {
            var width = this.width;
            var height = this.height;
            var pix = this.curElement.context.getImageData(0, 0, width, height).data;
            if (typeof x !== 'undefined' && typeof y !== 'undefined') {
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    var offset = 4 * y * width + 4 * x;
                    var c = [
                            pix[offset],
                            pix[offset + 1],
                            pix[offset + 2],
                            pix[offset + 3]
                        ];
                    return c;
                } else {
                    return [
                        0,
                        0,
                        0,
                        255
                    ];
                }
            } else {
                return [
                    0,
                    0,
                    0,
                    255
                ];
            }
        };
        P5.prototype.loadPixels = function () {
            var width = this.width;
            var height = this.height;
            var a = this.curElement.context.getImageData(0, 0, width, height).data;
            var pixels = [];
            for (var i = 0; i < a.length; i += 4) {
                pixels.push([
                    a[i],
                    a[i + 1],
                    a[i + 2],
                    a[i + 3]
                ]);
            }
            this._setProperty('pixels', pixels);
        };
        P5.prototype.set = function () {
        };
        P5.prototype.updatePixels = function () {
        };
        return P5;
    }({}, core);
!function (name, context, definition) {
    if (typeof module != 'undefined' && module.exports)
        module.exports = definition();
    else if (typeof define == 'function' && define.amd)
        define('reqwest', definition);
    else
        context[name] = definition();
}('reqwest', this, function () {
    var win = window, doc = document, twoHundo = /^(20\d|1223)$/, byTag = 'getElementsByTagName', readyState = 'readyState', contentType = 'Content-Type', requestedWith = 'X-Requested-With', head = doc[byTag]('head')[0], uniqid = 0, callbackPrefix = 'reqwest_' + +new Date(), lastValue, xmlHttpRequest = 'XMLHttpRequest', xDomainRequest = 'XDomainRequest', noop = function () {
        }, isArray = typeof Array.isArray == 'function' ? Array.isArray : function (a) {
            return a instanceof Array;
        }, defaultHeaders = {
            'contentType': 'application/x-www-form-urlencoded',
            'requestedWith': xmlHttpRequest,
            'accept': {
                '*': 'text/javascript, text/html, application/xml, text/xml, */*',
                'xml': 'application/xml, text/xml',
                'html': 'text/html',
                'text': 'text/plain',
                'json': 'application/json, text/javascript',
                'js': 'application/javascript, text/javascript'
            }
        }, xhr = function (o) {
            if (o['crossOrigin'] === true) {
                var xhr = win[xmlHttpRequest] ? new XMLHttpRequest() : null;
                if (xhr && 'withCredentials' in xhr) {
                    return xhr;
                } else if (win[xDomainRequest]) {
                    return new XDomainRequest();
                } else {
                    throw new Error('Browser does not support cross-origin requests');
                }
            } else if (win[xmlHttpRequest]) {
                return new XMLHttpRequest();
            } else {
                return new ActiveXObject('Microsoft.XMLHTTP');
            }
        }, globalSetupOptions = {
            dataFilter: function (data) {
                return data;
            }
        };
    function handleReadyState(r, success, error) {
        return function () {
            if (r._aborted)
                return error(r.request);
            if (r.request && r.request[readyState] == 4) {
                r.request.onreadystatechange = noop;
                if (twoHundo.test(r.request.status))
                    success(r.request);
                else
                    error(r.request);
            }
        };
    }
    function setHeaders(http, o) {
        var headers = o['headers'] || {}, h;
        headers['Accept'] = headers['Accept'] || defaultHeaders['accept'][o['type']] || defaultHeaders['accept']['*'];
        if (!o['crossOrigin'] && !headers[requestedWith])
            headers[requestedWith] = defaultHeaders['requestedWith'];
        if (!headers[contentType])
            headers[contentType] = o['contentType'] || defaultHeaders['contentType'];
        for (h in headers)
            headers.hasOwnProperty(h) && 'setRequestHeader' in http && http.setRequestHeader(h, headers[h]);
    }
    function setCredentials(http, o) {
        if (typeof o['withCredentials'] !== 'undefined' && typeof http.withCredentials !== 'undefined') {
            http.withCredentials = !!o['withCredentials'];
        }
    }
    function generalCallback(data) {
        lastValue = data;
    }
    function urlappend(url, s) {
        return url + (/\?/.test(url) ? '&' : '?') + s;
    }
    function handleJsonp(o, fn, err, url) {
        var reqId = uniqid++, cbkey = o['jsonpCallback'] || 'callback', cbval = o['jsonpCallbackName'] || reqwest.getcallbackPrefix(reqId), cbreg = new RegExp('((^|\\?|&)' + cbkey + ')=([^&]+)'), match = url.match(cbreg), script = doc.createElement('script'), loaded = 0, isIE10 = navigator.userAgent.indexOf('MSIE 10.0') !== -1;
        if (match) {
            if (match[3] === '?') {
                url = url.replace(cbreg, '$1=' + cbval);
            } else {
                cbval = match[3];
            }
        } else {
            url = urlappend(url, cbkey + '=' + cbval);
        }
        win[cbval] = generalCallback;
        script.type = 'text/javascript';
        script.src = url;
        script.async = true;
        if (typeof script.onreadystatechange !== 'undefined' && !isIE10) {
            script.event = 'onclick';
            script.htmlFor = script.id = '_reqwest_' + reqId;
        }
        script.onload = script.onreadystatechange = function () {
            if (script[readyState] && script[readyState] !== 'complete' && script[readyState] !== 'loaded' || loaded) {
                return false;
            }
            script.onload = script.onreadystatechange = null;
            script.onclick && script.onclick();
            fn(lastValue);
            lastValue = undefined;
            head.removeChild(script);
            loaded = 1;
        };
        head.appendChild(script);
        return {
            abort: function () {
                script.onload = script.onreadystatechange = null;
                err({}, 'Request is aborted: timeout', {});
                lastValue = undefined;
                head.removeChild(script);
                loaded = 1;
            }
        };
    }
    function getRequest(fn, err) {
        var o = this.o, method = (o['method'] || 'GET').toUpperCase(), url = typeof o === 'string' ? o : o['url'], data = o['processData'] !== false && o['data'] && typeof o['data'] !== 'string' ? reqwest.toQueryString(o['data']) : o['data'] || null, http, sendWait = false;
        if ((o['type'] == 'jsonp' || method == 'GET') && data) {
            url = urlappend(url, data);
            data = null;
        }
        if (o['type'] == 'jsonp')
            return handleJsonp(o, fn, err, url);
        http = o.xhr && o.xhr(o) || xhr(o);
        http.open(method, url, o['async'] === false ? false : true);
        setHeaders(http, o);
        setCredentials(http, o);
        if (win[xDomainRequest] && http instanceof win[xDomainRequest]) {
            http.onload = fn;
            http.onerror = err;
            http.onprogress = function () {
            };
            sendWait = true;
        } else {
            http.onreadystatechange = handleReadyState(this, fn, err);
        }
        o['before'] && o['before'](http);
        if (sendWait) {
            setTimeout(function () {
                http.send(data);
            }, 200);
        } else {
            http.send(data);
        }
        return http;
    }
    function Reqwest(o, fn) {
        this.o = o;
        this.fn = fn;
        init.apply(this, arguments);
    }
    function setType(url) {
        var m = url.match(/\.(json|jsonp|html|xml)(\?|$)/);
        return m ? m[1] : 'js';
    }
    function init(o, fn) {
        this.url = typeof o == 'string' ? o : o['url'];
        this.timeout = null;
        this._fulfilled = false;
        this._successHandler = function () {
        };
        this._fulfillmentHandlers = [];
        this._errorHandlers = [];
        this._completeHandlers = [];
        this._erred = false;
        this._responseArgs = {};
        var self = this, type = o['type'] || setType(this.url);
        fn = fn || function () {
        };
        if (o['timeout']) {
            this.timeout = setTimeout(function () {
                self.abort();
            }, o['timeout']);
        }
        if (o['success']) {
            this._successHandler = function () {
                o['success'].apply(o, arguments);
            };
        }
        if (o['error']) {
            this._errorHandlers.push(function () {
                o['error'].apply(o, arguments);
            });
        }
        if (o['complete']) {
            this._completeHandlers.push(function () {
                o['complete'].apply(o, arguments);
            });
        }
        function complete(resp) {
            o['timeout'] && clearTimeout(self.timeout);
            self.timeout = null;
            while (self._completeHandlers.length > 0) {
                self._completeHandlers.shift()(resp);
            }
        }
        function success(resp) {
            resp = type !== 'jsonp' ? self.request : resp;
            var filteredResponse = globalSetupOptions.dataFilter(resp.responseText, type), r = filteredResponse;
            try {
                resp.responseText = r;
            } catch (e) {
            }
            if (r) {
                switch (type) {
                case 'json':
                    try {
                        resp = win.JSON ? win.JSON.parse(r) : eval('(' + r + ')');
                    } catch (err) {
                        return error(resp, 'Could not parse JSON in response', err);
                    }
                    break;
                case 'js':
                    resp = eval(r);
                    break;
                case 'html':
                    resp = r;
                    break;
                case 'xml':
                    resp = resp.responseXML && resp.responseXML.parseError && resp.responseXML.parseError.errorCode && resp.responseXML.parseError.reason ? null : resp.responseXML;
                    break;
                }
            }
            self._responseArgs.resp = resp;
            self._fulfilled = true;
            fn(resp);
            self._successHandler(resp);
            while (self._fulfillmentHandlers.length > 0) {
                resp = self._fulfillmentHandlers.shift()(resp);
            }
            complete(resp);
        }
        function error(resp, msg, t) {
            resp = self.request;
            self._responseArgs.resp = resp;
            self._responseArgs.msg = msg;
            self._responseArgs.t = t;
            self._erred = true;
            while (self._errorHandlers.length > 0) {
                self._errorHandlers.shift()(resp, msg, t);
            }
            complete(resp);
        }
        this.request = getRequest.call(this, success, error);
    }
    Reqwest.prototype = {
        abort: function () {
            this._aborted = true;
            this.request.abort();
        },
        retry: function () {
            init.call(this, this.o, this.fn);
        },
        then: function (success, fail) {
            success = success || function () {
            };
            fail = fail || function () {
            };
            if (this._fulfilled) {
                this._responseArgs.resp = success(this._responseArgs.resp);
            } else if (this._erred) {
                fail(this._responseArgs.resp, this._responseArgs.msg, this._responseArgs.t);
            } else {
                this._fulfillmentHandlers.push(success);
                this._errorHandlers.push(fail);
            }
            return this;
        },
        always: function (fn) {
            if (this._fulfilled || this._erred) {
                fn(this._responseArgs.resp);
            } else {
                this._completeHandlers.push(fn);
            }
            return this;
        },
        fail: function (fn) {
            if (this._erred) {
                fn(this._responseArgs.resp, this._responseArgs.msg, this._responseArgs.t);
            } else {
                this._errorHandlers.push(fn);
            }
            return this;
        }
    };
    function reqwest(o, fn) {
        return new Reqwest(o, fn);
    }
    function normalize(s) {
        return s ? s.replace(/\r?\n/g, '\r\n') : '';
    }
    function serial(el, cb) {
        var n = el.name, t = el.tagName.toLowerCase(), optCb = function (o) {
                if (o && !o['disabled'])
                    cb(n, normalize(o['attributes']['value'] && o['attributes']['value']['specified'] ? o['value'] : o['text']));
            }, ch, ra, val, i;
        if (el.disabled || !n)
            return;
        switch (t) {
        case 'input':
            if (!/reset|button|image|file/i.test(el.type)) {
                ch = /checkbox/i.test(el.type);
                ra = /radio/i.test(el.type);
                val = el.value;
                (!(ch || ra) || el.checked) && cb(n, normalize(ch && val === '' ? 'on' : val));
            }
            break;
        case 'textarea':
            cb(n, normalize(el.value));
            break;
        case 'select':
            if (el.type.toLowerCase() === 'select-one') {
                optCb(el.selectedIndex >= 0 ? el.options[el.selectedIndex] : null);
            } else {
                for (i = 0; el.length && i < el.length; i++) {
                    el.options[i].selected && optCb(el.options[i]);
                }
            }
            break;
        }
    }
    function eachFormElement() {
        var cb = this, e, i, serializeSubtags = function (e, tags) {
                var i, j, fa;
                for (i = 0; i < tags.length; i++) {
                    fa = e[byTag](tags[i]);
                    for (j = 0; j < fa.length; j++)
                        serial(fa[j], cb);
                }
            };
        for (i = 0; i < arguments.length; i++) {
            e = arguments[i];
            if (/input|select|textarea/i.test(e.tagName))
                serial(e, cb);
            serializeSubtags(e, [
                'input',
                'select',
                'textarea'
            ]);
        }
    }
    function serializeQueryString() {
        return reqwest.toQueryString(reqwest.serializeArray.apply(null, arguments));
    }
    function serializeHash() {
        var hash = {};
        eachFormElement.apply(function (name, value) {
            if (name in hash) {
                hash[name] && !isArray(hash[name]) && (hash[name] = [hash[name]]);
                hash[name].push(value);
            } else
                hash[name] = value;
        }, arguments);
        return hash;
    }
    reqwest.serializeArray = function () {
        var arr = [];
        eachFormElement.apply(function (name, value) {
            arr.push({
                name: name,
                value: value
            });
        }, arguments);
        return arr;
    };
    reqwest.serialize = function () {
        if (arguments.length === 0)
            return '';
        var opt, fn, args = Array.prototype.slice.call(arguments, 0);
        opt = args.pop();
        opt && opt.nodeType && args.push(opt) && (opt = null);
        opt && (opt = opt.type);
        if (opt == 'map')
            fn = serializeHash;
        else if (opt == 'array')
            fn = reqwest.serializeArray;
        else
            fn = serializeQueryString;
        return fn.apply(null, args);
    };
    reqwest.toQueryString = function (o, trad) {
        var prefix, i, traditional = trad || false, s = [], enc = encodeURIComponent, add = function (key, value) {
                value = 'function' === typeof value ? value() : value == null ? '' : value;
                s[s.length] = enc(key) + '=' + enc(value);
            };
        if (isArray(o)) {
            for (i = 0; o && i < o.length; i++)
                add(o[i]['name'], o[i]['value']);
        } else {
            for (prefix in o) {
                if (o.hasOwnProperty(prefix))
                    buildParams(prefix, o[prefix], traditional, add);
            }
        }
        return s.join('&').replace(/%20/g, '+');
    };
    function buildParams(prefix, obj, traditional, add) {
        var name, i, v, rbracket = /\[\]$/;
        if (isArray(obj)) {
            for (i = 0; obj && i < obj.length; i++) {
                v = obj[i];
                if (traditional || rbracket.test(prefix)) {
                    add(prefix, v);
                } else {
                    buildParams(prefix + '[' + (typeof v === 'object' ? i : '') + ']', v, traditional, add);
                }
            }
        } else if (obj && obj.toString() === '[object Object]') {
            for (name in obj) {
                buildParams(prefix + '[' + name + ']', obj[name], traditional, add);
            }
        } else {
            add(prefix, obj);
        }
    }
    reqwest.getcallbackPrefix = function () {
        return callbackPrefix;
    };
    reqwest.compat = function (o, fn) {
        if (o) {
            o['type'] && (o['method'] = o['type']) && delete o['type'];
            o['dataType'] && (o['type'] = o['dataType']);
            o['jsonpCallback'] && (o['jsonpCallbackName'] = o['jsonpCallback']) && delete o['jsonpCallback'];
            o['jsonp'] && (o['jsonpCallback'] = o['jsonp']);
        }
        return new Reqwest(o, fn);
    };
    reqwest.ajaxSetup = function (options) {
        options = options || {};
        for (var k in options) {
            globalSetupOptions[k] = options[k];
        }
    };
    return reqwest;
});
var inputfiles = function (require, core, reqwest) {
        'use strict';
        var P5 = core;
        var reqwest = reqwest;
        P5.prototype.createInput = function () {
        };
        P5.prototype.createReader = function () {
        };
        P5.prototype.loadBytes = function () {
        };
        P5.prototype.loadJSON = function (path, callback) {
            var ret = [];
            var t = path.indexOf('http') === -1 ? 'json' : 'jsonp';
            reqwest({
                url: path,
                type: t,
                success: function (resp) {
                    for (var k in resp) {
                        ret[k] = resp[k];
                    }
                    if (typeof callback !== 'undefined') {
                        callback(ret);
                    }
                }
            });
        };
        P5.prototype.loadStrings = function (path, callback) {
            var ret = [];
            var req = new XMLHttpRequest();
            req.open('GET', path, true);
            req.onreadystatechange = function () {
                if (req.readyState === 4 && (req.status === 200 || req.status === 0)) {
                    var arr = req.responseText.match(/[^\r\n]+/g);
                    for (var k in arr) {
                        ret[k] = arr[k];
                    }
                    if (typeof callback !== 'undefined') {
                        callback(ret);
                    }
                }
            };
            req.send(null);
        };
        P5.prototype.loadTable = function () {
        };
        P5.prototype.loadXML = function (path, callback) {
            var ret = [];
            var self = this;
            self.temp = [];
            reqwest(path, function (resp) {
                self.log(resp);
                self.temp = resp;
                ret[0] = resp;
                if (typeof callback !== 'undefined') {
                    callback(ret);
                }
            });
        };
        P5.prototype.open = function () {
        };
        P5.prototype.parseXML = function () {
        };
        P5.prototype.saveTable = function () {
        };
        P5.prototype.selectFolder = function () {
        };
        P5.prototype.selectInput = function () {
        };
        return P5;
    }({}, core, reqwest);
var inputkeyboard = function (require, core) {
        'use strict';
        var P5 = core;
        P5.prototype.isKeyPressed = P5.prototype.keyIsPressed = function () {
            return this.keyDown;
        };
        P5.prototype.onkeydown = function (e) {
            var keyPressed = this.keyPressed || window.keyPressed;
            this._setProperty('keyDown', true);
            this._setProperty('keyCode', e.keyCode);
            this._setProperty('key', String.fromCharCode(e.keyCode));
            if (typeof keyPressed === 'function') {
                keyPressed(e);
            }
        };
        P5.prototype.onkeyup = function (e) {
            var keyReleased = this.keyReleased || window.keyReleased;
            this._setProperty('keyDown', false);
            if (typeof keyReleased === 'function') {
                keyReleased(e);
            }
        };
        P5.prototype.onkeypress = function (e) {
            var keyTyped = this.keyTyped || window.keyTyped;
            if (typeof keyTyped === 'function') {
                keyTyped(e);
            }
        };
        return P5;
    }({}, core);
var inputtime_date = function (require, core) {
        'use strict';
        var P5 = core;
        P5.prototype.day = function () {
            return new Date().getDate();
        };
        P5.prototype.hour = function () {
            return new Date().getHours();
        };
        P5.prototype.minute = function () {
            return new Date().getMinutes();
        };
        P5.prototype.millis = function () {
            return new Date().getTime() - this.startTime;
        };
        P5.prototype.month = function () {
            return new Date().getMonth();
        };
        P5.prototype.second = function () {
            return new Date().getSeconds();
        };
        P5.prototype.year = function () {
            return new Date().getFullYear();
        };
        return P5;
    }({}, core);
var mathrandom = function (require, core) {
        'use strict';
        var P5 = core;
        P5.prototype.random = function (x, y) {
            if (typeof x !== 'undefined' && typeof y !== 'undefined') {
                return (y - x) * Math.random() + x;
            } else if (typeof x !== 'undefined') {
                return x * Math.random();
            } else {
                return Math.random();
            }
        };
        return P5;
    }({}, core);
var polargeometry = function (require) {
        return {
            degreesToRadians: function (x) {
                return 2 * Math.PI * x / 360;
            },
            radiansToDegrees: function (x) {
                return 360 * x / (2 * Math.PI);
            }
        };
    }({});
var mathtrigonometry = function (require, core, polargeometry, constants) {
        'use strict';
        var P5 = core;
        var polarGeometry = polargeometry;
        var constants = constants;
        P5.prototype.acos = Math.acos;
        P5.prototype.asin = Math.asin;
        P5.prototype.atan = Math.atan;
        P5.prototype.atan2 = Math.atan2;
        P5.prototype.cos = function (x) {
            return Math.cos(this.radians(x));
        };
        P5.prototype.degrees = function (angle) {
            return this.settings.angleMode === constants.DEGREES ? angle : polarGeometry.radiansToDegrees(angle);
        };
        P5.prototype.radians = function (angle) {
            return this.settings.angleMode === constants.RADIANS ? angle : polarGeometry.degreesToRadians(angle);
        };
        P5.prototype.sin = function (x) {
            return Math.sin(this.radians(x));
        };
        P5.prototype.tan = function (x) {
            return Math.tan(this.radians(x));
        };
        P5.prototype.angleMode = function (mode) {
            if (mode === constants.DEGREES || mode === constants.RADIANS) {
                this.settings.angleMode = mode;
            }
        };
        return P5;
    }({}, core, polargeometry, constants);
var outputfiles = function (require, core) {
        'use strict';
        var P5 = core;
        P5.prototype.beginRaw = function () {
        };
        P5.prototype.beginRecord = function () {
        };
        P5.prototype.createOutput = function () {
        };
        P5.prototype.createWriter = function (name) {
            if (this.pWriters.indexOf(name) === -1) {
                this.pWriters.name = new this.PrintWriter(name);
            }
        };
        P5.prototype.endRaw = function () {
        };
        P5.prototype.endRecord = function () {
        };
        P5.prototype.escape = function (content) {
            return content;
        };
        P5.prototype.PrintWriter = function (name) {
            this.name = name;
            this.content = '';
            this.print = function (data) {
                this.content += data;
            };
            this.println = function (data) {
                this.content += data + '\n';
            };
            this.flush = function () {
                this.content = '';
            };
            this.close = function () {
                this.writeFile(this.content);
            };
        };
        P5.prototype.saveBytes = function () {
        };
        P5.prototype.saveJSONArray = function () {
        };
        P5.prototype.saveJSONObject = function () {
        };
        P5.prototype.saveStream = function () {
        };
        P5.prototype.saveStrings = function (list) {
            this.writeFile(list.join('\n'));
        };
        P5.prototype.saveXML = function () {
        };
        P5.prototype.selectOutput = function () {
        };
        P5.prototype.writeFile = function (content) {
            this.open('data:text/json;charset=utf-8,' + this.escape(content), 'download');
        };
        return P5;
    }({}, core);
var outputimage = function (require, core) {
        'use strict';
        var P5 = core;
        P5.prototype.save = function () {
            this.open(this.curElement.elt.toDataURL('image/png'));
        };
        return P5;
    }({}, core);
var log = function (require, core) {
        'use strict';
        var P5 = core;
        P5.prototype.log = function () {
            if (window.console && console.log) {
                console.log.apply(console, arguments);
            }
        };
        return P5;
    }({}, core);
var outputtext_area = function (require, core, log) {
        'use strict';
        var P5 = core;
        P5.prototype.print = P5.prototype.log;
        P5.prototype.println = P5.prototype.log;
        return P5;
    }({}, core, log);
var shape2d_primitives = function (require, core, canvas, constants) {
        'use strict';
        var P5 = core;
        var canvas = canvas;
        var constants = constants;
        P5.prototype.arc = function () {
        };
        P5.prototype.ellipse = function (a, b, c, d) {
            var vals = canvas.modeAdjust(a, b, c, d, this.settings.ellipseMode);
            var kappa = 0.5522848, ox = vals.w / 2 * kappa, oy = vals.h / 2 * kappa, xe = vals.x + vals.w, ye = vals.y + vals.h, xm = vals.x + vals.w / 2, ym = vals.y + vals.h / 2;
            this.curElement.context.beginPath();
            this.curElement.context.moveTo(vals.x, ym);
            this.curElement.context.bezierCurveTo(vals.x, ym - oy, xm - ox, vals.y, xm, vals.y);
            this.curElement.context.bezierCurveTo(xm + ox, vals.y, xe, ym - oy, xe, ym);
            this.curElement.context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
            this.curElement.context.bezierCurveTo(xm - ox, ye, vals.x, ym + oy, vals.x, ym);
            this.curElement.context.closePath();
            this.curElement.context.fill();
            this.curElement.context.stroke();
            return this;
        };
        P5.prototype.line = function (x1, y1, x2, y2) {
            if (this.curElement.context.strokeStyle === 'rgba(0,0,0,0)') {
                return;
            }
            this.curElement.context.beginPath();
            this.curElement.context.moveTo(x1, y1);
            this.curElement.context.lineTo(x2, y2);
            this.curElement.context.stroke();
            return this;
        };
        P5.prototype.point = function (x, y) {
            var s = this.curElement.context.strokeStyle;
            var f = this.curElement.context.fillStyle;
            if (s === 'rgba(0,0,0,0)') {
                return;
            }
            x = Math.round(x);
            y = Math.round(y);
            this.curElement.context.fillStyle = s;
            if (this.curElement.context.lineWidth > 1) {
                this.curElement.context.beginPath();
                this.curElement.context.arc(x, y, this.curElement.context.lineWidth / 2, 0, constants.TWO_PI, false);
                this.curElement.context.fill();
            } else {
                this.curElement.context.fillRect(x, y, 1, 1);
            }
            this.curElement.context.fillStyle = f;
            return this;
        };
        P5.prototype.quad = function (x1, y1, x2, y2, x3, y3, x4, y4) {
            this.curElement.context.beginPath();
            this.curElement.context.moveTo(x1, y1);
            this.curElement.context.lineTo(x2, y2);
            this.curElement.context.lineTo(x3, y3);
            this.curElement.context.lineTo(x4, y4);
            this.curElement.context.closePath();
            this.curElement.context.fill();
            this.curElement.context.stroke();
            return this;
        };
        P5.prototype.rect = function (a, b, c, d) {
            var vals = canvas.modeAdjust(a, b, c, d, this.settings.rectMode);
            this.curElement.context.beginPath();
            this.curElement.context.rect(vals.x, vals.y, vals.w, vals.h);
            this.curElement.context.fill();
            this.curElement.context.stroke();
            return this;
        };
        P5.prototype.triangle = function (x1, y1, x2, y2, x3, y3) {
            this.curElement.context.beginPath();
            this.curElement.context.moveTo(x1, y1);
            this.curElement.context.lineTo(x2, y2);
            this.curElement.context.lineTo(x3, y3);
            this.curElement.context.closePath();
            this.curElement.context.fill();
            this.curElement.context.stroke();
            return this;
        };
        return P5;
    }({}, core, canvas, constants);
var shapeattributes = function (require, core, constants) {
        'use strict';
        var P5 = core;
        var constants = constants;
        P5.prototype.ellipseMode = function (m) {
            if (m === constants.CORNER || m === constants.CORNERS || m === constants.RADIUS || m === constants.CENTER) {
                this.settings.ellipseMode = m;
            }
            return this;
        };
        P5.prototype.noSmooth = function () {
            this.curElement.context.mozImageSmoothingEnabled = false;
            this.curElement.context.webkitImageSmoothingEnabled = false;
            return this;
        };
        P5.prototype.rectMode = function (m) {
            if (m === constants.CORNER || m === constants.CORNERS || m === constants.RADIUS || m === constants.CENTER) {
                this.settings.rectMode = m;
            }
            return this;
        };
        P5.prototype.smooth = function () {
            this.curElement.context.mozImageSmoothingEnabled = true;
            this.curElement.context.webkitImageSmoothingEnabled = true;
            return this;
        };
        P5.prototype.strokeCap = function (cap) {
            if (cap === constants.ROUND || cap === constants.SQUARE || cap === constants.PROJECT) {
                this.curElement.context.lineCap = cap;
            }
            return this;
        };
        P5.prototype.strokeJoin = function (join) {
            if (join === constants.ROUND || join === constants.BEVEL || join === constants.MITER) {
                this.curElement.context.lineJoin = join;
            }
            return this;
        };
        P5.prototype.strokeWeight = function (w) {
            if (typeof w === 'undefined' || w === 0) {
                this.curElement.context.lineWidth = 0.0001;
            } else {
                this.curElement.context.lineWidth = w;
            }
            return this;
        };
        return P5;
    }({}, core, constants);
var shapecurves = function (require, core) {
        'use strict';
        var P5 = core;
        P5.prototype.bezier = function (x1, y1, x2, y2, x3, y3, x4, y4) {
            this.curElement.context.beginPath();
            this.curElement.context.moveTo(x1, y1);
            this.curElement.context.bezierCurveTo(x2, y2, x3, y3, x4, y4);
            this.curElement.context.stroke();
            return this;
        };
        P5.prototype.bezierDetail = function () {
        };
        P5.prototype.bezierPoint = function () {
        };
        P5.prototype.bezierTangent = function () {
        };
        P5.prototype.curve = function () {
        };
        P5.prototype.curveDetail = function () {
        };
        P5.prototype.curvePoint = function () {
        };
        P5.prototype.curveTangent = function () {
        };
        P5.prototype.curveTightness = function () {
        };
        return P5;
    }({}, core);
var shapevertex = function (require, core, constants) {
        'use strict';
        var P5 = core;
        var constants = constants;
        P5.prototype.beginContour = function () {
        };
        P5.prototype.beginShape = function (kind) {
            if (kind === constants.POINTS || kind === constants.LINES || kind === constants.TRIANGLES || kind === constants.TRIANGLE_FAN || kind === constants.TRIANGLE_STRIP || kind === constants.QUADS || kind === constants.QUAD_STRIP) {
                this.shapeKind = kind;
            } else {
                this.shapeKind = null;
            }
            this.shapeInited = true;
            this.curElement.context.beginPath();
            return this;
        };
        P5.prototype.bezierVertex = function (x1, y1, x2, y2, x3, y3) {
            this.curElement.context.bezierCurveTo(x1, y1, x2, y2, x3, y3);
            return this;
        };
        P5.prototype.curveVertex = function () {
        };
        P5.prototype.endContour = function () {
        };
        P5.prototype.endShape = function (mode) {
            if (mode === constants.CLOSE) {
                this.curElement.context.closePath();
                this.curElement.context.fill();
            }
            this.curElement.context.stroke();
            return this;
        };
        P5.prototype.quadraticVertex = function (cx, cy, x3, y3) {
            this.curElement.context.quadraticCurveTo(cx, cy, x3, y3);
            return this;
        };
        P5.prototype.vertex = function (x, y) {
            if (this.shapeInited) {
                this.curElement.context.moveTo(x, y);
            } else {
                this.curElement.context.lineTo(x, y);
            }
            this.shapeInited = false;
            return this;
        };
        return P5;
    }({}, core, constants);
var structure = function (require, core) {
        'use strict';
        var P5 = core;
        P5.prototype.exit = function () {
            throw 'Not implemented';
        };
        P5.prototype.noLoop = function () {
            this.settings.loop = false;
        };
        P5.prototype.loop = function () {
            this.settings.loop = true;
        };
        P5.prototype.pushStyle = function () {
            this.styles.push({
                fillStyle: this.curElement.context.fillStyle,
                strokeStyle: this.curElement.context.strokeStyle,
                lineWidth: this.curElement.context.lineWidth,
                lineCap: this.curElement.context.lineCap,
                lineJoin: this.curElement.context.lineJoin,
                imageMode: this.settings.imageMode,
                rectMode: this.settings.rectMode,
                ellipseMode: this.settings.ellipseMode,
                colorMode: this.settings.colorMode,
                textAlign: this.curElement.context.textAlign,
                textFont: this.settings.textFont,
                textLeading: this.settings.textLeading,
                textSize: this.settings.textSize,
                textStyle: this.settings.textStyle
            });
        };
        P5.prototype.popStyle = function () {
            var lastS = this.styles.pop();
            this.curElement.context.fillStyle = lastS.fillStyle;
            this.curElement.context.strokeStyle = lastS.strokeStyle;
            this.curElement.context.lineWidth = lastS.lineWidth;
            this.curElement.context.lineCap = lastS.lineCap;
            this.curElement.context.lineJoin = lastS.lineJoin;
            this.settings.imageMode = lastS.imageMode;
            this.settings.rectMode = lastS.rectMode;
            this.settings.ellipseMode = lastS.ellipseMode;
            this.settings.colorMode = lastS.colorMode;
            this.curElement.context.textAlign = lastS.textAlign;
            this.settings.textFont = lastS.textFont;
            this.settings.textLeading = lastS.textLeading;
            this.settings.textSize = lastS.textSize;
            this.settings.textStyle = lastS.textStyle;
        };
        P5.prototype.redraw = function () {
            throw 'Not implemented';
        };
        P5.prototype.size = function () {
            throw 'Not implemented';
        };
        return P5;
    }({}, core);
var linearalgebra = function (require) {
        return {
            pMultiplyMatrix: function (m1, m2) {
                var result = [];
                var m1Length = m1.length;
                var m2Length = m2.length;
                var m10Length = m1[0].length;
                for (var j = 0; j < m2Length; j++) {
                    result[j] = [];
                    for (var k = 0; k < m10Length; k++) {
                        var sum = 0;
                        for (var i = 0; i < m1Length; i++) {
                            sum += m1[i][k] * m2[j][i];
                        }
                        result[j].push(sum);
                    }
                }
                return result;
            }
        };
    }({});
var transform = function (require, core, linearalgebra, log) {
        'use strict';
        var P5 = core;
        var linearAlgebra = linearalgebra;
        P5.prototype.applyMatrix = function (n00, n01, n02, n10, n11, n12) {
            this.curElement.context.transform(n00, n01, n02, n10, n11, n12);
            var m = this.matrices[this.matrices.length - 1];
            m = linearAlgebra.pMultiplyMatrix(m, [
                n00,
                n01,
                n02,
                n10,
                n11,
                n12
            ]);
            return this;
        };
        P5.prototype.popMatrix = function () {
            this.curElement.context.restore();
            this.matrices.pop();
            return this;
        };
        P5.prototype.printMatrix = function () {
            this.log(this.matrices[this.matrices.length - 1]);
            return this;
        };
        P5.prototype.pushMatrix = function () {
            this.curElement.context.save();
            this.matrices.push([
                1,
                0,
                0,
                1,
                0,
                0
            ]);
            return this;
        };
        P5.prototype.resetMatrix = function () {
            this.curElement.context.setTransform();
            this.matrices[this.matrices.length - 1] = [
                1,
                0,
                0,
                1,
                0,
                0
            ];
            return this;
        };
        P5.prototype.rotate = function (r) {
            r = this.radians(r);
            this.curElement.context.rotate(r);
            var m = this.matrices[this.matrices.length - 1];
            var c = Math.cos(r);
            var s = Math.sin(r);
            var m11 = m[0] * c + m[2] * s;
            var m12 = m[1] * c + m[3] * s;
            var m21 = m[0] * -s + m[2] * c;
            var m22 = m[1] * -s + m[3] * c;
            m[0] = m11;
            m[1] = m12;
            m[2] = m21;
            m[3] = m22;
            return this;
        };
        P5.prototype.rotateX = function () {
        };
        P5.prototype.rotateY = function () {
        };
        P5.prototype.rotateZ = function () {
        };
        P5.prototype.scale = function () {
            var x = 1, y = 1;
            if (arguments.length === 1) {
                x = y = arguments[0];
            } else {
                x = arguments[0];
                y = arguments[1];
            }
            this.curElement.context.scale(x, y);
            var m = this.matrices[this.matrices.length - 1];
            m[0] *= x;
            m[1] *= x;
            m[2] *= y;
            m[3] *= y;
            return this;
        };
        P5.prototype.shearX = function (angle) {
            this.curElement.context.transform(1, 0, this.tan(angle), 1, 0, 0);
            var m = this.matrices[this.matrices.length - 1];
            m = linearAlgebra.pMultiplyMatrix(m, [
                1,
                0,
                this.tan(angle),
                1,
                0,
                0
            ]);
            return this;
        };
        P5.prototype.shearY = function (angle) {
            this.curElement.context.transform(1, this.tan(angle), 0, 1, 0, 0);
            var m = this.matrices[this.matrices.length - 1];
            m = linearAlgebra.pMultiplyMatrix(m, [
                1,
                this.tan(angle),
                0,
                1,
                0,
                0
            ]);
            return this;
        };
        P5.prototype.translate = function (x, y) {
            this.curElement.context.translate(x, y);
            var m = this.matrices[this.matrices.length - 1];
            m[4] += m[0] * x + m[2] * y;
            m[5] += m[1] * x + m[3] * y;
            return this;
        };
        return P5;
    }({}, core, linearalgebra, log);
var typographyattributes = function (require, core, constants) {
        'use strict';
        var P5 = core;
        var constants = constants;
        P5.prototype.textAlign = function (a) {
            if (a === constants.LEFT || a === constants.RIGHT || a === constants.CENTER) {
                this.curElement.context.textAlign = a;
            }
        };
        P5.prototype.textFont = function (str) {
            this._setProperty('_textFont', str);
        };
        P5.prototype.textHeight = function (s) {
            return this.curElement.context.measureText(s).height;
        };
        P5.prototype.textLeading = function (l) {
            this._setProperty('_textLeading', l);
        };
        P5.prototype.textSize = function (s) {
            this._setProperty('_textSize', s);
        };
        P5.prototype.textStyle = function (s) {
            if (s === constants.NORMAL || s === constants.ITALIC || s === constants.BOLD) {
                this._setProperty('_textStyle', s);
            }
        };
        P5.prototype.textWidth = function (s) {
            return this.curElement.context.measureText(s).width;
        };
        return P5;
    }({}, core, constants);
var typographyloading_displaying = function (require, core) {
        'use strict';
        var P5 = core;
        P5.prototype.text = function () {
            this.curElement.context.font = this._textStyle + ' ' + this._textSize + 'px ' + this._textFont;
            if (arguments.length === 3) {
                this.curElement.context.fillText(arguments[0], arguments[1], arguments[2]);
                this.curElement.context.strokeText(arguments[0], arguments[1], arguments[2]);
            } else if (arguments.length === 5) {
                var words = arguments[0].split(' ');
                var line = '';
                var vals = this.modeAdjust(arguments[1], arguments[2], arguments[3], arguments[4], this.rectMode);
                vals.y += this.textLeading;
                for (var n = 0; n < words.length; n++) {
                    var testLine = line + words[n] + ' ';
                    var metrics = this.curElement.context.measureText(testLine);
                    var testWidth = metrics.width;
                    if (vals.y > vals.h) {
                        break;
                    } else if (testWidth > vals.w && n > 0) {
                        this.curElement.context.fillText(line, vals.x, vals.y);
                        this.curElement.context.strokeText(line, vals.x, vals.y);
                        line = words[n] + ' ';
                        vals.y += this.textLeading;
                    } else {
                        line = testLine;
                    }
                }
                if (vals.y <= vals.h) {
                    this.curElement.context.fillText(line, vals.x, vals.y);
                    this.curElement.context.strokeText(line, vals.x, vals.y);
                }
            }
        };
        return P5;
    }({}, core);
var src_p5 = function (require, core, mathpvector, colorcreating_reading, colorsetting, dataarray_functions, datastring_functions, dommanipulate, dompelement, environment, image, imageloading_displaying, inputfiles, inputkeyboard, inputmouse, inputtime_date, inputtouch, mathcalculation, mathrandom, mathtrigonometry, outputfiles, outputimage, outputtext_area, shape2d_primitives, shapeattributes, shapecurves, shapevertex, structure, transform, typographyattributes, typographyloading_displaying) {
        'use strict';
        var P5 = core;
        var PVector = mathpvector;
        if (document.readyState === 'complete') {
            P5._init();
        } else {
            window.addEventListener('load', P5._init, false);
        }
        window.P5 = P5;
        window.PVector = PVector;
        return P5;
    }({}, core, mathpvector, colorcreating_reading, colorsetting, dataarray_functions, datastring_functions, dommanipulate, dompelement, environment, image, imageloading_displaying, inputfiles, inputkeyboard, inputmouse, inputtime_date, inputtouch, mathcalculation, mathrandom, mathtrigonometry, outputfiles, outputimage, outputtext_area, shape2d_primitives, shapeattributes, shapecurves, shapevertex, structure, transform, typographyattributes, typographyloading_displaying);
}());