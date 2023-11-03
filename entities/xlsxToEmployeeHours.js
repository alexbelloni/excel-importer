const XLSX = require('xlsx');
const formatter = require('./mySqlFormatter');

const xlsxToEmployeeHours = () => {
    const INITIAL_VALUE_ROW = 2;
    const COLUMN_TYPES = {
        'Co': 'number', 'ID': 'number', 'Name': 'string', 'Department': 'string',
        'Hire Date': 'date', 'Period Begin': 'date', 'Period End': 'date',
        'Check Date': 'date', 'E-2 Reg Hrs': 'number', 'E-3 OT Hrs': 'number',
        'E-WALI WALI': 'number', 'E-WALISal WALISal': 'number'
    };
    const DISPLAY_MAPPING = {
        'E-2 Reg Hrs': 'E-2RegHours',
        'E-3 OT Hrs': 'E-3OTHours',
        'E-WALI WALI': 'E-WALIWALI',
        'E-WALISal WALISal': 'E-WALISALWALISAL',
        'Co': 'Co',
        'ID': 'ID',
        'Name': 'Name',
        'Department': 'Department',
        'Hire Date': 'HireDate',
        'Period Begin': 'PeriodBegin',
        'Period End': 'PeriodEnd',
        'Check Date': 'CheckDate'
    }
    const TEST_ROWS = [
        [
            , , , , , , , ,
            ' john doe column',
            ' E-2\r\nReg Hrs ',
            ' E-3\r\nOT Hrs ',
            ' E-WALISal\r\nWALISal '
        ],
        [
            'Co',
            'ID',
            'Name',
            'Department',
            'Hire Date',
            'First Check Date',
            'Period Begin',
            'Period End',
            'Check Date',
            ' Hours ',
            ' Hours ',
            ' Hours '
        ],
        [
            39890,
            3656,
            'Marinho, Douglas',
            962045,
            44673,
            44685,
            44945,
            44958,
            44965,
            73.03,
            '  -   ',
            '  -   '
        ],
        [
            39890,
            122226,
            'Avendano Sandoval, Azael',
            962004,
            44899,
            44923,
            44945,
            44958,
            44965,
            80,
            38.57,
            '  -   '
        ],
        [
            39890,
            25,
            'Banaga, Edgardo Selleza',
            962004,
            44635,
            44657,
            44945,
            44958,
            44965,
            68.77,
            '  -   ',
            '  -   '
        ]
    ]

    // Ensure no undefined or empty values in the headers
    function sanitizeHeaderValue(value) {
        return sanitizeValue(value) || 'Placeholder';
    }

    // Sanitize function to normalize values
    function sanitizeValue(value, valueType) {
        if (value === null || value === undefined) {
            return '';
        }

        if (!valueType || (valueType === 'number' && typeof value === 'string')) {
            return String(value).trim().replace(/\r?\n|\r/g, ' ');
        }
        return value
    }

    function getRows(fileBuffer) {
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        return XLSX.utils.sheet_to_json(sheet, { header: 1 });
    }

    function getMergedHeader(rows) {
        const headerFromRow0 = rows[0].filter(column => column)
        const headerFromRow1 = rows[1].filter(column => column !== ' Hours ');

        const sanitizedHeaderFromRow0 = headerFromRow0.map(sanitizeHeaderValue);
        const sanitizedHeaderFromRow1 = headerFromRow1.map(sanitizeHeaderValue);

        return sanitizedHeaderFromRow1.concat(sanitizedHeaderFromRow0);
    }

    const convert = (fileBuffer) => {
        const data = [];
        const rows = fileBuffer ? getRows(fileBuffer) : TEST_ROWS;
        const mergedOriginalHeader = getMergedHeader(rows);

        const expectedColumns = Object.keys(COLUMN_TYPES);

        // Process the remaining rows using the merged header
        for (let i = INITIAL_VALUE_ROW; i < rows.length; i++) { // Starting from row index 2 since the first two rows are header rows
            const rowData = rows[i];
            const entry = {};
            for (let j = 0; j < mergedOriginalHeader.length; j++) {
                const columnName = mergedOriginalHeader[j];
                if (!expectedColumns.includes(columnName)) {
                    continue;
                }
                const dataType = COLUMN_TYPES[columnName];
                const value = sanitizeValue(rowData[j], dataType);  // Sanitize the cell value
                const MySqlColumnName = DISPLAY_MAPPING[columnName];

                if (value === null || value === undefined || value === '' || value === '-') {
                    entry[MySqlColumnName] = null;
                } else if (dataType === 'number' && isNaN(value)) {
                    return res.status(400).send(`Invalid data in row ${i + 1}, column ${columnName}.`);
                } else if (dataType === 'date') {
                    entry[MySqlColumnName] = formatter.formatDataDateForMySQL(value);
                } else {
                    entry[MySqlColumnName] = dataType === 'number' ? parseFloat(value) : value;
                }
            }

            expectedColumns.forEach(cname => {
                const mySqlName = DISPLAY_MAPPING[cname]
                if (!Object.keys(entry).includes(mySqlName)) {
                    entry[DISPLAY_MAPPING[cname]] = null
                }
            })

            data.push(entry);
        }

        return { mergedOriginalHeader, data }
    }
    return {
        convert
    }
}

module.exports = xlsxToEmployeeHours();