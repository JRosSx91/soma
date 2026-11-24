# CONTENT-S00-04B — Cuántica y campos (II) y principio de equivalencia

**Proyecto:** SOMA · Centro de Expedición · Estrato 00  
**Constelaciones:** IV — Cuántica y campos (F00.23–F00.27); II — Espacio-tiempo y relatividad (F00.28)  
**Cobertura:** F00.23–F00.28  
**Estado editorial:** `candidate` · Exclusivamente DEV · Español  
**Principio editorial:** accesible e intuitivo, con ejemplos cotidianos, rigor científico y una segunda capa opcional de profundidad. Las analogías se acompañan de sus límites.

> **Instrucciones editoriales y técnicas:** conservar los textos y fórmulas. La `Introducción visible` aparece entre la pregunta y «En pocas palabras»; `Detalles` continúa la explicación sin repetir la introducción. Mantener las tres tarjetas de `Ejemplos`, sus títulos y el contenido de `Profundizar` con Markdown y KaTeX. Las conexiones narrativas son recomendaciones de lectura, no nuevas aristas. Requisitos, sucesores, estados, costes y generadores proceden de la fixture. F00.26 conserva sus tres requisitos AND (F00.06, F00.19 y F00.23); F00.28 sigue perteneciendo a la constelación II. No publicar ni modificar el grafo. Las notas de revisión y referencias finales son internas.

---

## F00.23 — Campo físico

**Pregunta de curiosidad**

¿Cómo puede un imán influir en una brújula sin llegar a tocarla?

### Introducción visible

Acerca un imán a una brújula y observa cómo cambia la orientación de su aguja. Entre ambos objetos no hay engranajes, hilos ni ninguna pieza visible que transmita el movimiento. Sin embargo, la aguja responde de manera distinta según dónde la coloques.

La física describe situaciones como esta mediante **campos**: magnitudes que tienen un valor en cada punto de una región del espacio y que pueden cambiar con el tiempo.

### En pocas palabras

**Un campo físico describe cómo se distribuye una magnitud por el espacio y el tiempo. Algunos campos, como el electromagnético, tienen dinámica propia y pueden transportar energía y momento.**

### Detalles

Imagina un mapa de temperaturas de una ciudad. Cada punto del mapa tiene asignada una temperatura. Si repites las mediciones unas horas después, obtendrás otro mapa. Matemáticamente, puedes describir toda esa información mediante un campo de temperatura.

Pero no todos los campos se describen con un único número. En un mapa de viento, también necesitas conocer hacia dónde sopla el aire. Esa información adicional permite construir un campo vectorial, en el que cada punto tiene asociadas una magnitud y una dirección.

El campo eléctrico y el magnético son ejemplos fundamentales. Una carga eléctrica puede experimentar una fuerza dependiendo del campo que encuentra y de su movimiento. No hace falta dibujar un hilo material entre las cargas para describir esa interacción.

Además, los campos electromagnéticos no son simplemente una manera cómoda de anotar fuerzas. Pueden variar, propagarse y llevar energía por regiones sin materia ordinaria. La luz que nos llega del Sol es un ejemplo de propagación electromagnética.

Conviene distinguir el mapa de temperaturas, que describe el estado de un sistema material, de un campo fundamental de la física. Ambos comparten una idea matemática, pero eso no significa que el campo electromagnético sea un fluido invisible compuesto por partículas de aire. Cuando lleguemos a la teoría cuántica de campos, descubriremos que la descripción de los campos adquiere propiedades nuevas.

### Ejemplos

**1. El pronóstico del viento**

En una aplicación meteorológica puedes ver flechas que indican cómo sopla el viento en diferentes lugares. Cada flecha representa el valor local del campo de velocidades del aire. No es una partícula ni una carretera que el aire deba seguir: es una herramienta de representación. Los diagramas de campos eléctricos y magnéticos utilizan ideas similares, aunque describan fenómenos distintos.

**2. La brújula que se orienta**

Una brújula responde al campo magnético presente donde se encuentra. Si la desplazas cerca de un imán, su orientación puede cambiar porque cambia la dirección del campo. La aguja experimenta un efecto de rotación que tiende a alinearla con el campo; no se limita a viajar por una línea magnética dibujada.

**3. Una señal que atraviesa el vacío**

Una antena puede emitir ondas electromagnéticas y otra recibirlas a distancia. Esas ondas también pueden propagarse en el vacío, como ocurre con la comunicación entre una sonda espacial y la Tierra. A diferencia del sonido ordinario, no necesitan aire ni otro medio material que vibre. La propagación electromagnética en el vacío respeta la velocidad límite de la relatividad.

### Profundizar

**Campos escalares y vectoriales**

En una descripción clásica, un campo escalar puede escribirse como:

$$
T(\mathbf{x},t)
$$

Aquí, $\mathbf{x}$ representa la posición y $t$ el instante. El resultado es un número, como una temperatura. Un campo vectorial, en cambio, puede representarse mediante tres componentes espaciales:

$$
\mathbf{E}(\mathbf{x},t)=(E_x,E_y,E_z)
$$

La dirección y las componentes dependen de cómo elegimos los ejes. Existen también campos tensoriales y otras estructuras; la métrica del espacio-tiempo es un ejemplo que ya hemos empezado a estudiar.

**La fuerza de Lorentz**

En electromagnetismo clásico, la fuerza sobre una partícula puntual de carga $q$ y velocidad $\mathbf{v}$ es:

$$
\mathbf{F}=q(\mathbf{E}+\mathbf{v}\times\mathbf{B})
$$

El campo eléctrico $\mathbf{E}$ contribuye incluso si la partícula está instantáneamente en reposo. La contribución magnética depende también del movimiento y es perpendicular a la velocidad. Por sí sola, esta fuerza magnética no realiza trabajo sobre la partícula puntual.

**La energía de un campo**

En electromagnetismo clásico, en el vacío y en unidades del Sistema Internacional, la densidad de energía es:

$$
u=\frac{\epsilon_0}{2}|\mathbf{E}|^2+\frac{1}{2\mu_0}|\mathbf{B}|^2
$$

Aquí, $u$ es energía por unidad de volumen, y $\epsilon_0$ y $\mu_0$ son las constantes eléctricas y magnéticas del vacío. Una onda electromagnética puede transportar energía incluso donde no existe materia ordinaria.

**Del campo clásico al cuántico**

Un campo clásico tiene valores descritos por funciones. En teoría cuántica de campos, los campos se representan mediante estructuras de operadores y sus estados cuánticos. No basta con asignar a cada punto una pequeña vibración clásica de valor desconocido.

### Conexión narrativa

Ya tenemos una forma de describir lo que sucede en distintas regiones del espacio. Ahora podemos preguntarnos cómo se afectan mutuamente los sistemas físicos en **F00.24 — Interacción**, y cómo cambia nuestra descripción de los campos cuando incorporamos la física cuántica en **F00.25 — Teoría cuántica de campos**.

---

## F00.24 — Interacción

**Pregunta de curiosidad**

¿Por qué una misma naturaleza puede mantener unidos los átomos, hacer brillar las estrellas y transformar unas partículas en otras?

### Introducción visible

Cuando apoyas la mano sobre una mesa, sus átomos no atraviesan libremente los de tu piel. Cuando el Sol mantiene a la Tierra en órbita, ni siquiera necesita tocarla. Y dentro de las estrellas ocurren procesos en los que algunas partículas se transforman.

Estos fenómenos nos hablan de **interacciones físicas**: formas en las que unos sistemas afectan a otros, modificando su movimiento, su estado o las posibilidades de transformación.

### En pocas palabras

**Una interacción es una influencia física entre sistemas. El Modelo Estándar describe las interacciones electromagnética, fuerte y débil; la gravitación se describe con gran éxito mediante la relatividad general.**

### Detalles

A veces identificamos una interacción con una fuerza: empujar una caja cambia su movimiento. Pero el concepto es más amplio. Una interacción también puede participar en una transformación de partículas, una emisión de luz o un intercambio de energía y momento.

El electromagnetismo desempeña un papel central en la estructura atómica, la química, la electricidad y los fenómenos luminosos. Incluso la resistencia de una mesa a dejar pasar tu mano requiere combinar la física electromagnética con propiedades cuánticas de la materia, entre ellas el principio de exclusión de Pauli.

La interacción fuerte gobierna la dinámica de los quarks y gluones. Sus efectos también permiten comprender por qué muchos protones y neutrones pueden permanecer unidos en los núcleos. No se trata simplemente de un pegamento clásico: el comportamiento de la interacción fuerte cambia notablemente con la escala a la que se investiga.

La interacción débil interviene en procesos como la desintegración beta y permite ciertas transformaciones de partículas. La gravedad, por su parte, resulta decisiva en fenómenos astronómicos y cosmológicos y posee una descripción geométrica muy precisa mediante la relatividad general.

La física de partículas describe las tres primeras mediante teorías cuánticas de campos. Hablar de bosones mediadores es útil, pero la imagen de dos bolitas lanzándose otras bolitas no reproduce fielmente todos los procesos. Las interacciones se calculan mediante reglas cuánticas, y las partículas virtuales que aparecen en algunos cálculos no son proyectiles observables directamente.

### Ejemplos

**1. El imán y la puerta de la nevera**

La atracción de un imán por ciertos materiales se explica mediante el electromagnetismo y el comportamiento cuántico colectivo de sus componentes. El imán no crea una quinta fuerza especial para la nevera: estamos viendo un fenómeno macroscópico que emerge de la física microscópica.

**2. El interior de un núcleo**

Dos protones tienen carga eléctrica positiva y experimentan repulsión electromagnética. Aun así, muchos núcleos contienen varios protones. La interacción nuclear entre protones y neutrones, que surge de la dinámica fuerte subyacente, contribuye a que puedan permanecer ligados. No cualquier combinación forma un núcleo estable.

**3. Una transformación en el Sol**

En la cadena protón-protón del Sol, un proceso de interacción débil permite que dos protones den lugar a un núcleo de deuterio, un positrón y un neutrino electrónico. Intervienen también otros procesos físicos. La lentitud de ese paso débil contribuye a determinar el ritmo de la fusión en estrellas como el Sol.

### Profundizar

**Interacciones y mediadores en el Modelo Estándar**

- Electromagnetismo: el fotón está asociado al campo electromagnético.
- Interacción fuerte: los gluones están asociados a la dinámica de la carga de color de la cromodinámica cuántica.
- Interacción débil: intervienen los bosones $W^+$, $W^-$ y $Z^0$.

El campo de Higgs también participa en interacciones del Modelo Estándar. Su bosón no debe confundirse con un mediador de la gravedad. La mayor parte de la masa de protones y neutrones no se explica sumando únicamente las masas de sus quarks elementales.

**Una descripción clásica y sus límites**

Para dos cargas puntuales en reposo, separadas una distancia $r$ en el vacío, la magnitud de la fuerza electrostática cumple:

$$
F=\frac{1}{4\pi\epsilon_0}\frac{|q_1q_2|}{r^2}
$$

Esta expresión no describe por sí sola la radiación, la creación de partículas o todos los efectos cuánticos. Es una aproximación útil en su régimen correspondiente.

**Conservar no significa que nada cambie**

En una interacción, el momento de cada participante puede cambiar. Para un sistema aislado en un marco inercial, con todos los participantes relevantes incluidos, el momento total se conserva:

$$
\sum_i\mathbf{p}_{i,\mathrm{inicial}}=\sum_j\mathbf{p}_{j,\mathrm{final}}
$$

Si intervienen radiación o campos que transportan momento, también hay que incluir sus contribuciones. Las leyes de conservación permiten descartar muchas transformaciones que no serían físicamente posibles.

**¿Existe una descripción común de todas las interacciones?**

El Modelo Estándar reúne la interacción electromagnética y la débil en una estructura electrodébil y describe también la interacción fuerte mediante la cromodinámica cuántica. No incorpora una teoría cuántica fundamental de la gravedad. Las propuestas de unificación más amplias siguen siendo objeto de investigación.

### Conexión narrativa

Hemos aprendido que las interacciones no son simplemente contactos mecánicos. Para describirlas a escala subatómica necesitaremos combinar relatividad especial, estados cuánticos y campos. Esa combinación nos lleva a **F00.25 — Teoría cuántica de campos**.

---

## F00.25 — Teoría cuántica de campos

**Pregunta de curiosidad**

¿Y si un electrón no fuera una pequeña esfera independiente, sino una excitación de un campo cuántico?

### Introducción visible

Imagina una guitarra. Una misma cuerda puede producir distintas notas según cómo la hagas vibrar. La nota no es una bolita añadida a la cuerda: surge de un estado de vibración de un sistema que ya estaba allí.

La analogía nos acerca a una idea de la **teoría cuántica de campos**: en muchas situaciones, las partículas pueden describirse como excitaciones cuantizadas de campos. La semejanza es conceptual; los campos cuánticos no son cuerdas materiales ni necesitan un soporte mecánico.

### En pocas palabras

**La teoría cuántica de campos combina la física cuántica y los campos con la relatividad especial. En ella, muchas partículas se describen como excitaciones de campos cuánticos, y las interacciones pueden crear, transformar o aniquilar partículas bajo reglas precisas.**

### Detalles

En mecánica cuántica elemental podemos estudiar, por ejemplo, el estado de un electrón que permanece dentro de un sistema. Sin embargo, existen fenómenos en los que el número de partículas cambia. Una descripción que obligara a conservar siempre el mismo número de partículas no sería suficiente.

La teoría cuántica de campos ofrece un marco para estudiar esos procesos. En la descripción usual de partículas libres, el fotón está asociado al campo electromagnético cuantizado y los electrones y positrones al campo electrónico. Los quarks y otros componentes del Modelo Estándar también tienen sus campos correspondientes. No se trata de campos clásicos que contienen pequeñas bolitas escondidas.

Los campos cuánticos pueden interactuar. En determinadas condiciones, dos partículas pueden dar lugar a otras o transferir energía entre diferentes grados de libertad. Las transformaciones deben respetar las leyes de conservación pertinentes, como las de energía, momento y carga eléctrica.

El vacío de una teoría cuántica de campos es un estado físico de referencia, normalmente el estado de menor energía para un sistema apropiado. No equivale a una ausencia absoluta de estructura. Sus propiedades pueden diferir de las que tendría un vacío clásico, pero eso no autoriza a imaginarlo como un depósito ilimitado de energía aprovechable ni como una espuma de bolitas que toman prestada energía.

La imagen de una partícula como una excitación es una puerta de entrada muy útil, especialmente al estudiar campos libres y estados de partículas en experimentos. No agota todas las situaciones: los estados ligados, el confinamiento de quarks y las teorías sobre espacio-tiempo curvo requieren matices. Aun así, este marco es la base del Modelo Estándar, una de las construcciones científicas más exitosas que tenemos.

### Ejemplos

**1. Una guitarra con muchas maneras de vibrar**

Una cuerda musical tiene modos de vibración característicos. En un campo cuántico libre, determinados modos pueden tratarse matemáticamente mediante osciladores cuantizados. La analogía ayuda a comprender la idea de excitaciones, pero una guitarra es un objeto material clásico y sus notas no constituyen partículas elementales. Tampoco debemos confundir la amplitud clásica de una onda con el número de cuantos.

**2. Una luz que entrega energía**

Una fuente luminosa puede preparar estados del campo electromagnético en los que un detector registra fotones. Un fotón de frecuencia definida tiene energía relacionada con esa frecuencia. Un haz luminoso cotidiano no tiene por qué estar en un estado de número exacto de fotones: la teoría también permite describir otras clases de estados de la luz.

**3. Un encuentro entre materia y antimateria**

Un electrón y un positrón pueden aniquilarse y producir fotones. En un proceso de aniquilación aproximadamente en reposo, un resultado habitual permitido es la emisión de dos fotones que salen en sentidos opuestos. La energía y el momento no desaparecen: se redistribuyen. No se transforma materia en una sustancia misteriosa llamada energía; cambian los estados y las partículas presentes en el sistema.

### Profundizar

**La idea de cuantos de un modo**

Para ilustrar el caso sencillo de un modo bosónico libre de frecuencia angular $\omega$, podemos representar sus estados de ocupación como $|n\rangle$, con $n=0,1,2,\ldots$. Su energía idealizada sigue la estructura del oscilador armónico cuántico:

$$
E_n=\hbar\omega\left(n+\frac12\right)
$$

La diferencia de energía entre niveles consecutivos es $\hbar\omega$. Este modelo no describe directamente todos los campos: los modos fermiónicos, por ejemplo, tienen reglas de ocupación diferentes.

**Crear y destruir excitaciones**

En el mismo modelo bosónico, los operadores de creación y aniquilación actúan sobre los estados de número de la siguiente forma:

$$
a^\dagger|n\rangle=\sqrt{n+1}|n+1\rangle
$$

$$
a|n\rangle=\sqrt n|n-1\rangle
$$

La segunda expresión se aplica para $n\geq1$; el operador de aniquilación aplicado al vacío del modo da cero. Estos son operadores matemáticos, no máquinas que crean materia de la nada. Los procesos físicos requieren dinámicas e interacciones compatibles con sus restricciones.

**Un ejemplo de campo relativista**

Para un campo escalar real libre de masa $m$, en espacio-tiempo plano, la ecuación clásica de Klein-Gordon puede escribirse en unidades naturales ($\hbar=c=1$), usando la convención de signos $(+---)$, como:

$$
(\partial_t^2-\nabla^2+m^2)\phi=0
$$

Al cuantizar el campo aparece una estructura de estados y operadores. Esta ecuación es un ejemplo introductorio, no la ecuación del electrón ni una descripción completa del Modelo Estándar. Los campos fermiónicos y gauge poseen sus propias estructuras.

**La relación entre energía y momento**

Para una partícula libre de masa invariante $m$, en un marco inercial:

$$
E^2=p^2c^2+m^2c^4
$$

Esta relación conecta el lenguaje relativista de partículas con los modos de campos libres. Las partículas sin masa satisfacen $E=pc$ para energía positiva y magnitud del momento $p$.

**Una teoría extraordinariamente útil, no una respuesta a todo**

Las teorías cuánticas de campos permiten calcular probabilidades de procesos y contrastarlas con observaciones. El Modelo Estándar usa ese marco para describir las partículas elementales conocidas y tres interacciones fundamentales. No constituye una explicación cuántica fundamental confirmada de la gravedad, ni resuelve por sí solo la naturaleza de la materia oscura.

### Conexión narrativa

Tenemos ya un nuevo lenguaje para hablar de la materia. Al cruzar **F00.26 — Hacia el mundo subatómico**, lo aplicaremos a las propiedades y transformaciones de las partículas elementales. Y en **F00.27 — Gravedad cuántica** veremos por qué extenderlo a la geometría del universo plantea preguntas todavía abiertas.

---
## F00.26 — Hacia el mundo subatómico

**Pregunta de curiosidad**

¿Qué tienen en común la luz de una estrella, el agua que bebes y las señales eléctricas de tu cerebro cuando miramos la realidad a escalas cada vez menores?

### Introducción visible

Has recorrido una región del conocimiento en la que las distancias y las duraciones dejaron de ser absolutas, las simetrías revelaron leyes de conservación y las partículas dejaron de parecer simples bolitas con trayectorias perfectamente definidas.

Ahora vamos a utilizar esas ideas para explorar el mundo subatómico. No es otro universo separado del nuestro: es una escala de descripción que nos ayudará a comprender la materia de la que estamos hechos.

### En pocas palabras

**La física subatómica estudia la estructura, las propiedades y las interacciones de sistemas más pequeños que los átomos. La relatividad especial, los estados cuánticos y los campos proporcionan herramientas esenciales para explorarla.**

### Detalles

Si observas una gota de agua, no puedes distinguir a simple vista las moléculas que contiene. Tampoco podrías reconocer directamente, mirando una molécula, todas las propiedades de los átomos que la componen. Cambiar de escala significa desarrollar herramientas nuevas y aprender a formular preguntas diferentes.

Un átomo contiene electrones y un núcleo. En los núcleos ordinarios encontramos protones y, salvo casos como el núcleo del hidrógeno más común, neutrones. Los protones y neutrones son sistemas compuestos cuya estructura se estudia mediante quarks y gluones, junto con su dinámica. El electrón, en cambio, se considera elemental en el Modelo Estándar y no se le conoce una estructura interna.

En nuestra siguiente expedición aparecerán otros componentes fundamentales, como los neutrinos, los fotones y las partículas asociadas a las interacciones. Descubriremos por qué propiedades como la carga y el espín importan tanto, y por qué no todas las partículas pueden agruparse de la misma manera.

El camino hacia lo pequeño no consiste únicamente en construir un microscopio más potente. En física de partículas se realizan experimentos que permiten inferir propiedades a partir de interacciones, colisiones, depósitos de energía y distribuciones de resultados. A veces las partículas estudiadas desaparecen antes de alcanzar un detector y solo podemos reconstruir las huellas de sus productos de desintegración.

Y no olvides algo: conocer los componentes de un organismo no equivale a comprender automáticamente cómo funciona. Las moléculas, las células y los tejidos requieren conceptos propios. Las escalas superiores no son una simple lista de partículas. En SOMA iremos construyendo esos puentes, sin saltarnos las preguntas que hacen interesante cada nivel.

### Ejemplos

**1. De una gota de agua al interior de un protón**

Una gota contiene una enorme cantidad de moléculas. Cada molécula de agua tiene dos átomos de hidrógeno y uno de oxígeno, y estos contienen electrones y núcleos. Los protones de esos núcleos poseen estructura interna. Cada paso nos obliga a cambiar nuestra descripción; la geometría de una molécula no es la geometría de un protón ampliada.

**2. Una huella invisible que deja de ser invisible**

Una partícula cargada puede dejar señales al atravesar un detector. Si existe un campo magnético apropiado, la curvatura de su trayectoria aporta información sobre su momento y el signo de su carga. Combinando distintos tipos de señales, los investigadores reconstruyen los acontecimientos. No necesitan una fotografía directa de la partícula como si fuera un grano de arena.

**3. De los electrones a una señal nerviosa**

Las moléculas de tu organismo contienen electrones y núcleos que participan en interacciones electromagnéticas. Esa física ayuda a explicar la existencia de enlaces químicos. Pero para comprender cómo una neurona transmite una señal también necesitamos estudiar membranas, canales iónicos y gradientes electroquímicos. La expedición irá conectando esas escalas sin sustituir una explicación por otra.

### Profundizar

**¿Qué significa resolver una estructura más pequeña?**

Una de las pistas que relacionan el momento de una partícula con su comportamiento ondulatorio es la longitud de onda de De Broglie:

$$
\lambda=\frac{h}{p}
$$

Aquí, $h$ es la constante de Planck y $p$ la magnitud del momento. En experimentos adecuados, momentos mayores permiten investigar estructuras a escalas más pequeñas. La resolución efectiva depende del proceso de dispersión, de la transferencia de momento y de las características del instrumento: no es una garantía automática basada en una única longitud de onda.

**El tamaño no es lo mismo que la masa**

Un átomo ordinario tiene una escala de extensión característica de alrededor de $10^{-10}\,\mathrm{m}$, mientras que las dimensiones de muchos núcleos se sitúan en la escala de los femtómetros ($10^{-15}\,\mathrm{m}$). Son órdenes de magnitud, no radios universales ni límites rígidos para objetos cuánticos.

Un protón no es tres esferas que ocupan posiciones fijas. Su estructura incluye la dinámica de quarks y gluones; sus propiedades, incluida gran parte de su masa, están relacionadas con la física de esa estructura. Estudiaremos esta cuestión más adelante.

**Qué sabemos y qué falta**

El Modelo Estándar organiza las partículas elementales conocidas y sus interacciones no gravitatorias con gran éxito experimental. No conocemos todavía una explicación completa de la materia oscura ni una teoría cuántica fundamental de la gravedad confirmada. Cruzar esta puerta no exige que hayamos resuelto esos problemas, sino que dispongamos de un lenguaje para seguir investigando.

### Conexión narrativa

Has llegado al umbral de la siguiente expedición: **Estrato 01 — Partículas elementales e interacciones**. Tu siguiente destino será descubrir cómo se organizan los componentes fundamentales de la materia y qué propiedades distinguen unos de otros. Las preguntas abiertas de este estrato, como la gravedad cuántica, siguen disponibles para explorar. No todas las rutas del conocimiento tienen que recorrerse en el mismo orden.

---

## F00.27 — Gravedad cuántica

**Pregunta de curiosidad**

Si la materia obedece reglas cuánticas y la gravedad está relacionada con la geometría del espacio-tiempo, ¿qué ocurre cuando ambas descripciones deben funcionar a la vez?

### Introducción visible

Imagina que dispones de dos mapas extraordinariamente precisos: uno explica el movimiento de los planetas y la estructura del cosmos; el otro describe las propiedades y transformaciones de la materia microscópica. Cada uno funciona muy bien en su ámbito, pero existen regiones donde necesitamos utilizar los dos.

La **gravedad cuántica** investiga cómo incorporar los principios cuánticos a la descripción gravitatoria. Todavía no contamos con una teoría fundamental completa cuya validez haya sido establecida experimentalmente.

### En pocas palabras

**La gravedad cuántica busca comprender la gravitación cuando los efectos cuánticos son relevantes. Existen aproximaciones útiles y propuestas de teorías fundamentales, pero ninguna solución completa está confirmada experimentalmente.**

### Detalles

En relatividad general, la distribución de materia y energía está relacionada con la geometría del espacio-tiempo. Esa geometría no es un escenario rígido: puede evolucionar y participar en fenómenos como las ondas gravitatorias.

En muchas teorías cuánticas de campos, en cambio, partimos de una estructura espacio-temporal sobre la que definimos los campos. Esto funciona extraordinariamente bien en numerosos experimentos. La dificultad aparece cuando necesitamos que la propia geometría entre en la descripción cuántica, sin tratarla únicamente como un fondo clásico prefijado.

Es posible estudiar campos cuánticos en geometrías clásicas curvas. También podemos formular la relatividad general como una teoría cuántica efectiva a bajas energías. Estos enfoques producen resultados teóricos útiles dentro de sus límites; no resuelven por sí solos todas las preguntas que surgen en regímenes extremos.

Algunas líneas de investigación buscan describir las partículas y la gravedad mediante estructuras extendidas, como las cuerdas. Otras intentan cuantizar directamente estructuras geométricas, como hace la gravedad cuántica de bucles. Existen más propuestas y no disponemos de evidencia experimental decisiva que permita establecer una de ellas como descripción definitiva de la naturaleza.

Conviene distinguir entre una dificultad de nuestras teorías y una propiedad demostrada del universo. Que ciertas ecuaciones produzcan singularidades en determinadas soluciones no significa que hayamos observado físicamente una densidad infinita. Que podamos construir una escala de longitud de Planck tampoco demuestra que el espacio esté compuesto por píxeles. La investigación comienza precisamente donde las respuestas dejan de ser claras.

### Ejemplos

**1. Dos mapas con escalas distintas**

Un plano de una ciudad resulta muy útil para orientarte, mientras que el plano eléctrico de un edificio permite reparar su instalación. Ambos describen aspectos reales, pero ninguno responde a todas las preguntas del otro. Esta analogía muestra por qué una teoría puede funcionar muy bien en cierto régimen y necesitar una descripción más amplia en otro. No significa que las diferencias entre relatividad y teoría cuántica sean solo un problema de escala gráfica.

**2. Un agujero negro que no podemos describir por completo**

La relatividad general permite describir agujeros negros y predecir muchas de sus propiedades. La teoría cuántica de campos sobre espacio-tiempo curvo permite además predecir la radiación de Hawking. Esta última es una predicción teórica, no una detección directa confirmada de radiación de un agujero negro astrofísico. Las preguntas sobre su evaporación final y la información cuántica motivan la búsqueda de una descripción más profunda.

**3. Retroceder hacia el universo temprano**

Al reconstruir la evolución cosmológica hacia condiciones de mayor temperatura y densidad, podemos alcanzar regímenes en los que las aproximaciones actuales dejan de ser suficientes. Una teoría de gravedad cuántica podría modificar esa descripción. Todavía no podemos afirmar que la física haya demostrado un comienzo absoluto, un rebote anterior o una estructura discreta del espacio-tiempo.

### Profundizar

**La escala de Planck**

Podemos combinar la constante gravitatoria $G$, la constante reducida de Planck $\hbar$ y la velocidad de la luz $c$ para construir una longitud natural:

$$
\ell_P=\sqrt{\frac{\hbar G}{c^3}}\approx1.62\times10^{-35}\,\mathrm{m}
$$

Y una escala de energía:

$$
E_P=\sqrt{\frac{\hbar c^5}{G}}
$$

Estas cantidades señalan escalas naturales en las que esperamos que determinadas aproximaciones gravitatorias y cuánticas requieran especial cuidado. La longitud de Planck no constituye una medida experimental de un tamaño mínimo del espacio. Tampoco significa que todos los efectos de gravedad cuántica sean posibles exclusivamente a esa longitud.

**Una geometría con pequeñas perturbaciones**

En determinados problemas de campo débil se puede escribir una métrica como la suma de una métrica plana de referencia y una pequeña perturbación:

$$
g_{\mu\nu}=\eta_{\mu\nu}+h_{\mu\nu}
$$

Aquí, $\eta_{\mu\nu}$ es la métrica de Minkowski y $h_{\mu\nu}$ describe una perturbación pequeña dentro del régimen escogido. La cuantización perturbativa de los modos gravitatorios conduce al concepto de gravitón, una excitación hipotética de espín 2 sin masa en la formulación usual. No se ha confirmado la detección de gravitones individuales. Esta separación tampoco es una descripción general de toda geometría posible.

**Una teoría efectiva frente a una teoría fundamental**

Una teoría efectiva describe fenómenos dentro de un régimen de energías y escalas determinado. En ese sentido, la relatividad general puede recibir un tratamiento cuántico efectivo que permite organizar correcciones a bajas energías. Al salir de ese régimen necesitamos más información: extrapolar las primeras correcciones hasta energías arbitrariamente grandes no proporciona una teoría fundamental completa.

**Cómo reconocer una propuesta científica**

Una formulación matemática elegante no basta para demostrar que describe nuestro universo. Debe ser coherente, recuperar las predicciones bien contrastadas en los regímenes adecuados y ofrecer formas de distinguir sus consecuencias de las de otras propuestas. Algunas de esas pruebas resultan extremadamente difíciles. La ausencia de una confirmación decisiva no convierte todas las propuestas en equivalentes, pero obliga a distinguir hipótesis, resultados matemáticos y evidencias experimentales.

### Conexión narrativa

La gravedad cuántica representa una frontera abierta de nuestra expedición. No necesitamos resolverla para estudiar las partículas conocidas en el **Estrato 01**. Si quieres explorar por qué la gravedad posee un carácter geométrico tan especial, regresa a **F00.08 — Relatividad general**, **F00.09 — Geometría del espacio-tiempo** y **F00.28 — Principio de equivalencia**.

---

## F00.28 — Principio de equivalencia

**Pregunta de curiosidad**

Si estuvieras dentro de un ascensor cerrado, ¿podrías distinguir siempre entre sentir la gravedad y estar siendo acelerado?

### Introducción visible

Imagina una cabina sin ventanas en una nave espacial, lejos de estrellas y planetas. Si la nave acelera, el suelo presiona tus pies y un objeto que sueltes parece caer hacia él. La experiencia puede parecerse mucho a estar de pie sobre la Tierra.

Esta semejanza, dentro de una región suficientemente pequeña, nos acerca al **principio de equivalencia**. Es una de las ideas que permitieron a Einstein transformar nuestra comprensión de la gravitación.

### En pocas palabras

**En un laboratorio suficientemente pequeño en caída libre, los efectos gravitatorios locales pueden desaparecer de la descripción de las leyes físicas no gravitatorias. Esto no elimina la curvatura ni los efectos de marea, que permiten distinguir situaciones a mayor escala.**

### Detalles

Cuando estás de pie sobre la Tierra, sientes el suelo sosteniéndote. La sensación de peso no se explica únicamente porque la Tierra ejerza influencia gravitatoria: también depende de la fuerza de apoyo que impide que tu cuerpo siga una trayectoria de caída libre.

Si tú y la cabina estuvierais en caída libre, los objetos cercanos que hubieras soltado permanecerían aproximadamente a tu lado, siempre que sus movimientos relativos iniciales y las diferencias gravitatorias fueran suficientemente pequeños. Dentro de esa región se parecería a flotar en una nave sin aceleración y lejos de fuentes gravitatorias relevantes.

El experimento mental del ascensor tiene dos caras: una cabina acelerada puede reproducir localmente efectos semejantes a los de un laboratorio sostenido en un campo gravitatorio, y una cabina en caída libre puede eliminar localmente esos efectos de peso. Esta equivalencia es una pista sobre cómo describir la gravedad, no una afirmación de que aceleración y curvatura sean idénticas en todas las situaciones.

¿Qué sucede si amplías mucho el ascensor? Dos objetos que caen hacia la Tierra desde lugares separados no siguen trayectorias perfectamente paralelas: pueden acercarse entre sí mientras caen. Esas diferencias en el movimiento de cuerpos libres son efectos de marea. Un laboratorio suficientemente grande y preciso puede detectarlas.

La relatividad general distingue la posibilidad de elegir un sistema local de caída libre de la existencia de curvatura del espacio-tiempo. Podemos elegir coordenadas que simplifiquen la descripción gravitatoria alrededor de un acontecimiento, pero no hacer desaparecer una curvatura real mediante un simple cambio de coordenadas.

### Ejemplos

**1. El ascensor y la báscula**

Si un ascensor acelera hacia arriba, una báscula puede indicar un peso aparente mayor. Si acelera hacia abajo, puede indicar uno menor. Al detener su aceleración, la lectura vuelve al valor habitual en condiciones normales. El instrumento responde a la fuerza de apoyo, no mide directamente toda la geometría del espacio-tiempo. Este es un ejemplo conceptual; no hace falta realizar ninguna maniobra peligrosa para comprenderlo.

**2. Una tripulación que flota en órbita**

Los astronautas de una estación orbital flotan no porque la gravedad terrestre haya desaparecido, sino porque la estación y sus ocupantes están en caída libre aproximadamente conjunta. La velocidad orbital hace que su trayectoria rodee la Tierra. Las pequeñas aceleraciones residuales y los efectos de marea explican por qué hablamos de microgravedad y no de una ausencia perfecta de gravedad.

**3. Dos objetos que caen en el vacío**

Si dejamos caer simultáneamente un objeto ligero y uno pesado desde el mismo lugar, con las mismas condiciones iniciales y sin resistencia del aire, ambos siguen la misma caída en la aproximación de cuerpos de prueba. Experimentos de alta precisión comparan objetos de distinta composición para comprobar esa universalidad. En un entorno real hay que controlar otras fuerzas y posibles diferencias experimentales.

### Profundizar

**Masa inercial y masa gravitatoria**

En una descripción newtoniana sencilla, si distinguimos la masa inercial $m_i$ de la masa gravitatoria pasiva $m_g$, un cuerpo de prueba situado en un campo gravitatorio $\mathbf{g}$ experimentaría:

$$
m_i\mathbf{a}=m_g\mathbf{g}
$$

Por tanto:

$$
\mathbf{a}=\frac{m_g}{m_i}\mathbf{g}
$$

Si la relación entre ambas masas es universal, los cuerpos de prueba comparten la misma aceleración bajo iguales condiciones. Con la normalización habitual identificamos ambas masas en esta descripción. La universalidad de la caída libre constituye el núcleo del principio de equivalencia débil; la formulación de Einstein incluye además otros requisitos sobre experimentos locales no gravitatorios.

**Qué mide una báscula**

Para un ascensor en un campo gravitatorio aproximadamente uniforme de magnitud $g$, y tomando la dirección ascendente como positiva, una persona de masa $m$ que permanece sobre la báscula experimenta una fuerza normal:

$$
N=m(g+a)
$$

Aquí, $a$ es la componente vertical de la aceleración del ascensor. Cuando $a=0$, la lectura corresponde al peso habitual; si $a=-g$ en una caída libre ideal, $N=0$. La expresión presupone que la persona y el suelo comparten el movimiento, y que no intervienen otras fuerzas relevantes. Una lectura nula no implica que la curvatura gravitatoria del entorno sea nula.

**Un marco local de caída libre**

En relatividad general, alrededor de un acontecimiento de un espacio-tiempo suficientemente regular podemos elegir coordenadas localmente inerciales. En ellas, la métrica toma en ese acontecimiento la forma de Minkowski y sus primeras derivadas pueden anularse:

$$
g_{\mu\nu}(P)=\eta_{\mu\nu}
$$

$$
\partial_\alpha g_{\mu\nu}(P)=0
$$

Esto no obliga al tensor de curvatura a desaparecer. Las diferencias entre trayectorias de caída libre vecinas pueden revelar esa curvatura. Para extender esta aproximación a un laboratorio real importa su tamaño y duración en relación con las escalas de variación de la geometría.

**No todos los principios de equivalencia son idénticos**

En física se distinguen distintas formulaciones. El principio débil se refiere a la universalidad de la caída libre de cuerpos de prueba. El principio de equivalencia de Einstein añade que los resultados de experimentos locales no gravitatorios no dependen de la velocidad del laboratorio en caída libre ni de dónde o cuándo se realizan, en las condiciones correspondientes. El principio fuerte amplía estas ideas a experimentos gravitatorios y cuerpos con autogravitación relevante. No son afirmaciones intercambiables y las pruebas de una no verifican automáticamente todas las demás.

### Conexión narrativa

Este descubrimiento completa una pieza de la región de relatividad: une la intuición de **F00.07 — Gravitación** con el tratamiento geométrico de **F00.08 — Relatividad general** y **F00.09 — Geometría del espacio-tiempo**. Es también una invitación a volver a las preguntas de **F00.27 — Gravedad cuántica**: ¿cómo describiremos una geometría que también deba obedecer principios cuánticos?

---

## Notas de revisión científica y editorial (no mostrar en las fichas)

1. **F00.23:** distinguir campo clásico escalar/vectorial, campos fundamentales y operadores cuánticos. Revisar notación vectorial, unidades SI de la densidad de energía y alcance de la fuerza de Lorentz. Las líneas de campo no son filamentos físicos.
2. **F00.24:** revisar el ejemplo de fusión protón-protón, el papel de la interacción nuclear residual y la contribución de Pauli a la estructura de la materia. Los diagramas de mediadores no deben sugerir bolitas virtuales observables. No incluir gravedad en el Modelo Estándar ni atribuir toda la masa de la materia al Higgs.
3. **F00.25:** restringir la analogía del oscilador a modos bosónicos libres; no confundir estados de número con ondas clásicas ni considerar el vacío una fuente de energía gratuita. Revisar las condiciones de la aniquilación electrón-positrón, la convención (+---), las unidades naturales de Klein-Gordon y el papel de la interpretación de partículas en teorías interactuantes. Distinguir fotones de estados clásicos de luz.
4. **F00.26:** puerta narrativa, no nueva ley física ni afirmación de que el Estrato 01 ya esté implementado. Las escalas atómicas y nucleares son orientativas; la resolución experimental depende también de la transferencia de momento. Mantener los tres padres jugables F00.06, F00.19 y F00.23 y el coste real. F00.25 y F00.27 son lecturas opcionales, no requisitos adicionales.
5. **F00.27:** distinguir teoría cuántica de campos en geometría curva, gravedad cuántica efectiva y propuestas de completitud fundamental. No presentar cuerdas, bucles, gravitones, rebotes o discretización del espacio-tiempo como resultados experimentales establecidos. Revisar la notación de Planck, el régimen perturbativo y la situación experimental de radiación de Hawking antes de publicar.
6. **F00.28:** mantener la equivalencia local y distinguir principio débil, de Einstein y fuerte; revisar las condiciones de cuerpos de prueba, fuerzas de apoyo, coordenadas localmente inerciales y efectos de marea. La ficha pertenece a la constelación II y no cambia su prerrequisito jugable (F00.07).
7. **Conexiones narrativas:** son recomendaciones editoriales, no dependencias jugables. No modificar los 28 conceptos, la economía ni la topología del mapa a partir del texto.
8. **Estado editorial:** candidato en español; no constituye aprobación científica final ni autorización de publicación. La traducción inglesa debe revisarse editorialmente. Las ilustraciones deben identificarse como conceptuales cuando proceda y no reforzar analogías físicamente incorrectas.

## Referencias para revisión editorial

- F00.23: OpenStax, *University Physics Volume 2*, «Electric Field». https://openstax.org/books/university-physics-volume-2/pages/5-4-electric-field
- F00.23: OpenStax, *University Physics Volume 2*, «Electric Field Lines». https://openstax.org/books/university-physics-volume-2/pages/5-6-electric-field-lines
- F00.24–F00.26: CERN, «The Standard Model». https://home.web.cern.ch/science/physics/standard-model
- F00.24–F00.25: CERN CMS, «What is the electroweak force?». https://cms.cern/news/what-is-the-electroweak-force/
- F00.25: Stanford Encyclopedia of Philosophy, «Quantum Field Theory». https://plato.stanford.edu/entries/quantum-field-theory/
- F00.26: CERN, «How a detector works». https://home.cern/science/experiments/how-detector-works/
- F00.26: OpenStax, *University Physics Volume 3*, ondas de materia y física de partículas. https://openstax.org/books/university-physics-volume-3
- F00.27: Einstein Online (Max Planck Institute for Gravitational Physics), «Quantum gravity». https://www.einstein-online.info/en/explandict/quantum-gravity/
- F00.27: Einstein Online, «Planck length». https://www.einstein-online.info/en/explandict/planck-length/
- F00.27: Einstein Online, «Relativity and the Quantum». https://www.einstein-online.info/en/spotlights/quantum/
- F00.27: J. F. Donoghue, «General relativity as an effective field theory: The leading quantum corrections», *Physical Review D* 50, 3874 (1994). https://doi.org/10.1103/PhysRevD.50.3874
- F00.28: Einstein Online, «The elevator, the rocket, and gravity: the equivalence principle». https://www.einstein-online.info/en/spotlight/equivalence_principle/
- F00.28: ESA, «Space Microscope to test universality of freefall». https://www.esa.int/Science_Exploration/Space_Science/Space_Microscope_to_test_universality_of_freefall

Estas referencias sirven para trazabilidad y revisión conceptual; no certifican una validación independiente de cada párrafo.
