using ProjetoApp.Classes;
using ProjetoApp.Persistence;
public class CategoriaController

{
    public GestorPersistencia Persistencia { get; }

    public CategoriaController(GestorPersistencia persistencia)
    {
        Persistencia = persistencia;
    }

    public IReadOnlyList<Categoria> Listar()
    {
        return Persistencia.Categorias
            .OrderBy(c => c.Nome)
            .ToList()
            .AsReadOnly();
    }

    public Categoria Criar(string nome)
    {
        if (Persistencia.Categorias
            .Any(c => c.Nome.Equals(nome, StringComparison.OrdinalIgnoreCase)))
        {
            throw new InvalidOperationException(
                $"A categoria '{nome}' já existe."
            );
        }

        var novaCategoria = new Categoria(nome);

        Persistencia.Categorias.Add(novaCategoria);
        Persistencia.GuardarCategorias();

        return novaCategoria;
    }

    public void Editar(Guid id, string novoNome)
    {
        var categoria = ObterPorId(id)
            ?? throw new KeyNotFoundException("Categoria não encontrada.");

        if (Persistencia.Categorias
            .Any(c => c.Nome.Equals(novoNome, StringComparison.OrdinalIgnoreCase)
                    && c.Id != id))
        {
            throw new InvalidOperationException(
                $"Já existe uma categoria com o nome '{novoNome}'."
            );
        }

        categoria.EditarNome(novoNome);
        Persistencia.GuardarCategorias();
    }

    public void Eliminar(Guid id)
    {
        var categoria = ObterPorId(id)
            ?? throw new KeyNotFoundException("Categoria não encontrada.");

        Persistencia.Categorias.Remove(categoria);
        Persistencia.GuardarCategorias();
    }

    public Categoria? ObterPorId(Guid id)
    {
        return Persistencia.Categorias.FirstOrDefault(c => c.Id == id);
    }
}
