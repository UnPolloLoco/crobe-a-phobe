scene("menu", () => {



add([
    rect(width(), height()),
    pos(0,0),
    color(rgb(12, 20, 30)),
    fixed(),
])

add([
    text('Click the bean to start')
])

const playButton = add([
    sprite('bean'),
    scale(6),
    pos(center()),
    anchor('center'),
    area(),
])

playButton.onClick(() => {
    go('game')
})



});
go('menu')