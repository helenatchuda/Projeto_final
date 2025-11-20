
using ProjetoApp.persistecia;;

namespace ProjetoApp.Controllers
{
    public class UtilizadorController
    {
      

        public GestorPersistecia Persistecia;
        

        public UtilizadorController(GestorPersistecia gestorPersistecia)
        {
            Persistecia = gestorPersistecia;
             if (Persistecia= utilizadores.Count== 0)
            {
               var admin = new Utilizador(1,"Admin@estgv.tdm" ,"Admin123!");
               Persistecia.utilizadores.Add(admin);
                Persistecia.Guardar(utilizadores); 
            }
        }
        public IEnumerable<Utilizador> Listar()
        {
            return persistecia.utilizadores;
        }
        

        


    }
}