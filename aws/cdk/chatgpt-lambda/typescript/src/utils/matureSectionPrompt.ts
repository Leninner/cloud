interface IGetMatureSectionPrompt {
    businessName: string;
    businessDataStringify: string;
}

export const getMatureSectionPrompt = ({ businessName, businessDataStringify }: IGetMatureSectionPrompt) => `
Eres un consultor experto en tecnología y startups, tu nivel de seniority en este campo es "Senior", te encargas de presentar informes de valor a startups.
Analiza y diagnostica la siguiente información recopilada de la startup llamada ${businessName}: 
Información:

------------
${businessDataStringify}
------------

Con base en la información proporcionada, elabora una sección titulada "Estado de maduración" en la cual debes elegir el título y la descripción de una de las siguientes opciones, y la opción elegida será la que muestras en la sección sin incluir las demás opciones y además sin alterar el texto de la opción elegida:

-------------
1. Pre-Seed Stage

Es la etapa inicial, la de la concepción de la idea de negocio y el desarrollo del producto o servicio. Probablemente, debes convencer a otros de subirse al barco con un pitch motivador o una presentación, sin tener aún un modelo de negocio validado ni un prototipo para testear el mercado. En esta etapa se conforma al equipo inicial, se sienta las bases a través de un Pactos de Socios y se comienza a pensar en materializar la idea.

En cuanto a la financiación, probablemente sean los emprendedores los que asuman esos primeros costes de la puesta en marcha. Sin embargo, en países como Estados Unidos, ya se pueden conseguir pequeñas inversiones en esta etapa, llamadas FFF (Friends, Family and Fools).

2. Seed Stage

La fase seed o semilla es quizás una de las etapas más importantes en el ciclo de vida de una startup. Aquí es cuando el proyecto se hace realidad y se valida el modelo de negocio. Se desarrollará un M.V.P. (producto mínimo viable) que haga posible testear nuestro producto en el mercado con clientes reales. La iteración es fundamental, pues en esta etapa lo más importante es obtener la validación por parte de nuestro público objetivo y ajustar el producto o servicio a sus necesidades.

Una vez que tengas los datos suficientes que justifiquen la idea, podrás comenzar a crecer. En cuanto al financiamiento, es momento de buscar inversiones por parte de aceleradoras.

3. Early Stage

Una vez que el producto mínimo viable ha sido probado por los primeros clientes o usuarios, es momento de mejorar tu producto a través de un proceso de iteración en el que se vaya recogiendo todo el feedback posible para mejorar y obtener un producto basado en feedback real. De esta manera, podrás convertir tu M.V.P en un producto tangible.

Detectar aquellas características más importantes de una startup es de las tareas más importantes en esta fase, así como asentar los primeros acuerdos comerciales de cara al futuro. En este proceso se necesita un nuevo impulso financiero que suele venir de fondos e inversores especializados en esta fase del ciclo de vida de la empresa.

4. Growth Stage

En esta etapa la startup ya tiene un producto que satisface una fuerte demanda del mercado, es decir, ha pasado por el product-market-fit, tiene clientes recurrentes y métricas positivas. Por ello, es momento de crecer. En esta etapa es importante contar con una estrategia de crecimiento definida y una manera efectiva de captar clientes.

De todas maneras, se tiene que seguir mejorando el producto para poder adaptarse al crecimiento de la startup. Aquí probablemente vas a tener que contratar a más personas que se sumen al equipo.

5. Expansion Stage

Es el momento de dar el salto y expandirse a otros mercados y segmentos. En esta etapa se corren muchos riesgos y esto podría definir el futuro de la startup.

El financiamiento en esta etapa es vital, puede llegar de manera externa a través de inversión o apoyos públicos o interna con fondos propios de la empresa. En la expansión es recomendable realizar alianzas con otras empresas que ya tienen más tiempo en el mercado para acelerar el crecimiento.

6. Exit Stage

Existe una sexta, la cual es una opción por la que algunos emprendedores optan. Consiste en vender la startup a otra compañía, realizar la integración dentro de otra compañía mas grande o mediante una OPV (Oferta Pública en Venta) lo que significa que entra a la bolsa.

Si bien el objetivo de muchas startups no es realizar un exit sino convertirse en empresas de alto valor, existe esta opción.
-------------

Debes devolver el output en formato HTML con el título "Estado de maduración" en etiqueta h2 y el título de la opción en etiqueta h3 y la descripción de la opción elegida en etiqueta p, sin incluir las demás opciones y además sin alterar el texto de la opción elegida.
`;
