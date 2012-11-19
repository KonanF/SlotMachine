(function (w, d, undefined) {
  'use strict';

  var M = {};

  M.Cylinder = function (planesNumber, placeToAppend) {
    var el = this.el = d.createElement('div');
    el.className = 'cylinder cf';

    var angle = this.angle = Math.floor(360/planesNumber);

    var html = '';
    for (var i = 0; i < planesNumber; ++i) {
      html += '<div class="plane" style="-webkit-transform: rotate3d(1, 0, 0,' + (i * angle) + 'deg)">' + (i + 1) + '</div>';
    }
    el.innerHTML = html;
    placeToAppend.appendChild(el);

    setTimeout(this.layout.bind(this), 1);
  };

  M.Cylinder.prototype.layout = function () {
    var children = this.el.children;
    var size = children.length;
    var z = 320; //px  
    var height = 50;//;px; (Math.cos((this.angle/2) * (180 / Math.PI)) * z * 2);

    for (var i = 0; i < size; ++i) {
      children[i].style.height = height + 'px';
      children[i].style.marginTop = -(height/2) + 'px';
      children[i].style.lineHeight = height + 'px';
    }
  };

  M.Cylinder.prototype.toggleBackfaceVisibility = function () {
    var children = this.el.children;
    var size = children.length;
    var value = 'visible';

    if (children[0].style['-webkit-backface-visibility'] === 'visible') {
      value = 'hidden';
    }

    for (var i = 0; i < size; ++i) {
      children[i].style['-webkit-backface-visibility'] = value;
    }
  };

  M.Cylinder.prototype.spin = function () {
    var rand = Math.ceil(Math.random() * 10);
    this.el.style['-webkit-transform'] = 'rotateX(' + (rand *this.angle) +'deg)';
  };

  M.SlotMachine = function (cylindersNumber, planesNumber) {
    this.cyliders = [];

    var el = this.el = d.createElement('div');
    el.className = 'machine';

    for (var i = 0; i < cylindersNumber; ++i) {
      this.cyliders.push(new M.Cylinder(planesNumber, el));
    }

    this.layout();

    d.body.appendChild(el);
  };

  
  M.SlotMachine.prototype.layout = function () {
    var children = this.el.childNodes;
    var size = children.length;
    var width = Math.floor(100/size) + '%';

    for (var i = 0; i < size; ++i) {
      children[i].style.width = width;
    }
  };

  M.SlotMachine.prototype.toggleBackfaceVisibility = function () {
    for (var i = 0, len = this.cyliders.length; i < len; ++i) {
      this.cyliders[i].toggleBackfaceVisibility();
    }
  };

  M.SlotMachine.prototype.toggleTransformStyle = function () {
    var style = this.el.style;
    if (style['-webkit-perspective'] === '0') {
      style['-webkit-perspective'] = '1000'; 
    } else {
      style['-webkit-perspective'] = 0; 
    }
  };

  M.SlotMachine.prototype.spin = function () {
    for (var i = 0, len = this.cyliders.length; i < len; ++i) {
      this.cyliders[i].spin();
    }
  };

  var machine = new M.SlotMachine(5, 12);

  var spinBtn = d.getElementById('spin');
  spinBtn.onclick = function () {
    machine.spin();
  };

  var transitionStyleBtn = d.getElementById('transition-style');
  transitionStyleBtn.onclick = function () {
    machine.toggleTransformStyle();
    if (this.className.indexOf('active') != -1) {
      this.className = 'btn-fb';
    } else {
      this.className = 'btn-fb active';
    }
  };

  var backfaceVisibilityBtn  = d.getElementById('backface-visibility');
  backfaceVisibilityBtn.onclick = function () {
    machine.toggleBackfaceVisibility();
    if (this.className.indexOf('active') != -1) {
      this.className = 'btn-fb';
    } else {
      this.className = 'btn-fb active';
    }
  };


}(window, document));
