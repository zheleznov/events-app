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
            }
        };

        var controllers = {
            init: function(){
                this.users.setEvents();
                this.users.checkUserSession();
                this.pages.setEvents();
                this.pages.setPage();
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
