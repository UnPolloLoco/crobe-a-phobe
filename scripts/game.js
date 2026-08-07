scene("game", () => {



function fillGridSpace(pos, color) {
    drawRect({
        width: UNIT,
        height: UNIT,
        pos: fromGridPos(pos.sub(0.5)),
        color: color,
    });
}

function tickLife() {
    // Get list of cells to tick

    let cellsToTick = new Set();

    for (let [pos, data] of Object.entries(livingCells)) {
        let vecPos = fromCSVPos(pos);

        for (let n of NEIGHBORS) {
            let vecNeighbor = vecPos.add(n);
            let csvNeighbor = toCSVPos(vecNeighbor);

            cellsToTick.add(csvNeighbor);
        }
    }

    // Tick all listed cells

    let nextLivingCells = {};

    for (let pos of cellsToTick) {
        let vecPos = fromCSVPos(pos);
        let livingNeighborCount = 0;

        let thisCell = livingCells[pos];

        for (let n of NEIGHBORS) {
            let vecNeighbor = vecPos.add(n);
            let csvNeighbor = toCSVPos(vecNeighbor);

            if (livingCells[csvNeighbor]) {
                livingNeighborCount++;
            }
        }

        if (thisCell) {
            // Is Alive
            if (livingNeighborCount == 2 || livingNeighborCount == 3) {
                // Survive S23
                nextLivingCells[pos] = thisCell
            }
        } else {
            // Is Dead
            if (livingNeighborCount == 3) {
                // Birth B3
                nextLivingCells[pos] = {
                    birthTick: tickNumber
                }
            }
        }
    }

    livingCells = nextLivingCells;
    tickNumber++;
}


setCamPos(vec2(0))
setCamScale(0.5)


add([
    rect(width(), height()),
    pos(0,0),
    color(rgb(12, 20, 30)),
    fixed(),
])

const playerData = {
    pos: vec2(0,0),
    finePos: vec2(0,0),
    tail: [vec2(0,1), vec2(0,2), vec2(0), vec2(0), vec2(0)],
    direction: vec2(0,0),
    speed: 10,
}

let livingCells = {
    '4,2': {birthTick: 0},
    '4,3': {birthTick: 0},
    '4,4': {birthTick: 0},

    '-14,2': {birthTick: 0},
    '-15,2': {birthTick: 0},
    '-16,2': {birthTick: 0},
    '-14,3': {birthTick: 0},
    '-15,4': {birthTick: 0},
}

livingCells = {}
let s = 100
for (let x = -s; x <= s; x++) {
    for (let y = -s; y <= s; y++) {
        if (x*x + y*y > 15*15 && Math.random() < 0.5) {
            livingCells[`${x},${y}`] = {birthTick: 0}
        }
    }
}

let spawnWarnCells = {
    '4,2': {birthTick: 0, willSpawn: true},
    '4,3': {birthTick: 0, willSpawn: false},
}

let tickNumber = 0;

loop(0.1, tickLife)

onKeyPress(',', () => {
    setCamScale(getCamScale().scale(1 - 0.2))
})
onKeyPress('.', () => {
    setCamScale(getCamScale().scale(1 + 0.2))
})

onKeyPress('space', () => {
    // Summon soup orb (sourb)

    let radius = 10;
    let center = roundVec(
        playerData.pos.add(
            rand(-40,40),
            rand(-40,40),
        )
    );


    let n = center.y - radius;
    let s = center.y + radius;
    let e = center.x - radius;
    let w = center.x + radius;

    for (let x = e; x <= w; x++) {
        for (let y = n; y <= s; y++) {
            let isInRadius = (
                (x - center.x)**2 + (y - center.y)**2 <= radius**2
            );
            if (isInRadius) {
                spawnWarnCells[`${x},${y}`] = {
                    birthTick: tickNumber,
                    willSpawn: (Math.random() < 0.5)
                }
            }
        }
    }
})

onUpdate(() => {
    let oldPlayerPos = playerData.pos;

    if (isMouseDown()) {
        let playerMouseDiff = mousePos().sub(
            toScreen(fromGridPos(playerData.finePos))
        );

        playerData.velocity = playerMouseDiff.unit();
    } else {
        playerData.velocity = vec2(0);
    }

    playerData.finePos = playerData.finePos.add(
        playerData.velocity.scale(dt() * playerData.speed)
    );
    playerData.pos = roundVec(playerData.finePos);

    if (oldPlayerPos.eq(playerData.pos) == false) {
        playerData.tail.unshift(oldPlayerPos);
        playerData.tail.pop();
    }

    setCamPos(fromGridPos(playerData.finePos))
})

onDraw(() => {
    
    // ------ Draw Warning Cells ------

    for (let [pos, data] of Object.entries(spawnWarnCells)) {
        let ticksElapsed = tickNumber - data.birthTick;
        let fadeMulti;
        let lifespan;

        if (data.willSpawn) {
            fadeMulti = (ticksElapsed % 8);
            lifespan = 8 * 2;
        } else {
            fadeMulti = ticksElapsed;
            lifespan = 8;
        }

        if (ticksElapsed >= lifespan) {
            // Kill spawn warning cell
            delete spawnWarnCells[pos];

            if (data.willSpawn) { 
                livingCells[pos] = {birthTick: tickNumber}
            }

        } else {
            // Spawn warning cell is alive
    
            fillGridSpace(
                fromCSVPos(pos), 
                rgb(
                    100 - 14*fadeMulti,
                    20,
                    30,
                )
            );
        }
    }

    // ------ Draw Player Cells ------

    for (let pos of playerData.tail) {
        fillGridSpace(pos, rgb(120,120,150))
    }
    
    fillGridSpace(playerData.pos, WHITE)

    // ------ Draw Living Cells ------

    for (let [pos, data] of Object.entries(livingCells)) {
        let ticksElapsed = tickNumber - data.birthTick;

        fillGridSpace(
            fromCSVPos(pos), 
            rgb(
                0,
                120 - 20 * ticksElapsed,
                Math.max(120, 255 - 20 * ticksElapsed)
            )
        );
    }
})



});