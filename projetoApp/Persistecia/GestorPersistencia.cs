using System.Runtime.CompilerServices;
using System.Text.Json;
using ProjetoApp.Classes;


public class GestorPersistencia
{
    // Construtor: Carrega todos os dados ao iniciar
    private static readonly JsonSerializerOptions Options = new ()
    {
        WriteIndented = true,
        // Adicione esta opção para lidar com classes base/derivadas ao deserializar 
        // mas por enquanto não é estritamente necessário se usar a abordagem de persistir listas separadas.
    };

    private const string FilePathUtilizadores = "utilizadores.json";
    private const string FilePathCategorias = "categorias.json";
    private static readonly String FilePath = "utilizador.json";

    public List<Utilizador> Utilizadores = new();
    public List<Categoria> Categorias = new(); // Nova lista
   
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
// ----------- Categorias -----------
private const string FileCategorias = "categorias.json";
public List<Categoria> Categoria { get; private set; } = new();

public void GuardarCategorias()
{
    var json = JsonSerializer.Serialize(Categorias, Options);
    File.WriteAllText(FileCategorias, json);
}

public void CarregarCategorias()
{
    if (!File.Exists(FileCategorias))
    {
        Categorias = new List<Categoria>();
        return;
    }

    var json = File.ReadAllText(FileCategorias);
    Categorias = JsonSerializer.Deserialize<List<Categoria>>(json, Options)
                 ?? new List<Categoria>();
}
}