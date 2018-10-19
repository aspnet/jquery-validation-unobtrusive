using ClientValidationWebSite.Models;
using Microsoft.AspNetCore.Mvc;

namespace ClientValidationWebSite.Controllers
{
    [Route("[controller]/[action]")]
    public class ValidationController : Controller
    {
        [HttpGet("{property=LastName}")]
        public IActionResult Index([FromRoute] string property)
        {
            ViewData[nameof(property)] = property;
            return View();
        }

        [HttpPost]
        public IActionResult Validate([FromForm] ValidationModel model)
        {
            return RedirectToAction("Error", "Home");
        }

        [HttpPost]
        [Produces("application/json")]
        public IActionResult UserName([FromForm] string userName)
        {
            if (!userName.StartsWith("a"))
            {
                return Ok(false);
            }
            else
            {
                return Ok(true);
            }
        }

        [HttpGet]
        [Produces("application/json")]
        public IActionResult Likes([FromQuery] int likes)
        {
            if (likes < 0)
            {
                return Ok(false);
            }
            else
            {
                return Ok(true);
            }
        }
    }
}
