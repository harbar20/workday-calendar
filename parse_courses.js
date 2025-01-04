const fs = require("fs");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

// Read the HTML file
const html = fs.readFileSync("test2.html", "utf8");
const dom = new JSDOM(html);
const document = dom.window.document;

// Get all table rows
const courseRows = document.querySelectorAll('tr[class*="css-"]');

const headerRows = [...courseRows[0].querySelectorAll('th'), ...courseRows[1].querySelectorAll('th')];

// Extract column names
const columnNames = Array.from(headerRows)
    .filter(row => row.getAttribute("scope") !== "colgroup")
    .flatMap(row => {
        return Array.from(row.querySelectorAll('button[title]'))
            .map(button => button.getAttribute('title'))
    });

// Parse each row
const courses = Array.from(courseRows)
    .map((row) => {
        // Get all td elements in this row
        const cells = row.querySelectorAll('td');

        // Create object to store the cell data
        const rowData = {};

        // Add each cell's text content to the object with index as key
        cells.forEach((cell, index) => {
            const innerDiv = cell.querySelector('div[class*="gwt-Label WNNO WGMO"]');
            const attributeName = columnNames[index - 1];
            rowData[attributeName] = innerDiv?.getAttribute('title');
        });

        return {
            "section": rowData["Section"],
            "instructor": rowData["Instructor"],
            "meeting_pattern": rowData["Meeting Patterns"],
            "waitlisted": row.textContent.includes("Waitlisted")
        };
    })
    .filter((course) => course !== null && !course.waitlisted);

// Log results
console.log(JSON.stringify(courses, null, 2));
