using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Schalter.Plugin;
using Schalter.Plugin.Base;
using Schalter.Plugin.Handle;
using Schalter.Plugin.JS;

namespace first_smp
{
    /* 
     * Identifica o plug-in:
     * De modo a evitar duplicação, por convenção, é utilizado o autor como prefixo.
     */

    [PluginIdentification("Enterprisefirst_smp"
        , Name = "Plugin Name"
        , Description = "Plugin Description"
        , Author = "Enterprise name")]
    //Identifica a página principal.
    [MainHtmlPage("Título da página principal", "Default.html")]
    //Identifica o arquivo de JSON de configuração.
    [ConfigurationItem("Configuração do plugin first_smp", "ConfigSchema.json")]
    public class Plugin1 : Operational
    {
        #region Overrides of Operational

        public override void InicializaPlugin()
        {
            //Obtém o caminho para o pasta onde o plug-in reside.
            //string pluginFolderPath = Host.Environment.WorkFolder;

            /* Obtém a configuração específica ao plug-in. 
                 * A definição desta configuração específica está localizada no arquivo 'ConfigSchema.json' na pasta HTML.
                 * - O JSON de configuração tem de estar duplicado para cada linguagem a suportar.
                 * - Todos os usuários do TMS que editem esta configuração têm de estar configurados sob esta linguagem.
                 * O JSON é interpretado utilizado uma lib JavaScript:
                 * http://jeremydorn.com/json-editor/
                 * https://github.com/jdorn/json-editor
                 * Esta lib foi modificada para:
                 * - Adicionar a funcionalidade do atributo 'required' a campos string.
                 * - Criar um atributo 'attributes' que permite a adição de atributos 
                 *   ao HTML dos controlos de edição gerados pela lib (Nomeadamente o atributo 
                 *   'data-vkeyboard' que permite a navegação no formulário de preenchimento num toutch-screen
                 *   utilizando o teclado virtual para o efeito).
                 */

            //dynamic pluginConfiguration = this.GetConfiguration<dynamic>();
        }

        #endregion


        //Conjunto de métodos visíveis por javascript
        //Devem ser marcados com o atributo [BrowserVisible]

        #region UI Access Methods

        //Função Assíncrona (libera execução do javascript, o retorno é capturado através das funcções "Callback" passadas por parâmetro)
        [BrowserVisible]
        public Callback FuncaoAssincrona(string Param1, int Param2, bool Param3, Callback Success, Callback Error)
        {
            try
            {
                Success.Parameters.Add(Param1);
                Success.Parameters.Add(Param2);
                Success.Parameters.Add(Param3);

                return Success;
            }
            catch (Exception ex)
            {
                //Grava erro na tabela de erros do equipamento
                //Os erros são sincronizados com o TMS
                Host.StoreError(this, ex);

                //Retorna o erro para o plugin
                Error.Parameters.Add(new WebException(ex));
                return Error;
            }
        }

        //Função Síncrona (trava execução do javascript até o retorno)
        [BrowserVisible]
        public string FuncaoSincrona(string Param1)
        {
            try
            {
                return "OK";
            }
            catch (Exception ex)
            {
                //Grava erro na tabela de erros do equipamento
                //Os erros são sincronizados com o TMS
                Host.StoreError(this, ex);
                return "Problema...";
            }
        }

        //Método (Métodos são assíncronos por padrão)
        [BrowserVisible]
        public void MetodoTeste(string Param1)
        {
            try
            {
                //Executa método enquanto o javascript já está liberado para execução
            }
            catch (Exception ex)
            {
                //Grava erro na tabela de erros do equipamento
                //Os erros são sincronizados com o TMS
                Host.StoreError(this, ex);
            }
        }

        #endregion
    }
}