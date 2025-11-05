using System;
using System.IO;
using System.Text.Json;
using System.Collections.Generic;

namespace SistemaGestaoFinanceira
{
    public class PersistenciaDados
    {
        private readonly string caminhoBase = "dados/";

        public PersistenciaDados()
        {
            if (!Directory.Exists(caminhoBase))
                Directory.CreateDirectory(caminhoBase);
        }

        // Serializa um objeto em JSON
        public string Serializar(object objeto)
        {
            return JsonSerializer.Serialize(objeto, new JsonSerializerOptions { WriteIndented = true });
        }

        // Grava objeto no armazenamento local (ficheiro JSON)
        public void EscreverNoArmazenamento(string nomeFicheiro, string conteudo)
        {
            string caminho = Path.Combine(caminhoBase, nomeFicheiro);
            File.WriteAllText(caminho, conteudo);
        }

        // ------------------ UTILIZADOR ------------------
        public void PersistirUtilizador(Utilizador u)
        {
            string json = Serializar(u);
            EscreverNoArmazenamento($"utilizador_{u.Email}.json", json);
        }

        public Utilizador CarregarUtilizadorPorEmail(string email)
        {
            string caminho = Path.Combine(caminhoBase, $"utilizador_{email}.json");
            if (!File.Exists(caminho))
                return null;

            string json = File.ReadAllText(caminho);
            return JsonSerializer.Deserialize<Utilizador>(json);
        }

        // ------------------ RECEITA ------------------
        public void PersistirReceita(Receita r)
        {
            string json = Serializar(r);
            EscreverNoArmazenamento($"receita_{Guid.NewGuid()}.json", json);
        }

        // ------------------ DESPESA ------------------
        public void PersistirDespesa(Despesa d)
        {
            string json = Serializar(d);
            EscreverNoArmazenamento($"despesa_{Guid.NewGuid()}.json", json);
        }

        // ------------------ CATEGORIA ------------------
        public void PersistirCategoria(Categoria c)
        {
            string json = Serializar(c);
            EscreverNoArmazenamento($"categoria_{Guid.NewGuid()}.json", json);
        }
    }
}
