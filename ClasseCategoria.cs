using System;
using System.Collections.Generic;

namespace GestaoFinancasPessoais.Models
{
    /// <summary>
    /// Representa uma categoria personalizada criada pelo utilizador
    /// (ex: Alimentação, Transportes, Lazer).
    /// </summary>
    public class Categoria
    {
        public int Id { get; set; }  // Identificador único
        public string Nome { get; set; } = string.Empty;  // Ex: "Alimentação"
        public string Descricao { get; set; } = string.Empty;  // Ex: "Gastos com alimentação e restaurantes"
        public int UsuarioId { get; set; }  // ID do utilizador dono da categoria

        public Categoria() { }

        public Categoria(string nome, string descricao, int usuarioId)
        {
            Nome = nome;
            Descricao = descricao;
            UsuarioId = usuarioId;
        }

        public override string ToString()
        {
            return $"{Nome} - {Descricao}";
        }
    }
}