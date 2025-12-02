using System;
using System.Text.Json.Serialization;

namespace ProjetoApp.Classes
{
    // Receita herda de Transacao
    public class Receita : Transacao 
    {
        // O construtor chama o construtor da classe base (base(...))
        public Receita(Guid utilizadorId, decimal valor, string descricao, Guid categoriaId)
            : base(utilizadorId, valor, descricao, categoriaId)
        {
        }

        // Construtor vazio para desserialização JSON
        [JsonConstructor]
        public Receita() : base() { }

    }
}