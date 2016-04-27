import recur from '../src';

describe( 'Mask', function() {
  describe( 'ctor( mask )', function() {
    it( 'should throw an error if the date is invalid', function() {
      expect( function() {
        new recur.Mask( '2015-13-01|1' );
      }).to.throw( recur.errors.InvalidDateError );
    });

    it( 'should throw an error if the mask value doesn\'t begin with a "1"', function() {
      expect( function() {
        new recur.Mask( '2015-01-01|01' );
      }).to.throw( recur.errors.InvalidMaskError );
    });

    it( 'should throw an error if the mask value doesn\'t end with a "1"', function() {
      expect( function() {
        new recur.Mask( '2015-01-01|10' );
      }).to.throw( recur.errors.InvalidMaskError );
    });

    it( 'should treat empty masks as having no occurrences', function() {
      expect( new recur.Mask().value ).to.equal( '' );
      expect( new recur.Mask( '' ).value ).to.equal( '' );
      expect( new recur.Mask( null ).value ).to.equal( '' );
    });
  });

  describe( '.or( mask )', function() {
    it( 'should perform a logical OR', function() {
      // - 101001
      // - 010100
      // > 111101
      var a = new recur.Mask( '2015-01-01|101001' );
      var b = new recur.Mask( '2015-01-02|10101' );
      expect( a.or( b ).value ).to.equal( '2015-01-01|111101' );
    });
  });

  describe( '.and( mask )', function() {
    it( 'should perform a logical AND', function() {
      // - 101010
      // - 010110
      // > 000010
      var a = new recur.Mask( '2015-01-01|10101' );
      var b = new recur.Mask( '2015-01-02|1011' );
      expect( a.and( b ).value ).to.equal( '2015-01-05|1' );
    });
  });

  describe( '.xor( mask )', function() {
    it( 'should perform a logical XOR', function() {
      // - 101010
      // - 010110
      // > 111100
      var a = new recur.Mask( '2015-01-01|10101' );
      var b = new recur.Mask( '2015-01-02|1011' );
      expect( a.xor( b ).value ).to.equal( '2015-01-01|1111' );

      var pattern = recur()
        .every( 1 ).week()
        .on( recur.days.Teusday | recur.days.Thursday | recur.days.Friday )
        .from( '2015-01-01' ).to( '2015-06-01' );
    });
  });

  describe( '.not( mask )', function() {
    it( 'should negate occurrences in the target mask from the source mask', function() {
      var a = new recur.Mask( '2015-01-01|10101' );
      var b = new recur.Mask( '2015-01-01|11' );
      expect( a.not( b ).value ).to.equal( '2015-01-03|101' );
    });
  });

  describe( '.matches( date )', function() {
    it( 'should return false if the date occurs before the mask', function() {
      var mask = new recur.Mask( '2015-01-02|1' );
      expect( mask.matches( '2015-01-01' ) ).to.be.false;
    });

    it( 'should return true if the date matches the mask', function() {
      var mask = new recur.Mask( '2015-01-01|100101' );
      expect( mask.matches( '2015-01-01' ) ).to.be.true;
      expect( mask.matches( '2015-01-02' ) ).to.be.false;
      expect( mask.matches( '2015-01-03' ) ).to.be.false;
      expect( mask.matches( '2015-01-04' ) ).to.be.true;
      expect( mask.matches( '2015-01-05' ) ).to.be.false;
      expect( mask.matches( '2015-01-06' ) ).to.be.true;
    });
  });

  describe( '.getDates()', function() {
    it( 'should return an array of dates', function() {
      var mask = new recur.Mask( '2015-01-01|100101' );
      var dates = mask.getDates();
      expect( dates ).to.eql([
        '2015-01-01',
        '2015-01-04',
        '2015-01-06'
      ]);
    });
  });

  describe( '.getRange()', function() {
    it( 'should return an array containing the first and last date of the mask', function() {
      var mask = new recur.Mask( '2015-01-01|1001' );
      var range = mask.getRange();
      expect( range ).to.eql([ '2015-01-01', '2015-01-04' ]);
    });

    it( 'should return null if the mask is null', function() {
      var mask = new recur.Mask();
      expect( mask.getRange() ).to.be.null;
    });
  });

  describe( '.addDate( date )', function() {
    it( 'should return a new mask with the date added', function() {
      var mask = new recur.Mask( '2015-01-01|101' );
      expect( mask.addDate( '2015-01-02' ).value ).to.equal( '2015-01-01|111' );
    });
  });

  describe( '.removeDate( date )', function() {
    it( 'should return a new mask with the date removed', function() {
      var mask = new recur.Mask( '2015-01-01|101' );
      expect( mask.removeDate( '2015-01-01' ).value ).to.equal( '2015-01-03|1' );
    });
  });

  describe( '.toggleDate( date )', function() {
    it( 'should return a new mask with the date added or removed based on the current value', function() {
      var mask = new recur.Mask( '2015-01-01|101' );
      mask = mask.toggleDate( '2015-01-02' );
      expect( mask.value ).to.equal( '2015-01-01|111' );
      mask = mask.toggleDate( '2015-01-02' );
      expect( mask.value ).to.equal( '2015-01-01|101' );
    });
  });

  describe( '.toggleDate( date, state )', function() {
    it( 'should return a new mask with the date added or removed based on the specified state', function() {
      var mask = new recur.Mask( '2015-01-01|101' );
      mask = mask.toggleDate( '2015-01-03', true );
      expect( mask.value ).to.equal( '2015-01-01|101' );
      mask = mask.toggleDate( '2015-01-02', true );
      expect( mask.value ).to.equal( '2015-01-01|111' );
      mask = mask.toggleDate( '2015-01-02', false );
      expect( mask.value ).to.equal( '2015-01-01|101' );
      mask = mask.toggleDate( '2015-01-02', false );
      expect( mask.value ).to.equal( '2015-01-01|101' );
    });
  });

  describe( 'Mask.fromDates( dates )', function() {
    it( 'should return a mask having occurrences on the specified dates', function() {
      var mask = recur.Mask.fromDates([ '2015-01-05', '2015-01-01', '2015-01-03' ]);
      expect( mask.value ).to.equal( '2015-01-01|10101' );
    });
  });

  describe( 'Mask.trim( mask )', function() {
    it( 'should remove leading and trailing zeros and update the start date accordingly', function() {
      expect( recur.Mask.trim( '2015-01-01|01010' ) ).to.equal( '2015-01-02|101' );
    });
  });

  describe( 'Mask.commonalize( maskA, maskB )', function() {
    it( 'should reformat masks to have the same start and end date', function() {
      var masks = recur.Mask.commonalize( '2015-01-01|101', '2015-01-02|10001' );
      expect( masks ).to.eql([
        '2015-01-01|101000',
        '2015-01-01|010001'
      ]);
    });
  });
});
