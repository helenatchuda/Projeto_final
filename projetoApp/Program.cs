


using ProjetoApp.Controllers;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
 
 app.UseDefaultFiles();
 app.UseStaticFiles();

var gestorPersistencia = new GestorPersistencia();
var repoUtilizadores = new UtilizadorController(gestorPersistencia);
var controllerUtilizadores = new UtilizadorController(gestorPersistencia);


 
app.MapGet("api/utilizadores", () =>
 {
    return controllerUtilizadores.Listar();
 });


app.MapPost("/utilizadores/registar", (string nome, string email, string password) =>
{
    try
    {
        //controllerUtilizadores.RegistarUtilizador(nome, email, password);
        return Results.Ok("Utilizador registado com sucesso!");
    }
    catch (Exception ex)
    {
        return Results.BadRequest(ex.Message);
    }
});


app.MapPost("/utilizadores/login", (string email, string password) =>
{
    //if (controllerUtilizadores.FazerLogin(email, password))
    if (controllerUtilizadores.Autenticar() != null)
        return Results.Ok("Login bem-sucedido!");
    else
        return Results.BadRequest("Falha no login.");
});


app.MapPost("/utilizadores/logout", (string email) =>
{
    //controllerUtilizadores.FazerLogout(email);
    return Results.Ok("Logout efetuado.");
});

app.Run();
