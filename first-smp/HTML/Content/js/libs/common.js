/*
CommonJS
A common javascript library for general-purpose use.

Version: 2014.06.10.11.45

http://www.schalter.com.br/

Includes: 
2013-11-22: JSON2.js - https://github.com/douglascrockford/JSON-js/blob/master/json2.js
*/
(function (window, builder) {
    // Execute the builder.
    var commonjs = builder(window);
    // Register as AMD module.
    if (typeof define === "function" && define.amd) {
        define("commonjs", [], function () {
            return commonjs;
        });
    }
}(this, function (window) {
    var _commonjs = {};
    _commonjs.ajax = new function () {
        var self = this;

        var base = function (url, type, timeout, success, error) {
            $.ajax({
                url: url,
                timeout: timeout,
                beforeSend: function (xhr) {
                    xhr.overrideMimeType(type);
                }
            }).done(function (data) {
                if (typeof (success) == "function")
                    success(data);
            }).fail(function (fail) {
                if (typeof (error) == "function")
                    error(fail);
            });
        };

        self.bulkLoad = function (sources, key, success, error, mime) {
            /// <summary>Carrega vários arquivos de forma assíncrona.</summary>
            /// <param name="sources" type="Object">Array de objetos a serem carregados.</param>
            /// <param name="key" type="String">Propiedade do objeto que contém a url de carregamento.</param>
            /// <param name="success" type="Function">Função de retorno se os arquivos forem carregados com sucesso.</param>
            /// <param name="error" type="Function">Função de retorno caso ocorra falha no carregamento.</param>
            // Função de carregamento assíncrona.
            var loader = function (files, content) {
                if (files != null && files.length > 0 && files[0] != null)
                    base(files[0][key], mime ? mime : "text/plain", 30000,
                        function (data) {
                            files[0][key] = data; // define o conteúdo do arquivo no lugar da url.
                            content.push(files[0]); // adiciona o arquivo carregado.
                            files.splice(0, 1); // remove o item carregado.
                            loader(files, content);
                        }, function (fail) {
                            if (typeof (error) == "function")
                                error(fail); // caso estoure algum erro no carregamento.
                        });
                else {
                    if (typeof (success) == "function")
                        success(content); // terminou de carregar todos os arquivos.
                }
            };

            loader(_commonjs.utils.cloneObject(sources), []); // Inicia o carregamento dos arquivos.
        };

        self.getScript = function (url, autoParse, success, error) {
            /// <summary>Carrega um script.</summary>
            /// <param name="url" type="String">URL de localização do script.</param>
            /// <param name="autoParse" type="Boolean">Se deve ou não fazer o parse automático do script na página.</param>
            /// <param name="success" type="Function">Função de retorno se o script for carregado com sucesso.</param>
            /// <param name="error" type="Function">Função de retorno caso ocorra falha no carregamento.</param>
            base(url, "text/plain;", 30000,
                function (data) {
                    if (autoParse) {
                        try {
                            eval(data);
                            if (typeof (success) == "function")
                                success();
                        } catch (e) {
                            if (typeof (error) == "function")
                                error(e);
                        }
                    } else if (typeof (success) == "function") {
                        success(data);
                    }
                },
                function (fail) {
                    if (typeof (error) == "function")
                        error(fail);
                }
            );
        };

        self.getText = function (url, success, error) {
            /// <summary>Carrega texto puro.</summary>
            /// <param name="url" type="String">URL de localização do texto.</param>
            /// <param name="success" type="Function">Função de retorno se o script for carregado com sucesso.</param>
            /// <param name="error" type="Function">Função de retorno caso ocorra falha no carregamento.</param>
            base(url, "text/plain;", 30000,
                function (data) {
                    if (typeof (success) == "function")
                        success(data);
                },
                function (fail) {
                    if (typeof (error) == "function")
                        error(fail);
                }
            );
        };

        return self;
    };
    _commonjs.date = new function () {
        var self = this;

        self.isValid = function (date) {
            // <summary>Verifica se uma data é válida.</summary>
            /// <param name="date" type="String">Data para ser validada.</param>
            return _commonjs.validate.date(date);
        };

        self.toCustomDate = function (date) {
            /// <summary>Transforma um objeto de data no formato utilizado no servidor.</summary>
            /// <param name="date" type="Object">Data para ser transformada.</param>
            return {
                Year: date.getFullYear(),
                Month: date.getMonth() + 1,
                Day: date.getDate(),
                Hour: date.getHours(),
                Minute: date.getMinutes(),
                Millisecond: date.getMilliseconds()
            };
        };

        self.fromCustomDate = function (value) {
            /// <summary>Transforma um objeto de data do formato utilizado no servidor em uma data javascript.</summary>
            /// <param name="value" type="Object">Objeto para ser transformado.</param>
            return new Date(value.Year, value.Month - 1, value.Day, value.Hour, value.Minute, value.Millisecond);
        };

        self.parseStringDate = function (value) {
            /// <summary>Transforma uma data json/serializada em uma data javascript.</summary>
            /// <param name="value" type="Object">Objeto para ser transformado.</param>
            var a = /^(\d{4})-(\d{2})-(\d{2})T(\d{2)}:(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
            return a ? new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4], +a[5], +a[6])) : null;
        };

        self.format = function (date, mask, language, utc) {
            /// <summary>Retorna uma string formatada do objeto de data providenciado.</summary>
            /// <param name="date" type="Object">Objeto para ser formatado.</param>
            /// <param name="mask" type="String">Formato para ser aplicado.</param>
            /// <param name="language" type="String">Lingua para aplicar na data. Padrão EN-US.</param>
            /// <param name="utc" type="Booelan">Se o objeto de data está no formato UTC ou não.</param>

            language = language || "EN-US";

            var langs = {
                "EN-US": {
                    mini: {
                        days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                        months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                    },
                    full: {
                        days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                        months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
                    }
                },
                "PT-BR": {
                    mini: {
                        days: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "S\xE1b"],
                        months: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
                    },
                    full: {
                        days: ["Domingo", "Segunda-Feira", "Ter\xE7a-Feira", "Quarta-Feira", "Quinta-Feira", "Sexta-Feira", "S\xE1bado"],
                        months: ["Janeiro", "Fevereiro", "Mar\xE7o", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
                    }
                }
            };

            var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
                timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
                timezoneClip = /[^-+\dA-Z]/g,
                pad = function (val, len) {
                    val = String(val);
                    len = len || 2;
                    while (val.length < len) val = "0" + val;
                    return val;
                };


            // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
            if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
                mask = date;
                date = undefined;
            }

            // Passing date through Date applies Date.parse, if necessary
            date = date ? new Date(date) : new Date;
            if (isNaN(date))
                throw SyntaxError("invalid date");

            mask = String(mask || "yyyy-mm-dd");

            // Allow setting the utc argument via the mask
            if (mask.slice(0, 4) == "UTC:") {
                mask = mask.slice(4);
                utc = true;
            }

            var _ = utc ? "getUTC" : "get",
                d = date[_ + "Date"](),
                D = date[_ + "Day"](),
                m = date[_ + "Month"](),
                y = date[_ + "FullYear"](),
                H = date[_ + "Hours"](),
                M = date[_ + "Minutes"](),
                s = date[_ + "Seconds"](),
                L = date[_ + "Milliseconds"](),
                o = utc ? 0 : date.getTimezoneOffset(),
                flags = {
                    d: d,
                    dd: pad(d),
                    ddd: langs[language].mini.days[D],
                    dddd: langs[language].full.days[D],
                    m: m + 1,
                    mm: pad(m + 1),
                    mmm: langs[language].mini.months[m],
                    mmmm: langs[language].full.months[m],
                    yy: String(y).slice(2),
                    yyyy: y,
                    h: H % 12 || 12,
                    hh: pad(H % 12 || 12),
                    H: H,
                    HH: pad(H),
                    M: M,
                    MM: pad(M),
                    s: s,
                    ss: pad(s),
                    l: pad(L, 3),
                    L: pad(L > 99 ? Math.round(L / 10) : L),
                    t: H < 12 ? "a" : "p",
                    tt: H < 12 ? "am" : "pm",
                    T: H < 12 ? "A" : "P",
                    TT: H < 12 ? "AM" : "PM",
                    Z: utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                    o: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                    S: ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
                };

            return mask.replace(token, function ($0) {
                return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
            });

        };

        return self;
    };
    _commonjs.kiosk = new function () {
        var self = this;

        self.close = function () {
            /// <summary>Fecha a aplicação atual retornando para a tela de configurações do kiosk manager.</summary>
            if (typeof (hardware) !== "undefined")
                hardware.exitsystem();
        };

        self.getCommand = function (command) {
            /// <summary>Retorna a base de uma função para executar no kiosk.</summary>
            /// <param name="command" type="String">Comandos para executar. Ex: alert("Olá Mundo.");</param>
            return "(function(){ " + command + " })();";
        };

        self.keyboard = new function () {
            var me = this;

            // Base vars
            var input, _stopOn, _inputCallback, _stopCallback;

            var process = function (code) {
                if (_stopOn === "enter" && (code == 10 || code == 13)) {
                    me.stopCapture();
                    if (typeof (_stopCallback) === "function")
                        _stopCallback(input);

                    return;
                } else if (_stopOn === "backspace" && (code == 8 || code == 46)) {
                    me.stopCapture();
                    if (typeof (_stopCallback) === "function")
                        _stopCallback(input);

                    return;
                }

                // Backspace, remove o dado.
                if (code == 8 || code == 46)
                    input = input.substring(0, input.length - 1);
                else
                    input += String.fromCharCode(code);

                if (typeof (_inputCallback) === "function")
                    _inputCallback(input);
            };

            me.startCapture = function (stopOn, inputCallback, stopCallback) {
                /// <summary>Inicia a captura das teclas do teclado.</summary>
                /// <param name="command" type="stopOn">Executar parada nas teclas, "enter" ou "backspace". (Tecla de parada)</param>
                /// <param name="command" type="inputCallback">Função para executar a cada tecla pressionada, retornando os dados atuais.</param>
                /// <param name="command" type="stopCallback">Função para executar quando a tecla de parada for pressionada.</param>
                input = "";
                _stopOn = stopOn, _inputCallback = inputCallback, _stopCallback = stopCallback;
                $(document).bind("keypress", function (e) {
                    var code = e.which || e.keyCode || e.charCode;
                    if (code >= 96 && code <= 105)
                        code = code - 48;

                    e.preventDefault();
                    process(code);
                });
            };

            me.stopCapture = function () {
                /// <summary>Para a captura das teclas do teclado.</summary>
                $(document).unbind("keypress");
            };

            return me;
        };

        self.loadStartPage = function () {
            /// <summary>Carrega a página inicial definida no kiosk.</summary>
            if (typeof (hardware) !== "undefined")
                hardware.reload();
        };

        self.print = new function () {
            var me = this;

            me.billet = function (billet, success, error) {
                /// <summary>Imprime um boleto padrão.</summary>
                /// <param name="billet" type="Object">Boleto a ser impresso.</param>
                /// <param name="success" type="Function">Função de retorno se impresso com sucesso.</param>
                /// <param name="error" type="Function">Função de retorno caso ocorra falha na impressão.</param>
                if (typeof (hardware) !== "undefined")
                    hardware.printBoleto({
                        printercode: 0,
                        landscape: true,
                        content: bill,
                        onSuccess: success,
                        onError: error,
                        contenthtml: true
                    });
                else
                    eval(success);
            };

            me.getPrintableHTML = function (body) {
                /// <summary>Retorna uma base para impressão de html.</summary>
                /// <param name="body" type="String">O conteúdo do corpo do html.</param>
                return "<html><head><meta charset=\"ISO-8859-1\" /></head><body>" + body + "</body></html>";
            };

            me.HTML = function (html, success, error) {
                /// <summary>Imprime o html informado.</summary>
                /// <param name="html" type="String">O HTML a ser impresso.</param>
                /// <param name="success" type="Function">Função de retorno se impresso com sucesso.</param>
                /// <param name="error" type="Function">Função de retorno caso ocorra falha na impressão.</param>
                if (typeof (hardware) !== "undefined")
                    hardware.print({
                        onSuccess: success,
                        onError: error,
                        content: html,
                        contenthtml: true
                    });
                else {
                    var printView = window.open();
                    if (printView)
                        printView.document.write(html);

                    eval(success);
                }
            };

            me.text = function (text, fontSize, success, error) {
                /// <summary>Imprime o texto puro informado.</summary>
                /// <param name="text" type="String">Texto a ser impresso.</param>
                /// <param name="fontSize">Tamanho da fonte.</param>
                /// <param name="success" type="Function">Função de retorno se impresso com sucesso.</param>
                /// <param name="error" type="Function">Função de retorno caso ocorra falha na impressão.</param>
                if (typeof (hardware) !== "undefined")
                    hardware.print({
                        onSuccess: success,
                        onError: error,
                        content: text,
                        contenthtml: false,
                        fontsize: fontSize || 8
                    });
                else {
                    var printView = window.open();
                    if (printView)
                        printView.document.write(text);

                    eval(success);
                }
            };

            return me;
        };

        self.serial = new function () {
            var me = this;

            me.get = function () {
                /// <summary>Retorna o serial do kiosk atual.</summary>    
                if (typeof (hardware) !== "undefined")
                    return hardware.serialnumber.toString();

                return null;
            };

            me.set = function (serial) {
                /// <summary>Define o serial do kiosk atual.</summary>    
                /// <param name="serial" type="String">O novo serial do kiosk.</param>
                if (typeof (hardware) !== "undefined")
                    hardware.serialnumber = serial;
            };

            return me;
        };

        self.shutdown = function () {
            /// <summary>Desliga o sistema.</summary>
            if (typeof (hardware) !== "undefined")
                hardware.shutdown();
        };

        self.reboot = function () {
            /// <summary>Reinicia o sistema.</summary>
            if (typeof (hardware) !== "undefined")
                hardware.reboot();
        };

        return self;
    };
    _commonjs.number = new function () {
        var self = this;

        self.clearIntFormat = function (number) {
            /// <summary>Remove a máscara de um número inteiro.</summary>
            /// <param name="number" type="String">Número para ser normalizado.</param>
            number = _commonjs.string.padLeft(_commonjs.utils.getNumbers(number), '0', 3);
            return parseInt(number);
        };

        self.parseFloat = function (number) {
            if (typeof (number) == "string") {
                if ((number.indexOf(".") != -1 && number.indexOf(",") != -1)    //There is a comma and a point in the number.
                    || number.indexOf(".") != number.lastIndexOf(".")) {        //There is more than one point in the number.
                    //Its assumed culture pt-BR and point are removed.
                    number = number.replace(".", "");
                }
                number = number.replace(",", ".");

                return parseFloat(number);
            }
            return number;
        };

        self.clearFloatFormat = function (number, fractionDigits) {
            /// <summary>Remove a máscara de um número com casas.</summary>
            /// <param name="number" type="String">Número para ser normalizado.</param>
            /// <param name="fractionDigits" type="Number">Número de casas decimais do númeor.</param>
            number = _commonjs.string.padLeft(_commonjs.utils.getNumbers(number), '0', 3);
            return parseFloat(_commonjs.string.insertAt(number, number.length - fractionDigits, "."));
        };

        self.setFormat = function (number, fractionDigits, decimal, thousand) {
            /// <summary>Formata um número com casas decimais.</summary>
            /// <param name="number" type="Number">Número para ser formatado.</param>
            /// <param name="fractionDigits" type="Number">Número de casas decimais para aplicar.</param>
            /// <param name="decimal" type="String">Formato da casa decimal.</param>
            /// <param name="thousand" type="String">Formato da casa de milhar.</param>
            number = number.toFixed(fractionDigits) + '';
            var x = number.split('.');
            var x1 = x[0];
            var x2 = x.length > 1 ? decimal + x[1] : '';
            var rgx = /(\d+)(\d{3})/;
            while (rgx.test(x1))
                x1 = x1.replace(rgx, '$1' + thousand + '$2');

            return x1 + x2;
        };

        return self;
    };
    _commonjs.store = new function () {
        var self = this;

        var check = function (k) {
            if (typeof window[k] == "object") {
                try {
                    // Try to set an local item.	
                    window[k].setItem("___", "___");
                    window[k].removeItem("___");
                    return true;
                } catch (ex) {
                    return false;
                }
            }
            return false;
        };

        var UnavailableStorageException = function (message) {
            this.message = message || "O serviço de armazenamento está indisponível.";
            this.name = "UnavailableStorageException";
        };

        var StorageException = function (message) {
            this.message = message;
            this.name = "StorageException";
        };

        var get = function (k, key) {
            if (!check(k))
                throw new UnavailableStorageException();

            return JSON.parse(window[k].getItem(key));
        };

        var getAll = function (k) {
            if (!check(k))
                throw new UnavailableStorageException();

            var items = [];
            for (var i = 0; i < window[k].length; i++)
                items.push({
                    key: window[k].key(i),
                    value: JSON.parse(window[k].getItem(window[k].key(i)))
                });

            return items;
        };

        var set = function (k, key, data) {
            if (!check(k))
                throw new UnavailableStorageException();

            try {
                window[k].setItem(key, JSON.stringify(data));
            } catch (ex) {
                throw new StorageException("Não foi possível armazenar o valor.\n" + ex.message);
            }
        };

        var remove = function (k, key) {
            if (!check(k))
                throw new UnavailableStorageException();

            window[k].removeItem(key);
        };

        var removeAll = function (k) {
            if (!check(k))
                throw new UnavailableStorageException();

            window[k].clear();
        };

        var base = function (obj) {
            this.check = function () {
                /// <summary>
                /// Verifica a disponibilidade do serviço de armazenamento.
                /// </summary>
                return check(obj);
            };

            this.get = function (key) {
                /// <summary>
                /// Retorna um valor armazenado.
                /// </summary>
                /// <param name="key" type="String">O nome da chave para retornar.</param>
                return get(obj, key);
            };

            this.getAll = function () {
                /// <summary>
                /// Retorna todos os valores armazenados.
                /// </summary>
                return getAll(obj);
            };

            this.set = function (key, data) {
                /// <summary>
                /// Adiciona um valor no serviço de armazenamento.
                /// </summary>
                /// <param name="key" type="String">O nome da chave para armazenar.</param>
                /// <param name="data" type="String">Os dados para serem armazenados.</param>
                set(obj, key, data);
            };

            this.remove = function (key) {
                /// <summary>
                /// Remove um valor no serviço de armazenamento.
                /// </summary>
                /// <param name="key" type="String">O nome da chave para ser removida.</param>
                remove(obj, key);
            };

            this.removeAll = function () {
                /// <summary>
                /// Remove todos os valores do serviço de armazenamento.
                /// </summary>
                removeAll(obj);
            };

            return this;
        };

        //Define os acessos do namespace.
        self.local = new base("localStorage");
        self.session = new base("sessionStorage");

        return self;
    };
    _commonjs.string = new function () {
        var self = this;

        self.contains = function (string, cmp, ignoreCase) {
            /// <summary>Verifica se um texo contém a entrada indicada.</summary>
            /// <param name="string" type="String">Texto para ser verificado.</param>
            /// <param name="cmp" type="String">Entrada para ser testada.</param>
            /// <param name="ignoreCase" type="Boolean">Se deve ignorar a caixa do texto.</param>
            return ignoreCase ? string.toLowerCase().indexOf(cmp.toLowerCase()) > 0 : string.indexOf(cmp) > 0;
        };

        self.endsWith = function (string, cmp) {
            /// <summary>Verifica se um texo inicia com a entrada indicada.</summary>
            /// <param name="string" type="String">Texto para ser verificado.</param>
            /// <param name="cmp" type="String">Entrada para ser testada.</param>
            return (string.substr(string.length - cmp.length) === cmp);
        };

        self.insertAt = function (string, index, value) {
            /// <summary>Insere um conteúdo a partir do índice desejado do texto.</summary>
            /// <param name="string" type="String">Texto para inserir o conteúdo.</param>
            /// <param name="index" type="Number">Posição para inserir o conteúdo no texto.</param>
            /// <param name="value" type="String">Conteúdo para ser inserido.</param>
            return string.replace(/./g, function (v, i) {
                return i === index - 1 ? v + value : v;
            });
        };

        self.isNullOrEmpty = function (value) {
            /// <summary>Verifica se um texto é nulo ou vazio.</summary>
            /// <param name="value" type="String">Texto para ser verificado.</param>
            return value === null || value === undefined || (self.trim(self.normalize(value.toString()))) === "";
        };

        self.format = function (string) {
            /// <summary>Formata valores dentro de um texto.</summary>
            /// <param name="string" type="String">Texto para ser formatado.</param>
            /// <param name="args" type="Object">Valores para formatar na string.</param>

            var args = arguments;

            var rx1 = /\{(\d|\d\d)\}/g,
                rx2 = /\d+/;
            return string.replace(rx1, function ($0) {
                var idx = 1 * $0.match(rx2)[0];

                if (!args || args.length <= idx + 1)
                    throw "{" + idx + "} not found in arguments!";

                idx++;

                return args[idx] !== undefined ? args[idx] : (args[idx] === "" ? "" : $0);
            });
        };

        self.normalize = function (value) {
            /// <summary>Aplica a normalização de um texto, removendo espaços duplos e desnecessários no inicio fim do mesmo.</summary>
            /// <param name="value" type="String">Texto para ser normalizado.</param>
            return value.replace(/\s{2,}/g, " ");
        };

        self.padLeft = function (value, chr, length) {
            /// <summary>Constrói um texto novo com o tamanho definido, preenchido com o carácter desejado, alinhando à esquerda.</summary>
            /// <param name="value" type="String">Texto para ser preenchido.</param>
            /// <param name="chr" type="String">Caracter para ser utilizado no preenchimento.</param>
            /// <param name="length" type="String">Tamanho total do novo texto preenchido.</param>
            var nv = "";
            if (length > value.length)
                for (var i = 0; i < (length - value.length) ; i++)
                    nv += chr;

            return nv + value;
        };

        self.padRight = function (value, chr, length) {
            /// <summary>Constrói um texto novo com o tamanho definido, preenchido com o carácter desejado, alinhando à direita.</summary>
            /// <param name="value" type="String">Texto para ser preenchido.</param>
            /// <param name="chr" type="String">Caracter para ser utilizado no preenchimento.</param>
            /// <param name="length" type="String">Tamanho total do novo texto preenchido.</param>
            var nv = value;
            if (length > value.length)
                for (var i = 0; i < (length - value.length) ; i++)
                    nv += chr;

            return nv;
        };

        self.startsWith = function (string, cmp) {
            /// <summary>Verifica se um texto inicia com a entrada indicada.</summary>
            /// <param name="string" type="String">Texto para ser verificado.</param>
            /// <param name="cmp" type="String">Entrada para ser testada.</param>
            return (string.substr(0, cmp.length) === cmp);
        };

        self.trim = function (value) {
            /// <summary>Remove espaços desnecessários à esquerda e direita de um texto.</summary>
            /// <param name="value" type="String">Texto para remover os espaços.</param>
            return value.replace(/^\s+/, "").replace(/\s+$/, "");
        };

        return self;
    };
    _commonjs.utils = new function () {
        var self = this;

        self.cloneObject = function (obj) {
            /// <summary>Clona de modo profundo um objeto.</summary>
            /// <param name="obj" type="Object">Objeto a ser clonado.</param>
            try {
                if (obj instanceof Array) {
                    var n = [];
                    for (var i = 0; i < obj.length; i++)
                        n.push($.extend(true, {}, obj[i]));

                    return n;
                }
                return $.extend(true, {}, obj);
            } catch (e) {
                //jQuery não encontrado, faz manual.
                return JSON.parse(JSON.stringify(obj));
            }
        };

        self.getUrlParameter = function (name) {
            /// <summary>Retorna o valor parâmetro contido na url, caso exista.</summary>
            /// <param name="name" type="String">Nome do parâmetro para ser recuperado.</param>
            return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)', "i").exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null;
        };

        self.getNumbers = function (value) {
            /// <summary>Retorna apenas os números de um texto.</summary>
            /// <param name="value" type="String">Texto para extrair os números.</param>
            if (typeof (value) !== "string")
                return 0;

            return value.replace(/\D+/g, "");
        };

        self.getServerError = function (error) {
            /// <summary>Trata e retorna a informação do objeto de erro do servidor.</summary>
            /// <param name="error" type="String">Erro para ser tratado.</param>
            try {
                return JSON.parse(error.responseText);
            } catch (e) {
                return {
                    type: error.status,
                    message: commonjs.string.isNullOrEmpty(error.responseText)
                        ? commonjs.string.isNullOrEmpty(error.statusText)
                        ? error.status
                        : error.statusText
                        : error.responseText
                };
            }
        };

        self.timeout = new function () {
            /// <summary>Fornece opções para timeout de interação de usuário.</summary>
            var me = this;

            var __TIMEOUT, __ELAPSED, __TIME;

            me.clear = function () {
                /// <summary>Remove o timeout aplicado a sessão do usuário atual.</summary>
                clearInterval(__TIMEOUT);
                __TIMEOUT = __ELAPSED = __TIME = null;
            };

            me.set = function (timeout, callback) {
                /// <summary>Define o timeout de uso na sessão atual do usuário.</summary>
                /// <param name="callback" type="Function">Chamada a ser executada quando o tempo limite for atingido.</param>
                if (__TIMEOUT != null) {
                    console.log("Timeout is already set.");
                    return;
                }

                __ELAPSED = __TIME = timeout;
                $(document).on("scroll click keyup", function () {
                    __ELAPSED = __TIME;
                });

                __TIMEOUT = setInterval(function () {
                    if (__ELAPSED == 0) {
                        me.clear();
                        if (typeof (callback) === "function")
                            callback();
                    } else __ELAPSED -= 1;
                }, 1000);
            };

            me.renew = function () {
                /// <summary>Renova o timeout de uso na sessão atual do usuário.</summary>
                __ELAPSED = __TIME;
            };

            return me;
        };

        return self;
    };
    _commonjs.validate = new function () {
        var self = this;

        self.clearFormat = function (clearing) {
            return clearing.replace(/\D+/g, "");
        };

        self.formatCPF = function (cpf) {
            if (cpf && typeof (cpf) === "string") {
                cpf = cpf.replace(/\D/g, "");

                if (cpf.length > 3) {
                    cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2");

                    if (cpf.length > 6) {
                        cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2");

                        if (cpf.length > 9) {
                            cpf = cpf.replace(/(\d{3})(\d)/, "$1-$2");
                        }
                    }
                }
            }
            return cpf;
        };

        self.formatCNPJ = function (cnpj) {
            if (cnpj && typeof (cnpj) === "string") {
                cnpj = cnpj.replace(/\D/g, "");

                if (cnpj.length > 2) {
                    cnpj = cnpj.replace(/(\d{2})(\d)/, "$1.$2");

                    if (cnpj.length > 5) {
                        cnpj = cnpj.replace(/(\d{3})(\d)/, "$1.$2");

                        if (cnpj.length > 8) {
                            cnpj = cnpj.replace(/(\d{3})(\d)/, "$1/$2");

                            if (cnpj.length > 12) {
                                cnpj = cnpj.replace(/(\d{4})(\d)/, "$1-$2");
                            }
                        }
                    }
                }
            }
            return cnpj;
        }

        self.CPF = function (cpf) {
            /// <summary>Verifica se um CPF é válido.</summary>
            /// <param name="cpf" type="String">CPF para ser verificado.</param>
            if (cpf == null)
                return false;

            cpf = cpf.replace(/\D+/g, "");

            if (cpf == '')
                return false;

            if (cpf.length != 11)
                return false;

            var soma = 0;
            var rest;

            if (cpf.length < 11 && self.isNumber(cpf))
                return false;

            switch (cpf) {
                case "00000000000":
                case "11111111111":
                case "22222222222":
                case "33333333333":
                case "44444444444":
                case "55555555555":
                case "66666666666":
                case "77777777777":
                case "88888888888":
                case "99999999999":
                    return false;
            }

            var i;
            for (i = 1; i <= 9; i++)
                soma = soma + parseInt(cpf.substring(i - 1, i)) * (11 - i);

            rest = (soma * 10) % 11;

            if ((rest == 10) || (rest == 11))
                rest = 0;

            if (rest != parseInt(cpf.substring(9, 10)))
                return false;

            soma = 0;
            for (i = 1; i <= 10; i++)
                soma = soma + parseInt(cpf.substring(i - 1, i)) * (12 - i);

            rest = (soma * 10) % 11;

            if ((rest == 10) || (rest == 11))
                rest = 0;

            if (rest != parseInt(cpf.substring(10, 11)))
                return false;

            return true;
        };

        self.CNPJ = function (cnpj) {
            /// <summary>Verifica se um CNPJ é válido.</summary>
            /// <param name="cnpj" type="String">CNPJ para ser verificado.</param>
            if (cnpj == null)
                return false;

            cnpj = cnpj.replace(/\D+/g, "");

            if (cnpj == '')
                return false;

            if (cnpj.length != 14)
                return false;

            // Elimina CNPJs invalidos conhecidos
            if (cnpj == "00000000000000" ||
                cnpj == "11111111111111" ||
                cnpj == "22222222222222" ||
                cnpj == "33333333333333" ||
                cnpj == "44444444444444" ||
                cnpj == "55555555555555" ||
                cnpj == "66666666666666" ||
                cnpj == "77777777777777" ||
                cnpj == "88888888888888" ||
                cnpj == "99999999999999")
                return false;

            // Valida DVs
            var tamanho = cnpj.length - 2;
            var numeros = cnpj.substring(0, tamanho);
            var digitos = cnpj.substring(tamanho);
            var soma = 0;
            var pos = tamanho - 7;
            var i;

            for (i = tamanho; i >= 1; i--) {
                soma += numeros.charAt(tamanho - i) * pos--;
                if (pos < 2)
                    pos = 9;
            }
            var resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
            if (resultado != digitos.charAt(0))
                return false;

            tamanho = tamanho + 1;
            numeros = cnpj.substring(0, tamanho);
            soma = 0;
            pos = tamanho - 7;
            for (i = tamanho; i >= 1; i--) {
                soma += numeros.charAt(tamanho - i) * pos--;
                if (pos < 2)
                    pos = 9;
            }
            resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
            if (resultado != digitos.charAt(1))
                return false;

            return true;
        };

        self.date = function (date) {
            /// <summary>Verifica se uma data é válida.</summary>
            /// <param name="date" type="String">Data para ser validada.</param>
            var dt = date.split("/") || [];
            if (dt.length == 3) {
                var day = parseInt(dt[0], 10),
                    month = parseInt(dt[1], 10),
                    year = parseInt(dt[2]);

                // Um ano tem 12 meses, verifica o intervalo.
                if (month < 1 || month > 12)
                    return false;

                // Testa o dia caso for fevereiro, com ano bisexto.
                if (month == 2 && day > (((year % 4 == 0) && ((!(year % 100 == 0)) || (year % 400 == 0))) ? 29 : 28))
                    return false;

                // Testa o número de dias nos meses com até 30 dias.
                if ((month == 4 || month == 6 || month == 9 || month == 10) && day > 30)
                    return false;

                // Valida os outros meses que vão até 31 dias.
                if (day < 1 || day > 31)
                    return false;

                return true;
            }
            return false;
        };

        self.isMobile = function () {
            /// <summary>Verifica se o browser atual é mobile.</summary>
            var nav = (navigator.userAgent || navigator.vendor || window.opera);
            if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge|maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|android|ipad|playbook|silk|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(nav) ||
                /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(nav.substr(0, 4)))
                return true;

            return false;
        };

        self.isNumber = function (value) {
            /// <summary>Verifica se um texto é formado de números.</summary>
            /// <param name="value" type="String">Text para ser verificado.</param>
            return !isNaN(value - 0);
        };

        self.RENAVAM = function (renavam) {
            /// <summary>Verifica se o RENAVAM informado é válido.</summary>
            /// <param name="renavam" type="String">RENAVAM para ser verificado.</param>
            if (renavam == null)
                return false;

            renavam = this.padLeft(renavam, '0', 11);

            if (renavam == "00000000000")
                return false;

            var soma = 0,
                dv = parseInt(renavam[10]);

            soma += parseInt(renavam[0]) * 3;
            soma += parseInt(renavam[1]) * 2;
            soma += parseInt(renavam[2]) * 9;
            soma += parseInt(renavam[3]) * 8;
            soma += parseInt(renavam[4]) * 7;
            soma += parseInt(renavam[5]) * 6;
            soma += parseInt(renavam[6]) * 5;
            soma += parseInt(renavam[7]) * 4;
            soma += parseInt(renavam[8]) * 3;
            soma += parseInt(renavam[9]) * 2;

            soma *= 10;

            var rest = soma % 11;

            return (rest > 9 || dv === rest);
        };

        self.email = function (email) {
            /// <summary>Verifica se o Email informado é válido.</summary>
            /// <param name="email" type="String">Email para ser verificado.</param>
            return /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i.test(email);
        };

        return self;
    };
    return (window.commonjs = window.$c = _commonjs);
}));
/*jslint evil: true, regexp: true */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (typeof JSON !== 'object') {
    JSON = {};
}

(function () {
    'use strict';

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function () {

            return isFinite(this.valueOf()) ? this.getUTCFullYear() + '-' +
                f(this.getUTCMonth() + 1) + '-' +
                f(this.getUTCDate()) + 'T' +
                f(this.getUTCHours()) + ':' +
                f(this.getUTCMinutes()) + ':' +
                f(this.getUTCSeconds()) + 'Z' : null;
        };

        String.prototype.toJSON =
            Number.prototype.toJSON =
            Boolean.prototype.toJSON = function () {
                return this.valueOf();
            };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {
            // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"': '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

        // If the string contains no control characters, no quote characters, and no
        // backslash characters, then we can safely slap some quotes around it.
        // Otherwise we must also replace the offending characters with safe escape
        // sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

        // Produce a string from holder[key].

        var i, // The loop counter.
            k, // The member key.
            v, // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

        // If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
            typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

        // If we were called with a replacer function, then call the replacer to
        // obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

        // What happens next depends on the value's type.

        switch (typeof value) {
            case 'string':
                return quote(value);
            case 'number':
                // JSON numbers must be finite. Encode non-finite numbers as null.

                return isFinite(value) ? String(value) : 'null';
            case 'boolean':
            case 'null':
                // If the value is a boolean or null, convert it to a string. Note:
                // typeof null does not produce 'null'. The case is included here in
                // the remote chance that this gets fixed someday.

                return String(value);
                // If the type is 'object', we might be dealing with an object or an array or
                // null.
            case 'object':
                // Due to a specification blunder in ECMAScript, typeof null is 'object',
                // so watch out for that case.

                if (!value) {
                    return 'null';
                }

                // Make an array to hold the partial results of stringifying this object value.

                gap += indent;
                partial = [];

                // Is the value an array?

                if (Object.prototype.toString.apply(value) === '[object Array]') {

                    // The value is an array. Stringify every element. Use null as a placeholder
                    // for non-JSON values.

                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || 'null';
                    }

                    // Join all of the elements together, separated with commas, and wrap them in
                    // brackets.

                    v = partial.length === 0 ? '[]' : gap ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' : '[' + partial.join(',') + ']';
                    gap = mind;
                    return v;
                }

                // If the replacer is an array, use it to select the members to be stringified.

                if (rep && typeof rep === 'object') {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        if (typeof rep[i] === 'string') {
                            k = rep[i];
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                } else {

                    // Otherwise, iterate through all of the keys in the object.

                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                }

                // Join all of the member texts together, separated with commas,
                // and wrap them in braces.

                v = partial.length === 0 ? '{}' : gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' : '{' + partial.join(',') + '}';
                gap = mind;
                return v;
        }
    }

    // If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

            // The stringify method takes a value and an optional replacer, and an optional
            // space parameter, and returns a JSON text. The replacer can be a function
            // that can replace values, or an array of strings that will select the keys.
            // A default replacer method can be provided. Use of the space parameter can
            // produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

            // If the space parameter is a number, make an indent string containing that
            // many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

                // If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

            // If there is a replacer, it must be a function or an array.
            // Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

            // Make a fake root object containing our value under the key of ''.
            // Return the result of stringifying the value.

            return str('', {
                '': value
            });
        };
    }


    // If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

            // The parse method takes a text and an optional reviver function, and returns
            // a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

                // The walk method is used to recursively walk the resulting structure so
                // that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


            // Parsing happens in four stages. In the first stage, we replace certain
            // Unicode characters with escape sequences. JavaScript handles many characters
            // incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

            // In the second stage, we run the text against regular expressions that look
            // for non-JSON patterns. We are especially concerned with '()' and 'new'
            // because they can cause invocation, and '=' because it can cause mutation.
            // But just to be safe, we want to reject all unexpected forms.

            // We split the second stage into 4 regexp operations in order to work around
            // crippling inefficiencies in IE's and Safari's regexp engines. First we
            // replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
            // replace all simple value tokens with ']' characters. Third, we delete all
            // open brackets that follow a colon or comma or that begin the text. Finally,
            // we look to see that the remaining characters are only whitespace or ']' or
            // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                    .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                    .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

                // In the third stage we use the eval function to compile the text into a
                // JavaScript structure. The '{' operator is subject to a syntactic ambiguity
                // in JavaScript: it can begin a block or an object literal. We wrap the text
                // in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

                // In the optional fourth stage, we recursively walk the new structure, passing
                // each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ? walk({
                    '': j
                }, '') : j;
            }

            // If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());
