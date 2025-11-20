using System;
using System.Collections.Generic;
using System.Windows.Forms;
using GestaoFinancasPessoais.Models;

namespace GestaoFinancasPessoais
{
    public partial class FormDespesa : Form
    {
        public string Descricao => txtDescricao.Text;
        public decimal Valor => numValor.Value;
        public DateTime Data => dateDespesa.Value;
        public Categoria Categoria => (Categoria)cbCategoria.SelectedItem;

        public FormDespesa(List<Categoria> categorias)
        {
            InitializeComponent();
            cbCategoria.DataSource = categorias;
            cbCategoria.DisplayMember = "Nome";
        }

        private void btnGuardar_Click(object sender, EventArgs e)
        {
            if (cbCategoria.SelectedItem == null)
            {
                MessageBox.Show("Selecione uma categoria.");
                return;
            }
            DialogResult = DialogResult.OK;
            Close();
        }
    }
}
