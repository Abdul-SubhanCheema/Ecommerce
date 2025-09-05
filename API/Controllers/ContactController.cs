using API.Controllers;
using Microsoft.AspNetCore.Mvc;
using API.DTOs;

public class ContactController:BaseApiController
{
    public Task SubmitContactForm(ContactDto contactDto)
    {
        var email = "abdulsubhancheema97@gmail.com";
        var pw = "xvjeidfxoneerrij";   

        var client = new System.Net.Mail.SmtpClient("smtp.gmail.com", 587)
        {
            Credentials = new System.Net.NetworkCredential(email, pw),
            EnableSsl = true
        };
        
    }
}