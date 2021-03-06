

package server

import (
	"log"
	"time"
	"encoding/json"
	"net/http"
	"github.com/gorilla/websocket"
	//"os"
)

const (
	// delay before sending next client command
	stepDelay = 200

	// max wait period before disconnect
	maxWaitTime = 60

	bufferSize = 1024
)

var upgrader = websocket.Upgrader{
	ReadBufferSize: bufferSize,
	WriteBufferSize: bufferSize,
}

type Client struct {
	// apparently you can call vars the same name as the struct?
	// but this has to be bad practice.. let's change that
	hub *Hub
	conn *websocket.Conn
	player *Player
}

func (c *Client) receive() {
	defer func () {
		c.hub.unregister <- c
		c.conn.Close()
	}()
	//c.conn.SetReadDeadline( time.Now().Add( maxWaitTime ) )
	// idk what this does, prob sets the error message. taken from the chat example on gorilla websockets
	//c.conn.SetPongHandler( func( string ) error { c.conn.SetReadDeadline( time.Now().Add( maxWaitTime )); return nil } )
	
	for {
		_, keyInput, err := c.conn.ReadMessage()
		if err != nil {
			log.Println( "Error while recieving commands from client", err )
			break
		}

		//os.Stdout.Write( keyInput )
		
		var command vec2
		err = json.Unmarshal( keyInput, &command )

		//log.Println( "cmd:", command )

		c.updatePosition( command )

		//log.Println( "pos:", c.player.pos )
	}
}

func (c *Client) loop() {
	for {
		time.Sleep( time.Duration( stepDelay ) * time.Millisecond )
		c.sendPlayerState()
	}
}

func ServeWs( h *Hub, w http.ResponseWriter, r *http.Request ) {
	socket, err := upgrader.Upgrade( w, r, nil )
	if err != nil {
		log.Println( err )
		return
	}

	cl := &Client {
		hub: h,
		conn: socket,
		player: newPlayer(),
	}

	h.register <- cl

	go cl.receive()
	go cl.loop()
}

func (c *Client) updatePosition( dir vec2 ) {
	newPos := addVec( c.player.pos, dir )
	if withinBounds( newPos ) {
		c.player.pos = newPos
		id := c.hub.clients[c]
		c.hub.game.Grid[ newPos.X ][ newPos.Y ] = id
	}
}

func (c *Client) sendPlayerState() {
	gameInfo, err := json.Marshal( c.hub.game )
	if err != nil {
		log.Println( "JSON Marshal error: ", err )
	}

	//os.Stdout.Write( gameInfo )
	//os.Exit(1)

	err = c.conn.WriteMessage( websocket.TextMessage, gameInfo )
	if err != nil {
		c.conn.Close()
	}
}

