import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { GoogleGenAI } from '@google/genai';
import confetti from 'canvas-confetti';
import { animate, stagger } from 'motion';

declare const GEMINI_API_KEY: string;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  hasStarted = signal(false);
  toastMessage = signal<string | null>(null);
  isLoadingToast = signal(false);
  resolutions = signal<string[]>([]);

  startSurprise() {
    this.hasStarted.set(true);
    this.triggerConfetti();
    
    // Animate elements in
    setTimeout(() => {
      const elements = document.querySelectorAll('.stagger-item');
      if (elements.length > 0) {
        animate(
          elements,
          { opacity: [0, 1], y: [20, 0] },
          { delay: stagger(0.15), duration: 0.6, ease: "easeOut" }
        );
      }
    }, 100);
  }

  triggerConfetti() {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  }

  async generateToast() {
    this.isLoadingToast.set(true);
    try {
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-preview',
        contents: "Écris un petit discours d'anniversaire très drôle, purement amical, et légèrement sarcastique pour mon amie Floriane. Pas de romantisme, juste de l'amitié pure. Fais court (3-4 phrases maximum).",
      });
      this.toastMessage.set(response.text || "Oups, le générateur de blagues est en panne.");
    } catch (e) {
      this.toastMessage.set("Erreur technique : Floriane est trop cool pour l'IA.");
    } finally {
      this.isLoadingToast.set(false);
    }
  }

  addResolution(text: string) {
    if (text.trim()) {
      this.resolutions.update(r => [text.trim(), ...r]);
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 }, colors: ['#c026d3', '#facc15', '#ec4899'] });
    }
  }
}