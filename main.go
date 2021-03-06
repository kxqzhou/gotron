
package main

import (
	"log"
	"flag"
	"net/http"
	"github.com/kxqzhou/gotron/server"
)

func serveHome( w http.ResponseWriter, r *http.Request ) {
	log.Println( r.URL )

	if r.URL.Path != "/" {
		http.Error( w, "Not found", 404 )
		return
	}

	if r.Method != "GET" {
		http.Error( w, "Method not allowed", 405 )
		return
	}

	//http.ServeFile( w, r, "static/index.html" )

	http.FileServer( http.Dir( "./static" ) )
}

func main() {
	hub := server.NewHub()
	go hub.Run()
	
	var port = flag.String( "port", ":8080", "http service address" )
	flag.Parse()

	//http.HandleFunc( "/", serveHome )
	http.Handle( "/", http.FileServer( http.Dir( "./static" ) ) )
	// why doesn't the above work?

	http.HandleFunc( "/ws", func( w http.ResponseWriter, r *http.Request ) {
		server.ServeWs( hub, w, r )
	} )

	err := http.ListenAndServe( *port, nil )
	if err != nil {
		log.Fatal( "Listen and serve", err )
	}
}


