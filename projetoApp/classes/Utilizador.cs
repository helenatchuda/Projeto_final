using System;
using System.Collections.Generic;
using System.Linq;

namespace ProjetoApp.Classes
{
    public class Utilizador
    {
        // =================================
        // 1. PROPRIEDADES DE UTILIZADOR
        // =================================
        public Guid Id { get; set; }
        public string Nome { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; } // Armazenar o hash da password (boa prática)
        public bool Activo { get; set; } = true;
        public bool EstadoLogado { get; private set; } = false;

        // ====================================================
        // 2. PROPRIEDADES DE TRANSAÇÕES (Adicionadas/Verificadas)
        // ====================================================
        public List<Receita> Receitas { get; set; } = new List<Receita>();
        public List<Despesa> Despesas { get; set; } = new List<Despesa>();


        // =================================
        // 3. CONSTRUTOR
        // =================================
        public Utilizador(string nome, string email, string password)
        {
            // Validações básicas (opcional, mas recomendado)
            if (string.IsNullOrWhiteSpace(nome) || string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
            {
                throw new ArgumentException("Todos os campos devem ser preenchidos.");
            }

            Id = Guid.NewGuid();
            Nome = nome;
            Email = email;
            PasswordHash = HashPassword(password); // Assumindo método de hash
        }

        // Construtor sem argumentos (necessário para serialização JSON)
        public Utilizador() { }


        // =================================
        // 4. MÉTODOS DE AUTENTICAÇÃO
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

        // MÉTODOS AUXILIARES (Simulados - você deve ter a sua implementação real)
        private string HashPassword(string password) => password; // Mantenha a sua lógica real de hash
        private bool VerifyPassword(string providedPassword, string storedHash) => providedPassword == storedHash;
        
        // ===================================================
        // 5. MÉTODOS DE GESTÃO DE TRANSAÇÕES (O seu pedido)
        // ===================================================

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
