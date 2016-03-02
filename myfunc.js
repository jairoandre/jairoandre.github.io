var innerCircle = function(ca, cb, r) {
    return calcDelta(ca, cb) <= r;
}

var hypotenuse = function(a, b) {
    return Math.sqrt(Math.pow(a,2) + Math.pow(b,2));
}

var calcDelta = function(coordsA, coordsB) {
    var a = coordsA.x - coordsB.x;
    var b = coordsA.y - coordsB.y;
    return hypotenuse(a, b);
};

var _18Degrees = 0.314159;

var move = function (pod, turn, thrust) {

  var newAngle = pod.angle + turn;
  newAngle = newAngle < 0 ? (360 + newAngle) : newAngle;

  var newAngleInRadians = newAngle * Math.PI/180;

  var iVx = pod.vx + thrust * Math.cos(newAngleInRadians);
  var iVy = pod.vy + thrust * Math.sin(newAngleInRadians);

  var newX = Math.round(pod.x + iVx);
  var newY = Math.round(pod.y + iVy);

  var newVx = Math.trunc(iVx * 0.85);
  var newVy = Math.trunc(iVy * 0.85);

  return {x: newX, y: newY, vx: newVx, vy: newVy, angle: newAngle, ncpid: pod.ncpid, targets: pod.targets};
}

var getNextTarget = function (pod) {
    return pod.targets[(pod.ncpid+1) % pod.targets.length];
}

var getScore = function (pod) {
    var target = pod.targets[pod.ncpid];

    var podAngle = pod.angle;

    var targetAngle = Math.atan2(target.y - pod.y, target.x - pod.x)*180/Math.PI;

    targetAngle = targetAngle < 0 ? (360 + targetAngle) : targetAngle;

    var angleScore = 100 * (360 - Math.abs(targetAngle - podAngle))/360;

    var ongoingAngle = Math.atan2(pod.vy, pod.vx)*180/Math.PI;

    // var ongoingScore = 100 * (360 - Math.abs(targetAngle - ongoingAngle))/360;
    
    var nextTargetScore = 0;

    var delta = calcDelta(pod, target);

    if (delta <= 1800) {
        var deltaToTheNext = calcDelta(pod, getNextTarget(pod));
        nextTargetScore = 100 * (deltaToTheNext <= 600 ? 1 : 600/deltaToTheNext);
    }

    var deltaScore =  100 * (delta <= 600 ? 1 : 600/delta);

    return (deltaScore + angleScore)/2;
}

var pickTheBest = function(moves) {
  var picked = moves[0];
  for(var i = 1 ; i < moves.length; i++){
    if(picked.score <= moves[i].score) {
      picked = moves[i];
    }
  }
  return picked;
}

var bestMove = function (pod, deep) {
  var target = pod.targets[pod.ncpid];
  var moves = [];
  for (var thrust = 0 ; thrust <= 200 ; thrust += 50) {
    for(var turn = -18 ; turn <= 18 ; turn += 18){
      var movedPod = move(pod, turn, thrust);
      var radians = movedPod.angle*Math.PI/180;
      var m = {x: Math.round(600*Math.cos(radians)), y: Math.round(600*Math.sin(radians)), turn: turn, thrust: thrust};
      if (deep === 0) {
        m.score = getScore(movedPod);
      }else{
        m.score = bestMove(movedPod, deep - 1).score;
      }
      moves.push(m);
    }
  }
  return pickTheBest(moves);
}

var initialAngle = function (pod) {
    var target = pod.targets[pod.ncpid];
    return Math.round(Math.atan2(target.y - pod.y, target.x - pod.x)*180/Math.PI);
}

var targets = [
    {x: 13211, y: 5469},
    {x: 9464, y: 1443},
    {x: 3684, y: 4424},
    {x: 8072, y: 7919},
];


var pod = {x:13211, y:5469, vx:0, vy:0, angle: -1, ncpid: 1, targets: targets};


var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
ctx.font = "200px Arial";
ctx.lineWidth=30;

for (var i = 0 ; i < targets.length ; i++) {
    ctx.beginPath();
    ctx.arc(targets[i].x, targets[i].y, 600, 0, 2*Math.PI);
    ctx.fillText('T' + i, targets[i].x, targets[i].y);
    ctx.stroke();

}

ctx.moveTo(pod.x, pod.y);
ctx.beginPath();

for (var i = 0 ; i < 200 ; i++) {
    if(pod.angle < 0){
        console.log('Hello!');
        pod.angle = initialAngle(pod);
    }
    var start = new Date().getTime();
    var m = bestMove(pod, 1);
    var end = new Date().getTime();
    pod = move(pod, m.turn, m.thrust);
    ctx.lineTo(pod.x, pod.y);
    ctx.arc(pod.x, pod.y,50,0,2*Math.PI);
    ctx.stroke();
    ctx.fillText('' + m.thrust, pod.x + 10, pod.y + 10);
    ctx.moveTo(pod.x, pod.y);
    if(innerCircle(pod, pod.targets[pod.ncpid], 600)){
        pod.ncpid = (pod.ncpid + 1) % targets.length;
    }
}

