using System;

namespace ProjetoApp.DTOs
{
    public record TransacaoRequest(decimal Valor, string Descricao, Guid CategoriaId);
}
