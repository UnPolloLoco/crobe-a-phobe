kaboom({
    letterbox: true,
    width: 1280,
    height: 720,
});

const UNIT = 30;
const UNIT_INVERSE = 1/UNIT;
const UNIT_HALF = UNIT/2;

loadBean();

function toGridPos(v) {
    return v.scale(UNIT_INVERSE)
}

function fromGridPos(v) {
    return v.scale(UNIT)
}

function roundVec(v) {
    return vec2(Math.round(v.x), Math.round(v.y))
}