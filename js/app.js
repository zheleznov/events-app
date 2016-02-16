(function ($, $body) {
    var app = (function () {
        var helpers = {
            urls: {
                setHash: function (hash) {
                    location.hash = hash;
                },
                getHash: function () {
                    return location.hash.replace('#', '');
                }
            }
        };

        //storage object
        var storages = {
            users: {
                init: function () {
                    if (!localStorage.users) {
                        var users = [];
                        localStorage.users = JSON.stringify(users);
                    }
                },
                getUser: function (email) { //get user from the storage
                    var users = JSON.parse(localStorage.users),
                        answer = false;

                    $.each(users, function (index, item) {
                        if (item.email === email) {
                            answer = item;
                        }
                    });

                    return answer;
                },
                createCurrentUser: function (userInfo) { //add loginned user to session storage
                    sessionStorage.currentUser = userInfo.name;
                },
                removeCurrentUser: function () { //remove loginned user to session storage
                    sessionStorage.removeItem('currentUser');
                },
                addNewUser: function (data) { //add new registred user
                    var users = JSON.parse(localStorage.users);

                    users.push(data);
                    localStorage.users = JSON.stringify(users);
                }
            },
            events: {
                init: function () {
                    if (!localStorage.events) {
                        var events = [];
                        localStorage.events = JSON.stringify(events);
                    }
                },
                addEvent: function (event) {
                    var events = JSON.parse(localStorage.events);

                    events.push(event);
                    localStorage.events = JSON.stringify(events);
                },
                getAllEvents: function () {
                    return JSON.parse(localStorage.events);
                }
            }
        };

        var renders = {
            users: {
                logined: function (userInfo) { //hide form and show user hello
                    $body.find('.navbar-form > div, .navbar-form .nav-signin, .navbar-form a').hide();
                    $body.find('.navbar-form p span').html(userInfo.name);
                    $body.find('.navbar-form > .nav-signout, .navbar-form p').removeClass('hide');
                },
                logOut: function () { //hide user hello, show form
                    $body.find('.navbar-form > .nav-signout, .navbar-form p').addClass('hide');
                    $body.find('.nav-password').val('');
                    $body.find('.navbar-form > div, .navbar-form .nav-signin, .navbar-form a').show();

                }
            },
            pages: {
                signUpForm: function () { //show sign up page
                    $body.find('.main-page').hide();
                    $body.find('.signup-form').show();
                    $body.find('#name').focus();
                },
                mainPage: function (events) { //show main page
                    var item = '';

                    $body.find('.main-page').show();
                    $body.find('.signup-form, .add-event').hide();
                    $body.find('.signup-form input').val('');

                    //activate event button
                    if (sessionStorage.currentUser) {
                        $body.find('.main-page button').removeAttr('disabled');
                    } else {
                        $body.find('.main-page button').attr('disabled', 'disabled');
                    }

                    //render events if they exist
                    if (events.length) {
                        events.forEach(function (event) {
                            item += '<div class="col-md-4 col-sm-6">\
                                <div class="panel panel-default event-panel">\
                                <div class="panel-body">\
                                <h3 class="event-name">' + event.name + '</h3>\
                            <h5 class="event-type">' + event.type + '</h5>\
                                <hr/>\
                                <p class="event-start-date">Event start date: <span>' + event.startTime + '</span></p>\
                            <p class="event-end-date">Event end date: <span>' + event.endTime + '</span></p>\
                            <p class="event-place">Location: <span>' + event.location + '</span></p>\
                            <hr/>\
                            <p class="event-description">Description: <span>' + event.description + '</span></p>\
                            <p class="event-guests">Guests: <span>' + event.guests + '</span></p>\
                            <p class="event-owner">Created by: <span>' + event.owner + '</span></p>\
                            </div>\
                            </div>\
                            </div>';

                            $body.find('.main-page > .row').html(item);
                        });
                    }
                },
                showAddEventPage: function () {  //show add event form page
                    var stage = parseInt($body.find('.events-form').attr('data-stage'));

                    if(stage === 1) $body.find('.previous').attr('disabled', 'disabled');

                    $body.find('.main-page').hide();
                    $body.find('.event-stage[data-stage="' + stage + '"]').show();
                    $body.find('.event-stage').not('[data-stage=' + stage + ']').hide();
                    $body.find('.add-event').show();
                    $body.find('#event-name').focus();
                }
            },
            signUp: {
                hideAlert: function (param, result, field) { //hide validation alert
                    $body.find('.alert-danger p[data-' + field + '="' + param + '"]').hide();

                    if (result) {
                        $body.find('.alert-danger.' + field).hide();
                        $body.find('#email').removeClass('invalid-email');
                    }
                },
                showAlert: function (param, result, field) { //show validation alerts
                    $body.find('.alert-danger p[data-' + field + '="' + param + '"]').show();
                    if (result) {
                        $body.find('.alert-danger.' + field).show();
                        $body.find('#email').addClass('invalid-email');
                    }
                }
            },
            eventForm: {
                stageNavigation: function (stage) {
                    //update current form data-stage
                    $body.find('.events-form').attr('data-stage', stage);

                    //enable or disable previous button
                    if (stage > 1) {
                        $body.find('.events-control .previous').removeAttr('disabled');
                    } else {
                        $body.find('.events-control .previous').attr('disabled', 'disabled');
                    }

                    //change button text for stage 3 (final) and predifine user name
                    if (stage === 3) {
                        $body.find('#event-owner').val(sessionStorage.currentUser);
                        $body.find('.events-control .next').text('Add Event');
                    } else {
                        $body.find('.events-control .next').text('Next');
                    }

                    //render progress bar according to current stage
                    if(stage === 2) {
                        $body.find('.progress-bar').css('width', '65%').text('65%');
                    } else if(stage === 3) {
                        $body.find('.progress-bar').css('width', '100%').text('100%');
                    } else if(stage === 1) {
                        $body.find('.progress-bar').css('width', '30%').text('30%');
                    }

                    //navigate through the stages
                    $body.find('.event-stage[data-stage=' + stage + ']').show();
                    $body.find('.event-stage').not('[data-stage=' + stage + ']').hide();
                }
            },
            alert: {
                show: function (message) {
                    var layout = '<div class="overlay alert-overlay"></div>' +
                        '<div class="panel alert-panel">' +
                        '<div class="panel-body"><p>' + message + '</p>' +
                        '<button class="alert-close btn btn-success">Close</button>' +
                        '</div>' +
                        '</div>';

                    $body.prepend(layout);
                },
                remove: function () {
                    $body.find('.alert-overlay, .alert-panel').remove();
                }
            }
        };

        var controllers = {
            init: function () {
                //initialize storage
                storages.users.init();
                storages.events.init();

                this.users.setEvents();
                this.users.checkUserSession();
                this.pages.setEvents();
                this.pages.setPage();
                this.signUp.setEvents();
                this.eventForm.setEvents();
            },
            users: {
                login: function () {
                    var user = {};

                    user.email = $body.find('.nav-email').val();
                    user.password = $body.find('.nav-password').val();

                    var result = storages.users.getUser(user.email);

                    if (result) { //check user password
                        if (result.password === user.password) {
                            storages.users.createCurrentUser(result);
                            renders.users.logined(result);
                            controllers.pages.mainPage();
                        } else {
                            renders.alert.show('Password is incorrect');
                        }
                    } else {
                        renders.alert.show('This user is not exist');
                    }
                },
                logout: function (e) {
                    e.preventDefault();

                    storages.users.removeCurrentUser();
                    renders.users.logOut();
                    controllers.pages.mainPage();
                },
                checkUserSession: function () {
                    var userSession = sessionStorage.currentUser;

                    if (userSession) {
                        renders.users.logined({name: userSession});
                    }
                },
                closeAlert: function() {
                    renders.alert.remove();
                },
                setEvents: function () {
                    $body.find('.navbar-form').on('submit', this.login);
                    $body.find('.nav-signout').on('click', this.logout);
                    $body.on('click', '.alert-close', this.closeAlert);
                }
            },
            pages: {
                signUp: function () {
                    renders.pages.signUpForm();
                    helpers.urls.setHash('signup');
                },
                mainPage: function () {
                    renders.pages.mainPage(storages.events.getAllEvents());
                    helpers.urls.setHash('mainPage');
                },
                eventForm: function () {
                    renders.pages.showAddEventPage();
                    helpers.urls.setHash('addEvent');
                },
                setPage: function () {
                    var hash = helpers.urls.getHash();

                    if (hash === 'signup') {
                        this.signUp();
                    } else if (hash === 'addEvent') {
                        this.eventForm();
                    } else if (hash === '' || hash === 'mainPage') {
                        this.mainPage();
                    }
                },
                setEvents: function () {
                    $body.find('.nav-signup').on('click', this.signUp);
                    $body.find('.navbar-brand').on('click', this.mainPage);
                    $body.find('.main-page button').on('click', this.eventForm)
                }
            },
            signUp: {
                validatePassword: function (e) {
                    var password = $(e.target).val(),
                        finalResult = false;

                    //uppercase
                    if (password.match(/[A-Z]/g)) {
                        renders.signUp.hideAlert('uppercase', finalResult, 'password');
                        finalResult = true;
                    } else {
                        renders.signUp.showAlert('uppercase', finalResult, 'password');
                        finalResult = false;
                    }

                    //lowercase
                    if (password.match(/[a-z]/g)) {
                        renders.signUp.hideAlert('lowercase', finalResult, 'password');
                        finalResult = true;
                    } else {
                        renders.signUp.showAlert('lowercase', finalResult, 'password');
                        finalResult = false;
                    }

                    //digit
                    if (password.match(/\d/g)) {
                        renders.signUp.hideAlert('digit', finalResult, 'password');
                        finalResult = true;
                    } else {
                        renders.signUp.showAlert('digit', finalResult, 'password');
                        finalResult = false;
                    }

                    //length
                    if (password.length > 6) {
                        renders.signUp.hideAlert('length', finalResult, 'password');
                        finalResult = true;
                    } else {
                        renders.signUp.showAlert('length', finalResult, 'password');
                        finalResult = false;
                    }

                    if (finalResult) {
                        $body.find('#password').addClass('valid-pas');
                        $body.find('#password').removeClass('invalid-pas');
                    } else {
                        $body.find('#password').removeClass('valid-pas');
                        $body.find('#password').addClass('invalid-pas');
                    }

                    this.isPasswordValid = finalResult;
                },
                validateEmail: function (e) {
                    var email = $(e.target).val(),
                        result = false;

                    renders.signUp.hideAlert('exist', false, 'email'); //hide alert for existing user. it shows only on blur

                    if (email.match(/^.+@.+\..+$/)) {
                        result = true;
                        renders.signUp.hideAlert('valid', result, 'email');
                    } else {
                        result = false;
                        //renders.signUp.showAlert('valid', !result, 'email');
                    }

                    this.isEmailValid = result;
                },
                createNewUser: function () {
                    var userInfo = {};

                    userInfo.name = $body.find('#name').val();
                    userInfo.lastName = $body.find('#lastName').val();
                    userInfo.email = $body.find('#email').val();
                    userInfo.password = $body.find('#password').val();
                    userInfo.employer = $body.find('#employer').val();
                    userInfo.job = $body.find('#job').val();
                    userInfo.birth = $body.find('#birth').val();
                    if (userInfo.name && userInfo.lastName && userInfo.email && this.isPasswordValid && !this.userExist) {
                        storages.users.addNewUser(userInfo); //save new user
                        storages.users.createCurrentUser(userInfo);//save user to current session
                        helpers.urls.setHash('mainPage');
                        $body.find('.signup-form input').val(''); //clear form
                        controllers.pages.mainPage();//show main page
                        renders.users.logined(userInfo); //automatically loggined new user
                    }
                },
                checkEMailForExisting: function (e) {
                    var email = $(e.target).val(),
                        result;

                    if (this.isEmailValid) {
                        result = storages.users.getUser(email);
                    }

                    if (result) {
                        this.userExist = true;
                        renders.signUp.showAlert('exist', true, 'email');
                    } else {
                        this.userExist = false;
                        renders.signUp.hideAlert('exist', false, 'email');
                    }
                },
                activateSubmit: function(e){
                    var name = $body.find('#name').val(),
                        lastName = $body.find('#lastName').val();

                    if(name.length && lastName.length && this.isPasswordValid && this.isEmailValid && !this.userExist) {
                        $body.find('.form-signup button').removeAttr('disabled');
                    } else {
                        $body.find('.form-signup button').attr('disabled', 'disabled');
                    }
                },
                setEvents: function () {
                    $body.on('keyup', '#password', this.validatePassword.bind(this));
                    $body.on('submit', '.form-signup', this.createNewUser.bind(this));
                    $body.on('blur', '#email', this.checkEMailForExisting.bind(this));
                    $body.on('keyup', '#email', this.validateEmail.bind(this));
                    $body.on('keyup', '#name, #lastName, #email, #password', this.activateSubmit.bind(this));
                }
            },
            eventForm: {
                stageValidation: function (stage) {
                    var $inputs = $body.find('.event-stage[data-stage=' + stage + '] input'),
                        result = true;

                    $inputs.each(function () {
                        if (!$(this).val().length) result = false;
                    });

                    return result;
                },
                addEvent: function () {
                    var event = {};

                    event.name = $body.find('#event-name').val();
                    event.type = $body.find('#event-type').val();
                    event.description = $body.find('#event-description').val();
                    event.startTime = $body.find('#event-start-time').val();
                    event.endTime = $body.find('#event-end-time').val();
                    event.location = $body.find('#event-location').val();
                    event.owner = $body.find('#event-owner').val();
                    event.guests = $body.find('#event-guests').val();

                    storages.events.addEvent(event);
                },
                stageNavigation: function (e) {
                    var $target = $(e.target),
                        navigation = $target.attr('data-nav'),
                        stage = parseInt($target.closest('form').attr('data-stage')),
                        validation = this.stageValidation(stage);

                    //count stage number for render
                    if (navigation === 'next') {
                        stage += 1;
                    } else {
                        stage -= 1;
                    }

                    //run render for next or previous stage
                    if (navigation === 'next' && validation && stage <= 3) renders.eventForm.stageNavigation(stage);
                    if (navigation === 'previous') renders.eventForm.stageNavigation(stage);

                    //if we have 3 stage and add an event
                    if (stage > 3 && validation) {
                        this.addEvent();
                        $body.find('.events-form input, .events-form textarea').val('');
                        $body.find('.events-form').attr('data-stage', '1');
                        controllers.pages.mainPage();
                    }

                },
                activateFirstNext: function(){
                    var name = $body.find('#event-name').val(),
                        type = $body.find('#event-type').val();

                    if(name.length && type.length) {
                        $body.find('.events-form .next').removeAttr('disabled');
                    } else {
                        $body.find('.events-form .next').attr('disabled', 'disabled');
                    }
                },
                setEvents: function () {
                    $body.find('.events-control .next, .events-control .previous')
                        .on('click', this.stageNavigation.bind(this));
                    $body.on('keyup', '#event-name, #event-type', this.activateFirstNext);
                }
            }
        };

        return {
            init: function () {
                controllers.init();
            }
        }
    })();

    $(document).ready(app.init);
})(window.jQuery, jQuery('body'));
