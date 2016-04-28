import recur from '../src';

describe('Yearly', function() {
  describe('.matches(date)', function() {
    it('should return false if the date matches the wrong day of the year', function() {
      let pattern = recur().february(5).every().year().from('2016-01-01');
      expect(pattern.matches('2016-01-14')).to.be.false;
      expect(pattern.matches('2016-02-05')).to.be.true;
      expect(pattern.matches('2017-02-05')).to.be.true;
    });

    it('should return false if the date matches the wrong year interval', function() {
      let pattern = recur().march(15).every(2).years().from('2016-01-01');
      expect(pattern.matches('2016-03-15')).to.be.true;
      expect(pattern.matches('2017-03-15')).to.be.false;
      expect(pattern.matches('2018-03-15')).to.be.true;
    });
  });

  describe('.next(date, direction)', function() {
    it('should return the next date in the series', function() {
      let pattern = recur().february(31).every(2).years().from('2016-01-12');
      expect(pattern.next()).to.equal('2016-02-29');
      expect(pattern.next('2016-02-29')).to.equal('2018-02-28');
    });
  });

  describe('.snap(date, direction)', function() {
    it('should snap to the next occurrence', function() {
      let pattern = recur().july(4).every(2).years().from('2016-01-01');
      expect(pattern.snap('2016-01-01')).to.equal('2016-07-04');
      expect(pattern.snap('2016-08-01')).to.equal('2018-07-04');
    });

    it('should not go outside the pattern range', function() {
      let pattern = recur().january(1).every().year().from('2016-01-01').to('2017-01-01');
      expect(pattern.snap('2015-12-01')).to.equal('2016-01-01');
      expect(pattern.snap('2017-07-01')).to.equal('2017-01-01');
    });
  });
});
