// Höfundur: Arnar Þórðarson
// Dagsetning: 21/01/2018
// Skrá: MakeBelieve.js
// Library sem líkir eftir hluta af virkni JQuery

(function() {

	function MyElem(elem, length) {
		this.elem = elem;
		this.length = length;
	};

	// return a new MyElem object that contains a list of the elements selected 
	// by the css query string.
	var makeBelieve = function(query) {
		var nodelist = document.querySelectorAll(query);
		return new MyElem(nodelist, nodelist.length);
	};

	// Returns the parent elements of the elements in this that match the 
	// query string or if no string given
	MyElem.prototype.parent = function(query) {

		parents = [];
		for(var i = 0; i < this.length; i++) {
			parentElement = this.elem[i].parentElement;
			if(query) {
				if(parentElement.matches(query)) {
					if(!parents.includes(parentElement)) {
						parents.push(parentElement);
					}
				}
			}
			else{
				if(parentElement) {
					if(!parents.includes(parentElement)){
						parents.push(parentElement);
					}
				}
			}
		}
		return new MyElem(parents, parents.length);

	};

	// returns the grandparents of the elements in this that match the 
	// query string or if no string given
	MyElem.prototype.grandParent = function(query) {
		grandParents = [];

		for(var i = 0; i < this.length; i++) {
			if(this.elem[i].parentElement){
				if(this.elem[i].parentElement.parentElement) {

					grandParentElement = this.elem[i].parentElement.parentElement;
					if (query) {
						if(grandParentElement.matches(query)) {

							if(!grandParents.includes(grandParentElement)) {
								grandParents.push(grandParentElement);
							}
						}
					}
					else {
						if(grandParentElement) {
							if(!grandParents.includes(grandParentElement)) {
								grandParents.push(grandParentElement);
							}
						}
					}
				}
			}	
		}
		return new MyElem(grandParents, grandParents.length);
	};

	// returns first ancestor of the elements in this that match the 
	// query string or if no string given
	MyElem.prototype.ancestor = function(query) {
		ancestors = [];

		for(var element of this.elem) {
			if(element.parentElement) {
				// check if the element has an ancestor at all
				if(element.parentElement.parentElement) {
					if(element.parentElement.parentElement.parentElement){
						var ancestor = element.parentElement.parentElement.parentElement;
						if(query) {
							// get the first ancestor that matches the query string
							while(!ancestor.matches(query) && ancestor.parentElement) {
								ancestor = ancestor.parentElement;
							}
							// if that ancestor is not already in the ancestors list, add it to the list.
							if(ancestor.matches(query)) {
								if(!ancestors.includes(ancestor)) {
									ancestors.push(ancestor);
								}
							}
						}
						else {
							if(!ancestors.includes(ancestor)) {
								ancestors.push(ancestor);
							}
						}
					}
				}
			}
		}
		return new MyElem(ancestors, ancestors.length);
	};

	// insert text into the elements in this.
	MyElem.prototype.insertText = function(text) {
		for(var element of this.elem) {
			element.textContent = text;
		}	
	};

	// attach an onClick event to the elements in this that will execute 
	// the func function when triggered
	MyElem.prototype.onClick = function(func) {

		for(var element of this.elem) {
			element.addEventListener('click', func);
		}
	};

	// append an element to the elements in this as it's last child
	MyElem.prototype.append = function(newElement) {
		if(typeof newElement == "string") {
			for(var element of this.elem) {
				element.innerHTML += newElement;
			}
		}
		else {
			for(var element of this.elem) {
				element.appendChild(newElement);
			}
		}
	};

	// prepend an element to the elements in this as it's first child
	MyElem.prototype.prepend = function(newElement) {
		if(typeof newElement == "string") {
			for(var element of this.elem) {
				element.innerHTML = newElement + element.innerHTML;
			}
		}
		else {
			for(var element of this.elem) {
				if(element.childElementCount == 0) {
					element.appendChild(newElement);
				}
				else {
					element.insertBefore(newElement, element.firstElementChild);
				}
			}
		}
	};

	// delete the elements in this
	MyElem.prototype.delete = function() {

		for(var element of this.elem) {
			if(element.parentElement) {
				element.parentElement.removeChild(element);
			}
		}
	};

	// perform an ajax http request
	makeBelieve.ajax = function(options) {
		var tempMethod = options.method;
		var method;
		// get method type or provide a default 'GET' method
		if(typeof tempMethod === 'string') {
			tempMethod = tempMethod.toUpperCase();
			if(tempMethod === 'POST' || tempMethod === 'PUT' || tempMethod === 'OPTIONS' ||
				tempMethod === 'HEAD' || tempMethod === 'DELETE') {
				method = tempMethod;
			}
		}
		method = method || 'GET';

		// set the timeout of the request in milliseconds, defaulting to 0 (no timeout)
		var timeout = options.timeout;
		if(timeout) {
			if(typeof timeout === 'string') {
				timeout = parseInt(timeout);
				
			}
		}	
		if (typeof timeout === 'number') {
			// NaN and Infinity are of type 'number' so we set the default value.
			if(timeout === NaN || timeout === Infinity || timeout < 0) {
				timeout = 0;
			}
		}
		else {
			timeout = 0;
		}
		
		var request = new XMLHttpRequest();
		request.open(method, options.url);
		request.timeout = timeout;

		// set request headers
		if(options.headers) {
			for(var header of options.headers) {
				request.setRequestHeader(Object.keys(header)[0], header[Object.keys(header)]);
			}
		}
		else {
			options.headers = {};
		}
		request.onreadystatechange = function() {
			if (request.readyState === XMLHttpRequest.DONE ) {
				// call the success function if we get a success status code.
				if(request.status >= 200 && request.status < 300) {
					if(typeof options.success === 'function') {
						options.success(request.responseText);
					}
					else {
						options.success = null;
					}
					
				}
				// call fail function if response is a client or server error status code.
				else if(request.status >= 400) {
					if(typeof options.fail === 'function') {
						options.fail(request.responseText);
					}
					else {
						options.fail = null;
					}
				}
			}
		};
		// provide some feedback if the request timed out.
		request.ontimeout = function(evt) {
			console.log("request timed out.");
		}

		if(typeof options.beforeSend === 'function') {
			options.beforeSend(request);
		}
		else {
			options.beforeSend = null;
		}
		if(!options.data) {
			options.data = {};
		}
		request.send(JSON.stringify(options.data));
	};

	// set the css atribute to the value given on all elements in this.
	MyElem.prototype.css = function(attribute, value) {

		for(var element of this.elem) {
			element.style[attribute] = value;
		}
	};

	// toggle a class on the elements in this.
	MyElem.prototype.toggleClass = function(newClass) {

		for(var element of this.elem) {
			element.classList.toggle(newClass);
		}
	};

	// add a sumbit event listener to the elements in this.
	MyElem.prototype.onSubmit = function(func) {

		for(var element of this.elem) {
			element.addEventListener('submit', func);		
		}
	};

	// add an event lister for the onInput event to the elements in this.
	MyElem.prototype.onInput = function(func) {

		for(var element of this.elem) {
			element.addEventListener('input', func);		
		}
	};

	window.__ = makeBelieve;
})();
