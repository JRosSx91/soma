# GAM-03B · CONTENT-S00-03

**Estrato 00 — La arquitectura invisible del universo**  
**Bloque III — Simetrías y conservación (F00.10–F00.17)**  
**Estado editorial:** `candidate` — texto educativo para el prototipo DEV; pendiente de revisión científica y editorial final y localización EN.  
**Alcance:** ocho fichas. No establece ni modifica requisitos, relaciones jugables, costes, generadores o balance.  
**Enfoque:** divulgación intuitiva, analogías cotidianas con límites explícitos, tres ejemplos por ficha y profundización optativa. Las conexiones narrativas no son relaciones de desbloqueo.

## Contrato editorial de integración

Cada ficha contiene `Pregunta de curiosidad`, `Introducción visible`, `En pocas palabras`, `Detalles`, `Ejemplos` (exactamente tres), `Profundizar` y `Conexión narrativa`. La **introducción visible** se muestra después de la pregunta y antes de «En pocas palabras». **Detalles** continúa la explicación sin repetirla. Los requisitos, sucesores, indicadores de generador y costes provienen exclusivamente de la fixture y del motor económico. Conservar el Markdown y las expresiones LaTeX. No presentar simetrías del dibujo como equivalentes automáticos de simetrías físicas de las leyes.

---

# F00.10 — Simetría

**Constelación:** III — Simetrías y conservación  
**Estado:** candidato editorial DEV

### Pregunta de curiosidad

**¿Qué tienen en común un copo de nieve, una partida de billar y las leyes que gobiernan el universo?**

### Introducción visible

Piensa en un copo de nieve. Si lo giras cierto ángulo, puede parecer exactamente igual que antes. Ahora imagina algo menos visible: realizar un mismo experimento en dos lugares distintos y obtener resultados gobernados por las mismas leyes.

Ambas situaciones hablan de **simetría**, pero no de la misma clase. En física, una simetría es una transformación bajo la cual algo relevante permanece inalterado.

### En pocas palabras

**Una simetría es una transformación que conserva determinadas propiedades. En física, las simetrías de las leyes pueden revelar principios fundamentales, aunque no impliquen que los objetos tengan aspecto simétrico.**

### Detalles

Solemos asociar simetría con reflejos de espejo, alas parecidas o figuras bien equilibradas. Esa es una primera puerta de entrada: una figura puede conservar su aspecto después de un giro o una reflexión.

Pero los físicos utilizan una idea mucho más amplia. También preguntan: **¿cambiaría la descripción de un fenómeno si modificáramos ciertas coordenadas, desplazáramos un experimento o lo giráramos?**

Es importante distinguir entre la simetría de un **objeto particular** y la simetría de las **leyes** que describen muchos objetos. Una pelota pintada por un lado no tiene la misma apariencia desde cualquier ángulo; eso no demuestra que las leyes mecánicas distingan una orientación privilegiada.

No todas las transformaciones son simetrías. Y no todas las simetrías conducen a la misma conclusión. Algunas son discretas, como ciertos reflejos; otras son continuas, como girar una figura por cualquier ángulo cuando la figura o las leyes lo permiten.

Las simetrías continuas de la dinámica tienen una relación especialmente profunda con las cantidades conservadas. Esa conexión aparecerá en el teorema de Noether.

### Ejemplos

**1. El copo de nieve y el giro**

Un copo ideal de seis brazos puede conservar su aspecto al girarlo 60 grados. Eso es una simetría discreta de una figura. Un giro de 17 grados, en general, no produciría la misma imagen. **La figura no tiene por ello una simetría de rotación continua**.

**2. Una pelota pintada de rojo por un lado**

La pelota deja de verse igual al girarla. Sin embargo, si estudias su movimiento en una región donde las condiciones físicas son equivalentes en todas las orientaciones, las leyes mecánicas no cambian porque el dibujo apunte hacia otra dirección. La simetría del objeto y la de la ley no son lo mismo.

**3. Cambiar la escala de un mapa**

Un mapa puede ampliarse sin alterar qué calles conectan con cuáles, aunque sí cambien las distancias medidas sobre el papel. Es una analogía de conservar *ciertas propiedades*, no de que cualquier cambio de escala sea una simetría física: las leyes pueden contener longitudes características que impiden esa invariancia.

### Profundizar

**Transformaciones e invariantes**

Representemos una transformación por \(T\). Una propiedad \(P\) es invariante bajo esa transformación si:

\[
P(Tx)=P(x)
\]

La igualdad expresa que, aunque la descripción o el objeto cambien bajo \(T\), esa propiedad conserva su valor. El significado de \(x\), de \(P\) y de \(T\) depende del problema.

**Simetrías discretas y continuas**

Una reflexión es una transformación discreta; una rotación puede formar parte de una familia continua parametrizada por un ángulo. La distinción importa: el teorema de Noether clásico relaciona, bajo hipótesis precisas, **simetrías continuas de la acción física** con cantidades conservadas.

**Invariancia no significa inmovilidad**

Una ley puede ser invariante aunque describa un sistema que cambia sin cesar. Que las ecuaciones admitan una transformación no exige que cada solución concreta ni cada objeto individual permanezca idéntico.

### Conexión narrativa

Ya sabemos qué buscamos cuando hablamos de simetría: algo que permanece igual bajo una transformación. Podemos investigar dos familias especialmente reveladoras: **las transformaciones del espacio** y **las traslaciones en el tiempo**.

---

# F00.11 — Simetrías espaciales

**Constelación:** III — Simetrías y conservación  
**Estado:** candidato editorial DEV

### Pregunta de curiosidad

**Si haces el mismo experimento un metro más a la izquierda, ¿deberían cambiar las leyes del universo?**

### Introducción visible

Imagina una mesa de billar ideal. Trasladas todo el experimento a otra habitación con las mismas condiciones y repites los golpes. Las posiciones cambian, pero las ecuaciones que describen las bolas pueden ser las mismas.

Esa idea apunta a una **simetría espacial**: las leyes pueden permanecer invariantes cuando cambiamos la posición o la orientación de un experimento, siempre que transformemos correctamente el sistema y sus condiciones.

### En pocas palabras

**Las simetrías espaciales describen invariancias bajo desplazamientos y rotaciones. En sistemas con las condiciones apropiadas, esas invariancias se relacionan con la conservación del momento lineal y del momento angular.**

### Detalles

Hay dos transformaciones espaciales especialmente importantes: **trasladar** un sistema sin girarlo y **rotarlo** sin cambiar su estructura interna.

Si las leyes no dependen de una posición absoluta privilegiada, hablamos de homogeneidad espacial. Si no seleccionan una orientación privilegiada, hablamos de isotropía espacial.

Esto no quiere decir que todos los lugares sean idénticos. Un experimento realizado cerca de un imán potente puede comportarse de otra forma que el mismo experimento lejos de él. Lo que ha cambiado es el entorno físico, no necesariamente la ley que utilizamos para describirlo.

Tampoco basta con mover solo una parte de un experimento mientras dejamos fijas las fuentes externas: ese procedimiento puede alterar fuerzas y condiciones iniciales.

La recompensa conceptual es extraordinaria: bajo determinadas hipótesis, la invariancia ante traslaciones espaciales está relacionada con la conservación del momento lineal, mientras que la invariancia ante rotaciones se relaciona con el momento angular.

### Ejemplos

**1. Una mesa de billar trasladada**

Si mueves mesa, bolas y demás condiciones relevantes, las ecuaciones del choque son las mismas. No necesitas una física distinta para la esquina izquierda del edificio. La homogeneidad se refiere a la ley, no a que las dos mesas reales tengan idénticos rozamientos.

**2. Girar el montaje de laboratorio**

Una colisión entre discos puede estudiarse con un montaje girado. Si no existe un campo o condición externa que privilegie una dirección, las leyes conservan su forma. Girar el sistema no garantiza que cada trayectoria dibujada tenga el mismo aspecto en los ejes originales: hay que transformar también su descripción.

**3. Una pelota en una pendiente**

La pelota rueda cuesta abajo y no cuesta arriba en las mismas condiciones. ¿Ha desaparecido la simetría de las leyes? No: la gravedad local y la orientación de la pendiente forman parte de las condiciones del sistema. **La simetría de la ley y la simetría de la situación particular deben distinguirse**.

### Profundizar

**Traslaciones**

Una traslación de coordenadas puede escribirse como:

\[
\mathbf r\,'=\mathbf r+\mathbf a
\]

Aquí \(\mathbf a\) es un vector constante. Para que sea una simetría física relevante, la acción o las ecuaciones de la dinámica deben conservar la propiedad apropiada bajo esa familia de transformaciones.

**Rotaciones**

Una rotación puede representarse por una matriz \(R\) que preserve distancias euclídeas:

\[
\mathbf r\,'=R\mathbf r,\qquad R^{\mathsf T}R=I
\]

Una invariancia continua ante rotaciones es la que, en el marco de Noether y bajo sus hipótesis, se asocia con el momento angular conservado.

**¿Y el universo completo?**

La cosmología utiliza hipótesis de homogeneidad e isotropía **a escalas suficientemente grandes y de manera aproximada**. No hay que confundir esas hipótesis de modelado con la afirmación de que el cosmos sea exactamente igual en cada punto o dirección.

### Conexión narrativa

Si desplazar o girar un sistema puede dejar intactas sus leyes, ¿qué ocurre al repetirlo en otro **momento**? Esa pregunta nos conduce a la simetría temporal.

---

# F00.12 — Simetría temporal

**Constelación:** III — Simetrías y conservación  
**Estado:** candidato editorial DEV

### Pregunta de curiosidad

**¿Funcionaría la misma ley física mañana, aunque el mundo haya cambiado desde hoy?**

### Introducción visible

Si dejas caer una pelota hoy y repites el experimento mañana bajo condiciones equivalentes, esperas que la gravedad obedezca las mismas leyes. El reloj marca otra fecha, pero la regla física no tiene por qué cambiar.

A esta idea la llamamos **invariancia ante traslaciones temporales**: desplazar el instante del experimento no modifica las leyes del sistema, cuando sus condiciones relevantes también se mantienen equivalentes.

### En pocas palabras

**La simetría temporal que nos interesa aquí significa que la dinámica de un sistema no depende explícitamente del instante elegido. Bajo las condiciones adecuadas, está vinculada a la conservación de la energía.**

### Detalles

Decir que «las leyes son las mismas mañana» puede parecer obvio. Sin embargo, es una afirmación muy poderosa y debe entenderse con cuidado.

No significa que todos los acontecimientos se repitan ni que un sistema conserve siempre su apariencia. Una taza puede romperse hoy y seguir rota mañana mientras las ecuaciones que describen el proceso obedecen las mismas reglas.

Tampoco significa que el entorno permanezca fijo. Un experimento cerca de una fuente de calor que cambia con el tiempo puede intercambiar energía con ella. Si analizamos solo una parte del conjunto, su energía puede variar.

Existe otra idea diferente, llamada **inversión temporal**: estudiar si las leyes conservan ciertas propiedades al cambiar el sentido del tiempo. No debe confundirse con desplazar el inicio de un experimento de las 10:00 a las 11:00.

La invariancia frente a **traslaciones** de tiempo, bajo las hipótesis del teorema de Noether, está conectada con una cantidad conservada que, en sistemas habituales con las condiciones correspondientes, identificamos con la energía.

### Ejemplos

**1. El péndulo de hoy y de mañana**

Un péndulo ideal, aislado de perturbaciones y con los mismos parámetros, sigue las mismas ecuaciones si comienza a oscilar una hora después. La fecha no figura como una fuerza adicional. Un péndulo real puede frenarse por rozamiento: eso no demuestra que la ley haya cambiado con la hora.

**2. La batería que se descarga**

La energía almacenada por una batería disminuye cuando alimenta una lámpara. No contradice la conservación de la energía del sistema completo: parte de ella se transfiere como energía eléctrica, luz y calor. Hay que escoger correctamente qué sistema estudiamos.

**3. Una película reproducida al revés**

En una película inversa, los fragmentos de un vaso roto se reunirían espontáneamente. Esto parece extraordinario y nos recuerda la flecha termodinámica del tiempo, pero **no es una prueba de que traslación temporal e inversión temporal sean la misma simetría**. Son preguntas físicas distintas.

### Profundizar

**¿Qué significa «no depender explícitamente del tiempo»?**

En mecánica analítica, un sistema puede describirse mediante un lagrangiano \(L(q_i,\dot q_i,t)\). Si cumple las condiciones apropiadas y no depende explícitamente de \(t\), entonces la cantidad:

\[
E=\sum_i \dot q_i\,\frac{\partial L}{\partial\dot q_i}-L
\]

se conserva. En numerosos sistemas mecánicos habituales, esta cantidad coincide con la energía mecánica que usamos en física introductoria; en general la identificación requiere atender a las hipótesis del modelo.

**Una simetría de la acción, no del dibujo**

La formulación del teorema de Noether se refiere a la invariancia de la acción —posiblemente hasta un término de borde que no cambie las ecuaciones—, no simplemente a que una gráfica resulte idéntica en dos fechas.

**¿Y en cosmología?**

En un espacio-tiempo dinámico, como los modelos de universo en expansión, no existe necesariamente una simetría global de traslación temporal. Por ello, la conservación de una **energía total global única del universo** no se deduce de manera general como en un sistema aislado en un espacio-tiempo estacionario. Esto no elimina las leyes locales de conservación apropiadas de la relatividad general.

### Conexión narrativa

La simetría temporal y las espaciales revelan un patrón sorprendente. Para comprenderlo necesitamos conocer el descubrimiento de **Emmy Noether**.

---

# F00.13 — Teorema de Noether

**Constelación:** III — Simetrías y conservación  
**Estado:** candidato editorial DEV

### Pregunta de curiosidad

**¿Y si una ley de conservación fuera la huella de una simetría que no podemos ver a simple vista?**

### Introducción visible

Imagina descubrir que dos preguntas muy diferentes —«¿qué cambia si traslado un experimento?» y «¿qué magnitud permanece constante?»— son en realidad dos caras de una misma estructura matemática.

En 1918, la matemática **Emmy Noether** demostró una conexión profunda entre ciertas simetrías continuas de las leyes físicas y las cantidades conservadas.

### En pocas palabras

**Bajo sus hipótesis matemáticas, cada simetría continua de la acción de un sistema físico se asocia con una cantidad conservada. Las traslaciones temporales se vinculan con la energía; las espaciales, con el momento; y las rotaciones, con el momento angular.**

### Detalles

Durante mucho tiempo, las leyes de conservación podían parecer una colección de reglas independientes: la energía se conserva, el momento se conserva, el momento angular se conserva.

Noether mostró por qué esas reglas pueden tener un origen estructural común. Si la dinámica no distingue un instante absoluto, aparece una cantidad conservada asociada a las traslaciones temporales. Si no distingue posiciones absolutas, surge una relacionada con el momento. Si es invariante ante rotaciones, aparece otra relacionada con el momento angular.

La palabra clave es **continua**: desplazarnos una distancia minúscula, mover el comienzo del experimento una fracción de segundo o girar un ángulo arbitrariamente pequeño. Y la simetría relevante es la de la **acción** que describe la dinámica, no la mera apariencia de un objeto.

Este teorema no asegura que cualquier cantidad individual sea constante ni que cualquier entorno conserve por sí solo la energía o el momento. Debemos especificar el sistema, sus interacciones, sus fronteras y las condiciones de la simetría.

Tampoco hay que confundir las simetrías globales ordinarias con todas las simetrías locales de las teorías gauge: esas requieren un tratamiento matemático adicional.

La contribución de Noether cambió la forma de entender la física: las conservaciones dejaron de ser solo reglas observadas y revelaron relaciones profundas con la estructura de las teorías.

### Ejemplos

**1. Cambiar de hora sin cambiar las reglas**

Si las ecuaciones de un sistema aislado no dependen explícitamente de la hora a la que comienzas el experimento, la simetría temporal permite obtener una cantidad conservada relacionada con su energía. No significa que la energía de cada pieza por separado permanezca fija.

**2. Choque de dos patinadores**

Sobre hielo ideal y sin fuerzas horizontales externas, dos patinadores que se empujan adquieren momentos opuestos. La conservación del momento total refleja una ley que no distingue una posición horizontal privilegiada. El hielo real y el rozamiento introducen aproximaciones.

**3. La patinadora que gira**

Una patinadora que recoge los brazos puede girar más deprisa sin cambiar apreciablemente su momento angular total alrededor del eje vertical, si el torque externo es despreciable. La simetría rotacional se relaciona con la conservación; recoger los brazos requiere esfuerzo y puede aumentar su energía cinética de rotación.

### Profundizar

**La acción y el lagrangiano**

En mecánica clásica se define la acción para una trayectoria como:

\[
S[q]=\int_{t_1}^{t_2}L(q,\dot q,t)\,dt
\]

En el principio de acción estacionaria, las trayectorias físicas satisfacen condiciones que hacen estacionaria esta acción frente a variaciones apropiadas.

**La idea matemática de Noether**

Si una familia continua de transformaciones preserva la acción bajo las hipótesis necesarias —incluidas las condiciones de contorno—, se puede construir una magnitud conservada a lo largo de las soluciones. En una descripción sencilla:

\[
\frac{dQ}{dt}=0
\]

La expresión dice que la carga de Noether \(Q\) permanece constante durante la evolución del sistema correspondiente. No significa que todas las simetrías produzcan exactamente la misma \(Q\).

**Tres correspondencias memorables**

- Traslación en el tiempo \(\longleftrightarrow\) cantidad relacionada con la energía.
- Traslación en el espacio \(\longleftrightarrow\) momento lineal.
- Rotación espacial \(\longleftrightarrow\) momento angular.

**Límites de la regla mnemotécnica**

En sistemas abiertos, con fuerzas externas o en espacio-tiempos curvos dinámicos, hay que identificar con precisión la simetría de la acción y qué conservación puede definirse. La lista anterior es una guía potente, **no un permiso para afirmar que toda energía global imaginable se conserva automáticamente**.

### Conexión narrativa

Ya conocemos la conexión entre simetrías y magnitudes conservadas. Ahora podemos explorar qué significa realmente **conservar** algo en un sistema físico.

---

# F00.14 — Conservación

**Constelación:** III — Simetrías y conservación  
**Estado:** candidato editorial DEV

### Pregunta de curiosidad

**Cuando una pelota se detiene por rozamiento, ¿adónde ha ido a parar su energía?**

### Introducción visible

Lanzas una pelota por el suelo y termina frenándose. Parece que su movimiento sencillamente desaparece, pero el proceso implica transferencias de energía hacia la pelota, el suelo y el entorno, principalmente en forma de energía interna.

Una **ley de conservación** afirma que una magnitud física bien definida permanece constante en un sistema y bajo unas condiciones especificadas, aunque pueda cambiar de forma o repartirse entre sus partes.

### En pocas palabras

**Conservar no significa que nada cambie: significa que una cantidad total apropiada permanece constante pese a los intercambios y transformaciones, siempre que se cumplan las condiciones físicas necesarias.**

### Detalles

La palabra conservación suele evocar una caja cerrada donde guardamos algo para que no se pierda. En física, lo interesante es que **los componentes pueden cambiar mientras una magnitud total se mantiene**.

En un choque, el momento puede pasar de un cuerpo a otro. En un péndulo ideal, la energía alterna entre movimiento y posición en un campo gravitatorio. En un circuito, la energía de una batería puede transformarse y transferirse al entorno.

Eso obliga a elegir el sistema que analizamos. Si solo observamos una pelota, su energía cinética disminuye. Si incorporamos también el suelo y los alrededores, podemos estudiar a dónde se transfiere la energía.

No todas las cantidades son conservadas. La temperatura de un objeto, su rapidez o la energía cinética de una pieza aislada pueden variar. Incluso una cantidad que se conserva en cierto modelo puede dejar de hacerlo cuando añadimos interacciones o cuando cambiamos los límites del sistema.

Las leyes de conservación son valiosas porque permiten resolver problemas sin seguir cada detalle microscópico de un proceso. Nos dicen qué cambios **no** pueden ocurrir sin compensaciones físicas apropiadas.

### Ejemplos

**1. El péndulo ideal**

En un péndulo sin rozamiento, la energía mecánica se intercambia entre cinética y potencial gravitatoria. En su punto más alto la rapidez es mínima; abajo, mayor. En un péndulo real, parte de la energía mecánica acaba transferida al entorno.

**2. El choque de dos carritos**

Dos carritos pueden chocar y deformarse. Si el impulso externo total es despreciable, se conserva su momento lineal total, aunque la energía cinética de traslación disminuya por deformación, sonido o calentamiento.

**3. La batería y la lámpara**

La batería pierde energía almacenada mientras la lámpara emite luz y calienta el entorno. Que la energía útil disminuya no significa que la energía desaparezca: debemos seguir los intercambios y las formas que adopta.

### Profundizar

**Balance de una magnitud**

Una forma sencilla de escribir el balance de una cantidad \(Q\) en un volumen es:

\[
\frac{dQ_{\mathrm{dentro}}}{dt}=\text{entrada}-\text{salida}+\text{producción neta}
\]

Para una cantidad estrictamente conservada no existe creación o destrucción neta interna: la variación se explica por flujos a través del límite. El significado matemático preciso depende de la magnitud y el modelo.

**Conservación del momento**

En mecánica clásica, para un conjunto de cuerpos con fuerza externa neta nula:

\[
\frac{d\mathbf P}{dt}=\mathbf F_{\mathrm{ext}}=\mathbf 0
\]

Por tanto, el momento total \(\mathbf P\) permanece constante. Las fuerzas internas pueden alterar los momentos individuales, pero se compensan en el total bajo las hipótesis habituales.

**Energía mecánica frente a energía total**

Conservar energía no implica conservar siempre \(K+U\) como energía mecánica. Si hay rozamiento, ese subtotal puede disminuir mientras crece la energía interna. En relatividad general, además, hay conservaciones locales formuladas mediante geometría y campos, sin garantía de una energía total global única para cualquier espacio-tiempo.

### Conexión narrativa

Hemos visto qué significa que una magnitud total permanezca constante. La primera de las grandes protagonistas que vamos a explorar es la **energía**.

---

# F00.15 — Energía

**Constelación:** III — Simetrías y conservación  
**Estado:** candidato editorial DEV; concepto con generador según fixture

### Pregunta de curiosidad

**¿Qué tienen en común un rayo de Sol, un músculo que se contrae y una pelota que cae?**

### Introducción visible

La luz solar calienta tu piel, tu cuerpo utiliza energía química para moverse y una pelota gana rapidez al caer. Son procesos muy distintos, pero todos pueden describirse mediante intercambios y transformaciones de **energía**.

La energía no es una sustancia brillante que salta de un objeto a otro. Es una magnitud física que permite cuantificar y relacionar los cambios en los sistemas.

### En pocas palabras

**La energía es una magnitud que interviene en el movimiento, las interacciones y las transformaciones físicas. Puede transferirse y cambiar de forma; su conservación depende del sistema y de las condiciones en que se describe.**

### Detalles

Cuando alguien dice «tengo energía», normalmente habla de cómo se siente. En física, la palabra tiene un significado más preciso y mucho más amplio.

Un cuerpo en movimiento posee energía cinética. Un sistema puede almacenar energía potencial asociada a sus interacciones. Los materiales tienen energía interna vinculada con sus estados microscópicos. La radiación transporta energía, y en relatividad la masa está relacionada con ella.

No son tipos de una misteriosa sustancia: son formas de contabilizar una misma magnitud dentro de diferentes descripciones físicas.

En problemas cotidianos, muchas transformaciones pueden comprenderse siguiendo el intercambio de energía. Una batería alimenta un motor, el motor mueve un mecanismo y parte de la energía acaba transferida al ambiente mediante calor, vibraciones o sonido.

La energía también nos recuerda que **«conservarse» no significa permanecer disponible para cualquier uso**. Las transformaciones pueden dispersarla y disminuir la capacidad de obtener trabajo útil, una cuestión que estudiaremos con la termodinámica.

Su valor puede depender del sistema de referencia y, en algunos modelos, del cero convencional elegido para la energía potencial. Lo que importa es utilizar definiciones coherentes y atender a los cambios y balances adecuados.

### Ejemplos

**1. La montaña rusa**

En una montaña rusa ideal, cuando el vagón desciende disminuye su energía potencial gravitatoria y aumenta su energía cinética. En una atracción real, el rozamiento y la resistencia del aire transfieren parte de la energía mecánica al entorno.

**2. Un desayuno y una bicicleta**

Tu organismo transforma la energía química de los alimentos mediante procesos bioquímicos. Parte puede contribuir al movimiento muscular y otra parte se transfiere como calor. La analogía ayuda a conectar física y biología, pero el cuerpo no funciona como una máquina térmica simple.

**3. Un panel solar**

La radiación solar transporta energía que una célula fotovoltaica puede convertir parcialmente en energía eléctrica. El resto se refleja, transmite o contribuye a calentar materiales. No surge energía de la nada: cambian las vías de transferencia y conversión.

### Profundizar

**Energía cinética clásica**

Para un cuerpo puntual de masa constante que se mueve a velocidad mucho menor que la de la luz:

\[
K=\frac{1}{2}mv^2
\]

Si duplicas su velocidad, la energía cinética se multiplica por cuatro, siempre dentro del dominio de validez de esta fórmula clásica.

**Trabajo y cambio de energía cinética**

El trabajo neto de las fuerzas sobre un cuerpo está relacionado con la variación de su energía cinética:

\[
W_{\mathrm{neto}}=\Delta K
\]

La energía potencial puede incorporarse cuando describimos interacciones conservativas con una elección adecuada del sistema y referencia.

**Masa y energía**

En relatividad especial, la energía de reposo de un cuerpo es:

\[
E_0=mc^2
\]

Esta relación no quiere decir que toda energía sea simplemente «masa multiplicada por una constante». Forma parte de una relación relativista más general entre energía, momento y masa.

**Cuándo se conserva**

En sistemas con simetría temporal adecuada aparece una cantidad conservada asociada a la energía. La afirmación requiere matices en contextos cosmológicos de espacio-tiempo dinámico.

### Conexión narrativa

La energía nos ayuda a estudiar cambios y transferencias. También abre la ruta jugable hacia **Cuantización** conforme a las dependencias reales del árbol. Esa conexión de juego no significa que la cuantización se deduzca únicamente de definir la energía.

---

# F00.16 — Momento

**Constelación:** III — Simetrías y conservación  
**Estado:** candidato editorial DEV

### Pregunta de curiosidad

**¿Por qué cuesta más detener un camión lento que una pelota que viene hacia ti a gran velocidad?**

### Introducción visible

Imagina dos objetos que se mueven hacia ti: una pelota ligera y un camión enorme. Aunque la pelota viaje más rápido, detener ambos puede implicar cambios de movimiento muy diferentes.

Para describir esa diferencia, la física utiliza el **momento lineal**: una magnitud vectorial que combina la masa y la velocidad en la mecánica clásica.

### En pocas palabras

**El momento lineal describe una propiedad del movimiento que tiene magnitud y dirección. En un sistema con fuerza externa neta nula, el momento total se conserva, aunque los objetos individuales cambien su velocidad.**

### Detalles

En el lenguaje cotidiano «tener mucho impulso» puede significar simplemente avanzar con entusiasmo. En física, el momento lineal es una magnitud definida que nos ayuda a describir choques, retrocesos y cambios de movimiento.

No depende solo de cuánto corre un objeto. También importa su masa y, sobre todo, **la dirección** en la que se mueve. Dos objetos con momentos iguales y opuestos pueden tener momento total cero, incluso estando ambos en movimiento.

Una fuerza que actúa durante un intervalo de tiempo modifica el momento. Por eso las colisiones resultan tan interesantes: cuerpos que intercambian fuerzas pueden cambiar considerablemente sus momentos individuales mientras el total del sistema permanece constante, si el impulso externo es despreciable.

En la mecánica clásica, para un cuerpo de masa constante, el momento es el producto de masa por velocidad. A velocidades relativistas, la expresión requiere una corrección; la idea general de conservación sigue siendo fundamental.

No confundas el momento lineal con la energía cinética. Ambos intervienen en un choque, pero no son la misma magnitud y no obedecen las mismas reglas de conservación en todos los procesos.

### Ejemplos

**1. Dos patinadores que se empujan**

Dos personas inicialmente quietas sobre hielo casi sin rozamiento se empujan y se alejan en sentidos contrarios. Sus momentos pueden ser opuestos y compensarse en el total. La persona de menor masa puede adquirir mayor velocidad.

**2. El airbag de un coche**

En una colisión, el momento de una persona debe cambiar para detenerla. Aumentar el tiempo durante el cual se produce esa variación puede reducir la fuerza media necesaria para un mismo cambio de momento. El airbag no hace desaparecer el momento: modifica las condiciones del frenado.

**3. Dos carritos que chocan**

Dos carritos pueden quedar unidos después de un impacto. Su energía cinética total puede disminuir, pero el momento total se conserva aproximadamente si las fuerzas externas horizontales son despreciables. Ese contraste explica por qué momento y energía cinética se estudian por separado.

### Profundizar

**Definición clásica**

Para una partícula en mecánica newtoniana:

\[
\mathbf p=m\mathbf v
\]

El vector \(\mathbf p\) apunta en la dirección de la velocidad si la masa es positiva. Su unidad en el SI es kilogramo·metro por segundo.

**Fuerza e impulso**

La segunda ley de Newton se expresa de forma general clásica como:

\[
\mathbf F_{\mathrm{neta}}=\frac{d\mathbf p}{dt}
\]

Integrada en el tiempo, da el impulso:

\[
\mathbf J=\int_{t_1}^{t_2}\mathbf F_{\mathrm{neta}}\,dt=\Delta\mathbf p
\]

**La corrección relativista**

Para una partícula con masa en reposo \(m\), la expresión relativista es:

\[
\mathbf p=\gamma m\mathbf v,\qquad\gamma=\frac{1}{\sqrt{1-v^2/c^2}}
\]

Cuando \(v\) es mucho menor que \(c\), el factor \(\gamma\) se aproxima a uno y recuperamos \(\mathbf p\approx m\mathbf v\).

### Conexión narrativa

Si el momento lineal nos ayuda a describir el movimiento en una dirección, ¿qué magnitud necesitamos para estudiar el **movimiento alrededor de un eje**? Ahí aparece el momento angular.

---

# F00.17 — Momento angular

**Constelación:** III — Simetrías y conservación  
**Estado:** candidato editorial DEV

### Pregunta de curiosidad

**¿Por qué una patinadora gira más rápido cuando recoge los brazos?**

### Introducción visible

Una patinadora comienza a girar con los brazos extendidos. Después los acerca al cuerpo y su velocidad de giro aumenta. Parece que ha creado movimiento de la nada, pero no es así.

Para entenderlo necesitamos una magnitud diferente del momento lineal: el **momento angular**, que describe aspectos del movimiento respecto de un punto o eje.

### En pocas palabras

**El momento angular caracteriza el movimiento rotacional respecto de una referencia. Si el torque externo neto respecto al punto elegido es nulo, el momento angular total del sistema se conserva.**

### Detalles

Un objeto puede desplazarse en línea recta y aun así tener momento angular respecto de un punto que no se encuentra sobre su trayectoria. Por eso no basta con decir que es «la cantidad de giro»: también importa **desde dónde** estudiamos el movimiento.

En una patinadora que gira, cambiar la distribución de masa respecto al eje modifica el momento de inercia. Si el momento angular sobre ese eje permanece aproximadamente constante, una disminución del momento de inercia se acompaña de un aumento de la velocidad angular.

Eso no implica conservar siempre la energía cinética de rotación. Al recoger los brazos, la patinadora realiza trabajo con sus músculos y puede aumentar esa energía.

La relación es más general que una figura patinando: el momento angular aparece en órbitas, ruedas, moléculas y en numerosos sistemas físicos. Su conservación está relacionada con la invariancia de las leyes ante rotaciones bajo las hipótesis apropiadas.

No confundamos el momento angular clásico de una trayectoria con el **espín cuántico** de las partículas, que también es momento angular pero no equivale simplemente a una bolita girando sobre sí misma.

### Ejemplos

**1. La patinadora y sus brazos**

Al acercar los brazos al cuerpo disminuye su momento de inercia y aumenta su velocidad angular, aproximadamente con momento angular constante si el torque externo es pequeño. El esfuerzo muscular explica por qué puede aumentar su energía cinética de rotación.

**2. La rueda de una bicicleta**

Una rueda en rotación posee momento angular. Cambiar la dirección de su eje requiere un torque, y el comportamiento resultante puede sorprender cuando se sostiene la rueda por un extremo. El fenómeno no se reduce a que «la rueda quiere seguir girando»: depende de vectores y fuerzas.

**3. Un planeta alrededor del Sol**

En un modelo donde la fuerza gravitatoria es central, el torque respecto al Sol es nulo y se conserva el momento angular orbital. En una órbita elíptica ideal, el planeta se mueve más deprisa cerca del Sol. Es parte de la explicación de la ley de las áreas de Kepler.

### Profundizar

**Definición vectorial**

El momento angular orbital de una partícula respecto de un origen elegido es:

\[
\mathbf L=\mathbf r\times\mathbf p
\]

El producto vectorial indica que \(\mathbf L\) depende de la posición relativa \(\mathbf r\), del momento lineal \(\mathbf p\) y del ángulo entre ambos.

**Torque y variación del momento angular**

En mecánica clásica, respecto a un origen inercial fijo:

\[
\boldsymbol\tau_{\mathrm{ext}}=\frac{d\mathbf L}{dt}
\]

Si el torque externo neto es cero, \(\mathbf L\) se conserva. Para un sistema de partículas hay que considerar el total y las hipótesis sobre las interacciones internas.

**El caso de una rotación alrededor de un eje fijo**

En una descripción sencilla de un cuerpo rígido que gira alrededor de un eje principal:

\[
L=I\omega
\]

Así, cuando \(L\) permanece constante, una reducción de \(I\) puede acompañarse de un aumento de \(\omega\). Esa expresión escalar es útil en el caso indicado, pero **no sustituye a la formulación vectorial general**.

### Conexión narrativa

El momento angular completa nuestra primera panorámica de grandes magnitudes conservadas. A partir de aquí podremos explorar cómo la física describe sistemas microscópicos, donde también intervienen la cuantización y formas de momento angular que desafían la intuición clásica.

---

## Notas de revisión científica y editorial (no forman parte de las fichas)

**Referencias de contraste orientativas:**

- John Baez, *Noether's Theorem*: https://math.ucr.edu/home/baez/noether.html
- University of Cambridge, *Classical Dynamics — Noether's Theorem and Symmetries*: https://www.damtp.cam.ac.uk/user/bg268/Lecture_7.pdf
- OpenStax, *University Physics Volume 1*, conservación de energía: https://openstax.org/books/university-physics-volume-1/pages/8-3-conservation-of-energy
- OpenStax, *University Physics Volume 1*, conservación del momento angular: https://openstax.org/books/university-physics-volume-1/pages/11-3-conservation-of-angular-momentum
- OpenStax, *University Physics Volume 1*, ecuaciones de rotación: https://openstax.org/books/university-physics-volume-1/pages/11-key-equations

**Revisiones pendientes antes de declarar `published`:**

1. Comprobar en F00.12 y F00.13 las hipótesis del teorema de Noether, incluyendo el papel de las condiciones de contorno, las simetrías de la acción y el significado de energía en sistemas generales.
2. Verificar que las afirmaciones sobre conservación global y cosmología no se transforman en slogans absolutos.
3. Revisar convenciones vectoriales y de coordenadas de las fórmulas de F00.11, F00.16 y F00.17 y el renderizado de KaTeX.
4. Confirmar que la secuencia narrativa no modifica prerrequisitos reales: la fixture es la única fuente de progresión.
5. Evitar representar el espín cuántico como una esfera material girando. El tema se desarrollará en otro estrato.
6. Mantener `candidate` y español hasta completar revisión científica/editorial y traducción EN.
