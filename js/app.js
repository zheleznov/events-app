(function($){
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
            init: function(){
                this.users.init();
            },
            getFromStorage: function(){

            },
            users: {
                init: function() {
                    if(!localStorage.users) {
                        var users = [];
                        //for testing
                        users.push({name:'Roma', email: 'qwe@qwe.qwe', password: 'qwe'});
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
                }
            },
            signUp: {
                hideAlert: function(param, result){
                    $('body').find('.alert-danger p[data-password="' + param + '"]').hide();

                    if (result) $('body').find('.alert-danger').hide();
                },
                showAlert: function(param, result){
                    $('body').find('.alert-danger p[data-password="' + param + '"]').show();
                    if (result) $('body').find('.alert-danger').show();
                }
            }
        };


        //TODO: refactoring
        //TODO: check email for existing user
        var controllers = {
            init: function(){
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

                    user.email = $('.nav-email').val();
                    user.password = $('.nav-password').val();

                    var result = storages.users.getUser(user.email);

                    if(result) { //check user password
                        if(result.password === user.password) {
                            renders.users.logined(result);
                            storages.users.createCurrentUser(result);
                        }
                    } else {

                    }
                },
                logout: function(e){
                    e.preventDefault();

                    storages.users.removeCurrentUser();
                    renders.users.logOut();
                },
                checkUserSession: function(){
                    var userSession = sessionStorage.currentUser;

                    if(userSession) {
                        renders.users.logined({name: userSession});
                    }
                },
                setEvents: function(){
                    $('.nav-signin').on('click', this.login);
                    $('.nav-signout').on('click', this.logout);
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
                setPage: function(){
                    var hash = helpers.urls.getHash();

                    if(hash === 'signup') {
                        this.signUp();
                    } else if (hash === '' || hash === 'mainPage') {
                        this.mainPage();
                    }
                },
                setEvents: function(){
                    $('.nav-signup').on('click', this.signUp);
                    $('.navbar-brand').on('click', this.mainPage);
                }
            },
            signUp: {
                validateEmail: function(){
                    var password = $(this).val(),
                        finalResult = false;

                    //uppercase
                    if(password.match(/[A-Z]/g)){
                        renders.signUp.hideAlert('uppercase', finalResult);
                        finalResult = true;
                    } else {
                        renders.signUp.showAlert('uppercase', finalResult);
                        finalResult = false;
                    }

                    //lowercase
                    if(password.match(/[a-z]/g)){
                        renders.signUp.hideAlert('lowercase', finalResult);
                        finalResult = true;
                    } else {
                        renders.signUp.showAlert('lowercase', finalResult);
                        finalResult = false;
                    }

                    //digit
                    if(password.match(/\d/g)){
                        renders.signUp.hideAlert('digit', finalResult);
                        finalResult = true;
                    } else {
                        renders.signUp.showAlert('digit', finalResult);
                        finalResult = false;
                    }

                    //length
                    if(password.length > 6 ){
                        renders.signUp.hideAlert('length', finalResult);
                        finalResult = true;
                    } else {
                        renders.signUp.showAlert('length', finalResult);
                        finalResult = false;
                    }

                    this.isPasswordValid = finalResult;
                },
                createNewUser: function(){
                    var userInfo = {};

                    userInfo.name = $('body').find('#name').val();
                    userInfo.lastName = $('body').find('#lastName').val();
                    userInfo.email = $('body').find('#email').val();
                    userInfo.password = $('body').find('#password').val();
                    userInfo.employer = $('body').find('#employer').val();
                    userInfo.job = $('body').find('#job').val();
                    userInfo.birth = $('body').find('#birth').val();
                    console.log(this)
                    console.log(this.isPasswordValid)
                    if(userInfo.name && userInfo.lastName && userInfo.email && this.isPasswordValid) {
                        alert(2)
                        storages.users.addNewUser(userInfo);
                    }
                },
                setEvents: function(){
                    $('body').on('keyup', '#password', this.validateEmail.bind(this));
                    $('body').on('click', '.signup-form .btn-success', this.createNewUser.bind(this));
                }
            }
        };

        return {
            init: function(){
                storages.init();
                controllers.init();
            }
        }
    })();

    $(document).ready(app.init);
})(window.jQuery);
