(function (w, d, undefined) {
  'use strict';

  if (!Function.prototype.bind) {
    Function.prototype.bind = function (ctx /* ... */) {
      var that  = this;
      var slice = Array.prototype.slice;
      var args  = slice.call(arguments, 1);

      var fn = function () {
        return that.apply(ctx, args.concat(slice.call(arguments)));
      };

      return fn;
    };
  }

  // Main namespace
  var M = {};

  // Cylinder constructor
  M.Cylinder = function (planesNumber, placeToAppend) {
    var el = this.el = d.createElement('div');
    el.className = 'cylinder';

    var angle = this.angle = 360/planesNumber; // computes single plane angle step
    var z = 250; // because of translateZ below  

    // Initial values of cylinder
    // Object for emulating dummy event system
    this.listeners = {};
    // Flag for preventing double spining
    this.isSpinning = false;
    // The rest initial values :)
    this.value = 0;
    this.rotation = 0;
    this.planesNumber = planesNumber;
    this.height = Math.sin((this.angle/2) * (Math.PI/180)) * z * 2;
    this.el.style.height = this.height + 'px';

    // Creates html struct of planes in cylinder
    var html = '';
    for (var i = 0, rand; i < planesNumber; ++i) {
      rand = 2 + Math.floor(Math.random() * 13);
      if (rand === 11) {
        rand = 'J';
      } else if (rand === 12) {
        rand = 'D';
      } else if (rand === 13) {
        rand = 'K';
      } else if (rand === 14) {
        rand = 'A';
      }
      html += '<div class="plane" data-base-transform="rotateX(' + (i * angle) + 'deg) translateZ(250px)" style="-webkit-transform: rotateX(' + (i * angle) + 'deg) translateZ(250px)">' + rand + '</div>';
    }

    el.innerHTML = html;
    placeToAppend.appendChild(el);

    setTimeout(this.layout.bind(this), 1);
  };

  M.Cylinder.prototype.layout = function () {
    var children = this.el.children;
    var size = children.length;

    for (var i = 0; i < size; ++i) {
      children[i].style.height = this.height + 'px';
      children[i].style.fontSize = this.height/3 + 'px';
      children[i].style.lineHeight = this.height + 'px';
    }
  };

  M.Cylinder.prototype.spin = function () {
    if (this.isSpinning) {
      return;
    }

    this.isSpinning = true;

    var el = this.el;

    el.style['-webkit-transition-duration'] = '2s';
    el.style['-webkit-transform'] = 'translateZ(-250px) rotateX(' + (this.rotation + 90) +'deg)';

    // add fancy spin back 
    this.transitionEndCallbackBack = this.onTransitionEndBack.bind(this);
    el.addEventListener('transitionEnd', this.transitionEndCallbackBack, false);
    el.addEventListener('webkitTransitionEnd', this.transitionEndCallbackBack, false);
  };

  M.Cylinder.prototype.onTransitionEndBack = function () {
    var el = this.el;
    var rand = Math.ceil(Math.random() * 2 * this.planesNumber);

    el.removeEventListener('transitionEnd', this.transitionEndCallbackBack, false);
    el.removeEventListener('webkitTransitionEnd', this.transitionEndCallbackBack, false);

    this.value += rand;
    this.rotation -= rand * this.angle;

    el.style['-webkit-transition-duration'] = 1 + (5 / rand%this.planesNumber) + 's';
    el.style['-webkit-transform'] = 'translateZ(-250px) rotateX(' + (this.rotation) +'deg)';

    this.transitionEndCallbackForward = this.onTransitionEndForward.bind(this);
    el.addEventListener('transitionEnd', this.transitionEndCallbackForward, false);
    el.addEventListener('webkitTransitionEnd', this.transitionEndCallbackForward, false);
  };

  M.Cylinder.prototype.onTransitionEndForward = function () {
    var el = this.el;
    var style = el.children[this.getValue()].style;

    el.removeEventListener('transitionEnd', this.transitionEndCallbackForward, false);
    el.removeEventListener('webkitTransitionEnd', this.transitionEndCallbackForward, false);

    this.isSpinning = false;

    this.listeners['spinEnd'](this);
  };

  M.Cylinder.prototype.getValue = function () {
    return this.value%this.planesNumber;
  };

  M.SlotMachine = function (cylindersNumber, planesNumber) {
    this.cylinders = [];
    this.planesNumber = planesNumber;

    // creates DOM struct for machine
    var el = this.el = d.createElement('div');
    el.className = 'machine';

    var container = d.createElement('div');
    container.className = 'container';
    el.appendChild(container);

    // Creates and append cylinders to slot machine
    for (var i = 0, cylinder; i < cylindersNumber; ++i) {
      cylinder = new M.Cylinder(planesNumber, container);
      cylinder.listeners['spinEnd'] = this.onSpinEnd.bind(this);
      this.cylinders.push(cylinder);
    }

    // Init call for setting 3d style of transform from begining
    this.togglePerspective();
    // Compute and set proper percentage width to cylinders
    this.layout();

    // Appends machine to body
    d.body.appendChild(el);
  };

  M.SlotMachine.prototype.onSpinEnd = function () {
    var spining = false;
    var values = [];

    for (var i = 0, len = this.cylinders.length, cylinder; i < len; ++i) {
      cylinder = this.cylinders[i];
      if (cylinder.isSpinning) {
        spining = true;
        values[i] = '';
      } else {
        values[i] = cylinder.getValue();
      }
    }

    if (!spining) {
      this.calculateScore(values);
    }
  },


  M.SlotMachine.prototype.calculateScore = function (values) {
    var main = values;
    // should be more flexible if at the end of a day need to support more than 5 cylinders
    var diagonalTopBottom = [values[0]-2, values[1]-1, values[2], values[3]+1, values[4]+2];
    var diagonalBottomTop = [values[0]+2, values[1]+1, values[2], values[3]-1, values[4]-2];
    var lineAbove = [values[0]+1, values[1]+1, values[2]+1, values[3]+1, values[4]+1];
    var lineBelow = [values[0]-1, values[1]-1, values[2]-1, values[3]-1, values[4]-1];

    // not elegant way to perform sequence execution
    var nextnextnextnext = this.calculateLine.bind(this, lineBelow);
    var nextnextnext = this.calculateLine.bind(this, lineAbove, nextnextnextnext);
    var nextnext = this.calculateLine.bind(this, diagonalBottomTop, nextnextnext);
    var next = this.calculateLine.bind(this, diagonalTopBottom, nextnext);

    this.calculateLine(values, next);
  },

  M.SlotMachine.prototype.calculateLine = function (indices, next) {
    var values = []; 

    for (var i = 0, len = indices.length; i < len; ++i) {
      if (indices[i] < 0) {
        indices[i] = this.planesNumber + indices[i];
      } else if (indices[i] >= this.planesNumber){
        indices[i] = indices[i] - this.planesNumber;
      }
    }

    for (var i = 0, len = indices.length; i < len; ++i) {
      values[i] = this.cylinders[i].el.children[indices[i]].innerHTML;
    }

    this.nOfKind(indices, values, next);
  },

  M.SlotMachine.prototype.nOfKind = function (indices, values, next) {
    var result = {};
    for (var i = 0, len = values.length, key; i < len; ++i) {
      key = values[i];
      result[key] = typeof result[key] === 'undefined' ? 1 : result[key]+1; 
    }

    // highlight currently checked line
    for (var j = 0, lenJ = indices.length, element; j < lenJ; ++j) {
      element = this.cylinders[j].el.children[indices[j]];
      element.style['-webkit-transform'] =  element.getAttribute('data-base-transform') + " translateZ(50px)";
      element.style['background-color'] = "red";
    }

    // highlight green hits
    for(var i = 0, keys = Object.keys(result), len = keys.length; i < len; ++i) {
      if (result[keys[i]] >= 2) {
        for (var j = 0, lenJ = indices.length, element; j < lenJ; ++j) {
          element = this.cylinders[j].el.children[indices[j]];
          if (element.innerHTML === keys[i]) {
            element.style['-webkit-transform'] += "translateZ(100px) scale(2)";
            element.style['background-color'] = "green";
          }
        }
      }
    }

    // roll back styles
    setTimeout(function () {
      for(var i = 0, keys = Object.keys(result), len = keys.length; i < len; ++i) {
        for (var j = 0, lenJ = indices.length, element; j < lenJ; ++j) {
          element = this.cylinders[j].el.children[indices[j]];
          element.style['-webkit-transform'] = element.getAttribute('data-base-transform');
          element.style['background-color'] = "#000";
        }
      }

      // proced with next line or executes onSpinEnd callback 
      if (next) {
        next();
      } else {
        this.isSpinning = false;
        if (this.onSpinEnd) {
          this.onSpinEnd();
        }
      }
    }.bind(this), 1000);
  }, 

  // Computes percentage width for each cylinder in slot machine 
  M.SlotMachine.prototype.layout = function () {
    var children = this.el.firstChild.childNodes;
    var size = children.length;
    var width = Math.floor(100/size) + '%';

    for (var i = 0; i < size; ++i) {
      children[i].style.width = width;
    }
  };

  // Rotates entire slot machine
  M.SlotMachine.prototype.toggleRotate = function () {
    var style = this.el.firstChild.style;
    if (style['-webkit-transform'] !== 'rotateY(30deg)') {
      style['-webkit-transform'] = 'rotateY(30deg)';
    } else {
      style['-webkit-transform'] = '';
    }
  };

  // Makes flat perspective
  M.SlotMachine.prototype.togglePerspective = function () {
    var style = this.el.firstChild.style;
    if (style['-webkit-transform-style'] === 'preserve-3d') {
      style['-webkit-transform-style'] = 'flat'; 
    } else {
      style['-webkit-transform-style'] = 'preserve-3d'; 
    }
  };

  // Triggers spin for each cylider
  M.SlotMachine.prototype.spin = function () {
    if (this.isSpinning) {
      return; 
    }

    this.isSpinning = true;

    for (var i = 0, len = this.cylinders.length; i < len; ++i) {
      this.cylinders[i].spin();
    }
  };

  // creates instance of SlotMachine(numberOfCylinders, numberOfFaces);
  var machine = new M.SlotMachine(5, 24);

  // helper for making btns active
  var toggleBtn = function () {
    if (this.className.indexOf('active') != -1) {
      this.className = 'btn-fb';
    } else {
      this.className = 'btn-fb active';
    }
  };

  // control bindings
  var spin = d.getElementById('spin');
  spin.onclick = function () {
    spin.className = 'btn-grey';
    machine.spin();
    machine.onSpinEnd = function () {
      spin.className = 'btn-fb';
    };
  };

  d.getElementById('perspective').onclick = function () {
    machine.togglePerspective();
    toggleBtn.call(this);
  };

  d.getElementById('rotate').onclick = function () {
    machine.toggleRotate();
    toggleBtn.call(this);
  };

}(window, document));
