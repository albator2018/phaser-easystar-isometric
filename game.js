var game = new Phaser.Game(800, 600, Phaser.CANVAS, '', this);

var BasicGame = function () { };

BasicGame.Boot = function () { };

var isoGroup;
var player;
var cursorPos;
var selectedTile;
var moveTween;

BasicGame.Boot.prototype = {

    preload: function () {

        game.load.image('tile', './assets/tile.png');
        game.load.image('box', './assets/cube.png');

        game.time.advancedTiming = true;

        // Add and enable the plug-in.
        game.plugins.add(new Phaser.Plugin.Isometric(game));

        // This is used to set a game canvas-based offset for the 0, 0, 0 isometric coordinate - by default
        // this point would be at screen coordinates 0, 0 (top left) which is usually undesirable.
        game.iso.anchor.setTo(0.5, 0.2);

        game.input.onDown.add(this.movePlayer,this);

        // Start the physics system
        game.physics.startSystem(Phaser.Plugin.Isometric.ISOARCADE);

    },

    create: function () {

        // Create ISO groups
        isoGroup = game.add.group();

        // Let's make a load of tiles on a grid.
        this.spawnTiles();

        // Provide a 3D position for the cursor
        cursorPos = new Phaser.Plugin.Isometric.Point3();

       // player = game.add.isoSprite(185, 185, 0, 'characterAnim', 0, playerGroup);
        player = game.add.isoSprite(185, 185, 0, 'box', 0, isoGroup);
        player.anchor.set(0.5,0.5);

        //Setup physics
        game.physics.isoArcade.gravity.setTo(0, 0, -500);
        game.physics.isoArcade.enable(player);

        player.body.moves=false;
        player.body.collideWorldBounds = true;
    },

    update: function () {
        // Update the cursor position.
        // It's important to understand that screen-to-isometric projection means you have to specify a z position manually, as this cannot be easily
        // determined from the 2D pointer position without extra trickery. By default, the z position is 0 if not set.
        game.iso.unproject(game.input.activePointer.position, cursorPos);

        // Loop through all tiles and test to see if the 3D position from above intersects with the automatically generated IsoSprite tile bounds.
        isoGroup.forEach(function (tile) {
            var inBounds = tile.isoBounds.containsXY(cursorPos.x, cursorPos.y);


            // If it does, do a little animation and tint change.
            if (!tile.selected && inBounds) {
                tile.selected = true;
                selectedTile = tile;
                tile.tint = 0x86bfda;
               // game.add.tween(tile).to({ isoZ: 4 }, 200, Phaser.Easing.Quadratic.InOut, true);
            }
            // If not, revert back to how it was.
            else if (tile.selected && !inBounds) {
                tile.selected = false;
                tile.tint = 0xffffff;
               // game.add.tween(tile).to({ isoZ: 0 }, 200, Phaser.Easing.Quadratic.InOut, true);
            }
        });

    },

    render: function () {
        game.debug.text(game.time.fps || '--', 2, 14, "#a7aebe");
    },

    spawnTiles: function () {
        var tile;

        var myGrid = [];
        var i = 0;
        for (var xx = 0; xx < 400; xx += 38) {
            myGrid[i] = [];
            for (var yy = 0; yy < 400; yy += 38) {
                // Create a tile using the new game.add.isoSprite factory method at the specified position.
                // The last parameter is the group you want to add it to (just like game.add.sprite)
                tile = game.add.isoSprite(xx, yy, 0, 'tile', 0, isoGroup);
                tile.anchor.set(0.5, 0);
                myGrid[i].push('tile');
            }
            i++;
        }
        //console.log(myGrid);
        easystar.setGrid(myGrid);
        easystar.setAcceptableTiles(['tile']);
    },

    movePlayer: function (){
      var tile = selectedTile;
      //console.log("tile", selectedTile);
      //console.log(Math.floor(tile.isoX/38), Math.floor(tile.isoY/38));
      //console.log(Math.floor(player.isoX/38), Math.floor(player.isoY/38));
      //console.log(player.x, player.y);
      //console.log(tile.x, tile.y);
      //i understand that .x is in the game phase and .isoX is in phaser isometric
      var i = 0;
      function moveObject(object, p){
        var StepX = p[i].x || false, StepY = p[i].y || false;
        moveTween = game.add.tween( object ).to({ isoX: StepX*38, isoY: StepY*38}, 150);
        moveTween.start();
        moveTween.onComplete.add(function(){
          i++;
          if(i < p.length){
            console.log(p[i]);
            moveObject(object, p);
          }else{
            //player.play('idle');
          }
        });
      }
      easystar.findPath(Math.floor(player.isoX/38), Math.floor(player.isoY/38), Math.floor(tile.isoX/38), Math.floor(tile.isoY/38), function( path ) {
        if (path === null) {
          console.log("Path was not found.");
        } else {
          console.log(path);
          console.log("Path was found.");
          if (player.ismoving === false){
            console.log("is not moving");
            player.ismoving = true;
            moveObject(player, path);
          } else {
            console.log("is moving");
            player.ismoving = false;
            moveTween.stop();
          }
        }
      });
      easystar.calculate();
    }
};

var easystar = new EasyStar.js();
game.state.add('Boot', BasicGame.Boot);
game.state.start('Boot');
