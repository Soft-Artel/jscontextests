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
	DEBUG = 1
	, DEBUG2 = 0
	, _fakeModel = function ( res ) {
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
 DEBUG && console.log( 'cleaning', '\ntext - ', text, '\ntokens - ', matched, matched.length, matched[ 0 ] );
 for ( var i = 0; i < matched.length; i++ ) {
 DEBUG2 && console.log( matched[ i ] );
 if ( matched[ i ] ) {
 var r = new RegExp( '(..|.)?(.|^)(' + matched[i] + ')(.|$)(..|.)?' , 'gmi');
 DEBUG2 && console.log( text );
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
                     DEBUG2 && console.log( 1, arguments, p1, p2, p3, p4, p5 );
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
                     DEBUG2 && console.log( 2, arguments, ch2, ch3, p3, ch4, ch5 );
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
                                DEBUG2 && console.log( 3, arguments, ch2, ch3, p3, ch4, ch5 );
                                if ( ch4.match( /[,\.:]/ ) && ( ch5 && ch5.match(/\s/) ) ) {
                                return _checkChar( ch1 ) + _checkChar( ch6 );
                                } else if ( ch4 && ch4.match( /#/ ) ) {
                                return _checkChar( ch1 ) + ( ch2 || '' ) + ( ch4 || '' )+ ( ch5 || '' ) + _checkChar( ch6 );
                                } else if ( ch5 && ch5.match( /-/ ) ) {
                                return _checkChar( ch1 );
                                } else return _checkChar( ch1 ) + ( ch5 || '' ) + _checkChar( ch6 );
                                } else if ( ch4 && ch4.match( /,/ ) ) {
                                DEBUG2 && console.log( 2, arguments, ch2, ch3, p3, ch4, ch5 );
                                return _checkChar( ch1 ) + ( ch2 || '' ) + ( ch3 || '' ) + ( ch4 || '' ) + ( ch5 || '' ) + _checkChar( ch6 );
                                } else {
                                DEBUG2 && console.log( 4, arguments, ch2, ch3, p3, ch4, ch5 );
                                return _checkChar( ch1 ) + ( ch2 || '' ) + ( ch3 || '' ) + ( ch5 || '' ) + _checkChar( ch6 );
                                }
                                });
                     DEBUG2 && console.log( text );
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
                     DEBUG && console.log( res, res[ 0 ]._id );
                     for ( var i = 0; i < res.length; i++ ) {
                     DEBUG && console.log( 'processing model result', res[ i ] );
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
                     DEBUG && console.log('processing comb results', result, match, requested );
                     if ( result ) {
                     DEBUG && console.log( 'current processing combination', result );
                     result.match = match;
                     requested && ( result.requested = true );
                     _checkCombProperties( result );
                     if ( result.event_startTime.h && ( result.event_startTime.h < 13 ) && ( result.event_startTime.duplicity !== false ) ) {
                     _stringifyAndPush( result, k, true );
                     } else {
                     _stringifyAndPush( result, k )
                     }
                     DEBUG && console.log( 'pushed to k - ', k, result, '\n^^^^^^^^^^^^^^^^^^^^^^^^^^final^^^^^^^^^^^^^^^^^^^^^^^^^^^^' );
                     }
                     };
                     
                     Object.prototype.clone = function () {
                     return JSON.parse( JSON.stringify( this ) );
                     };
                     
                     options.debug ? DEBUG = 1 : DEBUG = 0;
                     
                     if ( options.environment ) {
                     options.environment.date ? SD_tools.localDate = new Date( options.environment.date.replace( /-/g, '/' ) ) : SD_tools.today().replace( /-/g, '/' );
                     options.environment.time ? SD_tools.localDate.setHours( +options.environment.time.slice( 0,2 ), +options.environment.time.slice( -2 ) ) : SD_tools.now( 0, 'ISO' );
                     SD_tools.workTime = options.environment.workTime;
                     } else 	SD_tools.localDate = null;
                     SD_tools.query = [];
                     DEBUG && console.log( text );
                     
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
                                         //DEBUG && console.log( rx.regExp );
                                         var c = Array.prototype.slice.call( arguments ), r = '#' + rx.type + '_' + _t.length, lr, tk = { origin : c.shift(), captured : c, func: rx.func, type : rx.type, priority : rx.priority };
                                         _t[ _t.length ] = tk;
                                         if ( !( lr = rx.replace.apply( tk, [ r ].concat( [ _t ] ).concat( c ) ) ) ) {
                                         return arguments[ 0 ]
                                         } else return lr;
                                         } );
                     }
                     DEBUG && console.log( 'this is tokens ' , _t );
                     DEBUG && console.log( 'this is text with tokens', text );
                     if ( _t.length ) {
                     for (i = 0; i < combinations.length, cb = combinations[i]; i++) {
                     while (( mt = cb.regExp.exec(text)) !== null) {
                     DEBUG && console.log('regExp - ', cb.regExp, '\nmatched in current comb - ', mt, text, '\n_________________________try_____________________________');
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
                      DEBUG && console.log( 'time out!' );
                      _processModelResult( _fakeModel( SD_tools.queries ) );
                      clearTimeout( s2 );
                      }, 1000 );
                      SD_adapter.requestModel( SD_tools.queries, function ( err, res ) {
                      clearTimeout( s1 );
                      DEBUG && console.log( 'request returned', res );
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
 * @author Vladislav Churakov <pioneer32@mail.ru>
 * @module iOS Adapter
 */
                     
                     var self = this;
                     
                     this.parseText = function ( text, options ) {
                     options || ( options = { singleMode : true } );
                     if ( self.modelQuery ) options.model = function ( query, callback ) {
                        callback( self.modelQuery( query ) );
                     };
                     self.sendResult( JSON.stringify( 'TEST' ) );
                     smartDateParse( text, options, function ( err, res ) {
                                    self.sendResult( JSON.stringify( res ) );
                                    } );
                     };
                     
                     } ).call( this );

 