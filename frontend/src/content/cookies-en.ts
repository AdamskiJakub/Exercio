export const cookiesContentEn = `

**Last updated:** July 11, 2026
**Effective from:** July 11, 2026

---

## 1. What Are Cookies?

Cookies are small text files stored on a User's device (computer, smartphone, tablet) when visiting the Platform. Cookies are commonly used to ensure the proper functioning of websites, as well as for analytical and marketing purposes.

## 2. What Cookies Do We Use?

### 2.1. By Necessity

| Type             | Description                                                                                         | Examples                                         | Retention Period |
| ---------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ---------------- |
| **Essential**    | Required for the proper functioning of the Platform. Without them, some features will not work.     | Login session, CSRF token, cookie preferences    | Session / up to 1 year |
| **Functional**   | Allow remembering User preferences.                                                                 | Selected language, display settings              | Up to 1 year     |
| **Analytical**   | Allow analysis of how the Platform is used in order to improve it.                                  | Google Analytics (_ga, _gid, _gat)               | Up to 2 years    |
| **Marketing**    | Used to display personalized advertisements.                                                        | Facebook Pixel (_fbp), Google Ads (_gcl_*)       | Up to 3 months   |

### 2.2. By Origin

| Type                        | Description                                                   |
| --------------------------- | ------------------------------------------------------------- |
| **First-party cookies**     | Set by the Exercio Platform                                   |
| **Third-party cookies**     | Set by external providers (Google, Meta, Stripe)              |

## 3. List of Cookies Used

| Cookie Name              | Provider        | Purpose                              | Expiry        |
| ------------------------ | --------------- | ------------------------------------ | ------------- |
| \`next-auth.session-token\` | Exercio       | Maintaining login session            | Session       |
| \`cookie-consent\`          | Exercio       | Storing cookie preferences           | 1 year        |
| \`language\`                | Exercio       | Remembering selected language        | 1 year        |
| \`_ga\`                     | Google Analytics | Anonymous user identification     | 2 years       |
| \`_gid\`                    | Google Analytics | Session identification            | 24 hours      |
| \`_gat\`                    | Google Analytics | Rate limiting                     | 1 minute      |
| \`_fbp\`                    | Meta (Facebook)  | Ad targeting                      | 3 months      |
| \`_gcl_*\`                  | Google Ads       | Ad conversion measurement         | 90 days       |

## 4. Consent Management

4.1. On your first visit to the Platform, a cookie banner is displayed that allows you to:

- Accept all cookies
- Accept only essential cookies
- Customize preferences for individual categories

4.2. Consent can be withdrawn or changed at any time via the cookie settings available on the Platform.

4.3. Essential cookies are always active — they cannot be disabled as they are required for the Platform to function.

## 5. Managing Cookies in Your Browser

Users can also manage cookies through their browser settings:

| Browser         | Link to instructions                                |
| --------------- | --------------------------------------------------- |
| Google Chrome   | https://support.google.com/chrome/answer/95647      |
| Mozilla Firefox | https://support.mozilla.org/en-US/kb/cookies        |
| Safari          | https://support.apple.com/guide/safari/manage-cookies |
| Microsoft Edge  | https://support.microsoft.com/en-us/microsoft-edge  |

## 6. Consequences of Disabling Cookies

Disabling essential cookies may prevent you from using the Platform. Disabling analytical and marketing cookies does not affect the Platform's operation but may limit content personalization.

## 7. Third Parties

Some cookie providers (Google, Meta) may process User data as independent controllers. We recommend reviewing their privacy policies:

- **Google:** https://policies.google.com/privacy
- **Meta:** https://www.facebook.com/privacy/policy
- **Stripe:** https://stripe.com/privacy

## 8. Contact

For matters related to cookies:

**Email:** kontakt@exercio.app

---

_Exercio — exercio.app_
`;
