using System;
using System.Collections.Generic;
using System.Linq;

namespace GestaoFinancasPessoais.Models
{
    /// <summary>
    /// Classe responsável por gerir categorias de um utilizador.
    /// Permite criar, editar, remover e listar categorias personalizadas.
    /// </summary>
    public class GestorCategorias
    {
        private readonly List<Categoria> _categorias;

        public GestorCategorias()
        {
            _categorias = new List<Categoria>();
        }

        /// <summary>
        /// Adiciona uma nova categoria ao sistema.
        /// </summary>
        public void AdicionarCategoria(string nome, string descricao, int usuarioId)
        {
            if (string.IsNullOrWhiteSpace(nome))
                throw new ArgumentException("O nome da categoria não pode estar vazio.");

            if (_categorias.Any(c => c.Nome.Equals(nome, StringComparison.OrdinalIgnoreCase)
                                  && c.UsuarioId == usuarioId))
                throw new InvalidOperationException("Já existe uma categoria com esse nome para este utilizador.");

            var novaCategoria = new Categoria(nome, descricao, usuarioId)
            {
                Id = _categorias.Count > 0 ? _categorias.Max(c => c.Id) + 1 : 1
            };

            _categorias.Add(novaCategoria);
        }

        /// <summary>
        /// Devolve todas as categorias de um utilizador.
        /// </summary>
        public IEnumerable<Categoria> ListarCategorias(int usuarioId)
        {
            return _categorias.Where(c => c.UsuarioId == usuarioId).ToList();
        }

        /// <summary>
        /// Edita uma categoria existente.
        /// </summary>
        public bool EditarCategoria(int id, string novoNome, string novaDescricao, int usuarioId)
        {
            var categoria = _categorias.FirstOrDefault(c => c.Id == id && c.UsuarioId == usuarioId);
            if (categoria == null)
                return false;

            categoria.Nome = novoNome;
            categoria.Descricao = novaDescricao;
            return true;
        }

        /// <summary>
        /// Remove uma categoria pelo ID.
        /// </summary>
        public bool RemoverCategoria(int id, int usuarioId)
        {
            var categoria = _categorias.FirstOrDefault(c => c.Id == id && c.UsuarioId == usuarioId);
            if (categoria == null)
                return false;

            _categorias.Remove(categoria);
            return true;
        }

        /// <summary>
        /// Procura uma categoria específica pelo ID.
        /// </summary>
        public Categoria? ObterCategoriaPorId(int id, int usuarioId)
        {
            return _categorias.FirstOrDefault(c => c.Id == id && c.UsuarioId == usuarioId);
        }
    }
}
