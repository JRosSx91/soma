/**
 * Candidate educational sheets for F00.01–F00.17.
 * Sources: docs/content/gam-03b/CONTENT-S00-01.md, CONTENT-S00-02.md and CONTENT-S00-03.md.
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
  code: "F00.01" | "F00.02" | "F00.03" | "F00.04" | "F00.05" | "F00.06" | "F00.07" | "F00.08" | "F00.09" | "F00.10" | "F00.11" | "F00.12" | "F00.13" | "F00.14" | "F00.15" | "F00.16" | "F00.17";
  sequence: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17;
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
];

const SHEETS_BY_SEQUENCE = new Map<number, PrototypeEditorialSheet>(STRATUM_EDITORIAL_SHEETS.map((sheet) => [sheet.sequence, sheet]));

export function editorialSheetForSequence(sequence: number) {
  return SHEETS_BY_SEQUENCE.get(sequence) ?? null;
}
