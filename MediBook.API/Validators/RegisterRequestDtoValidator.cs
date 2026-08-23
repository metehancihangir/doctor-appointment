using FluentValidation;
using MediBook.API.DTOs.Auth;

namespace MediBook.API.Validators;

public class RegisterRequestDtoValidator : AbstractValidator<RegisterRequestDto>
{
    public RegisterRequestDtoValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("Ad alanı zorunludur.")
            .MaximumLength(100).WithMessage("Ad en fazla 100 karakter olabilir.");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Soyad alanı zorunludur.")
            .MaximumLength(100).WithMessage("Soyad en fazla 100 karakter olabilir.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email alanı zorunludur.")
            .EmailAddress().WithMessage("Geçerli bir email adresi giriniz.");

        RuleFor(x => x.Phone)
            .NotEmpty().WithMessage("Telefon numarası zorunludur.")
            .Matches(@"^\d{10,11}$").WithMessage("Telefon numarası 10 veya 11 haneli sadece rakamlardan oluşmalıdır.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Şifre alanı zorunludur.")
            .MinimumLength(6).WithMessage("Şifre en az 6 karakter olmalıdır.");

        RuleFor(x => x.ConfirmPassword)
            .Equal(x => x.Password).WithMessage("Şifreler uyuşmuyor.");
            
        RuleFor(x => x.DateOfBirth)
            .NotEmpty().WithMessage("Doğum tarihi zorunludur.");
    }
}
