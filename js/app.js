(function($, $body){
    var app = (function(){
        var helpers = {
            urls:{
                setHash: function(hash){
                    location.hash = hash;
                },
                getHash: function(){
                    return location.hash.replace('#', '');
                }
            }
        };

        var storages = {
            users: {
                init: function() {
                    if(!localStorage.users) {
                        var users = [];
                        localStorage.users = JSON.stringify(users);
                    }
                },
                getUser: function(email){
                    var users = JSON.parse(localStorage.users),
                        answer = false;

                    $.each(users, function(index, item){
                        if(item.email === email) {
                            answer = item;
                        }
                    });

                    return answer;
                },
                createCurrentUser: function(userInfo){
                    sessionStorage.currentUser = userInfo.name;
                },
                removeCurrentUser: function(){
                    sessionStorage.removeItem('currentUser');
                },
                addNewUser: function(data){
                    var users = JSON.parse(localStorage.users);

                    users.push(data);

                    localStorage.users = JSON.stringify(users);
                }
            }
        };

        //TODO: more clear renderer for pages, remove value cleaner
        //TODO: refacting
        var renders = {
            users: {
                logined: function(userInfo){ //hide form and show user hello
                    $('.navbar-form > div, .navbar-form .nav-signin, .navbar-form a').hide();
                    $('.navbar-form p span').html(userInfo.name);
                    $('.navbar-form > .nav-signout, .navbar-form p').removeClass('hide');
                },
                logOut: function(){
                    $('.navbar-form > .nav-signout, .navbar-form p').addClass('hide');
                    $('.nav-password').val('');
                    $('.navbar-form > div, .navbar-form .nav-signin, .navbar-form a').show();

                }
            },
            pages: {
                signUpForm: function(){
                    $('.main-page').hide();
                    $('.signup-form').show();
                },
                mainPage: function(){
                    $('.main-page').show();
                    $('.signup-form').hide();
                    $('.signup-form input').val('');

                    //activate event button
                    if(sessionStorage.currentUser) {
                        $body.find('.main-page button').removeAttr('disabled');
                    } else {
                        $body.find('.main-page button').attr('disabled', 'disabled');
                    }
                },
                showAddEventPage: function() {
                    $('.main-page').hide();
                    $('.event-form').show();
                }
            },
            signUp: {
                hideAlert: function(param, result, field){
                    $('body').find('.alert-danger p[data-' + field + '="' + param + '"]').hide();

                    if (result) $('body').find('.alert-danger.' + field).hide();
                },
                showAlert: function(param, result, field){
                    $('body').find('.alert-danger p[data-' + field + '="' + param + '"]').show();
                    if (result) $('body').find('.alert-danger.' + field).show();
                }
            }
        };


        //TODO: refactoring
        //TODO: check email for existing user
        //TODO: during login give the message if user not exist
        var controllers = {
            init: function(){
                //initialize storage
                storages.users.init();

                this.users.setEvents();
                this.users.checkUserSession();
                this.pages.setEvents();
                this.pages.setPage();
                this.signUp.setEvents();
            },
            users: {
                login: function(e){
                    var user = {};

                    e.preventDefault();

                    user.email = $body.find('.nav-email').val();
                    user.password = $body.find('.nav-password').val();

                    var result = storages.users.getUser(user.email);

                    if(result) { //check user password
                        if(result.password === user.password) {
                            storages.users.createCurrentUser(result);
                            renders.users.logined(result);
                            renders.pages.mainPage();
                        }
                    } else {

                    }
                },
                logout: function(e){
                    e.preventDefault();

                    storages.users.removeCurrentUser();
                    renders.users.logOut();
                    renders.pages.mainPage();
                },
                checkUserSession: function(){
                    var userSession = sessionStorage.currentUser;

                    if(userSession) {
                        renders.users.logined({name: userSession});
                    }
                },
                setEvents: function(){
                    $body.find('.nav-signin').on('click', this.login);
                    $body.find('.nav-signout').on('click', this.logout);
                }
            },
            pages: {
                signUp: function(){
                    renders.pages.signUpForm();
                    helpers.urls.setHash('signup');
                },
                mainPage: function(){
                    renders.pages.mainPage();
                    helpers.urls.setHash('mainPage');
                },
                eventForm: function(){
                    renders.pages.showAddEventPage();
                    helpers.urls.setHash('addEvent');
                },
                setPage: function(){
                    var hash = helpers.urls.getHash();

                    if(hash === 'signup') {
                        this.signUp();
                    } else if(hash === 'addEvent') {
                        this.eventForm();
                    } else if (hash === '' || hash === 'mainPage') {
                        this.mainPage();
                    }
                },
                setEvents: function(){
                    $body.find('.nav-signup').on('click', this.signUp);
                    $body.find('.navbar-brand').on('click', this.mainPage);
                    $body.find('.main-page button').on('click', this.eventForm)
                }
            },
            signUp: {
                validatePassword: function(e){
                    var password = $(e.target).val(),
                        finalResult = false;

                    //uppercase
                    if(password.match(/[A-Z]/g)){
                        renders.signUp.hideAlert('uppercase', finalResult, 'password');
                        finalResult = true;
                    } else {
                        renders.signUp.showAlert('uppercase', finalResult, 'password');
                        finalResult = false;
                    }

                    //lowercase
                    if(password.match(/[a-z]/g)){
                        renders.signUp.hideAlert('lowercase', finalResult, 'password');
                        finalResult = true;
                    } else {
                        renders.signUp.showAlert('lowercase', finalResult, 'password');
                        finalResult = false;
                    }

                    //digit
                    if(password.match(/\d/g)){
                        renders.signUp.hideAlert('digit', finalResult, 'password');
                        finalResult = true;
                    } else {
                        renders.signUp.showAlert('digit', finalResult, 'password');
                        finalResult = false;
                    }

                    //length
                    if(password.length > 6 ){
                        renders.signUp.hideAlert('length', finalResult, 'password');
                        finalResult = true;
                    } else {
                        renders.signUp.showAlert('length', finalResult, 'password');
                        finalResult = false;
                    }

                    this.isPasswordValid = finalResult;
                },
                validateEmail: function(e){
                    var email = $(e.target).val(),
                        result = false;

                    renders.signUp.hideAlert('exist', false, 'email'); //hide alert for existing user. it shows only on blur

                    if (email.match(/^.+@.+\..+$/)) {
                        result = true;
                        renders.signUp.hideAlert('valid', result, 'email');
                    } else {
                        result = false;
                        renders.signUp.showAlert('valid', !result, 'email');
                    }

                    this.isEmailValid = result;
                },
                createNewUser: function(){
                    var userInfo = {};

                    userInfo.name = $body.find('#name').val();
                    userInfo.lastName = $body.find('#lastName').val();
                    userInfo.email = $body.find('#email').val();
                    userInfo.password = $body.find('#password').val();
                    userInfo.employer = $body.find('#employer').val();
                    userInfo.job = $body.find('#job').val();
                    userInfo.birth = $body.find('#birth').val();
                    if(userInfo.name && userInfo.lastName && userInfo.email && this.isPasswordValid && !this.userExist) {
                        storages.users.addNewUser(userInfo); //save new user
                        $body.find('.signup-form input').val(''); //clear form
                        renders.pages.mainPage();//show main page
                        helpers.urls.setHash('mainPage');
                        renders.users.logined(userInfo); //automatically loggined new user
                        storages.users.createCurrentUser(userInfo);//save user to current session
                    }
                },
                checkEMailForExisting: function(e){
                    var email = $(e.target).val(),
                        result;

                    if(this.isEmailValid) {
                        result = storages.users.getUser(email);
                    }

                    if(result) {
                        this.userExist = true;
                        renders.signUp.showAlert('exist', true, 'email');
                    } else {
                        this.userExist = false;
                        renders.signUp.hideAlert('exist', false, 'email');
                    }
                },
                setEvents: function(){
                    $body.on('keyup', '#password', this.validatePassword.bind(this));
                    $body.on('click', '.signup-form .btn-success', this.createNewUser.bind(this));
                    $body.on('blur', '#email', this.checkEMailForExisting.bind(this));
                    $body.on('keyup', '#email', this.validateEmail.bind(this));
                }
            },
            eventForm: {
                setEvents: function(){

                }
            }
        };

        return {
            init: function(){
                controllers.init();
            }
        }
    })();

    $(document).ready(app.init);
})(window.jQuery, jQuery('body'));
