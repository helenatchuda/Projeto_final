using System;
using System.Collections.Generic;
using System.Linq;
namespace gestaodefinanca
{
    class Utilizador
    {
        private string nome;
        private string email;
        private string password;
    }
    class Despesa
    {
        private int id;
        public decimal Valor;
        public DateTime Data;
        public string Descricao;
        public Categoria Categoria;
        public Utilizador Utilizador;
    }
    class Receita
    {
        private int id;
        public decimal Valor;
        public DateTime Data;
        public string Descricao;
        public Categoria Categoria;
        public Utilizador Utilizador;
    }
    class Categoria
    {
        private int id;
        public string Nome;
        public string Descricao;
    }
    public class GeradorRelatorios
    {
        public decimal CalcularTotalReceitas(List<Receita> receitas)
        {
            return receitas?.Sum(r => r.Valor) ?? 0;
        }

        public decimal CalcularTotalDespesas(List<Despesa> despesas)
        {
            return despesas?.Sum(d => d.Valor) ?? 0;
        }

        public decimal CalcularSaldo(decimal totalReceitas, decimal totalDespesas)
        {
            return totalReceitas - totalDespesas;
        }

        public void ExibirResumo;
    }
}
