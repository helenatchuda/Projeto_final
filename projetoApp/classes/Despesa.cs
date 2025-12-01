using System;
using System.Text.Json.Serialization;

namespace ProjetoApp.Classes
{
    // Despesa herda de Transacao
    public class Despesa : Transacao 
    {
        // O construtor chama o construtor da classe base (base(...))
        public Despesa(Guid utilizadorId, decimal valor, string descricao, Guid categoriaId)
            : base(utilizadorId, valor, descricao, categoriaId)
        {
        }

        // Construtor vazio para desserialização JSON
        [JsonConstructor]
        public Despesa() : base() { }

        // Outros métodos específicos de Despesa (se necessário)
    }
}