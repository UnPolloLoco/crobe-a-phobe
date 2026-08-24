scene("menu", () => {



add([
    rect(width(), height()),
    pos(0,0),
    color(BACKGROUND),
    fixed(),
])

const playButton = add([
    rect(200,65),
    color(BLUE),
    pos(center().add(0, 150)),
    anchor('center'),
    area(),
])

playButton.add([
    text('start')
])

playButton.onClick(() => {
    go('game')
})

add([
    sprite('title', { anim: 'wriggle' }),
    pos(center().sub(0, 70)),
    anchor('center')
])

const titleOverlay = add([
    sprite('titleOverlay' /* animated later */),
    pos(center().sub(0, 70)),
    anchor('center')
])

for (let i = 0; i < 5; i++) {
    wait(0.1 + (i+1)*0.08, () => {
        if (i == 4) {
            destroy(titleOverlay);
        } else {
            titleOverlay.frame++;
        }

    })
}

});
go('menu')