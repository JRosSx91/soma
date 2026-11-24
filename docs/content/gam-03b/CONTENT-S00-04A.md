# CONTENT-S00-04A — Cuántica y campos (I)

**Proyecto:** SOMA · Centro de Expedición · Estrato 00  
**Constelación:** IV — Cuántica y campos  
**Cobertura:** F00.18–F00.22  
**Estado editorial:** `candidate` · Exclusivamente DEV · Español  
**Principio editorial:** accesible e intuitivo, con ejemplos cotidianos, rigor científico y una segunda capa opcional de profundidad. Las analogías se acompañan de sus límites.

> **Instrucciones editoriales y técnicas:** Conservar todos los párrafos y expresiones de las fichas. `Introducción visible` debe aparecer entre la pregunta y «En pocas palabras»; `Detalles` continúa la explicación, sin repetir la introducción. Las tres tarjetas de `Ejemplos` mantienen sus títulos. `Profundizar` admite Markdown y KaTeX. La conexión narrativa es una invitación a leer otros temas, **no** una nueva arista jugable. Requisitos, sucesores, estados, costes y generadores se extraen exclusivamente de la fixture. Las fórmulas y los matices científicos requieren revisión final antes de cualquier publicación.

---

## F00.18 — Cuantización

**Pregunta de curiosidad**

¿Y si algunas cantidades de la naturaleza no pudieran tomar cualquier valor, sino únicamente determinados valores permitidos?

### Introducción visible

Imagina que intentas subir por una escalera: puedes apoyar el pie en un peldaño o en el siguiente, pero no quedarte de pie en un peldaño imaginario entre ambos. Ahora piensa en una rampa, donde puedes detenerte prácticamente a cualquier altura. Son dos maneras muy distintas de cambiar de nivel.

A escala microscópica, determinadas magnitudes se comportan, en sistemas y condiciones concretas, de una forma que recuerda a la escalera. Esta propiedad se llama **cuantización** y fue una de las pistas que obligaron a transformar nuestra visión de la física.

### En pocas palabras

**Cuantización significa que una magnitud física, en un sistema determinado, solo puede adoptar ciertos valores permitidos. No implica que todas las magnitudes de la naturaleza estén siempre divididas en escalones.**

### Detalles

En la física clásica solemos imaginar que la energía de un objeto puede variar de manera continua: un coche puede moverse un poco más rápido o un poco más despacio, y cada cambio modifica su energía cinética. Esa intuición funciona muy bien en numerosos fenómenos cotidianos.

Sin embargo, un átomo ligado no puede intercambiar cualquier cantidad de energía al pasar entre dos niveles electrónicos permitidos. La diferencia entre ambos niveles determina la energía del fotón que puede emitir o absorber en esa transición.

Esto no significa que un electrón sea una pequeña bolita que salta entre órbitas planetarias. Los estados electrónicos se describen mediante la mecánica cuántica, y los llamados «niveles» corresponden a energías de estados permitidos.

La cuantización tampoco obliga a que el espectro de cualquier observable sea discreto. Por ejemplo, una partícula libre idealizada puede presentar un espectro continuo de momentos y energías, mientras que un sistema confinado puede tener determinados niveles discretos.

Lo fundamental no es imaginar que todo está hecho de píxeles invisibles, sino comprender que **las reglas de los estados cuánticos y de sus mediciones pueden imponer valores discretos**.

### Ejemplos

**1. Una escalera frente a una rampa**

En una escalera los niveles están separados; en una rampa, las alturas disponibles forman un continuo. La analogía ayuda a distinguir un conjunto discreto de uno continuo. Su límite es importante: los «peldaños» cuánticos no son escalones físicos escondidos dentro de un átomo.

**2. Los colores que emite un gas**

En determinadas condiciones, el hidrógeno produce líneas espectrales características en lugar de emitir por igual todas las frecuencias. Cada línea está relacionada con transiciones entre estados de energía. Es como una firma luminosa que revela la estructura cuántica del átomo.

**3. El efecto fotoeléctrico**

Iluminar una superficie adecuada con luz de frecuencia suficientemente alta puede liberar electrones. Aumentar solo la intensidad de una luz cuya frecuencia está por debajo del umbral no produce el mismo efecto fotoeléctrico ideal. La energía de cada fotón depende de su frecuencia, no simplemente del brillo total del haz.

### Profundizar

**Energía de un fotón**

La relación entre la energía de un fotón y su frecuencia es:

$$
E=h\nu
$$

Aquí, $E$ es la energía del fotón, $\nu$ su frecuencia y $h$ la constante de Planck. Una frecuencia mayor corresponde a una energía mayor por fotón.

**Transiciones entre niveles**

En una transición radiativa sencilla entre estados de energía definida:

$$
|\Delta E|=h\nu
$$

La frecuencia emitida o absorbida refleja la diferencia de energía entre los estados. No todas las transiciones imaginables están permitidas: pueden intervenir reglas de selección y otros factores físicos.

**Un ejemplo de niveles discretos: el oscilador armónico cuántico**

$$
E_n=\hbar\omega\left(n+\frac{1}{2}\right),\qquad n=0,1,2,\ldots
$$

Este modelo idealizado admite energías igualmente espaciadas, con un estado fundamental de energía no nula. No todos los sistemas cuánticos tienen niveles igualmente separados.

**La advertencia decisiva**

Cuantización no equivale a afirmar que «el espacio, el tiempo y toda forma de energía vienen en trocitos». Esa conclusión no se desprende de estos ejemplos. La naturaleza discreta o continua de una magnitud depende del sistema y del observable, y algunas cuestiones —como una posible estructura cuántica del espacio-tiempo— siguen abiertas.

### Conexión narrativa

Si un sistema solo admite ciertos resultados, necesitamos una manera de describir **en qué estado se encuentra** y qué podemos predecir de él. Esa es la puerta de entrada a **F00.19 — Estado cuántico**.

---

## F00.19 — Estado cuántico

**Pregunta de curiosidad**

Si no podemos describir un electrón como una bolita con una trayectoria perfectamente definida, ¿qué información utilizamos para predecir su comportamiento?

### Introducción visible

En un videojuego puedes consultar el estado de tu personaje: posición, velocidad, energía y objetos que lleva. Con esos datos, junto a las reglas del juego, puedes anticipar qué sucederá si realiza una acción.

En el mundo cuántico también hablamos de **estado**, pero no consiste simplemente en una ficha que enumera valores clásicos ocultos. Un estado cuántico reúne la información necesaria para calcular las probabilidades de los resultados de las mediciones que podemos realizar.

### En pocas palabras

**El estado cuántico es la descripción matemática con la que la teoría predice los resultados posibles y sus probabilidades. No equivale necesariamente a una lista de propiedades clásicas ya definidas.**

### Detalles

Piensa en una partícula como un electrón. En la descripción cuántica no siempre tiene sentido asignarle simultáneamente una posición exacta y un momento exacto como si siguiera una trayectoria clásica, aunque aún no la hayamos visto.

En muchos problemas, el estado se representa mediante una **función de onda**. Su valor no es una nube de materia que podamos fotografiar directamente: contiene amplitudes que permiten calcular probabilidades para resultados de una medición.

La función de onda puede cambiar con el tiempo siguiendo una ley de evolución bien definida. Esto es una de las grandes sorpresas de la teoría: la evolución matemática de un sistema aislado puede ser determinista, mientras que los resultados individuales de determinadas mediciones se describen probabilísticamente.

Conviene evitar otro equívoco. Un estado cuántico no siempre se representa por una única función de onda simple: los sistemas pueden tener espín, varias partículas, estados mixtos y otras descripciones matemáticas. La función de onda espacial es una puerta de entrada útil, no toda la teoría.

También sigue habiendo preguntas interpretativas sobre qué representa exactamente el estado cuántico en la realidad. Lo que no está en duda es que este formalismo permite hacer predicciones experimentales extraordinariamente precisas.

### Ejemplos

**1. Un mapa meteorológico, pero con una diferencia crucial**

Un mapa de probabilidades de lluvia ayuda a anticipar dónde puede llover, sin prometer el resultado de cada nube. La semejanza es que ambos modelos producen predicciones probabilísticas. El límite: la incertidumbre meteorológica suele depender de conocimiento incompleto y dinámica compleja; las probabilidades cuánticas no pueden reducirse sin más a ese mismo tipo de ignorancia clásica.

**2. Un electrón alrededor de un núcleo**

Las ilustraciones de orbitales atómicos muestran regiones donde sería más probable detectar el electrón en determinadas condiciones. No representan un pequeño planeta recorriendo una órbita fija. La forma de un orbital proviene del estado cuántico y de su función de onda.

**3. Un sistema de dos niveles**

Ciertos sistemas cuánticos pueden describirse usando dos estados básicos, que solemos llamar $|0\rangle$ y $|1\rangle$. Se utilizan para introducir los cúbits. Un cúbit no es simplemente una moneda clásica que ignoramos si está en cara o cruz: también pueden importar las fases relativas de sus amplitudes.

### Profundizar

**La notación de estados**

Un estado puro se representa habitualmente por un vector normalizado, por ejemplo:

$$
|\psi\rangle=\alpha|0\rangle+\beta|1\rangle
$$

Los coeficientes $\alpha$ y $\beta$ pueden ser números complejos. Para una base ortonormal de dos estados:

$$
|\alpha|^2+|\beta|^2=1
$$

Esta normalización permite interpretar las probabilidades de los resultados $0$ y $1$ en esa medición. Las fases relativas pueden afectar las predicciones de otras mediciones.

**La función de onda espacial**

Si representamos el estado de una partícula por $\psi(x,t)$ en una dimensión, la probabilidad de detectarla dentro de una región $[a,b]$ se obtiene mediante:

$$
P(a\leq x\leq b)=\int_a^b|\psi(x,t)|^2\,dx
$$

La expresión presupone una función de onda normalizada y la medición de posición habitual. La cantidad $|\psi|^2$ es una **densidad de probabilidad**, no una probabilidad puntual en un continuo.

**Evolución entre mediciones**

Para un sistema aislado apropiadamente descrito por un Hamiltoniano $\hat H$:

$$
i\hbar\frac{\partial}{\partial t}|\psi(t)\rangle=\hat H|\psi(t)\rangle
$$

Es la ecuación de Schrödinger en forma abstracta. El tratamiento de la medición y la interpretación de sus resultados exige además especificar cómo se relaciona el estado con los observables y el aparato experimental.

### Conexión narrativa

Un estado cuántico puede combinar amplitudes correspondientes a varios resultados de una medición. Para entender por qué esa combinación no es una simple mezcla de posibilidades clásicas, continuaremos con **F00.20 — Superposición**.

---

## F00.20 — Superposición

**Pregunta de curiosidad**

¿Cómo puede una sola descripción cuántica combinar posibilidades distintas y producir efectos que desaparecerían si solo ignorásemos cuál de ellas ocurrió?

### Introducción visible

Imagina dos ondas en un estanque. Cuando coinciden, pueden reforzarse o cancelarse parcialmente según cómo se superpongan sus crestas y valles. El resultado depende de cómo se combinan, no solo de la existencia de cada onda por separado.

La mecánica cuántica tiene una propiedad matemática llamada **superposición**: si dos estados son posibles dentro de una descripción lineal, podemos construir combinaciones de sus amplitudes. Y esas combinaciones pueden producir interferencia observable.

### En pocas palabras

**Una superposición cuántica combina amplitudes de distintos estados. Sus fases relativas pueden producir interferencia; no es lo mismo que desconocer cuál de dos situaciones clásicas ocurrió.**

### Detalles

La frase «una partícula está en dos sitios a la vez» resulta tentadora. Pero, tomada literalmente, puede llevar a imaginar dos copias materiales de una bolita clásica. Eso no es lo que afirma el formalismo cuántico.

En un experimento de doble rendija, la distribución de detecciones puede revelar interferencia cuando se mantienen las condiciones adecuadas y no se dispone de información que distinga por cuál camino pasó la partícula. Cada detección aparece localizada en el detector; la pauta estadística emerge al repetir muchas veces el experimento.

Si el montaje permite distinguir los caminos de una manera que destruye la coherencia pertinente, la interferencia desaparece o disminuye. No hace falta que una persona mire conscientemente: bastan interacciones físicas capaces de registrar información del camino.

La superposición también depende de la base de estados que elegimos para describir el sistema. Un estado que es definido respecto a un observable puede expresarse como una combinación respecto a otro. Por eso preguntar «¿está en superposición?» sin indicar **de qué estados o de qué medición** puede ser ambiguo.

La analogía de ondas ayuda a entender la interferencia. Su límite está en que la función de onda cuántica no se comporta siempre como una ondulación de agua que podamos observar directamente en el espacio ordinario.

### Ejemplos

**1. Dos ondas que se encuentran**

Cuando dos ondas llegan a un mismo lugar, sus amplitudes se suman. Si coinciden en fase pueden reforzarse; si llegan en oposición pueden cancelarse. Es una buena puerta de entrada a la interferencia, aunque las amplitudes cuánticas son entidades matemáticas complejas y no simples alturas de agua.

**2. La doble rendija**

Electrones o fotones enviados individualmente a través de un montaje adecuado pueden generar, tras muchas detecciones, un patrón de interferencia. El patrón refleja cómo se combinan las amplitudes de los caminos indistinguibles. No demuestra por sí solo que una partícula sea dos bolitas físicas simultáneas.

**3. Un cúbit y su fase relativa**

Dos estados de cúbit pueden dar probabilidades iguales al medir $0$ o $1$ y, sin embargo, producir resultados diferentes en otra base porque sus fases relativas son distintas. Esa diferencia es precisamente algo que una mezcla clásica no conserva de la misma manera.

### Profundizar

**Combinación lineal de estados**

Para dos estados $|a\rangle$ y $|b\rangle$ de un mismo espacio de Hilbert:

$$
|\psi\rangle=\alpha|a\rangle+\beta|b\rangle
$$

Las amplitudes y la normalización deben tratarse correctamente; si los estados de base no son ortogonales, no basta con sumar $|\alpha|^2+|\beta|^2$ para normalizar.

**De dónde sale la interferencia**

Si dos alternativas indistinguibles aportan amplitudes $A_1$ y $A_2$, la probabilidad es proporcional a:

$$
P\propto|A_1+A_2|^2
$$

Al desarrollar el módulo al cuadrado aparecen términos cruzados:

$$
|A_1+A_2|^2=|A_1|^2+|A_2|^2+2\operatorname{Re}(A_1^*A_2)
$$

El último término depende de la fase relativa y permite interferencia. Cuando las alternativas se vuelven distinguibles o se pierde la coherencia pertinente, no podemos utilizar sin más esa misma suma coherente para las probabilidades observadas.

**Superposición no significa mezcla estadística**

Una mezcla clásica asigna probabilidades a alternativas ya diferenciadas dentro de su modelo. Una superposición coherente mantiene información de fase entre componentes. Esta distinción es central para comprender la interferencia y muchas tecnologías cuánticas.

### Conexión narrativa

Si no todos los observables pueden tener simultáneamente distribuciones arbitrariamente estrechas, aparece una limitación que no es simple torpeza experimental: **F00.21 — Incertidumbre**.

---

## F00.21 — Incertidumbre

**Pregunta de curiosidad**

¿Y si existiera un límite a lo concentradas que pueden estar ciertas propiedades de un estado, incluso usando instrumentos perfectos?

### Introducción visible

Imagina una nota musical muy breve. Cuanto menos dura el sonido, más difícil resulta asociarlo a una única frecuencia perfectamente definida. En cambio, una oscilación prolongada puede tener una frecuencia mucho más precisa.

Esta relación entre extensión y contenido en frecuencias nos ayuda a intuir una idea cuántica: **ciertas distribuciones de resultados no pueden estrecharse simultáneamente tanto como queramos**. No es solamente un problema de aparatos poco precisos.

### En pocas palabras

**El principio de incertidumbre establece límites a la dispersión conjunta de determinados observables en un estado cuántico, como posición y momento. No significa que medir siempre sea descuidado ni que toda propiedad sea impredecible.**

### Detalles

Supongamos que preparamos muchas copias de un sistema en el mismo estado y medimos la posición en unas y el momento en otras. Las distribuciones estadísticas que obtenemos presentan anchuras o dispersiones características.

Para posición y momento, la mecánica cuántica establece un límite inferior para el producto de sus desviaciones estándar. Podemos preparar estados con una distribución espacial más concentrada, pero eso exige aceptar una distribución de momentos más extendida, y viceversa.

Es habitual explicar este principio diciendo que «al mirar una partícula la golpeamos y la movemos». Una medida real puede perturbar un sistema, pero **esa perturbación no es la explicación general de la relación de incertidumbre entre dispersiones de posición y momento**. La relación se sigue de la estructura matemática de los estados y los observables.

Tampoco significa que cada magnitud física deba ser imprecisa. Existen estados que tienen un valor definido de ciertos observables; y hay pares de observables compatibles cuyas distribuciones pueden afinarse simultáneamente.

La comparación con una nota musical es una analogía matemática útil por la conexión con el análisis de Fourier. Su límite: escuchar una nota durante poco tiempo no es un experimento cuántico ni demuestra por sí mismo la incertidumbre de Heisenberg.

### Ejemplos

**1. Una nota muy corta**

Un sonido casi instantáneo necesita una combinación amplia de frecuencias; uno prolongado puede concentrarse mucho más alrededor de una frecuencia. La analogía muestra un compromiso entre localización y contenido en frecuencias, no un error humano de audición.

**2. Un electrón confinado**

Si un electrón está preparado en un estado muy localizado dentro de una región espacial, su distribución de momentos no puede ser arbitrariamente estrecha. Por eso la imagen de «un electrón completamente quieto en un punto exacto» no suele representar un estado físico permitido con ambas dispersiones nulas.

**3. Afinar un experimento**

Podemos mejorar la resolución de un detector y reducir errores de medición. Eso no elimina la dispersión propia de los resultados que predice un estado cuántico para observables incompatibles. Precisión del instrumento y dispersión del estado son conceptos distintos.

### Profundizar

**La relación posición–momento**

En una dimensión, utilizando las desviaciones estándar $\Delta x$ y $\Delta p_x$ en un estado adecuado:

$$
\Delta x\,\Delta p_x\geq\frac{\hbar}{2}
$$

Aquí $\hbar=h/(2\pi)$ es la constante de Planck reducida. No es una afirmación de que un aparato tenga necesariamente esos márgenes de error en cada medición individual.

**Por qué aparece**

Los operadores de posición y momento satisfacen:

$$
[\hat x,\hat p_x]=i\hbar
$$

La no conmutatividad y las propiedades estadísticas de los estados conducen a la relación de incertidumbre. Más generalmente, para observables autoadjuntos apropiados $A$ y $B$:

$$
\Delta A\,\Delta B\geq\frac{1}{2}\left|\langle[\hat A,\hat B]\rangle\right|
$$

Es una forma de la desigualdad de Robertson, bajo las condiciones matemáticas pertinentes.

**Tres nociones que no conviene confundir**

- **Incertidumbre del estado:** dispersión estadística de resultados para un observable.
- **Error de medición:** diferencia o incertidumbre asociada al procedimiento instrumental.
- **Perturbación de medición:** modificación física que la medición puede provocar.

Están relacionadas en problemas concretos, pero no son sinónimos y no todas se expresan con la misma desigualdad.

### Conexión narrativa

La incertidumbre nos obliga a pensar en distribuciones de posibles resultados. Pero ¿cómo extrae la física cuántica sus probabilidades concretas? Continuemos con **F00.22 — Probabilidad de los resultados**.

---

## F00.22 — Probabilidad de los resultados

**Pregunta de curiosidad**

Si un experimento cuántico puede tener varios resultados, ¿cómo consigue la ciencia predecir con precisión algo que no puede anticipar uno por uno?

### Introducción visible

Imagina que lanzas una moneda muchas veces. No puedes anunciar con seguridad cuál será la siguiente cara, pero sí puedes estudiar la frecuencia con la que aparece cada resultado. Con suficientes lanzamientos y condiciones estables, comienzan a reconocerse patrones.

En los experimentos cuánticos también aparecen distribuciones repetibles de resultados. La diferencia es que sus probabilidades se calculan a partir del **estado cuántico y de la medición concreta** mediante una regla fundamental de la teoría.

### En pocas palabras

**La regla de Born transforma las amplitudes del estado cuántico en probabilidades de resultados de una medición. No predice siempre cada resultado individual, pero sí distribuciones contrastables experimentalmente.**

### Detalles

Una descripción cuántica puede predecir con enorme precisión el reparto estadístico de resultados aun cuando no asigne un resultado seguro a cada ensayo individual.

Piensa en un experimento en el que registramos dónde llegan electrones a una pantalla. Cada impacto aparece en un lugar concreto. Al repetir muchas veces el procedimiento bajo condiciones equivalentes, la distribución de impactos puede coincidir con la probabilidad calculada mediante la función de onda.

Pero la probabilidad no sale de contar cuántos «pedacitos de electrón» hay en cada lugar. El estado aporta **amplitudes** y, mediante la regla de Born, obtenemos probabilidades. Para una medición de posición continua se utiliza una densidad; para resultados discretos, probabilidades de cada alternativa.

Una dificultad habitual es confundir «probabilístico» con «sin leyes». La física cuántica tiene reglas matemáticas muy exigentes y sus predicciones estadísticas son comprobables. La incertidumbre de un resultado individual no significa que todo sea azar sin estructura.

La comparación con una moneda tiene límites. En un lanzamiento clásico, buena parte de nuestra incertidumbre procede de no conocer y controlar todos los detalles iniciales; no debemos asumir que esa es automáticamente la explicación de las probabilidades cuánticas.

### Ejemplos

**1. Una pantalla y miles de impactos**

Cada electrón registrado produce una detección localizada. Tras numerosos ensayos, aparece una distribución espacial que puede compararse con la predicción cuántica. Lo que se acumula no son electrones «difusos», sino datos de resultados individuales.

**2. Dos resultados posibles**

Prepara un sistema de dos niveles en un estado adecuado. Si las amplitudes relativas corresponden a probabilidades de 70 % y 30 % en una medición concreta, esperamos aproximadamente esas proporciones en muchas repeticiones independientes. No significa que en diez ensayos tengan que aparecer exactamente siete resultados de un tipo y tres del otro.

**3. La trampa de sumar probabilidades demasiado pronto**

Cuando dos caminos cuánticos son indistinguibles y coherentes, primero debemos combinar sus amplitudes y después calcular la probabilidad. Si sumáramos las probabilidades por separado perderíamos los términos de interferencia. Por eso la superposición no es solo una manera vistosa de hablar del azar.

### Profundizar

**La regla de Born en una base discreta**

Si un estado puro normalizado se expresa mediante estados ortonormales $|i\rangle$:

$$
|\psi\rangle=\sum_i c_i|i\rangle
$$

La probabilidad del resultado correspondiente a $|i\rangle$, para esa medición proyectiva no degenerada, es:

$$
P(i)=|c_i|^2,\qquad\sum_iP(i)=1
$$

Las probabilidades son reales, no negativas y están normalizadas.

**Probabilidad de encontrar una partícula en una región**

Para una función de onda espacial normalizada en una dimensión:

$$
P(a\leq x\leq b)=\int_a^b|\psi(x,t)|^2\,dx
$$

La cantidad $|\psi(x,t)|^2$ es una densidad de probabilidad: para un punto exacto de una variable continua, la probabilidad puntual es cero en los casos ordinarios, aunque la densidad pueda ser distinta de cero.

**Una formulación más general**

Para un estado representado por una matriz densidad $\rho$ y un resultado asociado a un operador positivo $E_i$ de una medición válida:

$$
P(i)=\operatorname{Tr}(\rho E_i)
$$

Esta forma incluye estados mixtos y mediciones más generales. Los operadores de medida cumplen condiciones de positividad y normalización apropiadas. No es necesario dominarla para usar la regla de Born en sus ejemplos más sencillos.

**¿Significa esto que entendemos por qué aparece un resultado concreto?**

Las predicciones operativas de la mecánica cuántica están extraordinariamente contrastadas, pero las interpretaciones de qué ocurre exactamente durante una medición y qué representa el estado siguen siendo cuestiones debatidas. SOMA debe distinguir el éxito experimental de la teoría de esas preguntas abiertas.

### Conexión narrativa

Ya hemos descubierto cómo se describen los estados y cómo obtenemos probabilidades. Más adelante, al estudiar **F00.23 — Campo físico** y la **teoría cuántica de campos**, ampliaremos esta mirada a sistemas en los que las partículas no son la única forma útil de describir la naturaleza.

---

## Notas de revisión científica y editorial (no mostrar en las fichas)

1. **F00.18:** revisar la precisión de «niveles electrónicos», selección de transiciones y distinción entre espectros discretos y continuos. No sugerir que todo el universo está espacial o temporalmente discretizado.
2. **F00.19:** la función de onda es una representación en una base; un estado puede ser puro o mixto. La ecuación de Schrödinger expuesta describe la evolución unitaria en sistemas apropiados, no agota la teoría de la medición.
3. **F00.20:** no presentar «dos lugares a la vez» como interpretación literal. Interferencia exige coherencia y condiciones experimentales adecuadas. Una superposición siempre se especifica respecto a una base o conjunto de estados.
4. **F00.21:** diferenciar desviaciones estándar del estado, error de medición y perturbación. La relación de Robertson requiere condiciones matemáticas; el símil de tiempo–frecuencia es exclusivamente orientativo.
5. **F00.22:** distinguir probabilidades de resultados discretos y densidades continuas. La regla de Born general con POVM está presentada de forma deliberadamente opcional; revisar accesibilidad de KaTeX y símbolos.
6. **Conexiones narrativas:** son recomendaciones de lectura, **no nuevos prerequisitos**. No modificar el grafo jugable ni atribuir causalidad física a su secuencia de desbloqueo.
7. **Estado:** estos textos son candidatos editoriales en español; requieren revisión científica final y, antes de su publicación ES/EN, traducción inglesa editorialmente aprobada.

## Referencias para revisión editorial

- OpenStax, *University Physics Volume 3*: capítulos de radiación de cuerpo negro, ondas de materia y funciones de onda. https://openstax.org/books/university-physics-volume-3
- OpenStax, *College Physics 2e*: sección «Quantization of Energy». https://openstax.org/books/college-physics-2e/pages/29-1-quantization-of-energy
- Stanford Encyclopedia of Philosophy, «Quantum Mechanics». https://plato.stanford.edu/entries/qm/
- Stanford Encyclopedia of Philosophy, «The Uncertainty Principle». https://plato.stanford.edu/entries/qt-uncertainty/
- Stanford Encyclopedia of Philosophy, «Philosophical Issues in Quantum Theory». https://plato.stanford.edu/entries/qt-issues/

Estas referencias sirven para revisión y trazabilidad conceptual. No se etiquetan automáticamente como fuentes que hayan validado cada párrafo individual.
