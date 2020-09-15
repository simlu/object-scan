const expect = require('chai').expect;
const { describe } = require('node-tdd');
const generateParsedNeedle = require('../helper/generate-parsed-needle');
const parsedNeedleToString = require('../helper/parsed-needle-to-string');

describe('Testing parsed-needle-to-string.js', { cryptoSeed: '04eb4846-3b0c-4168-82fe-5a955f5161e3' }, () => {
  it('Testing example', () => {
    expect(parsedNeedleToString(generateParsedNeedle()))
      .to.deep.equal('{{{a,{b},[9]}.{[11][6].c}.{[3].{[12],[1]}[14][2]}.d},{[13],{[8],e,{[4],f,g},h}},{i}}');
  });
});