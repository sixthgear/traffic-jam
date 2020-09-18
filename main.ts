/* 
A raster-based 3d racing game!
 - main.ts : this file, contains game logic and physics
 - track.ts : contains track data and road drawing (cool raster stuff here)
 - colors.ts : swaps the default palette and defines some constants for the different colors
*/

// define physics constants
const TIMESTEP_MS = 1000/60; // 60 fps
const ACCELERATION = 0.03;
const MAX_VELOCITY = 3.0;

// create a global dictionary of game variables
// it's just nice to have namespaces!
const gameData = {
    track: new Track(),
    segment: 0,
    segmentPos: 0,    
    player: sprites.create(img`
    ................................
    ................................
    ................................
    ................................
    ................................
    ................................
    ................................
    ................................
    ................................
    ................................
    ................................
    ........ff888888888888ff........
    .......ffffffffffffffffff.......
    ......8f6666666666666666f8......
    .....8f666666666666666666f8.....
    ....8f666eeeee6666eeeee666f8....
    ...8f88ffffffffffffffffff88f8...
    .f88ffff8888888888888888ffff88f.
    ffffffff8888888888888888ffffffff
    f8888ffffffffffffffffffffff8888f
    f8888f88888888888888888888f8888f
    f22211ffffffffffffffffffff11222f
    f22222ffffffffffffffffffff22222f
    ffffffffffff11111111ffffffffffff
    88888888888811111111888888888888
    88888ffffffffffffffffffffff88888
    f88888fdfdffffffffffffdfdf88888f
    ffffffffffffffffffffffffffffffff
    ffffffff................ffffffff
    fffffff..................fffffff
    fffffff..................fffffff
    ................................
`, SpriteKind.Player)
}

// initialze the starting variables
function initGame() {

    scene.setBackgroundColor(9); // sky color
    controller.moveSprite(gameData.player, 120, 0); // basic x-axis controller

    // setup track
    // generate track with 20 segments
    gameData.track.generate(20);
    // set segment index
    gameData.segment = 0;
    gameData.segmentPos = 0;    
    // setup player
    gameData.player.x = 80;
    gameData.player.y = 100;
    sprites.setDataNumber(gameData.player, "z", 0);
    sprites.setDataNumber(gameData.player, "vel", 0);
};


// Main update method. Does the physics!
// I'm not sure how timesteps are handled internally by the
// MakeCode Arcade engine. Since I don't know how to get a 
// delta time from the main onUpdate handler, I'm using
// a fixed timestep of 60 FPS.
game.onUpdateInterval(TIMESTEP_MS, function() {    
    // fetch current track segment
    let curSegment = gameData.track.getSegment(gameData.segment);    
    // fetch data from player
    let z = sprites.readDataNumber(gameData.player, "z");
    let vel = sprites.readDataNumber(gameData.player, "vel");
    
    // apply acceleration or stopping friction
    if (controller.player1.isPressed(ControllerButton.A)) {
        vel += ACCELERATION;
    } else {        
        vel *= 0.98; // apply friction
        // snap to zero
        if (vel < 0.1 ) { 
            vel = 0; 
        } 
    }

    // apply heavy braking force beyond track edges
    if (gameData.player.x < 16 || gameData.player.x > 144) {
        vel *= 0.95; // braking force
    }

    // clamp to max velocity
    vel = Math.clamp(0, MAX_VELOCITY, vel);

    // apply lateral force based on curve radius
    // this simulates the force required to follow a turn
    if (curSegment.dx) {
        let scaler = vel / MAX_VELOCITY;
        let f = curSegment.dx * -80 * Math.pow(scaler, 2);
        gameData.player.x += f;
    } 
    
    // increase z position by z velocity
    z += vel;
    gameData.segmentPos += vel;

    // track segmentPos to change segment counter
    if (gameData.segmentPos >= curSegment.length) {
        gameData.segment = (gameData.segment + 1) % gameData.track.segments.length;
        gameData.segmentPos -= curSegment.length;
    }
    
    // store vel and z for player
    sprites.setDataNumber(gameData.player, "vel", vel);    
    sprites.setDataNumber(gameData.player, "z", z);
    
});

// Main rendering method. The MakeCode Arcade engine calls this 
// method after the background is cleared. We're basically just 
// grabbing that blank background image and drawing our raster 
// roads on top.
game.onPaint(function() {    
    let camZ = sprites.readDataNumber(gameData.player, "z");    
    let bg = scene.backgroundImage();
    // draw road    
    gameData.track.render(bg, camZ, gameData.segment);
});

// Main UI rendering method. The MakeCode Arcade engine calls this 
// method after the sprites are drawn.
game.onShade(function() {        
    // show current track segment on left
    info.player1.setScore(gameData.segment);
    // show velocity on right
    info.player2.setScore(sprites.readDataNumber(gameData.player, "vel") * 60);    
});

initGame();