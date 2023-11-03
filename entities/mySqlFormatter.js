const formatter = () => {
    function padZero(number, length) {
        return String(number).padStart(length, '0');
    }

    // Function to format date strings or Excel serial dates to MySQL date format (YYYY-MM-DD)
    function formatDataDateForMySQL(dateValue) {
        function getDate(d) {
            return d
        }
        try {
            if (typeof dateValue === 'number' && dateValue >= 1 && dateValue < 2958466) {
                // If the date is an Excel serial date, convert it to a proper date object
                const dateObject = new Date(Math.floor((dateValue - 25569) * 86400 * 1000)); // Convert Excel serial date to JavaScript date
                const year = dateObject.getFullYear();
                const month = padZero(dateObject.getMonth() + 1, 2); // Pad with leading zeros to make it 2 digits
                const day = padZero(dateObject.getDate(), 2); // Pad with leading zeros to make it 2 digits
                const formattedDate = `${year}-${month}-${day}`;
                return getDate(formattedDate);
            } else if (typeof dateValue === 'string') {
                // If the date is already a string, assume it's in the format 'MM/DD/YYYY' and convert it to 'YYYY-MM-DD'
                const [month, day, year] = dateValue.split('/');
                const formattedDate = `${year}-${padZero(month, 2)}-${padZero(day, 2)}`;
                return getDate(formattedDate);
            } else if (dateValue instanceof Date) {
                // If the date is already a Date object, format it as 'YYYY-MM-DD'
                const year = dateValue.getFullYear();
                const month = padZero(dateValue.getMonth() + 1, 2);
                const day = padZero(dateValue.getDate(), 2);
                const formattedDate = `${year}-${month}-${day}`;
                return getDate(formattedDate);
            } else {
                return getDate(null);; // Return null for missing or invalid dates
            }
        } catch (e) {
            console.log('error', e)
        }
    }
    return {
        formatDataDateForMySQL
    }
}

module.exports = formatter()