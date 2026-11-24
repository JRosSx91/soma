# GAM-03B · CONTENT-S00-02

**Estrato 00 — La arquitectura invisible del universo**  
**Bloque II — Espacio-tiempo y relatividad (F00.05–F00.09)**  
**Estado editorial:** `candidate` — contenido educativo para prototipo DEV; pendiente de revisión científica/editorial final y localización EN.  
**Alcance:** cinco fichas, sin modificaciones de prerrequisitos, relaciones jugables, costes ni balance.  
**Estilo:** divulgación intuitiva, analogías cotidianas con límites explícitos y profundización opcional. Los términos científicos no deben confundirse con las reglas de desbloqueo del juego.

## Contrato editorial de integración

Cada ficha tiene: `Pregunta de curiosidad`, `Introducción visible`, `En pocas palabras`, `Detalles`, `Ejemplos` (tres), `Profundizar` y `Conexión narrativa`. La **introducción visible** es breve y se muestra entre la pregunta y «En pocas palabras»; **Detalles** continúa la explicación sin repetirla. Los bloques de requisitos, sucesores y generadores deben extraerse de la fixture y del motor, nunca de la narrativa. Conservar las fórmulas en LaTeX. No interpretar analogías geométricas como explicaciones literales del funcionamiento del cosmos.

---

# F00.05 — Espacio-tiempo

**Constelación:** II — Espacio-tiempo y relatividad  
**Estado:** candidato editorial DEV

### Pregunta de curiosidad

**¿Y si decir dónde ocurre algo no bastara para describirlo, y también necesitáramos saber cuándo?**

### Introducción visible

Imagina que quedas con alguien en una cafetería. Le das la dirección exacta, pero olvidas decirle la hora. Aunque llegue al lugar correcto, tal vez no os encontréis.

En física sucede algo parecido: para identificar un acontecimiento necesitamos describir **dónde** ocurre y **cuándo** ocurre. A esa combinación la llamamos **espacio-tiempo**.

### En pocas palabras

**El espacio-tiempo reúne posiciones y tiempos en una estructura de cuatro dimensiones. Distintos observadores pueden separar espacio y tiempo de maneras diferentes, pero pueden describir los mismos acontecimientos físicos.**

### Detalles

En nuestra experiencia utilizamos tres coordenadas para localizar algo en el espacio y una para situarlo en el tiempo. Un acontecimiento —como el destello de una bombilla— queda definido por esas cuatro coordenadas dentro de un sistema de referencia.

Antes de la relatividad era habitual tratar el espacio como un escenario fijo y el tiempo como un reloj universal. La relatividad especial mostró que esa separación no funciona de la misma manera para todos los observadores en movimiento relativo.

Dos observadores pueden discrepar sobre el tiempo transcurrido o la distancia entre determinados sucesos, sin que uno esté midiendo mal. Sus mediciones obedecen relaciones precisas y comparten una estructura física común.

La relatividad general amplía esta idea: la geometría del espacio-tiempo puede ser curva. La materia y otras formas de energía participan en esa geometría, y esa geometría influye en cómo se mueven los cuerpos y la luz.

**No imagines el espacio-tiempo como una tela material que flota dentro de otro espacio.** Es una descripción geométrica de relaciones físicas entre acontecimientos, no una sábana que necesite un lugar externo donde apoyarse.

### Ejemplos

**1. La cita con coordenadas incompletas**

Una dirección sin hora puede ser inútil para encontrarse con alguien. En un laboratorio, registrar un destello exige tanto su posición como el instante de emisión. Esto ilustra por qué hablamos de *acontecimientos*, no únicamente de lugares.

**2. Dos cámaras que graban un tren**

Imagina dos observadores que se mueven uno respecto al otro. Cada uno usa sus propios relojes y reglas para registrar lo que sucede en un tren. Pueden asignar coordenadas diferentes a los mismos destellos, pero ambos describen los mismos sucesos físicos. **La analogía no significa que la percepción visual por sí sola produzca los efectos relativistas:** hablamos de mediciones hechas con reglas y relojes sincronizados.

**3. El dibujo de un mapa y sus coordenadas**

Puedes representar una misma ciudad con distintos mapas: las coordenadas cambian, pero las calles no se transforman por escoger otro dibujo. En el espacio-tiempo ocurre algo semejante con los sistemas de coordenadas, aunque con una diferencia decisiva: las transformaciones entre observadores inerciales mezclan medidas espaciales y temporales de una forma específica.

### Profundizar

**¿Qué significa «cuatro dimensiones»?**

Un acontecimiento puede etiquetarse mediante \((t,x,y,z)\). Las tres últimas coordenadas indican posición; la primera, tiempo. Aunque sean cuatro coordenadas, **el tiempo no es simplemente una cuarta dirección espacial intercambiable con las demás**: la geometría relativista distingue entre separaciones temporales, luminosas y espaciales.

**El intervalo espacio-temporal**

En un sistema inercial del espacio-tiempo plano, y usando la convención de signos \((+---)\), el intervalo entre dos acontecimientos es:

\[
s^2=c^2(\Delta t)^2-(\Delta x)^2-(\Delta y)^2-(\Delta z)^2
\]

Aquí \(c\) es la velocidad de la luz en el vacío. A diferencia de la distancia espacial o del intervalo de tiempo coordenado por separado, \(s^2\) tiene el mismo valor para todos los observadores inerciales que describen esos dos acontecimientos.

Para sucesos con separación temporal \((s^2>0)\), el tiempo propio entre ambos a lo largo de una trayectoria inercial recta está relacionado con \(s\) mediante \(\Delta\tau=\sqrt{s^2}/c\). En trayectorias generales, el tiempo propio se calcula a lo largo de la línea de mundo.

**¿Y en presencia de gravedad?**

La relatividad general utiliza una *métrica* más general para describir la geometría local del espacio-tiempo. No podemos aplicar sin más la expresión anterior a regiones extensas donde la curvatura sea relevante.

### Conexión narrativa

Ya podemos describir un acontecimiento mediante espacio y tiempo. El siguiente paso es entender por qué observadores en movimiento relativo pueden medir distancias, duraciones y simultaneidad de maneras distintas: **relatividad especial**.

---

# F00.06 — Relatividad especial

**Constelación:** II — Espacio-tiempo y relatividad  
**Estado:** candidato editorial DEV

### Pregunta de curiosidad

**¿Cómo es posible que dos personas midan duraciones diferentes y que ambas tengan razón?**

### Introducción visible

Imagina que dos viajeros llevan relojes idénticos. Uno permanece en una estación y otro pasa a gran velocidad en un vehículo. Cuando comparan mediciones según un procedimiento bien definido, sus resultados pueden ser diferentes.

La explicación no está en un reloj defectuoso: **el movimiento relativo influye en cómo se relacionan las medidas de espacio y tiempo**.

### En pocas palabras

**La relatividad especial describe la física en sistemas inerciales y establece que la velocidad de la luz en el vacío es la misma para todos ellos. De esa estructura se derivan efectos como la dilatación temporal y la relatividad de la simultaneidad.**

### Detalles

A principios del siglo XX, Einstein formuló una teoría a partir de dos ideas: las leyes de la física tienen la misma forma en todos los sistemas de referencia inerciales, y la luz en el vacío se propaga con la misma velocidad \(c\) para todos esos observadores, independientemente del movimiento de la fuente.

Si las velocidades se combinaran siempre como en nuestra intuición cotidiana, estas dos ideas chocarían. La solución es sorprendente: **las medidas del espacio y del tiempo deben relacionarse de otra manera**.

Un reloj que se mueve respecto a un observador inercial puede acumular menos tiempo propio entre encuentros que el reloj de ese observador, según las trayectorias consideradas. También aparece la contracción de longitudes medidas en la dirección del movimiento y la relatividad de la simultaneidad de acontecimientos separados espacialmente.

Esto no significa que «todo sea relativo». Las leyes físicas, la velocidad \(c\) y ciertas cantidades espacio-temporales son invariantes. La teoría impone relaciones precisas y comprobables, no una libertad para elegir cualquier resultado.

Además, ningún objeto con masa puede acelerarse hasta alcanzar \(c\) mediante un aporte finito de energía. La relatividad especial no dice que no pueda haber movimientos aparentes superlumínicos en una proyección o expansión de distancias cosmológicas; esos casos requieren distinguir cuidadosamente qué velocidad se está describiendo.

### Ejemplos

**1. El reloj de luz**

Imagina un reloj ideal que marca cada pulso cuando la luz rebota entre dos espejos. Si lo observas pasar lateralmente, la luz sigue un recorrido diagonal respecto a ti. Como su velocidad sigue siendo \(c\), el intervalo entre pulsos medido en tu sistema es mayor. Es un recurso útil para visualizar la dilatación temporal en el marco adecuado, no una afirmación de que los relojes reales necesiten espejos.

**2. Dos relámpagos y un tren**

Una persona situada en el andén puede determinar que dos destellos separados ocurrieron simultáneamente en su sistema. Un observador inercial que se mueve con respecto al andén puede asignarles tiempos distintos. Para comparar correctamente hay que descontar el tiempo que tarda la luz en llegar y utilizar relojes sincronizados en cada sistema; no basta con decir quién vio primero el destello.

**3. Partículas que llegan hasta nosotros**

Los muones producidos por rayos cósmicos en la atmósfera tienen una vida media breve en reposo. Muchos alcanzan la superficie terrestre porque su movimiento relativista modifica la relación entre el tiempo propio de la partícula y el tiempo medido desde la Tierra. No sobreviven porque «se hagan más resistentes»: sus procesos siguen su tiempo propio.

### Profundizar

**El factor de Lorentz**

Para velocidad relativa \(v\) entre sistemas inerciales:

\[
\gamma=\frac{1}{\sqrt{1-v^2/c^2}}
\]

El factor \(\gamma\) es al menos 1 para \(|v|<c\). A velocidades muy inferiores a \(c\), es prácticamente 1 y los efectos relativistas suelen resultar minúsculos.

**Tiempo propio y tiempo coordenado**

Para un reloj en movimiento uniforme respecto a un sistema inercial:

\[
\Delta t=\gamma\,\Delta\tau
\]

\(\Delta\tau\) es el tiempo propio registrado por el reloj entre dos acontecimientos de su trayectoria; \(\Delta t\), el intervalo de tiempo asignado en ese sistema inercial. **Hay que especificar qué sucesos, qué relojes y qué sistemas se comparan**; no es correcto afirmar sin contexto que «el tiempo de uno va más lento».

**Energía y masa**

La equivalencia masa-energía en reposo se expresa como:

\[
E_0=mc^2
\]

Esto no significa que toda la energía de un cuerpo sea siempre solo \(mc^2\): para un cuerpo en movimiento hay además energía cinética, y la expresión completa depende de su energía y momento.

**¿Qué no incluye esta teoría?**

La relatividad especial describe el espacio-tiempo plano. Puede utilizar observadores acelerados y coordenadas no inerciales, pero no constituye por sí sola una teoría dinámica de la gravedad. Para eso necesitaremos la relatividad general.

### Conexión narrativa

La relatividad especial nos enseña que espacio y tiempo forman una estructura común. Ahora podemos preguntarnos cómo encaja la **gravitación** en esa imagen y por qué una descripción geométrica resultará tan poderosa.

---

# F00.07 — Gravitación

**Constelación:** II — Espacio-tiempo y relatividad  
**Estado:** candidato editorial DEV

### Pregunta de curiosidad

**¿Qué tienen en común una manzana que cae, una marea oceánica y la órbita de la Luna?**

### Introducción visible

Dejas caer las llaves y llegan al suelo. Levantas la mirada y descubres que la Luna lleva muchísimo tiempo orbitando la Tierra sin precipitarse directamente sobre ella.

Detrás de esas escenas aparentemente distintas hay un protagonista compartido: **la gravitación**.

### En pocas palabras

**La gravitación es la interacción responsable de la atracción gravitatoria entre cuerpos y de fenómenos como las órbitas. Newton la describió con enorme éxito; la relatividad general ofrece una descripción más profunda mediante la geometría del espacio-tiempo.**

### Detalles

En la vida cotidiana decimos que la gravedad «tira de las cosas hacia abajo». Es una descripción práctica cerca de la superficie terrestre, pero la misma interacción explica por qué los planetas orbitan el Sol y por qué los satélites pueden permanecer alrededor de la Tierra.

Isaac Newton formuló una ley que relaciona la atracción entre dos masas con su separación. Con ella pudo describirse una enorme cantidad de fenómenos, desde trayectorias de proyectiles hasta movimientos planetarios.

Una órbita no consiste en que la gravedad haya dejado de actuar. Un satélite sigue cayendo hacia la Tierra, pero tiene suficiente velocidad transversal para que su trayectoria continúe rodeándola en lugar de impactar en la superficie, siempre que otras condiciones lo permitan.

La gravedad tampoco equivale al peso que sentimos. **El peso aparente es lo que registra, por ejemplo, una báscula cuando el suelo ejerce una fuerza de apoyo sobre nosotros.** Durante una caída libre ideal podemos sentir ingravidez aunque la gravitación siga presente.

La teoría de Newton funciona extraordinariamente bien en numerosos contextos. Cuando necesitamos mayor precisión o estudiamos campos intensos, la relatividad general describe la gravitación mediante el espacio-tiempo curvo.

### Ejemplos

**1. La pelota y el satélite**

Lanza una pelota horizontalmente: además de avanzar, desciende. Imagina lanzamientos cada vez más rápidos desde una altura idealizada y sin resistencia del aire. En determinadas condiciones, la trayectoria puede curvarse alrededor de la Tierra. Es la intuición detrás del famoso «cañón de Newton»; no es una propuesta de experimento real.

**2. El ascensor que cae**

Durante un tramo de caída libre ideal, tú y un objeto que sueltas a tu lado pueden acelerar casi de la misma manera. Por eso el objeto puede parecer flotante respecto a ti. Esto ilustra la diferencia entre gravedad e ingravidez aparente; en un ascensor real las fuerzas de marea y otras condiciones importan.

**3. Las mareas**

La Luna y el Sol contribuyen a las mareas porque su influencia gravitatoria no es exactamente igual en todos los puntos de la Tierra. La rotación terrestre, la forma de las costas y la dinámica de los océanos modifican las mareas reales. **No basta con imaginar que la Luna simplemente «tira del agua del lado más cercano»**.

### Profundizar

**La ley de gravitación universal**

Para dos masas puntuales \(m_1\) y \(m_2\), separadas por una distancia \(r\):

\[
F=G\frac{m_1m_2}{r^2}
\]

\(G\) es la constante de gravitación universal. La ley da la magnitud de la fuerza atractiva en la teoría newtoniana. Para cuerpos extensos hay que considerar su distribución de masa; la forma puntual solo funciona directamente bajo ciertas aproximaciones o simetrías.

**¿Por qué los astronautas flotan?**

En la Estación Espacial Internacional la gravedad terrestre sigue siendo significativa. Los astronautas y la estación comparten aproximadamente la misma caída libre orbital, por lo que experimentan microgravedad en su entorno.

**Las limitaciones de Newton**

La teoría clásica no incorpora la propagación relativista de influencias ni todos los efectos asociados a la curvatura del espacio-tiempo. La relatividad general explica correcciones observables, como el avance del perihelio de Mercurio o la desviación gravitatoria de la luz.

**¿La gravedad funciona igual en toda escala?**

No tenemos una teoría cuántica de la gravitación confirmada experimentalmente. La descripción clásica de Einstein y las teorías cuánticas actuales son exitosas en sus respectivos dominios, pero su integración fundamental permanece abierta.

### Conexión narrativa

Con Newton podemos calcular muchísimas trayectorias. Einstein planteó una pregunta aún más profunda: **¿y si la gravedad no se describiera fundamentalmente como una fuerza ordinaria, sino mediante la geometría del espacio-tiempo?** Esa es la puerta hacia la relatividad general.

---

# F00.08 — Relatividad general

**Constelación:** II — Espacio-tiempo y relatividad  
**Estado:** candidato editorial DEV

### Pregunta de curiosidad

**¿Y si la Tierra orbitara el Sol no porque una cuerda invisible tirase de ella, sino porque sigue su camino natural en un espacio-tiempo curvo?**

### Introducción visible

Cuando estás de pie, sientes el suelo empujándote hacia arriba. Cuando caes libremente, puedes dejar de sentir ese apoyo, aunque sigas cerca de la Tierra.

Einstein tomó muy en serio esa diferencia y desarrolló una nueva forma de comprender la gravedad: **la relatividad general**.

### En pocas palabras

**La relatividad general describe la gravitación mediante la geometría del espacio-tiempo. La distribución de energía y momento se relaciona con su curvatura, y esa geometría guía el movimiento libre de cuerpos y luz.**

### Detalles

En la descripción de Newton, la gravedad aparece como una fuerza de atracción entre masas. En la relatividad general, un cuerpo que cae libremente sigue, idealmente, la trayectoria más natural permitida por la geometría del espacio-tiempo: una *geodésica*.

Esto no significa que los objetos siempre se muevan en línea recta sobre un mapa del espacio. Una geodésica es una noción geométrica de cuatro dimensiones, y su proyección espacial puede parecer una curva u órbita.

La materia y la energía están relacionadas con la curvatura del espacio-tiempo. La geometría resultante explica fenómenos que la teoría de Newton no describe con la misma precisión, como determinadas desviaciones de la luz, diferencias entre relojes en distintas alturas y detalles de movimientos orbitales.

Tal vez hayas visto la representación de una bola pesada hundiendo una sábana elástica. Es sugerente, pero **no es un modelo literal**: utiliza la gravedad terrestre para producir el hundimiento que pretende explicar, reduce las dimensiones y apenas representa la parte temporal de la geometría.

La relatividad general predice también ondas gravitacionales: perturbaciones de la geometría del espacio-tiempo que se propagan y pueden detectarse cuando las producen acontecimientos astrofísicos suficientemente intensos.

### Ejemplos

**1. Un ascensor cerrado**

Si estás en una cabina pequeña que acelera uniformemente en el espacio, ciertas experiencias locales pueden parecerse a las de estar en reposo dentro de un campo gravitatorio. Esta intuición conduce al principio de equivalencia. La semejanza es **local**: experimentos suficientemente amplios pueden detectar efectos de marea que distinguen un campo gravitatorio real de una aceleración simple.

**2. Una galaxia como lente**

La luz de una galaxia distante puede desviarse al pasar cerca de una gran concentración de masa. Desde la Tierra podemos observar imágenes deformadas, ampliadas o múltiples: el fenómeno de lente gravitatoria. No se debe a que la galaxia sea una lente de vidrio, sino a cómo se propaga la luz por esa geometría.

**3. Dos relojes a distinta altura**

Los relojes situados a diferentes potenciales gravitatorios pueden acumular tiempo a ritmos distintos. Estas diferencias se miden y tienen aplicaciones prácticas en sistemas de navegación por satélite. Es un efecto de la geometría del espacio-tiempo, no un defecto de fabricación.

### Profundizar

**La idea de las geodésicas**

En la relatividad general, las trayectorias libres se describen mediante la métrica del espacio-tiempo. Para partículas masivas en caída libre ideal, las líneas de mundo son geodésicas temporales; para la luz, geodésicas nulas, en la aproximación de óptica geométrica.

**La ecuación de Einstein**

Una forma habitual de expresar la relación entre geometría y contenido de energía-momento es:

\[
G_{\mu\nu}+\Lambda g_{\mu\nu}=\frac{8\pi G}{c^4}T_{\mu\nu}
\]

- \(G_{\mu\nu}\) resume propiedades de la curvatura del espacio-tiempo.
- \(g_{\mu\nu}\) es la métrica, que permite calcular intervalos y relaciones geométricas.
- \(T_{\mu\nu}\) describe energía, momento y tensiones de la materia y los campos.
- \(\Lambda\) es la constante cosmológica.

**No hace falta dominar tensores para captar la idea:** la geometría y el contenido físico están relacionados por una ecuación comprobable. La formulación completa incluye matices y condiciones que esta ficha introductoria no desarrolla.

**¿Qué se ha observado?**

Entre las pruebas de la relatividad general están la desviación gravitatoria de la luz, el corrimiento gravitatorio al rojo, ciertas variaciones orbitales y la detección de ondas gravitacionales.

**¿Es la teoría definitiva?**

No lo sabemos. La relatividad general explica numerosos fenómenos con gran precisión, pero no existe todavía una teoría cuántica de la gravedad confirmada que describa todos los regímenes físicos.

### Conexión narrativa

Para comprender qué significa que la gravedad sea «geometría», necesitamos una herramienta conceptual más precisa que la sábana elástica: **la geometría del espacio-tiempo**.

---

# F00.09 — Geometría del espacio-tiempo

**Constelación:** II — Espacio-tiempo y relatividad  
**Estado:** candidato editorial DEV

### Pregunta de curiosidad

**¿Cómo puedes saber si un espacio está curvado sin observarlo desde fuera?**

### Introducción visible

Imagina una hormiga que vive sobre la superficie de una esfera enorme. Cerca de ella, el suelo puede parecer plano. Pero si mide caminos y construye triángulos suficientemente grandes, descubrirá que su geometría no funciona como la de una hoja de papel.

En el universo ocurre algo todavía más interesante: **podemos investigar la geometría del espacio-tiempo mediante medidas realizadas desde dentro de él**.

### En pocas palabras

**La geometría del espacio-tiempo determina cómo se miden intervalos y cómo se relacionan las trayectorias. Su curvatura puede detectarse mediante efectos físicos, sin imaginar que el universo se dobla necesariamente dentro de un espacio exterior.**

### Detalles

En geometría plana, algunas reglas nos resultan familiares: las líneas paralelas conservan su separación y los ángulos de un triángulo suman 180 grados. En una superficie curva, estas propiedades pueden cambiar al considerar regiones suficientemente grandes.

La geometría moderna permite estudiar esa curvatura desde dentro, mediante distancias, ángulos y relaciones entre trayectorias. No es necesario colocar la superficie en una dimensión adicional para definir matemáticamente su curvatura.

El espacio-tiempo relativista añade el tiempo a las tres dimensiones espaciales, con una estructura métrica distinta de la geometría euclídea ordinaria. Por eso la imagen de una cuadrícula doblada sirve para imaginar algunas deformaciones, pero no muestra toda la física.

Cuando cuerpos en caída libre parten con trayectorias próximas, su separación puede cambiar debido a la curvatura espacio-temporal. Este comportamiento está relacionado con los efectos de marea.

En relatividad general, la geometría no es solo una forma bonita de dibujar la realidad: interviene en la medida de tiempos, la propagación de la luz y el movimiento de cuerpos libres.

### Ejemplos

**1. El triángulo sobre la Tierra**

Dibuja mentalmente un triángulo sobre una esfera utilizando segmentos de círculos máximos: desde el polo norte, baja por dos meridianos separados 90 grados hasta el ecuador y une sus extremos sobre él. Ese triángulo tiene tres ángulos rectos, cuya suma es 270 grados. **Esta es una propiedad de la superficie esférica**, no una afirmación de que todos los triángulos físicos del universo se comporten así.

**2. Dos caminos inicialmente paralelos**

Dos viajeros parten del ecuador terrestre hacia el norte por meridianos diferentes. Al principio sus caminos pueden parecer paralelos localmente, pero terminan encontrándose en el polo. La convergencia ayuda a imaginar cómo la geometría afecta a las trayectorias. En el espacio-tiempo, la comparación matemática involucra líneas de mundo y no simplemente rutas dibujadas sobre un globo.

**3. Dos objetos en caída libre**

Dos pequeños objetos soltados a distintas posiciones cerca de la Tierra no experimentan necesariamente la misma aceleración relativa. Sus trayectorias pueden acercarse o separarse ligeramente. Estas diferencias —efectos de marea— permiten detectar propiedades del campo gravitatorio que no se eliminan eligiendo un sistema de referencia local en caída libre.

### Profundizar

**La métrica: una regla para medir**

En geometría euclídea usamos una expresión como \(d^2=dx^2+dy^2+dz^2\). En relatividad general empleamos una métrica \(g_{\mu\nu}\) que relaciona separaciones infinitesimales:

\[
ds^2=g_{\mu\nu}\,dx^{\mu}dx^{\nu}
\]

Los índices \(\mu\) y \(\nu\) recorren cuatro coordenadas; la notación indica una suma sobre los índices repetidos. La métrica tiene firma lorentziana, por lo que intervalos temporales y espaciales no se combinan como longitudes euclídeas ordinarias.

**Curvatura intrínseca y efecto de marea**

La curvatura no se identifica simplemente con que una línea se vea doblada en un dibujo. Matemáticamente puede describirse mediante el tensor de curvatura de Riemann, que interviene en la desviación relativa de geodésicas cercanas.

Una forma esquemática de la ecuación de desviación geodésica es:

\[
\frac{D^2\xi^{\mu}}{d\tau^2}=-R^{\mu}{}_{\nu\alpha\beta}\,u^{\nu}\xi^{\alpha}u^{\beta}
\]

Aquí \(\xi^{\mu}\) describe la separación entre geodésicas cercanas y \(u^{\nu}\) su movimiento. El signo exacto del tensor de curvatura depende de la convención matemática adoptada. Lo importante es la idea: **la curvatura puede manifestarse como una aceleración relativa entre trayectorias libres próximas**.

**¿Curvatura del espacio o del espacio-tiempo?**

Una sección espacial elegida por un observador puede tener una geometría determinada, pero la descripción gravitatoria completa requiere considerar la geometría **cuatridimensional** del espacio-tiempo. Una visualización de «una sábana que se hunde» no representa por sí sola esa estructura.

### Conexión narrativa

Ahora podemos reconocer por qué la relatividad general habla de curvas y geodésicas. Más adelante, el **principio de equivalencia** (F00.28) nos ayudará a comprender la relación entre caída libre, aceleración y la geometría local, sin convertirlo aquí en un prerrequisito jugable que no exista en la fixture.

---

## Notas de revisión editorial y fuentes de contraste

Estas fuentes son **referencias de comprobación** y no equivalen a una aprobación clínica, científica ni editorial de SOMA. No cambiar la calificación `candidate` automáticamente.

- Einstein Online (Max Planck): visión de espacio-tiempo y relatividad especial: https://www.einstein-online.info/en/spacetime/
- Einstein Online (Max Planck): simultaneidad: https://www.einstein-online.info/en/spotlight/now/
- Einstein Online: gravedad, geodésicas y curvatura: https://www.einstein-online.info/en/spotlight/geometry_force/
- NASA Science: relatividad general y naturaleza del espacio-tiempo: https://science.nasa.gov/astrophysics/programs/physics-of-the-cosmos/general-relativity-and-the-nature-of-spacetime/
- NASA Science: lentes gravitatorias: https://science.nasa.gov/mission/hubble/science/science-behind-the-discoveries/hubble-gravitational-lenses/
- ESA/Hubble: lente gravitatoria: https://esahubble.org/wordbank/gravitational-lensing/

### Revisión obligatoria antes de publicación

1. Verificar las convenciones de signos de las fórmulas de intervalo y desviación geodésica, especialmente si se integran con otras fichas.
2. Revisar editorialmente si la ecuación tensorial de F00.09 es apropiada para el nivel opcional «Profundizar» o si conviene presentarla con un desplegable avanzado.
3. Confirmar que los títulos narrativos no se transforman en enlaces de progresión jugable ni cambian padres y sucesores.
4. Revisar la consistencia con F00.01–F00.04 y el futuro F00.28; no hacer afirmaciones de una teoría cuántica de gravedad confirmada.
5. Preservar el texto en español hasta disponer de traducción inglesa revisada.
