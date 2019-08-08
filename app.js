// budget controller
let budgetController = (function(){
    
    let _Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    _Expense.prototype.calculatePercentage = function(totalIncome){
        if(totalIncome > 0){
            // this.percentage = Math.round(this.value/totalIncome*100);
            this.percentage = parseFloat((this.value/totalIncome*100).toFixed(3));
        }
        else{
            this.percentage = -1
        }
    }

    _Expense.prototype.getPercentage = function(){
        return this.percentage;
    }

    let _Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    }

    let calculateTotal = function(type){
        let sum = 0;
        
        data.allItems[type].forEach(function(e){
            sum+=e.value;
        });

        data.totals[type] = sum;
    }

    const data = {
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

    let addItem = function(type, des, val){
        let newItem, id;

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

    let deleteItemFromDataStructure = function(type, id){
        let arrOfIds, index;

        arrOfIds = data.allItems[type].map(function(current){
            return current.id;
        });

        index = arrOfIds.indexOf(id);

        if(index !== -1){
            data.allItems[type].splice(index, 1);
        }
    }

    let calculateBudget = function(){

        // calculate total income and expenses
        calculateTotal('exp');
        calculateTotal('inc');

        // calculate the budget: (total income) - (total expenses)
        data.budget = data.totals.inc - data.totals.exp;

        // calculate the percentage of income that we've spent
        if(data.totals.inc > 0){
            data.percentage = parseFloat( ((data.totals.exp / data.totals.inc) * 100).toFixed(3) );
        } else {
            data.percentage = -1;
        }

    }


    let calculatePercentages = function(){
        data.allItems.exp.forEach(function(e){
            e.calculatePercentage(data.totals.inc);
        });
    }

    let getPercentages = function(){
        let allPercentages = data.allItems.exp.map(function(e){
            return e.percentage;
        });
        return allPercentages;
    }


    let getBudget = function(){
        return {
            budget: data.budget,
            totalInc: data.totals.inc,
            totalExp: data.totals.exp,
            percentage: data.percentage,
        };
    };

    return {
        
        addItem ,
        
        calculateBudget,
        
        getBudget,
        
        deleteItemFromDataStructure,
        
        calculatePercentages,

        getPercentages,
        
        test: function(){
            console.log(data);
        }

    }
})();
























// UI controller
let UIController = (function(){
    
    let DOMstrings = {
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

    let getInput = function(){
        return {
            type: document.querySelector(DOMstrings.inputType).value, // will be 'inc' or 'exp',
            description: document.querySelector(DOMstrings.inputDescription).value,
            value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
        }
    }

    let getDOMstrings = function(){
        return DOMstrings;
    }

    let nodeListForEach = function(nodeList, callback){
        for(let i = 0; i < nodeList.length; i++){
            callback(nodeList[i], i);
        }
    }

    let addListItem = function(obj, type){
        let html, element, arrOfTemplates;

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
            let objPropName = e.slice(1, e.length-1);
            if(e === '%value%')
                html = html.replace(e, formatNumber(obj[objPropName], type));
            else
                html = html.replace(e, obj[objPropName]);
        });

        // insert html into the dom
        document.querySelector(element).insertAdjacentHTML('beforeend', html);

    }


    let deleteListItemFromUI = function(selectorId){
        let item = document.getElementById(selectorId);
        item.parentNode.removeChild(item);
    }


    let clearFields = function(){
        let fieldsNode, fieldsArr;
        
        fieldsNode = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

        fieldsArr = Array.from(fieldsNode);

        fieldsArr.forEach(function(cur){
            cur.value = '';
        });

        fieldsArr[0].focus();

    }
    

    const displayBudget = function(obj){
        console.log("obj", obj);

        const type = obj.budget >= 0 ? 'inc' : 'exp';
        const budget = (obj.budget > 0) ? obj.budget : 0;

        document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(budget, type);
        document.querySelector(DOMstrings.totalIncomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
        document.querySelector(DOMstrings.totalExpensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
        if(obj.percentage > 0){
            document.querySelector(DOMstrings.precentageLabel).textContent = obj.percentage + '%';
        } else {
            document.querySelector(DOMstrings.precentageLabel).textContent = '% too small';
        }
    }


    let displayPercentages = function(percentagesArr){
        let fields;

        fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);

        nodeListForEach(fields, function(current, index){
            if(percentagesArr[index] > 0)
                current.textContent = percentagesArr[index] + '%';
            else
                current.textContent = '% too small';
        });


    }


    let formatNumber = function(num, type){
         // + or - before the number
        // exactly two decimal points
        // comma separating thousands
        const cur = '$'
        if(num <= 0)
            return num + cur;

        let numSplit, int, dec, sign;

        num = num.toFixed(2);
        numSplit = num.split('.');
        
        dec = numSplit[1];
        int = numSplit[0];
        
        // amount of three number collections - for example a number 1,000,001 has 2 collections 1:"000" and 2:"001"
        let amntOfCommas = Math.floor((int.length-1)/3);

        let nonThousandsPart = int.substr(0, (int.length)-3*amntOfCommas);
        let thousandsPart = int.substr((int.length)-3*amntOfCommas, 3*amntOfCommas);
        let thousandsPartsArr = [];
        let lastIndex = 0;
        for(let x = 0; x < amntOfCommas; x++){
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

        return sign + int + '.' + dec + cur;
    }


    let displayMonth = function(){
        let now, months, month, year;
        
        months = ['January' , 'February' , 'March' , 'April' , 'May' , 'June' , 'July' , 'August' , 'September' , 'October' , 'November' , 'December'];
        now = new Date();
        month = months[now.getMonth()];
        year = now.getFullYear();

        document.querySelector(DOMstrings.dateLabel).textContent = month + ' ' + year;
        
    }

    let changeType = function(){
        let fields = document.querySelectorAll(
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
        getInput,

        getDOMstrings,

        addListItem,
        
        clearFields,

        displayBudget,

        deleteListItemFromUI,

        displayPercentages,

        displayMonth,

        changeType,
        
    };

})();
 

























// global app controller
let controller = (function(budgetCtrl, UICtrl){

    let init = function(){
        console.log("app has started");
        
        UICtrl.displayBudget(budgetController.getBudget());

        UICtrl.displayMonth();

        setupEventListeners();
    }

    let setupEventListeners = function(){

        let DOMstrings = UICtrl.getDOMstrings();
        
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

    let updateBudget = function(){
        // 1. calculate the budget
        budgetController.calculateBudget();

        // 2. return the budget
        let budget = budgetController.getBudget();

        // 3. display the budget on the UI
        console.log(budget);
        UICtrl.displayBudget(budget);
    }

    let updatePercentages = function(){

        // 1. calculate the precentages
        budgetCtrl.calculatePercentages();

        // 2. read them from the budget controller
        let percentagesArr = budgetCtrl.getPercentages();

        // 3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentagesArr);
    }

    let ctrlAddItem = function(){
        let input, newItem;
        const recordTextDOM = document.querySelector('.text-records');
        const listRowDOM = document.querySelector('.list-container-row');

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

            // 7. hide "no records" text
            recordTextDOM.classList.add('d-none');
            listRowDOM.classList.remove('d-none');

        }

    }

    let ctrlDeleteItem = function(event){
        let itemId, splitId, type, id;

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