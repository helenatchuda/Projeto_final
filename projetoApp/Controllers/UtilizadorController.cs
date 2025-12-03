using ProjetoApp.Classes;
using ProjetoApp.Persistence; 
using System.Linq;
using System.Collections.Generic;
using System; 

namespace ProjetoApp.Controllers
{
    /// <summary>
    /// Controller responsável pela gestão da lógica de negócio relacionada com Utilizadores
    /// (Registo, Login, Listagem e inicialização do Administrador).
    /// </summary>
    public class UtilizadorController
    {
        // Acesso privado ao gestor de persistência.
        private GestorPersistencia Persistencia { get; } 

        /// <summary>
        /// Inicializa o UtilizadorController e garante que existe um Administrador na base de dados.
        /// </summary>
        public UtilizadorController(GestorPersistencia gestorPersistencia)
        {
            Persistencia = gestorPersistencia;

            // Lógica de Inicialização: Cria o Administrador inicial se não houver utilizadores
            if (!Persistencia.Utilizadores.Any())
            {
                // CORREÇÃO DE POO: Instancia como Administrador, não Utilizador
                var admin = new Administrador("Administrador", "Admin@estgv.tdm", "Admin123!");
                Persistencia.Utilizadores.Add(admin);
                
                // CORREÇÃO: Usa o método GuardarUtilizadores sem argumentos
                Persistencia.GuardarUtilizadores(); 
            }
        }

        // ------------------- MÉTODOS DE NEGÓCIO -------------------

        /// <summary>
        /// Lista todos os utilizadores registados no sistema.
        /// </summary>
        public IEnumerable<Utilizador> Listar()
        {
            return Persistencia.Utilizadores;
        }

        /// <summary>
        /// Tenta fazer login com o email e password fornecidos.
        /// </summary>
        /// <returns>O objeto Utilizador se o login for bem-sucedido, caso contrário, null.</returns>
        public Utilizador? FazerLogin(string email, string password)
        {
            var utilizador = Persistencia.Utilizadores
                .FirstOrDefault(u => u.Email.Equals(email, StringComparison.OrdinalIgnoreCase));

            if (utilizador != null)
            {
                try
                {
                    utilizador.FazerLogin(password);
                    
                    // CORREÇÃO: Guarda o novo estado (EstadoLogado = true)
                    Persistencia.GuardarUtilizadores();
                    
                    return utilizador;
                }
                catch (InvalidOperationException)
                {
                    // Trata exceções de login (Password incorreta ou Conta inativa)
                    return null; 
                }
            }
            return null; // Utilizador não encontrado
        }

        /// <summary>
        /// Cria um novo utilizador, valida o email (para duplicidade) e guarda na persistência.
        /// </summary>
        public Utilizador CriarNovoUtilizador(string nome, string email, string password)
        {
            if (Persistencia.Utilizadores.Any(u => u.Email.Equals(email, StringComparison.OrdinalIgnoreCase)))
            {
                throw new InvalidOperationException("Este email já está registado.");
            }

            var novoUtilizador = new Utilizador(nome, email, password);
            Persistencia.Utilizadores.Add(novoUtilizador);
            
            // CORREÇÃO: Guarda a lista atualizada
            Persistencia.GuardarUtilizadores();
            
            return novoUtilizador;
        }


        // ------------------- MÉTODOS DE INTERFACE / MENU -------------------
        // (Estes métodos são para consola/terminal e não fazem parte da API web)

        /// <summary>
        /// Inicia o menu principal da aplicação em modo consola.
        /// </summary>
        public void Iniciar()
        {
            bool sair = false;
            while (!sair)
            {
                Console.Clear();
                Console.WriteLine("=====================================");
                Console.WriteLine("||        MENU PRINCIPAL           ||");
                Console.WriteLine("=====================================");
                Console.WriteLine("1. Fazer Login");
                Console.WriteLine("2. Criar Novo Utilizador");
                Console.WriteLine("3. Listar Utilizadores");
                Console.WriteLine("0. Sair");
                Console.WriteLine("-------------------------------------");
                Console.Write("Escolha uma opção: ");

                string opcao = Console.ReadLine()!;

                switch (opcao)
                {
                    case "1":
                        MenuFazerLogin();
                        break;
                    case "2":
                        MenuCriarNovoUtilizador();
                        break;
                    case "3":
                        MenuListarUtilizadores();
                        break;
                    case "0":
                        sair = true;
                        break;
                    default:
                        Console.ForegroundColor = ConsoleColor.Yellow;
                        Console.WriteLine("\nOpção inválida. Pressione qualquer tecla para tentar novamente.");
                        Console.ResetColor();
                        Console.ReadKey();
                        break;
                }
            }
            Console.WriteLine("\nAplicação encerrada. Até à próxima!");
        }

        private void MenuFazerLogin()
        {
            Console.Clear();
            Console.WriteLine("--- Login ---");
            Console.Write("Email: ");
            string email = Console.ReadLine()!;
            Console.Write("Password: ");
            string password = Console.ReadLine()!;

            try
            {
                var utilizador = FazerLogin(email, password);

                if (utilizador != null)
                {
                    Console.ForegroundColor = ConsoleColor.Green;
                    Console.WriteLine($"\nLogin bem-sucedido. Bem-vindo, {utilizador.Nome}!");
                    Console.ResetColor();
                }
                else
                {
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine("\nEmail ou Password incorretos.");
                    Console.ResetColor();
                }
            }
            catch (Exception ex)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine($"\nOcorreu um erro inesperado: {ex.Message}");
                Console.ResetColor();
            }
            Console.WriteLine("\nPressione qualquer tecla para continuar...");
            Console.ReadKey(); 
        }

        private void MenuCriarNovoUtilizador()
        {
            Console.Clear();
            Console.WriteLine("--- Criar Novo Utilizador ---");
            Console.Write("Nome: ");
            string nome = Console.ReadLine()!;
            Console.Write("Email: ");
            string email = Console.ReadLine()!;
            Console.Write("Password: ");
            string password = Console.ReadLine()!;

            try
            {
                CriarNovoUtilizador(nome, email, password);

                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine($"\nUtilizador {nome} criado com sucesso!");
                Console.ResetColor();
            }
            catch (ArgumentException ex)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine($"\nFalha na criação (Erro de dados): {ex.Message}");
                Console.ResetColor();
            }
            catch (InvalidOperationException ex)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine($"\nFalha na criação (Registo existente): {ex.Message}");
                Console.ResetColor();
            }
            catch (Exception ex)
            {
                Console.ForegroundColor = ConsoleColor.Yellow;
                Console.WriteLine($"\nOcorreu um erro inesperado: {ex.Message}");
                Console.ResetColor();
            }
            Console.WriteLine("\nPressione qualquer tecla para continuar...");
            Console.ReadKey(); 
        }

        private void MenuListarUtilizadores()
        {
            Console.Clear();
            Console.WriteLine("--- Lista de Utilizadores ---");
            Console.WriteLine("------------------------------");

            var utilizadores = Listar().ToList();

            if (!utilizadores.Any())
            {
                Console.WriteLine("Não há utilizadores registados.");
            }
            else
            {
                Console.WriteLine("{0,-40} {1,-30} {2,-10} {3,-10}", "NOME", "Email", "Ativo", "Logado");
                Console.WriteLine(new string('-', 90));

                foreach (var u in utilizadores)
                {
                    // Usa o nome da classe (Utilizador ou Administrador) para identificação
                    string tipo = u.GetType().Name; 
                    string nomeFormatado = $"{u.Nome} ({tipo}) - {u.Id.ToString().Substring(0, 8)}";

                    Console.WriteLine("{0,-40} {1,-30} {2,-10} {3,-10}",
                        nomeFormatado,
                        u.Email,
                        u.Activo ? "Sim" : "Não",
                        u.EstadoLogado ? "Sim" : "Não");
                }
            }
            Console.WriteLine("\nPressione qualquer tecla para continuar...");
            Console.ReadKey(); 
        }
    }
}