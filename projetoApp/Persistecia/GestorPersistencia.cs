using System.Runtime.CompilerServices;
using System.Text.Json;
using ProjetoApp.Classes;


public class GestorPersistencia
{
    private static readonly JsonSerializerOptions Options = new ()
    {
        WriteIndented = true,
        // Adicione esta opção para lidar com classes base/derivadas ao deserializar 
        // mas por enquanto não é estritamente necessário se usar a abordagem de persistir listas separadas.
    };

    private const string FilePathUtilizadores = "utilizadores.json"; // Renomeado o ficheiro
    private const string FilePathCategorias = "categorias.json"; // Novo ficheiro

    public List<Utilizador> Utilizadores = new();
    public List<Categoria> Categorias = new(); // Nova lista

    // Construtor: Carrega todos os dados ao iniciar
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