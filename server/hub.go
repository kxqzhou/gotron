

package server

// maintains active clients and broadcasts game state to clients
type Hub struct {
	clients map[*Client]int

	register chan *Client
	unregister chan *Client

	game *Game
}

func NewHub() *Hub {
	return &Hub {
		clients: make( map[*Client]int ),
		register: make( chan *Client ),
		unregister: make( chan *Client ),
		game: newGame(),
	}
}

// definitely better way to do this..
var counter int = 0

func generateID() int {
	// mod 4 b/c going to run out of colors (in logic) lol
	retval := counter + 1
	counter = (counter + 1) % 4
	return retval
}

func (h *Hub) Run() {
	for {
		select {
		case c := <- h.register:
			h.clients[c] = generateID()
		case c := <- h.unregister:
			if _, ok := h.clients[c]; ok {
				delete( h.clients, c )
			}
		}
	}
}

