// NOVO GestorPersistencia.cs (COMPLETO E CORRIGIDO)
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using ProjetoApp.Classes;
using System.Linq; 
using System; // Para o tipo Type

namespace ProjetoApp.Persistence
{
    /// <summary>
    /// Gerencia a leitura e escrita de dados (Utilizadores e Categorias) para ficheiros JSON.
    /// </summary>
    public class GestorPersistencia
    {
        private const string FilePathUtilizadores = "utilizadores.json";
        private const string FilePathCategorias = "categorias.json"; // NOVO: Ficheiro para categorias

        // Configuração de serialização/desserialização
        private static readonly JsonSerializerOptions Options = new JsonSerializerOptions
        {
            WriteIndented = true,
            PropertyNameCaseInsensitive = true // Boa prática
            // Necessário adicionar um TypeInfoResolver ou Converter para polimorfismo (Utilizador/Administrador)
        };

        public List<Utilizador> Utilizadores { get; private set; }
        public List<Categoria> Categorias { get; private set; }

        public GestorPersistencia()
        {
            CarregarUtilizadores();
            CarregarCategorias(); // Carrega categorias na inicialização
        }

        // ======================================
        // 1. GESTÃO DE UTILIZADORES
        // ======================================
        
        /// <summary>
        /// Guarda a lista atual de utilizadores no ficheiro JSON.
        /// </summary>
        public void GuardarUtilizadores()
        {
            var json = JsonSerializer.Serialize(this.Utilizadores, Options);
            File.WriteAllText(FilePathUtilizadores, json);
        }

        /// <summary>
        /// Carrega a lista de utilizadores do ficheiro JSON.
        /// NOTA: Requer um mecanismo para lidar com a herança (Administrador).
        /// </summary>
        public void CarregarUtilizadores()
        {
            if (!File.Exists(FilePathUtilizadores))
            {
                Utilizadores = new List<Utilizador>();
                return;
            }

            var json = File.ReadAllText(FilePathUtilizadores);
            // Assumindo que a herança é tratada por configuração externa ou versão .NET > 7
            // Se usar .NET mais antigo, terá de implementar um JsonConverter personalizado.
            Utilizadores = JsonSerializer.Deserialize<List<Utilizador>>(json, Options) ?? new List<Utilizador>(); 
        }

        // ======================================
        // 2. GESTÃO DE CATEGORIAS (NOVO)
        // ======================================
        
        /// <summary>
        /// Guarda a lista atual de categorias no ficheiro JSON.
        /// </summary>
        public void GuardarCategorias()
        {
            var json = JsonSerializer.Serialize(this.Categorias, Options);
            File.WriteAllText(FilePathCategorias, json);
        }

        /// <summary>
        /// Carrega a lista de categorias do ficheiro JSON.
        /// </summary>
        public void CarregarCategorias()
        {
            if (!File.Exists(FilePathCategorias))
            {
                Categorias = new List<Categoria>();
                return;
            }

            var json = File.ReadAllText(FilePathCategorias);
            Categorias = JsonSerializer.Deserialize<List<Categoria>>(json, Options) ?? new List<Categoria>();
        }
    }
}