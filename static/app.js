

var WebSocket = WebSocket || window.WebSocket || window.MozWebSocket; 

// are these really not provided by cocos2d? but their documentation is seriously lacking..
var KeyCode = {
	KEY_W:87,
	KEY_UP_ARROW:38,
	KEY_A:65,
	KEY_LEFT_ARROW:37,
	KEY_S:83,
	KEY_DOWN_ARROW:40,
	KEY_D:68,
	KEY_RIGHT_ARROW: 39,
}

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

		this.conn = new WebSocket( "ws://localhost:8080/ws" );
		//this.conn.onmessage = this.onSocketMessage;

		// hackish workaround because in would be func onSocketMessage, this no longer = cc Layer
		var app = this;
		this.conn.onmessage = function (evt) {
			var gameInfo = JSON.parse( evt.data );
			for (var i = 0; i < gameInfo.Colors.length; i++) {
				app.colors[i] = gameInfo.Colors[i];
			}
			for (var i = 0; i < gameInfo.Grid.length; i++) {
				for (var j = 0; j < gameInfo.Grid[i].length; j++) {
					app.grid[ i * gameInfo.Grid.length + j ] = gameInfo.Grid[i][j];
				}
			}
		};

		this.conn.onerror = this.onSocketError;

		if ('keyboard' in cc.sys.capabilities) {
			cc.eventManager.addListener( {
				event: cc.EventListener.KEYBOARD,
				onKeyPressed: function (key, evt) {
					console.log( "pressed:", key )

					switch (key) {
						case KeyCode.KEY_W:
						case KeyCode.KEY_UP_ARROW:
							console.log( "W or up" )

							var dir = {
								X:0,
								Y:1,
							}
							app.conn.send( JSON.stringify( dir ) );
							break;
						case KeyCode.KEY_A:
						case KeyCode.KEY_LEFT_ARROW:
							console.log( "A or left" )

							var dir = {
								X:-1,
								Y:0,
							}
							app.conn.send( JSON.stringify( dir ) );
							break;						
						case KeyCode.KEY_S:
						case KeyCode.KEY_DOWN_ARROW:
							console.log( "S or down" )

							var dir = {
								X:0,
								Y:-1,
							}
							app.conn.send( JSON.stringify( dir ) );
							break;
						case KeyCode.KEY_D:
						case KeyCode.KEY_RIGHT_ARROW:
							console.log( "D or right" )

							var dir = {
								X:1,
								Y:0,
							}
							app.conn.send( JSON.stringify( dir ) );
							break;
					}
				}
			}, this );
		}

		this.scheduleUpdate();
	},

	/*onSocketMessage:function (evt) {
		// i see.. once we're in this func 'this' no longer refers to the cc Layer

		var gameInfo = JSON.parse( evt.data );
		for (var i = 0; i < gameInfo.Colors.length; i++) {
			this.colors[i] = gameInfo.Colors[i];
		}
		for (var i = 0; i < gameInfo.Grid.length; i++) {
			for (var j = 0; j < gameInfo.Grid[i].length; j++) {
				this.grid[ i * gameInfo.Grid.length + j ] = gameInfo.Grid[i][j];
			}
		}
	},*/

	onSocketError:function (err) {
		console.log( "front-end socket error: " + err );
	},
	
	update:function (dt) {
		// more hardcoding.. this is bad
		for (var i = 0; i < 80; i++) {
			for (var j = 0; j < 45; j++) {
				if (this.grid[ i * 80 + j ] > 0) {
					this.drawNode.drawRect( cc.p( i * 10, j * 10 ), cc.p( (i + 1) * 10, (j + 1) * 10 ), 0, 
											this.colorLookup[ this.colors[ this.grid[ i * 80 + j ] ] ] );
				}
			}
		}
	}
});

var GameScene = cc.Scene.extend({
	ctor:function () {
		this._super();
		var layer = new GameLayer();
		this.addChild( layer );
	}
});

