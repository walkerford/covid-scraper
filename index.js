const puppeteer = require('puppeteer');

const selectorNames = ['count', 'tested', 'hospitalizations', 'deaths']; 

const jurisdictions = 
[
    {
        'name': 'Utah',
        'selectors':
        {
            'count': '#total-covid-19-cases .value',
            'tested': '#total-reported-people-tested .value',
            'hospitalizations': '#total-covid-19-hospitalizations .value',
            'deaths': '#total-covid-19-deaths .value',
        },
        'validations':
        [
            {
                'querySelector': '#total-covid-19-cases .caption',
                'value': 'Total COVID-19 Cases',
            }
        ]
    },
    {
        'name': 'Salt Lake County',
        'selectors':
        {
            'count': 
                '#DataTables_Table_0 tbody tr:nth-of-type(4) td:nth-of-type(2)',
            'tested': null,
            'hospitalizations':
                '#DataTables_Table_0 tbody tr:nth-of-type(4) td:nth-of-type(3)',
            'deaths':
                '#DataTables_Table_0 tbody tr:nth-of-type(4) td:nth-of-type(4)',
        },
        'validations':
        [
            {
                'querySelector': '#DataTables_Table_0 tbody tr:nth-of-type(4) \
                    td:nth-of-type(0)',
                'value': 'Salt Lake County',
            },
            {
                'querySelector': '#DataTables_Table_0 thead td:nth-of-type(0)',
                'value': 'Jurisdiction',
            },
            {
                'querySelector': '#DataTables_Table_0 thead td:nth-of-type(1)',
                'value': 'Cases',
            },
            {
                'querySelector': '#DataTables_Table_0 thead td:nth-of-type(2)',
                'value': 'Hospitalizations',
            },
            {
                'querySelector': '#DataTables_Table_0 thead td:nth-of-type(3)',
                'value': 'Deaths',
            },
        ],
    },
];

;(async () =>
{
    const browser = await puppeteer.launch();

    const page = (await browser.pages())[0];

    await page.goto('https://coronavirus-dashboard.utah.gov/');

    page.on('console', (log) => console[log._type](log._text));

    let result;
    try
    {
        result = await page.evaluate(Query, jurisdictions, selectorNames);
    }
    catch (e)
    {
        console.log('Caught Error:');
        console.log(e);
        console.log('Closing Gracefully.')
        await browser.close();
        return
    }

    console.log(result);
    await browser.close();
})();

function Query(jurisdictions, selectorNames)
{
    let results = [];
    jurisdictions.forEach((jurisdiction) =>
    {
        const jurisdictionName = jurisdiction.name;
        if (typeof(jurisdictionName) === 'string')
        {
            let result = {'name': jurisdictionName};
            const selectors = jurisdiction.selectors;
            if (typeof(selectors) === 'object')
            {
                selectorNames.forEach((selectorName) =>
                {
                    const selector = selectors[selectorName];
                    if (typeof(selector) === 'string')
                    {
                        const queryResult = document.querySelector(selector);
                        if (queryResult)
                        {
                            const value = queryResult.innerHTML;
                            result[selectorName] = value;
                        }
                        else
                        {
                            throw 'Query failed: "' + selector + '"';
                        }
                    }
                });
            }
            results.push(result);
        }
    });
    
    return results;
}