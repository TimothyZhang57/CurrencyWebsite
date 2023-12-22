
//Add event handlers to html document
document.addEventListener('DOMContentLoaded', function() {
    //This is called after the browser has loaded the web page
    document.getElementById('UserNameInput').value = '';
    document.getElementById('PasswordInput').value = '';
    document.getElementById('EnteredMoney').value = '';
    document.getElementById('EnteredCurrency').value = '';
    document.getElementById('ChosenCurrency').value = '';
    //add button listeners
    document.getElementById('register_button').addEventListener('click', register)
    document.getElementById('save_currency').addEventListener('click', save)
    document.getElementById('convert_button').addEventListener('click', convert)
    document.getElementById('convertSaved_button').addEventListener('click', convertSaved)
    document.getElementById('check_balance').addEventListener('click', checkBalance);
    })