'use strict'

function Vector (x, y) {
  this.x = x
  this.y = y
}

Vector.prototype.add = function (v) {
  return new Vector(this.x + v.x, this.y + v.y)
}

Vector.prototype.multX = function (s) {
  return new Vector(this.x *= s, this.y)
}

Vector.prototype.multY = function (s) {
  return new Vector(this.x, this.y *= s)
}

var position = new Vector(10, 10)
var speed = new Vector(1, 1)

function draw () {
  var canvas = document.getElementById('mycanvas')
  var ctx = canvas.getContext('2d')
  ctx.save()
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  position = position.add(speed)

  if (position.x > canvas.width || position.x < 0) {
    speed = speed.multX(-1)
  }

  if (position.y > canvas.height || position.y < 0) {
    speed = speed.multY(-1)
  }

  ctx.moveTo(position.x, position.y)
  ctx.fillRect(position.x, position.y, 20, 20)
  ctx.restore()
}

function init () {
  setInterval(draw, 25)
}

init()
