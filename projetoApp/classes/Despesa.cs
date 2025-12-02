using System;

namespace ProjetoApp.Classes
{
    public class Despesa
    {
        public Guid Id { get; set; }
        public Guid UtilizadorId { get; set; }
        public decimal Valor { get; set; }
        public string Descricao { get; set; }
        public Guid CategoriaId { get; set; }
        public DateTime Data { get; set; }

        // Construtor usado no DespesaController.Criar()
        public Despesa(Guid utilizadorId, decimal valor, string descricao, Guid categoriaId)
        {
            // Validações básicas
            if (valor <= 0)
                throw new ArgumentException("O valor da despesa deve ser positivo.");

            Id = Guid.NewGuid();
            UtilizadorId = utilizadorId;
            Valor = valor;
            Descricao = descricao;
            CategoriaId = categoriaId;
            Data = DateTime.Now;
        }

        // Construtor sem argumentos (para serialização/deserialização)
        public Despesa() { }

        // Método usado no DespesaController.Editar()
        public void Editar(decimal novoValor, string novaDescricao, Guid novaCategoriaId)
        {
            if (novoValor <= 0)
                throw new ArgumentException("O novo valor deve ser positivo.");

            Valor = novoValor;
            Descricao = novaDescricao;
            CategoriaId = novaCategoriaId;
        }
    }
}