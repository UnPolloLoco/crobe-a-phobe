scene("menu", () => {



add([
    rect(width(), height()),
    pos(0,0),
    color(BACKGROUND),
    fixed(),
])

const playButton = add([
    sprite('playButton', { anim: 'wriggle' }),
    pos(center().add(0, 150)),
    anchor('center'),
    area({ scale: 0.6 }),
    scale(1),
    {
        scaleTween: null,
        hoverScale: 1.04,
        hoverSpeed: 6,
    }
])

playButton.onClick(() => {
    go('game')
})

playButton.onHover(() => {
    if (playButton.scaleTween) { playButton.scaleTween.cancel() };

    playButton.scaleTween = tween(
        playButton.scale, vec2(playButton.hoverScale),
        0.3,
        (s) => { playButton.scale = s; },
        easings.easeOutElastic,
    )
})

playButton.onHoverEnd(() => {
    if (playButton.scaleTween) { playButton.scaleTween.cancel() };

    playButton.scaleTween = tween(
        playButton.scale, vec2(1),
        0.3,
        (s) => { playButton.scale = s; },
        easings.easeOutElastic,
    )
})

playButton.onUpdate(() => {
    if (playButton.isHovering()) {
        playButton.animSpeed = playButton.hoverSpeed;
    } else {
        playButton.animSpeed = 1;
    }
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