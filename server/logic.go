

package server

import (
	"math/rand"
)

const (
	gridWidth = 80
	gridHeight = 45
)

type vec2 struct {
	X, Y int
}

func addVec( a, b vec2 ) vec2 {
	return vec2{ a.X + b.X, a.Y + b.Y }
}

func withinBounds( v vec2 ) bool {
	return v.X > 0 && v.Y >= 0 && v.X < gridWidth && v.Y < gridHeight
}

type Player struct {
	pos vec2
}

func newPlayer() *Player {
	return &Player {
		vec2{}
	}
}

type Game struct {
	colors []string
	grid [][]int
}

func newGame() *Game {
	return &Game {
		colors: []string{ "red", "blue", "green", "yellow" },
		grid: [ gridWidth ][ gridHeight ]int,
	}
}

