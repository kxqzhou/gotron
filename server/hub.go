

package main

// maintains active clients and broadcasts game state to clients
type Hub struct {
	// registered clients
	clients map[*Client]bool

	// inbound message from clients
	broadcast chan []byte

	register chan *Client
	unregister chan *Client
}

func newHub() *hub {
	return &Hub {
		broadcast: make( chan []byte ),
		register: make( chan *Client ),
		unregister: make( chan *Client ),
		clients: make( map[*Client]bool ),
	}
}

func (h *Hub) run() {
	for {
		select {
		case c := <- h.register:
			h.clients[c] = true
		case c := <- h.unregister:
			if _, ok := h.clients[c]; ok {
				delete( h.clients, c )
				close( c.send )
			}
		// this needs to be rewritten to somehow serve game
		case msg := <- h.broadcast:
			for c := range h.clients {
				select {
				case c.send <- msg:
					// what is the point of this?
				default:
					close( c.send )
					delete( h.clients, c )
				}
			}
		}
	}
}

