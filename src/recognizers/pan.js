/**
 * Pan
 * Recognized when the pointer is down and moved in the allowed direction.
 * @constructor
 * @extends AttrRecognizer
 */
function PanRecognizer() {
    AttrRecognizer.apply(this, arguments);

    this.pX = null;
    this.pY = null;
    this.lockedAxis = 0;
}

inherit(PanRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PanRecognizer
     */
    defaults: {
        event: 'pan',
        threshold: 10,
        pointers: 1,
        direction: DIRECTION_ALL
    },

    getTouchAction: function() {
        var direction = this.options.direction;
        var actions = [];
        if (direction & DIRECTION_HORIZONTAL) {
            actions.push(TOUCH_ACTION_PAN_Y);
        }
        if (direction & DIRECTION_VERTICAL) {
            actions.push(TOUCH_ACTION_PAN_X);
        }
        return actions;
    },

    directionTest: function(input) {
        var options = this.options;
        // var distance = input.distance;
        var x = Math.abs(input.deltaX);
        var y = Math.abs(input.deltaY);

        if (x === 0 && y === 0) {
          this.lockedAxis = 0;
          return false;
        }

        if (this.lockedAxis) {
          return !!(this.lockedAxis & options.direction);
        }

        if (x > y && x > options.threshold) {
          this.lockedAxis = DIRECTION_HORIZONTAL;
        } else if (y > x && y > options.threshold) {
          this.lockedAxis = DIRECTION_VERTICAL;
        } else {
          return false;
        }

        return !!(this.lockedAxis & options.direction);
    },

    attrTest: function(input) {
      var attr = AttrRecognizer.prototype.attrTest.call(this, input);

      return attr && (
        this.state & STATE_BEGAN ||
        (!(this.state & STATE_BEGAN) && this.directionTest(input))
      );
    },

    emit: function(input) {

        this.pX = input.deltaX;
        this.pY = input.deltaY;

        var direction = directionStr(input.direction);

        if (direction) {
            input.additionalEvent = this.options.event + direction;
        }
        this._super.emit.call(this, input);
    }
});
