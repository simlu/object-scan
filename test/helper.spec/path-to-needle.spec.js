const expect = require('chai').expect;
const { describe } = require('node-tdd');
const pathToNeedle = require('../helper/path-to-needle');
const PRNG = require('../helper/prng');

describe('Testing path-to-needle.js', () => {
  let rng;
  let needle;
  let params;
  beforeEach(() => {
    rng = PRNG('44e669e4-401b-4440-9ee8-387ae0840d66');
    needle = ['name', 0, 'value', 16, 'property'];
    params = {
      exclude: false,
      lenPercentage: 1,
      questionMark: 0,
      partialStar: 0,
      singleStar: 0,
      doubleStar: 0
    };
  });

  it('Testing no modification', () => {
    const r = pathToNeedle(needle, params);
    expect(r).to.deep.equal([
      { value: 'name', string: true, exclude: false },
      { value: '0', string: false, exclude: false },
      { value: 'value', string: true, exclude: false },
      { value: '16', string: false, exclude: false },
      { value: 'property', string: true, exclude: false }
    ]);
  });

  it('Testing len percentage', () => {
    const r = pathToNeedle(needle, { ...params, lenPercentage: 0.5 }, rng);
    expect(r).to.deep.equal([
      { value: 'name', string: true, exclude: false },
      { value: '0', string: false, exclude: false },
      { value: 'value', string: true, exclude: false }
    ]);
  });

  it('Testing exclude', () => {
    const r = pathToNeedle(needle, { ...params, exclude: true }, rng);
    expect(r).to.deep.equal([
      { value: 'name', string: true, exclude: false },
      { value: '0', string: false, exclude: false },
      { value: 'value', string: true, exclude: false },
      { value: '16', string: false, exclude: false },
      { value: 'property', string: true, exclude: true }
    ]);
  });

  it('Testing question mark', () => {
    const r = pathToNeedle(needle, { ...params, questionMark: 5 }, rng);
    expect(r).to.deep.equal([
      { value: 'n?me', string: true, exclude: false },
      { value: '?', string: false, exclude: false },
      { value: '?alue', string: true, exclude: false },
      { value: '?6', string: false, exclude: false },
      { value: 'prop?rty', string: true, exclude: false }
    ]);
  });

  it('Testing partial star', () => {
    const r = pathToNeedle(needle, { ...params, partialStar: 5 }, rng);
    expect(r).to.deep.equal([
      { value: 'nam*e', string: true, exclude: false },
      { value: '*0', string: false, exclude: false },
      { value: '*lue', string: true, exclude: false },
      { value: '1*6', string: false, exclude: false },
      { value: 'prop*ty', string: true, exclude: false }
    ]);
  });

  it('Testing single Star', () => {
    const r = pathToNeedle(needle, { ...params, singleStar: 2 }, rng);
    expect(r).to.deep.equal([
      { value: 'name', string: true, exclude: false },
      { value: '*', string: false, exclude: false },
      { value: 'value', string: true, exclude: false },
      { value: '16', string: false, exclude: false },
      { value: '*', string: true, exclude: false }
    ]);
  });

  describe('Testing double Star', () => {
    it('Testing default', () => {
      const r = pathToNeedle(needle, { ...params, doubleStar: 2 }, rng);
      expect(r).to.deep.equal([
        { value: 'name', string: true, exclude: false },
        { value: '**', string: true, exclude: false },
        { value: '16', string: false, exclude: false },
        { value: 'property', string: true, exclude: false },
        { value: '**', string: true, exclude: false }
      ]);
    });

    it('Testing replace', () => {
      const r = pathToNeedle([0], { ...params, doubleStar: 1 }, PRNG('fc863e2a-f73e-4e49-b349-70b9ddb82f47'));
      expect(r).to.deep.equal([
        { value: '**', string: true, exclude: false }
      ]);
    });

    it('Testing prepend', () => {
      const r = pathToNeedle([0], { ...params, doubleStar: 1 }, PRNG('46909d48-312d-4045-9230-3e60ef908620'));
      expect(r).to.deep.equal([
        { value: '**', string: true, exclude: false },
        { value: '0', string: false, exclude: false }
      ]);
    });

    it('Testing append', () => {
      const r = pathToNeedle([0], { ...params, doubleStar: 1 }, PRNG('25ccb861-5a2d-497b-98e3-9b581691f981'));
      expect(r).to.deep.equal([
        { value: '0', string: false, exclude: false },
        { value: '**', string: true, exclude: false }
      ]);
    });
  });

  it('Testing needle with special characters', () => {
    const r = pathToNeedle(['*force'], params, rng);
    expect(r).to.deep.equal([
      { value: '\\*force', string: true, exclude: false }
    ]);
  });
});
