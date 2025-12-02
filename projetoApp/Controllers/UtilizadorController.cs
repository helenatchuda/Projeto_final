using ProjetoApp.Classes;
using ProjetoApp.Persistence; // <<<< LINHA ADICIONADA/CORRIGIDA (Resolve o erro de namespace)
using System.Linq;
using System.Collections.Generic;
using System; // Necessário para Console, InvalidOperationException, etc.

namespace ProjetoApp.Controllers
{
    public class UtilizadorController
    {
        // Alterado de 'public' para 'private' e adicionado '?' para boa prática.
        private GestorPersistencia Persistencia { get; set; } 

        public UtilizadorController(GestorPersistencia gestorPersistencia)
        {
            // O tipo GestorPersistencia agora é reconhecido graças ao using acima.
            Persistencia = gestorPersistencia;

            // Lógica de Inicialização: Cria o Admin se não houver utilizadores
            if (!Persistencia.Utilizadores.Any())
            {
                var admin = new Utilizador("Administrador", "Admin@estgv.tdm", "Admin123!");
                Persistencia.Utilizadores.Add(admin);
                // Assume-se que Guardar foi corrigido para aceitar a lista (como discutido)
                Persistencia.Guardar(Persistencia.Utilizadores); 
            }
        }

        // --- MÉTODOS DE NEGÓCIO ---

        public IEnumerable<Utilizador> Listar()
        {
            return Persistencia.Utilizadores;
        }

        public Utilizador? FazerLogin(string email, string password)
        {
            var utilizador = Persistencia.Utilizadores
                .FirstOrDefault(u => u.Email.Equals(email, StringComparison.OrdinalIgnoreCase));

            if (utilizador != null)
            {
                try
                {
                    utilizador.FazerLogin(password);
                    Persistencia.Guardar(Persistencia.Utilizadores);
                    return utilizador;
                }
                catch (InvalidOperationException)
                {
                    return null; // Login falhou (password incorreta)
                }
            }
            return null; // Utilizador não encontrado
        }

        public Utilizador CriarNovoUtilizador(string nome, string email, string password)
        {
            if (Persistencia.Utilizadores.Any(u => u.Email.Equals(email, StringComparison.OrdinalIgnoreCase)))
            {
                throw new InvalidOperationException("Este email já está registado.");
            }

            var novoUtilizador = new Utilizador(nome, email, password);
            Persistencia.Utilizadores.Add(novoUtilizador);
            Persistencia.Guardar(Persistencia.Utilizadores);
            return novoUtilizador;
        }


        // --- MÉTODOS DE INTERFACE / MENU CORRIGIDOS ---

        public void Iniciar()
        {
            bool sair = false;
            while (!sair)
            {
                Console.Clear();
                Console.WriteLine("=====================================");
                Console.WriteLine("||        MENU PRINCIPAL           ||");
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
            Console.ReadKey(); // <<<< ADICIONADO Console.ReadKey()
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
            Console.ReadKey(); // <<<< ADICIONADO Console.ReadKey()
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
            Console.ReadKey(); // <<<< ADICIONADO Console.ReadKey()
        }
    }
}