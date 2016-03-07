/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

var road = parseInt(readline()); // the length of the road before the gap.
var gap = parseInt(readline()); // the length of the gap.
var platform = parseInt(readline()); // the length of the landing platform.

var Bike = function (coordX, speed) {
  this.coordX = coordX
  this.speed = speed
}

Bike.prototype.atRoad = function () {
  return this.coordX <= (road - 1)
}

Bike.prototype.canJump = function () {
  return ((this.coordX + this.speed) === (roda + gap))
}

Bike.prototype.canJumpNextTick = function () {
  return (this.coordX + this.speed) >= (road - 1)
}

Bike.prototype.atGap = function () {
  return (this.coordX >= road) && (this.coordX < (road + gap))
}

Bike.prototype.atPlatform = function () {
  return (this.coordX >= (road + gap))
}

Bike.prototype.distToGap = function () {
  return road - (this.coordX - 1)
}

Bike.prototype.move = function () {
  if (this.atRoad()) {
    if (this.canJump()) {
      print('JUMP')
    } else {
      print('SPEED')
    }
  } else {
    print('SLOW')
  }
}

// game loop
while (true) {
  var speed = parseInt(readline()); // the motorbike's speed.
  var coordX = parseInt(readline()); // the position on the road of the motorbike.

  var bike = new Bike(coordX, speed)

  bike.move()

  // Write an action using print()
  // To debug: printErr('Debug messages...')

// print('SPEED'); // A single line containing one of 4 keywords: SPEED, SLOW, JUMP, WAIT.
}
