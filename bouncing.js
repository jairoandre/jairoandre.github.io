'use strict';

// ///////////////////
// CONSTANTS
// ///////////////////

const RAD18 = 18 * Math.PI / 180;
const CP_RADII = 600;
const POD_RADII = 400;

// ///////////////////
// VECTOR CLASS
// ///////////////////

class Vector {

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  copy() {
    return new Vector(this.x, this.y);
  }

  add(v) {
    return new Vector(this.x + v.x, this.y + v.y);
  }

  sub(v) {
    return new Vector(this.x - v.x, this.y - v.y);
  }

  mult(n) {
    return new Vector(this.x * n, this.y * n);
  }

  div(n) {
    return new Vector(this.x / n, this.y / n);
  }

  rotateDegree(angle) {
    let angleInRadians = toRadians(angle);
    let sin = Math.sin(angleInRadians);
    let cos = Math.cos(angleInRadians);
    return new Vector(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
  }

  dist(v) {
    return Math.sqrt(Math.pow(v.x - this.x, 2) + Math.pow(v.y - this.y, 2));
  }

  magSquare() {
    return Math.pow(this.x, 2) + Math.pow(this.y, 2);
  }

  mag() {
    return Math.round(Math.sqrt(this.magSquare()));
  }

  normalize() {
    let mag = this.mag();
    return mag === 0 ? this : this.div(mag);
  }

  dot(v) {
    return this.x * v.x + this.y * v.y;
  }

  cross(v) {
    return this.x * v.y - this.y * v.x;
  }

  angleBetween(v) {
    return Math.acos(this.dot(v) / (this.mag() * v.mag()));
  }

  limit(n) {
    if (this.mag() > n) {
      return this.normalize().mult(n);
    }
    return this;
  }

  heading() {
    var heading = Math.atan2(this.y, this.x);
    return heading < 0 ? (2 * Math.PI + heading) : heading;
  }

  headingDegree() {
    return toDegrees(this.heading());
  }

  toPolar() {
    return new Polar(this.mag(), this.heading() * Math.PI / 180);
  }

}

// ///////////////////
// CHECKPOINT CLASS
// ///////////////////

class Polar {

  constructor(r, angle) {
    this.r = r;
    this.angle = angle;
    this.angleInRadians = toRadians(angle);
  }

  toVector() {
    return new Vector(this.r * Math.cos(this.angleInRadians), this.r * Math.sin(this.angleInRadians));
  }

  setTheta(angle) {
    this.angle = angle;
    this.angleInRadians = toRadians(angle);
    return this;
  }
}

// ///////////////////
// CHECKPOINT CLASS
// ///////////////////

class CheckPoint {

  constructor(id, position) {
    this.id = id;
    this.position = position;
    this.radius = CP_RADII;
  }

  draw(canvas) {
    var ctx = canvas.getContext('2d');
    ctx.save();
    ctx.scale(0.05, 0.05);
    ctx.translate(this.position.x, this.position.y);
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.fillStyle = 'rgba(120, 100, 255, 0.5)';
    ctx.fill();
    ctx.beginPath();
    ctx.font = '150px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText('CPid: ' + this.id, 0, 0);
    ctx.restore();
  }

}

// ///////////////////
// POD CLASS
// ///////////////////

class Pod {

  constructor(position, velocity, thrust, angle, currentCPId, checkpoints, lastthrust) {
    this.position = position;
    this.velocity = velocity;
    this.thrust = thrust;
    this.angle = angle;
    this.currentCPId = currentCPId === undefined ? 1 : currentCPId;
    this.checkpoints = checkpoints === undefined ? [] : checkpoints;
    this.mass = 1;
    this.radius = POD_RADII;
    this.maxspeed = 1127;
    this.maxthrust = 200;
    this.frictionCoeficient = 0.85;
    this.angleVelocity = 0;
    this.angleAcceleration = 0;
    this.lastthrust = lastthrust === undefined ? 0 : lastthrust;
  }

  copy() {
    return new Pod(this.position.copy(), this.velocity.copy(), this.thrust.copy(), this.angle, this.currentCPId, this.checkpoints, this.lastthrust, this.maxthrust);
  }

  setCurrentCPId(currentCPId) {
    this.currentCPId = currentCPId;
  }

  setCheckpoints(checkpoints) {
    this.checkpoints = checkpoints;
  }

  setMass(mass) {
    this.mass = mass;
  }

  rotateDegree(turn) {
    var copy = this.copy();
    copy.angle += turn;
    if (copy.angle >= 360) {
      copy.angle = 360 - copy.angle;
    } else if (copy.angle < 0) {
      copy.angle = 360 + copy.angle;
    }
    return copy;
  }

  setAngle(angle) {
    this.angle = angle;
  }

  update() {
    var copy = this.copy();
    copy.velocity = copy.velocity.add(copy.thrust).mult(copy.frictionCoeficient);
    copy.position = copy.position.add(copy.velocity);
    copy.lastthrust = copy.thrust.mag();
    copy.thrust = copy.thrust.mult(0);
    if (copy.innerCP()) {
      copy.currentCPId = (copy.currentCPId + 1) % copy.checkpoints.length;
    }
    return copy;
  }

  innerCP() {
    return this.position.sub(this.getCurrentCP().position).mag() <= CP_RADII;
  }

  getCurrentCP() {
    return this.checkpoints[this.currentCPId];
  }

  draw(canvas) {
    var ctx = canvas.getContext('2d');
    ctx.save();
    ctx.scale(0.05, 0.05);
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(toRadians(this.angle));
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 100, 255, 0.5)';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(this.radius, 0);
    ctx.lineTo(0, this.radius / 5);
    ctx.lineTo(0, -this.radius / 5);
    ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
    ctx.fill();
    ctx.restore();
  }

  checkEdges(canvas) {
    if (this.position.x > canvas.width - this.radius) {
      this.position.x = canvas.width - this.radius;
      this.velocity.x *= -1;
    } else if (this.position.x < this.radius) {
      this.position.x = this.radius;
      this.velocity.x *= -1;
    }

    if (this.position.y > canvas.height - this.radius) {
      this.position.y = canvas.height - this.radius;
      this.velocity.y *= -1;
    } else if (this.position.y < this.radius) {
      this.position.y = this.radius;
      this.velocity.y *= -1;
    }
  }

  applyForce(force) {
    var copy = this.copy();
    copy.thrust = this.thrust.add(force.div(this.mass));
    return copy;
  }

  applyFriction() {
    var copy = this.copy();
    copy.velocity = this.velocity.mult(this.frictionCoeficient);
    return copy;
  }

  createHtmlElement(element, text) {
    var elem = document.createElement(element);
    elem.innerHTML = text;
    return elem;
  }

  displayInfo(div) {
    div.appendChild(this.createHtmlElement('p', 'Position: ' + '(' + Math.round(this.position.x) + ', ' + Math.round(this.position.y) + ')'));
    div.appendChild(this.createHtmlElement('p', 'Velocity: ' + Math.trunc(this.velocity.mag())));
    div.appendChild(this.createHtmlElement('p', 'Velocity angle: ' + Math.trunc(this.velocity.headingDegree())));
    div.appendChild(this.createHtmlElement('p', 'Head angle: ' + Math.trunc(this.angle)));
    div.appendChild(this.createHtmlElement('p', 'Thrust: ' + Math.trunc(this.lastthrust)));
    div.appendChild(this.createHtmlElement('p', 'Current CP id: ' + this.currentCPId));
    div.appendChild(this.createHtmlElement('p', 'Current Score: ' + this.score()));
  }

  move(thrust, turn) {
    var copy = this.rotateDegree(turn);
    var force = new Vector(1, 0).mult(thrust);
    force = force.rotateDegree(copy.angle);
    return copy.applyForce(force).update();
  }

  distScore() {
    var dist = this.position.dist(this.getCurrentCP().position);
    if (dist <= CP_RADII) {
      return 100;
    } else {
      return 100 * (CP_RADII / dist);
    }
  }

  angleScore() {
    var desired = this.getCurrentCP().position.sub(this.position).normalize();
    var forward = new Vector(1, 0).rotateDegree(this.angle);
    var deltaAngle = toDegrees(forward.angleBetween(desired));
    if (deltaAngle > 180) {
      deltaAngle = 360 - deltaAngle;
    }
    return 100 * ((180 - deltaAngle) / 180);
  }

  score() {
    return (this.distScore() + 2 * this.angleScore()) / 3;
  }

  best(n) {
    var picked;
    var score = 0;
    for (var thrust = 0; thrust <= 200; thrust += 50) {
      for (var turn = 0; turn <= 18; turn += 1) {
        var move = this.move(thrust, turn);
        var iterScore = (n === 0) ? move.score() : move.best(n - 1).score();
        if (!picked || score < iterScore) {
          picked = move;
          score = iterScore;
        }
      }
    }
    return picked;
  }

  seekForCP(thrust) {
    var copy = this.copy();
    var target = copy.getCurrentCP();
    var desired = target.position.sub(copy.position).normalize().mult(copy.maxspeed);
    var steer = desired.sub(copy.velocity).limit(thrust);
    copy.angle = steer.headingDegree();

    /*
        if (copy.angle === -1) {
          copy.angle = steer.headingDegree()
        } else {
          var forward = new Vector(1, 0).rotateDegree(copy.angle)
          var angleBetween = toDegrees(forward.angleBetween(steer.normalize()))
          angleBetween = isNaN(angleBetween) ? 0 : angleBetween
          if (angleBetween > 18) {
            if (forward.cross(steer.normalize()) < 0) {
              console.log('-18')
              steer = new Vector(steer.mag(), 0).rotateDegree(copy.angle - 18)
            } else {
              console.log('+18')
              steer = new Vector(steer.mag(), 0).rotateDegree(copy.angle + 18)
            }
          } else {
            copy.angle = steer.headingDegree()
          }
        }
    */
    return copy.applyForce(steer);
  }
}

// ///////////////////
// UTILS FUNCTIONS
// ///////////////////

function getRandom2D (min, max) {
  return new Vector(getRandomInt(min, max), getRandomInt(min, max));
}

function getRandomPosition (xmin, xmax, ymin, ymax) {
  return new Vector(getRandomInt(xmin, xmax), getRandomInt(ymin, ymax));
}

function getRandomInt (min, max) {
  return Math.random() * (max - min) + min;
}

function toRadians (degree) {
  return degree * Math.PI / 180;
}

function toDegrees (radians) {
  return radians * 180 / Math.PI;
}

var VECTOR_ZERO = new Vector(0, 0);
var PROD_ENV = false;
var pods = [];
var checkpoints = [];

// ///////////////////
// CODINGAME
// ///////////////////
if (PROD_ENV) {
  var laps = parseInt(readline());
  var checkpointCount = parseInt(readline());

  for (var i = 0; i < checkpointCount; i++) {
    var inputs = readline().split(' ');
    var checkpointX = parseInt(inputs[0]);
    var checkpointY = parseInt(inputs[1]);
    checkpoints.push(new Vector(checkpointX, checkpointY));
  }

  // game loop
  while (true) {
    for (var i = 0; i < 4; i++) {
      var inputs = readline().split(' ');

      var x = parseInt(inputs[0]);
      var y = parseInt(inputs[1]);

      var position = new Vector(x, y);

      var vx = parseInt(inputs[2]);
      var vy = parseInt(inputs[3]);
      var velocity = new Vector(vx, vy);

      var angle = parseInt(inputs[4]);

      var ncpid = parseInt(inputs[5]);

      var pod = new Pod(position, velocity, new Vector(0, 0), checkpoints[ncpid], checkpoints[(ncpid + 1) % checkpointCount]);

      pods.push(pod);
    }

    // Write an action using print()
    // To debug: printErr('Debug messages...')

    pods[0].makeAMove();
    print('8000 4500 SHIELD');
  }
}

// ///////////////////
// LOCAL TEST
// ///////////////////

if (!PROD_ENV) {
  var generateCheckPoints = function (n) {
    var array = [];
    for (var i = 0; i < n; i++) {
      array.push(new CheckPoint(i, getRandomPosition(1200, 14000, 1200, 7800)));
    }
    return array;
  };

  var generatePods = function (n) {
    var array = [];
    for (var i = 0; i < n; i++) {
      array.push(new Pod(getRandomPosition(1200, 14000, 1200, 7800), VECTOR_ZERO, VECTOR_ZERO, -1, 1, checkpoints));
    }
    return array;
  };

  // checkpoints = [new CheckPoint(0, VECTOR_ZERO), new CheckPoint(1, new Vector(5000, 5000))]
  checkpoints = generateCheckPoints(4);
  pods = generatePods(1);

  var fps = 60;
  var now;
  var then = Date.now();
  var interval = 1000 / fps;
  var delta;

  var thrust = 60;

  var thrustInput = document.getElementById('thrust');

  thrustInput.value = thrust;

  var fpsInput = document.getElementById('fps');
  fpsInput.value = fps;

  document.getElementById('button').onclick = function () {
    thrust = thrustInput.value;
    fps = fpsInput.value;
    interval = 1000 / fps;
  };

  var drawFollowingBall = function () {
    var canvas = document.getElementById('mycanvas');
    var ctx = canvas.getContext('2d');
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    for (var i = 0; i < pods.length; i++) {
      // var start = Date.now()
      pods[i] = pods[i].best(1);
      // var end = Date.now()
      // console.log(end - start)
      pods[i].draw(canvas);
    }
    for (var j = 0; j < checkpoints.length; j++) {
      checkpoints[j].draw(canvas);
    }

    var info = document.getElementById('info');
    info.innerHTML = '';
    pods[0].displayInfo(info);
  // this.thrust = mousePosition.sub(this.position).normalize().mult(0.5)
  };

  var animate = function (highResTimestamp) {
    requestAnimationFrame(animate);
    now = Date.now();
    delta = now - then;
    if (delta > interval) {
      drawFollowingBall();
      then = now - (delta % interval);
    }
  };

  var getMousePos = function (canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return new Vector(evt.clientX - rect.left, evt.clientY - rect.top).mult(20);
  };

  var mousePosition = VECTOR_ZERO;

  var addMouseEventListener = function (canvas) {
    canvas.addEventListener('mousemove', function (evt) {
      mousePosition = getMousePos(canvas, evt);
    }, false);
  };

  // addMouseEventListener(document.getElementById('mycanvas'))
  var frameId = requestAnimationFrame(animate);
}
