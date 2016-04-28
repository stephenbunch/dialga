import recur from '../src';

describe('Monthly', function() {
  describe('.matches(date)', function() {
    it('should return false if the date matches the wrong day of month', function() {
      let pattern = recur().day(15).every().month().from('2016-01-01');
      expect(pattern.matches('2016-01-14')).to.be.false;
      expect(pattern.matches('2016-01-15')).to.be.true;
      expect(pattern.matches('2016-01-16')).to.be.false;
      expect(pattern.matches('2016-02-15')).to.be.true;
    });

    it('should return false if the date matches the wrong month interval', function() {
      let pattern = recur().day(15).every(2).months().from('2016-01-01');
      expect(pattern.matches('2016-02-15')).to.be.false;
      expect(pattern.matches('2016-03-15')).to.be.true;
      expect(pattern.matches('2016-04-15')).to.be.false;
    });
  });

  describe('.next(date, direction)', function() {
    it('should return the next date in the series', function() {
      let pattern = recur().day(4).every(3).months().from('2016-01-12');
      expect(pattern.next()).to.equal('2016-04-04');
      expect(pattern.next('2016-04-04')).to.equal('2016-07-04');
    });
  });

  describe('.snap(date, direction)', function() {
    it('should snap to the next occurrence', function() {
      let pattern = recur().day(5).every(2).months().from('2016-01-01');
      expect(pattern.snap('2016-01-01')).to.equal('2016-01-05');
      expect(pattern.snap('2016-03-23')).to.equal('2016-05-05');
    });

    it('should not go outside the pattern range', function() {
      let pattern = recur().day(1).every().month().from('2016-01-01').to('2016-06-01');
      expect(pattern.snap('2015-12-01')).to.equal('2016-01-01');
      expect(pattern.snap('2016-07-01')).to.equal('2016-06-01');
    });
  });
});
