import recur from '../src';

describe('MonthNth', function() {
  describe('.matches(date)', function() {
    it('should return true if the date matches the correct day of month', function() {
      let pattern = recur().the(2, recur.days.Tuesday).every().month().from('2016-01-01');
      expect(pattern.matches('2016-01-05')).to.be.false;
      expect(pattern.matches('2016-01-12')).to.be.true;
      expect(pattern.matches('2016-02-09')).to.be.true;
    });

    it('should return false if the date matches the wrong month interval', function() {
      let pattern = recur().the(2, recur.days.Tuesday).every(2).months().from('2016-01-01');
      expect(pattern.matches('2016-01-12')).to.be.true;
      expect(pattern.matches('2016-02-09')).to.be.false;
      expect(pattern.matches('2016-03-08')).to.be.true;
      expect(pattern.matches('2016-04-12')).to.be.false;
    });
  });

  describe('.next(date, direction)', function() {
    it('should return the next date in the series', function() {
      let pattern = recur().the(1, recur.days.Sunday).every(3).months().from('2016-01-12');
      expect(pattern.next()).to.equal('2016-02-07');
      expect(pattern.next('2016-02-07')).to.equal('2016-05-01');
    });
  });

  describe('.snap(date, direction)', function() {
    it('should snap to the next occurrence', function() {
      let pattern = recur().the(5, recur.days.Saturday).every(2).months().from('2016-01-01');
      expect(pattern.snap('2016-01-01')).to.equal('2016-01-30');
      expect(pattern.snap('2016-04-01', -1)).to.equal('2016-03-26');
    });

    it('should not go outside the pattern range', function() {
      let pattern = recur().the(1, recur.days.Friday).every().month().from('2016-01-01').to('2016-06-01');
      expect(pattern.snap('2015-12-01')).to.equal('2016-01-01');
      expect(pattern.snap('2016-07-01')).to.equal('2016-05-06');
    });
  });
});
