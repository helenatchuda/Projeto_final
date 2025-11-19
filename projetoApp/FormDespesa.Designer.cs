namespace GestaoFinancasPessoais
{
    partial class FormDespesa
    {
        private System.ComponentModel.IContainer components = null;

        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null)) components.Dispose();
            base.Dispose(disposing);
        }

        private void InitializeComponent()
        {
            this.lblDescricao = new System.Windows.Forms.Label();
            this.lblValor = new System.Windows.Forms.Label();
            this.lblData = new System.Windows.Forms.Label();
            this.lblCategoria = new System.Windows.Forms.Label();
            this.txtDescricao = new System.Windows.Forms.TextBox();
            this.numValor = new System.Windows.Forms.NumericUpDown();
            this.dateDespesa = new System.Windows.Forms.DateTimePicker();
            this.cbCategoria = new System.Windows.Forms.ComboBox();
            this.btnGuardar = new System.Windows.Forms.Button();
            ((System.ComponentModel.ISupportInitialize)(this.numValor)).BeginInit();
            this.SuspendLayout();
            // 
            // lblDescricao
            // 
            this.lblDescricao.Location = new System.Drawing.Point(20, 20);
            this.lblDescricao.Text = "Descrição:";
            // 
            // lblValor
            // 
            this.lblValor.Location = new System.Drawing.Point(20, 60);
            this.lblValor.Text = "Valor:";
            // 
            // lblData
            // 
            this.lblData.Location = new System.Drawing.Point(20, 100);
            this.lblData.Text = "Data:";
            // 
            // lblCategoria
            // 
            this.lblCategoria.Location = new System.Drawing.Point(20, 140);
            this.lblCategoria.Text = "Categoria:";
            // 
            // txtDescricao
            // 
            this.txtDescricao.Location = new System.Drawing.Point(100, 17);
            this.txtDescricao.Size = new System.Drawing.Size(250, 23);
            // 
            // numValor
            // 
            this.numValor.DecimalPlaces = 2;
            this.numValor.Location = new System.Drawing.Point(100, 57);
            this.numValor.Maximum = new decimal(new int[] {1000000, 0, 0, 0});
            this.numValor.Size = new System.Drawing.Size(120, 23);
            // 
            // dateDespesa
            // 
            this.dateDespesa.Format = System.Windows.Forms.DateTimePickerFormat.Short;
            this.dateDespesa.Location = new System.Drawing.Point(100, 97);
            this.dateDespesa.Size = new System.Drawing.Size(120, 23);
            // 
            // cbCategoria
            // 
            this.cbCategoria.DropDownStyle = System.Windows.Forms.ComboBoxStyle.DropDownList;
            this.cbCategoria.Location = new System.Drawing.Point(100, 137);
            this.cbCategoria.Size = new System.Drawing.Size(250, 23);
            // 
            // btnGuardar
            // 
            this.btnGuardar.Location = new System.Drawing.Point(250, 180);
            this.btnGuardar.Size = new System.Drawing.Size(100, 30);
            this.btnGuardar.Text = "Guardar";
            this.btnGuardar.UseVisualStyleBackColor = true;
            this.btnGuardar.Click += new System.EventHandler(this.btnGuardar_Click);
            // 
            // FormDespesa
            // 
            this.ClientSize = new System.Drawing.Size(380, 230);
            this.Controls.Add(this.lblDescricao);
            this.Controls.Add(this.lblValor);
            this.Controls.Add(this.lblData);
            this.Controls.Add(this.lblCategoria);
            this.Controls.Add(this.txtDescricao);
            this.Controls.Add(this.numValor);
            this.Controls.Add(this.dateDespesa);
            this.Controls.Add(this.cbCategoria);
            this.Controls.Add(this.btnGuardar);
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterParent;
            this.Text = "Nova Despesa";
            ((System.ComponentModel.ISupportInitialize)(this.numValor)).EndInit();
            this.ResumeLayout(false);
            this.PerformLayout();
        }

        private System.Windows.Forms.Label lblDescricao;
        private System.Windows.Forms.Label lblValor;
        private System.Windows.Forms.Label lblData;
        private System.Windows.Forms.Label lblCategoria;
        private System.Windows.Forms.TextBox txtDescricao;
        private System.Windows.Forms.NumericUpDown numValor;
        private System.Windows.Forms.DateTimePicker dateDespesa;
        private System.Windows.Forms.ComboBox cbCategoria;
        private System.Windows.Forms.Button btnGuardar;
    }
}

