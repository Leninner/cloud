import { IDynamoBusinessDataFiltered } from './interfaces';

export const transformDynamoDataToEmbedFields = (content: IDynamoBusinessDataFiltered) =>
    Object.entries(content).map(([name, value]) => ({ name, value }));
