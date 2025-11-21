import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, Router } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { initializeAutoConnectFactory } from './core/initializer/auto-connect.initializer';
import { AuthenticationService } from './core/port/authentication.service';
import { UserService } from './core/port/user.service';
import { UserStore } from './core/store/user.store';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(),
    provideAppInitializer(() => {
      return initializeAutoConnectFactory(
        inject(AuthenticationService),
        inject(UserService),
        inject(UserStore),
        inject(Router)
      )();
    }),
  ],
};
