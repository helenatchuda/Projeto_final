using System.Runtime.CompilerServices;
using System.Text.Json;


public class GestorPersistencia
{
    private static readonly JsonSerializerOptions Options = new ()
    {
       WriteIndented = true,
      
    };


    private static readonly String FilePath = "utilizador.json";
   
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