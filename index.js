const puppeteer = require('puppeteer');

let jurisdictionDefs = 
[
    {
        'name': 'Utah',
        'selectors':
        {
            'positiveCount': '#total-covid-19-cases .value',
            'tested': '#total-reported-people-tested .value',
            'hospitalizations': '#total-covid-19-hospitalizations .value',
            'deaths': '#total-covid-19-deaths .value',
        },
        'validators':
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
            'positiveCount': 
                '#DataTables_Table_0 tbody tr:nth-of-type(4) td:nth-of-type(2)',
            'tested': null,
            'hospitalizations':
                '#DataTables_Table_0 tbody tr:nth-of-type(4) td:nth-of-type(3)',
            'deaths':
                '#DataTables_Table_0 tbody tr:nth-of-type(4) td:nth-of-type(4)',
        },
        'validators':
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
    const browser = await puppeteer.launch({headless: true});

    const page = (await browser.pages())[0];

    await page.goto('https://coronavirus-dashboard.utah.gov/');

    page.on('console', (log) => console[log._type](log._text));

    try
    {
        jurisdictionDefs = await page.evaluate(Query, jurisdictionDefs);
    }
    catch (e)
    {
        console.log('Caught Error:');
        console.log(e);
        await browser.close();
        return
    }

    jurisdictionDefs.forEach((jurisdictionDef) =>
    {
        let jurisdiction = new Jurisdiction(jurisdictionDef);
        console.log(jurisdiction.SerializeAsCsv());
    });

    await browser.close();
})();


function Query(jurisdictionDefs)
{
    jurisdictionDefs.forEach((jurisdictionDef) => 
    {
        for (const name in jurisdictionDef.selectors)
        {
            let resultNode = 
                document.querySelector(jurisdictionDef.selectors[name]);
            if (resultNode)
            {
                jurisdictionDef[name] = resultNode.innerHTML;
            }
        }
    });

    return jurisdictionDefs;
}


class Jurisdiction
{
    constructor(jurisdictionDef)
    {
        this.name = jurisdictionDef.name;
        this.selectors = jurisdictionDef.selectors;
        this.validators = jurisdictionDef.validators;
        this.positiveCount = jurisdictionDef.positiveCount || 0;
        this.tested = jurisdictionDef.tested || 0;
        this.hospitalizations = jurisdictionDef.hospitalizations || 0;
        this.deaths = jurisdictionDef.deaths || 0;
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
            this.deaths].join(',');
    }
}
