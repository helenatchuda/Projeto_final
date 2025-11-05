using System;

namespace SistemaGestaoFinanceira
{
    public class CategoriaController
    {
        private readonly PersistenciaDados persistencia;

        public CategoriaController()
        {
            persistencia = new PersistenciaDados();
        }

        public void IniciarFormCategoria()
        {
            Console.WriteLine("=== CRIAR NOVA CATEGORIA ===");
        }

        public void CriarCategoria(string nome, string descricao)
        {
            Categoria categoria = new Categoria();
            categoria.Nome = nome;
            categoria.Descricao = descricao;

            if (categoria.Validar())
            {
                persistencia.PersistirCategoria(categoria);
                Console.WriteLine("Categoria criada e guardada com sucesso!");
            }
            else
            {
                Console.WriteLine("Dados inválidos. A categoria não foi criada.");
            }
        }
    }
}
