using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class CategoriaController : ControllerBase
{
    // GET api/categoria
    [HttpGet]
    public IActionResult GetCategorias()
    {
        return Ok(CategoriaRepository.Categorias);
    }

    // POST api/categoria
    [HttpPost]
    public IActionResult CriarCategoria([FromBody] Categoria categoria)
    {
        categoria.Id = CategoriaRepository.Categorias.Max(c => c.Id) + 1;
        CategoriaRepository.Categorias.Add(categoria);

        return Ok(new
        {
            mensagem = "Categoria criada com sucesso!",
            categoria
        });
    }

    // PUT api/categoria/3
    [HttpPut("{id}")]
    public IActionResult EditarCategoria(int id, [FromBody] Categoria categoriaAtualizada)
    {
        var categoriaExistente = CategoriaRepository.Categorias
            .FirstOrDefault(c => c.Id == id);

        if (categoriaExistente == null)
        {
            return NotFound(new { mensagem = "Categoria não encontrada" });
        }

        categoriaExistente.Nome = categoriaAtualizada.Nome;
        categoriaExistente.UtilizadorId = categoriaAtualizada.UtilizadorId;

        return Ok(new
        {
            mensagem = "Categoria atualizada com sucesso!",
            categoria = categoriaExistente
        });
    }

    // DELETE api/categoria/3
    [HttpDelete("{id}")]
    public IActionResult ApagarCategoria(int id)
    {
        var categoria = CategoriaRepository.Categorias
            .FirstOrDefault(c => c.Id == id);

        if (categoria == null)
            return NotFound(new { mensagem = "Categoria não encontrada" });

        CategoriaRepository.Categorias.Remove(categoria);

        return Ok(new { mensagem = "Categoria apagada!" });
    }
}