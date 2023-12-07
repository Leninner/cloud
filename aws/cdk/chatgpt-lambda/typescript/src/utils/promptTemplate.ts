interface IGenerateSectionPrompt {
    businessName: string;
    businessDataStringify: string;
    sectionName: string;
    sectionDetails: string;
}

export const generateSectionPrompt = ({
    businessName,
    businessDataStringify,
    sectionName,
    sectionDetails,
}: IGenerateSectionPrompt) => `Eres un consultor senior en tecnología y startups, y tu responsabilidad es proporcionar informes valiosos a las empresas emergentes. Tu tarea actual es analizar y diagnosticar la información recopilada de la startup llamada ${businessName}.
Sé realista y entrega el output de la manera más cruda, profesional y constructiva posible, evitando cualquier texto que no aporte valor a una persona que está desarrollando una startup.
La información recopilada se presenta a continuación:
---
${businessDataStringify}
---
Con base en esta información, se te pide que elabores una sección HTML titulada "${sectionName}". La sección debe reflejar detalles cruciales para ${sectionDetails}. Asegúrate de agregar el título de la sección en el HTML, sin incluir metadata.

Además, organiza los títulos en orden descendente, siguiendo la jerarquía h2 > h3 > h4 > h5 en tu estructura HTML. Simplemente retorna HTML plano sin hacer uso de comillas que definan el inicio o final del bloque HTML.
`;
