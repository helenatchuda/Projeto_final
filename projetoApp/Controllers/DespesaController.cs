

using ProjetoApp.Classes;
using ProjetoApp.Persistence; // << NECESSÁRIO para GestorPersistencia
using ProjetoApp.Controllers; // Se a CategoriaController estiver neste namespace
using System.Collections.Generic;
using System.Linq;
using System;
using System.Collections; // Para KeyNotFoundException

namespace ProjetoApp.Controllers
{
    public class DespesaController
    {
        
        private GestorPersistencia Persistencia { get; } 
        private CategoriaController CategoriaController { get; }
        
       
        public DespesaController(GestorPersistencia gestorPersistencia, CategoriaController categoriaController)
        {
          
            Persistencia = gestorPersistencia;
            CategoriaController = categoriaController;
        }
        
      
        public IEnumerable<Despesa> ListarDespesasUtilizador(Utilizador utilizador)
        {
            if (utilizador == null)
                throw new ArgumentNullException(nameof(utilizador), "O utilizador não pode ser nulo.");
                
            return utilizador.Despesas.OrderByDescending(d => d.Data);
        }
        
       
        public Despesa? ObterDespesaPorId(Utilizador utilizador, Guid despesaId)
        {
            if (utilizador == null)
                throw new ArgumentNullException(nameof(utilizador), "O utilizador não pode ser nulo.");
                
            return utilizador.Despesas.FirstOrDefault(d => d.Id == despesaId);
        }

       
        public Despesa Criar(Utilizador utilizador, decimal valor, string descricao, Guid categoriaId)
        {
            if (utilizador == null)
                throw new ArgumentNullException(nameof(utilizador), "O utilizador não pode ser nulo.");
                
           
            if (CategoriaController.ObterPorId(categoriaId) == null)
            {
                throw new KeyNotFoundException("Categoria de Despesa inválida. Não encontrada.");
            }

            var novaDespesa = new Despesa(utilizador.Id, valor, descricao, categoriaId);
            
          
            utilizador.AdicionarDespesa(novaDespesa); 
            
        
            Persistencia.GuardarUtilizadores(); 
            
            return novaDespesa;
        }

        public void Editar(Utilizador utilizador, Guid despesaId, decimal novoValor, string novaDescricao, Guid novaCategoriaId)
        {
            if (utilizador == null)
                throw new ArgumentNullException(nameof(utilizador), "O utilizador não pode ser nulo.");

            var despesa = ObterDespesaPorId(utilizador, despesaId);
            if (despesa == null)
            {
                throw new KeyNotFoundException("Despesa não encontrada.");
            }
            
         
            if (CategoriaController.ObterPorId(novaCategoriaId) == null)
            {
                throw new KeyNotFoundException("Categoria de Despesa inválida. Não encontrada.");
            }

       
            despesa.Editar(novoValor, novaDescricao, novaCategoriaId); 
            
            Persistencia.GuardarUtilizadores();
        }

        public void Eliminar(Utilizador utilizador, Guid despesaId)
        {
            if (utilizador == null)
                throw new ArgumentNullException(nameof(utilizador), "O utilizador não pode ser nulo.");
                
            var despesa = ObterDespesaPorId(utilizador, despesaId);
            if (despesa == null)
            {
                throw new KeyNotFoundException("Despesa não encontrada.");
            }

           
            utilizador.Despesas.Remove(despesa);
            
            Persistencia.GuardarUtilizadores();
        }
    }
}