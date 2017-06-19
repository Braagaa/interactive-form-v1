const form = document.querySelector('form');          //These are all global elemental nodes found on the form
const basicInfo = document.querySelector('fieldset');
const name = document.getElementById('name');
const email = document.getElementById('mail');
const title = document.getElementById('title');
const design = document.getElementById('design');
const color = document.getElementById('color');
const activities = document.querySelector('.activities');
const payment = document.getElementById('payment');
const creditcard = document.getElementById('credit-card');
const paypal = creditcard.nextElementSibling;
const bitcoin = paypal.nextElementSibling;

//jQuery Extension Functions
$.fn.extend({
	tap: function(func) {  //tap was mainly used to debug and console.log results to the console. It was mainly used to execute side-effects.
		func(this.get());
		return this;
	},
	tail: function() {  //tail returns a jQuery object where all but its first element in its collection is returned
		return this.pushStack(this.get().slice(1, this.get().length));
	},
	defaultEffect: function(func) {  //defaultEffect was mainly used as an else block in this program to keep chainging going
		if (jQuery.isEmptyObject(this.get())) { //defaultEffect executes a callback function if the collection is empty and then returns the same jQuery obj back
			func(this.get());
		}
		return this;
	},
	every: function(func) {  //every uses JavaScripts native Array.every function where it tests every item in a collection with a callback and tests to see if any of the items are faulty where it will comback as false.
		return this.get().every(func);
	},
	defaultToOrEmpty: function(selector) {  //defaultToOrEmpty takes a selector and creates a new jQuery object if its current collection is empty. If it is not empty it returns a empty jQuery object.
		if (jQuery.isEmptyObject(this.get())) {  //defaultToOrEmpty was mainly used again as a else block to keep the jQuery chain going
			return $(selector);
		}
		return $([]);
	},
	zipWith: function(func, list) {//zipWith takes a callback function and another array as arguments and applies the function to its jQuery list and the second list to each equally-positioned pair in the lists. Then returns the jQuery Object with the results 
		let arr = [];
		let jArr = this.get();
		let i = -1;
		let len = jArr.length;
		if (list.length === len) {
			while (++i < len) {
				arr[i] = func(jArr[i], list[i]);
			}
		}
		return this.pushStack(arr);
	},
	reduce: function(func, inital) {  //reduce is very similar to JavaScripts native Array.prototype.reduce.
		let jObject = this.get();
		let len = jObject.length;
		let i = -1;
		while(++i < len) {
			inital = func(i, jObject[i], inital);
		}
		if (Array.isArray(inital)) {
			return this.pushStack(inital);
		}
		return this.pushStack([inital]);
	}
});

//Helper Functions
const valueIsOther = elm => elm.value === 'other';  //predicate functions
const valueIs = val => (i, elm) => elm.value === val;
const valueIsNot = val => (i, elm) => elm.value !== val;
const itIs = val1 => (i, val2) => val1 === val2; 
const isCssValueIs = (prop, value) => (i, elm) => elm.style[prop] === value;
const lookUpTheme = theme => (i, elm) => elm.theme === theme;
const lookUpPayment = payment => (i, elm) => elm.payment === payment;
const notChecked = (i, elm) => elm.checked === false;
const isDisabled = (i, elm) => elm.disabled === true;
const containsTheme = theme => (i, elm) => elm.text.includes(theme);
const includes = searchStr => (i, mainStr) => mainStr.textContent.includes(searchStr);

const regTheme = (i, elm) => /-(.*)/g.exec(elm.text);  //regular expression functions
const replaceThemeText = (i, str) => str.replace(/\((.*)/g, '');
const getPrice = (i, str) => /\$\d+/g.exec(str);
const getTimeActivity = (i, str) => /— .*,/g.exec(str);
const regEmail = (i, elm) => /.+@.+\..+/g.test(elm.value);
const regCreditCard = (i, elm) => /^\d{13,16}$/g.test(elm.value)
const regZip = (i, elm) => /^\d{5}(?:[-\s]\d{4})?$/.test(elm.value);
const regCvv = (i, elm) => /^\d{3}$/.test(elm.value);

const takeOffFirst = (i, str) => str.slice(1, str.length); //string functions
const trim = (i, string) => string.trim();

const getProp = prop => (i, elm) => elm[prop];  //getters setters and other functions
const setProp = (prop, value) => (i, elm) => elm[prop] = value;

const focus = elm => elm.focus();
const addNumbers = (i, num2, num1) => num1 + num2; 



//Main Functions

const getTheme = function(elm) {  //gets the design theme
	return $(elm).children()          //gets the elements children
				 .filter(':selected') //finds the selected ones
				 .map(regTheme)       //applies the regular expression to get the theme as a string
				 .last()              //gets the last one of the results
				 .map(trim)           //trims the string
				 .get(0);             //returns single result back
}

const createElement = function(name, props) { //creates an element with its associated properties
	let node = document.createElement(name);
	$(node).prop(props);
	return node;
}

const applyLabelToggle = function(strElement) { //curry function that creates a label and hides it
	return function(i, elm) {
		return $(elm).after(strElement).next().toggle();
	}
}

const assignTheme = function(i, theme) {
	return $(color).children()                           //gets each colors select elements
				   .filter(containsTheme(theme))         //selects the one that pass the theme regular expression
				   .each((i, elm) => elm.theme = theme); //assigns them a theme to its new theme property
}

const sameTimeActivities = function(i, time) {
	return $('.activities label').filter(includes(time)).get();  //gets all the activities, selects the ones that include same time, returns the selected list back
}

const timeActivities = function(predicate1, predicate2, effect) {
	return (i, elm) => $(elm).filter(predicate1)                     //applies the predicate function the element
							 .parent()                               //if it passes, get its parent
						     .map((i, elm) => elm.textContent)       //returns its textContent
						     .map(getTimeActivity)                   //gets the date and time as a string from a regex function
							 .map(sameTimeActivities)                //returns the label elements that contain that selected time
						     .map((i, elm) => elm.firstElementChild) //get its first child
							 .filter(predicate2)
							 .each(effect)                           //if it passes the second predicate execute the desired effect
}

const wrongMessage = props => (i, elm) => $(elm).prop(props)                                     //gives an elements its properties and gives its text a red color
												.css({color: '#A83458', fontWeight: 'bold'});
const correctMessage = props => (i, elm) => $(elm).prop(props)
												  .css({color: '#53a318', fontWeight: 'normal'});//same as above function but instead its text is a green color

const textInputStatus = function(pred, effect, status) {  //was used for elements that had a text input and its associated label : name, email
	return function(i, elm) {
		return $(elm).filter(pred)
				.prop('validated', status) //if predicate is passed gives the element its validated property a true or false
				.prev()                    //gets its previous sibling
				.each(effect)              //applies a desired function to it
				.get();                    //return that sibling back
	}
}

const validateTShirt = function(i, elm) {
	return $(elm).not(valueIs('Select Theme'))                          //continue if element's value is not 'Select Theme'
				 .prop('validated', true)                               //change the elements validated to true
				 .parent()                                              //gets its parent
				 .siblings('.shirt-status')                             //find its siblings with .shirt-status (label)
				 .show()                                                //display it
				 .each(correctMessage({textContent: 'Shirt: Cleared'})) //makes it a correct message
				 .defaultEffect(() => {                 //the is anagolous to an else block if predicate failed, it is just the opposite of the above
					 $(elm).prop('validated', false)
						   .parent()
						   .siblings('.shirt-status')
						   .show()
						   .each(wrongMessage({textContent: "Don't forget to pick a T-Shirt"}))
				 });
}

const activitiesMessage = function(valid, message) {
	return function(i, elm) {
		return $(elm).first()                     //get the elements first item in its collection
				 .closest('.activities')          //finds its ancestor that has class .activities
				 .prop('validated', valid)        //change its validated prop to desired value
			     .children('.activities-status')  //find its label child
				 .show()                          //displays it
				 .each(message);                  //make it a correct or wrong message
	}
}

const isCreditcardInfoSuccessful = function(i,elm) {              //determines if all creditcard information is validated
	return $('.credit-card-help label').map(getProp('validated'))
		.every(val => val);
}

const validatePayment = function(i, elm) {
	return $(elm).not(valueIs('select_method'))                         //continue if elements value is not 'select_method'
			   .prop('validated', true)                                 //change its validated property to true
		       .siblings('.payment-status')                             //gets its label sibling
			   .show()                                                  //display it
			   .each(correctMessage({textContent: 'Payment: Cleared'})) //make the label a correct message
			   .defaultEffect(() => {               //else block does opposite of above
			       $(elm).prop('validated', false)
					   .show()
					   .siblings('.payment-status')
				       .each(wrongMessage({textContent: 'Please select a payment method'}))
			   });
}

const creditcardValidation = function(reg, wrong, correct) {
	return function(i, elm) {
		return $(elm).not(reg)                                          //continue if regex function does not fail
			       .map((i, elm) => $('.' + elm.id + '-message').get()) //gets a label element based off of the previous elements id
				   .prop('validated', false)                            //changes label validated to false
				   .each(wrongMessage({textContent: wrong}))            //makes a label a wrong message
				   .defaultToOrEmpty(elm)                              //else block if predicate failed does opposite to above
				   .map((i, elm) => $('.' + elm.id + '-message').get())
				   .prop('validated', true)
				   .each(correctMessage({textContent: correct}));
	}
}

const creditcardInfoValidation = function(i, elm) {
	return $('#payment')
		.not(isCreditcardInfoSuccessful)     //continue if any of the 3 credite card information input is unsuccessful
		.prop('validated', false)            //make the #payment element validated prop to false
		.prevAll('.payment-status')          //get the .payment-status label
		.each(wrongMessage({textContent: 'Make sure you fill out your credit card information'}))  //make the label a wrong message
		.defaultToOrEmpty('#payment')       //else block if predicate fails, does opposite effect
		.prop('validated', true)
		.prevAll('.payment-status')
		.each(correctMessage({textContent: 'Payment: Cleared'}));
}

const fullCreditcardValidation = function(i, elm) { //combines validatePayment and creditcardInfoValidation validation functions to completely validated the credit card information
	return $(elm)
		.each(validatePayment)
		.filter(valueIs('credit card'))
		.each(creditcardInfoValidation)
		.get();
}

const submitValidation = function(i, elm, arr) {  //reduce function to appropriately choose and collect the correct validation functions, when any of the the key elements have its validation property to false
	let actions = {  //actions is an object that contains methods and is replaced with if/elseif logic with the help of the elements id
		name: textInputStatus(valueIs(''), wrongMessage({textContent: 'Name: (please provide your name)'}), false),
		mail: textInputStatus(valueIs(''), wrongMessage({textContent: 'Email: (please provide a valid email)'}), false),
		design: validateTShirt,
		activities: activitiesMessage(false, wrongMessage({textContent: 'Please select an Activity'})),
		payment: fullCreditcardValidation
	};
	arr.push([elm, actions[elm.id || elm.className], i]);
	return arr;
}
										  
//Initialization			
focus(name);  //focus the name input

$('form').prop('noValidate', true); //turns off html5's in-built validation

$('#other-title').prop('placeholder', 'Your Job Role').toggle();  //changes other input's placeholder and hides the input

$(design).children()   //gets the #design element's select children and assigns them an appropriate theme with a new property called .theme
		 .map(regTheme) //it will either be assigned a theme of JS Puns or I (heart) JS
		 .tail()
		 .filter((i, elm) => i % 2 === 0)
		 .map(trim)
		 .each(assignTheme);

$('#colors-js-puns').toggle();       //hides the colors selector
$(color).children()                  //gets the color select children
		.map((i, elm) => elm.text)   //returns its text from each children
		.map(replaceThemeText)       //replaces string to take out the JS Puns or I (heart) JS
		.map(trim)                   //trims the string
		.zipWith((text, elm) => elm.text = text, $(color).children());  //reassigns new string to the color children (select elements)

$('.shirt legend').each(applyLabelToggle('<label class="shirt-status"></label>'));  //create label and hides it

$('.activities legend').each(applyLabelToggle('<label class="activities-status"></label>'));
					  
$(activities).append(createElement('h3', {textContent: 'Total: $0', id: 'price'})) //appends the price tag to the .activites and then hides it
			 .map((i, elm) => elm.lastElementChild)
			 .toggle();

const disableActivities = timeActivities(':checked', notChecked, (i, elm) => $(elm).prop('disabled', true).parent().addClass('grayout'));     //curry functions, loading their predefined parameters used for disabling and enabling checkboxes
const enableActivities = timeActivities(notChecked, isDisabled, (i, elm) => $(elm).prop('disabled', false).parent().removeClass('grayout'));

$(paypal).toggle().next().toggle();               //hides the paypal and bitcoin information
$('fieldset:last-of-type legend')                                                             //gets the last legend on the page
	.after('<label class="payment-status"></label>')                                          //appends a label after the legend              
	.siblings('.payment-status')                                                              //targets the label
	.each(wrongMessage({textContent: 'Make sure you fill out your credit card information'})) //gives a wrong message
	.siblings('#payment')                                                                     //targets the #payment
	.each(setProp('value', 'credit card'))                                                    //change its a value to credit card
	.children()                                                                               //target the #payment select elements
	.map(getProp('value'))                                                                    //get all of the values
	.tail()                                                                                   //keep all the values except for the first one
	.zipWith((value, elm) => elm.payment = value, [creditcard, paypal, bitcoin]);             //assigns those payment values as a value to a new property called payment back to the three payment options

$([name, email, design, activities, payment])    //give the following elements an inital validated property of false
	.prop('validated', false);

$('.credit-card').prepend((i) => {                                                                                                        //prepends a list to the credit card section of the page
	return '<ul class="credit-card-help">' +
		       '<li><label class="cc-num-message">Make sure the credit card number is 13 - 16 digits long (only numbers)</label></li>' +
			   '<li><label class="zip-message">Please provide a proper zip code eg: 12345, 12345-6789, or 12345 1234</label></li>' +
			   '<li><label class="cvv-message">CVV is a 3 digit number found behind your credit card</label></li>' +
		   '</ul>'
}).find('li label')                                                                                                                      //targets all the labels in the list
  .prop('validated', false)                                                                                                              //gives them an inital validation property of false
  .zipWith((label, message) => wrongMessage(message)(0, label),                                                                          //applies the wrongMessage function to the labels making them a wrong message
		   [{textContent: 'Make sure the credit card number is 13 - 16 digits long (only numbers)'}, 
			{textContent: 'Please provide a proper zip code eg: 12345, 12345-6789, or 12345 1234'},
			{textContent: 'CVV is a 3 digit number found behind your credit card'}]);

//Events
$([name, email]).on('blur', function(event) {  //when you lose focus it checks to see if the name or email inputs values are empty and if they are display a message 
	let actions = {  //replaces if/else logic
		name: textInputStatus(valueIs(''), wrongMessage({textContent: 'Name: (please provide your name)'}), false),
		mail: textInputStatus(valueIs(''), wrongMessage({textContent: 'Email: (please provide a valid email)'}), false)
	};
	
	$(event.target).each(actions[event.target.id]);
})

$(name).on('input', function(event) { //when any input is in the name input display a correct message
	$(event.target).each(textInputStatus(valueIsNot(''), correctMessage({textContent: 'Name: Cleared'}), true));
});

$(email).on('input', function(event) {  //same as above but with extra validation in the defaultEffect to validate the email if it is not empty
	$(event.target)
		.map(textInputStatus(regEmail, correctMessage({textContent: 'Email: Cleared'}), true))
		.defaultEffect(() => $(email).prev().each(wrongMessage({textContent: 'Please enter a valid email address: eg. dave@teamtreehouse.com'}), false));
});

$(title).on('change', function(event) {
	$(event.target).filter(valueIs('other')) //continue if job role value is other
		.next()                              //other input
		.toggle()                            //display it
		.defaultToOrEmpty('#other-title')    //if value is not other retrieve #other-title
		.filter(isCssValueIs('display', '')) //check if #other-title is displayed
		.toggle()                            //hide it
});

$(design).on('change', function(event) {
	let theme = getTheme(event.target);    //gets theme associated with the select element
	
	$(event.target).each(validateTShirt)     //validates the selected item
		.not(valueIs('Select Theme'))        //continue if selected element is not 'Select Theme'
		.map((i, elm) => color)              //get color element
		.children()                          //get all select elements
		.show()                              //display them
		.not(lookUpTheme(theme))             //get list of select element that dont have the theme
		.toggle()                            //hide them
		.addBack()                           //go back a stack to the children list
		.filter(lookUpTheme(theme))          //get the select elements that have the theme
		.first()                             //get the first one on the list
		.each((i, elm) => $(color).val(elm.value).parent().css('display', '')) //run desired effect
		.defaultEffect(() => $('#colors-js-puns').toggle());  //if there is select elements with the theme run this instead
});

$('.activities input').on('change', function(event) {
	$('.activities input')            														 //get all checkboxes in activites
		.filter(':checked')           														 //select all the checked ones
	    .each(activitiesMessage(true, correctMessage({textContent: 'Activites: Cleared'})))  //show correct message
	    .map((i, elm) => elm.parentElement.textContent)                                      //get textContent of their label parent
	    .map(getPrice)                                                                       //extract price as a string
	    .map(takeOffFirst)                                                                   //take off dollar sign
	    .map((i, str) => parseInt(str, 10))                                                  //make string into a number
	    .reduce(addNumbers, 0)                                                               //add all the numbers up to a total
	    .not((i, num) => num === 0)                                                          //continue if number is not zero
	    .each((i, price) => $('#price').css('display', '').text('Total $' + price))          //display price
	    .defaultEffect(() => $('#price').toggle())                                           //if number is 0 hide price and display a wrong message
	    .defaultEffect(() => $(event.target).each(activitiesMessage(false, wrongMessage({textContent: 'Please select an Activity'}))));  
	
	$(event.target).filter(':checked')     //this is responsible for disabling and enabling checkboxes based on their time and date
				   .each(disableActivities)
				   .defaultEffect(() => $(event.target).each(enableActivities));
});

$(payment).on('change', function(event) {
	$([creditcard, paypal, bitcoin]).hide()                                    //hide credit card, paypal, and bitcoin sections
								    .filter(lookUpPayment(event.target.value)) //find which section is selected
									.toggle();                                 //display section
	$(payment).each(fullCreditcardValidation);    //handles validation
});

$('#cc-num, #zip, #cvv').on('blur', function(event) {
	$(event.target).filter(valueIs(''))   //continue if input has no value
		.prev()                           //get its label
		.addClass('mistake')              //give it .mistake
		.defaultEffect(() => $(event.target).prev().removeClass('mistake')); //take off .mistake if there is a value
})

$('#cc-num, #zip, #cvv').on('input', function(event) {
	let actions = {
		'cc-num': creditcardValidation(regCreditCard, 'Make sure the credit card number is 16 digits long (only numbers)', 'Credit Card Number: Clear'),
		'zip': creditcardValidation(regZip, 'Please provide a proper zip code eg: 12345, 12345-6789, or 12345 1234', 'Zip Code: Clear'),
		'cvv': creditcardValidation(regCvv, 'CVV is a 3 digit number found behind your credit card', 'CVV Number: Clear')
	};
	
	$(event.target)
		.each(actions[event.target.id])  //run an action method based off of inputs id for validation
		.each(creditcardInfoValidation)  //further validation and displaying other parts (its parent label)
});

$(form).on('submit',function(event) {
	$([name, email, design, activities, payment])  //get all required elements needed for validation
		.filter((i, elm) => !elm.validated)        //select the elements that have a false validated property
		.reduce(submitValidation, [])              //abstract information (id, index and associated validation function for each element)
		.each(() => event.preventDefault())        //preventDefault
		.each((i, [elm, validation, index]) => validation(index, elm))  //run the validation
});