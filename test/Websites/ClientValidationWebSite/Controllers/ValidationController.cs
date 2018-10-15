using ClientValidationWebSite.Models;
using Microsoft.AspNetCore.Mvc;

namespace ClientValidationWebSite.Controllers
{
    [Route("[controller]/[action]")]
    public class ValidationController : Controller
    {
        [HttpGet]
        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public IActionResult Validate([FromForm] ValidationModel model)
        {
            return RedirectToAction("Error", "Home");
        }
    }
}
