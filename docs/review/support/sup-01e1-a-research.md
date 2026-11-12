# SUP-01E1-A — Investigación y diseño de recursos profesionales externos

Documento de trabajo. **No publicado. No es implementación.**
Fecha de comprobación de fuentes: **2026-11-12**.
Hito siguiente (no autorizado aquí): SUP-01E1-B.

Contexto de producto: SUP-01D (estrategias educativas) completado mediante **PR #117**, fusionado en `origin/main` (`e21be40`) y desplegado según el propietario. Esta fase no modifica código.

---

## 1. Objetivo y principios

Ofrecer en el Centro de Apoyo orientación fiable hacia **recursos externos verificables**, sin convertir Soma en un directorio sanitario internacional ni en un servicio de crisis.

Principios: fuentes oficiales; datos verificables; cobertura geográfica explícita; sin geolocalización automática; sin promesas clínicas; diferenciación clara emergencias vs ayuda no urgente; privacidad (sin telemetría de uso); ES/EN; DEMO/LIVE.

---

## 2. Estado del Centro de Apoyo (inspección)

| Elemento | Estado actual |
|---|---|
| Respiración guiada | Publicada (SUP-01C) |
| Estrategias ES/EN | Tres fichas vía `?strategy=` (SUP-01D-B2 / PR #117) |
| Recursos de aprendizaje | Enlaces a Explorar publicados |
| Panel «Si necesitas ayuda ahora» | Texto educativo + enlace a `/terms#terms-emergency`; **sin teléfonos** |
| Plan personal | «En desarrollo» (SUP-01E2) |
| Relapse | «Prevista» |

Arquitectura del panel de ayuda: bloque visual en `SupportSections.tsx` (`support:help.*` ES/EN) + `SUPPORT_TERMS_EMERGENCY_HREF`. Los avisos legales (`legal.json` → `emergencyTitle` / `emergencyBody`) recuerdan que Soma no es canal de crisis.

Patrón técnico a reutilizar: catálogo tipado + allow-list (como `support-strategies.ts`), sin CMS ni backend.

### Git (al iniciar E1-A)

- Rama local: `develop` @ `c06595e` (= `origin/develop`).
- `origin/main` @ `e21be40` (merge PR #117); contiene el ancestro `c06595e`.
- `develop` **no** incluye el commit de merge `e21be40` (adelanto de `main` solo en el merge commit).
- Untracked ajenos: `docs/design/*.png` y otros `docs/review/` históricos.

**Procedimiento recomendado (no ejecutado):** tras autorizar, actualizar `develop` con `git merge origin/main` (o el flujo habitual del repo) para alinear el tip; **sin** rebase forzado ni sync automática en esta fase.

---

## 3. Cobertura geográfica recomendada (MVP)

| Ámbito | Inclusión MVP | Motivo |
|---|---|---|
| **España (nacional)** | Sí | Recursos estatales verificables; alineado con el aviso genérico actual |
| **Directorios internacionales (solo enlace)** | Sí, 1 recurso | Para usuarios fuera de España / sin recurso local listado; **no** es emergencia |
| CCAA / municipios concretos | No en MVP | Alta caducidad y mantenimiento |
| UK / US / UE completa | No en MVP | Sin justificación de fiabilidad mantenible en el primer corte |

Selección de territorio: **explícita por el usuario** (p. ej. «España» / «Otro país o no estoy seguro»). Nunca por IP, idioma ni locale.

---

## 4. Clasificación funcional

| Código | Categoría | Uso en UI |
|---|---|---|
| **A** | Emergencias y peligro inmediato | Bloque visual prioritario, separado |
| **B** | Adicciones / sustancias | Sección propia |
| **C** | Salud mental / crisis emocional (no emergencia médica) | Sección propia; **no** mezclar con A |
| **D** | Directorios e información para localizar servicios | Incluye IASP Find A Helpline |

**MVP:** mantener A/B/C/D como etiquetas, pero en UI bastan **dos zonas visuales**: (1) peligro inmediato, (2) ayuda e información. Dentro de (2), subagrupar B/C/D.

No presentar el 024 ni Find A Helpline como sustituto del 112.

---

## 5. Inventario de candidatos

Estados: `verified` | `partially_verified` | `unverified` | `rejected`.
Describen comprobación de datos, **no** acreditación clínica por Soma.

### 5.1 Candidatos al primer lanzamiento

#### `ext.es.112`

| Campo | Valor |
|---|---|
| Nombre | 112 — Número único de emergencias |
| Organismo | Servicios de emergencia (CC.AA. / Protección Civil); número único estatal |
| Categoría | A |
| Cobertura | España (territorio nacional; gestión autonómica de la recepción) |
| Descripción educativa | Para peligro inmediato para la vida o la integridad. Soma no atiende emergencias. |
| URL oficial (publicada en producto) | https://administracion.gob.es/tu-espacio-europeo/derechos-obligaciones/ciudadanos/asistencia-sanitaria/numeros-urgencia (Punto de Acceso General AGE — números de urgencia) |
| Teléfono | **112** (confirmado en fuentes oficiales: AGE números de urgencia; página Sanidad 024; Protección Civil / DGT como apoyo) |
| Horario | No afirmado aquí como «24 h» en ficha propia; el 112 es servicio de emergencia (uso según necesidad urgente) |
| Idiomas | No confirmado de forma uniforme en esta fase |
| Modalidad | Teléfono |
| Emergencia | **Sí** |
| Gratuidad | Confirmada en material oficial del 112 (llamada gratuita) |
| Verificado | **2026-11-12** (enlace AGE reconfirmado el mismo día; HTTP 200 y mención del 112) |
| Fuente primaria | https://administracion.gob.es/tu-espacio-europeo/derechos-obligaciones/ciudadanos/asistencia-sanitaria/numeros-urgencia ; https://www.sanidad.gob.es/linea024/ (cita el 112); https://www.proteccioncivil.es/catalogo/info112/ (contexto institucional) |
| Estado | **verified** (número y función). Enlace público = AGE. `www.112.es` **excluido** del producto (inestable en comprobación; no se ofrece como alternativa). |
| Limitaciones | No listar 091/062/092 en MVP (añaden ruido; el 112 ya deriva). No conservar `112.es` como enlace público. |

#### `ext.es.024`

| Campo | Valor |
|---|---|
| Nombre | Línea 024 — Atención a la conducta suicida |
| Organismo | Ministerio de Sanidad (España) |
| Categoría | C |
| Cobertura | España (nacional) |
| Descripción educativa | Contención emocional ante pensamientos o riesgo de conducta suicida, y apoyo a allegados. **No** sustituye atención sanitaria presencial. Ante emergencia vital inminente: 112. |
| URL oficial | https://www.sanidad.gob.es/linea024/ |
| Teléfono | **024** |
| Horario | 24 h / 365 días (**afirmado en la página oficial del Ministerio**) |
| Idiomas | Página en español; materiales de campaña en cooficiales; servicios de interpretación / LSE mencionados en la fuente oficial |
| Modalidad | Teléfono; chat on-line y videointerpretación LSE referidos en la misma página |
| Emergencia | **No** (derivación al 112 si procede) |
| Gratuidad | Confirmada en fuente oficial |
| Verificado | **2026-11-12** |
| Fuente primaria | https://www.sanidad.gob.es/linea024/ |
| Estado | **verified** |
| Limitaciones | No presentarlo como línea de adicciones ni como urgencias médicas. |

#### `ext.es.pnsd.ayuda-cerca`

| Campo | Valor |
|---|---|
| Nombre | Plan Nacional sobre Drogas — Ayuda. Cerca de ti |
| Organismo | Dirección General del Plan Nacional sobre Drogas / Ministerio de Sanidad |
| Categoría | B + D |
| Cobertura | España (directorio hacia recursos autonómicos / centros) |
| Descripción educativa | Orientación ciudadana para localizar centros y recursos de atención a adicciones. No es un tratamiento gestionado por Soma. |
| URL oficial | https://pnsd.sanidad.gob.es/ciudadanos/ayudaCerca/ (entrada ciudadana); portal https://pnsd.sanidad.gob.es/ |
| Teléfono | **No publicar en MVP** desde esta ficha (el directorio es web; teléfonos de planes autonómicos varían) |
| Horario | No aplicable al directorio web |
| Idiomas | Portal en español (otras lenguas en el sitio PNSD) |
| Modalidad | Web / directorio |
| Emergencia | No |
| Verificado | **2026-11-12** |
| Fuente primaria | https://pnsd.sanidad.gob.es/ciudadanos/ayudaCerca/ ; https://pnsd.sanidad.gob.es/ |
| Estado | **verified** (existencia y propósito del directorio) |
| Limitaciones | La página «Ayuda. Cerca de ti» tiene contenido dinámico/escaso en el fetch; revalidar enlaces internos antes de B2. |

#### `ext.es.fad.siof`

| Campo | Valor |
|---|---|
| Nombre | Servicio de Información y Orientación (FAD Juventud), financiado por DGPNSD |
| Organismo | Fad Juventud; financiación DGPNSD (según noticia PNSD 01/08/2024) |
| Categoría | B |
| Cobertura | España (servicio de información/orientación; no centro clínico) |
| Descripción educativa | Información y orientación sobre drogas/adicciones. No sustituye atención sanitaria. |
| URL oficial | Anuncio en https://pnsd.sanidad.gob.es/noticiasEventos/actualidad/2024_Actualidadnoticias/home.htm (entrada 01/08/2024). Portal Fad: verificar URL canónica en B1/B2 si se publica. |
| Teléfono | **900 161 515** (citado en la noticia PNSD 2024) |
| WhatsApp | **681 155 160** (misma noticia; **partial** hasta revalidar en página propia del servicio) |
| Horario | Citado en PDF CEAPA 2021 (lun–vie 9–21); **no reconfirmado** en la noticia 2024 → **no mostrar horario en producto** hasta fuente actual |
| Idiomas | No confirmados en esta fase |
| Modalidad | Teléfono; WhatsApp (parcial) |
| Emergencia | No |
| Gratuidad | Teléfono descrito como gratuito en la noticia PNSD |
| Verificado | **2026-11-12** |
| Fuente primaria | Noticia PNSD 01/08/2024; PDF CEAPA 2021 solo como contexto histórico de horario |
| Estado | **partially_verified** (teléfono sí; horario y página canónica del servicio pendientes) |
| Limitaciones | Candidato a MVP **solo si** se acepta publicar teléfono sin horario, o tras revalidar página propia. Alternativa segura: omitir del lanzamiento y dejar solo el directorio PNSD. |

#### `ext.int.iasp.find-a-helpline`

| Campo | Valor |
|---|---|
| Nombre | Find A Helpline (directorio asociado a IASP) |
| Organismo | IASP (asociación internacional); directorio operado con ThroughLine / Find A Helpline |
| Categoría | D (y acceso a líneas de crisis según país) |
| Cobertura | Internacional (directorio multipaís); **no** es un número único mundial |
| Descripción educativa | Directorio para localizar líneas de ayuda por país. IASP **no** presta atención directa. No sustituye emergencias locales. |
| URL oficial | https://www.iasp.info/crisis-centres-helplines/ → Find A Helpline; https://findahelpline.com/i/iasp |
| Teléfono | Ninguno propio de Soma/IASP |
| Horario | N/A (depende de cada línea listada) |
| Idiomas | Interfaz del directorio en inglés (y otras según el sitio); no inventar cobertura lingüística |
| Modalidad | Web |
| Emergencia | **No** (herramienta de búsqueda) |
| Verificado | **2026-11-12** |
| Fuente primaria | https://www.iasp.info/crisis-centres-helplines/ |
| Estado | **verified** (existencia del directorio y delimitación IASP) |
| Limitaciones | Tercero ajeno a Soma; URLs pueden cambiar; no copiar listados de teléfonos del directorio a Soma. |

### 5.2 Requieren verificación adicional (no publicar aún)

| ID | Motivo |
|---|---|
| `ext.es.sns.atencion-primaria` | Orientación genérica SNS / cita; falta página canónica única y estable seleccionada |
| Planes autonómicos de drogas (teléfonos CCAA) | Alta heterogeneidad y caducidad; mejor vía: directorio PNSD |
| Chat 024 / LSE | Confirmados por mención en sanidad.gob.es; falta URL estable del chat para enlazar sin ambigüedad |
| WhatsApp SIOF | Solo en noticia 2024; revalidar |

### 5.3 Descartados / rechazados para el catálogo Soma

| Recurso | Estado | Motivo |
|---|---|---|
| Directorios genéricos tipo mentalhealthhotlines.com | rejected | No es organismo oficial; riesgo de datos desactualizados |
| Plataforma WHO EMRO MHPSS | rejected (MVP) | Ámbito regional distinto; no encaja como cobertura ES/global del producto |
| Teléfonos 091 / 062 / 092 en MVP | rejected (MVP) | Redundantes respecto al 112; ruido UX |
| ONGs locales no vinculadas a fuente estatal | rejected (hasta verificación) | Legitimidad y cobertura difíciles de mantener |

---

## 6. Fuentes oficiales consultadas (sesión)

| Fuente | URL | Uso |
|---|---|---|
| Ministerio de Sanidad — Línea 024 | https://www.sanidad.gob.es/linea024/ | 024, remisión a 112, horario/gratuidad |
| PNSD — portal / Ayuda cerca | https://pnsd.sanidad.gob.es/ ; …/ciudadanos/ayudaCerca/ | Directorio adicciones |
| PNSD — actualidad 2024 | …/noticiasEventos/actualidad/2024_Actualidadnoticias/home.htm | Teléfono Fad/SIOF |
| AGE — números de urgencia | https://administracion.gob.es/tu-espacio-europeo/derechos-obligaciones/ciudadanos/asistencia-sanitaria/numeros-urgencia | Enlace público del 112 en producto (SUP-01E1-B) |
| Protección Civil — servicios 112 | https://www.proteccioncivil.es/catalogo/info112/ | Contexto institucional 112 |
| DGT — emergencias | https://www.dgt.es/…/en-caso-de-emergencia/ | Confirmación 112 |
| IASP — Crisis centres | https://www.iasp.info/crisis-centres-helplines/ | Find A Helpline |
| Legal Soma | `legal.json` emergency* | Coherencia de mensajes |

Excluido del producto: `https://www.112.es/` (HTTP 500 / SSL inestable en comprobación 2026-11-12; no se ofrece como alternativa pública).

---

## 7. Vigencia y mantenimiento (procedimiento editorial)

Sin cron, scrapers ni SLA inventado.

1. **Revisión periódica:** cada **6 meses** reabrir las URLs de recursos `verified` / publicados; anotar `lastVerifiedAt` (ISO date) en el registro editorial y en metadatos del catálogo.
2. **Revisión extraordinaria:** cambio anunciado por Sanidad/PNSD/IASP, informe de usuario, o enlace roto detectado en QA.
3. **Fecha de verificación:** visible de forma discreta en UI («Comprobado: AAAA-MM») **o** solo interna; decisión del propietario (recomendada: interna en MVP + nota «verifica en la fuente oficial»).
4. **Retirada:** si la URL falla o el organismo descontinua el servicio → quitar de allow-list de publicación; conservar registro con estado `rejected` o `unverified`.
5. **Dato no comprobable:** no mostrar; marcar `partially_verified` en docs.
6. **Fallback UX:** si no hay recursos para el territorio elegido → mensaje seguro + enlace a términos de emergencia + (si procede) Find A Helpline, sin inventar teléfonos.

---

## 8. Propuesta de experiencia (sin implementar)

### 8.1 Colocación

Extender el panel **«Si necesitas ayuda ahora»** (no duplicarlo):

1. Conservar textos educativos actuales y el enlace a `/terms#terms-emergency`.
2. Añadir selector explícito: **España** | **Otro país / no estoy seguro**.
3. Si **España**:
   - Zona A: 112 (peligro inmediato).
   - Zona C: 024 (conducta suicida; con matiz «no sustituye urgencias»).
   - Zona B/D: enlace PNSD «Ayuda. Cerca de ti»; opcional SIOF si se aprueba.
4. Si **otro**:
   - Remisión a emergencias locales (sin número inventado).
   - Enlace a Find A Helpline + aviso de que Soma no gestiona esas líneas.

### 8.2 Accesibilidad y presentación

- Jerarquía clara; botones/enlaces ≥ 44 px; `tel:` solo para números **verified**.
- Enlaces externos: `target="_blank"` + `rel="noopener noreferrer"` + indicación «se abre fuera de Soma».
- No cards clicables vacías.
- DEMO/LIVE idénticos (catálogo estático).
- ES/EN en chrome; nombres oficiales pueden permanecer en la lengua de la fuente con descripción traducida.

### 8.3 Qué no hacer

Mapa de centros; chat de crisis propio; formularios de evaluación; geolocalización; persistencia del país; analytics de clics en crisis.

---

## 9. Arquitectura técnica mínima (propuesta para E1-B)

Seguir el patrón SUP-01D:

| Pieza | Rol |
|---|---|
| `support-external-resources.ts` | IDs, categorías, cobertura, allow-list de publicación, `lastVerifiedAt` |
| `support-external-content.ts` (o i18n `support` keys cortas) | Textos ES/EN; **teléfonos solo desde metadatos verified** |
| Componente en `SupportSections` / subcomponente | Presentación |
| Tests | Allow-list, ausencia de IDs no publicados, ES/EN, DEMO/LIVE, sin `tel:` inventados |

Sin CMS, DB, backend, deps nuevas. Markdown en `docs/review/support/` = registro editorial.

Riesgos de enlaces: phishing spoofing → solo URLs `https` de dominios oficiales allow-listados; revisar en cada ciclo de verificación.

---

## 10. Privacidad y seguridad

La solución propuesta puede operar **sin**: geolocalización; storage de país; registro de uso; datos de salud; envío a terceros desde Soma; contacto automático; analítica sensible.

`tel:` y navegación externa ocurren en el dispositivo del usuario; Soma no intermedia la llamada.

**Legal:** probablemente no exige cambio inmediato de textos si el mensaje sigue siendo «Soma no presta asistencia»; conviene **revisión jurídica ligera** antes de publicar teléfonos (no modificar legales en E1-A). Mostrar un enlace no implica que Soma gestione la asistencia de la entidad.

---

## 11. MVP recomendado

### Publicar (tras aprobación + E1-B)

1. `ext.es.112`
2. `ext.es.024`
3. `ext.es.pnsd.ayuda-cerca` (web)
4. `ext.int.iasp.find-a-helpline` (web, para «otro país»)

### Decisión pendiente para MVP

5. `ext.es.fad.siof` — teléfono 900 161 515 **sin horario** en UI, o aplazamiento.

### Fuera del primer lanzamiento

CCAA, SNS cita, chats 024 sin URL estable, UK/US, ONGs no oficiales.

---

## 12. Criterios de aceptación SUP-01E1-B (verificables)

- Solo IDs en allow-list de publicación.
- Ningún teléfono/horario inventado; horarios solo si `verified`.
- Cobertura geográfica explícita; selector de territorio sin geo-IP.
- Emergencias (A) visualmente separadas de C/D.
- ES/EN; DEMO = LIVE.
- URLs `https` oficiales; externos identificables.
- Accesibilidad (teclado, foco, contraste, semántica).
- Responsive 320–1440.
- Tests de catálogo, bloqueo de IDs no autorizados, ausencia de persistencia/telemetría/backend.
- Recursos `partially_verified` no muestran datos críticos no confirmados.
- Panel de ayuda existente no se duplica de forma contradictoria.
- ROADMAP actualizado solo tras autorización.

---

## 13. Propuesta de actualización ROADMAP (no aplicada)

- **SUP-01D**: completado (PR #117, merge `e21be40`, desplegado según propietario).
- **SUP-01E1-A**: investigación entregada; **en revisión**.
- **SUP-01E1-B**: pendiente de autorización.
- **SUP-01E2** / prevención de recaídas: pendientes.
- No reabrir SUP-01C / ASSET / D.

Alineación Git recomendada: fusionar `origin/main` en `develop` cuando el propietario lo autorice.

---

## 14. Decisiones que requieren aprobación del propietario

1. ¿MVP limitado a España + directorio IASP, sin CCAA?
2. ¿Incluir teléfono SIOF/FAD (900 161 515) sin horario en la UI?
3. ¿Fecha de verificación visible al usuario o solo interna?
4. ¿Extender el panel de ayuda actual o sección nueva bajo el mismo título?
5. ¿Revisión jurídica antes de publicar `tel:`?
6. ¿Autorizar SUP-01E1-B tras esta investigación?
7. ¿Actualizar ROADMAP ahora o en el arranque de E1-B?

---

## 15. Restricciones de esta fase

Sin código ejecutable, i18n de producto, UI, deps, persistencia, endpoints, textos legales, commits, push, PR, merge ni despliegue. SUP-01E1-B no iniciado.
