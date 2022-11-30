'use strict';
(function() {
  var user = {};
  var userlocationMarker = {};
  var mymap = {};
  var imageEditing = {};
  const URL = "https://www.lmh98.com/api";

  window.addEventListener("load", init);
  let colors = chroma.scale('YlOrRd').colors(5);
  function init() {
    let loginBtn = document.getElementById("login-btn");
    loginBtn.addEventListener('click', login);
    let changePasswordBtn = document.getElementById("change-password-btn");
    changePasswordBtn.addEventListener('click', changePassword);
    let viewUploadedHisBtn = document.getElementById("view-upload-history");
    viewUploadedHisBtn.addEventListener('click', loadUserHistory);
    let userInfoBtn = document.getElementById("signed-in");
    userInfoBtn.addEventListener('click', ()=>{
      document.getElementById("user-info-id").textContent = user;
      document.getElementById("user-info").classList.remove("hidden");
      document.getElementById("main").classList.add("freeze");
    });
    let uploadBtn = document.getElementById("upload");
    uploadBtn.addEventListener('click', (e)=> {
        document.getElementById("marker-info-container").classList.add("hidden");
        document.getElementById("upload-img").classList.remove('hidden');
        document.getElementById("main").classList.add("freeze");
        document.getElementById('select-img-btn').value = '';
        imageEditing.bind({url: "img/upload.jpg"});
    });
    let logOutBtn = document.getElementById("log-out");
    logOutBtn.addEventListener('click', ()=>{
      document.getElementById("unsigned").classList.remove("hidden");
      document.getElementById("signed-in").classList.add("hidden");
      document.getElementById("signed-in-p").textContent = "";
      document.getElementById("user-info-id").textContent = "";
      document.getElementById("user-info").classList.add("hidden");
      document.getElementById("main").classList.remove("freeze");
      document.getElementById("user-uploaded-container").innerHTML = "";
      user = {};
      userlocationMarker = {};
    });

    let createAccountBtn = document.getElementById("create-account-btn");
    createAccountBtn.addEventListener('click', createAccount);
    let el = document.getElementById('image-cutting');
    imageEditing = new Croppie(el, {
        viewport: { width: 400, height: 300 },
        boundary: { width: 440, height: 330 },
        showZoomer: true,
        enableOrientation: true
    });
    let fileInput = document.getElementById('select-img-btn');
    fileInput.addEventListener('change',displayImg);
    let submitBtn = document.getElementById("submit");
    submitBtn.addEventListener('click', submitImage);
  }


  function changePassword() {
    let oldPassword = document.getElementById("change-password-old").value;
    document.getElementById("change-password-old").value = "";
    let newPassword = document.getElementById("change-password-new").value;
    document.getElementById("change-password-new").value = "";
    let confirmPassword = document.getElementById("change-password-confirm").value;
    document.getElementById("change-password-confirm").value = "";
    if (newPassword === confirmPassword && newPassword.length > 5 && newPassword.length < 20) {
      let params = new FormData();
      params.append("email", user);
      params.append("oldPassword", oldPassword);
      params.append("newPassword", newPassword);
      params.append("confirmPassword", confirmPassword);
      console.log(user);
      fetch(URL + "/change-password", {method : "POST", body : params })
        .then(checkStatus)
        .then(resp => resp.json())
        .then(switchUserInterface)
        .catch(handleError);
    } else if (password !== confirmPassword) {
      window.alert("password doesn't match");
    } else if (password.length >= 20){
      window.alert("password is too long, exceed 20 chars");
    } else {
      window.alert("password is too short, below 6 chars");
    }
  }

  function createAccount() {
    let email = document.getElementById("create-account-email").value;
    let password = document.getElementById("create-account-password").value;
    let confirmPassword = document.getElementById("create-account-password-confirm").value;
    document.getElementById("create-account-email").value = "";
    document.getElementById("create-account-password").value = "";
    document.getElementById("create-account-password-confirm").value = "";
    if (validateEmail(email) && password === confirmPassword && password.length > 5 && password.length < 20) {
      let params = new FormData();
      params.append("email", email);
      params.append("password", password);
      params.append("confirmPassword", confirmPassword);
      fetch(URL + "/registor", {method : "POST", body : params })
        .then(checkStatus)
        .then(resp => resp.json())
        .then(switchUserInterface)
        .catch(handleError);
    } else if (password !== confirmPassword) {
      window.alert("password doesn't match");
    } else if (password.length >= 20){
      window.alert("password is too long, exceed 20 chars");
    } else {
      window.alert("password is too short, below 6 chars");
    }
  }

  function login() {
    let email = document.getElementById("login-email").value;
    let password = document.getElementById("login-password").value;
    document.getElementById("login-password").value = "";
    document.getElementById("login-email").value = "";
    if (validateEmail(email) && password.length > 5 && password.length < 20) {
      let params = new FormData();
      params.append("email", email);
      params.append("password", password);

      fetch(URL + "/login", {method : "POST", body : params })
        .then(checkStatus)
        .then(resp => resp.json())
        .then(switchUserInterface)
        .catch(handleError);

    } else if (password.length >= 20){
      window.alert("password is too long, exceed 20 chars");
    } else {
      window.alert("password is too short, below 6 chars");
    }
  }


  /**
   * when login is successed, switch to user own interface
   */
  function switchUserInterface(json) {
    if(json.status == true) {
      user = json.name;
      document.getElementById("change-password").classList.add("hidden");
      document.getElementById("create-account").classList.add("hidden");
      document.getElementById("login").classList.add("hidden");
      document.getElementById("unsigned").classList.add("hidden");
      document.getElementById("signed-in").classList.remove("hidden");
      document.getElementById("signed-in-p").textContent = json.name;
      document.getElementById("success-m").innerHTML = json.info;
      document.getElementById("success-m").classList.remove('hidden');
      //OPEN USER INFO PAGE

    } else {
      let errorMessasge = document.getElementById("error-m");
      errorMessasge.innerHTML = json.info;
      errorMessasge.classList.remove('hidden');
      document.getElementById("login").classList.add('freeze');
      document.getElementById("create-account").classList.add('freeze');
      document.getElementById("change-password").classList.add("freeze");
      setTimeout(() => {
        document.getElementById("change-password").classList.remove("freeze");
        document.getElementById("login").classList.remove('freeze');
        document.getElementById("create-account").classList.remove('freeze');
        document.getElementById("error-m").classList.add('hidden');
      }, 1700);
    }
  }

  function validateEmail(email) {
    if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)) {
      return (true);
    }
    window.alert("You have entered an invalid email address!");
    return (false);
  }


  /**
   * handle error, display error in window alert
   * @param {message} message contain the error response from server
   */
  function handleError(message) {
    window.alert(message)
  }

  /**
   * response ok or not ok situation.
   * @param {response} response contain the response from server
   * @return {response} response contain the response from server
   */
  function checkStatus(response) {
    if (response.ok) {
      return response;
    }
    console.log(response);
    throw Error("Error in request: " + response.statusText);
  }

})();

function returnToMainFromChangePassword() {
  document.getElementById("change-password").classList.add("hidden");
  document.getElementById("main").classList.remove("freeze");
}

function returnToMainFromCreateAccount() {
  document.getElementById("create-account").classList.add("hidden");
  document.getElementById("main").classList.remove("freeze");
}

//add hidden to the user interaction div on both login and creat user div
function returnToMainFromLogin() {
  document.getElementById("login").classList.add("hidden");
  document.getElementById("main").classList.remove("freeze");
}

//remove hidden from change Password div
function clickChangePassword() {
  document.getElementById("user-info").classList.add("hidden");
  document.getElementById("change-password").classList.remove("hidden");
  document.getElementById("main").classList.add("freeze");
}

//remove hidden from the createUser div
function clickCreateUser(){
  document.getElementById("create-account").classList.remove("hidden");
  document.getElementById("main").classList.add("freeze");
}

//remove hidden from the user login div
function clickLogin(){
  document.getElementById("login").classList.remove("hidden")
  document.getElementById("main").classList.add("freeze");
}
