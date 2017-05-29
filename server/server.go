

package main

import (
	"log"
	"net/http"
	"encoding/json"
	"github.com/gorilla/websocket"
)

type player struct {
	color string
	X int
	Y int
	Dir string
	ws *websocket.Conn
	send chan []byte
}

type game struct {
	clients map[*player]bool
	broadcast chan string
	register chan *player
	unregister chan *player

	grid [80 * 45]bool
}

func newGame *game {
	g := game {
		
	}
	go g.run()
	return &g
}

func (g *game) run() {
	for {
		select {
		case c := <- g.register:

			break
		}
		case c := <- g.unregister:
			_, ok := g.clients[c]
			if ok {
				delete( g.clients, c )
				close( c.send )
			}
			break
		case m := <- g.broadcast:
			g.updateGame( m )
			g.broadCastGame()
			break
	}
}

func main() {

	
}

