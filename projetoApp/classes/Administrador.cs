using System;
using System.Text.Json.Serialization;
using ProjetoApp.Classes;

namespace ProjetoApp.Classes
{
    /// <summary>
    /// Representa um Administrador, que herda as propriedades e funcionalidades de um Utilizador.
    /// Possui Nível de Acesso Total e métodos de gestão de contas.
    /// </summary>
    public class Administrador : Utilizador
    {
        /// <summary>
        /// Indica se o utilizador tem privilégios totais de administrador.
        /// </summary>
        public bool NivelAcessoTotal { get; private set; }

        [JsonConstructor]
        // Construtor vazio para desserialização JSON
        public Administrador() : base() 
        {
            NivelAcessoTotal = true;
        }

        /// <summary>
        /// Construtor para criar um novo Administrador.
        /// </summary>
        public Administrador(string nome, string email, string password) 
            : base(nome, email, password)
        {
            NivelAcessoTotal = true;
        }

    
        /// <summary>
        /// Suspende a conta de outro utilizador (desativa a propriedade Activo).
        /// </summary>
        public void SuspenderOutraConta(Utilizador alvo)
        {
            if (alvo.Id == this.Id)
                throw new InvalidOperationException("Um administrador não pode suspender a sua própria conta.");

            if (alvo is Administrador)
                throw new InvalidOperationException("Não é permitido suspender contas de outros Administradores.");
            
           // Lógica em falta: Altera o estado do utilizador alvo
            alvo.Suspender();
        }
        /// <summary>
        /// Ativa a conta de outro utilizador.
        /// </summary>
        public void AtivarOutraConta(Utilizador alvo)
        {
            if (alvo.Id == this.Id)
                throw new InvalidOperationException("Um administrador não pode reativar a sua própria conta (já está ativa).");
            // Lógica em falta: Altera o estado do utilizador alvo
            alvo.Ativar();
        }
    }
}