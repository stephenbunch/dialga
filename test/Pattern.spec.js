import recur from '../src';

describe('Pattern', function() {
  describe('.matches(date)', function() {
    describe('with deleted occurrence', function() {
      it('should return false on the occurrence date', function() {
        let pattern = recur().every().days().from('2015-01-01').to('2015-01-31');
        expect(pattern.matches('2015-01-01')).to.be.true;
        pattern.addException('2015-01-01', null);
        expect(pattern.matches('2015-01-01')).to.be.false;
      });
    });

    describe('with moved occurrence', function() {
      it('should return true on the exception date and false on the occurrence date', function() {
        let pattern = recur().every(2).days().from('2015-01-01').to('2015-01-31');
        expect(pattern.matches('2015-01-03')).to.be.true;
        pattern.addException('2015-01-03', '2015-01-02');
        expect(pattern.matches('2015-01-02')).to.be.true;
        expect(pattern.matches('2015-01-03')).to.be.false;
      });
    });
  });

  describe('.validate()', function() {
    it('should throw an error if an exception exists for an invalid date', function() {
      let pattern = recur().every(2).days().from('2015-01-01').to('2015-01-31');
      pattern.validate();
      pattern.addException('2015-01-02', null);
      expect(function() {
        pattern.validate();
      }).to.throw(recur.errors.InvalidPatternError);
    });

    it('should throw an error if an exception exists outside the range of the pattern', function() {
      let pattern = recur().every().days().from('2015-01-01').to('2015-01-31');
      pattern.validate();
      pattern.addException('2015-01-01', '2014-12-25');
      expect(function() {
        pattern.validate();
      }).to.throw(recur.errors.InvalidPatternError);
      pattern.removeException('2015-01-01');
      pattern.validate();
      pattern.addException('2015-01-31', '2015-02-01');
      expect(function() {
        pattern.validate();
      }).to.throw(recur.errors.InvalidPatternError);
    });

    it('should throw an error if the start date is greater than the end date', function() {
      let pattern = recur().every().days().from('2015-01-31').to('2015-01-01');
      expect(function() {
        pattern.validate();
      }).to.throw(recur.errors.InvalidPatternError);
    });

    it('should throw an error if an exception exists before its previous sibling', function() {
      let pattern = recur().every(2).days().from('2015-01-01').to('2015-01-31');
      pattern.validate();
      pattern.addException('2015-01-05', '2015-01-02');
      expect(function() {
        pattern.validate();
      }).to.throw(recur.errors.InvalidPatternError);
    });

    it('should throw an error if an exception exists after its next sibling', function() {
      let pattern = recur().every(2).days().from('2015-01-01').to('2015-01-31');
      pattern.validate();
      pattern.addException('2015-01-03', '2015-01-06');
      expect(function() {
        pattern.validate();
      }).to.throw(recur.errors.InvalidPatternError);
    });
  });
});
