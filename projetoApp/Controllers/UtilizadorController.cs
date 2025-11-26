using ProjetoApp.Classes; 
using System.Linq; 
using System.Collections.Generic; 


namespace ProjetoApp.Controllers
{
    public class UtilizadorController
    {
       
        public GestorPersistencia Persistencia; 

        public UtilizadorController(GestorPersistencia gestorPersistencia)
        {
            Persistencia = gestorPersistencia; 
            
            if (Persistencia.Utilizadores.Count() == 0) 
            {
                
                var admin = new Utilizador("Administrador","Admin@estgv.tdm", "Admin123!"); 
               
                Persistencia.Utilizadores.Add(admin);
                
                Persistencia.Guardar(Persistencia.Utilizadores); 
            }
        }

        public IEnumerable<Utilizador> Listar()
        {
            return Persistencia.Utilizadores; 
        }

        public Utilizador? Autenticar()
        {
            return null;  
        }

    }
}