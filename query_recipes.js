
// query_recipes.hs

exports.CreateMainJurisdictionQuery = function(jurisdictionName)
{
    let jurisdictionQuery = {};
    jurisdictionQuery.jurisdictionName = jurisdictionName;
    jurisdictionQuery.selectors = 
    [
        {
            "selectorName": "Count",
            "querySelector": "#total-covid-19-cases .value"
        },
        {
            "selectorName": "Tested",
            "querySelector": "#total-reported-people-tested .value"
        },
        {
            "selectorName": "Hospitalizations",
            "querySelector": "#total-covid-19-hospitalizations .value"
        },
        {
            "selectorName": "Deaths",
            "querySelector": "#total-covid-19-deaths .value"
        }
    ];
    jurisdictionQuery.validators = 
    [
        {
            "querySelector": "#total-covid-19-cases .caption",
            "queryValue": "Total COVID-19 Cases",
        },
        {
            "querySelector": "#DataTables_Table_0 thead th:nth-of-type(1)",
            "queryValue": "Jurisdiction",
        },
        {
            "querySelector": "#DataTables_Table_0 thead th:nth-of-type(2)",
            "queryValue": "Cases",
        },
        {
            "querySelector": "#DataTables_Table_0 thead th:nth-of-type(3)",
            "queryValue": "Hospitalizations",
        },
        {
            "querySelector": "#DataTables_Table_0 thead th:nth-of-type(4)",
            "queryValue": "Deaths",
        },
    ];
    return jurisdictionQuery;
};


exports.CreateSubJurisdictionQuery = function(
    jurisdictionName,
    jurisdictionIndex)
{
    let jurisidctionQuery = {};
    jurisidctionQuery.jurisdictionName = jurisdictionName;
    jurisidctionQuery.selectors =
    [
        {
            "selectorName": "Count",
            "querySelector": "#DataTables_Table_0 tbody tr:nth-of-type("
                + jurisdictionIndex + ") td:nth-of-type(2)"
        },
        {
            "selectorName": "Hospitalizations",
            "querySelector":
                "#DataTables_Table_0 tbody tr:nth-of-type("
                + jurisdictionIndex + ") td:nth-of-type(3)"
        },
        {
            "selectorName": "Deaths",
            "querySelector": 
                "#DataTables_Table_0 tbody tr:nth-of-type("
                + jurisdictionIndex + ") td:nth-of-type(4)"
        },
    ];
    jurisidctionQuery.validators =
    [
        {
            "querySelector": "#DataTables_Table_0 tbody tr:nth-of-type("
                + jurisdictionIndex + ") td:nth-of-type(1)",
            "queryValue": jurisdictionName,
        }
    ];
    return jurisidctionQuery;
};


exports.SerializeJurisdictionHeaderAsCsv = function(jurisdictionQueryResult)
{
    let headerElements = [];
    jurisdictionQueryResult.selectorResults.forEach((selectorResult) =>
    {
        headerElements.push(
            jurisdictionQueryResult.jurisdictionName 
                + " "
                + selectorResult.selectorName);
    });
    return headerElements.join(",") + ",";
};


exports.SerializeJurisdictionDataAsCsv = function(jurisdictionQueryResult)
{
    let dataElements = [];
    jurisdictionQueryResult.selectorResults.forEach((selectorResult) =>
    {
        dataElements.push(selectorResult.queryValue);
    });
    return dataElements.join(",") + ",";
};
