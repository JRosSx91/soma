# SUP-02D — Acceso rápido a Apoyo desde Inicio

| Campo | Valor |
|---|---|
| Alcance | Tarjeta en dashboard Inicio → hub Apoyo |
| DEMO | `/preview/support` |
| LIVE | `/app/support` |
| Persistencia / analítica | Ninguna |
| SUP-02B / SUP-02C | Siguen `unpublished` (sin anuncio ni habilitación; gates intactos) |
| Estado desarrollo | **Cerrado** |
| Publicación de la tarjeta | Apto para futura publicación (hub Apoyo ya disponible; no habilita 02B/02C) |

## Ubicación

Tras la fila de sustancias (`SubstanceRow`) y antes de la banda de medallas / exploración.

**Justificación:** visible sin desplazar el lead de recuperación ni las tarjetas de sustancias; no compite con Band A (próximo hito / exploración / logros). También se muestra en estados vacíos / error / sin sustancias, independiente de XP, logros o Bitácora.

## Diseño

- Icono `HeartHandshake` (mismo que «Más» → Apoyo).
- Tonos cian / turquesa; sin rosa de alarma.
- Mobile-first: CTA a ancho completo en móvil; fila en `sm+`.
- Copy ES/EN en `recovery.json` (`homeSupportTitle` / `Body` / `Cta`).

## Capturas

`docs/review/support/sup-02d-screens/` — Inicio 375 y 1440 con la tarjeta visible (dock no oculto en la captura de revisión móvil).
