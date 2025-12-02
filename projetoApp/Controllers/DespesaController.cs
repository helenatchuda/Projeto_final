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
            // Dependência necessária para validar a existência da Categoria
            CategoriaController = categoriaController; 
        }
        
        /// <summary>
        /// Lista todas as despesas de um utilizador, ordenadas pela data mais recente.
        /// </summary>
        public IEnumerable<Despesa> ListarDespesasUtilizador(Utilizador utilizador)
        {
            return utilizador.Despesas.OrderByDescending(d => d.Data);
        }
        
        /// <summary>
        /// Obtém uma despesa específica de um utilizador.
        /// </summary>
        public Despesa? ObterDespesaPorId(Utilizador utilizador, Guid despesaId)
        {
            return utilizador.Despesas.FirstOrDefault(d => d.Id == despesaId);
        }

        /// <summary>
        /// Cria e adiciona uma nova despesa ao utilizador.
        /// </summary>
        /// <param name="utilizador">O utilizador logado.</param>
        /// <param name="valor">O valor da despesa (deve ser positivo).</param>
        /// <param name="descricao">A descrição da despesa.</param>
        /// <param name="categoriaId">O ID da categoria associada.</param>
        public Despesa Criar(Utilizador utilizador, decimal valor, string descricao, Guid categoriaId)
        {
            // Valida se a categoria existe
            if (CategoriaController.ObterPorId(categoriaId) == null)
            {
                throw new KeyNotFoundException("Categoria de Despesa inválida ou inexistente.");
            }

            // A validação de 'valor' e 'descricao' ocorre no construtor da classe base Transacao.
            var novaDespesa = new Despesa(utilizador.Id, valor, descricao, categoriaId);
            
            // Adiciona a despesa à lista do utilizador
            utilizador.AdicionarDespesa(novaDespesa);
            
            // Persiste a alteração no ficheiro de utilizadores
            Persistencia.GuardarUtilizadores(); 
            return novaDespesa;
        }

        /// <summary>
        /// Edita os detalhes de uma despesa existente.
        /// </summary>
        public void Editar(Utilizador utilizador, Guid despesaId, decimal novoValor, string novaDescricao, Guid novaCategoriaId)
        {
            var despesa = ObterDespesaPorId(utilizador, despesaId);
            if (despesa == null)
            {
                throw new KeyNotFoundException("Despesa não encontrada.");
            }
            
            // Valida a nova categoria
            if (CategoriaController.ObterPorId(novaCategoriaId) == null)
            {
                throw new KeyNotFoundException("Nova Categoria de Despesa inválida ou inexistente.");
            }

            // Edita a despesa (a validação de valor e descrição é feita nos setters)
            despesa.Editar(novoValor, novaDescricao, novaCategoriaId);
            
            Persistencia.GuardarUtilizadores();
        }

        /// <summary>
        /// Elimina uma despesa da lista do utilizador.
        /// </summary>
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