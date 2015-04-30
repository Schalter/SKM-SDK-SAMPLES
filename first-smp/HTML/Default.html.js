/// <reference path="~/HTML/content/js/libs/common.js" />
/// <reference path="~/HTML/content/js/Application.js" />

var ViewModel = function (params) {
    //#region Fields
    var defaultViewer = this,
        app = application,
        languages = params.Languages;

    //#endregion

    //#region Properties

    this.CurrentLanguage = ko.observable(params.Language);
    this.Language = ko.computed(function () {
        var language = defaultViewer.CurrentLanguage(),
            current = languages[language];
        return current;
    });

    this.IsLoading = ko.observable(false);
    this.StepAfterAuthenticate = ko.observable('');
    this.ErrorWindowVisible = ko.observable(false);
    this.ErrorWindowTitle = ko.observable();
    this.ErrorWindowText = ko.observable();
    this.SuccessWindowVisible = ko.observable(false);
    this.SuccessWindowTitle = ko.observable();
    this.SuccessWindowText = ko.observable();

    this.ButtonHomeVisible = ko.observable(false);
    this.ButtonBackVisible = ko.observable(false);
    this.ButtonExitVisible = ko.observable(false);

    this.FooterWithButtons = ko.computed(function () {
        return defaultViewer.ButtonHomeVisible()
            || defaultViewer.ButtonBackVisible()
            || defaultViewer.ButtonExitVisible();
    });

    //#endregion

    //#region Public Methods

    this.init = function () {
        ko.applyBindings(this);

        defaultViewer.RestartNavButton();
        defaultViewer.IsLoading(true);

        defaultViewer.IsLoading(false);

        //Carrega view de exemplo (ver propriedade ViewName)
        app.LoadView('PartialViews/View1.html');
    };

    this.AppLanguage = function () {
        var cssClass = null,
            lng = defaultViewer.CurrentLanguage();
        switch (lng) {
            case 'pt-BR':
                cssClass = 'lang-ptBR';
                break;
            case 'es-ES':
                cssClass = 'lang-esES';
                break;
            case 'en-US':
                cssClass = 'lang-enUS';
                break;
        }
        return cssClass;
    };

    this.RestartNavButton = function () {
        defaultViewer.ButtonHomeVisible(false);
        defaultViewer.ButtonBackVisible(false);
        defaultViewer.ButtonExitVisible(false);
    };

    this.GoHome = function () {
        //Chama método na view que está partial view carregada
        if (app.CurrentView.OnGoHome)
            app.CurrentView.OnGoHome();

        defaultViewer.RestartNavButton();
        app.LoadView('PartialViews/View1.html');
    };

    this.GoToPreviowsView = function () {
        //Chama método na view que está partial view carregada
        if (app.CurrentView.OnGoToPreviowsView)
            app.CurrentView.OnGoToPreviowsView();

        defaultViewer.RestartNavButton();
        app.LoadPreviousView();
    };

    this.ExitCurrentSession = function () {
        //Chama método na view que está partial view carregada
        if (app.CurrentView.OnExitCurrentSession)
            app.CurrentView.OnExitCurrentSession();

        defaultViewer.RestartNavButton();
        app.LoadView('PartialViews/View1.html');
    };

    this.ErrorMessage = function (title, text, callback) {
        defaultViewer.ErrorWindowVisible(true);
        defaultViewer.ErrorWindowTitle(title);
        defaultViewer.ErrorWindowText(text);
        $('.window-content ul li button').click(function () {
            if (callback) {
                defaultViewer.ErrorWindowVisible(false);
                callback();
            } else {
                defaultViewer.ErrorWindowVisible(false);
            }
        });

    };

    this.SuccessMessage = function (title, text, callback) {
        defaultViewer.SuccessWindowVisible(true);
        defaultViewer.SuccessWindowTitle(title);
        defaultViewer.SuccessWindowText(text);
        $('.window-content ul li button').click(function () {
            if (callback) {
                defaultViewer.SuccessWindowVisible(false);
                callback();
            } else {
                defaultViewer.SuccessWindowVisible(false);
            }
        });
    };

    // Screen Saver
    this.InitScreenSaver = function () {
        var mouseStopped = null,
            sleepTimer = null,
            sleepTimerCount = 120000,
            screenSaver = document.getElementById('screen-saver');

        mouseStopped = function () {
            screenSaver.style.height = '100%';
            screenSaver.className = 'visible';
        };
        window.addEventListener('mousemove', function () {
            screenSaver.style.height = '0';
            screenSaver.className = '';
            window.clearTimeout(sleepTimer);
            sleepTimer = window.setTimeout(mouseStopped, sleepTimerCount);
        });
    };

    //#endregion

};

ViewModel.prototype = window.Application;