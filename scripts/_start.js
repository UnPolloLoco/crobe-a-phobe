kaboom({
    letterbox: true,
    width: 1280,
    height: 720,
});

const UNIT = 40;
const UNIT_INVERSE = 1/UNIT;
const UNIT_HALF = UNIT/2;

const NEIGHBORS = [vec2(0,1), vec2(1,1), vec2(1,0), vec2(1,-1), vec2(0,-1), vec2(-1,-1), vec2(-1,0), vec2(-1, 1)]

const DELETE_RADIUS = 250;

const TICK_DELAY = 0.1;

const INITIAL_SOUP_START_RADIUS = 15;
const INITIAL_SOUP_FULL_START_RADIUS = 25;

loadBean();

loadRoot('https://unpolloloco.github.io/crobe-a-phobe/sprites/');

loadSprite('title', 'title.png', {
	sliceY: 2,
	anims: { 'wriggle': { from: 0, to: 1, speed: 3, loop: true } },
})

function toGridPos(v) { return v.scale(UNIT_INVERSE); }

function fromGridPos(v) { return v.scale(UNIT); }

function roundVec(v) { return vec2(Math.round(v.x), Math.round(v.y)); }

function toCSVPos(v) { return `${v.x},${v.y}`; }

function fromCSVPos(s) {
    let split = s.split(',');
    return vec2(Number(split[0]), Number(split[1]));
}

function hsl(h,s,l) { return hsl2rgb(h/360, s, l); }