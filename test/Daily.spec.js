import recur from '../src';

describe('Daily', function() {
  describe('.matches(date)', function() {
    it('should return false if the date does not fall on the pattern interval', function() {
      let pattern = recur().every(2).days().from('2016-01-01');
      expect(pattern.matches('2016-01-01')).to.be.true;
      expect(pattern.matches('2016-01-02')).to.be.false;
      expect(pattern.matches('2016-01-03')).to.be.true;
    });
  });

  describe('.snap(date, direction)', function() {
    it('should snap to the next occurrence', function() {
      let pattern = recur().every(2).days().from('2015-01-01').to('2015-01-31');
      expect(pattern.snap('2015-01-02', 1)).to.equal('2015-01-03');
      expect(pattern.snap('2015-01-02', -1)).to.equal('2015-01-01');
      expect(pattern.snap('2015-01-03', 1)).to.equal('2015-01-03');
    });

    it('should not go outside the pattern range', function() {
      let pattern = recur().every(2).days().from('2016-01-01').to('2016-01-31');
      expect(pattern.snap('2015-12-30', -1)).to.equal('2016-01-01');
      expect(pattern.snap('2016-02-01', 1)).to.equal('2016-01-31');
    });
  });

  describe('.next(start, direction)', function() {
    it('should return the next date in the series', function() {
      let pattern = recur().every(2).days().from('2015-01-01').to('2015-01-06');
      let dates = [];
      let cursor;
      while (cursor = pattern.next(cursor)) {
        dates.push(cursor);
      }
      expect(dates).to.eql([
        '2015-01-01',
        '2015-01-03',
        '2015-01-05'
      ]);
    });
  });

  describe('.toMask()', function() {
    it('should return a mask of the occurrences', function() {
      let pattern = recur().every(2).days().from('2015-01-01').to('2015-01-06');
      expect(pattern.toMask().value).to.equal('2015-01-01|10101');
    });
  });
});
