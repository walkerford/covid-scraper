
// query_tasks.js

exports.DoDateQueryTask = function()
{
    function padNumber(numberAsString)
    {
        if (numberAsString.length < 2)
        {
            numberAsString = "0" + numberAsString;
        }
        return numberAsString;
    };

    dateNode = document.querySelector("#overview-of-covid-19-surveillance p");
    dateString = dateNode.lastChild.textContent.match(/Report Date: (.*)/)[1];
    dateObject = new Date(dateString);
    dateFormatted = 
        (dateObject.getYear() + 1900).toString()
        + "-"
        + padNumber((dateObject.getMonth() + 1).toString())
        + "-"
        + padNumber((dateObject.getDate()).toString())
    return dateFormatted;
};


exports.DoJurisdictionQueryTask = function(jurisdictionQueries)
{
    function formatNumberString(numberString)
    {
        if (numberString && typeof(numberString) == "string")
        {
            numberString = 
                parseInt(numberString.replace(/,/g, ""));
        }
        return numberString;
    }

    let jurisdictionQueryResults = [];

    // Do each jurisdiction query
    jurisdictionQueries.forEach((jurisdictionQuery) => 
    {
        // Do validations
        jurisdictionQuery.validators.forEach((validator) =>
        {
            let resultNode = document.querySelector(validator.querySelector);
            let resultValue = resultNode ? resultNode.innerHTML : "None";
            if (resultValue != validator.queryValue)
            {
                console.log(
                    "Validation failure:",
                    '"' + validator.querySelector + '"',
                    '"' + validator.queryValue + '"',
                    '"' + resultValue + '"');
            }
        });

        // Create result object
        let jurisdictionQueryResult = 
        {
            jurisdictionName: jurisdictionQuery.jurisdictionName,
            selectorResults: []
        }

        // Retrieve data for each selector
        jurisdictionQuery.selectors.forEach((selector) =>
        {
            let resultNode = 
                document.querySelector(selector.querySelector);
            
            if (resultNode)
            {
                let selectorResult = {};
                selectorResult.selectorName = selector.selectorName;
                selectorResult.queryValue = 
                    formatNumberString(resultNode.innerHTML);
                jurisdictionQueryResult.selectorResults.push(selectorResult);
            }
        });

        jurisdictionQueryResults.push(jurisdictionQueryResult)
    });

    return jurisdictionQueryResults;
};
