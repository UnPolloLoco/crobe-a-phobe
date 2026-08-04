scene("game", () => {



setCamPos(vec2(0,0))

add([
    rect(width(), height()),
    pos(0,0),
    color(rgb(12, 20, 30)),
    fixed(),
])

const playerData = {
    pos: vec2(0,0),
}

onUpdate(() => {
    playerData.pos = playerData.pos.add(3 * dt())
})

onDraw(() => {
    drawRect({
        width: UNIT,
        height: UNIT,
        pos: playerData.pos.scale(UNIT),
        color: WHITE,
    });
})



});