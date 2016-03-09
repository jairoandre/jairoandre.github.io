/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

var road = parseInt(readline()); // the length of the road before the gap.
var gap = parseInt(readline()); // the length of the gap.
var platform = parseInt(readline()); // the length of the landing platform.

var Bike = function (coordX, speed) {
  this.coordX = coordX;
  this.speed = speed;
};

Bike.prototype.nextCoord = function (command) {
  switch (command) {
    case 'SPEED':
      return this.coordX + 1 + this.speed;
    case 'SLOW':
      return this.coordX + (this.speed === 0 ? 0 : (this.speed - 1));
    default:
      return this.coordX + this.speed;
  }
};

Bike.prototype.atRoad = function () {
  return this.distToRoadEdge() > 0;
};

Bike.prototype.distToRoadEdge = function () {
  return road - this.coordX;
};

Bike.prototype.canJump = function () {
  return ((this.coordX + this.speed) === (road + gap));
};

Bike.prototype.atGap = function () {
  return (this.coordX >= road) && (this.coordX < (road + gap));
};

Bike.prototype.atPlatform = function () {
  return (this.coordX >= (road + gap));
};

Bike.prototype.distToGap = function () {
  return road - (this.coordX - 1);
};

Bike.prototype.move = function () {
  if (this.atRoad()) {
    if (this.canJump()) {
      print('JUMP');
    } else if (this.speed < gap) {
      print('SPEED');
    } else if (this.speed > gap) {
      print('SLOW');
    }
  } else {
    print('SLOW');
  }
};

let tick = 0;

// game loop
while (true) {
  var speed = parseInt(readline()); // the motorbike's speed.
  var coordX = parseInt(readline()); // the position on the road of the motorbike.

  printErr(tick++);
  printErr(speed);
  printErr(coordX);

  var bike = new Bike(coordX, speed);

  bike.move();

  // Write an action using print()
  // To debug: printErr('Debug messages...')

// print('SPEED'); // A single line containing one of 4 keywords: SPEED, SLOW, JUMP, WAIT.
}
