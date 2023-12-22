let UserName = "";
//Register function
function register() {
    //Sentds the inforation to register
    let xhr = new XMLHttpRequest()
    xhr.open('POST', `/register`, true)
    UserName = document.getElementById('UserNameInput').value;
    Password = document.getElementById('PasswordInput').value;
    if(UserName == '' || Password ==''){
        return alert("Please enter a valid value for the username and password");
    }
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
            let response = JSON.parse(xhr.responseText)
            //Alerts the user if they registered successfully
            if(response == 0){
                alert("You have successfully registered");
                UserName = document.getElementById('UserNameInput').value;
            //Alerts the user if they signed in successfully
            }else if(response ==1){
                alert("You have successfully signed in");
                UserName = document.getElementById('UserNameInput').value;
           //Alerts the user if they typed in a wrong password when signing in
            }else if(response == 2){
                alert("Your password is incorrect");
                document.getElementById('UserNameInput').value = "";
                document.getElementById('PasswordInput').value= "";
                UserName = "";
            }
        }
    }
    //Sends the information
    xhr.send(`username=${UserName}&password=${Password}`);
}
//Saving to databsae function 
function save(){
    //Sends the information to save
    let xhr = new XMLHttpRequest()
    xhr.open('POST', `/save`, true)
    let Amount = document.getElementById('EnteredMoney').value;
    let currency = document.getElementById('EnteredCurrency').value;
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
            let response = JSON.parse(xhr.responseText)
            //Alerts the user that they need to register to use this function 
            if(response === 0){
                return alert("Plese register or sign in before using this feature");
            //Alerts the user that they have added successfully to the data and their result 
            }else if(response == 1){
                return alert(`You have added ${Amount} ${currency} to your account`);
            //Alerts the user that they need to enter valid values 
            }else if(response == 2){
                return alert(`Please enter valid values`);
            }
        }
    }
    //Sends the information
    xhr.send(`username=${UserName}&Amount=${Amount}&Currency=${currency}`);
}
//Does the same thing as the save function but with parameters so it can be used after converting
function saveConverted(userName,  amount, currency){
    let xhr = new XMLHttpRequest()
    xhr.open('POST', `/save`, true)
    let UserName = userName
    let Amount = amount
    let Currency = currency;
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
            let response = JSON.parse(xhr.responseText)
            if(response === 0){
                return alert("Please register or sign in before using this feature");
            }else if(response == 1){
                return alert(`You have added ${Amount} ${currency} to your account`);
            }else if(response == 2){
                return alert(`Please enter valid values`);
            }
        }
    }
    //Sends the information
    xhr.send(`username=${UserName}&Amount=${Amount}&Currency=${currency}`);
}
//Function for converting currency
function convert(){
    let amount = document.getElementById('EnteredMoney').value;
    let currency = document.getElementById('EnteredCurrency').value;
    let desiredCurrency = document.getElementById('ChosenCurrency').value;
    //Alerts the user that their input is not correct
    if(currency === '' || desiredCurrency === '' ||amount === ''){
        return alert("Please input to the fields before trying to convert");
    }
    //Sets up the request
    let xhr = new XMLHttpRequest()
    xhr.onreadystatechange = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
            let response = JSON.parse(xhr.responseText)
            let key = desiredCurrency.toLowerCase()
            let convertedValue = (amount * response[key]).toFixed(4);
            //Alerts the user of the results of the conversion
            alert(`${amount} ${currency} is equal to ${convertedValue} ${desiredCurrency}`);
            //Asks if the user wants to save the results of conversion and does so if they want to 
            if(confirm("Would you like to save this to your account")){
                saveConverted(UserName, convertedValue, desiredCurrency);
                return;
            }else{
                return;
            }
        }
    }
    //Sends the informmation and th request
    xhr.open('GET', `/currency?currency=${currency}&desiredCurrency=${desiredCurrency}`, true)
    xhr.send()
}
//Function for converting currency
function convertSaved(){
    let desiredCurrency = document.getElementById('ChosenCurrency').value;
    //Sets up the request
    let xhr = new XMLHttpRequest()
    xhr.onreadystatechange = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
            let response = JSON.parse(xhr.responseText)
            //Alerts the user if thye are not registerd or signed
            if(response == 0){
                return alert("Plese register or sign in before using thist feature");
            //Alerts the user if they are not inputting values
            }else if(response == 2){
                return alert("Plese enter a value for the desired currency");
            //Alerts the user of the results of the conversion as well as asks if they want to save the results of the conversion to their account and does so if they choose to
            }else{
                let convertedValue = Math.round(response* 10)/10;
                alert(`Your saved money is equal to ${convertedValue} ${desiredCurrency}`);
                if(confirm("Would you like to save this to your account")){
                    saveConverted(UserName, convertedValue, desiredCurrency);
                    return;
                }else{
                    return;
                }   
            }
        }
    }
    //Sends the information and the get reqest
    xhr.open('GET', `/saved?username=${UserName}&desiredCurrency=${desiredCurrency}`, true)
    xhr.send()
}
//Check balance function
function checkBalance(){
    let xhr = new XMLHttpRequest()
    xhr.onreadystatechange = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
            let response = JSON.parse(xhr.responseText)
            //Alerts the user if they are not registered
            if(response == 0){
                return alert("Plese register or sign in before using thist feature");
            //Alerts the user of their balaance
            }else{
                let balance = response;
                return alert(`You have ${balance} in your account`);
            }
        }
    }
    //Sends the informationa and opens the get request
    xhr.open('GET', `/check?username=${UserName}`, true)
    xhr.send()
}