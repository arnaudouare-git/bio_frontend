import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-4 right-4 left-4 sm:left-auto z-50 flex flex-col gap-2 sm:max-w-sm">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="bg-white rounded-md shadow-md border-l-4 px-4 py-3 flex items-start gap-2.5"
          [class]="bordureParType(toast.type)"
        >
          @switch (toast.type) {
            @case ('erreur') {
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" class="w-4 h-4 shrink-0 mt-0.5 text-red-500">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
            }
            @case ('succes') {
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" class="w-4 h-4 shrink-0 mt-0.5 text-bordeaux-500">
                <path stroke-linecap="round" stroke-linejoin="round" d="m9 12.75 2.25 2.25 4.5-4.5m5.25 2.25a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            }
            @default {
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" class="w-4 h-4 shrink-0 mt-0.5 text-gray-400">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
              </svg>
            }
          }
          <span class="flex-1 text-sm text-gray-700">{{ toast.message }}</span>
          <button
            type="button"
            (click)="toastService.fermer(toast.id)"
            class="text-gray-300 hover:text-gray-500 leading-none text-base shrink-0"
            aria-label="Fermer"
          >
            &times;
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  toastService = inject(ToastService);

  bordureParType(type: string): string {
    switch (type) {
      case 'erreur':
        return 'border-red-500';
      case 'succes':
        return 'border-bordeaux-500';
      default:
        return 'border-gray-300';
    }
  }
}
