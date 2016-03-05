'use strict'

// ///////////////////
// CONSTANTS
// ///////////////////

var RAD18 = 18 * Math.PI / 180
var CP_RADII = 600
var POD_RADII = 400

// ///////////////////
// VECTOR CLASS
// ///////////////////

class Vector {

  constructor (x, y) {
    this.x = x
    this.y = y
  }

  get () {
    return new Vector(this.x, this.y)
  }

  add (v) {
    return new Vector(this.x + v.x, this.y + v.y)
  }

  sub (v) {
    return new Vector(this.x - v.x, this.y - v.y)
  }

  mult (n) {
    return new Vector(this.x * n, this.y * n)
  }

  div (n) {
    return new Vector(this.x / n, this.y / n)
  }

  dist (v) {
    return Math.sqrt(Math.pow(v.x - this.x, 2) + Math.pow(v.y - this.y, 2))
  }

  mag () {
    return Math.round(Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2)))
  }

  normalize () {
    var mag = this.mag()
    return mag === 0 ? this : this.div(mag)
  }

  dot (v) {
    return this.x * v.x + this.y * v.y
  }

  angleBetween (v) {
    return Math.acos(this.dot(v) / (this.mag() * v.mag()))
  }

  limit (n) {
    if (this.mag() > n) {
      return this.normalize().mult(n)
    }
    return this
  }

  heading () {
    return Math.atan2(this.y, this.x)
  }

  headingDegree () {
    return toDegrees(this.heading())
  }

  toPolar () {
    return new Polar(this.mag(), this.heading() * Math.PI / 180)
  }

}

// ///////////////////
// CHECKPOINT CLASS
// ///////////////////

class Polar {

  constructor (r, theta) {
    this.r = r
    this.theta = theta
    this.thetaInRadians = toRadians(theta)
  }

  toVector () {
    return new Vector(this.r * Math.cos(this.thetaInRadians), this.r * Math.sin(this.thetaInRadians))
  }

  setTheta (theta) {
    this.theta = theta
    this.thetaInRadians = toRadians(theta)
    return this
  }
}

// ///////////////////
// CHECKPOINT CLASS
// ///////////////////

class CheckPoint {

  constructor (id, position) {
    this.id = id
    this.position = position
    this.radius = CP_RADII
  }

  draw (canvas) {
    var ctx = canvas.getContext('2d')
    ctx.save()
    ctx.scale(0.05, 0.05)
    ctx.translate(this.position.x, this.position.y)
    ctx.beginPath()
    ctx.arc(0, 0, this.radius, 0, 2 * Math.PI)
    ctx.lineWidth = 5
    ctx.stroke()
    ctx.fillStyle = 'rgba(120, 100, 255, 0.5)'
    ctx.fill()
    ctx.beginPath()
    ctx.font = '150px Arial'
    ctx.fillStyle = '#fff'
    ctx.fillText('CPid: ' + this.id, 0, 0)
    ctx.restore()
  }

}

// ///////////////////
// POD CLASS
// ///////////////////

class Pod {

  constructor (position, velocity, thrust, angle, currentCPId, checkpoints, lastthrust) {
    this.position = position
    this.velocity = velocity
    this.thrust = thrust
    this.angle = angle
    this.currentCPId = currentCPId === undefined ? 1 : currentCPId
    this.checkpoints = checkpoints === undefined ? [] : checkpoints
    this.mass = 1
    this.radius = POD_RADII
    this.maxspeed = 1127
    this.maxthrust = 200
    this.frictionCoeficient = 0.85
    this.angleVelocity = 0
    this.angleAcceleration = 0
    this.lastthrust = lastthrust === undefined ? 0 : lastthrust
  }

  get () {
    return new Pod(this.position.get(), this.velocity.get(), this.thrust.get(), this.angle, this.currentCPId, this.checkpoints, this.lastthrust, this.maxthrust)
  }

  setCurrentCPId (currentCPId) {
    this.currentCPId = currentCPId
  }

  setCheckpoints (checkpoints) {
    this.checkpoints = checkpoints
  }

  setMass (mass) {
    this.mass = mass
  }

  setMaxspeed (maxspeed) {
    this.maxspeed = maxspeed
  }

  setAngleVelocity (angleVelocity) {
    this.angleVelocity = angleVelocity
  }

  setAngleAcceleration (angleAcceleration) {
    this.angleAcceleration = angleAcceleration
  }

  setAngle (angle) {
    this.angle = angle
  }

  update () {
    var copy = this.get()
    copy.velocity = copy.velocity.add(copy.thrust).mult(copy.frictionCoeficient)
    copy.position = copy.position.add(copy.velocity)
    copy.lastthrust = copy.thrust.mag()
    copy.thrust = copy.thrust.mult(0)
    if (copy.innerCP()) {
      copy.currentCPId = (copy.currentCPId + 1) % copy.checkpoints.length
    }
    return copy
  }

  innerCP () {
    return this.position.sub(this.getCurrentCP().position).mag() <= CP_RADII
  }

  getCurrentCP () {
    return this.checkpoints[this.currentCPId]
  }

  draw (canvas) {
    var ctx = canvas.getContext('2d')
    ctx.save()
    ctx.scale(0.05, 0.05)
    ctx.translate(this.position.x, this.position.y)
    ctx.rotate(this.velocity.heading())
    ctx.beginPath()
    ctx.arc(0, 0, this.radius, 0, 2 * Math.PI)
    ctx.lineWidth = 5
    ctx.stroke()
    ctx.fillStyle = 'rgba(255, 100, 255, 0.5)'
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(this.radius, 0)
    ctx.lineTo(0, this.radius / 5)
    ctx.lineTo(0, -this.radius / 5)
    ctx.fillStyle = 'rgba(0, 0, 255, 0.5)'
    ctx.fill()
    ctx.restore()
  }

  checkEdges (canvas) {
    if (this.position.x > canvas.width - this.radius) {
      this.position.x = canvas.width - this.radius
      this.velocity.x *= -1
    } else if (this.position.x < this.radius) {
      this.position.x = this.radius
      this.velocity.x *= -1
    }

    if (this.position.y > canvas.height - this.radius) {
      this.position.y = canvas.height - this.radius
      this.velocity.y *= -1
    } else if (this.position.y < this.radius) {
      this.position.y = this.radius
      this.velocity.y *= -1
    }
  }

  applyForce (force) {
    var copy = this.get()
    copy.thrust = this.thrust.add(force.div(this.mass))
    return copy
  }

  applyFriction () {
    var copy = this.get()
    copy.velocity = this.velocity.mult(this.frictionCoeficient)
    return copy
  }

  createHtmlElement (element, text) {
    var elem = document.createElement(element)
    elem.innerHTML = text
    return elem
  }

  displayInfo (div) {
    div.appendChild(this.createHtmlElement('p', 'Position: ' + '(' + Math.round(this.position.x) + ', ' + Math.round(this.position.y) + ')'))
    div.appendChild(this.createHtmlElement('p', 'Velocity: ' + Math.trunc(this.velocity.mag())))
    div.appendChild(this.createHtmlElement('p', 'Thrust: ' + Math.trunc(this.lastthrust)))
  }

  seekForCP () {
    var desired = this.getCurrentCP().position.sub(this.position).normalize().mult(this.maxspeed)
    console.log(toDegrees(this.getCurrentCP().position.angleBetween(this.position)))
    var steer = desired.sub(this.velocity).limit(this.maxthrust)
    return this.applyForce(steer)
  }
}

// ///////////////////
// UTILS FUNCTIONS
// ///////////////////

function getRandom2D (min, max) {
  return new Vector(getRandomInt(min, max), getRandomInt(min, max))
}

function getRandomPosition (xmin, xmax, ymin, ymax) {
  return new Vector(getRandomInt(xmin, xmax), getRandomInt(ymin, ymax))
}

function getRandomInt (min, max) {
  return Math.random() * (max - min) + min
}

function toRadians (degree) {
  return degree * Math.PI / 180
}

function toDegrees (radians) {
  return radians * 180 / Math.PI
}

var VECTOR_ZERO = new Vector(0, 0)
var PROD_ENV = false
var pods = []
var checkpoints = []

// ///////////////////
// CODINGAME
// ///////////////////
if (PROD_ENV) {
  var laps = parseInt(readline())
  var checkpointCount = parseInt(readline())

  for (var i = 0; i < checkpointCount; i++) {
    var inputs = readline().split(' ')
    var checkpointX = parseInt(inputs[0])
    var checkpointY = parseInt(inputs[1])
    checkpoints.push(new Vector(checkpointX, checkpointY))
  }

  // game loop
  while (true) {
    for (var i = 0; i < 4; i++) {
      var inputs = readline().split(' ')

      var x = parseInt(inputs[0])
      var y = parseInt(inputs[1])

      var position = new Vector(x, y)

      var vx = parseInt(inputs[2])
      var vy = parseInt(inputs[3])
      var velocity = new Vector(vx, vy)

      var angle = parseInt(inputs[4])

      var ncpid = parseInt(inputs[5])

      var pod = new Pod(position, velocity, new Vector(0, 0), checkpoints[ncpid], checkpoints[(ncpid + 1) % checkpointCount])

      pods.push(pod)
    }

    // Write an action using print()
    // To debug: printErr('Debug messages...')

    pods[0].makeAMove()
    print('8000 4500 SHIELD')
  }
}

// ///////////////////
// LOCAL TEST
// ///////////////////

if (!PROD_ENV) {
  var generateCheckPoints = function (n) {
    var array = []
    for (var i = 0; i < n; i++) {
      array.push(new CheckPoint(i, getRandomPosition(1200, 14000, 1200, 7800)))
    }
    return array
  }

  var generatePods = function (n) {
    var array = []
    for (var i = 0; i < n; i++) {
      array.push(new Pod(getRandomPosition(1200, 14000, 1200, 7800), VECTOR_ZERO, VECTOR_ZERO, -1, 1, checkpoints))
    }
    return array
  }

  checkpoints = generateCheckPoints(3)
  pods = generatePods(1)

  var fps = 1
  var now
  var then = Date.now()
  var interval = 1000 / fps
  var delta

  var thrust = 200

  var thrustInput = document.getElementById('thrust')

  thrustInput.value = thrust

  var fpsInput = document.getElementById('fps')

  fpsInput.value = fps

  document.getElementById('button').onclick = function () {
    thrust = thrustInput.value
    fps = fpsInput.value
    interval = 1000 / fps
  }

  var drawFollowingBall = function () {
    var canvas = document.getElementById('mycanvas')
    var ctx = canvas.getContext('2d')
    ctx.save()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.restore()
    for (var i = 0; i < pods.length; i++) {
      pods[i].maxthrust = thrust
      pods[i] = pods[i].seekForCP().update()
      pods[i].draw(canvas)
    }
    for (var j = 0; j < checkpoints.length; j++) {
      checkpoints[j].draw(canvas)
    }

    var info = document.getElementById('info')
    info.innerHTML = ''
    pods[0].displayInfo(info)
  // this.thrust = mousePosition.sub(this.position).normalize().mult(0.5)
  }

  var animate = function (highResTimestamp) {
    requestAnimationFrame(animate)
    now = Date.now()
    delta = now - then
    if (delta > interval) {
      drawFollowingBall()
      then = now - (delta % interval)
    }
  }

  var getMousePos = function (canvas, evt) {
    var rect = canvas.getBoundingClientRect()
    return new Vector(evt.clientX - rect.left, evt.clientY - rect.top).mult(20)
  }

  var mousePosition = VECTOR_ZERO

  var addMouseEventListener = function (canvas) {
    canvas.addEventListener('mousemove', function (evt) {
      mousePosition = getMousePos(canvas, evt)
    }, false)
  }

  // addMouseEventListener(document.getElementById('mycanvas'))
  var frameId = requestAnimationFrame(animate)
}
