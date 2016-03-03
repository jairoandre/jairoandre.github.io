/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

var _ENV = 'dev'
var _POD_RADII_2 = Math.pow(400, 2)
var _MAX_SPEED = 1127
var _CP_RADII = 600
var _SPACE_FACTOR = 400

if (_ENV === 'prod') {
  var laps = parseInt(readline())
  var checkpointCount = parseInt(readline())
  var cps = []
  var pods = []

  for (var i = 0; i < checkpointCount; i++) {
    var inputs = readline().split(' ')
    var checkpointX = parseInt(inputs[0])
    var checkpointY = parseInt(inputs[1])
    cps[i] = {x: checkpointX, y: checkpointY}
  }
}

function podIntersect (p1, p2) {
  return (Math.pow(p1.x - p2.x) + Math.pow(p1.y - p2.y)) <= _POD_RADII_2
}

function willColide (p1, p2, m) {
  var mP1 = move(p1, m.angle, m.thrust)
  var mP2 = move(p2, 0, 0)
  return podIntersect(mP1, mP2)
}

function innerCircle (ca, cb, r) {
  return calcDelta(ca, cb) <= r
}

function hypotenuse (a, b) {
  return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2))
}

function calcDelta (coordsA, coordsB) {
  var a = coordsA.x - coordsB.x
  var b = coordsA.y - coordsB.y
  return hypotenuse(a, b)
}

function computeInReachScore (pod, maxTicks) {
  var iterPod = pod
  var currentSpeed = hypotenuse(pod.vx, pod.vy)
  var ticksCount = 0
  var reached = false
  for (var ticks = 0; ticks < maxTicks; ticks++) {
    if (innerCircle(iterPod, iterPod.cps[iterPod.ncpid], _CP_RADII)) {
      ticksCount = ticks
      reached = true
    }
    iterPod = move(iterPod, 0, 0)
    currentSpeed = hypotenuse(pod.vx, pod.vy)
  }
  var ticksScore = 100 * (maxTicks - ticksCount) / maxTicks
  var speedScore = 0
  if (reached) {
    speedScore = 100 * currentSpeed / _MAX_SPEED
  }
  return (ticksScore + speedScore) / 2
}

function move (pod, turn, thrust) {
  var newAngle = pod.angle + turn
  newAngle = newAngle < 0 ? (360 + newAngle) : newAngle

  var newAngleInRadians = newAngle * Math.PI / 180

  var iVx = pod.vx + thrust * Math.cos(newAngleInRadians)
  var iVy = pod.vy + thrust * Math.sin(newAngleInRadians)

  var newX = Math.round(pod.x + iVx)
  var newY = Math.round(pod.y + iVy)

  var newVx = Math.trunc(iVx * 0.85)
  var newVy = Math.trunc(iVy * 0.85)

  return {x: newX, y: newY, vx: newVx, vy: newVy, angle: newAngle, ncpid: pod.ncpid, cps: pod.cps, ally: pod.ally, e1: pod.e1, e2: pod.e2, attack: pod.attack, target: pod.target}
}

function getNextCP (pod) {
  return pod.cps[(pod.ncpid + 1) % pod.cps.length]
}

function computeScore (pod) {
  var target = pod.target

  // ANGLE SCORE

  var podAngle = pod.angle

  var targetAngle = Math.atan2(target.y - pod.y, target.x - pod.x) * 180 / Math.PI

  targetAngle = targetAngle < 0 ? (360 + targetAngle) : targetAngle

  var angleScore = 100 * (360 - Math.abs(targetAngle - podAngle)) / 360

  // ONGOING ANGLE SCORE

  var ongoingAngle = Math.atan2(pod.vy, pod.vx) * 180 / Math.PI

  ongoingAngle = ongoingAngle < 0 ? (360 + ongoingAngle) : ongoingAngle

  var ongoingScore = 0

  if (pod.attack) {
    var ongoingTarget = Math.atan2(pod.target.vy, pod.target.vx) * 180 / Math.PI
    ongoingScore = 100 * (Math.abs(ongoingTarget - ongoingAngle)) / 180
  } else {
    ongoingScore = 100 * (360 - Math.abs(targetAngle - ongoingAngle)) / 360
  }

  // CHECKPOINT DELTA SCORE

  var delta = calcDelta(pod, target)

  var targetBaseComparation = pod.attack ? 100 : _CP_RADII
  var targetDeltaScore = 100 * (delta <= targetBaseComparation ? delta / targetBaseComparation : targetBaseComparation / delta)

  // NEXT CHECKPOINT DELTA SCORE

  var nextCPDeltaScore = 0

  if (!pod.attack && delta <= 1600) {
    var nextCP = getNextCP(pod)
    var nextCPDelta = calcDelta(pod, nextCP)
    var nextCPBaseDelta = calcDelta(target, nextCP)
    nextCPDeltaScore = 100 * (nextCPDelta <= nextCPBaseDelta ? 1 : nextCPBaseDelta / nextCPDelta)
  }

  // REACH IN SCORE

  var inReachScore = pod.attack ? 0 : computeInReachScore(pod, 10)

  return (targetDeltaScore + angleScore + ongoingScore + nextCPDeltaScore + inReachScore) / 5
}

var bestMoveIter = 0

function bestMove (pod, deep) {
  var picked
  for (var thrust = 0; thrust <= 200; thrust += 50) {
    for (var turn = -18; turn <= 18; turn += 18) {
      bestMoveIter++
      var movedPod = move(pod, turn, thrust)
      var radians = movedPod.angle * Math.PI / 180
      var m = {x: Math.round(_SPACE_FACTOR * Math.cos(radians)), y: Math.round(_SPACE_FACTOR * Math.sin(radians)), turn: turn, thrust: thrust}
      if (deep === 0) {
        m.score = computeScore(movedPod)
      } else {
        m.score = bestMove(movedPod, deep - 1).score
      }
      if (!picked || picked.score < m.score) {
        picked = m
      }
    }
  }
  return picked
}

function initialAngle (pod) {
  var target = pod.cps[pod.ncpid]
  return Math.round(Math.atan2(target.y - pod.y, target.x - pod.x) * 180 / Math.PI)
}

function printAction (pod) {
  if (pod.attack) {
    pod.target = (pod.e1.cpcount >= pod.e2.cpcount) ? pod.e1 : pod.e2
    printErr('Pod attacking: ' + pod.target.i)
  }
  var m = bestMove(pod, 2)
  var thrust = m.thrust
  if (willColide(pod, pod.e1, m) || willColide(pod, pod.e2, m)) {
    printErr('ACTIVE SHIELD')
    thrust = 'SHIELD'
  }
  print((pod.x + m.x) + ' ' + (pod.y + m.y) + ' ' + thrust)
}

var currentCps = [0, 0, 0, 0]
var cpsCount = [0, 0, 0, 0]
// game loop
while (_ENV === 'prod') {
  for (var i = 0; i < 4; i++) {
    var inputs = readline().split(' ')
    var x = parseInt(inputs[0])
    var y = parseInt(inputs[1])
    var vx = parseInt(inputs[2])
    var vy = parseInt(inputs[3])
    var angle = parseInt(inputs[4])
    var ncpid = parseInt(inputs[5])
    if (currentCps[i] !== ncpid) {
      cpsCount[i] += 1
      currentCps[i] = ncpid
    }
    pods[i] = {x: x, y: y, vx: vx, vy: vy, angle: angle, ncpid: ncpid, cps: cps, cpcount: cpsCount[i], target: cps[ncpid], i: i}
  }

  var p1 = pods[0]
  var p2 = pods[1]
  var e1 = pods[2]
  var e2 = pods[3]

  p1.ally = p2
  p2.ally = p1
  p1.e1 = p2.e1 = e1
  p1.e2 = p2.e2 = e2
  p1.attack = false
  p2.attack = true

  printErr(e1.cpcount)
  printErr(e2.cpcount)

  // Write an action using print()
  // To debug: printErr('Debug messages...')

  if (p1.angle < 0) {
    p1.angle = initialAngle(p1, cps[p1.ncpid])
  }
  if (p2.angle < 0) {
    p2.angle = initialAngle(p2, cps[p1.ncpid])
  }

  printAction(p1)
  printAction(p2)
}
