var ViewModel = function (params) {

    //#region Fields

    var partialView = this,
        app = application,
        languages = params.Languages;

    //#endregion

    //#region Properties

    this.Language = ko.computed(function () {
        var language = window.Application.CurrentApplication.CurrentLanguage(),
            current = languages[language];
        return current;
    });

    //#endregion

    //#region Ctors/Dtors

    this.Init = function () {
        partialView.InitNavigationBar();
    };

    this.InitNavigationBar = function () {
        partialView.RestartNavButton();
    }

    this.dispose = function () { };

    //#endregion

    //#region Public Methods

    this.Button1Click = function () {
        app.LoadView('PartialViews/View2.html');
    }

    //#endregion

    //#region Events

    ///<summary>Acionado botão para carregamento da view anterior.</summary>
    this.OnGoHome = function () {

    }

    ///<summary>Acionado botão para carregamento da view anterior.</summary>
    this.GoToPreviowsView = function () {

    }

    ///<summary>Acionado botão para carregamento da view anterior.</summary>
    this.ExitCurrentSession = function () {

    }

    //#endregion

    //#region Helper Methods

    function onTimeout() { }

    //#endregion

    partialView.Init();

};

ViewModel.prototype = window.Application.CurrentApplication;