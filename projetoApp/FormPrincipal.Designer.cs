namespace GestaoFinancasPessoais
{
    partial class FormPrincipal
    {
        private System.ComponentModel.IContainer components = null;

        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Código gerado pelo Windows Form Designer

        private void InitializeComponent()
        {
            this.tabControl = new System.Windows.Forms.TabControl();
            this.tabCategorias = new System.Windows.Forms.TabPage();
            this.btnRemoverCategoria = new System.Windows.Forms.Button();
            this.btnAddCategoria = new System.Windows.Forms.Button();
            this.listCategorias = new System.Windows.Forms.ListBox();
            this.tabDespesas = new System.Windows.Forms.TabPage();
            this.btnRemoverDespesa = new System.Windows.Forms.Button();
            this.btnAddDespesa = new System.Windows.Forms.Button();
            this.listDespesas = new System.Windows.Forms.ListBox();
            this.cbCategorias = new System.Windows.Forms.ComboBox();
            this.label1 = new System.Windows.Forms.Label();
            this.tabResumo = new System.Windows.Forms.TabPage();
            this.listResumo = new System.Windows.Forms.ListBox();
            this.labelResumo = new System.Windows.Forms.Label();
            this.tabControl.SuspendLayout();
            this.tabCategorias.SuspendLayout();
            this.tabDespesas.SuspendLayout();
            this.tabResumo.SuspendLayout();
            this.SuspendLayout();
            // 
            // tabControl
            // 
            this.tabControl.Controls.Add(this.tabCategorias);
            this.tabControl.Controls.Add(this.tabDespesas);
            this.tabControl.Controls.Add(this.tabResumo);
            this.tabControl.Dock = System.Windows.Forms.DockStyle.Fill;
            this.tabControl.Font = new System.Drawing.Font("Segoe UI", 10F);
            this.tabControl.Location = new System.Drawing.Point(0, 0);
            this.tabControl.Name = "tabControl";
            this.tabControl.SelectedIndex = 0;
            this.tabControl.Size = new System.Drawing.Size(800, 450);
            this.tabControl.TabIndex = 0;
            // 
            // tabCategorias
            // 
            this.tabCategorias.Controls.Add(this.btnRemoverCategoria);
            this.tabCategorias.Controls.Add(this.btnAddCategoria);
            this.tabCategorias.Controls.Add(this.listCategorias);
            this.tabCategorias.Location = new System.Drawing.Point(4, 26);
            this.tabCategorias.Name = "tabCategorias";
            this.tabCategorias.Padding = new System.Windows.Forms.Padding(3);
            this.tabCategorias.Size = new System.Drawing.Size(792, 420);
            this.tabCategorias.TabIndex = 0;
            this.tabCategorias.Text = "Categorias";
            this.tabCategorias.UseVisualStyleBackColor = true;
            // 
            // btnRemoverCategoria
            // 
            this.btnRemoverCategoria.Location = new System.Drawing.Point(180, 15);
            this.btnRemoverCategoria.Name = "btnRemoverCategoria";
            this.btnRemoverCategoria.Size = new System.Drawing.Size(150, 30);
            this.btnRemoverCategoria.TabIndex = 2;
            this.btnRemoverCategoria.Text = "Remover Selecionada";
            this.btnRemoverCategoria.UseVisualStyleBackColor = true;
            this.btnRemoverCategoria.Click += new System.EventHandler(this.btnRemoverCategoria_Click);
            // 
            // btnAddCategoria
            // 
            this.btnAddCategoria.Location = new System.Drawing.Point(15, 15);
            this.btnAddCategoria.Name = "btnAddCategoria";
            this.btnAddCategoria.Size = new System.Drawing.Size(150, 30);
            this.btnAddCategoria.TabIndex = 1;
            this.btnAddCategoria.Text = "Adicionar Categoria";
            this.btnAddCategoria.UseVisualStyleBackColor = true;
            this.btnAddCategoria.Click += new System.EventHandler(this.btnAddCategoria_Click);
            // 
            // listCategorias
            // 
            this.listCategorias.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom)
            | System.Windows.Forms.AnchorStyles.Left)
            | System.Windows.Forms.AnchorStyles.Right)));
            this.listCategorias.Font = new System.Drawing.Font("Segoe UI", 10F);
            this.listCategorias.FormattingEnabled = true;
            this.listCategorias.ItemHeight = 17;
            this.listCategorias.Location = new System.Drawing.Point(15, 60);
            this.listCategorias.Name = "listCategorias";
            this.listCategorias.Size = new System.Drawing.Size(760, 344);
            this.listCategorias.TabIndex = 0;
            // 
            // tabDespesas
            // 
            this.tabDespesas.Controls.Add(this.btnRemoverDespesa);
            this.tabDespesas.Controls.Add(this.btnAddDespesa);
            this.tabDespesas.Controls.Add(this.listDespesas);
            this.tabDespesas.Controls.Add(this.cbCategorias);
            this.tabDespesas.Controls.Add(this.label1);
            this.tabDespesas.Location = new System.Drawing.Point(4, 26);
            this.tabDespesas.Name = "tabDespesas";
            this.tabDespesas.Padding = new System.Windows.Forms.Padding(3);
            this.tabDespesas.Size = new System.Drawing.Size(792, 420);
            this.tabDespesas.TabIndex = 1;
            this.tabDespesas.Text = "Despesas";
            this.tabDespesas.UseVisualStyleBackColor = true;
            // 
            // btnRemoverDespesa
            // 
            this.btnRemoverDespesa.Location = new System.Drawing.Point(345, 15);
            this.btnRemoverDespesa.Name = "btnRemoverDespesa";
            this.btnRemoverDespesa.Size = new System.Drawing.Size(150, 30);
            this.btnRemoverDespesa.TabIndex = 4;
            this.btnRemoverDespesa.Text = "Remover Selecionada";
            this.btnRemoverDespesa.UseVisualStyleBackColor = true;
            this.btnRemoverDespesa.Click += new System.EventHandler(this.btnRemoverDespesa_Click);
            // 
            // btnAddDespesa
            // 
            this.btnAddDespesa.Location = new System.Drawing.Point(180, 15);
            this.btnAddDespesa.Name = "btnAddDespesa";
            this.btnAddDespesa.Size = new System.Drawing.Size(150, 30);
            this.btnAddDespesa.TabIndex = 3;
            this.btnAddDespesa.Text = "Adicionar Despesa";
            this.btnAddDespesa.UseVisualStyleBackColor = true;
            this.btnAddDespesa.Click += new System.EventHandler(this.btnAddDespesa_Click);
            // 
            // listDespesas
            // 
            this.listDespesas.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom)
            | System.Windows.Forms.AnchorStyles.Left)
            | System.Windows.Forms.AnchorStyles.Right)));
            this.listDespesas.Font = new System.Drawing.Font("Segoe UI", 10F);
            this.listDespesas.FormattingEnabled = true;
            this.listDespesas.ItemHeight = 17;
            this.listDespesas.Location = new System.Drawing.Point(15, 60);
            this.listDespesas.Name = "listDespesas";
            this.listDespesas.Size = new System.Drawing.Size(760, 344);
            this.listDespesas.TabIndex = 2;
            // 
            // cbCategorias
            // 
            this.cbCategorias.DropDownStyle = System.Windows.Forms.ComboBoxStyle.DropDownList;
            this.cbCategorias.FormattingEnabled = true;
            this.cbCategorias.Location = new System.Drawing.Point(85, 18);
            this.cbCategorias.Name = "cbCategorias";
            this.cbCategorias.Size = new System.Drawing.Size(80, 25);
            this.cbCategorias.TabIndex = 1;
            this.cbCategorias.SelectedIndexChanged += new System.EventHandler(this.cbCategorias_SelectedIndexChanged);
            // 
            // label1
            // 
            this.label1.Location = new System.Drawing.Point(12, 20);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(70, 23);
            this.label1.Text = "Categoria:";
            // 
            // tabResumo
            // 
            this.tabResumo.Controls.Add(this.listResumo);
            this.tabResumo.Controls.Add(this.labelResumo);
            this.tabResumo.Location = new System.Drawing.Point(4, 26);
            this.tabResumo.Name = "tabResumo";
            this.tabResumo.Padding = new System.Windows.Forms.Padding(3);
            this.tabResumo.Size = new System.Drawing.Size(792, 420);
            this.tabResumo.TabIndex = 2;
            this.tabResumo.Text = "Resumo";
            this.tabResumo.UseVisualStyleBackColor = true;
            // 
            // listResumo
            // 
            this.listResumo.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom)
            | System.Windows.Forms.AnchorStyles.Left)
            | System.Windows.Forms.AnchorStyles.Right)));
            this.listResumo.Font = new System.Drawing.Font("Segoe UI", 10F);
            this.listResumo.FormattingEnabled = true;
            this.listResumo.ItemHeight = 17;
            this.listResumo.Location = new System.Drawing.Point(15, 50);
            this.listResumo.Name = "listResumo";
            this.listResumo.Size = new System.Drawing.Size(760, 344);
            this.listResumo.TabIndex = 1;
            // 
            // labelResumo
            // 
            this.labelResumo.AutoSize = true;
            this.labelResumo.Font = new System.Drawing.Font("Segoe UI", 11F, System.Drawing.FontStyle.Bold);
            this.labelResumo.Location = new System.Drawing.Point(12, 15);
            this.labelResumo.Name = "labelResumo";
            this.labelResumo.Size = new System.Drawing.Size(137, 20);
            this.labelResumo.TabIndex = 0;
            this.labelResumo.Text = "Totais por categoria:";
            // 
            // FormPrincipal
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(7F, 17F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(800, 450);
            this.Controls.Add(this.tabControl);
            this.Font = new System.Drawing.Font("Segoe UI", 9.75F);
            this.Name = "FormPrincipal";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
            this.Text = "Gestão de Finanças Pessoais";
            this.Load += new System.EventHandler(this.FormPrincipal_Load);
            this.tabControl.ResumeLayout(false);
            this.tabCategorias.ResumeLayout(false);
            this.tabDespesas.ResumeLayout(false);
            this.tabResumo.ResumeLayout(false);
            this.tabResumo.PerformLayout();
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.TabControl tabControl;
        private System.Windows.Forms.TabPage tabCategorias;
        private System.Windows.Forms.TabPage tabDespesas;
        private System.Windows.Forms.TabPage tabResumo;
        private System.Windows.Forms.ListBox listCategorias;
        private System.Windows.Forms.Button btnAddCategoria;
        private System.Windows.Forms.Button btnRemoverCategoria;
        private System.Windows.Forms.ListBox listDespesas;
        private System.Windows.Forms.Button btnAddDespesa;
        private System.Windows.Forms.Button btnRemoverDespesa;
        private System.Windows.Forms.ComboBox cbCategorias;
        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.ListBox listResumo;
        private System.Windows.Forms.Label labelResumo;
    }
}
