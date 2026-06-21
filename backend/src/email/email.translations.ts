import {
  BookingEmailContent,
  CancellationEmailContent,
  InfoEmailContent,
  PasswordResetEmailContent,
  VerificationEmailContent,
} from './email.types';

export const VERIFICATION_TEXTS: Record<'pl' | 'en', VerificationEmailContent> =
  {
    pl: {
      title: 'Witaj w Trainly! 🎉',
      subtitle: 'Twój kod weryfikacyjny:',
      expires: 'Kod wygasa za 10 minut.',
      footer: 'Jeśli nie zakładałeś konta, zignoruj tego emaila.',
    },
    en: {
      title: 'Welcome to Trainly! 🎉',
      subtitle: 'Your verification code:',
      expires: 'Code expires in 10 minutes.',
      footer: "If you didn't create an account, please ignore this email.",
    },
  };

export const PASSWORD_RESET_TEXTS: Record<
  'pl' | 'en',
  PasswordResetEmailContent
> = {
  pl: {
    title: 'Resetowanie hasła',
    subtitle:
      'Otrzymałeś ten email, ponieważ zażądano resetowania hasła dla Twojego konta.',
    codeLabel: 'Twój kod resetowania hasła:',
    expires: 'Kod wygasa za 10 minut.',
    footer: 'Jeśli nie prosiłeś o reset hasła, zignoruj tego emaila.',
  },
  en: {
    title: 'Password Reset',
    subtitle:
      'You received this email because a password reset was requested for your account.',
    codeLabel: 'Your password reset code:',
    expires: 'Code expires in 10 minutes.',
    footer: "If you didn't request a password reset, please ignore this email.",
  },
};

export const BOOKING_TEXTS = {
  guestConfirmation: {
    pl: {
      title: 'Rezerwacja potwierdzona! 🎉',
      subtitle: 'Twoja sesja została pomyślnie zarezerwowana.',
      dateLabel: 'Data',
      timeLabel: 'Godzina',
      durationLabel: 'Czas trwania',
      priceLabel: 'Cena',
      minutes: 'min',
      cancelInfo:
        'Jeśli nie możesz wziąć udziału, anuluj sesję klikając przycisk poniżej.',
      cancelButton: 'Anuluj sesję',
      footer: 'Dziękujemy za skorzystanie z Trainly!',
    },
    en: {
      title: 'Booking Confirmed! 🎉',
      subtitle: 'Your session has been successfully booked.',
      dateLabel: 'Date',
      timeLabel: 'Time',
      durationLabel: 'Duration',
      priceLabel: 'Price',
      minutes: 'min',
      cancelInfo:
        'If you cannot attend, cancel the session by clicking the button below.',
      cancelButton: 'Cancel Session',
      footer: 'Thank you for using Trainly!',
    },
  },

  clientConfirmation: {
    pl: {
      title: 'Rezerwacja potwierdzona! 🎉',
      subtitle: 'Szczegóły Twojej rezerwacji znajdują się poniżej.',
      dateLabel: 'Data',
      timeLabel: 'Godzina',
      durationLabel: 'Czas trwania',
      priceLabel: 'Cena',
      minutes: 'min',
      cancelInfo: 'Aby zarządzać sesją, przejdź do swojego panelu.',
      cancelButton: 'Przejdź do panelu',
      footer: 'Dziękujemy za skorzystanie z Trainly!',
    },
    en: {
      title: 'Booking Confirmed! 🎉',
      subtitle: 'Your booking details are listed below.',
      dateLabel: 'Date',
      timeLabel: 'Time',
      durationLabel: 'Duration',
      priceLabel: 'Price',
      minutes: 'min',
      cancelInfo: 'To manage your session, go to your dashboard.',
      cancelButton: 'Go to Dashboard',
      footer: 'Thank you for using Trainly!',
    },
  },
};

export const CANCELLATION_TEXTS = {
  byInstructor: {
    pl: {
      title: 'Sesja anulowana przez instruktora',
      subtitle: 'Niestety instruktor anulował zaplanowaną sesję.',
      dateLabel: 'Data',
      timeLabel: 'Godzina',
      reasonLabel: 'Powód',
      footer: 'Możesz zarezerwować nowy termin na Trainly.',
    },
    en: {
      title: 'Session Cancelled by Instructor',
      subtitle: 'Unfortunately the instructor cancelled the scheduled session.',
      dateLabel: 'Date',
      timeLabel: 'Time',
      reasonLabel: 'Reason',
      footer: 'You can book a new session on Trainly.',
    },
  },

  byClient: {
    pl: {
      title: 'Sesja anulowana przez klienta',
      subtitle: 'Klient anulował zaplanowaną sesję.',
      dateLabel: 'Data',
      timeLabel: 'Godzina',
      reasonLabel: 'Powód',
      footer: 'Sprawdź swój kalendarz na Trainly.',
    },
    en: {
      title: 'Session Cancelled by Client',
      subtitle: 'The client cancelled the scheduled session.',
      dateLabel: 'Date',
      timeLabel: 'Time',
      reasonLabel: 'Reason',
      footer: 'Check your calendar on Trainly.',
    },
  },
};

export const INFO_EMAIL_TEXTS = {
  manualBooking: {
    pl: {
      title: 'Nowa sesja od instruktora 📅',
      subtitle:
        'Instruktor utworzył dla Ciebie rezerwację. Aby potwierdzić lub odrzucić sesję, przejdź do swojego panelu.',
      dateLabel: 'Data',
      timeLabel: 'Godzina',
      durationLabel: 'Czas trwania',
      priceLabel: 'Cena',
      minutes: 'min',
      cancelInfo:
        'Możesz potwierdzić lub odrzucić tę sesję w swoim panelu użytkownika.',
      cancelButton: 'Przejdź do panelu',
      footer: 'Dziękujemy za skorzystanie z Trainly!',
    },
    en: {
      title: 'New Session from Instructor 📅',
      subtitle:
        'An instructor created a booking for you. To confirm or reject the session, go to your dashboard.',
      dateLabel: 'Date',
      timeLabel: 'Time',
      durationLabel: 'Duration',
      priceLabel: 'Price',
      minutes: 'min',
      cancelInfo: 'You can confirm or reject this session in your dashboard.',
      cancelButton: 'Go to Dashboard',
      footer: 'Thank you for using Trainly!',
    },
  },

  manualBookingCreatedGuest: {
    pl: {
      title: 'Nowa sesja od instruktora 📅',
      subtitle: 'Instruktor utworzył dla Ciebie rezerwację.',
      dateLabel: 'Data',
      timeLabel: 'Godzina',
      durationLabel: 'Czas trwania',
      priceLabel: 'Cena',
      minutes: 'min',
      cancelInfo:
        'Jeśli nie możesz wziąć udziału, anuluj sesję klikając przycisk poniżej.',
      cancelButton: 'Anuluj sesję',
      footer: 'Dziękujemy za skorzystanie z Trainly!',
    },
    en: {
      title: 'New Session from Instructor 📅',
      subtitle: 'An instructor created a booking for you.',
      dateLabel: 'Date',
      timeLabel: 'Time',
      durationLabel: 'Duration',
      priceLabel: 'Price',
      minutes: 'min',
      cancelInfo:
        'If you cannot attend, cancel the session by clicking the button below.',
      cancelButton: 'Cancel Session',
      footer: 'Thank you for using Trainly!',
    },
  },

  clientAcceptedManualBooking: {
    pl: {
      title: 'Klient potwierdził sesję! ✅',
      subtitle: 'Klient zaakceptował utworzoną przez Ciebie rezerwację.',
      dateLabel: 'Data',
      timeLabel: 'Godzina',
      durationLabel: 'Czas trwania',
      priceLabel: 'Cena',
      minutes: 'min',
      footer: 'Sprawdź swój kalendarz na Trainly.',
      clientLabel: 'Klient',
    },
    en: {
      title: 'Client Confirmed the Session! ✅',
      subtitle: 'The client has accepted the booking you created.',
      dateLabel: 'Date',
      timeLabel: 'Time',
      durationLabel: 'Duration',
      priceLabel: 'Price',
      minutes: 'min',
      footer: 'Check your calendar on Trainly.',
      clientLabel: 'Client',
    },
  },

  instructorNotification: {
    pl: {
      title: 'Nowa rezerwacja! 📅',
      subtitle: 'Otrzymałeś nową rezerwację.',
      dateLabel: 'Data',
      timeLabel: 'Godzina',
      durationLabel: 'Czas trwania',
      priceLabel: 'Cena',
      minutes: 'min',
      footer: 'Sprawdź swój kalendarz na Trainly.',
      clientLabel: 'Klient',
      clientEmailLabel: 'Email klienta',
    },
    en: {
      title: 'New Booking! 📅',
      subtitle: 'You received a new booking.',
      dateLabel: 'Date',
      timeLabel: 'Time',
      durationLabel: 'Duration',
      priceLabel: 'Price',
      minutes: 'min',
      footer: 'Check your calendar on Trainly.',
      clientLabel: 'Client',
      clientEmailLabel: 'Client email',
    },
  },
};
