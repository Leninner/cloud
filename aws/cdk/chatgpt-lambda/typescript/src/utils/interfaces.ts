export interface IDynamoBusinessDataFiltered {
    activeUsers: string;
    businessModel: string;
    businessName: string;
    capTable: string;
    clients: string;
    dealAndFinancing: string;
    ceo: string;
    cso: string;
    cto: string;
    location: string;
    marketOpportunity: string;
    oneLiner: string;
    pitchDeckUrl: string;
    problem: string;
    product: string;
}

export interface IDynamoBusinessData extends IDynamoBusinessDataFiltered {
    id?: string;
    created?: string;
}
