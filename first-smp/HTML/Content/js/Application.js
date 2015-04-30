/// <reference path="~/HTML/content/js/libs/jquery-2.1.0.min.js" />
/// <reference path="~/HTML/content/js/libs/knockout-3.2.0.min.js" />
/// <reference path="~/HTML/content/js/libs/common.js" />
;
(function (application) {

    //#region Fields

    var views = {},
        viewLangs = {},
        viewModels = {};

    //#endregion

    //#region Properties

    application.CurrentApplication = null;
    application.CurrentView = null;

    application.Languages = ["pt-BR", "es-ES", "en-US"];

    application.StackView = [];

    //#endregion

    //#region Public Methods

    window.SKMReady = function () {
        application.init();
    };

    //#region Initialization

    application.init = function () {
        /* Verificar arquivo Default.html.json:
        /  todos os os arquivos com as extensões .html; .json; .js; 
        /  dentro da pasta "PartialViews" devem ser mapeados nele.
        */

        var mapping = [
            {
                "ID": "Default.html",
                "View": "Default.html",
                "ViewModel": "Default.html.js",
                "LanguageDefinition": "Default.html.{0}.json"
            }
        ];

        loadAllViewContent(mapping, function () {
            terminalLanguage(function (language) {
                application.CurrentApplication = new viewModels['Default.html']({
                    Languages: viewLangs["Default.html"],
                    Language: language
                });

                application.CurrentApplication.init();
            });
        }, function (fail) {
            application.ShowError("Mapping: " + fail.status, fail);
        });
    };

    //#endregion

    //#region Visual Control

    application.LoadPreviousView = function (params) {
        debugger;
        if (!application.CurrentView._previousViewCache)
            return;

        showLoadedView(application.CurrentView._previousViewCache, null, null);
    };

    application.LoadView = function (View, Params) {
        if (!Params) {
            Params = {};
        }

        var load = function () {

            Params.Languages = viewLangs[View];
            loadView(View, Params);
        }

        if (views[View]) {
            load();
            return;
        }

        loadAllViewContent([
            {
                "ID": View,
                "View": View,
                "ViewModel": $c.string.format('{0}.js', View),
                "LanguageDefinition": $c.string.format('{0}.{1}.json', View, '{0}')
            }
        ], function () {
            load();
        }, function (fail) {
            application.ShowError("Mapping: " + fail.status, fail);
        });

    };

    application.ShowError = function (title, error, callback) {
        try {
            if (typeof (error) == "string") {
                error = JSON.parse(error);
            } else {
                error = $c.utils.getServerError(error);
            }

            var lang = window.Application.CurrentApplication.CurrentLanguage(),
                txt;

            switch (lang) {
                case 'pt-BR':
                    txt = 'Atenção';
                    break;
                case 'es-ES':
                    txt = 'Aviso';
                    break;
                case 'en-US':
                    txt = 'Attention';
                    break;
                default:
                    txt = 'Atenção';
                    break;
            }

            $.msgBox({
                title: title != '' ? title : txt,
                content: error.Message || error.message || JSON.stringify(error),
                opacity: 0.6,
                details: undefined,
                lang: undefined,
                type: "error",
                afterClose: function () {
                    if (typeof (callback) === "function") {
                        callback();
                    }
                }
            });

        } catch (ex) {
            window.console.log(ex);
        }
    };

    application.ShowMessage = function (title, message, callback) {
        $.msgBox({
            title: title,
            content: message,
            opacity: 0.6,
            afterClose: function () {
                if (typeof (callback) === "function") {
                    callback();
                }
            }
        });
    };

    //#endregion

    //#endregion

    //#region Helper Methods

    //#region Initialization Helpers

    function loadAllViewContent(mapping, done, error) {
        loadViews(mapping,
            function () {
                loadViewModels(mapping,
                    function () {
                        loadLanguage(mapping,
                            function () {
                                if (typeof (done) === "function") {
                                    done();
                                }
                            },
                            function (fail) {
                                if (typeof (error) === "function") {
                                    error(fail);
                                }
                            });
                    },
                    function (fail) {
                        if (typeof (error) === "function") {
                            error(fail);
                        }
                    });
            },
            function (fail) {
                if (typeof (error) === "function") {
                    error(fail);
                }
            });
    };

    function loadViews(mapping, done, fail) {
        ///<summary>Carrega as telas padronizadas pela aplicação.</summary>
        /// <param name="done" type="Function">Callback quando carregou as telas corretamente.</param>
        /// <param name="fail" type="Function">Callback para caso ocorra erro no carregamento.</param>
        $c.ajax.bulkLoad(mapping, "View",
            function (data) {
                for (var i = 0; i < data.length; i++) {
                    views[data[i].ID] = data[i].View;
                }
                if (typeof (done) === "function") {
                    done();
                }
            },
            function (error) {
                if (typeof (fail) === "function") {
                    fail(error);
                }
            });
    }

    function loadViewModels(mapping, done, fail) {
        ///<summary>Carrega as controladoras de telas padronizadas pela aplicação.</summary>
        /// <param name="done" type="Function">Callback quando carregou as telas corretamente.</param>
        /// <param name="fail" type="Function">Callback para caso ocorra erro no carregamento.</param>
        $c.ajax.bulkLoad(mapping, "ViewModel",
            function (data) {
                for (var i = 0; i < data.length; i++) {
                    viewModels[data[i].ID] = eval("(function () {\n" + data[i].ViewModel + "\n return ViewModel; })();");
                }
                if (typeof (done) === "function") {
                    done();
                }
            },
            function (error) {
                if (typeof (fail) === "function") {
                    fail(error);
                }
            });
    }

    function loadLanguage(mapping, done, fail) {
        ///<summary>Carrega as traduções padronizadas pela aplicação.</summary>
        /// <param name="done" type="Function">Callback quando carregou as telas corretamente.</param>
        /// <param name="fail" type="Function">Callback para caso ocorra erro no carregamento.</param>
        var stepcounter = 0,
            isDone = function () {
                stepcounter++;
                if (stepcounter == application.Languages.length - 1) {
                    if (typeof (done) === "function") {
                        done();
                    }
                }
            },
            loadNStore = function (viewMappings, language) {
                $c.ajax.bulkLoad(viewMappings, "LanguageDefinition",
                    function (data) {
                        for (i = 0; i < data.length; i++) {
                            try {
                                if (!viewLangs[data[i].ID]) {
                                    viewLangs[data[i].ID] = {};
                                }

                                viewLangs[data[i].ID][language] = JSON.parse(data[i].LanguageDefinition);
                            } catch (ex) {
                                window.console.log(ex);
                            }
                        }
                        isDone();
                    },
                    function (error) {
                        if (typeof (fail) === "function") {
                            fail(error);
                        }
                    }, "text/plain; charset=iso-8859-1");
            };

        for (var j = 0; j < application.Languages.length; j++) {
            var i,
                map = $c.utils.cloneObject(mapping);

            for (i = 0; i < map.length; i++) {
                map[i].LanguageDefinition = $c.string.format(map[i].LanguageDefinition, application.Languages[j]);
            }

            loadNStore(map, application.Languages[j]);
        }
    }

    //#endregion

    //#region Visual Control

    function loadView(view, params, dom, callback) {
        if (!views[view] && !viewModels[view]) {
            application.ShowMessage("Erro", $c.string.format("A tela '{0}' solicitada não existe ou não foi carregada.", view));
            return;
        }

        var load = function () {
            $("#page-block").fadeOut(200, function () {
                try {
                    if (!dom) {
                        dom = $("#page-content");
                    }

                    dom.html(views[view]);
                    ko.cleanNode(dom[0]);
                    //Attempts to clean up the previous view.
                    if (application.CurrentView && application.CurrentView.dispose) {
                        application.CurrentView.dispose();
                    }

                    var previousView = application.CurrentView;
                    application.CurrentView = new viewModels[view](params);
                    application.CurrentView['_previousViewCache'] = previousView;
                    application.CurrentView['_ViewCacheID'] = view;

                    //Attempts to init the new view.
                    if (application.CurrentView && application.CurrentView.Init) {
                        application.CurrentView.Init();
                    }
                    ko.applyBindings(application.CurrentView, dom[0]);
                    $("#page-block").fadeIn(200, function () {
                        if (typeof (callback) === "function") {
                            callback();
                        }
                    });
                } catch (ex) {
                    window.console.log(ex);
                }
            });

        };
        load();
    }

    function showLoadedView(viewLoaded, dom, callback) {
        var load = function () {
            $("#page-block").fadeOut(200, function () {
                try {
                    if (!dom) {
                        dom = $("#page-content");
                    }

                    dom.html(views[viewLoaded._ViewCacheID]);
                    ko.cleanNode(dom[0]);

                    //Attempts to clean up the previous view.
                    if (application.CurrentView) {
                        //Guarda estado da view
                        application.StackView.push(application.CurrentView);
                        if (application.CurrentView.dispose) {
                            application.CurrentView.dispose();
                        }
                    }

                    application.CurrentView = viewLoaded;

                    if (application.CurrentView.InitNavigationBar)
                        application.CurrentView.InitNavigationBar();

                    ko.applyBindings(application.CurrentView, dom[0]);
                    $("#page-block").fadeIn(200, function () {
                        if (typeof (callback) === "function") {
                            callback();
                        }
                    });
                } catch (ex) {
                    window.console.log(ex);
                }
            });
        };
        load();
    }


    function terminalLanguage(success, error) {
        window.SKM.SchalterMainConfiguration.GetConfiguration(function (config) {
            var configuration = JSON.parse(config);
            if (!configuration.Terminal.Linguagem) {
                configuration.Terminal.Linguagem = "pt-BR";
            }
            if (typeof (success) == "function") {
                success(configuration.Terminal.Linguagem);
            }
        }, function (fail) {
            if (typeof (error) == "function") {
                error(fail);
            } else {
                application.ShowError("GetConfigurations: " + fail.status, fail);
            }
        });
    }

    //#endregion

    //#endregion

})(window.Application = window.Application || {});