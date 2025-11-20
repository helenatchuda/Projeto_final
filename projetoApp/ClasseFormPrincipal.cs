using System;
using System.Linq;
using System.Windows.Forms;
using GestaoFinancasPessoais.Models;
using GestaoFinancasPessoais.Data;

namespace GestaoFinancasPessoais
{
    public partial class FormPrincipal : Form
    {
        private GestorCategorias _gestorCategorias;
        private DespesasControlo _gestorDespesas;
        private int _utilizadorId = 1; // Simulação de utilizador único

        public FormPrincipal()
        {
            InitializeComponent();
            CarregarDados();
        }

        private void CarregarDados()
        {
            _gestorCategorias = new GestorCategorias();
            _gestorDespesas = new DespesasControlo();

            // Carrega do JSON
            var categorias = GestorJSON.CarregarCategorias();
            var despesas = GestorJSON.CarregarDespesas();

            // Preenche gestores
            foreach (var c in categorias)
                _gestorCategorias.AdicionarCategoria(c.Nome, c.Descricao, c.UtilizadorId);

            foreach (var d in despesas)
                _gestorDespesas.AdicionarDespesa(d.Descricao, d.Valor, d.Data, d.Categoria, d.UtilizadorId);

            AtualizarListas();
        }

        private void AtualizarListas()
        {
            listCategorias.DataSource = null;
            listCategorias.DataSource = _gestorCategorias.ListarCategorias(_utilizadorId).ToList();

            cbCategorias.DataSource = _gestorCategorias.ListarCategorias(_utilizadorId).ToList();
            cbCategorias.DisplayMember = "Nome";

            listDespesas.DataSource = null;
            listDespesas.DataSource = _gestorDespesas.ListarDespesas(_utilizadorId).ToList();
        }

        private void btnAddCategoria_Click(object sender, EventArgs e)
        {
            var form = new FormCategoria();
            if (form.ShowDialog() == DialogResult.OK)
            {
                _gestorCategorias.AdicionarCategoria(form.Nome, form.Descricao, _utilizadorId);
                GestorJSON.GuardarCategorias(_gestorCategorias.ListarCategorias(_utilizadorId));
                AtualizarListas();
            }
        }

        private void btnAddDespesa_Click(object sender, EventArgs e)
        {
            var form = new FormDespesa(_gestorCategorias.ListarCategorias(_utilizadorId).ToList());
            if (form.ShowDialog() == DialogResult.OK)
            {
                _gestorDespesas.AdicionarDespesa(form.Descricao, form.Valor, form.Data, form.Categoria, _utilizadorId);
                GestorJSON.GuardarDespesas(_gestorDespesas.ListarDespesas(_utilizadorId));
                AtualizarListas();
            }
        }
    }
}