# GAM-03B — Revisión editorial del primer lote científico

> Documento para revisión humana. No constituye autorización de publicación, no cambia estados editoriales del catálogo y no forma parte del runtime público.

## Alcance y decisión pendiente

El lote contiene 19 conceptos. CONTENT-02 propone los 19 para aprobación editorial, pero la publicación requiere una decisión independiente y explícita en `publication-manifest.json`. El manifiesto permanece vacío.

Las relaciones científicas y los prerrequisitos pedagógicos son capas distintas. Los prerrequisitos nunca bloquean contenido, no conceden XP y no se presentan como causalidad.

## Relaciones propuestas para el primer lote

- `soma:R000009`: `soma:K000028` — `is_a` → `soma:K000020` — **ready_for_editorial_approval**; inclusión propuesta: **sí**. Within this catalog's protein-scoped concept, an ion channel is a pore-forming transmembrane protein. Exact external class mapping can remain a later interoperability task.
- `soma:R000010`: `soma:K000028` — `located_in` → `soma:K000023` — **ready_for_editorial_approval**; inclusión propuesta: **sí**. located_in is a defensible coarse relation for a transmembrane channel and the catalog explicitly defines it as location rather than composition. A more specific membrane-integration predicate could refine it later.
- `soma:R000013`: `soma:K000030` — `is_a` → `soma:K000028` — **ready_for_editorial_approval**; inclusión propuesta: **sí**. Voltage-gated channels are a subtype of ion channel.
- `soma:R000015`: `soma:K000032` — `is_a` → `soma:K000020` — **ready_for_editorial_approval**; inclusión propuesta: **sí**. The catalog deliberately defines membrane transporter as a protein-mediated category; exact external class mapping is not required for this elementary educational statement.
- `soma:R000016`: `soma:K000032` — `located_in` → `soma:K000023` — **ready_for_editorial_approval**; inclusión propuesta: **sí**. located_in is a defensible coarse relation for a membrane transporter under the catalog's non-compositional semantics. It must not be inferred as part_of.
- `soma:R000023`: `soma:K000037` — `inheres_in` → `soma:K000023` — **scientific_review_required**; inclusión propuesta: **no**. Membrane potential is a potential difference across a membrane. Treating that relational quality as inhering in the membrane is plausible but needs a formal bearer/predicate decision before publication.
- `soma:R000032`: `soma:K000030` — `participates_in` → `soma:K000041` — **ready_for_editorial_approval**; inclusión propuesta: **sí**. Voltage-gated ion channels participate in action potentials; this participation statement neither universalises every subtype nor asserts sole causation.
- `soma:R000037`: `soma:K000046` — `part_of` → `soma:K000043` — **ready_for_editorial_approval**; inclusión propuesta: **sí**. An axon is a neuronal component under the catalog's documented existential partonomy.
- `soma:R000038`: `soma:K000047` — `part_of` → `soma:K000046` — **ready_for_editorial_approval**; inclusión propuesta: **sí**. An axon terminal is a terminal region of an axon.
- `soma:R000049`: `soma:K000055` — `is_a` → `soma:K000054` — **ready_for_editorial_approval**; inclusión propuesta: **sí**. Chemical synapse is a subtype of synapse.
- `soma:R000052`: `soma:K000058` — `located_in` → `soma:K000047` — **excluded_from_first_release**; inclusión propuesta: **no**. Synaptic vesicles are concentrated at presynaptic terminals, but the authored relation is scoped specifically to presynaptic axon terminals. The current runtime relation contract cannot carry that scope, so publishing it would overgeneralise.
- `soma:R000053`: `soma:K000058` — `participates_in` → `soma:K000060` — **ready_for_editorial_approval**; inclusión propuesta: **sí**. Synaptic vesicles participate in vesicular neurotransmitter release; participation does not assert that all release modes are vesicular.
- `soma:R000054`: `soma:K000060` — `occurs_in` → `soma:K000055` — **excluded_from_first_release**; inclusión propuesta: **no**. The relation is defensible only for chemical synaptic release, while the concept definition is broader and the runtime contract drops the authored scope. Publishing the unscoped edge would conflate synaptic and non-synaptic release.

## Fichas para revisión

### 1. Carga eléctrica / Electric charge

- ID: `soma:K000004`
- Estado editorial propuesto: `ready_for_editorial_approval`
- Certeza declarada: `well_established`

#### Definición

- ES: Propiedad física de una partícula o sistema que determina su participación en interacciones electromagnéticas.
- EN: A physical property of a particle or system that determines its participation in electromagnetic interactions.

#### Explicación ampliada

- ES: La carga puede ser positiva o negativa y se mide en culombios. En células nerviosas, partículas cargadas como los iones contribuyen a los fenómenos eléctricos; la carga no es por sí misma una señal ni una forma de progreso biológico.
- EN: Charge can be positive or negative and is measured in coulombs. In nerve cells, charged particles such as ions contribute to electrical phenomena; charge is not by itself a signal or a measure of biological progress.

#### Ejemplo

- ES: Na+ y Cl− tienen cargas netas de signo opuesto.
- EN: Na+ and Cl− have net charges with opposite signs.

#### Fuentes específicas

- `SRC-BIPM-SI-9` — [The International System of Units (SI), 9th edition](https://www.bipm.org/documents/20126/41483022/SI-Brochure-9.pdf/fcf090b2-04e6-88cc-1149-c3e029ad8232). Alcance: SI quantities and units for electric charge and electric potential difference
- `SRC-OPENSTAX-AANDP-12-4` — [Anatomy and Physiology 2e, 12.4 The Action Potential](https://openstax.org/books/anatomy-and-physiology-2e/pages/12-4-the-action-potential). Alcance: Membrane potential, voltage-gated channels and action potentials

#### Relaciones científicas propuestas

- Ninguna relación científica interna propuesta para esta ficha en el primer lote.

#### Conceptos relacionados

- `soma:K000006`
- `soma:K000013`

#### Advertencias y limitaciones

- Exact external ontology mapping remains pending in the source catalog.
- Recurso visual futuro: `shared_process_diagram` — Schematic positive and negative charges with an explicit legend; not an anatomical image.
- La ficha no ofrece interpretación clínica individual y su aprobación editorial no autoriza publicación.

### 2. Diferencia de potencial eléctrico / Electric potential difference

- ID: `soma:K000006`
- Estado editorial propuesto: `ready_for_editorial_approval`
- Certeza declarada: `well_established`

#### Definición

- ES: Diferencia de energía potencial eléctrica por unidad de carga entre dos puntos.
- EN: The difference in electric potential energy per unit charge between two points.

#### Explicación ampliada

- ES: También se denomina voltaje y se mide en voltios. Siempre compara dos puntos: el potencial de membrana, por ejemplo, compara ambos lados de una membrana; no describe una cantidad absoluta de electricidad almacenada.
- EN: It is also called voltage and is measured in volts. It always compares two points: membrane potential, for example, compares the two sides of a membrane; it does not describe an absolute amount of stored electricity.

#### Ejemplo

- ES: Un voltio equivale a un julio por culombio.
- EN: One volt equals one joule per coulomb.

#### Fuentes específicas

- `SRC-BIPM-SI-9` — [The International System of Units (SI), 9th edition](https://www.bipm.org/documents/20126/41483022/SI-Brochure-9.pdf/fcf090b2-04e6-88cc-1149-c3e029ad8232). Alcance: SI quantities and units for electric charge and electric potential difference
- `SRC-OPENSTAX-AANDP-12-4` — [Anatomy and Physiology 2e, 12.4 The Action Potential](https://openstax.org/books/anatomy-and-physiology-2e/pages/12-4-the-action-potential). Alcance: Membrane potential, voltage-gated channels and action potentials

#### Relaciones científicas propuestas

- Ninguna relación científica interna propuesta para esta ficha en el primer lote.

#### Conceptos relacionados

- `soma:K000004`
- `soma:K000037`

#### Advertencias y limitaciones

- The wording preserves the distinction between potential and potential difference.
- Recurso visual futuro: `shared_process_diagram` — Two points with an energy-per-charge difference and a clear reference direction.
- La ficha no ofrece interpretación clínica individual y su aprobación editorial no autoriza publicación.

### 3. Gradiente de concentración / Concentration gradient

- ID: `soma:K000008`
- Estado editorial propuesto: `ready_for_editorial_approval`
- Certeza declarada: `well_established_with_pedagogical_scope`

#### Definición

- ES: Variación espacial de la concentración de una especie.
- EN: A spatial variation in the concentration of a species.

#### Explicación ampliada

- ES: Un gradiente indica que una sustancia no está distribuida por igual. Puede favorecer difusión neta, pero no determina por sí solo el movimiento de un ion a través de una membrana selectiva: también importan la carga, la permeabilidad y otras fuerzas.
- EN: A gradient indicates that a substance is not distributed evenly. It can favour net diffusion, but it does not by itself determine an ion's movement across a selective membrane: charge, permeability and other forces also matter.

#### Ejemplo

- ES: Puede haber más iones de una especie a un lado de una membrana que al otro.
- EN: There may be more ions of one species on one side of a membrane than on the other.

#### Fuentes específicas

- `SRC-OPENSTAX-BIO-5-2` — [Biology 2e, 5.2 Passive Transport](https://openstax.org/books/biology-2e/pages/5-2-passive-transport). Alcance: Concentration gradients, selective permeability, channels and carriers
- `SRC-OPENSTAX-BIO-5-3` — [Biology 2e, 5.3 Active Transport](https://openstax.org/books/biology-2e/pages/5-3-active-transport). Alcance: Electrochemical gradients and membrane transporters

#### Relaciones científicas propuestas

- Ninguna relación científica interna propuesta para esta ficha en el primer lote.

#### Conceptos relacionados

- `soma:K000010`
- `soma:K000013`
- `soma:K000023`

#### Advertencias y limitaciones

- An exact IUPAC term mapping remains pending; the educational definition is narrower and explicit.
- Recurso visual futuro: `shared_process_diagram` — Particles distributed at different concentrations across space and across a membrane.
- La ficha no ofrece interpretación clínica individual y su aprobación editorial no autoriza publicación.

### 4. Potencial electroquímico / Electrochemical potential

- ID: `soma:K000010`
- Estado editorial propuesto: `ready_for_editorial_approval`
- Certeza declarada: `well_established_with_pedagogical_simplification`

#### Definición

- ES: Potencial termodinámico de una especie en una fase a un potencial eléctrico determinado.
- EN: The thermodynamic potential of a species in a phase at a specified electric potential.

#### Explicación ampliada

- ES: El potencial electroquímico describe el estado termodinámico de una especie en un entorno donde importan tanto la composición química como el potencial eléctrico. Para un ion, la contribución química depende de su actividad o concentración efectiva, mientras que la eléctrica depende de su carga y del voltaje local. Una diferencia de potencial electroquímico indica una dirección termodinámicamente favorable de transferencia cuando existe una vía adecuada. No garantiza que el ion pueda cruzar una membrana: también cuentan la permeabilidad, la apertura de canales y la velocidad de los transportadores. Este concepto permite comprender por qué concentración y voltaje deben analizarse juntos al estudiar movimiento iónico y bioelectricidad.
- EN: Electrochemical potential describes the thermodynamic state of a species in an environment where both chemical composition and electric potential matter. For an ion, the chemical contribution depends on its activity or effective concentration, whereas the electrical contribution depends on its charge and the local voltage. A difference in electrochemical potential indicates a thermodynamically favourable direction of transfer when a suitable pathway exists. It does not guarantee that the ion can cross a membrane: permeability, channel opening and transporter rates also matter. This concept explains why concentration and voltage must be considered together when studying ion movement and bioelectricity.

#### Ejemplo

- ES: Un ion puede encontrar una contribución química favorable y una contribución eléctrica opuesta.
- EN: An ion can face a favourable chemical contribution and an opposing electrical contribution.

#### Fuentes específicas

- `SRC-IUPAC-E01945` — [Electrochemical potential (E01945)](https://goldbook.iupac.org/terms/view/E01945). Alcance: Exact definition of electrochemical potential
- `SRC-OPENSTAX-BIO-5-3` — [Biology 2e, 5.3 Active Transport](https://openstax.org/books/biology-2e/pages/5-3-active-transport). Alcance: Electrochemical gradients and membrane transporters

#### Relaciones científicas propuestas

- Ninguna relación científica interna propuesta para esta ficha en el primer lote.

#### Conceptos relacionados

- `soma:K000006`
- `soma:K000008`
- `soma:K000013`
- `soma:K000028`

#### Advertencias y limitaciones

- The short definition follows IUPAC; the expanded text explains the cell-biology use without reducing it to concentration plus voltage alone.
- Recurso visual futuro: `shared_process_diagram` — Two aligned arrows for chemical and electrical contributions, with no claim that they always point together.
- La ficha no ofrece interpretación clínica individual y su aprobación editorial no autoriza publicación.

### 5. Ion / Ion

- ID: `soma:K000013`
- Estado editorial propuesto: `ready_for_editorial_approval`
- Certeza declarada: `well_established`

#### Definición

- ES: Entidad atómica o molecular con carga eléctrica neta.
- EN: An atomic or molecular entity with a net electric charge.

#### Explicación ampliada

- ES: Un ion puede tener carga positiva o negativa. En biología, distintas especies iónicas se distribuyen de manera desigual y atraviesan membranas mediante vías selectivas; no todos los iones cumplen la misma función.
- EN: An ion can carry a positive or negative charge. In biology, different ionic species are distributed unevenly and cross membranes through selective pathways; ions do not all have the same function.

#### Ejemplo

- ES: Na+, K+, Ca2+ y Cl− son iones relevantes para numerosos procesos celulares.
- EN: Na+, K+, Ca2+ and Cl− are ions relevant to many cellular processes.

#### Fuentes específicas

- `SRC-OPENSTAX-BIO-5-2` — [Biology 2e, 5.2 Passive Transport](https://openstax.org/books/biology-2e/pages/5-2-passive-transport). Alcance: Concentration gradients, selective permeability, channels and carriers
- `SRC-OPENSTAX-AANDP-12-4` — [Anatomy and Physiology 2e, 12.4 The Action Potential](https://openstax.org/books/anatomy-and-physiology-2e/pages/12-4-the-action-potential). Alcance: Membrane potential, voltage-gated channels and action potentials

#### Relaciones científicas propuestas

- Ninguna relación científica interna propuesta para esta ficha en el primer lote.

#### Conceptos relacionados

- `soma:K000004`
- `soma:K000008`
- `soma:K000010`
- `soma:K000028`

#### Advertencias y limitaciones

- Exact ChEBI/IUPAC identifier mapping remains pending and is intentionally not asserted here.
- Recurso visual futuro: `molecular_or_structural` — Small set of labelled ions with charge notation; avoid implying literal colours or scales.
- La ficha no ofrece interpretación clínica individual y su aprobación editorial no autoriza publicación.

### 6. Proteína / Protein

- ID: `soma:K000020`
- Estado editorial propuesto: `ready_for_editorial_approval`
- Certeza declarada: `well_established`

#### Definición

- ES: Macromolécula formada por una o más cadenas polipeptídicas que adquieren una organización funcional.
- EN: A macromolecule made of one or more polypeptide chains that acquire a functional organisation.

#### Explicación ampliada

- ES: Las proteínas realizan funciones muy diversas según su secuencia, estructura y contexto. Canales y muchos transportadores de membrana son proteínas, pero la categoría proteína es mucho más amplia.
- EN: Proteins perform many different functions depending on their sequence, structure and context. Channels and many membrane transporters are proteins, but the protein category is much broader.

#### Ejemplo

- ES: Un canal iónico es una proteína especializada; una proteína estructural puede cumplir una función distinta.
- EN: An ion channel is a specialised protein; a structural protein can perform a different function.

#### Fuentes específicas

- `SRC-OPENSTAX-BIO-5-1` — [Biology 2e, 5.1 Components and Structure](https://openstax.org/books/biology-2e/pages/5-1-components-and-structure). Alcance: Plasma-membrane structure, integral proteins and channels
- `SRC-OPENSTAX-BIO-5-2` — [Biology 2e, 5.2 Passive Transport](https://openstax.org/books/biology-2e/pages/5-2-passive-transport). Alcance: Concentration gradients, selective permeability, channels and carriers

#### Relaciones científicas propuestas

- `soma:R000009`: `soma:K000028` — `is_a` → `soma:K000020`. Resultado: `ready_for_editorial_approval`; inclusión propuesta: **sí**. Within this catalog's protein-scoped concept, an ion channel is a pore-forming transmembrane protein. Exact external class mapping can remain a later interoperability task.
- `soma:R000015`: `soma:K000032` — `is_a` → `soma:K000020`. Resultado: `ready_for_editorial_approval`; inclusión propuesta: **sí**. The catalog deliberately defines membrane transporter as a protein-mediated category; exact external class mapping is not required for this elementary educational statement.

#### Conceptos relacionados

- `soma:K000028`
- `soma:K000032`

#### Advertencias y limitaciones

- Exact external chemical-entity mapping remains pending.
- Recurso visual futuro: `molecular_or_structural` — Abstract folded protein alongside membrane proteins; not an atomic-resolution claim.
- La ficha no ofrece interpretación clínica individual y su aprobación editorial no autoriza publicación.

### 7. Membrana biológica / Biological membrane

- ID: `soma:K000023`
- Estado editorial propuesto: `ready_for_editorial_approval`
- Certeza declarada: `well_established`

#### Definición

- ES: Estructura organizada de lípidos, proteínas y otros componentes que delimita células o compartimentos celulares.
- EN: An organised structure of lipids, proteins and other components that bounds cells or cellular compartments.

#### Explicación ampliada

- ES: Una membrana biológica es una estructura dinámica basada en una bicapa de lípidos, con proteínas y otros componentes asociados. Delimita la célula o sus compartimentos y permite mantener condiciones internas distintas de las externas. No es una pared completamente cerrada: su permeabilidad es selectiva. Algunas moléculas pequeñas atraviesan la bicapa con relativa facilidad, mientras que los iones y muchas moléculas polares necesitan canales o transportadores; ciertos movimientos requieren además energía celular. Las proteínas de membrana también participan en comunicación y reconocimiento. Comprender esta organización es esencial para explicar cómo se conservan gradientes, cómo aparece un potencial de membrana y cómo las células intercambian señales y sustancias.
- EN: A biological membrane is a dynamic structure built around a lipid bilayer, with proteins and other associated components. It bounds a cell or its compartments and allows internal conditions to differ from the surroundings. It is not a completely sealed wall: its permeability is selective. Some small molecules cross the bilayer relatively easily, whereas ions and many polar molecules require channels or transporters; some movements also require cellular energy. Membrane proteins also participate in communication and recognition. Understanding this organisation is essential for explaining how gradients are maintained, how membrane potential arises, and how cells exchange signals and substances.

#### Ejemplo

- ES: La membrana plasmática separa el interior celular del entorno; los orgánulos también pueden tener membranas.
- EN: The plasma membrane separates the cell interior from its environment; organelles can also have membranes.

#### Fuentes específicas

- `SRC-OPENSTAX-BIO-5-1` — [Biology 2e, 5.1 Components and Structure](https://openstax.org/books/biology-2e/pages/5-1-components-and-structure). Alcance: Plasma-membrane structure, integral proteins and channels
- `SRC-OPENSTAX-BIO-5-2` — [Biology 2e, 5.2 Passive Transport](https://openstax.org/books/biology-2e/pages/5-2-passive-transport). Alcance: Concentration gradients, selective permeability, channels and carriers

#### Relaciones científicas propuestas

- `soma:R000010`: `soma:K000028` — `located_in` → `soma:K000023`. Resultado: `ready_for_editorial_approval`; inclusión propuesta: **sí**. located_in is a defensible coarse relation for a transmembrane channel and the catalog explicitly defines it as location rather than composition. A more specific membrane-integration predicate could refine it later.
- `soma:R000016`: `soma:K000032` — `located_in` → `soma:K000023`. Resultado: `ready_for_editorial_approval`; inclusión propuesta: **sí**. located_in is a defensible coarse relation for a membrane transporter under the catalog's non-compositional semantics. It must not be inferred as part_of.
- `soma:R000023`: `soma:K000037` — `inheres_in` → `soma:K000023`. Resultado: `scientific_review_required`; inclusión propuesta: **no**. Membrane potential is a potential difference across a membrane. Treating that relational quality as inhering in the membrane is plausible but needs a formal bearer/predicate decision before publication.

#### Conceptos relacionados

- `soma:K000020`
- `soma:K000028`
- `soma:K000032`
- `soma:K000037`

#### Advertencias y limitaciones

- Relations using located_in and inheres_in remain under predicate-level review.
- Recurso visual futuro: `molecular_or_structural` — Realistic bilayer cross-section with embedded proteins and a scale disclaimer.
- La ficha no ofrece interpretación clínica individual y su aprobación editorial no autoriza publicación.

### 8. Canal iónico / Ion channel

- ID: `soma:K000028`
- Estado editorial propuesto: `ready_for_editorial_approval`
- Certeza declarada: `well_established`

#### Definición

- ES: Proteína transmembrana que forma una vía selectiva para el paso de iones.
- EN: A transmembrane protein that forms a selective pathway for ions to pass.

#### Explicación ampliada

- ES: Un canal iónico es una proteína transmembrana que forma un poro acuoso y selectivo. Cuando el canal está abierto, determinados iones pueden atravesar la membrana pasivamente en la dirección favorecida por su gradiente electroquímico. La estructura del poro contribuye a decidir qué iones pasan, y distintos mecanismos controlan la apertura: algunos canales responden al voltaje, otros a ligandos, fuerzas mecánicas u otras señales. Un canal no es una bomba y no impulsa por sí mismo iones contra su gradiente; los gradientes que aprovecha suelen mantenerse mediante transporte activo. Esta distinción prepara el estudio de cómo cambios coordinados de permeabilidad producen señales eléctricas celulares.
- EN: An ion channel is a transmembrane protein that forms a selective, water-filled pore. When the channel is open, selected ions can cross the membrane passively in the direction favoured by their electrochemical gradient. The pore's structure helps determine which ions pass, and different mechanisms control opening: some channels respond to voltage, others to ligands, mechanical forces or other signals. A channel is not a pump and does not by itself drive ions against their gradient; the gradients it uses are often maintained by active transport. This distinction prepares the study of how coordinated changes in permeability produce cellular electrical signals.

#### Ejemplo

- ES: Un canal puede ser selectivo para potasio y permanecer cerrado hasta recibir una señal concreta.
- EN: A channel can be selective for potassium and remain closed until it receives a particular signal.

#### Fuentes específicas

- `SRC-OPENSTAX-BIO-5-1` — [Biology 2e, 5.1 Components and Structure](https://openstax.org/books/biology-2e/pages/5-1-components-and-structure). Alcance: Plasma-membrane structure, integral proteins and channels
- `SRC-OPENSTAX-BIO-5-2` — [Biology 2e, 5.2 Passive Transport](https://openstax.org/books/biology-2e/pages/5-2-passive-transport). Alcance: Concentration gradients, selective permeability, channels and carriers
- `SRC-OPENSTAX-AANDP-12-4` — [Anatomy and Physiology 2e, 12.4 The Action Potential](https://openstax.org/books/anatomy-and-physiology-2e/pages/12-4-the-action-potential). Alcance: Membrane potential, voltage-gated channels and action potentials

#### Relaciones científicas propuestas

- `soma:R000009`: `soma:K000028` — `is_a` → `soma:K000020`. Resultado: `ready_for_editorial_approval`; inclusión propuesta: **sí**. Within this catalog's protein-scoped concept, an ion channel is a pore-forming transmembrane protein. Exact external class mapping can remain a later interoperability task.
- `soma:R000010`: `soma:K000028` — `located_in` → `soma:K000023`. Resultado: `ready_for_editorial_approval`; inclusión propuesta: **sí**. located_in is a defensible coarse relation for a transmembrane channel and the catalog explicitly defines it as location rather than composition. A more specific membrane-integration predicate could refine it later.
- `soma:R000013`: `soma:K000030` — `is_a` → `soma:K000028`. Resultado: `ready_for_editorial_approval`; inclusión propuesta: **sí**. Voltage-gated channels are a subtype of ion channel.

#### Conceptos relacionados

- `soma:K000013`
- `soma:K000020`
- `soma:K000023`
- `soma:K000030`

#### Advertencias y limitaciones

- The is_a relation to protein is approvable; the spatial predicate requires exact mapping.
- Recurso visual futuro: `molecular_or_structural` — Membrane-spanning pore shown open and closed, with ion selectivity indicated by labels.
- La ficha no ofrece interpretación clínica individual y su aprobación editorial no autoriza publicación.

### 9. Canal iónico dependiente de voltaje / Voltage-gated ion channel

- ID: `soma:K000030`
- Estado editorial propuesto: `ready_for_editorial_approval`
- Certeza declarada: `well_established_with_scope`

#### Definición

- ES: Canal iónico cuya probabilidad de apertura cambia con el potencial de membrana.
- EN: An ion channel whose probability of opening changes with membrane potential.

#### Explicación ampliada

- ES: Estos canales detectan cambios de voltaje mediante regiones sensibles al campo eléctrico. Diferentes tipos se activan e inactivan con propiedades distintas; no todos responden al mismo voltaje ni permanecen abiertos del mismo modo.
- EN: These channels detect voltage changes through regions sensitive to the electric field. Different types activate and inactivate with different properties; they do not all respond at the same voltage or remain open in the same way.

#### Ejemplo

- ES: Canales de sodio y potasio dependientes de voltaje participan en distintas fases de muchos potenciales de acción neuronales.
- EN: Voltage-gated sodium and potassium channels participate in different phases of many neuronal action potentials.

#### Fuentes específicas

- `SRC-OPENSTAX-AANDP-12-4` — [Anatomy and Physiology 2e, 12.4 The Action Potential](https://openstax.org/books/anatomy-and-physiology-2e/pages/12-4-the-action-potential). Alcance: Membrane potential, voltage-gated channels and action potentials

#### Relaciones científicas propuestas

- `soma:R000013`: `soma:K000030` — `is_a` → `soma:K000028`. Resultado: `ready_for_editorial_approval`; inclusión propuesta: **sí**. Voltage-gated channels are a subtype of ion channel.
- `soma:R000032`: `soma:K000030` — `participates_in` → `soma:K000041`. Resultado: `ready_for_editorial_approval`; inclusión propuesta: **sí**. Voltage-gated ion channels participate in action potentials; this participation statement neither universalises every subtype nor asserts sole causation.

#### Conceptos relacionados

- `soma:K000028`
- `soma:K000037`
- `soma:K000041`

#### Advertencias y limitaciones

- The explanation avoids implying that every action potential uses an identical channel set.
- Recurso visual futuro: `shared_process_diagram` — Channel conformations aligned with a voltage trace, avoiding a literal mechanical gate metaphor.
- La ficha no ofrece interpretación clínica individual y su aprobación editorial no autoriza publicación.

### 10. Transportador de membrana / Membrane transporter

- ID: `soma:K000032`
- Estado editorial propuesto: `ready_for_editorial_approval`
- Certeza declarada: `well_established_with_category_scope`

#### Definición

- ES: Proteína que media el movimiento de una sustancia a través de una membrana.
- EN: A protein that mediates movement of a substance across a membrane.

#### Explicación ampliada

- ES: Los transportadores reconocen sustancias concretas y cambian de conformación o acoplan movimientos para trasladarlas. Algunos facilitan transporte pasivo y otros participan en transporte activo; no deben confundirse todos con canales abiertos.
- EN: Transporters recognise particular substances and change conformation or couple movements to carry them. Some facilitate passive transport and others participate in active transport; they should not all be treated as open channels.

#### Ejemplo

- ES: Un cotransportador puede aprovechar el gradiente de un ion para mover otra sustancia.
- EN: A cotransporter can use an ion gradient to move another substance.

#### Fuentes específicas

- `SRC-OPENSTAX-BIO-5-2` — [Biology 2e, 5.2 Passive Transport](https://openstax.org/books/biology-2e/pages/5-2-passive-transport). Alcance: Concentration gradients, selective permeability, channels and carriers
- `SRC-OPENSTAX-BIO-5-3` — [Biology 2e, 5.3 Active Transport](https://openstax.org/books/biology-2e/pages/5-3-active-transport). Alcance: Electrochemical gradients and membrane transporters

#### Relaciones científicas propuestas

- `soma:R000015`: `soma:K000032` — `is_a` → `soma:K000020`. Resultado: `ready_for_editorial_approval`; inclusión propuesta: **sí**. The catalog deliberately defines membrane transporter as a protein-mediated category; exact external class mapping is not required for this elementary educational statement.
- `soma:R000016`: `soma:K000032` — `located_in` → `soma:K000023`. Resultado: `ready_for_editorial_approval`; inclusión propuesta: **sí**. located_in is a defensible coarse relation for a membrane transporter under the catalog's non-compositional semantics. It must not be inferred as part_of.

#### Conceptos relacionados

- `soma:K000020`
- `soma:K000023`
- `soma:K000028`

#### Advertencias y limitaciones

- The batch uses the catalog's protein scope; exact GO class mapping remains pending.
- Recurso visual futuro: `molecular_or_structural` — Side-by-side carrier conformations, explicitly contrasted with a channel pore.
- La ficha no ofrece interpretación clínica individual y su aprobación editorial no autoriza publicación.

### 11. Potencial de membrana / Membrane potential

- ID: `soma:K000037`
- Estado editorial propuesto: `ready_for_editorial_approval`
- Certeza declarada: `well_established`

#### Definición

- ES: Diferencia de potencial eléctrico entre los dos lados de una membrana biológica.
- EN: The electric potential difference between the two sides of a biological membrane.

#### Explicación ampliada

- ES: El potencial de membrana es el voltaje entre los dos lados de una membrana biológica. Surge de separaciones muy pequeñas de carga, sostenidas por distribuciones iónicas desiguales y por la permeabilidad selectiva de la membrana. El interior y el exterior permanecen casi eléctricamente neutros en conjunto: no es necesario que toda la célula acumule una gran carga neta. Su valor depende de qué iones pueden cruzar y de sus gradientes electroquímicos, por lo que puede cambiar cuando se abren o cierran canales. Existe en muchas células y orgánulos, no solo en neuronas. En células excitables proporciona el estado eléctrico sobre el que se desarrollan cambios rápidos como el potencial de acción.
- EN: Membrane potential is the voltage between the two sides of a biological membrane. It arises from very small charge separations sustained by unequal ion distributions and the membrane's selective permeability. The inside and outside remain nearly electrically neutral overall: the whole cell does not need to accumulate a large net charge. Its value depends on which ions can cross and on their electrochemical gradients, so it can change when channels open or close. Membrane potential exists in many cells and organelles, not only in neurons. In excitable cells, it provides the electrical state on which rapid changes such as an action potential develop.

#### Ejemplo

- ES: Al abrirse un canal selectivo cambia la permeabilidad y puede cambiar el potencial de membrana.
- EN: Opening a selective channel changes permeability and can change membrane potential.

#### Fuentes específicas

- `SRC-OPENSTAX-AANDP-12-4` — [Anatomy and Physiology 2e, 12.4 The Action Potential](https://openstax.org/books/anatomy-and-physiology-2e/pages/12-4-the-action-potential). Alcance: Membrane potential, voltage-gated channels and action potentials
- `SRC-OPENSTAX-BIO-5-3` — [Biology 2e, 5.3 Active Transport](https://openstax.org/books/biology-2e/pages/5-3-active-transport). Alcance: Electrochemical gradients and membrane transporters

#### Relaciones científicas propuestas

- `soma:R000023`: `soma:K000037` — `inheres_in` → `soma:K000023`. Resultado: `scientific_review_required`; inclusión propuesta: **no**. Membrane potential is a potential difference across a membrane. Treating that relational quality as inhering in the membrane is plausible but needs a formal bearer/predicate decision before publication.

#### Conceptos relacionados

- `soma:K000006`
- `soma:K000010`
- `soma:K000023`
- `soma:K000030`
- `soma:K000041`

#### Advertencias y limitaciones

- The inheres_in relation is held for formal predicate review; the educational statement is independently supported.
- Recurso visual futuro: `shared_process_diagram` — Membrane cross-section with local charge separation and a voltage annotation, not a fully charged cell.
- La ficha no ofrece interpretación clínica individual y su aprobación editorial no autoriza publicación.

### 12. Potencial de acción / Action potential

- ID: `soma:K000041`
- Estado editorial propuesto: `ready_for_editorial_approval`
- Certeza declarada: `well_established_with_cell_type_scope`

#### Definición

- ES: Cambio rápido y transitorio del potencial de membrana en una célula excitable, con despolarización y repolarización.
- EN: A rapid, transient change in membrane potential in an excitable cell, involving depolarisation and repolarisation.

#### Explicación ampliada

- ES: Un potencial de acción es un cambio breve y regenerativo del potencial de membrana en una célula excitable. Cuando la membrana alcanza determinadas condiciones, la apertura e inactivación coordinadas de canales dependientes de voltaje producen una fase de despolarización seguida de repolarización. En muchos axones, este patrón se regenera a lo largo de la membrana y permite que la señal alcance regiones alejadas sin comportarse como una corriente pasiva en un cable metálico. Su amplitud típica no aumenta de manera proporcional a la intensidad del estímulo; la frecuencia y el momento de los potenciales pueden transportar información. Entenderlo conecta la bioelectricidad de membrana con la organización funcional de la neurona.
- EN: An action potential is a brief, regenerative change in membrane potential in an excitable cell. When the membrane reaches suitable conditions, the coordinated opening and inactivation of voltage-gated channels produce a depolarising phase followed by repolarisation. In many axons, this pattern is regenerated along the membrane, allowing the signal to reach distant regions without behaving like passive current in a metal wire. Its typical amplitude does not increase in proportion to stimulus intensity; the frequency and timing of action potentials can carry information. Understanding this process connects membrane bioelectricity with the neuron's functional organisation.

#### Ejemplo

- ES: La apertura e inactivación de canales de sodio y la apertura de canales de potasio contribuyen a fases distintas de un potencial de acción neuronal típico.
- EN: Opening and inactivation of sodium channels and opening of potassium channels contribute to different phases of a typical neuronal action potential.

#### Fuentes específicas

- `SRC-OPENSTAX-AANDP-12-4` — [Anatomy and Physiology 2e, 12.4 The Action Potential](https://openstax.org/books/anatomy-and-physiology-2e/pages/12-4-the-action-potential). Alcance: Membrane potential, voltage-gated channels and action potentials
- `SRC-PURVES-CHEMICAL-SYNAPSES` — [Neuroscience, 2nd edition: Chemical Synapses](https://www.ncbi.nlm.nih.gov/books/NBK11009/). Alcance: Chemical synapses, synaptic vesicles and calcium-dependent transmitter release

#### Relaciones científicas propuestas

- `soma:R000032`: `soma:K000030` — `participates_in` → `soma:K000041`. Resultado: `ready_for_editorial_approval`; inclusión propuesta: **sí**. Voltage-gated ion channels participate in action potentials; this participation statement neither universalises every subtype nor asserts sole causation.

#### Conceptos relacionados

- `soma:K000030`
- `soma:K000037`
- `soma:K000046`
- `soma:K000060`

#### Advertencias y limitaciones

- The source catalog's GO:0001508 mapping is already marked exact_identifier_checked. No direct graph edge to release is asserted.
- Recurso visual futuro: `process_diagram` — Accessible voltage-versus-time trace paired with channel states and a non-colour-only legend.
- La ficha no ofrece interpretación clínica individual y su aprobación editorial no autoriza publicación.

### 13. Neurona / Neuron

- ID: `soma:K000043`
- Estado editorial propuesto: `ready_for_editorial_approval`
- Certeza declarada: `well_established_with_diversity_caveat`

#### Definición

- ES: Tipo de célula del tejido nervioso especializada en recibir, integrar y transmitir señales.
- EN: A cell type in nervous tissue specialised in receiving, integrating and transmitting signals.

#### Explicación ampliada

- ES: Una neurona es una célula especializada del tejido nervioso que recibe, integra y transmite señales mediante propiedades eléctricas y químicas. Muchas neuronas presentan un cuerpo celular, dendritas que reciben numerosas entradas y un axón que conduce señales hacia otras células, pero su forma y organización varían ampliamente. Algunas configuraciones no encajan en el dibujo neuronal canónico, por lo que ese esquema debe entenderse como una guía y no como una regla universal. Las neuronas tampoco funcionan aisladas: interactúan continuamente con células gliales y con redes de otras neuronas. Reconocer sus componentes y diversidad permite situar después el axón, las terminales y las sinapsis dentro de una célula completa.
- EN: A neuron is a specialised cell in nervous tissue that receives, integrates and transmits signals through electrical and chemical properties. Many neurons have a cell body, dendrites that receive numerous inputs, and an axon that conducts signals towards other cells, but their shape and organisation vary widely. Some configurations do not fit the canonical neuron drawing, so that diagram should be treated as a guide rather than a universal rule. Neurons also do not function in isolation: they continuously interact with glial cells and networks of other neurons. Recognising their components and diversity makes it possible to place axons, terminals and synapses within a complete cell.

#### Ejemplo

- ES: Una neurona puede integrar numerosas entradas y comunicar una salida a través de su axón.
- EN: A neuron can integrate many inputs and communicate an output through its axon.

#### Fuentes específicas

- `SRC-OPENSTAX-AANDP-12-2` — [Anatomy and Physiology 2e, 12.2 Nervous Tissue](https://openstax.org/books/anatomy-and-physiology-2e/pages/12-2-nervous-tissue). Alcance: Neuron structure, axons and nervous tissue
- `SRC-PURVES-NERVE-CELLS` — [Neuroscience, 2nd edition: Nerve Cells](https://www.ncbi.nlm.nih.gov/books/NBK11103/). Alcance: Neuron, axon and axon terminal structure
- `SRC-CL-DOCS` — [Cell Ontology documentation](https://obophenotype.github.io/cell-ontology/). Alcance: Cell-type scope and future exact neuron mapping; no unverified identifier is asserted

#### Relaciones científicas propuestas

- `soma:R000037`: `soma:K000046` — `part_of` → `soma:K000043`. Resultado: `ready_for_editorial_approval`; inclusión propuesta: **sí**. An axon is a neuronal component under the catalog's documented existential partonomy.

#### Conceptos relacionados

- `soma:K000046`
- `soma:K000047`
- `soma:K000054`

#### Advertencias y limitaciones

- Exact Cell Ontology mapping remains pending and no CL identifier is invented.
- Recurso visual futuro: `realistic_anatomical` — Scientifically plausible neuron with labelled components and an explicit note that morphology varies.
- La ficha no ofrece interpretación clínica individual y su aprobación editorial no autoriza publicación.

### 14. Axón / Axon

- ID: `soma:K000046`
- Estado editorial propuesto: `ready_for_editorial_approval`
- Certeza declarada: `well_established_with_existential_partonomy`

#### Definición

- ES: Prolongación neuronal especializada en conducir señales desde una región de la neurona hacia otras células o regiones.
- EN: A neuronal projection specialised in conducting signals from one region of the neuron towards other cells or regions.

#### Explicación ampliada

- ES: El axón puede ramificarse y variar mucho en longitud y diámetro. En muchas neuronas conduce potenciales de acción hacia terminales, pero la frase «lejos del soma» es una orientación general y no una geometría universal.
- EN: An axon can branch and vary greatly in length and diameter. In many neurons it conducts action potentials towards terminals, but 'away from the soma' is a general orientation rather than a universal geometry.

#### Ejemplo

- ES: Las ramas de un axón pueden permitir que una neurona contacte con varios objetivos.
- EN: Branches of an axon can allow one neuron to contact several targets.

#### Fuentes específicas

- `SRC-OPENSTAX-AANDP-12-2` — [Anatomy and Physiology 2e, 12.2 Nervous Tissue](https://openstax.org/books/anatomy-and-physiology-2e/pages/12-2-nervous-tissue). Alcance: Neuron structure, axons and nervous tissue
- `SRC-PURVES-NERVE-CELLS` — [Neuroscience, 2nd edition: Nerve Cells](https://www.ncbi.nlm.nih.gov/books/NBK11103/). Alcance: Neuron, axon and axon terminal structure

#### Relaciones científicas propuestas

- `soma:R000037`: `soma:K000046` — `part_of` → `soma:K000043`. Resultado: `ready_for_editorial_approval`; inclusión propuesta: **sí**. An axon is a neuronal component under the catalog's documented existential partonomy.
- `soma:R000038`: `soma:K000047` — `part_of` → `soma:K000046`. Resultado: `ready_for_editorial_approval`; inclusión propuesta: **sí**. An axon terminal is a terminal region of an axon.

#### Conceptos relacionados

- `soma:K000041`
- `soma:K000043`
- `soma:K000047`

#### Advertencias y limitaciones

- The part_of relation is existential: an axon is part of some neuron, not every neuron is asserted to have a canonical axon.
- Recurso visual futuro: `realistic_anatomical` — Neuron overview plus axonal branch detail, maintaining a consistent scale legend.
- La ficha no ofrece interpretación clínica individual y su aprobación editorial no autoriza publicación.

### 15. Terminal axónica / Axon terminal

- ID: `soma:K000047`
- Estado editorial propuesto: `ready_for_editorial_approval`
- Certeza declarada: `well_established_with_synapse_scope`

#### Definición

- ES: Región terminal especializada de un axón que participa en la comunicación con una célula diana.
- EN: A specialised terminal region of an axon that participates in communication with a target cell.

#### Explicación ampliada

- ES: En una sinapsis química, la terminal presináptica contiene maquinaria de liberación y vesículas sinápticas. No todas las comunicaciones neuronales se reducen a una única forma de terminal química.
- EN: At a chemical synapse, the presynaptic terminal contains release machinery and synaptic vesicles. Not all neuronal communication can be reduced to a single form of chemical terminal.

#### Ejemplo

- ES: La llegada de un potencial de acción a una terminal presináptica puede iniciar liberación vesicular dependiente de calcio.
- EN: Arrival of an action potential at a presynaptic terminal can initiate calcium-dependent vesicular release.

#### Fuentes específicas

- `SRC-PURVES-NERVE-CELLS` — [Neuroscience, 2nd edition: Nerve Cells](https://www.ncbi.nlm.nih.gov/books/NBK11103/). Alcance: Neuron, axon and axon terminal structure
- `SRC-PURVES-CHEMICAL-SYNAPSES` — [Neuroscience, 2nd edition: Chemical Synapses](https://www.ncbi.nlm.nih.gov/books/NBK11009/). Alcance: Chemical synapses, synaptic vesicles and calcium-dependent transmitter release

#### Relaciones científicas propuestas

- `soma:R000038`: `soma:K000047` — `part_of` → `soma:K000046`. Resultado: `ready_for_editorial_approval`; inclusión propuesta: **sí**. An axon terminal is a terminal region of an axon.
- `soma:R000052`: `soma:K000058` — `located_in` → `soma:K000047`. Resultado: `excluded_from_first_release`; inclusión propuesta: **no**. Synaptic vesicles are concentrated at presynaptic terminals, but the authored relation is scoped specifically to presynaptic axon terminals. The current runtime relation contract cannot carry that scope, so publishing it would overgeneralise.

#### Conceptos relacionados

- `soma:K000041`
- `soma:K000046`
- `soma:K000055`
- `soma:K000058`

#### Advertencias y limitaciones

- The synaptic-vesicle location relation remains scoped to presynaptic axon terminals.
- Recurso visual futuro: `realistic_anatomical` — Zoom transition from axon branch to presynaptic terminal without conflating scales.
- La ficha no ofrece interpretación clínica individual y su aprobación editorial no autoriza publicación.

### 16. Sinapsis / Synapse

- ID: `soma:K000054`
- Estado editorial propuesto: `ready_for_editorial_approval`
- Certeza declarada: `well_established`

#### Definición

- ES: Unión funcional especializada mediante la que una célula se comunica con otra célula diana.
- EN: A specialised functional junction through which a cell communicates with a target cell.

#### Explicación ampliada

- ES: Una sinapsis conecta regiones especializadas de células que se comunican y puede ser química o eléctrica. Las sinapsis químicas tienen lados pre y postsinápticos diferenciados; algunas sinapsis eléctricas permiten comunicación bidireccional. El término describe una organización de comunicación, no una sustancia ni una neurona completa.
- EN: A synapse connects specialised regions of communicating cells and may be chemical or electrical. Chemical synapses have distinct pre- and postsynaptic sides; some electrical synapses permit bidirectional communication. The term describes a communication arrangement, not a substance or an entire neuron.

#### Ejemplo

- ES: En una sinapsis química, una señal liberada en el lado presináptico actúa sobre receptores del lado postsináptico.
- EN: At a chemical synapse, a signal released on the presynaptic side acts on receptors on the postsynaptic side.

#### Fuentes específicas

- `SRC-PURVES-CHEMICAL-SYNAPSES` — [Neuroscience, 2nd edition: Chemical Synapses](https://www.ncbi.nlm.nih.gov/books/NBK11009/). Alcance: Chemical synapses, synaptic vesicles and calcium-dependent transmitter release
- `SRC-OPENSTAX-AANDP-12-5` — [Anatomy and Physiology 2e, 12.5 Communication Between Neurons](https://openstax.org/books/anatomy-and-physiology-2e/pages/12-5-communication-between-neurons). Alcance: Chemical and electrical synapses, presynaptic calcium entry and vesicular release
- `SRC-NLM-MESH-SYNAPSES` — [Medical Subject Headings: Synapses (D013569)](https://www.ncbi.nlm.nih.gov/mesh/68013569). Alcance: Synapse definition, classical chemical synapses and non-synaptic signalling caveat

#### Relaciones científicas propuestas

- `soma:R000049`: `soma:K000055` — `is_a` → `soma:K000054`. Resultado: `ready_for_editorial_approval`; inclusión propuesta: **sí**. Chemical synapse is a subtype of synapse.

#### Conceptos relacionados

- `soma:K000043`
- `soma:K000055`

#### Advertencias y limitaciones

- Exact GO/UBERON mapping remains pending; the category/subtype distinction is preserved.
- Recurso visual futuro: `shared_process_diagram` — Overview contrasting chemical and electrical synapse at a high level, with chemical detail in the next card.
- La ficha no ofrece interpretación clínica individual y su aprobación editorial no autoriza publicación.

### 17. Sinapsis química / Chemical synapse

- ID: `soma:K000055`
- Estado editorial propuesto: `ready_for_editorial_approval`
- Certeza declarada: `well_established`

#### Definición

- ES: Sinapsis en la que una célula presináptica libera mensajeros químicos que actúan sobre receptores de una célula diana.
- EN: A synapse in which a presynaptic cell releases chemical messengers that act on receptors of a target cell.

#### Explicación ampliada

- ES: Una sinapsis química organiza la comunicación entre una región presináptica y una célula diana mediante mensajeros químicos. La región presináptica libera neurotransmisor, este atraviesa la hendidura sináptica y se une a receptores de la membrana postsináptica. La respuesta depende del tipo de receptor, de los canales o vías de señalización asociados y del estado de la célula receptora. Por ello, la identidad del neurotransmisor por sí sola no determina siempre si el efecto será excitador, inhibidor o modulador. Esta organización introduce una dirección funcional y un pequeño retraso respecto a la comunicación eléctrica directa. Comprenderla permite distinguir la estructura de la sinapsis de los procesos concretos de almacenamiento y liberación.
- EN: A chemical synapse organises communication between a presynaptic region and a target cell through chemical messengers. The presynaptic region releases a neurotransmitter, which crosses the synaptic cleft and binds to receptors in the postsynaptic membrane. The response depends on the receptor type, the associated channels or signalling pathways, and the state of the receiving cell. The neurotransmitter's identity alone therefore does not always determine whether the effect is excitatory, inhibitory or modulatory. This organisation introduces functional direction and a short delay compared with direct electrical communication. Understanding it separates the structure of the synapse from the specific processes of transmitter storage and release.

#### Ejemplo

- ES: La liberación vesicular puede cambiar la conductancia de la membrana postsináptica al activar receptores.
- EN: Vesicular release can change postsynaptic membrane conductance by activating receptors.

#### Fuentes específicas

- `SRC-PURVES-CHEMICAL-SYNAPSES` — [Neuroscience, 2nd edition: Chemical Synapses](https://www.ncbi.nlm.nih.gov/books/NBK11009/). Alcance: Chemical synapses, synaptic vesicles and calcium-dependent transmitter release
- `SRC-OPENSTAX-AANDP-12-5` — [Anatomy and Physiology 2e, 12.5 Communication Between Neurons](https://openstax.org/books/anatomy-and-physiology-2e/pages/12-5-communication-between-neurons). Alcance: Chemical and electrical synapses, presynaptic calcium entry and vesicular release
- `SRC-NLM-MESH-SYNAPSES` — [Medical Subject Headings: Synapses (D013569)](https://www.ncbi.nlm.nih.gov/mesh/68013569). Alcance: Synapse definition, classical chemical synapses and non-synaptic signalling caveat

#### Relaciones científicas propuestas

- `soma:R000049`: `soma:K000055` — `is_a` → `soma:K000054`. Resultado: `ready_for_editorial_approval`; inclusión propuesta: **sí**. Chemical synapse is a subtype of synapse.
- `soma:R000054`: `soma:K000060` — `occurs_in` → `soma:K000055`. Resultado: `excluded_from_first_release`; inclusión propuesta: **no**. The relation is defensible only for chemical synaptic release, while the concept definition is broader and the runtime contract drops the authored scope. Publishing the unscoped edge would conflate synaptic and non-synaptic release.

#### Conceptos relacionados

- `soma:K000047`
- `soma:K000054`
- `soma:K000058`
- `soma:K000060`

#### Advertencias y limitaciones

- The release occurs_in relation remains held for exact scope review.
- Recurso visual futuro: `realistic_anatomical` — Realistic synaptic ultrastructure with pre/post orientation, cleft, vesicles and receptors labelled.
- La ficha no ofrece interpretación clínica individual y su aprobación editorial no autoriza publicación.

### 18. Vesícula sináptica / Synaptic vesicle

- ID: `soma:K000058`
- Estado editorial propuesto: `ready_for_editorial_approval`
- Certeza declarada: `well_established_with_vesicular_scope`

#### Definición

- ES: Pequeño orgánulo membranoso presináptico que almacena neurotransmisores y participa en su liberación regulada.
- EN: A small presynaptic membrane-bound organelle that stores neurotransmitters and participates in their regulated release.

#### Explicación ampliada

- ES: Las vesículas se cargan, se organizan cerca de zonas de liberación y pueden fusionarse con la membrana presináptica. Esta ficha describe la transmisión vesicular típica y no afirma que toda señal neuronal use exactamente la misma vesícula o ruta.
- EN: Vesicles are filled, organised near release sites and can fuse with the presynaptic membrane. This card describes typical vesicular transmission and does not claim that every neuronal signal uses exactly the same vesicle or pathway.

#### Ejemplo

- ES: El aumento local de Ca2+ puede activar la maquinaria que fusiona vesículas preparadas con la membrana.
- EN: A local rise in Ca2+ can activate machinery that fuses primed vesicles with the membrane.

#### Fuentes específicas

- `SRC-PURVES-CHEMICAL-SYNAPSES` — [Neuroscience, 2nd edition: Chemical Synapses](https://www.ncbi.nlm.nih.gov/books/NBK11009/). Alcance: Chemical synapses, synaptic vesicles and calcium-dependent transmitter release
- `SRC-PURVES-RELEASE` — [Neuroscience, 2nd edition: Neurotransmitter Release and Removal](https://www.ncbi.nlm.nih.gov/books/NBK11106/). Alcance: Vesicular neurotransmitter release and removal
- `SRC-NLM-MESH-SYNAPTIC-VESICLES` — [Medical Subject Headings: Synaptic Vesicles (D013572)](https://www.ncbi.nlm.nih.gov/mesh/D013572). Alcance: Membrane-bound transmitter compartments concentrated at presynaptic terminals
- `SRC-GO-0016079` — [Gene Ontology: synaptic vesicle exocytosis (GO:0016079)](https://amigo.geneontology.org/amigo/term/GO%3A0016079). Alcance: Synaptic-vesicle fusion at the presynaptic membrane and its part-of relation to neurotransmitter secretion; candidate mapping evidence only

#### Relaciones científicas propuestas

- `soma:R000052`: `soma:K000058` — `located_in` → `soma:K000047`. Resultado: `excluded_from_first_release`; inclusión propuesta: **no**. Synaptic vesicles are concentrated at presynaptic terminals, but the authored relation is scoped specifically to presynaptic axon terminals. The current runtime relation contract cannot carry that scope, so publishing it would overgeneralise.
- `soma:R000053`: `soma:K000058` — `participates_in` → `soma:K000060`. Resultado: `ready_for_editorial_approval`; inclusión propuesta: **sí**. Synaptic vesicles participate in vesicular neurotransmitter release; participation does not assert that all release modes are vesicular.

#### Conceptos relacionados

- `soma:K000047`
- `soma:K000055`
- `soma:K000060`

#### Advertencias y limitaciones

- Location and participation relations are supported but retain their existing candidate status and scope checks.
- Recurso visual futuro: `molecular_or_structural` — Synaptic vesicle at an active zone, with membrane fusion shown as a sequence rather than a static identity.
- La ficha no ofrece interpretación clínica individual y su aprobación editorial no autoriza publicación.

### 19. Liberación de neurotransmisor / Neurotransmitter release

- ID: `soma:K000060`
- Estado editorial propuesto: `ready_for_editorial_approval`
- Certeza declarada: `well_established_with_explicit_typical_scope`

#### Definición

- ES: Proceso regulado por el que una neurona libera un mensajero químico al espacio extracelular.
- EN: A regulated process by which a neuron releases a chemical messenger into extracellular space.

#### Explicación ampliada

- ES: La liberación de neurotransmisor es el proceso regulado que pone un mensajero químico neuronal en contacto con el espacio extracelular. En la transmisión sináptica rápida típica, la despolarización presináptica abre canales de calcio dependientes de voltaje. La entrada local de Ca2+ activa proteínas que favorecen la fusión de vesículas sinápticas con la membrana y la exocitosis de su contenido hacia la hendidura. Después, el transmisor puede alcanzar receptores de la célula diana y debe eliminarse, recaptarse o degradarse para limitar la señal. Este modelo explica la liberación vesicular sináptica, pero no todas las modalidades de liberación neuronal son idénticas ni ocurren exclusivamente en una sinapsis química clásica.
- EN: Neurotransmitter release is the regulated process that brings a neuronal chemical messenger into contact with extracellular space. In typical fast synaptic transmission, presynaptic depolarisation opens voltage-gated calcium channels. Local Ca2+ entry activates proteins that promote synaptic-vesicle fusion with the membrane and exocytosis of their contents into the cleft. The transmitter can then reach receptors on the target cell and must be removed, taken up again or degraded to limit the signal. This model explains vesicular synaptic release, but not every mode of neuronal release is identical or occurs exclusively at a classical chemical synapse.

#### Ejemplo

- ES: Tras fusionarse una vesícula con la membrana presináptica, su contenido se libera hacia la hendidura sináptica.
- EN: After a vesicle fuses with the presynaptic membrane, its contents are released into the synaptic cleft.

#### Fuentes específicas

- `SRC-PURVES-CHEMICAL-SYNAPSES` — [Neuroscience, 2nd edition: Chemical Synapses](https://www.ncbi.nlm.nih.gov/books/NBK11009/). Alcance: Chemical synapses, synaptic vesicles and calcium-dependent transmitter release
- `SRC-PURVES-RELEASE` — [Neuroscience, 2nd edition: Neurotransmitter Release and Removal](https://www.ncbi.nlm.nih.gov/books/NBK11106/). Alcance: Vesicular neurotransmitter release and removal
- `SRC-OPENSTAX-AANDP-12-5` — [Anatomy and Physiology 2e, 12.5 Communication Between Neurons](https://openstax.org/books/anatomy-and-physiology-2e/pages/12-5-communication-between-neurons). Alcance: Chemical and electrical synapses, presynaptic calcium entry and vesicular release
- `SRC-GO-0007269` — [Gene Ontology: neurotransmitter secretion (GO:0007269)](https://amigo.geneontology.org/amigo/term/GO%3A0007269). Alcance: Scoped synaptic neurotransmitter secretion via calcium-regulated exocytosis; candidate mapping evidence only
- `SRC-GO-0016079` — [Gene Ontology: synaptic vesicle exocytosis (GO:0016079)](https://amigo.geneontology.org/amigo/term/GO%3A0016079). Alcance: Synaptic-vesicle fusion at the presynaptic membrane and its part-of relation to neurotransmitter secretion; candidate mapping evidence only

#### Relaciones científicas propuestas

- `soma:R000053`: `soma:K000058` — `participates_in` → `soma:K000060`. Resultado: `ready_for_editorial_approval`; inclusión propuesta: **sí**. Synaptic vesicles participate in vesicular neurotransmitter release; participation does not assert that all release modes are vesicular.
- `soma:R000054`: `soma:K000060` — `occurs_in` → `soma:K000055`. Resultado: `excluded_from_first_release`; inclusión propuesta: **no**. The relation is defensible only for chemical synaptic release, while the concept definition is broader and the runtime contract drops the authored scope. Publishing the unscoped edge would conflate synaptic and non-synaptic release.

#### Conceptos relacionados

- `soma:K000041`
- `soma:K000047`
- `soma:K000055`
- `soma:K000058`

#### Advertencias y limitaciones

- The narrative transition from action potential to release is sourced, but no direct ontology edge is added.
- Recurso visual futuro: `process_diagram` — Numbered sequence: depolarisation, calcium entry, vesicle fusion and extracellular release; non-colour-only labels.
- La ficha no ofrece interpretación clínica individual y su aprobación editorial no autoriza publicación.

## Limitaciones transversales

- `R000023` requiere decidir si `inheres_in` representa correctamente una diferencia de potencial a través de una membrana.
- `R000052` y `R000054` quedan fuera del primer lote porque el contrato runtime no conserva su `scope`.
- El salto potencial de acción → liberación de neurotransmisor se explica pedagógicamente, pero no existe una arista científica suficientemente acotada en el catálogo.
- `K000016` y `K000097` no deben añadirse solo para aparentar conectividad; requieren una revisión mecanística conjunta posterior.
- Las futuras ilustraciones necesitan revisión científica y alternativas textuales accesibles.

## Firma editorial requerida antes de publicar

- Revisión científica final de las 19 fichas.
- Revisión bilingüe ES/EN.
- Aceptación explícita de los 10 IDs de relación propuestos.
- Decisión separada sobre prerrequisitos pedagógicos.
- Identificación de la persona responsable y fecha de aprobación.
- Actualización explícita del manifiesto; nunca derivación automática desde `ready_for_editorial_approval`.
