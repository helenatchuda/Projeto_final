using ProjetoApp.Classes;
using System.Linq;
using System.Collections.Generic;

namespace ProjetoApp.Controllers
{
    public class UtilizadorController
    {
        public GestorPersistencia Persistencia;

        public UtilizadorController(GestorPersistencia gestorPersistencia)
        {
            Persistencia = gestorPersistencia;

            if (Persistencia.Utilizadores.Count() == 0)
            {

                var admin = new Utilizador("Administrador", "Admin@estgv.tdm", "Admin123!");
                Persistencia.Utilizadores.Add(admin);
                Persistencia.Guardar(Persistencia.Utilizadores);
            }
        }


        public IEnumerable<Utilizador> Listar()
        {
            return Persistencia.Utilizadores;
        }

        public Utilizador? FazerLogin(string email, string password)
        {
            var utilizador = Persistencia.Utilizadores.FirstOrDefault(u => u.Email.Equals(email, StringComparison.OrdinalIgnoreCase));

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

                    return null;
                }
            }
            return null;
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


        public void Iniciar()
        {
            Console.Clear();
            bool sair = false;
            while (!sair)
            {

            }
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
                Console.WriteLine($"\nFalha na criação: {ex.Message}");
                Console.ResetColor();
            }
            catch (InvalidOperationException ex)
            {
               
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine($"\nFalha na criação: {ex.Message}");
                Console.ResetColor();
            }
            catch (Exception ex)
            {
               
                Console.ForegroundColor = ConsoleColor.Yellow;
                Console.WriteLine($"\nOcorreu um erro inesperado: {ex.Message}");
                Console.ResetColor();
            }
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
                return;
            }

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
    }
}