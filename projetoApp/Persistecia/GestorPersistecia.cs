using ProjetoApp.persistecia;

public class GestorPersistecia
{
    private static readonly JsonSerializerOptions Options = new ()
    {
       WriteIndented = true,
      
    };
   
   public void Guardar<T>( T data)
    {
        var json = JsonSerializer.Serialize(data, Options);
        File.WriteAllText(filePath, json);
    }
    public T? Ler<T>()
    {
        var json = File.ReadAllText(filePath);
        return JsonSerializer.Deserialize<T>(json, Options);
    }
}