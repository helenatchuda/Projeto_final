using System.Text.Json.Serialization;

namespace ProjetoApp.Classes
{
    public class Receita
    {
        private decimal _valor;
        private string _descricao;

        public Guid Id { get; private set; }
        public Guid UtilizadorId { get; private set; }
        public DateTime Data { get; private set; }

        public decimal Valor
        {
            get => _valor;
            private set
            {
                if (value <= 0)
                    throw new ArgumentException("O valor deve ser maior que zero.");
                _valor = value;
            }
        }

        public string Descricao
        {
            get => _descricao;
            private set
            {
                if (string.IsNullOrWhiteSpace(value))
                    throw new ArgumentException("A descrição não pode estar vazia.");
                _descricao = value;
            }
        }

        public Receita(Guid utilizadorId, decimal valor, string descricao)
        {
            Id = Guid.NewGuid();
            UtilizadorId = utilizadorId;
            Valor = valor;
            Descricao = descricao;
            Data = DateTime.UtcNow;
        }

        [JsonConstructor]
        public Receita() { }

        public void Editar(decimal novoValor, string novaDescricao)
        {
            Valor = novoValor;
            Descricao = novaDescricao;
        }
    }
}