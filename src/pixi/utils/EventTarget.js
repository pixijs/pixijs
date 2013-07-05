/**
 * https://github.com/mrdoob/eventtarget.js/
 * THankS mr DOob!
 */

PIXI.EventTarget = function () {

	var listeners = {};
	
	this.addEventListener = this.on = function ( type, listener ) {
		
		
		if ( listeners[ type ] === undefined ) {

			listeners[ type ] = [];
			
		}

		if ( listeners[ type ].indexOf( listener ) === - 1 ) {

			listeners[ type ].push( listener );
		}

	};

	this.dispatchEvent = this.emit = function ( event ) {

		if ( typeof listeners[ event.type ] !== 'function' ) {

			return;
			
		}
		
		for(var i = 0, l = listeners[ event.type ].length; i < l; i++) {

			listeners[ event.type ][ i ]( event );
			
		}

	};

	this.removeEventListener = this.off = function ( type, listener ) {

		var index = listeners[ type ].indexOf( listener );

		if ( index !== - 1 ) {

			listeners[ type ].splice( index, 1 );

		}

	};

};
