const NAVBAR_HEIGHT = 80; // h-20

/**
 * Smoothly scrolls to an element by ID, offsetting by the navbar height
 * so the section is not hidden behind the sticky navbar.
 */
export function scrollToSection(id: string): void {
  const element = document.getElementById(id);
  if (!element) return;

  const elementPosition = element.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top: elementPosition - NAVBAR_HEIGHT, behavior: "smooth" });
}
