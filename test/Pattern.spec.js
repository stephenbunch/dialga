import recur from '../src';

describe('Pattern', function() {
  describe('.matches( date )', function() {
    describe('with weekly recurrence type', function() {
      it('should return false if date does not match the day of week mask', function() {
        var pattern = recur()
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
        var pattern = recur().every().week().on(recur.days.All).from('2015-01-01').to('2015-01-31');
        expect(pattern.matches('2014-12-30')).to.be.false;
        expect(pattern.matches('2015-01-01')).to.be.true;
        expect(pattern.matches('2015-01-31')).to.be.true;
        expect(pattern.matches('2015-02-01')).to.be.false;
      });

      it('should return false if date does not match the interval', function() {
        var pattern = recur().every(2).weeks().on(recur.days.All).from('2015-01-01').to('2015-01-31');
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

    describe( 'with deleted occurrence', function() {
      it( 'should return false on the occurrence date', function() {
        var pattern = recur().every().day().from( '2015-01-01' ).to( '2015-01-31' );
        expect( pattern.matches( '2015-01-01' ) ).to.be.true;
        pattern.addException( '2015-01-01', null );
        expect( pattern.matches( '2015-01-01' ) ).to.be.false;
      });
    });

    describe('with moved occurrence', function() {
      it('should return true on the exception date and false on the occurrence date', function() {
        var pattern = recur().every(2).days().from('2015-01-01').to('2015-01-31');
        expect(pattern.matches('2015-01-03')).to.be.true;
        pattern.addException('2015-01-03', '2015-01-02');
        expect(pattern.matches('2015-01-02')).to.be.true;
        expect(pattern.matches('2015-01-03')).to.be.false;
      });
    });
  });

  describe('.validate()', function() {
    it('should throw an error if an exception exists for an invalid date', function() {
      var pattern = recur().every(2).days().from('2015-01-01').to('2015-01-31');
      pattern.validate();
      pattern.addException('2015-01-02', null);
      expect(function() {
        pattern.validate();
      }).to.throw(recur.errors.InvalidPatternError);
    });

    it('should throw an error if an exception exists outside the range of the pattern', function() {
      var pattern = recur().every().day().from('2015-01-01').to('2015-01-31');
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
      var pattern = recur().every().day().from('2015-01-31').to('2015-01-01');
      expect(function() {
        pattern.validate();
      }).to.throw(recur.errors.InvalidPatternError);
    });

    it('should throw an error if an exception exists before its previous sibling', function() {
      var pattern = recur().every(2).days().from('2015-01-01').to('2015-01-31');
      pattern.validate();
      pattern.addException('2015-01-05', '2015-01-02');
      expect(function() {
        pattern.validate();
      }).to.throw(recur.errors.InvalidPatternError);
    });

    it('should throw an error if an exception exists after its next sibling', function() {
      var pattern = recur().every(2).days().from('2015-01-01').to('2015-01-31');
      pattern.validate();
      pattern.addException('2015-01-03', '2015-01-06');
      expect(function() {
        pattern.validate();
      }).to.throw(recur.errors.InvalidPatternError);
    });
  });

  describe('.snap( date, direction )', function() {
    describe('with daily recurrence type', function() {
      it('should snap to the next occurrence', function() {
        var pattern = recur().every(2).days().from('2015-01-01').to('2015-01-31');
        expect(pattern.snap('2015-01-02', 1)).to.equal('2015-01-03');
        expect(pattern.snap('2015-01-02', -1)).to.equal('2015-01-01');
        expect(pattern.snap('2015-01-03', 1)).to.equal('2015-01-03');
      });
    });

    describe('with weekly recurrence type', function() {
      it('should snap to the next occurrence', function() {
        var pattern = recur()
          .every(2).weeks()
          .on(recur.days.Monday | recur.days.Wednesday)
          .from('2015-01-01').to('2015-01-31');
        expect(pattern.snap('2015-01-11', -1)).to.equal('2015-01-07');
        expect(pattern.snap('2015-01-11', 1)).to.equal('2015-01-19');
      });

      it('should not go outside the pattern range', function() {
        var pattern = recur()
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
  });

  describe('.next( start, direction )', function() {
    describe('with daily recurrence type', function() {
      it('should return the next date in the series', function() {
        var pattern = recur().every(2).days().from('2015-01-01').to('2015-01-06');
        var dates = [];
        var cursor;
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

    describe('with weekly recurrence type', function() {
      it('should return the next date in the series', function() {
        var pattern = recur()
          .every(2).weeks()
          .on(recur.days.Tuesday | recur.days.Thursday)
          .from('2015-01-01').to('2015-01-31');
        var dates = [];
        var cursor;
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
  });

  describe('.toMask()', function() {
    describe('with daily recurrence type', function() {
      it('should return a mask of the occurrences', function() {
        var pattern = recur().every(2).days().from('2015-01-01').to('2015-01-06');
        expect(pattern.toMask().value).to.equal('2015-01-01|10101');
      });
    });

    describe('with weekly recurrence type', function() {
      it('should return a mask of the occurrences', function() {
        var pattern = recur()
          .every(2).weeks()
          .on(recur.days.Tuesday | recur.days.Thursday | recur.days.Friday)
          .from('2015-01-01').to('2015-01-31');
        expect(pattern.toMask().value).to.equal('2015-01-01|110000000000101100000000001011');

        pattern.from('2015-03-01').to('2015-03-31');
        expect(pattern.toMask().value).to.equal('2015-03-03|10110000000000101100000000001');
      });
    });
  });
});
