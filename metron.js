/*
@library: Metron
@namespace: Metron
@description: A JavaScript library designed to be lightweight that focuses on native type extensions and common view formatting.
*/
if(typeof(metron) === 'undefined') {
	metron = { };
}
else {
	throw 'Error: A library named [metron] already exists in the current namespace.';
}

/*
@namespace: Metron.Class
@description: These methods are used for inheritance and for extending JavaScript class objects. All methods have corresponding global functions of the same name if those global functions do not already exist.
*/
metron.class = {
	/*
	@method: extend(object subClass, object superClass)
	@description: If the objects use classical inheritance, this will subclass one object with another.
	@param: subClass = The object to inherit from the superclass.
	@param: superClass = The object from which the subclass inherits.
	*/
	extend : function(subClass, superClass) {
		var placeholder = function() { };
		placeholder.prototype = superClass.prototype;
		subClass.prototype = new placeholder();
		subClass.prototype.constructor = subClass;
		subClass.superclass = superClass.prototype;
		//Should this be === ?
		if(superClass.prototype.constructor == Object.prototype.constructor) {
			superClass.prototype.constructor = superClass;
		}
	},
	/*
	@method: clone(object superClass)
	@description: If the objects use prototypal inheritance, this will return a cloned version of the superclass.
	@param: superClass = The object to be cloned.
	@return: object
	*/
	clone : function(obj) {
		function placeholder() { }
		placeholder.prototype = obj;
		return new placeholder();
	},
	/*
	@method: mixin(object receivingObject, object mixinObject)
	@description: Extends the receiving object with the methods and properties from the mixin object.
	@param: receivingObject = The object to receive the methods and properties.
	@param: mixinObject = The object containing the methods and properties to be mixed in.
	*/
	mixin : function(receivingObject, mixinObject) {
		//Does this need hasOwnObject() ?
		for(var method in mixinObject.prototype) {
			if(mixinObject.prototype[method] !== null && typeof(receivingObject.prototype[method]) === 'undefined') {
				receivingObject.prototype[method] = mixinObject.prototype[method];
			}
		}
	}
};

/* Metron Web namespace and methods */

metron.web = {
	querystring: {
		get: function (key) {
			var result = [];
			var match;
			var re = new RegExp('(?:\\?|&)' + key + '=(.*?)(?=&|$)', 'gi');
			while ((match = re.exec(document.location.search)) != null) {
				result.push(match[1]);
			}
			return result;
		}
	}
};

/* Metron Observer namespace and methods */

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

/* Metron GUID namespace and methods */

metron.guid = (function() {
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

//Create a [$m] shortcut if one does not exist.
if(typeof($m) === 'undefined') {
	$m = metron;
	$m.querystring = function(key) {
		return metron.web.querystring.get(key);
	}
}

/* If global functions for extends(), clone() and mixin() do not already exist, then it's OK to make the Metron ones global */
if(typeof(extend) === 'undefined') {
	extend = metron.class.extend;
}

if(typeof(clone) === 'undefined') {
	clone = metron.class.clone;
}

if(typeof(mixin) == 'undefined') {
	mixin = metron.class.mixin;
}

/* String object extensions */

String.prototype.lower = function() {
	return this.toLowerCase();
};

String.prototype.upper = function() {
	return this.toUpperCase();
};

String.prototype.trim = function() {
  return this.replace(/^\s+|\s+$/g,"");
};

String.prototype.ltrim = function() {
  return this.replace(/^\s+/,"");
};

String.prototype.rtrim = function() {
  return this.replace(/\s+$/,"");
};

String.prototype.normalize = function() {
	return this.replace(/^\s*|\s(?=\s)|\s*$/g, "");
};

String.prototype.startsWith = function (part) {
    return this.slice(0, part.length) == part;
};

String.prototype.endsWith = function (part) {
    return this.slice(-part.length) == part;
};

String.prototype.capFirst = function() {
  if(this.length == 1) {
    return this.toUpperCase();
  }
  else if(this.length > 0) {
    var regex = /^(\(|\[|"|')/;
    if(regex.test(this)) {
      return this.substring(0,2).toUpperCase() + this.substring(2);
    }
    else {
      return this.substring(0,1).toUpperCase() + this.substring(1);
    }
  }
  return null;
};

String.prototype.capWords = function() {
  var regexp = /\s/;
  var words = this.split(regexp);
  if(words.length == 1) {
    return words[0].capFirst();
  }
  else if(words.length > 1) {
    var result = '';
    for(var i = 0; i < words.length; i++) {
      if(words[i].capFirst() != null) {
        result += words[i].capFirst() + ' ';
      }
    }
    result.trim();
    return result;
  }
  return null;
};

String.prototype.truncateWords = function(number) {
	var words = this.split(/\s+/);
	if(words.length > number) {
		return words.slice(0, number).join(' ');
	}
	return words.join(' ');
};

String.prototype.truncateWordsWithHtml = function(number) {
	var tags = [];
	var truncation = this.truncateWords(number);
	var matches = truncation.match(/<[\/]?([^> ]+)[^>]*>/g);
	for(var i = 0; i < matches.length; i++) {
		var opening = matches[i].replace('/','');
		if(matches[i].indexOf('/') != -1 && tags.indexOf(opening) != -1) {
			tags.remove(opening);
		}
		else if(matches[i].indexOf('/') != -1) {
			continue;
		}
		else {
			tags.push(matches[i]);
		}
	}
	for(var j = 0; j < tags.length; j++) {
		truncation += tags[j].replace('<','</').replace(/(\s*)(\w+)=("[^<>"]*"|'[^<>']*'|\w+)/g,'');
	}
	return truncation;
};

String.prototype.stripHtml = function() {
	var content = this.replace(/<[\/]?([^> ]+)[^>]*>/g, '');
	content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/ig, '');
	content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/ig, '');
	content = content.replace(/<!--[\s\S]*?-->/g, '');
	content = content.replace('&nbsp;', ' ');
	content = content.replace('&amp;', '&');
	return content;
};

String.prototype.escapeHtml = function() {
	var content = this.replace(/"/g, '&quot;');
	content.replace(/&(?!\w+;)/g, '&amp;');
	content.replace(/>/g, '&gt;');
	content.replace(/</g, '&lt;');
	return content;
};

//toPhoneNumber() needs to be a part of some validation mechanism
String.prototype.toPhoneNumber = function() {
	try {
		return this.substring(0,3) + '-' + this.substring(3,6) + '-' + this.substring(6);
	}
	catch(e) {
		return this;
	}
};

String.isNullOrEmpty = function(val) {
	if(val == null || val.trim() === '') {
		return true;
	}
	return false;
};

Array.prototype.empty = function() {
	return this.splice(0, this.length);
};

Array.prototype.isEmpty = function() {
	if(this.length === 0) {
		return true;
	}
	return false;
};

Array.prototype.each = function(callback) {
	for(var i = 0; i < this.length; i++) {
		callback(this[i], i);
	}
};

Array.prototype.remove = function(item) {
	var index = this.indexOf(item);
	if(index != -1) {
		this.splice(index, 1);
	}
};

/*
 * There are frameworks that auto-generate JSON based on data schemas, but sometimes they
 * return data in inconsistent ways. For example, an array of strings might be returned
 * instead of an array of objects containing strings, etc. because the underlying data at the time
 * only cotains the string value, but when other data is present (in the database, etc.),
 * it will return the object array. Certain convience methods are necessary to force proper formatting.
 */
Array.prototype.toObjectArray = function(objName) {
	if (objName == null) {
		throw 'Property name must be provided for conversion.';
	}
	var items = this;
	if(typeof(items[0]) == 'string' || typeof(items[0]) == 'number' || typeof(items[0]) == 'boolean') {
	    for(var i = 0; i < items.length; i++) {
		    var val = items[i];
			items[i] = { };
			items[i][objName] = val;
		}
		return items;
	}
	else {
	  return this;
	}
};
