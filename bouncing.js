'use strict'

function Vector (x, y) {
  this.x = x
  this.y = y
}

Vector.prototype.add = function (v) {
  return new Vector(this.x + v.x, this.y + v.y)
}

Vector.prototype.sub = function (v) {
  return new Vector(this.x - v.x, this.y - v.y)
}

Vector.prototype.mult = function (n) {
  return new Vector(this.x * n, this.y * n)
}

Vector.prototype.div = function (n) {
  return new Vector(this.x / n, this.y / n)
}

Vector.prototype.mag = function () {
  return Math.round(Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2)))
}

Vector.prototype.normalize = function () {
  var mag = this.mag()
  return mag === 0 ? this : this.div(mag)
}

Vector.prototype.limit = function (n) {
  if (this.mag() > n) {
    return  this.normalize().mult(n)
  }
  return this
}

function getRandom2D (min, max) {
  return new Vector(getRandomInt(min, max), getRandomInt(min, max))
}

function getRandomInt (min, max) {
  return Math.random() * (max - min) + min
}

function Pod (position, velocity, thrust, currentCP, nextCP) {
  this.position = position
  this.velocity = velocity
  this.thrust = thrust
  this.mass = 1
  this.maxspeed = 1127
  this.maxthrust = 200
  this.currentCP = currentCP
  this.nextCP = nextCP
  this.frictionCoeficient = (1 - 0.85)
}

Pod.prototype.update = function () {
  // this.thrust = mousePosition.sub(this.position).normalize().mult(0.5)
  this.velocity = this.velocity.add(this.thrust)
  this.velocity = this.velocity.limit(this.maxspeed)
  this.position = this.position.add(this.velocity)
  this.thrust = this.thrust.mult(0)
}

Pod.prototype.draw = function (canvas) {
  var ctx = canvas.getContext('2d')
  ctx.save()  
  ctx.moveTo(this.position.x, this.position.y)
  ctx.beginPath()
  ctx.arc(this.position.x, this.position.y, 5 * this.mass, 0, 2 * Math.PI)
  ctx.lineWidth = 5
  ctx.stroke()
  ctx.fillStyle = 'rgba(255, 100, 255, 0.5)'
  ctx.fill()
  ctx.restore()
}

Pod.prototype.checkEdges = function (canvas) {
  var radii = this.mass * 5
  if (this.position.x > canvas.width - radii) {
    this.position.x = canvas.width - radii
    this.velocity.x  *= -1
  } else if (this.position.x < radii) {
    this.position.x = radii
    this.velocity.x  *= -1
  }

  if (this.position.y > canvas.height - radii) {
    this.position.y = canvas.height - radii
    this.velocity.y *= -1
  } else if (this.position.y < radii) {
    this.position.y = radii
    this.velocity.y *= -1
  }
}

Pod.prototype.applyForce = function(force) {
  this.thrust = this.thrust.add(force.div(this.mass))
}

Pod.prototype.friction = function() {
  return this.velocity.normalize().mult(-1).mult(this.frictionCoeficient)
}

function generatePods (n) {
  var array = []
  for (var i = 0; i < n; i++) {
    array.push(new Pod(getRandom2D(0, 100), new Vector(0, 0), new Vector(0, 0), getRandomInt(1, 10), 10))
  }
  return array
}

var pods = generatePods(10)

function drawBouncingSquare () {
  var canvas = document.getElementById('mycanvas')
  var ctx = canvas.getContext('2d')
  ctx.save()
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.restore()
  for (var i = 0; i < pods.length; i++) {
    pods[i].applyForce(new Vector(0.1, 0))
    pods[i].applyForce(new Vector(0, 0.5))
    pods[i].applyForce(pods[i].friction())
    pods[i].update()
    pods[i].checkEdges(canvas)
    pods[i].draw(canvas)
  }
}

function init () {
  var canvas = document.getElementById('mycanvas')
  addMouseEventListener(canvas)
  setInterval(drawBouncingSquare, 5)
}

function getMousePos (canvas, evt) {
  var rect = canvas.getBoundingClientRect()
  return new Vector(evt.clientX - rect.left, evt.clientY - rect.top)
}

var mousePosition = new Vector(0, 0)

function addMouseEventListener (canvas) {
  canvas.addEventListener('mousemove', function (evt) {
    mousePosition = getMousePos(canvas, evt)
  }, false)
}


var PROD_ENV = true

if(!PROD_ENV) {
  init()
}

/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

var laps = parseInt(readline());
var checkpointCount = parseInt(readline());

var checkpoints = []

for (var i = 0; i < checkpointCount; i++) {
    var inputs = readline().split(' ');
    var checkpointX = parseInt(inputs[0]);
    var checkpointY = parseInt(inputs[1]);
    checkpoints.push(new Vector(checkpointX, checkpointY))
}

Pod.prototype.seek = function () {
  var desired = this.currentCP.sub(this.position).normalize().mult(this.maxspeed)
  var steer = desired.sub(this.velocity).limit(this.maxthrust)
  this.applyForce(steer)
  var thrust = this.thrust.mag()
  this.update()
  print(Math.round(this.position.x) + ' ' + Math.round(this.position.y) + ' ' + thrust)
}

// game loop
while (PROD_ENV) {
    var pods = []
    for (var i = 0; i < 4; i++) {
        var inputs = readline().split(' ');

        var x = parseInt(inputs[0]);
        var y = parseInt(inputs[1]);
        
        var position = new Vector (x, y)

        var vx = parseInt(inputs[2]);
        var vy = parseInt(inputs[3]);
        var velocity = new Vector (vx, vy)

        var angle = parseInt(inputs[4]);

        var ncpid = parseInt(inputs[5]);
        
        var pod = new Pod(position, velocity, new Vector(0, 0), checkpoints[ncpid], checkpoints[(ncpid + 1) % checkpointCount])

        pods.push(pod)
    }
    

    // Write an action using print()
    // To debug: printErr('Debug messages...');

    pods[0].seek()
    print('8000 4500 SHIELD');
}
