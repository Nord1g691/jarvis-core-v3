V24.3 conversation behavior

After JARVIS finishes speaking, conversation mode starts a fresh listening window.
Default listening window: 10 seconds.
If no speech is detected during that window, recognition stops and JARVIS returns to OPERATIONNEL.
If speech is detected, it is processed and the next listening window starts after the response.
The timeout must be configurable in the frontend implementation.
