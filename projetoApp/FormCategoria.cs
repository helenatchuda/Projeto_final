using System;
using System.Windows.Forms;

namespace GestaoFinancasPessoais
{
    public partial class FormCategoria : Form
    {
        public string Nome => txtNome.Text;
        public string Descricao => txtDescricao.Text;

        public FormCategoria()
        {
            InitializeComponent();
        }

        private void btnGuardar_Click(object sender, EventArgs e)
        {
            if (string.IsNullOrWhiteSpace(txtNome.Text))
            {
                MessageBox.Show("O nome é obrigatório.");
                return;
            }
            DialogResult = DialogResult.OK;
            Close();
        }
    }
}
