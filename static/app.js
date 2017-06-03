

var WebSocket = WebSocket || window.WebSocket || window.MozWebSocket; 

var GameLayer = cc.Layer.extend({
	conn:null,
	colors:[],
	grid:[],
	colorLookup:{},
	drawNode:null,
	ctor:function () {
		this._super();
		var background = new cc.LayerColor( cc.color(0, 0, 0) );
		this.addChild( background, res.Z_ORDER_BG, res.TAG_BG );

		this.conn = new WebSocket( "ws://localhost:8080/ws" );

		this.conn.onmessage = this.onSocketMessage;
		this.conn.onerror = this.onSocketError;

		// hardcoded numbers.. how to retrieve from server?
		for (var i = 0; i < 5; i++) {
			this.colors.push( "black" );
		}
		for (var i = 0; i < 80 * 45; i++) {
			this.grid.push( 0 );
		}

		// more hard code to avoid big switch statement / re calc every time
		// maybe the go server should somehow pass in a cc.color?
		this.colorLookup["black"] = cc.color( 0, 0, 0 );
		this.colorLookup["red"] = cc.color( 255, 0, 0 );
		this.colorLookup["blue"] = cc.color( 0, 255, 0 );
		this.colorLookup["green"] = cc.color( 0, 0, 255 );
		this.colorLookup["yellow"] = cc.color( 0, 128, 128 );

		this.drawNode = new cc.DrawNode();
		this.addChild( this.drawNode );

		if ('keyboard' in cc.sys.capabilities) {
			cc.eventManager.addListener( {
				event: cc.EventListener.KEYBOARD,
				onKeyPressed: function (key, evt) {
					switch (key) {
						case cc.KeyCode.KEY_W:
						case cc.KeyCode.KEY_UP_ARROW:
							var dir = "{ X: 0, Y: 1 }";
							this.conn.send( dir );
							break;
						case cc.KeyCode.KEY_A:
						case cc.KeyCode.KEY_LEFT_ARROW:
							var dir = "{ X: -1, Y: 0 }";
							this.conn.send( dir );
							break;						
						case cc.KeyCode.KEY_S:
						case cc.KeyCode.KEY_DOWN_ARROW:
							var dir = "{ X: 0, Y: -1 }";
							this.conn.send( dir );
							break;
						case cc.KeyCode.KEY_D:
						case cc.KeyCode.KEY_RIGHT_ARROW:
							var dir = "{ X: 1, Y: 0 }";
							this.conn.send( dir );
							break;
					}
				}
			}, this );
		}

		//this.scheduleUpdate();
	},

	onSocketMessage:function (evt) {
		var gameInfo = JSON.parse( evt.data );
		for (var i = 0; i < gameInfo.colors.length; i++) {
			colors[i] = gameInfo.colors[i];
		}
		for (var i = 0; i < gameInfo.grid.length; i++) {
			for (var j = 0; j < gameInfo.grid[i].length; j++) {
				grid[ i * gameInfo.grid.length + j ] = gameInfo.grid[i][j];
			}
		}

		this.reDraw();
	},

	reDraw:function() {
		// more hardcoding.. this is bad
		for (var i = 0; i < 80; i++) {
			for (var j = 0; j < 45; j++) {
				this.drawNode.drawRect( cc.p( i * 10, j * 10 ), cc.p( (i + 1) * 10, (j + 1) * 10 ), 1, 
										this.colorLookup[ this.colors[ this.grid[ i * 80 + j ] ] ] );
			}
		}
	},

	onSocketError:function (err) {
		console.log( "front-end socket error: " + err );
	},
	/*
	update:function (dt) {
		
	}
	*/
});

var GameScene = cc.Scene.extend({
	ctor:function () {
		this._super();
		var layer = new GameLayer();
		this.addChild( layer );
	}
});

