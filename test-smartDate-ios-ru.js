"use strict";

( function (){

	/**
	 * @author Kadyrov Albert <fluffy1snow@gmail.com>
	 * @module SD_utils
	 */


	var SD_tools = {
		queries : [],
		workTime : null,
		localDate : null,
		_getDate : function() {
			if ( this.localDate ) {
				return new Date( this.localDate );
			} else return new Date()
		},
		dateToISOString : function ( date, dateOnly ) {
			var
				tzo = -date.getTimezoneOffset(),
				pad = function ( d ) {
					return d < 10 ? '0' + d : d
				};
			return (
				dateOnly
					? [date.getFullYear(), '-', pad( date.getMonth() + 1 ), '-', pad( date.getDate() )]
					: [date.getFullYear(), '-', pad( date.getMonth() + 1 ), '-', pad( date.getDate() ), 'T' + date.getHours( true ), ':', date.getMinutes( true ), ':', pad( date.getSeconds() ), ( tzo >= 0 ? '+' : '-' ), pad( Math.abs( tzo / 60 ) >> 0 ), ':', pad( Math.abs( tzo ) % 60 )]
			).join( '' );
		},
		addDays : function ( date, numOfDays ) {
			date.setDate( date.getDate() + ( numOfDays === undefined ? 0 : numOfDays ) );
			return date;
		},
		dayOfWeek : function ( date, numOfDays ) {
			date.setDate( date.getDate() - date.getDay() + numOfDays );
			return date;
		},
		dayOfNextWeek : function ( date, numOfDays ) {
			var current = this._getDate();
			date.setDate( date.getDate() - date.getDay() + numOfDays );
			if ( current.getTime() >= date.getTime() ){
				date.setDate( date.getDate() - date.getDay() + 7 + numOfDays );
			}
			return date;
		},
		addMonths : function ( date, numOfMonths ) {
			date.setMonth( date.getMonth() + numOfMonths );
			return date;
		},
		addYears : function ( date, numOfYears ) {
			date.setFullYear( date.getFullYear() + numOfYears );
			return date;
		},
		defineYear : function ( dd, mm ) {
			var current = this._getDate();
			var newDate = this._getDate();
			newDate.setMonth( mm - 1 );
			newDate.setDate( dd );
			if (current.getTime() >= newDate.getTime()){
				newDate = new Date( newDate.getFullYear() + 1, mm - 1, dd  );
			}
			return newDate;
		},
		now : function ( offset, options, duplicity ) {
			var time = new Date( this._getDate().setMinutes( this._getDate().getMinutes() + +( offset == undefined ? 0 : offset ) ) ), hh, mm, offs = Math.round( ( time - this._getDate() )/86400000 );
			hh =  time.getHours();
			mm =  time.getMinutes();
			if ( options === 'h' ) {
				return hh;
			} else if ( options === 'm' ) {
				return mm;
			} else if ( options === 'ISO' ) {
				return ( ( ( +hh > 9 ) || ( +hh === 0 ) ) ? hh : '0' + hh ) + ':' + ( +mm > 9 ? mm : '0' + +mm );
			} else return { h : hh, m : mm, offset : offs, duplicity: duplicity };
		},
		today : function ( offset ) {
			var a = this.addDays( this._getDate(), +( offset == undefined ? 0 : offset )), b = this.dateToISOString( a, true );
			return b;
		},
		beginOfWeek : function ( offset ) {
			return this.dateToISOString( this.dayOfNextWeek( this._getDate(), offset ), true );
		},
		beginOfNextWeek : function ( offset ) {
			return this.dateToISOString( this.dayOfNextWeek( this._getDate(), offset ), true );
		},
		currentMonth : function ( offset ) {
			return this.dateToISOString( this.addMonths( this._getDate(), offset ), true );
		},
		currentYear : function ( offset ) {
			return this.dateToISOString( this.addYears( this._getDate(), offset ), true );
		},
		monthOfNextYear : function ( mm ) {
			var current = this._getDate();
			var d = this._getDate();
			d.setMonth( mm - 1 );
			d.setDate( 1 );
			if ( current.getTime() >= d.getTime() ){
				d.setFullYear( d.getFullYear() + 1 );
			}
			return this.dateToISOString( d, true );
		},
		setDate : function ( dd, mm, validate ) {
			if ( validate ) {
				if ( this._validateDate( dd, mm, ( this.defineYear( dd, mm )).getFullYear() ) ) return this.dateToISOString(this.defineYear(dd, mm), true );
			} else return this.dateToISOString(this.defineYear( dd, mm ), true);
		},
		setFullDate : function ( dd, mm, yy, validate ) {
			var newDate = this._getDate(), res;
			newDate.setMonth( mm - 1 );
			newDate.setDate( dd );
			if ( yy.toString().length > 2 ) {
			} else if ( +yy > 25 ) {
				yy = + ( '19' + yy );
			} else yy = +( '20' + yy );
			newDate.setFullYear( yy );
			if ( validate ) {
				if ( this._validateDate( dd, mm, yy ) ) return this.dateToISOString( newDate, true );
			} else return this.dateToISOString( newDate, true );
		},
		nextMonth : function ( offset ) {
			return this.dateToISOString( this.addMonths( new Date( this._getDate().setDate( 1 ) ), offset ), true );
		},
		nearestDayMonth : function ( dd, mm ) {
			var current = this._getDate();
			var newDate = this._getDate();
			newDate.setMonth( mm - 1 );
			newDate.setDate( dd );
			if ( current.getTime() >= newDate.getTime() ) {
				newDate.setFullYear( newDate.getFullYear() + 1 );
			}
			return this.dateToISOString( newDate, true );
		},
		getNumberRegExp : /(?:_)(\d+)\b/,
		_getNumber : function ( a ) {
			//console.log( a );
			return +this.getNumberRegExp.exec( a )[ 1 ];
		},
		_publicateQuery : function ( query ) {
			query._id = this.queries.length;
			this.queries[ query._id ] = query;
		},
		_validateDate : function( dd, mm, yy ) {
			var date = new Date( +yy, +mm - 1 , +dd );
			if ( date.getFullYear() === +yy && date.getMonth() == +mm - 1 && date.getDate() == +dd ) return true;
		},
		_durationCounter : function( durationBegin, durationEnd, summode ) {
			var d1 = ( typeof( durationBegin ) === "object" ) ? durationBegin.h * 60 + durationBegin.m : durationBegin ? durationBegin * 60 : this.now( 0, 'h') * 60 + this.now( 0, 'm'),
				d2 = ( typeof( durationEnd ) === "object" ) ? durationEnd.h * 60 + durationEnd.m : durationEnd * 60;
			if ( durationBegin && durationBegin.duplicity !== false && d1 < d2 ) {
				if ( typeof( durationBegin ) === "object" ) {
					if ( ( d2 - ( ( durationBegin.h + 12 ) * 60 + durationBegin.m ) ) > 0 ) d1 = ( durationBegin.h + 12 ) * 60 + durationBegin.m;
				} else if ( ( d2 - ( durationBegin + 12 ) * 60 ) > 0 ) d1 = ( durationBegin + 12 ) * 60;
			}
			if ( durationEnd && durationEnd.duplicity !== false && d1 > d2 ) {
				if ( typeof( durationEnd ) === "object" ) {
					if ( d1 < ( ( durationEnd.h + 12 ) * 60 + durationEnd.m ) ) d2 = ( durationEnd.h + 12 ) * 60 + durationEnd.m;
				} else if ( d1 < ( durationEnd + 12 ) * 60  ) d2 = ( durationEnd + 12 ) * 60;
			}
			if( summode ) {
				if ( durationBegin === "allday" ) { return durationBegin; } else return d1.toString();
			}
			if ( d1 < d2 ) { return ( d2 - d1 ).toString(); } else if ( d1 > d2 ) return ( 1440 - d1 + d2  ).toString();
		}
	};


	/**
	 * @author Kadyrov Albert <fluffy1snow@gmail.com>
	 * @module SmartDateLocale_RU
	 */

	var tokens = [
		{
			//TODO escape for geo coord-s
			// money
			regExp : /([^а-яА-яЁё0-9_]|^)((?:\d+[.,]\d+|\d+)(?:\s{0,5}(?:тысяч|тыс|тысячей))?\s{0,3}(?:рублей|руб|р\.|долларов))([^а-яА-яЁёa-zA-Z0-9\-_]|$)/gmi,
			replace : function ( h, c1, c2, c3, c4 ) {
				this.captured = [ c2 ];
				this.origin = c2;
				return c1 + h + c3;
			},
			type : "ESCAPE"
		},
		{
			//TODO escape for geo coord-s
			// money
			regExp : /([^а-яА-яЁё0-9_]|^)((?:\d+[.,]\d+|\d+)\s{0,5}(?:тысяч|тыс|тысячей|млн|милион|милионов|миллиарда|млрд\.|млрд))([^а-яА-яЁёa-zA-Z0-9\-_]|$)/gmi,
			replace : function ( h, c1, c2, c3, c4 ) {
				this.captured = [ c2 ];
				this.origin = c2;
				return c1 + h + c3;
			},
			type : "ESCAPE"
		},
		{
			//weight etc
			// money
			regExp : /([^а-яА-яЁё0-9_]|^)((?:\d+|\d+,\d+)\s+(?:кг|кило|килограмм|килограммов|граммов))/gmi,
			replace : function ( h, c1, c2, c3, c4 ) {
				this.captured = [ c2 ];
				this.origin = c2;
				return c1 + h;
			},
			type : "ESCAPE"
		},
		{
			//length etc
			// money
			regExp : /([^а-яА-яЁё0-9_]+|^)(\d+\s{0,3}(?:см|сантиметров|сантиметра|метров|метра|километров|километра))([^а-яА-яЁёa-zA-Z0-9\-_]|$)/gmi,
			replace : function ( h, c1, c2, c3, c4 ) {
				this.captured = [ c2 ];
				this.origin = c2;
				return c1 + h + c3;
			},
			type : "ESCAPE"
		},
		{
			//some typical none-time formats
			regExp : /([^а-яА-яЁё0-9_]+|^)((?:\d+[,]\d+|\d+)\s{0,3}(?:литр|баллов|балла|срока|срок|сроков|раза|раз))([^а-яА-яЁёa-zA-Z0-9\-_]|$)/gmi,
			replace : function ( h, c1, c2, c3, c4 ) {
				this.captured = [ c2 ];
				this.origin = c2;
				return c1 + h + c3;
			},
			type : "ESCAPE"
		},
		{
			//length etc
			// money
			regExp : /([^а-яА-яЁё0-9_]+|^)(\d\s+(?:курс|курса|курсов))([^а-яА-яЁёa-zA-Z0-9\-_]|$)/gmi,
			replace : function ( h, c1, c2, c3, c4 ) {
				this.captured = [ c2 ];
				this.origin = c2;
				return c1 + h + c3;
			},
			type : "ESCAPE"
		},
		{
			//length etc
			// money
			regExp : /([^а-яА-яЁё0-9_]+|^)(\d+\s+(?:аудитории|ауд\.|кабинет|каб.))([^а-яА-яЁёa-zA-Z0-9\-_]|$)/gmi,
			replace : function ( h, c1, c2, c3, c4 ) {
				this.captured = [ c2 ];
				this.origin = c2;
				return c1 + h + c3;
			},
			type : "ESCAPE"
		},
		{
			//length etc
			// money
			regExp : /([^а-яА-яЁё0-9_]+|^)(на\sчас\sназад)([^а-яА-яЁёa-zA-Z0-9\-_]|$)/gmi,
			replace : function ( h, c1, c2, c3, c4 ) {
				this.captured = [ c2 ];
				this.origin = c2;
				return c1 + h + c3;
			},
			type : "ESCAPE"
		},
		{
			//length etc
			// money
			regExp : /([^а-яА-яЁё0-9_]+|^)(с\s?\d+\s?по\s\d+\s(?:страницы|страниц|стр\.|стр))([^а-яА-яЁёa-zA-Z0-9\-_]|$)/gmi,
			replace : function ( h, c1, c2, c3, c4 ) {
				this.captured = [ c2 ];
				this.origin = c2;
				return c1 + h + c3;
			},
			type : "ESCAPE"
		},
		{
			//length etc
			// money
			regExp : /([^а-яА-яЁё0-9_]+|^)(\d+\s?-\s?\d+\s(?:человек|людей|чел\.|чел))([^а-яА-яЁёa-zA-Z0-9\-_]|$)/gmi,
			replace : function ( h, c1, c2, c3, c4 ) {
				this.captured = [ c2 ];
				this.origin = c2;
				return c1 + h + c3;
			},
			type : "ESCAPE"
		},
		{
			// phones TODO phones with - etc
			regExp : /\b(\d{1}(?:.{0,2})\d{3}(?:.{0,2})\d{2,3}(?:.{0,2})\d{2}(?:.{0,2})\d{2})\b/gmi,
			replace : function ( h, c1 ) {
				this.captured = [ c1 ];
				this.origin = c1;
				return h;
			},
			type : "ESCAPE"
		},
		{
			regExp : /\b(\d{3}[-]\d{2}[-]\d{2})\b/gmi,
			replace : function ( h, c1 ) {
				this.captured = [ c1 ];
				this.origin = c1;
				return h;
			},
			type : "ESCAPE"
		},
		{
			// ips
			regExp : /\b(\d+[.-]\d+[./-]\d+[./-]\d+)\b/gmi,
			replace : function ( h, c1 ) {
				this.captured = [ c1 ];
				this.origin = c1;
				return h;
			},
			type : "ESCAPE"
		},
		{
			// not dates number amount based
			regExp : /(\d{2,99}[./\-\s]*\d{2,99}[./\-\s]*\d{5,99})/gmi,
			replace : function ( h, c1) {
				this.captured = [ c1 ];
				this.origin = c1;
				return h;
			},
			type : "ESCAPE"
		},
		{
			//noninteger numbers
			regExp : /\b(\d{3}[,°\.]\d+|\d+[,°\.]\d{3})\b/gmi,
			replace : function ( h, c1 ) {
				this.captured = [ c1 ];
				this.origin = c1;
				return h;
			},
			type : "ESCAPE"
		},
		{
			//noninteger numbers
			regExp : /(\d+Ч)/gm,
			replace : function ( h, c1 ) {
				this.captured = [ c1 ];
				this.origin = c1;
				return h;
			},
			func: function() {
				return this.captured[ 0 ];
			},
			type : "ESCAPE"
		},
		{
			//noninteger numbers
			regExp : /([^а-яА-яЁёa-zA-Z0-9\-_]|^)(в\s{1,3}течение\s{1,3}часа)([^а-яА-яЁёa-zA-Z0-9\-_]|$)/gmi,
			replace : function ( h, c1, c2, c3, c4 ) {
				this.captured = [ c2 ];
				this.origin = c2;
				return c1 + h + c3;
			},
			func: function() {
				return { h : 1, m : 0 };
			},
			type : "DTIME",
			priority : 5
		},
		{
			//noninteger numbers
			regExp : /([^а-яА-яЁёa-zA-Z0-9\-_]|^)(полтора\sчаса)([^а-яА-яЁёa-zA-Z0-9\-_]|$)/gmi,
			replace : function ( h, c1, c2, c3, c4 ) {
				this.captured = [ c2 ];
				this.origin = c2;
				return c1 + h + c3;
			},
			func: function() {
				return { h : 1, m : 30 };
			},
			type : "DTIME",
			priority : 5
		},
		{
			//noninteger numbers
			regExp : /((\d)[,.](\d)\s{0,3}(часам|часа|часов|ч\.|ч|минуту|минуты|минутам|минут|мин\.|мин|м\.|м))/gmi,
			replace : function ( h, c1, c2, c3, c4 ) {
				this.captured = [ c2, c3, c4];
				this.origin = c1;
				return h;
			},
			func: function() {
				if ( this.captured[ 2 ].match( /ч/i ) ) {
					return { h : this.captured[ 0 ], m : this.captured[ 1 ] * 6 };
				} else return { h : 0, m : this.captured[ 1 ] * 0.6 };
			},
			type : "DTIME",
			priority: 4
		},
		{
			//noninteger numbers
			regExp : /([^а-яА-яЁёa-zA-Z0-9\-_]|^)(за\s{1,3}полчаса)([^а-яА-яЁёa-zA-Z0-9\-_]|$)/gmi,
			replace : function ( h, c1, c2, c3, c4 ) {
				this.captured = [ c2 ];
				this.origin = c2;
				return c1 + h + c3;
			},
			func: function() {
				return '-30';
			},
			type : "RTIME",
			priority : 5
		},
		{
			//noninteger numbers
			regExp : /([^а-яА-яЁёa-zA-Z0-9\-_]|^)(полчаса)([^а-яА-яЁёa-zA-Z0-9\-_]|$)/gmi,
			replace : function ( h, c1, c2, c3, c4 ) {
				this.captured = [ c2 ];
				this.origin = c2;
				return c1 + h + c3;
			},
			func: function() {
				return { h : 0, m : 30 };
			},
			type : "DTIME",
			priority : 5
		},
		{
			//noninteger numbers
			regExp : /([^а-яА-яЁёa-zA-Z0-9\-_]|^)(за\s{1,3}сутки)([^а-яА-яЁёa-zA-Z0-9\-_]|$)/gmi,
			replace : function ( h, c1, c2, c3, c4 ) {
				this.captured = [ c2 ];
				this.origin = c2;
				return c1 + h + c3;
			},
			func: function() {
				return '-1440';
			},
			type : "RTIME",
			priority : 5
		},
		/*{
		 //noninteger numbers
		 regExp : /([^а-яА-яЁёa-zA-Z0-9\-_]|^)((?:на\s{1,3})?(?:весь\s)?рабочий\sдень)([^а-яА-яЁёa-zA-Z0-9\-_]|$)/gmi,
		 replace : function ( h, c1, c2, c3, c4 ) {
		 this.captured = [ c2 ];
		 this.origin = c2;
		 return c1 + h + c3;
		 },
		 func: function() {
		 return 'WORKDAY';
		 },
		 type : "DTIME",
		 priority : 5
		 },*/

		{
			//noninteger numbers
			regExp : /([^а-яА-яЁёa-zA-Z0-9\-_]|^)(на\s{1,3}полчаса)([^а-яА-яЁёa-zA-Z0-9\-_]|$)/gmi,
			replace : function ( h, c1, c2, c3, c4 ) {
				this.captured = [ c2 ];
				this.origin = c2;
				return c1 + h + c3;
			},
			func: function() {
				return { h : 0, m : 30 };
			},
			type : "DTIME",
			priority : 5
		},
		{
			//noninteger numbers
			regExp : /(\d+[,°]\d+)/gmi,
			replace : function ( h, c1 ) {
				this.captured = [ c1 ];
				this.origin = c1;
				return h;
			},
			type : "ESCAPE"
		},
		{
			//noninteger numbers
			regExp : /([^а-яА-яЁёa-zA-Z0-9\-_.]+|^)((?:(?:3[2-9]|[4-9][0-9])[.,\-°]\d+)|(?:\d+[.,\-°][6-9][0-9]))([^а-яА-яЁёa-zA-Z0-9\-_]|$)/gmi,
			replace : function ( h, c1, c2, c3 ) {
				this.captured = [ c2 ];
				this.origin = c2;
				return c1 + h + c3;
			},
			type : "ESCAPE"
		},
		{
			//scores
			regExp : /\b(\d[:]\d)\b/gmi,
			replace : function ( h, c1 ) {
				this.captured = [ +c1 ];
				this.origin = c1;
				return h;
			},
			type : "ESCAPE"
		},
		{
			// big numbers
			regExp : /(«.+»|„.+“|‘.+’|".+"|'.+')/gmi,
			replace : function ( h, c1 ) {
				this.captured = [ +c1 ];
				this.origin = c1;
				return h;
			},
			type : "ESCAPE"
		},
		{
			// money
			regExp : /([^а-яА-яЁё0-9_]|^)(в\sтечение\sдня)([^а-яА-яЁё0-9_]|$)/gmi,
			replace : function ( h, c1, c2, c3 ) {
				this.captured = [ c2 ];
				this.origin = c2;
				return c1 + h + c3;
			},
			func: function() {
				return "allday";
			},
			type : "DTIME",
			priority : 7
		},
		{
			// money
			regExp : /([^а-яА-яЁё0-9_]|^)(во\sвремя\sсобытия|вовремя)([^а-яА-яЁё0-9_]|$)/gmi,
			replace : function ( h, c1, c2, c3 ) {
				this.captured = [ c2 ];
				this.origin = c2;
				return c1 + h + c3;
			},
			func: function() {
				return '0';
			},
			type : "RTIME",
			priority : 7
		},
		{
			// money
			regExp : /([^а-яА-яЁё0-9_]|^)(в\sтечение)([^а-яА-яЁё0-9_]|$)/gmi,
			replace : function ( h, c1, c2, c3 ) {
				this.captured = [ c2 ];
				this.origin = c2;
				return c1 + h + c3;
			},
			func: function() {
				return '0';
			},
			type : "DPREP",
			priority : 7
		},
		{
			// day time (AM PM etc)
			regExp : /((?:[^а-яА-яЁё0-9_]|^)(?:в|к)(?:[^а-яА-яЁё0-9_]|$)\s{0,3}\d{1,2}\s{0,3})(дня)([^а-яА-яЁёa-zA-Z0-9\-_]|$)/gmi,
			replace : function ( h, c1, c2, c3 ) {
				this.captured = [ c2.toLowerCase() ];
				this.origin = c2;
				return c1 + h + c3;
			},
			func : function() {
				return this.captured[ 0 ];
			},
			type : "DAYTIME"

		},
		{
			//digital time
			regExp : /([^а-яА-яЁёa-zA-Z0-9\-_]|^)(([0-1][0-9]|[2][0-4]|[0-9]).{0,3}?(?:часов|час|ч\.|ч).{0,3}?([0-5][0-9]|[0-9]).{0,3}?(?:минуту|минутам|минут|мин\.|мин|м\.|м))([^а-яА-яЁёa-zA-Z0-9\-]|$)/gmi,
			replace : function ( h, c1, c2, c3, c4, c5 ) {
				this.captured = [ { h : +c3, m: +c4 } ];
				this.origin = c2;
				return c1 + h + c5;
			},
			func : function() {
				return this.captured[ 0 ];
			},
			type : "TIME",
			priority : 10
		},
		{
			//noninteger numbers
			regExp : /([^а-яА-яЁёa-zA-Z0-9\-_]|^)((\d{1,2})\s{1,3}час)([^а-яА-яЁёa-zA-Z0-9\-_]|$)/gmi,
			replace : function ( h, c1, c2, c3, c4 ) {
				this.captured = [ c3 ];
				this.origin = c2;
				return c1 + h + c4;
			},
			func: function() {
				return this.captured[ 0 ];
			},
			type : "NUMBERHOUR",
			priority : 5
		},
		{
			// wordy time
			regExp : /([^а-яА-яЁёa-zA-Z0-9\-_]+|^)(час|часу|два|двум|двух|две|три|трем|трём|трех|трёх|четыре|четырем|пять|пяти|шесть|шести|семь|семи|восемь|восьми|девять|девяти|десять|десяти|одиннадцать|одиннадцати|двенадцать|двенадцати|сорок)(\sс\sполовиной\sчаса)([^а-яА-яЁё0-9_\-]+|$)/gmi,
			replace : function ( h, c1, c2, c3, c4 ) {
				this.captured = [ c2.toLowerCase() ];
				this.origin = c2 + c3;
				return c1 + h + c4;
			},
			func : function() {
				if ( this.captured[ 0 ].match( /час/ ) ) {
					return { h : 1, m : 30 };
				} else if ( this.captured[ 0 ].match( /два/ ) ) {
					return { h : 2, m : 30 };
				} else if ( this.captured[ 0 ].match( /тр/ ) ) {
					return { h : 3, m : 30 };
				} else if ( this.captured[ 0 ].match( /чет/ ) ) {
					return { h : 4, m : 30 };
				} else if ( this.captured[ 0 ].match( /пят/ ) ) {
					return { h : 5, m : 30 };
				} else if ( this.captured[ 0 ].match( /шес/ ) ) {
					return { h : 6, m : 30 };
				} else if ( this.captured[ 0 ].match( /восем/ ) ) {
					return { h : 8, m : 30 };
				} else if ( this.captured[ 0 ].match( /сем/ ) ) {
					return { h : 7, m : 30 };
				} else if ( this.captured[ 0 ].match( /дев/ ) ) {
					return { h : 9, m : 30 };
				} else if ( this.captured[ 0 ].match( /дес/ ) ) {
					return { h : 10, m : 30 };
				} else if ( this.captured[ 0 ].match( /один/ ) ) {
					return { h : 11, m : 30 };
				}
			},
			type : "TIME",
			priority : 7
		},
		{
			// money
			regExp : /([^а-яА-яЁё0-9_]|^)(с|от)([^а-яА-яЁё0-9_].{0,20}?[^а-яА-яЁё0-9_](?:до|-)(?:[^а-яА-яЁё0-9_]|$))/gmi,
			replace : function ( h, c1, c2, c3 ) {
				this.captured = [ c2 ];
				this.origin = c2;
				return c1 + h + c3;
			},
			func: function() {
				return this.captured[ 0 ];
			},
			type : "FROM"
		},
		{
			// money
			regExp : /(#from_\d+.{0,20}?[^а-яА-яЁё0-9_])(до|-)([^а-яА-яЁё0-9_]|$)/gmi,
			replace : function ( h, c1, c2, c3 ) {
				this.captured = [ c2 ];
				this.origin = c2;
				return c1 + h + c3;
			},
			func: function() {
				return this.captured[ 0 ];
			},
			type : "TO"
		},
		{
			// money
			regExp : /([^а-яА-яЁё0-9_]|^)(до)([^а-яА-яЁё0-9_]|$)/gmi,
			replace : function ( h, c1, c2, c3 ) {
				this.captured = [ c2 ];
				this.origin = c2;
				return c1 + h + c3;
			},
			func: function() {
				return this.captured[ 0 ];
			},
			type : "TO"
		},
		{
			// money
			regExp : /([^а-яА-яЁё0-9_]|^)(во|в|на|к|с|около|от)([^а-яА-яЁё0-9_]|$)/gmi,
			replace : function ( h, c1, c2, c3 ) {
				this.captured = [ c2 ];
				this.origin = c2 ;
				return c1 + h + c3;
			},
			func: function() {
				return this.captured[ 0 ];
			},
			type : "PREP"
		},
		{
			// money
			regExp : /([^а-яА-яЁё0-9_]|^)(за)([^а-яА-яЁё0-9_]|$)/gmi,
			replace : function ( h, c1, c2, c3 ) {
				this.captured = [ c2 ];
				this.origin = c2 ;
				return c1 + h + c3;
			},
			func: function() {
				return this.captured[ 0 ];
			},
			type : "BEFORE"
		},
		{
			// money
			regExp : /([^а-яА-яЁё0-9_]|^)(следующий|следующем|следующей|следующую|следующ\.|следующ|след|след\.|сл\.)([^а-яА-яЁё0-9_]|$)/gmi,
			replace : function ( h, c1, c2, c3 ) {
				this.captured = [ c2 ];
				this.origin = c2 ;
				return c1 + h + c3;
			},
			func: function() {
				return this.captured[ 0 ];
			},
			type : "NEXT"
		},
		{
			// money
			regExp : /([^а-яА-яЁё0-9_]|^)(весь\sдень)([^а-яА-яЁё0-9_]|$)/gmi,
			replace : function ( h, c1, c2, c3 ) {
				this.captured = [ c2 ];
				this.origin = c2;
				return c1 + h + c3;
			},
			func: function() {
				return 'allday';
			},
			type : "DTIME",
			priority : 7
		},
		{
			//wordy date
			regExp : /(([^а-яА-яЁёa-zA-Z0-9\-_]|^)(позавчера|вчера|сегодня|завтра|послезавтра|через\sдень)([^а-яА-яЁёa-zA-Z0-9\-_]|$))/gmi,
			replace : function ( h, c1, c2, c3, c4 ) {
				this.captured = [ c3.toLowerCase() ];
				this.origin = c3;
				return c2 + h + c4;
			},
			func : function() {
				switch ( this.captured[ 0 ] ) {
					case 'позавчера':
						return SD_tools.today( -2 );
					case 'вчера':
						return SD_tools.today( -1 );
					case 'сегодня':
						return SD_tools.today();
					case 'завтра':
						return SD_tools.today( +1 );
					case 'через день':
						return SD_tools.today( +2);
					case 'послезавтра':
						return SD_tools.today( +2 );
					default : SD_tools.today();
				}
			},
			type : "DATE",
			priority : 10
		},
		{
			//digital date big type XX-XX-XXXX(201[5-9]|1[5-9])
			regExp : /\b(([0-2][0-9]|[3][0-1]|[0-9])[./-]([0][0-9]|1[0-2])[./-](201[5-9]|1[5-9]))\b/gmi,
			replace : function ( h, c1, c2, c3, c4 ) {
				this.captured = [ c2, c3, c4 ];
				this.origin = c1;
				if( SD_tools.setFullDate( this.captured[ 0 ], this.captured[ 1 ], this.captured[ 2 ], true ) === undefined ) return;
				return h;
			},
			func : function() {
				return SD_tools.setFullDate( this.captured[ 0 ], this.captured[ 1 ], this.captured[ 2 ] );
			},
			type : "DATE",
			priority : 10
		},
		{
			//digital date big type XX-XX-XXXX
			regExp : /([^а-яА-яЁёa-zA-Z0-9\-_]|^)(([0-2][0-9]|[3][0-1]|[0-9])[./-]([0][0-9]|1[0-2])[./-](\d{4}|\d{2}))([^а-яА-яЁёa-zA-Z0-9\-_]|$)/gmi,
			replace : function ( h, c1, c2, c3, c4, c5, c6 ) {
				this.captured = [ c3, c4, c5 ];
				this.origin = c2;
				if( SD_tools.setFullDate( this.captured[ 0 ], this.captured[ 1 ], this.captured[ 2 ], true ) === undefined ) return;
				return c1 + h + c6;
			},
			func : function() {
				return SD_tools.setFullDate( this.captured[ 0 ], this.captured[ 1 ], this.captured[ 2 ] );
			},
			type : "DATE",
			priority : 3
		},
		{
			//week name
			regExp : /([^а-яА-яЁёa-zA-Z0-9\-_]|^)(понедельника|понедельник|пон\.|пон|пн\.|пн|пнд\.|пнд|вторник|втор\.|втор|вт\.|вт|среда|среду|ср\.|ср|четверг|четв\.|четв|чет\.|чет|чтв\.|чтв|чт\.|чт|пятница|пятницу|пятн\.|пятн|пят\.|пят|пт\.|пт|суббота|субботу|субб\.|субб|суб\.|суб|сб\.|сб|воскресенье|воскр\.|воскр|вс\.|вс)([^а-яА-яЁёa-zA-Z0-9\-_]|$)/gmi,
			replace : function ( h, c1, c2, c3 ) {
				this.captured = [ c2.toLowerCase() ];
				this.origin = c2;
				return c1 + h + c3;
			},
			func : function() {
				if ( this.captured[ 0 ].match( /по|пн/ ) ) {
					return 1;
				} else if ( this.captured[ 0 ].match( /вт/ ) ) {
					return 2;
				} else if ( this.captured[ 0 ].match( /ср/ ) ) {
					return 3;
				} else if ( this.captured[ 0 ].match( /че|чт/ ) ) {
					return 4;
				} else if ( this.captured[ 0 ].match( /пя|пт/ ) ) {
					return 5;
				} else if ( this.captured[ 0 ].match( /су|сб/ ) ) {
					return 6;
				} else if ( this.captured[ 0 ].match( /во|вс/ ) ) {
					return 7;
				}
			},
			type : "WEEKDAY",
			priority : 5
		},
		{
			//digital time
			regExp : /([^а-яА-яЁёa-zA-Z0-9\_.:-]|^)(([0-1][0-9]|[2][0-4]|[0-9])[-:.]([0-5][0-9]))(\s?-\s?([0-1][0-9]|[2][0-4]|[0-9])[-:.]([0-5][0-9]))([^а-яА-яЁёa-zA-Z0-9\_.:-]|$)/gmi,
			replace : function ( h, c1, c2, c3, c4, c5, c6, c7, c8 ) {
				this.captured = [ { h : +c6 - +c3, m: +c7 - +c4 } ];
				this.origin = c5;
				return c1 + c2 + h + c8;
			},
			func : function() {
				return this.captured[ 0 ];
			},
			type : "DTIME",
			priority : 10
		},
		{
			//digital time
			regExp : /([^а-яА-яЁёa-zA-Z0-9\_.:-]|^)(([0-1][0-9]|[2][0-4]|[0-9])([-:.])([0-5][0,5]))([^а-яА-яЁёa-zA-Z0-9\_.:-]|$)/gmi,
			replace : function ( h, c1, c2, c3, c4, c5, c6 ) {
				var a = { h : +c3, m: +c5 };
				if ( +c3 === 0 ) a.duplicity = false;
				if( +c3 < 31 && +c5 < 13 && c4.match( /-\./) ) a.datealternative = true;
				this.captured = [ a ];
				this.origin = c2;
				return c1 + h + c6;
			},
			func : function() {
				return this.captured[ 0 ];
			},
			type : "TIME",
			priority : 10
		},
		{
			//digital time
			regExp : /([^а-яА-яЁёa-zA-Z0-9\_.:-]|^)(([0-1][0-9]|[2][0-4]|[0-9])([-:])([0-5][0-9]))([^а-яА-яЁёa-zA-Z0-9\_:-]|$)/gmi,
			replace : function ( h, c1, c2, c3, c4, c5, c6 ) {
				var a = { h : +c3, m: +c5 };
				if ( +c3 === 0 ) a.duplicity = false;
				if( +c3 < 31 && +c5 < 13 && c4.match( /-\./) ) a.datealternative = true;
				this.captured = [ a ];
				this.origin = c2;
				return c1 + h + c6;
			},
			func : function() {
				return this.captured[ 0 ];
			},
			type : "TIME",
			priority : 10
		},
		{
			//digital date small type XX-XX
			regExp : /([^а-яА-яЁёa-zA-Z0-9\-_.]|^)(([0-2][0-9]|[3][0-1]|[0-9])[./-]([0][1-9]|1[0-2]))([^а-яА-яЁёa-zA-Z0-9\-_.]|$)/gmi,
			replace : function ( h, c1, c2, c3, c4, c5 ) {
				this.captured = [ c3, c4 ];
				this.origin = c2;
				return c1 + h + c5;
			},
			func : function() {
				return SD_tools.nearestDayMonth( this.captured[ 0 ], this.captured[ 1 ]);
			},
			type : "DATE",
			priority : 6
		},
		{
			//digital date small type XX-XX
			regExp : /([^а-яА-яЁёa-zA-Z0-9\-_.:]|^)((0[0-9]|1[0-2]|[0-9])([.-])([0-5][0-9]))([^а-яА-яЁёa-zA-Z0-9\-_:]|$)/gmi,
			replace : function ( h, c1, c2, c3, c4, c5, c6 ) {
				var a = { h : +c3, m: +c5 };
				if ( +c3 === 0 ) a.duplicity = false;
				if( +c3 < 31 && +c5 < 13 && c4.match( /-\./) ) a.datealternative = true;
				this.origin = c2;
				this.captured = [ a ];
				return c1 + h + c6;
			},
			func : function() {
				return this.captured[ 0 ];
			},
			type : "TIME",
			priority : 6
		},
		{
			//digital time
			regExp : /([^а-яА-яЁёa-zA-Z0-9\-_]|^)(полночь|обед|обеда)([^а-яА-яЁёa-zA-Z0-9\-_]|$)/gmi,
			replace : function ( h, c1, c2, c3 ) {
				this.captured = [ c2 ];
				this.origin = c2;
				return c1 + h + c3;
			},
			func : function() {
				if ( this.captured[ 0 ].match( /полн/i ) )  {
					return {h: 0, m: 0, duplicity: false };
				} else if ( this.captured[ 0 ].match( /обед/i ) ) {
					return { h : 12, m : 0 , duplicity: false };
				}
			},
			type : "TIME",
			priority : 8
		},
		{
			//TODO fill it
			regExp : /([^а-яА-яЁёa-zA-Z0-9\-_]|^)(час|часу|два|двум|двух|две|три|трем|трём|трех|трёх|четыре|четырем|пять|пяти|шесть|шести|семь|семи|восемь|восьми|девять|девяти|десять|десяти|одиннадцать|одиннадцати|двенадцать|двенадцати|сорок)([^а-яА-яЁёA-Z0-9\-_]|$)/gmi,
			replace : function ( h, c1, c2, c3 ) {
				this.captured = [ c2.toLowerCase() ];
				this.origin = c2;
				return c1 + h + c3;
			},
			func : function() {
				switch ( this.captured[ 0 ] ) {
					case 'час':
					case 'часу':
						return 1;
					case 'два':
					case 'двум':
					case 'двух':
					case 'две':
						return 2;
					case 'три':
					case 'трем':
					case 'трём':
					case 'трёх':
					case 'трех':
						return 3;
					case 'четыре':
					case 'четырем':
						return 4;
					case 'пять':
					case 'пяти':
						return 5;
					case 'шесть':
					case 'шести':
						return 6;
					case 'семь':
					case 'семи':
						return 7;
					case 'восемь':
					case 'восьми':
						return 8;
					case 'девять':
					case 'девяти':
						return 9;
					case 'десять':
					case 'десяти':
						return 10;
					case 'одиннадцать':
					case 'одиннадцати':
						return 11;
					case 'двеннадцать':
					case 'двеннадцати':
						return 12;
					case 'сорок':
						return 40;
					default : return 1;
				}
			},
			type : "NUMBER"
		},
		{
			// wordy time
			regExp : /([^а-яА-яЁёa-zA-Z0-9\-_]+|^)(двадцатого|двадцать\sпервое|двадцать\sпервого|двадцать\sвторое|двадцать\sвторого|двадцать\sтретье|двадцать\sтретьего|двадцать\sчетвертое|двадцать\sчетвертого|двадцать\sпятое|двадцать\sпятого|двадцать\sшестое|двадцать\sшестого|двадцать\sседьмое|двадцать\sседьмого|двадцать\sвосьмое|двадцать\sвосьмого|двадцать\sдевятое|двадцать\sдевятого|тридцатое|тридцатого|тридцать\sпервое|тридцать\sпервого|первое|первого|второе|второго|третье|третьего|четвертое|четвертого|пятое|пятого|шестое|шестого|седьмое|седьмого|восьмое|восьмого|девятое|девятого|десятое|десятого|одиннадцатое|одиннадцатого|двенадцатое|двенадцатого|тринадцатое|тринадцатого|четырнадцатое|четырнадцатого|пятнадцатое|пятнадцатого|шестнадцатое|шестнадцатого|семнадцатое|семнадцатого|восемнадцатое|восемнадцатого|девятнадцатое|девятнадцатого|двадцатое)(?:\s+(?:числа))?([^а-яА-яЁё0-9_\-]+|$)/gmi,
			replace : function ( h, c1, c2, c3 ) {
				this.captured = [ c2.toLowerCase() ];
				this.origin = c2;
				return c1 + h + c3;
			},
			func : function() {
				switch ( this.captured[ 0 ] ) {
					case 'первое':
					case 'первого':
						return 1;
					case 'второе':
					case 'второго':
						return 2;
					case 'три':
					case 'трем':
					case 'трём':
					case 'третьего':
						return 3;
					case 'четвертое':
					case 'четвертого':
						return 4;
					case 'пятое':
					case 'пятого':
						return 5;
					case 'шесть':
					case 'шести':
						return 6;
					case 'седьмое':
					case 'седьмого':
						return 7;
					case 'восьмое':
					case 'восьмого':
						return 8;
					case 'девятое':
					case 'девятого':
						return 9;
					case 'десять':
					case 'десяти':
					case 'десятое':
						return 10;
					case 'одиннадцать':
					case 'одиннадцати':
						return 11;
					case 'двеннадцать':
					case 'двеннадцати':
						return 12;
					case 'тринадцатое':
					case 'тринадцатого':
						return 13;
					case 'четырнадцатое':
					case 'четырнадцатого':
						return 14;
					case 'пятнадцатое':
					case 'пятнадцатого':
						return 15;
					case 'шестнадцатое':
					case 'шестнадцатого':
						return 16;
					case 'семнадцатое':
					case 'семнадцатого':
						return 17;
					case 'восемнадцатое':
					case 'восемнадцатого':
						return 18;
					case 'девятнадцатое':
					case 'девятнадцатого':
						return 19;
					case 'двадцатого':
					case 'двадцатое':
						return 20;
					case 'двадцать первое':
					case 'двадцать первого':
						return 21;
					case 'двадцать второе':
					case 'двадцать второго':
						return 22;
					case 'двадцать третье':
					case 'двадцать третьего':
						return 23;
					case 'двадцать четвертое':
					case 'двадцать четвертого':
						return 24;
					case 'двадцать пятое':
					case 'двадцать пятого':
						return 25;
					case 'двадцать шестого':
					case 'двадцать шестое':
						return 26;
					case 'двадцать седьмое':
					case 'двадцать седьмого':
						return 27;
					case 'двадцать восьмого':
					case 'двадцать восьмое':
						return 28;
					case 'двадцать девятое':
					case 'двадцать девятого':
						return 29;
					case 'тридцатого':
					case 'тридцатое':
						return 30;
					case 'тридцать первое':
					case 'тридцать первого':
						return 31;
					default : return 1;
				}
			},
			type : "NUMBER"
		},
		{
			// wordy time
			regExp : /([^а-яА-яЁёa-zA-Z0-9\-_]+|^)(пол)(двадцатого|двадцать\sпервое|двадцать\sпервого|двадцать\sвторое|двадцать\sвторого|двадцать\sтретье|двадцать\sтретьего|двадцать\sчетвертое|двадцать\sчетвертого|двадцать\sпятое|двадцать\sпятого|двадцать\sшестое|двадцать\sшестого|двадцать\sседьмое|двадцать\sседьмого|двадцать\sвосьмое|двадцать\sвосьмого|двадцать\sдевятое|двадцать\sдевятого|тридцатое|тридцатого|тридцать\sпервое|тридцать\sпервого|первое|первого|второе|второго|третье|третьего|четвертое|четвертого|пятое|пятого|шестое|шестого|седьмое|седьмого|восьмое|восьмого|девятое|девятого|десятое|десятого|одиннадцатое|одиннадцатого|двенадцатое|двенадцатого|тринадцатое|тринадцатого|четырнадцатое|четырнадцатого|пятнадцатое|пятнадцатого|шестнадцатое|шестнадцатого|семнадцатое|семнадцатого|восемнадцатое|восемнадцатого|девятнадцатое|девятнадцатого|двадцатое)(?:\s+(?:числа))?([^а-яА-яЁё0-9_\-]+|$)/gmi,
			replace : function ( h, c1, c2, c3, c4 ) {
				this.captured = [ c3.toLowerCase() ];
				this.origin = c2 + c3;
				return c1 + h + c4;
			},
			func : function() {
				if ( this.captured[ 0 ].match( /перв/ ) ) {
					return { h : 0, m : 30 };
				} else if ( this.captured[ 0 ].match( /втор/ ) ) {
					return { h : 1, m : 30 };
				} else if ( this.captured[ 0 ].match( /трет/ ) ) {
					return { h : 2, m : 30 };
				} else if ( this.captured[ 0 ].match( /четв/ ) ) {
					return { h : 3, m : 30 };
				} else if ( this.captured[ 0 ].match( /пят/ ) ) {
					return { h : 4, m : 30 };
				} else if ( this.captured[ 0 ].match( /шес/ ) ) {
					return { h : 5, m : 30 };
				} else if ( this.captured[ 0 ].match( /сед/ ) ) {
					return { h : 6, m : 30 };
				} else if ( this.captured[ 0 ].match( /вос/ ) ) {
					return { h : 7, m : 30 };
				} else if ( this.captured[ 0 ].match( /дев/ ) ) {
					return { h : 8, m : 30 };
				} else if ( this.captured[ 0 ].match( /дес/ ) ) {
					return { h : 9, m : 30 };
				} else if ( this.captured[ 0 ].match( /один/ ) ) {
					return { h : 10, m : 30 };
				} else if ( this.captured[ 0 ].match( /две/ ) ) {
					return { h : 11, m : 30 };
				}
			},
			type : "TIME",
			priority : 7
		},
		{
			// wordy time sp
			regExp : /([^а-яА-яЁёa-zA-Z0-9\-_]+|^)(пара|пару)([^а-яА-яЁё0-9_\-]+|$)/gmi,
			replace : function ( h, c1, c2, c3 ) {
				this.captured = [ c2.toLowerCase() ];
				this.origin = c2;
				return c1 + h + c3;
			},
			func : function() {
				switch ( this.captured[ 0 ] ) {
					case 'пара':
					case 'пару':
						return 2;
					default : return 1;
				}
			},
			type : "NUMBER"
		},
		{
			//months
			regExp : /([^а-яА-яЁёa-zA-Z0-9\-_]+|^)(янв\.|янв|январь|января|январе|январю|фев\.|фев|февраль|февраля|феврале|февралю|мар\.|мар|марта|марте|марту|март|апр\.|апр|апрель|апреля|апреле|апрелю|май|мая|мае|маю|июн\.|июн|июнь|июня|июне|июню|июл\.|июл|июль|июля|июле|июлю|авг\.|авг|август|августе|августу|августа|сен\.|сен|сент\.|сент|сентябрь|сентября|сентябре|сентябрю|окт\.|окт|октябрь|октября|октябре|октябрю|ноя\.|ноя|нояб\.|нояб|ноябрь|ноября|ноябре|ноябрю|дек\.|дек|декабрь|декабря|декабре|декабрю)([^а-яА-яЁёa-zA-Z0-9\-_]+|$)/gmi,
			replace : function ( h, c1, c2, c3  ) {
				this.captured = [ c2.toLowerCase() ];
				this.origin = c2;
				return c1 + h + c3;
			},
			func : function() {
				if ( this.captured[ 0 ].match( /ян/ ) ) {
					return '01';
				} else if ( this.captured[ 0 ].match( /фев/ ) ) {
					return '02';
				} else if ( this.captured[ 0 ].match( /мар/ ) ) {
					return '03';
				} else if ( this.captured[ 0 ].match( /апр/ ) ) {
					return '04';
				} else if ( this.captured[ 0 ].match( /май|мая|мае|маю/ ) ) {
					return '05';
				} else if ( this.captured[ 0 ].match( /июн/ ) ) {
					return '06';
				} else if ( this.captured[ 0 ].match( /июл/ ) ) {
					return '07';
				} else if ( this.captured[ 0 ].match( /авг/ ) ) {
					return '08';
				} else if ( this.captured[ 0 ].match( /сен/ ) ) {
					return '09';
				} else if ( this.captured[ 0 ].match( /окт/ ) ) {
					return '10';
				} else if ( this.captured[ 0 ].match( /ноя/ ) ) {
					return '11';
				} else if ( this.captured[ 0 ].match( /дек/ ) ) {
					return '12';
				}
			},
			type : "MONTH"
		},
		{
			regExp : /([^а-яА-яЁёa-zA-Z0-9\-_]|^)(\d{1,2})(ч\.|ч)([^а-яА-яЁёa-zA-Z0-9\-_]|$)/gmi,
			replace : function ( h, c1, c2, c3, c4 ) {
				this.captured = [ c2 ];
				this.origin = c2 + c3;
				return c1 + h + c4;
			},
			func : function() {
				return this.captured[ 0 ];
			},
			type : "NUMBERHOUR",
			priority : 10
		},
		{
			regExp : /([^а-яА-яЁёa-zA-Z0-9\-_]|^)(201[5-9]|1[5-9])г([^а-яА-яЁёa-zA-Z0-9\-_]|$)/gmi,
			replace : function ( h, c1, c2, c3, c4 ) {
				this.captured = [ c2 ];
				this.origin = c2;
				return c1 + h + ' г' + c3;
			},
			func : function() {
				return this.captured[ 0 ];
			},
			type : "NUMBER",
			priority : 10
		},
		{
			//reminders
			regExp : /([^а-яА-яЁёa-zA-Z0-9\-_]|^)(напомнить|предупредить)([^а-яА-яЁёa-zA-Z0-9\-_]|$)/gmi,
			replace : function ( h, c1, c2, c3 ) {
				this.origin = c2;
				return c1 + h + c3;
			},
			func : function() {
				return this.captured[ 0 ];
			},
			type : "ACTIONREMIND"
		},
		{
			//TODO last space isn't capturing
			// just numbers
			regExp : /([^а-яА-яЁё0-9_\-]|^)(\d+)((?:(?:-ого|-го|го)\s{0,2}числа)|-ого|-го|го|е|ти|\s{0,2}числа)([^а-яА-яЁёa-zA-Z0-9\-_]|$)/gmi,
			replace : function ( h, c1, c2, c3, c4 ) {
				this.captured = [ c2 ];
				this.origin = c2 + c3;
				return c1 + h + c4;
			},
			func : function() {
				return this.captured[ 0 ];
			},
			type : "DAYNUMBER"
		},
		{
			// money
			regExp : /([^а-яА-яЁё0-9_.]|^)(часам|часа|часов|ч\.|ч)([^а-яА-яЁё0-9_.]|$|\.$)/gmi,
			replace : function ( h, c1, c2, c3 ) {
				this.captured = [ c2 ];
				this.origin = c2 ;
				return c1 + h + c3;
			},
			func : function() {
				return this.captured[ 0 ];
			},
			type : "HOURINDEX"
		},
		{
			// money
			regExp : /([^а-яА-яЁё0-9_.]|^)((\d{1,2})(?:минуту|минуты|минутам|минут|мин\.|мин|м\.))([^а-яА-яЁё0-9_.]|$|\.$)/gmi,
			replace : function ( h, c1, c2, c3, c4 ) {
				this.captured = [ +c3 ];
				this.origin = c2 ;
				return c1 + h + c4;
			},
			func : function() {
				return { h : 0 , m : this.captured[ 0 ] };
			},
			type : "DTIME"
		},
		{
			// money
			regExp : /([^а-яА-яЁё0-9_.]|^)(минуту|минуты|минутам|минут|мин\.|мин|м\.|м)([^а-яА-яЁё0-9_.]|$|\.$)/gmi,
			replace : function ( h, c1, c2, c3 ) {
				this.captured = [ c2 ];
				this.origin = c2 ;
				return c1 + h + c3;
			},
			func : function() {
				return this.captured[ 0 ];
			},
			type : "MINUTINDEX"
		},
		{
			// day time (AM PM etc)
			regExp : /(#hourindex_\d+\s{0,3})(дня)([^а-яА-яЁёa-zA-Z0-9\-_]|$)/gmi,
			replace : function ( h, c1, c2, c3 ) {
				this.captured = [ c2.toLowerCase() ];
				this.origin = c2;
				return c1 + h + c3;
			},
			func : function() {
				return this.captured[ 0 ];
			},
			type : "DAYTIME"

		},
		{
			// day time (AM PM etc)
			regExp : /([^а-яА-яЁёa-zA-Z0-9\-_]|^)(утра|утром|вечера|вечером|днем|полночь|ночи)([^а-яА-яЁёa-zA-Z0-9\-_]|$)/gmi,
			replace : function ( h, c1, c2, c3 ) {
				this.captured = [ c2.toLowerCase() ];
				this.origin = c2;
				return c1 + h + c3;
			},
			func : function() {
				if ( this.captured[ 0 ].match( /веч|дн/ ) ) { return true; } else return false;
			},
			type : "DAYTIME"

		},
		{
			// money
			regExp : /([^а-яА-яЁё0-9_]|^)(дней|день|дня|дн|сутки|суток|недель|неделя|неделю|недели|нед|месяц|месяце|лет)([^а-яА-яЁё0-9_]|$)/gmi,
			replace : function ( h, c1, c2, c3 ) {
				this.captured = [ c2 ];
				this.origin = c2;
				return c1 + h + c3;
			},
			func : function() {
				return this.captured[ 0 ];
			},
			type : "DATEINDEX"
		},
		{
			// money
			regExp : /([^а-яА-яЁё0-9_]|^)(месяца|мес)([^а-яА-яЁё0-9_]|$)/gmi,
			replace : function ( h, c1, c2, c3 ) {
				this.captured = [ c2 ];
				this.origin = c2;
				return c1 + h + c3;
			},
			func : function() {
				return this.captured[ 0 ];
			},
			type : "MONTHINDEX"
		},
		{
			// money
			regExp : /([^а-яА-яЁё0-9_]|^)(года|году|год|г\.|г)([^а-яА-яЁё0-9_]|$)/gmi,
			replace : function ( h, c1, c2, c3 ) {
				this.captured = [ c2 ];
				this.origin = c2;
				return c1 + h + c3;
			},
			func : function() {
				return this.captured[ 0 ];
			},
			type : "YEARINDEX"
		},
		{
			//TODO last space isn't capturing
			// just numbers
			regExp : /([^а-яА-яЁё0-9_\-]|^)(\d+)([^а-яА-яЁё0-9_\-a-zA-Z]|$)/gmi,
			replace : function ( h, c1, c2, c3 ) {
				this.captured = [ +c2 ];
				this.origin = c2;
				return c1 + h + c3;
			},
			func : function() {
				return this.captured[ 0 ];
			},
			type : "NUMBER"
		},
		{
			// money
			regExp : /([^а-яА-яЁё0-9_]|^)(через)([^а-яА-яЁё0-9_]|$)/gmi,
			replace : function ( h, c1, c2, c3 ) {
				this.captured = [ c2 ];
				this.origin = c2 ;
				return c1 + h + c3;
			},
			type : "AFTER"
		}
	];


	/**
	 * @author Kadyrov Albert <fluffy1snow@gmail.com>
	 * @module SmartDateLocale_RU
	 */

	var metatokens = [
		{
			//some typical none-time formats
			regExp : /(#number_(\d+)\s{0,3}(?:литр|баллов|балла|срока|срок|сроков|ступеней|ступенек|раза|раз))/gmi,
			replace : function ( h, t, c1, c2, c3 ) {
				this.captured = [ c1 ];
				this.origin = c1;
				return h;
			},
			type : "ESCAPE"
		},
		{
			//some typical none-time formats
			regExp : /(№\s{0,3}#date_\d+)/gmi,
			replace : function ( h, t, c1, c2, c3 ) {
				this.captured = [ c1 ];
				this.origin = c1;
				return h;
			},
			type : "ESCAPE"
		},
		{
			//wordy date 4 may 2005
			regExp : /(#(?:day)?number_(\d+).{0,5}#month_(\d+).{0,5}#number_(\d+)(.{0,5}#yearindex_\d+)?)/gmi,
			replace : function ( h, t, c1, c2, c3, c4, c5 ) {
				this.captured = [ t[ c2 ].func(), +t[ c3 ].func(), t[ c4 ].func() ];
				this.origin = c1;
				c5 && ( this.priority += 1 );
				( ( ( new Date ).setYear( this.captured[ 2 ] ) ) < ( SD_tools._getDate() ) ) && ( this.priority -= 8 );
				if( SD_tools.setFullDate( this.captured[ 0 ], this.captured[ 1 ], this.captured[ 2 ], true ) === undefined ) return;
				if ( ( this.captured[ 2 ] ) > 2020 ) return;
				if ( ( this.captured[ 0 ].toString().length < 3 ) && ( +this.captured[ 0 ] < 32 ) && ( +this.captured[ 0 ] > 0 ) && ( ( this.captured[ 2 ].toString().length === 4 ) || ( this.captured[ 2 ].toString().length === 2 )))return h;
			},
			func : function() {
				return SD_tools.setFullDate( this.captured[ 0 ], this.captured[ 1 ], this.captured[ 2 ] );
			},
			type : "DATE",
			priority : 10
		},
		{
			//wordy date 4 may 2005
			regExp : /(#month_(\d+).{0,5}#(?:day)?number_(\d+).{0,5}#number_(\d+)(.{0,5}#yearindex_\d+)?)/gmi,
			replace : function ( h, t, c1, c2, c3, c4, c5 ) {
				this.captured = [ t[ c3 ].func(), +t[ c2 ].func(), t[ c4 ].func() ];
				this.origin = c1;
				c5 && ( this.priority += 1 );
				if( SD_tools.setFullDate( this.captured[ 0 ], this.captured[ 1 ], this.captured[ 2 ], true ) === undefined ) return;
				( ( ( new Date ).setYear( this.captured[ 2 ] ) ) < ( SD_tools._getDate() ) ) && ( this.priority -= 5 );
				if ( ( this.captured[ 0 ].toString().length < 3 ) && ( +this.captured[ 0 ] < 31 ) && ( +this.captured[ 0 ] > 0 ) && ( ( this.captured[ 2 ].toString().length === 4 ) || ( this.captured[ 2 ].toString().length === 2 )) )return h;
			},
			func : function() {
				return SD_tools.setFullDate( this.captured[ 0 ], this.captured[ 1 ], this.captured[ 2 ] );
			},
			type : "DATE",
			priority : 10
		},
		{
			//wordy date 4 may 2005
			regExp : /(#(?:day)?number_(\d+).{0,5}#month_(\d+))/gmi,
			replace : function ( h, t, c1, c2, c3, c4, c5 ) {
				this.captured = [ t[ c2 ].func(), +t[ c3 ].func() ];
				this.origin = c1;
				if ( SD_tools.setDate( this.captured[ 0 ], this.captured[ 1 ], true ) === undefined ) return;
				if ( ( this.captured[ 0 ].toString().length < 3 ) && ( +this.captured[ 0 ] < 32  && ( +this.captured[ 0 ] > 0 ) ) )return h;
			},
			func : function() {
				return SD_tools.setDate( this.captured[ 0 ], this.captured[ 1 ] );
			},
			type : "DATE",
			priority : 5
		},
		{
			regExp : /(#month_(\d+).{0,5}#number_(\d+)(.{0,5}#yearindex_\d+)?)/gmi,
			replace : function ( h, t, c1, c2, c3, c4 ) {
				this.captured = [ t[ c2 ].func(), t[ c3 ].func() ];
				this.origin = c1;
				c4 && ( this.priority += 1 );
				if( SD_tools.setFullDate( 1, this.captured[ 0 ], this.captured[ 1 ], true ) === undefined ) return;
				if ( ( ( this.captured[ 1 ].toString().length === 4 ) || ( this.captured[ 1 ].toString().length === 2 )) && ( Math.abs( SD_tools._getDate().getUTCFullYear().toString().slice( -2 ) - this.captured[ 1].toString().slice( -2 ) ) < 6 ) ) return h;
			},
			func : function() {
				return SD_tools.setFullDate( 1, this.captured[ 0 ], this.captured[ 1 ] );
			},
			type : "DATE",
			priority : 8
		},
		{
			regExp : /(#month_(\d+).{0,5}#number_(\d+))/gmi,
			replace : function ( h, t, c1, c2, c3, c4 ) {
				this.captured = [ t[ c2 ].func(), t[ c3 ].func() ];
				this.origin = c1;
				if ( ( ( this.captured[ 1 ].toString().length < 3 ) && ( +this.captured[ 1 ] < 31 ) && ( +this.captured[ 1 ] > 0 )) )return h;
			},
			func : function() {
				return SD_tools.nearestDayMonth( this.captured[ 1 ], this.captured[ 0 ] );
			},
			type : "DATE",
			priority : 8
		},
		{
			regExp: /(#next_\d+.{0,5}#month_(\d+))/gmi,
			replace: function (h, t, c1, c2, c3, c4) {
				this.captured = [ t[ c2 ].func() ];
				this.origin = c1;
				return h;
			},
			func: function () {
				return SD_tools.nearestDayMonth( 1, this.captured[ 0 ] );
			},
			type: "DATE",
			priority: 5
		},

		{
			regExp : /(#after_\d+(.{0,5}#number_(\d+))?.{0,5}#(?:date|month|year)index_(\d+))/gmi,
			replace : function ( h, t, c1, c2, c3, c4 ) {
				if ( c2 ) {
					this.captured = [ t[ c4 ].origin, +t[ c3 ].func() ];
					this.priority += 2;
				} else this.captured = [ t[ c4 ].origin ];
				this.origin = c1;
				return h;
			},
			func : function() {
				if ( this.captured[ 1 ] ) {
					if ( this.captured[ 0 ].match( /дн|ден|сут/i ) ) {
						return SD_tools.today( this.captured[ 1 ] + 1 );
					} else if ( this.captured[ 0 ].match( /нед/i ) ) {
						return SD_tools.today( this.captured[ 1 ] * 7 );
					} else if ( this.captured[ 0 ].match( /мес/i ) ) {
						return SD_tools.currentMonth( + this.captured[ 1 ] );
					} else if ( this.captured[ 0 ].match( /г|лет/i ) ) {
						return SD_tools.currentYear( + this.captured[ 1 ] );
					} else return SD_tools.today();
				} else {
					if ( this.captured[ 0 ].match( /дн|ден|сут/i ) ) {
						return SD_tools.today( + 1 );
					} else if ( this.captured[ 0 ].match( /нед/i ) ) {
						return SD_tools.today( + 7 );
					} else if ( this.captured[ 0 ].match( /мес/i ) ) {
						return SD_tools.currentMonth( + 1 );
					} else if ( this.captured[ 0 ].match( /г|лет/i ) ) {
						return SD_tools.currentYear( + 1 );
					} else return SD_tools.today();
				}
			},
			type : "DATE",
			priority : 3
		},
		{
			regExp : /(#next_\d+.{0,5}#(?:date|month)index_(\d+))/gmi,
			replace : function ( h, t, c1, c2, c3, c4 ) {
				this.captured = [ t[ c2 ].origin ];
				this.origin = c1;
				return h;
			},
			func : function() {
				if ( this.captured[ 0 ].match( /дн|ден|сут/i ) ) {
					return SD_tools.today( + 1 );
				} else if ( this.captured[ 0 ].match( /нед/i ) ) {
					return SD_tools.beginOfNextWeek( + 1 );
				} else if ( this.captured[ 0 ].match( /мес/i ) ) {
					return SD_tools.nextMonth( + 1 );
				} else return SD_tools.today();
			},
			type : "DATE",
			priority : 3
		},
		{
			regExp : /(#actionremind_\d+.+?#before_\d+.{0,5})(#number_(\d+).{0,5}#(?:date|month)index_(\d+))/gmi,
			replace : function ( h, t, c1, c2, c3, c4, c5 ) {
				this.captured = [ t[ c3 ], t[ c4 ].origin  ];
				this.priority += 1;
				this.origin = c2;
				return c1 + h;
			},
			func : function() {
				if ( this.captured[ 1 ].match( /дн|ден|сут/i ) ) {
					return '-' + this.captured[ 0 ].func()*1440;
				} else if ( this.captured[ 1 ].match( /нед/i ) ) {
					return '-' + this.captured[ 0].func()*10080;
				} else return '-0';
			},
			type : "RTIME",
			priority : 7
		},
		{
			regExp : /(#number_(\d+).{0,5}#hourindex_(\d+).{0,5}#number_(\d+).{0,5}#minutindex_(\d+))/gmi,
			replace : function ( h, t, c1, c2, c3, c4, c5 ) {
				if ( +t[ c2 ].func() < 24 && +t[ c4 ].func() < 60 ) {
					this.captured = [ +t[ c2 ].func(), +t[ c4 ].func() ];
					this.origin = c1;
					return h;
				}
			},
			func : function() {
				return { h : this.captured[ 0 ] , m : this.captured[ 1 ] };
			},
			type : "TIME",
			priority : 7
		},
		{
			regExp : /(#actionremind_\d+.+?#before_\d+.{0,5})(#number_(\d+)(.{0,5}#(?:hour|minut)index_(\d+))?)/gmi,
			replace : function ( h, t, c1, c2, c3, c4, c5 ) {
				if ( c4 ) {
					this.captured = [ t[ c3 ], t[ c5 ].origin  ];
					this.priority += 1;
				} else this.captured = [ t[ c3 ] ];
				this.origin = c2;
				return c1 + h;
			},
			func : function() {
				if ( this.captured[ 1 ] ) {
					if ( this.captured[ 1 ].match( /ч/i ) ) { return '-' + this.captured[ 0 ].func() * 60; } else return '-' + this.captured[ 0 ].func();
				} else if ( this.captured[ 0 ].origin.match( /час/i ) ) {
					return '-60';
				} else return '-' + this.captured[ 0 ].func();
			},
			type : "RTIME",
			priority : 7
		},
		{
			//wordy date 4 may 2005
			regExp : /(#before_\d+.{0,5})(#number_(\d+).{0,5}#(?:hour|minut)index_(\d+))(.{0,25}#actionremind_\d+)/gmi,
			replace : function ( h, t, c1, c2, c3, c4, c5 ) {
				this.captured = [ t[ c3 ].func(), t[ c4 ].origin  ];
				this.origin = c2;
				return c1 + h + c5;
			},
			func : function() {
				if ( this.captured[ 1 ].match( /ч/i ) ) {
					return '-' + this.captured[ 0 ]*60;
				} else return '-' + this.captured[ 0 ];
			},
			type : "RTIME",
			priority : 7
		},
		{
			//wordy date 4 may 2005
			regExp : /(#prep_(\d+)[\s]{0,5})(#numberhour_(\d+))/gmi,
			replace : function ( h, t, c1, c2, c3, c4 ) {
				if ( t[ c2].origin.match( /в|к/i) ) {
					this.captured = [ t[ c4 ].func() ];
					this.origin = c2;
					return c1 + h;
				}
			},
			func : function() {
				return { h : this.captured[ 0 ], m : 0 };
			},
			type : "TIME",
			priority : 7
		},
		{
			//wordy date 4 may 2005
			regExp : /(#to_\d+[\s]{0,5})(#numberhour_(\d+))/gmi,
			replace : function ( h, t, c1, c2, c3, c4 ) {
				this.captured = [ t[ c3 ].func() ];
				this.origin = c2;
				return c1 + h;
			},
			func : function() {
				return { h : this.captured[ 0 ], m : 0 };
			},
			type : "TIME",
			priority : 7
		},
		{
			//wordy date 4 may 2005
			regExp : /(#time_(\d+).{0,5}#daytime_(\d+))/gmi,
			replace : function ( h, t, c1, c2, c3, c4 ) {
				this.captured = [ t[ c2 ].func(), t[ c3 ].func() ];
				this.origin = c1;
				this.priority = t[ c2].priority + 1;
				if ( t[ c3 ].origin.match( /ноч/i ) && ( +t[ c2 ].func().h === 12 ) ) this.captured = [ { h : 0, m : 0 } ];
				return h;
			},
			func : function() {
				if ( ( this.captured[ 0 ].h < 12 ) && this.captured[ 1 ] ) {
					return { h : this.captured[ 0 ].h + 12 , m : this.captured[ 0 ].m };
				} else {
					this.captured[ 0 ].duplicity = false;
					return this.captured[ 0 ]
				}
			},
			type : "TIME",
			priority : 0
		},
		{
			//wordy date 4 may 2005
			regExp : /(#after_\d+.{0,5}#number_(\d+).{0,5}#(?:hour|minut)index_(\d+))/gmi,
			replace : function ( h, t, c1, c2, c3, c4 ) {
				this.captured = [ +t[ c2 ].func(), t[ c3 ].origin ];
				this.origin = c1;
				return h;
			},
			func : function() {
				if ( this.captured[ 1 ].match( /ч/i ) ) {
					return { h : +this.captured[ 0 ], m : 0 };
				} else return { h : 0, m : +this.captured[ 0 ] };
			},
			type : "ATIME",
			priority : 7
		},
		{
			//time with daytime
			regExp : /(#number_(\d+)(.{0,5}#hourindex_\d+)?.{0,5}#daytime_(\d+))/gmi,
			replace : function ( h, t, c1, c2, c3, c4 ) {
				this.captured = [ +t[ c2 ].func(), t[ c4 ] ];
				this.origin = c1;
				c3 && ( this.priority += 1 );
				return h;
			},
			func : function() {
				if ( ( this.captured[ 0 ] === 12 ) && this.captured[ 1 ].origin.match( /ноч/i ) ) {
					return { h: 0, m: 0, duplicity: false};
				} else if ( ( this.captured[ 0 ] < 12 ) && this.captured[ 1 ].func() ) {
					return { h : this.captured[ 0 ] + 12 , m : 0, duplicity: false };
				} else return { h : this.captured[ 0 ] , m : 0, duplicity: false };
			},
			type : "TIME",
			priority : 8
		},
		{
			//time with daytime
			regExp : /(#daytime_(\d+).{0,3})(#prep_\d+.{0,5})(#number_(\d+)(.{0,5}#hourindex_\d+)?)/gmi,
			replace : function ( h, t, c1, c2, c3, c4, c5, c6 ) {
				this.captured = [ t[ c2 ].func(), +t[ c5 ].func()  ];
				this.origin = c1 + c4;
				c6 && ( this.priority += 1 );
				return c3 + h;
			},
			func : function() {
				if ( ( this.captured[ 1 ] < 12 ) && this.captured[ 0 ]) {
					return { h : this.captured[ 1 ] + 12 , m : 0, duplicity: false };
				} else return { h : this.captured[ 1 ] , m : 0, duplicity: false };
			},
			type : "TIME",
			priority : 8
		},
		{
			//time with daytime
			regExp : /(#number_(\d+).{0,5}#dateindex_(\d+))/gmi,
			replace : function ( h, t, c1, c2, c3, c4 ) {
				if ( ( +t[ c2 ].func() < 13 ) && ( t[ c3 ].origin.match( /дн/i ) ) ) {
					this.captured = [ +t[ c2 ].func() ];
					this.origin = c1;
					return h;
				}
			},
			func : function() {
				return { h: ( ( this.captured[ 0 ] + 12 ) > 24 ) ? this.captured[ 0 ] : this.captured[ 0 ] + 12, m: 0 };
			},
			type : "TIME",
			priority : 8
		},
		{
			//wordy date 4 may 2005
			regExp : /(#before_\d+.{0,5})(#number_(\d+).{0,5}#(?:hour|minut)index_(\d+))/gmi,
			replace : function ( h, t, c1, c2, c3, c4 ) {
				this.captured = [ +t[ c3 ].func(), t[ c4 ].origin  ];
				this.origin = c2;
				return c1 + h;
			},
			func : function() {
				if ( this.captured[ 1 ].match( /ч/i ) ) {
					return '-' + this.captured[ 0 ]*60;
				} else return '-' + this.captured[ 0 ];
			},
			type : "RTIME",
			priority : 7
		},
		{
			//wordy date 4 may 2005
			regExp : /(#after_\d+.{0,5}#number_(\d+))/gmi,
			replace : function ( h, t, c1, c2, c3, c4 ) {
				this.captured = [ t[ c2 ] ];
				this.origin = c1;
				return h;
			},
			func : function() {
				if ( this.captured[ 0].origin.match( /ч/i ) ) {
					return { h: +this.captured[ 0 ].func(), m: 0 };
				} else return { h : 0, m : +this.captured[ 0].func() };
			},
			type : "ATIME",
			priority : 3
		},
		{
			//wordy date 4 may 2005
			regExp : /(#prep_(\d+).{0,5}#dtime_(\d+))/gmi,
			replace : function ( h, t, c1, c2, c3, c4 ) {
				if ( t[ c2 ].origin.match( /на/i ) ) {
					this.captured = [ t[ c3].func() ];
					this.priority += 1;
					this.origin = c1;
					return h;
				}
			},
			func : function() {
				return this.captured[ 0 ];
			},
			type : "DTIME",
			priority : 7
		},
		{
			regExp : /(#prep_(\d+).{0,5}#number_(\d+).{0,5}#(?:hour|minut)index_(\d+))/gmi,
			replace : function ( h, t, c1, c2, c3, c4 ) {
				if ( t[ c2 ].origin.match( /на/i ) ) {
					this.captured = [ +t[ c3 ].func(), t[ c4 ].origin  ];
					this.origin = c1;
					return h;
				}
			},
			func : function() {
				if ( this.captured[ 1 ].match( /ч/i ) ) {
					return { h : this.captured[ 0 ], m : 0 };
				} else return { h : 0, m : this.captured[ 0 ] };
			},
			type : "DTIME",
			priority : 7
		},
		{
			regExp : /(#prep_(\d+).{0,5}#number_(\d+))/gmi,
			replace : function ( h, t, c1, c2, c3, c4 ) {
				if ( t[ c2 ].origin.match( /на/i ) && ( t[ c3 ].origin.match( /час/i ) ) ) {
					this.captured = [ t[ c3 ] ];
					this.origin = c1;
					return h;
				}
			},
			func : function() {
				return { h : 1, m : 0 };
			},
			type : "DTIME",
			priority : 7
		},
		{
			regExp : /(#after_(\d+).{0,5}#number_(\d+))/gmi,
			replace : function ( h, t, c1, c2, c3, c4 ) {
				if ( t[ c3 ].origin.match( /час/i ) ) {
					this.captured = [ t[ c3 ] ];
					this.origin = c1;
					return h;
				}
			},
			func : function() {
				return { h : 1, m : 0 };
			},
			type : "ATIME",
			priority : 7
		},
		{
			regExp : /(#actionremind_\d+.{0,5}#before_\d+.{0,5})(#(?:date|month)index_(\d+))/gmi,
			replace : function ( h, t, c1, c2, c3, c4 ) {
				this.captured = [ t[ c3 ] ];
				this.origin = c2;
				return c1 + h;
			},
			func : function() {
				if ( this.captured[ 0 ].origin.match( /дн|ден|сут/i ) ) {
					return '-1440';
				} else if ( this.captured[ 0 ].origin.match( /нед/i ) ) {
					return '-10080';
				} else return '-0';
			},
			type : "RTIME",
			priority : 7
		},
		{
			regExp : /(#number_(\d+).{0,5}#hourindex_(\d+))/gmi,
			replace : function ( h, t, c1, c2, c3, c4 ) {
				if ( +t[ c2 ].func() < 24 ) {
					this.captured = [+t[c2].func(), t[c3].origin];
					this.origin = c1;
					return h;
				}
			},
			func : function() {
				return { h : this.captured[ 0 ] , m : 0 };
			},
			type : "TIME",
			priority : 7
		},
		{
			regExp : /(#number_(\d+).{0,5}#hourindex_(\d+))/gmi,
			replace : function ( h, t, c1, c2, c3, c4 ) {
				this.captured = [+t[c2].func(), t[c3].origin];
				this.origin = c1;
				return h;
			},
			func : function() {
				return { h : this.captured[ 0 ] , m : 0 };
			},
			type : "DTIME",
			priority : 7
		},
		{
			//wordy date 4 may 2005
			regExp: /(#date_(\d+).{0,5}#(?:year|month)index_(\d+))/gmi,
			replace: function (h, t, c1, c2, c3, c4) {
				this.captured = [ t[ c2 ].func() ];
				this.origin = c1;
				this.priority = t[ c2 ].priority + 1;
				return h;
			},
			func: function () {
				return this.captured[ 0 ]
			},
			type: "DATE",
			priority: 0
		},
		{
			regExp: /(#next_\d+.{0,5}#date_(\d+))/gmi,
			replace: function (h, t, c1, c2, c3, c4) {
				this.captured = [ t[ c2 ].func() ];
				this.origin = c1;
				this.priority = t[ c2 ].priority + 1;
				return h;
			},
			func: function () {
				return this.captured[ 0 ]
			},
			type: "DATE",
			priority: 0
		},
		{
			//wordy date 4 may 2005
			regExp: /(#time_(\d+).{0,5}#hourindex_(\d+))/gmi,
			replace: function (h, t, c1, c2, c3, c4) {
				this.captured = [ t[ c2 ].func() ];
				this.origin = c1;
				this.priority = t[ c2 ].priority;
				return h;
			},
			func: function () {
				return this.captured[ 0 ]
			},
			type: "TIME",
			priority: 0
		},
		{
			//wordy date 4 may 2005
			regExp: /(#before_\d+.{0,5}#rtime_(\d+))/gmi,
			replace: function (h, t, c1, c2, c3, c4) {
				this.captured = [ t[ c2 ].func() ];
				this.origin = c1;
				this.priority = t[ c2 ].priority;
				return h;
			},
			func: function () {
				return this.captured[ 0 ]
			},
			type: "RTIME",
			priority: 0
		},
		{
			//wordy date 4 may 2005
			regExp: /(#before_\d+.{0,5}#time_(\d+))/gmi,
			replace: function (h, t, c1, c2, c3, c4) {
				this.captured = [ t[ c2 ].func() ];
				this.origin = c1;
				this.priority = t[ c2 ].priority;
				return h;
			},
			func: function () {
				return '-' + ( this.captured[ 0 ].h * 60 + this.captured[ 0 ].m )
			},
			type: "RTIME",
			priority: 0
		},
		{
			//wordy date 4 may 2005
			regExp: /(#dprep_\d+.{0,5}#time_(\d+))/gmi,
			replace: function (h, t, c1, c2, c3, c4) {
				this.captured = [ t[ c2 ].func() ];
				this.origin = c1;
				this.priority = t[ c2 ].priority;
				return h;
			},
			func: function () {
				return this.captured[ 0 ];
			},
			type: "DTIME",
			priority: 0
		},
		{
			//wordy date 4 may 2005
			regExp: /(#prep_\d+.{0,5})?(#time_(\d+))/gmi,
			replace: function (h, t, c1, c2, c3, c4) {
				if ( c1 === undefined && t[ c3 ].func().datealternative && SD_tools.setDate( t[ c3 ].func().h, t[ c3 ].func().m, true ) ) {
					this.captured = [ SD_tools.setDate( t[ c3 ].func().h, t[ c3 ].func().m ) ];
					this.origin = c2;
					this.priority = t[ c3 ].priority - 5;
					return h;
				}
			},
			func: function () {
				return this.captured[ 0 ];
			},
			type: "DATE",
			priority: 0
		},
		{
			//wordy date 4 may 2005
			regExp : /(#after_\d+\s{0,3})(#d?time_(\d+))/gmi,
			replace : function ( h, t, c1, c2, c3, c4 ) {
				this.captured = [ t[ c3 ].func() ];
				this.origin = c1 + c2;
				return h;
			},
			func : function() {
				return this.captured[ 0 ];
			},
			type : "ATIME",
			priority : 8
		},
		{
			//wordy date 4 may 2005
			regExp : /(#numberhour_(\d+))/gmi,
			replace : function ( h, t, c1, c2, c3, c4 ) {
				this.captured = [ t[ c2 ].func() ];
				this.origin = c1;
				return h;
			},
			func : function() {
				return { h : this.captured[ 0 ], m : 0 };
			},
			type : "DTIME",
			priority : 7
		},
		{
			//wordy date 4 may 2005
			regExp: /(#before_\d+.{0,5}#dtime_(\d+))/gmi,
			replace: function (h, t, c1, c2, c3, c4) {
				this.captured = [ t[ c2 ].func() ];
				this.origin = c1;
				this.priority = t[ c2 ].priority;
				return h;
			},
			func: function () {
				return '-' + ( +this.captured[ 0 ].h * 60 + +this.captured[ 0 ].m );
			},
			type: "RTIME",
			priority: 0
		},
		{
			//wordy date 4 may 2005
			regExp: /(#weekday_(\d+)(?:.{0,5})#date_(\d+))/gmi,
			replace: function (h, t, c1, c2, c3, c4) {
				if ( t[ c2 ].func() === ( new Date( t[ c3 ].func() ).getDay() ) ) {
					this.captured = [ t[ c2 ].func(), t[ c3 ].func() ];
					this.origin = c1;
					this.priority = t[ c3 ].priority + 3;
					return h;
				}
			},
			func: function () {
				return this.captured[ 1 ]
			},
			type: "DATE",
			priority: 0
		},
		{
			//wordy date 4 may 2005
			regExp: /(#date_(\d+).{0,5}#weekday_(\d+))/gmi,
			replace: function (h, t, c1, c2, c3, c4) {
				if ( t[ c3 ].func() === ( new Date( t[ c2 ].func() ).getDay() ) ) {
					this.captured = [ t[ c2 ].func(), t[ c3 ].func() ];
					this.origin = c1;
					this.priority = t[ c2 ].priority + 3;
					return h;
				}
			},
			func: function () {
				return this.captured[ 0 ]
			},
			type: "DATE",
			priority: 0
		},
		{
			//wordy date 4 may 2005
			regExp: /(#next_\d+.{0,5}#weekday_(\d+))/gmi,
			replace: function (h, t, c1, c2 ) {
				this.captured = [ t[ c2 ].func() ];
				this.origin = c1;
				this.priority = t[ c2 ].priority;
				return h;
			},
			func: function () {
				return SD_tools.beginOfNextWeek( this.captured[ 0 ] )
			},
			type: "DATE",
			priority: 0
		},
		{
			//wordy date 4 may 2005
			regExp: /(#weekday_(\d+))/gmi,
			replace: function (h, t, c1, c2 ) {
				this.captured = [ t[ c2 ].func() ];
				this.origin = c1;
				this.priority = t[ c2 ].priority;
				return h;
			},
			func: function () {
				return SD_tools.beginOfWeek( this.captured[ 0 ] );
			},
			type: "DATE",
			priority: 0
		},
		{
			regExp : /(#month_(\d+))/gmi,
			replace : function ( h, t, c1, c2, c3, c4 ) {
				this.captured = [ t[ c2 ].func() ];
				this.origin = c1;
				return h;
			},
			func : function() {
				return SD_tools.nearestDayMonth( 1, this.captured[ 0 ] );
			},
			type : "DATE",
			priority : 3
		}
	];


	/**
	 * @author Kadyrov Albert <fluffy1snow@gmail.com>
	 * @module SmartDateLocale_RU
	 */

	var combinations = [
		// *** 4 params begin ***
		{
			// alarm + e a | duration - | date + s | time + s a
			regExp: /(?:(#prep_\d+|#before_\d+).{0,3})?(#date_\d+)(?:[^#]{0,100}?(#prep_\d+).{0,3}|[^#]{0,100}?)(#time_\d+)[^#]{0,100}?(#dtime_\d+)[^#]{0,100}?(#actionremind_\d+).{0,5}(#rtime_\d+)/gmi,
			extract: function( tokens, match, text ) {
				var c = {
					"event_startDate" : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(),
					"event_startTime" : tokens[ SD_tools._getNumber( match[ 3 ] ) ].func(),
					"event_duration" : SD_tools._durationCounter( tokens[ SD_tools._getNumber( match[ 4 ] ) ].func(), false, true ),
					"event_alarms" : tokens[ SD_tools._getNumber( match[ 6 ] ) ].func(),
					"event_result" : text,
					"priority" : 40 + tokens[ SD_tools._getNumber( match[ 1 ])].priority + tokens[ SD_tools._getNumber( match[ 3 ])].priority + tokens[ SD_tools._getNumber( match[ 4 ])].priority + tokens[ SD_tools._getNumber( match[ 6 ])].priority
				};
				return c;
			}
		},
		{
			// alarm - | duration + a | date + s a | time + a  date in number in duration
			regExp: /(?:(#prep_\d+).{0,5})?(#date_\d+).+?(#prep_\d+|#from_\d+).{0,3}(#number_\d+).+?(#to_\d+).{0,3}(#number_\d+).{0,50}(#actionremind_\d+).{0,5}(#rtime_\d+)/gmi,
			extract: function( tokens, match, text ) {
				if ( tokens[ SD_tools._getNumber( match[ 3 ] ) ].func() > 23 ) return;
				return {
					"event_startTime" : { h : tokens[ SD_tools._getNumber( match[ 3 ] ) ].func(), m : 0 },
					"event_startDate" : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(),
					"event_duration" : SD_tools._durationCounter( +tokens[ SD_tools._getNumber( match[ 3 ] ) ].func(), +tokens[ SD_tools._getNumber( match[ 5 ] ) ].func() ),
					"event_alarms" : tokens[ SD_tools._getNumber( match[ 7 ] ) ].func(),
					"event_result" : text,
					"priority" : 35 + tokens[ SD_tools._getNumber( match[ 1 ])].priority + tokens[ SD_tools._getNumber( match[ 7 ])].priority
				};
			}
		},
		{
			// alarm + e a | duration + | date + s | time + s a
			regExp: /(?:(#prep_\d+|#before_\d+).{0,3})?(#date_\d+)(?:[^#]+?(#prep_\d+).{0,3}|[^#]+?)(#time_\d+).*?(#dtime_\d+).+?(#actionremind_\d+).{0,5}(#rtime_\d+)/gmi,
			extract: function( tokens, match, text ) {
				var c = {
					"event_startDate" : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(),
					"event_startTime" : tokens[ SD_tools._getNumber( match[ 3 ] ) ].func(),
					"event_duration" : SD_tools._durationCounter( tokens[ SD_tools._getNumber( match[ 4 ] ) ].func(), false, true ),
					"event_alarms" : tokens[ SD_tools._getNumber( match[ 6 ] ) ].func(),
					"event_result" : text,
					"priority" : 30 + tokens[ SD_tools._getNumber( match[ 1 ])].priority + tokens[ SD_tools._getNumber( match[ 3 ])].priority + tokens[ SD_tools._getNumber( match[ 4 ])].priority + tokens[ SD_tools._getNumber( match[ 6 ])].priority
				};
				return c;
			}
		},
		{//TODO duration
			// alarm + | duration + a | date + | time + s a
			regExp: /(?:(#prep_\d+).{0,3})?(#date_\d+)(?:.{0,50}(#prep_\d+).{0,3}|.{0,5})(#time_\d+).+?(#to_\d+).{0,3}(#number_\d+).+?(#actionremind_\d+)/gmi,
			extract: function( tokens, match, text ) {
				if ( tokens[ SD_tools._getNumber( match[ 1 ] ) ].func().length > 31 ) return;
				var c = {
					"event_startDate" : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(),
					"event_startTime" : tokens[ SD_tools._getNumber( match[ 3 ] ) ].func(),
					"event_alarms" : '0',
					"event_duration" : SD_tools._durationCounter( tokens[ SD_tools._getNumber( match[ 3 ] ) ].func(), +tokens[ SD_tools._getNumber( match[ 5 ] ) ].func() ),
					"event_result" : text,
					"priority" : 40 + tokens[ SD_tools._getNumber( match[ 1 ])].priority + tokens[ SD_tools._getNumber( match[ 3 ])].priority
				};
				return c;
			}
		},
		// *** 4 params end***
		// *** 3 params ***
		{// "+" - attends, "-" - absents, "e" - exact, "r" - relative, "a" - advanced features, "s" - standard format
			// alarm + e a | duration - | date + s | time + s a
			regExp: /(?:(#prep_\d+).{0,3})?(#time_\d+).{0,25}(#date_\d+).{0,25}(#actionremind_\d+).{0,5}(#rtime_\d+)/gmi,
			extract: function( tokens, match, text ) {
				var c = {
					"event_startDate" : tokens[ SD_tools._getNumber( match[ 2 ] ) ].func(),
					"event_startTime" : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(),
					"event_alarms" : tokens[ SD_tools._getNumber( match[ 4 ] )].func(),
					"event_result" : text,
					"priority" : 30 + tokens[ SD_tools._getNumber( match[ 1 ])].priority + tokens[ SD_tools._getNumber( match[ 2 ])].priority + tokens[ SD_tools._getNumber( match[ 4 ])].priority
				};
				return c;
			}
		},
		{
			// alarm + e a | duration - | date + s | time + s a
			regExp: /(?:(#prep_\d+|#before_\d+).{0,3})?(#date_\d+)(?:[^#]+?(#prep_\d+).{0,3}|[^#]+?)(#time_\d+).+?(#actionremind_\d+).{0,5}(#rtime_\d+)/gmi,
			extract: function( tokens, match, text ) {
				var c = {
					"event_startDate" : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(),
					"event_startTime" : tokens[ SD_tools._getNumber( match[ 3 ] ) ].func(),
					"event_alarms" : tokens[ SD_tools._getNumber( match[ 5 ] ) ].func(),
					"event_result" : text,
					"priority" : 30 + tokens[ SD_tools._getNumber( match[ 1 ])].priority + tokens[ SD_tools._getNumber( match[ 3 ])].priority + tokens[ SD_tools._getNumber( match[ 5 ])].priority
				};
				return c;
			}
		},
		{
			// alarm + e a | duration - | date + s | time + s a
			regExp: /(?:(#prep_\d+|#before_\d+).{0,3})?(#date_\d+)(?:.{0,25}(#prep_\d+).{0,3}|.{0,25})(#time_\d+)[\s\S]+(#actionremind_\d+).{0,5}(#rtime_\d+)/gmi,
			extract: function( tokens, match, text ) {
				var c = {
					"event_startDate" : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(),
					"event_startTime" : tokens[ SD_tools._getNumber( match[ 3 ] ) ].func(),
					"event_alarms" : tokens[ SD_tools._getNumber( match[ 5 ] ) ].func(),
					"event_result" : text,
					"priority" : 30 + tokens[ SD_tools._getNumber( match[ 1 ])].priority + tokens[ SD_tools._getNumber( match[ 3 ])].priority + tokens[ SD_tools._getNumber( match[ 5 ])].priority
				};
				return c;
			}
		},
		{
			// alarm + e | duration - | date + s | time + a action_remind
			regExp: /(?:(#prep_\d+).{0,3})?(#date_\d+)(?:.+(#prep_\d+).{0,3}|.{0,5})(#number_\d+).+(#actionremind_\d+).{0,5}(#rtime_\d+)/gmi,
			extract: function( tokens, match, text ) {
				if ( tokens[ SD_tools._getNumber( match[ 3 ] ) ].func() > 23 ) return;
				var k1 = 1, k2 = '', c = {
					"event_startDate" : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(),
					"event_startTime" : { h : tokens[ SD_tools._getNumber( match[ 3 ] ) ].func(), m : 0 },
					"event_alarms" : tokens[ SD_tools._getNumber( match[ 5 ] ) ].func(),
					"event_result" : text,
					"priority" : 30 + tokens[ SD_tools._getNumber( match[ 1 ])].priority + tokens[ SD_tools._getNumber( match[ 5 ])].priority
				};
				return c;
			}
		},
		{
			// alarm - | duration + | date + s | time + a action_remind
			regExp: /(?:(#prep_\d+).{0,3})?(#date_\d+)(?:.+(#prep_\d+).{0,3}|.{0,5})(#number_\d+).{0,5}(#dtime_\d+)/gmi,
			extract: function( tokens, match, text ) {
				if ( tokens[ SD_tools._getNumber( match[ 3 ] ) ].func() > 23 ) return;
				var k1 = 1, k2 = '', c = {
					"event_startDate" : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(),
					"event_startTime" : { h : tokens[ SD_tools._getNumber( match[ 3 ] ) ].func(), m : 0 },
					"event_duration" : SD_tools._durationCounter( tokens[ SD_tools._getNumber( match[ 4 ] ) ].func(), false, true ),
					"event_result" : text,
					"priority" : 30 + tokens[ SD_tools._getNumber( match[ 1 ])].priority + tokens[ SD_tools._getNumber( match[ 4 ])].priority
				};
				return c;
			}
		},
		{
			// alarm + e | duration - | date + s | time + a action_remind
			regExp: /(?:(#prep_\d+).{0,3})?(#date_\d+)(?:.+(#prep_\d+).{0,3}|.{0,5})(#number_\d+).+(#actionremind_\d+).{0,5}(#rtime_\d+)/gmi,
			extract: function( tokens, match, text ) {
				if ( tokens[ SD_tools._getNumber( match[ 3 ] ) ].func() > 23 ) return;
				var k1 = 1, k2 = '', c = {
					"event_startDate" : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(),
					"event_startTime" : { h : tokens[ SD_tools._getNumber( match[ 3 ] ) ].func(), m : 0 },
					"event_alarms" : tokens[ SD_tools._getNumber( match[ 5 ] ) ].func(),
					"event_result" : text,
					"priority" : 30 + tokens[ SD_tools._getNumber( match[ 1 ])].priority + tokens[ SD_tools._getNumber( match[ 5 ])].priority
				};
				return c;
			}
		},
		{
			// alarm + | duration - | date + s a | time + s a   15го июня в 7-30
			regExp: /(?:(#prep_\d+).{0,5})?(#date_\d+)(?:.{0,25}(#prep_\d+).{0,5}|.{0,5})(#time_\d+).{0,5}(#actionremind_\d+)/gmi,
			extract: function( tokens, match, text ) {
				return {
					"event_startDate" : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(),
					"event_startTime" : tokens[ SD_tools._getNumber( match[ 3 ] ) ].func(),
					"event_alarms" : '0',
					"event_result" : text,
					"priority" : 30 + tokens[ SD_tools._getNumber( match[ 1 ])].priority + tokens[ SD_tools._getNumber( match[ 3 ])].priority
				};
			}
		},
		{
			// alarm + | duration - | date + s a | time + a
			regExp: /(?:(#prep_\d+).{0,3})?(#date_\d+)(?:.{0,25}(#prep_\d+).{0,5}|.{0,5})(#number_\d+).+(#actionremind_\d+)/gmi,
			extract: function( tokens, match, text ) {
				if ( tokens[ SD_tools._getNumber( match[ 3 ] ) ].func() > 23 ) return;
				return {
					"event_startDate" : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(),
					"event_startTime" : { h : +tokens[ SD_tools._getNumber( match[ 3 ] ) ].func(), m : 0 },
					"event_alarms" : '0',
					"event_result" : text,
					"priority" : 30 + tokens[ SD_tools._getNumber( match[ 1 ])].priority
				};
			}
		},
		{
			// alarm + | duration - | date + s | time + a action_remind
			regExp: /(#actionremind_\d+).+(#date_\d+)(?:.+(#prep_\d+).{0,3}|.{0,5})(#time_\d+)/gmi,
			extract: function( tokens, match, text ) {
				if ( tokens[ SD_tools._getNumber( match[ 3 ] ) ].func() > 23 ) return;
				var c = {
					"event_startDate" : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(),
					"event_startTime" : tokens[ SD_tools._getNumber( match[ 3 ] ) ].func(),
					"event_alarms" : '0',
					"event_result" : text,
					"priority" : 30 + tokens[ SD_tools._getNumber( match[ 1 ])].priority + tokens[ SD_tools._getNumber( match[ 3 ])].priority
				};
				return c;
			}
		},
		{
			// alarm + | duration - | date + s | time + a action_remind
			regExp: /(#actionremind_\d+).+(#date_\d+)(?:.+(#prep_\d+).{0,3}|.{0,5})(#number_\d+)/gmi,
			extract: function( tokens, match, text ) {
				if ( tokens[ SD_tools._getNumber( match[ 3 ] ) ].func() > 23 ) return;
				var c = {
					"event_startDate" : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func() ,
					"event_startTime" : { h : tokens[ SD_tools._getNumber( match[ 3 ] ) ].func(), m : 0 },
					"event_alarms" : '0',
					"event_result" : text,
					"priority" : 30 + tokens[ SD_tools._getNumber( match[ 1 ])].priority
				};
				return c;
			}
		},
		{
			// alarm + e | duration + a | date - | time + a from to duration
			regExp: /(#from_\d+).{0,3}(#time_\d+).{0,3}(#to_\d+).{0,3}(#time_\d+).+(#actionremind_\d+).{0,5}(#rtime_\d+)/gmi,
			extract: function( tokens, match, text ) {
				if ( ( tokens[ SD_tools._getNumber( match[ 1 ] ) ].func().length > 23 ) && ( tokens[ SD_tools._getNumber( match[ 1 ] ) ].func().length > 23 ) ) return;
				var a2, c = {
					"event_startTime" : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(),
					"event_alarms" : tokens[ SD_tools._getNumber( match[ 5 ] ) ].func(),
					"event_duration" : SD_tools._durationCounter( tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(), tokens[ SD_tools._getNumber( match[ 3 ] ) ].func() ),
					"event_result" : text,
					"priority" : 20 + tokens[ SD_tools._getNumber( match[ 1 ])].priority + tokens[ SD_tools._getNumber( match[ 2 ])].priority + + tokens[ SD_tools._getNumber( match[ 6 ])].priority
				};
				SD_tools._publicateQuery( {
					query : { date: true },
					callback : function( res ) {
						this.match = match;
						c.event_startDate = res.date;
						return c;
					}
				} )
			}
		},
		{
			// alarm + e | duration + a | date - | time + a from to duration
			regExp: /(#from_\d+).{0,3}(#number_\d+).{0,3}(#to_\d+).{0,3}(#time_\d+).+(#actionremind_\d+).{0,5}(#rtime_\d+)/gmi,
			extract: function( tokens, match, text ) {
				if ( tokens[ SD_tools._getNumber( match[ 1 ] ) ].func().length > 23 ) return;
				var a2, c = {
					"event_startTime" : { h : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func() , m : 0 },
					"event_alarms" : tokens[ SD_tools._getNumber( match[ 5 ] ) ].func(),
					"event_duration" : SD_tools._durationCounter( +tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(), tokens[ SD_tools._getNumber( match[ 3 ] ) ].func() ),
					"event_result" : text,
					"priority" : 28 + tokens[ SD_tools._getNumber( match[ 3 ])].priority + tokens[ SD_tools._getNumber( match[ 5 ])].priority
				};
				SD_tools._publicateQuery( {
					query : { date: true },
					callback : function( res ) {
						this.match = match;
						c.event_startDate = res.date;
						return c;
					}
				} )
			}
		},
		{
			// alarm + e | duration + a | date - | time + a from to duration
			regExp: /(#from_\d+).{0,3}(#number_\d+).{0,3}(#to_\d+).{0,3}(#time_\d+).+(#actionremind_\d+)/gmi,
			extract: function( tokens, match, text ) {
				if ( ( tokens[ SD_tools._getNumber( match[ 1 ] ) ].func().length > 23 ) && ( tokens[ SD_tools._getNumber( match[ 1 ] ) ].func().length > 23 ) ) return;
				var c = {
					"event_startTime" : { h : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func() , m : 0 },
					"event_alarms" : '0',
					"event_duration" : SD_tools._durationCounter( +tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(), tokens[ SD_tools._getNumber( match[ 3 ] ) ].func() ),
					"event_result" : text,
					"priority" : 26 + tokens[ SD_tools._getNumber( match[ 3 ])].priority
				};
				SD_tools._publicateQuery( {
					query : { date: true },
					callback : function( res ) {
						this.match = match;
						c.event_startDate = res.date;
						return c;
					}
				} )
			}
		},
		{//TODO what is this? where is rtime?
			// alarm + | duration + a | date - | time + a from to duration
			regExp: /(#prep_\d+|#from_\d+).{0,3}(#time_\d+).{0,3}(#prep_\d+|#to_\d+).{0,3}(#time_\d+).+(#actionremind_\d+)/gmi,
			extract: function( tokens, match, text ) {
				if ( ( tokens[ SD_tools._getNumber( match[ 1 ] ) ].func().length > 23 ) && ( tokens[ SD_tools._getNumber( match[ 1 ] ) ].func().length > 23 ) ) return;
				var a2, c = {
					"event_startTime" : +tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(),
					"event_alarms" : "0",
					"event_duration" : SD_tools._durationCounter( tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(), tokens[ SD_tools._getNumber( match[ 3 ] ) ].func() ),
					"event_result" : text,
					"priority" : 20 + tokens[ SD_tools._getNumber( match[ 1 ])].priority
				};
				SD_tools._publicateQuery( {
					query : { date: true },
					callback : function( res ) {
						this.match = match;
						c.event_startDate = res.date;
						return c;
					}
				} )
			}
		},
		{//TODO what is this? where is rtime?
			// alarm + | duration + a | date - | time + a from to duration
			regExp: /(#prep_\d+).{0,3}(#time_\d+).{0,3}(#dtime_\d+).+(#actionremind_\d+)/gmi,
			extract: function( tokens, match, text ) {
				var c = {
					"event_startTime" : +tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(),
					"event_alarms" : "0",
					"event_duration" : SD_tools._durationCounter( tokens[ SD_tools._getNumber( match[ 2 ] ) ].func(), false, true ),
					"event_result" : text,
					"priority" : 30 + tokens[ SD_tools._getNumber( match[ 1 ])].priority + tokens[ SD_tools._getNumber( match[ 2 ])].priority
				};
				SD_tools._publicateQuery( {
					query : { date: true },
					callback : function( res ) {
						this.match = match;
						c.event_startDate = res.date;
						return c;
					}
				} )
			}
		},
		{
			// alarm - | duration + | date + s a | time + s a hours/mins in night
			regExp: /(?:(#prep_\d+).{0,3})?(#date_\d+)(?:.+?(#prep_\d+).{0,3}|.+?)(#time_\d+).{0,15}(#dtime_\d+)/gmi,
			extract: function( tokens, match, text ) {
				return {
					"event_startDate" : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(),
					"event_startTime" : tokens[ SD_tools._getNumber( match[ 3 ] ) ].func(),
					"event_duration" : SD_tools._durationCounter( tokens[ SD_tools._getNumber( match[ 4 ] ) ].func(), false, true ),
					"event_result" : text,
					"priority" : 30 + tokens[ SD_tools._getNumber( match[ 1 ])].priority + tokens[ SD_tools._getNumber( match[ 3 ])].priority + tokens[ SD_tools._getNumber( match[ 4 ])].priority
				};
			}
		},
		{
			// alarm - | duration + s | date + s | time + s from to duration
			regExp: /(?:(#prep_\d+).{0,5})?(#date_\d+).+(#prep_\d+|#from_\d+).{0,3}(#time_\d+).{0,3}(#to_\d+).{0,3}(#time_\d+)/gmi,
			extract: function( tokens, match, text ) {
				var c = {
					"event_startDate": tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(),
					"event_startTime": tokens[ SD_tools._getNumber( match[ 3 ] ) ].func(),
					"event_duration" : SD_tools._durationCounter( tokens[ SD_tools._getNumber( match[ 3 ] ) ].func(), tokens[ SD_tools._getNumber( match[ 5 ] ) ].func() ),
					"event_result": text,
					"priority" : 20 + tokens[ SD_tools._getNumber( match[ 3 ]) ].priority + tokens[ SD_tools._getNumber( match[ 5 ]) ].priority
				};
				if( +tokens[ SD_tools._getNumber( match[ 5 ] ) ].func().h > 12 ) c.event_startTime.duplicity = false;
				return c;
			}
		},
		{
			// alarm - | duration + s | date + s | time + s from to duration
			regExp: /(?:(#prep_\d+).{0,5})?(#date_\d+)(?:.+(#prep_\d+).{0,3}|.{0,5})(#time_\d+).{0,3}[-].{0,3}(#time_\d+)/gmi,
			extract: function( tokens, match, text ) {
				return {
					"event_startDate" : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(),
					"event_startTime" : tokens[ SD_tools._getNumber( match[ 3 ] ) ].func(),
					"event_duration" : SD_tools._durationCounter( tokens[ SD_tools._getNumber( match[ 3 ] ) ].func(), tokens[ SD_tools._getNumber( match[ 4 ] ) ].func() ),
					"event_result" : text,
					"priority" : 20 + tokens[ SD_tools._getNumber( match[ 1 ])].priority + tokens[ SD_tools._getNumber( match[ 3 ])].priority + tokens[ SD_tools._getNumber( match[ 4 ]) ].priority
				};
			}
		},
		{
			// alarm - | duration + a | date + s a | time + a  date in number in duration
			regExp: /(?:(#prep_\d+).{0,5})?(#date_\d+)(?:.+(#prep_\d+).{0,3}|.{0,5})(#time_\d+).{0,5}(#dtime_\d+)/gmi,
			extract: function( tokens, match, text ) {
				return {
					"event_startTime" : tokens[ SD_tools._getNumber( match[ 3 ] ) ].func(),
					"event_startDate" : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(),
					"event_duration" : SD_tools._durationCounter( tokens[ SD_tools._getNumber( match[ 4 ] ) ].func(), false, true ),
					"event_result" : text,
					"priority" : 30 + tokens[ SD_tools._getNumber( match[ 1 ])].priority + tokens[ SD_tools._getNumber( match[ 3 ])].priority + tokens[ SD_tools._getNumber( match[ 4 ])].priority
				};
			}
		},
		{
			// alarm - | duration + a | date + s a | time + a  date in number in duration
			regExp: /(?:(#prep_\d+).{0,5})?(#date_\d+)(?:.+(#prep_\d+|#from_\d+).{0,3}|.{0,5})(#d?time_\d+)(?:.{0,5}(#to_\d+).{0,3}|.{0,3})(#d?time_\d+)/gmi,
			extract: function( tokens, match, text ) {
				return {
					"event_startTime" : tokens[ SD_tools._getNumber( match[ 3 ] ) ].func(),
					"event_startDate" : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(),
					"event_duration" : SD_tools._durationCounter( tokens[ SD_tools._getNumber( match[ 3 ] ) ].func(), tokens[ SD_tools._getNumber( match[ 5 ] ) ].func() ),
					"event_result" : text,
					"priority" : 20 + tokens[ SD_tools._getNumber( match[ 1 ])].priority + tokens[ SD_tools._getNumber( match[ 3 ])].priority + tokens[ SD_tools._getNumber( match[ 5 ])].priority
				};
			}
		},
		{//TODO priority for durations + prep in duration combinations
			// alarm - | duration + a | date + s a | time + a  date in number in duration
			regExp: /(?:(#prep_\d+).{0,5})?(#date_\d+)(?:.+(#from_\d+).{0,3}|.{0,5})(#time_\d+).+?(#to_\d+).{0,3}(#number_\d+)/gmi,
			extract: function( tokens, match, text ) {
				var c = {
					"event_startTime" : tokens[ SD_tools._getNumber( match[ 3 ] ) ].func(),
					"event_startDate" : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(),
					"event_duration" : SD_tools._durationCounter( tokens[ SD_tools._getNumber( match[ 3 ] ) ].func(), tokens[ SD_tools._getNumber( match[ 3 ] ) ].func() ),
					"event_result" : text,
					"priority" : 30 + tokens[ SD_tools._getNumber( match[ 1 ])].priority + tokens[ SD_tools._getNumber( match[ 3 ])].priority
				};
				return c;
			}
		},
		{
			// alarm - | duration + a | date + s a | time + a  date in number in duration
			regExp: /(?:(#prep_\d+).{0,5})?(#date_\d+).+?(#from_\d+).{0,3}(#number_\d+).+?(#to_\d+).{0,3}(#time_\d+)/gmi,
			extract: function( tokens, match, text ) {
				return {
					"event_startTime" : { h : +tokens[ SD_tools._getNumber( match[ 3 ] ) ].func(), m : 0 },
					"event_startDate" : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(),
					"event_duration" : SD_tools._durationCounter( tokens[ SD_tools._getNumber( match[ 3 ] ) ].func(), tokens[ SD_tools._getNumber( match[ 5 ] ) ].func() ),
					"event_result" : text,
					"priority" : 30 + tokens[ SD_tools._getNumber( match[ 1 ])].priority + tokens[ SD_tools._getNumber( match[ 5 ])].priority
				};
			}
		},
		{
			// alarm - | duration + a | date + s a | time + a  date in number in duration
			regExp: /(?:(#prep_\d+).{0,5})?(#date_\d+).+(#prep_\d+|#from_\d+).{0,3}(#number_\d+).+?(#to_\d+).{0,3}(#number_\d+)/gmi,
			extract: function( tokens, match, text ) {
				if ( tokens[ SD_tools._getNumber( match[ 3 ] ) ].func() > 23 ) return;
				var c = {
					"event_startTime" : { h : tokens[ SD_tools._getNumber( match[ 3 ] ) ].func(), m : 0 },
					"event_startDate" : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(),
					"event_duration" : SD_tools._durationCounter( +tokens[ SD_tools._getNumber( match[ 3 ] ) ].func(), +tokens[ SD_tools._getNumber( match[ 5 ] ) ].func() ),
					"event_result" : text,
					"priority" : 25 + tokens[ SD_tools._getNumber( match[ 1 ])].priority
				};
				if ( +tokens[ SD_tools._getNumber( match[ 5 ] ) ].func() > 12 ) c.event_startTime.duplicity = false;
				return c;
			}
		},
		{
			// alarm - | duration + a | date + s | time + a  from to duration
			regExp: /(#prep_\d+|#from_\d+).{0,3}(#number_\d+).{0,3}(#prep_\d+|#to_\d+).{0,3}(#number_\d+).+(#prep_\d+).{0,3}(#date_\d+)/gmi,
			extract: function( tokens, match, text ) {
				if ( ( tokens[ SD_tools._getNumber( match[ 1 ] ) ].func().length > 23 ) && ( tokens[ SD_tools._getNumber( match[ 1 ] ) ].func().length > 23 ) ) return;
				var c = {
					"event_startDate" : tokens[ SD_tools._getNumber( match[ 5 ] ) ].func(),
					"event_startTime" : { h : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(), m : 0 },
					"event_duration" : SD_tools._durationCounter( +tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(), tokens[ SD_tools._getNumber( match[ 3 ] ) ].func() ),
					"event_result" : text,
					"priority" : 30 + tokens[ SD_tools._getNumber( match[ 5 ])].priority
				};
				return c;
			}
		},
		{
			// alarm - | duration + s a | date - | time + s  from to duration
			regExp: /(#from_\d+).{0,3}(#number_\d+).{0,3}(#to_\d+).{0,3}(#number_\d+).+?(#actionremind_\d+).{0,3}(#rtime_\d+)/gmi,
			extract: function( tokens, match, text ) {
				var c = {
					"event_startTime" : { h : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(), m: 0 },
					"event_result" : text,
					"event_alarms" : tokens[ SD_tools._getNumber( match[ 5 ] ) ].func(),
					"priority" : 30
				};
				c.event_duration = SD_tools._durationCounter( +tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(), tokens[ SD_tools._getNumber( match[ 3 ] ) ].func() );
				SD_tools._publicateQuery( {
					query: { date : true },
					callback : function( res ) {
						c.event_startDate = res.date;
						this.match = match;
						return c;
					}
				} );
			}
		},
		{
			// alarm - | duration + s a | date - | time + s  from to duration
			regExp: /(#from_\d+).{0,3}(#number_\d+).{0,3}(#to_\d+).{0,3}(#number_\d+).+?(#actionremind_\d+)/gmi,
			extract: function( tokens, match, text ) {
				var c = {
					"event_startTime" : { h : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(), m: 0 },
					"event_result" : text,
					"event_alarms" : "0",
					"priority" : 30
				};
				c.event_duration = SD_tools._durationCounter( +tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(), +tokens[ SD_tools._getNumber( match[ 3 ] ) ].func() );
				SD_tools._publicateQuery( {
					query: { date : true },
					callback : function( res ) {
						c.event_startDate = res.date;
						this.match = match;
						return c;
					}
				} );
			}
		},
		{//TODO duration
			// alarm - | duration + a | date + | time + s a
			regExp: /(#prep_\d+).{0,3}(#date_\d+)(?:.{0,50}(#prep_\d+).{0,3}|.{0,5})(#time_\d+).+(#to_\d+).{0,3}(#time_\d+)/gmi,
			extract: function( tokens, match, text ) {
				if ( tokens[ SD_tools._getNumber( match[ 1 ] ) ].func().length > 31 ) return;
				var c = {
					"event_startDate" : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(),
					"event_startTime" : tokens[ SD_tools._getNumber( match[ 3 ] ) ].func(),
					"event_duration" : SD_tools._durationCounter( tokens[ SD_tools._getNumber( match[ 3 ] ) ].func(), tokens[ SD_tools._getNumber( match[ 5 ] ) ].func() ),
					"event_result" : text,
					"priority" : 30 + tokens[ SD_tools._getNumber( match[ 1 ])].priority + tokens[ SD_tools._getNumber( match[ 3 ])].priority
				};
				return c;
			}
		},
		{//TODO analyze for compl
			// alarm - | duration + | date + s | time + date from to duration ?wtf
			regExp: /(?:(#prep_\d+).{0,3})?(#date_\d+).+?(#prep_\d+).{0,3}(#number_\d+).{0,5}?(#dtime_\d+)/gmi,
			extract: function( tokens, match, text ) {
				if ( tokens[ SD_tools._getNumber( match[ 3 ] ) ].func() > 23 ) return;
				return {
					"event_startDate" : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(),
					"event_startTime" : { h : tokens[ SD_tools._getNumber( match[ 3 ] ) ].func(), m : 0 },
					"event_duration" : SD_tools._durationCounter( tokens[ SD_tools._getNumber( match[ 4 ] ) ].func(), false, true ),
					"event_result" : text,
					"priority" : 30 + tokens[ SD_tools._getNumber( match[ 1 ])].priority + tokens[ SD_tools._getNumber( match[ 4 ])].priority
				};
			}
		},
		{
			// alarm - | duration + | date + s | time - action_remind
			regExp: /(?:(#prep_\d+).{0,3})?(#date_\d+).+(#dtime_\d+).+(#actionremind_\d+)/gmi,
			extract: function( tokens, match, text ) {
				var c = {
					"event_startDate" : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(),
					"event_duration" : SD_tools._durationCounter( tokens[ SD_tools._getNumber( match[ 2 ] ) ].func(), false, true ),
					"event_result" : text,
					"event_alarms" : "0",
					"priority" : 30 + tokens[ SD_tools._getNumber( match[ 1 ])].priority + tokens[ SD_tools._getNumber( match[ 2 ])].priority
				};
				SD_tools._publicateQuery( {
					query: { date : c.event_startDate, time : true, workTime : SD_tools.workTime },
					callback: function ( res ) {
						c.event_startTime = res.time;
						this.match = match;
						return c;
					}
				} );
			}
		},
		{
			// alarm - | duration + | date + s | time - action_remind
			regExp: /(?:(#prep_\d+).{0,3})?(#date_\d+).+(#dtime_\d+)/gmi,
			extract: function( tokens, match, text ) {
				var c = {
					"event_startDate" : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(),
					"event_duration" : SD_tools._durationCounter( tokens[ SD_tools._getNumber( match[ 2 ] ) ].func(), false, true ),
					"event_result" : text,
					"priority" : 19 + tokens[ SD_tools._getNumber( match[ 1 ])].priority + tokens[ SD_tools._getNumber( match[ 2 ])].priority
				};
				SD_tools._publicateQuery( {
					query: { date : c.event_startDate, time : true, workTime : SD_tools.workTime },
					callback: function ( res ) {
						c.event_startTime = res.time;
						this.match = match;
						return c;
					}
				} );
			}
		},
		{
			// alarm + | duration + | date - | time + s a
			regExp: /(?:(#prep_\d+).{0,3})?(#time_\d+).+?(#actionremind_\d+).+?(#dtime_\d+)/gmi,
			extract: function( tokens, match, text ) {
				var k1 = 1, k2 = '', c = {
					"event_startTime" : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(),
					"event_duration" : SD_tools._durationCounter( tokens[ SD_tools._getNumber( match[ 3 ] ) ].func(), false, true ),
					"event_alarms" : "0",
					"event_result" : text,
					"priority" : 30 + tokens[ SD_tools._getNumber( match[ 1 ])].priority + tokens[ SD_tools._getNumber( match[ 3 ])].priority
				};
				SD_tools._publicateQuery( {
					query: { date : true },
					callback : function( res ) {
						c.event_startDate = res.date;
						this.match = match;
						return c;
					}
				} );
			}
		},
		{
			// alarm - | duration - | date + s a | time + s a hours/mins in night
			regExp: /(?:(#prep_\d+).{0,3})?(#date_\d+)(?:.+(#prep_\d+).{0,3}|.{0,5})(#time_\d+).+(#actionremind_\d+)/gmi,
			extract: function( tokens, match, text ) {
				return {
					"event_startDate" : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(),
					"event_startTime" : tokens[ SD_tools._getNumber( match[ 3 ] ) ].func(),
					"event_alarms" : '0',
					"event_result" : text,
					"priority" : 30 + tokens[ SD_tools._getNumber( match[ 1 ])].priority + tokens[ SD_tools._getNumber( match[ 3 ])].priority
				};
			}
		},
		{
			// alarm + | duration - | date - | time + s just date
			regExp: /(?:(#prep_\d+).{0,3})?(#time_\d+).+?(#actionremind_\d+).{0,20}(#rtime_\d+)/gmi,
			extract: function( tokens, match, text ) {
				var c = {
					"event_startTime" : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(),
					"event_alarms" : tokens[ SD_tools._getNumber( match[ 3 ] ) ].func(),
					"event_result" : text,
					"priority" : 18 + tokens[ SD_tools._getNumber( match[ 1 ])].priority
				};
				SD_tools._publicateQuery( {
					query: { date : true },
					callback : function( res ) {
						c.event_startDate = res.date;
						this.match = match;
						return c;
					}
				} );
			}
		},
		{
			// alarm + e a | duration + | date + | time - s a
			regExp: /(?:(#prep_\d+).{0,3})?(#date_\d+).+?(#dtime_\d+).+?(#actionremind_\d+).{0,5}(#rtime_\d+)/gmi,
			extract: function( tokens, match, text ) {
				var c = {
					"event_startDate" : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(),
					"event_alarms" : tokens[ SD_tools._getNumber( match[ 4 ] ) ].func(),
					"event_duration" : SD_tools._durationCounter( tokens[ SD_tools._getNumber( match[ 2 ] ) ].func(), false, true ),
					"event_result" : text,
					"priority" : 30 + tokens[ SD_tools._getNumber( match[ 1 ])].priority + tokens[ SD_tools._getNumber( match[ 2 ])].priority + tokens[ SD_tools._getNumber( match[ 4 ])].priority
				};
				SD_tools._publicateQuery( {
					query: { date : c.event_startDate, time : true, workTime : SD_tools.workTime },
					callback : function( res ) {
						c.event_startTime = res.time;
						this.match = match;
						return c;
					}
				} );
			}
		},
		{//TODO duration priority
			// alarm - | duration + | date + | time + a r
			regExp: /(?:(#prep_\d+).{0,3})?(#date_\d+).+?(#atime_\d+)/gmi,
			extract: function( tokens, match, text ) {
				return {
					"event_startDate" : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(),
					"event_startTime" : SD_tools.now( + +tokens[ SD_tools._getNumber( match[ 2 ] ) ].func().h * 60 + +tokens[ SD_tools._getNumber( match[ 2 ] ) ].func().m ),
					"event_result" : text,
					"priority" : 31 + tokens[ SD_tools._getNumber( match[ 1 ])].priority + tokens[ SD_tools._getNumber( match[ 2 ])].priority
				};
			}
		},
		{
			// alarm + e a | duration - | date + | time +
			regExp: /(#actionremind_\d+).{0,5}(#rtime_\d+)(?:.+(#prep_\d+).{0,3}|.+?)(#date_\d+)(?:.+(#prep_\d+).{0,3}|.+?)(#time_\d+)/gmi,
			extract: function( tokens, match, text ) {
				return {
					"event_startDate" : tokens[ SD_tools._getNumber( match[ 3 ] ) ].func(),
					"event_startTime" : tokens[ SD_tools._getNumber( match[ 5 ] ) ].func(),
					"event_alarms" : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(),
					"event_result" : text,
					"priority" : 30 + tokens[ SD_tools._getNumber( match[ 1 ])].priority + tokens[ SD_tools._getNumber( match[ 3 ])].priority + tokens[ SD_tools._getNumber( match[ 5 ])].priority
				};
			}
		},
		{//TODO analyze for compl
			// alarm - | duration + a | date + s | time - date from to duration ?wtf
			regExp: /(?:(#prep_\d+).{0,3})?(#date_\d+)(?:.+?(#prep_\d+).{0,3}|.{0,5})(#number_\d+).+?(#dtime_\d+)/gmi,
			extract: function( tokens, match, text ) {
				if ( tokens[ SD_tools._getNumber( match[ 3 ] ) ].func() > 23 ) return;
				return {
					"event_startDate" : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(),
					"event_startTime" : { h : tokens[ SD_tools._getNumber( match[ 3 ] ) ].func(), m : 0 },
					"event_duration" : SD_tools._durationCounter( tokens[ SD_tools._getNumber( match[ 4 ] ) ].func(), false, true ),
					"event_result" : text,
					"priority" : 27 + tokens[ SD_tools._getNumber( match[ 1 ])].priority
				};
			}
		},
		// *** 3 params ***
		// *** 2 params ***
		{//TODO SD_tools.now() for duration
			// alarm - | duration + a | date + s | time - from to duration
			regExp: /(#date_\d+).+?(#to_\d+).{0,3}(#time_\d+)/gmi,
			extract: function( tokens, match, text ) {
				var c = {
					"event_startDate" : tokens[ SD_tools._getNumber( match[ 0 ] ) ].func(),
					"event_result" : text,
					"priority" : 21 + tokens[ SD_tools._getNumber( match[ 0 ])].priority + tokens[ SD_tools._getNumber( match[ 2 ])].priority
				};
				SD_tools._publicateQuery( {
					query: { date : c.event_startDate, time : true, workTime : SD_tools.workTime },
					callback: function ( res ) {
						c.event_startTime = res.time;
						c.event_duration = SD_tools._durationCounter( c.event_startTime, tokens[ SD_tools._getNumber( match[ 2 ] )].func() );
						this.match = match;
						return c;
					}
				} );
			}
		},
		{
			// alarm - | duration + | date + s | time + a action_remind
			regExp: /(#dtime_\d+).+(?:(#prep_\d+).{0,3})?(#date_\d+)/gmi,
			extract: function( tokens, match, text ) {
				var c = {
					"event_startDate" : tokens[ SD_tools._getNumber( match[ 2 ] ) ].func(),
					"event_duration" : SD_tools._durationCounter( tokens[ SD_tools._getNumber( match[ 0 ] ) ].func(), false, true ),
					"event_result" : text,
					"priority" : 30 + tokens[ SD_tools._getNumber( match[ 0 ])].priority + tokens[ SD_tools._getNumber( match[ 2 ])].priority
				};
				SD_tools._publicateQuery( {
					query: { date : c.event_startDate, time : true, workTime : SD_tools.workTime },
					callback: function ( res ) {
						c.event_startTime = res.time;
						this.match = match;
						return c;
					}
				} );
			}
		},
		{//TODO duration priority
			// alarm + e | duration - | date - | time + a r
			regExp: /(#atime_\d+).+(#actionremind_\d+).{0,3}(#rtime_\d+)/gmi,
			extract: function( tokens, match, text ) {
				var t = tokens[ SD_tools._getNumber( match[ 0 ] ) ].func(), c = {
					"event_startTime" : SD_tools.now( +t.h * 60 + t.m, null, false ),
					"event_alarms" : tokens[ SD_tools._getNumber( match[ 2 ] ) ].func(),
					"event_result" : text,
					"priority" : 20 + tokens[ SD_tools._getNumber( match[ 0 ])].priority + tokens[ SD_tools._getNumber( match[ 2 ])].priority
				};
				SD_tools._publicateQuery( {
					query: { date : true},
					callback: function ( res ) {
						c.event_startDate = res.date;
						this.match = match;
						return c;
					}
				} );
			}
		},
		{//TODO duration priority
			// alarm + e | duration - | date - | time + a r
			regExp: /(#atime_\d+).+(#actionremind_\d+)/gmi,
			extract: function( tokens, match, text ) {
				var t = tokens[ SD_tools._getNumber( match[ 0 ] ) ].func(), c = {
					"event_startTime" : SD_tools.now( +t.h * 60 + +t.m, null, false ),
					"event_alarms" : '0',
					"event_result" : text,
					"priority" : 20 + tokens[ SD_tools._getNumber( match[ 0 ])].priority
				};
				SD_tools._publicateQuery( {
					query: { date : true},
					callback: function ( res ) {
						c.event_startDate = res.date;
						this.match = match;
						return c;
					}
				} );
			}
		},
		{//TODO duration priority
			// alarm + e | duration - | date - | time + a r
			regExp: /(#actionremind_\d+).+?(#atime_\d+)/gmi,
			extract: function( tokens, match, text ) {
				var t = tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(), c = {
					"event_startTime" : { h : +SD_tools.now( +t.h * 60 + +t.m, 'h'), m : +SD_tools.now( +t.h * 60 + +t.m, 'm'), duplicity: false },
					"event_alarms" : '0',
					"event_result" : text,
					"priority" : 20 + tokens[ SD_tools._getNumber( match[ 1 ])].priority
				};
				SD_tools._publicateQuery( {
					query: { date : true},
					callback: function ( res ) {
						c.event_startDate = res.date;
						this.match = match;
						return c;
					}
				} );
			}
		},
		{//TODO duration priority
			// alarm - | duration + | date - | time + a r
			regExp: /(#atime_\d+).+(#dtime_\d+)/gmi,
			extract: function( tokens, match, text ) {
				var k1 = 1, k2= '', c = {
					"event_startTime" : { h : +SD_tools.now( 0, 'h') + +tokens[ SD_tools._getNumber( match[ 0 ] ) ].func().h, m : +SD_tools.now( 0, 'm') + +tokens[ SD_tools._getNumber( match[ 0 ] ) ].func().m },
					"event_duration" : SD_tools._durationCounter( tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(), false, true ),
					"event_result" : text,
					"priority" : 20 + tokens[ SD_tools._getNumber( match[ 0 ])].priority + tokens[ SD_tools._getNumber( match[ 1 ])].priority
				};
				SD_tools._publicateQuery( {
					query: { date : true},
					callback: function ( res ) {
						c.event_startDate = res.date;
						this.match = match;
						return c;
					}
				} );
			}
		},
		{
			// alarm + e a | duration - | date - | time + s a
			regExp: /(?:(#prep_\d+).{0,3})?(#time_\d+).+(#actionremind_\d+).{0,5}(#rtime_\d+)/gmi,
			extract: function( tokens, match, text ) {
				var k1 = 1, k2 = '', c = {
					"event_startTime" : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(),
					"event_alarms" : tokens[ SD_tools._getNumber( match[ 3 ] ) ].func(),
					"event_result" : text,
					"priority" : 20 + tokens[ SD_tools._getNumber( match[ 1 ])].priority + tokens[ SD_tools._getNumber( match[ 3 ])].priority
				};
				SD_tools._publicateQuery( {
					query: { date : true },
					callback : function( res ) {
						c.event_startDate = res.date;
						this.match = match;
						return c;
					}
				} );
			}
		},
		{
			// alarm - | duration + | date - | time + s a
			regExp: /(?:(#prep_\d+).{0,3})?(#time_\d+).*(#dtime_\d+)/gmi,
			extract: function( tokens, match, text ) {
				var k1 = 1, k2 = '', c = {
					"event_startTime" : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(),
					"event_duration" : SD_tools._durationCounter( tokens[ SD_tools._getNumber( match[ 2 ] ) ].func(), false, true ),
					"event_result" : text,
					"priority" : 20 + tokens[ SD_tools._getNumber( match[ 1 ])].priority + tokens[ SD_tools._getNumber( match[ 2 ])].priority
				};
				SD_tools._publicateQuery( {
					query: { date : true },
					callback : function( res ) {
						c.event_startDate = res.date;
						this.match = match;
						return c;
					}
				} );
			}
		},
		{
			// alarm + e a | duration - | date + | time - s a
			regExp: /(?:(#prep_\d+).{0,3})?(#date_\d+)(?:.|\n){0,150}(#actionremind_\d+).{0,5}(#rtime_\d+)/gmi,
			extract: function( tokens, match, text ) {
				var c = {
					"event_startDate" : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(),
					"event_alarms" : tokens[ SD_tools._getNumber( match[ 3 ] ) ].func(),
					"event_result" : text,
					"priority" : 20 + tokens[ SD_tools._getNumber( match[ 1 ])].priority + tokens[ SD_tools._getNumber( match[ 3 ])].priority
				};
				SD_tools._publicateQuery( {
					query: { date : c.event_startDate, time : true, workTime : SD_tools.workTime },
					callback : function( res ) {
						c.event_startTime = res.time;
						this.match = match;
						return c;
					}
				} );
			}
		},
		{
			// alarm + e a | duration - | date - | time - s a
			regExp: /(#rtime_\d+).{0,5}(#actionremind_\d+)(?:.+(#prep_\d+).{0,3}|.+?)(#date_\d+)/gmi,
			extract: function( tokens, match, text ) {
				var c = {
					"event_startDate" : tokens[ SD_tools._getNumber( match[ 3 ] ) ].func(),
					"event_alarms" : tokens[ SD_tools._getNumber( match[ 0 ] ) ].func(),
					"event_result" : text,
					"priority" : 20 + tokens[ SD_tools._getNumber( match[ 0 ])].priority + tokens[ SD_tools._getNumber( match[ 3 ])].priority
				};
				SD_tools._publicateQuery( {
					query: { date : c.event_startDate, time : true, workTime : SD_tools.workTime },
					callback : function( res ) {
						c.event_startTime = res.time;
						this.match = match;
						return c;
					}
				} );
			}
		},
		{
			// alarm + e a | duration - | date - | time - s a
			regExp: /(#actionremind_\d+).{0,5}(#rtime_\d+)(?:.+(#prep_\d+).{0,3}|.+?)(#date_\d+)/gmi,
			extract: function( tokens, match, text ) {
				var c = {
					"event_startDate" : tokens[ SD_tools._getNumber( match[ 3 ] ) ].func(),
					"event_alarms" : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(),
					"event_result" : text,
					"priority" : 20 + tokens[ SD_tools._getNumber( match[ 1 ])].priority + tokens[ SD_tools._getNumber( match[ 3 ])].priority
				};
				SD_tools._publicateQuery( {
					query: { date : c.event_startDate, time : true, workTime : SD_tools.workTime },
					callback : function( res ) {
						c.event_startTime = res.time;
						this.match = match;
						return c;
					}
				} );
			}
		},
		{
			// alarm + e a | duration - | date - | time + s a
			regExp: /(?:(#prep_\d+).{0,3})?(#number_\d+).+(#actionremind_\d+).{0,5}(#rtime_\d+)/gmi,
			extract: function( tokens, match, text ) {
				var c = {
					"event_startTime" : { h : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(), m : 0 },
					"event_alarms" : tokens[ SD_tools._getNumber( match[ 3 ] ) ].func(),
					"event_result" : text,
					"priority" : 20 + tokens[ SD_tools._getNumber( match[ 3 ])].priority
				};
				SD_tools._publicateQuery( {
					query: { date : true },
					callback : function( res ) {
						c.event_startDate = res.date;
						this.match = match;
						return c;
					}
				} );
			}
		},
		{//todo number as 'час'
			// alarm + e a | duration - | date + s a | time - action_remind
			regExp: /(?:(#prep_\d+).{0,3})?(#date_\d+).+(#actionremind_\d+).{0,3}(#rtime_\d+)/gmi,
			extract: function( tokens, match, text ) {
				var c = {
					"event_startDate" : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(),
					"event_alarms" : tokens[ SD_tools._getNumber( match[ 3 ] ) ].func(),
					"event_result" : text,
					"priority" : 20 + tokens[ SD_tools._getNumber( match[ 1 ])].priority + tokens[ SD_tools._getNumber( match[ 3 ])].priority
				};
				SD_tools._publicateQuery( {
					query: { date : c.event_startDate, time : true, workTime : SD_tools.workTime },
					callback : function( res ) {
						c.event_startTime = res.time;
						this.match = match;
						return c;
					}
				} );
			}
		},
		{
			// alarm - | duration - | date + s | time + index
			regExp: /(#actionremind_\d+)(?:.+(#prep_\d+).{0,3}|.{0,5})(#number_\d+)(?:.+(#prep_\d+).{0,3}|.{0,5})(#date_\d+)/gmi,
			extract: function( tokens, match, text ) {
				var k1 = 1, k2= '', c = {
					"event_startDate" :  tokens[ SD_tools._getNumber( match[ 4 ] ) ].func(),
					"event_startTime" : { h : tokens[ SD_tools._getNumber( match[ 2 ] ) ].func(), m : 0 },
					"event_result" : text,
					"priority" : 20 + tokens[ SD_tools._getNumber( match[ 4 ])].priority
				};
				SD_tools._publicateQuery( {
					query: { date : c.event_startDate, time : true, workTime : SD_tools.workTime },
					callback : function( res ) {
						c.event_startTime = res.time;
						this.match = match;
						return c;
					}
				} );
			}
		},
		{
			// alarm + e | duration - | date + | time - date type XX month XX year
			regExp: /(?:(#prep_\d+).{0,3})?(#date_\d+).{0,5}(#actionremind_\d+)(?:.+?(#prep_\d+).{0,3}|.{0,5})(#number_\d+)/gmi,
			extract: function( tokens, match, text ) {
				var k1 = 1, k2 = '', c = {
					"event_startDate" : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(),
					"event_startTime" : { h : tokens[ SD_tools._getNumber( match[ 4 ] ) ].func(), m : 0 },
					"event_result" : text,
					"priority" : 20 + tokens[ SD_tools._getNumber( match[ 1 ])].priority
				};
				SD_tools._publicateQuery( {
					query: { date : c.event_startDate, time : true, workTime : SD_tools.workTime },
					callback : function( res ) {
						c.event_startTime = res.time;
						this.match = match;
						return c;
					}
				} );
			}
		},
		{
			// alarm + | duration - | date - | time + s just date
			regExp: /(?:(#prep_\d+).{0,3})?(#time_\d+).+?(#actionremind_\d+)/gmi,
			extract: function( tokens, match, text ) {
				var c = {
					"event_startTime" : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(),
					"event_alarms" : '0',
					"event_result" : text,
					"priority" : 18 + tokens[ SD_tools._getNumber( match[ 1 ])].priority
				};
				SD_tools._publicateQuery( {
					query: { date : true },
					callback : function( res ) {
						c.event_startDate = res.date;
						this.match = match;
						return c;
					}
				} );
			}
		},
		{
			// alarm + | duration - | date - | time + a
			regExp: /(#actionremind_\d+)(?:.+(#prep_\d+).{0,3}|.{0,5})(#time_\d+)/gmi,
			extract: function( tokens, match, text ) {
				var c = {
					"event_startTime" : tokens[ SD_tools._getNumber( match[ 2 ] ) ].func(),
					"event_alarms" : '0',
					"event_result" : text,
					"priority" : 18 + tokens[ SD_tools._getNumber( match[ 2 ])].priority
				};
				SD_tools._publicateQuery( {
					query: { date : true },
					callback : function( res ) {
						c.event_startDate = res.date;
						this.match = match;
						return c;
					}
				} );
			}
		},
		{
			// alarm + | duration - | date + a r | time - in next month
			regExp: /(?:(#prep_\d+).{0,5})?(#date_\d+).+(#actionremind_\d+)/gmi,
			extract: function( tokens, match, text ) {
				var c = {
					"event_startDate" : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(),
					"event_alarms" : '0',
					"event_result" : text,
					"priority" : 18 + tokens[ SD_tools._getNumber( match[ 1 ])].priority
				};
				SD_tools._publicateQuery( {
					query: { date : c.event_startDate, time : true, workTime : SD_tools.workTime },
					callback : function( res ) {
						c.event_startTime= res.time;
						this.match = match;
						return c;
					}
				} );
			}
		},
		{
			// alarm + | duration - | date + s | time - date type XX month XX year
			regExp: /(#actionremind_\d+).+?(?:.{0,5}(#prep_\d+).{0,5}|.{0,5})(#date_\d+)/gmi,
			extract: function( tokens, match, text ) {
				var c = {
					"event_startDate" : tokens[ SD_tools._getNumber( match[ 2 ] ) ].func(),
					"event_alarms" : "0",
					"event_result" : text,
					"priority" : 18 + tokens[ SD_tools._getNumber( match[ 2 ])].priority
				};
				SD_tools._publicateQuery( {
					query: { date : c.event_startDate, time : true, workTime : SD_tools.workTime },
					callback : function( res ) {
						c.event_startTime = res.time;
						this.match = match;
						return c;
					}
				} );
			}
		},
		/*{
		 // alarm - | duration - | date + s a | time + s a hours/mins in night
		 regExp: /(?:(#prep_\d+).{0,3})?(#date_\d+)(?:[^#]+?(#prep_\d+).{0,3}|[^#]+?)(#time_\d+)/gmi,
		 extract: function( tokens, match, text ) {
		 var c = {
		 "event_startDate" : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(),
		 "event_startTime" : tokens[ SD_tools._getNumber( match[ 3 ] ) ].func(),
		 "event_result" : text,
		 "priority" : 20 + tokens[ SD_tools._getNumber( match[ 1 ])].priority + tokens[ SD_tools._getNumber( match[ 3 ])].priority
		 };
		 return c;
		 }
		 },*/
		{
			// alarm - | duration - | date + s a | time + s a hours/mins in night
			regExp: /(?:(#prep_\d+).{0,3})?(#date_\d+)(?:.+?(#prep_\d+).{0,3}|.+?)(#time_\d+)/gmi,
			extract: function( tokens, match, text ) {
				var c = {
					"event_startDate" : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(),
					"event_startTime" : tokens[ SD_tools._getNumber( match[ 3 ] ) ].func(),
					"event_result" : text,
					"priority" : 20 + tokens[ SD_tools._getNumber( match[ 1 ])].priority + tokens[ SD_tools._getNumber( match[ 3 ])].priority
				};
				return c;
			}
		},
		{
			// alarm - | duration - | date + s a | time + s a hours/mins in night
			regExp: /(?:(#prep_\d+).{0,3})?(#time_\d+)(?:.+(#prep_\d+).{0,3}|.{0,5})(#date_\d+)/gmi,
			extract: function( tokens, match, text ) {
				return {
					"event_startDate" : tokens[ SD_tools._getNumber( match[ 3 ] ) ].func(),
					"event_startTime" : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(),
					"event_result" : text,
					"priority" : 20 + tokens[ SD_tools._getNumber( match[ 1 ])].priority + tokens[ SD_tools._getNumber( match[ 3 ])].priority
				};
			}
		},
		{//TODO duration counts incorrectly
			// alarm - | duration + s | date - | time + s from to duration
			regExp: /(#prep_\d+).{0,3}(#time_\d+)(.?[-].?)(#time_\d+)/gmi,
			extract: function( tokens, match, text ) {
				var c = {
					"event_startTime" : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func().replace( /(:.+)/gmi, '' ),
					"event_result" : text,
					"priority" : 20 + tokens[ SD_tools._getNumber( match[ 1 ])].priority
				};
				c.event_duration = SD_tools._durationCounter( tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(), tokens[ SD_tools._getNumber( match[ 2 ] ) ].func() );
				SD_tools._publicateQuery( {
					query: { date : true },
					callback : function( res ) {
						c.event_startDate = res.date;
						this.match = match;
						return c;
					}
				} );
			}
		},
		{//TODO smth's wrong here
			// alarm - | duration + s a | date - | time + s  from to duration
			regExp: /(#from_\d+|#prep_\d+).{0,3}(#time_\d+).+?(#to_\d+).{0,3}(#time_\d+)/gmi,
			extract: function( tokens, match, text ) {
				var c = {
					"event_startTime" : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(),
					"event_duration" : SD_tools._durationCounter( tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(), tokens[ SD_tools._getNumber( match[ 3 ] ) ].func() ),
					"event_result" : text,
					"priority" : 20 + tokens[ SD_tools._getNumber( match[ 1 ])].priority + tokens[ SD_tools._getNumber( match[ 3 ])].priority
				};
				SD_tools._publicateQuery( {
					query: { date : true },
					callback : function( res ) {
						c.event_startDate = res.date;
						this.match = match;
						return c;
					}
				} );
			}
		},
		{//TODO smth's wrong here
			// alarm - | duration + s a | date - | time + s  from to duration
			regExp: /(#from_\d+).{0,3}(#number_\d+).{0,3}(#to_\d+).{0,3}(#time_\d+)/gmi,
			extract: function( tokens, match, text ) {
				var c = {
					"event_startTime" : { h : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func() , m : 0 },
					"event_result" : text,
					"priority" : 18 + tokens[ SD_tools._getNumber( match[ 3 ])].priority
				};
				c.event_duration = SD_tools._durationCounter( +tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(), tokens[ SD_tools._getNumber( match[ 3 ] ) ].func() );
				SD_tools._publicateQuery( {
					query: { date : true },
					callback : function( res ) {
						c.event_startDate = res.date;
						this.match = match;
						return c;
					}
				} );
			}
		},
		{//TODO smth's wrong here
			// alarm - | duration + s a | date - | time + s  from to duration
			regExp: /(#from_\d+).{0,3}(#number_\d+).{0,3}(#to_\d+).{0,3}(#number_\d+)/gmi,
			extract: function( tokens, match, text ) {
				var c = {
					"event_startTime" : { h : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(), m: 0 },
					"event_result" : text,
					"priority" : 20
				};
				c.event_duration = SD_tools._durationCounter( +tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(), tokens[ SD_tools._getNumber( match[ 3 ] ) ].func() );
				SD_tools._publicateQuery( {
					query: { date : true },
					callback : function( res ) {
						c.event_startDate = res.date;
						this.match = match;
						return c;
					}
				} );
			}
		},
		{//TODO analyze for compl
			// alarm - | duration + a | date + s | time - date from to duration ?wtf
			regExp: /(?:(#prep_\d+).{0,3})?(#date_\d+)(?:.+?(#prep_\d+).{0,3}|.{0,5})(#number_\d+)/gmi,
			extract: function( tokens, match, text ) {
				if ( tokens[ SD_tools._getNumber( match[ 3 ] ) ].func() > 23 ) return;
				return {
					"event_startDate" : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(),
					"event_startTime" : { h : tokens[ SD_tools._getNumber( match[ 3 ] ) ].func(), m : 0 },
					"event_result" : text,
					"priority" : 17 + tokens[ SD_tools._getNumber( match[ 1 ])].priority
				};
			}
		},
		{//TODO analyze for compl
			// alarm - | duration + a | date + s | time - date from to duration ?wtf
			regExp: /(#date_\d+).+?(#to_\d+).{0,3}(#number_\d+)/gmi,
			extract: function( tokens, match, text ) {
				if ( tokens[ SD_tools._getNumber( match[ 2 ] ) ].func() > 23 ) return;
				var c = {
					"event_startDate" : tokens[ SD_tools._getNumber( match[ 0 ] ) ].func(),
					"event_duration" : SD_tools._durationCounter( false, +tokens[ SD_tools._getNumber( match[ 2 ] ) ].func() ),
					"event_result" : text,
					"priority" : 17 + tokens[ SD_tools._getNumber( match[ 0 ])].priority
				};
				SD_tools._publicateQuery( {
					query: { date : c.event_startDate, time : true, workTime : SD_tools.workTime },
					callback : function( res ) {
						c.event_startTime = res.time;
						this.match = match;
						return c;
					}
				} );
			}
		},
		{
			// alarm - | duration - a | date + s | time + in duration date ?wtf
			regExp: /(#prep_\d+).{0,3}(#number_\d+).{0,3}(#date_\d+)/gmi,
			extract: function( tokens, match, text ) {
				return {
					"event_startDate" : tokens[SD_tools._getNumber(match[ 2 ])].func(),
					"event_startTime" : { h : tokens[SD_tools._getNumber(match[ 1 ])].func(), m : 0 },
					"event_result": text,
					"priority" : 20 + tokens[ SD_tools._getNumber( match[ 2 ])].priority
				};
			}
		},
		{//TODO duration priority
			// alarm - | duration + | date - | time + a r
			regExp: /(#atime_\d+).+?(#dtime_\d+)/gmi,
			extract: function( tokens, match, text ) {
				var k1 = 1, k2= '', c = {
					"event_startTime" : SD_tools.now( + +tokens[ SD_tools._getNumber( match[ 0 ] ) ].func().h * 60 + +tokens[ SD_tools._getNumber( match[ 0 ] ) ].func().m ),
					"event_result" : text,
					"event_duration" : SD_tools._durationCounter( tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(), false, true ),
					"priority" : 11 + tokens[ SD_tools._getNumber( match[ 0 ])].priority + tokens[ SD_tools._getNumber( match[ 1 ])].priority
				};
				SD_tools._publicateQuery( {
					query: { date : true },
					callback: function ( res ) {
						c.event_startDate = res.date;
						this.match = match;
						return c;
					}
				} );
			}
		},
		{//TODO same
			// alarm - | duration - | date - | time + a r
			regExp: /(#prep_\d+).{0,5}(#number_\d+).{0,5}(#dtime_\d+)/gmi,
			extract: function( tokens, match, text ) {
				if ( tokens[ SD_tools._getNumber( match[ 1 ] ) ].func() > 23 ) return;
				var c = {
					"event_startTime" : { h : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(), m : 0 },
					"event_result" : text,
					"event_duration" : SD_tools._durationCounter( tokens[ SD_tools._getNumber( match[ 2 ] ) ].func(), false, true ),
					"priority" : 16 + tokens[ SD_tools._getNumber( match[ 2 ])].priority
				};
				SD_tools._publicateQuery( {
					query: { date : true },
					callback : function( res ) {
						c.event_startDate = res.date;
						this.match = match;
						return c;
					}
				} );
			}
		},
		{
			// alarm + e a | duration + | date + | time - s a
			regExp: /(#actionremind_\d+).+?(#dtime_\d+)/gmi,
			extract: function( tokens, match, text ) {
				var c = {
					"event_startTime" : SD_tools.now( + +tokens[ SD_tools._getNumber( match[ 1 ] ) ].func().h * 60 + +tokens[ SD_tools._getNumber( match[ 1 ] ) ].func().m ),
					"event_alarms" : '0',
					"event_result" : text,
					"priority" : 20 + tokens[ SD_tools._getNumber( match[ 1 ])].priority
				};
				SD_tools._publicateQuery( {
					query: { date : true },
					callback : function( res ) {
						c.event_startDate = res.date;
						this.match = match;
						return c;
					}
				} );
			}
		},
		//{
		//	// alarm - | duration - a | date + s | time + in duration date ?wtf
		//	regExp: /(#date_\d+).{0,3}(#prep_\d+).{0,3}(#number_\d+)/gmi,
		//	extract: function( tokens, match, text ) {
		//		return {
		//			"event_startDate" : tokens[SD_tools._getNumber(match[ 0 ])].func(),
		//			"event_startTime" : { h : tokens[SD_tools._getNumber(match[ 2 ])].func(), m : 0, duplicity : tokens[SD_tools._getNumber(match[ 2 ])].func() < 12 && true },
		//			"event_result": text,
		//			"priority" : 20 + tokens[ SD_tools._getNumber( match[ 0 ])].priority
		//		};
		//	}
		//},
		// *** 2 params end ***
		// *** 1 param ***
		/*{
		 // alarm + e| duration - | date - | time - index
		 regExp: /(#actionremind_\d+).{0,5}(#rtime_\d+)/gmi,
		 extract: function( tokens, match, text ) {
		 var c = {
		 "event_alarms" : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(),
		 "event_result" : text,
		 "priority" : 10 + tokens[ SD_tools._getNumber( match[ 1 ])].priority
		 };
		 SD_tools._publicateQuery( {
		 query: { date : true, time : true },
		 callback : function( res ) {
		 c.event_startDate = res.date;
		 c.event_startTime = res.time;
		 this.match = match;
		 return c;
		 }
		 } );
		 }
		 },*/
		{
			// alarm - | duration - | date - | time + index
			regExp: /(#prep_\d+).{0,3}(#time_\d+)/gmi,
			extract: function( tokens, match, text ) {
				var c = {
					"event_startTime" : tokens[ SD_tools._getNumber( match[ 1 ] )].func(),
					"event_result" : text,
					"priority" : 10 + tokens[ SD_tools._getNumber( match[ 1 ])].priority
				};
				SD_tools._publicateQuery( {
					query: { date : true },
					callback : function( res ) {
						c.event_startDate = res.date;
						this.match = match;
						return c;
					}
				} );
			}
		},
		{
			// alarm - | duration - | date - | time + index
			regExp: /(?:(#prep_\d+|#before_\d+).{0,3})?(#date_\d+)/gmi,
			extract: function( tokens, match, text ) {
				var c = {
					"event_startDate" : tokens[ SD_tools._getNumber( match[ 1 ] )].func(),
					"event_result" : text,
					"priority" : 10 + tokens[ SD_tools._getNumber( match[ 1 ])].priority
				};
				SD_tools._publicateQuery( {
					query: { date : c.event_startDate, time : true, workTime : SD_tools.workTime },
					callback : function( res ) {
						c.event_startTime = res.time;
						this.match = match;
						return c;
					}
				} );
			}
		},
		{//TODO duration priority
			// alarm - | duration + | date - | time + a r
			regExp: /(#atime_\d+)/gmi,
			extract: function( tokens, match, text ) {
				var t = tokens[ SD_tools._getNumber( match[ 0 ] ) ].func(), c = {
					"event_startTime" : { h : +SD_tools.now( +t.h * 60 + +t.m, 'h' ), m : +SD_tools.now( +t.h * 60 + +t.m, 'm' ), duplicity: false },
					"event_result" : text,
					"priority" : 11 + tokens[ SD_tools._getNumber( match[ 0 ])].priority
				};
				if ( tokens[ SD_tools._getNumber( match[ 0 ] ) ].func().duplicity === false ) c.event_startTime.duplicity = false;
				SD_tools._publicateQuery( {
					query: { date : true },
					callback: function ( res ) {
						c.event_startDate = res.date;
						this.match = match;
						return c;
					}
				} );
			}
		},
		{//TODO could be anything
			// alarm - | duration - | date - | time + a r
			regExp: /(#after_\d+).{0,5}(#number_\d+).{0,5}(#number_\d+)/gmi,
			extract: function( tokens, match, text ) {
				var c = {
					"event_startTime" : { h : SD_tools.now( +tokens[ SD_tools._getNumber( match[ 1 ] ) ].func() * 60 + +tokens[ SD_tools._getNumber( match[ 2 ] ) ].func(), 'h' ), m : SD_tools.now( +tokens[ SD_tools._getNumber( match[ 1 ] ) ].func() * 60 + +tokens[ SD_tools._getNumber( match[ 2 ] ) ].func(), 'm' ) },
					"event_result" : text,
					"priority" : 10
				};
				SD_tools._publicateQuery( {
					query: { date : true },
					callback : function( res ) {
						c.event_startDate = res.date;
						this.match = match;
						return c;
					}
				} );
			}
		},
		{//TODO same
			// alarm - | duration - | date - | time + a r
			regExp: /(#after_\d+).{0,5}(#number_\d+)/gmi,
			extract: function( tokens, match, text ) {
				var c = {
					"event_startTime" : {},
					"event_result" : text,
					"priority" : 10
				};
				if ( tokens[ SD_tools._getNumber( match[ 1 ] ) ].origin.match( /ч/gmi ) ) {
					c.event_startTime.h = SD_tools.now ( tokens[ SD_tools._getNumber( match[ 1 ] ) ].func()*60, 'h' );
					c.event_startTime.m = SD_tools.now ( tokens[ SD_tools._getNumber( match[ 1 ] ) ].func()*60, 'm' );
				} else {
					c.event_startTime.h = SD_tools.now ( tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(), 'h' );
					c.event_startTime.m = SD_tools.now ( tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(), 'm' );
					c.event_startTime.duplicity = false
				}
				SD_tools._publicateQuery( {
					query: { date : true },
					callback : function( res ) {
						c.event_startDate = res.date;
						this.match = match;
						return c;
					}
				} );
			}
		},
		{//TODO same
			// alarm - | duration - | date - | time + a r
			regExp: /(#prep_\d+).{0,5}(#number_\d+).+?(#dtime_\d+)/gmi,
			extract: function( tokens, match, text ) {
				if ( tokens[ SD_tools._getNumber( match[ 1 ] ) ].func() > 23 ) return;
				var c = {
					"event_startTime" : { h : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(), m : 0 },
					"event_duration" : SD_tools._durationCounter( tokens[ SD_tools._getNumber( match[ 2 ] ) ].func(), false, true ),
					"event_result" : text,
					"priority" : 6 + tokens[ SD_tools._getNumber( match[ 2 ])].priority
				};
				SD_tools._publicateQuery( {
					query: { date : true },
					callback : function( res ) {
						c.event_startDate = res.date;
						this.match = match;
						return c;
					}
				} );
			}
		},
		{//TODO same
			// alarm - | duration - | date - | time + a r
			regExp: /(#prep_\d+).{0,5}(#number_\d+)/gmi,
			extract: function( tokens, match, text ) {
				if ( tokens[ SD_tools._getNumber( match[ 1 ] ) ].func() > 23 ) return;
				var c = {
					"event_startTime" : { h : tokens[ SD_tools._getNumber( match[ 1 ] ) ].func(), m : 0 },
					"event_result" : text,
					"priority" : 6
				};
				SD_tools._publicateQuery( {
					query: { date : true },
					callback : function( res ) {
						c.event_startDate = res.date;
						this.match = match;
						return c;
					}
				} );
			}
		},
		{//TODO same
			// alarm - | duration - | date - | time + a r
			regExp: /(#dtime_\d+)/gmi,
			extract: function( tokens, match, text ) {
				var c = {
					"event_duration" : SD_tools._durationCounter( tokens[ SD_tools._getNumber( match[ 0 ] ) ].func(), false, true ),
					"event_result" : text,
					"priority" : 1
				};
				SD_tools._publicateQuery( {
					query: { date : true, time : true },
					callback : function( res ) {
						c.event_startDate = res.date;
						c.event_startTime = res.time;
						this.match = match;
						return c;
					}
				} );
			}
		}
	];


	/**
	 * @author Kadyrov Albert <fluffy1snow@gmail.com>
	 * @module SmartDate
	 */

	var


		_fakeModel = function ( res ) {
			for ( var i = 0, dof, d, p = res; i < res.length; i++ ) {
				if ( p[ i ].query.time && p[ i ].query.date && ( typeof( p[ i ].query.date ) === 'string' ) ) {
					if ( p[ i ].query.workTime ) {
						while ( p[ i ].query.workTime[ weekdays[ ( ( ( new Date( p[ i ].query.date ) ).getDay() ) ) ] ] === '-' ) {
							d = ( new Date( p[ i ].query.date.replace( /-/g, '/') ) );
							dof = new Date ( d.setDate( new Date( d.getDate() + 1 ) ));
							p[ i ].query.date = SD_tools.setFullDate( dof.getDate(), dof.getMonth(), +( dof.getFullYear().toString() ).slice( -2 ) );
						}
						p[ i ].query.time = { h : +( p[ i ].query.workTime[ weekdays[ ( new Date( p[ i ].query.date.replace( /-/g, '/' ) ) ).getDay() ] ].match( /(.+?):/ ) ? p[ i ].query.workTime[ weekdays[ ( ( ( new Date( p[ i ].query.date.replace( /-/g, '/' ) ) ).getDay() ) ) ] ].match( /(.+?):/ )[ 1 ] : 9 ), m : 0, duplicity: false };
					} else p[ i ].query.time = { h : SD_tools.now( 0, 'h' ), m : SD_tools.now( 0, 'm' ), duplicity: false };
				} else if ( p[ i ].query.time ) p[ i ].query.time = { h : 9, m : 0, duplicity: false };
				if ( p[ i ].query.date ) p[ i ].query.date = SD_tools.today();
			}
			return res;
		}
		, retoken = /#.+?_(\d+)/
		, _l
		, _retokenize = function ( tokens, text ) {
			while( _l = retoken.exec( text ) ) {
				text = text.replace( _l[ 0 ], tokens[ _l[ 1 ]].origin );
			}
			return text;
		}
		, _checkCharReg = /[^.:?,]/
		, _checkChar = function( a ) {
			if ( !a ) return '';
			if ( _checkCharReg.exec( a ) ) { return a } else return '';
		}
		, _clean = function ( text, matched, tokens ) {

			for ( var i = 0; i < matched.length; i++ ) {

				if ( matched[ i ] ) {
					var r = new RegExp( '(..|.)?(.|^)(' + matched[i] + ')(.|$)(..|.)?' , 'gmi');

					text = text.replace( r, function( match, p1, p2, p3, p4, p5 ) {
						var ch1, ch2, ch3 = p2, ch4 = p4, ch5, ch6;
						if ( p1 && p1.length > 1 ) {
							ch1 = p1.slice(0, 1); ch2 = p1.slice(1, 2);
						} else ch2 = p1;
						if ( p5 && p5.length > 1 ) {
							ch5 = p5.slice( -2, -1); ch6 = p5.slice( -1 );
						} else ch5 = p5;
						if ( ch2 && ch2.match( /-|—/ ) ) {
							if ( ch5 && ch5.match( /-|—/ ) ) {
								return '';
							} else if ( ch4 && ch4.match( /,/ ) ) {
								if ( ch5 ) {
									return _checkChar( ch1 ) + ch4 + ( ch5 || '' ) + _checkChar( ch6 );
								} else {
									return _checkChar( ch1 ) + ( ch5 || '' ) + _checkChar( ch6 );
								}
							} else if ( ch4 && ch4.match( /[\.!?\)]/ ) ) {
								if ( ch5 ) {
									return ( ch4 || '') + ( ch5 || '' ) + _checkChar( ch6 );
								} else return ( ch4 || '');
							} else return ( ch4 || '' ) + ( ch5 || '' ) + _checkChar( ch6 );
						} else if ( ch3 && ch3.match( /\s/ ) ) {

							if ( ch5 && ch5.match( /-|—/ ) ) {
								if ( ch2 && ch2.match(/[\.!?]/)) {
									return _checkChar( ch1 ) + ( ch2 || '' ) + ( ch3 || '' );
								} else if ( ch2 && ch2.match(/,/)) {
									return _checkChar( ch1 ) + _checkChar( ch6 );
								} else return _checkChar( ch1 ) + ( ch2 || '' ) + ( ch3 || '' );
							} else if ( ch4 && ch4.match( /\s/ ) )	{
								return _checkChar( ch1 ) + ( ch2 || '' ) + ch3 + ( ch5 || '' ) + _checkChar( ch6 );
							} else if ( ch4 && ch4.match ( /,/ ) ) {
								if ( ch5 ) {
									if ( ch2 && ch2.match( /\./ ) ) {
										return _checkChar( ch1 ) + ( ch2 || '' ) + _checkChar( ch6 );
									} else return _checkChar( ch1 ) + ( ch2 || '' ) + ch4 +( ch5 || '' ) + _checkChar( ch6 );
								} else {
									return _checkChar( ch1 ) + ( ch2 || '' ) + ch3 + ( ch5 || '' ) + _checkChar( ch6 );
								}
							} else if ( ch4 && ch4.match ( /:/ ) ) {
								if ( ch5 && ch5.match( /\s/ ) ) {
									return _checkChar( ch1 ) + ( ch2 || '' ) + ch5 + _checkChar( ch6 );
								} else return _checkChar( ch1 ) + ( ch2 || '' ) + ( ch5 || '' ) + _checkChar( ch6 );
							} else if ( ch4 && ch4.match( /[\.!?\)]/ ) ) {
								if ( ch2 && ch2.match( /[\.!?]/ ) ) {
									return _checkChar( ch1 ) + ( ch2 || '' ) + ( ch5 || '' ) + _checkChar( ch6 );
								} else if ( ch2 && ch2.match ( /,/ ) ) {
									if ( ch5 ) {
										return _checkChar( ch1 ) + ( ch4 || '') + ( ch5 || '' ) + _checkChar( ch6 );
									} else return _checkChar( ch1 ) + ( ch4 || '') + _checkChar( ch6 );
								} else return _checkChar( ch1 ) + ( ch2 || '' ) + ch4 + ( ch5 || '' ) + _checkChar( ch6 );
							} else if ( ch4 && ch4.match( /#/ ) ) {
								return _checkChar( ch1 ) + ( ch2 || '' ) + ( ch4 || '' )+ ( ch5 || '' ) + _checkChar( ch6 );
							} else if ( !( ch4 && ch5 ) ) {
								if (ch2 && ch2.match(/,/)) {
									return _checkChar( ch1 ) + _checkChar( ch6 );
								} else return _checkChar( ch1 ) + ( ch2 || '' ) + _checkChar( ch6 );
							} else {
								return _checkChar( ch1 ) + ( ch2 || '' ) + ( ch3 || '' ) + ( ch5 || '' ) + _checkChar( ch6 );
							}
						} else if ( ch3 && ch3.match( /,/ ) ) {

							if ( ch4.match( /\s/ ) ) {
								return _checkChar( ch1 ) + ( ch2 || '' ) + ch3 + ( ch5 || '' ) + _checkChar( ch6 );
							} else if ( ch4 && ch4.match ( /,/ ) ) {
								return _checkChar( ch1 ) + ( ch2 || '' ) + ch3 + ( ch5 || '' ) + _checkChar( ch6 );
							} else if ( ch4 && ch4.match( /[\.!?]/ ) ) {
								return _checkChar( ch1 ) + ( ch2 || '' ) + ch3 + ( ch5 || '' ) + _checkChar( ch6 );
							} else if ( !( ch4 && ch5 ) ) {
								if ( ch2 && ch2.match( /\s/ ) ) {
									return _checkChar( ch1 ) + _checkChar( ch6 );
								} else return ( ch2 || '' );
							} else return _checkChar( ch1 ) + ( ch2 || '' ) + ( ch5 || '' ) + _checkChar( ch6 );
						} else if ( ch3 && ch3.match( /\(/ ) ) {
							return _checkChar( ch1 ) + ( ch5 || '' ) + _checkChar( ch6 );
						} else if ( !( ch2 && ch3 ) ) {

							if ( ch4.match( /[,\.:]/ ) && ( ch5 && ch5.match(/\s/) ) ) {
								return _checkChar( ch1 ) + _checkChar( ch6 );
							} else if ( ch4 && ch4.match( /#/ ) ) {
								return _checkChar( ch1 ) + ( ch2 || '' ) + ( ch4 || '' )+ ( ch5 || '' ) + _checkChar( ch6 );
							} else if ( ch5 && ch5.match( /-/ ) ) {
								return _checkChar( ch1 );
							} else return _checkChar( ch1 ) + ( ch5 || '' ) + _checkChar( ch6 );
						} else if ( ch4 && ch4.match( /,/ ) ) {

							return _checkChar( ch1 ) + ( ch2 || '' ) + ( ch3 || '' ) + ( ch4 || '' ) + ( ch5 || '' ) + _checkChar( ch6 );
						} else {

							return _checkChar( ch1 ) + ( ch2 || '' ) + ( ch3 || '' ) + ( ch5 || '' ) + _checkChar( ch6 );
						}
					});

				}
			}
			text = _retokenize( tokens, text );
			return text;
		}
		, weekdays = [ "Su", "Mo", "Tu", "We", "Th", "Fr", "Sa" ]
		, smartDateParse = function ( text, options, callback ) {
			var
				_t = []
				, k = []
				, rg = []
				, kpr = []
				, combError = false
				, i, rx, mt, cb, s1, s2, pr
				, _sort = function() {
					k.sort( function( a, b ) {
						if ( a.priority < b.priority ) {
							return 1;
						}
						if ( a.priority > b.priority) {
							return -1;
						}
						return 0;
					});
				}
				, _processModelResult = function ( res ) {

					for ( var i = 0; i < res.length; i++ ) {

						_processCombRes( SD_tools.queries[ res[ i ]._id ].callback( res[ i ].query ), SD_tools.queries[ res[ i ]._id ].match,  res[ i ].query.time ? false : true );
					}
				},
				_checkCombProperties = function( c ) {
					!c.event_type && ( c.event_type = "N" );
					!c.event_startDate && ( c.event_startDate = SD_tools.today() );
					!c.event_duration && ( c.event_duration = "30" );
					!c.event_startTime && ( c.event_startTime = "09:00" );
				},
				_dayShift = function( date, offset ) {
					var d = ( new Date( date.replace( /-/g, '/') ) ), dof = new Date ( d.setDate( new Date( d.getDate() + offset ) ));
					return SD_tools.setFullDate( dof.getDate(), dof.getMonth() + 1, +( dof.getFullYear().toString().slice( -2 ) ) );
				},
				_getWorkTime = function( sourcedate) {
					var wt = SD_tools.workTime, r = {}, lwt;
					if ( wt && ( lwt = wt[ weekdays[ ( ( ( new Date( sourcedate.replace( /-/g, '/' ) ) ).getDay() ) ) ] ] ) ) {
						if ( lwt === '-' ) return;
						lwt.replace( /(\d+):(\d+)-(\d+):(\d+)/, function( match, p1, p2, p3, p4) {
							if ( match ) {
								r = { beg : { h : +p1, m : +p2 }, end : { h : +p3, m : +p4 } };
							}
						} );
						return r;
					}
				},
				_checkRelevance = function ( c ) {
					var WTcheck, alt;
					//if ( c.event_startTime.datealternative && ( c.requested === true ) && c.event_startDate === SD_tools.today()) {
					//	alt = c.clone();
					//	if ( !( alt.event_startDate = SD_tools.setDate( alt.event_startTime.h, alt.event_startTime.m, true ) ) ) return;
					//	_stringifyAndPush(  )
					//}
					if ( ( c.event_startDate === SD_tools.today() ) && c.event_startTime.h && ( c.event_startTime.h < SD_tools.now( 0, 'h' ) ) && ( c.requested === true ) ) { c.event_startDate = _dayShift( c.event_startDate, 1 ); c.priority -= 1; }
					WTcheck = _getWorkTime( c.event_startDate );
					if( c.event_duration === 'allday' ) {
						if ( WTcheck ) {
							if ( ( c.event_startTime.h >= WTcheck.beg.h ) || ( c.event_startTime.h <= WTcheck.end.h ) ) {
								if ( c.event_startDate === SD_tools.today() ) {
									c.event_duration = SD_tools._durationCounter( c.event_startTime, WTcheck.end );
								} else c.event_duration = SD_tools._durationCounter( WTcheck.beg, WTcheck.end );
							}
						} else c.event_duration = SD_tools._durationCounter( c.event_startTime, 0 );
					}
					if ( c.event_startTime.h && ( ( WTcheck  && ( ( +c.event_startTime.h < WTcheck.beg.h ) || ( +c.event_startTime.h > WTcheck.end.h ) ) ) || ( c.event_startDate === SD_tools.today() && +c.event_startTime.h < SD_tools.now( 0, 'h' ) ) ) ) c.priority -= 1;
					if ( ( c.event_startDate === SD_tools.today() ) && c.event_startTime.h && ( c.event_startTime.h < SD_tools.now( 0, 'h' ) ) ) c.priority -= 1;
					if ( c.event_startDate === SD_tools.today() && c.event_startTime.h === 0 ) {
						c.event_startDate = _dayShift( c.event_startDate, 1);
						c.event_startTime.h = 0;
					}
					if ( c.event_startTime.offset ) { c.event_startDate = _dayShift( c.event_startDate, c.event_startTime.offset ) }
				},
				_stringifyAndPush = function( c, ks_array, duplicate ) {
					var h = c.event_startTime.h, m = c.event_startTime.m, cl, d, dof;
					if ( +h === 24 ) h = 0;
					if ( duplicate ) {
						cl = c.clone();
						_checkRelevance( c );
						c.event_startTime = ( +h > 9 ? h : '0' + h ) + ':' + ( +m > 9 ? m : '0' + +m );
						ks_array.push( c );
						cl.event_startTime.h = +h + 12;
						_checkRelevance( cl );
						cl.event_startTime = ( +cl.event_startTime.h > 9 ? cl.event_startTime.h : '0' + cl.event_startTime.h )+ ':' + ( +m > 9 ? m : '0' + +m );
						ks_array.push( cl );
					} else {
						_checkRelevance( c );
						c.event_startTime = ( +h > 9 ? h : '0' + h ) + ':' + ( +m > 9 ? m : '0' + +m );
						ks_array.push( c );
					}
				},
				_processCombRes = function ( result, match, requested ) {

					if ( result ) {

						result.match = match;
						requested && ( result.requested = true );
						_checkCombProperties( result );
						if ( result.event_startTime.h && ( result.event_startTime.h < 13 ) && ( result.event_startTime.duplicity !== false ) ) {
							_stringifyAndPush( result, k, true );
						} else {
							_stringifyAndPush( result, k )
						}

					}
				};

			Object.prototype.clone = function () {
				return JSON.parse( JSON.stringify( this ) );
			};

			if ( options.environment ) {
				options.environment.date ? SD_tools.localDate = new Date( options.environment.date.replace( /-/g, '/' ) ) : SD_tools.today().replace( /-/g, '/' );
				options.environment.time ? SD_tools.localDate.setHours( +options.environment.time.slice( 0,2 ), +options.environment.time.slice( -2 ) ) : SD_tools.now( 0, 'ISO' );
				SD_tools.workTime = options.environment.workTime;
			} else 	SD_tools.localDate = null;
			SD_tools.query = [];


			for ( i = 0; i < tokens.length, rx = tokens[ i ]; i++ ) {
				text = text.replace( rx.regExp , function () {
					//DEBUG && console.log( rx.regExp );
					var lt, c = Array.prototype.slice.call( arguments ), r = '#' + rx.type + '_' + _t.length, tk = { origin : c.shift(), captured : c, func: rx.func, type : rx.type, priority : rx.priority };
					_t[ _t.length ] = tk;
					if ( !( lt = rx.replace.apply( tk, [ r ].concat( c ) ) ) ) {
						return arguments[ 0 ];
					} else return lt;
				} );
			}
			for ( i = 0; i < metatokens.length, rx = metatokens[ i ]; i++ ) {
				text = text.replace( rx.regExp , function () {

					var c = Array.prototype.slice.call( arguments ), r = '#' + rx.type + '_' + _t.length, lr, tk = { origin : c.shift(), captured : c, func: rx.func, type : rx.type, priority : rx.priority };
					_t[ _t.length ] = tk;
					if ( !( lr = rx.replace.apply( tk, [ r ].concat( [ _t ] ).concat( c ) ) ) ) {
						return arguments[ 0 ]
					} else return lr;
				} );
			}


			if ( _t.length ) {
				for (i = 0; i < combinations.length, cb = combinations[i]; i++) {
					while (( mt = cb.regExp.exec(text)) !== null) {

						mt.shift();
						//try {
						_processCombRes( cb.extract( _t, mt, text ), mt );
						//} catch (error) {
						//	combError = error
						//}
					}
				}
			}
			if ( SD_tools.queries.length) {
				/*if ( SD_adapter && SD_adapter.requestModel ) {
				 s1 = setTimeout( function () {

				 _processModelResult( _fakeModel( SD_tools.queries ) );
				 clearTimeout( s2 );
				 }, 1000 );
				 SD_adapter.requestModel( SD_tools.queries, function ( err, res ) {
				 clearTimeout( s1 );

				 _processModelResult( err ? _fakeModel( res ) : res );
				 },
				 function (s) {
				 s2 = s;
				 });
				 } else {*/
				_processModelResult( _fakeModel( SD_tools.queries ) );
				//}
				SD_tools.queries = [];
			}
			_sort();
			if ( options.singleMode ) {
				pr = k[ 0 ] && k[ 0 ].priority;
				kpr.push( k[ 0 ] );
				for ( i = 1; i < k.length; i++ ) {
					( k[ i ].priority === pr ) && kpr.push( k[ i ] );
				}
				k = kpr;
			}
			if ( k.length && k[ 0 ] ) {
				for ( i = 0; i < k.length ; i++ ) {
					k[ i ].event_result = _clean( k[ i ].event_result, k[ i ].match, _t );
				}
			}
			typeof( options ) === "function" ? options( combError, k ) : callback( combError, k );
		};


	/**
	 * @author Kadyrov Albert <fluffy1snow@gmail.com>
	 * @module Russian Test cases
	 */

	var testCases = {
		"TC-0" : {//2
			"origin" : "Сегодня встреча с инвесторами в пять вечера",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13",   "event_startTime" : "17:00", "event_duration" : "30", "event_result" : "встреча с инвесторами"                },

				{ "event_type" : "N", "event_startDate" : "2015-03-13",   "event_startTime" : "17:00", "event_duration" : "30", "event_result" : "Сегодня встреча с инвесторами"        },
				{ "event_type" : "N", "event_startDate" : "2015-03-13",   "event_startTime" : "05:00", "event_duration" : "30", "event_result" : "Сегодня встреча с инвесторами вечера" },
				{ "event_type" : "N", "event_startDate" : "2015-03-13",   "event_startTime" : "17:00", "event_duration" : "30", "event_result" : "Сегодня встреча с инвесторами вечера" },
				{ "event_type" : "N", "event_startDate" : "2015-03-13",   "event_startTime" : "17:00", "event_duration" : "30", "event_result" : "встреча с инвесторами вечера"         },
				{ "event_type" : "N", "event_startDate" : "2015-03-13",   "event_startTime" : "05:00", "event_duration" : "30", "event_result" : "встреча с инвесторами вечера"         },
				{ "event_type" : "N", "event_startDate" : "2015-03-13",   "event_startTime" : "09:00","event_duration" : "30", "event_result" : "встреча с инвесторами в пять вечера" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},


		"TC-1" : {
			"origin" : "Встреча с инвесторами сегодня",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "09:00", "event_result" : "Встреча с инвесторами", "event_duration" : "30" } // ожидается рабочее время
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-2" : {//2
			"origin" : "Завтра встреча с инвесторами в пять вечера",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14",   "event_startTime" : "17:00", "event_duration" : "30", "event_result" : "встреча с инвесторами"               },

				{ "event_type" : "N",  "event_startDate" : "2015-03-13",   "event_startTime" : "17:00", "event_duration" : "30", "event_result" : "Завтра встреча с инвесторами"        },
				{ "event_type" : "N",  "event_startDate" : "2015-03-14",   "event_startTime" : "17:00", "event_duration" : "30", "event_result" : "Завтра встреча с инвесторами"        },
				{ "event_type" : "N",  "event_startDate" : "2015-03-13",   "event_startTime" : "05:00", "event_duration" : "30", "event_result" : "Завтра встреча с инвесторами вечера" },
				{ "event_type" : "N",  "event_startDate" : "2015-03-14",   "event_startTime" : "05:00", "event_duration" : "30", "event_result" : "Завтра встреча с инвесторами вечера" },
				{ "event_type" : "N",  "event_startDate" : "2015-03-13",   "event_startTime" : "17:00", "event_duration" : "30", "event_result" : "Завтра встреча с инвесторами вечера" },
				{ "event_type" : "N",  "event_startDate" : "2015-03-14",   "event_startTime" : "17:00", "event_duration" : "30", "event_result" : "Завтра встреча с инвесторами вечера" },
				{ "event_type" : "N",  "event_startDate" : "2015-03-14",   "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "встреча с инвесторами в пять вечера" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-3" : {//2
			"origin" : "Встреча с инвесторами завтра в пять",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14",   "event_startTime" : "05:00", "event_duration" : "30", "event_result" : "Встреча с инвесторами"        },
				{ "event_type" : "N", "event_startDate" : "2015-03-14",   "event_startTime" : "17:00", "event_duration" : "30", "event_result" : "Встреча с инвесторами"        },



				{ "event_type" : "N", "event_startDate" : "2015-03-13",   "event_startTime" : "17:00", "event_duration" : "30", "event_result" : "Встреча с инвесторами завтра" },
				{ "event_type" : "N", "event_startDate" : "2015-03-13",   "event_startTime" : "05:00", "event_duration" : "30", "event_result" : "Встреча с инвесторами завтра" },
				{ "event_type" : "N", "event_startDate" : "2015-03-14",   "event_startTime" : "09:00","event_duration" : "30", "event_result" : "Встреча с инвесторами в пять" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-4" : {
			"origin" : "Послезавтра день рождение мамы",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-15", "event_startTime" : "09:00", "event_result" : "день рождение мамы", "event_duration" : "30"  }// ожидается рабочее время
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-5" : {
			"origin" : "День рождение мамы послезавтра",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-15", "event_startTime" : "09:00", "event_result" : "День рождение мамы", "event_duration" : "30"  }// ожидается рабочее время
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-6" : {
			"origin" : "Вчера состоялся футбольный матч в 15:30",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-12", "event_startTime" : "15:30", "event_duration" : "30", "event_result" : "состоялся футбольный матч"         },

				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "15:30", "event_duration" : "30", "event_result" : "Вчера состоялся футбольный матч"   },
				{ "event_type" : "N", "event_startDate" : "2015-03-12", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "состоялся футбольный матч в 15:30" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-7" : {
			"origin" : "Футбольный матч состоялся вчера 16:30",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-12", "event_startTime" : "16:30",      "event_duration" : "30", "event_result" : "Футбольный матч состоялся"       },

				{ "event_type" : "N",                                    "event_startTime" : "16:30",      "event_duration" : "30", "event_result" : "Футбольный матч состоялся вчера" },
				{ "event_type" : "N", "event_startDate" : "2015-03-12" , "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Футбольный матч состоялся 16:30" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-8" : {
			"origin" : "Завтра в 11 позвонить Алексу 89273123112 по вопросу об ip 127.0.0.1",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "11:00", "event_duration" : "30", "event_result" : "позвонить Алексу 89273123112 по вопросу об ip 127.0.0.1"        },
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "23:00", "event_duration" : "30", "event_result" : "позвонить Алексу 89273123112 по вопросу об ip 127.0.0.1"        },

				{ "event_type" : "N", "event_startDate" : "2015-03-13",  "event_startTime" : "11:00", "event_duration" : "30", "event_result" : "Завтра позвонить Алексу 89273123112 по вопросу об ip 127.0.0.1" },
				{ "event_type" : "N", "event_startDate" : "2015-03-13",  "event_startTime" : "23:00", "event_duration" : "30", "event_result" : "Завтра позвонить Алексу 89273123112 по вопросу об ip 127.0.0.1" },
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00","event_duration" : "30", "event_result" : "в 11 позвонить Алексу 89273123112 по вопросу об ip 127.0.0.1"   }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-9" : {
			"origin" : "Банк 2-12-12-12 завтра узнать время работы",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Банк 2-12-12-12 узнать время работы" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-10" : {
			"origin" : "Курс лиры вчера в 9 вечера 25,6",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-12", "event_startTime" : "21:00", "event_duration" : "30", "event_result" : "Курс лиры 25,6"             },

				{ "event_type" : "N", "event_startDate" : "2015-03-12", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Курс лиры вечера 25,6"      },
				{ "event_type" : "N", "event_startDate" : "2015-03-12", "event_startTime" : "21:00", "event_duration" : "30", "event_result" : "Курс лиры вечера 25,6"      },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "21:00", "event_duration" : "30", "event_result" : "Курс лиры вчера 25,6"       },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "21:00", "event_duration" : "30", "event_result" : "Курс лиры вчера вечера 25,6"},
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Курс лиры вчера вечера 25,6"},
				{ "event_type" : "N", "event_startDate" : "2015-03-12", "event_startTime" : "09:00","event_duration" : "30", "event_result" : "Курс лиры в 9 вечера 25,6"  }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-11" : {
			"origin" : "Михаил 25-23-23 автослесарь 6 км от села Орловское позвонить послезавтра узнать условия",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-15", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Михаил 25-23-23 автослесарь 6 км от села Орловское позвонить узнать условия" }//ожидается рабочее время
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-12" : {
			"origin" : "АИ-95 35,5 АИ-92 30,4 ДТ 24,4 Завтра в 8 утра внести данные в таблицу Exel",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "08:00", "event_duration" : "30", "event_result" : "АИ-95 35,5 АИ-92 30,4 ДТ 24,4 внести данные в таблицу Exel"            },

				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "20:00", "event_duration" : "30", "event_result" : "АИ-95 35,5 АИ-92 30,4 ДТ 24,4 утра внести данные в таблицу Exel"       },
				{ "event_type" : "N",                                   "event_startTime" : "08:00", "event_duration" : "30", "event_result" : "АИ-95 35,5 АИ-92 30,4 ДТ 24,4 Завтра внести данные в таблицу Exel"     },
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "АИ-95 35,5 АИ-92 30,4 ДТ 24,4 в 8 утра внести данные в таблицу Exel"   },
				{ "event_type" : "D", "event_startDate" : "2015-03-13", "event_startTime" : "08:00", "event_duration" : "30", "event_result" : "АИ-95 35,5 АИ-92 30,4 ДТ 24,4 Завтра утра внести данные в таблицу Exel"},
				{ "event_type" : "D", "event_startDate" : "2015-03-13", "event_startTime" : "20:00", "event_duration" : "30", "event_result" : "АИ-95 35,5 АИ-92 30,4 ДТ 24,4 Завтра утра внести данные в таблицу Exel"}
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-13" : {
			"origin" : "Напомнить завтра о дне рождении васи ему 22",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "о дне рождении васи ему 22", "event_alarms" : "0"  },//ожидается рабочее время

				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_duration" : "30", "event_result" : "Напомнить о дне рождении васи ему 22"                      }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-14" : {
			"origin" : "Ивану послезавтра 30, общая сумма подарка 1345 рублей",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-15", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Ивану 30, общая сумма подарка 1345 рублей" }// ожидается рабочее время
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-15" : {
			"origin" : "Сегодня в 16:15 по 4 каналу фильм 3 метра над уровнем моря",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "16:15",     "event_duration" : "30", "event_result" : "по 4 каналу фильм 3 метра над уровнем моря"         },

				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "16:15",     "event_duration" : "30", "event_result" : "Сегодня по 4 каналу фильм 3 метра над уровнем моря" },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "в 16:15 по 4 каналу фильм 3 метра над уровнем моря" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-16" : {
			"origin" : "178 см рост Антона вес 80 кг завтра в военкомат",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_result" : "178 см рост Антона вес 80 кг в военкомат", "event_duration" : "30" }//ожидается рабочее время
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-17" : {
			"origin" : "Биржевые курсы: USD 60,29 EUR 74,07 Нефть 60,42 Напомнить завтра снять все свои деньги",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_result" : "Биржевые курсы: USD 60,29 EUR 74,07 Нефть 60,42 снять все свои деньги",           "event_duration" : "30", "event_alarms" : "0"  },//ожидается рабочее время

				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_result" : "Биржевые курсы: USD 60,29 EUR 74,07 Нефть 60,42 Напомнить снять все свои деньги", "event_duration" : "30"                      }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-18" : {
			"origin" : "ИНН: 732772071960 номер паспорта 31 02 212132 завтра в час дня заехать в налоговую",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "13:00", "event_duration" : "30", "event_result" : "ИНН: 732772071960 номер паспорта 31 02 212132 заехать в налоговую"           },

				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "01:00",    "event_duration" : "30", "event_result" : "ИНН: 732772071960 номер паспорта 31 02 212132 дня заехать в налоговую"       },
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "13:00",    "event_duration" : "30", "event_result" : "ИНН: 732772071960 номер паспорта 31 02 212132 дня заехать в налоговую"        },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "13:00",    "event_duration" : "30", "event_result" : "ИНН: 732772071960 номер паспорта 31 02 212132 завтра заехать в налоговую"    },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "13:00",    "event_duration" : "30", "event_result" : "ИНН: 732772071960 номер паспорта 31 02 212132 завтра дня заехать в налоговую" },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "01:00",    "event_duration" : "30", "event_result" : "ИНН: 732772071960 номер паспорта 31 02 212132 завтра дня заехать в налоговую" },
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00","event_duration" : "30", "event_result" : "ИНН: 732772071960 номер паспорта 31 02 212132 в час дня заехать в налоговую" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-19" : {
			"origin" : "сегодня после презентации в 17:00 все едем на фуршет!",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "17:00", "event_duration" : "30", "event_result" : "после презентации все едем на фуршет!"         },

				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "17:00", "event_duration" : "30", "event_result" : "сегодня после презентации все едем на фуршет!" },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "09:00","event_duration" : "30", "event_result" : "после презентации в 17:00 все едем на фуршет!" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-20" : {
			"origin" : "78.135.5.183 - ip адрес переделать сеть офиса завтра в 7 утра",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "07:00", "event_duration" : "30", "event_result" : "78.135.5.183 - ip адрес переделать сеть офиса"            },

				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "07:00", "event_duration" : "30", "event_result" : "78.135.5.183 - ip адрес переделать сеть офиса утра"       },
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "19:00", "event_duration" : "30", "event_result" : "78.135.5.183 - ip адрес переделать сеть офиса утра"       },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "07:00", "event_duration" : "30", "event_result" : "78.135.5.183 - ip адрес переделать сеть офиса завтра"     },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "07:00", "event_duration" : "30", "event_result" : "78.135.5.183 - ip адрес переделать сеть офиса завтра утра"},
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "19:00", "event_duration" : "30", "event_result" : "78.135.5.183 - ip адрес переделать сеть офиса завтра утра"},
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "78.135.5.183 - ip адрес переделать сеть офиса в 7 утра"   }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-21" : {
			"origin" : "Добавить сегодня в 6 вечера информацию: Структура БИК и порядок ведения справочника определена в Положении ЦБ РФ N 225-П от 6 мая 2003 г. 'О справочнике банковских идентификационных кодов участников расчетов, осуществляющих платежи через расчетную сеть центрального банка Российской Федерации (Банка России)",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "18:00", "event_duration" : "30", "event_result" : "Добавить информацию: Структура БИК и порядок ведения справочника определена в Положении ЦБ РФ N 225-П от 6 мая 2003 г. 'О справочнике банковских идентификационных кодов участников расчетов, осуществляющих платежи через расчетную сеть центрального банка Российской Федерации (Банка России)"         },

				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "06:00", "event_duration" : "30", "event_result" : "Добавить вечера информацию: Структура БИК и порядок ведения справочника определена в Положении ЦБ РФ N 225-П от 6 мая 2003 г. 'О справочнике банковских идентификационных кодов участников расчетов, осуществляющих платежи через расчетную сеть центрального банка Российской Федерации (Банка России)"  },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "18:00", "event_duration" : "30", "event_result" : "Добавить сегодня информацию: Структура БИК и порядок ведения справочника определена в Положении ЦБ РФ N 225-П от 6 мая 2003 г. 'О справочнике банковских идентификационных кодов участников расчетов, осуществляющих платежи через расчетную сеть центрального банка Российской Федерации (Банка России)" },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "18:00", "event_duration" : "30", "event_result" : "Добавить сегодня вечера информацию: Структура БИК и порядок ведения справочника определена в Положении ЦБ РФ N 225-П от 6 мая 2003 г. 'О справочнике банковских идентификационных кодов участников расчетов, осуществляющих платежи через расчетную сеть центрального банка Российской Федерации (Банка России)"  },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "06:00", "event_duration" : "30", "event_result" : "Добавить сегодня вечера информацию: Структура БИК и порядок ведения справочника определена в Положении ЦБ РФ N 225-П от 6 мая 2003 г. 'О справочнике банковских идентификационных кодов участников расчетов, осуществляющих платежи через расчетную сеть центрального банка Российской Федерации (Банка России)"  },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Добавить в 6 вечера информацию: Структура БИК и порядок ведения справочника определена в Положении ЦБ РФ N 225-П от 6 мая 2003 г. 'О справочнике банковских идентификационных кодов участников расчетов, осуществляющих платежи через расчетную сеть центрального банка Российской Федерации (Банка России)"      }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-22" : {
			"origin" : "Координаты: Широта: 55°47′36.86″N (55.793571) Долгота: 49°6′29.74″E (49.108262) Завтра в 5 утра вылет в казань",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "05:00", "event_duration" : "30", "event_result" : "Координаты: Широта: 55°47′36.86″N (55.793571) Долгота: 49°6′29.74″E (49.108262) вылет в казань"            },

				{ "event_type" : "N", "event_startDate" : "2015-03-13",     "event_startTime" : "05:00", "event_duration" : "30", "event_result" : "Координаты: Широта: 55°47′36.86″N (55.793571) Долгота: 49°6′29.74″E (49.108262) Завтра вылет в казань"     },
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "17:00", "event_duration" : "30", "event_result" : "Координаты: Широта: 55°47′36.86″N (55.793571) Долгота: 49°6′29.74″E (49.108262) утра вылет в казань"       },
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "05:00", "event_duration" : "30", "event_result" : "Координаты: Широта: 55°47′36.86″N (55.793571) Долгота: 49°6′29.74″E (49.108262) утра вылет в казань"       },
				{ "event_type" : "N", "event_startDate" : "2015-03-13",     "event_startTime" : "05:00", "event_duration" : "30", "event_result" : "Координаты: Широта: 55°47′36.86″N (55.793571) Долгота: 49°6′29.74″E (49.108262) Завтра утра вылет в казань"},
				{ "event_type" : "N", "event_startDate" : "2015-03-13",      "event_startTime" : "17:00", "event_duration" : "30", "event_result" : "Координаты: Широта: 55°47′36.86″N (55.793571) Долгота: 49°6′29.74″E (49.108262) Завтра утра вылет в казань"},
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Координаты: Широта: 55°47′36.86″N (55.793571) Долгота: 49°6′29.74″E (49.108262) в 5 утра вылет в казань"   }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-23P" : {
			"origin" : "Вчера сделал работу по окнам ш 15 в 20 г 10",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-12", "event_startTime" : "20:00", "event_result" : "сделал работу по окнам ш 15 г 10", 		"event_duration" : "30"  },
				{ "event_type" : "N", "event_startDate" : "2015-03-12", "event_startTime" : "09:00", "event_result" : "сделал работу по окнам ш 15 в 20 г 10", "event_duration" : "30"  }//ожидается рабочее время
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-24" : {
			"origin" : "Гоголя 21 квартира 14 завтра в 15:00 доставка",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "15:00", "event_duration" : "30", "event_result" : "Гоголя 21 квартира 14 доставка"         },

				{ "event_type" : "N", "event_startDate" : "2015-03-13",     "event_startTime" : "15:00", "event_duration" : "30", "event_result" : "Гоголя 21 квартира 14 завтра доставка"  },
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Гоголя 21 квартира 14 в 15:00 доставка" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-25" : {
			"origin" : "Представление 17 словнов в цирке завтра в 6 вечера",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "18:00", "event_duration" : "30", "event_result" : "Представление 17 словнов в цирке"            },

				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "06:00", "event_duration" : "30", "event_result" : "Представление 17 словнов в цирке вечера"     },
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "06:00", "event_duration" : "30", "event_result" : "Представление 17 словнов в цирке вечера"       },
				{ "event_type" : "N", "event_startDate" : "2015-03-13",    "event_startTime" : "18:00", "event_duration" : "30", "event_result" : "Представление 17 словнов в цирке завтра"     },
				{ "event_type" : "N", "event_startDate" : "2015-03-13",     "event_startTime" : "18:00", "event_duration" : "30", "event_result" : "Представление 17 словнов в цирке завтра вечера"},
				{ "event_type" : "N", "event_startDate" : "2015-03-13",    "event_startTime" : "06:00", "event_duration" : "30", "event_result" : "Представление 17 словнов в цирке завтра вечера"},
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Представление 17 словнов в цирке в 6 вечера" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-26" : {
			"origin" : "Организация 33 колеса на второй улице Виноградова завтра приедут снимать замеры",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Организация 33 колеса на второй улице Виноградова приедут снимать замеры" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-27" : {
			"origin" : "Вчера был холодный день и я встречался с Алексеем в 10 вечера",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-12", "event_startTime" : "22:00", "event_duration" : "30", "event_result" : "был холодный день и я встречался с Алексеем"             },

				{ "event_type" : "N", "event_startDate" : "2015-03-12", "event_startTime" : "10:00", "event_duration" : "30", "event_result" : "был холодный день и я встречался с Алексеем вечера"      },
				{ "event_type" : "N", "event_startDate" : "2015-03-12", "event_startTime" : "22:00", "event_duration" : "30", "event_result" : "был холодный день и я встречался с Алексеем вечера"        },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "10:00", "event_duration" : "30", "event_result" : "Вчера был холодный день и я встречался с Алексеем вечера"  },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "22:00", "event_duration" : "30", "event_result" : "Вчера был холодный день и я встречался с Алексеем вечера"  },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "22:00", "event_duration" : "30", "event_result" : "Вчера был холодный день и я встречался с Алексеем"       },
				{ "event_type" : "N", "event_startDate" : "2015-03-12", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "был холодный день и я встречался с Алексеем в 10 вечера" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-28" : {
			"origin" : "1943 году успех преимущественно был у советских войск - добавить завтра этот материал к докладу",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_result" : "1943 году успех преимущественно был у советских войск - добавить этот материал к докладу","event_duration" : "30" }//ожидается рабочее время
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-29" : {
			"origin" : "7 корпус с завтрашнего дня закрывается на ремонт, развесить объявление в общежитии сегодня в 5",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "17:00", "event_duration" : "30", "event_result" : "7 корпус с завтрашнего дня закрывается на ремонт, развесить объявление в общежитии"         },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "05:00", "event_duration" : "30", "event_result" : "7 корпус с завтрашнего дня закрывается на ремонт, развесить объявление в общежитии"         },

				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "7 корпус с завтрашнего дня закрывается на ремонт, развесить объявление в общежитии в 5"     },
				{ "event_type" : "N", "event_startDate" : "2015-03-13",    "event_startTime" : "17:00", "event_duration" : "30", "event_result" : "7 корпус с завтрашнего дня закрывается на ремонт, развесить объявление в общежитии сегодня" },
				{ "event_type" : "N", "event_startDate" : "2015-03-13",    "event_startTime" : "05:00", "event_duration" : "30", "event_result" : "7 корпус с завтрашнего дня закрывается на ремонт, развесить объявление в общежитии сегодня" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-30" : {
			"origin" : "За прошлую неделю ушло 22 литра воды напомнить завтра купить 6 баллонов по 5 литров",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_result" : "За прошлую неделю ушло 22 литра воды купить 6 баллонов по 5 литров",           "event_duration" : "30", "event_alarms" : "0"  },

				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_result" : "За прошлую неделю ушло 22 литра воды напомнить купить 6 баллонов по 5 литров", "event_duration" : "30"                        },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "09:00", "event_result" : "За прошлую неделю ушло 22 литра воды завтра купить 6 баллонов по 5 литров",    "event_duration" : "30", "event_alarms" : "0"  }//ожидается рабоче время
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-31" : {
			"origin" : "'Десять негретят' завтра в кинотеатрах!",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_result" : "'Десять негретят' в кинотеатрах!", "event_duration" : "30"  }//ожидается рабочее время
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-32" : {
			"origin" : "Послезавтра в 20 ч киносеанс 16 и 17 места куплены",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-15", "event_startTime" : "20:00", "event_duration" : "30", "event_result" : "киносеанс 16 и 17 места куплены"             },

				{ "event_type" : "N", "event_startDate" : "2015-03-15", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "в 20 ч киносеанс 16 и 17 места куплены"      },
				{ "event_type" : "N",  "event_startDate" : "2015-03-13", "event_startTime" : "20:00", "event_duration" : "30", "event_result" : "Послезавтра киносеанс 16 и 17 места куплены" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-33" : {
			"origin" : "Завтра сбор возле памятника Ленина тел. 8 927 535 54 12",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_result" : "сбор возле памятника Ленина тел. 8 927 535 54 12", "event_duration" : "30" }//ожидается рабочее время
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-34" : {
			"origin" : "Геннадий 52-45-26 Антон 8 917 222 22 22 завтра в 8 напомнить позвонить",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "08:00", "event_duration" : "30", "event_result" : "Геннадий 52-45-26 Антон 8 917 222 22 22 позвонить",               "event_alarms" : "0"  },
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "20:00", "event_duration" : "30", "event_result" : "Геннадий 52-45-26 Антон 8 917 222 22 22 позвонить",               "event_alarms" : "0"  },


				{ "event_type" : "N", "event_startDate" : "2015-03-14" , "event_startTime" : "09:00",    "event_duration" : "30", "event_result" : "Геннадий 52-45-26 Антон 8 917 222 22 22 в 8 позвонить",           "event_alarms" : "0"  },
				{ "event_type" : "N", "event_startDate" : "2015-03-14" , "event_startTime" : "09:00",    "event_duration" : "30", "event_result" : "Геннадий 52-45-26 Антон 8 917 222 22 22 в 8 напомнить позвонить"                      },
				{ "event_type" : "N",  "event_startDate" : "2015-03-13",    "event_startTime" : "08:00", "event_duration" : "30", "event_result" : "Геннадий 52-45-26 Антон 8 917 222 22 22 завтра позвонить",        "event_alarms" : "0"  },
				{ "event_type" : "N", "event_startDate" : "2015-03-13",     "event_startTime" : "20:00", "event_duration" : "30", "event_result" : "Геннадий 52-45-26 Антон 8 917 222 22 22 завтра позвонить",        "event_alarms" : "0"  },
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "08:00", "event_duration" : "30", "event_result" : "Геннадий 52-45-26 Антон 8 917 222 22 22 напомнить позвонить"                          },
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "20:00", "event_duration" : "30", "event_result" : "Геннадий 52-45-26 Антон 8 917 222 22 22 напомнить позвонить"                          }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-35" : {
			"origin" : "Завтра на весь день обещают дождь",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_duration" : "240", "event_result" : "обещают дождь"},

				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_result" : "обещают дождь", "event_duration" : "30"  }//ожидается рабочее время
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-36" : {
			"origin" : "Первыполнил план по закупкам за вчера",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-12", "event_startTime" : "09:00", "event_result" : "Первыполнил план по закупкам", "event_duration" : "30"  }//ожидается рабочее время
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-37" : {
			"origin" : "вчера праздновали день рождение нашего сына 15.10.2014",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-12", "event_startTime" : "09:00", "event_result" : "праздновали день рождение нашего сына 15.10.2014", "event_duration" : "30" },

				{ "event_type" : "N", "event_startDate" : "2014-10-15", "event_startTime" : "09:00", "event_result" : "вчера праздновали день рождение нашего сына", "event_duration" : "30"      }//ожидается рабочее время
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-38" : {
			"origin" : "Я родился. 25.09.2015 году. Сегодня хороший день. Первая заметка моего сына",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-09-25", "event_startTime" : "09:00", "event_result" : "Я родился. Сегодня хороший день. Первая заметка моего сына",         "event_duration" : "30" },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "09:00", "event_result" : "Я родился. 25.09.2015 году. хороший день. Первая заметка моего сына", "event_duration" : "30" }//ожидается рабочее время
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-39" : {
			"origin" : "23 бригадира вышли на работу. Антон 17.10.14. Завтра пересмотреть график работы бригады 16-1",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_result" : "23 бригадира вышли на работу. Антон 17.10.14. пересмотреть график работы бригады 16-1", "event_duration" : "30"  },
				{ "event_type" : "N", "event_startDate" : "2014-10-17", "event_startTime" : "09:00", "event_result" : "23 бригадира вышли на работу. Антон. Завтра пересмотреть график работы бригады 16-1", "event_duration" : "30"  },

				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_result" : "23 бригадира вышли на работу. Антон 17.10.14. пересмотреть график работы бригады 16-1","event_duration" : "30" }//ожидается рабочее время

			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-40" : {
			"origin" : "ip 255.255.255.0 лучший ip в мире устанвоить его завтра на все компьютеры напомнить за час!!!",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_result" : "ip 255.255.255.0 лучший ip в мире устанвоить его на все компьютеры!!!",                   "event_duration" : "30", "event_alarms" : "-60" },

				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_result" : "ip 255.255.255.0 лучший ip в мире устанвоить его на все компьютеры напомнить за час!!!",  "event_duration" : "30"                         }//ожидается рабочее время
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-41" : {
			"origin" : "Делать деньги. Сегодня. Вчера. Завтра!",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Делать деньги. Вчера. Завтра!"   },

				{ "event_type" : "N", "event_startDate" : "2015-03-12", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Делать деньги. Сегодня. Завтра!" },
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Делать деньги. Сегодня. Вчера."  }//ожидается рабочее время

			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-42" : {
			"origin" : "Оригинальные идеи! Завтра по ОРТ в 10 вечера напомнить за 5 минут",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "22:00", "event_duration" : "30", "event_result" : "Оригинальные идеи! по ОРТ"                      , "event_alarms" : "-5" },

				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "10:00", "event_duration" : "30", "event_result" : "Оригинальные идеи! по ОРТ вечера"               , "event_alarms" : "-5" },
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "22:00", "event_duration" : "30", "event_result" : "Оригинальные идеи! по ОРТ напомнить за 5 минут"                         },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "22:00", "event_duration" : "30", "event_result" : "Оригинальные идеи! Завтра по ОРТ"             ,   "event_alarms" : "-5" },
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Оригинальные идеи! по ОРТ в 10 вечера"          , "event_alarms" : "-5" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-43" : {
			"origin" : "завтра день космонавтики. Двеннадцатого апереля 61 года первый человек совершил полет в космос",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "день космонавтики. Двеннадцатого апереля 61 года первый человек совершил полет в космос" }//ожидается рабочее время
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-44" : {
			"origin" : "Послезавтра сдаю диплом. номер руководителя: 24-10-15",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-15", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "сдаю диплом. номер руководителя: 24-10-15" }//ожидается рабочее время
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-45" : {
			"origin" : "Завтра премьера фильма Вчера вдоль дороги. Вчера вдоль дороги является самым дорогим фильмом в истории кинемотогрофа острова Панхуть, с бюджетом в 10 тысяч долларов. Напомнить сходить.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "премьера фильма Вчера вдоль дороги. Вчера вдоль дороги является самым дорогим фильмом в истории кинемотогрофа острова Панхуть, с бюджетом в 10 тысяч долларов. сходить.",   "event_alarms" : "0"  },

				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "премьера фильма Вчера вдоль дороги. Вчера вдоль дороги является самым дорогим фильмом в истории кинемотогрофа острова Панхуть, с бюджетом в 10 тысяч долларов. Напомнить сходить."                }//ожидается рабочее время
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-46" : {
			"origin" : "в 13:45 1.04 день дурака напомнить за день",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-04-01", "event_startTime" : "13:45", "event_duration" : "30", "event_result" : "день дурака"                  , "event_alarms" : "-1440" },

				{ "event_type" : "N",                                   "event_startTime" : "13:45", "event_duration" : "30", "event_result" : "1.04 день дурака"             , "event_alarms" : "-1440" },
				{ "event_type" : "N", "event_startDate" : "2015-04-01",                              "event_duration" : "30", "event_result" : "в 13:45 день дурака"          , "event_alarms" : "-1440" },
				{ "event_type" : "N", "event_startDate" : "2015-04-01", "event_startTime" : "13:45", "event_duration" : "30", "event_result" : "день дурака напомнить за день" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-47" : {
			"origin" : "01/04 день дурака напомнить",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-04-01", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "день дурака",         "event_alarms" : "0"  },

				{ "event_type" : "N", "event_startDate" : "2015-04-01", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "день дурака напомнить"                      }//ожидается рабочее время
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-48" : {
			"origin" : "01.04 день дурака",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-04-01", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "день дурака" }//ожидается рабочее время
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		//"TC-49" : { wtf?
		//	"origin" : "01,05 день рождение",
		//	"expectations" : [
		//		{ "event_type" : "N", "event_startDate" : "2015-05-01", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "день рождение" }//ожидается рабочее время
		//	],
		//	"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		//},
		//"TC-50" : {
		//	"origin" : "День рождение 16-06",
		//	"expectations" : [
		//		{ "event_type" : "N", "event_startDate" : "2015-06-16", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "День рождение" },//ожидается рабочее время
		//		{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "16:06", "event_duration" : "30", "event_result" : "День рождение" }//ожидается рабочее время
		//	],
		//	"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		//},
		"TC-51" : {
			"origin" : "день рождение 16/07",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-07-16", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "день рождение" }//ожидается рабочее время
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-52" : {
			"origin" : "День рождение 16-07-15",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-07-16", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "День рождение" }//ожидается рабочее время
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-53" : {
			"origin" : "День рожднние 14/05/2014 года",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2014-05-14", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "День рожднние" }//ожидается рабочее время
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-54" : {
			"origin" : "15-12-2015 день рождение",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-12-15", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "день рождение" }//ожидается рабочее время
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-55" : {
			"origin" : "02-09-2014 состоится родительское собрание в школе",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2014-09-02", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "состоится родительское собрание в школе" }//ожидается рабочее время
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-56" : {
			"origin" : "В школе состоится родительское собрание 02 сентября 14 года",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2014-09-02",              "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "В школе состоится родительское собрание"         }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-57" : {
			"origin" : "2го сентября в школе состоится родительское собрание",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-09-02", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "в школе состоится родительское собрание" }//ожидается рабочее время
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-58" : {
			"origin" : "2-го сентября состоится собрание в школе",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-09-02", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "состоится собрание в школе" }//ожидается рабочее время
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-59" : {
			"origin" : "2 сентябре состоится собрание в школе",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-09-02", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "состоится собрание в школе" }//ожидается рабочее время
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-60" : {
			"origin" : "02 сентябре 2014 года состоится собрание в школе",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2014-09-02", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "состоится собрание в школе"			},

				{ "event_type" : "N", "event_startDate" : "2015-09-02", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "в 2014года состоится собрание в школе" }//ожидается рабочее время
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-61" : {
			"origin" : "Первого мая праздник труда",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-05-01", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "праздник труда" }//ожидается рабочее время
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-62" : {
			"origin" : "Девятого мая 14 года День Победы",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2014-05-09" , "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "День Победы"         }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-63" : {
			"origin" : "Через день позвонить маме",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-15", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "позвонить маме" }//ожидается рабочее время
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-64" : {
			"origin" : "Через 7 дней сдать декларацию в налоговую",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-21", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "сдать декларацию в налоговую" }//ожидается рабочее время
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-65" : {
			"origin" : "Сдать декларацию через пару дней",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-16", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Сдать декларацию" }//ожидается рабочее время
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-66" : {
			"origin" : "Экзамен июнь, 16",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2016-06-01", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Экзамен" },
				{ "event_type" : "N", "event_startDate" : "2015-06-16", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Экзамен" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-67" : {
			"origin" : "13 Май начинается зачетная сессия",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-05-13", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "начинается зачетная сессия" },
				{ "event_type" : "N", "event_startDate" : "2015-05-01", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "начинается зачетная сессия" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-68" : {
			"origin" : "Седьмого сентября в четыре вечера встретить груз. 2,5 кг по 400 руб",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-09-07", "event_startTime" : "16:00", "event_duration" : "30", "event_result" : "встретить груз. 2,5 кг по 400 руб"                   }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-69" : {
			"origin" : "5 марта играли со Спартаком. Ничья 2:2",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2016-03-05", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "играли со Спартаком. Ничья 2:2" }//ожидается рабочее время
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-70" : {
			"origin" : "Карты деньги два ствола. Рейтинг 8.9/10 - посмотреть пятого января",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2016-01-05", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Карты деньги два ствола. Рейтинг 8.9/10 - посмотреть" }//ожидается рабочее время
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-71" : {
			"origin" : "14/05/2015 в три прийти на репетицию напомнить за день",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-05-14", "event_startTime" : "15:00", "event_duration" : "30", "event_result" : "прийти на репетицию"                   , "event_alarms" : "-1440" },
				{ "event_type" : "N", "event_startDate" : "2015-05-14", "event_startTime" : "03:00", "event_duration" : "30", "event_result" : "прийти на репетицию"                   , "event_alarms" : "-1440" },


				{ "event_type" : "N", "event_startDate" : "2015-03-13",    "event_startTime" : "03:00", "event_duration" : "30", "event_result" : "14/05/2015 прийти на репетицию"        , "event_alarms" : "-1440" },
				{ "event_type" : "N", "event_startDate" : "2015-03-13",    "event_startTime" : "15:00", "event_duration" : "30", "event_result" : "14/05/2015 прийти на репетицию"        , "event_alarms" : "-1440" },
				{ "event_type" : "N", "event_startDate" : "2015-05-14", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "в три прийти на репетицию"             , "event_alarms" : "-1440" },
				{ "event_type" : "N", "event_startDate" : "2015-05-14", "event_startTime" : "03:00", "event_duration" : "30", "event_result" : "прийти на репетицию напомнить за день" },
				{ "event_type" : "N", "event_startDate" : "2015-05-14", "event_startTime" : "15:00", "event_duration" : "30", "event_result" : "прийти на репетицию напомнить за день" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-72" : {
			"origin" : "Девятого марта к 8 утра явиться на прохождение мероприятий по призыву, напомнить за неделю",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2016-03-09",   "event_startTime" : "08:00", "event_duration" : "30", "event_result" : "явиться на прохождение мероприятий по призыву"                      , "event_alarms" : "-10080" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-73" : {
			"origin" : "Через три дня купить елку высотой в 4м, одну.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-17", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "купить елку высотой в 4м, одну." }//ожидается рабочее время
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-74" : {
			"origin" : "Забронировать завтра столик. 89172986545",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Забронировать столик. 89172986545" }//ожидается рабочее время
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-75" : {
			"origin" : "Сдать 300 руб через неделю старосте",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-20", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Сдать 300 руб старосте" }//ожидается рабочее время
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-76" : {
			"origin" : "Поздравить 5 человек с НГ 31 дек",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-12-31", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Поздравить 5 человек с НГ" }//ожидается рабочее время
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-77" : {
			"origin" : "Пятого января пробежать 10 км",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2016-01-05", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "пробежать 10 км" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-78" : {
			"origin" : "30го ноября отнести пакет на Чуйкова 18-11",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-11-30", "event_startTime" : "18:11", "event_duration" : "30", "event_result" : "отнести пакет на Чуйкова" },
				{ "event_type" : "N", "event_startDate" : "2015-11-18", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "30го ноября отнести пакет на Чуйкова" 		}
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-79" : {
			"origin" : "5го янв пробежать 10 км",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2016-01-05", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "пробежать 10 км" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-80" : {
			"origin" : "Забронировать столик 256-02-12 девятого фев",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2016-02-09", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Забронировать столик 256-02-12" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-81" : {
			"origin" : "20 студентов придут на лекцию 17.03",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-17", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "20 студентов придут на лекцию" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-82" : {
			"origin" : "Купить 12 тортов 22.08",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-08-22", "event_startTime" : "09:00",  "event_duration" : "30", "event_result" : "Купить 12 тортов" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		//"TC-86" : {
		//	"origin" : "08 03 выходной",
		//	"expectations" : [
		//		{ "event_type" : "N", "event_startDate" : "2016-03-08", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "выходной" }
		//	],
		//	"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		//},
		"TC-87" : {
			"origin" : "выходной 08/03",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2016-03-08", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "выходной" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-88" : {
			"origin" : "Счет 3-1 21.09.2014",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2014-09-21", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Счет 3-1" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-89" : {
			"origin" : "История пространственных искусств. 25-го",
			"expectations" : [
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-90" : {
			"origin" : "НИЖНИЙ НОВГОРОД МОСКОВ - ЯРОСЛАВЛЬ-ГОРОД 25.12.2014, ЧТ",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2014-12-25", "event_startTime" : "09:00",        "event_duration" : "30", "event_result" : "НИЖНИЙ НОВГОРОД МОСКОВ - ЯРОСЛАВЛЬ-ГОРОД"        }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-91" : {
			"origin" : "четвертое ноября — День народного единства. 22 октября (1 ноября по григорианскому календарю) 1612 года бойцы народного ополчения под предводительством Кузьмы Минина и Дмитрия Пожарского штурмом взяли Китай-город, гарнизон Речи Посполитой отступил в Кремль. Князь Пожарский вступил в Китай-город с Казанскою иконой Божьей Матери и, согласно гораздо более позднему свидетельству, поклялся построить храм в память этой победы.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-11-04", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "— День народного единства. 22 октября (1 ноября по григорианскому календарю) 1612 года бойцы народного ополчения под предводительством Кузьмы Минина и Дмитрия Пожарского штурмом взяли Китай-город, гарнизон Речи Посполитой отступил в Кремль. Князь Пожарский вступил в Китай-город с Казанскою иконой Божьей Матери и, согласно гораздо более позднему свидетельству, поклялся построить храм в память этой победы." }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		//"TC-92" : {
		//	"origin" : "Седьмого числа в феврале состоится мероприятие",
		//	"expectations" : [
		//		{ "event_type" : "N", "event_startDate" : "2016-02-07", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "состоится мероприятие" }
		//	],
		//	"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		//},

		"TC-93" : {
			"origin" : "Варфоломе́евская ночь (фр. massacre de la Saint-Barthélemy — резня св. Варфоломея) — массовая резня гугенотов во Франции, устроенная католиками в ночь 24 августа 1572 года, в канун дня святого Варфоломея.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "1572-08-24", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Варфоломе́евская ночь (фр. massacre de la Saint-Barthélemy — резня св. Варфоломея) — массовая резня гугенотов во Франции, устроенная католиками в ночь, в канун дня святого Варфоломея." }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-94" : {
			"origin" : "День энергетика - это профессиональный праздник всех работников промышленности, охватывающей выработку, передачу и сбыт потребителям электрической и тепловой энергии, который они отмечают в один из самых коротких световых дней в году — 22 декабря.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-12-22", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "День энергетика - это профессиональный праздник всех работников промышленности, охватывающей выработку, передачу и сбыт потребителям электрической и тепловой энергии, который они отмечают в один из самых коротких световых дней в году." }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-95" : {
			"origin" : "22 дек — ПРАЙМ. Курс доллара поднялся выше 56 рублей на торгах Московской биржи. Так, доллар достиг отметки 56,2 рубля, тогда как ранее в ходе торгов он опускался ниже отметки 55 рублей за доллар.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-12-22", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "— ПРАЙМ. Курс доллара поднялся выше 56 рублей на торгах Московской биржи. Так, доллар достиг отметки 56,2 рубля, тогда как ранее в ходе торгов он опускался ниже отметки 55 рублей за доллар." }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-96" : {
			"origin" : "В понедельник состоится встреча инвесторов, изучить пп 6 ст 17",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-16", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "состоится встреча инвесторов, изучить пп 6 ст 17" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-97" : {
			"origin" : "Распродажа начнется в пон, купить 17 м ткани",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-16", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Распродажа начнется, купить 17 м ткани" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-98" : {
			"origin" : "В пон. Обещают дожди. Темература 17,5 градусов",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-16", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Обещают дожди. Темература 17,5 градусов" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-99" : {
			"origin" : "В пн премьера фильма 'Ной', идем в 15:45 цена билета 345,56 руб",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-16", "event_startTime" : "15:45",    "event_duration" : "30", "event_result" : "премьера фильма 'Ной', идем цена билета 345,56 руб"         },

				{ "event_type" : "N", "event_startDate" : "2015-03-16" , "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "премьера фильма 'Ной', идем в 15:45 цена билета 345,56 руб" },
				{ "event_type" : "N", "event_startDate" : "2015-03-13",           "event_startTime" : "15:45",    "event_duration" : "30", "event_result" : "В пн премьера фильма 'Ной', идем цена билета 345,56 руб"    }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-100" : {
			"origin" : "Сезон охоты на уток откроется в пн. серия лицензии на отстрел N-154-34-32",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-16", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Сезон охоты на уток откроется серия лицензии на отстрел N-154-34-32" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-101" : {
			"origin" : "В пнд сдать отчет. Во вт выслушать критику. В среду переделать отчет.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-16", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "сдать отчет. Во вт выслушать критику. В среду переделать отчет." },

				{ "event_type" : "N", "event_startDate" : "2015-03-17", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "В пнд сдать отчет. выслушать критику. В среду переделать отчет." },
				{ "event_type" : "N", "event_startDate" : "2015-03-18", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "В пнд сдать отчет. Во вт выслушать критику. переделать отчет."   } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-102" : {
			"origin" : "В среду провести учет. В 15:00. Потом сбегать за пирожочком.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-18", "event_startTime" : "15:00", "event_duration" : "30", "event_result" : "провести учет. Потом сбегать за пирожочком."          },

				{ "event_type" : "N", "event_startDate" : "2015-03-18",                              "event_duration" : "30", "event_result" : "провести учет. В 15:00. Потом сбегать за пирожочком." },
				{ "event_type" : "N",                                          "event_startTime" : "15:00", "event_duration" : "30", "event_result" : "В среду провести учет. Потом сбегать за пирожочком."  }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-103" : {
			"origin" : "Теща приедет в среду. Сегодня перенести вещи в гараж.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13",        "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Теща приедет в среду. перенести вещи в гараж." }, // ожидает рабочее время пользователя
				{ "event_type" : "N", "event_startDate" : "2015-03-18", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Теща приедет. Сегодня перенести вещи в гараж." }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-104" : {
			"origin" : "На прием к врачу в ср Номер полиса АБ 12 23 45",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-18", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "На прием к врачу Номер полиса АБ 12 23 45" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-105" : {
			"origin" : "В ср подъехать на ТО, в последний раз 13 декабря проходил",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-18", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "подъехать на ТО, в последний раз 13 декабря проходил" },
				{ "event_type" : "N", "event_startDate" : "2015-12-13", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "В ср подъехать на ТО, в последний раз проходил" }// ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-106" : {
			"origin" : "В Четверг тренировка",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-19", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "тренировка" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-107" : {
			"origin" : "Маникюр в четв",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-19", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Маникюр" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-108" : {
			"origin" : "В четв. у Маши др. Купить 41 розу и жвачку.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-19", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "у Маши др. Купить 41 розу и жвачку." } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-109" : {
			"origin" : "В чет новая серия выйдет.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-19", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "новая серия выйдет." } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-110" : {
			"origin" : "Выкупить билеты в чет.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-19", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Выкупить билеты" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-111" : {
			"origin" : "Встреча инвесторов состоится в чт",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-19", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Встреча инвесторов состоится" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-112" : {
			"origin" : "В чт. концерт отменяется",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-19", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "концерт отменяется" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-113" : {
			"origin" : "В пятницу на выставку напомнить",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-20", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "на выставку",           "event_alarms" : "0"  },

				{ "event_type" : "N", "event_startDate" : "2015-03-20", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "на выставку напомнить"                      },
				{ "event_type" : "N",                                          "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "В пятницу на выставку", "event_alarms" : "0"  } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-114" : {
			"origin" : "Позвали на ужин в пятница",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-20", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Позвали на ужин" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-115" : {
			"origin" : "В пятн встреча отменяется",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-20", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "встреча отменяется" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-116" : {
			"origin" : "Кота к врачу в пятн.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-20", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Кота к врачу" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-117" : {
			"origin" : "В пят купить цветы",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-20", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "купить цветы" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-118" : {
			"origin" : "Билеты дешевле заказать в пят.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-20", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Билеты дешевле заказать" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-119" : {
			"origin" : "В пт. Скажут оценки",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-20", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Скажут оценки" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-120" : {
			"origin" : "Консультация назначена в пт",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-20", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Консультация назначена" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-121" : {
			"origin" : "В субботу выходной",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "выходной" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-122" : {
			"origin" : "Рабочий день в суббота",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Рабочий день" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-123" : {
			"origin" : "Заказ отправят в субб, приготовить черные плотные мешки и лопаты",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Заказ отправят, приготовить черные плотные мешки и лопаты" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-124" : {
			"origin" : "Навестить бабулю в субб.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Навестить бабулю" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-125" : {
			"origin" : "В суб придет маляр",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "придет маляр" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-126" : {
			"origin" : "Соседи улетают, 25 апреля сдать за них показания счетчиков. Улетают в суб.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-04-25", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Соседи улетают, сдать за них показания счетчиков. Улетают в суб."    },

				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00",        "event_duration" : "30", "event_result" : "Соседи улетают, 25 апреля сдать за них показания счетчиков. Улетают" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-127" : {
			"origin" : "В сб. позвали в кино. А в пт. не позвали.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "позвали в кино. А в пт. не позвали." },

				{ "event_type" : "N", "event_startDate" : "2015-03-20", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "В сб. позвали в кино. А не позвали." } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-128" : {
			"origin" : "Моя очередь выгуливать пса в сб. Надоело. Общество по отстрелу бродячих животных: 2-12-34",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Моя очередь выгуливать пса Надоело. Общество по отстрелу бродячих животных: 2-12-34" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-129" : {
			"origin" : "Во вторник встреча в кафе",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-17", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "встреча в кафе" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-130" : {
			"origin" : "Во втор встреча в кафе",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-17", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "встреча в кафе" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-131" : {
			"origin" : "Встреча в кафе во втор.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-17", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Встреча в кафе" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-132" : {
			"origin" : "Встреча в кафе во вт.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-17", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Встреча в кафе" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-133" : {
			"origin" : "Встреча в кафе во вт",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-17", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Встреча в кафе" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-134" : {
			"origin" : "в следующий вторник назначить встречу",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-17", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "назначить встречу" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-135" : {
			"origin" : "в следующем четверг состоится встреча",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-19", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "состоится встреча" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-136" : {
			"origin" : "в следующей пятн. Состоится встреча, предупредить",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-20", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Состоится встреча", "event_alarms" : "0"  } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-137" : {
			"origin" : "в следующую субб назначена встреча",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "назначена встреча" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-138" : {
			"origin" : "Назначить встречу в следующий чет.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-19", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Назначить встречу" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-139" : {
			"origin" : "Пойти в музей в следующем втор",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-17", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Пойти в музей" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-140" : {
			"origin" : "Пойти в музей в следующей воскр",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-15", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Пойти в музей" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-141" : {
			"origin" : "Посетить музей в след пятницу",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-20", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Посетить музей" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-142" : {
			"origin" : "В следующем понедельник сдать документы",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-16", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "сдать документы" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-143" : {
			"origin" : "В следующий вт. Сдать документы",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-17", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Сдать документы" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-144" : {
			"origin" : "В следующей четв сдать документы",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-19", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "сдать документы" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-145" : {
			"origin" : "В следующую субб. Сдать документы",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Сдать документы" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-146" : {
			"origin" : "Позвонить отцу через неделю",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-20", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Позвонить отцу" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-147" : {
			"origin" : "В чтв в 7 вечера распланировать следующую неделю",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-19", "event_startTime" : "19:00", "event_duration" : "30", "event_result" : "распланировать следующую неделю"            },

				{ "event_type" : "N", "event_startDate" : "2015-03-19", "event_startTime" : "07:00", "event_duration" : "30", "event_result" : "вечера распланировать следующую неделю"     },
				{ "event_type" : "N", "event_startDate" : "2015-03-19",                              "event_duration" : "30", "event_result" : "в 7 вечера распланировать следующую неделю" },
				{ "event_type" : "N",                                            "event_startTime" : "19:00", "event_duration" : "30", "event_result" : "В чтв распланировать следующую неделю"      }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-148" : {
			"origin" : "Вс кинопоказ в кинотеатре напомнить вовремя",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-15", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "кинопоказ в кинотеатре", "event_alarms" : "0"  } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-149" : {
			"origin" : "Сдать документ в следующем январе",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2016-01-01", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Сдать документ" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		//"TC-150" : {
		//	"origin" : "Сдать форму 12-25 В следующий апрель",
		//"expectations" : [
		//		{ "event_type" : "N", "event_startDate" : "2015-04-01", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Сдать форму 12-25" } // ожидает рабочее время пользователя
		//	],
		//	"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		//},

		"TC-151" : {
			"origin" : "Сдать документы В следующей июль",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-07-01", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Сдать документы" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-152" : {
			"origin" : "Сдать документы В следующую фев",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2016-02-01", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Сдать документы" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-153" : {
			"origin" : "В следующ мае посадить примулу пораньше",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-05-01", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "посадить примулу пораньше" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-154" : {
			"origin" : "На текущий момент показатели составляют - 34,5.\nВ след. феврале результаты должны быть улучшены в два раза.Напомнить!",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2016-02-01", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "На текущий момент показатели составляют - 34,5.\nрезультаты должны быть улучшены в два раза.", 			    "event_alarms" : "0"  },

				{ "event_type" : "N", 											  "event_startTime" : "09:00","event_duration" : "30", "event_result" : "На текущий момент показатели составляют - 34,5.\nВ след. феврале результаты должны быть улучшены в два раза.", "event_alarms" : "0"  } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-155" : {
			"origin" : "В сл. апреле обещают приехать в клуб",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-04-01", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "обещают приехать в клуб" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-156" : {
			"origin" : "На следующий июнь сдавать уже 8 экзаменов, а не 6, как в этом. \nА на пятом курсе предзащита диплома уже в 20-х числах.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-06-01", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "сдавать уже 8 экзаменов, а не 6, как в этом. \nА на пятом курсе предзащита диплома уже в 20-х числах." } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-157" : {
			"origin" : "Через месяц день рождение",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-04-13", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "день рождение" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-158" : {
			"origin" : "В следующем месяце пойти на выставку",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-04-01", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "пойти на выставку" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-159" : {
			"origin" : "В следующий месяц пойти на выставку",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-04-01", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "пойти на выставку" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-160" : {
			"origin" : "На следующем месяце пойти на выставку",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-04-01", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "пойти на выставку" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-161" : {
			"origin" : "На следующий месяц пойти на выставку в 12ч 15м",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-04-01", "event_startTime" : "12:15", "event_duration" : "30", "event_result" : "пойти на выставку"           }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-162" : {
			"origin" : "23.10 подготовить форму ф 12.200 к 10 часам",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "10:00", "event_duration" : "30", "event_result" : "23.10 подготовить форму ф 12.200"            },
				{ "event_type" : "N", "event_startDate" : "2015-10-23", "event_startTime" : "22:00", "event_duration" : "30", "event_result" : "подготовить форму ф 12.200"            }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-163" : {
			"origin" : "15 Январь - посчитать пятнышки у жирафа,если и больше 2015 , позвонить на 0-99-567-3335 и назвать код 33",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2016-01-15", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "посчитать пятнышки у жирафа,если и больше 2015 , позвонить на 0-99-567-3335 и назвать код 33" }, // ожидает рабочее время пользователя
				{ "event_type" : "N", "event_startDate" : "2015-01-01", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "посчитать пятнышки у жирафа,если и больше 2015 , позвонить на 0-99-567-3335 и назвать код 33" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-164" : {
			"origin" : "5.01 в 11 открывается выставка Цукермана - коллекция украденных ложек, оцениваемая в 4 миллиона долларов на 2015 год",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2016-01-05", "event_startTime" : "11:00", "event_duration" : "30", "event_result" : "открывается выставка Цукермана - коллекция украденных ложек, оцениваемая в 4 миллиона долларов на 2015 год"      },
				{ "event_type" : "N", "event_startDate" : "2016-01-05", "event_startTime" : "23:00", "event_duration" : "30", "event_result" : "открывается выставка Цукермана - коллекция украденных ложек, оцениваемая в 4 миллиона долларов на 2015 год"      }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-165" : {
			"origin" : "02 апр 15 г годовщина смерти Васи Пупкина. Родился 23.08.1900 ветеран третьей инопланетной войны, награжден орденом 3 степени Жилетки Вассермана, в 40 лет стал профессором кафедры лапшевешанья университета УФО.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-04-02", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "годовщина смерти Васи Пупкина. Родился 23.08.1900 ветеран третьей инопланетной войны, награжден орденом 3 степени Жилетки Вассермана, в 40 лет стал профессором кафедры лапшевешанья университета УФО." } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-166" : {
			"origin" : "23.02.2015 тренинг Трихонова Э.В. на тему",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-02-23", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "тренинг Трихонова Э.В. на тему" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		//"TC-167" : {
		//	"origin" : "13го янв. в '13 комнате' вечеринка в честь НГ. Начало в полночь.",
		//	"expectations" : [
		//		{ "event_type" : "N", "event_startDate" : "2016-01-13", "event_startTime" : "00:00", "event_duration" : "30", "event_result" : "в '13 комнате' вечеринка в честь НГ. Начало." }
		//	],
		//	"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		//},
		"TC-168" : {
			"origin" : "6 фев в 16:37 Лунное затмение лучше смотреть с этой точки 35.3550902, 33.6038393",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2016-02-06", "event_startTime" : "16:37", "event_duration" : "30", "event_result" : "Лунное затмение лучше смотреть с этой точки 35.3550902, 33.6038393"         },

				{ "event_type" : "N", "event_startDate" : "2016-02-06",                              "event_duration" : "30", "event_result" : "в 16:37 Лунное затмение лучше смотреть с этой точки 35.3550902, 33.6038393" },
				{ "event_type" : "N",                                                  "event_startTime" : "16:37", "event_duration" : "30", "event_result" : "6 фев Лунное затмение лучше смотреть с этой точки 35.3550902, 33.6038393"   }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-169" : {
			"origin" : "23/04 в 9:30 5-588/2014 ПРАВОНАРУШЕНИЕ: Урамбашев Л.Р. - КоАП: ст. 12.24 ч.2; Напомнить за 40 мин",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-04-23", "event_startTime" : "09:30", "event_duration" : "30", "event_result" : "5-588/2014 ПРАВОНАРУШЕНИЕ: Урамбашев Л.Р. - КоАП: ст. 12.24 ч.2;"                            , event_alarms: "-40" },
				{ "event_type" : "N", "event_startDate" : "2015-04-23", "event_startTime" : "21:30", "event_duration" : "30", "event_result" : "5-588/2014 ПРАВОНАРУШЕНИЕ: Урамбашев Л.Р. - КоАП: ст. 12.24 ч.2;"                            , event_alarms: "-40" },

				{ "event_type" : "N", "event_startDate" : "2015-04-23", "event_startTime" : "09:30", "event_duration" : "30", "event_result" : "5-588/2014 ПРАВОНАРУШЕНИЕ: Урамбашев Л.Р. - КоАП: ст. 12.24 ч.2; Напомнить за 40 мин"        },
				{ "event_type" : "N", "event_startDate" : "2015-04-23", "event_startTime" : "21:30", "event_duration" : "30", "event_result" : "5-588/2014 ПРАВОНАРУШЕНИЕ: Урамбашев Л.Р. - КоАП: ст. 12.24 ч.2; Напомнить за 40 мин"        },
				{ "event_type" : "N", "event_startDate" : "2015-04-23",                              "event_duration" : "30", "event_result" : "в 9:30 5-588/2014 ПРАВОНАРУШЕНИЕ: Урамбашев Л.Р. - КоАП: ст. 12.24 ч.2; Напомнить за 40 мин" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-170" : {
			"origin" : "05-02-15 Отложили! Набиев Б.И. оглы - ст. 30 ч.1, ст.228.1 ч.5 УК РФ;\nХаритонов А.Г. - ст.228.1 ч.3 п.а; ст.33 ч.3-ст.174.1 ч.3; ст.33 ч.3-ст.228.1 ч.3 п.а; ст.33 ч.3-ст.228.1 ч.3 п.а; ст.33 ч.3-ст.228.1 ч.3 п.а; ст.33 ч.3-ст.228.1 ч.3 п.а; ст.33 ч.3-ст.228.1 ч.3 п.а; ст.33 ч.3-ст.228.1 ч.3 п.а; ст.33 ч.3-ст.228.1 ч.3 п.а; ст. 30 ч.3, ст.33 ч.3-ст.228.1 ч.3 п.а; ст. 30 ч.3, ст.33 ч.3-ст.228.1 ч.3 п.а; ст. 30 ч.3, ст.33 ч.3-ст.228.1 ч.4 п.а; ст.33 ч.3-ст.228.1 ч.3 п.п.а,г; ст. 30 ч.1, ст.33 ч.3-ст.228.1 ч.4 п.п.а,г; ст. 30 ч.3, ст.33 ч.3-ст.228.1 ч.4 п.а УК РФ;\tШахбазов А.А. оглы - ст. 30 ч.3, ст.228.1 ч.3 п.п.а,г; ст. 30 ч.1, ст.228.1 ч.5 УК РФ; Шахтарин И.С. - ст.174.1 ч.3; ст.228.1 ч.3 п.а; ст.228.1 ч.3 п.а; ст.228.1 ч.3 п.а; ст.228.1 ч.3 п.а; ст.228.1 ч.3 п.а; ст.228.1 ч.3 п.а; ст.228.1 ч.3 п.а; ст. 30 ч.3, ст.228.1 ч.3 п.а; ст. 30 ч.3, ст.228.1 ч.3 п.а; ст. 30 ч.3, ст.228.1 ч.4 п.а; ст.228.1 ч.3 п.п.а,г; ст. 30 ч.3, ст.228.1 ч.4 п.а УК РФ",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-02-05", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Отложили! Набиев Б.И. оглы - ст. 30 ч.1, ст.228.1 ч.5 УК РФ;\nХаритонов А.Г. - ст.228.1 ч.3 п.а; ст.33 ч.3-ст.174.1 ч.3; ст.33 ч.3-ст.228.1 ч.3 п.а; ст.33 ч.3-ст.228.1 ч.3 п.а; ст.33 ч.3-ст.228.1 ч.3 п.а; ст.33 ч.3-ст.228.1 ч.3 п.а; ст.33 ч.3-ст.228.1 ч.3 п.а; ст.33 ч.3-ст.228.1 ч.3 п.а; ст.33 ч.3-ст.228.1 ч.3 п.а; ст. 30 ч.3, ст.33 ч.3-ст.228.1 ч.3 п.а; ст. 30 ч.3, ст.33 ч.3-ст.228.1 ч.3 п.а; ст. 30 ч.3, ст.33 ч.3-ст.228.1 ч.4 п.а; ст.33 ч.3-ст.228.1 ч.3 п.п.а,г; ст. 30 ч.1, ст.33 ч.3-ст.228.1 ч.4 п.п.а,г; ст. 30 ч.3, ст.33 ч.3-ст.228.1 ч.4 п.а УК РФ;\tШахбазов А.А. оглы - ст. 30 ч.3, ст.228.1 ч.3 п.п.а,г; ст. 30 ч.1, ст.228.1 ч.5 УК РФ; Шахтарин И.С. - ст.174.1 ч.3; ст.228.1 ч.3 п.а; ст.228.1 ч.3 п.а; ст.228.1 ч.3 п.а; ст.228.1 ч.3 п.а; ст.228.1 ч.3 п.а; ст.228.1 ч.3 п.а; ст.228.1 ч.3 п.а; ст. 30 ч.3, ст.228.1 ч.3 п.а; ст. 30 ч.3, ст.228.1 ч.3 п.а; ст. 30 ч.3, ст.228.1 ч.4 п.а; ст.228.1 ч.3 п.п.а,г; ст. 30 ч.3, ст.228.1 ч.4 п.а УК РФ" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-171" : {
			"origin" : "04 марта 2015 года состоится Торжественное бракосочетание Олега и Татьяны. Приглашаем вас бла бла бла бла бла бла бла бла бла бла бла бал. План мероприятия: 1. в 9:00 Загс Приволжского района г. Казани, зал № 9. Адрес : ул. Зорге,д. 12-05. 2.в 10:30 Парк культуры и отдыха - фотосессия 3. в 14:00 Кафе 'Свитер' ул. Профсоюзная, 7,5. Подходить к 8:30",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-04", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "состоится Торжественное бракосочетание Олега и Татьяны. Приглашаем вас бла бла бла бла бла бла бла бла бла бла бла бал. План мероприятия: 1. Загс Приволжского района г. Казани, зал № 9. Адрес : ул. Зорге,д. 12-05. 2.в 10:30 Парк культуры и отдыха - фотосессия 3. в 14:00 Кафе 'Свитер' ул. Профсоюзная, 7,5. Подходить к 8:30"        },
				{ "event_type" : "N", "event_startDate" : "2015-03-04", "event_startTime" : "20:30", "event_duration" : "30", "event_result" : "состоится Торжественное бракосочетание Олега и Татьяны. Приглашаем вас бла бла бла бла бла бла бла бла бла бла бла бал. План мероприятия: 1. в 9:00 Загс Приволжского района г. Казани, зал № 9. Адрес : ул. Зорге,д. 12-05. 2.в 10:30 Парк культуры и отдыха - фотосессия 3. в 14:00 Кафе 'Свитер' ул. Профсоюзная, 7,5. Подходить"        },

				{ "event_type" : "N", "event_startDate" : "2015-03-03",                              "event_duration" : "30", "event_result" : "состоится Торжественное бракосочетание Олега и Татьяны. Приглашаем вас бла бла бла бла бла бла бла бла бла бла бла бал. План мероприятия: 1. в 9:00 Загс Приволжского района г. Казани, зал № 9. Адрес : ул. Зорге,д. 12-05. 2.в 10:30 Парк культуры и отдыха - фотосессия 3. в 14:00 Кафе 'Свитер' ул. Профсоюзная, 7,5. Подходить к 8:30" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-172" : {
			"origin" : "13.06.15 в 18:10 Реал Мадрид - Депортиво. Ла Лига. Сезон 14/15. В прошлом году счет был 3.5",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-06-13", "event_startTime" : "18:10", "event_duration" : "30", "event_result" : "Реал Мадрид - Депортиво. Ла Лига. Сезон 14/15. В прошлом году счет был 3.5"          },

				{ "event_type" : "N", "event_startDate" : "2015-06-13",                              "event_duration" : "30", "event_result" : "в 18:10 Реал Мадрид - Депортиво. Ла Лига. Сезон 14/15. В прошлом году счет был 3.5"  },
				{ "event_type" : "N",                                   "event_startTime" : "18:10", "event_duration" : "30", "event_result" : "13.06.15 Реал Мадрид - Депортиво. Ла Лига. Сезон 14/15. В прошлом году счет был 3.5" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-173" : {
			"origin" : "'Август восьмого' - российский кинофильм Джаника Файзиева о конфликте в Южной Осетии, произошедшем в августе 2008 года. Премьера 21 февраля 2012 года. Телепремьера на Первом канале 4го мая в 18:20.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-08-01", "event_startTime" : "18:20", "event_duration" : "30", "event_result" : "'Август восьмого' - российский кинофильм Джаника Файзиева о конфликте в Южной Осетии, произошедшем 2008 года. Премьера 21 февраля 2012 года. Телепремьера на Первом канале 4го мая."  }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-174" : {
			"origin" : "28.04 в 9:40 ДЕЛО № 2-8811/2014 ~ М-8743/2014 КАТЕГОРИЯ: Другие жилищные споры \nИСТЕЦ(ЗАЯВИТЕЛЬ): Данилов И.Д. Дата поступления 23.10.2014 \tНачало течения срока рассмотрения дела - 02.12.2014 напомнить за час",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-04-28", "event_startTime" : "09:40", "event_duration" : "30", "event_result" : "ДЕЛО № 2-8811/2014 ~ М-8743/2014 КАТЕГОРИЯ: Другие жилищные споры \nИСТЕЦ(ЗАЯВИТЕЛЬ): Данилов И.Д. Дата поступления 23.10.2014 \tНачало течения срока рассмотрения дела - 02.12.2014"                 , "event_alarms":"-60" },
				{ "event_type" : "N", "event_startDate" : "2015-04-28", "event_startTime" : "21:40", "event_duration" : "30", "event_result" : "ДЕЛО № 2-8811/2014 ~ М-8743/2014 КАТЕГОРИЯ: Другие жилищные споры \nИСТЕЦ(ЗАЯВИТЕЛЬ): Данилов И.Д. Дата поступления 23.10.2014 \tНачало течения срока рассмотрения дела - 02.12.2014"                 , "event_alarms":"-60" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-175" : {
			"origin" : "Ришат Тухватуллин - 05/ЯНВ в 17:00 500-1000 Дворец культуры им. В.И. Ленина",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2016-01-05", "event_startTime" : "17:00", "event_duration" : "30", "event_result" : "Ришат Тухватуллин 500-1000 Дворец культуры им. В.И. Ленина"         },

				{ "event_type" : "N", "event_startDate" : "2016-01-05",                              "event_duration" : "30", "event_result" : "Ришат Тухватуллин - в 17:00 500-1000 Дворец культуры им. В.И. Ленина" },
				{ "event_type" : "N",                                                  "event_startTime" : "17:00", "event_duration" : "30", "event_result" : "Ришат Тухватуллин - 05/ЯНВ 500-1000 Дворец культуры им. В.И. Ленина"  }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-176" : {
			"origin" : "Праздничный новогодний концерт. Дирижер Ренат Салаватов. Ренат Салаватов - заслуженный артист России, народный артист Татарстана. \nС 2003 г. – главный дирижер Татарского академического государственного театра оперы и балета им.М.Джалиля. 1700 - 3500 ГБКЗ им. С.Сайдашева 27.03 в 17:00 на 2,5 часа вы бла бла бла бла",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-27", "event_startTime" : "17:00", "event_duration" : "150", "event_result" : "Праздничный новогодний концерт. Дирижер Ренат Салаватов. Ренат Салаватов - заслуженный артист России, народный артист Татарстана. \nС 2003 г. – главный дирижер Татарского академического государственного театра оперы и балета им.М.Джалиля. 1700 - 3500 ГБКЗ им. С.Сайдашева вы бла бла бла бла"					},

				{ "event_type" : "N", "event_startDate" : "2015-03-27",                              "event_duration" : "150", "event_result" : "Праздничный новогодний концерт. Дирижер Ренат Салаватов. Ренат Салаватов - заслуженный артист России, народный артист Татарстана. \nС 2003 г. – главный дирижер Татарского академического государственного театра оперы и балета им.М.Джалиля. 1700 - 3500 ГБКЗ им. С.Сайдашева в 17:00 вы бла бла бла бла"             },
				{ "event_type" : "N", "event_startDate" : "2015-03-27", "event_startTime" : "17:00", "event_duration" : "30",  "event_result" : "Праздничный новогодний концерт. Дирижер Ренат Салаватов. Ренат Салаватов - заслуженный артист России, народный артист Татарстана. \nС 2003 г. – главный дирижер Татарского академического государственного театра оперы и балета им.М.Джалиля. \t1700 - 3500 ГБКЗ им. С.Сайдашева на 2,5 часа вы бла бла бла бла"       },
				{ "event_type" : "N", "event_startDate" : "2015-03-27",                              "event_duration" : "30",  "event_result" : "Праздничный новогодний концерт. Дирижер Ренат Салаватов. Ренат Салаватов - заслуженный артист России, народный артист Татарстана. \nС 2003 г. – главный дирижер Татарского академического государственного театра оперы и балета им.М.Джалиля. 1700 - 3500 ГБКЗ им. С.Сайдашева в 17:00 на 2,5 часа вы бла бла бла бла" },
				{ "event_type" : "N",                                                  "event_startTime" : "17:00", "event_duration" : "150", "event_result" : "Праздничный новогодний концерт. Дирижер Ренат Салаватов. Ренат Салаватов - заслуженный артист России, народный артист Татарстана. \nС 2003 г. – главный дирижер Татарского академического государственного театра оперы и балета им.М.Джалиля. 1700 - 3500 ГБКЗ им. С.Сайдашева 27.03 вы бла бла бла бла"               }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-177" : {
			"origin" : "В прошлое воскресенье состоялась игра Сибирь:Лада со счетом 4:3 и собрала в 2 раза больше зрителей чем в прошлую встречу с Сочи. \nСледующая игра Сибири с Югрой состоится 28, апр. в 18:00",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-04-28", "event_startTime" : "18:00", "event_duration" : "30", "event_result" : "В прошлое воскресенье состоялась игра Сибирь:Лада со счетом 4:3 и собрала в 2 раза больше зрителей чем в прошлую встречу с Сочи. \nСледующая игра Сибири с Югрой состоится"          },

				{ "event_type" : "N", "event_startDate" : "2015-04-28",                              "event_duration" : "30", "event_result" : "В прошлое воскресенье состоялась игра Сибирь:Лада со счетом 4:3 и собрала в 2 раза больше зрителей чем в прошлую встречу с Сочи. \nСледующая игра Сибири с Югрой состоится, в 18:00" },
				{ "event_type" : "N",                                                 "event_startTime" : "18:00", "event_duration" : "30", "event_result" : "В прошлое воскресенье состоялась игра Сибирь:Лада со счетом 4:3 и собрала в 2 раза больше зрителей чем в прошлую встречу с Сочи. \nСледующая игра Сибири с Югрой состоится 28, апр." }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-178" : {
			"origin" : "Установочная лекция по экономике перенесена на 17.01 в 12:30 каб 14",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2016-01-17", "event_startTime" : "12:30", "event_duration" : "30", "event_result" : "Установочная лекция по экономике перенесена каб 14"          },

				{ "event_type" : "N", "event_startDate" : "2016-01-17",                              "event_duration" : "30", "event_result" : "Установочная лекция по экономике перенесена в 12:30 каб 14"  },
				{ "event_type" : "N",                                                   "event_startTime" : "12:30", "event_duration" : "30", "event_result" : "Установочная лекция по экономике перенесена на 17.01 каб 14" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-179" : {
			"origin" : "22 янв в 8 утра первая тренировка на сорок мин. Взять: рез-ты медосмотра справку 12-10 форму Напомнить за два часа!",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2016-01-22", "event_startTime" : "08:00",  "event_duration" : "40", event_alarms: "-120", "event_result" : "первая тренировка Взять: рез-ты медосмотра справку 12-10 форму!"   }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-180" : {
			"origin" : "Подарки на Юбилей дядь Юры, 55 лет 15/03 \n- 5000 руб - норковая шапка (7 тр) - зубы (золотые) на брелке (4 т.р.) -хвост скунса на шапке (3458 руб)\tНапомнить за 2 дня",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-15", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Подарки на Юбилей дядь Юры, 55 лет \n- 5000 руб - норковая шапка (7 тр) - зубы (золотые) на брелке (4 т.р.) -хвост скунса на шапке (3458 руб)"                    , "event_alarms" : "-2880"},

				{ "event_type" : "N", "event_startDate" : "2015-03-15", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Подарки на Юбилей дядь Юры, 55 лет \n- 5000 руб - норковая шапка (7 тр) - зубы (золотые) на брелке (4 т.р.) -хвост скунса на шапке (3458 руб) Напомнить за 2 дня" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-181" : {
			"origin" : "Хочу хочу пойти!! 13 января 2015 Биллис бэнд выступают в Капелле (СПб) в Москве в 16 Тонн!",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-01-13", "event_startTime" : "16:00", "event_duration" : "30", "event_result" : "Хочу хочу пойти!! Биллис бэнд выступают в Капелле (СПб) в Москве Тонн!" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-182" : {
			"origin" : "Рука Дьявола\nWhere the Devil Hides (16+) Триллер, США, 2014, 86 мин. Режиссёр: Кристиан Е. Кристиансен В ролях: Руфус Сьюэлл, Алисия Дебнем Кери, Томас МакДонелл, Аделаида Кэйн, Леа Пайпс, Рик Рейц, Дженнифер Карпентер, Колм Мини, Джим Маккини, Николь Эллиотт Дата премьеры: 18,Фев",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2016-02-18", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Рука Дьявола\nWhere the Devil Hides (16+) Триллер, США, 2014, 86 мин. Режиссёр: Кристиан Е. Кристиансен В ролях: Руфус Сьюэлл, Алисия Дебнем Кери, Томас МакДонелл, Аделаида Кэйн, Леа Пайпс, Рик Рейц, Дженнифер Карпентер, Колм Мини, Джим Маккини, Николь Эллиотт Дата премьеры:" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-183" : {//TODO time tokens for this case
			"origin" : "Расписание киносеанса на 29.01 3D Port cinema 17:20 19:10 22:50 00:40 - мест нет Grand Cinema 17:05 20:35 23:00 00:15 - мест нет Suvar 18:45 - уточнить",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2016-01-29", "event_startTime" : "17:20", "event_duration" : "30", "event_result" : "Расписание киносеанса 3D Port cinema 19:10 22:50 00:40 - мест нет Grand Cinema 17:05 20:35 23:00 00:15 - мест нет Suvar 18:45 - уточнить" },
				{ "event_type" : "N", "event_startDate" : "2016-01-29", "event_startTime" : "19:10", "event_duration" : "30", "event_result" : "Расписание киносеанса 3D Port cinema 17:20 22:50 00:40 - мест нет Grand Cinema 17:05 20:35 23:00 00:15 - мест нет Suvar 18:45 - уточнить" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-184" : {
			"origin" : "Дело 5-617/2014 \n24/февраль в 14:00 ПРАВОНАРУШЕНИЕ: Гаптрахманов А.И. - КоАП: ст. 12.24 ч.1; Шакирова Г.М. - КоАП: ст. 12.24 ч.1;",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2016-02-24", "event_startTime" : "14:00", "event_duration" : "30", "event_result" : "Дело 5-617/2014 \nПРАВОНАРУШЕНИЕ: Гаптрахманов А.И. - КоАП: ст. 12.24 ч.1; Шакирова Г.М. - КоАП: ст. 12.24 ч.1;"            },

				{ "event_type" : "N", "event_startDate" : "2016-02-24",                              "event_duration" : "30", "event_result" : "Дело 5-617/2014 \nв 14:00 ПРАВОНАРУШЕНИЕ: Гаптрахманов А.И. - КоАП: ст. 12.24 ч.1; Шакирова Г.М. - КоАП: ст. 12.24 ч.1;"    },
				{ "event_type" : "N",                                                   "event_startTime" : "14:00", "event_duration" : "30", "event_result" : "Дело 5-617/2014 \n24/февраль ПРАВОНАРУШЕНИЕ: Гаптрахманов А.И. - КоАП: ст. 12.24 ч.1; Шакирова Г.М. - КоАП: ст. 12.24 ч.1;" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-185" : {
			"origin" : "Евросоюз выделил Украине 500 миллионов евро в рамках второй программы макрофинансовой помощи (MFA2) 3 декабря. В течение 2014 года Украина получала 100 миллионов евро 20 мая, 500 миллионов — 17 июня , 260 миллионов — 12 ноября. Общий объем поддержки составляет 1,61 миллиарда евро.Россия нарушила принципы Всемирной торговой организации (ВТО), введя ограничения в ответ на санкции США, Евросоюза и ряд других стран. Такие утверждения содержатся в докладе офиса торгового представителя Соединенных Штатов, опубликованном 29,05.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-12-03", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Евросоюз выделил Украине 500 миллионов евро в рамках второй программы макрофинансовой помощи (MFA2). В течение 2014 года Украина получала 100 миллионов евро 20 мая, 500 миллионов — 17 июня , 260 миллионов — 12 ноября. Общий объем поддержки составляет 1,61 миллиарда евро.Россия нарушила принципы Всемирной торговой организации (ВТО), введя ограничения в ответ на санкции США, Евросоюза и ряд других стран. Такие утверждения содержатся в докладе офиса торгового представителя Соединенных Штатов, опубликованном 29,05." } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		//"TC-186" : {
		//	"origin" : "18, сентябрь,2014 в 10 утра - экстремисты напали на нигерийскую деревню Гумсури. В результате атаки погибли 32 человека, 185 женщин и детей попали в плен.В апреле этого года члены 'Боко Харам' похитили 276 школьниц в городе.",
		//	"expectations" : [
		//		{ "event_type" : "N", "event_startDate" : "2014-09-18", "event_startTime" : "10:00", "event_duration" : "30", "event_result" : "- экстремисты напали на нигерийскую деревню Гумсури. В результате атаки погибли 32 человека, 185 женщин и детей попали в плен.В апреле этого года члены 'Боко Харам' похитили 276 школьниц в городе."                   },
		//
		//		{ "event_type" : "N",                                   "event_startTime" : "10:00", "event_duration" : "30", "event_result" : "18, сентябрь,2014 - экстремисты напали на нигерийскую деревню Гумсури. В результате атаки погибли 32 человека, 185 женщин и детей попали в плен.В апреле этого года члены 'Боко Харам' похитили 276 школьниц в городе." },
		//		{ "event_type" : "N", "event_startDate" : "2014-09-18",                              "event_duration" : "30", "event_result" : "в 10 утра - экстремисты напали на нигерийскую деревню Гумсури. В результате атаки погибли 32 человека, 185 женщин и детей попали в плен.В апреле этого года члены 'Боко Харам' похитили 276 школьниц в городе."         }
		//	],
		//	"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		//},

		"TC-187" : {
			"origin" : "Сдать извещение об освобождении от уплаты аванса 19 нояб. с 8 до 11 .Напомнить за час!\nФорма извещения об освобождении от уплаты авансового платежа утверждена приказом ФНС России от 14 июня 2012 г. № ММВ-7-3/405 представить банковскую гарантию на январь 2015 г.;",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-11-19", "event_startTime" : "08:00", "event_duration" : "180", "event_result" : "Сдать извещение об освобождении от уплаты аванса .\nФорма извещения об освобождении от уплаты авансового платежа утверждена приказом ФНС России от 14 июня 2012 г. № ММВ-7-3/405 представить банковскую гарантию на январь 2015 г.;",         "event_alarms" : "-60"  },
				{ "event_type" : "N", "event_startDate" : "2015-11-19", "event_startTime" : "20:00", "event_duration" : "180", "event_result" : "Сдать извещение об освобождении от уплаты аванса .\nФорма извещения об освобождении от уплаты авансового платежа утверждена приказом ФНС России от 14 июня 2012 г. № ММВ-7-3/405 представить банковскую гарантию на январь 2015 г.;",       "event_alarms" : "-60"},



				{ "event_type" : "N", "event_startDate" : "2016-11-19", "event_startTime" : "08:00", "event_duration" : "180", "event_result" : "Сдать извещение об освобождении от уплаты аванса. Напомнить за час!\nФорма извещения об освобождении от уплаты авансового платежа утверждена приказом ФНС России от 14 июня 2012 г. № ММВ-7-3/405 представить банковскую гарантию на январь 2015 г.;"             },
				{ "event_type" : "N", "event_startDate" : "2016-11-19", "event_startTime" : "20:00", "event_duration" : "180", "event_result" : "Сдать извещение об освобождении от уплаты аванса. Напомнить за час!\nФорма извещения об освобождении от уплаты авансового платежа утверждена приказом ФНС России от 14 июня 2012 г. № ММВ-7-3/405 представить банковскую гарантию на январь 2015 г.;"             },
				{ "event_type" : "N",                                                    "event_startTime" : "08:00", "event_duration" : "180", "event_result" : "Сдать извещение об освобождении от уплаты аванса 19.нояб.\nФорма извещения об освобождении от уплаты авансового платежа утверждена приказом ФНС России от 14 июня 2012 г. № ММВ-7-3/405 представить банковскую гарантию на январь 2015 г.;"                       },
				{ "event_type" : "N",                                                    "event_startTime" : "20:00", "event_duration" : "180", "event_result" : "Сдать извещение об освобождении от уплаты аванса 19.нояб.\nФорма извещения об освобождении от уплаты авансового платежа утверждена приказом ФНС России от 14 июня 2012 г. № ММВ-7-3/405 представить банковскую гарантию на январь 2015 г.;"                       },
				{ "event_type" : "N", "event_startDate" : "2016-11-19",                              "event_duration" : "30",  "event_result" : "Сдать извещение об освобождении от уплаты аванса с 8 до 11 .\nФорма извещения об освобождении от уплаты авансового платежа утверждена приказом ФНС России от 14 июня 2012 г. № ММВ-7-3/405 представить банковскую гарантию на январь 2015 г.;"                    },
				{ "event_type" : "N", "event_startDate" : "2016-11-19",                              "event_duration" : "30",  "event_result" : "Сдать извещение об освобождении от уплаты аванса с 8 до 11 .Напомнить за час!\nФорма извещения об освобождении от уплаты авансового платежа утверждена приказом ФНС России от 14 июня 2012 г. № ММВ-7-3/405 \tпредставить банковскую гарантию на январь 2015 г.;" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-188" : {
			"origin" : "Суд огласил приговор 43-летнему Юрию Скрипалеву, обвиняемому в убийстве священника и поджоге его дома в Белореченске в октябре 2013 года. Он также признан виновным в угоне автомобиля, сообщает 'Интерфакс'. Приговор вступит в силу 05/мар. 2015 года",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-05", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Суд огласил приговор 43-летнему Юрию Скрипалеву, обвиняемому в убийстве священника и поджоге его дома в Белореченске в октябре 2013 года. Он также признан виновным в угоне автомобиля, сообщает 'Интерфакс'. Приговор вступит в силу" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-189" : {
			"origin" : "В марте, 8 в 17:45 Отчетное собрание по рез-татам работы Волонтерского крыла 'Золотая антилопа'\nна повестке: причины уменьшения на 12 % монет из копытец антилопы итоги за 2014 год Зал 5.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2016-03-08", "event_startTime" : "17:45", "event_duration" : "30", "event_result" : "Отчетное собрание по рез-татам работы Волонтерского крыла 'Золотая антилопа'\nна повестке: причины уменьшения на 12 % монет из копытец антилопы итоги за 2014 год Зал 5."            },

				{ "event_type" : "N", "event_startDate" : "2016-03-08",                              "event_duration" : "30", "event_result" : "в 17:45 Отчетное собрание по рез-татам работы Волонтерского крыла 'Золотая антилопа'\nна повестке: причины уменьшения на 12 % монет из копытец антилопы итоги за 2014 год Зал 5."    },
				{ "event_type" : "N",                                                  "event_startTime" : "17:45", "event_duration" : "30", "event_result" : "В марте, 8 Отчетное собрание по рез-татам работы Волонтерского крыла 'Золотая антилопа'\nна повестке: причины уменьшения на 12 % монет из копытец антилопы итоги за 2014 год Зал 5." }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-190" : {//TODO arguable
			"origin" : "Внимание,Студенты 4 курса!\nВ связи с рабочей командировкой лекции по ТГП 5.03 в 10:00, 11.03 в 13:20 отменяются. Научные статьи завизировать у науч.рук-лей и сдать мне до отъезда. Крайний срок - Март, 2",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2016-03-05", "event_startTime" : "10:00", "event_duration" : "30", "event_result" : "Внимание,Студенты 4 курса!\nВ связи с рабочей командировкой лекции по ТГП, 11.03 в 13:20 отменяются. Научные статьи завизировать у науч.рук-лей и сдать мне до отъезда. Крайний срок - Март, 2" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-191" : {
			"origin" : "Самый счастлиый день в жизни? 13 мар. 16 года\nМне подарили щенка французского бульдога, 2 месяца отроду. Мне было 17 лет и вот вот должно было стукнуть 18, 15 числа.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2016-03-13", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Самый счастлиый день в жизни?\nМне подарили щенка французского бульдога, 2 месяца отроду. Мне было 17 лет и вот вот должно было стукнуть 18, 15 числа." } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-192" : {
			"origin" : "День космонавтики 12 апреля.\nКак праздник - День космонавтики - он был установлен Указом Президиума Верховного Совета СССР от 9 апреля 1962 года, а международный статус получил в 1968 году на конференции Международной авиационной федерации.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-04-12", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "День космонавтики.\nКак праздник - День космонавтики - он был установлен Указом Президиума Верховного Совета СССР от 9 апреля 1962 года, а международный статус получил в 1968 году на конференции Международной авиационной федерации." } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-193" : {
			"origin" : "26-05 ежегодно в нашей стране отмечается День российского предпринимательства. 18 октября 2007 года Президентом Российской Федерации В.В. Путиным был подписан Указ № 1381 (Д) 'О Дне российского предпринимательства' Но еще раньше, в эпоху существования Советского Союза, в соответствии с Законом СССР 'Об индивидуальной трудовой деятельности' от 19 ноября 1986 года, предпринимательская деятельность впервые приобрела законный статус.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-05-26", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "ежегодно в нашей стране отмечается День российского предпринимательства. 18 октября 2007 года Президентом Российской Федерации В.В. Путиным был подписан Указ № 1381 (Д) 'О Дне российского предпринимательства' Но еще раньше, в эпоху существования Советского Союза, в соответствии с Законом СССР 'Об индивидуальной трудовой деятельности' от 19 ноября 1986 года, предпринимательская деятельность впервые приобрела законный статус." } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-194" : {
			"origin" : "25, май - Последний звонок. Торжественная часть в 9:00 Затем едем на базу отдыха 'совушка' - в 11 Сбор по 5000 рублей",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-05-25", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Последний звонок. Торжественная часть Затем едем на базу отдыха 'совушка' - в 11 Сбор по 5000 рублей"         },

				{ "event_type" : "N", "event_startDate" : "2015-05-25",                              "event_duration" : "30", "event_result" : "- Последний звонок. Торжественная часть в 9:00 Затем едем на базу отдыха 'совушка' - в 11 Сбор по 5000 рублей"  },
				{ "event_type" : "N",                                                   "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "25, май - Последний звонок. Торжественная часть Затем едем на базу отдыха 'совушка' - в 11 Сбор по 5000 рублей" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-195" : {//TODO where is alarms?
			"origin" : "Еженедельное собрание жильцов дома № 13 пройдет 7/06/15 в 19:30\nОбсуждение оплаты замены лифта, покраски лестничных проходов. Необходимо присутствие 2/3 кол-ва жильцов. Предупредить за час",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-06-07", "event_startTime" : "19:30", "event_duration" : "30", "event_result" : "Еженедельное собрание жильцов дома № 13 пройдет\nОбсуждение оплаты замены лифта, покраски лестничных проходов. Необходимо присутствие 2/3 кол-ва жильцов."                            , "event_alarms" : "-60"},

				{ "event_type" : "N",                                   "event_startTime" : "19:30", "event_duration" : "30", "event_result" : "Еженедельное собрание жильцов дома № 13 пройдет 7/6/15\nОбсуждение оплаты замены лифта, покраски лестничных проходов. Необходимо присутствие 2/3 кол-ва жильцов."                      },
				{ "event_type" : "N", "event_startDate" : "2015-06-07",                              "event_duration" : "30", "event_result" : "Еженедельное собрание жильцов дома № 13 пройдет в 19:30\nОбсуждение оплаты замены лифта, покраски лестничных проходов. Необходимо присутствие 2/3 кол-ва жильцов. Предупредить за час" },
				{ "event_type" : "N", "event_startDate" : "2015-06-07",                              "event_duration" : "30", "event_result" : "Еженедельное собрание жильцов дома № 13 пройдет в 19:30\nОбсуждение оплаты замены лифта, покраски лестничных проходов. Необходимо присутствие 2/3 кол-ва жильцов."                     },
				{ "event_type" : "N", "event_startDate" : "2015-06-07", "event_startTime" : "19:30", "event_duration" : "30", "event_result" : "Еженедельное собрание жильцов дома № 13 пройдет \nОбсуждение оплаты замены лифта, покраски лестничных проходов. Необходимо присутствие 2/3 кол-ва жильцов. Предупредить за час"        }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-196" : {
			"origin" : "Задача № 9/12 ,решить до 20-го числа июня\nсдать на кафедру,в 16 каб.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-06-20", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Задача № 9/12 ,решить до\nсдать на кафедру,в 16 каб."            }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-197" : {
			"origin" : "09 июн 2016 года в доме № 62/3 планируется отключение горячей и холодной воды на период с 8:00 до 15:00 в связи с проведением технических работ.\nТел. для справок : 8456 34454 44",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2016-06-09", "event_startTime" : "08:00", "event_duration" : "420", "event_result" : "в доме № 62/3 планируется отключение горячей и холодной воды на период в связи с проведением технических работ.\nТел. для справок : 8456 34454 44"                           },

				{ "event_type" : "N",                                   "event_startTime" : "08:00", "event_duration" : "420", "event_result" : "09.июн 2016 года в доме № 62/3 планируется отключение горячей и холодной воды на период в связи с проведением технических работ.\nТел. для справок : 8456 34454 44"          },
				{ "event_type" : "N", "event_startDate" : "2016-06-09",                              "event_duration" : "30",  "event_result" : "в доме № 62/3 планируется отключение горячей и холодной воды на период с 8:00 по 15:00 в связи с проведением технических работ.\nТел. для справок : 8456 34454 44"           },
				{ "event_type" : "N",                                   "event_startTime" : "08:00", "event_duration" : "30",  "event_result" : "09.июн 2016 года в доме № 62/3 планируется отключение горячей и холодной воды на период по 15:00 в связи с проведением технических работ.\nТел. для справок : 8456 34454 44" },
				{ "event_type" : "N", "event_startDate" : "2016-06-09", "event_startTime" : "08:00", "event_duration" : "30",  "event_result" : "в доме № 62/3 планируется отключение горячей и холодной воды на период по 15:00 в связи с проведением технических работ.\nТел. для справок : 8456 34454 44"                  }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-198" : {
			"origin" : "11/22/63 - Новая книга Стивена Кинга, вышла в 2013 году.\nВ россии начнет продаваться с июн., 15.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-06-01", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "11/22/63 - Новая книга Стивена Кинга, вышла в 2013 году.\nВ россии начнет продаваться." },
				{ "event_type" : "N", "event_startDate" : "2013-06-01", "event_duration" : "30", "event_result" : "11/22/63 - Новая книга Стивена Кинга, вышла\nВ россии начнет продаваться." }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-199" : {
			"origin" : "Эндокринолог на 7.07.2015 в 8:45, каб. 12.\n-мед карту,рез-ты анализов ТТ 203, КХЧ 12/13",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-07-07", "event_startTime" : "08:45", "event_duration" : "30", "event_result" : "Эндокринолог, каб. 12.\n-мед карту,рез-ты анализов ТТ 203, КХЧ 12/13"              },
				{ "event_type" : "N", "event_startDate" : "2015-07-07", "event_startTime" : "20:45", "event_duration" : "30", "event_result" : "Эндокринолог, каб. 12.\n-мед карту,рез-ты анализов ТТ 203, КХЧ 12/13"              },
				{ "event_type" : "N", "event_startDate" : "2015-07-07",                              "event_duration" : "30", "event_result" : "Эндокринолог в 8:45, каб. 12.\n-мед карту,рез-ты анализов ТТ 203, КХЧ 12/13"       },
				{ "event_type" : "N",                                   "event_startTime" : "08:45", "event_duration" : "30", "event_result" : "Эндокринолог на 7.07.2015, каб. 12.\n-мед карту,рез-ты анализов ТТ 203, КХЧ 12/13" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-200" : {
			"origin" : "Выпускной 28 июля в Ривьере\nк 10 числу надо подать списки студенты - 115 точно идут (из 150), 6 сомневаются преподаватели - 23 точно идут (5 под вопросом) сдавать по 7000 (2000 на преподов, 5000 на себя)",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-07-28", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Выпускной в Ривьере\nк 10 числу надо подать списки студенты - 115 точно идут (из 150), 6 сомневаются преподаватели - 23 точно идут (5 под вопросом) сдавать по 7000 (2000 на преподов, 5000 на себя)" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-201" : {
			"origin" : "Напомнить 19/07/15 в 9. - Перечислить ежемесячный обязательный платеж в ФФОМС за июнь 2014 г.\nСтрахователи - работодатели заполняют платежное поручение по таким реквизитам. 39210202101081011160; ОКТМО; 0; 0; 0; 0; 0 Рекомендуемая форма отчета утверждена письмом ФСС РФ от 2 июня 2014 г. № 17-03-18/05-7094.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-07-19", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "- Перечислить ежемесячный обязательный платеж в ФФОМС за июнь 2014 г.\nСтрахователи - работодатели заполняют платежное поручение по таким реквизитам. 39210202101081011160; ОКТМО; 0; 0; 0; 0; 0 Рекомендуемая форма отчета утверждена письмом ФСС РФ от 2 июня 2014 г. № 17-03-18/05-7094.",                    "event_alarms" : "0"  },
				{ "event_type" : "N", "event_startDate" : "2015-07-19", "event_startTime" : "21:00", "event_duration" : "30", "event_result" : "- Перечислить ежемесячный обязательный платеж в ФФОМС за июнь 2014 г.\nСтрахователи - работодатели заполняют платежное поручение по таким реквизитам. 39210202101081011160; ОКТМО; 0; 0; 0; 0; 0 Рекомендуемая форма отчета утверждена письмом ФСС РФ от 2 июня 2014 г. № 17-03-18/05-7094.",                    "event_alarms" : "0"  },
				{ "event_type" : "N", "event_startDate" : "2015-07-19",                              "event_duration" : "30", "event_result" : "в 9. - Перечислить ежемесячный обязательный платеж в ФФОМС за июнь 2014 г.\nСтрахователи - работодатели заполняют платежное поручение по таким реквизитам. 39210202101081011160; ОКТМО; 0; 0; 0; 0; 0 Рекомендуемая форма отчета утверждена письмом ФСС РФ от 2 июня 2014 г. № 17-03-18/05-7094.",               "event_alarms" : "0"  },
				{ "event_type" : "N", "event_startDate" : "2015-07-19",                              "event_duration" : "30", "event_result" : "Напомнить в 9. - Перечислить ежемесячный обязательный платеж в ФФОМС за июнь 2014 г.\nСтрахователи - работодатели заполняют платежное поручение по таким реквизитам. 39210202101081011160; ОКТМО; 0; 0; 0; 0; 0 Рекомендуемая форма отчета утверждена письмом ФСС РФ от 2 июня 2014 г. № 17-03-18/05-7094."                          },
				{ "event_type" : "N",                                   "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "19/07/15 - Перечислить ежемесячный обязательный платеж в ФФОМС за июнь 2014 г.\nСтрахователи - работодатели заполняют платежное поручение по таким реквизитам. 39210202101081011160; ОКТМО; 0; 0; 0; 0; 0 Рекомендуемая форма отчета утверждена письмом ФСС РФ от 2 июня 2014 г. № 17-03-18/05-7094.",           "event_alarms" : "0"  },
				{ "event_type" : "N",                                   "event_startTime" : "21:00", "event_duration" : "30", "event_result" : "19/07/15 - Перечислить ежемесячный обязательный платеж в ФФОМС за июнь 2014 г.\nСтрахователи - работодатели заполняют платежное поручение по таким реквизитам. 39210202101081011160; ОКТМО; 0; 0; 0; 0; 0 Рекомендуемая форма отчета утверждена письмом ФСС РФ от 2 июня 2014 г. № 17-03-18/05-7094.",           "event_alarms" : "0"  },
				{ "event_type" : "N",                                   "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Напомнить 19/07/15 - Перечислить ежемесячный обязательный платеж в ФФОМС за июнь 2014 г.\nСтрахователи - работодатели заполняют платежное поручение по таким реквизитам. 39210202101081011160; ОКТМО; 0; 0; 0; 0; 0 Рекомендуемая форма отчета утверждена письмом ФСС РФ от 2 июня 2014 г. № 17-03-18/05-7094."                      },
				{ "event_type" : "N",                                   "event_startTime" : "21:00", "event_duration" : "30", "event_result" : "Напомнить 19/07/15 - Перечислить ежемесячный обязательный платеж в ФФОМС за июнь 2014 г.\nСтрахователи - работодатели заполняют платежное поручение по таким реквизитам. 39210202101081011160; ОКТМО; 0; 0; 0; 0; 0 Рекомендуемая форма отчета утверждена письмом ФСС РФ от 2 июня 2014 г. № 17-03-18/05-7094."                      },
				{ "event_type" : "N", "event_startDate" : "2015-07-19", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Напомнить - Перечислить ежемесячный обязательный платеж в ФФОМС за июнь 2014 г.\nСтрахователи - работодатели заполняют платежное поручение по таким реквизитам. 39210202101081011160; ОКТМО; 0; 0; 0; 0; 0 Рекомендуемая форма отчета утверждена письмом ФСС РФ от 2 июня 2014 г. № 17-03-18/05-7094."                               },
				{ "event_type" : "N", "event_startDate" : "2015-07-19", "event_startTime" : "21:00", "event_duration" : "30", "event_result" : "Напомнить - Перечислить ежемесячный обязательный платеж в ФФОМС за июнь 2014 г.\nСтрахователи - работодатели заполняют платежное поручение по таким реквизитам. 39210202101081011160; ОКТМО; 0; 0; 0; 0; 0 Рекомендуемая форма отчета утверждена письмом ФСС РФ от 2 июня 2014 г. № 17-03-18/05-7094."                               }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-202" : {
			"origin" : "28 июл. начало в 10:30 - Piter Py - вторая Python-конференция на Неве \n4 000 - 7 500 руб (до 31 марта - 4000) Санкт-Петербург , Батайский пер., 3а. Телефон 8-921-645-78-08. Секционный доклад: 1 час (45-50 мин. на доклад + 10-15 мин. на обсуждение) Блиц-доклад: 20 мин. (15 мин. на доклад + 5 мин. на обсуждение) Двойной блиц-доклад: 40 мин. (30 мин. на доклад + 10 мин. на обсуждение)",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-07-28", "event_startTime" : "10:30", "event_duration" : "30", "event_result" : "начало Piter Py - вторая Python-конференция на Неве \n4 000 - 7 500 руб (до 31 марта - 4000) Санкт-Петербург , Батайский пер., 3а. Телефон 8-921-645-78-08. Секционный доклад: 1 час (45-50 мин. на доклад + 10-15 мин. на обсуждение) Блиц-доклад: 20 мин. (15 мин. на доклад + 5 мин. на обсуждение) Двойной блиц-доклад: 40 мин. (30 мин. на доклад + 10 мин. на обсуждение)"         },
				{ "event_type" : "N", "event_startDate" : "2015-07-28", "event_startTime" : "22:30", "event_duration" : "30", "event_result" : "начало Piter Py - вторая Python-конференция на Неве \n4 000 - 7 500 руб (до 31 марта - 4000) Санкт-Петербург , Батайский пер., 3а. Телефон 8-921-645-78-08. Секционный доклад: 1 час (45-50 мин. на доклад + 10-15 мин. на обсуждение) Блиц-доклад: 20 мин. (15 мин. на доклад + 5 мин. на обсуждение) Двойной блиц-доклад: 40 мин. (30 мин. на доклад + 10 мин. на обсуждение)"         },

				{ "event_type" : "N", "event_startDate" : "2015-07-28",                              "event_duration" : "30", "event_result" : "начало в 10:30 - Piter Py - вторая Python-конференция на Неве \n4 000 - 7 500 руб (до 31 марта - 4000) Санкт-Петербург , Батайский пер., 3а. Телефон 8-921-645-78-08. Секционный доклад: 1 час (45-50 мин. на доклад + 10-15 мин. на обсуждение) Блиц-доклад: 20 мин. (15 мин. на доклад + 5 мин. на обсуждение) Двойной блиц-доклад: 40 мин. (30 мин. на доклад + 10 мин. на обсуждение)" },
				{ "event_type" : "N",                                                   "event_startTime" : "10:30", "event_duration" : "30", "event_result" : "28 июл. начало - Piter Py - вторая Python-конференция на Неве \n4 000 - 7 500 руб (до 31 марта - 4000) Санкт-Петербург , Батайский пер., 3а. Телефон 8-921-645-78-08. Секционный доклад: 1 час (45-50 мин. на доклад + 10-15 мин. на обсуждение) Блиц-доклад: 20 мин. (15 мин. на доклад + 5 мин. на обсуждение) Двойной блиц-доклад: 40 мин. (30 мин. на доклад + 10 мин. на обсуждение)" },
				{ "event_type" : "N",                                                   "event_startTime" : "22:30", "event_duration" : "30", "event_result" : "28 июл. начало - Piter Py - вторая Python-конференция на Неве \n4 000 - 7 500 руб (до 31 марта - 4000) Санкт-Петербург , Батайский пер., 3а. Телефон 8-921-645-78-08. Секционный доклад: 1 час (45-50 мин. на доклад + 10-15 мин. на обсуждение) Блиц-доклад: 20 мин. (15 мин. на доклад + 5 мин. на обсуждение) Двойной блиц-доклад: 40 мин. (30 мин. на доклад + 10 мин. на обсуждение)" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-203" : {
			"origin" : "В июне, 30 состоится встреча выпускников 2014 года. Начало в 7 вечера.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-06-30", "event_startTime" : "19:00", "event_duration" : "30", "event_result" : "состоится встреча выпускников 2014 года. Начало."             },
				{ "event_type" : "N", "event_startDate" : "2015-06-30", "event_startTime" : "07:00", "event_duration" : "30", "event_result" : "состоится встреча выпускников 2014 года. Начало вечера."      },
				{ "event_type" : "N", "event_startDate" : "2015-06-30",                              "event_duration" : "30", "event_result" : "состоится встреча выпускников 2014 года. Начало в 7 вечера." },
				{ "event_type" : "N",                                                   "event_startTime" : "19:00", "event_duration" : "30", "event_result" : "В июне, 30 состоится встреча выпускников 2014 года. Начало"  }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-204" : {
			"origin" : "Июль,8 - Саша должен 3 450 руб, обещал вернуть через месяц.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-07-08", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Саша должен 3 450 руб, обещал вернуть через месяц." }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-205" : {
			"origin" : "В следующем июле запланировать отпуск на две-три недели",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-07-01", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "запланировать отпуск на две-три недели" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-206" : {
			"origin" : "23.08 - День рождения Алены (24). Напомнить за день",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-08-23", "event_startTime" : "09:00", "event_duration" : "30", event_alarms: "-1440", "event_result" : "День рождения Алены (24)."                   },

				{ "event_type" : "N", "event_startDate" : "2015-08-23", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "- День рождения Алены (24). Напомнить за день"                        } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-207" : {
			"origin" : "Перечислить НДС за IV квартал 2014 г. - 11.08.15 г. \nПлательщики НДС заполняют платежное поручение на 1/3 налога за IV квартал 2014 г. по таким реквизитам: 18210301000011000110; ОКТМО; ТП; КВ.04.2014; 0; дата подписания декларации; 0",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-08-11", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Перечислить НДС за IV квартал 2014 г. \nПлательщики НДС заполняют платежное поручение на 1/3 налога за IV квартал 2014 г. по таким реквизитам: 18210301000011000110; ОКТМО; ТП; КВ.04.2014; 0; дата подписания декларации; 0" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-208" : {
			"origin" : "Авг.,30 - День РТ\n30 августа 1990 года регион получил статус Татарской Советской Социалистической Республики, сделав, таким образом, попытку приобрести государственный суверенитет.27 мая 1920 года был подписан декрет об образовании Татарской АССР в составе РСФСР",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-08-30", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "День РТ\n30 августа 1990 года регион получил статус Татарской Советской Социалистической Республики, сделав, таким образом, попытку приобрести государственный суверенитет.27 мая 1920 года был подписан декрет об образовании Татарской АССР в составе РСФСР" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-209" : {
			"origin" : "Август,17 - Салихянова Г.Л. Зачисление на 1 курс факультета МО. Договор УЮ 9/12 - 2315 , первое полугодие 115 000 руб.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2017-08-01", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Салихянова Г.Л. Зачисление на 1 курс факультета МО. Договор УЮ 9/12 - 2315 , первое полугодие 115 000 руб." },
				{ "event_type" : "N", "event_startDate" : "2015-08-17", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Салихянова Г.Л. Зачисление на 1 курс факультета МО. Договор УЮ 9/12 - 2315 , первое полугодие 115 000 руб." }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-210" : {
			"origin" : "с 1 авг 2015 года новый налог на имущество физических лиц - квартиры, комнаты, особняки, дачи, творческие мастерские. налоговые ставки установленные в 28 регионах, в целом учитывают особенности местности и уровень жизни населения.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-08-01", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "новый налог на имущество физических лиц - квартиры, комнаты, особняки, дачи, творческие мастерские. налоговые ставки установленные в 28 регионах, в целом учитывают особенности местности и уровень жизни населения." }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

//		"TC-211" : {
//			"origin" : "Курс Системный и бизнес анализ в разработке ПО\nстоимость 27 990 рублей Регламент проведения занятий: продолжительность тренинга - 5 дней (40 ак. часов); форма занятий — очная режим занятий — с 10:00 до 17:20 с обеденным перерывом (60 мин.) и двумя кофе-паузами (по 5 – 10 мин. каждая). Первое занятие - 12.09.2015 в 19:00",
//			"expectations" : [
//				{ "event_type" : "N", "event_startDate" : "2015-09-12", "event_startTime" : "19:00", "event_duration" : "30", "event_result" : "Курс Системный и бизнес анализ в разработке ПО\nстоимость 27 990 рублей Регламент проведения занятий: продолжительность тренинга - 5 дней (40 ак. часов); форма занятий — очная режим занятий — с 10:00 до 17:20 с обеденным перерывом (60 мин.) и двумя кофе-паузами (по 5 – 10 мин. каждая). Первое занятие -"    },
//				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "10:00", "event_duration" : "440", "event_result" : "Курс Системный и бизнес анализ в разработке ПО\nстоимость 27 990 рублей Регламент проведения занятий: продолжительность тренинга - 5 дней (40 ак. часов); форма занятий — очная режим занятий — с обеденным перерывом (60 мин.) и двумя кофе-паузами (по 5 – 10 мин. каждая). Первое занятие - 12.09.2015 в 19:00"            },
//				{ "event_type" : "N", "event_startDate" : "2015-09-12", "event_startTime" : "19:00", "event_duration" : "30", "event_result" : "Курс Системный и бизнес анализ в разработке ПО\nстоимость 27 990 рублей Регламент проведения занятий: продолжительность тренинга - 5 дней (40 ак. часов); форма занятий — очная режим занятий — с 10:00 до 17:20 с обеденным перерывом (60 мин.) и двумя кофе-паузами (по 5 – 10 мин. каждая). Первое занятие -"            },
//				{ "event_type" : "N",                                   "event_startTime" : "19:00", "event_duration" : "30", "event_result" : "Курс Системный и бизнес анализ в разработке ПО\nстоимость 27 990 рублей Регламент проведения занятий: продолжительность тренинга - 5 дней (40 ак. часов); форма занятий — очная режим занятий — с 10:00 до 17:20 с обеденным перерывом (60 мин.) и двумя кофе-паузами (по 5 – 10 мин. каждая). Первое занятие - 12.09.2015" }
//			],
//			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
//		},
//
		"TC-212" : {
			"origin" : "Для доклада на 3/09 на Экономику,напомнить за день Индийский банк вышел на российский рынок в 1998 году и занимался преимущественно обслуживанием корпоративных клиентов, но развивал и розничное кредитование. 'АйСиАйСиАй Банк Евразия' занимает 394 место среди российских банков по величине активов (по данным на 1 октября). Их размер составлял 4,76 миллиарда рублей. Доля российского банка в общих активах ICICI Bank составляет менее 0,1 процента.Совкомбанк входит в топ-50 российских банков, величина его активов на 1 октября составляла 190,5 миллиарда рублей.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-09-03", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Для доклада на Экономику,Индийский банк вышел на российский рынок в 1998 году и занимался преимущественно обслуживанием корпоративных клиентов, но развивал и розничное кредитование. 'АйСиАйСиАй Банк Евразия' занимает 394 место среди российских банков по величине активов (по данным на 1 октября). Их размер составлял 4,76 миллиарда рублей. Доля российского банка в общих активах ICICI Bank составляет менее 0,1 процента.Совкомбанк входит в топ-50 российских банков, величина его активов на 1 октября составляла 190,5 миллиарда рублей.",                   "event_alarms" : "-1440"},
				{ "event_type" : "N", "event_startDate" : "2015-09-03", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Для доклада на Экономику,напомнить за день Индийский банк вышел на российский рынок в 1998 году и занимался преимущественно обслуживанием корпоративных клиентов, но развивал и розничное кредитование. 'АйСиАйСиАй Банк Евразия' занимает 394 место среди российских банков по величине активов (по данным на 1 октября). Их размер составлял 4,76 миллиарда рублей. Доля российского банка в общих активах ICICI Bank составляет менее 0,1 процента.Совкомбанк входит в топ-50 российских банков, величина его активов на 1 октября составляла 190,5 миллиарда рублей." }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-213" : {
			"origin" : "Крайний срок - 20 сент. в 12:30 Перечислить регулярный взнос за пользование объектами водных биологических ресурсов за август 2015 г.Пользователи водных биологических ресурсов аполняют платежное поручение по таким реквизитам:\nсбор за пользование объектами водных биологических ресурсов (исключая внутренние водные объекты): 18210704020011000110; ОКТМО; ТП; МС.01.2015; 0; 0; 0 сбор за пользование объектами водных биологических ресурсов (по внутренним водным объектам): 18210704030011000110; ОКТМО; ТП; МС.01.2015; 0; 0; 0 напомнить за 2 часа.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-09-20", "event_startTime" : "12:30",                      "event_duration" : "30", "event_result" : "Крайний срок Перечислить регулярный взнос за пользование объектами водных биологических ресурсов за август 2015 г.Пользователи водных биологических ресурсов аполняют платежное поручение по таким реквизитам:\nсбор за пользование объектами водных биологических ресурсов (исключая внутренние водные объекты): 18210704020011000110; ОКТМО; ТП; МС.01.2015; 0; 0; 0 сбор за пользование объектами водных биологических ресурсов (по внутренним водным объектам): 18210704030011000110; ОКТМО; ТП; МС.01.2015; 0; 0; 0."                               , "event_alarms" : "-120"},
				{ "event_type" : "N", "event_startDate" : "2015-09-20", "event_startTime" : "00:30",                      "event_duration" : "30", "event_result" : "Крайний срок Перечислить регулярный взнос за пользование объектами водных биологических ресурсов за август 2015 г.Пользователи водных биологических ресурсов аполняют платежное поручение по таким реквизитам:\nсбор за пользование объектами водных биологических ресурсов (исключая внутренние водные объекты): 18210704020011000110; ОКТМО; ТП; МС.01.2015; 0; 0; 0 сбор за пользование объектами водных биологических ресурсов (по внутренним водным объектам): 18210704030011000110; ОКТМО; ТП; МС.01.2015; 0; 0; 0"                               },
				{ "event_type" : "N", "event_startDate" : "2015-09-20",                                                   "event_duration" : "30", "event_result" : "Крайний срок - в 12:30 Перечислить регулярный взнос за пользование объектами водных биологических ресурсов за август 2015 г.Пользователи водных биологических ресурсов аполняют платежное поручение по таким реквизитам:\nсбор за пользование объектами водных биологических ресурсов (исключая внутренние водные объекты): 18210704020011000110; ОКТМО; ТП; МС.01.2015; 0; 0; 0 сбор за пользование объектами водных биологических ресурсов (по внутренним водным объектам): 18210704030011000110; ОКТМО; ТП; МС.01.2015; 0; 0; 0."                      },
				{ "event_type" : "N",                                                   "event_startTime" : "12:30",                      "event_duration" : "30", "event_result" : "Крайний срок - 20 сент. Перечислить регулярный взнос за пользование объектами водных биологических ресурсов за август 2015 г.Пользователи водных биологических ресурсов аполняют платежное поручение по таким реквизитам:\nсбор за пользование объектами водных биологических ресурсов (исключая внутренние водные объекты): 18210704020011000110; ОКТМО; ТП; МС.01.2015; 0; 0; 0\tсбор за пользование объектами водных биологических ресурсов (по внутренним водным объектам): 18210704030011000110; ОКТМО; ТП; МС.01.2015; 0; 0; 0."                    },
				{ "event_type" : "N",                                                   "event_startTime" : "00:30",                      "event_duration" : "30", "event_result" : "Крайний срок - 20 сент. Перечислить регулярный взнос за пользование объектами водных биологических ресурсов за август 2015 г.Пользователи водных биологических ресурсов аполняют платежное поручение по таким реквизитам:\nсбор за пользование объектами водных биологических ресурсов (исключая внутренние водные объекты): 18210704020011000110; ОКТМО; ТП; МС.01.2015; 0; 0; 0\tсбор за пользование объектами водных биологических ресурсов (по внутренним водным объектам): 18210704030011000110; ОКТМО; ТП; МС.01.2015; 0; 0; 0."                    },
				{ "event_type" : "N", "event_startDate" : "2015-09-20", "event_startTime" : "12:30",                      "event_duration" : "30", "event_result" : "Крайний срок - Перечислить регулярный взнос за пользование объектами водных биологических ресурсов за август 2015 г.Пользователи водных биологических ресурсов аполняют платежное поручение по таким реквизитам:\nсбор за пользование объектами водных биологических ресурсов (исключая внутренние водные объекты): 18210704020011000110; ОКТМО; ТП; МС.01.2015; 0; 0; 0 сбор за пользование объектами водных биологических ресурсов (по внутренним водным объектам): 18210704030011000110; ОКТМО; ТП; МС.01.2015; 0; 0; 0 напомнить за 2 часа"           },
				{ "event_type" : "N", "event_startDate" : "2015-09-20", "event_startTime" : "00:30",                      "event_duration" : "30", "event_result" : "Крайний срок - Перечислить регулярный взнос за пользование объектами водных биологических ресурсов за август 2015 г.Пользователи водных биологических ресурсов аполняют платежное поручение по таким реквизитам:\nсбор за пользование объектами водных биологических ресурсов (исключая внутренние водные объекты): 18210704020011000110; ОКТМО; ТП; МС.01.2015; 0; 0; 0 сбор за пользование объектами водных биологических ресурсов (по внутренним водным объектам): 18210704030011000110; ОКТМО; ТП; МС.01.2015; 0; 0; 0 напомнить за 2 часа"           },
				{ "event_type" : "N", "event_startDate" : "2015-09-20",                                                   "event_duration" : "30", "event_result" : "Крайний срок - в 12:30 Перечислить регулярный взнос за пользование объектами водных биологических ресурсов за август 2015 г.Пользователи водных биологических ресурсов аполняют платежное поручение по таким реквизитам:\nсбор за пользование объектами водных биологических ресурсов (исключая внутренние водные объекты): 18210704020011000110; ОКТМО; ТП; МС.01.2015; 0; 0; 0 сбор за пользование объектами водных биологических ресурсов (по внутренним водным объектам): 18210704030011000110; ОКТМО; ТП; МС.01.2015; 0; 0; 0 напомнить за 2 часа"   }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-214" : {
			"origin" : "27 сент бассейн не работает в связи с проведением 7 студенческой спартакиады 2015. Тел 8 84 4 50922",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-09-27", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "бассейн не работает в связи с проведением 7 студенческой спартакиады 2015. Тел 8 84 4 50922" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-215" : {
			"origin" : "В следующ. сентябре состоится открытие нового бизнес центра",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-09-01", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "состоится открытие нового бизнес центра" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-216" : {
			"origin" : "1 сентября в 9 часов утра состоится торжественная линейка, посвященная Первому учебному дню для первоклассников и их родителей. После линейки будет происходить распределение по классам:\n1 а - 20 чел, каб 5 1 б - 16 чел, каб 9 1 в - 17 чел, каб 11",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-09-01", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "состоится торжественная линейка, посвященная Первому учебному дню для первоклассников и их родителей. После линейки будет происходить распределение по классам:\n1 а - 20 чел, каб 5 1 б - 16 чел, каб 9 1 в - 17 чел, каб 11"                },
				{ "event_type" : "N", "event_startDate" : "2015-09-01", "event_startTime" : "21:00", "event_duration" : "30", "event_result" : "утра состоится торжественная линейка, посвященная Первому учебному дню для первоклассников и их родителей. После линейки будет происходить распределение по классам:\n1 а - 20 чел, каб 5 1 б - 16 чел, каб 9 1 в - 17 чел, каб 11"           },
				{ "event_type" : "N", "event_startDate" : "2015-09-01",                              "event_duration" : "30", "event_result" : "в 9 часов утра состоится торжественная линейка, посвященная Первому учебному дню для первоклассников и их родителей. После линейки будет происходить распределение по классам:\n1 а - 20 чел, каб 5 1 б - 16 чел, каб 9 1 в - 17 чел, каб 11" },
				{ "event_type" : "N",                                                  "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "1 сентября состоится торжественная линейка, посвященная Первому учебному дню для первоклассников и их родителей. После линейки будет происходить распределение по классам:\n1 а - 20 чел, каб 5 1 б - 16 чел, каб 9 1 в - 17 чел, каб 11"     }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-217" : {
			"origin" : "06 дек. 2015 в 16:00 Итоговое совещание структурных подразделений Федерального государственного учреждения 'Главное бюро медико-социальной экспертизы по Республике Татарстан' 'О работе Федерального государственного учреждения 'Главное бюро медико-социальной экспертизы по Республике Татарстан' в 2014 году и задачах на 2015 год', г.Казань, ул. Бондаренко, д. 3 Напомнить за 4 часа",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-12-06", "event_startTime" : "16:00", "event_duration" : "30", "event_result" : "Итоговое совещание структурных подразделений Федерального государственного учреждения 'Главное бюро медико-социальной экспертизы по Республике Татарстан' 'О работе Федерального государственного учреждения 'Главное бюро медико-социальной экспертизы по Республике Татарстан' в 2014 году и задачах на 2015 год', г.Казань, ул. Бондаренко, д. 3"                                  , "event_alarms" : "-240" },
				{ "event_type" : "N", "event_startDate" : "2015-12-06",                              "event_duration" : "30", "event_result" : "в 16:00 Итоговое совещание структурных подразделений Федерального государственного учреждения 'Главное бюро медико-социальной экспертизы по Республике Татарстан' 'О работе Федерального государственного учреждения 'Главное бюро медико-социальной экспертизы по Республике Татарстан' в 2014 году и задачах на 2015 год', г.Казань, ул. Бондаренко, д. 3"                          },
				{ "event_type" : "N",                                   "event_startTime" : "16:00", "event_duration" : "30", "event_result" : "06 дек. 2015 Итоговое совещание структурных подразделений Федерального государственного учреждения 'Главное бюро медико-социальной экспертизы по Республике Татарстан' 'О работе Федерального государственного учреждения 'Главное бюро медико-социальной экспертизы по Республике Татарстан' в 2014 году и задачах на 2015 год', г.Казань, ул. Бондаренко, д. 3"                     },
				{ "event_type" : "N", "event_startDate" : "2015-12-06",                              "event_duration" : "30", "event_result" : "в 16:00 Итоговое совещание структурных подразделений Федерального государственного учреждения 'Главное бюро медико-социальной экспертизы по Республике Татарстан' 'О работе Федерального государственного учреждения 'Главное бюро медико-социальной экспертизы по Республике Татарстан' в 2014 году и задачах на 2015 год', г.Казань, ул. Бондаренко, д. 3 Напомнить за 4 часа"      },
				{ "event_type" : "N",                                   "event_startTime" : "16:00", "event_duration" : "30", "event_result" : "06 дек. 2015 Итоговое совещание структурных подразделений Федерального государственного учреждения 'Главное бюро медико-социальной экспертизы по Республике Татарстан' 'О работе Федерального государственного учреждения 'Главное бюро медико-социальной экспертизы по Республике Татарстан' в 2014 году и задачах на 2015 год', г.Казань, ул. Бондаренко, д. 3 Напомнить за 4 часа" },
				{ "event_type" : "N", "event_startDate" : "2015-12-06", "event_startTime" : "16:00", "event_duration" : "30", "event_result" : "Итоговое совещание структурных подразделений Федерального государственного учреждения 'Главное бюро медико-социальной экспертизы по Республике Татарстан' 'О работе Федерального государственного учреждения 'Главное бюро медико-социальной экспертизы по Республике Татарстан' в 2014 году и задачах на 2015 год', г.Казань, ул. Бондаренко, д. 3 Напомнить за 4 часа"              }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-218" : {
			"origin" : "Заседание коллегии Прокуратуры Республики Татарстан 'О подведении итогов работы Прокуратуры Республики Татарстан за 2014 год' состоится 23 декабря в 10:00 .\nАдрес г.Казань, ул.Кремлевская, д.14 тел. 12-345-67",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-12-23", "event_startTime" : "10:00", "event_duration" : "30", "event_result" : "Заседание коллегии Прокуратуры Республики Татарстан 'О подведении итогов работы Прокуратуры Республики Татарстан за 2014 год' состоится .\nАдрес г.Казань, ул.Кремлевская, д.14 тел. 12-345-67"            },
				{ "event_type" : "N", "event_startDate" : "2015-12-23",                              "event_duration" : "30", "event_result" : "Заседание коллегии Прокуратуры Республики Татарстан 'О подведении итогов работы Прокуратуры Республики Татарстан за 2014 год' состоится в 10:00 .\nАдрес г.Казань, ул.Кремлевская, д.14 тел. 12-345-67"    },
				{ "event_type" : "N",                                                    "event_startTime" : "10:00", "event_duration" : "30", "event_result" : "Заседание коллегии Прокуратуры Республики Татарстан 'О подведении итогов работы Прокуратуры Республики Татарстан за 2014 год' состоится 23 декабря .\nАдрес г.Казань, ул.Кремлевская, д.14 тел. 12-345-67" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-219" : {
			"origin" : "в декабре, 03 открывается Республиканская профильная смена 'Галстучная страна' продолжительностью 03-09 декабря. Открытие состоится в 00:00",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-12-03", "event_startTime" : "00:00", "event_duration" : "30", "event_result" : "открывается Республиканская профильная смена 'Галстучная страна' продолжительностью 03-09 декабря. Открытие состоится"               },
				{ "event_type" : "N", "event_startDate" : "2015-12-03",                              "event_duration" : "30", "event_result" : "открывается Республиканская профильная смена 'Галстучная страна' продолжительностью 03-09 декабря. Открытие состоится в 00:00"       },
				{ "event_type" : "N",                                                   "event_startTime" : "00:00", "event_duration" : "30", "event_result" : "в декабре, 03 открывается Республиканская профильная смена 'Галстучная страна' продолжительностью 03-09 декабря. Открытие состоится" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-220" : {
			"origin" : "17 числа декабрь месяца Элитный (второй отборочный) раунд Чемпионата Европы по футболу 2015 года среди юношеских сборных команд до 17 лет, 17 – 31 декабря стадион 'Рубин'.Начало в 17",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-12-17", "event_startTime" : "17:00", "event_duration" : "30", "event_result" : "Элитный (второй отборочный) раунд Чемпионата Европы по футболу 2015 года среди юношеских сборных команд до 17 лет, 17 – 31 декабря стадион 'Рубин'.Начало"                          },
				{ "event_type" : "N", "event_startDate" : "2015-12-17",                              "event_duration" : "30", "event_result" : "Элитный (второй отборочный) раунд Чемпионата Европы по футболу 2015 года среди юношеских сборных команд до 17 лет, 17 – 31 декабря стадион 'Рубин'.Начало в 17"                      },
				{ "event_type" : "N",                                                    "event_startTime" : "17:00", "event_duration" : "30", "event_result" : "17 числа декабрь месяца Элитный (второй отборочный) раунд Чемпионата Европы по футболу 2015 года среди юношеских сборных команд до 17 лет, 17 – 31 декабря стадион 'Рубин'. Начало" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-221" : {
			"origin" : "29 дек мес в 19:30 примерно на 3 часа Торжественное мероприятие по случаю закладки двух кабельных судов проекта 15310 на ОАО 'Зеленодольский завод им.А.М.Горького'. Принимают участие заместитель Министра обороны Российской Федерации Юрий Иванович Борисов и Премьер-министр Республики Татарстан И.Ш.Халиков",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-12-29", "event_startTime" : "19:30", "event_duration" : "180", "event_result" : "примерно Торжественное мероприятие по случаю закладки двух кабельных судов проекта 15310 на ОАО 'Зеленодольский завод им.А.М.Горького'. Принимают участие заместитель Министра обороны Российской Федерации Юрий Иванович Борисов и Премьер-министр Республики Татарстан И.Ш.Халиков"                       },
				{ "event_type" : "N", "event_startDate" : "2015-12-29", "event_startTime" : "19:30", "event_duration" : "30",  "event_result" : "примерно на 3 часа Торжественное мероприятие по случаю закладки двух кабельных судов проекта 15310 на ОАО 'Зеленодольский завод им.А.М.Горького'. Принимают участие заместитель Министра обороны Российской Федерации Юрий Иванович Борисов и Премьер-министр Республики Татарстан И.Ш.Халиков"             },
				{ "event_type" : "N", "event_startDate" : "2015-12-29",                              "event_duration" : "180", "event_result" : "в 19:30 примерно Торжественное мероприятие по случаю закладки двух кабельных судов проекта 15310 на ОАО 'Зеленодольский завод им.А.М.Горького'. Принимают участие заместитель Министра обороны Российской Федерации Юрий Иванович Борисов и Премьер-министр Республики Татарстан И.Ш.Халиков"               },
				{ "event_type" : "N",                                                    "event_startTime" : "19:30", "event_duration" : "180", "event_result" : "29 дек мес примерно Торжественное мероприятие по случаю закладки двух кабельных судов проекта 15310 на ОАО 'Зеленодольский завод им.А.М.Горького'. Принимают участие заместитель Министра обороны Российской Федерации Юрий Иванович Борисов и Премьер-министр Республики Татарстан И.Ш.Халиков"            },
				{ "event_type" : "N",                                                    "event_startTime" : "19:30", "event_duration" : "30",  "event_result" : "29 дек мес примерно на 3 часа Торжественное мероприятие по случаю закладки двух кабельных судов проекта 15310 на ОАО 'Зеленодольский завод им.А.М.Горького'. Принимают участие заместитель Министра обороны Российской Федерации Юрий Иванович Борисов и Премьер-министр Республики Татарстан И.Ш.Халиков"  },
				{ "event_type" : "N", "event_startDate" : "2015-12-29",                              "event_duration" : "30",  "event_result" : "мес в 19:30 примерно на 3 часа Торжественное мероприятие по случаю закладки двух кабельных судов проекта 15310 на ОАО 'Зеленодольский завод им.А.М.Горького'. Принимают участие заместитель Министра обороны Российской Федерации Юрий Иванович Борисов и Премьер-министр Республики Татарстан И.Ш.Халиков" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-222" : {
			"origin" : "День рождение через год",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2016-03-13", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "День рождение" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-223" : {
			"origin" : "Через год фестиваль профессионального развития напомнить",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2016-03-13", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "фестиваль профессионального развития", "event_alarms" : "0" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-224" : {
			"origin" : "через пять лет менять загранпаспорт напомнить",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2020-03-13", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "менять загранпаспорт", "event_alarms" : "0" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-225" : {
			"origin" : "май 2015 съездить на дачу в Брендино",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-05-01", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "съездить на дачу в Брендино" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-226" : {
			"origin" : "7 марта 14 годовщина 5 лет со дня открытия здания Большого театра",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2014-03-07", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "годовщина 5 лет со дня открытия здания Большого театра" } // ожидает рабочее время пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-227" : {
			"origin" : "3 сент 15 Мариночке семь лет напомнить за неделю",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-09-03", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Мариночке семь лет"                      ,"event_alarms" : "-10080" },
				{ "event_type" : "N", "event_startDate" : "2015-09-03", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Мариночке семь лет напомнить за неделю" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		//"TC-228" : {
		//	"origin" : "в июне 2015 на 7 дней едем к родителям",
		//	"expectations" : [
		//		{ "event_type" : "N", "event_startDate" : "2015-06-01", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "на 7 дней едем к родителям" }
		//	],
		//	"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		//},
		"TC-229" : {
			"origin" : "9 апреля 2016 г состоится торжественное открытие Синема Плаза в г Северокузнецке начало в 15:00",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2016-04-09", "event_startTime" : "15:00", "event_duration" : "30", "event_result" : "состоится торжественное открытие Синема Плаза в г Северокузнецке начало"                 },
				{ "event_type" : "N", "event_startDate" : "2016-04-09",                              "event_duration" : "30", "event_result" : "состоится торжественное открытие Синема Плаза в г Северокузнецке начало в 15:00"         },
				{ "event_type" : "N",                                   "event_startTime" : "15:00", "event_duration" : "30", "event_result" : "9 апреля 2016 г состоится торжественное открытие Синема Плаза в г Северокузнецке начало" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-230" : {
			"origin" : "7.05.13 в г. Самара съезд микробиологов заезд в 17:00",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2013-05-07", "event_startTime" : "17:00", "event_duration" : "30", "event_result" : "в г. Самара съезд микробиологов заезд"         },
				{ "event_type" : "N",                                   "event_startTime" : "17:00", "event_duration" : "30", "event_result" : "7.05.13 в г. Самара съезд микробиологов заезд" },
				{ "event_type" : "N", "event_startDate" : "2013-05-07",                              "event_duration" : "30", "event_result" : "в г. Самара съезд микробиологов заезд в 17:00" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-231" : {
			"origin" : "Май 7, 2016 в 7 новая луна в знаке стрельца напомнить за полчаса",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2016-05-07", "event_startTime" : "07:00", "event_duration" : "30", "event_result" : "новая луна в знаке стрельца"                      , "event_alarms" : "-30" },
				{ "event_type" : "N", "event_startDate" : "2016-05-07", "event_startTime" : "19:00", "event_duration" : "30", "event_result" : "новая луна в знаке стрельца"                      , "event_alarms" : "-30" },
				{ "event_type" : "N",                                   "event_startTime" : "19:00", "event_duration" : "30", "event_result" : "Май 7, 2016 новая луна в знаке стрельца"          , "event_alarms" : "0" },
				{ "event_type" : "N", "event_startDate" : "2016-05-07",                              "event_duration" : "30", "event_result" : "в 7 новая луна в знаке стрельца"                  , "event_alarms" : "0" },
				{ "event_type" : "N", "event_startDate" : "2016-05-07", "event_startTime" : "19:00", "event_duration" : "30", "event_result" : "новая луна в знаке стрельца напомнить за полчаса" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-232" : {
			"origin" : "к февралю 15 составить график отпусков на 2015 г",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-02-01", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "составить график отпусков на 2015 г" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-233" : {
			"origin" : "7 января 15 метро будет ходить до полуночи напомнить за час",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-01-07", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "метро будет ходить до полуночи"     	         , "event_alarms" : "-60" },
				{ "event_type" : "N", "event_startDate" : "2015-01-07", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "метро будет ходить до полуночи напомнить за час" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-234" : {
			"origin" : "18 Декабря 2014, 19:30 список запрещенных для перевозки через границу предметов в 2016 г.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2014-12-18", "event_startTime" : "19:30", "event_duration" : "30", "event_result" : "список запрещенных для перевозки через границу предметов в 2016 г."                  },
				{ "event_type" : "N", "event_startDate" : "2014-12-18",                              "event_duration" : "30", "event_result" : "19:30 список запрещенных для перевозки через границу предметов в 2016 г."            },
				{ "event_type" : "N",                                   "event_startTime" : "19:30", "event_duration" : "30", "event_result" : "18 Декабря 2014, список запрещенных для перевозки через границу предметов в 2016 г." }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-235" : {
			"origin" : "В октябре 2016 сходить забрать социальные выплаты за 7 лет напомнить",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2016-10-01", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "сходить забрать социальные выплаты за 7 лет",           "event_alarms" : "0"  },
				{ "event_type" : "N", "event_startDate" : "2016-10-01", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "сходить забрать социальные выплаты за 7 лет напомнить"                      }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

//		"TC-236" : {
//			"origin" : "В 2015 году нерабочие праздничные дни 8 марта и 9 мая совпадают с выходными днями (воскресенье и суббота соответственно). Следовательно, эти выходные дни переносятся на следующие после праздничных рабочие дни: на понедельник 9 марта и понедельник 11 мая.",
//			"expectations" : [
//				{ "event_type" : "N", "event_startDate" : "2015-03-08", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "В 2015 году нерабочие праздничные дни 8 марта и 9 мая совпадают с выходными днями (воскресенье и суббота соответственно). Следовательно, эти выходные дни переносятся на следующие после праздничных рабочие дни: на понедельник 9 марта и понедельник 11 мая." }
//			],
//			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
//		},

		"TC-237" : {
			"origin" : "Фестиваль авто- и мототехники пройдет 26 июля 15 г. в г. Крынцино, начало в 3 дня",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-07-26", "event_startTime" : "15:00", "event_duration" : "30", "event_result" : "Фестиваль авто- и мототехники пройдет в г. Крынцино, начало"               },
				{ "event_type" : "N", "event_startDate" : "2015-07-26", "event_startTime" : "03:00", "event_duration" : "30", "event_result" : "Фестиваль авто- и мототехники пройдет в г. Крынцино, начало дня"           },
				{ "event_type" : "N",                                   "event_startTime" : "15:00", "event_duration" : "30", "event_result" : "Фестиваль авто- и мототехники пройдет 26 июля 15 г. в г. Крынцино, начало" },
				{ "event_type" : "N", "event_startDate" : "2015-07-26",                              "event_duration" : "30", "event_result" : "Фестиваль авто- и мототехники пройдет в г. Крынцино, начало в 3 дня"       }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-238" : {
			"origin" : "По данным на 01.12.2014 года активы по балансу составили 271,2 млрд руб., что на 68,7% больше аналогичного показателя на 1 декабря 2013 года.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2014-12-01", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "По данным активы по балансу составили 271,2 млрд руб., что на 68,7% больше аналогичного показателя на 1 декабря 2013 года." }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-239" : {
			"origin" : "Завтра совещание по доходам на 5 часов 13 минут, быть всем, сказал босс!",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "05:13", "event_duration" : "30",  "event_result" : "совещание по доходам, быть всем, сказал босс!" },
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "17:13", "event_duration" : "30", "event_result" : "совещание по доходам, быть всем, сказал босс!"                    }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-240" : {
			"origin" : "Предложение. Собраться сегодня в пять на 6 часов.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "17:00", "event_duration" : "360", "event_result" : "Предложение. Собраться."            },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "05:00", "event_duration" : "360", "event_result" : "Предложение. Собраться."            },

				{ "event_type" : "N",                                  "event_startTime" : "17:00", "event_duration" : "360", "event_result" : "Предложение. Собраться сегодня."    },
				{ "event_type" : "N", "event_startDate" : "2015-03-13",                              "event_duration" : "360", "event_result" : "Предложение. Собраться в пять."     },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "17:00", "event_duration" : "30",  "event_result" : "Предложение. Собраться на 6 часов." },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "05:00", "event_duration" : "30",  "event_result" : "Предложение. Собраться на 6 часов." }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-241" : {
			"origin" : "На 10 минут завтра пропинговать 192.168.137.1",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_duration" : "10", "event_result" : "пропинговать 192.168.137.1"             },

				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "На 10 минут пропинговать 192.168.137.1" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-242" : {
			"origin" : "Обязательно!!! Быть на вечеринке 7 января на 12 часов в Беверли Хиллз",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2016-01-07", "event_startTime" : "09:00", "event_duration" : "720", "event_result" : "Обязательно!!! Быть на вечеринке в Беверли Хиллз"             },
				{ "event_type" : "N", "event_startDate" : "2016-01-07", "event_startTime" : "09:00", "event_duration" : "30",  "event_result" : "Обязательно!!! Быть на вечеринке на 12 часов в Беверли Хиллз" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-243" : {
			"origin" : "13 марта объявить о нерабочих днях с 9:00 до 12:00",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2016-03-13", "event_startTime" : "09:00", "event_duration" : "180", "event_result" : "объявить о нерабочих днях"                 },
				{ "event_type" : "N", "event_startDate" : "2016-03-13",                              "event_duration" : "30",  "event_result" : "объявить о нерабочих днях с 9:00 до 12:00" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		//"TC-244" : {
		//	"origin" : "5 января до 22:00 сходить к стоматологу",
		//	"expectations" : [
		//		{ "event_type" : "N", "event_startDate" : "2016-01-05", "event_startTime" : "09:00", "event_duration" : "780", "event_result" : "сходить к стоматологу" }
		//	],
		//	"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		//},
		//"TC-245" : {
		//	"origin" : "Сегодня до 4:00 съесть пачечку печенек омномном",
		//	"expectations" : [
		//		{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "09:00", "event_duration" : "04:00-now", "event_result" : "съесть пачечку печенек омномном"         },
		//
		//		{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "09:00", "event_duration" : "30",       "event_result" : "до 4:00 съесть пачечку печенек омномном" }
		//	],
		//	"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		//},
		//"TC-246" : {
		//	"origin" : "29 февраля на 3 ч навестить издательство",
		//	"expectations" : [
		//		{ "event_type" : "N", "event_startDate" : "2016-02-29", "event_startTime" : "09:00", "event_duration" : "180", "event_result" : "навестить издательство"        },
		//		{ "event_type" : "N", "event_startDate" : "2016-02-29", "event_startTime" : "09:00", "event_duration" : "30",  "event_result" : "на 3 ч навестить издательство" }
		//	],
		//	"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		//},
		//"TC-247" : {
		//	"origin" : "Сегодня на 7:00-19:00 запланирована встреча с инвесторами, кабинет 21-01",
		//	"expectations" : [
		//		{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "07:00", "event_duration" : "720", "event_result" : "запланирована встреча с инвесторами, кабинет 21-01"         },
		//
		//		{ "event_type" : "N",                                  "event_startTime" : "07:00", "event_duration" : "720", "event_result" : "Сегодня запланирована встреча с инвесторами, кабинет 21-01" }
		//	],
		//	"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		//},
		"TC-248" : {
			"origin" : "Сегодня до восьми часов вечера заказать столик в ресторане",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "09:00", "event_duration" : "660", "event_result" : "заказать столик в ресторане"         }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		//"TC-249" : {
		//	"origin" : "Завтра до двух ночи по BBC будут показывать интересные передачи",
		//	"expectations" : [
		//		{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_duration" : "2:00-now",  "event_result" : "по BBC будут показывать интересные передачи"        },
		//
		//		{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_duration" : "14:00-now", "event_result" : "ночи по BBC будут показывать интересные передачи"   },
		//		{ "event_type" : "N",                                      "event_duration" : "2:00-now",  "event_result" : "Завтра по BBC будут показывать интересные передачи" }
		//	],
		//	"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		//},
		"TC-250" : {
			"origin" : "Сегодня до 00:00 будет сегодняшний день, а потом он закончится",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "09:00", "event_duration" : "900", "event_result" : "будет сегодняшний день, а потом он закончится" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-251" : {
			"origin" : "Сегодня до 24:00 будет сегодняшний день, а потом он закончится",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "09:00", "event_duration" : "900", "event_result" : "будет сегодняшний день, а потом он закончится" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		//"TC-252" : {
		//	"origin" : "Завтра до девяти утра собрать все счета",
		//	"expectations" : [
		//		{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_duration" : "9:00-now",  "event_result" : "собрать все счета"      },
		//
		//		{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_duration" : "21:00-now", "event_result" : "утра собрать все счета" }
		//	],
		//	"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		//},
		//"TC-253" : {
		//	"origin" : "До 11ти утром взвеситься послезавтра",
		//	"expectations" : [
		//		{ "event_type" : "N", "event_startDate" : "2015-03-15", "event_startTime" : "09:00", "event_duration" : "11:00-now", "event_result" : "взвеситься" }
		//	],
		//	"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		//},
		//"TC-254" : {
		//	"origin" : "До двух днем сегодня съесть парочку карасиков",
		//	"expectations" : [
		//		{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "09:00", "event_duration" : "14:00-now", "event_result" : "съесть парочку карасиков" }
		//	],
		//	"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		//},
		"TC-255" : {
			"origin" : "30 ноября 14:00 до 10 вечера спектакль",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-11-30", "event_startTime" : "14:00", "event_duration" : "480",      "event_result" : "спектакль"              },
				{ "event_type" : "N",                                   "event_startTime" : "14:00", "event_duration" : "480",      "event_result" : "30 ноября спектакль"    },
				{ "event_type" : "N", "event_startDate" : "2015-11-30", "event_startTime" : "14:00", "event_duration" : "30",       "event_result" : "до 10 вечера спектакль" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-256" : {
			"origin" : "Завтра на весь день на весь 192.168 пинговать",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "09:00", "event_duration" : "600", "event_result" : "на весь 192.168 пинговать"              }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-12" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

//		"TC-257" : {
//			"origin" : "Завтра на весь рабочий день писать годовые отчеты напомнить за 30 мин", // WORKDAY
//			"expectations" : [
//				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_duration" : "WORKDAY", "event_result" : "писать годовые отчеты"                     , "event_alarms": "-30" },
//
//				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_duration" : "30",      "event_result" : "на весь рабочий день писать годовые отчеты", "event_alarms": "-30" },
//				{ "event_type" : "N",                                   "event_startTime" : "09:00", "event_duration" : "WORKDAY", "event_result" : "Завтра писать годовые отчеты"               },
//				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_duration" : "WORKDAY", "event_result" : "писать годовые отчеты напомнить за 30 мин"  } // ожидает рабочее время пользователя
//			],
//			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
//		},

		"TC-258" : {
			"origin" : "С 7 утра до 9 вечера пашем как лошади вместе до 7 пота",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "07:00", "event_duration" : "840", "event_result" : "пашем как лошади вместе до 7 пота" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-259" : {
			"origin" : "Экзамен по матанализу с 9 до 12 в 23 аудитории",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "09:00",  "event_duration" : "180", "event_result" : "Экзамен по матанализу в 23 аудитории" },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "21:00", 	"event_duration" : "180", "event_result" : "Экзамен по матанализу в 23 аудитории" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-260" : {
			"origin" : "Подойти завтра к 17 на Уолл-стрит, остаться на 5 часов",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "17:00", "event_duration" : "300", "event_result" : "Подойти на Уолл-стрит, остаться"            },

				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_duration" : "300", "event_result" : "Подойти к 17 на Уолл-стрит, остаться"       },
				{ "event_type" : "N",                                   "event_startTime" : "17:00", "event_duration" : "300", "event_result" : "Подойти завтра на Уолл-стрит, остаться"     },
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "17:00", "event_duration" : "30",  "event_result" : "Подойти на Уолл-стрит, остаться на 5 часов" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-261" : {
			"origin" : "23 апреля встреча с автором книги о вкусной и здоровой пище с 5 до 7 вечера во 2 зале ДК Родина",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-04-23", "event_startTime" : "17:00", "event_duration" : "120", "event_result" : "встреча с автором книги о вкусной и здоровой пище во 2 зале ДК Родина"           },
				{ "event_type" : "N",                                   "event_startTime" : "17:00", "event_duration" : "120", "event_result" : "23 апреля встреча с автором книги о вкусной и здоровой пище во 2 зале ДК Родина" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-262" : {
			"origin" : "С часу до пяти вечера собеседование Сергей 7(925)-30-12-05",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "13:00", "event_duration" : "240", "event_result" : "собеседование Сергей 7(925)-30-12-05" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-263" : {
			"origin" : "ДР Олега 28 августа, начинаем в 5 и до 9 гуляем",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-08-28", "event_startTime" : "17:00", "event_duration" : "240", "event_result" : "ДР Олега, начинаем и гуляем"            },
				{ "event_type" : "N", "event_startDate" : "2015-08-28", "event_startTime" : "05:00", "event_duration" : "240", "event_result" : "ДР Олега, начинаем и гуляем"            },
				{ "event_type" : "N",                                                   "event_startTime" : "17:00", "event_duration" : "240", "event_result" : "ДР Олега 28 августа, начинаем гуляем"   },
				{ "event_type" : "N", "event_startDate" : "2015-08-28",                              "event_duration" : "30",  "event_result" : "ДР Олега , начинаем в 5 и до 9 гуляем"  },
				{ "event_type" : "N",                                                   "event_startTime" : "17:00", "event_duration" : "960", "event_result" : "ДР Олега 28 августа, начинаем и гуляем" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-264" : {
			"origin" : "через 6 часов семинар о повышении эффективности в 3 раза, на 2 часа",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "15:00", "event_duration" : "120", "event_result" : "семинар о повышении эффективности в 3 раза"  }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-265" : {
			"origin" : "Кофе-брейк с 10 до 10:15, на 7 человек, напомнить за час",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "10:00", "event_duration" : "15", "event_result" : "Кофе-брейк, на 7 человек", "event_alarms" : "-60" },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "22:00", "event_duration" : "15", "event_result" : "Кофе-брейк, на 7 человек", "event_alarms" : "-60" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-266" : {
			"origin" : "Экскурсия по палеозойской эре в 23 зале с 13 до 15 часов",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "13:00", "event_duration" : "120", "event_result" : "Экскурсия по палеозойской эре в 23 зале" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-267" : {
			"origin" : "Выступление на конференции с 13:00 в 5 корпусе на 3 часа",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "13:00", "event_duration" : "180", "event_result" : "Выступление на конференции в 5 корпусе"           },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "13:00", "event_duration" : "30",  "event_result" : "Выступление на конференции в 5 корпусе на 3 часа" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-268" : {
			"origin" : "Прием у стоматолога 20 ноября 14, 5 тыс. + материал 2300 к 4, на час",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2014-11-20", "event_startTime" : "16:00", "event_duration" : "60", "event_result" : "Прием у стоматолога, 5 тыс. + материал 2300"              },
				{ "event_type" : "N", "event_startDate" : "2014-11-20", "event_startTime" : "4:00",  "event_duration" : "60", "event_result" : "Прием у стоматолога, 5 тыс. + материал 2300"              },
				{ "event_type" : "N",                                   "event_startTime" : "16:00", "event_duration" : "60", "event_result" : "Прием у стоматолога 20 ноября 14, 5 тыс. + материал 2300" },
				{ "event_type" : "N",                                   "event_startTime" : "04:00", "event_duration" : "60", "event_result" : "Прием у стоматолога 20 ноября 14, 5 тыс. + материал 2300" },
				{ "event_type" : "N", "event_startDate" : "2014-11-20",                              "event_duration" : "60", "event_result" : "Прием у стоматолога, 5 тыс. + материал 2300 к 4"         },
				{ "event_type" : "N", "event_startDate" : "2014-11-20", "event_startTime" : "16:00", "event_duration" : "30", "event_result" : "Прием у стоматолога , 5 тыс. + материал 2300, на час"      }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-269" : {
			"origin" : "Собрание владельцев с 18 до 20, на 3 часа",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "18:00", "event_duration" : "120", "event_result" : "Собрание владельцев, на 3 часа" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-270" : {
			"origin" : "Заезд в отель с 12 до 14, забронировать на завтра в 15:00",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "12:00", "event_duration" : "120", "event_result" : "Заезд в отель, забронировать в 15:00"            },

				{ "event_type" : "N", "event_startDate" : "2015-03-14",                              "event_duration" : "30",  "event_result" : "Заезд в отель с 12 до 14, забронировать в 15:00" },
				{ "event_type" : "N",                                      "event_startTime" : "12:00", "event_duration" : "120", "event_result" : "Заезд в отель, забронировать на завтра в 15:00"  }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-271" : {
			"origin" : "Купить билеты, касса работает с 12 до 17 каждый день, напомнить",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13",  "event_startTime" : "12:00", "event_duration" : "300", "event_result" : "Купить билеты, касса работает каждый день",            "event_alarms" : "0"  },
				{ "event_type" : "N", "event_startDate" : "2015-03-13",  "event_startTime" : "12:00", "event_duration" : "300", "event_result" : "Купить билеты, касса работает каждый день, напомнить"                      }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-272" : {
			"origin" : "Встреча с инвесторами в 14 часов напомнить, на 3 часа",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13",  "event_startTime" : "14:00", "event_duration" : "180", "event_result" : "Встреча с инвесторами", "event_alarms" : "0" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-273" : {
			"origin" : "Медосмотр 15 ноября с 7 до 15, группы 7231-11, 12, 15; 6225-14, 34, 45",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-11-15", "event_startTime" : "07:00", "event_duration" : "480", "event_result" : "Медосмотр, группы 7231-11, 12, 15; 6225-14, 34, 45"           },
				{ "event_type" : "N",                                                    "event_startTime" : "07:00", "event_duration" : "480", "event_result" : "Медосмотр 15 ноября, группы 7231-11, 12, 15; 6225-14, 34, 45" },
				{ "event_type" : "N", "event_startDate" : "2015-11-15",                              "event_duration" : "30",  "event_result" : "Медосмотр с 7 до 15, группы 7231-11, 12, 15; 6225-14, 34, 45" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-274" : {
			"origin" : "Консультация по матану в 9 часов утра, до 16 часов сдать все лабораторные",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13",  "event_startTime" : "09:00", "event_duration" : "420", "event_result" : "Консультация по матану, сдать все лабораторные" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-275" : {
			"origin" : "Зарядка в 6 утра, спортзал открыт до 12 часов дня",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14",	"event_startTime" : "06:00", "event_duration" : "360",      "event_result" : "Зарядка, спортзал открыт"                 },
				{ "event_type" : "N", "event_startDate" : "2015-03-13",	"event_startTime" : "06:00", "event_duration" : "30",       "event_result" : "Зарядка, спортзал открыт до 12 часов дня" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-276" : {
			"origin" : "Первого сентября 2015 года в 8.00 состоится линейка во дворе школы.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-09-01", "event_startTime" : "08:00", "event_duration" : "30", "event_result" : "состоится линейка во дворе школы."                            },
				{ "event_type" : "N", "event_startDate" : "2015-09-01", "event_startTime" : "20:00", "event_duration" : "30", "event_result" : "состоится линейка во дворе школы."                            },
				{ "event_type" : "N",                                   "event_startTime" : "08:00", "event_duration" : "30", "event_result" : "Первого сентября 2015 года состоится линейка во дворе школы." },
				{ "event_type" : "N", "event_startDate" : "2015-09-01",                              "event_duration" : "30", "event_result" : "в 8.00 состоится линейка во дворе школы."                     },
				{ "event_type" : "N",                                   "event_startTime" : "20:00", "event_duration" : "30", "event_result" : "Первого сентября 2015 года состоится линейка во дворе школы." }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-277" : {
			"origin" : "01.09 в 10:10 дети заплачут.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-09-01", "event_startTime" : "10:10", "event_duration" : "30", "event_result" : "дети заплачут."         },
				{ "event_type" : "N", "event_startDate" : "2015-09-01",                              "event_duration" : "30", "event_result" : "в 10:10 дети заплачут." },
				{ "event_type" : "N", "event_startDate" : "2015-09-01", "event_startTime" : "22:10", "event_duration" : "30", "event_result" : "дети заплачут."         },
				{ "event_type" : "N",                                                "event_startTime" : "22:10", "event_duration" : "30", "event_result" : "01.09 дети заплачут."   },
				{ "event_type" : "N",                                                "event_startTime" : "10:10", "event_duration" : "30", "event_result" : "01.09 дети заплачут."   }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-278" : {
			"origin" : "01.09 к 10:10 часам подъедет директор.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-09-01", "event_startTime" : "10:10", "event_duration" : "30", "event_result" : "подъедет директор."               },
				{ "event_type" : "N", "event_startDate" : "2015-09-01",                              "event_duration" : "30", "event_result" : "к 10:10 часам подъедет директор." },
				{ "event_type" : "N", "event_startDate" : "2015-09-01", "event_startTime" : "22:10", "event_duration" : "30", "event_result" : "подъедет директор."               },
				{ "event_type" : "N",                                                "event_startTime" : "10:10", "event_duration" : "30", "event_result" : "01.09 подъедет директор."         },
				{ "event_type" : "N",                                                "event_startTime" : "22:10", "event_duration" : "30", "event_result" : "01.09 подъедет директор."         }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-279" : {
			"origin" : "01/09/2014 с 09:10 будет шабаш.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2014-09-01", "event_startTime" : "09:10", "event_duration" : "30", "event_result" : "будет шабаш."            },
				{ "event_type" : "N", "event_startDate" : "2014-09-01", "event_startTime" : "21:10", "event_duration" : "30", "event_result" : "будет шабаш."            },
				{ "event_type" : "N", "event_startDate" : "2014-09-01",                              "event_duration" : "30", "event_result" : "с 09:10 будет шабаш."    },
				{ "event_type" : "N",                                   "event_startTime" : "21:10", "event_duration" : "30", "event_result" : "01/09/2014 будет шабаш." },
				{ "event_type" : "N",                                   "event_startTime" : "09:10", "event_duration" : "30", "event_result" : "01/09/2014 будет шабаш." }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-280" : {
			"origin" : "2 сентября 2015г в 3 дня линейка во вдовре школы, напомнить во время события",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-09-02", "event_startTime" : "15:00", "event_duration" : "30", "event_result" : "линейка во вдовре школы",                             "event_alarms" : "0"  },
				{ "event_type" : "N", "event_startDate" : "2015-09-02", "event_startTime" : "15:00", "event_duration" : "30", "event_result" : "дня линейка во вдовре школы",                         "event_alarms" : "0"  },
				{ "event_type" : "N", "event_startDate" : "2015-09-02",                              "event_duration" : "30", "event_result" : "в 3 дня линейка во вдовре школы",                     "event_alarms" : "0"  },
				{ "event_type" : "N",                                   "event_startTime" : "15:00", "event_duration" : "30", "event_result" : "2 сентября 2015г линейка во вдовре школы",            "event_alarms" : "0"  },
				{ "event_type" : "N", "event_startDate" : "2015-09-02", "event_startTime" : "15:00", "event_duration" : "30", "event_result" : "линейка во вдовре школы, напомнить во время события"                      }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-281" : {
			"origin" : "2/04/14 день рождение друга в 3:15",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2014-04-02", "event_startTime" : "15:15", "event_duration" : "30", "event_result" : "день рождение друга"        },
				{ "event_type" : "N", "event_startDate" : "2014-04-02", "event_startTime" : "03:15", "event_duration" : "30", "event_result" : "день рождение друга"        },
				{ "event_type" : "N", "event_startDate" : "2014-04-02",                              "event_duration" : "30", "event_result" : "день рождение друга в 3:15" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-282" : {
			"origin" : "Завтра в 4 утра клев",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "04:00", "event_duration" : "30", "event_result" : "клев"          },

				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "16:00", "event_duration" : "30", "event_result" : "утра клев"     },
				{ "event_type" : "N", "event_startDate" : "2015-03-14",                              "event_duration" : "30", "event_result" : "в 4 утра клев" },
				{ "event_type" : "N",                                      "event_startTime" : "04:00", "event_duration" : "30", "event_result" : "Завтра клев"   }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-283" : {
			"origin" : "Сегодня в 4ч утра клев",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "04:00", "event_duration" : "30", "event_result" : "клев"           },

				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "04:00", "event_duration" : "30", "event_result" : "утра клев"      },
				{ "event_type" : "N", "event_startDate" : "2015-03-13",                              "event_duration" : "30", "event_result" : "в 4ч утра клев" },
				{ "event_type" : "N",                                "event_startTime" : "04:00", "event_duration" : "30", "event_result" : "Сегодня клев"   }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-284" : {
			"origin" : "К 3 дня должен подойти отец",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13",	"event_startTime" : "15:00", "event_duration" : "30", "event_result" : "должен подойти отец"     },
				{ "event_type" : "N", "event_startDate" : "2015-03-13",	"event_startTime" : "03:00", "event_duration" : "30", "event_result" : "дня должен подойти отец" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-285" : {
			"origin" : "С 4:00 начинается матч",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13",	"event_startTime" : "16:00", "event_duration" : "30", "event_result" : "начинается матч" },
				{ "event_type" : "N", "event_startDate" : "2015-03-13",	"event_startTime" : "04:00", "event_duration" : "30", "event_result" : "начинается матч" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-286" : {
			"origin" : "Выпить кофе в 1ч 20мин. Завтра",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "13:20", "event_duration" : "30", "event_result" : "Выпить кофе"            },
				{ "event_type" : "N", "event_startDate" : "2015-03-14",                              "event_duration" : "30", "event_result" : "Выпить кофе в 1 20мин." },
				{ "event_type" : "N",                                    "event_startTime" : "13:20", "event_duration" : "30", "event_result" : "Выпить кофе Завтра"     }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-287" : {
			"origin" : "Съездить в магазин в 23:00",
			"expectations" : [
				{ "event_type" : "N",	"event_startDate" : "2015-03-13",	"event_startTime" : "23:00", "event_duration" : "30", "event_result" : "Съездить в магазин" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-288" : {
			"origin" : "Устроить перекус в 15ч 20 минут",
			"expectations" : [
				{ "event_type" : "N","event_startDate" : "2015-03-13", "event_startTime" : "15:20", "event_duration" : "30", "event_result" : "Устроить перекус" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-289" : {
			"origin" : "Помыть железного коня в 6 утра",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "06:00", "event_duration" : "30", "event_result" : "Помыть железного коня"      },
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "06:00", "event_duration" : "30", "event_result" : "Помыть железного коня"      },

				{ "event_type" : "N", "event_startTime" : "18:00", "event_duration" : "30", "event_result" : "Помыть железного коня утра" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-290" : {
			"origin" : "Выпить таблетку через 1ч. 30 мин. напомнить",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "10:30", "event_duration" : "30", "event_result" : "Выпить таблетку",          "event_alarms" : "0"  },
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "10:30", "event_duration" : "30", "event_result" : "Выпить таблетку",          "event_alarms" : "0"  },

				{ "event_type" : "N", "event_startTime" : "10:30", "event_duration" : "30", "event_result" : "Выпить таблетку.Напомнить"                      }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		//"TC-291" : {
		//	"origin" : "Выполнить задание через 99 ч. 23",
		//	"expectations" : [
		//		{ "event_type" : "N", "event_startDate" : "2015-03-17", "event_startTime" : "12:23", "event_duration" : "30", "event_result" : "Выполнить задание 23" },
		//		{ "event_type" : "N", "event_startDate" : "2015-03-18", "event_startTime" : "12:23", "event_duration" : "30", "event_result" : "Выполнить задание" }
		//	],
		//	"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		//},
		"TC-292" : {
			"origin" : "Сделать прическу через 6час. 50мин.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "15:50", "event_duration" : "30", "event_result" : "Сделать прическу" },
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "15:50", "event_duration" : "30", "event_result" : "Сделать прическу" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-293" : {
			"origin" : "Заправить автомобиль через 2 часа 15 минут",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "11:15", "event_duration" : "30", "event_result" : "Заправить автомобиль" },
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "11:15", "event_duration" : "30", "event_result" : "Заправить автомобиль" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-294" : {
			"origin" : "15 апр 2 часа 13 мин, будет встреча.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-04-15", "event_startTime" : "14:13", "event_duration" : "30", "event_result" : "будет встреча."                },
				{ "event_type" : "N", "event_startDate" : "2015-04-15", "event_startTime" : "02:13", "event_duration" : "30", "event_result" : "будет встреча."                },
				{ "event_type" : "N", "event_startDate" : "2015-04-15",                              "event_duration" : "30", "event_result" : "2 часа 13 мин, будет встреча." }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-295" : {
			"origin" : "Посмотреть новости, в 12ч ночи",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "00:00", "event_duration" : "30", "event_result" : "Посмотреть новости"       },

				{ "event_type" : "N", "event_startTime" : "12:00", "event_duration" : "30", "event_result" : "Посмотреть новости, ночи" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-296" : {
			"origin" : "К 5ч приедет бабушка",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "17:00", "event_duration" : "30", "event_result" : "приедет бабушка" },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "05:00", "event_duration" : "30", "event_result" : "приедет бабушка" },
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "17:00", "event_duration" : "30", "event_result" : "приедет бабушка" },
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "05:00", "event_duration" : "30", "event_result" : "приедет бабушка" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-297" : {
			"origin" : "Пойти в кино, 3-15",
			"expectations" : [
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-298" : {
			"origin" : "3:15 сеанс в кино, напомнить",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "15:15", "event_duration" : "30", "event_result" : "сеанс в кино",            "event_alarms" : "0"  },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "03:15", "event_duration" : "30", "event_result" : "сеанс в кино",            "event_alarms" : "0"  },
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "15:15", "event_duration" : "30", "event_result" : "сеанс в кино",            "event_alarms" : "0"  },
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "03:15", "event_duration" : "30", "event_result" : "сеанс в кино",            "event_alarms" : "0"  },

				{ "event_type" : "N", "event_startTime" : "15:15", "event_duration" : "30", "event_result" : "сеанс в кино, напомнить"                      }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-299" : {
			"origin" : "16:35 кино в кинотеатре",
			"expectations" : [
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-300" : {
			"origin" : "16:35. кино в кинотеатре",
			"expectations" : [
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-301" : {
			"origin" : "16:35, кино в кинотеатре",
			"expectations" : [
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-302" : {
			"origin" : "Завтра пойти в кино с 5 часов 15 минут",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "05:15", "event_duration" : "30", "event_result" : "пойти в кино"        },
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "17:15", "event_duration" : "30", "event_result" : "пойти в кино"        },
				{ "event_type" : "N",                                    "event_startTime" : "17:15", "event_duration" : "30", "event_result" : "Завтра пойти в кино" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-303" : {
			"origin" : "Завтра пойти в кино к 5:15",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "05:15", "event_duration" : "30", "event_result" : "пойти в кино"        },
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "17:15", "event_duration" : "30", "event_result" : "пойти в кино"        },
				{ "event_type" : "N",                                    "event_startTime" : "17:15", "event_duration" : "30", "event_result" : "Завтра пойти в кино" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-304" : {
			"origin" : "Завтра пойти в кино в 5 ч 15 м",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "05:15", "event_duration" : "30", "event_result" : "пойти в кино"        },
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "17:15", "event_duration" : "30", "event_result" : "пойти в кино"        }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-305" : {
			"origin" : "Завтра пойти в кино в 5:00 часов",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "05:00", "event_duration" : "30", "event_result" : "пойти в кино"        },
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "17:00", "event_duration" : "30", "event_result" : "пойти в кино"        },
				{ "event_type" : "N",                                    "event_startTime" : "17:00", "event_duration" : "30", "event_result" : "Завтра пойти в кино" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-306" : {
			"origin" : "Завтра пойти в кино в 5ч 15м",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "05:15", "event_duration" : "30", "event_result" : "пойти в кино"        },
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "17:15", "event_duration" : "30", "event_result" : "пойти в кино"        },
				{ "event_type" : "N",                                    "event_startTime" : "17:15", "event_duration" : "30", "event_result" : "Завтра пойти в кино" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-307" : {
			"origin" : "С 5 часов 15 мин будет проходить конференция",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "17:15", "event_duration" : "30", "event_result" : "будет проходить конференция" },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "05:15", "event_duration" : "30", "event_result" : "будет проходить конференция" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-308" : {
			"origin" : "Подойти к подготовке конференции в 8:15",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "20:15", "event_duration" : "30", "event_result" : "Подойти к подготовке конференции" },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "08:15", "event_duration" : "30", "event_result" : "Подойти к подготовке конференции" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-309" : {
			"origin" : "Подойти к подготовке конференции в 8 час 15 мин",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "20:15", "event_duration" : "30", "event_result" : "Подойти к подготовке конференции" },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "08:15", "event_duration" : "30", "event_result" : "Подойти к подготовке конференции" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-310" : {
			"origin" : "Подойти к подготовке конференции в 8ч 15м",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "20:15", "event_duration" : "30", "event_result" : "Подойти к подготовке конференции" },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "08:15", "event_duration" : "30", "event_result" : "Подойти к подготовке конференции" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-311" : {
			"origin" : "Подойти к подготовке конференции к 8 вечера",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "20:00", "event_duration" : "30", "event_result" : "Подойти к подготовке конференции"        },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "08:00", "event_duration" : "30", "event_result" : "Подойти к подготовке конференции вечера" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-312" : {
			"origin" : "Пойти в кино в три часа дня",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "15:00", "event_duration" : "30", "event_result" : "Пойти в кино"     },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "03:00", "event_duration" : "30", "event_result" : "Пойти в кино дня" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-313" : {
			"origin" : "Сеанс с пяти вечера",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "17:00", "event_duration" : "30", "event_result" : "Сеанс"        },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "05:00", "event_duration" : "30", "event_result" : "Сеанс вечера" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-314" : {
			"origin" : "Подойти к фильму к пяти",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "17:00", "event_duration" : "30", "event_result" : "Подойти к фильму" },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "05:00", "event_duration" : "30", "event_result" : "Подойти к фильму" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-315" : {
			"origin" : "Через час выпить кофе",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "10:00", "event_duration" : "30", "event_result" : "выпить кофе" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-316" : {
			"origin" : "Выпить кофе через час",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "10:00", "event_duration" : "30", "event_result" : "Выпить кофе" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-317" : {
			"origin" : "В обед выпить кофе",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "12:00", "event_duration" : "30", "event_result" : "выпить кофе" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-318" : {
			"origin" : "завтра экскурсия по палеозойской эре, 7 человек в час дня",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "13:00", "event_duration" : "30", "event_result" : "экскурсия по палеозойской эре, 7 человек"        },
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "01:00", "event_duration" : "30", "event_result" : "экскурсия по палеозойской эре, 7 человек дня"    },
				{ "event_type" : "N",                                   "event_startTime" : "13:00", "event_duration" : "30", "event_result" : "завтра экскурсия по палеозойской эре, 7 человек" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-319" : {
			"origin" : "конференция о способах поднятия эффективности через два часа в 5 корпусе",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "11:00", "event_duration" : "30", "event_result" : "конференция о способах поднятия эффективности в 5 корпусе" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-320" : {
			"origin" : "К двум на прием к терапевту",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "14:00", "event_duration" : "30", "event_result" : "на прием к терапевту" },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "02:00", "event_duration" : "30", "event_result" : "на прием к терапевту" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-321" : {
			"origin" : "завершение конференции в два часа дня, через час после закрытия - поезд",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "14:00", "event_duration" : "30", "event_result" : "завершение конференции, через час после закрытия - поезд"    },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "02:00", "event_duration" : "30", "event_result" : "завершение конференции дня, через час после закрытия - поезд" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-322" : {
			"origin" : "Завтрак с президентом в два часа на час",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "14:00", "event_duration" : "60", "event_result" : "Завтрак с президентом"        },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "02:00", "event_duration" : "60", "event_result" : "Завтрак с президентом"        },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "14:00", "event_duration" : "30", "event_result" : "Завтрак с президентом на час" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-323" : {
			"origin" : "Собрание владельцев в три ч возле центральной кассы.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "15:00", "event_duration" : "30", "event_result" : "Собрание владельцев возле центральной кассы." },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "03:00", "event_duration" : "30", "event_result" : "Собрание владельцев возле центральной кассы." }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-324" : {
			"origin" : "Через три ч. подойти в кассу, забрать билеты",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "12:00", "event_duration" : "30", "event_result" : "подойти в кассу, забрать билеты" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-325" : {
			"origin" : "В четыре часа вечера заканчивается бронирование отеля напомнить за полчаса!",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "16:00", "event_duration" : "30", "event_result" : "заканчивается бронирование отеля!"                     ,"event_alarms" : "-30" },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "04:00", "event_duration" : "30", "event_result" : "вечера заканчивается бронирование отеля!"               },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "16:00", "event_duration" : "30", "event_result" : "заканчивается бронирование отеля напомнить за полчаса!" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-326" : {
			"origin" : "К четырем подъехать в детский сад за сыном напомнить за два часа",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "16:00", "event_duration" : "30", "event_result" : "подъехать в детский сад за сыном"                       ,"event_alarms" : "-120"},
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "16:00", "event_duration" : "30", "event_result" : "подъехать в детский сад за сыном напомнить за два часа" },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "04:00", "event_duration" : "30", "event_result" : "подъехать в детский сад за сыном"                       }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-327" : {
			"origin" : "Отпроситься с работы в четыре вечера",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "16:00", "event_duration" : "30", "event_result" : "Отпроситься с работы"        },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "04:00", "event_duration" : "30", "event_result" : "Отпроситься с работы вечера" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-328" : {
			"origin" : "поезд отбывает в пять часов утра",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "05:00", "event_duration" : "30", "event_result" : "поезд отбывает"      },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "17:00", "event_duration" : "30", "event_result" : "поезд отбывает утра" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-329" : {
			"origin" : "Поезд через пять часов прибудет на станцию",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "14:00", "event_duration" : "30", "event_result" : "Поезд прибудет на станцию" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-330" : {
			"origin" : "В пять вечера доставка цветов напомнить за 10 минут",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "17:00", "event_duration" : "30", "event_result" : "доставка цветов"             ,"event_alarms" : "-10"          },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "05:00", "event_duration" : "30", "event_result" : "вечера доставка цветов"      ,"event_alarms" : "-10"         },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "17:00", "event_duration" : "30", "event_result" : "доставка цветов напомнить за 10 минут" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-331" : {
			"origin" : "Курьер должен подъехать к пяти вечера за документами",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "17:00", "event_duration" : "30", "event_result" : "Курьер должен подъехать за документами"        },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "05:00", "event_duration" : "30", "event_result" : "Курьер должен подъехать вечера за документами" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-332" : {
			"origin" : "Через шесть часов готовы результаты",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "15:00", "event_duration" : "30", "event_result" : "готовы результаты" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-333" : {
			"origin" : "В шесть вечера возле каменного моста встреча",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "18:00", "event_duration" : "30", "event_result" : "возле каменного моста встреча"        },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "06:00", "event_duration" : "30", "event_result" : "вечера возле каменного моста встреча" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-334" : {
			"origin" : "приехать на медосмотр к шести часам",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "18:00", "event_duration" : "30", "event_result" : "приехать на медосмотр" },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "06:00", "event_duration" : "30", "event_result" : "приехать на медосмотр" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-335" : {
			"origin" : "сегодня вечером в семь начать подготовку к матану,",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "19:00", "event_duration" : "30", "event_result" : "начать подготовку к матану,"                }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-336" : {
			"origin" : "В семь утра на два часа зарядка с растяжкой",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "07:00", "event_duration" : "120", "event_result" : "зарядка с растяжкой"             },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "19:00", "event_duration" : "120", "event_result" : "утра зарядка с растяжкой"        },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "07:00", "event_duration" : "30",  "event_result" : "на два часа зарядка с растяжкой" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-337" : {
			"origin" : "Через семь часов вылет из Казани в Москву",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "16:00", "event_duration" : "30", "event_result" : "вылет из Казани в Москву" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-338" : {
			"origin" : "К восьми часам утра явиться в выборный пункт",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "08:00", "event_duration" : "30", "event_result" : "явиться в выборный пункт"      },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "08:00", "event_duration" : "30", "event_result" : "утра явиться в выборный пункт" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-339" : {
			"origin" : "Прямое включение начинается в восемь по москве",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "20:00", "event_duration" : "30", "event_result" : "Прямое включение начинается по москве" },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "08:00", "event_duration" : "30", "event_result" : "Прямое включение начинается по москве" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-340" : {
			"origin" : "В девять - церемония закрытия",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "церемония закрытия" },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "21:00", "event_duration" : "30", "event_result" : "церемония закрытия" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-341" : {
			"origin" : "подойти за справкой к девяти часам утра не опаздывать!! напомнить за 15 минут",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "подойти за справкой не опаздывать!!"                       ,"event_alarms" : "-15"},
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "подойти за справкой не опаздывать!! напомнить за 15 минут" ,"event_alarms" : "-15"}
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-342" : {
			"origin" : "В десять вечера позвонить родителям, позвать на вечеринку",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "22:00", "event_duration" : "30", "event_result" : "позвонить родителям, позвать на вечеринку"        },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "10:00", "event_duration" : "30", "event_result" : "вечера позвонить родителям, позвать на вечеринку" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-343" : {
			"origin" : "Позвонить родителям в десять , позвать на вечеринку",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "10:00", "event_duration" : "30", "event_result" : "Позвонить родителям , позвать на вечеринку" },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "22:00", "event_duration" : "30", "event_result" : "Позвонить родителям , позвать на вечеринку" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-344" : {
			"origin" : "Начало спектакля через 1 час 40 минут",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "10:40", "event_duration" : "30", "event_result" : "Начало спектакля" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-345" : {
			"origin" : "В 12 часов 31 минуту отбытие с Казанского вокзала, поезд 32Ч",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "12:31", "event_duration" : "30", "event_result" : "отбытие с Казанского вокзала, поезд 32Ч" },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "00:31", "event_duration" : "30", "event_result" : "отбытие с Казанского вокзала, поезд 32Ч" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-346" : {
			"origin" : "закрыть тест к 7 ч. 5 минутам на 45 минут",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "19:05", "event_duration" : "45", "event_result" : "закрыть тест"             },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "07:05", "event_duration" : "45", "event_result" : "закрыть тест"             },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "19:05", "event_duration" : "30", "event_result" : "закрыть тест на 45 минут" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-347" : {
			"origin" : "Пойти в кино в 7 ч вечера завтра, продолжительность 180 минут",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "19:00", "event_duration" : "30", "event_result" : "Пойти в кино, продолжительность 180 минут"              },
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "07:00", "event_duration" : "30", "event_result" : "Пойти в кино вечера, продолжительность 180 минут"       },
				{ "event_type" : "N", "event_startDate" : "2015-03-14",                              "event_duration" : "30", "event_result" : "Пойти в кино в 7 ч вечера, продолжительность 180 минут" },
				{ "event_type" : "N",                                      "event_startTime" : "19:00", "event_duration" : "30", "event_result" : "Пойти в кино завтра, продолжительность 180 минут"       }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-348" : {
			"origin" : "Через 2 часа ночи станут короче",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "11:00", "event_duration" : "30", "event_result" : "ночи станут короче" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-349" : {
			"origin" : "начало спектакля в 3 ч. 42 мин., на 3 часа,",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "15:42", "event_duration" : "180", "event_result" : "начало спектакля, "            },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "03:42", "event_duration" : "180", "event_result" : "начало спектакля, "            },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "03:42", "event_duration" : "30",  "event_result" : "начало спектакля на 3 часа," },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "15:42", "event_duration" : "30",  "event_result" : "начало спектакля на 3 часа," }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-350" : {
			"origin" : "через 7ч 30 мин. вылет из Казани в Москву",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "16:30", "event_duration" : "30", "event_result" : "вылет из Казани в Москву" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-351" : {
			"origin" : "в 6 вечера возле каменного моста встреча выпускников 1999г",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "18:00", "event_duration" : "30", "event_result" : "возле каменного моста встреча выпускников 1999г"        },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "06:00", "event_duration" : "30", "event_result" : "вечера возле каменного моста встреча выпускников 1999г" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-352" : {
			"origin" : "завтрак с президентом в 8 ч. 40 минут",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "20:40", "event_duration" : "30", "event_result" : "завтрак с президентом" },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "08:40", "event_duration" : "30", "event_result" : "завтрак с президентом" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-353" : {
			"origin" : "завтра экскурсия по палеозойской эре, 7 человек в 13:00",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "13:00", "event_duration" : "30", "event_result" : "экскурсия по палеозойской эре, 7 человек"         },
				{ "event_type" : "N", "event_startDate" : "2015-03-14",                              "event_duration" : "30", "event_result" : "экскурсия по палеозойской эре, 7 человек в 13:00" },
				{ "event_type" : "N",                                      "event_startTime" : "13:00", "event_duration" : "30", "event_result" : "завтра экскурсия по палеозойской эре, 7 человек"  }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-354" : {
			"origin" : "конференция о способах поднятия эффективности через 2ч. 45 мин. в 5 корпусе",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "11:45", "event_duration" : "30", "event_result" : "конференция о способах поднятия эффективности в 5 корпусе" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-355" : {
			"origin" : "К 2 на прием к терапевту в 3 кабинет",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "14:00", "event_duration" : "30", "event_result" : "на прием к терапевту в 3 кабинет"},
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "02:00", "event_duration" : "30", "event_result" : "на прием к терапевту в 3 кабинет" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-356" : {
			"origin" : "завершение конференции в 2 ч дня, через час после закрытия - поезд",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "14:00", "event_duration" : "30", "event_result" : "завершение конференции, через час после закрытия - поезд"    },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "02:00", "event_duration" : "30", "event_result" : "завершение конференции дня, через час после закрытия - поезд" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-357" : {
			"origin" : "7 июля 15 собрание владельцев в 3:30 возле центральной кассы. На повестке: 1 вывоз мусора 2 уборка территории",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-07-07", "event_startTime" : "15:30", "event_duration" : "30", "event_result" : "собрание владельцев возле центральной кассы. На повестке: 1 вывоз мусора 2 уборка территории" },
				{ "event_type" : "N", "event_startDate" : "2015-07-07", "event_startTime" : "03:30", "event_duration" : "30", "event_result" : "собрание владельцев возле центральной кассы. На повестке: 1 вывоз мусора 2 уборка территории" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-358" : {
			"origin" : "Через 3 часа 30 минут подойти во 2 кассу, забрать билеты",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "12:30", "event_duration" : "30", "event_result" : "подойти во 2 кассу, забрать билеты" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-359" : {
			"origin" : "В 4 ч вечера заканчивается бронирование отеля напомнить за полчаса!",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "16:00", "event_duration" : "30", "event_result" : "заканчивается бронирование отеля!"                       ,"event_alarms" : "-30"},
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "04:00", "event_duration" : "30", "event_result" : "вечера заканчивается бронирование отеля!"                ,"event_alarms" : "-30"},
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "16:00", "event_duration" : "30", "event_result" : "заканчивается бронирование отеля напомнить за полчаса!" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-360" : {
			"origin" : "К 4 часам подъехать в детский сад за сыном напомнить за 2 ч.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "16:00", "event_duration" : "30", "event_result" : "подъехать в детский сад за сыном"                   ,"event_alarms" : "-120"},
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "04:00", "event_duration" : "30", "event_result" : "подъехать в детский сад за сыном"                   ,"event_alarms" : "-120"},
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "04:00", "event_duration" : "30", "event_result" : "подъехать в детский сад за сыном напомнить за 2 ч." },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "16:00", "event_duration" : "30", "event_result" : "подъехать в детский сад за сыном напомнить за 2 ч." }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-361" : {
			"origin" : "Отпроситься с работы в 16 ч.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "16:00", "event_duration" : "30", "event_result" : "Отпроситься с работы" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-362" : {
			"origin" : "поезд отбывает в 5 утра",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "05:00", "event_duration" : "30", "event_result" : "поезд отбывает"      },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "05:00", "event_duration" : "30", "event_result" : "поезд отбывает утра" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-363" : {
			"origin" : "Поезд 042Г через 6 часов 33 мин прибудет на станцию",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "15:33", "event_duration" : "30", "event_result" : "Поезд 042Г прибудет на станцию" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-364" : {
			"origin" : "В 5 часов вечера доставка, 33 коробки, напомнить за 10 минут",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "17:00", "event_duration" : "30", "event_result" : "доставка, 33 коробки"                       ,"event_alarms" : "-10"},
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "05:00", "event_duration" : "30", "event_result" : "вечера доставка, 33 коробки"                ,"event_alarms" : "-10"},
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "17:00", "event_duration" : "30", "event_result" : "доставка, 33 коробки, напомнить за 10 минут" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-365" : {
			"origin" : "Курьер должен подъехать завтра к 5 за документами, добавить формы 4.2 и 5.37, напомнить за 15 минут",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "05:00", "event_duration" : "30", "event_result" : "Курьер должен подъехать за документами, добавить формы 4.2 и 5.37"                              ,"event_alarms" : "-15"},
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "17:00", "event_duration" : "30", "event_result" : "Курьер должен подъехать за документами, добавить формы 4.2 и 5.37"                              ,"event_alarms" : "-15"},
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "17:00", "event_duration" : "30", "event_result" : "Курьер должен подъехать за документами, добавить формы 4.2 и 5.37, напомнить за 15 минут"        },
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "05:00", "event_duration" : "30", "event_result" : "Курьер должен подъехать за документами, добавить формы 4.2 и 5.37, напомнить за 15 минут"        },
				{ "event_type" : "N",                                      "event_startTime" : "17:00", "event_duration" : "30", "event_result" : "Курьер должен подъехать завтра за документами, добавить формы 4.2 и 5.37, напомнить за 15 минут" },
				{ "event_type" : "N",                                      "event_startTime" : "05:00", "event_duration" : "30", "event_result" : "Курьер должен подъехать завтра за документами, добавить формы 4.2 и 5.37, напомнить за 15 минут" },
				{ "event_type" : "N",                                      "event_startTime" : "17:00", "event_duration" : "30", "event_result" : "Курьер должен подъехать завтра за документами, добавить формы 4.2 и 5.37"                       },
				{ "event_type" : "N",                                      "event_startTime" : "05:00", "event_duration" : "30", "event_result" : "Курьер должен подъехать завтра за документами, добавить формы 4.2 и 5.37"                       },
				{ "event_type" : "N", "event_startDate" : "2015-03-14",                              "event_duration" : "30", "event_result" : "Курьер должен подъехать к 5 за документами, добавить формы 4.2 и 5.37, напомнить за 15 минут"    },
				{ "event_type" : "N", "event_startDate" : "2015-03-14",                              "event_duration" : "30", "event_result" : "Курьер должен подъехать к 5 за документами, добавить формы 4.2 и 5.37"                          }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-366" : {
			"origin" : "Через 13 ч. будут готовы результаты",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "22:00", "event_duration" : "30", "event_result" : "будут готовы результаты" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-367" : {
			"origin" : "В 18 часов 30 минут. возле каменного моста встреча",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "18:30", "event_duration" : "30", "event_result" : "возле каменного моста встреча" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-368" : {
			"origin" : "приехать на медосмотр к 18:00, не забыть две тетрадки",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "18:00", "event_duration" : "30", "event_result" : "приехать на медосмотр, не забыть две тетрадки" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-369" : {
			"origin" : "сегодня вечером в 7 начать подготовку к матану, сделать 15-20 билетов",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "19:00", "event_duration" : "30", "event_result" : "начать подготовку к матану, сделать 15-20 билетов"   }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-370" : {
			"origin" : "В 7:45 утра на 2 часа зарядка с растяжкой + 10-20 приседаний + 7-8 отжиманий",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "07:45", "event_duration" : "120", "event_result" : "зарядка с растяжкой + 10-20 приседаний + 7-8 отжиманий"           },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "19:45", "event_duration" : "120", "event_result" : "утра зарядка с растяжкой + 10-20 приседаний + 7-8 отжиманий"      },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "07:45", "event_duration" : "30",  "event_result" : "на 2 часа зарядка с растяжкой + 10-20 приседаний + 7-8 отжиманий" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-371" : {
			"origin" : "К 8 часам утра явиться в выборный пункт",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "08:00", "event_duration" : "30", "event_result" : "явиться в выборный пункт"      },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "20:00", "event_duration" : "30", "event_result" : "утра явиться в выборный пункт" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-372" : {
			"origin" : "Прямое включение начинается в 8:34 по москве",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "20:34", "event_duration" : "30", "event_result" : "Прямое включение начинается по москве" },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "08:34", "event_duration" : "30", "event_result" : "Прямое включение начинается по москве" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-373" : {
			"origin" : "В 21:00 - церемония закрытия 22 Олимпийских игр",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "21:00", "event_duration" : "30", "event_result" : "церемония закрытия 22 Олимпийских игр" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-374" : {
			"origin" : "подойти за справкой к 9:00 утра не опаздывать!! напомнить за 15 минут",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "подойти за справкой не опаздывать!!"                       ,"event_alarms" : "-15"},
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "21:00", "event_duration" : "30", "event_result" : "подойти за справкой утра не опаздывать!!"                  ,"event_alarms" : "-15"},
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "подойти за справкой не опаздывать!! напомнить за 15 минут" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-375" : {
			"origin" : "Сегодня в 22 часа позвонить родителям, позвать на вечеринку 23 мая 2014",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "22:00", "event_duration" : "30", "event_result" : "позвонить родителям, позвать на вечеринку 23 мая 2014"           },
				{ "event_type" : "N", "event_startDate" : "2015-03-13",                              "event_duration" : "30", "event_result" : "в 22 часа позвонить родителям, позвать на вечеринку 23 мая 2014" },
				{ "event_type" : "N",                                  "event_startTime" : "22:00", "event_duration" : "30", "event_result" : "Сегодня позвонить родителям, позвать на вечеринку 23 мая 2014"   }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-376" : {
			"origin" : "Позвонить родителям в 10 часов, позвать на вечеринку, напомнить в 9 часов",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "10:00", "event_duration" : "30", "event_result" : "Позвонить родителям, позвать на вечеринку, в 9 часов"                     ,"event_alarms" : "0"},
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "22:00", "event_duration" : "30", "event_result" : "Позвонить родителям, позвать на вечеринку, в 9 часов"                     ,"event_alarms" : "0"},
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "10:00", "event_duration" : "30", "event_result" : "Позвонить родителям, позвать на вечеринку, напомнить в 9 часов" },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "22:00", "event_duration" : "30", "event_result" : "Позвонить родителям, позвать на вечеринку, напомнить в 9 часов" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-377" : {
			"origin" : "Завтра в семь вечера на 35 минут поезд в сибирь на 5 пути",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "19:00", "event_duration" : "35", "event_result" : "поезд в сибирь на 5 пути"                           },
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "07:00", "event_duration" : "35", "event_result" : "вечера поезд в сибирь на 5 пути"                    },
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "19:00", "event_duration" : "30", "event_result" : "на 35 минут поезд в сибирь на 5 пути"               },
				{ "event_type" : "N", "event_startDate" : "2015-03-14",                              "event_duration" : "30", "event_result" : "в семь вечера на 35 минут поезд в сибирь на 5 пути" },
				{ "event_type" : "N", "event_startDate" : "2015-03-14",                              "event_duration" : "35", "event_result" : "в семь вечера поезд в сибирь на 5 пути"             },
				{ "event_type" : "N",                                      "event_startTime" : "19:00", "event_duration" : "30", "event_result" : "Завтра на 35 минут поезд в сибирь на 5 пути"        },
				{ "event_type" : "N",                                      "event_startTime" : "19:00", "event_duration" : "35", "event_result" : "Завтра поезд в сибирь на 5 пути"                    }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-378" : {
			"origin" : "Завтра ночью в 23:45 выйти смотреть на звезды",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "23:45", "event_duration" : "30", "event_result" : "ночью выйти смотреть на звезды"         },
				{ "event_type" : "N", "event_startDate" : "2015-03-14",                              "event_duration" : "30", "event_result" : "ночью в 23:45 выйти смотреть на звезды" },
				{ "event_type" : "N",                                      "event_startTime" : "23:45", "event_duration" : "30", "event_result" : "Завтра ночью выйти смотреть на звезды"  }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-379" : {
			"origin" : "напомнить про привоз мебели на 7 этаж 5 мая 15г в 22ч 47 м.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-05-05", "event_startTime" : "22:47", "event_duration" : "30", "event_alarms" : "0", "event_result" : "про привоз мебели на 7 этаж"  }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-380" : {
			"origin" : "через 37 минут включить 5 и 6 рубильники напомнить за 5 минут",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "09:37", "event_duration" : "30", "event_result" : "включить 5 и 6 рубильники"                      ,"event_alarms" : "-5"},
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "09:37", "event_duration" : "30", "event_result" : "включить 5 и 6 рубильники напомнить за 5 минут" ,"event_alarms" : "-5"}
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-381" : {
			"origin" : "Фильм 'Площадь Сан-Бабила, 20 часов' в 21 час напомнить за 10 минут",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "21:00", "event_duration" : "30", "event_alarms" : "-10", "event_result" : "Фильм 'Площадь Сан-Бабила, 20 часов'" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-382" : {
			"origin" : "Сегодня открытие сельхоз-ярмарки в 17 часов на красненской площади, продолжительность два дня",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "17:00", "event_duration" : "30", "event_result" : "открытие сельхоз-ярмарки на красненской площади, продолжительность два дня"            },
				{ "event_type" : "N", "event_startDate" : "2015-03-13",                              "event_duration" : "30", "event_result" : "открытие сельхоз-ярмарки в 17 часов на красненской площади, продолжительность два дня" },
				{ "event_type" : "N",                                  "event_startTime" : "17:00", "event_duration" : "30", "event_result" : "Сегодня открытие сельхоз-ярмарки на красненской площади, продолжительность два дня"    }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-383" : {
			"origin" : "Через 24 часа после начала отсчета произойдет открытие на 5 праздничных площадках",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "после начала отсчета произойдет открытие на 5 праздничных площадках" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-384" : {
			"origin" : "Подойти к подготовке к конференции в 19 часов 32 м в 21 аудитории",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "19:32", "event_duration" : "30", "event_result" : "Подойти к подготовке к конференции в 21 аудитории" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-385" : {
			"origin" : "Пойти в кино в три часа дня в 5 зал , продолжительность 180 минут",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "15:00", "event_duration" : "30", "event_result" : "Пойти в кино в 5 зал , продолжительность 180 минут"     },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "03:00", "event_duration" : "30", "event_result" : "Пойти в кино дня в 5 зал , продолжительность 180 минут" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-386" : {
			"origin" : "Сеанс в 18 часов в кино через 2 квартала, на 3 часа",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "18:00", "event_duration" : "180", "event_result" : "Сеанс в кино через 2 квартала" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-387" : {
			"origin" : "Столик заказан к 15 часам 35 минутам на 7 человек",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "15:35", "event_duration" : "30", "event_result" : "Столик заказан на 7 человек" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-388" : {
			"origin" : "Подойти по записи к врачу 7 декабря в 19 кабинет к 13 часам напомнить за 1 час 30 мин.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-12-07", "event_startTime" : "13:00", "event_duration" : "30","event_alarms" : "-90", "event_result" : "Подойти по записи к врачу в 19 кабинет"  }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-389" : {
			"origin" : "Подъехать на техосмотр в 22 гараж в 14 часов",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "14:00", "event_duration" : "30", "event_result" : "Подъехать на техосмотр в 22 гараж" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-390" : {
			"origin" : "18.12.2014 угнан Opel Astra примерно в два часа дня на ул. Машинная,58 госномер Р254АР",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2014-12-18", "event_startTime" : "14:00", "event_duration" : "30", "event_result" : "угнан Opel Astra примерно на ул. Машинная,58 госномер Р254АР"                },
				{ "event_type" : "N", "event_startDate" : "2014-12-18", "event_startTime" : "02:00", "event_duration" : "30", "event_result" : "угнан Opel Astra примерно дня на ул. Машинная,58 госномер Р254АР"            },
				{ "event_type" : "N", "event_startDate" : "2014-12-18",                              "event_duration" : "30", "event_result" : "угнан Opel Astra примерно в два часа дня на ул. Машинная,58 госномер Р254АР" },
				{ "event_type" : "N",                                   "event_startTime" : "14:00", "event_duration" : "30", "event_result" : "18.12.2014 угнан Opel Astra примерно на ул. Машинная,58 госномер Р254АР"     }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-391" : {
			"origin" : "Из-за приближающегося Нового года выросло количество машин на дорогах в выходные. Пробки в субботу составили 6 баллов, в воскресенье – 3 балла. Это выше, чем обычно. Топ-5 пробок в Новосибирске с 15 по 21 декабря 2014 года: Пробка в 12,8 км - 17 декабря, около 9:00 - Бердское шоссе, Большевистская улица - от Старого шоссе до Красного проспекта - 3 часа 10 минут.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Из-за приближающегося Нового года выросло количество машин на дорогах в выходные. Пробки составили 6 баллов, в воскресенье – 3 балла. Это выше, чем обычно. Топ-5 пробок в Новосибирске с 15 по 21 декабря 2014 года: Пробка в 12,8 км - 17 декабря Бердское шоссе, Большевистская улица - от Старого шоссе до Красного проспекта - 3 часа 10 минут." },
				{ "event_type" : "N", "event_startDate" : "2015-12-17", "event_startTime" : "15:10", "event_duration" : "30", "event_result" : "Из-за приближающегося Нового года выросло количество машин на дорогах в выходные. Пробки в субботу составили 6 баллов, в воскресенье – 3 балла. Это выше, чем обычно. Топ-5 пробок в Новосибирске с 15 по 21 декабря 2014 года: Пробка в 12,8 км Бердское шоссе, Большевистская улица - от Старого шоссе до Красного проспекта. " },
				{ "event_type" : "N", "event_startDate" : "2015-12-17", "event_startTime" : "03:10", "event_duration" : "30", "event_result" : "Из-за приближающегося Нового года выросло количество машин на дорогах в выходные. Пробки в субботу составили 6 баллов, в воскресенье – 3 балла. Это выше, чем обычно. Топ-5 пробок в Новосибирске с 15 по 21 декабря 2014 года: Пробка в 12,8 км Бердское шоссе, Большевистская улица - от Старого шоссе до Красного проспекта." }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-392" : {
			"origin" : "Старт торжественным открытиям елочных площадок в Советском районе дадут 20 декабря в 11.00 у Агропромпарка 'Казань (ул.Аграрная, 2). 22 декабря в 16.00 зажгутся огни на елке в микрорайоне 'Азино-2' по ул.Минская, 22.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-12-20", "event_startTime" : "11:00", "event_duration" : "30", "event_result" : "Старт торжественным открытиям елочных площадок в Советском районе дадут у Агропромпарка 'Казань (ул.Аграрная, 2). 22 декабря в 16.00 зажгутся огни на елке в микрорайоне 'Азино-2' по ул.Минская, 22."            },
				{ "event_type" : "N", "event_startDate" : "2015-12-20", "event_startTime" : "23:00", "event_duration" : "30", "event_result" : "Старт торжественным открытиям елочных площадок в Советском районе дадут у Агропромпарка 'Казань (ул.Аграрная, 2). 22 декабря в 16.00 зажгутся огни на елке в микрорайоне 'Азино-2' по ул.Минская, 22."            },
				{ "event_type" : "N", "event_startDate" : "2015-12-20",                              "event_duration" : "30", "event_result" : "Старт торжественным открытиям елочных площадок в Советском районе дадут в 11.00 у Агропромпарка 'Казань (ул.Аграрная, 2). 22 декабря в 16.00 зажгутся огни на елке в микрорайоне 'Азино-2' по ул.Минская, 22."    },
				{ "event_type" : "N",                                                    "event_startTime" : "11:00", "event_duration" : "30", "event_result" : "Старт торжественным открытиям елочных площадок в Советском районе дадут 20 декабря у Агропромпарка 'Казань (ул.Аграрная, 2). 22 декабря в 16.00 зажгутся огни на елке в микрорайоне 'Азино-2' по ул.Минская, 22." },
				{ "event_type" : "N",                                                    "event_startTime" : "23:00", "event_duration" : "30", "event_result" : "Старт торжественным открытиям елочных площадок в Советском районе дадут 20 декабря у Агропромпарка 'Казань (ул.Аграрная, 2). 22 декабря в 16.00 зажгутся огни на елке в микрорайоне 'Азино-2' по ул.Минская, 22." }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-393" : {
			"origin" : "В очереди пришлось стоять почти 4 часа, но ради любимой тещи я готов сделать что угодно! \nСамое интересное началось в 20.45, когда сказали, что через 15 минут магазин закрывается. В кассу стояло еще человек 50-70. Я думал, случится революция, но магазин не закрыли. Сам я расплатился за телевизор в 21.15.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "20:45", "event_duration" : "30", "event_result" : "В очереди пришлось стоять почти 4 часа, но ради любимой тещи я готов сделать что угодно! \nСамое интересное началось, когда сказали, что через 15 минут магазин закрывается. В кассу стояло еще человек 50-70. Я думал, случится революция, но магазин не закрыли. Сам я расплатился за телевизор в 21.15." },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "09:15", "event_duration" : "30", "event_result" : "В очереди пришлось стоять почти 4 часа, но ради любимой тещи я готов сделать что угодно! \nСамое интересное началось в 20.45, когда сказали, что магазин закрывается. В кассу стояло еще человек 50-70. Я думал, случится революция, но магазин не закрыли. Сам я расплатился за телевизор в 21.15." },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "21:15", "event_duration" : "30", "event_result" : "В очереди пришлось стоять почти 4 часа, но ради любимой тещи я готов сделать что угодно! \nСамое интересное началось в 20.45, когда сказали, что через 15 минут магазин закрывается. В кассу стояло еще человек 50-70. Я думал, случится революция, но магазин не закрыли. Сам я расплатился за телевизор." }

			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-394" : {
			"origin" : "Загорелась одна из квартир. \nКак сообщили в пресс-службе ГУ МЧС России по Новосибирской области, 22 декабря, в 04:07 случился крупный пожар в жилом доме, расположенном в переулке Петропавловском, 4. Сотрудники МЧС тут же выехали на место, предотвратили распространение огня и эвакуировали из подъезда 8 человек. В 04:26 пожар был потушен.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-12-22", "event_startTime" : "16:07", "event_duration" : "30", "event_result" : "Загорелась одна из квартир. \nКак сообщили в пресс-службе ГУ МЧС России по Новосибирской области, случился крупный пожар в жилом доме, расположенном в переулке Петропавловском, 4. Сотрудники МЧС тут же выехали на место, предотвратили распространение огня и эвакуировали из подъезда 8 человек. В 04:26 пожар был потушен." },
				{ "event_type" : "N", "event_startDate" : "2015-12-22", "event_startTime" : "04:07", "event_duration" : "30", "event_result" : "Загорелась одна из квартир. \nКак сообщили в пресс-службе ГУ МЧС России по Новосибирской области, случился крупный пожар в жилом доме, расположенном в переулке Петропавловском, 4. Сотрудники МЧС тут же выехали на место, предотвратили распространение огня и эвакуировали из подъезда 8 человек. В 04:26 пожар был потушен." },
				{ "event_type" : "N", "event_startDate" : "2015-12-22", "event_startTime" : "16:26", "event_duration" : "30", "event_result" : "Загорелась одна из квартир. \nКак сообщили в пресс-службе ГУ МЧС России по Новосибирской области, случился крупный пожар в жилом доме, расположенном в переулке Петропавловском, 4. Сотрудники МЧС тут же выехали на место, предотвратили распространение огня и эвакуировали из подъезда 8 человек. пожар был потушен." },
				{ "event_type" : "N", "event_startDate" : "2015-12-22", "event_startTime" : "04:26", "event_duration" : "30", "event_result" : "Загорелась одна из квартир. \nКак сообщили в пресс-службе ГУ МЧС России по Новосибирской области, случился крупный пожар в жилом доме, расположенном в переулке Петропавловском, 4. Сотрудники МЧС тут же выехали на место, предотвратили распространение огня и эвакуировали из подъезда 8 человек. пожар был потушен." }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-395" : {
			"origin" : "Утренние торги на Московской бирже начались с укрепления рубля по отношению к евро и доллару. По состоянию в 10:33 мск доллар торговался по 56,60 рублей, за евро давали 69,22 рубля.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "10:33", "event_duration" : "30", "event_result" : "Утренние торги на Московской бирже начались с укрепления рубля по отношению к евро и доллару. По состоянию мск доллар торговался по 56,60 рублей, за евро давали 69,22 рубля." },
				{ "event_type" : "N", "event_startTime" : "22:33", "event_duration" : "30", "event_result" : "Утренние торги на Московской бирже начались с укрепления рубля по отношению к евро и доллару. По состоянию мск доллар торговался по 56,60 рублей, за евро давали 69,22 рубля." }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-396" : {
			"origin" : "В будние дни уже в 5 утра по московскому времени начинается рост посещаемости за счет дальневосточной и сибирской аудитории. В 8 утра, когда просыпаются москвичи, рост резко ускоряется, и уже к 11 часам активность аудитории в 4 раза превышает минимальный ночной уровень. При этом пик посещаемости в будние дни растянут во времени: только в районе 6 вечера, с окончанием рабочего дня для посетителей из московского часового пояса, посещаемость начинает сокращаться. Вплоть до 9 вечера каждый час аудитория сокращается примерно на 30-40 тысяч человек, а после 9 вечера спад замедляется до 10-20 тысяч человек в час.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "05:00",  "event_duration" : "960", "event_result" : "В будние дни уже по московскому времени начинается рост посещаемости за счет дальневосточной и сибирской аудитории. В 8 утра, когда просыпаются москвичи, рост резко ускоряется, и уже к 11 часам активность аудитории в 4 раза превышает минимальный ночной уровень. При этом пик посещаемости в будние дни растянут во времени: только в районе 6 вечера, с окончанием рабочего дня для посетителей из московского часового пояса, посещаемость начинает сокращаться. Вплоть каждый час аудитория сокращается примерно на 30-40 тысяч человек, а после 9 вечера спад замедляется до 10-20 тысяч человек в час."      }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-397" : {
			"origin" : "Я сделал и таблицу динамики явки. То есть какая доля людей, пришедших на участки, сделала это с 8 до 12 часов, с 12 до 15 часов и т.д. Вот тут начинается самое интересное. Чаще всего выглядит ужасно, неправдоподобно и это явное свидетельство манипуляций. Самый большой наплыв людей идет с 10 до 14 - 15 часов, а потом идет спад. Но не могут 9% от всех пришедших за день проголосовать в 15 до 18 часов и 20% с 18 до 20 часов, как было в Евпатории",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "12:00", "event_duration" : "180",  "event_result" : "Я сделал и таблицу динамики явки. То есть какая доля людей, пришедших на участки, сделала это с 8 до 12 часов, и т.д. Вот тут начинается самое интересное. Чаще всего выглядит ужасно, неправдоподобно и это явное свидетельство манипуляций. Самый большой наплыв людей идет с 10 до 14 - 15 часов, а потом идет спад. Но не могут 9% от всех пришедших за день проголосовать в 15 до 18 часов и 20% с 18 до 20 часов, как было в Евпатории" },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "20:00", "event_duration" : "240", "event_result" : "Я сделал и таблицу динамики явки. То есть какая доля людей, пришедших на участки, сделала это, с 12 до 15 часов и т.д. Вот тут начинается самое интересное. Чаще всего выглядит ужасно, неправдоподобно и это явное свидетельство манипуляций. Самый большой наплыв людей идет с 10 до 14 - 15 часов, а потом идет спад. Но не могут 9% от всех пришедших за день проголосовать в 15 до 18 часов и 20% с 18 до 20 часов, как было в Евпатории" },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "08:00", "event_duration" : "240", "event_result" : "Я сделал и таблицу динамики явки. \nТо есть какая доля людей, пришедших на участки, сделала это, с 12 до 15 часов и т.д. Вот тут начинается самое интересное. Чаще всего выглядит ужасно, неправдоподобно и это явное свидетельство манипуляций. Самый большой наплыв людей идет с 10 до 14 - 15 часов, а потом идет спад. Но не могут 9% от всех пришедших за день проголосовать в 15 до 18 часов и 20% с 18 до 20 часов, как было в Евпатории" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-398" : {
			"origin" : "Из-за всего этого покупка валюты сократилась, но и её продажи пока относительное невелики (за 4 часа торгов объем сделок в паре доллар/рубль расчетами завтра - менее $1,8 миллиарда): участники рынка стараются изыскивать рублевые ресурсы через другие инструменты, нежели используя продажу валюты.К 14.25 МСК доллар США расчетами 'завтра' оценивался в 55,93 рубля, что на 4,5 процента ниже предыдущего закрытия. Ранее доллар упал на 55,75 - минимум с 11 декабря. Пара евро/рубль расчетами 'завтра' к этому времени торговалась вблизи отметки 68,58, что на 5,4 процента ниже предыдущего закрытия.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "14:25", "event_duration" : "30", "event_result" : "Из-за всего этого покупка валюты сократилась, но и её продажи пока относительное невелики (за 4 часа торгов объем сделок в паре доллар/рубль расчетами менее $1,8 миллиарда): участники рынка стараются изыскивать рублевые ресурсы через другие инструменты, нежели используя продажу валюты.МСК доллар США расчетами 'завтра' оценивался в 55,93 рубля, что на 4,5 процента ниже предыдущего закрытия. Ранее доллар упал на 55,75 - минимум с 11 декабря. Пара евро/рубль расчетами 'завтра' к этому времени торговалась вблизи отметки 68,58, что на 5,4 процента ниже предыдущего закрытия."         }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-399" : {
			"origin" : "Вчера с ip 85.172.192.180 в 13:20 был произведен взлом серверов в 15 точках по всему городу",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-12", "event_startTime" : "13:20", "event_duration" : "30", "event_result" : "с ip 85.172.192.180 был произведен взлом серверов в 15 точках по всему городу"         },
				{ "event_type" : "N", "event_startDate" : "2015-03-12",                              "event_duration" : "30", "event_result" : "с ip 85.172.192.180 в 13:20 был произведен взлом серверов в 15 точках по всему городу" },
				{ "event_type" : "N",                                   "event_startTime" : "13:20", "event_duration" : "30", "event_result" : "Вчера с ip 85.172.192.180 был произведен взлом серверов в 15 точках по всему городу"   }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-400" : {
			"origin" : "Завтра в 15 часов вызвонить (214) 748-36-47 Лера, +9(917) 10-12-14 Наталья, +6(882 ) 22-08-15 напомнить",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "15:00", "event_duration" : "30", "event_result" : "вызвонить (214) 748-36-47 Лера, +9(917) 10-12-14 Наталья, +6(882 ) 22-08-15",            "event_alarms" : "0"  },

				{ "event_type" : "N", "event_startDate" : "2015-03-14",                              "event_duration" : "30", "event_result" : "в 15 часов вызвонить (214) 748-36-47 Лера, +9(917) 10-12-14 Наталья, +6(882 ) 22-08-15", "event_alarms" : "0"  },
				{ "event_type" : "N",                                    "event_startTime" : "15:00", "event_duration" : "30", "event_result" : "Завтра вызвонить (214) 748-36-47 Лера, +9(917) 10-12-14 Наталья, +6(882 ) 22-08-15",   "event_alarms" : "0"  },
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "15:00", "event_duration" : "30", "event_result" : "вызвонить (214) 748-36-47 Лера, +9(917) 10-12-14 Наталья, +6(882 ) 22-08-15 напомнить"                        }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-401" : {
			"origin" : "Подключить 192.168.12.11 , 192.168.3.5 , 192.168.12.5 , к общей сети 257.19.10.0 9 апреля в 14:15",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-04-09", "event_startTime" : "14:15", "event_duration" : "30", "event_result" : "Подключить 192.168.12.11 , 192.168.3.5 , 192.168.12.5 , к общей сети 257.19.10.0"         },

				{ "event_type" : "N", "event_startDate" : "2015-04-09",                              "event_duration" : "30", "event_result" : "Подключить 192.168.12.11 , 192.168.3.5 , 192.168.12.5 , к общей сети 257.19.10.0 в 14:15"  },
				{ "event_type" : "N",                                                  "event_startTime" : "14:15", "event_duration" : "30", "event_result" : "Подключить 192.168.12.11 , 192.168.3.5 , 192.168.12.5 , к общей сети 257.19.10.0 9 апреля" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-402" : {
			"origin" : "Через 7 часов позвонить +7(890)436-39-466",
			"expectations" : [
				{ "event_type" : "N", "event_startDate": "2015-03-13", "event_startTime" : "16:00", "event_duration" : "30", "event_result" : "позвонить +7(890)436-39-466" },
				{ "event_type" : "N", "event_startDate": "2015-03-14", "event_startTime" : "16:00", "event_duration" : "30", "event_result" : "позвонить +7(890)436-39-466" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-403" : {
			"origin" : "7 июля в 15:52 обнаружил совпадение по адресу сети с одним из направ­лений в таблице и выяснил, что адресат 140.252.13.33 находится в его собственной сети 140.252.13.0.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-07-07", "event_startTime" : "15:52", "event_duration" : "30", "event_result" : "обнаружил совпадение по адресу сети с одним из направ­лений в таблице и выяснил, что адресат 140.252.13.33 находится в его собственной сети 140.252.13.0."         }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-404" : {
			"origin" : "через 15 минут отправить запрос на 140.252.1.4 напомнить вовремя",
			"expectations" : [
				{ "event_type" : "N", "event_startDate": "2015-03-13", "event_startTime" : "09:15", "event_duration" : "30", "event_result" : "отправить запрос на 140.252.1.4" , "event_alarms" : "0"	},
				{ "event_type" : "N", "event_startDate": "2015-03-14", "event_startTime" : "09:15", "event_duration" : "30", "event_result" : "отправить запрос на 140.252.1.4"	, "event_alarms" : "0"	},

				{ "event_type" : "N", "event_startTime" : "09:15", "event_duration" : "30", "event_result" : "отправить запрос на 140.252.1.4 напомнить во время" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-405" : {
			"origin" : "233-15-03, 245-10-12 офис позвонить завтра в в 8 утра",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "08:00", "event_duration" : "30", "event_result" : "233-15-03, 245-10-12 офис позвонить в"          },

				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "20:00", "event_duration" : "30", "event_result" : "233-15-03, 245-10-12 офис позвонить в утра"     },
				{ "event_type" : "N", "event_startDate" : "2015-03-14",                              "event_duration" : "30", "event_result" : "233-15-03, 245-10-12 офис позвонить в в 8 утра" },
				{ "event_type" : "N",                                      "event_startTime" : "08:00", "event_duration" : "30", "event_result" : "233-15-03, 245-10-12 офис позвонить завтра в"   }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-406" : {
			"origin" : "245-15-12 Рената, 8(937) 234-05-15 Анюта, 6-10-11 Профком",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2011-10-06", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "245-15-12 Рената, 8(937) 234-05-15 Анюта, Профком"          }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-407" : {
			"origin" : "15 июля в 4 часа Наиль +7 935 24 13 15",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-07-15", "event_startTime" : "16:00", "event_duration" : "30", "event_result" : "Наиль +7 935 24 13 15"          },
				{ "event_type" : "N", "event_startDate" : "2015-07-15", "event_startTime" : "04:00", "event_duration" : "30", "event_result" : "Наиль +7 935 24 13 15"          },

				{ "event_type" : "N", "event_startDate" : "2015-07-15",                              "event_duration" : "30", "event_result" : "в 4 часа Наиль +7 935 24 13 15" },
				{ "event_type" : "N",                                                  "event_startTime" : "04:00", "event_duration" : "30", "event_result" : "15 июля Наиль +7 935 24 13 15"  },
				{ "event_type" : "N",                                                  "event_startTime" : "16:00", "event_duration" : "30", "event_result" : "15 июля Наиль +7 935 24 13 15"  }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-408" : {
			"origin" : "Забрать посылку завтра в 9 часы работы 9:00-16:00, обед 12:00-13:00 трек-номер 11512780151384",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_duration" : "420", "event_result" : "Забрать посылку в 9 часы работы, обед 12:00-13:00 трек-номер 11512780151384"        },
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "21:00", "event_duration" : "420", "event_result" : "Забрать посылку часы работы 9:00-16:00, обед 12:00-13:00 трек-номер 11512780151384"        },

				{ "event_type" : "N", "event_startDate" : "2015-03-14",                              "event_duration" : "30", "event_result" : "Забрать посылку в 9 часы работы 9:00-16:00, обед 12:00-13:00 трек-номер 11512780151384"    },
				{ "event_type" : "N",                                      "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Забрать посылку завтра часы работы 9:00-16:00, обед 12:00-13:00 трек-номер 11512780151384" },
				{ "event_type" : "N",                                      "event_startTime" : "21:00", "event_duration" : "30", "event_result" : "Забрать посылку завтра часы работы 9:00-16:00, обед 12:00-13:00 трек-номер 11512780151384" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-409" : {
			"origin" : "Завтра отнести документы к 5 часам вечера ИНН 234567845634 страховой полис АБ 12-1899 паспорт 9375 339713",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "17:00", "event_duration" : "30", "event_result" : "отнести документы ИНН 234567845634 страховой полис АБ 12-1899 паспорт 9375 339713"                  },

				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "05:00", "event_duration" : "30", "event_result" : "отнести документы вечера ИНН 234567845634 страховой полис АБ 12-1899 паспорт 9375 339713"           },
				{ "event_type" : "N", "event_startDate" : "2015-03-14",                              "event_duration" : "30", "event_result" : "отнести документы к 5 часам вечера ИНН 234567845634 страховой полис АБ 12-1899 паспорт 9375 339713" },
				{ "event_type" : "N",                                      "event_startTime" : "17:00", "event_duration" : "30", "event_result" : "Завтра отнести документы ИНН 234567845634 страховой полис АБ 12-1899 паспорт 9375 339713"           }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-410" : {
			"origin" : "заехать за договором сегодня в обед , проверить: договор 13-35 от 12.05.1999",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "12:00", "event_duration" : "30", "event_result" : "заехать за договором , проверить: договор 13-35 от 12.05.1999"         },

				{ "event_type" : "N", "event_startDate" : "2015-03-13",                              "event_duration" : "30", "event_result" : "заехать за договором в обед , проверить: договор 13-35 от 12.05.1999"  },
				{ "event_type" : "N",                                  "event_startTime" : "12:00", "event_duration" : "30", "event_result" : "заехать за договором сегодня , проверить: договор 13-35 от 12.05.1999" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-411" : {
			"origin" : "В 15 часов сходить отправить письма: Елена 426756 Колыма, ул. Ленина 15-52, Евкакий 201295 Ростов, Якуба Коласа 17-35, Пафнутий Северодвинск 422561 Октябрят 3-25",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "15:00", "event_duration" : "30", "event_result" : "сходить отправить письма: Елена 426756 Колыма, ул. Ленина 15-52, Евкакий 201295 Ростов, Якуба Коласа 17-35, Пафнутий Северодвинск 422561 Октябрят 3-25" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-412" : {
			"origin" : "В субботу в 6 часов вечера напомнить сходить за продуктами: хлеб 20.00, молоко 27.00, сырки по 5.20 5 шт., сода 1 уп., кефир 2,5% 2 пакета , 2-3 уп. макарон, сыр 200г 56-50, сосиски 96.20",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "18:00", "event_duration" : "30", "event_result" : "сходить за продуктами: хлеб 20.00, молоко 27.00, сырки по 5.20 5 шт., сода 1 уп., кефир 2,5% 2 пакета , 2-3 уп. макарон, сыр 200г 56-50, сосиски 96.20"                  , "event_alarms" : "0"},

				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "06:00", "event_duration" : "30", "event_result" : "вечера сходить за продуктами: хлеб 20.00, молоко 27.00, сырки по 5.20 5 шт., сода 1 уп., кефир 2,5% 2 пакета , 2-3 уп. макарон, сыр 200г 56-50, сосиски 96.20"           , "event_alarms" : "0"},
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "18:00", "event_duration" : "30", "event_result" : "напомнить сходить за продуктами: хлеб 20.00, молоко 27.00, сырки по 5.20 5 шт., сода 1 уп., кефир 2,5% 2 пакета , 2-3 уп. макарон, сыр 200г 56-50, сосиски 96.20"        },
				{ "event_type" : "N", "event_startDate" : "2015-03-14",                              "event_duration" : "30", "event_result" : "в 6 часов вечера сходить за продуктами: хлеб 20.00, молоко 27.00, сырки по 5.20 5 шт., сода 1 уп., кефир 2,5% 2 пакета , 2-3 уп. макарон, сыр 200г 56-50, сосиски 96.20" },
				{ "event_type" : "N",                                            "event_startTime" : "18:00", "event_duration" : "30", "event_result" : "В субботу сходить за продуктами: хлеб 20.00, молоко 27.00, сырки по 5.20 5 шт., сода 1 уп., кефир 2,5% 2 пакета , 2-3 уп. макарон, сыр 200г 56-50, сосиски 96.20"        }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-413" : {
			"origin" : "В 7:00 перевести часы на час назад",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "19:00", "event_duration" : "30", "event_result" : "перевести часы на час назад" },
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "07:00", "event_duration" : "30", "event_result" : "перевести часы на час назад" },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "07:00", "event_duration" : "30", "event_result" : "перевести часы на час назад" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-414" : {
			"origin" : "Выпить таблетки завтра в обед, напомнить за 14 часов",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14",	"event_startTime" : "12:00", "event_duration" : "30", "event_alarms" : "-840", "event_result" : "Выпить таблетки"                        },
				{ "event_type" : "N",                                   "event_startTime" : "12:00", "event_duration" : "30", "event_alarms" : "-840", "event_result" : "Выпить таблетки завтра"                 },

				{ "event_type" : "N", "event_startDate" : "2015-03-14",                              "event_duration" : "30", "event_result" : "Выпить таблетки в обед"                },
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "12:00", "event_duration" : "30", "event_result" : "Выпить таблетки, напомнить за 14 часов" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-415" : {
			"origin" : "15.04 Убраться в квартире к приезду родителей, предупредить за 48ч.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-04-15", "event_startTime" : "09:00", "event_duration" : "30", "event_alarms" : "-2880", "event_result" : "Убраться в квартире к приезду родителей"},

				{ "event_type" : "N", "event_startDate" : "2015-04-15", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Убраться в квартире к приезду родителей, предупредить за 48ч." } // ожидает рабочего времени пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-416" : {
			"origin" : "Поехать в аэропорт в 3:00, напомнить за три часа",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "15:00", "event_duration" : "30", "event_alarms" : "-180", "event_result" : "Поехать в аэропорт" },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "03:00", "event_duration" : "30", "event_alarms" : "-180", "event_result" : "Поехать в аэропорт" },
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "03:00", "event_duration" : "30", "event_alarms" : "-180", "event_result" : "Поехать в аэропорт" },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "15:00", "event_duration" : "30", "event_alarms" : "-180", "event_result" : "Поехать в аэропорт" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-417" : {
			"origin" : "Переделать документы по селу Алексеево в 14:00 предупредить за пять минут.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "14:00", "event_duration" : "30", "event_alarms" : "-5", "event_result" : "Переделать документы по селу Алексеево."                             },
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "14:00", "event_duration" : "30", "event_alarms" : "-5", "event_result" : "Переделать документы по селу Алексеево." }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-418" : {
			"origin" : "Съездить в автосервис в 18:00, напомнить за десять мин.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "18:00", "event_duration" : "30", "event_result" : "Съездить в автосервис", "event_alarms" : "-10" },
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "18:00", "event_duration" : "30", "event_result" : "Съездить в автосервис", "event_alarms" : "-10" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-419" : {
			"origin" : "Подъехать в кафе к трем, напомнить за 90 минут",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "15:00", "event_duration" : "30", "event_result" : "Подъехать в кафе", "event_alarms" : "-90" },
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "03:00", "event_duration" : "30", "event_result" : "Подъехать в кафе", "event_alarms" : "-90" },
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "15:00", "event_duration" : "30", "event_result" : "Подъехать в кафе" },
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "03:00", "event_duration" : "30", "event_result" : "Подъехать в кафе" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-420" : {
			"origin" : "Вылет 15/04 Напомнить за два дня",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-04-15", "event_startTime" : "09:00", "event_duration" : "30", "event_alarms" : "-2880", "event_result" : "Вылет" } // ожидает рабочего времени пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-421" : {
			"origin" : "Вылет 15.04 напомнить за день",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-04-15", "event_startTime" : "09:00", "event_duration" : "30", "event_alarms" : "-1440", "event_result" : "Вылет" } // ожидает рабочего времени пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-422" : {
			"origin" : "Вылет 15/04 напомнить за 4 дня",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-04-15", "event_startTime" : "09:00", "event_duration" : "30", "event_alarms" : "-5760", "event_result" : "Вылет" } // ожидает рабочего времени пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-423" : {
			"origin" : "Вылет 15 мая предупредить за 5 дн",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-05-15", "event_startTime" : "09:00", "event_duration" : "30", "event_alarms" : "-7200", "event_result" : "Вылет" } // ожидает рабочего времени пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-424" : {
			"origin" : "Вылет 15.04 предупредить за два дня",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-04-15", "event_startTime" : "09:00", "event_duration" : "30", "event_alarms" : "-2880", "event_result" : "Вылет" } // ожидает рабочего времени пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-425" : {
			"origin" : "Вылет 15.04 предупредить за день",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-04-15", "event_startTime" : "09:00", "event_duration" : "30", "event_alarms" : "-1440", "event_result" : "Вылет" } // ожидает рабочего времени пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-426" : {
			"origin" : "Вылет 15/04 предупредить за 4 дня",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-04-15", "event_startTime" : "09:00", "event_duration" : "30", "event_alarms" : "-5760", "event_result" : "Вылет" } // ожидает рабочего времени пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-427" : {
			"origin" : "Вылет 15.04 Напомнить за 1 неделю",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-04-15", "event_startTime" : "09:00", "event_duration" : "30", "event_alarms" : "-10080", "event_result" : "Вылет" } // ожидает рабочего времени пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-428" : {
			"origin" : "Вылет 15.04 напомнить за две недели",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-04-15", "event_startTime" : "09:00", "event_duration" : "30", "event_alarms" : "-20160", "event_result" : "Вылет" } // ожидает рабочего времени пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-429" : {
			"origin" : "Напомнить за 3 недели напомнить, Вылет 15.04",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-04-15", "event_startTime" : "09:00", "event_duration" : "30", "event_alarms" : "-30240", "event_result" : "Напомнить, Вылет" } // ожидает рабочего времени пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-430" : {
			"origin" : "Вылет 15 мая предупредить за 4 нед",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-05-15", "event_startTime" : "09:00", "event_duration" : "30", "event_alarms" : "-40320", "event_result" : "Вылет" } // ожидает рабочего времени пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-431" : {
			"origin" : "Вылет 15.04 предупредить за 2 недели",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-04-15", "event_startTime" : "09:00", "event_duration" : "30", "event_alarms" : "-20160", "event_result" : "Вылет" } // ожидает рабочего времени пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-432" : {
			"origin" : "Вылет 15.04 предупредить за 3 недели",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-04-15", "event_startTime" : "09:00", "event_duration" : "30", "event_alarms" : "-30240", "event_result" : "Вылет" } // ожидает рабочего времени пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-433" : {
			"origin" : "предупредить за 1 неделю, вылет 15.04",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-04-15", "event_startTime" : "09:00", "event_duration" : "30", "event_alarms" : "-10080", "event_result" : "вылет" } // ожидает рабочего времени пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-434" : {
			"origin" : "21 апреля зачет по экономике в 15:45 напомнить за пять часов",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-04-21", "event_startTime" : "15:45", "event_duration" : "30", "event_alarms" : "-300", "event_result" : "зачет по экономике"                         },

				{ "event_type" : "N", "event_startDate" : "2015-04-21",                              "event_duration" : "30", "event_alarms" : "-300", "event_result" : "зачет по экономике в 15:45"                 },
				{ "event_type" : "N",                                                   "event_startTime" : "15:45", "event_duration" : "30", "event_alarms" : "-300", "event_result" : "21 апреля зачет по экономике"               },
				{ "event_type" : "N", "event_startDate" : "2015-04-21", "event_startTime" : "15:45", "event_duration" : "30", "event_result" : "зачет по экономике напомнить за пять часов" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-435" : {
			"origin" : "21 апреля зачет по экономике напомнить за два часов 15 мин",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-04-21", "event_startTime" : "09:00", "event_duration" : "30", "event_alarms" : "-135", "event_result" : "зачет по экономике" },

				{ "event_type" : "N",                                                   "event_duration" : "30", "event_alarms" : "-135", "event_result" : "21 апреля зачет по экономике"                     },
				{ "event_type" : "N", "event_startDate" : "2015-04-21", "event_duration" : "30", "event_result" : "зачет по экономике напомнить за два часов 15 мин" } // ожидает рабочего времени пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-436" : {
			"origin" : "Зачет по экономике сегодня в 10, напомнить за 3 часа 30 мин",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "10:00", "event_duration" : "30", "event_alarms" : "-210", "event_result" : "Зачет по экономике"},
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "22:00", "event_duration" : "30", "event_alarms" : "-210", "event_result" : "Зачет по экономике"}
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-437" : {
			"origin" : "21 апреля зачет по экономике в 15:45 предупредить за 1 день",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-04-21", "event_startTime" : "15:45", "event_duration" : "30", "event_alarms" : "-1440", "event_result" : "зачет по экономике" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		//"TC-438" : {
		//	"origin" : "20 мая Не забыть про тапочки напомнить за 12:10м",
		//	"expectations" : [
		//		{ "event_type" : "N", "event_startDate" : "2015-05-20", "event_startTime" : "09:00", "event_duration" : "30", "event_alarms" : "0", "event_result" : "Не забыть про тапочки за 12:10м"                     },
		//
		//		{ "event_type" : "N", "event_startDate" : "2015-05-20", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Не забыть про тапочки напомнить за 12:10м" } // ожидает рабочего времени пользователя
		//	],
		//	"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		//},
		//"TC-439" : {
		//	"origin" : "20 мая Не забыть про тапочки напомнить за 12:00ч",
		//	"expectations" : [
		//		{ "event_type" : "N", "event_startDate" : "2015-05-20", "event_startTime" : "09:00", "event_duration" : "30", "event_alarms" : "0", "event_result" : "Не забыть про тапочки за 12:00ч"                     },
		//
		//		{ "event_type" : "N", "event_startDate" : "2015-05-20", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Не забыть про тапочки напомнить за 12:00ч" } // ожидает рабочего времени пользователя
		//	],
		//	"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		//},
		"TC-440" : {
			"origin" : "В 15:00 Заказать такси, напомнить во время события",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "15:00", "event_duration" : "30", "event_alarms" : "0", "event_result" : "Заказать такси"   },
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "15:00", "event_duration" : "30", "event_alarms" : "0", "event_result" : "Заказать такси"   }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-441" : {
			"origin" : "Заказать такси 16 апреля напомнить",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-04-16", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Заказать такси",           "event_alarms" : "0"  },

				{ "event_type" : "N", "event_startDate" : "2015-04-16", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Заказать такси напомнить"                      } // ожидает рабочего времени пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-442" : {
			"origin" : "Антон 8917-25-02-12-1 возвращается из армии 25 января в 14:00, напомнить за день",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2016-01-25", "event_startTime" : "14:00", "event_duration" : "30", "event_alarms" : "-1440", "event_result" : "Антон 8917-25-02-12-1 возвращается из армии"                              },

				{ "event_type" : "N", "event_startDate" : "2016-01-25", "event_startTime" : "14:00", "event_duration" : "30", "event_result" : "Антон 8917-25-02-12-1 возвращается из армии, напомнить за день"           },
				{ "event_type" : "N", "event_startDate" : "2016-01-25",                              "event_duration" : "30", "event_result" : "Антон 8917-25-02-12-1 возвращается из армии в 14:00"                      },
				{ "event_type" : "N",                                                   "event_startTime" : "14:00", "event_duration" : "30", "event_result" : "Антон 8917-25-02-12-1 возвращается из армии 25 января"                    },
				{ "event_type" : "N",                                                   "event_startTime" : "14:00", "event_duration" : "30", "event_result" : "Антон 8917-25-02-12-1 возвращается из армии 25 января, напомнить за день" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-443" : {
			"origin" : "Гарри Поттеру было 20 лет. 14 мая вышел первый эпизод с его участием. 27 января состоится презентация новой книги напомнить за час.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-05-14", "event_startTime" : "09:00", "event_duration" : "30", "event_alarms" : "-60", "event_result" : "Гарри Поттеру было 20 лет. вышел первый эпизод с его участием. 27 января состоится презентация новой книги."                  },
				{ "event_type" : "N", "event_startDate" : "2016-01-27", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Гарри Поттеру было 20 лет. 14 мая вышел первый эпизод с его участием. состоится презентация новой книги напомнить за час." } // ожидает рабочего времени пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-444" : {
			"origin" : "23 года исполняется Ольге завтра напомнить за 1",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_duration" : "30", "event_alarms" : "-1", "event_result" : "23 года исполняется Ольге"                },

				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "23 года исполняется Ольге напомнить за 1" } // ожидает рабочего времени пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-445" : {
			"origin" : "Путешествие гуливера в 2040 году - сумасшедший фильм выходит завтра в кинотеатрах в 23:55 напомнить",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "23:55", "event_duration" : "30", "event_result" : "Путешествие гуливера в 2040 году - сумасшедший фильм выходит в кинотеатрах",                   "event_alarms" : "0"  },
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "23:55", "event_duration" : "30", "event_result" : "Путешествие гуливера в 2040 году - сумасшедший фильм выходит в кинотеатрах напомнить"                              },

				{ "event_type" : "N", "event_startDate" : "2015-03-14",                              "event_duration" : "30", "event_result" : "Путешествие гуливера в 2040 году - сумасшедший фильм выходит в кинотеатрах в 23:55",           "event_alarms" : "0"  },
				{ "event_type" : "N", "event_startDate" : "2015-03-14",                              "event_duration" : "30", "event_result" : "Путешествие гуливера в 2040 году - сумасшедший фильм выходит в кинотеатрах в 23:55 напомнить"                      },
				{ "event_type" : "N",                                      "event_startTime" : "23:55", "event_duration" : "30", "event_result" : "Путешествие гуливера в 2040 году - сумасшедший фильм выходит завтра в кинотеатрах",            "event_alarms" : "0"  },
				{ "event_type" : "N",                                      "event_startTime" : "23:55", "event_duration" : "30", "event_result" : "Путешествие гуливера в 2040 году - сумасшедший фильм выходит завтра в кинотеатрах напомнить"                       }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-446" : {
			"origin" : "Альберт готовит бобы в 14 часов напомнить убежать оттуда за 5 минут",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-13", "event_startTime" : "14:00", "event_duration" : "30", "event_result" : "Альберт готовит бобы убежать оттуда", "event_alarms" : "-5"},

				{ "event_type" : "N", "event_startTime" : "14:00", "event_duration" : "30", "event_result" : "Альберт готовит бобы напомнить убежать оттуда за 5 минут" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-447" : {
			"origin" : "Мультфильм 33 коровы будет завтра на 3 часа предупредить за 2",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_duration" : "180", "event_result" : "Мультфильм 33 коровы будет", "event_alarms" : "-2"},
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_duration" : "180", "event_result" : "Мультфильм 33 коровы будет", "event_alarms" : "-2"},

				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_duration" : "30",  "event_result" : "Мультфильм 33 коровы будет на 3 часа", "event_alarms" : "-120"},
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "09:00", "event_duration" : "30",  "event_result" : "Мультфильм 33 коровы будет на 3 часа предупредить за 2" } // ожидает рабочего времени пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-448" : {
			"origin" : "Послезавтра поменять бэкграунд сайта на CC6600 напомнить",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-15", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "поменять бэкграунд сайта на CC6600",  "event_alarms" : "0"  },

				{ "event_type" : "N", "event_startDate" : "2015-03-15", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "поменять бэкграунд сайта на CC6600 напомнить"               } // ожидает рабочего времени пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-449" : {
			"origin" : "Отреставрировать картину 16 мая в 9 вечера напомнить за 20 часов",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-05-16", "event_startTime" : "21:00", "event_duration" : "30", "event_result" : "Отреставрировать картину", "event_alarms" : "-1200"  },

				{ "event_type" : "N", "event_startDate" : "2015-05-16", "event_startTime" : "21:00", "event_duration" : "30", "event_result" : "Отреставрировать картину напомнить за 20"            },
				{ "event_type" : "N", "event_startDate" : "2015-05-16",                              "event_duration" : "30", "event_result" : "Отреставрировать картину в 9 вечера"                 },
				{ "event_type" : "N", "event_startDate" : "2015-05-16",                              "event_duration" : "30", "event_result" : "Отреставрировать картину в 9 вечера напомнить за 20" },
				{ "event_type" : "N",                                                   "event_startTime" : "21:00", "event_duration" : "30", "event_result" : "Отреставрировать картину 16 мая"                     },
				{ "event_type" : "N",                                                   "event_startTime" : "21:00", "event_duration" : "30", "event_result" : "Отреставрировать картину 16 мая напомнить за 20"     }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-450" : {
			"origin" : "Узнал интересный факт! 24 августа — 236-й день года. Напомнить мне об этом 22 августа!",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-08-24", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Узнал интересный факт! 236-й день года. мне об этом 22 августа!",           "event_alarms" : "0"  },
				{ "event_type" : "N", "event_startDate" : "2015-08-22", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Узнал интересный факт! 24 августа — 236-й день года. мне об этом!",           "event_alarms" : "0"  },

				{ "event_type" : "N", "event_startDate" : "2015-08-22", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Узнал интересный факт! 24 августа — 236-й день года. Напомнить мне об этом!"                        }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-451" : {
			"origin" : "Поздравления для Антона, завтра в 21.00 Напомнить! Сегодня ваш знакомый юбиляр празднует свой 30-й день рождения? Если вы хотите оригинально, а может быть, с юмором, поздравить с 30-летним юбилеем своих друзей и близких, причем, сделать это в стихах по смс, то данный раздел — для вас!\nЗдесь вы найдете универсальные, адресные, иногда шуточные и прикольные поздравления с юбилеем 30 лет, написанные в стихах для родных и близких.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "21:00", "event_duration" : "30", "event_result" : "Поздравления для Антона! Сегодня ваш знакомый юбиляр празднует свой 30-й день рождения? Если вы хотите оригинально, а может быть, с юмором, поздравить с 30-летним юбилеем своих друзей и близких, причем, сделать это в стихах по смс, то данный раздел — для вас!\nЗдесь вы найдете универсальные, адресные, иногда шуточные и прикольные поздравления с юбилеем 30 лет, написанные в стихах для родных и близких.",                    "event_alarms" : "0"  },

				{ "event_type" : "N", "event_startDate" : "2015-03-14", "event_startTime" : "21:00", "event_duration" : "30", "event_result" : "Поздравления для Антона, Напомнить! Сегодня ваш знакомый юбиляр празднует свой 30-й день рождения? Если вы хотите оригинально, а может быть, с юмором, поздравить с 30-летним юбилеем своих друзей и близких, причем, сделать это в стихах по смс, то данный раздел — для вас!"                              },
				{ "event_type" : "N", "event_startDate" : "2015-03-14",                              "event_duration" : "30", "event_result" : "Поздравления для Антона, в 21.00 Сегодня ваш знакомый юбиляр празднует свой 30-й день рождения? Если вы хотите оригинально, а может быть, с юмором, поздравить с 30-летним юбилеем своих друзей и близких, причем, сделать это в стихах по смс, то данный раздел — для вас!",            "event_alarms" : "0"  },
				{ "event_type" : "N", "event_startDate" : "2015-03-14",                              "event_duration" : "30", "event_result" : "Поздравления для Антона, в 21.00 Напомнить! Сегодня ваш знакомый юбиляр празднует свой 30-й день рождения? Если вы хотите оригинально, а может быть, с юмором, поздравить с 30-летним юбилеем своих друзей и близких, причем, сделать это в стихах по смс, то данный раздел — для вас!"                      }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-452" : {
			"origin" : "Салаты 22 декабря 2015, 19:53 напомнить",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-12-22", "event_startTime" : "19:53", "event_duration" : "30", "event_result" : "Салаты",                            "event_alarms" : "0"},

				{ "event_type" : "N", "event_startDate" : "2015-12-22", "event_startTime" : "19:53", "event_duration" : "30", "event_result" : "Салаты, напомнить"                                      },
				{ "event_type" : "N", "event_startDate" : "2015-12-22",                              "event_duration" : "30", "event_result" : "Салаты, 19:53 напомнить"                                },
				{ "event_type" : "N",                                   "event_startTime" : "19:53", "event_duration" : "30", "event_result" : "Салаты 22 декабря 2015",            "event_alarms" : "0"},
				{ "event_type" : "N",                                   "event_startTime" : "19:53", "event_duration" : "30", "event_result" : "Салаты 22 декабря 2015, напомнить"                      }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-453" : {
			"origin" : "2 января, суббота\nCasting/Кастинг Спектакль Casting/Кастинг Театр им. Моссовета, 19:00 Русская версия бродвейского мюзикла Фотографии 6 Напомнить за сутки!",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2016-01-02", "event_startTime" : "19:00", "event_duration" : "30", "event_result" : "\nCasting/Кастинг Спектакль Casting/Кастинг Театр им. Моссовета, Русская версия бродвейского мюзикла Фотографии 6!", "event_alarms" : "-1440"},

				{ "event_type" : "N", "event_startDate" : "2016-01-02", "event_startTime" : "19:00", "event_duration" : "30", "event_result" : "пятница\nCasting/Кастинг Спектакль Casting/Кастинг Театр им. Моссовета, Русская версия бродвейского мюзикла Фотографии 6 Напомнить за сутки!"           },
				{ "event_type" : "N", "event_startDate" : "2016-01-02",                              "event_duration" : "30", "event_result" : "пятница\nCasting/Кастинг Спектакль Casting/Кастинг Театр им. Моссовета, 19:00 Русская версия бродвейского мюзикла Фотографии 6!"                       },
				{ "event_type" : "N", "event_startDate" : "2016-01-02",                              "event_duration" : "30", "event_result" : "пятница\nCasting/Кастинг Спектакль Casting/Кастинг Театр им. Моссовета, 19:00 Русская версия бродвейского мюзикла Фотографии 6 Напомнить за сутки!"     },
				{ "event_type" : "N",                                                 "event_startTime" : "19:00", "event_duration" : "30", "event_result" : "2 января, пятница\nCasting/Кастинг Спектакль Casting/Кастинг Театр им. Моссовета, Русская версия бродвейского мюзикла Фотографии 6!"                   },
				{ "event_type" : "N",                                                 "event_startTime" : "19:00", "event_duration" : "30", "event_result" : "2 января, пятница\nCasting/Кастинг Спектакль Casting/Кастинг Театр им. Моссовета, Русская версия бродвейского мюзикла Фотографии 6 Напомнить за сутки!" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-454" : {
			"origin" : "23 февраля купить подарки напомнить за неделю",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2016-02-23", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "купить подарки", event_alarms: "-10080"},

				{ "event_type" : "N", "event_startDate" : "2016-02-23", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "купить подарки напомнить за неделю" } // ожидает рабочего времени пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-455" : {
			"origin" : "С понедельника бросить Курить",
			"expectations" : [
				{ "event_type": "N", "event_startDate" : "2015-03-16", "event_startTime": "09:00",  "event_duration": "30", "event_result": "бросить Курить" } // ожидает рабочего времени пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		//"TC-456" : {
		//	"origin" : "Построить модели стратегического планировани до завтра",
		//	"expectations" : [
		//	],
		//	"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		//},

		//"TC-457" : {
		//	"origin" : "завтра доделать чертежи до трех",
		//	"expectations" : [
		//		{ "event_type": "N", "event_startDate": "2015-03-14", "event_startTime": "9:00", "event_duration": "360", "event_result": "доделать чертежи" } // ожидает рабочего времени пользователя
		//	],
		//	"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		//},
		"TC-458" : {
			"origin" : "Встретить родителей в аэропорту через 2 дня напомнить за 5 мин и во время события",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-16", "event_startTime": "09:00", "event_duration": "30", "event_result": "Встретить родителей в аэропорту и во время события", "event_alarms": "-5" } // ожидает рабочего времени пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-459" : {
			"origin" : "В Мае узнать про ABC и JPV методы",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-05-01", "event_startTime": "09:00", "event_duration": "30", "event_result": "узнать про ABC и JPV методы" } // ожидает рабочего времени пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-460" : {
			"origin" : "через три дня сходить на почту и отдать все счета за свет, а так же не забыть отдать показания и за воду. Напомнить!",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-17", "event_startTime": "09:00", "event_duration": "30", "event_alarms": "0", "event_result": "сходить на почту и отдать все счета за свет, а так же не забыть отдать показания и за воду."} // ожидает рабочего времени пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-461" : {
			"origin" : "третьего августа начинать выполнять то что мы планировали. Напомнить за 2 минуты",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-08-03", "event_startTime": "09:00", "event_duration": "30", "event_result": "начинать выполнять то что мы планировали.", "event_alarms": "-2" } // ожидает рабочего времени пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		//"TC-462" : {
		//	"origin" : "12/05/15 Покормить орешками бурундуков в лесу до 12 дня",
		//	"expectations" : [
		//		{"event_type": "N", "event_startDate": "2015-05-12", "event_startTime": "09:00", "event_duration": "180", "event_result": "Покормить орешками бурундуков в лесу" } // ожидает рабочего времени пользователя
		//	],
		//	"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		//},
		//"TC-463" : {
		//	"origin" : "все переделать! Июнь",
		//	"expectations" : [
		//		{}
		//	],
		//	"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		//},
		"TC-464" : {
			"origin" : "30-04-15 премьера фильма напомнить за неделю",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-04-30", "event_startTime": "09:00", "event_duration": "30", "event_result": "премьера фильма", "event_alarms": "-10080"} // ожидает рабочего времени пользователя
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		//"TC-465" : {
		//	"origin" : "во вт сходить к врачу, сдать анализы до 3",
		//	"expectations" : [
		//		{ "event_type": "N", "event_startDate": "2015-03-17", "event_startTime": "09:00", "event_duration": "360", "event_result": "сходить к врачу, сдать анализы"} // ожидает рабочего времени пользователя
		//	],
		//	"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		//},
		//"TC-466" : {
		//	"origin" : "послезавтра сходить рег Не забыть взять: 1. паспорт 2. полис 3. билет  до 3",
		//	"expectations" : [
		//		{ "event_type": "N", "event_startTime": "09:00", "event_startDate": "2015-03-15", "event_duration": "360", "event_result": "сходить рег Не забыть взять: 1. паспорт 2. полис 3. билет"} // ожидает рабочего времени пользователя
		//	],
		//	"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		//},
		//"TC-467" : {
		//	"origin" : "через два дня перенести диван в другую комнату до 3 часов дня напомнить за 15 минут",
		//	"expectations" : [
		//		{ "event_type": "N", "event_startDate": "2015-03-16", "event_startTime": "09:00", "event_duration": "360", "event_result": "перенести диван в другую комнату", "event_alarms": "-15"} // ожидает рабочего времени пользователя
		//	],
		//	"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		//},
		"TC-468" : {
			"origin" : "с двух до трех сходить домой, навестить родителей Напомнить за 2 часа.",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-13", "event_startTime": "14:00", "event_duration": "60", "event_result": "сходить домой, навестить родителей.", "event_alarms": "-120"},
				{ "event_type": "N", "event_startDate": "2015-03-14", "event_startTime": "14:00","event_duration": "60",  "event_result": "сходить домой, навестить родителей.", "event_alarms": "-120"},
				{ "event_type": "N", "event_startDate": "2015-03-13", "event_startTime": "02:00", "event_duration": "60", "event_result": "сходить домой, навестить родителей.", "event_alarms": "-120"},
				{ "event_type": "N", "event_startDate": "2015-03-14", "event_startTime": "02:00","event_duration": "60",  "event_result": "сходить домой, навестить родителей.", "event_alarms": "-120"}
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-469" : {
			"origin" : "в 11:00 ничего не забыть до 3:00 часов.",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-13", "event_startTime": "11:00", "event_duration": "240", "event_result": "ничего не забыть." },
				{ "event_type": "N", "event_startDate": "2015-03-13", "event_startTime": "11:00", "event_duration": "960", "event_result": "ничего не забыть" },
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-470" : {
			"origin" : "С пяти в течение 2 часов заполнить все формы по отправке.",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-13", "event_startTime": "17:00", "event_duration": "120", "event_result": "заполнить все формы по отправке." },
				{ "event_type": "N", "event_startDate": "2015-03-14", "event_startTime": "05:00", "event_duration": "120", "event_result": "заполнить все формы по отправке." },
				{ "event_type": "N", "event_startDate": "2015-03-13", "event_startTime": "05:00", "event_duration": "120", "event_result": "заполнить все формы по отправке." },
				{ "event_type": "N", "event_startDate": "2015-03-14", "event_startTime": "17:00", "event_duration": "120", "event_result": "заполнить все формы по отправке." }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-471" : {
			"origin" : "первого января отмечать новый год с 23:59 до 6 утра",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2016-01-01", "event_startTime": "23:59", "event_duration": "361", "event_result": "отмечать новый год" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-472" : {
			"origin" : "Напомнить за 2 часа о работе завтра в 9 вечера.",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-14", "event_startTime": "21:00", "event_duration": "30", "event_alarms": "-120", "event_result": "о работе." }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-473" : {
			"origin" : "12 янв 2016 начало рабочего дня на следующий год в 9 утра до 7 вечера",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2016-01-12", "event_startTime": "09:00", "event_duration": "600", "event_result": "начало рабочего дня на следующий год" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-474" : {
			"origin" : "через неделю до 15:00 успеть выслать файлы",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-20", "event_startTime": "09:00", "event_duration": "360", "event_result": "успеть выслать файлы"}
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-475" : {
			"origin" : "через 2 дня в 12 ночи наступит новый день напомнить за день",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-16", "event_startTime": "00:00", "event_alarms": "-1440", "event_duration": "30", "event_result": "наступит новый день" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-476" : {
			"origin" : "первого мая в три часа сорок минут будет парад",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-05-01", "event_startTime": "15:40", "event_duration": "30", "event_result": "будет парад" },
				{ "event_type": "N", "event_startDate": "2015-05-02", "event_startTime": "03:40", "event_duration": "30", "event_result": "будет парад" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-477" : {
			"origin" : "31.08.16 солнечное затмение с 12.55 до 13.00",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2016-08-31",  "event_startTime": "12:55", "event_duration": "5", "event_result": "солнечное затмение"}
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-478" : {
			"origin" : "Доделать все свои планы к 15.00",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-13", "event_startTime": "15:00",   "event_duration": "30", "event_result": "Доделать все свои планы" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-479" : {
			"origin" : "В полчетвертого перевести часы",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-13",   "event_startTime": "15:30", "event_duration": "30", "event_result": "перевести часы"   },
				{ "event_type": "N", "event_startDate": "2015-03-13",   "event_startTime": "03:30", "event_duration": "30", "event_result": "перевести часы"   },
				{ "event_type": "N", "event_startDate": "2015-03-14", "event_startTime": "03:30", "event_duration": "30", "event_result": "перевести часы"   },
				{ "event_type": "N", "event_startDate": "2015-03-14", "event_startTime": "15:30", "event_duration": "30", "event_result": "перевести часы"   }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-480" : {
			"origin" : "вчера купил игрушку для кошки",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-12", "event_startTime" : "09:00" , "event_duration": "30", "event_result": "купил игрушку для кошки" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-481" : {
			"origin" : "отдал показания счетчика позавчера",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-11", "event_duration": "30", "event_startTime" : "09:00", "event_result": "отдал показания счетчика" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		//"TC-482" : {
		//	"origin" : "на прошлой неделе справляли новый год, всей  группой",
		//	"expectations" : [
		//		{ "event_type": "N", "event_startDate": beginOfNextWeek( -7 ), "event_startTime" : "09:00",  "event_duration": "30", "event_result": "справляли новый год, всей  группой" }
		//	],
		//	"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		//},
		//"TC-483P" : {
		//	"origin" : "в прошлом месяце родился племянник",
		//	"expectations" : [
		//		{ "event_type": "N", "event_startDate": currentMonth(  -1  ), "event_startTime" : "09:00", "event_duration": "30", "event_result": "родился племянник"}
		//	],
		//	"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		//},
		"TC-484" : {
			"origin" : "Завтра совещание в 10, напомнить про события 15.01.2009",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-14", "event_startTime": "10:00", "event_duration": "30",  "event_result": "совещание, про события 15.01.2009", "event_alarms" : "0"  },
				{ "event_type": "N", "event_startDate": "2015-03-14", "event_startTime": "21:00", "event_duration": "30",  "event_result": "совещание, про события 15.01.2009", "event_alarms" : "0"  }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-485P" : {
			"origin" : "День рождения жены 12 августа 1980",
			"expectations" : [
				{"event_type": "N", "event_startDate": "1980-08-12", "event_startTime" : "09:00", "event_duration": "30",  "event_result":"День рождения жены"}
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-486" : {
			"origin" : "в следующем июне мне уже не надо будет защищать свой диплом, так как я уже получу его.",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-06-01", "event_startTime" : "09:00", "event_duration": "30" , "event_result": "мне уже не надо будет защищать свой диплом, так как я уже получу его." }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-487" : {
			"origin" : "5 ноя будет последний месяц осени",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-11-05", "event_startTime" : "09:00" ,"event_duration": "30",  "event_result": "будет последний месяц осени"  }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-488" : {
			"origin" : "в дек напомнить о собрании",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-12-01", "event_startTime" : "09:00", "event_duration": "30", "event_result": "о собрании", "event_alarms": "0"   }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		//"TC-489" : {
		//	"origin" : "На следующий год начать бегать по утрам, бросить курить, перестать жрать фастуд",
		//	"expectations" : [
		//		{ "event_type": "N", "event_startDate": currentYear(  +1  ), "event_startTime" : "09:00", "event_duration": "30", "event_result": "начать бегать по утрам, бросить курить, перестать жрать фастуд " }
		//	],
		//	"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		//},
		"TC-490" : {
			"origin" : "7 вечера Надо приготовить печеньки и взять с собой на работу",
			"expectations" : [
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-491" : {
			"origin" : "9 утра начало работы",
			"expectations" : [
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-492" : {
			"origin" : "с 4 уборка на весь день",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-13",  "event_startTime": "16:00", "event_duration": "180",  "event_result": "уборка" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-493" : {
			"origin" : "забрать котят из приюта к 12 ч",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-13",  "event_startTime": "12:00", "event_duration": "30", "event_result": "забрать котят из приюта" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-494" : {
			"origin" : "к 15ч нужно погулять со стариками из дома престарелых",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-13",  "event_startTime": "15:00", "event_duration": "30",  "event_result": "нужно погулять со стариками из дома престарелых" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-495" : {
			"origin" : "в 6 позвонить маме",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-13",   "event_startTime": "18:00", "event_duration": "30", "event_result": "позвонить маме" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-496" : {
			"origin" : "через полчаса накупить цветов и раздавать прохожим",
			"expectations" : [
				{ "event_type": "N",  "event_startDate": "2015-03-13", "event_startTime": "09:30", "event_duration": "30",  "event_result": "накупить цветов и раздавать прохожим" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-497" : {
			"origin" : "attila выступает через час ",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-13", "event_startTime": "10:00", "event_duration": "30", "event_result": "attila выступает "  }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-498" : {
			"origin" : "через 3 часа купить пироженки",
			"expectations" : [
				{ "event_type": "N",  "event_startDate": "2015-03-13", "event_startTime": "12:00", "event_duration": "30", "event_result": "купить пироженки"  }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-499" : {
			"origin" : "с семи доделать все задуманное",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-13",   "event_startTime": "19:00",  "event_duration": "30", "event_result": "доделать все задуманное" },
				{ "event_type": "N", "event_startDate": "2015-03-13",   "event_startTime": "07:00",  "event_duration": "30", "event_result": "доделать все задуманное" },
				{ "event_type": "N", "event_startDate": "2015-03-14", "event_startTime": "07:00",  "event_duration": "30", "event_result": "доделать все задуманное" },
				{ "event_type": "N", "event_startDate": "2015-03-14", "event_startTime": "19:00",  "event_duration": "30", "event_result": "доделать все задуманное" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-500" : {
			"origin" : "Сегодня проставить зачет",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-13", "event_startTime" : "09:00",  "event_duration": "30", "event_result": "проставить зачет" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-501" : {
			"origin" : "07.09.2014 мой день рождение !!!!",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2014-09-07" , "event_startTime" : "09:00", "event_duration": "30", "event_result": "мой день рождение !!!!" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-502" : {
			"origin" : "пятого марта чемпионат мира по самбо напомнить за неделю",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2016-03-05" , "event_startTime" : "09:00", "event_duration": "30", "event_alarms" : "-10080", "event_result": "чемпионат мира по самбо" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-503" : {
			"origin" : "послезавтра переписать данные пользователей",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-15" , "event_startTime" : "09:00", "event_duration": "30", "event_result": "переписать данные пользователей" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-504" : {
			"origin" : "Подготовить через день презентацию по методам и моделям напомнить",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-15" , "event_startTime" : "09:00", "event_duration": "30", "event_alarms" : "0", "event_result": "Подготовить презентацию по методам и моделям" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-505" : {
			"origin" : "счет матча Ajax - PSV 5:0",
			"expectations" : [
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-506" : {
			"origin" : "26 марта начать писать диплом как только проснусь, в 9 утра.",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-26", "event_startTime": "09:00", "event_duration": "30", "event_result": "начать писать диплом как только проснусь." }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-507" : {
			"origin" : "12 мая 2015 отмечать с 6 вечера до 2 утра свое 23 день рождение!!",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-05-12", "event_startTime": "18:00", "event_duration": "480", "event_result": "отмечать свое 23 день рождение!!" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-508" : {
			"origin" : "Завтра на весь день съездить и поменять полис",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-14", "event_startTime" : "09:00", "event_duration": "240", "event_result": "съездить и поменять полис" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-509" : {
			"origin" : "Сегодня  сделать работу с двух до пяти",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-13", "event_startTime": "14:00", "event_duration": "180", "event_result": " сделать работу" },
				{ "event_type": "N", "event_startDate": "2015-03-13", "event_startTime": "02:00", "event_duration": "180", "event_result": " сделать работу" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-510" : {
			"origin" : "Сегодня в 8 вечера получить смету по проектно - изыскательным работам.",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-13", "event_startTime": "20:00", "event_duration": "30", "event_result": "получить смету по проектно - изыскательным работам." }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-511" : {
			"origin" : "Пятого августа в 12.00 вылет в лос анджелес.",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-08-05", "event_startTime": "12:00", "event_duration": "30", "event_result": "вылет в лос анджелес." }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-512" : {
			"origin" : "в 12:07 сдать все бумаги напомнить за час",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-13" ,   "event_startTime": "12:07", "event_duration": "30", "event_result": "сдать все бумаги", "event_alarms" : "-60" },
				{ "event_type": "N", "event_startDate": "2015-03-14" , "event_startTime": "12:07", "event_duration": "30", "event_result": "сдать все бумаги", "event_alarms" : "-60" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-513" : {
			"origin" : "В 5 вечера сходить покататься на санках",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-13" ,   "event_startTime": "17:00", "event_duration": "30", "event_result": "сходить покататься на санках" },
				{ "event_type": "N", "event_startDate": "2015-03-14" , "event_startTime": "17:00", "event_duration": "30", "event_result": "сходить покататься на санках" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-514" : {
			"origin" : "Через час пойти и пообедать",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-13" ,   "event_startTime": "10:00",   "event_duration": "30", "event_result": "пойти и пообедать" },
				{ "event_type": "N", "event_startDate": "2015-03-14" , "event_startTime": "10:00",   "event_duration": "30", "event_result": "пойти и пообедать" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-515" : {
			"origin" : "в следующий Пн Подумать над темой моего диплома",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-16" , "event_startTime" : "09:00",   "event_duration": "30", "event_result": "Подумать над темой моего диплома" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-516" : {
			"origin" : "забрать хомяка из зоомагазина.12 фев в 8 вечера",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2016-02-12", "event_startTime": "20:00",   "event_duration": "30", "event_result": "забрать хомяка из зоомагазина." }

			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-517" : {
			"origin" : "12 Октябрь 2015 то самое время, наступит осень",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-10-12", "event_startTime" : "09:00",   "event_duration": "30", "event_result": "то самое время, наступит осень" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-518" : {
			"origin" : "первого апреля весь день не выходить на улицу напомнить",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-04-01", "event_startTime" : "09:00",   "event_duration": "600", "event_alarms" : "0", "event_result": "не выходить на улицу" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-519" : {
			"origin" : "в 11 утра сходить в магазин купить хлеб молоко и т.п.",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-13",   "event_startTime": "11:00",   "event_duration": "30", "event_result": "сходить в магазин купить хлеб молоко и т.п." },
				{ "event_type": "N", "event_startDate": "2015-03-14", "event_startTime": "11:00",   "event_duration": "30", "event_result": "сходить в магазин купить хлеб молоко и т.п." }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-520" : {
			"origin" : "29 февраля не будет",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2016-02-29",   "event_startTime": "09:00",   "event_duration": "30", "event_result": "не будет" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-521" : {
			"origin" : "32 марта будет еще один лишний день в марте",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2016-03-01",   "event_startTime": "09:00",   "event_duration": "30", "event_result": "32 будет еще один лишний день в марте" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-522" : {
			"origin" : "0 сентября это промежуток между летом и осенью.",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-09-01",   "event_startTime": "09:00",   "event_duration": "30", "event_result": "0 это промежуток между летом и осенью." }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-523" : {
			"origin" : "С 12 - 13 часов это моё обеденное время",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-13",   "event_startTime": "12:00",   "event_duration": "60", "event_result": "это моё обеденное время" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-524" : {
			"origin" : "купить печенье в десять",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-13",   "event_startTime": "10:00",   "event_duration": "30", "event_result": "купить печенье" },
				{ "event_type": "N", "event_startDate": "2015-03-13",   "event_startTime": "22:00",   "event_duration": "30", "event_result": "купить печенье" },
				{ "event_type": "N", "event_startDate": "2015-03-14", "event_startTime": "10:00",   "event_duration": "30", "event_result": "купить печенье" },
				{ "event_type": "N", "event_startDate": "2015-03-14", "event_startTime": "22:00",   "event_duration": "30", "event_result": "купить печенье" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-525" : {
			"origin" : "в 10:30 вечера взять на прокат гамак для пальмы",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-13",   "event_startTime": "22:30",   "event_duration": "30", "event_result": "взять на прокат гамак для пальмы" },
				{ "event_type": "N", "event_startDate": "2015-03-14", "event_startTime": "22:30",   "event_duration": "30", "event_result": "взять на прокат гамак для пальмы" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-526" : {
			"origin" : "в 21.00 Турурум-текст напомнить за три минуты",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-13",   "event_startTime": "21:00",   "event_duration": "30", "event_result": "Турурум-текст", "event_alarms" : "-3" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-527" : {
			"origin" : "Мартин Лютер Кинг был рожден в Январе.",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2016-01-01",   "event_startTime": "09:00",   "event_duration": "30", "event_result": "Мартин Лютер Кинг был рожден."}
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-528" : {
			"origin" : "Напомнить! забрать котенка.",
			"expectations" : [
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-529" : {
			"origin" : "в три часа десять минут купить степлер",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-13",   "event_startTime": "15:10",   "event_duration": "30", "event_result": "купить степлер" },
				{ "event_type": "N", "event_startDate": "2015-03-13",   "event_startTime": "03:10",   "event_duration": "30", "event_result": "купить степлер" },
				{ "event_type": "N", "event_startDate": "2015-03-14", "event_startTime": "03:10",   "event_duration": "30", "event_result": "купить степлер"  },
				{ "event_type": "N", "event_startDate": "2015-03-14", "event_startTime": "15:10",   "event_duration": "30", "event_result": "купить степлер"  }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-530" : {
			"origin" : "в 7 вечера до 7:02 сделать задание",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-13",   "event_startTime": "19:00",   "event_duration": "2",	"event_result": "сделать задание" },
				{ "event_type": "N", "event_startDate": "2015-03-13",   "event_startTime": "19:00",   "event_duration": "722",	"event_result": "сделать задание" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-531" : {
			"origin" : "20:00 купить билеты",
			"expectations" : [
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-532" : {
			"origin" : "20:00 купить билеты",
			"expectations" : [
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-533" : {
			"origin" : "12 34 56 - это просто цифры.",
			"expectations" : [
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-534" : {
			"origin" : "12 03 45 05 12 05 92 - номер моей кредитной карты",
			"expectations" : [
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-535" : {
			"origin" : "12 07 пин код от моей кредитки",
			"expectations" : [
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-536" : {
			"origin" : "Мое поколение выросло в 90",
			"expectations" : [
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-537" : {
			"origin" : "in 1980s was born Boston hardcore",
			"expectations" : [
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-538" : {
			"origin" : "12 ноя 2015 в 10 утра до 12 напомнить о выдаче макетов",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-11-12",   "event_startTime": "10:00",   "event_duration": "120", "event_result": "о выдаче макетов", "event_alarms" : "0"  }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-539" : {
			"origin" : "Завтра нужно обсудить важные события , напомнить про событие 15.01.2009",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-14", "event_duration": "30", "event_startTime": "09:00", "event_result": "нужно обсудить важные события , про событие 15.01.2009", "event_alarms" : "0"  },
				{ "event_type": "N", "event_startDate": "2009-01-15", "event_duration": "30", "event_startTime": "09:00", "event_result": "Завтра нужно обсудить важные события ", "event_alarms" : "0"  }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-540" : {
			"origin" : "совещание в 7 утра через 3 дня предупредить за 2 часа",
			"expectations" : [
				{ "event_type": "N", "event_startDate":  "2015-03-17", "event_startTime": "07:00", "event_duration": "30", "event_alarms": "-120", "event_result": "совещание" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-541P" : {
			"origin" : "Вчера в 7 вечера была презентация",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-12", "event_startTime": "19:00",  "event_duration": "30", "event_result": "была презентация" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-542P" : {
			"origin" : "позавчера был на парах с 4 до 5",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-11", "event_startTime": "16:00", "event_duration": "60", "event_result": "был на парах"    },
				{ "event_type": "N", "event_startDate": "2015-03-11", "event_startTime": "04:00", "event_duration": "60", "event_result": "был на парах"    }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-543" : {
			"origin" : "сдать отчет в течение часа.",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-13", "event_startTime": "09:00", "event_duration": "60", "event_result": "сдать отчет."    }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-544" : {
			"origin" : "в течение дня убрать комнату.",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-13", "event_startTime": "09:00", "event_duration": "600", "event_result": "убрать комнату."    }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		//"TC-545" : {
		//	"origin" : "До 3 напомнить себе все сделать",
		//	"expectations" : [
		//		{ "event_type": "N", "event_startDate": "2015-03-13", "event_startTime": "09:00", "event_duration": "360",  "event_alarms": "0", "event_result": "себе все сделать"    },
		//		{ "event_type": "N", "event_startDate": "2015-03-14", "event_startTime": "09:00", "event_duration": "960",  "event_alarms": "0", "event_result": "себе все сделать"    }
		//	],
		//	"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		//},
		"TC-546" : {
			"origin" : "в 2050 будет конец света",
			"expectations" : [
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-547" : {
			"origin" : "моя дата рождения 12 августа 1980, а время рождения 12:30 ",
			"expectations" : [
				{ "event_type": "N", "event_duration": "30", "event_startDate": "1980-08-12",    "event_startTime": "12:30", "event_result": "моя дата рождения, а время рождения "   },
				{ "event_type": "N", "event_duration": "30", "event_startDate": "2015-03-14", "event_startTime": "12:30", "event_result": "моя дата рождения 12 августа 1980, а время рождения "   }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-548" : {
			"origin" : "в июне в 12 дня заменить лампочку на кухне.",
			"expectations" : [
				{ "event_type": "N",  "event_startDate": "2015-06-01", "event_startTime": "12:00", "event_duration": "30", "event_result": "заменить лампочку на кухне." }//спорный, нет конкретной даты
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-549" : {
			"origin" : "день рождение моей собаки 12 августа 1980, а время рождения 12:30 утра",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "1980-08-12",    event_startTime: "12:30", "event_duration": "30",  "event_result": "день рождение моей собаки, а время рождения"  },
				{ "event_type": "N", "event_startDate": "2015-03-14", event_startTime: "12:30", "event_duration": "30",  "event_result": "день рождение моей собаки 12 августа 1980, а время рождения"  }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-550" : {
			"origin" : "22 май 2016 будет обычным днем",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2016-05-22", "event_startTime": "09:00", "event_duration": "30", "event_result": "будет обычным днем" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-551" : {
			"origin" : "17 ноября  12:30-14:40 qwerty",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-11-17", "event_startTime": "12:30", "event_duration": "130", "event_result": "qwerty" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-552" : {
			"origin" : "Франклин Делано Рузвельт[2] (англ. Franklin Delano Roosevelt, МФА [?fr??kl?n ?d?l?no? ?ro?z??v?lt]; 30 января 1882, Хайд-Парк, штат Нью-Йорк — 12 апреля1945, Уорм-Спрингс, Джорджия) — 32-й президент США, одна из центральных фигур мировых событий первой половины XX века, возглавлял США во время мирового экономического кризиса и Второй мировой войны. Единственный американский президент, избиравшийся более чем на два срока.",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "1882-01-30", "event_startTime": "09:00", "event_duration": "30", "event_result": "Франклин Делано Рузвельт[2] (англ. Franklin Delano Roosevelt, МФА [?fr??kl?n ?d?l?no? ?ro?z??v?lt];, Хайд-Парк, штат Нью-Йорк — 12 апреля1945, Уорм-Спрингс, Джорджия) — 32-й президент США, одна из центральных фигур мировых событий первой половины XX века, возглавлял США во время мирового экономического кризиса и Второй мировой войны. Единственный американский президент, избиравшийся более чем на два срока." }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-553" : {
			"origin" : "завтра в 4 ночи вызвать такси по тел 21-12-12",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-14", "event_startTime": "04:00", "event_duration": "30", "event_result": "вызвать такси по тел 21-12-12" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-554" : {
			"origin" : "через неделю в 10 на прием к стоматологу",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-20", "event_startTime": "10:00", "event_duration": "30", "event_result": "на прием к стоматологу" },
				{ "event_type": "N", "event_startDate": "2015-03-20", "event_startTime": "22:00", "event_duration": "30", "event_result": "на прием к стоматологу" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-555" : {
			"origin" : "через 3 дня в 10 утра к стоматологу",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-17", "event_startTime": "10:00", "event_duration": "30", "event_result": "к стоматологу" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-556" : {
			"origin" : "через 2 недели в 4 дня на повторный прием к стоматологу",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-27", "event_startTime": "16:00", "event_duration": "30", "event_result": "на повторный прием к стоматологу" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},
		"TC-557" : {
			"origin" : "завтра в 4 дня на повторный прием к стоматологу",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-14", "event_startTime": "16:00", "event_duration": "30", "event_result": "на повторный прием к стоматологу" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		// недостающие по формату ТК

		"TC-558" : {
			"origin" : "Альберт бежит вприпрыжку, перепрыгивая через 6 ступенек разом!",
			"expectations" : [
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-559" : {
			"origin" : "чек на 6 млн Альберт выпишет Ренате",
			"expectations" : [
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-560" : {
			"origin" : "завтра в 35 попугаев Альберт собирается измерить свой рост",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-14", "event_startTime": "09:00", "event_duration": "30", "event_result": "в 35 попугаев Альберт собирается измерить свой рост" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-561" : {
			"origin" : "Альберт легко может прыгнуть через 7 метров",
			"expectations" : [
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-562" : {
			"origin" : "завтра в 9 утра выбросить мусор, в 11 вечера сходить в кино",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-14", "event_startTime": "09:00", "event_duration": "30", "event_result": "выбросить мусор, в 11 вечера сходить в кино" },
				{ "event_type": "N", "event_startDate": "2015-03-14", "event_startTime": "23:00", "event_duration": "30", "event_result": "в 9 утра выбросить мусор, сходить в кино" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-563" : {
			"origin" : "у Альберта в 7 утра самолет, летит в тундру",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-14", "event_startTime": "07:00", "event_duration": "30", "event_result": "у Альберта самолет, летит в тундру" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-564" : {
			"origin" : "в 1378−1380 годах Мамай и Альберт, наконец, пошли завоевывать мир",
			"expectations" : [
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-565" : {
			"origin" : "ПСРЛ, т. 25, М. -Л, 1949, с. 201",
			"expectations" : [
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-566" : {
			"origin" : "у Альберта 30 февраля День Рождения",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2016-02-01", "event_startTime": "09:00", "event_duration": "30", "event_result": "у Альберта 30 День Рождения" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-01" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-567" : {
			"origin" : "у Альберта 29 февраля 2017 День Рождения",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2017-02-01", "event_startTime": "09:00", "event_duration": "30", "event_result": "у Альберта 29 День Рождения" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-02-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-568" : {
			"origin" : "у Альберта обед через 1.5 часа",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-13", "event_startTime": "10:30", "event_duration": "30", "event_result": "у Альберта обед" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-569" : {
			"origin" : "у Альберта гулянка через полтора часа",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-13", "event_startTime": "10:30", "event_duration": "30", "event_result": "у Альберта гулянка" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-570" : {
			"origin" : "у Альберта пикник через два с половиной часа",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-13", "event_startTime": "11:30", "event_duration": "30", "event_result": "у Альберта пикник" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-571" : {
			"origin" : "у Альберта в апреле будет вечеринка",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-04-01", "event_startTime": "09:00", "event_duration": "30", "event_result": "у Альберта будет вечеринка" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-572" : {
			"origin" : "у Альберта грандиозное событие через сутки",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-14", "event_startTime": "09:00", "event_duration": "30", "event_result": "у Альберта грандиозное событие" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-573" : {
			"origin" : "у Альберта событие вечером в 5",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-13", "event_startTime": "17:00", "event_duration": "30", "event_result": "у Альберта событие" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		//"TC-574" : {
		//	"origin" : "у Альберта событие завтра в 21, напомнить в 19 часов",
		//	"expectations" : [
		//		{ "event_type": "N", "event_startDate": "2015-03-14", "event_startTime": "21:00", "event_duration": "30", "event_alarms" : "-120", "event_result": "у Альберта событие" }
		//	],
		//	"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		//},

		"TC-575" : {
			"origin" : "у Альберта событие с 14 до 14:30",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-13", "event_startTime": "14:00", "event_duration": "30", "event_result": "у Альберта событие" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-576" : {
			"origin" : "у Альберта событие в 21, напомнить за 30мин",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-13", "event_startTime": "21:00", "event_duration": "30", "event_alarms" : "-30", "event_result": "у Альберта событие" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-577" : {
			"origin" : "у Альберта событие напомнить в 15ч",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-13", "event_startTime": "15:00", "event_duration": "30", "event_alarms" : "0", "event_result": "у Альберта событие" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-578" : {
			"origin" : "у Альберта событие в 15 ч напомнить вовремя",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-13", "event_startTime": "15:00", "event_duration": "30", "event_alarms" : "0", "event_result": "у Альберта событие" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-579" : {
			"origin" : "у Альберта событие (12.03.15)",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-12", "event_startTime": "09:00", "event_duration": "30", "event_result": "у Альберта событие" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-10" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-580" : {
			"origin" : "у Альберта 15-ого мая 2015 событие",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-05-15", "event_startTime": "09:00", "event_duration": "30", "event_result": "у Альберта событие" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-10" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-581" : {
			"origin" : "у Альберта на десятое мая событие",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-05-10", "event_startTime": "09:00", "event_duration": "30", "event_result": "у Альберта событие" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-10" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-582" : {
			"origin" : "у Альберта событие, напомнить мне через час",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-10", "event_startTime": "10:00", "event_duration": "30", "event_alarms" : "0", "event_result": "у Альберта событие, мне" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-10" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-583" : {
			"origin" : "у Альберта событие 23 сен. с 6ч до 8ч",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-09-23", "event_startTime": "18:00", "event_duration": "120", "event_result": "у Альберта событие" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-10" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-584" : {
			"origin" : "23 дек. событие в 20 ч, на следующий день событие в 15 ч",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-12-23", "event_startTime": "20:00", "event_duration": "30", "event_result": "событие, на следующий день событие в 15 ч" },
				{ "event_type": "N", "event_startDate": "2015-03-11", "event_startTime": "15:00", "event_duration": "30", "event_result": "23 дек. событие в 20 ч, событие" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-10" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-585" : {
			"origin" : "У Альберта событие завтра с 9 до обеда",
			"expectations" : [
				{ "event_type": "N", "event_startDate": "2015-03-11", "event_startTime": "09:00", "event_duration": "180", "event_result": "У Альберта событие" },
				{ "event_type": "N", "event_startDate": "2015-03-11", "event_startTime": "21:00", "event_duration": "900", "event_result": "У Альберта событие" }
			],
			"environment" : { "time" : "09:00", "date" : "2015-03-10" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		//"TC-586" : {
		//	"origin" : "У Альберта событие завтра в 24 часа",
		//	"expectations" : [
		//		{ "event_type": "N", "event_startDate": "2015-03-11", "event_startTime": "00:00", "event_duration": "30", "event_result": "У Альберта событие" }
		//	],
		//	"environment" : { "time" : "09:00", "date" : "2015-03-10" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		//},

		//"TC-587" : {
		//	"origin" : "У Альберта событие завтра в 24ч",
		//	"expectations" : [
		//		{ "event_type": "N", "event_startDate": "2015-03-11", "event_startTime": "00:00", "event_duration": "30", "event_result": "У Альберта событие" }
		//	],
		//	"environment" : { "time" : "09:00", "date" : "2015-03-10" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		//},

		"TC-588" : {
			"origin" : "Завтра в 7 - совещание",
			"expectations" : [
				{ "event_type" : "N", "event_startDate": "2016-02-29",   "event_startTime" : "19:00", "event_duration" : "30", "event_result" : "совещание" }
			],
			"environment" : { "time" : "10:00", "date" : "2016-02-28" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-589" : {
			"origin" : "сегодня в 9 ознакомиться с событиями 01.10.12",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2016-02-28" ,   "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "ознакомиться с событиями 01.10.12"}
			],
			"environment" : { "time" : "08:00", "date" : "2016-02-28" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-590" : {
			"origin" : "через два ч выпить лекарство, напомнить за 10 минут",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-05-11" ,   "event_startTime" : "01:00", "event_duration" : "30", "event_result" : "выпить лекарство",  "event_alarms" : "-10"}
			],
			"environment" : { "time" : "23:00", "date" : "2015-05-10" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-591" : {
			"origin" : "в пятницу в 7 встреча с гопниками, там нам объяснят, как нужно вести себя с высокопочтенными на районе людьми, на повестке - результаты нашей мимолетной встречи на прошлой неделе",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-05-15" ,   "event_startTime" : "07:00", "event_duration" : "30", "event_result" : "встреча с гопниками, там нам объяснят, как нужно вести себя с высокопочтенными на районе людьми, на повестке - результаты нашей мимолетной встречи на прошлой неделе"},
				{ "event_type" : "N", "event_startDate" : "2015-05-15" ,   "event_startTime" : "19:00", "event_duration" : "30", "event_result" : "встреча с гопниками, там нам объяснят, как нужно вести себя с высокопочтенными на районе людьми, на повестке - результаты нашей мимолетной встречи на прошлой неделе"}
			],
			"environment" : { "time" : "06:00", "date" : "2015-05-10" , "workTime" : { "Mo" : "09:00-18:00", "Tu" : "09:00-18:00", "We" : "09:00-18:00", "Th" : "09:00-18:00", "Fr" : "09:00-18:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-592" : {
			"origin" : "собрание по поводу 8 марта проведем 5 марта в шесть",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-08" ,   "event_startTime" : "06:00", "event_duration" : "30", "event_result" : "собрание по поводу проведем 5 марта"},
				{ "event_type" : "N", "event_startDate" : "2015-03-08" ,   "event_startTime" : "18:00", "event_duration" : "30", "event_result" : "собрание по поводу проведем 5 марта"},
				{ "event_type" : "N", "event_startDate" : "2015-03-05" ,   "event_startTime" : "18:00", "event_duration" : "30", "event_result" : "собрание по поводу 8 марта проведем"}
			],
			"environment" : { "time" : "06:00", "date" : "2015-003-01" , "workTime" : { "Mo" : "09:00-18:00", "Tu" : "09:00-18:00", "We" : "09:00-18:00", "Th" : "09:00-18:00", "Fr" : "09:00-18:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-593" : {
			"origin" : "сегодня в 10 футбол, прошлая игра 23 апреля - счет 1:0",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-01" ,   "event_startTime" : "22:00", "event_duration" : "30", "event_result" : "футбол, прошлая игра 23 апреля - счет 1:0"},
				{ "event_type" : "N", "event_startDate" : "2015-03-01" ,   "event_startTime" : "10:00", "event_duration" : "30", "event_result" : "футбол, прошлая игра 23 апреля - счет 1:0"}
			],
			"environment" : { "time" : "12:00", "date" : "2015-03-01" , "workTime" : { "Mo" : "09:00-18:00", "Tu" : "09:00-18:00", "We" : "09:00-18:00", "Th" : "09:00-18:00", "Fr" : "09:00-18:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-594" : {
			"origin" : "15 марта др макисма, напомнить за день",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-15" ,   "event_startTime" : "10:00", "event_duration" : "30", "event_result" : "др макисма",  "event_alarms" : "-1440"}
			],
			"environment" : { "time" : "12:00", "date" : "2015-003-01" , "workTime" : { "Mo" : "09:00-18:00", "Tu" : "09:00-18:00", "We" : "09:00-18:00", "Th" : "09:00-18:00", "Fr" : "09:00-18:00", "Sa" : "10:00-13:00", "Su" : "10:00-13:00" } }
		},

		"TC-595" : {
			"origin" : "через неделю забрать документы, напомнить за день",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-08" ,   "event_startTime" : "09:00", "event_duration" : "30", "event_alarms" : "-1440", "event_result" : "забрать документы"}
			],
			"environment" : { "time" : "12:35", "date" : "2015-03-01" , "workTime" : { "Mo" : "09:00-18:00", "Tu" : "09:00-18:00", "We" : "09:00-18:00", "Th" : "09:00-18:00", "Fr" : "09:00-18:00", "Sa" : "-", "Su" : "-" } }
		},

		//"TC-596" : {
		//	"origin" : "перевести на счет клиента оплату 17 марта в 11, напомнить в 10",
		//	"expectations" : [
		//		{ "event_type" : "N", "event_startDate" : "2015-03-17" ,   "event_startTime" : "11:00", "event_duration" : "30", "event_result" : "перевести на счет клиента оплату", "event_alarms" : "-60"}
		//	],
		//	"environment" : { "time" : "12:35", "date" : "2015-03-01" , "workTime" : { "Mo" : "09:00-18:00", "Tu" : "09:00-18:00", "We" : "09:00-18:00", "Th" : "09:00-18:00", "Fr" : "09:00-18:00", "Sa" : "-", "Su" : "-" } }
		//},

		"TC-597" : {
			"origin" : "в субботу в 7:30 разбудить всех соседей",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-07" ,   "event_startTime" : "07:30", "event_duration" : "30", "event_result" : "разбудить всех соседей"}
			],
			"environment" : { "time" : "12:35", "date" : "2015-03-01" , "workTime" : { "Mo" : "09:00-18:00", "Tu" : "09:00-18:00", "We" : "09:00-18:00", "Th" : "09:00-18:00", "Fr" : "09:00-18:00", "Sa" : "-", "Su" : "-" } }
		},

		"TC-598" : {
			"origin" : "в 7 часов перевезти груз на склад",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-02" ,   "event_startTime" : "19:00", "event_duration" : "30", "event_result" : "перевезти груз на склад"}
			],
			"environment" : { "time" : "20:00", "date" : "2015-03-01" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "-", "Su" : "-" } }
		},

		"TC-599" : {
			"origin" : "в субботу в 7:30 вывезти весь мусор",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-07" ,   "event_startTime" : "07:30", "event_duration" : "30", "event_result" : "вывезти весь мусор"}
			],
			"environment" : { "time" : "12:35", "date" : "2015-03-01" , "workTime" : { "Mo" : "09:00-18:00", "Tu" : "09:00-18:00", "We" : "09:00-18:00", "Th" : "09:00-18:00", "Fr" : "09:00-18:00", "Sa" : "-", "Su" : "-" } }
		},

		"TC-600" : {
			"origin" : "в субботу вывезти весь мусор",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-07" ,   "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "вывезти весь мусор"}
			],
			"environment" : { "time" : "12:35", "date" : "2015-03-01" , "workTime" : { "Mo" : "09:00-18:00", "Tu" : "09:00-18:00", "We" : "09:00-18:00", "Th" : "09:00-18:00", "Fr" : "09:00-18:00", "Sa" : "-", "Su" : "-" } }
		},

		"TC-601" : {
			"origin" : "через 3 дня разворошить прошлое, напомнить за 13 часов",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-08" ,   "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "разворошить прошлое", "event_alarms" : "-780"}
			],
			"environment" : { "time" : "14:24", "date" : "2015-03-04" , "workTime" : { "Mo" : "09:00-18:00", "Tu" : "09:00-18:00", "We" : "09:00-18:00", "Th" : "09:00-18:00", "Fr" : "09:00-18:00", "Sa" : "-", "Su" : "-" } }
		},

		"TC-602" : {
			"origin" : "в 05:00 на два часа: совещание с инженером по ТБ",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-04" ,   "event_startTime" : "17:00", "event_duration" : "120", "event_result" : "совещание с инженером по ТБ"}
			],
			"environment" : { "time" : "14:24", "date" : "2015-03-04" , "workTime" : { "Mo" : "09:00-18:00", "Tu" : "09:00-18:00", "We" : "09:00-18:00", "Th" : "09:00-18:00", "Fr" : "09:00-18:00", "Sa" : "-", "Su" : "-" } }
		},

		"TC-603" : {
			"origin" : "через 24 часа напомнить поставщикам о договорах, напомнить",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-05" ,   "event_startTime" : "14:24", "event_duration" : "30", "event_result" : "напомнить поставщикам о договорах", "event_alarms" : "0"}
			],
			"environment" : { "time" : "14:24", "date" : "2015-03-04" , "workTime" : { "Mo" : "09:00-18:00", "Tu" : "09:00-18:00", "We" : "09:00-18:00", "Th" : "09:00-18:00", "Fr" : "09:00-18:00", "Sa" : "-", "Su" : "-" } }
		},

		"TC-604" : {
			"origin" : "19 апреля в 10 быть на лекции о военной службе, напомнить за 2 ч.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-04-19" ,   "event_startTime" : "10:00", "event_duration" : "30", "event_result" : "быть на лекции о военной службе", "event_alarms" : "-120"}
			],
			"environment" : { "time" : "14:05", "date" : "2015-03-01" , "workTime" : { "Mo" : "11:00-18:00", "Tu" : "11:00-18:00", "We" : "11:00-18:00", "Th" : "11:00-18:00", "Fr" : "11:00-18:00", "Sa" : "-", "Su" : "-" } }
		},

		"TC-605" : {
			"origin" : "19 апреля в 10.00 быть на лекции и военной службе, напомнить за 2 ч.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-04-19" ,   "event_startTime" : "10:00", "event_duration" : "30", "event_result" : "быть на лекции и военной службе", "event_alarms" : "-120"}
			],
			"environment" : { "time" : "14:05", "date" : "2015-03-01" , "workTime" : { "Mo" : "09:00-23:00", "Tu" : "09:00-23:00", "We" : "09:00-23:00", "Th" : "09:00-23:00", "Fr" : "09:00-23:00", "Sa" : "-", "Su" : "-" } }
		},

		"TC-606" : {
			"origin" : "19 апреля в десять быть на лекции и военной службе, напомнить за 2 ч.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-04-19" ,   "event_startTime" : "10:00", "event_duration" : "30", "event_result" : "быть на лекции и военной службе", "event_alarms" : "-120"}
			],
			"environment" : { "time" : "14:05", "date" : "2015-03-01" , "workTime" : { "Mo" : "11:00-23:00", "Tu" : "11:00-23:00", "We" : "11:00-23:00", "Th" : "11:00-23:00", "Fr" : "11:00-23:00", "Sa" : "-", "Su" : "-" } }
		},

		"TC-607" : {
			"origin" : "10.04.2015 Сдаем Автоспа",
			"expectations" : [
				{  "event_type" : "N", "event_startDate": "2015-04-10", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Сдаем Автоспа" }
			],
			"environment" : { "time" : "10:00", "date" : "2015-04-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-608" : {
			"origin" : "завтра увеличим продажи в 2 раза",
			"expectations" : [
				{ "event_type" : "N", "event_startDate": "2015-03-01",   "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "увеличим продажи в 2 раза"}
			],
			"environment" : { "time" : "10:00", "date" : "2015-02-28" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-609" : {
			"origin" : "завтра 12:00 до 00:30 - международная конференция по обсуждению дроби: 1/5",
			"expectations" : [
				{ "event_type" : "N", "event_startDate": "2015-03-01",   "event_startTime" : "12:00", "event_duration" : "750", "event_result" : "международная конференция по обсуждению дроби: 1/5"}
			],
			"environment" : { "time" : "10:00", "date" : "2015-02-28" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-610" : {
			"origin" : "послезавтра в шесть встретить гостей",
			"expectations" : [
				{ "event_type" : "N", "event_startDate": "2015-03-15",   "event_startTime" : "06:00", "event_duration" : "30", "event_result" : "встретить гостей"},
				{ "event_type" : "N", "event_startDate": "2015-03-15",   "event_startTime" : "18:00", "event_duration" : "30", "event_result" : "встретить гостей"}
			],
			"environment" : { "time" : "10:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-611" : {
			"origin" : "послезавтра в шесть утра встретить гостей",
			"expectations" : [
				{ "event_type" : "N", "event_startDate": "2015-03-15",   "event_startTime" : "06:00", "event_duration" : "30", "event_result" : "встретить гостей"}
			],
			"environment" : { "time" : "10:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-19:00", "Su" : "09:00-19:00" } }
		},

		"TC-612" : {
			"origin" : "послезавтра встретить гостей",
			"expectations" : [
				{ "event_type" : "N", "event_startDate": "2015-03-15",   "event_startTime" : "10:00", "event_duration" : "30", "event_result" : "встретить гостей"}
			],
			"environment" : { "time" : "10:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "10:00-19:00", "Tu" : "10:00-19:00", "We" : "10:00-19:00", "Th" : "10:00-19:00", "Fr" : "10:00-19:00", "Sa" : "10:00-13:00", "Su" : "10:00-13:00" } }
		},

		"TC-613" : {
			"origin" : "послезавтра встретить гостей в обед",
			"expectations" : [
				{ "event_type" : "N", "event_startDate": "2015-03-15",   "event_startTime" : "12:00", "event_duration" : "30", "event_result" : "встретить гостей"}
			],
			"environment" : { "time" : "15:34", "date" : "2015-03-13" , "workTime" : { "Mo" : "10:00-19:00", "Tu" : "10:00-19:00", "We" : "10:00-19:00", "Th" : "10:00-19:00", "Fr" : "10:00-19:00", "Sa" : "-", "Su" : "-" } }
		},

		"TC-614" : {
			"origin" : "с 5 до 7 ч. собрать документы",
			"expectations" : [
				{ "event_type" : "N", "event_startDate": "2015-03-13",   "event_startTime" : "05:00", "event_duration" : "120", "event_result" : "собрать документы"}
			],
			"environment" : { "time" : "04:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "06:00-16:00", "Tu" : "06:00-16:00", "We" : "06:00-16:00", "Th" : "06:00-16:00", "Fr" : "06:00-16:00", "Sa" : "06:00-16:00", "Su" : "06:00-16:00" } }
		},

		"TC-615" : {
			"origin" : "с 5 до 7 собрать документы",
			"expectations" : [
				{ "event_type" : "N", "event_startDate": "2015-03-13",   "event_startTime" : "17:00", "event_duration" : "120", "event_result" : "собрать документы"}
			],
			"environment" : { "time" : "04:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-20:00", "Tu" : "09:00-20:00", "We" : "09:00-20:00", "Th" : "09:00-20:00", "Fr" : "09:00-20:00", "Sa" : "09:00-20:00", "Su" : "09:00-20:00" } }
		},

		"TC-616" : {
			"origin" : "с 5 - 7ч собрать документы",
			"expectations" : [
				{ "event_type" : "N", "event_startDate": "2015-03-13",   "event_startTime" : "17:00", "event_duration" : "120", "event_result" : "собрать документы"}
			],
			"environment" : { "time" : "12:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-20:00", "Tu" : "09:00-20:00", "We" : "09:00-20:00", "Th" : "09:00-20:00", "Fr" : "09:00-20:00", "Sa" : "09:00-20:00", "Su" : "09:00-20:00" } }
		},

		"TC-617" : {
			"origin" : "с 17 - 19ч собрать документы",
			"expectations" : [
				{ "event_type" : "N", "event_startDate": "2015-03-13",   "event_startTime" : "17:00", "event_duration" : "120", "event_result" : "собрать документы"}
			],
			"environment" : { "time" : "12:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-16:00", "Tu" : "09:00-16:00", "We" : "09:00-16:00", "Th" : "09:00-16:00", "Fr" : "09:00-16:00", "Sa" : "09:00-16:00", "Su" : "09:00-16:00" } }
		},

		"TC-618" : {
			"origin" : "с 5 до 7 собрать документы",
			"expectations" : [
				{ "event_type" : "N", "event_startDate": "2015-03-14",   "event_startTime" : "05:00", "event_duration" : "120", "event_result" : "собрать документы"},
				{ "event_type" : "N", "event_startDate": "2015-03-14",   "event_startTime" : "17:00", "event_duration" : "120", "event_result" : "собрать документы"}
			],
			"environment" : { "time" : "18:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-16:00", "Tu" : "09:00-16:00", "We" : "09:00-16:00", "Th" : "09:00-16:00", "Fr" : "09:00-16:00", "Sa" : "09:00-16:00", "Su" : "09:00-16:00" } }
		},

		"TC-619" : {
			"origin" : "с 17:00 - 19:00 собрать документы",
			"expectations" : [
				{ "event_type" : "N", "event_startDate": "2015-03-14",   "event_startTime" : "17:00", "event_duration" : "120", "event_result" : "собрать документы"}
			],
			"environment" : { "time" : "18:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-17:00", "Tu" : "09:00-17:00", "We" : "09:00-17:00", "Th" : "09:00-17:00", "Fr" : "09:00-17:00", "Sa" : "09:00-17:00", "Su" : "09:00-17:00" } }
		},

		//"TC-620" : {
		//	"origin" : "в субботу в 7:30 вывезти весь мусор",
		//	"expectations" : [
		//		{ "event_type" : "N", "event_startDate" : "2015-03-14" ,   "event_startTime" : "07:30", "event_duration" : "30", "event_result" : "вывезти весь мусор"}
		//	],
		//	"environment" : { "time" : "12:35", "date" : "2015-03-11" , "workTime" : { "Mo" : "09:00-18:00", "Tu" : "09:00-18:00", "We" : "09:00-18:00", "Th" : "09:00-18:00", "Fr" : "09:00-18:00", "Sa" : "-", "Su" : "-" } }
		//},

		"TC-621" : {
			"origin" : "в субботу в 7:30 вывезти весь мусор",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-21" ,   "event_startTime" : "07:30", "event_duration" : "30", "event_result" : "вывезти весь мусор"}
			],
			"environment" : { "time" : "10:30", "date" : "2015-03-14" , "workTime" : { "Mo" : "09:00-18:00", "Tu" : "09:00-18:00", "We" : "09:00-18:00", "Th" : "09:00-18:00", "Fr" : "09:00-18:00", "Sa" : "-", "Su" : "-" } }
		},

		"TC-622" : {
			"origin" : "в субботу в 7:30 вывезти весь мусор",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-21" ,   "event_startTime" : "19:30", "event_duration" : "30", "event_result" : "вывезти весь мусор"}
			],
			"environment" : { "time" : "06:30", "date" : "2015-03-14" , "workTime" : { "Mo" : "09:00-18:00", "Tu" : "09:00-18:00", "We" : "09:00-18:00", "Th" : "09:00-18:00", "Fr" : "09:00-18:00", "Sa" : "12:00-20:00", "Su" : "12:00-20:00" } }
		},

		"TC-623" : {
			"origin" : "сегодня в 12 поесть вкусно-вкусно",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14" ,   "event_startTime" : "12:00", "event_duration" : "30", "event_result" : "поесть вкусно-вкусно"}
			],
			"environment" : { "time" : "06:30", "date" : "2015-03-14" , "workTime" : { "Mo" : "09:00-18:00", "Tu" : "09:00-18:00", "We" : "09:00-18:00", "Th" : "09:00-18:00", "Fr" : "09:00-18:00", "Sa" : "12:00-20:00", "Su" : "12:00-20:00" } }
		},

		"TC-624" : {
			"origin" : "сегодня в 12 поесть вкусно-вкусно",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14" ,   "event_startTime" : "12:00", "event_duration" : "30", "event_result" : "поесть вкусно-вкусно"},
				{ "event_type" : "N", "event_startDate" : "2015-03-14" ,   "event_startTime" : "00:00", "event_duration" : "30", "event_result" : "поесть вкусно-вкусно"}
			],
			"environment" : { "time" : "12:30", "date" : "2015-03-14" , "workTime" : { "Mo" : "09:00-18:00", "Tu" : "09:00-18:00", "We" : "09:00-18:00", "Th" : "09:00-18:00", "Fr" : "09:00-18:00", "Sa" : "12:00-20:00", "Su" : "12:00-20:00" } }
		},

		"TC-625" : {
			"origin" : "сегодня в 12 поесть вкусно-вкусно",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-14" ,   "event_startTime" : "12:00", "event_duration" : "30", "event_result" : "поесть вкусно-вкусно"}
			],
			"environment" : { "time" : "01:30", "date" : "2015-03-14" , "workTime" : { "Mo" : "09:00-18:00", "Tu" : "09:00-18:00", "We" : "09:00-18:00", "Th" : "09:00-18:00", "Fr" : "09:00-18:00", "Sa" : "12:00-20:00", "Su" : "12:00-20:00" } }
		},

		"TC-626" : {
			"origin" : "в субботу в 7:30 вывезти весь мусор",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-03-21" ,   "event_startTime" : "07:30", "event_duration" : "30", "event_result" : "вывезти весь мусор"}
			],
			"environment" : { "time" : "06:30", "date" : "2015-03-14" , "workTime" : { "Mo" : "07:00-20:00", "Tu" : "07:00-20:00", "We" : "07:00-20:00", "Th" : "07:00-20:00", "Fr" : "07:00-20:00", "Sa" : "07:00-20:00", "Su" : "07:00-20:00" } }
		},

		"TC-627" : {
			"origin" : "15 апр в 3-м цехе пройдет утренник",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-04-15" ,   "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "в 3-м цехе пройдет утренник"}
			],
			"environment" : { "time" : "12:38", "date" : "2015-03-14" , "workTime" : { "Mo" : "09:00-18:00", "Tu" : "09:00-18:00", "We" : "09:00-18:00", "Th" : "09:00-18:00", "Fr" : "09:00-18:00", "Sa" : "12:00-20:00", "Su" : "12:00-20:00" } }
		},

		"TC-628" : {
			"origin" : "15 апр в 3-м цехе пройдет утренник",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-04-15" ,   "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "в 3-м цехе пройдет утренник"}
			],
			"environment" : { "time" : "12:38", "date" : "2015-03-14" , "workTime" : { "Mo" : "09:00-18:00", "Tu" : "09:00-18:00", "We" : "09:00-18:00", "Th" : "09:00-18:00", "Fr" : "09:00-18:00", "Sa" : "-", "Su" : "-" } }
		},

		"TC-629" : {
			"origin" : "15 апр в 3-м цехе пройдет утренник",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-04-15" ,   "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "в 3-м цехе пройдет утренник"}
			],
			"environment" : { "time" : "12:38", "date" : "2015-03-14" , "workTime" : { "Mo" : "09:00-18:00", "Tu" : "09:00-18:00", "We" : "09:00-18:00", "Th" : "09:00-18:00", "Fr" : "09:00-18:00" } }
		},

		"TC-630" : {
			"origin" : "5 июля оплатить Счет за оплату 23.12.2017",
			"expectations" : [
				{  "event_type" : "N", "event_startDate": "2017-12-23", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "5 июля оплатить Счет за оплату" },
				{  "event_type" : "N", "event_startDate": "2015-07-05", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "оплатить Счет за оплату 23.12.2017" }
			],
			"environment" : { "time" : "15:00", "date" : "2015-01-29" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-631" : {
			"origin" : "на следующий месяц будет весна",
			"expectations" : [
				{  "event_type" : "N", "event_startDate": "2015-04-01", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "будет весна" }
			],
			"environment" : { "time" : "15:00", "date" : "2015-03-16" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-632" : {
			"origin" : "через неделю не будет ничего",
			"expectations" : [
				{  "event_type" : "N", "event_startDate": "2015-03-23", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "не будет ничего" }
			],
			"environment" : { "time" : "15:00", "date" : "2015-03-16" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-633" : {
			"origin" : "завтра запишем альбом",
			"expectations" : [
				{  "event_type" : "N", "event_startDate": "2015-03-14", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "запишем альбом" }
			],
			"environment" : { "time" : "15:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "-", "Su" : "09:00-13:00" } }
		},

		"TC-634" : {
			"origin" : "в понедельник в 8 купить мороженое",
			"expectations" : [
				{  "event_type" : "N", "event_startDate": "2015-03-16", "event_startTime" : "08:00", "event_duration" : "30", "event_result" : "купить мороженое" },
				{  "event_type" : "N", "event_startDate": "2015-03-16", "event_startTime" : "20:00", "event_duration" : "30", "event_result" : "купить мороженое" }
			],
			"environment" : { "time" : "15:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "-", "Su" : "09:00-13:00" } }
		},

		"TC-635" : {
			"origin" : "16/99 15/87, 07/12 начать тестировать смартнот  ",
			"expectations" : [
				{  "event_type" : "N", "event_startDate": "2015-12-07", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "16/99 15/87, начать тестировать смартнот  " }
			],
			"environment" : { "time" : "15:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "-", "Su" : "09:00-13:00" } }
		},

		"TC-636" : {
			"origin" : "17 SFO at 5:00",
			"expectations" : [
			],
			"environment" : { "time" : "15:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "-", "Su" : "09:00-13:00" } }
		},

		"TC-637" : {
			"origin" : "18 поделить на ноль 23 0:23",
			"expectations" : [
			],
			"environment" : { "time" : "15:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "-", "Su" : "09:00-13:00" } }
		},

		"TC-638" : {
			"origin" : "19 18:02 13.03.2015 Пятница",
			"expectations" : [
				{  "event_type" : "N", "event_startDate": "2015-03-13", "event_startTime" : "18:02", "event_duration" : "30", "event_result" : "19" }
			],
			"environment" : { "time" : "15:00", "date" : "2015-03-12" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "-", "Su" : "09:00-13:00" } }
		},

		"TC-639" : {
			"origin" : "20 сегодня в 21:00 написать то, о чем давно думал.",
			"expectations" : [
				{  "event_type" : "N", "event_startDate": "2015-03-12", "event_startTime" : "21:00", "event_duration" : "30", "event_result" : "20 написать то, о чем давно думал." }
			],
			"environment" : { "time" : "15:00", "date" : "2015-03-12" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "-", "Su" : "09:00-13:00" } }
		},

		"TC-640" : {
			"origin" : "Завтра в 6 пойти купаться",
			"expectations" : [
				{  "event_type" : "N", "event_startDate": "2015-03-14", "event_startTime" : "06:00", "event_duration" : "30", "event_result" : "пойти купаться" },
				{  "event_type" : "N", "event_startDate": "2015-03-14", "event_startTime" : "18:00", "event_duration" : "30", "event_result" : "пойти купаться" }
			],
			"environment" : { "time" : "15:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "06:00-13:00", "Su" : "06:00-13:00" } }
		},

		"TC-641" : {
			"origin" : "Завтра в 7 искупать себя",
			"expectations" : [
				{  "event_type" : "N", "event_startDate": "2015-03-14", "event_startTime" : "19:00", "event_duration" : "30", "event_result" : "искупать себя" }
			],
			"environment" : { "time" : "15:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-19:00", "Su" : "09:00-19:00" } }
		},

		"TC-642" : {
			"origin" : "помыть кота завтра в 8",
			"expectations" : [
				{  "event_type" : "N", "event_startDate": "2015-03-14", "event_startTime" : "08:00", "event_duration" : "30", "event_result" : "помыть кота" },
				{  "event_type" : "N", "event_startDate": "2015-03-14", "event_startTime" : "20:00", "event_duration" : "30", "event_result" : "помыть кота" }
			],
			"environment" : { "time" : "15:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "-", "Su" : "-" } }
		},

		"TC-643" : {
			"origin" : "искупаться сегодня в 8",
			"expectations" : [
				{  "event_type" : "N", "event_startDate": "2015-03-13", "event_startTime" : "20:00", "event_duration" : "30", "event_result" : "искупаться" },
				{  "event_type" : "N", "event_startDate": "2015-03-13", "event_startTime" : "08:00", "event_duration" : "30", "event_result" : "искупаться" }
			],
			"environment" : { "time" : "15:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "-", "Su" : "-" } }
		},

		"TC-644" : {
			"origin" : "в 8 начать планировать свою жизнь", //  в след понедельник, так как седня в пятница и потом 2 выходных
			"expectations" : [
				{  "event_type" : "N", "event_startDate": "2015-03-14", "event_startTime" : "08:00", "event_duration" : "30", "event_result" : "начать планировать свою жизнь" }
			],
			"environment" : { "time" : "21:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "-", "Su" : "-" } }
		},

		"TC-645" : {
			"origin" : "24/09/15 моей сестре будет 22", // время начало 21:00 так как в четверг у нас выходной
			"expectations" : [
				{  "event_type" : "N", "event_startDate": "2015-09-24", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "моей сестре будет 22" }
			],
			"environment" : { "time" : "21:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "-", "Fr" : "09:00-19:00", "Sa" : "-", "Su" : "-" } }
		},

		"TC-646" : {
			"origin" : "в мае мне будет 23",
			"expectations" : [
				{  "event_type" : "N", "event_startDate": "2015-05-01", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "мне будет 23" }
			],
			"environment" : { "time" : "21:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "-", "Fr" : "09:00-19:00", "Sa" : "-", "Su" : "-" } }
		},

		"TC-647" : {
			"origin" : "13.03.2015. к 9 допилить все.",
			"expectations" : [
				{  "event_type" : "N", "event_startDate": "2015-03-13", "event_startTime" : "21:00", "event_duration" : "30", "event_result" : "допилить все." }
			],
			"environment" : { "time" : "20:59", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "-", "Fr" : "09:00-19:00", "Sa" : "-", "Su" : "-" } }
		},

		"TC-648" : {
			"origin" : "у меня сегодня выходной, ",
			"expectations" : [
				{  "event_type" : "N", "event_startDate": "2015-03-13", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "у меня выходной, " }
			],
			"environment" : { "time" : "21:59", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "-", "Fr" : "09:00-19:00", "Sa" : "-", "Su" : "-" } }
		},

		"TC-649" : {
			"origin" : " 17 марта во вторник забрать вещи ",
			"expectations" : [
				{  "event_type" : "N", "event_startDate": "2015-03-17", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : " во вторник забрать вещи " }
			],
			"environment" : { "time" : "21:59", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "-", "Fr" : "09:00-19:00", "Sa" : "-", "Su" : "-" } }
		},

		"TC-650" : {
			"origin" : "Завтра в 7-30 - совещание",
			"expectations" : [
				{ "event_type" : "N", "event_startDate": "2016-02-29",   "event_startTime" : "19:30", "event_duration" : "30", "event_result" : "совещание"}
			],
			"environment" : { "time" : "10:00", "date" : "2016-02-28" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-651" : {
			"origin" : "Предметно изучить суть постановления Арб суда от 15.05.2015 №30/14",
			"expectations" : [
				{ "event_type" : "N", "event_startDate": "2015-05-15",   "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Предметно изучить суть постановления Арб суда №30/14"} // есть предлог "от" перед датой после которого дату события никто указывать не будет, скорее всего
			],
			"environment" : { "time" : "10:00", "date" : "2015-02-28" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-652" : {
			"origin" : "составить отчет за июнь, и выслать счета за май и июнь",
			"expectations" : [
				{ "event_type" : "N", "event_startDate": "2015-06-01",   "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "составить отчет, и выслать счета за май и июнь"},{ "event_type" : "N", "event_startDate": "2016-06-01",   "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "составить отчет за и выслать счета за май и июнь"},
				{ "event_type" : "N", "event_startDate": "2015-05-01",   "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "составить отчет за июнь, и выслать счета и июнь"}// есть предлог "за" перед датой после которого дату события никто указывать не будет, скорее всего
			],
			"environment" : { "time" : "10:00", "date" : "2015-02-28" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-653" : {
			"origin" : "отчет от 8 июля",
			"expectations" : [
				{ "event_type" : "N", "event_startDate": "2015-07-08",   "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "отчет"} // есть предлог "от"
			],
			"environment" : { "time" : "10:00", "date" : "2015-02-28" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-654" : {
			"origin" : "глава 1.3 - пути совершенствования учета себестоимости",
			"expectations" : [
			],
			"environment" : { "time" : "10:00", "date" : "2015-02-28" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-655" : {
			"origin" : "купить яблоки 5-6 штук",
			"expectations" : [
			],
			"environment" : { "time" : "10:00", "date" : "2015-02-28" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-656" : {
			"origin" : "вчера рождаемость в нашем регионе превысила среднестатистический уровень в 1,3 раза",
			"expectations" : [
				{ "event_type" : "N", "event_startDate": "2015-02-27",   "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "рождаемость в нашем регионе превысила среднестатистический уровень в 1,3 раза"}
			],
			"environment" : { "time" : "10:00", "date" : "2015-02-28" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-657" : {
			"origin" : "вчера рождаемость в нашем регионе превысила среднестатистический уровень в 1,3 раза",
			"expectations" : [
				{ "event_type" : "N", "event_startDate": "2015-02-27",   "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "рождаемость в нашем регионе превысила среднестатистический уровень в 1,3 раза"}
			],
			"environment" : { "time" : "10:00", "date" : "2015-02-28" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-658" : {
			"origin" : "Уникс победил, счет 65:47",
			"expectations" : [
			],
			"environment" : { "time" : "10:00", "date" : "2015-02-28" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-659" : {
			"origin" : "завтра увеличим продажи в 2 раза",
			"expectations" : [
				{ "event_type" : "N", "event_startDate": "2015-03-01",   "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "увеличим продажи в 2 раза"} //после цифры идет слово "раза" - так время никогда не запишут
			],
			"environment" : { "time" : "10:00", "date" : "2015-02-28" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-660" : {
			"origin" : "через 45 метров",
			"expectations" : [
			],
			"environment" : { "time" : "10:00", "date" : "2015-02-28" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-661" : {
			"origin" : "напомнить купить таблетки за 3 рубля",
			"expectations" : [
			],
			"environment" : { "time" : "10:00", "date" : "2015-02-28" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-662" : {
			"origin" : "планирую выполнить работу за 2 дня",
			"expectations" : [
			],
			"environment" : { "time" : "10:00", "date" : "2015-02-28" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-663" : {
			"origin" : "субботнее утро провести с котом",
			"expectations" : [
			],
			"environment" : { "time" : "10:00", "date" : "2015-02-28" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-664" : {
			"origin" : "с 1 по 20 страницы договора необходимо перепечатать",
			"expectations" : [
			],
			"environment" : { "time" : "10:00", "date" : "2015-02-28" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-665" : {
			"origin" : "123-23-23 - позвонить, если станет скучно, напомнить о приближающемся празднике",
			"expectations" : [
			],
			"environment" : { "time" : "10:00", "date" : "2015-02-28" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-666" : {
			"origin" : "2 950594 945955 - номер счета, 92 07 234 234 - паспорт, 04-23 456789 - полис",
			"expectations" : [
			],
			"environment" : { "time" : "10:00", "date" : "2015-02-28" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-667" : {
			"origin" : "Иванов ИИ, дата рождения 16.04.1995, придет в 5, подготовить документы",
			"expectations" : [
				{ "event_type" : "N", "event_startDate": "1995-04-16",   "event_startTime" : "05:00", "event_duration" : "30", "event_result" : "Иванов ИИ, дата рождения, придет, подготовить документы"},
				{ "event_type" : "N", "event_startDate": "1995-04-16",   "event_startTime" : "17:00", "event_duration" : "30", "event_result" : "Иванов ИИ, дата рождения, придет, подготовить документы"}
			],
			"environment" : { "time" : "18:00", "date" : "2015-03-12" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-668" : {
			"origin" : "12 августа 14 года группа из 12-15 человек устроила беспорядки в районе рынка по адресу ул. Полыгалова,д. 15/2 - возбуждено уголовное дело",
			"expectations" : [
				{ "event_type" : "N", "event_startDate": "2014-08-12",   "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "группа из 12-15 человек устроила беспорядки в районе рынка по адресу ул. Полыгалова,д. 15/2 - возбуждено уголовное дело"}
			],
			"environment" : { "time" : "18:00", "date" : "2015-03-12" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-669" : {
			"origin" : "пин код 20 93, срок действия - 12/19 ",
			"expectations" : [
			],
			"environment" : { "time" : "18:00", "date" : "2015-03-12" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-670" : {
			"origin" : "14.04.2015 с полседьмого начать проводить все запланированные вчера мероприятия",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-04-14" ,   "event_startTime" : "18:30", "event_duration" : "30", "event_result" : "начать проводить все запланированные вчера мероприятия"}
			],
			"environment" : { "time" : "12:35", "date" : "2015-04-11" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-18:00", "We" : "09:00-18:00", "Th" : "09:00-18:00", "Fr" : "09:00-18:00", "Sa" : "-", "Su" : "-" } }
		},

		"TC-671" : {
			"origin" : "16 янв 03-00 - день рождения отметить с друзьями или без",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2016-01-16" ,   "event_startTime" : "03:00", "event_duration" : "30", "event_result" : "день рождения отметить с друзьями или без"}
			],
			"environment" : { "time" : "23:35", "date" : "2015-04-11" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-18:00", "We" : "09:00-18:00", "Th" : "09:00-18:00", "Fr" : "09:00-18:00", "Sa" : "-", "Su" : "-" } }
		},

		"TC-672" : {
			"origin" : "Мне 45 лет",
			"expectations" : [
			],
			"environment" : { "time" : "10:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-673" : {
			"origin" : "Счет за оплату 23.12.2017",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2017-12-23" ,   "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "Счет за оплату"}
			],
			"environment" : { "time" : "10:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-674" : {
			"origin" : "вчера купил хлеб",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-04-12" ,   "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "купил хлеб"}
			],
			"environment" : { "time" : "10:00", "date" : "2015-04-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-675" : {
			"origin" : "позавчера записали альбом",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-04-11" ,   "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "записали альбом"}
			],
			"environment" : { "time" : "10:00", "date" : "2015-04-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-676" : {
			"origin" : "неделю назад был концерт Cannines",
			"expectations" : [
			],
			"environment" : { "time" : "10:00", "date" : "2015-04-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-677" : {
			"origin" : "соотношение масштаба где то 1:5",
			"expectations" : [
			],
			"environment" : { "time" : "10:00", "date" : "2015-04-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-678" : {
			"origin" : "05,08,2015 в 12.05 pm авиабилет Moscow (SVO) - Los angeles (LAX)",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-04-13" ,   "event_startTime" : "12:05", "event_duration" : "30", "event_result" : "05,08,2015 pm авиабилет Moscow (SVO) - Los angeles (LAX)" }
			],
			"environment" : { "time" : "10:00", "date" : "2015-04-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-679" : {
			"origin" : "Месяц назад была еще зима.",
			"expectations" : [
			],
			"environment" : { "time" : "10:00", "date" : "2015-04-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-680" : {
			"origin" : "Оформление документов займет 4 дня",
			"expectations" : [
			],
			"environment" : { "time" : "10:00", "date" : "2015-04-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-681" : {
			"origin" : "оформление восьми договоров займет от 4 до 8 часов, стоит от 6 до 7,5 т.р.",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-04-13" ,   "event_startTime" : "16:00", "event_duration" : "240", "event_result" : "оформление восьми договоров займет, стоит от 6 до 7,5 т.р." }
			],
			"environment" : { "time" : "10:00", "date" : "2015-04-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-682" : {
			"origin" : "стоимость аренды 4 500, питание 2 300 руб, оплатить до понедельника",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-04-20" ,   "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "стоимость аренды 4 500, питание 2 300 руб, оплатить до" }
			],
			"environment" : { "time" : "10:00", "date" : "2015-04-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-683" : {
			"origin" : "8-917-287 64 90 - Айрат, 937 522 93 27 - Рузаль, 922-456-56-13 - Витя, 8 917 567-45-23 - вадим, +7 (155) 456-45-44 - Кирилл",
			"expectations" : [
			],
			"environment" : { "time" : "10:00", "date" : "2015-04-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-684" : {
			"origin" : "апрель - месяц капелей и ручейков",
			"expectations" : [
				{ "event_type" : "N", "event_startDate" : "2015-04-01" ,   "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "месяц капелей и ручейков" }
			],
			"environment" : { "time" : "10:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-685" : {
			"origin" : "12-04-2015 в 6 вечера мне вернули документы",
			"expectations" : [
				{  "event_type" : "N", "event_startDate": "2015-04-12", "event_startTime" : "18:00", "event_duration" : "30", "event_result" : "мне вернули документы" } // время явно привязано к дате в прошлом
			],
			"environment" : { "time" : "10:00", "date" : "2015-04-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-686" : {
			"origin" : "18 июля в воскресенье",
			"expectations" : [
				{  "event_type" : "N", "event_startDate": "2015-07-18", "event_startTime" : "10:00", "event_duration" : "30", "event_result" : "в воскресенье" },
				{  "event_type" : "N", "event_startDate": "2015-04-19", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "18 июля" }
			],
			"environment" : { "time" : "10:00", "date" : "2015-04-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "10:00-13:00", "Su" : "10:00-13:00" } }
		},

		"TC-687" : {
			"origin" : "через неделю назначить встречу с инвесторами, день неважен, на 13:00",
			"expectations" : [
				{  "event_type" : "N", "event_startDate": "2015-04-20", "event_startTime" : "13:00", "event_duration" : "30", "event_result" : "назначить встречу с инвесторами, день неважен"  }
			],
			"environment" : { "time" : "10:00", "date" : "2015-04-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "10:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-688" : {
			"origin" : "Виталий работает день через день, связаться можно во вторник с 15 до 18, напомнить за 15",
			"expectations" : [
				{  "event_type" : "N", "event_startDate": "2015-04-15", "event_startTime" : "15:00", "event_duration" : "180", "event_result" : "Виталий работает день, связаться можно во вторник", "event_alarms" : "-15" },
				{  "event_type" : "N", "event_startDate": "2015-04-14", "event_startTime" : "15:00", "event_duration" : "180", "event_result" : "Виталий работает день через день, связаться можно", "event_alarms" : "-15" }
			],
			"environment" : { "time" : "10:00", "date" : "2015-04-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "10:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-689" : {
			"origin" : "призывной возраст - c 18 лет до 28",
			"expectations" : [
			],
			"environment" : { "time" : "10:00", "date" : "2015-04-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "10:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-690" : {
			"origin" : "следующий месяц - последний перед истечением полномочий старого созыва Совета",
			"expectations" : [
				{  "event_type" : "N", "event_startDate": "2015-05-01", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "последний перед истечением полномочий старого созыва Совета" }
			],
			"environment" : { "time" : "10:00", "date" : "2015-04-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-691" : {
			"origin" : "4*21+3*21=147 человекодней, 53,4/147=0,3632 тратил 1 человек в день в среднем, 0,3632*42=15,257 за 42 дня, 0,3632*21=7,56 за 21 день, 15*3+7=53 - сошлось",
			"expectations" : [
			],
			"environment" : { "time" : "10:00", "date" : "2015-02-28" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-692" : {
			"origin" : "«Рубин» (тат. Рубин Казан футбол төркеме) — российский футбольный клуб из города Казани. Один из лидеров российского футбола второй половины 2000-х годов. Основан в 1958 году. Двукратный чемпион России 2008 и 2009 годов. Обладатель Кубка России 2012, Кубка Содружества 2010, Суперкубка России 2010 и Суперкубка России 2012. В 2009 году был признан лучшей командой года по версии Российского футбольного союза[3].",
			"expectations" : [
			],
			"environment" : { "time" : "10:00", "date" : "2015-02-28" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-693" : {
			"origin" : "В свидетельстве о рождении дата 12.03.98",
			"expectations" : [
				{  "event_type" : "N", "event_startDate": "1998-03-12", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "В свидетельстве о рождении дата" }
			],
			"environment" : { "time" : "10:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-694" : {
			"origin" : "отношение диаметра круга к его радиусу 4/7",
			"expectations" : [
			],
			"environment" : { "time" : "10:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-695" : {
			"origin" : "сумма по оплате 12.00 рублей",
			"expectations" : [
			],
			"environment" : { "time" : "10:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-696" : {
			"origin" : "напомнить о событии 13.11.11",
			"expectations" : [
				{  "event_type" : "N", "event_startDate": "2011-11-13", "event_startTime" : "09:00", "event_duration" : "30", "event_alarms" : "0", "event_result" : "о событии" }
			],
			"environment" : { "time" : "10:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-697" : {
			"origin" : "12 84 74 61 27 12 30 - это просто цифры",
			"expectations" : [
			],
			"environment" : { "time" : "10:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-698" : {
			"origin" : "13:60 счет в игре",
			"expectations" : [
			],
			"environment" : { "time" : "10:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-699" : {
			"origin" : "зайти в сеть магазинов 'Семёрочка' 7/11",
			"expectations" : [
				{  "event_type" : "N", "event_startDate": "2015-11-07", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "зайти в сеть магазинов 'Семёрочка'" }
			],
			"environment" : { "time" : "10:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-700" : {
			"origin" : "круглосуточный магазин 7/24",
			"expectations" : [
			],
			"environment" : { "time" : "10:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-701" : {
			"origin" : "В моем калифорнийском ID, год рождения записан как 05.12.2015, мне еще не верили что мне 21 наступил, хотя 21 наступил в тот момент",
			"expectations" : [
				{  "event_type" : "N", "event_startDate": "2015-12-05", "event_startTime" : "09:00", "event_duration" : "30", "event_result" : "В моем калифорнийском ID, год рождения записан как, мне еще не верили что мне 21 наступил, хотя 21 наступил в тот момент" }
			],
			"environment" : { "time" : "10:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		},

		"TC-702" : {
			"origin" : "5-11-02-14 - номер телефона совершенно рандомного человека",
			"expectations" : [
			],
			"environment" : { "time" : "10:00", "date" : "2015-03-13" , "workTime" : { "Mo" : "09:00-19:00", "Tu" : "09:00-19:00", "We" : "09:00-19:00", "Th" : "09:00-19:00", "Fr" : "09:00-19:00", "Sa" : "09:00-13:00", "Su" : "09:00-13:00" } }
		}
	};


	/**
	 * @author Kadyrov Albert <fluffy1snow@gmail.com>
	 * @module TestAssets
	 */

	function compareTwoEvents ( eventA, eventB ) {
		if ( !eventA && !eventB ) return false;
		if ( !eventA && eventB ) return 'Empty left';
		if ( eventA && !eventB ) return 'Empty right';
		for ( var ks = [ 'event_type', 'event_startDate', 'event_startTime', 'event_duration', 'event_result', 'event_alarms' ], i = ks.length; i--; ) {
			if ( eventA[ ks[ i ] ] !== eventB[ ks[ i ] ] ) return 'Does not match ' + ks[ i ];
		}
		return false;
	}

	var passes = 0, fails = 0, warns = 0;

	for ( var a in testCases ) {
		if ( testCases.hasOwnProperty( a ) && testCases[ a ].expectations.length ) {
			smartDateParse(
				testCases[ a ].origin,
				{
					model: null,
					environment: testCases[ a ].environment,
					debug : 1
				},
				function ( ret, result ) {
					var r00, r01, r10;
					if ( !ret ) {
						// TODO Переделать на сравнение последовательности
						// TODO Добавить проверку уникальности результатов
						if ( !( r00 = compareTwoEvents( result[ 0 ], testCases[ a ].expectations[ 0 ] ) ) ) {
							console.log( '%s PASS First given item match first expected', a );
							passes++;
						} else {
							if ( !( r01 = compareTwoEvents( result[ 0 ], testCases[ a ].expectations[ 1 ] ) ) || !( r10 = compareTwoEvents( result[ 1 ], testCases[ a ].expectations[ 0 ] ) ) ) {
								console.log( "%s WARN", a, '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!' );
								console.log( result, testCases[ a ].expectations );
								console.log( r00, r01, r10 );
								warns++;
							} else {
								console.log( "%s FAIL", a );
								console.log( '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!' );
								console.log( result, testCases[ a ].expectations );
								console.log( r00, r01, r10 );
								console.log( '@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@' );
								fails++;
							}
						}

					} else {
						console.log( "SmartDate returned error", ret );
					}
				} );
		}
	}
	console.log( "Result PASSES=" + passes + ', WARNS=' + warns + ', FAILS=' + fails );

} ).call( this );