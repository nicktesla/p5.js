define(function (require) {

  'use strict';

  var P5 = require('core');
  var constants = require('constants');

  P5.prototype.beginContour = function() {
    // TODO

  };

  P5.prototype.beginShape = function(kind) {
    if (kind === constants.POINTS || kind === constants.LINES || kind === constants.TRIANGLES || kind === constants.TRIANGLE_FAN || kind === constants.TRIANGLE_STRIP || kind === constants.QUADS || kind === constants.QUAD_STRIP) {
      this.shapeKind = kind;
    } else {
      this.shapeKind = null;
    }

    this.shapeInited = true;
    this.curElement.context.beginPath();

    return this;
  };

  P5.prototype.bezierVertex = function(x1, y1, x2, y2, x3, y3) {
    this.curElement.context.bezierCurveTo(x1, y1, x2, y2, x3, y3);

    return this;
  };

  P5.prototype.curveVertex = function() {
    // TODO

  };

  P5.prototype.endContour = function() {
    // TODO

  };

  P5.prototype.endShape = function(mode) {
    if (mode === constants.CLOSE) {
      this.curElement.context.closePath();
      this.curElement.context.fill();
    }
    this.curElement.context.stroke();

    return this;
  };

  P5.prototype.quadraticVertex = function(cx, cy, x3, y3) {
    this.curElement.context.quadraticCurveTo(cx, cy, x3, y3);

    return this;
  };

  P5.prototype.vertex = function(x, y) {
    if (this.shapeInited) {
      this.curElement.context.moveTo(x, y);
    } else {
      this.curElement.context.lineTo(x, y); // pend this is where check for kind and do other stuff
    }
    this.shapeInited = false;

    return this;
  };

  return P5;

});