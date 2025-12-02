using System;
using System.Text.Json.Serialization;

namespace ProjetoApp.Classes
{
    public class Categoria
    {
        public Guid Id { get; private set; }
        public string Nome { get; private set; }

        // Construtor para nova categoria
        public Categoria(string nome)
        {
            if (string.IsNullOrWhiteSpace(nome))
                throw new ArgumentException("O nome da categoria não pode estar vazio.", nameof(nome));

            Id = Guid.NewGuid();
            Nome = nome;
        }

        // Construtor vazio para desserialização JSON
        [JsonConstructor]
        public Categoria() { }

        // Método para editar o nome da categoria
        public void EditarNome(string novoNome)
        {
            if (string.IsNullOrWhiteSpace(novoNome))
                throw new ArgumentException("O novo nome da categoria não pode estar vazio.", nameof(novoNome));
            
            Nome = novoNome;
        }

        public override string ToString() => Nome;
    }
}
