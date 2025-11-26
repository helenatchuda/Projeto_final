using System; // Necessário para Guid, DateTime, ArgumentException
using System.Security.Cryptography;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;

namespace ProjetoApp.Classes
{
    /// <summary>
    /// Classe que representa um utilizador do sistema.
    /// Implementa validação, hashing de password, login e gestão de conta.
    /// </summary>
    public class Utilizador
    {
        private const int SaltSize = 16; 
        private const int KeySize = 32;  
        private const int Iterations = 10000; 

        public Guid Id { get; private set; }
        public string Nome { get; private set; }
        public string Email { get; private set; }
        
        [JsonInclude] 
        public string _passwordHash { get; private set; } = String.Empty;
        
        [JsonInclude]
        public string _passwordSalt { get; private set; } 
        
        public DateTime DataCriacao { get; private set; }
        public bool EstadoLogado { get; private set; }
        public bool Activo { get; private set; }
        public DateTime? DataUltimoLogin { get; private set; }

        
        // ★ NECESSÁRIO para carregar dados do JSON
        public List<Receita> Receitas { get; set; } = new List<Receita>();

        // ★ Construtor vazio para desserialização JSON
        public Utilizador() { }

        public Utilizador(string nome, string email, string password)
        {
            
            if (string.IsNullOrWhiteSpace(nome))
                throw new ArgumentException("Nome não pode estar vazio.", nameof(nome));
            if (string.IsNullOrWhiteSpace(email) || !IsValidEmail(email))
                throw new ArgumentException("Email inválido.", nameof(email));
            if (string.IsNullOrWhiteSpace(password))
                throw new ArgumentException("Password não pode estar vazia.", nameof(password));

         
            Id = Guid.NewGuid(); 
            Nome = nome;         
            Email = email;
            SetPassword(password);
            DataCriacao = DateTime.UtcNow;
            EstadoLogado = false;
            Activo = true;
        }

     

        private void SetPassword(string password)
        {
            using (var rng = RandomNumberGenerator.Create())
            {
                byte[] salt = new byte[SaltSize];
                rng.GetBytes(salt);
                _passwordSalt = Convert.ToBase64String(salt);

                using (var pbkdf2 = new Rfc2898DeriveBytes(password, salt, Iterations, HashAlgorithmName.SHA256))
                {
                    byte[] hash = pbkdf2.GetBytes(KeySize);
                    _passwordHash = Convert.ToBase64String(hash);
                }
            }
        }

        public bool VerificarPassword(string password)
        {
            if (!Activo)
                throw new InvalidOperationException("Conta inactiva.");
            
            // Verifica se as propriedades de password estão inicializadas
            if (string.IsNullOrEmpty(_passwordSalt) || string.IsNullOrEmpty(_passwordHash))
            {
                 // Lidar com um utilizador que não tem password definida, se necessário
                 return false; 
            }
            
            byte[] salt = Convert.FromBase64String(_passwordSalt);
            byte[] hash = Convert.FromBase64String(_passwordHash);
            
            using (var pbkdf2 = new Rfc2898DeriveBytes(password, salt, Iterations, HashAlgorithmName.SHA256))
            {
                byte[] inputHash = pbkdf2.GetBytes(KeySize);
               
                return CryptographicOperations.FixedTimeEquals(inputHash, hash);
            }
        }
        
        private bool IsValidEmail(string email)
        {
            // O Regex.IsMatch é uma boa forma de validação de formato
            return Regex.IsMatch(email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$");
        }

        // --- Métodos de Funcionalidade ---
        
        public void AlterarPassword(string senhaActual, string novaSenha)
        {
            if (!VerificarPassword(senhaActual))
                throw new InvalidOperationException("Password actual inválida.");
            if (string.IsNullOrWhiteSpace(novaSenha))
                throw new ArgumentException("Nova password não pode estar vazia.", nameof(novaSenha));

            SetPassword(novaSenha);
        }

        public void FazerLogin(string password)
        {
            if (!Activo)
                throw new InvalidOperationException("Conta inactiva.");
            if (!VerificarPassword(password))
                throw new InvalidOperationException("Password inválida.");

            EstadoLogado = true;
            DataUltimoLogin = DateTime.UtcNow;
        }

        public void FazerLogout()
        {
            EstadoLogado = false;
        }

        public void SuspenderConta()
        {
            Activo = false;
            EstadoLogado = false;
        }

        public void AtualizarPerfil(string novoNome, string novoEmail)
        {
            if (string.IsNullOrWhiteSpace(novoNome))
                throw new ArgumentException("Nome não pode estar vazio.", nameof(novoNome));
            if (string.IsNullOrWhiteSpace(novoEmail) || !IsValidEmail(novoEmail))
                throw new ArgumentException("Email inválido.", nameof(novoEmail));

            Nome = novoNome;
            Email = novoEmail;
        }
    }
}

