using ProjetoApp.Controllers;

using ProjetoApp.Classes;
using ProjetoApp.Persistence;


var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();


var gestorPersistencia = new GestorPersistencia();
var controllerUtilizadores = new UtilizadorController(gestorPersistencia);
var controllerCategorias = new CategoriaController(gestorPersistencia);
var controllerReceitas = new ReceitaController(gestorPersistencia, controllerCategorias); 
var controllerDespesas = new DespesaController(gestorPersistencia, controllerCategorias);



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


app.MapGet("/api/{utilizadorId}/despesas", (Guid utilizadorId) =>
{
    var utilizador = controllerUtilizadores.Listar().FirstOrDefault(u => u.Id == utilizadorId);
    if (utilizador == null) return Results.NotFound("Utilizador não encontrado.");

    return Results.Ok(controllerDespesas.ListarDespesasUtilizador(utilizador));
});

/// Cria uma nova despesa para um utilizador.
app.MapPost("/api/{utilizadorId}/despesas/criar", (Guid utilizadorId, decimal valor, string descricao, Guid categoriaId) =>
{
    var utilizador = controllerUtilizadores.Listar().FirstOrDefault(u => u.Id == utilizadorId);
    if (utilizador == null) return Results.NotFound("Utilizador não encontrado.");

    try
    {
        // Usa o DespesaController para criar e guardar
        var despesa = controllerDespesas.Criar(utilizador, valor, descricao, categoriaId);
        return Results.Created($"/api/{utilizadorId}/despesas/{despesa.Id}", despesa);
    }
    catch (Exception ex)
    {
        // Captura exceções de validação (valor <= 0 ou categoria inexistente)
        return Results.BadRequest(ex.Message); 
    }
});







app.Run();