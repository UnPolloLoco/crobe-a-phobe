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
    timeSinceTick = 0;
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
            let neighbor = livingCells[csvNeighbor]

            if (neighbor && !neighbor.isDead) {
                livingNeighborCount++;
            }
        }

        if (thisCell && !thisCell.isDead) {
            // Is Alive
            if ([2,3].includes(livingNeighborCount)) {
                // Survive S23
                nextLivingCells[pos] = thisCell;
            } else {
                // Already alive and doesnt survive
                nextLivingCells[pos] = {...thisCell, isDead:true};
            }
        } else {
            // Is Dead
            if ([3].includes(livingNeighborCount)) {
                // Birth B3
                if (!foodCells[pos]) {
                    // Do not spawn cell if it will overlap with food
                    nextLivingCells[pos] = {
                        birthTick: tickNumber
                    }
                }
            }
        }
    }

    livingCells = nextLivingCells;
}

function collisionCheck() {
    let playerParts = [...playerData.tail, playerData.pos];
    let touchCount = 0;

    for (let [cellPosCSV, data] of Object.entries(livingCells)) {
        for (let playerCellPos of playerParts) {
            if (cellPosCSV == toCSVPos(playerCellPos)) {
                touchCount++;
                collisionWarnings[cellPosCSV] = {birthTick: tickNumber};
            }
        }
    }

    if (touchCount > 0) { takeDamage(touchCount); }
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
            let dist = Math.sqrt((x - center.x)**2 + (y - center.y)**2);
            let unitDist = dist / radius;
            let isInRadius = (dist <= (radius - 0.1));

            let posCSV = `${x},${y}`;

            let spawnChance = Math.min(0.5, 0.5 - 0.5*(unitDist**4));

            if (isInRadius && spawnWarnCells[posCSV] == undefined) {
                spawnWarnCells[posCSV] = {
                    birthTick: tickNumber,
                    willSpawn: (Math.random() < spawnChance),
                    opacity: rand(0.4, 0.8) + spawnChance,
                    fizzleOnTick: 1 + randi(3),
                }
            }
        }
    }
}

function takeDamage(amount) {
    playerData.health -= 5 * amount;
    healthLabel.text = Math.round(playerData.health);

    let shakeStrength = mapc(
        amount,
        1, 7,   // touch amount
        2, 8    // shake strength
    );

    addCamShake(shakeStrength, 0.2);
}

function updateCamera() {
    // Shake
    let shakeOffset = vec2(0);

    if (CAMERA.shake != []) { 
        let maxStrength = 0;
        let indexOfMaxStrength = null;

        for (let [index, data] of Object.entries(CAMERA.shake)) {
            if (data.endTime < GAME.time) {
                // Delete shake if expired
                delete CAMERA.shake[index];

            } else if (data.strength > maxStrength) { 
                // Set new max strength if bigger
                maxStrength = data.strength;
                indexOfMaxStrength = index;
            }
        }

        shakeOffset = vec2(
            rand(-1,1),
            rand(-1,1),
        ).scale(
            maxStrength
        ).scale(
            1,
            0.56
        );
    }

    // DO NOT use setCamPos or setCamScale elsewhere, edit CAMERA object instead
    setCamPos(CAMERA.pos.add(shakeOffset));
    setCamScale(CAMERA.scale);
}

function addCamShake(strength, duration) {
    CAMERA.shake.push({
        strength: strength,
        endTime: GAME.time + duration,
    })
}

// -------------- SETUP --------------

const GAME = {time: 0};

const CAMERA = {
    pos: vec2(0),
    scale: vec2(1),
    shake: [ /* {strength: 0, endTime: 0}, */ ], // Use addCamShake()
};

// Use inital camera settings

updateCamera();

// Zoom in camera on start

CAMERA.scale = 0.93;

tween(
    CAMERA.scale, 1,
    1.8,
    (s) => {
        CAMERA.scale = s;
    }, 
    easings.easeInOutQuart
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
    // '3,2': {birthTick: 0, isDead:true},
}

let spawnWarnCells = {
    // '4,1': {birthTick: 0, willSpawn: true, opacity: 0.67},
    // '6,7': {birthTick: 0, willSpawn: false, opacity: 0.41, fizzleOnTick: 1}, 
}

let collisionWarnings = {
    // '4,1': {birthTick: 0},
}

let foodCells = {
    '4,1': {},
    '4,2': {},
    '4,3': {},
    '5,1': {},
    '5,2': {},
    '5,3': {},
    '6,1': {},
    '6,2': {},
    '6,3': {},
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
let timeSinceTick = 0;

for (let i = 0; i < 100; i++) {
    let thisDelay = TICK_DELAY + 0.4 * (1.6)**(-i);
    totalDelay += thisDelay;

    if (thisDelay > TICK_DELAY * 1.1) {
        // Slow intro ticking
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
    CAMERA.scale /= 1.2;
})
onKeyPress('.', () => {
    CAMERA.scale *= 1.2;
})

// -------------- UPDATE LOOP --------------

onUpdate(() => {

    // Player movement

    let oldPlayerPos = playerData.pos;

    if (isMouseDown() && GAME.time > 0.2) {
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

    // Check if head overlaps with food

    if (foodCells[toCSVPos(playerData.pos)]) {
        debug.log('chomp');

        playerData.health += 100;
        healthLabel.text = Math.round(playerData.health);

        delete foodCells[toCSVPos(playerData.pos)];
    }

    // Move camera to player

    CAMERA.pos = fromGridPos(playerData.finePos);
    
    // Update camera and time

    updateCamera();
    GAME.time += dt();
    timeSinceTick += dt();
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
                ),
                opacity = data.opacity,
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

    // --------- Draw 'Crobe Cells ---------

    for (let [pos, data] of Object.entries(livingCells)) {
        let ticksElapsed = tickNumber - data.birthTick;
        let vecPos = fromCSVPos(pos);
        let dist = vecPos.dist(vec2(0));

        // Delete any cells that overlap with food
        if (foodCells[pos]) {
            delete livingCells[pos];
            continue;
        }

        let birthFadeMulti = data.birthTick == tickNumber ? Math.min(1, timeSinceTick / TICK_DELAY * TICK_FADE_RATE) : 1;
        let deathFadeMulti = data.isDead ? Math.max(0, 1 - timeSinceTick / TICK_DELAY * TICK_FADE_RATE) : 1;
        let introFadeMulti = Math.min(1, (dist-20)/20 - 1 + 1.6*GAME.time);

        if (data.isDead) { ticksElapsed--; } // Makes sure dying cells don't flash a brighter color

        fillGridSpace(
            vecPos, 
            hsl(
                Math.min(315, 280 + ticksElapsed*10),
                Math.min(0.9, 0.4 + ticksElapsed/18),
                Math.min(0.85, 0.3 + ticksElapsed/8),
            ),
            opacity = birthFadeMulti * deathFadeMulti * introFadeMulti,
        );
    }

    // --------- Draw Food ---------

    for (let [pos, data] of Object.entries(foodCells)) {
        let ticksElapsed = tickNumber - data.birthTick;
        let vecPos = fromCSVPos(pos);

        let shimmer = Math.sin(-(vecPos.x + vecPos.y) + 8*GAME.time);

        fillGridSpace(
            vecPos, 
            hsl(
                140 + 20*shimmer, 
                0.75, //0.9 - 0.1*shimmer,
                // 0.7 + 0.18*shimmer,
                0.86 + 0.14*(1 - 2**(1 + shimmer))  
            ),
        );
    }

    // --------- Draw Collision Warnings ---------

    for (let [pos, data] of Object.entries(collisionWarnings)) {
        let ticksElapsed = tickNumber - data.birthTick;
        let opacity = (1 - ticksElapsed/4);

        // Same color as spawn warning
        fillGridSpace(
            fromCSVPos(pos), 
            hsl(
                340,
                0.7,
                0.38 + 0.12 * Math.sin(30 * (GAME.time + data.birthTick)),
            ),
            opacity = opacity
        );

        // Delete invisible collision warnings
        if (opacity < 0) { delete collisionWarnings[pos] }
    }
})


// End of scene
});