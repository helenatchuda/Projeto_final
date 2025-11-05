using System;

public class UtilizadorController
{
    public void registarUtilizador(string nome, string email, string password, DateTime data)
    {
       
        Utilizador novoUtilizador = new Utilizador(nome, email, password, data);
        
    }
    
    public void definirEstadoLogado(Utilizador utilizador)
    {
        utilizador.setEstadoLogado(true);
    }
}