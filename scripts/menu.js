scene("menu", () => {



add([
    rect(width(), height()),
    pos(0,0),
    color(rgb(12, 20, 30)),
    fixed(),
])

add([
    text('Click the bean to start', {align:'right'}),
    anchor('topright'),
    pos(width(),0)
])

const playButton = add([
    sprite('bean'),
    color(BLUE),
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