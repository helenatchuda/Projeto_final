using ProjetoApp.Classes;
using System.Collections.Generic;
using System.Linq;
using System;

namespace ProjetoApp.Controllers
{
    public class CategoriaController
    {
        public GestorPersistencia Persistencia { get; private set; }

        public CategoriaController(GestorPersistencia gestorPersistencia)
        {
            Persistencia = gestorPersistencia;
        }

        public IEnumerable<Categoria> Listar()
        {
            return Persistencia.Categorias.OrderBy(c => c.Nome);
        }

        public Categoria Criar(string nome)
        {
            if (Persistencia.Categorias.Any(c => c.Nome.Equals(nome, StringComparison.OrdinalIgnoreCase)))
            {
                throw new InvalidOperationException($"A categoria '{nome}' já existe.");
            }

            var novaCategoria = new Categoria(nome);
            Persistencia.Categorias.Add(novaCategoria);
            Persistencia.GuardarCategorias();
            return novaCategoria;
        }

        public void Editar(Guid id, string novoNome)
        {
            var categoria = Persistencia.Categorias.FirstOrDefault(c => c.Id == id);
            if (categoria == null)
            {
                throw new KeyNotFoundException("Categoria não encontrada.");
            }

            // Verifica se o novo nome já existe noutra categoria
            if (Persistencia.Categorias.Any(c => c.Nome.Equals(novoNome, StringComparison.OrdinalIgnoreCase) && c.Id != id))
            {
                throw new InvalidOperationException($"Já existe uma categoria com o nome '{novoNome}'.");
            }

            categoria.EditarNome(novoNome);
            Persistencia.GuardarCategorias();
        }

        public void Eliminar(Guid id)
        {
            var categoria = Persistencia.Categorias.FirstOrDefault(c => c.Id == id);
            if (categoria == null)
            {
                throw new KeyNotFoundException("Categoria não encontrada.");
            }

            // ★ IMPORTANTE: Lidar com transações que usam esta categoria. 
            // O ideal seria proibir a eliminação se houver transações associadas, 
            // ou mover essas transações para uma categoria "Não Especificada".
            
            // Aqui, vamos apenas eliminar:
            Persistencia.Categorias.Remove(categoria);
            Persistencia.GuardarCategorias();
        }
        
        public Categoria? ObterPorId(Guid id)
        {
            return Persistencia.Categorias.FirstOrDefault(c => c.Id == id);
        }
    }
}
