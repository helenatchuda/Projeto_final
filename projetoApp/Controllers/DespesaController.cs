using ProjetoApp.Classes;
using System.Collections.Generic;
using System.Linq;
using System;

namespace ProjetoApp.Controllers
{
    public class DespesaController
    {
        public GestorPersistencia Persistencia { get; private set; }
        public CategoriaController CategoriaController { get; private set; }
        
        public DespesaController(GestorPersistencia gestorPersistencia, CategoriaController categoriaController)
        {
            Persistencia = gestorPersistencia;
            CategoriaController = categoriaController;
        }
        
        // Obtém todas as despesas de um utilizador
        public IEnumerable<Despesa> ListarDespesasUtilizador(Utilizador utilizador)
        {
            return utilizador.Despesas.OrderByDescending(d => d.Data);
        }
        
        // Obtém uma despesa pelo ID
        public Despesa? ObterDespesaPorId(Utilizador utilizador, Guid despesaId)
        {
            return utilizador.Despesas.FirstOrDefault(d => d.Id == despesaId);
        }

        // Cria uma nova despesa
        public Despesa Criar(Utilizador utilizador, decimal valor, string descricao, Guid categoriaId)
        {
            // Valida se a categoria existe
            if (CategoriaController.ObterPorId(categoriaId) == null)
            {
                throw new KeyNotFoundException("Categoria de Despesa inválida.");
            }

            var novaDespesa = new Despesa(utilizador.Id, valor, descricao, categoriaId);
            utilizador.AdicionarDespesa(novaDespesa);
            Persistencia.GuardarUtilizadores(); 
            return novaDespesa;
        }

        // Edita uma despesa existente
        public void Editar(Utilizador utilizador, Guid despesaId, decimal novoValor, string novaDescricao, Guid novaCategoriaId)
        {
            var despesa = ObterDespesaPorId(utilizador, despesaId);
            if (despesa == null)
            {
                throw new KeyNotFoundException("Despesa não encontrada.");
            }
            
            if (CategoriaController.ObterPorId(novaCategoriaId) == null)
            {
                throw new KeyNotFoundException("Categoria de Despesa inválida.");
            }

            despesa.Editar(novoValor, novaDescricao, novaCategoriaId);
            Persistencia.GuardarUtilizadores();
        }

        // Elimina uma despesa
        public void Eliminar(Utilizador utilizador, Guid despesaId)
        {
            var despesa = ObterDespesaPorId(utilizador, despesaId);
            if (despesa == null)
            {
                throw new KeyNotFoundException("Despesa não encontrada.");
            }

            utilizador.Despesas.Remove(despesa);
            Persistencia.GuardarUtilizadores();
        }
    }
}