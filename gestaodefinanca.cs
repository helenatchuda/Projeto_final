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
}
