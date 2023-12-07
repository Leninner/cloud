/* eslint-disable @typescript-eslint/no-var-requires */
import { DynamoDBStreamEvent } from 'aws-lambda';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { DYNAMO_DB_EVENTS } from '../utils/constants';
import OpenAI from 'openai';
import axios from 'axios';
import pdf from 'pdf-parse-debugging-disabled';
import { IDynamoBusinessData, IDynamoBusinessDataFiltered } from '../utils/interfaces';
import { transformDynamoDataToEmbedFields } from '../utils/discord';
import { setReportTemplate } from '../utils/reportTemplate';
import { generateSectionPrompt } from '../utils/promptTemplate';
import { getMatureSectionPrompt } from '../utils/matureSectionPrompt';
import { logger } from '../common/powertools';
const FormData = require('form-data');

export const lambdaHandler = async (event: DynamoDBStreamEvent): Promise<void> => {
    const INVALID_EVENTS = [DYNAMO_DB_EVENTS.modify, DYNAMO_DB_EVENTS.remove];
    if (INVALID_EVENTS.includes(event.Records[0].eventName as string)) return;

    logger.info('[STREAM ChatGPTPrompt] Lambda invoked', {
        details: { event },
    });

    try {
        const newImage = unmarshall(event.Records[0].dynamodb?.NewImage as any) as IDynamoBusinessData;
        const newImageFiltered = filterNewImage(newImage);

        const sectionPrompts = await structureBusinessReportPrompt(newImageFiltered);
        const chatGPTResponse = await getGPTResponseBySectionPromps(sectionPrompts);

        const htmlBuffer = Buffer.from(setReportTemplate(chatGPTResponse), 'utf-8');

        const formData = new FormData();
        formData.append(
            'payload_json',
            JSON.stringify({
                embeds: [
                    { title: 'Informacion de la empresa' },
                    { fields: transformDynamoDataToEmbedFields(newImageFiltered) },
                ],
            }),
        );
        formData.append('file', htmlBuffer, { filename: `${newImage.businessName}_report.html` });

        await axios({
            method: 'post',
            url: process.env.DISCORD_WEBHOOK,
            params: { wait: true },
            headers: formData.getHeaders(),
            data: formData,
        });
    } catch (err) {
        logger.debug('[STREAM ChatGPTPrompt] Error', {
            details: { err },
        });
    }
};

const filterNewImage = (newImage: IDynamoBusinessData): IDynamoBusinessDataFiltered => {
    const newImageCleaned = { ...newImage };
    delete newImageCleaned.id;
    delete newImageCleaned.created;
    return newImageCleaned as IDynamoBusinessDataFiltered;
};

const getGPTResponseBySectionPromps = async (sectionPrompts: string[]) => {
    const openai = await getOpenAIObject();
    const allSectionGtpResponse = await Promise.all(
        sectionPrompts.map((sectionPrompt) => getChatGPTResponse(openai, sectionPrompt)),
    );

    return allSectionGtpResponse.map((gptResponse) => gptResponse.message.content as string).join('<br>');
};

const getOpenAIObject = async () => {
    const openai = new OpenAI({
        apiKey: process.env.CHATGPT_APIKEY,
    });

    return openai;
};

const getChatGPTResponse = async (openai: OpenAI, input: string) => {
    const response = await openai.chat.completions.create({
        messages: [{ role: 'user', content: input }],
        model: 'gpt-3.5-turbo-1106',
    });

    return response.choices[0];
};

const structureBusinessReportPrompt = async (businessData: IDynamoBusinessDataFiltered) => {
    let businessDataStringify = JSON.stringify(businessData);

    try {
        const pitchDeckText = await getPdfTextFromUrl(businessData.pitchDeckUrl);
        businessDataStringify = `${businessDataStringify} ${pitchDeckText}`;
    } catch (error) {
        logger.debug('[STREAM ChatGPTPrompt] Error', {
            details: { error },
        });
    }

    const matureSectionPrompt = getMatureSectionPrompt({
        businessName: businessData.businessName,
        businessDataStringify,
    });

    const scalableSectionPrompt = generateSectionPrompt({
        businessName: businessData.businessName,
        businessDataStringify,
        sectionName: 'Escalabilidad',
        sectionDetails: `
        Evalúa la escalabilidad de la empresa y proporciona una respuesta fundamentada en la siguiente escala:

        - Escalable
        - No escalable
        - Más o Menos

        En caso de considerar que la empresa es escalable, argumenta las razones que respaldan tu evaluación. Si determinas que la empresa no es escalable, identifica las áreas o aspectos que podrían mejorarse para lograr la escalabilidad. Si tu evaluación es "Más o Menos", proporciona razones claras que respalden esta posición.

        Recuerda enfocarte en aspectos clave como el modelo de negocio, la capacidad para crecer de manera sostenible, la adaptabilidad a cambios y la eficiencia operativa. Sé preciso y profesional en tu análisis, destacando elementos que sean pertinentes para la escalabilidad de la empresa.`,
    });

    const marketSectionPrompt = generateSectionPrompt({
        businessName: businessData.businessName,
        businessDataStringify,
        sectionName: 'Mercado',
        sectionDetails: `
        Identifica las opciones de mercado a las que la empresa podría apuntar. Proporciona cada opción junto con su respectivo porcentaje, asegurándote de que la suma total sea 100%. A continuación, crea una tabla HTML con las opciones y sus porcentajes, acompañados de un argumento detallado para cada una.

        <table>
            <tr>
                <th>Opción de Mercado</th>
                <th>Porcentaje</th>
                <th>Argumento</th>
            </tr>
            <tr>
                <td></td>
                <td></td>
                <td></td>
            </tr>
        </table>

        Asegúrate de fundamentar tus elecciones teniendo en cuenta factores como la demanda del mercado, la viabilidad financiera, la alineación con los productos/servicios de la empresa, y cualquier otro factor relevante. Sé preciso y profesional en tu análisis, brindando información valiosa para la toma de decisiones estratégicas.`,
    });

    const userSectionPrompt = generateSectionPrompt({
        businessName: businessData.businessName,
        businessDataStringify,
        sectionName: 'Usuarios',
        sectionDetails: `Identifica los tipos de usuarios que podría tener. Proporciona cada tipo de usuario junto con su respectivo porcentaje, asegurándote de que la suma total sea 100%. A continuación, crea una tabla HTML con los tipos de usuarios y sus porcentajes, acompañados de un argumento detallado para cada uno.

        <table>
            <tr>
                <th>Tipo de Usuario</th>
                <th>Porcentaje</th>
                <th>Argumento</th>
            </tr>
            <tr>
                <td></td>
                <td></td>
                <td></td>
            </tr>
        </table>

        Asegúrate de fundamentar tus elecciones teniendo en cuenta factores como la diversidad del mercado, las necesidades específicas de los usuarios, y cualquier otro elemento relevante. Sé preciso y profesional en tu análisis, brindando información valiosa para la personalización de estrategias dirigidas a distintos segmentos de usuarios.`,
    });

    const technologiesSectionPrompt = generateSectionPrompt({
        businessName: businessData.businessName,
        businessDataStringify,
        sectionName: 'Recomendaciones sobre Tecnologías',
        sectionDetails: `Proporciona recomendaciones sobre las tecnologías que podría adoptar. Enumera las tecnologías en una lista ordenada, y para cada una, incluye al menos dos razones que respalden tu recomendación.

        <ol>
            <li><strong>[Título de tecnología]</strong>
                <ul>
                    <li>[Razón de recomendación 1]</li>
                    <li>[Razón de recomendación 2]</li>
                </ul>
            </li>
        </ol>
        
        Proporciona justificaciones detalladas para cada recomendación, teniendo en cuenta las necesidades específicas de la empresa, su capacidad para adaptarse y crecer, así como la mejora de la eficiencia operativa y la experiencia del cliente.        
        `,
    });

    const gadgetsSectionPrompt = generateSectionPrompt({
        businessName: businessData.businessName,
        businessDataStringify,
        sectionName: 'Herramientas de apalancamiento',
        sectionDetails: `Identifica herramientas de apalancamiento. Proporciona la lista en formato HTML como una lista ordenada (ol), e incluye herramientas de apalancamiento, junto con dos razones que respalden la recomendación para cada una. Similar al ejemplo a continuación:

        <ol>
            <li><strong>[Título de la herramienta sugerida]</strong>
                <ul>
                    <li>[Razón para implementar 1]</li>
                    <li>[Razón para implementar 2]</li>
                </ul>
            </li>
        </ol>

        Proporciona justificaciones detalladas para cada recomendación, teniendo en cuenta las necesidades específicas de la empresa y cómo estas herramientas de apalancamiento pueden contribuir a su crecimiento y éxito.`,
    });

    const nextStepSectionPrompt = generateSectionPrompt({
        businessName: businessData.businessName,
        businessDataStringify,
        sectionName: 'Siguientes pasos',
        sectionDetails: `Genera una línea de tiempo detallada de los siguientes pasos que debería realizar. Representa cada paso con su descripción y fechas aproximadas de ejecución en formato de rango (por ejemplo, '2 a 4 meses', '10 a 12 meses') en HTML para facilitar la comprensión. Similar al ejemplo a continuación:

        <ul>
            <li>
                <strong>[Título del paso sugerido]</strong>
                <ul>
                    <li><strong>Descripción:</strong> [Descripción detallada]</li>
                    <li><strong>Fechas Aproximadas:</strong> [tiempo de implementación]</li>
                </ul>
            </li>
        </ul>`,
    });

    try {
        const CTO = businessData.cto;
        const CEO = businessData.ceo;
        const CSO = businessData.cso;

        const ctoLinkedinInformation = await retreiveLinkedinInformation(CTO);
        const ceoLinkedinInformation = await retreiveLinkedinInformation(CEO);
        const csoLinkedinInformation = await retreiveLinkedinInformation(CSO);

        const foundersSectionPrompt = generateSectionPrompt({
            businessName: businessData.businessName,
            businessDataStringify: JSON.stringify([
                {
                    cso: csoLinkedinInformation.data,
                    ceo: ceoLinkedinInformation.data,
                    cto: ctoLinkedinInformation.data,
                },
            ]),
            sectionName: 'Fundadores',
            sectionDetails: `
            Con la información proporcionada de los fundadores (CEO, CSO, COO, CTO), genera una tabla de resumen de cada uno de ellos, detallando sus habilidades tanto en hard skills como en soft skills. Para cada fundador, enumera solo las 5 habilidades más importantes. Si no encuentras información de alguna habilidad para algún fundador, puedes omitirla. Además, proporciona una lista de consideraciones que deberían tenerse en cuenta, así como también las habilidades que debería tener un fundador para la incorporación de un nuevo fundador de haberse identificado la necesidad de hacerlo.

            <table>
                <tr>
                    <th>Rol</th>
                    <th>Fundador</th>
                    <th>Hard Skills</th>
                    <th>Soft Skills</th>
                </tr>
                <tr>
                    <td>CEO</td>
                    <td>[Nombre del CEO]</td>
                    <td>
                        <ul>
                            <li>[Hard Skill 1]</li>
                        </ul>
                    </td>
                    <td>
                        <ul>
                            <li>[Soft Skill 1]</li>
                        </ul>
                    </td>
                </tr>
                <!-- Repite la estructura para los demás fundadores (CSO, COO, CTO) -->
            </table>

            <p><strong>Consideraciones para la incorporación de un nuevo fundador:</strong></p>
            <ul>
                <li>Razón 1: [Explicación de la razón 1]</li>
                <li>Razón 2: [Explicación de la razón 2]</li>
                <li>Razón 3: [Explicación de la razón 3]</li>
                <li>Perfil profesional: [Explicación del perfil profesional que debería tener un nuevo fundador]</li>
            </ul>`,
        });

        return [
            matureSectionPrompt,
            scalableSectionPrompt,
            marketSectionPrompt,
            userSectionPrompt,
            technologiesSectionPrompt,
            gadgetsSectionPrompt,
            nextStepSectionPrompt,
            foundersSectionPrompt,
        ];
    } catch (error) {
        logger.debug('[STREAM ChatGPTPrompt] Error', {
            details: { error },
        });
        return [
            matureSectionPrompt,
            scalableSectionPrompt,
            marketSectionPrompt,
            userSectionPrompt,
            technologiesSectionPrompt,
            gadgetsSectionPrompt,
            nextStepSectionPrompt,
        ];
    }
};

const getPdfTextFromUrl = async (pdfUrl: string): Promise<string> => {
    const response = await axios.get(pdfUrl, {
        responseType: 'arraybuffer',
    });

    const pdfBuffer = Buffer.from(response.data);

    return extractTextFromPdfBuffer(pdfBuffer);
};

const extractTextFromPdfBuffer = async (pdfBuffer: Buffer): Promise<string> => {
    const data = await pdf(pdfBuffer);
    return data.text;
};

const retreiveLinkedinInformation = async (linkedinUrl: string) => {
    const URL = 'https://api.prospeo.io/linkedin-email-finder';
    const apiKey = process.env.PROSPEO_APIKEY;
    const requiredHeaders = {
        'Content-Type': 'application/json',
        'X-KEY': apiKey,
    };

    try {
        return await axios(URL, {
            method: 'POST',
            headers: requiredHeaders,
            data: {
                url: linkedinUrl,
                profile_only: true,
            },
        });
    } catch (error) {
        logger.debug('[STREAM ChatGPTPrompt] Error', {
            details: { error },
        });

        return {
            error: true,
            data: {},
        };
    }
};
