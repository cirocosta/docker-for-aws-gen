'use strict';

const assert = require('assert');
const objectExtend = require('deep-extend');
const arrayUnion = require('array-union');

describe('Manager', () => {
  it('array union', () => {
    const arr1 = [ 1, 2 ];
    const arr2 = [ 0, 1 ];
  
    const res = arrayUnion([], arr1, arr2);
    console.log(res);
  });

  it('object extending', () => {
    const obj1 = {a: "lol"};
    const obj2 = {b: "hue"};
  
    const res = objectExtend({}, obj1, obj2);
    console.log(res);
  });
});
