# GAM-03B — Ontología científica de SOMA

Estado: diseño interno candidato. Este directorio no está integrado en la aplicación y no publica contenido.

## Propósito

Este paquete convierte GAM-03B-STRUCT-02B y la corrección focalizada GAM-03B-STRUCT-03A en documentación versionable. Define una ontología multiaxial aplicable a todo el organismo y un primer recorrido neuronal de 100 conceptos. No define interfaz, persistencia, XP, progreso ni desbloqueos.

Archivos:

- `concepts.json`: vocabularios globales y catálogo canónico de conceptos.
- `relations.json`: catálogo independiente de relaciones científicas.
- `learning-paths.json`: recorrido pedagógico, prerrequisitos y metadatos no semánticos de presentación.

## Separación de capas

1. **Familias científicas:** perspectivas disciplinares; un concepto puede pertenecer a varias.
2. **Tipos ontológicos:** naturaleza de la entidad, cualidad, rol o proceso.
3. **Escalas materiales:** escala primaria de descripción; no indican orden de aprendizaje.
4. **Estratos pedagógicos:** once capas generales aplicables a cualquier sistema corporal.
5. **Relaciones ontológicas:** afirmaciones científicas entre identidades.
6. **Recorridos de aprendizaje:** selecciones y órdenes recomendados; no son causalidad.
7. **Presentación:** grupos, coordenadas, color y expansión visual; no tienen valor científico.

El recorrido neuronal no reemplaza la taxonomía global. Es solo una selección de conceptos de la ontología.

## Identidad y estabilidad

- Formato canónico provisional: `soma:K######`.
- Un ID no depende del nombre, idioma, familia, estrato, posición visual o binding.
- Un ID retirado no se reutiliza.
- Los cambios semánticos incompatibles crean un ID nuevo y usan `replacedBy` o `consider`.
- Los identificadores externos son referencias separadas. No se inventan ni se infieren por similitud de etiqueta.
- Un binding con contenido publicado de SOMA no valida científicamente el concepto.

## Familias científicas globales

| ID | ES | EN | Alcance |
| --- | --- | --- | --- |
| `physics` | Física | Physics | Magnitudes, fuerzas, energía, transporte y termodinámica. |
| `chemistry` | Química | Chemistry | Entidades, propiedades, enlaces y transformaciones químicas. |
| `biochemistry` | Bioquímica | Biochemistry | Biomoléculas y reacciones en sistemas vivos. |
| `cell_biology` | Biología celular | Cell biology | Componentes, transporte y procesos celulares. |
| `histology` | Histología | Histology | Organización celular y tisular. |
| `anatomy` | Anatomía | Anatomy | Estructuras, regiones, órganos y sistemas. |
| `physiology` | Fisiología | Physiology | Funciones y procesos integrados. |

Las familias son facetas, no siete árboles excluyentes.

## Once estratos pedagógicos globales

| ID | ES | EN |
| --- | --- | --- |
| `S1` | Medición y principios físicos | Measurement and physical principles |
| `S2` | Materia y partículas | Matter and particles |
| `S3` | Átomos, iones y moléculas | Atoms, ions and molecules |
| `S4` | Reacciones, energía y transformaciones | Reactions, energy and transformations |
| `S5` | Biomoléculas y ensamblajes | Biomolecules and assemblies |
| `S6` | Membranas y compartimentos celulares | Membranes and cellular compartments |
| `S7` | Transporte celular y bioelectricidad | Cellular transport and bioelectricity |
| `S8` | Células y tejidos | Cells and tissues |
| `S9` | Comunicación y señalización biológica | Biological communication and signalling |
| `S10` | Órganos, regiones, circuitos y sistemas | Organs, regions, circuits and systems |
| `S11` | Funciones integradas del organismo | Integrated organism functions |

Estos estratos no son específicos de neurociencia. Por ejemplo, S7 puede describir transporte epitelial renal y S10 puede describir cámaras cardiacas o vías respiratorias.

## Tipos ontológicos

| ID | Uso |
| --- | --- |
| `physical_quantity` | Magnitud medible, como carga o energía. |
| `quality_or_state` | Cualidad o estado que inhiere en otra entidad. |
| `chemical_entity` | Átomo, ion, molécula o macromolécula. |
| `cellular_component` | Componente de una célula o unión celular. |
| `cell_type` | Tipo de célula, no agrupación de tejido. |
| `tissue` | Organización tisular. |
| `anatomical_structure` | Parte anatómica, órgano o región. |
| `anatomical_system` | Sistema anatómico material. |
| `functional_system` | División funcional que no debe confundirse con composición anatómica. |
| `process` | Suceso o transformación que ocurre en el tiempo. |
| `biological_role` | Papel contextual desempeñado por una entidad material. |

## Escalas

`scale_independent`, `atomic`, `molecular`, `supramolecular`, `subcellular`, `cellular`, `tissue`, `organ_region`, `system_organism`.

Cada concepto tiene una escala primaria. Si una explicación cruza escalas, eso pertenece al recorrido o a relaciones, no altera la identidad.

## Semántica de relaciones

La dirección es siempre `subject —predicate→ object`.

| Predicado | Dominio → rango | Ciclos | Inferencias permitidas y límites |
| --- | --- | --- | --- |
| `is_a` | Clase → clase compatible | No | Hereda pertenencia al tipo padre. No expresa ubicación ni composición. |
| `part_of` | Entidad material → entidad material, o proceso → proceso | No | Composición necesaria desde la parte. No implica que todo padre contenga cada parte candidata. |
| `located_in` | Entidad material → estructura o compartimento | No | Ubicación, no composición. No se propaga sin una regla explícita. |
| `inheres_in` | Cualidad/estado → entidad material | No | La cualidad depende de su portador; no la convierte en parte material. |
| `occurs_in` | Proceso → entidad material | No por tipado | Localiza un proceso. No convierte la ubicación en participante. |
| `participates_in` | Entidad material → proceso | No por tipado | Participación, no causalidad ni función exclusiva. |
| `capable_of` | Célula/estructura → proceso | No | Capacidad general; no afirma actividad permanente. |
| `has_role` | Entidad material → rol biológico | No | El rol es contextual y no reemplaza la identidad química. |
| `regulates` | Proceso → proceso o cualidad | Permitidos con evidencia | No es transitiva. Requiere dirección y contexto suficientes. |
| `positively_regulates` | Proceso → proceso o cualidad | Permitidos con evidencia | Subrelación de `regulates`; no significa beneficio clínico. |
| `negatively_regulates` | Proceso → proceso o cualidad | Permitidos con evidencia | Subrelación de `regulates`; no significa perjuicio clínico. |
| `transforms_into` | Entidad/estado → entidad/estado compatible | Solo reversibilidad explícita | Transformación, nunca identidad. |
| `causally_upstream_of` | Proceso → proceso | Permitidos con evidencia | Causalidad contextual; no se usa como prerrequisito pedagógico. |
| `related_to` | Cualquier concepto → concepto | Sí | Sin inferencia. Solo cuando no se justifica una relación más precisa. |

Los prerrequisitos se almacenan exclusivamente en `learning-paths.json` y deben formar un DAG.

## Correcciones científicas incorporadas

- Neurona y célula glial son clases hermanas bajo la categoría candidata `neural cell`; una no contiene a la otra.
- Astrocito, oligodendrocito y célula de Schwann son subtipos de célula glial.
- `hippocampus` conserva su identidad y binding exacto del Atlas. `hippocampal formation` es su concepto padre candidato; no son sinónimos ni se fusionan.
- El sistema nervioso autónomo se modela como organización funcional, no como simple parte anatómica del SNP.
- Las divisiones simpática y parasimpática pertenecen al sistema autónomo, pero no se fuerza que toda su organización sea periférica.
- Mesencéfalo es parte del tronco encefálico; cerebelo no lo es.
- Núcleo accumbens es parte del estriado ventral; no se trata como sinónimo de ganglios basales.
- Dopamina, GABA, glutamato, acetilcolina y adenosina son entidades químicas. `neurotransmitter_role` y `neuromodulator_role` son identidades separadas conectadas mediante `has_role`; adenosina se vincula provisionalmente al segundo, pendiente de mapping exacto.
- Potencial de membrana y gradiente son cualidades; potencial de acción, difusión y liberación son procesos.
- Las categorías visuales del Atlas son bindings de producto, nunca padres ontológicos automáticos.

## Estados editoriales y publicación

Secuencia:

`candidate → source_mapped → scientific_review → bilingual_editorial_review → approved → published`

### candidate

- ID, labels ES/EN, tipo, familias, escala y definición provisional presentes.
- Puede contener relaciones y referencias pendientes.
- Solo es accesible en documentación interna.

### source_mapped

- Cada afirmación material dispone de fuente candidata localizable.
- Los xrefs exactos han sido comprobados; no basta la similitud de nombre.
- Las relaciones declaran evidencia o `pending_verification`.

### scientific_review

- Revisión humana proporcional al riesgo por persona con competencia temática.
- Identidad, definición, jerarquía y relaciones revisadas.
- Se resuelven contradicciones; no se confunde presencia en una ontología con validación de todas las afirmaciones.
- Contenido educativo básico no requiere por defecto revisión clínica. Afirmaciones sobre diagnóstico, tratamiento, riesgo individual o conducta clínica sí se derivan a revisión especializada.

### bilingual_editorial_review

- Equivalencia conceptual ES/EN.
- Terminología, legibilidad, accesibilidad cognitiva y ausencia de afirmaciones personalizadas.
- Los dos idiomas expresan la misma cautela y alcance.

### approved

- Sin referencias críticas pendientes.
- Relaciones publicables aprobadas y bindings verificados.
- QA de unicidad, referencias, ciclos, tipos y paridad superado.
- Aprobación explícita registrada.

### published

- Autorización de publicación independiente.
- El runtime solo debe consumir registros `published`.
- Publicar un nodo no publica automáticamente todos sus vecinos ni relaciones candidatas.

El catálogo de este directorio permanece en `candidate`; no existe conexión con el runtime.

## Evidencia y fuentes

Claves de fuente usadas en los JSON:

- `BIPM_SI`: International System of Units, BIPM.
- `IUPAC_GOLD_BOOK`: Compendium of Chemical Terminology.
- `CHEBI`: Chemical Entities of Biological Interest.
- `GO`: Gene Ontology.
- `CL`: Cell Ontology.
- `UBERON`: Uber-anatomy ontology.
- `SOMA_EXPLORE`: `apps/web/src/features/recovery-dashboard/explore/explore-edu.ts` y copy ES/EN.
- `SOMA_ATLAS`: `apps/web/src/features/recovery-dashboard/anatomy/atlas-config.ts`.
- `SOMA_MISSIONS`: `packages/shared-types/src/missions.ts`.

Una clave de fuente identifica la familia de referencia; no implica que exista ya un xref exacto. `verificationStatus` lo declara expresamente.

## Ampliación al organismo completo

La ampliación no cambia IDs, tipos ni predicados básicos:

- **Cardiovascular:** sangre y células sanguíneas; corazón, cámaras, válvulas y vasos; conducción, presión y perfusión.
- **Respiratorio:** gases y difusión; epitelio y alvéolos; vías aéreas y pulmones; ventilación e intercambio gaseoso.
- **Digestivo/hepatobiliar:** nutrientes y enzimas; epitelio; tubo digestivo, hígado, vías biliares y páncreas; digestión y metabolismo.
- **Endocrino:** hormonas como entidades con roles; células endocrinas; glándulas; ejes reguladores. Hipotálamo y páncreas mantienen una sola identidad cada uno.
- **Renal:** solutos, membranas y transporte; nefrona, riñón y vías urinarias; filtración y homeostasis.
- **Inmunitario/linfático:** moléculas, células y tejidos inmunitarios; órganos linfoides; respuesta y regulación.
- **Musculoesquelético:** proteínas contráctiles; fibras y tejidos; músculos, huesos y articulaciones; movimiento y soporte.
- **Reproductor, tegumentario y sensorial:** misma separación entre química, célula, tejido, anatomía, procesos y funciones.

Los recorridos futuros referencian conceptos existentes y añaden solo identidades realmente nuevas. No duplican ATP, membranas, receptores, páncreas o hipotálamo por sistema.

## Validación esperada

Sin añadir herramientas, los JSON pueden validarse con el parser disponible y comprobaciones puntuales:

- exactamente 100 IDs en este lote y unicidad;
- labels y definiciones ES/EN no vacíos;
- vocabularios referenciados existentes;
- sujetos y objetos de relaciones válidos;
- bindings no duplicados;
- ausencia de ciclos en `is_a`, `part_of` y prerrequisitos;
- compatibilidad básica de dominio y rango;
- ausencia de estados `approved` o `published`.

La validación automática no sustituye revisión científica, anatómica, terminológica ni editorial.

## Corrección focalizada GAM-03B-STRUCT-03A

Inventario resultante: 100 conceptos, 84 relaciones ontológicas, 93 prerrequisitos pedagógicos y 23 bindings SOMA. Todos los elementos permanecen en `candidate` y fuera del runtime.

Conceptos añadidos sin reutilizar IDs: `soma:K000091`–`soma:K000100` (célula neural, telencéfalo, diencéfalo, formación hipocampal, estriado, transporte activo primario, exocitosis de vesícula sináptica, transportador de neurotransmisor, mielinización y rol neuromodulador).

Relaciones añadidas sin reutilizar IDs: `soma:R000087`–`soma:R000097`, que conectan las clases celulares hermanas, los padres anatómicos intermedios, los subtipos de proceso y transportador, y la capacidad de mielinización de oligodendrocitos y células de Schwann. Se corrigieron `soma:R000008`, `soma:R000010`, `soma:R000016`, `soma:R000020`–`soma:R000023`, `soma:R000034`, `soma:R000042`–`soma:R000046`, `soma:R000048`, `soma:R000057`, `soma:R000062`, `soma:R000067`, `soma:R000069`–`soma:R000071`, `soma:R000075`, `soma:R000076` y `soma:R000081`.

Relaciones retiradas por semántica o alcance insuficientes, cuyos IDs no se reutilizan:

- `soma:R000026`–`soma:R000031`: despolarización/repolarización genéricas, regulación del potencial e iones aplicados universalmente al potencial de acción.
- `soma:R000033`: causalidad demasiado amplia entre potencial de acción y liberación.
- `soma:R000079`–`soma:R000080`: divisiones funcionales modeladas como partes materiales.
- `soma:R000082`–`soma:R000084` y `soma:R000086`: procesos integrados localizados de forma excesivamente general en todo el sistema nervioso.

Prerrequisitos retirados, cuyos IDs no se reutilizan: `soma:P000009`, `soma:P000016`, `soma:P000035`, `soma:P000045`, `soma:P000046`, `soma:P000048`, `soma:P000049`, `soma:P000060`, `soma:P000070`–`soma:P000075` y `soma:P000099`. Se eliminaron dependencias artificiales átomo→ion, ATP→mitocondria, neurona→glía, rol→entidad química, tejido→sistema y dopamina→aprendizaje por recompensa. Se añadieron `soma:P000100`–`soma:P000108` para los subtipos y padres intermedios, y se corrigieron los enlaces existentes afectados. Todos siguen siendo orientación no bloqueante y no expresan causalidad científica.

Permanecen deliberadamente pendientes de mapping o alcance las relaciones no inferenciales mielina–axón (`soma:R000048`), sistema nervioso autónomo–sistema nervioso (`soma:R000081`) y aprendizaje por recompensa–aprendizaje/memoria (`soma:R000085`). No deben publicarse hasta resolver su semántica externa.
