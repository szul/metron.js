module metron {
    class placeholder {
        constructor() {
        }
    }
    export class tools {
        static extend(subClass: any, superClass: any): void {
            var placeholder = new placeholder();
            placeholder.prototype = superClass.prototype;
            subClass.prototype = new placeholder();
            subClass.prototype.constructor = subClass;
            subClass.superclass = superClass.prototype;
            if (superClass.prototype.constructor === Object.prototype.constructor) {
                superClass.prototype.constructor = superClass;
            }
        }
        static clone(obj: any): any {
            var placeholder = new placeholder();
            placeholder.prototype = obj;
            return placeholder;
        }
        static mixin(receivingObject: any, mixinObject: any): void {
            for (var method in mixinObject.prototype) {
                if (mixinObject.prototype[method] !== null && typeof (receivingObject.prototype[method]) === 'undefined') {
                    receivingObject.prototype[method] = mixinObject.prototype[method];
                }
            }
        }
    }

    export class dictionary {
        length: number = 0;
        items: any = {};
        constructor(obj?: any) {
            if (obj != null) {
                for (var prop in obj) {
                    if (obj.hasOwnProperty(prop)) {
                        this.items[prop] = obj[prop];
                        this.length++;
                    }
                }
            }
        }
        setItem(key: string, value: any): void {
            if (!this.hasItem(key)) {
                this.length++;
            }
            this.items[key] = value;
        }
        getItem(key: string): any {
            return this.hasItem(key) ? this.items[key] : null;
        }
        hasItem(key: string): boolean {
            return this.items.hasOwnProperty(key);
        }
        removeItem(key: string): number {
            if (this.hasItem(key)) {
                this.length--;
                delete this.items[key];
                return 1;
            }
            else {
                return 0;
            }
        }
        keys(): Array<string> {
            var keys: Array<string> = [];
            for (var k in this.items) {
                if (this.hasItem(k)) {
                    keys.push(k);
                }
            }
            return keys;
        }
        values(): Array<any> {
            var values: Array<any> = [];
            for (var k in this.items) {
                if (this.hasItem(k)) {
                    values.push(this.items[k]);
                }
            }
            return values;
        }
        each(f: Function): void {
            var i: number = 0;
            for (var key in this.items) {
                f(key, this.items[key], i);
                i++;
            }
        }
        clear(): void {
            this.items = {}
            this.length = 0;
        }
    }

    export class web {
        static querystring(obj: string): Array<string> {
            if (typeof (document) !== 'undefined') {
                var result: Array<string> = [];
                var match: any;
                var re: RegExp = new RegExp('(?:\\?|&)' + obj + '=(.*?)(?=&|$)', 'gi');
                while ((match = re.exec(document.location.search)) != null) {
                    result.push(match[1]);
                }
                return result;
            }
            else {
                throw 'Error: No document object found. Environment may not contain a DOM.';
            }
        }

    }

}

/*
metron.web = {
	cookie: {
		get: function(name) {
			if(typeof(document) !== 'undefined') {
	     var cookieParts = document.cookie.split(';');
	     for(var i = 0; i < cookieParts.length; i++) {
				 var cookieName = cookieParts[i].substr(0, cookieParts[i].indexOf("="));
				 var cookieValue = cookieParts[i].substr(cookieParts[i].indexOf("=") + 1);
				 if (cookieName.trim() == name) {
					 return cookieValue;
				 }
	     }
	     return null;
		 }
		 else {
			 throw 'Error: No document object found. Environment may not contain a DOM.';
		 }
		},
		set: function(name, val, date) {
			if(typeof(document) !== 'undefined') {
				var cookie = name + '=' + val + ';path="/"';
				if(typeof(date) !== 'undefined') {
					cookie += ';expires=' + date.toUTCString();
				}
				document.cookie = cookie;
			}
			else {
 			 throw 'Error: No document object found. Environment may not contain a DOM.';
 		 }
		},
		delete: function(name) {
			if(typeof(document) !== 'undefined') {
				document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
			}
			else {
 			 throw 'Error: No document object found. Environment may not contain a DOM.';
 		 }
		}
	},
	headers: {
		get: function(name) {
			if(typeof(document) !== 'undefined') {
				if(name != null) {
					//Will this work in all browsers?
					var request = new XMLHttpRequest();
					request.open("HEAD", document.location, false);
					request.send(null);
					return request.getResponseHeader(name);
				}
				else {
					var request = new XMLHttpRequest();
					request.open("HEAD", document.location, false);
					request.send(null);
					return request.getAllResponseHeaders();
				}
			}
			else {
				throw 'Error: No document object found. Environment may not contain a DOM.';
			}
		}
	}
};

metron.elements = {
	textarea: {
		clean: function(elem) {
			return elem.value.replace(/\r?\n/g, "\r\n");
		}
	}
};

metron.observer = (function () {
	var callback;
	var frequency;
	var isExecuting = false;
	var timer;
	function setupInterval(pe) {
		timer = setInterval(
			function () {
				pe.onTimer(pe);
			},
			frequency * 1000
		);
	}
	function execute(pe) {
		callback(pe);
	}
	function onTimer(pe) {
	    if (!isExecuting) {
				try {
			    	isExecuting = true;
			    	execute(pe);
			    	isExecuting = false;
				} catch (e) {
			    	isExecuting = false;
			    	throw e;
				}
	    }
	}
	return {
		watch: function (callback, frequency) {
			callback = callback;
			frequency = frequency;
			setupInterval(this);
		},
		stop: function () {
			if (!timer) {
				return;
			}
			clearInterval(timer);
			timer = null;
		}
    	};
})();

metron.guid = (function() {
	function generateGUIDPart() {
    	    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    	}
	return {
		newGuid: function () {
			return (generateGUIDPart() + generateGUIDPart() + "-" + generateGUIDPart() + "-" + generateGUIDPart() + "-" + generateGUIDPart() + "-" + generateGUIDPart() + generateGUIDPart() + generateGUIDPart());
		}
	};
})();

if(typeof($m) === 'undefined') {
	$m = metron;
}

if(typeof(extend) === 'undefined') {
	extend = metron.class.extend;
}

if(typeof(clone) === 'undefined') {
	clone = metron.class.clone;
}

if(typeof(mixin) === 'undefined') {
	mixin = metron.class.mixin;
}

if(typeof(Guid) === 'undefined') {
	Guid = metron.guid;
}

if(typeof(Dictionary) === 'undefined') {
	Dictionary = metron.dictionary;
}

if(typeof(document) !== 'undefined' && typeof(document.location) !== 'undefined') {
	if(typeof(document.location.querystring) === 'undefined') {
		document.location.querystring = metron.web.querystring;
	}
	if(typeof(document.location.headers) === 'undefined') {
		document.location.headers = metron.web.headers;
	}
}
*/


interface String {
    lower: () => string;
    upper: () => string;
    //trim: () => string;
    ltrim: () => string;
    rtrim: () => string;
    normalize: () => string;
    startsWith: (part: string) => boolean;
    endsWith: (part: string) => boolean;
    capFirst: () => string;
    capWords: () => string;
    truncateWords: (number: number) => string;
    truncateWordsWithHtml: (number: number) => string;
    stripHtml: () => string;
    escapeHtml: () => string;
    toBool: () => boolean;
    contains: (val: string) => boolean;
    slugify: () => string;
    toPhoneNumber: () => string;
    isNullOrEmpty: (val: string) => boolean;
}

String.prototype.lower = function (): string {
    return this.toLowerCase();
};

String.prototype.upper = function (): string {
    return this.toUpperCase();
};

String.prototype.trim = function (): string {
    return this.replace(/^\s+|\s+$/g, "");
};

String.prototype.ltrim = function (): string {
    return this.replace(/^\s+/, "");
};

String.prototype.rtrim = function (): string {
    return this.replace(/\s+$/, "");
};

String.prototype.normalize = function (): string {
    return this.replace(/^\s*|\s(?=\s)|\s*$/g, "");
};

String.prototype.startsWith = function (part: string): boolean {
    return (this.slice(0, part.length) == part);
};

String.prototype.endsWith = function (part: string): boolean {
    return (this.slice(-part.length) == part);
};

String.prototype.capFirst = function (): string {
    if (this.length == 1) {
        return this.toUpperCase();
    }
    else if (this.length > 0) {
        var regex = /^(\(|\[|"|')/;
        if (regex.test(this)) {
            return this.substring(0, 2).toUpperCase() + this.substring(2);
        }
        else {
            return this.substring(0, 1).toUpperCase() + this.substring(1);
        }
    }
    return null;
};

String.prototype.capWords = function (): string {
    var regexp = /\s/;
    var words: Array<string> = this.split(regexp);
    if (words.length == 1) {
        return words[0].capFirst();
    }
    else if (words.length > 1) {
        var result: string = '';
        for (var i = 0; i < words.length; i++) {
            if (words[i].capFirst() != null) {
                result += words[i].capFirst() + ' ';
            }
        }
        result.trim();
        return result;
    }
    return null;
};

String.prototype.truncateWords = function (number: number): string {
    var words: Array<string> = this.split(/\s+/);
    if (words.length > number) {
        return words.slice(0, number).join(' ');
    }
    return words.join(' ');
};

String.prototype.truncateWordsWithHtml = function (number: number): string {
    var tags: Array<string> = [];
    var truncation: string = this.truncateWords(number);
    var matches = truncation.match(/<[\/]?([^> ]+)[^>]*>/g);
    for (var i = 0; i < matches.length; i++) {
        var opening: string = matches[i].replace('/', '');
        if (matches[i].indexOf('/') != -1 && tags.indexOf(opening) != -1) {
            tags.remove(opening);
        }
        else if (matches[i].indexOf('/') != -1) {
            continue;
        }
        else {
            tags.push(matches[i]);
        }
    }
    for (var j = 0; j < tags.length; j++) {
        truncation += tags[j].replace('<', '</').replace(/(\s*)(\w+)=("[^<>"]*"|'[^<>']*'|\w+)/g, '');
    }
    return truncation;
};

String.prototype.stripHtml = function (): string {
    var content: string = this.replace(/<[\/]?([^> ]+)[^>]*>/g, '');
    content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/ig, '');
    content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/ig, '');
    content = content.replace(/<!--[\s\S]*?-->/g, '');
    content = content.replace('&nbsp;', ' ');
    content = content.replace('&amp;', '&');
    return content;
};

String.prototype.escapeHtml = function (): string {
    var content: string = this.replace(/"/g, '&quot;');
    content.replace(/&(?!\w+;)/g, '&amp;');
    content.replace(/>/g, '&gt;');
    content.replace(/</g, '&lt;');
    return content;
};

String.prototype.toBool = function (): boolean {
    if (String.isNullOrEmpty(this)) {
        return false;
    }
    else if (this.lower() === "true" || this.lower() === "1" || this.lower() === "y" || this.lower() === "t") {
        return true;
    }
    return false;
};

String.prototype.contains = function (val: string): boolean {
    if (this.indexOf(val) !== -1) {
        return true;
    }
    return false;
};

String.prototype.slugify = function (): string {
    return this.lower().normalize().replace(/[^a-z0-9]/gi, '-');
};

//toPhoneNumber() needs to be a part of some validation mechanism
String.prototype.toPhoneNumber = function (): string {
    try {
        return this.substring(0, 3) + '-' + this.substring(3, 6) + '-' + this.substring(6);
    }
    catch (e) {
        return this;
    }
};

String.isNullOrEmpty = function (val: string): boolean {
    if (val == null || val.trim() === '') {
        return true;
    }
    return false;
};
/*
Number.prototype.toBool = function (): boolean {
    if (this === 0) {
        return false;
    }
    return true;
};

Number.prototype.random = function (min: number, max: number) {
    return Math.floor(Math.random() * (parseInt(max, 10) - parseInt(min, 10) + 1) + parseInt(min, 10));
};

Array.prototype.empty = function (): void {
    return this.splice(0, this.length);
};

Array.prototype.isEmpty = function (): boolean {
    if (this.length === 0) {
        return true;
    }
    return false;
};

Array.prototype.each = function (callback: Function): void {
    for (var i = 0; i < this.length; i++) {
        callback(this[i], i);
    }
};

Array.prototype.remove = function (item: any): any {
    var index = this.indexOf(item);
    if (index != -1) {
        return this.splice(index, 1);
    }
};

Array.prototype.toObjectArray = function (objName: string): Array<any> {
    if (objName == null) {
        throw 'Error: Property name must be provided for conversion.';
    }
    var items: Array<any> = this;
    if (typeof (items[0]) === 'string' || typeof (items[0]) === 'number' || typeof (items[0]) === 'boolean') {
        for (var i = 0; i < items.length; i++) {
            var val = items[i];
            items[i] = {};
            items[i][objName] = val;
        }
        return items;
    }
    else {
        return this;
    }
};
*/
