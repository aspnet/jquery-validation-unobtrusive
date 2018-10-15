using System.ComponentModel.DataAnnotations;

namespace ClientValidationWebSite.Models
{
    public class ValidationModel
    {
        [Required]
        public string Name { get; set; }
    }
}
