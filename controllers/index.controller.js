const { successResponse, failResponse } = require("../helpers/methods")
const Afip = require('@afipsdk/afip.js')

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

function dataMapper(invoiceData) {

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

/**
 *
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.index = async (req, res) => {
    res.send(
        successResponse("Test Server OK", {
            data: "Server Online"
        })
    )
}

/**
 *
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.createVoucher = async (req, res) => {

    const invoiceData = req.body;
    const afip = new Afip({CUIT:20111111111})

    const date = new Date(Date.now() - ((new Date()).getTimezoneOffset() * 60000)).toISOString().split('T')[0];

    let data = dataMapper(invoiceData);

    const afipRes = await afip.ElectronicBilling.createVoucher(data);

    res.send(
        successResponse("CAE creado exitosamente", {
            data: afipRes,
            request: data
        })
    )
}

/**
 *
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
 exports.test = async (req, res) => {
    console.log(req.body)
    const invoiceData = req.body;

    const testDataTypes = (data) => {
        if (typeof data.cantReg !== 'number') return 'cantReg must be a number';
        if (typeof data.ptoVta !== 'number') return 'ptoVta must be a number';
        if (typeof data.cbteTipo !== 'string') return 'cbteTipo must be a string';
        if (typeof data.concepto !== 'number') return 'concepto must be a number';
        if (typeof data.docTipo !== 'string') return 'docTipo must be a string';
        if (typeof data.docNro !== 'number') return 'docNro must be a number';
        if (typeof data.cbteDesde !== 'number') return 'cbteDesde must be a number';
        if (typeof data.cbteHasta !== 'number') return 'cbteHasta must be a number';
        if (typeof data.impTotal !== 'number') return 'impTotal must be a number';
        if (typeof data.impTotConc !== 'number') return 'impTotConc must be a number';
        if (typeof data.impNeto !== 'number') return 'impNeto must be a number';
        if (typeof data.impOpEx !== 'number') return 'impOpEx must be a number';
        if (typeof data.impIVA !== 'number') return 'impIVA must be a number';
        if (typeof data.impTrib !== 'number') return 'impTrib must be a number';
        if (data.tipoIva && typeof data.tipoIva !== 'string') return 'tipoIva must be a string';
        if (data.baseImpIva && typeof data.baseImpIva !== 'number') return 'baseImpIva must be a number';
        if (data.importeIva && typeof data.importeIva !== 'number') return 'importeIva must be a number';
        return true;
    }

    const generateRandomCAE = () => {
        let result = '';
        const characters = '0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < 14; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    const test = testDataTypes(invoiceData);
    if (test !== true) {
        res.send(
            failResponse(test)
        )
        return;
    }

    const date = new Date(Date.now() - ((new Date()).getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + 86400000 * 6 - ((new Date()).getTimezoneOffset() * 60000)).toISOString().split('T')[0];

    const mockCAE = generateRandomCAE();

    let data = dataMapper(invoiceData);

    const afipRes = {
        CAE: mockCAE,
        CAEFchVto: dueDate,
    }

    res.send(
        successResponse("CAE creado exitosamente", {
            data: afipRes,
            request: data
        })
    )
}