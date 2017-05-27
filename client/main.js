

window.onload = function () {
	cc.game.onStart = function () {
		cc.LoaderScene.preload( g_res, function () {
			cc.director.runScene( new GameScene() );
		}, this );
	};
	cc.game.run( "gameCanvas" );
};

