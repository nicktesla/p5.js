define(function (require) {

  'use strict';

  var P5 = require('core');
  var PVector = require('math.pvector');

  require('color.creating_reading');
  require('color.setting');
  require('data.array_functions');
  require('data.string_functions');
  require('dom.manipulate');
  require('dom.pelement');
  require('environment');
  require('image');
  require('image.loading_displaying');
  require('input.files');
  require('input.keyboard');
  require('input.mouse');
  require('input.time_date');
  require('input.touch');
  require('math.calculation');
  require('math.random');
  require('math.trigonometry');
  require('output.files');
  require('output.image');
  require('output.text_area');
  require('shape.2d_primitives');
  require('shape.attributes');
  require('shape.curves');
  require('shape.vertex');
  require('structure');
  require('transform');
  require('typography.attributes');
  require('typography.loading_displaying');

  if (document.readyState === 'complete') {
    P5._init();
  } else {
    window.addEventListener('load', P5._init , false);
  }

  window.P5 = P5;
  window.PVector = PVector;

  return P5;

});