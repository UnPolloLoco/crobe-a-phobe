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
    color(hsl(280, 0.2, 0.1)),
    fixed(),
])

const playerData = {
    pos: vec2(0,0),
    finePos: vec2(0,0),
    tail: [/*list of vectors*/],
    direction: vec2(0,0),
    speed: 10,
}

for (let i = 0; i < 12; i++) {
    playerData.tail.push(vec2(0, i))
}

let livingCells = {
    // '4,2': {birthTick: 0},
    // '4,3': {birthTick: 0},
}

let s = 100
for (let x = -s; x <= s; x++) {
    for (let y = -s; y <= s; y++) {
        if (x*x + y*y > 15*15 && Math.random() < 0.5) {
            livingCells[`${x},${y}`] = {birthTick: 0}
        }
    }
}

let spawnWarnCells = {
    // '4,2': {birthTick: 0, willSpawn: true},
    // '4,3': {birthTick: 0, willSpawn: false, fizzleOnTick: 1}, 
}

let tickNumber = 0;

loop(0.1, tickLife)

loop(0.8, () => {
    // Summon soup orb (sourb)

    let radius = randi(5, 18);
    let center = roundVec(
        playerData.pos.add(
            rand(-60,60),
            rand(-60,60),
        )
    );


    let n = center.y - radius;
    let s = center.y + radius;
    let e = center.x - radius;
    let w = center.x + radius;

    for (let x = e; x <= w; x++) {
        for (let y = n; y <= s; y++) {
            let isInRadius = (
                (x - center.x)**2 + (y - center.y)**2 
                <= (radius - 0.1)**2
            );
            let posCSV = `${x},${y}`;

            if (isInRadius && spawnWarnCells[posCSV] == undefined) {
                spawnWarnCells[posCSV] = {
                    birthTick: tickNumber,
                    willSpawn: (Math.random() < 0.5),
                    fizzleOnTick: 1 + randi(3),
                }
            }
        }
    }
})


onKeyPress(',', () => {
    setCamScale(getCamScale().scale(1 - 0.2))
})
onKeyPress('.', () => {
    setCamScale(getCamScale().scale(1 + 0.2))
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
    
    // ------------ Draw Warning Cells ------------

    for (let [pos, data] of Object.entries(spawnWarnCells)) {
        let ticksElapsed = tickNumber - data.birthTick;
        let lifespan;

        if (data.willSpawn) {
            lifespan = 5 * 4;
        } else {
            lifespan = 5 * data.fizzleOnTick;
        }

        if (ticksElapsed >= lifespan) {
            // Kill warning cell
            delete spawnWarnCells[pos];

            if (data.willSpawn) { 
                livingCells[pos] = {birthTick: tickNumber}
            }

        } else {
            // Warning cell is alive; pulse animation

            let pulseTaper = 1 - ((ticksElapsed % 5) / 4);
            let pulseStrengths = [
                0.08, 0.08, 0.16, 0.35
            ][
                Math.floor(ticksElapsed / 5)
            ];

            fillGridSpace(
                fromCSVPos(pos), 
                hsl(
                    320 + 20 * pulseTaper,
                    0.4 + 0.3 * pulseTaper,
                    0.1 + 0.8 * pulseTaper * pulseStrengths,
                )
            );
        }
    }

    // ------------ Draw Player Cells ------------

    for (let [index, pos] of playerData.tail.entries()) {
        fillGridSpace(pos, hsl(
            Math.max(20, 60 - index * 2), 
            0.9, 
            0.5
        ));
    }
    
    fillGridSpace(playerData.pos, WHITE)

    // ------------ Draw Living Cells ------------

    for (let [pos, data] of Object.entries(livingCells)) {
        let ticksElapsed = tickNumber - data.birthTick;

        fillGridSpace(
            fromCSVPos(pos), 
            hsl(
                Math.min(315, 280 + ticksElapsed*10),
                Math.min(0.8, 0.2 + ticksElapsed/12),
                Math.min(0.85, 0.2 + ticksElapsed/8),
            ),
        );
    }
})



});