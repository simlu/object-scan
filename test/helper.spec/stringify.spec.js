const expect = require('chai').expect;
const { describe } = require('node-tdd');
const stringify = require('../helper/stringify');

describe('Testing stringify.js', () => {
  it('Testing array', () => {
    const array = [1, 2, 3, [1, 2]];
    expect(stringify(array)).to.equal('[ 1, 2, 3, [ 1, 2 ] ]');
  });

  it('Testing object', () => {
    const object = { a: 1, b: 2, c: { d: 3, e: 4 } };
    expect(stringify(object)).to.equal('{ a: 1, b: 2, c: { d: 3, e: 4 } }');
  });
});
