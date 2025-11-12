using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using GestaoFinancasPessoais.Models;

namespace GestaoFinancasPessoais.Data
{
    public static class GestorJSON
    {
        private static readonly string caminhoCategorias = "categorias.json";
        private static readonly string caminhoDespesas = "despesas.json";

        public static List<Categoria> CarregarCategorias()
        {
            if (!File.Exists(caminhoCategorias)) return new();
            var json = File.ReadAllText(caminhoCategorias);
            return JsonSerializer.Deserialize<List<Categoria>>(json) ?? new();
        }

        public static List<Despesa> CarregarDespesas()
        {
            if (!File.Exists(caminhoDespesas)) return new();
            var json = File.ReadAllText(caminhoDespesas);
            return JsonSerializer.Deserialize<List<Despesa>>(json) ?? new();
        }

        public static void GuardarCategorias(IEnumerable<Categoria> categorias)
        {
            var json = JsonSerializer.Serialize(categorias, new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText(caminhoCategorias, json);
        }

        public static void GuardarDespesas(IEnumerable<Despesa> despesas)
        {
            var json = JsonSerializer.Serialize(despesas, new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText(caminhoDespesas, json);
        }
    }
}