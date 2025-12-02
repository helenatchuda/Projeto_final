using ProjetoApp.Controllers;
using ProjetoApp.Classes;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();


var gestorPersistencia = new GestorPersistencia();
var controllerUtilizadores = new UtilizadorController(gestorPersistencia);
var controllerCategorias = new CategoriaController(gestorPersistencia);
var controllerReceitas = new ReceitaController(gestorPersistencia, controllerCategorias); 
var controllerDespesas = new DespesaController(gestorPersistencia, controllerCategorias);


app.MapGet("api/utilizadores", () =>
{
    return controllerUtilizadores.Listar();
});



app.MapPost("/utilizadores/registar", (string nome, string email, string password) =>
{
    try
    {
        controllerUtilizadores.CriarNovoUtilizador(nome, email, password);
        return Results.Ok("Utilizador registado com sucesso!");
    }
    catch (Exception ex)
    {
        return Results.BadRequest(ex.Message);
    }
});



app.MapPost("/utilizadores/login", (string email, string password) =>
{
    
    var utilizador = controllerUtilizadores.FazerLogin(email, password);
    
    if (utilizador != null)
        return Results.Ok(new { message = "Login bem-sucedido!", user = utilizador });
    else
        
        return Results.Unauthorized(); 
});


app.MapPost("/utilizadores/logout", (string email) =>
{
    var utilizador = controllerUtilizadores.Listar().FirstOrDefault(u => u.Email.Equals(email, StringComparison.OrdinalIgnoreCase));
    
    if (utilizador != null)
    {
        utilizador.FazerLogout(); 
        controllerUtilizadores.Persistencia.Guardar(controllerUtilizadores.Persistencia.Utilizadores);
    }
    
    return Results.Ok("Logout efetuado.");
});

app.Run();