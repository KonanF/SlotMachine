(function (w, d, undefined) {
  'use strict';

  var M = {};

  M.Cylinder = function (planesNumber, placeToAppend) {
    var el = this.el = d.createElement('div');
    el.className = 'cylinder cf';

    var angle = this.angle = Math.floor(360/planesNumber);

    var z = 250; //px  
    this.rotation = 0;
    this.planesNumber = planesNumber;
    this.height = Math.sin((this.angle/2) * (Math.PI/180)) * z * 2;
    this.el.style.height = this.height + 'px';

    var html = '';
    for (var i = 0; i < planesNumber; ++i) {
      html += '<div class="plane" style="-webkit-transform: rotateX(' + (i * angle) + 'deg) translateZ(250px)">' + (i + 1) + '</div>';
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
      children[i].style.lineHeight = this.height + 'px';
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
    var rand = Math.ceil(Math.random() * 3 * this.planesNumber);
    this.rotation = rand *this.angle;
    this.el.style['-webkit-transform'] = 'translateZ(-250px) rotateX(' + (this.rotation) +'deg)';
  };

  M.SlotMachine = function (cylindersNumber, planesNumber) {
    this.cyliders = [];

    var el = this.el = d.createElement('div');
    el.className = 'machine';

    var container = d.createElement('div');
    container.className = 'container';
    el.appendChild(container);

    for (var i = 0; i < cylindersNumber; ++i) {
      this.cyliders.push(new M.Cylinder(planesNumber, container));
    }

    this.togglePerspective();
    this.layout();

    d.body.appendChild(el);
  };

  
  M.SlotMachine.prototype.layout = function () {
    var children = this.el.firstChild.childNodes;
    var size = children.length;
    var width = Math.floor(100/size) + '%';

    for (var i = 0; i < size; ++i) {
      children[i].style.width = width;
    }
  };

  M.SlotMachine.prototype.toggleBackfaceVisibility = function () {
    var style = this.el.firstChild.style;
    if (style['-webkit-transform'] !== 'rotateY(30deg)') {
      style['-webkit-transform'] = 'rotateY(30deg)';
    } else {
      style['-webkit-transform'] = '';
    }
    
    for (var i = 0, len = this.cyliders.length; i < len; ++i) {
      this.cyliders[i].toggleBackfaceVisibility();
    }
  };

  M.SlotMachine.prototype.togglePerspective = function () {
    var style = this.el.style;
    if (style['-webkit-perspective'] === '100000') {
      style['-webkit-perspective'] = '5000'; 
    } else {
      style['-webkit-perspective'] = '100000'; 
    }
  };

  M.SlotMachine.prototype.spin = function () {
    for (var i = 0, len = this.cyliders.length; i < len; ++i) {
      this.cyliders[i].spin();
    }
  };

  var machine = new M.SlotMachine(5, 36);

  var spinBtn = d.getElementById('spin');
  spinBtn.onclick = function () {
    machine.spin();
  };

  var perspectiveBtn = d.getElementById('perspective');
  perspectiveBtn.onclick = function () {
    machine.togglePerspective();
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
