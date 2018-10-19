using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;

namespace ClientValidationWebSite.Models
{
    public class ValidationModel
    {
        [Required]
        [MinLength(3)]
        public string Name { get; set; }

        [Required]
        [MaxLength(5)]
        public string LastName { get; set; }

        [Required]
        public string Password { get; set; }

        [Required]
        [Compare(nameof(Password))]
        public string PasswordConfirmation { get; set; }

        [EmailAddress]
        public string Email { get; set; }

        [Phone]
        public string PhoneNumber { get; set; }

        [CreditCard]
        public string CreditCard { get; set; }

        [Range(18, 99)]
        public int Age { get; set; }

        [Range(1.0, 5.0)]
        public double Rating { get; set; }

        [Required]
        [StringLength(15, MinimumLength = 8)]
        [RegularExpression("web\\..*")]
        public string Tag { get; set; }

        [Required]
        [FileExtensions(Extensions =".png,.jpg")]
        public string Photo { get; set; }
        
        [Url]
        public string WebPage { get; set; }

        [Remote("UserName", "Validation", HttpMethod = "POST")]
        public string UserName { get; set; }

        [Remote("Likes", "Validation", HttpMethod = "GET")]
        public int Likes { get; set; }
    }
}
