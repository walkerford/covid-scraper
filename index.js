const puppeteer = require('puppeteer');

const selectorNames = ['count', 'tested', 'hospitalizations', 'deaths']; 

const jurisdictionDefs = 
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


class Jurisdiction
{
    constructor(jurisdictionDef)
    {
        this.name = jurisdictionDef.name;
        this.selectors = jurisdictionDef.selectors;
        this.validators = jurisdictionDef.validators;
        this.positiveCount = 0;
        this.tested = 0;
        this.hospitalizations = 0;
        this.deaths = 0;
    }

    QueryAllSelectors(document)
    {
        for (const name in this.selectors)
        {
            const resultNode = document.querySelector(this.selectors[name]);
            if (resultNode)
            {
                this[name] = resultNode.innerHtml;
            }
        }
    }

    SerializeAsCsv()
    {
        return [this.name, 
            this.positiveCount, 
            this.tested, 
            this.hospitalizations,
            this.deaths].join('.');
    }
}


;(async () =>
{
    const browser = await puppeteer.launch({headless: false});

    const page = (await browser.pages())[0];

    await page.goto('https://coronavirus-dashboard.utah.gov/');

    page.on('console', (log) => console[log._type](log._text));

    let jurisdictions = [];

    console.log(jurisdictionDefs);

    jurisdictionDefs.forEach((jurisdictionDef) =>
        {
            console.log('Creating', jurisdictionDef.name);
            jurisdictions.push(new Jurisdiction(jurisdictionDef))
        });

    try
    {
        // result = await page.evaluate(Query, jurisdictions, selectorNames);

        result = await page.evaluate((QueryAllSelectors, jurisdictions) =>
            {
                window.jurisdictions = jurisdictions;
                jurisdictions.forEach((jurisdiction) =>
                    {
                        console.log(jurisdiction);
                        QueryAllSelectors(jurisdiction);
                    });

                return jurisdictions;
            },
            QueryAllSelectors,
            jurisdictions);

    }
    catch (e)
    {
        console.log('Caught Error:');
        console.log(e);
        // console.log('Closing Gracefully.')
        // await browser.close();
        return
    }

    let resultCsv = '';
    jurisdictions.forEach((jurisdiction) =>
    {
        resultCsv += jurisdiction.SerializeAsCsv() + '\n';
    });

    console.log(resultCsv);

    await browser.close();
})();

function QueryAllSelectors(jurisdiction)
{
    for (const name in jurisdiction.selectors)
    {
        const resultNode = 
            document.querySelector(jurisdiction.selectors[name]);
        
        if (resultNode)
        {
            jurisdiction[name] = resultNode.innerHtml;
        }
    }
}

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