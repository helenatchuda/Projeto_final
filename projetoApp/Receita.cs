using System;

public class Receita
{
    public double Valor { get; set; }
    public DateTime Data { get; set; }
    public string Descricao { get; set; }
    public Categoria Categoria { get; set; } 


    public Receita(double valor, DateTime data, string descricao, Categoria categoria)
    {
        Valor = valor;
        Data = data;
        Descricao = descricao;
        Categoria = categoria;
    }

    
    public void setValor(double valor) { Valor = valor; }
    public void setData(DateTime data) { Data = data; }
    public void setDescricao(string descricao) { Descricao = descricao; }
    public void setCategoria(Categoria categoria) { Categoria = categoria; }
    public bool validar()
    {
        return Valor > 0 && Data != default(DateTime) && Categoria != null;
    }

    public double notaTotalReceitas(double valorReceitas)
    {
        return valorReceitas + Valor;
    }
}