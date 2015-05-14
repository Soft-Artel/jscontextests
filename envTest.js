"use strict";

var
    global = this
    ;

if ( !log ) var log = console.log;



log( '[' + new Date + '] Calling modelResult...' );
var modelResult = modelQuery( 'Hello!' );
log( '[' + new Date + '] Called modelResult... Got result: ' + modelResult );

this.parseText = function ( text, options ) {
    var self = this;
    options || ( options = {} );
    if ( this.modelQuery ) options.model = function ( query, callback ) {
        callback( self.modelQuery( query ) );
    };
    log( options.model( text ) );
//    smartDateParse( text, options, function ( err, res ) {
//                   self.result = res;
//                   } );
};
