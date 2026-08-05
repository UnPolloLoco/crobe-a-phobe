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


setCamPos(vec2(0,0))


add([
    rect(width(), height()),
    pos(0,0),
    color(rgb(12, 20, 30)),
    fixed(),
])

const playerData = {
    pos: vec2(0,0),
    finePos: vec2(0,0),
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

let tickNumber = 0;

loop(0.2, tickLife)

onUpdate(() => {
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
})

onDraw(() => {
    fillGridSpace(playerData.pos, WHITE)

    for (let [pos, data] of Object.entries(livingCells)) {
        fillGridSpace(fromCSVPos(pos), RED)
    }
})



});