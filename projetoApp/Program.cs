// =========================================================
// || 1. USINGS ESSENCIAIS DO FRAMEWORK ASP.NET CORE
// =========================================================
// =========================================================
// || 1. USINGS ESSENCIAIS DO FRAMEWORK ASP.NET CORE
// =========================================================
using Microsoft.AspNetCore.Builder; 
using Microsoft.AspNetCore.Mvc;  // CORRIGIDO: Necessário para usar [FromQuery]

// =========================================================
// || 2. USINGS DO PROJETO E SISTEMA
// =========================================================
using ProjetoApp.Controllers;
using ProjetoApp.Classes;
using ProjetoApp.Persistence;
// NOVO: Usings para tipos e métodos de sistema
using System.Linq; 
using System.Collections.Generic; 
using System; 
// NOVO: Usando o namespace onde estão os DTOs
using ProjetoApp.DTOs; 


// =========================================================
// || 3. CONFIGURAÇÃO BASE (TOP-LEVEL STATEMENTS)
// =========================================================
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();


var gestorPersistencia = new GestorPersistencia();
var controllerUtilizadores = new UtilizadorController(gestorPersistencia);
var controllerCategorias = new CategoriaController(gestorPersistencia);
var controllerReceitas = new ReceitaController(gestorPersistencia, controllerCategorias); 
var controllerDespesas = new DespesaController(gestorPersistencia, controllerCategorias);
var controllerRelatorios = new RelatorioController(controllerCategorias);


// ===============================================
// ||         ENDPOINT DE UTILIZADORES          ||
// ===============================================

app.MapGet("/api/utilizadores", () =>
{
    return controllerUtilizadores.Listar();
});

app.MapPost("/utilizadores/registar", (string nome, string email, string password) =>
{
    try
    {
        var novo = controllerUtilizadores.CriarNovoUtilizador(nome, email, password);
        return Results.Ok(new { message = "Utilizador registado!", user = novo });
    }
    catch (Exception ex)
    {
        return Results.BadRequest(ex.Message);
    }
});

app.MapPost("/utilizadores/login", (string email, string password) =>
{
    var utilizador = controllerUtilizadores.FazerLogin(email, password);

    if (utilizador == null)
        return Results.Unauthorized();

    return Results.Ok(new { message = "Login bem-sucedido!", user = utilizador });
});

app.MapPost("/utilizadores/logout", (string email) =>
{
    var utilizador = controllerUtilizadores
        .Listar()
        .FirstOrDefault(u => u.Email.Equals(email, StringComparison.OrdinalIgnoreCase));

    if (utilizador != null)
    {
        utilizador.FazerLogout();
        gestorPersistencia.GuardarUtilizadores(); 
    }

    return Results.Ok("Logout efetuado.");
});


// ===============================================
// ||         ENDPOINT DE CATEGORIAS            ||
// ===============================================

// Listar todas as categorias
app.MapGet("/api/categorias", () =>
{
    return Results.Ok(controllerCategorias.Listar());
});

// Criar nova categoria
app.MapPost("/api/categorias/criar", (CategoriaRequest body) => 
{
    try
    {
        var novaCategoria = controllerCategorias.Criar(body.Nome);
        return Results.Created($"/api/categorias/{novaCategoria.Id}", novaCategoria);
    }
    catch (Exception ex)
    {
        return Results.BadRequest(ex.Message);
    }
});

// Editar categoria
app.MapPut("/api/categorias/{id}/editar", (Guid id, CategoriaRequest body) => 
{
    try
    {
        controllerCategorias.Editar(id, body.Nome);
        return Results.Ok(new { message = "Categoria editada com sucesso." });
    }
    catch (KeyNotFoundException)
    {
        return Results.NotFound("Categoria não encontrada.");
    }
    catch (Exception ex)
    {
        return Results.BadRequest(ex.Message);
    }
});

// Eliminar categoria
app.MapDelete("/api/categorias/{id}/eliminar", (Guid id) =>
{
    try
    {
        controllerCategorias.Eliminar(id);
        return Results.Ok(new { message = "Categoria eliminada com sucesso." });
    }
    catch (KeyNotFoundException)
    {
        return Results.NotFound("Categoria não encontrada.");
    }
});


// ===============================================
// ||           ENDPOINT DE RECEITAS            ||
// ===============================================

// Listar todas as receitas de um utilizador
app.MapGet("/api/{utilizadorId}/receitas", (Guid utilizadorId) =>
{
    var utilizador = controllerUtilizadores.Listar().FirstOrDefault(u => u.Id == utilizadorId);
    if (utilizador == null) return Results.NotFound("Utilizador não encontrado.");

    return Results.Ok(controllerReceitas.ListarReceitasUtilizador(utilizador));
});

// Criar nova receita
app.MapPost("/api/{utilizadorId}/receitas/criar", (Guid utilizadorId, TransacaoRequest body) => 
{
    var utilizador = controllerUtilizadores.Listar().FirstOrDefault(u => u.Id == utilizadorId);
    if (utilizador == null) return Results.NotFound("Utilizador não encontrado.");

    try
    {
        var novaReceita = controllerReceitas.Criar(utilizador, body.Valor, body.Descricao, body.CategoriaId);
        return Results.Created($"/api/{utilizadorId}/receitas/{novaReceita.Id}", novaReceita);
    }
    catch (KeyNotFoundException) // Categoria não encontrada
    {
        return Results.NotFound("Categoria não encontrada.");
    }
    catch (Exception ex) // Valor inválido, descrição vazia
    {
        return Results.BadRequest(ex.Message);
    }
});

// Editar receita
app.MapPut("/api/{utilizadorId}/receitas/{receitaId}/editar", (Guid utilizadorId, Guid receitaId, TransacaoRequest body) => 
{
    var utilizador = controllerUtilizadores.Listar().FirstOrDefault(u => u.Id == utilizadorId);
    if (utilizador == null) return Results.NotFound("Utilizador não encontrado.");

    try
    {
        controllerReceitas.Editar(utilizador, receitaId, body.Valor, body.Descricao, body.CategoriaId);
        return Results.Ok(new { message = "Receita editada com sucesso." });
    }
    catch (KeyNotFoundException ex)
    {
        return Results.NotFound(ex.Message); 
    }
    catch (Exception ex)
    {
        return Results.BadRequest(ex.Message); 
    }
});

// Eliminar receita
app.MapDelete("/api/{utilizadorId}/receitas/{receitaId}/eliminar", (Guid utilizadorId, Guid receitaId) =>
{
    var utilizador = controllerUtilizadores.Listar().FirstOrDefault(u => u.Id == utilizadorId);
    if (utilizador == null) return Results.NotFound("Utilizador não encontrado.");
    
    try
    {
        controllerReceitas.Eliminar(utilizador, receitaId);
        return Results.Ok(new { message = "Receita eliminada com sucesso." });
    }
    catch (KeyNotFoundException)
    {
        return Results.NotFound("Receita não encontrada.");
    }
});


// ===============================================
// ||           ENDPOINT DE DESPESAS            ||
// ===============================================

// Listar todas as despesas de um utilizador 
app.MapGet("/api/{utilizadorId}/despesas", (Guid utilizadorId) =>
{
    var utilizador = controllerUtilizadores.Listar().FirstOrDefault(u => u.Id == utilizadorId);
    if (utilizador == null) return Results.NotFound("Utilizador não encontrado.");

    return Results.Ok(controllerDespesas.ListarDespesasUtilizador(utilizador));
});

// Criar nova despesa
app.MapPost("/api/{utilizadorId}/despesas/criar", (Guid utilizadorId, TransacaoRequest body) => 
{
    var utilizador = controllerUtilizadores.Listar().FirstOrDefault(u => u.Id == utilizadorId);
    if (utilizador == null) return Results.NotFound("Utilizador não encontrado.");

    try
    {
        var novaDespesa = controllerDespesas.Criar(utilizador, body.Valor, body.Descricao, body.CategoriaId);
        return Results.Created($"/api/{utilizadorId}/despesas/{novaDespesa.Id}", novaDespesa);
    }
    catch (KeyNotFoundException) // Categoria não encontrada
    {
        return Results.NotFound("Categoria não encontrada.");
    }
    catch (Exception ex) // Valor inválido, descrição vazia
    {
        return Results.BadRequest(ex.Message);
    }
});

// Editar despesa
app.MapPut("/api/{utilizadorId}/despesas/{despesaId}/editar", (Guid utilizadorId, Guid despesaId, TransacaoRequest body) => 
{
    var utilizador = controllerUtilizadores.Listar().FirstOrDefault(u => u.Id == utilizadorId);
    if (utilizador == null) return Results.NotFound("Utilizador não encontrado.");

    try
    {
        controllerDespesas.Editar(utilizador, despesaId, body.Valor, body.Descricao, body.CategoriaId);
        return Results.Ok(new { message = "Despesa editada com sucesso." });
    }
    catch (KeyNotFoundException ex)
    {
        return Results.NotFound(ex.Message);
    }
    catch (Exception ex)
    {
        return Results.BadRequest(ex.Message);
    }
});

// Eliminar despesa
app.MapDelete("/api/{utilizadorId}/despesas/{despesaId}/eliminar", (Guid utilizadorId, Guid despesaId) =>
{
    var utilizador = controllerUtilizadores.Listar().FirstOrDefault(u => u.Id == utilizadorId);
    if (utilizador == null) return Results.NotFound("Utilizador não encontrado.");
    
    try
    {
        controllerDespesas.Eliminar(utilizador, despesaId);
        return Results.Ok(new { message = "Despesa eliminada com sucesso." });
    }
    catch (KeyNotFoundException)
    {
        return Results.NotFound("Despesa não encontrada.");
    }
});


// ===============================================
// ||         ENDPOINT DE RELATÓRIOS            ||
// ===============================================

/// Determina o saldo atual (total) do utilizador.
app.MapGet("/api/{utilizadorId}/relatorio/saldo", (Guid utilizadorId) =>
{
    var utilizador = controllerUtilizadores.Listar().FirstOrDefault(u => u.Id == utilizadorId);
    if (utilizador == null) return Results.NotFound("Utilizador não encontrado.");

    decimal saldo = controllerRelatorios.CalcularSaldoAtual(utilizador);
    return Results.Ok(new { SaldoAtual = saldo });
});

/// Calcula o total de receitas e despesas num período definido e o saldo nesse período.
app.MapGet("/api/{utilizadorId}/relatorio/totais-por-periodo", (
    Guid utilizadorId, 
    [FromQuery] DateTime? inicio, 
    [FromQuery] DateTime? fim)     
    =>
{
    var utilizador = controllerUtilizadores.Listar().FirstOrDefault(u => u.Id == utilizadorId);
    if (utilizador == null) return Results.NotFound("Utilizador não encontrado.");
    
    decimal receitas = controllerRelatorios.CalcularTotalReceitasPorPeriodo(utilizador, inicio, fim);
    decimal despesas = controllerRelatorios.CalcularTotalDespesasPorPeriodo(utilizador, inicio, fim);
    decimal saldo = receitas - despesas;
    
    return Results.Ok(new 
    { 
        TotalReceitas = receitas, 
        TotalDespesas = despesas, 
        SaldoNoPeriodo = saldo,
        PeriodoInicio = inicio?.ToShortDateString(), 
        PeriodoFim = fim?.ToShortDateString()
    });
});

/// Lista as transações agrupadas por categoria, incluindo totais e saldo por categoria, num período opcional.
app.MapGet("/api/{utilizadorId}/relatorio/por-categoria", (
    Guid utilizadorId,
    [FromQuery] DateTime? inicio,
    [FromQuery] DateTime? fim)
    =>
{
    var utilizador = controllerUtilizadores.Listar().FirstOrDefault(u => u.Id == utilizadorId);
    if (utilizador == null) return Results.NotFound("Utilizador não encontrado.");
    
    var relatorio = controllerRelatorios.ListarTotaisPorCategoria(utilizador, inicio, fim);
    
    return Results.Ok(relatorio);
});


app.Run();