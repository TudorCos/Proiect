using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;

namespace PcGarage.Api.Services
{
    public interface IEmailService
    {
        Task SendOrderConfirmationEmailAsync(string toEmail, string userName, PcGarage.Api.Models.Order order);
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendOrderConfirmationEmailAsync(string toEmail, string userName, PcGarage.Api.Models.Order order)
        {
            var smtpHost = _config["EmailSettings:SmtpHost"];
            var smtpPort = int.Parse(_config["EmailSettings:SmtpPort"] ?? "587");
            var smtpUser = _config["EmailSettings:SmtpUser"];
            var smtpPass = _config["EmailSettings:SmtpPass"];
            var fromEmail = _config["EmailSettings:FromEmail"];

            // Construim HTML-ul emailului
            var itemsHtml = string.Join("", order.Items.Select(i => 
                $"<tr><td style='padding:10px;border-bottom:1px solid #ddd;'>{i.ProductName}</td><td style='padding:10px;border-bottom:1px solid #ddd;text-align:center;'>{i.Quantity}</td><td style='padding:10px;border-bottom:1px solid #ddd;text-align:right;'>{i.Price:N2} RON</td></tr>"));

            var body = $@"
            <div style='font-family: ""Segoe UI"", Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);'>
                <div style='background-color: #0ea5e9; color: white; padding: 25px; text-align: center;'>
                    <h1 style='margin: 0; font-size: 26px; font-weight: 600;'>Confirmare Comandă</h1>
                </div>
                <div style='padding: 30px;'>
                    <p style='font-size: 16px; margin-top: 0;'>Salutare, <strong>{userName}</strong>!</p>
                    <p style='font-size: 15px; line-height: 1.5;'>Îți mulțumim pentru comanda plasată la <strong>PC Garage</strong>! Am primit comanda ta și este în curs de procesare.</p>
                    
                    <div style='background-color: #f8fafc; padding: 15px 20px; border-radius: 6px; border: 1px solid #e2e8f0; margin: 25px 0;'>
                        <p style='margin: 0 0 8px 0; font-size: 15px;'><strong>Număr comandă:</strong> <span style='font-family: monospace; color: #0ea5e9;'>{order.Id}</span></p>
                        <p style='margin: 0; font-size: 15px;'><strong>Data plasării:</strong> {order.CreatedAt.ToString("dd.MM.yyyy HH:mm")}</p>
                    </div>

                    <h3 style='border-bottom: 2px solid #0ea5e9; padding-bottom: 8px; color: #0f172a; margin-top: 30px; font-size: 18px;'>Detaliile comenzii tale</h3>
                    
                    <table style='width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px;'>
                        <thead>
                            <tr style='background-color: #f1f5f9; text-align: left;'>
                                <th style='padding: 12px; border-bottom: 2px solid #cbd5e1; color: #475569;'>Produs</th>
                                <th style='padding: 12px; border-bottom: 2px solid #cbd5e1; color: #475569; text-align:center;'>Cantitate</th>
                                <th style='padding: 12px; border-bottom: 2px solid #cbd5e1; color: #475569; text-align:right;'>Preț Unitar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {itemsHtml}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan='2' style='padding: 15px 12px; text-align: right; font-weight: 600; font-size: 16px; color: #0f172a;'>Total de plată:</td>
                                <td style='padding: 15px 12px; text-align: right; font-weight: 700; font-size: 18px; color: #0ea5e9;'>{order.Total:N2} RON</td>
                            </tr>
                        </tfoot>
                    </table>
                    
                    <p style='margin-top: 35px; font-size: 14px; color: #64748b; line-height: 1.5;'>
                        Dacă ai întrebări referitoare la comandă, te rugăm să ne contactezi folosind numărul comenzii menționat mai sus.
                    </p>
                </div>
                <div style='background-color: #f8fafc; padding: 20px; text-align: center; font-size: 13px; color: #94a3b8; border-top: 1px solid #e2e8f0;'>
                    &copy; {DateTime.Now.Year} PC Garage. Toate drepturile rezervate.<br>
                    <span style='font-size: 11px;'>Acesta este un mesaj automat, te rugăm să nu răspunzi.</span>
                </div>
            </div>";

            if (string.IsNullOrEmpty(smtpHost) || string.IsNullOrEmpty(smtpUser))
            {
                // Fallback / Mock logic when no SMTP is configured
                Console.WriteLine("-------------------------------------------------------------------");
                Console.WriteLine($"[EMAIL MOCK] Email ready to be sent to: {toEmail}");
                Console.WriteLine($"[EMAIL MOCK] Subject: Confirmare comanda #{order.Id.Substring(0, 8)}");
                Console.WriteLine($"[EMAIL MOCK] Content length: {body.Length} HTML characters");
                Console.WriteLine($"[EMAIL MOCK] Please set EmailSettings in appsettings.json to send real emails.");
                Console.WriteLine("-------------------------------------------------------------------");
                return;
            }

            try
            {
                var client = new SmtpClient(smtpHost, smtpPort)
                {
                    Credentials = new NetworkCredential(smtpUser, smtpPass),
                    EnableSsl = true
                };

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(fromEmail, "PC Garage"),
                    Subject = $"Confirmare comandă #{order.Id.Substring(0, 8)}",
                    Body = body,
                    IsBodyHtml = true
                };
                mailMessage.To.Add(toEmail);

                await client.SendMailAsync(mailMessage);
                Console.WriteLine($"[EMAIL SUCCESS] Sent confirmation to {toEmail}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[EMAIL ERROR] Failed to send email: {ex.Message}");
            }
        }
    }
}
