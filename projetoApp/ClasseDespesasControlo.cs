using System;
using System.Collections.Generic;
using System.Linq;

namespace GestaoFinancasPessoais.Models
{
    /// <summary>
    /// Classe responsável pela gestão e controlo das despesas dos utilizadores.
    /// Permite adicionar, editar, remover, listar e calcular totais de despesas.
    /// </summary>
    public class DespesasControlo
    {
        private readonly List<Despesa> _despesas;

        public DespesasControlo()
        {
            _despesas = new List<Despesa>();
        }

        /// <summary>
        /// Adiciona uma nova despesa ao sistema.
        /// </summary>
        public void AdicionarDespesa(string descricao, decimal valor, DateTime data, Categoria categoria, int usuarioId)
        {
            if (categoria == null)
                throw new ArgumentNullException(nameof(categoria), "A categoria é obrigatória.");

            if (valor <= 0)
                throw new ArgumentException("O valor deve ser maior que zero.");

            var despesa = new Despesa(descricao, valor, data, categoria, usuarioId)
            {
                Id = _despesas.Count > 0 ? _despesas.Max(d => d.Id) + 1 : 1
            };

            _despesas.Add(despesa);
        }

        /// <summary>
        /// Edita uma despesa existente.
        /// </summary>
        public bool EditarDespesa(int id, string novaDescricao, decimal novoValor, DateTime novaData, Categoria novaCategoria, int usuarioId)
        {
            var despesa = _despesas.FirstOrDefault(d => d.Id == id && d.UsuarioId == usuarioId);
            if (despesa == null)
                return false;

            despesa.Descricao = novaDescricao;
            despesa.Valor = novoValor;
            despesa.Data = novaData;
            despesa.Categoria = novaCategoria;
            despesa.CategoriaId = novaCategoria.Id;

            return true;
        }

        /// <summary>
        /// Remove uma despesa pelo ID.
        /// </summary>
        public bool RemoverDespesa(int id, int usuarioId)
        {
            var despesa = _despesas.FirstOrDefault(d => d.Id == id && d.UsuarioId == usuarioId);
            if (despesa == null)
                return false;

            _despesas.Remove(despesa);
            return true;
        }

        /// <summary>
        /// Lista todas as despesas de um utilizador.
        /// </summary>
        public IEnumerable<Despesa> ListarDespesas(int usuarioId)
        {
            return _despesas.Where(d => d.UsuarioId == usuarioId).OrderByDescending(d => d.Data).ToList();
        }

        /// <summary>
        /// Lista as despesas de um utilizador filtradas por categoria.
        /// </summary>
        public IEnumerable<Despesa> ListarPorCategoria(int usuarioId, int categoriaId)
        {
            return _despesas
                .Where(d => d.UsuarioId == usuarioId && d.CategoriaId == categoriaId)
                .OrderByDescending(d => d.Data)
                .ToList();
        }

        /// <summary>
        /// Calcula o total gasto por um utilizador (opcionalmente dentro de um intervalo de datas).
        /// </summary>
        public decimal CalcularTotal(int usuarioId, DateTime? inicio = null, DateTime? fim = null)
        {
            var despesasUsuario = _despesas.Where(d => d.UsuarioId == usuarioId);

            if (inicio.HasValue)
                despesasUsuario = despesasUsuario.Where(d => d.Data >= inicio.Value);

            if (fim.HasValue)
                despesasUsuario = despesasUsuario.Where(d => d.Data <= fim.Value);

            return despesasUsuario.Sum(d => d.Valor);
        }
    }
}