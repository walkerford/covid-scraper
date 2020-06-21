
// Utah Covid Data Scraper

const puppeteer = require("puppeteer");
const fs = require("fs");

const recipes = require("./query_recipes.js");
const tasks = require("./query_tasks.js");

const dataFile = "covid.csv"

const jurisdictionQueries = 
[
    recipes.CreateMainJurisdictionQuery("Utah"),
    recipes.CreateSubJurisdictionQuery("Bear River", 1),
    recipes.CreateSubJurisdictionQuery("Central Utah", 2),
    recipes.CreateSubJurisdictionQuery("Davis County", 3),
    recipes.CreateSubJurisdictionQuery("Salt Lake County", 4),
    recipes.CreateSubJurisdictionQuery("San Juan", 5),
    recipes.CreateSubJurisdictionQuery("Southeast Utah", 6),
    recipes.CreateSubJurisdictionQuery("Southwest Utah", 7),
    recipes.CreateSubJurisdictionQuery("Summit County", 8),
    recipes.CreateSubJurisdictionQuery("Tooele County", 9),
    recipes.CreateSubJurisdictionQuery("TriCounty", 10),
    recipes.CreateSubJurisdictionQuery("Utah County", 11),
    recipes.CreateSubJurisdictionQuery("Wasatch County", 12),
    recipes.CreateSubJurisdictionQuery("Weber-Morgan", 13),
];


;(async () =>
{
    // Launch browser
    const browser = await puppeteer.launch({headless: true});
    const page = (await browser.pages())[0];

    // Navigate to Utah Corona Virus site
    await page.goto("https://coronavirus-dashboard.utah.gov/");

    // Redirect console messages
    page.on("console", (log) => console[log._type](log._text));

    try
    {
        // Do date query task
        dateString = await page.evaluate(tasks.DoDateQueryTask);
        console.log("Date:", dateString);
                
        // Do jurisdiction query task
        jurisdictionQueryResults = 
            await page.evaluate(
                tasks.DoJurisdictionQueryTask,
                jurisdictionQueries);
    }
    catch (e)
    {
        console.log("Caught Error:");
        console.log(e);
        await browser.close();
        return
    }

    // Create csv file, if necessary
    if (fs.existsSync(dataFile) == false)
    {
        // Add date header
        fs.appendFileSync(dataFile, "Date,");
        
        // Add individual jurisdiction headers
        jurisdictionQueryResults.forEach((jurisdictionQueryResult) =>
        {
            fs.appendFileSync(
                dataFile,
                recipes.SerializeJurisdictionHeaderAsCsv(
                    jurisdictionQueryResult));
        });

        // End header line
        fs.appendFileSync(dataFile, "\n");
    }

    // Add data to csv

    // Start with date
    fs.appendFileSync(dataFile, dateString + ",");

    // Add individual jurisdiction results
    jurisdictionQueryResults.forEach((jurisdictionQueryResult) =>
    {
        let dataAsCsv = recipes.SerializeJurisdictionDataAsCsv(
            jurisdictionQueryResult);
        fs.appendFileSync(dataFile, dataAsCsv);
        console.log(
            '"' + jurisdictionQueryResult.jurisdictionName + '":',
            dataAsCsv);
    });

    // End data line
    fs.appendFileSync(dataFile, "\n");

    // Close browser
    await browser.close();
})();
