using ProjetoApp.Classes;
using System.Collections.Generic;
using System.Linq;
using System;
using System.Collections.Immutable; // Para o método ToImmutableArray

namespace ProjetoApp.Controllers
{
    /// <summary>
    /// Controller dedicado à geração de relatórios e cálculos financeiros, 
    /// utilizando dados dos utilizadores e categorias.
    /// </summary>
    public class RelatorioController
    {
        private CategoriaController CategoriaController { get; }

        public RelatorioController(CategoriaController categoriaController)
        {
            CategoriaController = categoriaController;
        }

        // ------------------- MÉTODOS AUXILIARES -------------------

        /// <summary>
        /// Filtra uma lista de transações por um período de tempo definido.
        /// </summary>
        private IEnumerable<Transacao> FiltrarTransacoesPorPeriodo(
            IEnumerable<Transacao> transacoes, DateTime? inicio, DateTime? fim)
        {
            var query = transacoes.AsQueryable();

            if (inicio.HasValue)
            {
                // Filtra pelo início do dia (>=)
                query = query.Where(t => t.Data.Date >= inicio.Value.Date);
            }

            if (fim.HasValue)
            {
                // Filtra até ao final do dia (<=)
                query = query.Where(t => t.Data.Date <= fim.Value.Date);
            }

            return query.ToImmutableArray();
        }

        // ------------------- MÉTODOS DE RELATÓRIO -------------------
        
        /// <summary>
        /// Calcula o saldo atual (Receitas Totais - Despesas Totais) de um utilizador.
        /// (Reutiliza o método já existente no Utilizador, que calcula o total de todas as transações.)
        /// </summary>
        public decimal CalcularSaldoAtual(Utilizador utilizador)
        {
            if (utilizador == null) 
                throw new ArgumentNullException(nameof(utilizador));
                
            return utilizador.CalcularSaldo();
        }

        /// <summary>
        /// Calcula o total de receitas de um utilizador num período definido.
        /// </summary>
        public decimal CalcularTotalReceitasPorPeriodo(Utilizador utilizador, DateTime? inicio, DateTime? fim)
        {
            if (utilizador == null) 
                throw new ArgumentNullException(nameof(utilizador));

            // Transações precisam de ser convertidas para a classe base Transacao para serem filtradas
            var transacoes = utilizador.Receitas.Cast<Transacao>(); 
            var receitasFiltradas = FiltrarTransacoesPorPeriodo(transacoes, inicio, fim);
            
            return receitasFiltradas.Sum(r => r.Valor);
        }

        /// <summary>
        /// Calcula o total de despesas de um utilizador num período definido.
        /// </summary>
        public decimal CalcularTotalDespesasPorPeriodo(Utilizador utilizador, DateTime? inicio, DateTime? fim)
        {
            if (utilizador == null) 
                throw new ArgumentNullException(nameof(utilizador));

            var transacoes = utilizador.Despesas.Cast<Transacao>();
            var despesasFiltradas = FiltrarTransacoesPorPeriodo(transacoes, inicio, fim);

            return despesasFiltradas.Sum(d => d.Valor);
        }

        /// <summary>
        /// Calcula o saldo (Receitas - Despesas) de um utilizador num período específico.
        /// </summary>
        public decimal CalcularSaldoPorPeriodo(Utilizador utilizador, DateTime? inicio, DateTime? fim)
        {
            decimal totalReceitas = CalcularTotalReceitasPorPeriodo(utilizador, inicio, fim);
            decimal totalDespesas = CalcularTotalDespesasPorPeriodo(utilizador, inicio, fim);
            return totalReceitas - totalDespesas;
        }

        /// <summary>
        /// Agrupa todas as transações (Receitas e Despesas) por categoria, 
        /// calculando os totais e o saldo por grupo, num período opcional.
        /// </summary>
        /// <returns>Objetos anónimos contendo detalhes da categoria e totais financeiros.</returns>
        public IEnumerable<object> ListarTotaisPorCategoria(Utilizador utilizador, DateTime? inicio = null, DateTime? fim = null)
        {
            if (utilizador == null) 
                throw new ArgumentNullException(nameof(utilizador));

            // Combina e converte todas as transações para a classe base Transacao
            var todasTransacoes = utilizador.Receitas.Cast<Transacao>()
                                    .Concat(utilizador.Despesas.Cast<Transacao>())
                                    .OrderByDescending(t => t.Data);

            var transacoesFiltradas = FiltrarTransacoesPorPeriodo(todasTransacoes, inicio, fim);

            // Agrupa e projeta os resultados
            var agrupamento = transacoesFiltradas
                .GroupBy(t => t.CategoriaId)
                .Select(g => new
                {
                    CategoriaId = g.Key,
                    // Obtém o nome da categoria. Usa "Categoria Removida" se o ID não for encontrado
                    NomeCategoria = CategoriaController.ObterPorId(g.Key)?.Nome ?? "Categoria Removida", 
                    
                    TotalReceitas = g.OfType<Receita>().Sum(t => t.Valor), // Usa OfType para filtrar por tipo
                    TotalDespesas = g.OfType<Despesa>().Sum(t => t.Valor),
                    
                    // Saldo = Receitas - Despesas dentro da categoria
                    SaldoCategoria = g.OfType<Receita>().Sum(t => t.Valor) - g.OfType<Despesa>().Sum(t => t.Valor),
                })
                .OrderBy(r => r.NomeCategoria);
                
            return agrupamento.ToImmutableArray();
        }
    }
}