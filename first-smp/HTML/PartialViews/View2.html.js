var ViewModel = function (params) {

    //#region Fields

    var partialView = this,
        app = application,
        languages = params.Languages;

    //#endregion

    //#region Properties

    this.Language = ko.computed(function () {
        debugger;
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
        partialView.ButtonHomeVisible(true);
        partialView.ButtonBackVisible(true);
        partialView.ButtonExitVisible(true);
    }

    this.dispose = function () { };

    //#endregion

    //#region Public Methods

    this.MixedColors = function () {
        //Ver arquivos de tradução:
        //View2.html.en-US.json; View2.html.es-ES.json; View2.html.pt-BR.json;
        return partialView.Language().MSG_GREEN + ' || ' + partialView.Language().MSG_BLUE;
    };

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