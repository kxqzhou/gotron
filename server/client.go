

package main

import (
	"time"
	"encoding/json"
	"github.com/gorilla/websocket"
)

const (
	// time allowed to read next message from peer
	pongWait = 60 * time.Second

	// send pings to peer with this period
	pingPeriod = pongWait * 9 / 10
)

var upgrader = websocket.Upgrader{
	ReadBufferSize: 1024,
	WriteBufferSize: 1024,
}

type Client struct {
	hub *Hub
	conn *websocket.Conn
	send chan []byte
}

