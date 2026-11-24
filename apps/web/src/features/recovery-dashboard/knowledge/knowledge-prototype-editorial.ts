/**
 * Candidate educational sheets for F00.01–F00.28.
 * Sources: docs/content/gam-03b/CONTENT-S00-01.md, CONTENT-S00-02.md, CONTENT-S00-03.md, CONTENT-S00-04A.md and CONTENT-S00-04B.md.
 * DEV prototype only. This module does not declare playable requirements.
 */

export type EditorialBlock =
  | { kind: "heading"; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: readonly string[] }
  | { kind: "formula"; latex: string };

export interface EditorialExample {
  title: string;
  paragraphs: readonly string[];
}

export interface PrototypeEditorialSheet {
  code: "F00.01" | "F00.02" | "F00.03" | "F00.04" | "F00.05" | "F00.06" | "F00.07" | "F00.08" | "F00.09" | "F00.10" | "F00.11" | "F00.12" | "F00.13" | "F00.14" | "F00.15" | "F00.16" | "F00.17" | "F00.18" | "F00.19" | "F00.20" | "F00.21" | "F00.22" | "F00.23" | "F00.24" | "F00.25" | "F00.26" | "F00.27" | "F00.28";
  sequence: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28;
  editorialStatus: "candidate";
  hookQuestion: string;
  shortSummary: string;
  /** Opening paragraphs lifted out of the main explanation. Not repeated in details. */
  intro: readonly string[];
  details: readonly string[];
  narrativeTitle: string;
  narrative: readonly string[];
  examples: readonly EditorialExample[];
  deepDive: readonly EditorialBlock[];
}

const paragraph = (text: string): EditorialBlock => ({ kind: "paragraph", text });
const heading = (text: string): EditorialBlock => ({ kind: "heading", text });
const formula = (latex: string): EditorialBlock => ({ kind: "formula", latex });
const list = (items: readonly string[]): EditorialBlock => ({ kind: "list", items });

export const STRATUM_EDITORIAL_SHEETS: readonly PrototypeEditorialSheet[] = [
  {
    code: "F00.01",
    sequence: 1,
    editorialStatus: "candidate",
    hookQuestion: "¿Y si todo lo que existe, desde una galaxia hasta los átomos de tu cuerpo, formara parte de una misma realidad gobernada por leyes que podemos investigar?",
    shortSummary: "El universo físico es la realidad que investigamos mediante la física. Sus fenómenos pueden estudiarse con leyes y modelos científicos, aunque nuestro conocimiento todavía es incompleto.",
    intro: [
      "Mira a tu alrededor. Una taza sobre la mesa, la luz que entra por la ventana, el aire que respiras y las estrellas que brillan a millones de años luz parecen cosas completamente distintas.",
      "Sin embargo, todas forman parte del universo físico.",
    ],
    details: [
      "Cuando hablamos del universo físico nos referimos al conjunto de aquello que estudiamos mediante la física: la materia, la energía, el espacio, el tiempo, los campos y los fenómenos que ocurren en ellos.",
      "Lo extraordinario es que fenómenos aparentemente muy diferentes pueden describirse mediante las mismas leyes.",
      "La gravedad que hace caer una pelota también participa en el movimiento de los planetas. La física que explica la luz de una bombilla también nos ayuda a comprender la radiación de las estrellas.",
      "Para investigar esta realidad, la ciencia construye **modelos**: representaciones que permiten explicar observaciones y hacer predicciones comprobables.",
      "Pero un modelo no es la realidad misma. Es una herramienta para comprender determinados aspectos de ella.",
      "Y ahí comienza nuestra expedición: no intentando responderlo todo de golpe, sino descubriendo, paso a paso, qué sabemos, cómo lo sabemos y qué preguntas siguen abiertas.",
    ],
    narrativeTitle: "Conexión con el siguiente descubrimiento",
    narrative: [
      "Para describir dónde ocurren los fenómenos necesitamos comprender el **espacio**.",
      "Y para estudiar cuándo suceden y cuánto duran, necesitamos comprender el **tiempo**.",
    ],
    examples: [
      {
        title: "1. La pelota y la Luna",
        paragraphs: [
          "Lanza una pelota hacia arriba y volverá a caer. Observa la Luna y descubrirás que sigue una trayectoria alrededor de la Tierra.",
          "A primera vista parecen situaciones diferentes, pero ambas pueden describirse mediante la gravedad.",
          "La física permite descubrir principios comunes detrás de fenómenos muy distintos.",
        ],
      },
      {
        title: "2. Tu teléfono y una estrella",
        paragraphs: [
          "La pantalla de tu teléfono emite luz. Una estrella también.",
          "Aunque sus mecanismos de emisión sean diferentes, la luz que recibimos puede estudiarse mediante los mismos principios del electromagnetismo.",
          "Eso es parte de la belleza de la ciencia: encontrar patrones universales.",
        ],
      },
      {
        title: "3. Un mapa nunca es el territorio",
        paragraphs: [
          "Un mapa de una ciudad puede ayudarte a llegar a casa sin representar cada árbol, cada piedra y cada grieta del asfalto.",
          "Los modelos científicos funcionan de manera parecida.",
          "Representan los aspectos que necesitamos para explicar o predecir un fenómeno, pero tienen condiciones de aplicación y límites.",
        ],
      },
    ],
    deepDive: [
      heading("¿Qué es exactamente una ley física?"),
      paragraph("Una ley física describe una regularidad de la naturaleza mediante relaciones que pueden ponerse a prueba."),
      paragraph("Por ejemplo, la segunda ley de Newton establece, en su formulación clásica para un cuerpo de masa constante:"),
      formula("\\vec F_{\\mathrm{neta}}=m\\vec a"),
      paragraph("Relaciona la fuerza neta aplicada a un cuerpo con la aceleración que experimenta."),
      paragraph("Es extraordinariamente útil para describir muchos movimientos cotidianos, pero no es una descripción universal de todos los fenómenos físicos."),
      paragraph("A velocidades cercanas a la de la luz o en determinadas condiciones gravitatorias necesitamos teorías relativistas. Para describir muchos fenómenos microscópicos necesitamos física cuántica."),
      paragraph("Una teoría nueva no convierte necesariamente en inútil a la anterior: puede explicar por qué funcionaba dentro de ciertos límites y ampliar nuestro conocimiento."),
      heading("¿Conocemos todo el universo?"),
      paragraph("No. Podemos estudiar el universo observable, pero no sabemos si el universo completo coincide con esa región accesible a nuestras observaciones."),
      paragraph("Tampoco disponemos de una teoría confirmada que responda definitivamente a todas las preguntas sobre las condiciones más tempranas del cosmos o sobre su origen último."),
      paragraph("**La física no consiste en tener todas las respuestas, sino en desarrollar formas cada vez mejores de investigar las preguntas.**"),
    ],
  },
  {
    code: "F00.02",
    sequence: 2,
    editorialStatus: "candidate",
    hookQuestion: "Si desaparecieran todos los objetos de una habitación, ¿seguiría existiendo el espacio que ocupaban?",
    shortSummary: "El espacio nos permite describir dónde están las cosas, cómo se separan y cómo se mueven. En nuestra experiencia tiene tres dimensiones, pero su geometría no tiene por qué ser siempre plana.",
    intro: [
      "Imagina que estás sentado en una habitación.",
      "Puedes señalar lo que tienes delante, lo que queda detrás de ti y lo que está por encima de tu cabeza. También puedes medir la distancia que te separa de la puerta.",
    ],
    details: [
      "Todo eso es posible porque describimos las posiciones y separaciones mediante el espacio.",
      "En nuestra experiencia cotidiana utilizamos tres dimensiones espaciales: largo, ancho y alto.",
      "Con ellas podemos localizar objetos, describir movimientos y medir distancias.",
      "Pero hay algo fascinante: **el espacio no es simplemente una enorme caja invisible donde suceden las cosas**.",
      "Durante siglos fue habitual imaginarlo como un escenario fijo e independiente de lo que contiene. La relatividad cambió profundamente esa visión.",
      "En la física moderna, las mediciones espaciales están relacionadas con el observador y con el tiempo. Además, la geometría del espacio-tiempo puede ser curva.",
      "Eso significa que la descripción física del espacio es mucho más interesante de lo que sugiere nuestra intuición cotidiana.",
    ],
    narrativeTitle: "Conexión con el siguiente descubrimiento",
    narrative: [
      "Ya sabemos cómo describir **dónde** ocurren las cosas.",
      "Pero también necesitamos saber **cuándo** ocurren.",
    ],
    examples: [
      {
        title: "1. El GPS de tu teléfono",
        paragraphs: [
          "Cuando consultas un mapa, tu ubicación se representa mediante coordenadas.",
          "Esas coordenadas permiten identificar una posición dentro de un sistema de referencia.",
          "En física hacemos algo parecido: elegimos referencias para describir posiciones y movimientos.",
        ],
      },
      {
        title: "2. Una hormiga sobre una esfera",
        paragraphs: [
          "Imagina una hormiga caminando por la superficie de una pelota enorme.",
          "Si solo pudiera moverse sobre esa superficie, dispondría de dos dimensiones de movimiento: podría avanzar en distintas direcciones, pero siempre permanecería sobre la esfera.",
          "Y aunque su pequeño entorno pudiera parecer plano, la superficie completa es curva.",
          "Es una analogía útil para comprender que un espacio puede tener geometría curva. No significa que nuestro espacio tridimensional sea necesariamente la superficie de una esfera.",
        ],
      },
      {
        title: "3. El camino más corto",
        paragraphs: [
          "Sobre una hoja plana, el camino más corto entre dos puntos es una línea recta.",
          "Sobre la superficie de la Tierra, las rutas más cortas que permanecen en la superficie siguen arcos de círculos máximos.",
          "La geometría del espacio determina cómo medimos los caminos y las distancias.",
        ],
      },
    ],
    deepDive: [
      heading("¿Qué significa que el espacio tenga tres dimensiones?"),
      paragraph("Significa que, dentro de una descripción local ordinaria, necesitamos tres coordenadas espaciales independientes para localizar un punto."),
      paragraph("En un espacio euclídeo tridimensional, la distancia entre dos puntos puede calcularse mediante:"),
      formula("d=\\sqrt{(\\Delta x)^2+(\\Delta y)^2+(\\Delta z)^2}"),
      paragraph("Esta expresión es adecuada para la geometría plana familiar."),
      paragraph("En geometrías curvas, el cálculo de las distancias requiere una descripción matemática más general."),
      heading("¿Puede existir espacio sin materia?"),
      paragraph("La física estudia soluciones de sus teorías en las que hay regiones sin materia ordinaria."),
      paragraph("Pero vacío no significa necesariamente ausencia de toda estructura física. En la descripción moderna intervienen los campos, y la relatividad general permite estudiar geometrías del espacio-tiempo incluso en regiones sin materia local."),
      heading("¿Y qué ocurre con el tiempo?"),
      paragraph("En relatividad, las distancias y los intervalos temporales no pueden tratarse siempre como cantidades independientes y absolutas."),
      paragraph("Su relación nos llevará al concepto de espacio-tiempo."),
    ],
  },
  {
    code: "F00.03",
    sequence: 3,
    editorialStatus: "candidate",
    hookQuestion: "¿Y si dos relojes perfectamente construidos pudieran medir tiempos diferentes sin que ninguno estuviera estropeado?",
    shortSummary: "El tiempo permite ordenar acontecimientos y medir duraciones. Su transcurso medido depende del movimiento y de la gravedad, aunque esas diferencias normalmente pasen desapercibidas.",
    intro: [
      "Un segundo parece algo sencillo.",
      "Lo contamos mentalmente, lo vemos avanzar en un reloj y lo utilizamos para organizar nuestra vida.",
      "Pero ¿qué estamos midiendo realmente?",
    ],
    details: [
      "El tiempo nos permite ordenar acontecimientos y medir cuánto duran los procesos.",
      "Una canción empieza y termina. Una planta crece. Tu corazón late. La Tierra gira.",
      "Para medir duraciones utilizamos procesos físicos regulares, como las oscilaciones de ciertos sistemas atómicos.",
      "Lo sorprendente es que **el tiempo no es un reloj universal que avanza exactamente igual para todos**.",
      "Según la teoría de la relatividad, dos relojes pueden acumular tiempos diferentes dependiendo de cómo se muevan y del campo gravitatorio en el que se encuentren.",
      "En nuestra vida cotidiana estas diferencias suelen ser diminutas, pero pueden medirse.",
      "Por eso el tiempo es mucho más que una sucesión de números en una pantalla: es una parte fundamental de cómo describimos los acontecimientos del universo.",
    ],
    narrativeTitle: "Conexión con el siguiente descubrimiento",
    narrative: [
      "Ya tenemos dos ingredientes fundamentales: espacio y tiempo.",
      "La relatividad nos mostrará que no pueden entenderse siempre como escenarios independientes.",
    ],
    examples: [
      {
        title: "1. Dos relojes en lugares diferentes",
        paragraphs: [
          "Imagina dos relojes atómicos idénticos: uno situado a mayor altura y otro más cerca de la superficie terrestre.",
          "La relatividad general predice que, si permanecen en reposo respecto a la Tierra, el reloj situado a mayor altura acumulará tiempo ligeramente más rápido debido a la diferencia de potencial gravitatorio.",
          "La diferencia es pequeña, pero real y medible.",
        ],
      },
      {
        title: "2. Los satélites GPS",
        paragraphs: [
          "Los relojes de los satélites de navegación experimentan efectos relativistas debidos tanto a su movimiento como a la gravedad.",
          "Los sistemas GPS deben tenerlos en cuenta para mantener la precisión de sus cálculos.",
          "La relatividad no es solo una teoría sobre fenómenos lejanos: también interviene en tecnologías que utilizamos cada día.",
        ],
      },
      {
        title: "3. El café que se enfría",
        paragraphs: [
          "Deja una taza de café caliente sobre la mesa.",
          "Con el tiempo, tenderá a aproximarse a la temperatura ambiente.",
          "Observamos procesos que muestran una dirección característica: el calor fluye espontáneamente del cuerpo más caliente al más frío, en estas condiciones.",
          "Esto está relacionado con la termodinámica y la entropía.",
          "Pero cuidado: **la dirección termodinámica de muchos procesos no demuestra por sí sola qué es el tiempo ni por qué existe**.",
        ],
      },
    ],
    deepDive: [
      heading("¿Cómo se define un segundo?"),
      paragraph("En el Sistema Internacional, el segundo se define mediante la frecuencia de una transición específica del átomo de cesio-133."),
      paragraph("Esto permite construir patrones de tiempo extremadamente precisos."),
      heading("¿Qué es el tiempo propio?"),
      paragraph("En relatividad, el tiempo propio es el tiempo medido por un reloj a lo largo de su trayectoria por el espacio-tiempo."),
      paragraph("En relatividad especial, para un movimiento uniforme respecto a un sistema inercial, el intervalo de tiempo propio satisface:"),
      formula("\\Delta\\tau=\\Delta t\\sqrt{1-\\frac{v^2}{c^2}}"),
      paragraph("Aquí:"),
      list([
        "\\(\\Delta\\tau\\) es el tiempo propio del reloj en movimiento.",
        "\\(\\Delta t\\) es el intervalo temporal en el sistema de referencia considerado.",
        "\\(v\\) es la velocidad relativa.",
        "\\(c\\) es la velocidad de la luz en el vacío.",
      ]),
      paragraph("La expresión muestra cómo el movimiento relativo influye en las duraciones medidas."),
      paragraph("No significa que alguien pueda notar subjetivamente que su propio tiempo transcurre más despacio: su reloj y los procesos físicos locales continúan funcionando normalmente."),
      heading("¿Es lo mismo tiempo que cambio?"),
      paragraph("No exactamente."),
      paragraph("Utilizamos procesos que cambian para medir el tiempo, pero identificar el tiempo únicamente con esos cambios sería una afirmación filosófica y física más fuerte."),
      paragraph("La naturaleza fundamental del tiempo continúa siendo objeto de investigación."),
    ],
  },
  {
    code: "F00.04",
    sequence: 4,
    editorialStatus: "candidate",
    hookQuestion: "Si dos cosas suceden una después de otra, ¿significa necesariamente que la primera ha provocado la segunda?",
    shortSummary: "Que dos acontecimientos coincidan o sucedan consecutivamente no demuestra que exista una relación causal. Para establecerla necesitamos identificar cómo podría producirse la influencia y comprobar las evidencias.",
    intro: [
      "Imagina que pulsas un interruptor y se enciende una lámpara.",
      "Parece evidente que una acción ha provocado la otra.",
      "Ahora imagina que cada mañana escuchas cantar a un pájaro y, poco después, amanece.",
      "¿Significa eso que el canto del pájaro hace salir el Sol?",
      "Por supuesto que no.",
    ],
    details: [
      "Esta diferencia nos introduce en una idea fundamental: **la causalidad**.",
      "La causalidad estudia las relaciones por las que unos acontecimientos pueden influir en otros.",
      "Pero descubrir esas relaciones no siempre es sencillo.",
      "Dos fenómenos pueden ocurrir juntos sin que uno provoque el otro. Incluso pueden estar relacionados porque ambos dependen de una tercera causa.",
      "La física añade una condición muy importante: no cualquier acontecimiento puede influir en cualquier otro.",
      "Según la relatividad, la estructura del espacio-tiempo establece límites sobre qué acontecimientos pueden estar conectados causalmente.",
      "Comprender la causalidad significa aprender a distinguir entre lo que simplemente ocurre y aquello que puede producir efectos.",
    ],
    narrativeTitle: "Conexión con otros descubrimientos",
    narrative: [
      "La causalidad nos prepara para comprender mejor las interacciones físicas y los límites que impone la estructura del espacio-tiempo.",
      "En el árbol jugable, este descubrimiento es opcional: no constituye un requisito para desbloquear Espacio-tiempo.",
    ],
    examples: [
      {
        title: "1. El interruptor y la bombilla",
        paragraphs: [
          "Cuando pulsas el interruptor de una lámpara conectada correctamente, modificas el estado de su circuito eléctrico.",
          "Esa acción puede desencadenar el funcionamiento de la lámpara.",
          "Aquí podemos estudiar un mecanismo físico que conecta causa y efecto.",
        ],
      },
      {
        title: "2. Los helados y los ahogamientos",
        paragraphs: [
          "Durante los meses calurosos pueden aumentar tanto las ventas de helados como los incidentes de ahogamiento.",
          "Pero comer helados no tiene por qué provocar esos incidentes.",
          "Una tercera variable —como el calor y las actividades acuáticas asociadas al verano— puede influir en ambos fenómenos.",
          "Este ejemplo ilustra por qué correlación no equivale a causalidad.",
        ],
      },
      {
        title: "3. Una señal desde una estrella",
        paragraphs: [
          "Imagina que una estrella situada a diez años luz emite una señal luminosa hacia la Tierra.",
          "Incluso viajando a la velocidad de la luz en el vacío, esa señal necesitará aproximadamente diez años para llegar.",
          "La estrella no puede influir mediante esa señal en un detector terrestre antes de que la luz lo alcance.",
          "La causalidad física está limitada por la propagación de las influencias.",
        ],
      },
    ],
    deepDive: [
      heading("Causalidad y relatividad"),
      paragraph("La relatividad especial proporciona una estructura matemática que permite distinguir entre acontecimientos que pueden estar causalmente conectados y acontecimientos demasiado separados para influirse mediante señales que respeten el límite relativista de velocidad."),
      paragraph("Para dos sucesos, en coordenadas inerciales del espacio-tiempo plano, podemos considerar:"),
      formula("s^2=c^2(\\Delta t)^2-(\\Delta x)^2-(\\Delta y)^2-(\\Delta z)^2"),
      paragraph("Según nuestra convención de signos:"),
      list([
        "Si \\(s^2>0\\), la separación es temporal: puede existir una influencia causal entre los sucesos, según su orientación temporal.",
        "Si \\(s^2=0\\), la separación es luminosa: una señal que viaja a la velocidad de la luz puede conectarlos.",
        "Si \\(s^2<0\\), la separación es espacial: no puede haber una influencia causal directa entre ellos mediante señales que respeten ese límite.",
      ]),
      paragraph("Esto da lugar a los **conos de luz**, una representación de qué regiones del espacio-tiempo pueden influir en un acontecimiento y cuáles pueden recibir su influencia."),
      heading("¿La física cuántica elimina la causalidad?"),
      paragraph("No."),
      paragraph("Los fenómenos cuánticos pueden presentar correlaciones sorprendentes, como las observadas en sistemas entrelazados."),
      paragraph("Sin embargo, esas correlaciones no permiten enviar información controlada más rápido que la luz."),
      paragraph("La relación entre causalidad, teoría cuántica y estructura del espacio-tiempo es un área profunda de investigación, pero el entrelazamiento no constituye una demostración de comunicación superlumínica."),
      heading("¿Podemos demostrar una causa solo observando una correlación?"),
      paragraph("Generalmente no."),
      paragraph("Para investigar relaciones causales se utilizan modelos, experimentos controlados cuando son posibles y métodos que intentan distinguir explicaciones alternativas."),
      paragraph("La sucesión temporal puede ser necesaria para muchas relaciones causales ordinarias, pero por sí sola no basta para demostrarlas."),
    ],
  },
  {
    code: "F00.05",
    sequence: 5,
    editorialStatus: "candidate",
    hookQuestion: "¿Y si decir dónde ocurre algo no bastara para describirlo, y también necesitáramos saber cuándo?",
    shortSummary: "El espacio-tiempo reúne posiciones y tiempos en una estructura de cuatro dimensiones. Distintos observadores pueden separar espacio y tiempo de maneras diferentes, pero pueden describir los mismos acontecimientos físicos.",
    intro: [
      "Imagina que quedas con alguien en una cafetería. Le das la dirección exacta, pero olvidas decirle la hora. Aunque llegue al lugar correcto, tal vez no os encontréis.",
      "En física sucede algo parecido: para identificar un acontecimiento necesitamos describir **dónde** ocurre y **cuándo** ocurre. A esa combinación la llamamos **espacio-tiempo**.",
    ],
    details: [
      "En nuestra experiencia utilizamos tres coordenadas para localizar algo en el espacio y una para situarlo en el tiempo. Un acontecimiento —como el destello de una bombilla— queda definido por esas cuatro coordenadas dentro de un sistema de referencia.",
      "Antes de la relatividad era habitual tratar el espacio como un escenario fijo y el tiempo como un reloj universal. La relatividad especial mostró que esa separación no funciona de la misma manera para todos los observadores en movimiento relativo.",
      "Dos observadores pueden discrepar sobre el tiempo transcurrido o la distancia entre determinados sucesos, sin que uno esté midiendo mal. Sus mediciones obedecen relaciones precisas y comparten una estructura física común.",
      "La relatividad general amplía esta idea: la geometría del espacio-tiempo puede ser curva. La materia y otras formas de energía participan en esa geometría, y esa geometría influye en cómo se mueven los cuerpos y la luz.",
      "**No imagines el espacio-tiempo como una tela material que flota dentro de otro espacio.** Es una descripción geométrica de relaciones físicas entre acontecimientos, no una sábana que necesite un lugar externo donde apoyarse.",
    ],
    narrativeTitle: "Conexión narrativa",
    narrative: [
      "Ya podemos describir un acontecimiento mediante espacio y tiempo. El siguiente paso es entender por qué observadores en movimiento relativo pueden medir distancias, duraciones y simultaneidad de maneras distintas: **relatividad especial**.",
    ],
    examples: [
      {
        title: "1. La cita con coordenadas incompletas",
        paragraphs: [
          "Una dirección sin hora puede ser inútil para encontrarse con alguien. En un laboratorio, registrar un destello exige tanto su posición como el instante de emisión. Esto ilustra por qué hablamos de *acontecimientos*, no únicamente de lugares.",
        ],
      },
      {
        title: "2. Dos cámaras que graban un tren",
        paragraphs: [
          "Imagina dos observadores que se mueven uno respecto al otro. Cada uno usa sus propios relojes y reglas para registrar lo que sucede en un tren. Pueden asignar coordenadas diferentes a los mismos destellos, pero ambos describen los mismos sucesos físicos. **La analogía no significa que la percepción visual por sí sola produzca los efectos relativistas:** hablamos de mediciones hechas con reglas y relojes sincronizados.",
        ],
      },
      {
        title: "3. El dibujo de un mapa y sus coordenadas",
        paragraphs: [
          "Puedes representar una misma ciudad con distintos mapas: las coordenadas cambian, pero las calles no se transforman por escoger otro dibujo. En el espacio-tiempo ocurre algo semejante con los sistemas de coordenadas, aunque con una diferencia decisiva: las transformaciones entre observadores inerciales mezclan medidas espaciales y temporales de una forma específica.",
        ],
      },
    ],
    deepDive: [
      heading("¿Qué significa «cuatro dimensiones»?"),
      paragraph("Un acontecimiento puede etiquetarse mediante \\((t,x,y,z)\\). Las tres últimas coordenadas indican posición; la primera, tiempo. Aunque sean cuatro coordenadas, **el tiempo no es simplemente una cuarta dirección espacial intercambiable con las demás**: la geometría relativista distingue entre separaciones temporales, luminosas y espaciales."),
      heading("El intervalo espacio-temporal"),
      paragraph("En un sistema inercial del espacio-tiempo plano, y usando la convención de signos \\((+---)\\), el intervalo entre dos acontecimientos es:"),
      formula("s^2=c^2(\\Delta t)^2-(\\Delta x)^2-(\\Delta y)^2-(\\Delta z)^2"),
      paragraph("Aquí \\(c\\) es la velocidad de la luz en el vacío. A diferencia de la distancia espacial o del intervalo de tiempo coordenado por separado, \\(s^2\\) tiene el mismo valor para todos los observadores inerciales que describen esos dos acontecimientos."),
      paragraph("Para sucesos con separación temporal \\((s^2>0)\\), el tiempo propio entre ambos a lo largo de una trayectoria inercial recta está relacionado con \\(s\\) mediante \\(\\Delta\\tau=\\sqrt{s^2}/c\\). En trayectorias generales, el tiempo propio se calcula a lo largo de la línea de mundo."),
      heading("¿Y en presencia de gravedad?"),
      paragraph("La relatividad general utiliza una *métrica* más general para describir la geometría local del espacio-tiempo. No podemos aplicar sin más la expresión anterior a regiones extensas donde la curvatura sea relevante."),
    ],
  },
  {
    code: "F00.06",
    sequence: 6,
    editorialStatus: "candidate",
    hookQuestion: "¿Cómo es posible que dos personas midan duraciones diferentes y que ambas tengan razón?",
    shortSummary: "La relatividad especial describe la física en sistemas inerciales y establece que la velocidad de la luz en el vacío es la misma para todos ellos. De esa estructura se derivan efectos como la dilatación temporal y la relatividad de la simultaneidad.",
    intro: [
      "Imagina que dos viajeros llevan relojes idénticos. Uno permanece en una estación y otro pasa a gran velocidad en un vehículo. Cuando comparan mediciones según un procedimiento bien definido, sus resultados pueden ser diferentes.",
      "La explicación no está en un reloj defectuoso: **el movimiento relativo influye en cómo se relacionan las medidas de espacio y tiempo**.",
    ],
    details: [
      "A principios del siglo XX, Einstein formuló una teoría a partir de dos ideas: las leyes de la física tienen la misma forma en todos los sistemas de referencia inerciales, y la luz en el vacío se propaga con la misma velocidad \\(c\\) para todos esos observadores, independientemente del movimiento de la fuente.",
      "Si las velocidades se combinaran siempre como en nuestra intuición cotidiana, estas dos ideas chocarían. La solución es sorprendente: **las medidas del espacio y del tiempo deben relacionarse de otra manera**.",
      "Un reloj que se mueve respecto a un observador inercial puede acumular menos tiempo propio entre encuentros que el reloj de ese observador, según las trayectorias consideradas. También aparece la contracción de longitudes medidas en la dirección del movimiento y la relatividad de la simultaneidad de acontecimientos separados espacialmente.",
      "Esto no significa que «todo sea relativo». Las leyes físicas, la velocidad \\(c\\) y ciertas cantidades espacio-temporales son invariantes. La teoría impone relaciones precisas y comprobables, no una libertad para elegir cualquier resultado.",
      "Además, ningún objeto con masa puede acelerarse hasta alcanzar \\(c\\) mediante un aporte finito de energía. La relatividad especial no dice que no pueda haber movimientos aparentes superlumínicos en una proyección o expansión de distancias cosmológicas; esos casos requieren distinguir cuidadosamente qué velocidad se está describiendo.",
    ],
    narrativeTitle: "Conexión narrativa",
    narrative: [
      "La relatividad especial nos enseña que espacio y tiempo forman una estructura común. Ahora podemos preguntarnos cómo encaja la **gravitación** en esa imagen y por qué una descripción geométrica resultará tan poderosa.",
    ],
    examples: [
      {
        title: "1. El reloj de luz",
        paragraphs: [
          "Imagina un reloj ideal que marca cada pulso cuando la luz rebota entre dos espejos. Si lo observas pasar lateralmente, la luz sigue un recorrido diagonal respecto a ti. Como su velocidad sigue siendo \\(c\\), el intervalo entre pulsos medido en tu sistema es mayor. Es un recurso útil para visualizar la dilatación temporal en el marco adecuado, no una afirmación de que los relojes reales necesiten espejos.",
        ],
      },
      {
        title: "2. Dos relámpagos y un tren",
        paragraphs: [
          "Una persona situada en el andén puede determinar que dos destellos separados ocurrieron simultáneamente en su sistema. Un observador inercial que se mueve con respecto al andén puede asignarles tiempos distintos. Para comparar correctamente hay que descontar el tiempo que tarda la luz en llegar y utilizar relojes sincronizados en cada sistema; no basta con decir quién vio primero el destello.",
        ],
      },
      {
        title: "3. Partículas que llegan hasta nosotros",
        paragraphs: [
          "Los muones producidos por rayos cósmicos en la atmósfera tienen una vida media breve en reposo. Muchos alcanzan la superficie terrestre porque su movimiento relativista modifica la relación entre el tiempo propio de la partícula y el tiempo medido desde la Tierra. No sobreviven porque «se hagan más resistentes»: sus procesos siguen su tiempo propio.",
        ],
      },
    ],
    deepDive: [
      heading("El factor de Lorentz"),
      paragraph("Para velocidad relativa \\(v\\) entre sistemas inerciales:"),
      formula("\\gamma=\\frac{1}{\\sqrt{1-v^2/c^2}}"),
      paragraph("El factor \\(\\gamma\\) es al menos 1 para \\(|v|<c\\). A velocidades muy inferiores a \\(c\\), es prácticamente 1 y los efectos relativistas suelen resultar minúsculos."),
      heading("Tiempo propio y tiempo coordenado"),
      paragraph("Para un reloj en movimiento uniforme respecto a un sistema inercial:"),
      formula("\\Delta t=\\gamma\\,\\Delta\\tau"),
      paragraph("\\(\\Delta\\tau\\) es el tiempo propio registrado por el reloj entre dos acontecimientos de su trayectoria; \\(\\Delta t\\), el intervalo de tiempo asignado en ese sistema inercial. **Hay que especificar qué sucesos, qué relojes y qué sistemas se comparan**; no es correcto afirmar sin contexto que «el tiempo de uno va más lento»."),
      heading("Energía y masa"),
      paragraph("La equivalencia masa-energía en reposo se expresa como:"),
      formula("E_0=mc^2"),
      paragraph("Esto no significa que toda la energía de un cuerpo sea siempre solo \\(mc^2\\): para un cuerpo en movimiento hay además energía cinética, y la expresión completa depende de su energía y momento."),
      heading("¿Qué no incluye esta teoría?"),
      paragraph("La relatividad especial describe el espacio-tiempo plano. Puede utilizar observadores acelerados y coordenadas no inerciales, pero no constituye por sí sola una teoría dinámica de la gravedad. Para eso necesitaremos la relatividad general."),
    ],
  },
  {
    code: "F00.07",
    sequence: 7,
    editorialStatus: "candidate",
    hookQuestion: "¿Qué tienen en común una manzana que cae, una marea oceánica y la órbita de la Luna?",
    shortSummary: "La gravitación es la interacción responsable de la atracción gravitatoria entre cuerpos y de fenómenos como las órbitas. Newton la describió con enorme éxito; la relatividad general ofrece una descripción más profunda mediante la geometría del espacio-tiempo.",
    intro: [
      "Dejas caer las llaves y llegan al suelo. Levantas la mirada y descubres que la Luna lleva muchísimo tiempo orbitando la Tierra sin precipitarse directamente sobre ella.",
      "Detrás de esas escenas aparentemente distintas hay un protagonista compartido: **la gravitación**.",
    ],
    details: [
      "En la vida cotidiana decimos que la gravedad «tira de las cosas hacia abajo». Es una descripción práctica cerca de la superficie terrestre, pero la misma interacción explica por qué los planetas orbitan el Sol y por qué los satélites pueden permanecer alrededor de la Tierra.",
      "Isaac Newton formuló una ley que relaciona la atracción entre dos masas con su separación. Con ella pudo describirse una enorme cantidad de fenómenos, desde trayectorias de proyectiles hasta movimientos planetarios.",
      "Una órbita no consiste en que la gravedad haya dejado de actuar. Un satélite sigue cayendo hacia la Tierra, pero tiene suficiente velocidad transversal para que su trayectoria continúe rodeándola en lugar de impactar en la superficie, siempre que otras condiciones lo permitan.",
      "La gravedad tampoco equivale al peso que sentimos. **El peso aparente es lo que registra, por ejemplo, una báscula cuando el suelo ejerce una fuerza de apoyo sobre nosotros.** Durante una caída libre ideal podemos sentir ingravidez aunque la gravitación siga presente.",
      "La teoría de Newton funciona extraordinariamente bien en numerosos contextos. Cuando necesitamos mayor precisión o estudiamos campos intensos, la relatividad general describe la gravitación mediante el espacio-tiempo curvo.",
    ],
    narrativeTitle: "Conexión narrativa",
    narrative: [
      "Con Newton podemos calcular muchísimas trayectorias. Einstein planteó una pregunta aún más profunda: **¿y si la gravedad no se describiera fundamentalmente como una fuerza ordinaria, sino mediante la geometría del espacio-tiempo?** Esa es la puerta hacia la relatividad general.",
    ],
    examples: [
      {
        title: "1. La pelota y el satélite",
        paragraphs: [
          "Lanza una pelota horizontalmente: además de avanzar, desciende. Imagina lanzamientos cada vez más rápidos desde una altura idealizada y sin resistencia del aire. En determinadas condiciones, la trayectoria puede curvarse alrededor de la Tierra. Es la intuición detrás del famoso «cañón de Newton»; no es una propuesta de experimento real.",
        ],
      },
      {
        title: "2. El ascensor que cae",
        paragraphs: [
          "Durante un tramo de caída libre ideal, tú y un objeto que sueltas a tu lado pueden acelerar casi de la misma manera. Por eso el objeto puede parecer flotante respecto a ti. Esto ilustra la diferencia entre gravedad e ingravidez aparente; en un ascensor real las fuerzas de marea y otras condiciones importan.",
        ],
      },
      {
        title: "3. Las mareas",
        paragraphs: [
          "La Luna y el Sol contribuyen a las mareas porque su influencia gravitatoria no es exactamente igual en todos los puntos de la Tierra. La rotación terrestre, la forma de las costas y la dinámica de los océanos modifican las mareas reales. **No basta con imaginar que la Luna simplemente «tira del agua del lado más cercano»**.",
        ],
      },
    ],
    deepDive: [
      heading("La ley de gravitación universal"),
      paragraph("Para dos masas puntuales \\(m_1\\) y \\(m_2\\), separadas por una distancia \\(r\\):"),
      formula("F=G\\frac{m_1m_2}{r^2}"),
      paragraph("\\(G\\) es la constante de gravitación universal. La ley da la magnitud de la fuerza atractiva en la teoría newtoniana. Para cuerpos extensos hay que considerar su distribución de masa; la forma puntual solo funciona directamente bajo ciertas aproximaciones o simetrías."),
      heading("¿Por qué los astronautas flotan?"),
      paragraph("En la Estación Espacial Internacional la gravedad terrestre sigue siendo significativa. Los astronautas y la estación comparten aproximadamente la misma caída libre orbital, por lo que experimentan microgravedad en su entorno."),
      heading("Las limitaciones de Newton"),
      paragraph("La teoría clásica no incorpora la propagación relativista de influencias ni todos los efectos asociados a la curvatura del espacio-tiempo. La relatividad general explica correcciones observables, como el avance del perihelio de Mercurio o la desviación gravitatoria de la luz."),
      heading("¿La gravedad funciona igual en toda escala?"),
      paragraph("No tenemos una teoría cuántica de la gravitación confirmada experimentalmente. La descripción clásica de Einstein y las teorías cuánticas actuales son exitosas en sus respectivos dominios, pero su integración fundamental permanece abierta."),
    ],
  },
  {
    code: "F00.08",
    sequence: 8,
    editorialStatus: "candidate",
    hookQuestion: "¿Y si la Tierra orbitara el Sol no porque una cuerda invisible tirase de ella, sino porque sigue su camino natural en un espacio-tiempo curvo?",
    shortSummary: "La relatividad general describe la gravitación mediante la geometría del espacio-tiempo. La distribución de energía y momento se relaciona con su curvatura, y esa geometría guía el movimiento libre de cuerpos y luz.",
    intro: [
      "Cuando estás de pie, sientes el suelo empujándote hacia arriba. Cuando caes libremente, puedes dejar de sentir ese apoyo, aunque sigas cerca de la Tierra.",
      "Einstein tomó muy en serio esa diferencia y desarrolló una nueva forma de comprender la gravedad: **la relatividad general**.",
    ],
    details: [
      "En la descripción de Newton, la gravedad aparece como una fuerza de atracción entre masas. En la relatividad general, un cuerpo que cae libremente sigue, idealmente, la trayectoria más natural permitida por la geometría del espacio-tiempo: una *geodésica*.",
      "Esto no significa que los objetos siempre se muevan en línea recta sobre un mapa del espacio. Una geodésica es una noción geométrica de cuatro dimensiones, y su proyección espacial puede parecer una curva u órbita.",
      "La materia y la energía están relacionadas con la curvatura del espacio-tiempo. La geometría resultante explica fenómenos que la teoría de Newton no describe con la misma precisión, como determinadas desviaciones de la luz, diferencias entre relojes en distintas alturas y detalles de movimientos orbitales.",
      "Tal vez hayas visto la representación de una bola pesada hundiendo una sábana elástica. Es sugerente, pero **no es un modelo literal**: utiliza la gravedad terrestre para producir el hundimiento que pretende explicar, reduce las dimensiones y apenas representa la parte temporal de la geometría.",
      "La relatividad general predice también ondas gravitacionales: perturbaciones de la geometría del espacio-tiempo que se propagan y pueden detectarse cuando las producen acontecimientos astrofísicos suficientemente intensos.",
    ],
    narrativeTitle: "Conexión narrativa",
    narrative: [
      "Para comprender qué significa que la gravedad sea «geometría», necesitamos una herramienta conceptual más precisa que la sábana elástica: **la geometría del espacio-tiempo**.",
    ],
    examples: [
      {
        title: "1. Un ascensor cerrado",
        paragraphs: [
          "Si estás en una cabina pequeña que acelera uniformemente en el espacio, ciertas experiencias locales pueden parecerse a las de estar en reposo dentro de un campo gravitatorio. Esta intuición conduce al principio de equivalencia. La semejanza es **local**: experimentos suficientemente amplios pueden detectar efectos de marea que distinguen un campo gravitatorio real de una aceleración simple.",
        ],
      },
      {
        title: "2. Una galaxia como lente",
        paragraphs: [
          "La luz de una galaxia distante puede desviarse al pasar cerca de una gran concentración de masa. Desde la Tierra podemos observar imágenes deformadas, ampliadas o múltiples: el fenómeno de lente gravitatoria. No se debe a que la galaxia sea una lente de vidrio, sino a cómo se propaga la luz por esa geometría.",
        ],
      },
      {
        title: "3. Dos relojes a distinta altura",
        paragraphs: [
          "Los relojes situados a diferentes potenciales gravitatorios pueden acumular tiempo a ritmos distintos. Estas diferencias se miden y tienen aplicaciones prácticas en sistemas de navegación por satélite. Es un efecto de la geometría del espacio-tiempo, no un defecto de fabricación.",
        ],
      },
    ],
    deepDive: [
      heading("La idea de las geodésicas"),
      paragraph("En la relatividad general, las trayectorias libres se describen mediante la métrica del espacio-tiempo. Para partículas masivas en caída libre ideal, las líneas de mundo son geodésicas temporales; para la luz, geodésicas nulas, en la aproximación de óptica geométrica."),
      heading("La ecuación de Einstein"),
      paragraph("Una forma habitual de expresar la relación entre geometría y contenido de energía-momento es:"),
      formula("G_{\\mu\\nu}+\\Lambda g_{\\mu\\nu}=\\frac{8\\pi G}{c^4}T_{\\mu\\nu}"),
      list([
        "\\(G_{\\mu\\nu}\\) resume propiedades de la curvatura del espacio-tiempo.",
        "\\(g_{\\mu\\nu}\\) es la métrica, que permite calcular intervalos y relaciones geométricas.",
        "\\(T_{\\mu\\nu}\\) describe energía, momento y tensiones de la materia y los campos.",
        "\\(\\Lambda\\) es la constante cosmológica.",
      ]),
      paragraph("**No hace falta dominar tensores para captar la idea:** la geometría y el contenido físico están relacionados por una ecuación comprobable. La formulación completa incluye matices y condiciones que esta ficha introductoria no desarrolla."),
      heading("¿Qué se ha observado?"),
      paragraph("Entre las pruebas de la relatividad general están la desviación gravitatoria de la luz, el corrimiento gravitatorio al rojo, ciertas variaciones orbitales y la detección de ondas gravitacionales."),
      heading("¿Es la teoría definitiva?"),
      paragraph("No lo sabemos. La relatividad general explica numerosos fenómenos con gran precisión, pero no existe todavía una teoría cuántica de la gravedad confirmada que describa todos los regímenes físicos."),
    ],
  },
  {
    code: "F00.09",
    sequence: 9,
    editorialStatus: "candidate",
    hookQuestion: "¿Cómo puedes saber si un espacio está curvado sin observarlo desde fuera?",
    shortSummary: "La geometría del espacio-tiempo determina cómo se miden intervalos y cómo se relacionan las trayectorias. Su curvatura puede detectarse mediante efectos físicos, sin imaginar que el universo se dobla necesariamente dentro de un espacio exterior.",
    intro: [
      "Imagina una hormiga que vive sobre la superficie de una esfera enorme. Cerca de ella, el suelo puede parecer plano. Pero si mide caminos y construye triángulos suficientemente grandes, descubrirá que su geometría no funciona como la de una hoja de papel.",
      "En el universo ocurre algo todavía más interesante: **podemos investigar la geometría del espacio-tiempo mediante medidas realizadas desde dentro de él**.",
    ],
    details: [
      "En geometría plana, algunas reglas nos resultan familiares: las líneas paralelas conservan su separación y los ángulos de un triángulo suman 180 grados. En una superficie curva, estas propiedades pueden cambiar al considerar regiones suficientemente grandes.",
      "La geometría moderna permite estudiar esa curvatura desde dentro, mediante distancias, ángulos y relaciones entre trayectorias. No es necesario colocar la superficie en una dimensión adicional para definir matemáticamente su curvatura.",
      "El espacio-tiempo relativista añade el tiempo a las tres dimensiones espaciales, con una estructura métrica distinta de la geometría euclídea ordinaria. Por eso la imagen de una cuadrícula doblada sirve para imaginar algunas deformaciones, pero no muestra toda la física.",
      "Cuando cuerpos en caída libre parten con trayectorias próximas, su separación puede cambiar debido a la curvatura espacio-temporal. Este comportamiento está relacionado con los efectos de marea.",
      "En relatividad general, la geometría no es solo una forma bonita de dibujar la realidad: interviene en la medida de tiempos, la propagación de la luz y el movimiento de cuerpos libres.",
    ],
    narrativeTitle: "Conexión narrativa",
    narrative: [
      "Ahora podemos reconocer por qué la relatividad general habla de curvas y geodésicas. Más adelante, el **principio de equivalencia** (F00.28) nos ayudará a comprender la relación entre caída libre, aceleración y la geometría local, sin convertirlo aquí en un prerrequisito jugable que no exista en la fixture.",
    ],
    examples: [
      {
        title: "1. El triángulo sobre la Tierra",
        paragraphs: [
          "Dibuja mentalmente un triángulo sobre una esfera utilizando segmentos de círculos máximos: desde el polo norte, baja por dos meridianos separados 90 grados hasta el ecuador y une sus extremos sobre él. Ese triángulo tiene tres ángulos rectos, cuya suma es 270 grados. **Esta es una propiedad de la superficie esférica**, no una afirmación de que todos los triángulos físicos del universo se comporten así.",
        ],
      },
      {
        title: "2. Dos caminos inicialmente paralelos",
        paragraphs: [
          "Dos viajeros parten del ecuador terrestre hacia el norte por meridianos diferentes. Al principio sus caminos pueden parecer paralelos localmente, pero terminan encontrándose en el polo. La convergencia ayuda a imaginar cómo la geometría afecta a las trayectorias. En el espacio-tiempo, la comparación matemática involucra líneas de mundo y no simplemente rutas dibujadas sobre un globo.",
        ],
      },
      {
        title: "3. Dos objetos en caída libre",
        paragraphs: [
          "Dos pequeños objetos soltados a distintas posiciones cerca de la Tierra no experimentan necesariamente la misma aceleración relativa. Sus trayectorias pueden acercarse o separarse ligeramente. Estas diferencias —efectos de marea— permiten detectar propiedades del campo gravitatorio que no se eliminan eligiendo un sistema de referencia local en caída libre.",
        ],
      },
    ],
    deepDive: [
      heading("La métrica: una regla para medir"),
      paragraph("En geometría euclídea usamos una expresión como \\(d^2=dx^2+dy^2+dz^2\\). En relatividad general empleamos una métrica \\(g_{\\mu\\nu}\\) que relaciona separaciones infinitesimales:"),
      formula("ds^2=g_{\\mu\\nu}\\,dx^{\\mu}dx^{\\nu}"),
      paragraph("Los índices \\(\\mu\\) y \\(\\nu\\) recorren cuatro coordenadas; la notación indica una suma sobre los índices repetidos. La métrica tiene firma lorentziana, por lo que intervalos temporales y espaciales no se combinan como longitudes euclídeas ordinarias."),
      heading("Curvatura intrínseca y efecto de marea"),
      paragraph("La curvatura no se identifica simplemente con que una línea se vea doblada en un dibujo. Matemáticamente puede describirse mediante el tensor de curvatura de Riemann, que interviene en la desviación relativa de geodésicas cercanas."),
      paragraph("Una forma esquemática de la ecuación de desviación geodésica es:"),
      formula("\\frac{D^2\\xi^{\\mu}}{d\\tau^2}=-R^{\\mu}{}_{\\nu\\alpha\\beta}\\,u^{\\nu}\\xi^{\\alpha}u^{\\beta}"),
      paragraph("Aquí \\(\\xi^{\\mu}\\) describe la separación entre geodésicas cercanas y \\(u^{\\nu}\\) su movimiento. El signo exacto del tensor de curvatura depende de la convención matemática adoptada. Lo importante es la idea: **la curvatura puede manifestarse como una aceleración relativa entre trayectorias libres próximas**."),
      heading("¿Curvatura del espacio o del espacio-tiempo?"),
      paragraph("Una sección espacial elegida por un observador puede tener una geometría determinada, pero la descripción gravitatoria completa requiere considerar la geometría **cuatridimensional** del espacio-tiempo. Una visualización de «una sábana que se hunde» no representa por sí sola esa estructura."),
    ],
  },
  {
    code: "F00.10",
    sequence: 10,
    editorialStatus: "candidate",
    hookQuestion: "¿Qué tienen en común un copo de nieve, una partida de billar y las leyes que gobiernan el universo?",
    shortSummary: "Una simetría es una transformación que conserva determinadas propiedades. En física, las simetrías de las leyes pueden revelar principios fundamentales, aunque no impliquen que los objetos tengan aspecto simétrico.",
    intro: [
      "Piensa en un copo de nieve. Si lo giras cierto ángulo, puede parecer exactamente igual que antes. Ahora imagina algo menos visible: realizar un mismo experimento en dos lugares distintos y obtener resultados gobernados por las mismas leyes.",
      "Ambas situaciones hablan de **simetría**, pero no de la misma clase. En física, una simetría es una transformación bajo la cual algo relevante permanece inalterado.",
    ],
    details: [
      "Solemos asociar simetría con reflejos de espejo, alas parecidas o figuras bien equilibradas. Esa es una primera puerta de entrada: una figura puede conservar su aspecto después de un giro o una reflexión.",
      "Pero los físicos utilizan una idea mucho más amplia. También preguntan: **¿cambiaría la descripción de un fenómeno si modificáramos ciertas coordenadas, desplazáramos un experimento o lo giráramos?**",
      "Es importante distinguir entre la simetría de un **objeto particular** y la simetría de las **leyes** que describen muchos objetos. Una pelota pintada por un lado no tiene la misma apariencia desde cualquier ángulo; eso no demuestra que las leyes mecánicas distingan una orientación privilegiada.",
      "No todas las transformaciones son simetrías. Y no todas las simetrías conducen a la misma conclusión. Algunas son discretas, como ciertos reflejos; otras son continuas, como girar una figura por cualquier ángulo cuando la figura o las leyes lo permiten.",
      "Las simetrías continuas de la dinámica tienen una relación especialmente profunda con las cantidades conservadas. Esa conexión aparecerá en el teorema de Noether.",
    ],
    narrativeTitle: "Conexión narrativa",
    narrative: [
      "Ya sabemos qué buscamos cuando hablamos de simetría: algo que permanece igual bajo una transformación. Podemos investigar dos familias especialmente reveladoras: **las transformaciones del espacio** y **las traslaciones en el tiempo**.",
    ],
    examples: [
      {
        title: "1. El copo de nieve y el giro",
        paragraphs: [
          "Un copo ideal de seis brazos puede conservar su aspecto al girarlo 60 grados. Eso es una simetría discreta de una figura. Un giro de 17 grados, en general, no produciría la misma imagen. **La figura no tiene por ello una simetría de rotación continua**.",
        ],
      },
      {
        title: "2. Una pelota pintada de rojo por un lado",
        paragraphs: [
          "La pelota deja de verse igual al girarla. Sin embargo, si estudias su movimiento en una región donde las condiciones físicas son equivalentes en todas las orientaciones, las leyes mecánicas no cambian porque el dibujo apunte hacia otra dirección. La simetría del objeto y la de la ley no son lo mismo.",
        ],
      },
      {
        title: "3. Cambiar la escala de un mapa",
        paragraphs: [
          "Un mapa puede ampliarse sin alterar qué calles conectan con cuáles, aunque sí cambien las distancias medidas sobre el papel. Es una analogía de conservar *ciertas propiedades*, no de que cualquier cambio de escala sea una simetría física: las leyes pueden contener longitudes características que impiden esa invariancia.",
        ],
      },
    ],
    deepDive: [
      heading("Transformaciones e invariantes"),
      paragraph("Representemos una transformación por \\(T\\). Una propiedad \\(P\\) es invariante bajo esa transformación si:"),
      formula("P(Tx)=P(x)"),
      paragraph("La igualdad expresa que, aunque la descripción o el objeto cambien bajo \\(T\\), esa propiedad conserva su valor. El significado de \\(x\\), de \\(P\\) y de \\(T\\) depende del problema."),
      heading("Simetrías discretas y continuas"),
      paragraph("Una reflexión es una transformación discreta; una rotación puede formar parte de una familia continua parametrizada por un ángulo. La distinción importa: el teorema de Noether clásico relaciona, bajo hipótesis precisas, **simetrías continuas de la acción física** con cantidades conservadas."),
      heading("Invariancia no significa inmovilidad"),
      paragraph("Una ley puede ser invariante aunque describa un sistema que cambia sin cesar. Que las ecuaciones admitan una transformación no exige que cada solución concreta ni cada objeto individual permanezca idéntico."),
    ],
  },
  {
    code: "F00.11",
    sequence: 11,
    editorialStatus: "candidate",
    hookQuestion: "Si haces el mismo experimento un metro más a la izquierda, ¿deberían cambiar las leyes del universo?",
    shortSummary: "Las simetrías espaciales describen invariancias bajo desplazamientos y rotaciones. En sistemas con las condiciones apropiadas, esas invariancias se relacionan con la conservación del momento lineal y del momento angular.",
    intro: [
      "Imagina una mesa de billar ideal. Trasladas todo el experimento a otra habitación con las mismas condiciones y repites los golpes. Las posiciones cambian, pero las ecuaciones que describen las bolas pueden ser las mismas.",
      "Esa idea apunta a una **simetría espacial**: las leyes pueden permanecer invariantes cuando cambiamos la posición o la orientación de un experimento, siempre que transformemos correctamente el sistema y sus condiciones.",
    ],
    details: [
      "Hay dos transformaciones espaciales especialmente importantes: **trasladar** un sistema sin girarlo y **rotarlo** sin cambiar su estructura interna.",
      "Si las leyes no dependen de una posición absoluta privilegiada, hablamos de homogeneidad espacial. Si no seleccionan una orientación privilegiada, hablamos de isotropía espacial.",
      "Esto no quiere decir que todos los lugares sean idénticos. Un experimento realizado cerca de un imán potente puede comportarse de otra forma que el mismo experimento lejos de él. Lo que ha cambiado es el entorno físico, no necesariamente la ley que utilizamos para describirlo.",
      "Tampoco basta con mover solo una parte de un experimento mientras dejamos fijas las fuentes externas: ese procedimiento puede alterar fuerzas y condiciones iniciales.",
      "La recompensa conceptual es extraordinaria: bajo determinadas hipótesis, la invariancia ante traslaciones espaciales está relacionada con la conservación del momento lineal, mientras que la invariancia ante rotaciones se relaciona con el momento angular.",
    ],
    narrativeTitle: "Conexión narrativa",
    narrative: [
      "Si desplazar o girar un sistema puede dejar intactas sus leyes, ¿qué ocurre al repetirlo en otro **momento**? Esa pregunta nos conduce a la simetría temporal.",
    ],
    examples: [
      {
        title: "1. Una mesa de billar trasladada",
        paragraphs: [
          "Si mueves mesa, bolas y demás condiciones relevantes, las ecuaciones del choque son las mismas. No necesitas una física distinta para la esquina izquierda del edificio. La homogeneidad se refiere a la ley, no a que las dos mesas reales tengan idénticos rozamientos.",
        ],
      },
      {
        title: "2. Girar el montaje de laboratorio",
        paragraphs: [
          "Una colisión entre discos puede estudiarse con un montaje girado. Si no existe un campo o condición externa que privilegie una dirección, las leyes conservan su forma. Girar el sistema no garantiza que cada trayectoria dibujada tenga el mismo aspecto en los ejes originales: hay que transformar también su descripción.",
        ],
      },
      {
        title: "3. Una pelota en una pendiente",
        paragraphs: [
          "La pelota rueda cuesta abajo y no cuesta arriba en las mismas condiciones. ¿Ha desaparecido la simetría de las leyes? No: la gravedad local y la orientación de la pendiente forman parte de las condiciones del sistema. **La simetría de la ley y la simetría de la situación particular deben distinguirse**.",
        ],
      },
    ],
    deepDive: [
      heading("Traslaciones"),
      paragraph("Una traslación de coordenadas puede escribirse como:"),
      formula("\\mathbf r\\,'=\\mathbf r+\\mathbf a"),
      paragraph("Aquí \\(\\mathbf a\\) es un vector constante. Para que sea una simetría física relevante, la acción o las ecuaciones de la dinámica deben conservar la propiedad apropiada bajo esa familia de transformaciones."),
      heading("Rotaciones"),
      paragraph("Una rotación puede representarse por una matriz \\(R\\) que preserve distancias euclídeas:"),
      formula("\\mathbf r\\,'=R\\mathbf r,\\qquad R^{\\mathsf T}R=I"),
      paragraph("Una invariancia continua ante rotaciones es la que, en el marco de Noether y bajo sus hipótesis, se asocia con el momento angular conservado."),
      heading("¿Y el universo completo?"),
      paragraph("La cosmología utiliza hipótesis de homogeneidad e isotropía **a escalas suficientemente grandes y de manera aproximada**. No hay que confundir esas hipótesis de modelado con la afirmación de que el cosmos sea exactamente igual en cada punto o dirección."),
    ],
  },
  {
    code: "F00.12",
    sequence: 12,
    editorialStatus: "candidate",
    hookQuestion: "¿Funcionaría la misma ley física mañana, aunque el mundo haya cambiado desde hoy?",
    shortSummary: "La simetría temporal que nos interesa aquí significa que la dinámica de un sistema no depende explícitamente del instante elegido. Bajo las condiciones adecuadas, está vinculada a la conservación de la energía.",
    intro: [
      "Si dejas caer una pelota hoy y repites el experimento mañana bajo condiciones equivalentes, esperas que la gravedad obedezca las mismas leyes. El reloj marca otra fecha, pero la regla física no tiene por qué cambiar.",
      "A esta idea la llamamos **invariancia ante traslaciones temporales**: desplazar el instante del experimento no modifica las leyes del sistema, cuando sus condiciones relevantes también se mantienen equivalentes.",
    ],
    details: [
      "Decir que «las leyes son las mismas mañana» puede parecer obvio. Sin embargo, es una afirmación muy poderosa y debe entenderse con cuidado.",
      "No significa que todos los acontecimientos se repitan ni que un sistema conserve siempre su apariencia. Una taza puede romperse hoy y seguir rota mañana mientras las ecuaciones que describen el proceso obedecen las mismas reglas.",
      "Tampoco significa que el entorno permanezca fijo. Un experimento cerca de una fuente de calor que cambia con el tiempo puede intercambiar energía con ella. Si analizamos solo una parte del conjunto, su energía puede variar.",
      "Existe otra idea diferente, llamada **inversión temporal**: estudiar si las leyes conservan ciertas propiedades al cambiar el sentido del tiempo. No debe confundirse con desplazar el inicio de un experimento de las 10:00 a las 11:00.",
      "La invariancia frente a **traslaciones** de tiempo, bajo las hipótesis del teorema de Noether, está conectada con una cantidad conservada que, en sistemas habituales con las condiciones correspondientes, identificamos con la energía.",
    ],
    narrativeTitle: "Conexión narrativa",
    narrative: [
      "La simetría temporal y las espaciales revelan un patrón sorprendente. Para comprenderlo necesitamos conocer el descubrimiento de **Emmy Noether**.",
    ],
    examples: [
      {
        title: "1. El péndulo de hoy y de mañana",
        paragraphs: [
          "Un péndulo ideal, aislado de perturbaciones y con los mismos parámetros, sigue las mismas ecuaciones si comienza a oscilar una hora después. La fecha no figura como una fuerza adicional. Un péndulo real puede frenarse por rozamiento: eso no demuestra que la ley haya cambiado con la hora.",
        ],
      },
      {
        title: "2. La batería que se descarga",
        paragraphs: [
          "La energía almacenada por una batería disminuye cuando alimenta una lámpara. No contradice la conservación de la energía del sistema completo: parte de ella se transfiere como energía eléctrica, luz y calor. Hay que escoger correctamente qué sistema estudiamos.",
        ],
      },
      {
        title: "3. Una película reproducida al revés",
        paragraphs: [
          "En una película inversa, los fragmentos de un vaso roto se reunirían espontáneamente. Esto parece extraordinario y nos recuerda la flecha termodinámica del tiempo, pero **no es una prueba de que traslación temporal e inversión temporal sean la misma simetría**. Son preguntas físicas distintas.",
        ],
      },
    ],
    deepDive: [
      heading("¿Qué significa «no depender explícitamente del tiempo»?"),
      paragraph("En mecánica analítica, un sistema puede describirse mediante un lagrangiano \\(L(q_i,\\dot q_i,t)\\). Si cumple las condiciones apropiadas y no depende explícitamente de \\(t\\), entonces la cantidad:"),
      formula("E=\\sum_i \\dot q_i\\,\\frac{\\partial L}{\\partial\\dot q_i}-L"),
      paragraph("se conserva. En numerosos sistemas mecánicos habituales, esta cantidad coincide con la energía mecánica que usamos en física introductoria; en general la identificación requiere atender a las hipótesis del modelo."),
      heading("Una simetría de la acción, no del dibujo"),
      paragraph("La formulación del teorema de Noether se refiere a la invariancia de la acción —posiblemente hasta un término de borde que no cambie las ecuaciones—, no simplemente a que una gráfica resulte idéntica en dos fechas."),
      heading("¿Y en cosmología?"),
      paragraph("En un espacio-tiempo dinámico, como los modelos de universo en expansión, no existe necesariamente una simetría global de traslación temporal. Por ello, la conservación de una **energía total global única del universo** no se deduce de manera general como en un sistema aislado en un espacio-tiempo estacionario. Esto no elimina las leyes locales de conservación apropiadas de la relatividad general."),
    ],
  },
  {
    code: "F00.13",
    sequence: 13,
    editorialStatus: "candidate",
    hookQuestion: "¿Y si una ley de conservación fuera la huella de una simetría que no podemos ver a simple vista?",
    shortSummary: "Bajo sus hipótesis matemáticas, cada simetría continua de la acción de un sistema físico se asocia con una cantidad conservada. Las traslaciones temporales se vinculan con la energía; las espaciales, con el momento; y las rotaciones, con el momento angular.",
    intro: [
      "Imagina descubrir que dos preguntas muy diferentes —«¿qué cambia si traslado un experimento?» y «¿qué magnitud permanece constante?»— son en realidad dos caras de una misma estructura matemática.",
      "En 1918, la matemática **Emmy Noether** demostró una conexión profunda entre ciertas simetrías continuas de las leyes físicas y las cantidades conservadas.",
    ],
    details: [
      "Durante mucho tiempo, las leyes de conservación podían parecer una colección de reglas independientes: la energía se conserva, el momento se conserva, el momento angular se conserva.",
      "Noether mostró por qué esas reglas pueden tener un origen estructural común. Si la dinámica no distingue un instante absoluto, aparece una cantidad conservada asociada a las traslaciones temporales. Si no distingue posiciones absolutas, surge una relacionada con el momento. Si es invariante ante rotaciones, aparece otra relacionada con el momento angular.",
      "La palabra clave es **continua**: desplazarnos una distancia minúscula, mover el comienzo del experimento una fracción de segundo o girar un ángulo arbitrariamente pequeño. Y la simetría relevante es la de la **acción** que describe la dinámica, no la mera apariencia de un objeto.",
      "Este teorema no asegura que cualquier cantidad individual sea constante ni que cualquier entorno conserve por sí solo la energía o el momento. Debemos especificar el sistema, sus interacciones, sus fronteras y las condiciones de la simetría.",
      "Tampoco hay que confundir las simetrías globales ordinarias con todas las simetrías locales de las teorías gauge: esas requieren un tratamiento matemático adicional.",
      "La contribución de Noether cambió la forma de entender la física: las conservaciones dejaron de ser solo reglas observadas y revelaron relaciones profundas con la estructura de las teorías.",
    ],
    narrativeTitle: "Conexión narrativa",
    narrative: [
      "Ya conocemos la conexión entre simetrías y magnitudes conservadas. Ahora podemos explorar qué significa realmente **conservar** algo en un sistema físico.",
    ],
    examples: [
      {
        title: "1. Cambiar de hora sin cambiar las reglas",
        paragraphs: [
          "Si las ecuaciones de un sistema aislado no dependen explícitamente de la hora a la que comienzas el experimento, la simetría temporal permite obtener una cantidad conservada relacionada con su energía. No significa que la energía de cada pieza por separado permanezca fija.",
        ],
      },
      {
        title: "2. Choque de dos patinadores",
        paragraphs: [
          "Sobre hielo ideal y sin fuerzas horizontales externas, dos patinadores que se empujan adquieren momentos opuestos. La conservación del momento total refleja una ley que no distingue una posición horizontal privilegiada. El hielo real y el rozamiento introducen aproximaciones.",
        ],
      },
      {
        title: "3. La patinadora que gira",
        paragraphs: [
          "Una patinadora que recoge los brazos puede girar más deprisa sin cambiar apreciablemente su momento angular total alrededor del eje vertical, si el torque externo es despreciable. La simetría rotacional se relaciona con la conservación; recoger los brazos requiere esfuerzo y puede aumentar su energía cinética de rotación.",
        ],
      },
    ],
    deepDive: [
      heading("La acción y el lagrangiano"),
      paragraph("En mecánica clásica se define la acción para una trayectoria como:"),
      formula("S[q]=\\int_{t_1}^{t_2}L(q,\\dot q,t)\\,dt"),
      paragraph("En el principio de acción estacionaria, las trayectorias físicas satisfacen condiciones que hacen estacionaria esta acción frente a variaciones apropiadas."),
      heading("La idea matemática de Noether"),
      paragraph("Si una familia continua de transformaciones preserva la acción bajo las hipótesis necesarias —incluidas las condiciones de contorno—, se puede construir una magnitud conservada a lo largo de las soluciones. En una descripción sencilla:"),
      formula("\\frac{dQ}{dt}=0"),
      paragraph("La expresión dice que la carga de Noether \\(Q\\) permanece constante durante la evolución del sistema correspondiente. No significa que todas las simetrías produzcan exactamente la misma \\(Q\\)."),
      heading("Tres correspondencias memorables"),
      list([
        "Traslación en el tiempo \\(\\longleftrightarrow\\) cantidad relacionada con la energía.",
        "Traslación en el espacio \\(\\longleftrightarrow\\) momento lineal.",
        "Rotación espacial \\(\\longleftrightarrow\\) momento angular.",
      ]),
      heading("Límites de la regla mnemotécnica"),
      paragraph("En sistemas abiertos, con fuerzas externas o en espacio-tiempos curvos dinámicos, hay que identificar con precisión la simetría de la acción y qué conservación puede definirse. La lista anterior es una guía potente, **no un permiso para afirmar que toda energía global imaginable se conserva automáticamente**."),
    ],
  },
  {
    code: "F00.14",
    sequence: 14,
    editorialStatus: "candidate",
    hookQuestion: "Cuando una pelota se detiene por rozamiento, ¿adónde ha ido a parar su energía?",
    shortSummary: "Conservar no significa que nada cambie: significa que una cantidad total apropiada permanece constante pese a los intercambios y transformaciones, siempre que se cumplan las condiciones físicas necesarias.",
    intro: [
      "Lanzas una pelota por el suelo y termina frenándose. Parece que su movimiento sencillamente desaparece, pero el proceso implica transferencias de energía hacia la pelota, el suelo y el entorno, principalmente en forma de energía interna.",
      "Una **ley de conservación** afirma que una magnitud física bien definida permanece constante en un sistema y bajo unas condiciones especificadas, aunque pueda cambiar de forma o repartirse entre sus partes.",
    ],
    details: [
      "La palabra conservación suele evocar una caja cerrada donde guardamos algo para que no se pierda. En física, lo interesante es que **los componentes pueden cambiar mientras una magnitud total se mantiene**.",
      "En un choque, el momento puede pasar de un cuerpo a otro. En un péndulo ideal, la energía alterna entre movimiento y posición en un campo gravitatorio. En un circuito, la energía de una batería puede transformarse y transferirse al entorno.",
      "Eso obliga a elegir el sistema que analizamos. Si solo observamos una pelota, su energía cinética disminuye. Si incorporamos también el suelo y los alrededores, podemos estudiar a dónde se transfiere la energía.",
      "No todas las cantidades son conservadas. La temperatura de un objeto, su rapidez o la energía cinética de una pieza aislada pueden variar. Incluso una cantidad que se conserva en cierto modelo puede dejar de hacerlo cuando añadimos interacciones o cuando cambiamos los límites del sistema.",
      "Las leyes de conservación son valiosas porque permiten resolver problemas sin seguir cada detalle microscópico de un proceso. Nos dicen qué cambios **no** pueden ocurrir sin compensaciones físicas apropiadas.",
    ],
    narrativeTitle: "Conexión narrativa",
    narrative: [
      "Hemos visto qué significa que una magnitud total permanezca constante. La primera de las grandes protagonistas que vamos a explorar es la **energía**.",
    ],
    examples: [
      {
        title: "1. El péndulo ideal",
        paragraphs: [
          "En un péndulo sin rozamiento, la energía mecánica se intercambia entre cinética y potencial gravitatoria. En su punto más alto la rapidez es mínima; abajo, mayor. En un péndulo real, parte de la energía mecánica acaba transferida al entorno.",
        ],
      },
      {
        title: "2. El choque de dos carritos",
        paragraphs: [
          "Dos carritos pueden chocar y deformarse. Si el impulso externo total es despreciable, se conserva su momento lineal total, aunque la energía cinética de traslación disminuya por deformación, sonido o calentamiento.",
        ],
      },
      {
        title: "3. La batería y la lámpara",
        paragraphs: [
          "La batería pierde energía almacenada mientras la lámpara emite luz y calienta el entorno. Que la energía útil disminuya no significa que la energía desaparezca: debemos seguir los intercambios y las formas que adopta.",
        ],
      },
    ],
    deepDive: [
      heading("Balance de una magnitud"),
      paragraph("Una forma sencilla de escribir el balance de una cantidad \\(Q\\) en un volumen es:"),
      formula("\\frac{dQ_{\\mathrm{dentro}}}{dt}=\\text{entrada}-\\text{salida}+\\text{producción neta}"),
      paragraph("Para una cantidad estrictamente conservada no existe creación o destrucción neta interna: la variación se explica por flujos a través del límite. El significado matemático preciso depende de la magnitud y el modelo."),
      heading("Conservación del momento"),
      paragraph("En mecánica clásica, para un conjunto de cuerpos con fuerza externa neta nula:"),
      formula("\\frac{d\\mathbf P}{dt}=\\mathbf F_{\\mathrm{ext}}=\\mathbf 0"),
      paragraph("Por tanto, el momento total \\(\\mathbf P\\) permanece constante. Las fuerzas internas pueden alterar los momentos individuales, pero se compensan en el total bajo las hipótesis habituales."),
      heading("Energía mecánica frente a energía total"),
      paragraph("Conservar energía no implica conservar siempre \\(K+U\\) como energía mecánica. Si hay rozamiento, ese subtotal puede disminuir mientras crece la energía interna. En relatividad general, además, hay conservaciones locales formuladas mediante geometría y campos, sin garantía de una energía total global única para cualquier espacio-tiempo."),
    ],
  },
  {
    code: "F00.15",
    sequence: 15,
    editorialStatus: "candidate",
    hookQuestion: "¿Qué tienen en común un rayo de Sol, un músculo que se contrae y una pelota que cae?",
    shortSummary: "La energía es una magnitud que interviene en el movimiento, las interacciones y las transformaciones físicas. Puede transferirse y cambiar de forma; su conservación depende del sistema y de las condiciones en que se describe.",
    intro: [
      "La luz solar calienta tu piel, tu cuerpo utiliza energía química para moverse y una pelota gana rapidez al caer. Son procesos muy distintos, pero todos pueden describirse mediante intercambios y transformaciones de **energía**.",
      "La energía no es una sustancia brillante que salta de un objeto a otro. Es una magnitud física que permite cuantificar y relacionar los cambios en los sistemas.",
    ],
    details: [
      "Cuando alguien dice «tengo energía», normalmente habla de cómo se siente. En física, la palabra tiene un significado más preciso y mucho más amplio.",
      "Un cuerpo en movimiento posee energía cinética. Un sistema puede almacenar energía potencial asociada a sus interacciones. Los materiales tienen energía interna vinculada con sus estados microscópicos. La radiación transporta energía, y en relatividad la masa está relacionada con ella.",
      "No son tipos de una misteriosa sustancia: son formas de contabilizar una misma magnitud dentro de diferentes descripciones físicas.",
      "En problemas cotidianos, muchas transformaciones pueden comprenderse siguiendo el intercambio de energía. Una batería alimenta un motor, el motor mueve un mecanismo y parte de la energía acaba transferida al ambiente mediante calor, vibraciones o sonido.",
      "La energía también nos recuerda que **«conservarse» no significa permanecer disponible para cualquier uso**. Las transformaciones pueden dispersarla y disminuir la capacidad de obtener trabajo útil, una cuestión que estudiaremos con la termodinámica.",
      "Su valor puede depender del sistema de referencia y, en algunos modelos, del cero convencional elegido para la energía potencial. Lo que importa es utilizar definiciones coherentes y atender a los cambios y balances adecuados.",
    ],
    narrativeTitle: "Conexión narrativa",
    narrative: [
      "La energía nos ayuda a estudiar cambios y transferencias. También abre la ruta jugable hacia **Cuantización** conforme a las dependencias reales del árbol. Esa conexión de juego no significa que la cuantización se deduzca únicamente de definir la energía.",
    ],
    examples: [
      {
        title: "1. La montaña rusa",
        paragraphs: [
          "En una montaña rusa ideal, cuando el vagón desciende disminuye su energía potencial gravitatoria y aumenta su energía cinética. En una atracción real, el rozamiento y la resistencia del aire transfieren parte de la energía mecánica al entorno.",
        ],
      },
      {
        title: "2. Un desayuno y una bicicleta",
        paragraphs: [
          "Tu organismo transforma la energía química de los alimentos mediante procesos bioquímicos. Parte puede contribuir al movimiento muscular y otra parte se transfiere como calor. La analogía ayuda a conectar física y biología, pero el cuerpo no funciona como una máquina térmica simple.",
        ],
      },
      {
        title: "3. Un panel solar",
        paragraphs: [
          "La radiación solar transporta energía que una célula fotovoltaica puede convertir parcialmente en energía eléctrica. El resto se refleja, transmite o contribuye a calentar materiales. No surge energía de la nada: cambian las vías de transferencia y conversión.",
        ],
      },
    ],
    deepDive: [
      heading("Energía cinética clásica"),
      paragraph("Para un cuerpo puntual de masa constante que se mueve a velocidad mucho menor que la de la luz:"),
      formula("K=\\frac{1}{2}mv^2"),
      paragraph("Si duplicas su velocidad, la energía cinética se multiplica por cuatro, siempre dentro del dominio de validez de esta fórmula clásica."),
      heading("Trabajo y cambio de energía cinética"),
      paragraph("El trabajo neto de las fuerzas sobre un cuerpo está relacionado con la variación de su energía cinética:"),
      formula("W_{\\mathrm{neto}}=\\Delta K"),
      paragraph("La energía potencial puede incorporarse cuando describimos interacciones conservativas con una elección adecuada del sistema y referencia."),
      heading("Masa y energía"),
      paragraph("En relatividad especial, la energía de reposo de un cuerpo es:"),
      formula("E_0=mc^2"),
      paragraph("Esta relación no quiere decir que toda energía sea simplemente «masa multiplicada por una constante». Forma parte de una relación relativista más general entre energía, momento y masa."),
      heading("Cuándo se conserva"),
      paragraph("En sistemas con simetría temporal adecuada aparece una cantidad conservada asociada a la energía. La afirmación requiere matices en contextos cosmológicos de espacio-tiempo dinámico."),
    ],
  },
  {
    code: "F00.16",
    sequence: 16,
    editorialStatus: "candidate",
    hookQuestion: "¿Por qué cuesta más detener un camión lento que una pelota que viene hacia ti a gran velocidad?",
    shortSummary: "El momento lineal describe una propiedad del movimiento que tiene magnitud y dirección. En un sistema con fuerza externa neta nula, el momento total se conserva, aunque los objetos individuales cambien su velocidad.",
    intro: [
      "Imagina dos objetos que se mueven hacia ti: una pelota ligera y un camión enorme. Aunque la pelota viaje más rápido, detener ambos puede implicar cambios de movimiento muy diferentes.",
      "Para describir esa diferencia, la física utiliza el **momento lineal**: una magnitud vectorial que combina la masa y la velocidad en la mecánica clásica.",
    ],
    details: [
      "En el lenguaje cotidiano «tener mucho impulso» puede significar simplemente avanzar con entusiasmo. En física, el momento lineal es una magnitud definida que nos ayuda a describir choques, retrocesos y cambios de movimiento.",
      "No depende solo de cuánto corre un objeto. También importa su masa y, sobre todo, **la dirección** en la que se mueve. Dos objetos con momentos iguales y opuestos pueden tener momento total cero, incluso estando ambos en movimiento.",
      "Una fuerza que actúa durante un intervalo de tiempo modifica el momento. Por eso las colisiones resultan tan interesantes: cuerpos que intercambian fuerzas pueden cambiar considerablemente sus momentos individuales mientras el total del sistema permanece constante, si el impulso externo es despreciable.",
      "En la mecánica clásica, para un cuerpo de masa constante, el momento es el producto de masa por velocidad. A velocidades relativistas, la expresión requiere una corrección; la idea general de conservación sigue siendo fundamental.",
      "No confundas el momento lineal con la energía cinética. Ambos intervienen en un choque, pero no son la misma magnitud y no obedecen las mismas reglas de conservación en todos los procesos.",
    ],
    narrativeTitle: "Conexión narrativa",
    narrative: [
      "Si el momento lineal nos ayuda a describir el movimiento en una dirección, ¿qué magnitud necesitamos para estudiar el **movimiento alrededor de un eje**? Ahí aparece el momento angular.",
    ],
    examples: [
      {
        title: "1. Dos patinadores que se empujan",
        paragraphs: [
          "Dos personas inicialmente quietas sobre hielo casi sin rozamiento se empujan y se alejan en sentidos contrarios. Sus momentos pueden ser opuestos y compensarse en el total. La persona de menor masa puede adquirir mayor velocidad.",
        ],
      },
      {
        title: "2. El airbag de un coche",
        paragraphs: [
          "En una colisión, el momento de una persona debe cambiar para detenerla. Aumentar el tiempo durante el cual se produce esa variación puede reducir la fuerza media necesaria para un mismo cambio de momento. El airbag no hace desaparecer el momento: modifica las condiciones del frenado.",
        ],
      },
      {
        title: "3. Dos carritos que chocan",
        paragraphs: [
          "Dos carritos pueden quedar unidos después de un impacto. Su energía cinética total puede disminuir, pero el momento total se conserva aproximadamente si las fuerzas externas horizontales son despreciables. Ese contraste explica por qué momento y energía cinética se estudian por separado.",
        ],
      },
    ],
    deepDive: [
      heading("Definición clásica"),
      paragraph("Para una partícula en mecánica newtoniana:"),
      formula("\\mathbf p=m\\mathbf v"),
      paragraph("El vector \\(\\mathbf p\\) apunta en la dirección de la velocidad si la masa es positiva. Su unidad en el SI es kilogramo·metro por segundo."),
      heading("Fuerza e impulso"),
      paragraph("La segunda ley de Newton se expresa de forma general clásica como:"),
      formula("\\mathbf F_{\\mathrm{neta}}=\\frac{d\\mathbf p}{dt}"),
      paragraph("Integrada en el tiempo, da el impulso:"),
      formula("\\mathbf J=\\int_{t_1}^{t_2}\\mathbf F_{\\mathrm{neta}}\\,dt=\\Delta\\mathbf p"),
      heading("La corrección relativista"),
      paragraph("Para una partícula con masa en reposo \\(m\\), la expresión relativista es:"),
      formula("\\mathbf p=\\gamma m\\mathbf v,\\qquad\\gamma=\\frac{1}{\\sqrt{1-v^2/c^2}}"),
      paragraph("Cuando \\(v\\) es mucho menor que \\(c\\), el factor \\(\\gamma\\) se aproxima a uno y recuperamos \\(\\mathbf p\\approx m\\mathbf v\\)."),
    ],
  },
  {
    code: "F00.17",
    sequence: 17,
    editorialStatus: "candidate",
    hookQuestion: "¿Por qué una patinadora gira más rápido cuando recoge los brazos?",
    shortSummary: "El momento angular caracteriza el movimiento rotacional respecto de una referencia. Si el torque externo neto respecto al punto elegido es nulo, el momento angular total del sistema se conserva.",
    intro: [
      "Una patinadora comienza a girar con los brazos extendidos. Después los acerca al cuerpo y su velocidad de giro aumenta. Parece que ha creado movimiento de la nada, pero no es así.",
      "Para entenderlo necesitamos una magnitud diferente del momento lineal: el **momento angular**, que describe aspectos del movimiento respecto de un punto o eje.",
    ],
    details: [
      "Un objeto puede desplazarse en línea recta y aun así tener momento angular respecto de un punto que no se encuentra sobre su trayectoria. Por eso no basta con decir que es «la cantidad de giro»: también importa **desde dónde** estudiamos el movimiento.",
      "En una patinadora que gira, cambiar la distribución de masa respecto al eje modifica el momento de inercia. Si el momento angular sobre ese eje permanece aproximadamente constante, una disminución del momento de inercia se acompaña de un aumento de la velocidad angular.",
      "Eso no implica conservar siempre la energía cinética de rotación. Al recoger los brazos, la patinadora realiza trabajo con sus músculos y puede aumentar esa energía.",
      "La relación es más general que una figura patinando: el momento angular aparece en órbitas, ruedas, moléculas y en numerosos sistemas físicos. Su conservación está relacionada con la invariancia de las leyes ante rotaciones bajo las hipótesis apropiadas.",
      "No confundamos el momento angular clásico de una trayectoria con el **espín cuántico** de las partículas, que también es momento angular pero no equivale simplemente a una bolita girando sobre sí misma.",
    ],
    narrativeTitle: "Conexión narrativa",
    narrative: [
      "El momento angular completa nuestra primera panorámica de grandes magnitudes conservadas. A partir de aquí podremos explorar cómo la física describe sistemas microscópicos, donde también intervienen la cuantización y formas de momento angular que desafían la intuición clásica.",
    ],
    examples: [
      {
        title: "1. La patinadora y sus brazos",
        paragraphs: [
          "Al acercar los brazos al cuerpo disminuye su momento de inercia y aumenta su velocidad angular, aproximadamente con momento angular constante si el torque externo es pequeño. El esfuerzo muscular explica por qué puede aumentar su energía cinética de rotación.",
        ],
      },
      {
        title: "2. La rueda de una bicicleta",
        paragraphs: [
          "Una rueda en rotación posee momento angular. Cambiar la dirección de su eje requiere un torque, y el comportamiento resultante puede sorprender cuando se sostiene la rueda por un extremo. El fenómeno no se reduce a que «la rueda quiere seguir girando»: depende de vectores y fuerzas.",
        ],
      },
      {
        title: "3. Un planeta alrededor del Sol",
        paragraphs: [
          "En un modelo donde la fuerza gravitatoria es central, el torque respecto al Sol es nulo y se conserva el momento angular orbital. En una órbita elíptica ideal, el planeta se mueve más deprisa cerca del Sol. Es parte de la explicación de la ley de las áreas de Kepler.",
        ],
      },
    ],
    deepDive: [
      heading("Definición vectorial"),
      paragraph("El momento angular orbital de una partícula respecto de un origen elegido es:"),
      formula("\\mathbf L=\\mathbf r\\times\\mathbf p"),
      paragraph("El producto vectorial indica que \\(\\mathbf L\\) depende de la posición relativa \\(\\mathbf r\\), del momento lineal \\(\\mathbf p\\) y del ángulo entre ambos."),
      heading("Torque y variación del momento angular"),
      paragraph("En mecánica clásica, respecto a un origen inercial fijo:"),
      formula("\\boldsymbol\\tau_{\\mathrm{ext}}=\\frac{d\\mathbf L}{dt}"),
      paragraph("Si el torque externo neto es cero, \\(\\mathbf L\\) se conserva. Para un sistema de partículas hay que considerar el total y las hipótesis sobre las interacciones internas."),
      heading("El caso de una rotación alrededor de un eje fijo"),
      paragraph("En una descripción sencilla de un cuerpo rígido que gira alrededor de un eje principal:"),
      formula("L=I\\omega"),
      paragraph("Así, cuando \\(L\\) permanece constante, una reducción de \\(I\\) puede acompañarse de un aumento de \\(\\omega\\). Esa expresión escalar es útil en el caso indicado, pero **no sustituye a la formulación vectorial general**."),
    ],
  },
  {
    code: "F00.18",
    sequence: 18,
    editorialStatus: "candidate",
    hookQuestion: "¿Y si algunas cantidades de la naturaleza no pudieran tomar cualquier valor, sino únicamente determinados valores permitidos?",
    shortSummary: "Cuantización significa que una magnitud física, en un sistema determinado, solo puede adoptar ciertos valores permitidos. No implica que todas las magnitudes de la naturaleza estén siempre divididas en escalones.",
    intro: [
      "Imagina que intentas subir por una escalera: puedes apoyar el pie en un peldaño o en el siguiente, pero no quedarte de pie en un peldaño imaginario entre ambos. Ahora piensa en una rampa, donde puedes detenerte prácticamente a cualquier altura. Son dos maneras muy distintas de cambiar de nivel.",
      "A escala microscópica, determinadas magnitudes se comportan, en sistemas y condiciones concretas, de una forma que recuerda a la escalera. Esta propiedad se llama **cuantización** y fue una de las pistas que obligaron a transformar nuestra visión de la física.",
    ],
    details: [
      "En la física clásica solemos imaginar que la energía de un objeto puede variar de manera continua: un coche puede moverse un poco más rápido o un poco más despacio, y cada cambio modifica su energía cinética. Esa intuición funciona muy bien en numerosos fenómenos cotidianos.",
      "Sin embargo, un átomo ligado no puede intercambiar cualquier cantidad de energía al pasar entre dos niveles electrónicos permitidos. La diferencia entre ambos niveles determina la energía del fotón que puede emitir o absorber en esa transición.",
      "Esto no significa que un electrón sea una pequeña bolita que salta entre órbitas planetarias. Los estados electrónicos se describen mediante la mecánica cuántica, y los llamados «niveles» corresponden a energías de estados permitidos.",
      "La cuantización tampoco obliga a que el espectro de cualquier observable sea discreto. Por ejemplo, una partícula libre idealizada puede presentar un espectro continuo de momentos y energías, mientras que un sistema confinado puede tener determinados niveles discretos.",
      "Lo fundamental no es imaginar que todo está hecho de píxeles invisibles, sino comprender que **las reglas de los estados cuánticos y de sus mediciones pueden imponer valores discretos**.",
    ],
    narrativeTitle: "Conexión narrativa",
    narrative: [
      "Si un sistema solo admite ciertos resultados, necesitamos una manera de describir **en qué estado se encuentra** y qué podemos predecir de él. Esa es la puerta de entrada a **F00.19 — Estado cuántico**.",
    ],
    examples: [
      {
        title: "1. Una escalera frente a una rampa",
        paragraphs: [
          "En una escalera los niveles están separados; en una rampa, las alturas disponibles forman un continuo. La analogía ayuda a distinguir un conjunto discreto de uno continuo. Su límite es importante: los «peldaños» cuánticos no son escalones físicos escondidos dentro de un átomo.",
        ],
      },
      {
        title: "2. Los colores que emite un gas",
        paragraphs: [
          "En determinadas condiciones, el hidrógeno produce líneas espectrales características en lugar de emitir por igual todas las frecuencias. Cada línea está relacionada con transiciones entre estados de energía. Es como una firma luminosa que revela la estructura cuántica del átomo.",
        ],
      },
      {
        title: "3. El efecto fotoeléctrico",
        paragraphs: [
          "Iluminar una superficie adecuada con luz de frecuencia suficientemente alta puede liberar electrones. Aumentar solo la intensidad de una luz cuya frecuencia está por debajo del umbral no produce el mismo efecto fotoeléctrico ideal. La energía de cada fotón depende de su frecuencia, no simplemente del brillo total del haz.",
        ],
      },
    ],
    deepDive: [
      heading("Energía de un fotón"),
      paragraph("La relación entre la energía de un fotón y su frecuencia es:"),
      formula("E=h\\nu"),
      paragraph("Aquí, \\(E\\) es la energía del fotón, \\(\\nu\\) su frecuencia y \\(h\\) la constante de Planck. Una frecuencia mayor corresponde a una energía mayor por fotón."),
      heading("Transiciones entre niveles"),
      paragraph("En una transición radiativa sencilla entre estados de energía definida:"),
      formula("|\\Delta E|=h\\nu"),
      paragraph("La frecuencia emitida o absorbida refleja la diferencia de energía entre los estados. No todas las transiciones imaginables están permitidas: pueden intervenir reglas de selección y otros factores físicos."),
      heading("Un ejemplo de niveles discretos: el oscilador armónico cuántico"),
      formula("E_n=\\hbar\\omega\\left(n+\\frac{1}{2}\\right),\\qquad n=0,1,2,\\ldots"),
      paragraph("Este modelo idealizado admite energías igualmente espaciadas, con un estado fundamental de energía no nula. No todos los sistemas cuánticos tienen niveles igualmente separados."),
      heading("La advertencia decisiva"),
      paragraph("Cuantización no equivale a afirmar que «el espacio, el tiempo y toda forma de energía vienen en trocitos». Esa conclusión no se desprende de estos ejemplos. La naturaleza discreta o continua de una magnitud depende del sistema y del observable, y algunas cuestiones —como una posible estructura cuántica del espacio-tiempo— siguen abiertas."),
    ],
  },
  {
    code: "F00.19",
    sequence: 19,
    editorialStatus: "candidate",
    hookQuestion: "Si no podemos describir un electrón como una bolita con una trayectoria perfectamente definida, ¿qué información utilizamos para predecir su comportamiento?",
    shortSummary: "El estado cuántico es la descripción matemática con la que la teoría predice los resultados posibles y sus probabilidades. No equivale necesariamente a una lista de propiedades clásicas ya definidas.",
    intro: [
      "En un videojuego puedes consultar el estado de tu personaje: posición, velocidad, energía y objetos que lleva. Con esos datos, junto a las reglas del juego, puedes anticipar qué sucederá si realiza una acción.",
      "En el mundo cuántico también hablamos de **estado**, pero no consiste simplemente en una ficha que enumera valores clásicos ocultos. Un estado cuántico reúne la información necesaria para calcular las probabilidades de los resultados de las mediciones que podemos realizar.",
    ],
    details: [
      "Piensa en una partícula como un electrón. En la descripción cuántica no siempre tiene sentido asignarle simultáneamente una posición exacta y un momento exacto como si siguiera una trayectoria clásica, aunque aún no la hayamos visto.",
      "En muchos problemas, el estado se representa mediante una **función de onda**. Su valor no es una nube de materia que podamos fotografiar directamente: contiene amplitudes que permiten calcular probabilidades para resultados de una medición.",
      "La función de onda puede cambiar con el tiempo siguiendo una ley de evolución bien definida. Esto es una de las grandes sorpresas de la teoría: la evolución matemática de un sistema aislado puede ser determinista, mientras que los resultados individuales de determinadas mediciones se describen probabilísticamente.",
      "Conviene evitar otro equívoco. Un estado cuántico no siempre se representa por una única función de onda simple: los sistemas pueden tener espín, varias partículas, estados mixtos y otras descripciones matemáticas. La función de onda espacial es una puerta de entrada útil, no toda la teoría.",
      "También sigue habiendo preguntas interpretativas sobre qué representa exactamente el estado cuántico en la realidad. Lo que no está en duda es que este formalismo permite hacer predicciones experimentales extraordinariamente precisas.",
    ],
    narrativeTitle: "Conexión narrativa",
    narrative: [
      "Un estado cuántico puede combinar amplitudes correspondientes a varios resultados de una medición. Para entender por qué esa combinación no es una simple mezcla de posibilidades clásicas, continuaremos con **F00.20 — Superposición**.",
    ],
    examples: [
      {
        title: "1. Un mapa meteorológico, pero con una diferencia crucial",
        paragraphs: [
          "Un mapa de probabilidades de lluvia ayuda a anticipar dónde puede llover, sin prometer el resultado de cada nube. La semejanza es que ambos modelos producen predicciones probabilísticas. El límite: la incertidumbre meteorológica suele depender de conocimiento incompleto y dinámica compleja; las probabilidades cuánticas no pueden reducirse sin más a ese mismo tipo de ignorancia clásica.",
        ],
      },
      {
        title: "2. Un electrón alrededor de un núcleo",
        paragraphs: [
          "Las ilustraciones de orbitales atómicos muestran regiones donde sería más probable detectar el electrón en determinadas condiciones. No representan un pequeño planeta recorriendo una órbita fija. La forma de un orbital proviene del estado cuántico y de su función de onda.",
        ],
      },
      {
        title: "3. Un sistema de dos niveles",
        paragraphs: [
          "Ciertos sistemas cuánticos pueden describirse usando dos estados básicos, que solemos llamar \\(|0\\rangle\\) y \\(|1\\rangle\\). Se utilizan para introducir los cúbits. Un cúbit no es simplemente una moneda clásica que ignoramos si está en cara o cruz: también pueden importar las fases relativas de sus amplitudes.",
        ],
      },
    ],
    deepDive: [
      heading("La notación de estados"),
      paragraph("Un estado puro se representa habitualmente por un vector normalizado, por ejemplo:"),
      formula("|\\psi\\rangle=\\alpha|0\\rangle+\\beta|1\\rangle"),
      paragraph("Los coeficientes \\(\\alpha\\) y \\(\\beta\\) pueden ser números complejos. Para una base ortonormal de dos estados:"),
      formula("|\\alpha|^2+|\\beta|^2=1"),
      paragraph("Esta normalización permite interpretar las probabilidades de los resultados \\(0\\) y \\(1\\) en esa medición. Las fases relativas pueden afectar las predicciones de otras mediciones."),
      heading("La función de onda espacial"),
      paragraph("Si representamos el estado de una partícula por \\(\\psi(x,t)\\) en una dimensión, la probabilidad de detectarla dentro de una región \\([a,b]\\) se obtiene mediante:"),
      formula("P(a\\leq x\\leq b)=\\int_a^b|\\psi(x,t)|^2\\,dx"),
      paragraph("La expresión presupone una función de onda normalizada y la medición de posición habitual. La cantidad \\(|\\psi|^2\\) es una **densidad de probabilidad**, no una probabilidad puntual en un continuo."),
      heading("Evolución entre mediciones"),
      paragraph("Para un sistema aislado apropiadamente descrito por un Hamiltoniano \\(\\hat H\\):"),
      formula("i\\hbar\\frac{\\partial}{\\partial t}|\\psi(t)\\rangle=\\hat H|\\psi(t)\\rangle"),
      paragraph("Es la ecuación de Schrödinger en forma abstracta. El tratamiento de la medición y la interpretación de sus resultados exige además especificar cómo se relaciona el estado con los observables y el aparato experimental."),
    ],
  },
  {
    code: "F00.20",
    sequence: 20,
    editorialStatus: "candidate",
    hookQuestion: "¿Cómo puede una sola descripción cuántica combinar posibilidades distintas y producir efectos que desaparecerían si solo ignorásemos cuál de ellas ocurrió?",
    shortSummary: "Una superposición cuántica combina amplitudes de distintos estados. Sus fases relativas pueden producir interferencia; no es lo mismo que desconocer cuál de dos situaciones clásicas ocurrió.",
    intro: [
      "Imagina dos ondas en un estanque. Cuando coinciden, pueden reforzarse o cancelarse parcialmente según cómo se superpongan sus crestas y valles. El resultado depende de cómo se combinan, no solo de la existencia de cada onda por separado.",
      "La mecánica cuántica tiene una propiedad matemática llamada **superposición**: si dos estados son posibles dentro de una descripción lineal, podemos construir combinaciones de sus amplitudes. Y esas combinaciones pueden producir interferencia observable.",
    ],
    details: [
      "La frase «una partícula está en dos sitios a la vez» resulta tentadora. Pero, tomada literalmente, puede llevar a imaginar dos copias materiales de una bolita clásica. Eso no es lo que afirma el formalismo cuántico.",
      "En un experimento de doble rendija, la distribución de detecciones puede revelar interferencia cuando se mantienen las condiciones adecuadas y no se dispone de información que distinga por cuál camino pasó la partícula. Cada detección aparece localizada en el detector; la pauta estadística emerge al repetir muchas veces el experimento.",
      "Si el montaje permite distinguir los caminos de una manera que destruye la coherencia pertinente, la interferencia desaparece o disminuye. No hace falta que una persona mire conscientemente: bastan interacciones físicas capaces de registrar información del camino.",
      "La superposición también depende de la base de estados que elegimos para describir el sistema. Un estado que es definido respecto a un observable puede expresarse como una combinación respecto a otro. Por eso preguntar «¿está en superposición?» sin indicar **de qué estados o de qué medición** puede ser ambiguo.",
      "La analogía de ondas ayuda a entender la interferencia. Su límite está en que la función de onda cuántica no se comporta siempre como una ondulación de agua que podamos observar directamente en el espacio ordinario.",
    ],
    narrativeTitle: "Conexión narrativa",
    narrative: [
      "Si no todos los observables pueden tener simultáneamente distribuciones arbitrariamente estrechas, aparece una limitación que no es simple torpeza experimental: **F00.21 — Incertidumbre**.",
    ],
    examples: [
      {
        title: "1. Dos ondas que se encuentran",
        paragraphs: [
          "Cuando dos ondas llegan a un mismo lugar, sus amplitudes se suman. Si coinciden en fase pueden reforzarse; si llegan en oposición pueden cancelarse. Es una buena puerta de entrada a la interferencia, aunque las amplitudes cuánticas son entidades matemáticas complejas y no simples alturas de agua.",
        ],
      },
      {
        title: "2. La doble rendija",
        paragraphs: [
          "Electrones o fotones enviados individualmente a través de un montaje adecuado pueden generar, tras muchas detecciones, un patrón de interferencia. El patrón refleja cómo se combinan las amplitudes de los caminos indistinguibles. No demuestra por sí solo que una partícula sea dos bolitas físicas simultáneas.",
        ],
      },
      {
        title: "3. Un cúbit y su fase relativa",
        paragraphs: [
          "Dos estados de cúbit pueden dar probabilidades iguales al medir \\(0\\) o \\(1\\) y, sin embargo, producir resultados diferentes en otra base porque sus fases relativas son distintas. Esa diferencia es precisamente algo que una mezcla clásica no conserva de la misma manera.",
        ],
      },
    ],
    deepDive: [
      heading("Combinación lineal de estados"),
      paragraph("Para dos estados \\(|a\\rangle\\) y \\(|b\\rangle\\) de un mismo espacio de Hilbert:"),
      formula("|\\psi\\rangle=\\alpha|a\\rangle+\\beta|b\\rangle"),
      paragraph("Las amplitudes y la normalización deben tratarse correctamente; si los estados de base no son ortogonales, no basta con sumar \\(|\\alpha|^2+|\\beta|^2\\) para normalizar."),
      heading("De dónde sale la interferencia"),
      paragraph("Si dos alternativas indistinguibles aportan amplitudes \\(A_1\\) y \\(A_2\\), la probabilidad es proporcional a:"),
      formula("P\\propto|A_1+A_2|^2"),
      paragraph("Al desarrollar el módulo al cuadrado aparecen términos cruzados:"),
      formula("|A_1+A_2|^2=|A_1|^2+|A_2|^2+2\\operatorname{Re}(A_1^*A_2)"),
      paragraph("El último término depende de la fase relativa y permite interferencia. Cuando las alternativas se vuelven distinguibles o se pierde la coherencia pertinente, no podemos utilizar sin más esa misma suma coherente para las probabilidades observadas."),
      heading("Superposición no significa mezcla estadística"),
      paragraph("Una mezcla clásica asigna probabilidades a alternativas ya diferenciadas dentro de su modelo. Una superposición coherente mantiene información de fase entre componentes. Esta distinción es central para comprender la interferencia y muchas tecnologías cuánticas."),
    ],
  },
  {
    code: "F00.21",
    sequence: 21,
    editorialStatus: "candidate",
    hookQuestion: "¿Y si existiera un límite a lo concentradas que pueden estar ciertas propiedades de un estado, incluso usando instrumentos perfectos?",
    shortSummary: "El principio de incertidumbre establece límites a la dispersión conjunta de determinados observables en un estado cuántico, como posición y momento. No significa que medir siempre sea descuidado ni que toda propiedad sea impredecible.",
    intro: [
      "Imagina una nota musical muy breve. Cuanto menos dura el sonido, más difícil resulta asociarlo a una única frecuencia perfectamente definida. En cambio, una oscilación prolongada puede tener una frecuencia mucho más precisa.",
      "Esta relación entre extensión y contenido en frecuencias nos ayuda a intuir una idea cuántica: **ciertas distribuciones de resultados no pueden estrecharse simultáneamente tanto como queramos**. No es solamente un problema de aparatos poco precisos.",
    ],
    details: [
      "Supongamos que preparamos muchas copias de un sistema en el mismo estado y medimos la posición en unas y el momento en otras. Las distribuciones estadísticas que obtenemos presentan anchuras o dispersiones características.",
      "Para posición y momento, la mecánica cuántica establece un límite inferior para el producto de sus desviaciones estándar. Podemos preparar estados con una distribución espacial más concentrada, pero eso exige aceptar una distribución de momentos más extendida, y viceversa.",
      "Es habitual explicar este principio diciendo que «al mirar una partícula la golpeamos y la movemos». Una medida real puede perturbar un sistema, pero **esa perturbación no es la explicación general de la relación de incertidumbre entre dispersiones de posición y momento**. La relación se sigue de la estructura matemática de los estados y los observables.",
      "Tampoco significa que cada magnitud física deba ser imprecisa. Existen estados que tienen un valor definido de ciertos observables; y hay pares de observables compatibles cuyas distribuciones pueden afinarse simultáneamente.",
      "La comparación con una nota musical es una analogía matemática útil por la conexión con el análisis de Fourier. Su límite: escuchar una nota durante poco tiempo no es un experimento cuántico ni demuestra por sí mismo la incertidumbre de Heisenberg.",
    ],
    narrativeTitle: "Conexión narrativa",
    narrative: [
      "La incertidumbre nos obliga a pensar en distribuciones de posibles resultados. Pero ¿cómo extrae la física cuántica sus probabilidades concretas? Continuemos con **F00.22 — Probabilidad de los resultados**.",
    ],
    examples: [
      {
        title: "1. Una nota muy corta",
        paragraphs: [
          "Un sonido casi instantáneo necesita una combinación amplia de frecuencias; uno prolongado puede concentrarse mucho más alrededor de una frecuencia. La analogía muestra un compromiso entre localización y contenido en frecuencias, no un error humano de audición.",
        ],
      },
      {
        title: "2. Un electrón confinado",
        paragraphs: [
          "Si un electrón está preparado en un estado muy localizado dentro de una región espacial, su distribución de momentos no puede ser arbitrariamente estrecha. Por eso la imagen de «un electrón completamente quieto en un punto exacto» no suele representar un estado físico permitido con ambas dispersiones nulas.",
        ],
      },
      {
        title: "3. Afinar un experimento",
        paragraphs: [
          "Podemos mejorar la resolución de un detector y reducir errores de medición. Eso no elimina la dispersión propia de los resultados que predice un estado cuántico para observables incompatibles. Precisión del instrumento y dispersión del estado son conceptos distintos.",
        ],
      },
    ],
    deepDive: [
      heading("La relación posición–momento"),
      paragraph("En una dimensión, utilizando las desviaciones estándar \\(\\Delta x\\) y \\(\\Delta p_x\\) en un estado adecuado:"),
      formula("\\Delta x\\,\\Delta p_x\\geq\\frac{\\hbar}{2}"),
      paragraph("Aquí \\(\\hbar=h/(2\\pi)\\) es la constante de Planck reducida. No es una afirmación de que un aparato tenga necesariamente esos márgenes de error en cada medición individual."),
      heading("Por qué aparece"),
      paragraph("Los operadores de posición y momento satisfacen:"),
      formula("[\\hat x,\\hat p_x]=i\\hbar"),
      paragraph("La no conmutatividad y las propiedades estadísticas de los estados conducen a la relación de incertidumbre. Más generalmente, para observables autoadjuntos apropiados \\(A\\) y \\(B\\):"),
      formula("\\Delta A\\,\\Delta B\\geq\\frac{1}{2}\\left|\\langle[\\hat A,\\hat B]\\rangle\\right|"),
      paragraph("Es una forma de la desigualdad de Robertson, bajo las condiciones matemáticas pertinentes."),
      heading("Tres nociones que no conviene confundir"),
      list([
        "**Incertidumbre del estado:** dispersión estadística de resultados para un observable.",
        "**Error de medición:** diferencia o incertidumbre asociada al procedimiento instrumental.",
        "**Perturbación de medición:** modificación física que la medición puede provocar.",
      ]),
      paragraph("Están relacionadas en problemas concretos, pero no son sinónimos y no todas se expresan con la misma desigualdad."),
    ],
  },
  {
    code: "F00.22",
    sequence: 22,
    editorialStatus: "candidate",
    hookQuestion: "Si un experimento cuántico puede tener varios resultados, ¿cómo consigue la ciencia predecir con precisión algo que no puede anticipar uno por uno?",
    shortSummary: "La regla de Born transforma las amplitudes del estado cuántico en probabilidades de resultados de una medición. No predice siempre cada resultado individual, pero sí distribuciones contrastables experimentalmente.",
    intro: [
      "Imagina que lanzas una moneda muchas veces. No puedes anunciar con seguridad cuál será la siguiente cara, pero sí puedes estudiar la frecuencia con la que aparece cada resultado. Con suficientes lanzamientos y condiciones estables, comienzan a reconocerse patrones.",
      "En los experimentos cuánticos también aparecen distribuciones repetibles de resultados. La diferencia es que sus probabilidades se calculan a partir del **estado cuántico y de la medición concreta** mediante una regla fundamental de la teoría.",
    ],
    details: [
      "Una descripción cuántica puede predecir con enorme precisión el reparto estadístico de resultados aun cuando no asigne un resultado seguro a cada ensayo individual.",
      "Piensa en un experimento en el que registramos dónde llegan electrones a una pantalla. Cada impacto aparece en un lugar concreto. Al repetir muchas veces el procedimiento bajo condiciones equivalentes, la distribución de impactos puede coincidir con la probabilidad calculada mediante la función de onda.",
      "Pero la probabilidad no sale de contar cuántos «pedacitos de electrón» hay en cada lugar. El estado aporta **amplitudes** y, mediante la regla de Born, obtenemos probabilidades. Para una medición de posición continua se utiliza una densidad; para resultados discretos, probabilidades de cada alternativa.",
      "Una dificultad habitual es confundir «probabilístico» con «sin leyes». La física cuántica tiene reglas matemáticas muy exigentes y sus predicciones estadísticas son comprobables. La incertidumbre de un resultado individual no significa que todo sea azar sin estructura.",
      "La comparación con una moneda tiene límites. En un lanzamiento clásico, buena parte de nuestra incertidumbre procede de no conocer y controlar todos los detalles iniciales; no debemos asumir que esa es automáticamente la explicación de las probabilidades cuánticas.",
    ],
    narrativeTitle: "Conexión narrativa",
    narrative: [
      "Ya hemos descubierto cómo se describen los estados y cómo obtenemos probabilidades. Más adelante, al estudiar **F00.23 — Campo físico** y la **teoría cuántica de campos**, ampliaremos esta mirada a sistemas en los que las partículas no son la única forma útil de describir la naturaleza.",
    ],
    examples: [
      {
        title: "1. Una pantalla y miles de impactos",
        paragraphs: [
          "Cada electrón registrado produce una detección localizada. Tras numerosos ensayos, aparece una distribución espacial que puede compararse con la predicción cuántica. Lo que se acumula no son electrones «difusos», sino datos de resultados individuales.",
        ],
      },
      {
        title: "2. Dos resultados posibles",
        paragraphs: [
          "Prepara un sistema de dos niveles en un estado adecuado. Si las amplitudes relativas corresponden a probabilidades de 70 % y 30 % en una medición concreta, esperamos aproximadamente esas proporciones en muchas repeticiones independientes. No significa que en diez ensayos tengan que aparecer exactamente siete resultados de un tipo y tres del otro.",
        ],
      },
      {
        title: "3. La trampa de sumar probabilidades demasiado pronto",
        paragraphs: [
          "Cuando dos caminos cuánticos son indistinguibles y coherentes, primero debemos combinar sus amplitudes y después calcular la probabilidad. Si sumáramos las probabilidades por separado perderíamos los términos de interferencia. Por eso la superposición no es solo una manera vistosa de hablar del azar.",
        ],
      },
    ],
    deepDive: [
      heading("La regla de Born en una base discreta"),
      paragraph("Si un estado puro normalizado se expresa mediante estados ortonormales \\(|i\\rangle\\):"),
      formula("|\\psi\\rangle=\\sum_i c_i|i\\rangle"),
      paragraph("La probabilidad del resultado correspondiente a \\(|i\\rangle\\), para esa medición proyectiva no degenerada, es:"),
      formula("P(i)=|c_i|^2,\\qquad\\sum_iP(i)=1"),
      paragraph("Las probabilidades son reales, no negativas y están normalizadas."),
      heading("Probabilidad de encontrar una partícula en una región"),
      paragraph("Para una función de onda espacial normalizada en una dimensión:"),
      formula("P(a\\leq x\\leq b)=\\int_a^b|\\psi(x,t)|^2\\,dx"),
      paragraph("La cantidad \\(|\\psi(x,t)|^2\\) es una densidad de probabilidad: para un punto exacto de una variable continua, la probabilidad puntual es cero en los casos ordinarios, aunque la densidad pueda ser distinta de cero."),
      heading("Una formulación más general"),
      paragraph("Para un estado representado por una matriz densidad \\(\\rho\\) y un resultado asociado a un operador positivo \\(E_i\\) de una medición válida:"),
      formula("P(i)=\\operatorname{Tr}(\\rho E_i)"),
      paragraph("Esta forma incluye estados mixtos y mediciones más generales. Los operadores de medida cumplen condiciones de positividad y normalización apropiadas. No es necesario dominarla para usar la regla de Born en sus ejemplos más sencillos."),
      heading("¿Significa esto que entendemos por qué aparece un resultado concreto?"),
      paragraph("Las predicciones operativas de la mecánica cuántica están extraordinariamente contrastadas, pero las interpretaciones de qué ocurre exactamente durante una medición y qué representa el estado siguen siendo cuestiones debatidas. SOMA debe distinguir el éxito experimental de la teoría de esas preguntas abiertas."),
    ],
  },
  {
    code: "F00.23",
    sequence: 23,
    editorialStatus: "candidate",
    hookQuestion: "¿Cómo puede un imán influir en una brújula sin llegar a tocarla?",
    shortSummary: "Un campo físico describe cómo se distribuye una magnitud por el espacio y el tiempo. Algunos campos, como el electromagnético, tienen dinámica propia y pueden transportar energía y momento.",
    intro: [
      "Acerca un imán a una brújula y observa cómo cambia la orientación de su aguja. Entre ambos objetos no hay engranajes, hilos ni ninguna pieza visible que transmita el movimiento. Sin embargo, la aguja responde de manera distinta según dónde la coloques.",
      "La física describe situaciones como esta mediante **campos**: magnitudes que tienen un valor en cada punto de una región del espacio y que pueden cambiar con el tiempo.",
    ],
    details: [
      "Imagina un mapa de temperaturas de una ciudad. Cada punto del mapa tiene asignada una temperatura. Si repites las mediciones unas horas después, obtendrás otro mapa. Matemáticamente, puedes describir toda esa información mediante un campo de temperatura.",
      "Pero no todos los campos se describen con un único número. En un mapa de viento, también necesitas conocer hacia dónde sopla el aire. Esa información adicional permite construir un campo vectorial, en el que cada punto tiene asociadas una magnitud y una dirección.",
      "El campo eléctrico y el magnético son ejemplos fundamentales. Una carga eléctrica puede experimentar una fuerza dependiendo del campo que encuentra y de su movimiento. No hace falta dibujar un hilo material entre las cargas para describir esa interacción.",
      "Además, los campos electromagnéticos no son simplemente una manera cómoda de anotar fuerzas. Pueden variar, propagarse y llevar energía por regiones sin materia ordinaria. La luz que nos llega del Sol es un ejemplo de propagación electromagnética.",
      "Conviene distinguir el mapa de temperaturas, que describe el estado de un sistema material, de un campo fundamental de la física. Ambos comparten una idea matemática, pero eso no significa que el campo electromagnético sea un fluido invisible compuesto por partículas de aire. Cuando lleguemos a la teoría cuántica de campos, descubriremos que la descripción de los campos adquiere propiedades nuevas.",
    ],
    narrativeTitle: "Conexión narrativa",
    narrative: [
      "Ya tenemos una forma de describir lo que sucede en distintas regiones del espacio. Ahora podemos preguntarnos cómo se afectan mutuamente los sistemas físicos en **F00.24 — Interacción**, y cómo cambia nuestra descripción de los campos cuando incorporamos la física cuántica en **F00.25 — Teoría cuántica de campos**.",
    ],
    examples: [
      {
        title: "1. El pronóstico del viento",
        paragraphs: [
          "En una aplicación meteorológica puedes ver flechas que indican cómo sopla el viento en diferentes lugares. Cada flecha representa el valor local del campo de velocidades del aire. No es una partícula ni una carretera que el aire deba seguir: es una herramienta de representación. Los diagramas de campos eléctricos y magnéticos utilizan ideas similares, aunque describan fenómenos distintos.",
        ],
      },
      {
        title: "2. La brújula que se orienta",
        paragraphs: [
          "Una brújula responde al campo magnético presente donde se encuentra. Si la desplazas cerca de un imán, su orientación puede cambiar porque cambia la dirección del campo. La aguja experimenta un efecto de rotación que tiende a alinearla con el campo; no se limita a viajar por una línea magnética dibujada.",
        ],
      },
      {
        title: "3. Una señal que atraviesa el vacío",
        paragraphs: [
          "Una antena puede emitir ondas electromagnéticas y otra recibirlas a distancia. Esas ondas también pueden propagarse en el vacío, como ocurre con la comunicación entre una sonda espacial y la Tierra. A diferencia del sonido ordinario, no necesitan aire ni otro medio material que vibre. La propagación electromagnética en el vacío respeta la velocidad límite de la relatividad.",
        ],
      },
    ],
    deepDive: [
      heading("Campos escalares y vectoriales"),
      paragraph("En una descripción clásica, un campo escalar puede escribirse como:"),
      formula("T(\\mathbf{x},t)"),
      paragraph("Aquí, \\(\\mathbf{x}\\) representa la posición y \\(t\\) el instante. El resultado es un número, como una temperatura. Un campo vectorial, en cambio, puede representarse mediante tres componentes espaciales:"),
      formula("\\mathbf{E}(\\mathbf{x},t)=(E_x,E_y,E_z)"),
      paragraph("La dirección y las componentes dependen de cómo elegimos los ejes. Existen también campos tensoriales y otras estructuras; la métrica del espacio-tiempo es un ejemplo que ya hemos empezado a estudiar."),
      heading("La fuerza de Lorentz"),
      paragraph("En electromagnetismo clásico, la fuerza sobre una partícula puntual de carga \\(q\\) y velocidad \\(\\mathbf{v}\\) es:"),
      formula("\\mathbf{F}=q(\\mathbf{E}+\\mathbf{v}\\times\\mathbf{B})"),
      paragraph("El campo eléctrico \\(\\mathbf{E}\\) contribuye incluso si la partícula está instantáneamente en reposo. La contribución magnética depende también del movimiento y es perpendicular a la velocidad. Por sí sola, esta fuerza magnética no realiza trabajo sobre la partícula puntual."),
      heading("La energía de un campo"),
      paragraph("En electromagnetismo clásico, en el vacío y en unidades del Sistema Internacional, la densidad de energía es:"),
      formula("u=\\frac{\\epsilon_0}{2}|\\mathbf{E}|^2+\\frac{1}{2\\mu_0}|\\mathbf{B}|^2"),
      paragraph("Aquí, \\(u\\) es energía por unidad de volumen, y \\(\\epsilon_0\\) y \\(\\mu_0\\) son las constantes eléctricas y magnéticas del vacío. Una onda electromagnética puede transportar energía incluso donde no existe materia ordinaria."),
      heading("Del campo clásico al cuántico"),
      paragraph("Un campo clásico tiene valores descritos por funciones. En teoría cuántica de campos, los campos se representan mediante estructuras de operadores y sus estados cuánticos. No basta con asignar a cada punto una pequeña vibración clásica de valor desconocido."),
    ],
  },
  {
    code: "F00.24",
    sequence: 24,
    editorialStatus: "candidate",
    hookQuestion: "¿Por qué una misma naturaleza puede mantener unidos los átomos, hacer brillar las estrellas y transformar unas partículas en otras?",
    shortSummary: "Una interacción es una influencia física entre sistemas. El Modelo Estándar describe las interacciones electromagnética, fuerte y débil; la gravitación se describe con gran éxito mediante la relatividad general.",
    intro: [
      "Cuando apoyas la mano sobre una mesa, sus átomos no atraviesan libremente los de tu piel. Cuando el Sol mantiene a la Tierra en órbita, ni siquiera necesita tocarla. Y dentro de las estrellas ocurren procesos en los que algunas partículas se transforman.",
      "Estos fenómenos nos hablan de **interacciones físicas**: formas en las que unos sistemas afectan a otros, modificando su movimiento, su estado o las posibilidades de transformación.",
    ],
    details: [
      "A veces identificamos una interacción con una fuerza: empujar una caja cambia su movimiento. Pero el concepto es más amplio. Una interacción también puede participar en una transformación de partículas, una emisión de luz o un intercambio de energía y momento.",
      "El electromagnetismo desempeña un papel central en la estructura atómica, la química, la electricidad y los fenómenos luminosos. Incluso la resistencia de una mesa a dejar pasar tu mano requiere combinar la física electromagnética con propiedades cuánticas de la materia, entre ellas el principio de exclusión de Pauli.",
      "La interacción fuerte gobierna la dinámica de los quarks y gluones. Sus efectos también permiten comprender por qué muchos protones y neutrones pueden permanecer unidos en los núcleos. No se trata simplemente de un pegamento clásico: el comportamiento de la interacción fuerte cambia notablemente con la escala a la que se investiga.",
      "La interacción débil interviene en procesos como la desintegración beta y permite ciertas transformaciones de partículas. La gravedad, por su parte, resulta decisiva en fenómenos astronómicos y cosmológicos y posee una descripción geométrica muy precisa mediante la relatividad general.",
      "La física de partículas describe las tres primeras mediante teorías cuánticas de campos. Hablar de bosones mediadores es útil, pero la imagen de dos bolitas lanzándose otras bolitas no reproduce fielmente todos los procesos. Las interacciones se calculan mediante reglas cuánticas, y las partículas virtuales que aparecen en algunos cálculos no son proyectiles observables directamente.",
    ],
    narrativeTitle: "Conexión narrativa",
    narrative: [
      "Hemos aprendido que las interacciones no son simplemente contactos mecánicos. Para describirlas a escala subatómica necesitaremos combinar relatividad especial, estados cuánticos y campos. Esa combinación nos lleva a **F00.25 — Teoría cuántica de campos**.",
    ],
    examples: [
      {
        title: "1. El imán y la puerta de la nevera",
        paragraphs: [
          "La atracción de un imán por ciertos materiales se explica mediante el electromagnetismo y el comportamiento cuántico colectivo de sus componentes. El imán no crea una quinta fuerza especial para la nevera: estamos viendo un fenómeno macroscópico que emerge de la física microscópica.",
        ],
      },
      {
        title: "2. El interior de un núcleo",
        paragraphs: [
          "Dos protones tienen carga eléctrica positiva y experimentan repulsión electromagnética. Aun así, muchos núcleos contienen varios protones. La interacción nuclear entre protones y neutrones, que surge de la dinámica fuerte subyacente, contribuye a que puedan permanecer ligados. No cualquier combinación forma un núcleo estable.",
        ],
      },
      {
        title: "3. Una transformación en el Sol",
        paragraphs: [
          "En la cadena protón-protón del Sol, un proceso de interacción débil permite que dos protones den lugar a un núcleo de deuterio, un positrón y un neutrino electrónico. Intervienen también otros procesos físicos. La lentitud de ese paso débil contribuye a determinar el ritmo de la fusión en estrellas como el Sol.",
        ],
      },
    ],
    deepDive: [
      heading("Interacciones y mediadores en el Modelo Estándar"),
      list([
        "Electromagnetismo: el fotón está asociado al campo electromagnético.",
        "Interacción fuerte: los gluones están asociados a la dinámica de la carga de color de la cromodinámica cuántica.",
        "Interacción débil: intervienen los bosones \\(W^+\\), \\(W^-\\) y \\(Z^0\\).",
      ]),
      paragraph("El campo de Higgs también participa en interacciones del Modelo Estándar. Su bosón no debe confundirse con un mediador de la gravedad. La mayor parte de la masa de protones y neutrones no se explica sumando únicamente las masas de sus quarks elementales."),
      heading("Una descripción clásica y sus límites"),
      paragraph("Para dos cargas puntuales en reposo, separadas una distancia \\(r\\) en el vacío, la magnitud de la fuerza electrostática cumple:"),
      formula("F=\\frac{1}{4\\pi\\epsilon_0}\\frac{|q_1q_2|}{r^2}"),
      paragraph("Esta expresión no describe por sí sola la radiación, la creación de partículas o todos los efectos cuánticos. Es una aproximación útil en su régimen correspondiente."),
      heading("Conservar no significa que nada cambie"),
      paragraph("En una interacción, el momento de cada participante puede cambiar. Para un sistema aislado en un marco inercial, con todos los participantes relevantes incluidos, el momento total se conserva:"),
      formula("\\sum_i\\mathbf{p}_{i,\\mathrm{inicial}}=\\sum_j\\mathbf{p}_{j,\\mathrm{final}}"),
      paragraph("Si intervienen radiación o campos que transportan momento, también hay que incluir sus contribuciones. Las leyes de conservación permiten descartar muchas transformaciones que no serían físicamente posibles."),
      heading("¿Existe una descripción común de todas las interacciones?"),
      paragraph("El Modelo Estándar reúne la interacción electromagnética y la débil en una estructura electrodébil y describe también la interacción fuerte mediante la cromodinámica cuántica. No incorpora una teoría cuántica fundamental de la gravedad. Las propuestas de unificación más amplias siguen siendo objeto de investigación."),
    ],
  },
  {
    code: "F00.25",
    sequence: 25,
    editorialStatus: "candidate",
    hookQuestion: "¿Y si un electrón no fuera una pequeña esfera independiente, sino una excitación de un campo cuántico?",
    shortSummary: "La teoría cuántica de campos combina la física cuántica y los campos con la relatividad especial. En ella, muchas partículas se describen como excitaciones de campos cuánticos, y las interacciones pueden crear, transformar o aniquilar partículas bajo reglas precisas.",
    intro: [
      "Imagina una guitarra. Una misma cuerda puede producir distintas notas según cómo la hagas vibrar. La nota no es una bolita añadida a la cuerda: surge de un estado de vibración de un sistema que ya estaba allí.",
      "La analogía nos acerca a una idea de la **teoría cuántica de campos**: en muchas situaciones, las partículas pueden describirse como excitaciones cuantizadas de campos. La semejanza es conceptual; los campos cuánticos no son cuerdas materiales ni necesitan un soporte mecánico.",
    ],
    details: [
      "En mecánica cuántica elemental podemos estudiar, por ejemplo, el estado de un electrón que permanece dentro de un sistema. Sin embargo, existen fenómenos en los que el número de partículas cambia. Una descripción que obligara a conservar siempre el mismo número de partículas no sería suficiente.",
      "La teoría cuántica de campos ofrece un marco para estudiar esos procesos. En la descripción usual de partículas libres, el fotón está asociado al campo electromagnético cuantizado y los electrones y positrones al campo electrónico. Los quarks y otros componentes del Modelo Estándar también tienen sus campos correspondientes. No se trata de campos clásicos que contienen pequeñas bolitas escondidas.",
      "Los campos cuánticos pueden interactuar. En determinadas condiciones, dos partículas pueden dar lugar a otras o transferir energía entre diferentes grados de libertad. Las transformaciones deben respetar las leyes de conservación pertinentes, como las de energía, momento y carga eléctrica.",
      "El vacío de una teoría cuántica de campos es un estado físico de referencia, normalmente el estado de menor energía para un sistema apropiado. No equivale a una ausencia absoluta de estructura. Sus propiedades pueden diferir de las que tendría un vacío clásico, pero eso no autoriza a imaginarlo como un depósito ilimitado de energía aprovechable ni como una espuma de bolitas que toman prestada energía.",
      "La imagen de una partícula como una excitación es una puerta de entrada muy útil, especialmente al estudiar campos libres y estados de partículas en experimentos. No agota todas las situaciones: los estados ligados, el confinamiento de quarks y las teorías sobre espacio-tiempo curvo requieren matices. Aun así, este marco es la base del Modelo Estándar, una de las construcciones científicas más exitosas que tenemos.",
    ],
    narrativeTitle: "Conexión narrativa",
    narrative: [
      "Tenemos ya un nuevo lenguaje para hablar de la materia. Al cruzar **F00.26 — Hacia el mundo subatómico**, lo aplicaremos a las propiedades y transformaciones de las partículas elementales. Y en **F00.27 — Gravedad cuántica** veremos por qué extenderlo a la geometría del universo plantea preguntas todavía abiertas.",
    ],
    examples: [
      {
        title: "1. Una guitarra con muchas maneras de vibrar",
        paragraphs: [
          "Una cuerda musical tiene modos de vibración característicos. En un campo cuántico libre, determinados modos pueden tratarse matemáticamente mediante osciladores cuantizados. La analogía ayuda a comprender la idea de excitaciones, pero una guitarra es un objeto material clásico y sus notas no constituyen partículas elementales. Tampoco debemos confundir la amplitud clásica de una onda con el número de cuantos.",
        ],
      },
      {
        title: "2. Una luz que entrega energía",
        paragraphs: [
          "Una fuente luminosa puede preparar estados del campo electromagnético en los que un detector registra fotones. Un fotón de frecuencia definida tiene energía relacionada con esa frecuencia. Un haz luminoso cotidiano no tiene por qué estar en un estado de número exacto de fotones: la teoría también permite describir otras clases de estados de la luz.",
        ],
      },
      {
        title: "3. Un encuentro entre materia y antimateria",
        paragraphs: [
          "Un electrón y un positrón pueden aniquilarse y producir fotones. En un proceso de aniquilación aproximadamente en reposo, un resultado habitual permitido es la emisión de dos fotones que salen en sentidos opuestos. La energía y el momento no desaparecen: se redistribuyen. No se transforma materia en una sustancia misteriosa llamada energía; cambian los estados y las partículas presentes en el sistema.",
        ],
      },
    ],
    deepDive: [
      heading("La idea de cuantos de un modo"),
      paragraph("Para ilustrar el caso sencillo de un modo bosónico libre de frecuencia angular \\(\\omega\\), podemos representar sus estados de ocupación como \\(|n\\rangle\\), con \\(n=0,1,2,\\ldots\\). Su energía idealizada sigue la estructura del oscilador armónico cuántico:"),
      formula("E_n=\\hbar\\omega\\left(n+\\frac12\\right)"),
      paragraph("La diferencia de energía entre niveles consecutivos es \\(\\hbar\\omega\\). Este modelo no describe directamente todos los campos: los modos fermiónicos, por ejemplo, tienen reglas de ocupación diferentes."),
      heading("Crear y destruir excitaciones"),
      paragraph("En el mismo modelo bosónico, los operadores de creación y aniquilación actúan sobre los estados de número de la siguiente forma:"),
      formula("a^\\dagger|n\\rangle=\\sqrt{n+1}|n+1\\rangle"),
      formula("a|n\\rangle=\\sqrt n|n-1\\rangle"),
      paragraph("La segunda expresión se aplica para \\(n\\geq1\\); el operador de aniquilación aplicado al vacío del modo da cero. Estos son operadores matemáticos, no máquinas que crean materia de la nada. Los procesos físicos requieren dinámicas e interacciones compatibles con sus restricciones."),
      heading("Un ejemplo de campo relativista"),
      paragraph("Para un campo escalar real libre de masa \\(m\\), en espacio-tiempo plano, la ecuación clásica de Klein-Gordon puede escribirse en unidades naturales (\\(\\hbar=c=1\\)), usando la convención de signos \\((+---)\\), como:"),
      formula("(\\partial_t^2-\\nabla^2+m^2)\\phi=0"),
      paragraph("Al cuantizar el campo aparece una estructura de estados y operadores. Esta ecuación es un ejemplo introductorio, no la ecuación del electrón ni una descripción completa del Modelo Estándar. Los campos fermiónicos y gauge poseen sus propias estructuras."),
      heading("La relación entre energía y momento"),
      paragraph("Para una partícula libre de masa invariante \\(m\\), en un marco inercial:"),
      formula("E^2=p^2c^2+m^2c^4"),
      paragraph("Esta relación conecta el lenguaje relativista de partículas con los modos de campos libres. Las partículas sin masa satisfacen \\(E=pc\\) para energía positiva y magnitud del momento \\(p\\)."),
      heading("Una teoría extraordinariamente útil, no una respuesta a todo"),
      paragraph("Las teorías cuánticas de campos permiten calcular probabilidades de procesos y contrastarlas con observaciones. El Modelo Estándar usa ese marco para describir las partículas elementales conocidas y tres interacciones fundamentales. No constituye una explicación cuántica fundamental confirmada de la gravedad, ni resuelve por sí solo la naturaleza de la materia oscura."),
    ],
  },
  {
    code: "F00.26",
    sequence: 26,
    editorialStatus: "candidate",
    hookQuestion: "¿Qué tienen en común la luz de una estrella, el agua que bebes y las señales eléctricas de tu cerebro cuando miramos la realidad a escalas cada vez menores?",
    shortSummary: "La física subatómica estudia la estructura, las propiedades y las interacciones de sistemas más pequeños que los átomos. La relatividad especial, los estados cuánticos y los campos proporcionan herramientas esenciales para explorarla.",
    intro: [
      "Has recorrido una región del conocimiento en la que las distancias y las duraciones dejaron de ser absolutas, las simetrías revelaron leyes de conservación y las partículas dejaron de parecer simples bolitas con trayectorias perfectamente definidas.",
      "Ahora vamos a utilizar esas ideas para explorar el mundo subatómico. No es otro universo separado del nuestro: es una escala de descripción que nos ayudará a comprender la materia de la que estamos hechos.",
    ],
    details: [
      "Si observas una gota de agua, no puedes distinguir a simple vista las moléculas que contiene. Tampoco podrías reconocer directamente, mirando una molécula, todas las propiedades de los átomos que la componen. Cambiar de escala significa desarrollar herramientas nuevas y aprender a formular preguntas diferentes.",
      "Un átomo contiene electrones y un núcleo. En los núcleos ordinarios encontramos protones y, salvo casos como el núcleo del hidrógeno más común, neutrones. Los protones y neutrones son sistemas compuestos cuya estructura se estudia mediante quarks y gluones, junto con su dinámica. El electrón, en cambio, se considera elemental en el Modelo Estándar y no se le conoce una estructura interna.",
      "En nuestra siguiente expedición aparecerán otros componentes fundamentales, como los neutrinos, los fotones y las partículas asociadas a las interacciones. Descubriremos por qué propiedades como la carga y el espín importan tanto, y por qué no todas las partículas pueden agruparse de la misma manera.",
      "El camino hacia lo pequeño no consiste únicamente en construir un microscopio más potente. En física de partículas se realizan experimentos que permiten inferir propiedades a partir de interacciones, colisiones, depósitos de energía y distribuciones de resultados. A veces las partículas estudiadas desaparecen antes de alcanzar un detector y solo podemos reconstruir las huellas de sus productos de desintegración.",
      "Y no olvides algo: conocer los componentes de un organismo no equivale a comprender automáticamente cómo funciona. Las moléculas, las células y los tejidos requieren conceptos propios. Las escalas superiores no son una simple lista de partículas. En SOMA iremos construyendo esos puentes, sin saltarnos las preguntas que hacen interesante cada nivel.",
    ],
    narrativeTitle: "Conexión narrativa",
    narrative: [
      "Has llegado al umbral de la siguiente expedición: **Estrato 01 — Partículas elementales e interacciones**. Tu siguiente destino será descubrir cómo se organizan los componentes fundamentales de la materia y qué propiedades distinguen unos de otros. Las preguntas abiertas de este estrato, como la gravedad cuántica, siguen disponibles para explorar. No todas las rutas del conocimiento tienen que recorrerse en el mismo orden.",
    ],
    examples: [
      {
        title: "1. De una gota de agua al interior de un protón",
        paragraphs: [
          "Una gota contiene una enorme cantidad de moléculas. Cada molécula de agua tiene dos átomos de hidrógeno y uno de oxígeno, y estos contienen electrones y núcleos. Los protones de esos núcleos poseen estructura interna. Cada paso nos obliga a cambiar nuestra descripción; la geometría de una molécula no es la geometría de un protón ampliada.",
        ],
      },
      {
        title: "2. Una huella invisible que deja de ser invisible",
        paragraphs: [
          "Una partícula cargada puede dejar señales al atravesar un detector. Si existe un campo magnético apropiado, la curvatura de su trayectoria aporta información sobre su momento y el signo de su carga. Combinando distintos tipos de señales, los investigadores reconstruyen los acontecimientos. No necesitan una fotografía directa de la partícula como si fuera un grano de arena.",
        ],
      },
      {
        title: "3. De los electrones a una señal nerviosa",
        paragraphs: [
          "Las moléculas de tu organismo contienen electrones y núcleos que participan en interacciones electromagnéticas. Esa física ayuda a explicar la existencia de enlaces químicos. Pero para comprender cómo una neurona transmite una señal también necesitamos estudiar membranas, canales iónicos y gradientes electroquímicos. La expedición irá conectando esas escalas sin sustituir una explicación por otra.",
        ],
      },
    ],
    deepDive: [
      heading("¿Qué significa resolver una estructura más pequeña?"),
      paragraph("Una de las pistas que relacionan el momento de una partícula con su comportamiento ondulatorio es la longitud de onda de De Broglie:"),
      formula("\\lambda=\\frac{h}{p}"),
      paragraph("Aquí, \\(h\\) es la constante de Planck y \\(p\\) la magnitud del momento. En experimentos adecuados, momentos mayores permiten investigar estructuras a escalas más pequeñas. La resolución efectiva depende del proceso de dispersión, de la transferencia de momento y de las características del instrumento: no es una garantía automática basada en una única longitud de onda."),
      heading("El tamaño no es lo mismo que la masa"),
      paragraph("Un átomo ordinario tiene una escala de extensión característica de alrededor de \\(10^{-10}\\,\\mathrm{m}\\), mientras que las dimensiones de muchos núcleos se sitúan en la escala de los femtómetros (\\(10^{-15}\\,\\mathrm{m}\\)). Son órdenes de magnitud, no radios universales ni límites rígidos para objetos cuánticos."),
      paragraph("Un protón no es tres esferas que ocupan posiciones fijas. Su estructura incluye la dinámica de quarks y gluones; sus propiedades, incluida gran parte de su masa, están relacionadas con la física de esa estructura. Estudiaremos esta cuestión más adelante."),
      heading("Qué sabemos y qué falta"),
      paragraph("El Modelo Estándar organiza las partículas elementales conocidas y sus interacciones no gravitatorias con gran éxito experimental. No conocemos todavía una explicación completa de la materia oscura ni una teoría cuántica fundamental de la gravedad confirmada. Cruzar esta puerta no exige que hayamos resuelto esos problemas, sino que dispongamos de un lenguaje para seguir investigando."),
    ],
  },
  {
    code: "F00.27",
    sequence: 27,
    editorialStatus: "candidate",
    hookQuestion: "Si la materia obedece reglas cuánticas y la gravedad está relacionada con la geometría del espacio-tiempo, ¿qué ocurre cuando ambas descripciones deben funcionar a la vez?",
    shortSummary: "La gravedad cuántica busca comprender la gravitación cuando los efectos cuánticos son relevantes. Existen aproximaciones útiles y propuestas de teorías fundamentales, pero ninguna solución completa está confirmada experimentalmente.",
    intro: [
      "Imagina que dispones de dos mapas extraordinariamente precisos: uno explica el movimiento de los planetas y la estructura del cosmos; el otro describe las propiedades y transformaciones de la materia microscópica. Cada uno funciona muy bien en su ámbito, pero existen regiones donde necesitamos utilizar los dos.",
      "La **gravedad cuántica** investiga cómo incorporar los principios cuánticos a la descripción gravitatoria. Todavía no contamos con una teoría fundamental completa cuya validez haya sido establecida experimentalmente.",
    ],
    details: [
      "En relatividad general, la distribución de materia y energía está relacionada con la geometría del espacio-tiempo. Esa geometría no es un escenario rígido: puede evolucionar y participar en fenómenos como las ondas gravitatorias.",
      "En muchas teorías cuánticas de campos, en cambio, partimos de una estructura espacio-temporal sobre la que definimos los campos. Esto funciona extraordinariamente bien en numerosos experimentos. La dificultad aparece cuando necesitamos que la propia geometría entre en la descripción cuántica, sin tratarla únicamente como un fondo clásico prefijado.",
      "Es posible estudiar campos cuánticos en geometrías clásicas curvas. También podemos formular la relatividad general como una teoría cuántica efectiva a bajas energías. Estos enfoques producen resultados teóricos útiles dentro de sus límites; no resuelven por sí solos todas las preguntas que surgen en regímenes extremos.",
      "Algunas líneas de investigación buscan describir las partículas y la gravedad mediante estructuras extendidas, como las cuerdas. Otras intentan cuantizar directamente estructuras geométricas, como hace la gravedad cuántica de bucles. Existen más propuestas y no disponemos de evidencia experimental decisiva que permita establecer una de ellas como descripción definitiva de la naturaleza.",
      "Conviene distinguir entre una dificultad de nuestras teorías y una propiedad demostrada del universo. Que ciertas ecuaciones produzcan singularidades en determinadas soluciones no significa que hayamos observado físicamente una densidad infinita. Que podamos construir una escala de longitud de Planck tampoco demuestra que el espacio esté compuesto por píxeles. La investigación comienza precisamente donde las respuestas dejan de ser claras.",
    ],
    narrativeTitle: "Conexión narrativa",
    narrative: [
      "La gravedad cuántica representa una frontera abierta de nuestra expedición. No necesitamos resolverla para estudiar las partículas conocidas en el **Estrato 01**. Si quieres explorar por qué la gravedad posee un carácter geométrico tan especial, regresa a **F00.08 — Relatividad general**, **F00.09 — Geometría del espacio-tiempo** y **F00.28 — Principio de equivalencia**.",
    ],
    examples: [
      {
        title: "1. Dos mapas con escalas distintas",
        paragraphs: [
          "Un plano de una ciudad resulta muy útil para orientarte, mientras que el plano eléctrico de un edificio permite reparar su instalación. Ambos describen aspectos reales, pero ninguno responde a todas las preguntas del otro. Esta analogía muestra por qué una teoría puede funcionar muy bien en cierto régimen y necesitar una descripción más amplia en otro. No significa que las diferencias entre relatividad y teoría cuántica sean solo un problema de escala gráfica.",
        ],
      },
      {
        title: "2. Un agujero negro que no podemos describir por completo",
        paragraphs: [
          "La relatividad general permite describir agujeros negros y predecir muchas de sus propiedades. La teoría cuántica de campos sobre espacio-tiempo curvo permite además predecir la radiación de Hawking. Esta última es una predicción teórica, no una detección directa confirmada de radiación de un agujero negro astrofísico. Las preguntas sobre su evaporación final y la información cuántica motivan la búsqueda de una descripción más profunda.",
        ],
      },
      {
        title: "3. Retroceder hacia el universo temprano",
        paragraphs: [
          "Al reconstruir la evolución cosmológica hacia condiciones de mayor temperatura y densidad, podemos alcanzar regímenes en los que las aproximaciones actuales dejan de ser suficientes. Una teoría de gravedad cuántica podría modificar esa descripción. Todavía no podemos afirmar que la física haya demostrado un comienzo absoluto, un rebote anterior o una estructura discreta del espacio-tiempo.",
        ],
      },
    ],
    deepDive: [
      heading("La escala de Planck"),
      paragraph("Podemos combinar la constante gravitatoria \\(G\\), la constante reducida de Planck \\(\\hbar\\) y la velocidad de la luz \\(c\\) para construir una longitud natural:"),
      formula("\\ell_P=\\sqrt{\\frac{\\hbar G}{c^3}}\\approx1.62\\times10^{-35}\\,\\mathrm{m}"),
      paragraph("Y una escala de energía:"),
      formula("E_P=\\sqrt{\\frac{\\hbar c^5}{G}}"),
      paragraph("Estas cantidades señalan escalas naturales en las que esperamos que determinadas aproximaciones gravitatorias y cuánticas requieran especial cuidado. La longitud de Planck no constituye una medida experimental de un tamaño mínimo del espacio. Tampoco significa que todos los efectos de gravedad cuántica sean posibles exclusivamente a esa longitud."),
      heading("Una geometría con pequeñas perturbaciones"),
      paragraph("En determinados problemas de campo débil se puede escribir una métrica como la suma de una métrica plana de referencia y una pequeña perturbación:"),
      formula("g_{\\mu\\nu}=\\eta_{\\mu\\nu}+h_{\\mu\\nu}"),
      paragraph("Aquí, \\(\\eta_{\\mu\\nu}\\) es la métrica de Minkowski y \\(h_{\\mu\\nu}\\) describe una perturbación pequeña dentro del régimen escogido. La cuantización perturbativa de los modos gravitatorios conduce al concepto de gravitón, una excitación hipotética de espín 2 sin masa en la formulación usual. No se ha confirmado la detección de gravitones individuales. Esta separación tampoco es una descripción general de toda geometría posible."),
      heading("Una teoría efectiva frente a una teoría fundamental"),
      paragraph("Una teoría efectiva describe fenómenos dentro de un régimen de energías y escalas determinado. En ese sentido, la relatividad general puede recibir un tratamiento cuántico efectivo que permite organizar correcciones a bajas energías. Al salir de ese régimen necesitamos más información: extrapolar las primeras correcciones hasta energías arbitrariamente grandes no proporciona una teoría fundamental completa."),
      heading("Cómo reconocer una propuesta científica"),
      paragraph("Una formulación matemática elegante no basta para demostrar que describe nuestro universo. Debe ser coherente, recuperar las predicciones bien contrastadas en los regímenes adecuados y ofrecer formas de distinguir sus consecuencias de las de otras propuestas. Algunas de esas pruebas resultan extremadamente difíciles. La ausencia de una confirmación decisiva no convierte todas las propuestas en equivalentes, pero obliga a distinguir hipótesis, resultados matemáticos y evidencias experimentales."),
    ],
  },
  {
    code: "F00.28",
    sequence: 28,
    editorialStatus: "candidate",
    hookQuestion: "Si estuvieras dentro de un ascensor cerrado, ¿podrías distinguir siempre entre sentir la gravedad y estar siendo acelerado?",
    shortSummary: "En un laboratorio suficientemente pequeño en caída libre, los efectos gravitatorios locales pueden desaparecer de la descripción de las leyes físicas no gravitatorias. Esto no elimina la curvatura ni los efectos de marea, que permiten distinguir situaciones a mayor escala.",
    intro: [
      "Imagina una cabina sin ventanas en una nave espacial, lejos de estrellas y planetas. Si la nave acelera, el suelo presiona tus pies y un objeto que sueltes parece caer hacia él. La experiencia puede parecerse mucho a estar de pie sobre la Tierra.",
      "Esta semejanza, dentro de una región suficientemente pequeña, nos acerca al **principio de equivalencia**. Es una de las ideas que permitieron a Einstein transformar nuestra comprensión de la gravitación.",
    ],
    details: [
      "Cuando estás de pie sobre la Tierra, sientes el suelo sosteniéndote. La sensación de peso no se explica únicamente porque la Tierra ejerza influencia gravitatoria: también depende de la fuerza de apoyo que impide que tu cuerpo siga una trayectoria de caída libre.",
      "Si tú y la cabina estuvierais en caída libre, los objetos cercanos que hubieras soltado permanecerían aproximadamente a tu lado, siempre que sus movimientos relativos iniciales y las diferencias gravitatorias fueran suficientemente pequeños. Dentro de esa región se parecería a flotar en una nave sin aceleración y lejos de fuentes gravitatorias relevantes.",
      "El experimento mental del ascensor tiene dos caras: una cabina acelerada puede reproducir localmente efectos semejantes a los de un laboratorio sostenido en un campo gravitatorio, y una cabina en caída libre puede eliminar localmente esos efectos de peso. Esta equivalencia es una pista sobre cómo describir la gravedad, no una afirmación de que aceleración y curvatura sean idénticas en todas las situaciones.",
      "¿Qué sucede si amplías mucho el ascensor? Dos objetos que caen hacia la Tierra desde lugares separados no siguen trayectorias perfectamente paralelas: pueden acercarse entre sí mientras caen. Esas diferencias en el movimiento de cuerpos libres son efectos de marea. Un laboratorio suficientemente grande y preciso puede detectarlas.",
      "La relatividad general distingue la posibilidad de elegir un sistema local de caída libre de la existencia de curvatura del espacio-tiempo. Podemos elegir coordenadas que simplifiquen la descripción gravitatoria alrededor de un acontecimiento, pero no hacer desaparecer una curvatura real mediante un simple cambio de coordenadas.",
    ],
    narrativeTitle: "Conexión narrativa",
    narrative: [
      "Este descubrimiento completa una pieza de la región de relatividad: une la intuición de **F00.07 — Gravitación** con el tratamiento geométrico de **F00.08 — Relatividad general** y **F00.09 — Geometría del espacio-tiempo**. Es también una invitación a volver a las preguntas de **F00.27 — Gravedad cuántica**: ¿cómo describiremos una geometría que también deba obedecer principios cuánticos?",
    ],
    examples: [
      {
        title: "1. El ascensor y la báscula",
        paragraphs: [
          "Si un ascensor acelera hacia arriba, una báscula puede indicar un peso aparente mayor. Si acelera hacia abajo, puede indicar uno menor. Al detener su aceleración, la lectura vuelve al valor habitual en condiciones normales. El instrumento responde a la fuerza de apoyo, no mide directamente toda la geometría del espacio-tiempo. Este es un ejemplo conceptual; no hace falta realizar ninguna maniobra peligrosa para comprenderlo.",
        ],
      },
      {
        title: "2. Una tripulación que flota en órbita",
        paragraphs: [
          "Los astronautas de una estación orbital flotan no porque la gravedad terrestre haya desaparecido, sino porque la estación y sus ocupantes están en caída libre aproximadamente conjunta. La velocidad orbital hace que su trayectoria rodee la Tierra. Las pequeñas aceleraciones residuales y los efectos de marea explican por qué hablamos de microgravedad y no de una ausencia perfecta de gravedad.",
        ],
      },
      {
        title: "3. Dos objetos que caen en el vacío",
        paragraphs: [
          "Si dejamos caer simultáneamente un objeto ligero y uno pesado desde el mismo lugar, con las mismas condiciones iniciales y sin resistencia del aire, ambos siguen la misma caída en la aproximación de cuerpos de prueba. Experimentos de alta precisión comparan objetos de distinta composición para comprobar esa universalidad. En un entorno real hay que controlar otras fuerzas y posibles diferencias experimentales.",
        ],
      },
    ],
    deepDive: [
      heading("Masa inercial y masa gravitatoria"),
      paragraph("En una descripción newtoniana sencilla, si distinguimos la masa inercial \\(m_i\\) de la masa gravitatoria pasiva \\(m_g\\), un cuerpo de prueba situado en un campo gravitatorio \\(\\mathbf{g}\\) experimentaría:"),
      formula("m_i\\mathbf{a}=m_g\\mathbf{g}"),
      paragraph("Por tanto:"),
      formula("\\mathbf{a}=\\frac{m_g}{m_i}\\mathbf{g}"),
      paragraph("Si la relación entre ambas masas es universal, los cuerpos de prueba comparten la misma aceleración bajo iguales condiciones. Con la normalización habitual identificamos ambas masas en esta descripción. La universalidad de la caída libre constituye el núcleo del principio de equivalencia débil; la formulación de Einstein incluye además otros requisitos sobre experimentos locales no gravitatorios."),
      heading("Qué mide una báscula"),
      paragraph("Para un ascensor en un campo gravitatorio aproximadamente uniforme de magnitud \\(g\\), y tomando la dirección ascendente como positiva, una persona de masa \\(m\\) que permanece sobre la báscula experimenta una fuerza normal:"),
      formula("N=m(g+a)"),
      paragraph("Aquí, \\(a\\) es la componente vertical de la aceleración del ascensor. Cuando \\(a=0\\), la lectura corresponde al peso habitual; si \\(a=-g\\) en una caída libre ideal, \\(N=0\\). La expresión presupone que la persona y el suelo comparten el movimiento, y que no intervienen otras fuerzas relevantes. Una lectura nula no implica que la curvatura gravitatoria del entorno sea nula."),
      heading("Un marco local de caída libre"),
      paragraph("En relatividad general, alrededor de un acontecimiento de un espacio-tiempo suficientemente regular podemos elegir coordenadas localmente inerciales. En ellas, la métrica toma en ese acontecimiento la forma de Minkowski y sus primeras derivadas pueden anularse:"),
      formula("g_{\\mu\\nu}(P)=\\eta_{\\mu\\nu}"),
      formula("\\partial_\\alpha g_{\\mu\\nu}(P)=0"),
      paragraph("Esto no obliga al tensor de curvatura a desaparecer. Las diferencias entre trayectorias de caída libre vecinas pueden revelar esa curvatura. Para extender esta aproximación a un laboratorio real importa su tamaño y duración en relación con las escalas de variación de la geometría."),
      heading("No todos los principios de equivalencia son idénticos"),
      paragraph("En física se distinguen distintas formulaciones. El principio débil se refiere a la universalidad de la caída libre de cuerpos de prueba. El principio de equivalencia de Einstein añade que los resultados de experimentos locales no gravitatorios no dependen de la velocidad del laboratorio en caída libre ni de dónde o cuándo se realizan, en las condiciones correspondientes. El principio fuerte amplía estas ideas a experimentos gravitatorios y cuerpos con autogravitación relevante. No son afirmaciones intercambiables y las pruebas de una no verifican automáticamente todas las demás."),
    ],
  },
];

const SHEETS_BY_SEQUENCE = new Map<number, PrototypeEditorialSheet>(STRATUM_EDITORIAL_SHEETS.map((sheet) => [sheet.sequence, sheet]));

export function editorialSheetForSequence(sequence: number) {
  return SHEETS_BY_SEQUENCE.get(sequence) ?? null;
}
