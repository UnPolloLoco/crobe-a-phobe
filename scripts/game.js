scene("game", () => {



function fillGridSpace(pos, color) {
    drawRect({
        width: UNIT,
        height: UNIT,
        pos: fromGridPos(pos.sub(0.5)),
        color: color,
    });
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
    
    fillGridSpace(vec2(2,3), RED)
    fillGridSpace(vec2(3,-1), YELLOW)
    fillGridSpace(vec2(5,), GREEN)
})



});