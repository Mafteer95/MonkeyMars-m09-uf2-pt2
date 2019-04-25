var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 400},
            debug: false
        }
    },
    scene: {
        key: 'main',
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

var map;
var spikes, snails;
var gameOver = false;
var player;
var cursors;
var groundtiles, coinTiles;
var groundLayer, coinLayer;
var scoretext;
var score = 0;

function preload() {
    //loading the images and sprites
    this.load.tilemapTiledJSON('map', './assets/json/map.json');
    this.load.spritesheet('tiles', './assets/img/tiles.png', {frameWidth: 70, frameHeight: 70});
    this.load.image('coin', './assets/img/coin.png');
    this.load.image('cloud', './assets/img/cloud2.png');
    this.load.image('cactus', './assets/img/cactus.png');
    this.load.image('rock', './assets/img/rock.png');
    this.load.image('plant', './assets/img/plant.png');
    this.load.image('snail', './assets/img/snailWalk1.png');
    this.load.image('spikes', './assets/img/spikes.png');
    this.load.atlas('player', './assets/img/player_Edited_2.png', 'assets/json/p1_walk.json');
}

function create() {
    //set background color
    this.cameras.main.setBackgroundColor('#ccccff');
    // setting the images
    this.add.image(400,150,'cloud');
    this.add.image(100,170,'cloud');
    this.add.image(700,160,'cloud');
    this.add.image(900,155,'cloud');
    this.add.image(1200,165,'cloud');
    this.add.image(1500,155,'cloud');
    this.add.image(1900,150,'cloud');

    this.add.image(300,475,'snail');
    this.add.image(1300,475,'snail');

    this.add.image(500,455,'cactus');
    this.add.image(1400,455,'cactus');
    this.add.image(1900,455,'cactus');

    this.add.image(700,475,'rock');
    this.add.image(1000,475,'rock');
    this.add.image(1500,475,'rock');

    this.add.image(100,455,'plant');
    this.add.image(600,455,'plant');
    this.add.image(900,455,'plant');
    this.add.image(1700,455,'plant');
    //creating the map based on tiled
    map = this.make.tilemap({key: 'map'});

    
    // creating the player     
    player = this.physics.add.sprite(100, 100, 'player');
    player.setBounce(0.2); // our player will bounce from items
    player.setCollideWorldBounds(true); // the player can't go out the map  

    // tiles for the ground 
    groundTiles = map.addTilesetImage('tiles');
    //create the ground 
    groundLayer = map.createDynamicLayer('World', groundTiles, 0, 0);

    groundLayer.setCollisionByExclusion([-1]);

    coinTiles = map.addTilesetImage('coin');
    // adding coins
    coinLayer = map.createDynamicLayer('Coins', coinTiles, 0, 0);

    //adding spikes
    spikes = this.physics.add.group({
        key: 'spikes',
        repeat: 9,
        setXY: { x: 12, y: 0, stepX: 200 }
    });

    // set the borders of our game world
    this.physics.world.bounds.width = groundLayer.width;
    this.physics.world.bounds.height = groundLayer.height;  
    
    // player will collide with this tiles 
    this.physics.add.collider(groundLayer, player);
    this.physics.add.collider(groundLayer, spikes);
    this.physics.add.collider(spikes, player, hit, null, this);
    //player will collect the coins
    coinLayer.setTileIndexCallback(17, collect, this);
    this.physics.add.overlap(player, coinLayer);

    //player movement animation

    cursors = this.input.keyboard.createCursorKeys();

    this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNames('player', {prefix: 'p1_walk', start: 1, end: 11}),
        frameRate: 10,
        repeat: -1
    });
    //player static
    this.anims.create({
        key: 'idle',
        frames: [{key: 'player', frame: 'p1_stand'}],
        frameRate: 10,
    });

    //controlling the cameras
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(player);

    //this text will show the score
    scoretext = this.add.text(20, 570, '0', {
        fontSize: '2rem',
        fill: '#ffffff'
    });

    scoretext.setScrollFactor(0);
}

function update(time, delta) {

    if (gameOver)
    {
        return; //condition to lose
    }
    //move to left
    if (cursors.left.isDown)
    {
        player.body.setVelocityX(-200);
        player.anims.play('walk', true); 
        player.flipX = true; 
    }
    //move to right
    else if (cursors.right.isDown)
    {
        player.body.setVelocityX(200);
        player.anims.play('walk', true);
        player.flipX = false; 
    } else {
        player.body.setVelocityX(0);
        player.anims.play('idle', true);
    }
    // jump 
    if (cursors.up.isDown && player.body.onFloor())
    {
        player.body.setVelocityY(-500);        
    }
}
//function to collect the coins
function collect(sprite, tile) {
    coinLayer.removeTileAt(tile.x, tile.y); // remove the tile/coin
    score++; // add 10 points to the score
    scoretext.setText(score); // set the text to show the current score
    return false;
}

//this function makes the hits
function hit (player, spikes)
{
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('idle');

    gameOver = true;
}