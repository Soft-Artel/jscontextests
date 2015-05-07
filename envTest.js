"use strict";

if ( !log ) var log = console.log;

Object.keys( global ).forEach( function ( k ) {
	log( 'Type of global.' + k + ' is ' + ( typeof this ) + ', global.' + k + '.valueOf()=' + this.valueOf() + ', global.' + k + '.toString()=' + this.toString() );
} );

log( '[' + new Date + '] Calling wait1s...' );
wait1s( 'Hello!' );
log( '[' + new Date + '] Called wait1s...' );
