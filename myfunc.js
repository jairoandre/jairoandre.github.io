// CANVAS
console.log(_ENV)

function initCanvas (targets, pod) {
  var canvas = document.getElementById('myCanvas')
  var ctx = canvas.getContext('2d')
  ctx.font = '200px Arial'
  ctx.lineWidth = 30

  for (var i = 0; i < targets.length; i++) {
    ctx.beginPath()
    ctx.arc(targets[i].x, targets[i].y, 600, 0, 2 * Math.PI)
    ctx.fillText('T' + i, targets[i].x, targets[i].y)
    ctx.stroke()
  }

  ctx.moveTo(pod.x, pod.y)
  ctx.beginPath()
}

function draw (pod, m) {
  var canvas = document.getElementById('myCanvas')
  var ctx = canvas.getContext('2d')
  ctx.lineTo(pod.x, pod.y)
  ctx.arc(pod.x, pod.y, 50, 0, 2 * Math.PI)
  ctx.stroke()
  // ctx.fillText('' + m.thrust, pod.x + 10, pod.y + 10)
  ctx.moveTo(pod.x, pod.y)
}

function simulation () {
  var cps = [
    {x: 13211, y: 5469},
    {x: 9464, y: 1443},
    {x: 3684, y: 4424},
    {x: 8072, y: 7919}
  ]

  var pod = {x: 13211, y: 5469, vx: 0, vy: 0, angle: -1, ncpid: 1, cps: cps, attack: false, target: cps[1]}

  initCanvas(cps, pod)

  var cpsCount = 0

  for (var i = 0; i < 200; i++) {
    if (pod.angle < 0) {
      pod.angle = initialAngle(pod)
    }
    var m = bestMove(pod, 2)
    pod = move(pod, m.turn, m.thrust)

    draw(pod, m)

    if (innerCircle(pod, pod.cps[pod.ncpid], 600)) {
      pod.ncpid = (pod.ncpid + 1) % cps.length
      cpsCount++
      pod.cpcount = cpsCount
      pod.target = pod.cps[pod.ncpid]
    }
  }
  console.log('Count: ' + cpsCount)
  console.log('Iterations: ' + bestMoveIter)
}

simulation()
