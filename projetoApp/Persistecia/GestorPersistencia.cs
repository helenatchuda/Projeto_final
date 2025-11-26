using System.Runtime.CompilerServices;
using System.Text.Json;
using ProjetoApp.Classes;


public class GestorPersistencia
{
    private static readonly string ficheiroReceitas = "receitas.json";

        // -------------------------
        //     RECEITAS
        // -------------------------

        public static List<Receita> CarregarReceitas()
        {
            if (!File.Exists(ficheiroReceitas))
                return new List<Receita>();

            string json = File.ReadAllText(ficheiroReceitas);
            return JsonSerializer.Deserialize<List<Receita>>(json) ?? new List<Receita>();
        }

        public static void GuardarReceitas(List<Receita> receitas)
        {
            string json = JsonSerializer.Serialize(receitas, new JsonSerializerOptions
            {
                WriteIndented = true
            });

            File.WriteAllText(ficheiroReceitas, json);
        }
    
    private static readonly JsonSerializerOptions Options = new ()
    {
       WriteIndented = true,
      
    };


    private static readonly String FilePath = "utilizador.json";
    public List<Utilizador> Utilizadores = new();
   
   public void Guardar<T>( T data)
    {
        var json = JsonSerializer.Serialize(data, Options);
        File.WriteAllText(FilePath, json);
    }


    public T? Ler<T>()
    {
        var json = File.ReadAllText(FilePath);
        return JsonSerializer.Deserialize<T>(json, Options);
    }

    
}
