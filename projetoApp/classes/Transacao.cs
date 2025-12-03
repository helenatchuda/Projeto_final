using System;
using System.Text.Json.Serialization;

namespace ProjetoApp.Classes
{
    // Classe abstrata para representar atributos comuns a Receita e Despesa
    public abstract class Transacao
    {
        private decimal _valor = 0m;
        private string _descricao = string.Empty;
        
        public Guid Id { get; private set; }
        public Guid UtilizadorId { get; private set; } // Quem registou a transação
        public DateTime Data { get; private set; }
        public Guid CategoriaId { get; set; } // ID da Categoria a que pertence
        
        // Propriedade Valor com validação para garantir que é positivo
        public decimal Valor
        {
            get => _valor;
            set
            {
                if (value <= 0)
                    throw new ArgumentException("O valor deve ser maior que zero.", nameof(Valor));
                _valor = value;
            }
        }

        // Propriedade Descricao com validação
        public string Descricao
        {
            get => _descricao;
            set
            {
                if (string.IsNullOrWhiteSpace(value))
                    throw new ArgumentException("A descrição não pode estar vazia.", nameof(Descricao));
                _descricao = value;
            }
        }

        // Construtor para a classe base
        protected Transacao(Guid utilizadorId, decimal valor, string descricao, Guid categoriaId)
        {
            Id = Guid.NewGuid();
            UtilizadorId = utilizadorId;
            // A atribuição usa os setters que contêm a lógica de validação
            Descricao = descricao;
            Valor = valor;
            CategoriaId = categoriaId;
            Data = DateTime.UtcNow; 
        }

        // Construtor vazio necessário para desserialização JSON (System.Text.Json)
        [JsonConstructor]
        protected Transacao() { }


        public void Editar(decimal novoValor, string novaDescricao, Guid novaCategoriaId)
        {
            Valor = novoValor;
            Descricao = novaDescricao;
            CategoriaId = novaCategoriaId;
        }
    }
}