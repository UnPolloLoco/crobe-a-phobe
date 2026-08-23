scene("game", () => {



// -------------- GAME FUNCTIONS --------------

function fillGridSpace(pos, color, opacity=1) {
    drawRect({
        width: UNIT,
        height: UNIT,
        pos: fromGridPos(pos.sub(0.5)),
        color: color,
        opacity: opacity,
    });
}

function tick() {
    tickNumber++;
    tickLife();
    collisionCheck();
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
            if ([2,3].includes(livingNeighborCount)) {
                // Survive S23
                nextLivingCells[pos] = thisCell
            }
        } else {
            // Is Dead
            if ([3].includes(livingNeighborCount)) {
                // Birth B3
                nextLivingCells[pos] = {
                    birthTick: tickNumber
                }
            }
        }
    }

    livingCells = nextLivingCells;
}

function collisionCheck() {
    let playerParts = [...playerData.tail, playerData.pos]

    for (let [cellPosCSV, data] of Object.entries(livingCells)) {
        for (let playerCellPos of playerParts) {
            if (cellPosCSV == toCSVPos(playerCellPos)) {
                playerData.health -= rand(4,6);
                healthLabel.text = Math.round(playerData.health);

                collisionWarnings[cellPosCSV] = {birthTick: tickNumber};
            }
        }
    }
}

function summonRandomSoupOrb() {
    let radius = randi(5, 18);
    let center = roundVec(
        playerData.pos.add(
            rand(-70,70),
            rand(-70,70),
        ).add(
            playerData.generalDirection.vec
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
}

// -------------- SETUP --------------

const GAME = {time: 0};

setCamPos(vec2(0))
setCamScale(0.46)

// Zoom in camera on start
tween(
    getCamScale(), vec2(0.5),
    1.5,
    (s) => {
        setCamScale(s)
    }, 
    easings.easeInOutCubic
);

// -------------- SCENE --------------

// Background
add([
    rect(width(), height()),
    pos(0,0),
    color(BACKGROUND),
    fixed(),
])

// Health label
const healthLabel = add([
    text('1000'),
    pos(50),
    fixed(),
])

// -------------- PLAYER DATA --------------

const playerData = {
    pos: vec2(0),
    finePos: vec2(0),
    tail: [/*list of vectors*/],
    direction: vec2(0),
    speed: 10,
    generalDirection: {
        vec: vec2(0),
        lastPos: vec2(0),
    },
    health: 1000,
}

for (let i = 0; i < 12; i++) {
    playerData.tail.push(vec2(0, i))
}

// -------------- CELL DATA --------------

let livingCells = {
    // '4,1': {birthTick: 0},
}

let spawnWarnCells = {
    // '4,1': {birthTick: 0, willSpawn: true},
    // '6,7': {birthTick: 0, willSpawn: false, fizzleOnTick: 1}, 
}

let collisionWarnings = {
    // '4,1': {birthTick: 0},
}

// -------------- INITAL SOUP --------------

let s = 100
for (let x = -s; x <= s; x++) {
    for (let y = -s; y <= s; y++) {
        let density = mapc(
            Math.sqrt(x*x + y*y),
            INITIAL_SOUP_START_RADIUS,
            INITIAL_SOUP_FULL_START_RADIUS,
            0,
            0.5,
        );
        if (Math.random() < density) {
            livingCells[`${x},${y}`] = {birthTick: 0}
        }
    }
}

// -------------- TICKING --------------

let tickNumber = 0;
let totalDelay = 0;

for (let i = 0; i < 100; i++) {
    let thisDelay = TICK_DELAY + 0.6 * (1.2)**(-i);
    totalDelay += thisDelay;

    if (thisDelay > TICK_DELAY * 1.1) {
        // Slow start
        wait(totalDelay, tick);
    } else {
        // Begin normal tick rate loop; end this loop
        wait(totalDelay, () => {
            loop(TICK_DELAY, tick);
        });
        break;
    }
}

// -------------- SOUP ORB SPAWNER --------------

wait(6, () => {
    loop(0.4, () => {
        summonRandomSoupOrb();
    })
})

// -------------- GENERAL DIRECTION FINDER --------------

loop(3, () => {
    // Find general direcrtion

    playerData.generalDirection.vec = playerData.pos.sub(
        playerData.generalDirection.lastPos
    ).scale(1.6);
    playerData.generalDirection.lastPos = playerData.pos
})

// -------------- CELL CLEANUP --------------
    
loop(8, () => {
    // Delete far away cells
    
    for (let [pos, data] of Object.entries(livingCells)) {
        let cell = fromCSVPos(pos);
        let plyr = playerData.pos;
        let distance;

        distance = Math.max(
            Math.abs(cell.x - plyr.x),
            Math.abs(cell.y - plyr.y),
        );

        if (distance > DELETE_RADIUS) {
            delete livingCells[pos];
        }
    }
})

// -------------- CONTROLS --------------

onKeyPress(',', () => {
    setCamScale(getCamScale().scale(1 - 0.2))
})
onKeyPress('.', () => {
    setCamScale(getCamScale().scale(1 + 0.2))
})

// -------------- UPDATE LOOP --------------

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

    GAME.time += dt();
})

// -------------- DRAW LOOP --------------

onDraw(() => {
    
    // --------- Draw Spawn Warnings ---------

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

            // Same color as collision warning
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

    // --------- Draw Player Cells ---------

    for (let [index, pos] of playerData.tail.entries()) {
        fillGridSpace(pos, hsl(
            Math.max(20, 60 - index * 2), 
            0.9, 
            0.5
        ));
    }
    
    fillGridSpace(playerData.pos, WHITE)

    // --------- Draw Living Cells ---------

    for (let [pos, data] of Object.entries(livingCells)) {
        let ticksElapsed = tickNumber - data.birthTick;
        let vecPos = fromCSVPos(pos);
        let dist = vecPos.dist(vec2(0));

        fillGridSpace(
            vecPos, 
            hsl(
                Math.min(315, 280 + ticksElapsed*10),
                Math.min(0.9, 0.4 + ticksElapsed/18),
                Math.min(0.85, 0.3 + ticksElapsed/8),
            ),
            opacity = Math.min(
                1, 
                (dist-20)/20 - 1 + 1.6*GAME.time
            ),
        );
    }

    // --------- Draw Collision Warnings ---------

    for (let [pos, data] of Object.entries(collisionWarnings)) {
        let ticksElapsed = tickNumber - data.birthTick;

        // Same color as spawn warning
        fillGridSpace(
            fromCSVPos(pos), 
            hsl(
                340,
                0.7,
                0.38,
            ),
            opacity = (1 - ticksElapsed/4)
        );
    }
})


// End of scene
});