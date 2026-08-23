using System;
using FluentValidation;
using MediBook.API.DTOs.Appointment;

namespace MediBook.API.Validators;

public class CreateAppointmentDtoValidator : AbstractValidator<CreateAppointmentDto>
{
    public CreateAppointmentDtoValidator()
    {
        RuleFor(x => x.DoctorId)
            .GreaterThan(0).WithMessage("Geçerli bir doktor seçiniz.");

        RuleFor(x => x.AppointmentDate)
            .NotEmpty().WithMessage("Randevu tarihi zorunludur.")
            .Must(BeAValidDate).WithMessage("Geçmiş bir tarihe randevu alınamaz.");

        RuleFor(x => x.AppointmentTime)
            .NotEmpty().WithMessage("Randevu saati zorunludur.");
            
        // Complex rule to check if Date + Time is in the future
        RuleFor(x => x)
            .Must(x => IsFutureDateTime(x.AppointmentDate, x.AppointmentTime))
            .WithMessage("Randevu şu andan itibaren en az 2 saat sonrasına alınabilir.")
            .When(x => x.AppointmentDate != default && x.AppointmentTime != default);
    }

    private bool BeAValidDate(DateTime date)
    {
        return date.Date >= DateTime.Today;
    }
    
    private bool IsFutureDateTime(DateTime date, TimeSpan time)
    {
        var requestedDateTime = date.Date + time;
        return requestedDateTime >= DateTime.Now.AddHours(2);
    }
}
