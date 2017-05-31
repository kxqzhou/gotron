
package main

import (
	"log"
	"flag"
	"net/http"
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

	http.ServeFile( w, r, "../index.html" )
}

func main() {
	hub := newHub()
	go hub.run()
	
	var port = flag.String( "port", ":8080", "http service address" )
	flag.Parse()

	http.HandleFunc( "/", serveHome )
	http.HandleFunc( "/ws", func( w http.ResponseWriter, r *http.Request ) {
		serveWs( hub, w, r )
	} )
	
	err := http.ListenAndServe( port, nil )
	if err != nil {
		log.Fatal( "Listen and serve", err )
	}
}


