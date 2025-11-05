using System;
using System.Collections.Generic;
using System.Linq;

namespace SistemaGestaoFinanceira
{
    public class GeradorRelatorios
    {
        // Gera relatório textual simples
        public void GerarRelatorio(Utilizador u)
        {
            double totalReceitas = ObterTotaisReceitas(u);
            double totalDespesas = ObterTotaisDespesas(u);
            double saldo = CalcularSaldo(totalReceitas, totalDespesas);

            Console.WriteLine("=== RELATÓRIO FINANCEIRO ===");
            Console.WriteLine($"Utilizador: {u.Nome}");
            Console.WriteLine($"Total Receitas: {totalReceitas} €");
            Console.WriteLine($"Total Despesas: {totalDespesas} €");
            Console.WriteLine($"Saldo Atual: {saldo} €");
        }

        // Calcula o saldo com base em totais
        public double CalcularSaldo(double totalReceitas, double totalDespesas)
        {
            return totalReceitas - totalDespesas;
        }

        // Obtém totais (simulação — no real, receberia dados do ficheiro)
        public double ObterTotaisReceitas(Utilizador u)
        {
            if (u.Receitas == null || u.Receitas.Count == 0)
                return 0;

            return u.Receitas.Sum(r => r.Valor);
        }

        public double ObterTotaisDespesas(Utilizador u)
        {
            if (u.Despesas == null || u.Despesas.Count == 0)
                return 0;

            return u.Despesas.Sum(d => d.Valor);
        }
    }
}