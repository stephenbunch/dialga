import recur from '../src';

describe('YearNth', function() {
  describe('.matches(date)', function() {
    it('should return true if the date matches the correct day of the year', function() {
      let pattern = recur().the(2, recur.days.Tuesday).january().every().year().from('2016-01-01');
      expect(pattern.matches('2016-01-05')).to.be.false;
      expect(pattern.matches('2016-01-12')).to.be.true;
      expect(pattern.matches('2017-01-10')).to.be.true;
    });

    it('should return false if the date matches the wrong year interval', function() {
      let pattern = recur().the(2, recur.days.Tuesday).january().every(2).years().from('2016-01-01');
      expect(pattern.matches('2016-01-12')).to.be.true;
      expect(pattern.matches('2017-01-10')).to.be.false;
      expect(pattern.matches('2018-01-09')).to.be.true;
      expect(pattern.matches('2019-01-08')).to.be.false;
    });
  });

  describe('.next(date, direction)', function() {
    it('should return the next date in the series', function() {
      let pattern = recur().the(1, recur.days.Sunday).january().every(3).years().from('2016-01-12');
      expect(pattern.next()).to.equal('2019-01-06');
      expect(pattern.next('2019-01-06')).to.equal('2022-01-02');
    });
  });

  describe('.snap(date, direction)', function() {
    it('should snap to the next occurrence', function() {
      let pattern = recur().the(5, recur.days.Saturday).february().every().year().from('2016-01-01');
      expect(pattern.snap('2016-01-01')).to.equal('2016-02-27');
      expect(pattern.snap('2016-04-01')).to.equal('2017-02-25');
    });

    it('should not go outside the pattern range', function() {
      let pattern = recur().the(1, recur.days.Friday).march().every().year().from('2016-01-01').to('2018-01-01');
      expect(pattern.snap('2015-12-01')).to.equal('2016-03-04');
      expect(pattern.snap('2018-07-01')).to.equal('2017-03-03');
    });
  });
});
