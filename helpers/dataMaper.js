function getCbteTipo(cbteTipo){
    switch (cbteTipo){
        case "FACA":
            return 81;
        case "FACB":
            return 82
    }
}

function getDocTipo(docTipo){
    switch (docTipo){
        case "DNI":
            return 99;
        case "CUIT":
            return 80
    }
}

export function dataMapper(invoiceData) {

    const date = new Date(Date.now() - ((new Date()).getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    const cbteTipo = getCbteTipo(invoiceData.cbteTipo);
    const docTipo = getDocTipo(invoiceData.docTipo);

    let data = {
        'CantReg' 	: invoiceData.cantReg,  // Cantidad de comprobantes a registrar (vamos a registrar 1)
        'PtoVta' 	: invoiceData.ptoVta,  // Punto de venta
        'CbteTipo' 	: cbteTipo,  // Tipo de comprobante (ver tipos disponibles) 
        'Concepto' 	: invoiceData.concepto,  // Concepto del Comprobante: (1)Productos, (2)Servicios, (3)Productos y Servicios
        'DocTipo' 	: docTipo, // Tipo de documento del comprador (99 consumidor final, ver tipos disponibles)
        'DocNro' 	: invoiceData.docNro,  // Número de documento del comprador (0 consumidor final)
        'CbteDesde' : invoiceData.cbteDesde,  // Número de comprobante o numero del primer comprobante en caso de ser mas de uno
        'CbteHasta' : invoiceData.cbteHasta,  // Número de comprobante o numero del último comprobante en caso de ser mas de uno
        'CbteFch' 	: parseInt(date.replace(/-/g, '')), // (Opcional) Fecha del comprobante (yyyymmdd) o fecha actual si es nulo
        'ImpTotal' 	: invoiceData.impTotal, // Importe total del comprobante
        'ImpTotConc': invoiceData.impTotConc,   // Importe neto no gravado
        'ImpNeto' 	: invoiceData.impNeto, // Importe neto gravado
        'ImpOpEx' 	: invoiceData.impOpEx,   // Importe exento de IVA
        'ImpIVA' 	: invoiceData.impIVA,  //Importe total de IVA
        'ImpTrib' 	: invoiceData.impTrib,   //Importe total de tributos
        'MonId' 	: 'PES', //Tipo de moneda usada en el comprobante (ver tipos disponibles)('PES' para pesos argentinos) 
        'MonCotiz' 	: 1,     // Cotización de la moneda usada (1 para pesos argentinos)  
    };
    if (cbteTipo === 81){
        data['Iva'] = [
            {
                'Id' 		: invoiceData.tipoIva, // Id del tipo de IVA (5 para 21%)(ver tipos disponibles) 
                'BaseImp' 	: invoiceData.baseImpIva, // Base imponible
                'Importe' 	: invoiceData.importeIva // Importe
            }
        ] 
    }
    return data;
}


