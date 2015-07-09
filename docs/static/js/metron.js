/*
@library: Metron
@namespace: Metron
@description: A JavaScript library designed to be lightweight that focuses on native type extensions and common view formatting.
*/
var Metron = { };

/*
@namespace: Metron.Class
@description: These methods are used for inheritance and for extending JavaScript class objects. All methods have corresponding global functions of the same name if those global functions do not already exist.
*/
Metron.Class = {
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

/*
 * Metron AJAX namespace and methods
 * It is better to use jQuery or some other library.
 * These AJAX methods are used internally by the template engine and probably
 * need to be private functions.
 */

Metron.AJAX = (function() {
	function buildXMLHttpRequest() {
		var xhr;
        if (window.XMLHttpRequest) {
            xhr = new XMLHttpRequest();
        }
        else if (window.ActiveXObject) {
            xhr = new ActiveXObject('Microsoft.XMLHTTP');
            try {
                xhr = new ActiveXObject("Msxml2.XMLHTTP");
            }
            catch (e) {
                try {
                    xhr = new ActiveXObject("Microsoft.XMLHTTP");
                } catch (ex) { }
            }
        }
        return xhr;
    }
	return {
		createHTTPClient: function (url, options) {
			options = options || { };
			if (typeof(options.method) !== 'undefined') {
				options.method = options.method.toUpperCase();
			}
			if (options.data && typeof (options.data) == 'object') {
				var pairs = [];
				for (var i in options.data) {
					if (typeof(options.data[i]) !== 'undefined') {
						pairs.push(i + '=' + encodeURI(options.data[i]));
					}
				}
				options.data = pairs.join('&');
			}
			var dataType;
			if (options.type && (options.type.trim().toLowerCase() === 'jsonp' || options.type.trim().toLowerCase() === 'json' || options.type.trim().toLowerCase() === 'xml')) {
				dataType = options.type.trim().toLowerCase();
			}
			if (document && dataType === 'jsonp') {
				var responseData;
				if (typeof(options.onsuccess) !== 'undefined') {
					var callback = 'jsonp' + Metron.GUID.newGuid().replace(/-/g, '_');
					var head = document.getElementsByTagName('head');
					window[callback] = function (data) {
						responseData = data;
					};
					var script = document.createElement('script');
					script.setAttribute('type', 'text/javascript');
					var done = false;
					script.onload = script.onreadystatechange = function () {
						if (!done && (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete')) {
							done = true;
							var transport = {
								"readyState": 4
							};
							var stringified = JSON.stringify(responseData);
							if (typeof(stringified) === 'undefined' || stringified === null || stringified.trim() === '') {
								transport.status = 500;
							}
							else {
								transport.status = 200;
								transport.responseJSON = responseData;
								transport.responseText = stringified;
							}
							options.onsuccess(transport);
							try {
								script.onload = script.onreadystatechange = null;
								if (head && script.parentNode) {
									head.removeChild(script);
								}
							}
							catch (e) { }
						}
					};
					script.setAttribute('src', url + '?' + options.data + '&callback=' + callback);
					if (head.length > 0) {
						head[0].appendChild(script);
					}
				}
				else {
					throw "Error: No 'onsuccess' callback specified.";
				}
			}
			else {
				var request = buildXMLHttpRequest();
				if (request) {
					request.open((typeof(options.method) !== 'undefined') ? options.method : 'GET', url, (typeof(options.async) !== 'undefined') ? options.async : true);
					request.onreadystatechange = function () {
						if (request.readyState === 4) {
							if (request.status === 200) {
								if (typeof(options.onsuccess) !== 'undefined') {
									if (dataType === 'json') {
										try {
											request.responseJSON = Metron.JSON.parse(request.responseText);
										}
										catch (e) { }
									}
									if (dataType === 'xml') {
										try {
											request.responseXML = Metron.XML.load(requeste.responseText);
										}
										catch (ex) { }
									}
									options.onsuccess(request);
								}
							}
							if (request.status === 404 || request.status === 500) {
								if (typeof(options.onfailure) !== 'undefined') {
									options.onfailure(request);
								}
							}
						}
					};
					if (typeof(options.method) !== 'undefined' && options.method == 'POST') {
						request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
					}
					request.send(options.data);
				}
			}
		}
	};
})();

/* Metron Web namespace and methods */

Metron.Web = {
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

Metron.Observer = (function () {
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

Metron.GUID = (function() {
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

/* Metron IO namespace and methods */

Metron.IO = { };

/* Metron File namespace and methods */

Metron.IO.File = {
	//Currently Windows-only
	read: function(file) {
		var output;
		try {
			var f = new ActiveXObject("Scripting.FileSystemObject");
			var otf = f.OpenTextFile(Metron.IO.File.formatUnixPath(file), 1);
			output = otf.ReadAll();
			otf.close();
		}
		catch(e) {
			throw 'Error: Unable to open file: ' + e;
		}
		return output;
	},
	formatUnixPath: function(file) {
		return file.replace(/\\/g,'/');
	},
	formatWindowsPath: function(file) {
		return file.replace(/\//g,'\\');
	}
};

/* Metron template namespace and methods */

Metron.Template = {
	load: function(file, values, caching) {
		var template;
		if(typeof(caching) === 'undefined') {
			caching = true;
		}
		if(caching) {
			if(Metron.Template.Cache.exists(file)) {
				template = Metron.Template.Cache.find(file);
			}
		}
		if(typeof(template) === 'undefined') {
			try {
				Metron.AJAX.createHTTPClient(file,
				{
					onsuccess: function(transport) {
						template = transport.responseText;
					},
					onfailure: function() {
						throw 'Error: Unable to load file: ' + file;
					},
					async: false,
					method: 'GET'
				});
			}
			catch(e) {
				template = Metron.IO.File.read(file);
			}
		}
		if(caching && !Metron.Template.Cache.exists(file)) {
			Metron.Template.Cache.insert(file, template);
		}
		for (var i in values) {
		    if (typeof(values[i]) !== 'undefined') {
				var placeholder = '{{' + i + '}}';
				template = template.replace(placeholder, values[i]);
			}
		}
		return template;
	}
};

/* Metron Template Cache namespace and methods */

Metron.Template.Cache = (function() {
	var collection = { };
	return {
		insert: function(path, contents) {
			collection[path] = contents;
		},
		remove: function(path) {
			collection[path] = null;
		},
		find: function(path) {
			return collection[path];
		},
		exists: function(path) {
			if(collection[path] !== null) {
				return true;
			}
			else {
				return false;
			}
		},
		precache: function(files) {
			for(var i = 0; i < files.length; i++) {
				if(!Metron.Template.Cache.exists(files[i])) {
					Metron.Template.load(files[i], null);
				}
			}
		}
	};
})();

/* Metron convenience methods */

if(typeof($m) === 'undefined') {
	$m = Metron;
	$m.loadTemplate = function (file, values) {
		return Metron.Template.load(file, values);
	};
	$m.querystring = function(key) {
		return Metron.Web.querystring.get(key);
	}
}

/* require() function for CommonJS protocol */
if(typeof(require) === 'undefined') {
	require = function() {
		//Add 'require' code here.
	};
}

/* If global functions for extends(), clone() and mixin() do not already exist, then it's OK to make the Metron ones global */
if(typeof(extend) === 'undefined') {
	extend = Metron.Class.extend;
}

if(typeof(clone) === 'undefined') {
	clone = Metron.Class.clone;
}

if(typeof(mixin) == 'undefined') {
	mixin = Metron.Class.mixin;
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
