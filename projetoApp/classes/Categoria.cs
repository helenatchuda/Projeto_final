using System;
using System.Text.Json.Serialization;

namespace ProjetoApp.Classes
{
  public class Categoria
{
    public Guid Id { get; private set; }
    public string Nome { get; private set; }

    public Categoria(string nome)
    {
        Id = Guid.NewGuid();
        SetNome(nome);
    }

    [JsonConstructor]
    private Categoria() { }

    public void EditarNome(string novoNome) => SetNome(novoNome);

    private void SetNome(string nome)
    {
        if (string.IsNullOrWhiteSpace(nome))
            throw new ArgumentException("O nome não pode estar vazio.", nameof(nome));

        Nome = nome.Trim();
    }

    public override string ToString() => Nome;
}
}
