using System;

public class Utilizador
{
      public string Nome { get; set; }
    public string Email { get; set; }
    public string Password { get; set; } 
    public DateTime DataCriacao { get; set; }
    public bool EstadoLogado { get; set; }


    public Utilizador(string nome, string email, string password, DateTime dataCriacao)
    {
        Nome = nome;
        Email = email;
        Password = password;
        DataCriacao = dataCriacao;
        EstadoLogado = false;
    }

    
    public void setEstadoLogado(bool estadoLogado)
    {
        EstadoLogado = estadoLogado;
    }

    public bool verificarPassword(string password)
    {
       
        return Password.Equals(password);
    }
}


