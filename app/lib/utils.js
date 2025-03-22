import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function scrollToSection(sectionId) {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

export const isMobileScreen = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 640; // sm breakpoint in Tailwind
}
