using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using ProjetoApp.Classes;
using System.Linq;
using System;

namespace ProjetoApp.Persistence
{
    public class GestorPersistencia
    {
        private const string FilePathUtilizadores = "utilizadores.json";
        private const string FilePathCategorias = "categorias.json";

        private static readonly JsonSerializerOptions Options = new JsonSerializerOptions
        {
            WriteIndented = true,
        };

        public List<Utilizador> Utilizadores { get; private set; } = new List<Utilizador>();
        public List<Categoria> Categorias { get; private set; } = new List<Categoria>();

        public GestorPersistencia()
        {
            CarregarUtilizadores();
            CarregarCategorias();
        }

        // ======================================
        // 1. GESTÃO DE UTILIZADORES
        // ======================================

        public void GuardarUtilizadores()
        {
            var json = JsonSerializer.Serialize(this.Utilizadores, Options);
            File.WriteAllText(FilePathUtilizadores, json);
        }

        public void CarregarUtilizadores()
        {
            if (!File.Exists(FilePathUtilizadores))
            {
                Utilizadores = new List<Utilizador>();
                return;
            }

            try
            {
                var json = File.ReadAllText(FilePathUtilizadores);
                Utilizadores = JsonSerializer.Deserialize<List<Utilizador>>(json, Options) ?? new List<Utilizador>();
            }
            catch (Exception)
            {
                // Caso o ficheiro esteja corrompido, inicia uma lista vazia e avança.
                Utilizadores = new List<Utilizador>();
            }
        }

        // ======================================
        // 2. GESTÃO DE CATEGORIAS
        // ======================================

        public void GuardarCategorias()
        {
            var json = JsonSerializer.Serialize(this.Categorias, Options);
            File.WriteAllText(FilePathCategorias, json);
        }

        public void CarregarCategorias()
        {
            if (!File.Exists(FilePathCategorias))
            {
                Categorias = new List<Categoria>();
                return;
            }

            try
            {
                var json = File.ReadAllText(FilePathCategorias);
                Categorias = JsonSerializer.Deserialize<List<Categoria>>(json, Options) ?? new List<Categoria>();
            }
            catch (Exception)
            {
                Categorias = new List<Categoria>();
            }
        }
    }
}