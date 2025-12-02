using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using ProjetoApp.Classes; // Necessário para a classe Utilizador

namespace ProjetoApp.Persistence // Namespace correto
{
    public class GestorPersistencia
    {
        private const string FilePathUtilizadores = "utilizadores.json";

        private static readonly JsonSerializerOptions Options = new JsonSerializerOptions
        {
            WriteIndented = true 
        };

      
        public List<Utilizador> Utilizadores { get; private set; } = new List<Utilizador>();
        

       
        public void Guardar(List<Utilizador> utilizadores)
        {
            var json = JsonSerializer.Serialize(utilizadores, Options);
            File.WriteAllText(FilePathUtilizadores, json);
        }
        
       
        public void GuardarUtilizadores()
        {
            Guardar(this.Utilizadores);
        }

        
        
        public void CarregarUtilizadores()
        {
            if (!File.Exists(FilePathUtilizadores))
            {
               
                Utilizadores = new List<Utilizador>(); 
                return;
            }

            var json = File.ReadAllText(FilePathUtilizadores);
           
            var dados = JsonSerializer.Deserialize<List<Utilizador>>(json, Options);
            
          
            Utilizadores = dados ?? new List<Utilizador>(); 
        }
    }
}