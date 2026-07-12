export const cookiesContent = `

**Ostatnia aktualizacja:** 11 lipca 2026
**Obowiązuje od:** 11 lipca 2026

---

## 1. Czym są pliki cookie?

Pliki cookie to małe pliki tekstowe przechowywane na urządzeniu Użytkownika (komputerze, smartfonie, tablecie) podczas odwiedzania Platformy. Pliki cookie są powszechnie stosowane w celu zapewnienia prawidłowego działania stron internetowych, a także w celach analitycznych i marketingowych.

## 2. Jakie pliki cookie stosujemy?

### 2.1. Ze względu na niezbędność

| Rodzaj           | Opis                                                                                              | Przykłady                                       | Okres przechowywania |
| ---------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------- | -------------------- |
| **Niezbędne**    | Wymagane do prawidłowego działania Platformy. Bez nich niektóre funkcjonalności nie będą działać. | Sesja logowania, token CSRF, preferencje cookie | Sesja / do 1 roku    |
| **Funkcjonalne** | Umożliwiają zapamiętanie preferencji Użytkownika.                                                 | Wybrany język, ustawienia wyświetlania          | Do 1 roku            |
| **Analityczne**  | Pozwalają na analizę sposobu korzystania z Platformy w celu jej ulepszania.                       | Google Analytics (\_ga, \_gid, \_gat)           | Do 2 lat             |
| **Marketingowe** | Służą do wyświetlania spersonalizowanych reklam.                                                  | Facebook Pixel (_fbp), Google Ads (\_gcl_\*)    | Do 3 miesięcy        |

### 2.2. Ze względu na pochodzenie

| Rodzaj                        | Opis                                                          |
| ----------------------------- | ------------------------------------------------------------- |
| **Cookie własne**             | Ustawiane przez Platformę Exercio                             |
| **Cookie podmiotów trzecich** | Ustawiane przez zewnętrznych dostawców (Google, Meta, Stripe) |

## 3. Lista stosowanych plików cookie

| Nazwa cookie              | Dostawca         | Cel                                 | Okres ważności |
| ------------------------- | ---------------- | ----------------------------------- | -------------- |
| \`next-auth.session-token\` | Exercio          | Utrzymanie sesji logowania          | Sesja          |
| \`cookie-consent\`          | Exercio          | Przechowywanie preferencji cookie   | 1 rok          |
| \`language\`                | Exercio          | Zapamiętanie wybranego języka       | 1 rok          |
| \`_ga\`                     | Google Analytics | Anonimowa identyfikacja użytkownika | 2 lata         |
| \`_gid\`                    | Google Analytics | Identyfikacja sesji                 | 24 godziny     |
| \`_gat\`                    | Google Analytics | Ograniczenie częstotliwości żądań   | 1 minuta       |
| \`_fbp\`                    | Meta (Facebook)  | Targetowanie reklam                 | 3 miesiące     |
| \`_gcl_*\`                  | Google Ads       | Pomiar konwersji reklam             | 90 dni         |

## 4. Zarządzanie zgodą

4.1. Przy pierwszej wizycie na Platformie wyświetlany jest baner cookie, który umożliwia:

- Zaakceptowanie wszystkich plików cookie
- Zaakceptowanie tylko niezbędnych plików cookie
- Dostosowanie preferencji dla poszczególnych kategorii

  4.2. Zgodę można w każdej chwili wycofać lub zmienić za pomocą ustawień cookie dostępnych na Platformie.

  4.3. Niezbędne pliki cookie są zawsze aktywne — nie można ich wyłączyć, ponieważ są wymagane do działania Platformy.

## 5. Zarządzanie cookie w przeglądarce

Użytkownik może również zarządzać plikami cookie za pomocą ustawień swojej przeglądarki:

| Przeglądarka    | Link do instrukcji                                 |
| --------------- | -------------------------------------------------- |
| Google Chrome   | https://support.google.com/chrome/answer/95647     |
| Mozilla Firefox | https://support.mozilla.org/pl/kb/ciasteczka       |
| Safari          | https://support.apple.com/pl-pl/HT201265           |
| Microsoft Edge  | https://support.microsoft.com/pl-pl/microsoft-edge |

## 6. Konsekwencje wyłączenia cookie

Wyłączenie niezbędnych plików cookie może uniemożliwić korzystanie z Platformy. Wyłączenie plików cookie analitycznych i marketingowych nie wpływa na działanie Platformy, ale może ograniczyć personalizację treści.

## 7. Podmioty trzecie

Niektórzy dostawcy plików cookie (Google, Meta) mogą przetwarzać dane Użytkownika jako niezależni administratorzy. Zalecamy zapoznanie się z ich politykami prywatności:

- **Google:** https://policies.google.com/privacy
- **Meta:** https://www.facebook.com/privacy/policy
- **Stripe:** https://stripe.com/privacy

## 8. Kontakt

W sprawach związanych z plikami cookie:

**Email:** kontakt@exercio.app

---

_Exercio — exercio.app_
`;
