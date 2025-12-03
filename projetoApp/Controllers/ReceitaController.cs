using ProjetoApp.Classes;
using System.Collections.Generic;
using System.Linq;
using System;
using ProjetoApp.Persistence;

namespace ProjetoApp.Controllers
{
    public class ReceitaController
    {
        public GestorPersistencia Persistencia { get; private set; }
        public CategoriaController CategoriaController { get; private set; }
        
        public ReceitaController(GestorPersistencia gestorPersistencia, CategoriaController categoriaController)
        {
            Persistencia = gestorPersistencia;
            CategoriaController = categoriaController;
        }

        // Obtém todas as receitas de um utilizador
        public IEnumerable<Receita> ListarReceitasUtilizador(Utilizador utilizador)
        {
            return utilizador.Receitas.OrderByDescending(r => r.Data);
        }
        
        // Obtém uma receita pelo ID
        public Receita? ObterReceitaPorId(Utilizador utilizador, Guid receitaId)
        {
            return utilizador.Receitas.FirstOrDefault(r => r.Id == receitaId);
        }

        // Cria uma nova receita
        public Receita Criar(Utilizador utilizador, decimal valor, string descricao, Guid categoriaId)
        {
            // Valida se a categoria existe
            if (CategoriaController.ObterPorId(categoriaId) == null)
            {
                throw new KeyNotFoundException("Categoria de Receita inválida.");
            }

            var novaReceita = new Receita(utilizador.Id, valor, descricao, categoriaId);
            utilizador.AdicionarReceita(novaReceita);
            Persistencia.GuardarUtilizadores(); 
            return novaReceita;
        }

        // Edita uma receita existente
        public void Editar(Utilizador utilizador, Guid receitaId, decimal novoValor, string novaDescricao, Guid novaCategoriaId)
        {
            var receita = ObterReceitaPorId(utilizador, receitaId);
            if (receita == null)
            {
                throw new KeyNotFoundException("Receita não encontrada.");
            }
            
            if (CategoriaController.ObterPorId(novaCategoriaId) == null)
            {
                throw new KeyNotFoundException("Categoria de Receita inválida.");
            }

            receita.Editar(novoValor, novaDescricao, novaCategoriaId);
            Persistencia.GuardarUtilizadores();
        }

        // Elimina uma receita
        public void Eliminar(Utilizador utilizador, Guid receitaId)
        {
            var receita = ObterReceitaPorId(utilizador, receitaId);
            if (receita == null)
            {
                throw new KeyNotFoundException("Receita não encontrada.");
            }

            utilizador.Receitas.Remove(receita);
            Persistencia.GuardarUtilizadores();
        }
    }
}