// budget controller
var budgetController = (function(){
    
    var _Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    _Expense.prototype.calculatePercentage = function(totalIncome){
        if(totalIncome > 0)
            this.percentage = Math.round(this.value/totalIncome*100);
        else
            this.percentage = -1
    }

    _Expense.prototype.getPercentage = function(){
        return this.percentage;
    }

    var _Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var calculateTotal = function(type){
        var sum = 0;
        
        data.allItems[type].forEach(function(e){
            sum+=e.value;
        });

        data.totals[type] = sum;
    }

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1, // -1 means that it doesn't exist at this point
    }

    var addItem = function(type, des, val){
        var newItem, id;

        // create new id (id starts from 1)
        if(data.allItems[type].length > 0)
            id = data.allItems[type][data.allItems[type].length-1].id + 1;
        else
            id = 0;

        // create new item based on 'inc' or 'exp' type
        if(type === 'exp'){
            newItem = new _Expense(id, des, val);
        }
        else if(type === 'inc'){
            newItem = new _Income(id, des, val);
        }

        // push the new item into our data structure
        data.allItems[type].push(newItem);

        // return the new element
        return newItem;

    }

    var deleteItemFromDataStructure = function(type, id){
        var arrOfIds, index;

        arrOfIds = data.allItems[type].map(function(current){
            return current.id;
        });

        index = arrOfIds.indexOf(id);

        if(index !== -1){
            data.allItems[type].splice(index, 1);
        }
    }

    var calculateBudget = function(){

        // calculate total income and expenses
        calculateTotal('exp');
        calculateTotal('inc');

        // calculate the budget: (total income) - (total expenses)
        data.budget = data.totals.inc - data.totals.exp;

        // calculate the percentage of income that we've spent
        if(data.totals.inc > 0){
            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
        } else {
            data.percentage = -1;
        }

    }


    var calculatePercentages = function(){
        data.allItems.exp.forEach(function(e){
            e.calculatePercentage(data.totals.inc);
        });
    }

    var getPercentages = function(){
        var allPercentages = data.allItems.exp.map(function(e){
            return e.percentage;
        });
        return allPercentages;
    }


    var getBudget = function(){
        return {
            budget: data.budget,
            totalInc: data.totals.inc,
            totalExp: data.totals.exp,
            percentage: data.percentage,
        };
    };

    return {
        
        addItem : addItem,
        
        calculateBudget: calculateBudget,
        
        getBudget: getBudget,
        
        deleteItemFromDataStructure: deleteItemFromDataStructure,
        
        calculatePercentages: calculatePercentages,

        getPercentages: getPercentages,
        
        test: function(){
            console.log(data);
        }

    }
})();
























// UI controller
var UIController = (function(){
    
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        totalIncomeLabel: '.budget__income--value',
        totalExpensesLabel: '.budget__expenses--value',
        precentageLabel: '.budget__expenses--percentage',
        listsContainer: '.lists-container',
        expensesPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month',
    }

    var getInput = function(){
        return {
            type: document.querySelector(DOMstrings.inputType).value, // will be 'inc' or 'exp',
            description: document.querySelector(DOMstrings.inputDescription).value,
            value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
        }
    }

    var getDOMstrings = function(){
        return DOMstrings;
    }

    var nodeListForEach = function(nodeList, callback){
        for(var i = 0; i < nodeList.length; i++){
            callback(nodeList[i], i);
        }
    }

    var addListItem = function(obj, type){
        var html, element, arrOfTemplates;

        // create html string with placeholder text
        arrOfTemplates = ['%id%', '%description%', '%value%'];

        if(type === 'inc'){
            element = DOMstrings.incomeContainer;
            html = `<div class="item clearfix" id="inc-%id%">
                <div class="item__description">%description%</div>
                <div class="right clearfix">
                    <div class="item__value">%value%</div>
                    <div class="item__delete">
                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                    </div>
                </div>
            </div>`;
        } else if(type === 'exp'){
            element = DOMstrings.expensesContainer;
            html = `<div class="item clearfix" id="exp-%id%">
                <div class="item__description">%description%</div>
                <div class="right clearfix">
                    <div class="item__value">%value%</div>
                    <div class="item__percentage">21%</div>
                    <div class="item__delete">
                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                    </div>
                </div>
            </div>`;
        }

        // replace placeholder text with data
        arrOfTemplates.forEach(function(e){
            var objPropName = e.slice(1, e.length-1);
            if(e === '%value%')
                html = html.replace(e, formatNumber(obj[objPropName], type));
            else
                html = html.replace(e, obj[objPropName]);
        });

        // insert html into the dom
        document.querySelector(element).insertAdjacentHTML('beforeend', html);

    }


    var deleteListItemFromUI = function(selectorId){
        var item = document.getElementById(selectorId);
        item.parentNode.removeChild(item);
    }


    var clearFields = function(){
        var fieldsNode, fieldsArr;
        
        fieldsNode = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

        fieldsArr = Array.from(fieldsNode);

        fieldsArr.forEach(function(cur){
            cur.value = '';
        });

        fieldsArr[0].focus();

    }
    

    var displayBudget = function(obj){
        var type = obj.budget >= 0 ? type = 'inc' : type = 'exp';

        document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
        document.querySelector(DOMstrings.totalIncomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
        document.querySelector(DOMstrings.totalExpensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
        if(obj.percentage > 0){
            document.querySelector(DOMstrings.precentageLabel).textContent = obj.percentage + '%';
        } else {
            document.querySelector(DOMstrings.precentageLabel).textContent = '---';
        }
    }


    var displayPercentages = function(percentagesArr){
        var fields;

        fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);

        nodeListForEach(fields, function(current, index){
            if(percentagesArr[index] > 0)
                current.textContent = percentagesArr[index] + '%';
            else
                current.textContent = '---';
        });


    }


    var formatNumber = function(num, type){
         // + or - before the number
        // exactly two decimal points
        // comma separating thousands
        

        var numSplit, int, dec, sign;

        num = num.toFixed(2);
        numSplit = num.split('.');
        
        dec = numSplit[1];
        int = numSplit[0];
        
        // amount of three number collections - for example a number 1,000,001 has 2 collections 1:"000" and 2:"001"
        var amntOfCommas = Math.floor((int.length-1)/3);

        var nonThousandsPart = int.substr(0, (int.length)-3*amntOfCommas);
        var thousandsPart = int.substr((int.length)-3*amntOfCommas, 3*amntOfCommas);
        var thousandsPartsArr = [];
        var lastIndex = 0;
        for(var x = 0; x < amntOfCommas; x++){
            thousandsPartsArr[x] = thousandsPart.substr(0, 3);
            lastIndex = lastIndex + 3;
            thousandsPart = thousandsPart.substr(lastIndex, thousandsPartsArr.lenght);
        }
        if(thousandsPartsArr.length > 0){
            int = nonThousandsPart + ',' +thousandsPartsArr.join(',');
        }


        if(type === 'exp'){
            sign = '-';
        }
        else if(type === 'inc'){
            sign = '+';
        }

        return sign + int + '.' + dec;
    }


    var displayMonth = function(){
        var now, months, month, year;
        
        months = ['January' , 'February' , 'March' , 'April' , 'May' , 'June' , 'July' , 'August' , 'September' , 'October' , 'November' , 'December'];
        now = new Date();
        month = months[now.getMonth()];
        year = now.getFullYear();

        document.querySelector(DOMstrings.dateLabel).textContent = month + ' ' + year;
        
    }

    var changeType = function(){
        var fields = document.querySelectorAll(
            DOMstrings.inputType + ', ' +
            DOMstrings.inputDescription + ', ' +
            DOMstrings.inputValue
        );

        nodeListForEach(fields, function(current){
            current.classList.toggle('red-focus');
        });

        document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

    }


    return {
        getInput: getInput,

        getDOMstrings: getDOMstrings,

        addListItem: addListItem,
        
        clearFields: clearFields,

        displayBudget: displayBudget,

        deleteListItemFromUI: deleteListItemFromUI,

        displayPercentages: displayPercentages,

        displayMonth: displayMonth,

        changeType: changeType,
        
    };

})();
 

























// global app controller
var controller = (function(budgetCtrl, UICtrl){

    var init = function(){
        console.log("app has started");
        
        UICtrl.displayBudget(budgetController.getBudget());

        UICtrl.displayMonth();

        setupEventListeners();
    }

    var setupEventListeners = function(){

        var DOMstrings = UICtrl.getDOMstrings();
        
        document.querySelector(DOMstrings.inputBtn).addEventListener('click', ctrlAddItem);
        
        document.addEventListener('keypress', function(event){
            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
                // stopping the form button to fire for the click event aswell
                event.preventDefault();
            }
        });

        document.querySelector(DOMstrings.listsContainer).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOMstrings.inputType).addEventListener('change', UICtrl.changeType);

    };

    var updateBudget = function(){
        // 1. calculate the budget
        budgetController.calculateBudget();

        // 2. return the budget
        var budget = budgetController.getBudget();

        // 3. display the budget on the UI
        console.log(budget);
        UICtrl.displayBudget(budget);
    }

    var updatePercentages = function(){

        // 1. calculate the precentages
        budgetCtrl.calculatePercentages();

        // 2. read them from the budget controller
        var percentagesArr = budgetCtrl.getPercentages();

        // 3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentagesArr);
    }

    var ctrlAddItem = function(){
        var input, newItem;

        // 1. get the field input data
        input = UICtrl.getInput();

        if(input.description !== '' && input.value > 0 && !isNaN(input.value)){

            // 2. add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. add the new item to the UI
            UICtrl.addListItem(newItem, input.type);

            //4. clear fields
            UICtrl.clearFields();

            // 5. calculate and update budget
            updateBudget();

            // 6. calculate and update the percentages
            updatePercentages();

        }

    }

    var ctrlDeleteItem = function(event){
        var itemId, splitId, type, id;

        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemId){
            // 1. get item ID and type
            splitId = itemId.split('-');
            type = splitId[0];
            id = parseInt(splitId[1]);

            // 2. delete item from the data structure
            budgetCtrl.deleteItemFromDataStructure(type, id);

            // 3. delete item from the UI
            UICtrl.deleteListItemFromUI(itemId);

            // 4. update and show the new budget
            updateBudget();

            // 5. calculate and update the percentages
            updatePercentages();

        }

    }

    
    return {
        init: init
    }


})(budgetController, UIController);

controller.init();