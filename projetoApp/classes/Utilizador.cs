using System;
using System.Collections.Generic;
using System.Linq;

namespace ProjetoApp.Classes
{
    public class Utilizador
    {
        public Guid Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public bool Activo { get; set; } = true;
        public bool EstadoLogado { get; private set; } = false;

        // Propriedades de Transações
        public List<Receita> Receitas { get; set; } = new List<Receita>();
        public List<Despesa> Despesas { get; set; } = new List<Despesa>();
        // REMOVIDA: public List<Categoria> Categorias { get; set; } = new List<Categoria>(); (Gestão global)


        public Utilizador(string nome, string email, string password)
        {
            if (string.IsNullOrWhiteSpace(nome) || string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
            {
                throw new ArgumentException("Todos os campos devem ser preenchidos.");
            }

            Id = Guid.NewGuid();
            Nome = nome;
            Email = email;
            PasswordHash = HashPassword(password);
        }

        // Construtor sem argumentos (necessário para serialização JSON)
        public Utilizador() { }


        // =================================
        // MÉTODOS DE AUTENTICAÇÃO E ESTADO
        // =================================

        public void FazerLogin(string password)
        {
            if (!VerifyPassword(password, PasswordHash))
            {
                throw new InvalidOperationException("Password incorreta.");
            }
            if (!Activo)
            {
                throw new InvalidOperationException("Conta inativa.");
            }

            EstadoLogado = true;
        }

        public void FazerLogout()
        {
            EstadoLogado = false;
        }
        
        public void Suspender()
        {
            if (!this.Activo) return; 
            this.Activo = false;
            this.EstadoLogado = false;
        }

        public void Ativar()
        {
            this.Activo = true;
        }

        // 🚨 LEMBRETE DE SEGURANÇA: Substitua estes métodos!
        private string HashPassword(string password) => password; 
        private bool VerifyPassword(string providedPassword, string storedHash) => providedPassword == storedHash;
        
        // =================================
        // MÉTODOS DE CÁLCULO E GESTÃO DE TRANSAÇÕES
        // =================================

        public void AdicionarReceita(Receita receita)
        {
            if (receita.UtilizadorId != this.Id)
                throw new InvalidOperationException("Tentativa de adicionar transação de outro utilizador.");
            
            Receitas.Add(receita);
        }

        public void AdicionarDespesa(Despesa despesa)
        {
            if (despesa.UtilizadorId != this.Id)
                throw new InvalidOperationException("Tentativa de adicionar transação de outro utilizador.");
            
            Despesas.Add(despesa);
        }
        
        public decimal CalcularSaldo()
        {
            decimal totalReceitas = Receitas.Sum(r => r.Valor);
            decimal totalDespesas = Despesas.Sum(d => d.Valor);
            return totalReceitas - totalDespesas;
        }
    }
}