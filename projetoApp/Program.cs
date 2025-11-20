


var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
 
 p.UseDefaultFiles();
 app.UseStaticFiles();

 
 app.MapGet("api/utilizadores",(ControllerUtilizador controller)=>
 {
    return controller.GetTodos();
 });

var repoUtilizadores = new UtilizadorRepository("utilizadores.json");
var controllerUtilizadores = new UtilizadorController(repoUtilizadores);





app.MapPost("/utilizadores/registar", (string nome, string email, string password) =>
{
    try
    {
        controllerUtilizadores.RegistarUtilizador(nome, email, password);
        return Results.Ok("Utilizador registado com sucesso!");
    }
    catch (Exception ex)
    {
        return Results.BadRequest(ex.Message);
    }
});


app.MapPost("/utilizadores/login", (string email, string password) =>
{
    if (controllerUtilizadores.FazerLogin(email, password))
        return Results.Ok("Login bem-sucedido!");
    else
        return Results.BadRequest("Falha no login.");
});


app.MapPost("/utilizadores/logout", (string email) =>
{
    controllerUtilizadores.FazerLogout(email);
    return Results.Ok("Logout efetuado.");
});

app.Run();
