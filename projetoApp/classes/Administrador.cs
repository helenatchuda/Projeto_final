using System;
using System.Text.Json.Serialization;
using ProjetoApp.Classes;

namespace ProjetoApp.Classes
{
    
    public class Administrador : Utilizador
    {
        public bool NivelAcessoTotal { get; private set; }

        [JsonConstructor]
        public Administrador() : base() 
        {
            NivelAcessoTotal = true;
        }

        public Administrador(string nome, string email, string password) 
            : base(nome, email, password)
        {
            NivelAcessoTotal = true;
        }

    
        
        public void SuspenderOutraConta(Utilizador alvo)
        {
            if (alvo.Id == this.Id)
                throw new InvalidOperationException("Um administrador não pode suspender a sua própria conta.");

            if (alvo is Administrador)
                throw new InvalidOperationException("Não é permitido suspender contas de outros Administradores.");
            
            alvo.SuspenderConta();
        }

        public void AtivarOutraConta(Utilizador alvo)
        {
            if (alvo.Id == this.Id)
                throw new InvalidOperationException("Um administrador não pode reativar a sua própria conta (já está ativa).");
            
        }
    }
}