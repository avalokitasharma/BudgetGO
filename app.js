var budgetController = (function(){

	var Expense  = function(id, description, value){
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	}

	Expense.prototype.calcPercentage = function(totalInc){
		if(totalInc > 0){
			this.percentage = Math.round((this.value / totalInc) * 100);
		} else {
			this.percentage = -1;
		}
	}
	Expense.prototype.getPercentage = function(){
		return this.percentage;
	}
	var Income  = function(id, description, value){
		this.id = id;
		this.description = description;
		this.value = value;
	}

	var data = {
		allItems:{
			inc:[],
			exp:[]
		},
		totals:{
			inc:0,
			exp:0
		},
		budget:0,
		percentage: -1
	};

	var calculateTotal = function(type){
		var sum = 0;
		data.allItems[type].forEach(function(item){
			sum = sum + item.value;
		});
		data.totals[type] = sum;
	}

	return {
		addItem: function(type, des, val){
			var newItem, ID;
			if(data.allItems[type].length > 0){
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;

			} else {
				ID = 0;
			}

			if(type === 'exp'){
				newItem = new Expense(ID, des, val);
			} else if(type === 'inc'){
				newItem = new Income(ID, des, val);
			}
			//push it into data structure
			data.allItems[type].push(newItem);
			return newItem;
		},
		deleteItem: function(type, id){
			var ids, index;

			ids = data.allItems[type].map(function(item){
				return item.id;
			});

			index = ids.indexOf(id);

			if(index !== -1){
				data.allItems[type].splice(index, 1);
			}

		},
		calculateBudget: function(){

			//calculate totals - inc and exp
			calculateTotal('inc');
			calculateTotal('exp');

			//budget = inc-exp
			data.budget = data.totals.inc - data.totals.exp;

			//expense percentage
			if(data.totals.inc > 0){
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			} else {
				data.percentage = -1;
			}
		},
		calculatePercentage: function(){
			//calc percentage
			data.allItems.exp.forEach(function(item){
				item.calcPercentage(data.totals.inc);
			});
		},
		getPercentage: function(){
			// return percentage
			var percentages = data.allItems.exp.map(function(item){
				return item.getPercentage();
			});
			return percentages;
		},
		getBudget: function(){
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			}
		},
		testing: function(){
			console.log(data);
		}
	}

})();

var UIController = (function(){
	var DOMstrings = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn',
		incomeContainer: '.income__list',
		expensesContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expenseLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container:'.container',
		expPercLabel:'.item__percentage',
		dateLabel: '.budget__title--month'
	};

	var formatNumber = function(num, type){
		var splitNum, intg, dec, sign;
		num = Math.abs(num);
		num = num.toFixed(2);
		splitNum = num.split('.');
		intg = splitNum[0];
		dec = splitNum[1];

		if(intg.length > 3){
			intg = intg.substr(0,intg.length - 3) + ',' + intg.substr(intg.length-3,3);
		}

		return (type == 'exp'? sign = '-': sign = '+') + ' ' + intg + '.' + dec;
	};

	var nodeListForeach = function(list, callback){
		for(var i=0; i<list.length; i++){
			callback(list[i], i);
		}
	};

	return {
		getInput: function(){
			return {
				type: document.querySelector(DOMstrings.inputType).value,
				description: document.querySelector(DOMstrings.inputDescription).value,
				value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
			};
		},
		getDOMstrings: function(){
			return DOMstrings;
		},
		displayDate: function(){
			var now, month, months, year;
			months = ['January', 'February', 'March', 'April', 'May', 'June',
					  'July', 'August', 'September', 'October', 'November', 'December'];
			now = new Date();
			month = now.getMonth();
			year = now.getFullYear();

			document.querySelector(DOMstrings.dateLabel).textContent = months[month] +' '+year;
		},
		changedType: function(){
			var fields = document.querySelectorAll(
				DOMstrings.inputType + ',' +
				DOMstrings.inputDescription + ',' +
				DOMstrings.inputValue);

			nodeListForeach(fields, function(cur){
				cur.classList.toggle('red-focus');
			});

			document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
		},
		addListItem: function(obj, type){
			var html, newHtml, element;
			//create placeholder data
			if(type === 'inc'){
				element = DOMstrings.incomeContainer;
				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix">'
               			+
                        '<div class="item__value">%value%</div><div class="item__delete">'+
                        
                       '<button class="item__delete--btn"><i class="ion-ios-close-outline">'
                        +
                        '</i>'+'</button>'+
                        '</div>'+'</div>'+
                        '</div>';

			} else if (type === 'exp'){
				element = DOMstrings.expensesContainer;
				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix">'
               			+
                        '<div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete">'+
                        
                       '<button class="item__delete--btn"><i class="ion-ios-close-outline">'
                        +
                        '</i>'+'</button>'+
                        '</div>'+'</div>'+
                        '</div>';

			}
			//replace placeholder with actual data
			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%', obj.description);
			newHtml = newHtml.replace('%value%', formatNumber(obj.value));

			//insert html in DOM 
			document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);

		},
		deleteListItem: function(itemID){

			ele = document.getElementById(itemID);
			ele.parentNode.removeChild(ele);
		},
		clearFields: function(){
			var fields, fieldArr;

			fields = document.querySelectorAll(DOMstrings.inputDescription +', ' + DOMstrings.inputValue);

			fieldArr = Array.prototype.slice.call(fields);

			fieldArr.forEach(function(current, index, array){
				current.value = '';
			});
			fieldArr[0].focus();
		},
		displayBudget: function(obj){
			var type;
			(obj.budget > 0)? type = 'inc':type = 'exp';

			document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type);
			document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
			document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
			if(obj.percentage > 0){
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
			} else{
				document.querySelector(DOMstrings.percentageLabel).textContent = '--';

			}
		},
		displayPercentage: function(percentages){
			var fields = document.querySelectorAll(DOMstrings.expPercLabel);

			nodeListForeach(fields, function(current, index){
				if(percentages[index] > 0){
					current.textContent = percentages[index] + '%';
				} else {
					current.textContent = '--';
				}
			});
		}
	};

})();


var controller = (function(budgetctrl, UIctrl){

	var setUpEventListeners = function(){

		var DOM = UIctrl.getDOMstrings();

		document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);

		document.addEventListener('keypress',function(event){
			if(event.keyCode === 13 || event.which === 13){
				ctrlAddItem();
			}
		});

		document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
		document.querySelector(DOM.inputType).addEventListener('change', UIctrl.changedType);
	};

	var updateBudget = function(){

		//1. calculate the budget
		budgetctrl.calculateBudget();

		//2. return the budget
		var budget = budgetctrl.getBudget();
		
		//3. display budget on UI
		UIctrl.displayBudget(budget);
	}

	var updatePercentage = function(){
		//calculate percentages
		budgetctrl.calculatePercentage();

		//read percentages from budget ctrl
		var allPercent = budgetctrl.getPercentage();

		//display percentages on UI
		UIctrl.displayPercentage(allPercent);

	}

	var ctrlAddItem = function(){

		var input, newItem;

		//1. get the field input data
		input = UIctrl.getInput();

		if(input.description !== "" && !isNaN(input.value) && input.value > 0){

			//2. add the item to budget ctrl 
			newItem = budgetctrl.addItem(input.type,input.description, input.value);

			//3. add the item to the UI
			UIctrl.addListItem(newItem, input.type);

			// clear the fields
			UIctrl.clearFields();	

			updateBudget();
			updatePercentage();
		}
	};

	var ctrlDeleteItem = function(event){

		var itemID, splitID, type, id;
		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

		splitID = itemID.split('-');
		type = splitID[0];
		id = parseInt(splitID[1]);

		// delete item from data structure
		budgetctrl.deleteItem(type, id);

		// delete item from UI
		UIctrl.deleteListItem(itemID);

		//update and show budget
		updateBudget();
		updatePercentage();
	}

	return {
		init: function(){
			UIctrl.displayDate();
			UIctrl.displayBudget({
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: -1
			})
			setUpEventListeners();
		}
	};

})(budgetController,UIController );

controller.init();