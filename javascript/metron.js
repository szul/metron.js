var metron = {};

metron.class = {
    extend: function (subClass, superClass) {
        var Placeholder = function () { };
        Placeholder.prototype = superClass.prototype;
        subClass.prototype = new Placeholder();
        subClass.prototype.constructor = subClass;
        subClass.superclass = superClass.prototype;
        if (superClass.prototype.constructor == Object.prototype.constructor) {
            superClass.prototype.constructor = superClass;
        }
    },
    clone: function (obj) {
        function Placeholder() { }
        Placeholder.prototype = obj;
        return new Placeholder();
    },
    mixin: function (receivingObject, mixinObject) {
        for (var method in mixinObject.prototype) {
            if (mixin.prototype.hasOwnProperty(method)) {
                if (mixinObject.prototype[method] !== null && typeof (receivingObject.prototype[method]) === 'undefined') {
                    receivingObject.prototype[method] = mixinObject.prototype[method];
                }
            }
        }
    }
};

metron.dictionary = (function () {
    function dictionary(obj) {
        this.length = 0;
        this.items = {};
        if (obj !== null) {
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    this.items[prop] = obj[prop];
                    this.length++;
                }
            }
        }
    }
    dictionary.prototype.setItem = function (key, value) {
        if (!this.hasItem(key)) {
            this.length++;
        }
        this.items[key] = value;
    };
    dictionary.prototype.getItem = function (key) {
        return this.hasItem(key) ? this.items[key] : null;
    };
    dictionary.prototype.hasItem = function (key) {
        return this.items.hasOwnProperty(key);
    };
    dictionary.prototype.removeItem = function (key) {
        if (this.hasItem(key)) {
            this.length--;
            delete this.items[key];
            return 1;
        }
        else {
            return 0;
        }
    };
    dictionary.prototype.keys = function () {
        var keys = [];
        for (var k in this.items) {
            if (this.hasItem(k)) {
                keys.push(k);
            }
        }
        return keys;
    };
    dictionary.prototype.values = function () {
        var values = [];
        for (var k in this.items) {
            if (this.hasItem(k)) {
                values.push(this.items[k]);
            }
        }
        return values;
    };
    dictionary.prototype.each = function (f) {
        var i = 0;
        for (var key in this.items) {
            f(key, this.items[key], i);
            i++;
        }
    };
    dictionary.prototype.clear = function () {
        this.items = {};
        this.length = 0;
    };
    return dictionary;
})();

metron.web = (function () {
    function parseUrl(url, obj) {
        var paramPairs = [];
        if (url.contains('?')) {
            var parts = url.split('?');
            url = parts[0];
            paramPairs = paramPairs.concat(parts[1].split('&'));
        }
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop) && !paramPairs.contains(prop)) {
                paramPairs.push(prop + '=' + obj[prop]);
            }
            else if (obj.hasOwnProperty(prop) && paramPairs.contains(prop)) {
                paramPairs[paramPairs.indexOfPartial(prop)] = prop + '=' + obj[prop];
            }
        }
        return url + '?' + paramPairs.join('&');
    }
    return {
        querystring: function (obj) {
            if (typeof (document) !== 'undefined') {
                if (typeof (obj) === 'string' && arguments.length === 1) {
                    var result = [];
                    var match;
                    var re = new RegExp('(?:\\?|&)' + obj + '=(.*?)(?=&|$)', 'gi');
                    while ((match = re.exec(document.location.search)) !== null) {
                        result.push(match[1]);
                    }
                    return result;
                }
                else if (typeof (obj) === 'string' && arguments.length > 1) {
                    return [parseUrl(obj, arguments[1])];
                }
                else {
                    return [parseUrl(document.location.href, obj)];
                }
            }
            else {
                throw 'Error: No document object found. Environment may not contain a DOM.';
            }
        },
        cookie: {
            get: function (name) {
                if (typeof (document) !== 'undefined') {
                    var cookieParts = document.cookie.split(';');
                    for (var i = 0; i < cookieParts.length; i++) {
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
            set: function (name, val, date) {
                if (typeof (document) !== 'undefined') {
                    var cookie = name + '=' + val + ';path="/"';
                    if (typeof (date) !== 'undefined') {
                        cookie += ';expires=' + date.toUTCString();
                    }
                    document.cookie = cookie;
                }
                else {
                    throw 'Error: No document object found. Environment may not contain a DOM.';
                }
            },
            delete: function (name) {
                if (typeof (document) !== 'undefined') {
                    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
                }
                else {
                    throw 'Error: No document object found. Environment may not contain a DOM.';
                }
            }
        },
        headers: {
            get: function (name) {
                if (typeof (document) !== 'undefined') {
                    var request;
                    if (name !== undefined) {
                        //Will this work in all browsers?
                        request = new XMLHttpRequest();
                        request.open("HEAD", document.location.href, false);
                        request.send(null);
                        return request.getResponseHeader(name);
                    }
                    else {
                        request = new XMLHttpRequest();
                        request.open("HEAD", document.location.href, false);
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
})();

metron.elements = {
    textarea: {
        clean: function (elem) {
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

metron.guid = (function () {
    function generateGUIDPart() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return {
        /*
		 * Note that JavaScript doesn't actually have GUID or UUID functionality.
		 * This is as best as it gets.
		 */
        newGuid: function () {
            return (generateGUIDPart() + generateGUIDPart() + "-" + generateGUIDPart() + "-" + generateGUIDPart() + "-" + generateGUIDPart() + "-" + generateGUIDPart() + generateGUIDPart() + generateGUIDPart());
        }
    };
})();

var $m = (typeof ($m) === 'undefined') ? metron : $m;
var extend = (typeof (extend) === 'undefined') ? metron.class.extend : extend;
var clone = (typeof (clone) === 'undefined') ? metron.class.clone : clone;
var mixin = (typeof (mixin) === 'undefined') ? metron.class.mixin : mixin;
var Guid = (typeof (Guid) === 'undefined') ? metron.guid : Guid;
var Dictionary = (typeof (Dictionary) === 'undefined') ? metron.dictionary : Dictionary;

if (typeof (document) !== 'undefined' && typeof (document.location) !== 'undefined') {
    if (typeof (document.location.querystring) === 'undefined') {
        document.location.querystring = metron.web.querystring;
    }
    if (typeof (document.location.headers) === 'undefined') {
        document.location.headers = metron.web.headers;
    }
}

String.prototype.lower = function () {
    return this.toLowerCase();
};

String.prototype.upper = function () {
    return this.toUpperCase();
};

String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, "");
};

String.prototype.ltrim = function () {
    return this.replace(/^\s+/, "");
};

String.prototype.rtrim = function () {
    return this.replace(/\s+$/, "");
};

String.prototype.normalize = function () {
    return this.replace(/^\s*|\s(?=\s)|\s*$/g, "");
};

String.prototype.startsWith = function (part) {
    return this.slice(0, part.length) == part;
};

String.prototype.endsWith = function (part) {
    return this.slice(-part.length) == part;
};

String.prototype.capFirst = function () {
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

String.prototype.capWords = function () {
    var regexp = /\s/;
    var words = this.split(regexp);
    if (words.length == 1) {
        return words[0].capFirst();
    }
    else if (words.length > 1) {
        var result = '';
        for (var i = 0; i < words.length; i++) {
            if (words[i].capFirst() !== null) {
                result += words[i].capFirst() + ' ';
            }
        }
        result.trim();
        return result;
    }
    return null;
};

String.prototype.truncateWords = function (number) {
    var words = this.split(/\s+/);
    if (words.length > number) {
        return words.slice(0, number).join(' ');
    }
    return words.join(' ');
};

String.prototype.truncateWordsWithHtml = function (number) {
    var tags = [];
    var truncation = this.truncateWords(number);
    var matches = truncation.match(/<[\/]?([^> ]+)[^>]*>/g);
    for (var i = 0; i < matches.length; i++) {
        var opening = matches[i].replace('/', '');
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

String.prototype.stripHtml = function () {
    var content = this.replace(/<[\/]?([^> ]+)[^>]*>/g, '');
    content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/ig, '');
    content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/ig, '');
    content = content.replace(/<!--[\s\S]*?-->/g, '');
    content = content.replace('&nbsp;', ' ');
    content = content.replace('&amp;', '&');
    return content;
};

String.prototype.escapeHtml = function () {
    var content = this.replace(/"/g, '&quot;');
    content.replace(/&(?!\w+;)/g, '&amp;');
    content.replace(/>/g, '&gt;');
    content.replace(/</g, '&lt;');
    return content;
};

String.prototype.toBool = function () {
    if (String.isNullOrEmpty(this)) {
        return false;
    }
    else if (this.lower() === "true" || this.lower() === "1" || this.lower() === "y" || this.lower() === "t") {
        return true;
    }
    return false;
};

String.prototype.contains = function (val) {
    if (this.indexOf(val) !== -1) {
        return true;
    }
    return false;
};

String.prototype.slugify = function () {
    return this.lower().normalize().replace(/[^a-z0-9]/gi, '-');
};

//toPhoneNumber() needs to be a part of some validation mechanism
String.prototype.toPhoneNumber = function () {
    try {
        return this.substring(0, 3) + '-' + this.substring(3, 6) + '-' + this.substring(6);
    }
    catch (e) {
        return this;
    }
};

String.isNullOrEmpty = function (val) {
    if (val === undefined || val === null || val.trim() === '') {
        return true;
    }
    return false;
};

/*
 * Remember that Number extensions require the number to be in () or use the .. syntax:
 * (1).toBool()
 * 1..toBool()
 */

Number.prototype.toBool = function () {
    if (this === 0) {
        return false;
    }
    return true;
};

Number.prototype.random = function (min, max) {
    if (isNaN(min) || isNaN(max)) {
        throw 'Error: Only numbers are accepted as arguments.';
    }
    return Math.floor(Math.random() * (parseInt(max, 10) - parseInt(min, 10) + 1) + parseInt(min, 10));
};

Array.prototype.empty = function () {
    return this.splice(0, this.length);
};

Array.prototype.isEmpty = function () {
    if (this.length === 0) {
        return true;
    }
    return false;
};

Array.prototype.each = function (callback) {
    for (var i = 0; i < this.length; i++) {
        callback(this[i], i);
    }
};

Array.prototype.remove = function (item) {
    var index = this.indexOf(item);
    if (index != -1) {
        this.splice(index, 1);
    }
};

Array.prototype.contains = function (partial) {
    for (var i = 0; i < this.length; i++) {
        if (this[i].contains(partial)) {
            return true;
        }
    }
    return false;
};

Array.prototype.indexOfPartial = function (partial) {
    for (var i = 0; i < this.length; i++) {
        if (this[i].contains(partial)) {
            return i;
        }
    }
    return -1;
};

/*
 * There are frameworks that auto-generate JSON based on data schemas, but sometimes they
 * return data in inconsistent ways. For example, an array of strings might be returned
 * instead of an array of objects containing strings, etc. because the underlying data at the time
 * only cotains the string value, but when other data is present (in the database, etc.),
 * it will return the object array. Certain convience methods are necessary to force proper formatting.
 */
Array.prototype.toObjectArray = function (objName) {
    if (objName === undefined || objName === null) {
        throw 'Error: Property name must be provided for conversion.';
    }
    var items = this;
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

Object.isEmpty = function (obj) {
    return (Object.getOwnPropertyNames(obj).length === 0);
};
