using System;

namespace GestaoFinancasPessoais.Models
{
    /// <summary>
    /// Representa uma despesa (gasto) feita por um utilizador.
    /// Contém descrição, valor, data e categoria associada.
    /// </summary>
    public class Despesa
    {
        public int Id { get; set; }  // Identificador único
        public string Descricao { get; set; } = string.Empty;  // Ex: "Jantar no restaurante"
        public decimal Valor { get; set; }  // Ex: 25.50
        public DateTime Data { get; set; }  // Ex: 2025-11-05
        public int UsuarioId { get; set; }  // ID do utilizador que registou a despesa

        // Associação à categoria
        public int CategoriaId { get; set; }  // FK (se usar BD relacional)
        public Categoria Categoria { get; set; } = new Categoria();  // Categoria associada

        public Despesa() { }

        public Despesa(string descricao, decimal valor, DateTime data, Categoria categoria, int usuarioId)
        {
            if (valor <= 0)
                throw new ArgumentException("O valor da despesa deve ser maior que zero.");

            Descricao = descricao;
            Valor = valor;
            Data = data;
            Categoria = categoria;
            CategoriaId = categoria.Id;
            UsuarioId = usuarioId;
        }

        public override string ToString()
        {
            return $"{Data:dd/MM/yyyy} - {Descricao} ({Categoria.Nome}) | Valor: {Valor:C}";
        }
    }
}
