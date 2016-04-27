import recur from '../src';

describe('Weekly', function() {
  describe('.matches(date)', function() {
    it('should return false if date does not match the day of week mask', function() {
      let pattern = recur()
        .every().week()
        .on(recur.days.Tuesday | recur.days.Thursday)
        .from('2015-01-01').to('2015-01-31');

      expect(pattern.matches('2015-01-04')).to.be.false;
      expect(pattern.matches('2015-01-05')).to.be.false;
      expect(pattern.matches('2015-01-06')).to.be.true;
      expect(pattern.matches('2015-01-07')).to.be.false;
      expect(pattern.matches('2015-01-08')).to.be.true;
      expect(pattern.matches('2015-01-09')).to.be.false;
      expect(pattern.matches('2015-01-10')).to.be.false;
    });

    it('should return false if date does not occur within the period', function() {
      let pattern = recur().every().week().on(recur.days.All).from('2015-01-01').to('2015-01-31');
      expect(pattern.matches('2014-12-30')).to.be.false;
      expect(pattern.matches('2015-01-01')).to.be.true;
      expect(pattern.matches('2015-01-31')).to.be.true;
      expect(pattern.matches('2015-02-01')).to.be.false;
    });

    it('should return false if date does not match the interval', function() {
      let pattern = recur().every(2).weeks().on(recur.days.All).from('2015-01-01').to('2015-01-31');
      expect(pattern.matches('2015-01-01')).to.be.true;
      expect(pattern.matches('2015-01-03')).to.be.true;
      expect(pattern.matches('2015-01-04')).to.be.false;
      expect(pattern.matches('2015-01-10')).to.be.false;
      expect(pattern.matches('2015-01-11')).to.be.true;
      expect(pattern.matches('2015-01-17')).to.be.true;
      expect(pattern.matches('2015-01-18')).to.be.false;
      expect(pattern.matches('2015-01-24')).to.be.false;
      expect(pattern.matches('2015-01-25')).to.be.true;
      expect(pattern.matches('2015-01-30')).to.be.true;
    });
  });

  describe('.snap(date, direction)', function() {
    it('should snap to the next occurrence', function() {
      let pattern = recur()
        .every(2).weeks()
        .on(recur.days.Monday | recur.days.Wednesday)
        .from('2015-01-01').to('2015-01-31');
      expect(pattern.snap('2015-01-11', -1)).to.equal('2015-01-07');
      expect(pattern.snap('2015-01-11', 1)).to.equal('2015-01-19');
    });

    it('should not go outside the pattern range', function() {
      let pattern = recur()
        .every(2).weeks()
        .on(recur.days.Monday | recur.days.Friday)
        .from('2015-01-01').to('2015-01-31');
      expect(pattern.snap('2014-12-29', -1)).to.equal('2015-01-02');
      expect(pattern.snap('2014-12-29', 1)).to.equal('2015-01-02');
      expect(pattern.snap('2015-01-31', -1)).to.equal('2015-01-30');
      expect(pattern.snap('2015-01-31', 1)).to.equal('2015-01-30');

      // Test pattern with no end date.
      pattern.to(null);
      expect(pattern.snap('2015-01-31', 1)).to.equal('2015-02-09');
    });
  });

  describe('.next(start, direction)', function() {
    it('should return the next date in the series', function() {
      let pattern = recur()
        .every(2).weeks()
        .on(recur.days.Tuesday | recur.days.Thursday)
        .from('2015-01-01').to('2015-01-31');
      let dates = [];
      let cursor;
      while (cursor = pattern.next(cursor)) {
        dates.push(cursor);
      }
      expect(dates).to.eql([
        '2015-01-01',
        '2015-01-13',
        '2015-01-15',
        '2015-01-27',
        '2015-01-29'
      ]);
    });
  });

  describe('.toMask()', function() {
    it('should return a mask of the occurrences', function() {
      let pattern = recur()
        .every(2).weeks()
        .on(recur.days.Tuesday | recur.days.Thursday | recur.days.Friday)
        .from('2015-01-01').to('2015-01-31');
      expect(pattern.toMask().value).to.equal('2015-01-01|110000000000101100000000001011');

      pattern.from('2015-03-01').to('2015-03-31');
      expect(pattern.toMask().value).to.equal('2015-03-03|10110000000000101100000000001');
    });
  });
});
